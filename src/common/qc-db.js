/**
 * 导入批次本地持久化（IndexedDB 轻封装，浏览器与 Electron 渲染进程通用）
 *
 * - 数据库 `qc-label-db`，对象仓库 `import-batches`（keyPath `id` 自增，`importedAt` 索引）
 * - 批次结构 { id, fileName, model, importedAt, stats, records }：只存源记录明细与统计，
 *   不存二维码图片（可再生成，避免体积膨胀）
 * - v3 新增对象仓库 `code-bindings`（keyPath `id` 自增，code/boundAt/batchId 索引）：
 *   扫码绑定数据 { id, code, batchId, batchFileName, record, recordKey, boundAt }，
 *   存记录快照而非引用（批次删除后绑定仍可独立查询展示）
 * - `importedAt` / `boundAt` 须为可排序值（ISO 字符串或时间戳），历史列表按其倒序排列
 * - 所有接口返回 Promise：打开或读写失败时 reject(Error)，由调用方降级提示、不阻断解析
 */

const DB_NAME = 'qc-label-db';
// v3：新增 code-bindings 仓库（扫码绑定）；v2 期间 import-batches 结构曾调整（keyPath/自增
// 配置变更），升版本触发 onupgradeneeded 校验重建，避免沿用本机遗留的旧结构仓库导致 put 报 keyPath 无效
const DB_VERSION = 3;
const STORE_NAME = 'import-batches';
const BINDING_STORE = 'code-bindings';

// 打开成功的数据库连接缓存（失败不缓存，下次调用自动重试）
let dbPromise = null;

/**
 * 打开（或复用）数据库连接；首次打开时创建仓库与索引。
 * 环境不支持（如无 indexedDB 全局）、打开失败或被其他页面阻塞时 reject。
 */
function openDb () {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('当前环境不支持 IndexedDB，无法本地保存'));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (db.objectStoreNames.contains(STORE_NAME)) {
          // 本机遗留仓库若与当前结构约定不符（主键非 id 或未开自增），
          // 旧数据本就无法按当前约定读写，删除后按新结构重建
          const legacy = req.transaction.objectStore(STORE_NAME);
          if (legacy.keyPath !== 'id' || legacy.autoIncrement !== true) {
            db.deleteObjectStore(STORE_NAME);
          }
        }
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('importedAt', 'importedAt', { unique: false });
        }
        // v3：扫码绑定仓库（一码一行，索引均非唯一——唯一性由 saveBinding 写入前清理维护）
        if (!db.objectStoreNames.contains(BINDING_STORE)) {
          const store = db.createObjectStore(BINDING_STORE, { keyPath: 'id', autoIncrement: true });
          store.createIndex('code', 'code', { unique: false });
          store.createIndex('boundAt', 'boundAt', { unique: false });
          store.createIndex('batchId', 'batchId', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('打开本地数据库失败'));
      req.onblocked = () => reject(new Error('本地数据库被其他页面占用，请关闭其他标签页后重试'));
    }).catch(err => {
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

/**
 * 在单事务上执行仓库操作，事务完成 resolve、出错/中止 reject。
 * @param {IDBTransactionMode} mode 事务模式
 * @param {(store: IDBObjectStore) => IDBRequest} run 仓库操作，返回取值请求（可为 null）
 * @param {string} [storeName] 目标仓库名，缺省为批次仓库
 */
function withStore (mode, run, storeName) {
  return openDb().then(db => new Promise((resolve, reject) => {
    let req = null;
    const tx = db.transaction(storeName || STORE_NAME, mode);
    try {
      req = run(tx.objectStore(storeName || STORE_NAME));
    } catch (e) {
      reject(e);
      return;
    }
    tx.oncomplete = () => resolve(req ? req.result : undefined);
    tx.onerror = () => reject(tx.error || new Error('本地数据库操作失败'));
    tx.onabort = () => reject(tx.error || new Error('本地数据库操作已中止'));
  }));
}

/** 是否为可用的自增主键回填值（仅接受正数；null/空串/NaN 等一律视为无主键） */
function isValidId (v) {
  return typeof v === 'number' && Number.isFinite(v) && v > 0;
}

/**
 * 写入批次：无有效 id 新增（自增主键），带有效 id 更新（判定列改选后同步当前批次）。
 * 写入前浅拷贝并剔除无效 id 字段：自增主键只在 keyPath 求值为 undefined 时生成，
 * 显式传入 null/空串等无效值会令 put 直接抛 keyPath 无效错误，这里统一防御。
 * @param {object} batch { id?, fileName, model, importedAt, stats, records }
 * @returns {Promise<number>} 写入后的批次 id
 */
export function saveBatch (batch) {
  return withStore('readwrite', store => {
    const doc = Object.assign({}, batch);
    if (!isValidId(doc.id)) delete doc.id;
    return store.put(doc);
  });
}

/**
 * 历史批次列表：按导入时间倒序，返回摘要（不含 records 明细，减小传输体积）。
 * @returns {Promise<Array<{id,fileName,model,importedAt,stats}>>}
 */
export function listBatches () {
  return openDb().then(db => new Promise((resolve, reject) => {
    const out = [];
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).index('importedAt').openCursor(null, 'prev');
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        const b = cursor.value;
        out.push({ id: b.id, fileName: b.fileName, model: b.model, importedAt: b.importedAt, stats: b.stats });
        cursor.continue();
      } else {
        resolve(out);
      }
    };
    tx.oncomplete = () => resolve(out);
    tx.onerror = () => reject(tx.error || new Error('读取历史批次失败'));
    tx.onabort = () => reject(tx.error || new Error('读取历史批次已中止'));
  }));
}

