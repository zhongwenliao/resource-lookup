/**
 * 导入批次本地持久化（IndexedDB 轻封装，浏览器与 Electron 渲染进程通用）
 *
 * - 数据库 `qc-label-db`，v5 起批次拆为三仓：
 *   - `batch-meta`：批次摘要 { id, fileName, model, importedAt, stats }，历史列表只读此仓
 *   - `batch-records`：批次明细 { batchId, records }，每批次一条
 *   - `rule-codes`：规则码倒排索引 { code, batchId, batch, record }，溯源回查按码精确命中
 *   （不存二维码图片：可再生成，避免体积膨胀）
 * - `code-bindings`（v3 新增，keyPath `id` 自增，code/boundAt/batchId/sourceKey 索引）：
 *   扫码绑定数据 { id, code, batchId, batchFileName, record, recordKey, boundAt }，
 *   存记录快照而非引用（批次删除后绑定仍可独立查询展示）
 * - v4 绑定页改为「实时读取数据源文件、不导入批次」：新绑定不再写 batchId/batchFileName，
 *   改写 sourceKey（数据源标识，桌面版为文件绝对路径）/ sourceName（文件名）；
 *   code-bindings 补 sourceKey 索引（旧绑定无此字段，索引自动跳过，回查不受影响）
 * - v5 迁移：旧单仓 import-batches 拆写进上述三仓后删除（旧结构不符约定时无数据可迁，直接弃用）
 * - `importedAt` / `boundAt` 须为可排序值（ISO 字符串或时间戳），历史列表按其倒序排列
 * - 所有接口返回 Promise：打开或读写失败时 reject(Error)，由调用方降级提示、不阻断解析
 */

