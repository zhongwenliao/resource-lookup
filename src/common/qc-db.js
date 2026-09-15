/**
 * 导入批次本地持久化（IndexedDB 轻封装，浏览器与 Electron 渲染进程通用）
 *
 * - 数据库 `qc-label-db`，对象仓库 `import-batches`（keyPath `id` 自增，`importedAt` 索引）
 * - 批次结构 { id, fileName, model, importedAt, stats, records }：只存源记录明细与统计，
 *   不存二维码图片（可再生成，避免体积膨胀）
 * - `importedAt` 须为可排序值（ISO 字符串或时间戳），历史列表按其倒序排列
 * - 所有接口返回 Promise：打开或读写失败时 reject(Error)，由调用方降级提示、不阻断解析
 */

const DB_NAME = 'qc-label-db';
// v2：v1 期间仓库结构曾调整（keyPath/自增配置变更），升版本触发 onupgradeneeded
// 校验重建，避免沿用本机遗留的旧结构仓库导致 put 报 keyPath 无效
const DB_VERSION = 2;
const STORE_NAME = 'import-batches';

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
 */
function withStore (mode, run) {
  return openDb().then(db => new Promise((resolve, reject) => {
    let req = null;
    const tx = db.transaction(STORE_NAME, mode);
    try {
      req = run(tx.objectStore(STORE_NAME));
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