/**
 * 读取单个完整批次（含 records 明细），用于历史批次载入恢复。
 * @param {number} id 批次 id
 * @returns {Promise<object|undefined>} 批次对象；不存在返回 undefined
 */
export function getBatch (id) {
  return withStore('readonly', store => store.get(id));
}

/**
 * 删除批次。
 * @param {number} id 批次 id
 * @returns {Promise<void>}
 */
export function deleteBatch (id) {
  return withStore('readwrite', store => store.delete(id)).then(() => undefined);
}

/**
 * 按规则码检索关联检测记录：遍历全部批次的记录明细，匹配记录内嵌的 ruleCode
 * （生成端批量生成时回写，见 QcLabel.vue generateAll）。
 * 匹配大小写不敏感（供方首字母段可能存在大小写差异）。
 * @param {string} code 规则码（完整码值）
 * @returns {Promise<Array<{batch: {id,fileName,model,importedAt}, record: object}>>}
 *          同一规则码在多个批次命中时全部返回；无命中返回空数组
 */
export function findByRuleCode (code) {
  const target = String(code || '').trim().toUpperCase();
  if (!target) return Promise.resolve([]);
  return openDb().then(db => new Promise((resolve, reject) => {
    const hits = [];
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        const b = cursor.value;
        (b.records || []).forEach(r => {
          if (r.ruleCode && String(r.ruleCode).toUpperCase() === target) {
            hits.push({
              batch: { id: b.id, fileName: b.fileName, model: b.model, importedAt: b.importedAt },
              record: r
            });
          }
        });
        cursor.continue();
      } else {
        resolve(hits);
      }
    };
    tx.onerror = () => reject(tx.error || new Error('检索关联记录失败'));
    tx.onabort = () => reject(tx.error || new Error('检索关联记录已中止'));
  }));
}

/* ==================== 扫码绑定（code-bindings 仓库） ==================== */

/**
 * 写入一条扫码绑定（一码一行，双向唯一）：
 * 同码旧绑定与同 recordKey 旧绑定在同一事务内先删除再写入，保证
 * 「一个码只指向一条记录、一条记录只挂一个码」，重绑即覆盖。
 * @param {object} binding { code, batchId, batchFileName, record, recordKey, boundAt }
 *   record 为绑定行的记录快照（seq/time/judge/measures），批次删除后仍可独立展示
 * @returns {Promise<void>}
 */