const DB_NAME = 'qc-label-db';
// v3：新增 code-bindings 仓库（扫码绑定）；v2 期间 import-batches 结构曾调整（keyPath/自增
// 配置变更），升版本触发 onupgradeneeded 校验重建，避免沿用本机遗留的旧结构仓库导致 put 报 keyPath 无效
// v4：code-bindings 补 sourceKey 索引（实时读取模式下按数据源文件检索绑定标记）
// v5：批次拆仓 + rule-codes 倒排索引——历史列表不再反序列化全量明细，
//     溯源回查由「遍历全部批次全部记录」降为按码索引精确命中，批次积累后不再变慢
const DB_VERSION = 5;
const META_STORE = 'batch-meta'; // 批次摘要（不含 records，历史列表只读此仓）
const RECORDS_STORE = 'batch-records'; // 批次记录明细（每批次一条 { batchId, records }）
const RULECODE_STORE = 'rule-codes'; // 规则码倒排索引（溯源回查 O(log n) 命中）
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
        const tx = req.transaction;
        // v5 迁移准备：旧 import-batches（v2-v4 单仓结构）结构不符约定（主键非 id 或未开自增）
        // 时旧数据无法按当前约定读写，直接删除（无数据可迁）；结构正常则保留待下方迁移
        let legacyStore = null;
        if (db.objectStoreNames.contains('import-batches')) {
          const legacy = tx.objectStore('import-batches');
          if (legacy.keyPath === 'id' && legacy.autoIncrement === true) {
            legacyStore = legacy;
          } else {
            db.deleteObjectStore('import-batches');
          }
        }
        if (!db.objectStoreNames.contains(META_STORE)) {
          const store = db.createObjectStore(META_STORE, { keyPath: 'id', autoIncrement: true });
          store.createIndex('importedAt', 'importedAt', { unique: false });
        }
        if (!db.objectStoreNames.contains(RECORDS_STORE)) {
          const store = db.createObjectStore(RECORDS_STORE, { keyPath: 'id', autoIncrement: true });
          store.createIndex('batchId', 'batchId', { unique: false });
        }
        if (!db.objectStoreNames.contains(RULECODE_STORE)) {
          const store = db.createObjectStore(RULECODE_STORE, { keyPath: 'id', autoIncrement: true });
          store.createIndex('code', 'code', { unique: false });
          store.createIndex('batchId', 'batchId', { unique: false });
        }
        // v3：扫码绑定仓库（一码一行，索引均非唯一——唯一性由 saveBinding 写入前清理维护）
        if (!db.objectStoreNames.contains(BINDING_STORE)) {
          const store = db.createObjectStore(BINDING_STORE, { keyPath: 'id', autoIncrement: true });
          store.createIndex('code', 'code', { unique: false });
          store.createIndex('boundAt', 'boundAt', { unique: false });
          store.createIndex('batchId', 'batchId', { unique: false });
          store.createIndex('sourceKey', 'sourceKey', { unique: false });
        } else if (!tx.objectStore(BINDING_STORE).indexNames.contains('sourceKey')) {
          // v4：既有绑定仓库补 sourceKey 索引（v3 装机用户原地升级；旧绑定无该字段，索引自动跳过）
          tx.objectStore(BINDING_STORE).createIndex('sourceKey', 'sourceKey', { unique: false });
        }
        // v5 数据迁移：旧仓逐批拆写进摘要/明细/倒排索引三仓，读完后删除旧仓。
        // cursor 异步推进期间版本事务保持活跃；沿用旧自增 id，批次引用（currentBatchId）不断链
        if (legacyStore) {
          const metaStore = tx.objectStore(META_STORE);
          const recStore = tx.objectStore(RECORDS_STORE);
          const rcStore = tx.objectStore(RULECODE_STORE);
          const oldReq = legacyStore.openCursor();
          oldReq.onsuccess = () => {
            const cursor = oldReq.result;
            if (!cursor) {
              db.deleteObjectStore('import-batches'); // 迁移完成，移除旧单仓
              return;
            }
            const b = cursor.value;
            metaStore.put({ id: b.id, fileName: b.fileName, model: b.model, importedAt: b.importedAt, stats: b.stats });
            recStore.put({ batchId: b.id, records: b.records || [] });
            const brief = { fileName: b.fileName, model: b.model, importedAt: b.importedAt };
            (b.records || []).forEach(r => {
              if (r && r.ruleCode) {
                rcStore.put({ code: String(r.ruleCode).toUpperCase(), batchId: b.id, batch: brief, record: r });
              }
            });
            cursor.continue();
          };
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
 * 在单仓库事务上执行操作，事务完成 resolve、出错/中止 reject。
 * @param {IDBTransactionMode} mode 事务模式
 * @param {(store: IDBObjectStore) => IDBRequest} run 仓库操作，返回取值请求（可为 null）
 * @param {string} storeName 目标仓库名
 */
function withStore (mode, run, storeName) {
  return openDb().then(db => new Promise((resolve, reject) => {
    let req = null;
    const tx = db.transaction(storeName, mode);
    try {
      req = run(tx.objectStore(storeName));
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
 * 按索引清空某键值的全部条目（openCursor 逐条 delete；更新/删除批次时清理旧数据用）。
 * @param {Function} [done] 清理完成回调：游标异步推进，同事务内「先清后写」必须等
 *                          清理走完再发写入请求，否则新写入条目会被游标扫到误删
 */
function clearByIndex (store, indexName, value, done) {
  const req = store.index(indexName).openCursor(IDBKeyRange.only(value));
  req.onsuccess = () => {
    const cursor = req.result;
    if (cursor) {
      cursor.delete();
      cursor.continue();
    } else if (done) {
      done();
    }
  };
}

/**
 * 写入批次：无有效 id 新增（自增主键），带有效 id 更新（判定列改选后同步当前批次）。
 * 摘要进 batch-meta、明细进 batch-records，同时维护 rule-codes 倒排索引：
 * 先按 batchId 清掉本批次旧明细与旧索引再写入，更新场景下规则码重排后索引不残留。
 * 写入前浅拷贝并剔除无效 id 字段：自增主键只在 keyPath 求值为 undefined 时生成，
 * 显式传入 null/空串等无效值会令 put 直接抛 keyPath 无效错误，这里统一防御。
 * @param {object} batch { id?, fileName, model, importedAt, stats, records }
 * @returns {Promise<number>} 写入后的批次 id
 */
export function saveBatch (batch) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const doc = Object.assign({}, batch);
    if (!isValidId(doc.id)) delete doc.id;
    const records = doc.records || [];
    const tx = db.transaction([META_STORE, RECORDS_STORE, RULECODE_STORE], 'readwrite');
    const metaStore = tx.objectStore(META_STORE);
    const recStore = tx.objectStore(RECORDS_STORE);
    const rcStore = tx.objectStore(RULECODE_STORE);
    // 摘要不含 records（历史列表游标只反序列化轻量摘要）；明细每批次一条挂 batchId
    const metaDoc = {
      fileName: doc.fileName,
      model: doc.model,
      importedAt: doc.importedAt,
      stats: doc.stats
    };
    if (isValidId(doc.id)) metaDoc.id = doc.id;
    const putMeta = metaStore.put(metaDoc);
    putMeta.onsuccess = () => {
      const batchId = isValidId(doc.id) ? doc.id : putMeta.result;
      // 先清旧（更新场景）再写新：清理由游标异步推进，必须等其完成回调再写入，
      // 否则新条目会被仍在推进的清理游标扫到并误删（已用 fake-indexeddb 验证过该时序）
      clearByIndex(recStore, 'batchId', batchId, () => {
        clearByIndex(rcStore, 'batchId', batchId, () => {
          recStore.put({ batchId: batchId, records: records });
          const brief = { fileName: doc.fileName, model: doc.model, importedAt: doc.importedAt };
          records.forEach(r => {
            if (r && r.ruleCode) {
              // 索引统一按大写存取（匹配大小写不敏感约定）；batch 存摘要快照，回查免二次读批次
              rcStore.put({
                code: String(r.ruleCode).toUpperCase(),
                batchId: batchId,
                batch: brief,
                record: r
              });
            }
          });
        });
      });
    };
    tx.oncomplete = () => resolve(isValidId(doc.id) ? doc.id : putMeta.result);
    tx.onerror = () => reject(tx.error || new Error('保存批次失败'));
    tx.onabort = () => reject(tx.error || new Error('保存批次已中止'));
  }));
}

/**
 * 历史批次列表：按导入时间倒序，返回摘要。
 * v5 起摘要独立成仓（batch-meta 不含 records），游标不再反序列化全量明细，
 * 批次记录多时打开历史弹层依旧轻快。
 * @returns {Promise<Array<{id,fileName,model,importedAt,stats}>>}
 */
export function listBatches () {
  return openDb().then(db => new Promise((resolve, reject) => {
    const out = [];
    const tx = db.transaction(META_STORE, 'readonly');
    const req = tx.objectStore(META_STORE).index('importedAt').openCursor(null, 'prev');
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        out.push(cursor.value);
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
 * 读取单个完整批次（摘要 + 明细合并，返回结构与旧版单仓一致，调用方无感知），
 * 用于历史批次载入恢复。
 * @param {number} id 批次 id
 * @returns {Promise<object|undefined>} 批次对象；不存在返回 undefined
 */
export function getBatch (id) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction([META_STORE, RECORDS_STORE], 'readonly');
    const metaReq = tx.objectStore(META_STORE).get(id);
    // 每批次在明细仓只写一条，索引 get 即该条
    const recReq = tx.objectStore(RECORDS_STORE).index('batchId').get(id);
    tx.oncomplete = () => {
      const meta = metaReq.result;
      if (!meta) {
        resolve(undefined);
        return;
      }
      const recDoc = recReq.result;
      resolve(Object.assign({}, meta, { records: (recDoc && recDoc.records) || [] }));
    };
    tx.onerror = () => reject(tx.error || new Error('读取批次失败'));
    tx.onabort = () => reject(tx.error || new Error('读取批次已中止'));
  }));
}

/**
 * 删除批次：摘要、明细与规则码索引同事务原子清理。
 * @param {number} id 批次 id
 * @returns {Promise<void>}
 */
export function deleteBatch (id) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction([META_STORE, RECORDS_STORE, RULECODE_STORE], 'readwrite');
    tx.objectStore(META_STORE).delete(id);
    clearByIndex(tx.objectStore(RECORDS_STORE), 'batchId', id);
    clearByIndex(tx.objectStore(RULECODE_STORE), 'batchId', id);
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error || new Error('删除批次失败'));
    tx.onabort = () => reject(tx.error || new Error('删除批次已中止'));
  }));
}

/**
 * 按规则码检索关联检测记录：走 rule-codes 倒排索引按码精确命中
 * （生成端 saveBatch 时写入，见 QcLabel.vue generateAll → syncBatch），
 * 替代旧版「遍历全部批次全部记录」的全表扫描，批次积累后回查不再变慢。
 * 匹配大小写不敏感（供方首字母段可能存在大小写差异，索引统一按大写存取）。
 * @param {string} code 规则码（完整码值）
 * @returns {Promise<Array<{batch: {id,fileName,model,importedAt}, record: object}>>}
 *          同一规则码在多个批次命中时全部返回；无命中返回空数组
 */
export function findByRuleCode (code) {
  const target = String(code || '').trim().toUpperCase();
  if (!target) return Promise.resolve([]);
  return openDb().then(db => new Promise((resolve, reject) => {
    const hits = [];
    const tx = db.transaction(RULECODE_STORE, 'readonly');
    const req = tx.objectStore(RULECODE_STORE).index('code').openCursor(IDBKeyRange.only(target));
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        const e = cursor.value;
        hits.push({
          batch: Object.assign({ id: e.batchId }, e.batch || {}),
          record: e.record
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
 * @param {object} binding { code, sourceKey, sourceName, record, recordKey, boundAt }
 *   record 为绑定行的记录快照（seq/time/judge/measures），数据源文件删除/更换后仍可独立展示；
 *   sourceKey 为数据源标识（桌面版实时读取模式为文件绝对路径，浏览器降级上传为 'upload:文件名'）；
 *   batchId/batchFileName 为旧批次模式遗留字段，仅历史绑定记录存在，查询端向后兼容展示
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
 * 某数据源下的全部绑定（绑定页标记「该行已绑定」用，实时读取模式按文件路径检索）。
 * @param {string} sourceKey 数据源标识（文件绝对路径或 'upload:文件名'）
 * @returns {Promise<Array<object>>} 绑定数组
 */
export function findBindingsBySource (sourceKey) {
  if (typeof sourceKey !== 'string' || !sourceKey) return Promise.resolve([]);
  return openDb().then(db => new Promise((resolve, reject) => {
    const out = [];
    const tx = db.transaction(BINDING_STORE, 'readonly');
    const req = tx.objectStore(BINDING_STORE).index('sourceKey').openCursor(IDBKeyRange.only(sourceKey));
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        out.push(cursor.value);
        cursor.continue();
      } else {
        resolve(out);
      }
    };
    tx.onerror = () => reject(tx.error || new Error('查询数据源绑定失败'));
    tx.onabort = () => reject(tx.error || new Error('查询数据源绑定已中止'));
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