export function saveBinding (binding) {
  const code = String(binding && binding.code || '').trim();
  if (!code) return Promise.reject(new Error('绑定码值不能为空'));
  return openDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(BINDING_STORE, 'readwrite');
    const store = tx.objectStore(BINDING_STORE);
    const req = store.openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        const b = cursor.value;
        // 大小写不敏感比对：物理标签码内容恒定，宽松匹配仅为容错手动输入的大小写误差
        const sameCode = String(b.code || '').toUpperCase() === code.toUpperCase();
        const sameRow = binding.recordKey && b.recordKey === binding.recordKey;
        if (sameCode || sameRow) cursor.delete();
        cursor.continue();
      } else {
        store.put(Object.assign({}, binding, { code }));
      }
    };
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error || new Error('保存绑定失败'));
    tx.onabort = () => reject(tx.error || new Error('保存绑定已中止'));
  }));
}

/**
 * 按码值查绑定（溯源查询端优先入口）：大小写不敏感（同 findByRuleCode 约定）。
 * @param {string} code 码值（外部码或本系统规则码，原样传入）
 * @returns {Promise<object|null>} 绑定记录 { id, code, batchId, batchFileName, record, boundAt }；无绑定返回 null
 */
export function findBindingByCode (code) {
  const target = String(code || '').trim().toUpperCase();
  if (!target) return Promise.resolve(null);
  return openDb().then(db => new Promise((resolve, reject) => {
    let hit = null;
    const tx = db.transaction(BINDING_STORE, 'readonly');
    const req = tx.objectStore(BINDING_STORE).index('code').openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        const b = cursor.value;
        if (String(b.code || '').toUpperCase() === target) hit = b;
        cursor.continue();
      } else {
        resolve(hit);
      }
    };
    tx.onerror = () => reject(tx.error || new Error('查询绑定失败'));
    tx.onabort = () => reject(tx.error || new Error('查询绑定已中止'));
  }));
}

/**
 * 某批次下的全部绑定（绑定页标记「该行已绑定」用）。
 * @param {number} batchId 批次 id
 * @returns {Promise<Array<object>>} 绑定数组
 */
export function findBindingsByBatch (batchId) {
  if (typeof batchId !== 'number' || !Number.isFinite(batchId)) return Promise.resolve([]);
  return openDb().then(db => new Promise((resolve, reject) => {
    const out = [];
    const tx = db.transaction(BINDING_STORE, 'readonly');
    const req = tx.objectStore(BINDING_STORE).index('batchId').openCursor(IDBKeyRange.only(batchId));
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        out.push(cursor.value);
        cursor.continue();
      } else {
        resolve(out);
      }
    };
    tx.onerror = () => reject(tx.error || new Error('查询批次绑定失败'));
    tx.onabort = () => reject(tx.error || new Error('查询批次绑定已中止'));
  }));
}

/**
 * 本机绑定列表（按绑定时间倒序，绑定页回看用）。
 * @param {number} [limit] 最多返回条数，缺省 50
 * @returns {Promise<Array<object>>}
 */
export function listBindings (limit) {
  const max = typeof limit === 'number' && limit > 0 ? limit : 50;
  return openDb().then(db => new Promise((resolve, reject) => {
    const out = [];
    const tx = db.transaction(BINDING_STORE, 'readonly');
    const req = tx.objectStore(BINDING_STORE).index('boundAt').openCursor(null, 'prev');
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        out.push(cursor.value);
        if (out.length >= max) {
          resolve(out.slice(0, max));
          return;
        }
        cursor.continue();
      } else {
        resolve(out);
      }
    };
    tx.onerror = () => reject(tx.error || new Error('读取绑定列表失败'));
    tx.onabort = () => reject(tx.error || new Error('读取绑定列表已中止'));
  }));
}

/**
 * 删除一条绑定（解绑）。
 * @param {number} id 绑定 id
 * @returns {Promise<void>}
 */
export function deleteBinding (id) {
  return withStore('readwrite', store => store.delete(id), BINDING_STORE).then(() => undefined);
}
