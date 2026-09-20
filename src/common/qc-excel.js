/**
 * 检测设备 Excel 解析纯函数（生成端与绑定端共用，防止解析规则漂移）
 *
 * 从 QcLabel.vue 抽出的解析管线：SheetJS 读表 → 判定列自动识别（OK/NG 占比）
 * → 以判定列为锚点识别时间/序号/测量列 → 行转结构化记录。
 * 标签生成页（QcLabel.vue）与扫码绑定页（CodeBind.vue）必须走同一份实现，
 * 否则同一文件两页解析出的记录不一致，绑定快照与生成数据对不上。
 */
import XLSX from 'xlsx';
import { pad2 } from './qc-code-rules';

/**
 * 读取工作簿第一个 Sheet 为二维数组（header:1，保留原始类型含 Date）。
 * @param {ArrayBuffer} buf 文件二进制
 * @returns {Array<Array>} rows 二维数组，rows[行][列]
 */
export function readSheetRows (buf) {
  const wb = XLSX.read(new Uint8Array(buf), { type: 'array', cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });
}

/**
 * 从文件名猜测产品型号：去扩展名 → 去导出时间戳（_2026_9_8 16_26_48）→ 去尾部日期（-3-28）。
 */
export function guessModelFromName (name) {
  return name.replace(/\.[^.]+$/, '')
    .replace(/[-_ ]?\d{4}[_ ]\d.*$/, '')
    .replace(/[-_]\d{1,2}[-_]\d{1,2}$/, '');
}

/**
 * 自动识别判定列：统计每列中 OK/NG 值的个数，取最多的一列。
 * @returns {{ col: number, count: number } | null} 命中列与有效判定值个数；无命中返回 null
 */
export function detectJudgeCol (rows) {
  const maxCol = rows.reduce((m, r) => Math.max(m, r.length), 0);
  let col = -1;
  let count = 0;
  for (let c = 0; c < maxCol; c++) {
    let n = 0;
    rows.forEach(r => {
      const v = r[c];
      if (v !== null && v !== undefined && /^(ok|ng)$/i.test(String(v).trim())) n++;
    });
    if (n > count) {
      count = n;
      col = c;
    }
  }
  return col >= 0 ? { col, count } : null;
}

/**
 * 以判定列为锚点识别其余列：
 *   时间列 —— 判定列左侧，Date 类型占比 > 50%（取最靠近判定列的命中者）
 *   序号列 —— 判定列左侧（跳过时间列），数值且递增比例 > 80%
 *   测量列 —— 判定列右侧，数值占比 > 80%（全部收集）
 * @param {Array<Array>} rows 原始二维数组
 * @param {number} judgeCol 判定列索引
 * @returns {{ timeCol: number, seqCol: number, measureCols: number[] }} 各列索引，-1 表示未识别
 */
export function detectOtherCols (rows, judgeCol) {
  // 只统计判定列有效的行，排除表头/汇总行等噪声
  const recRows = rows.filter(r => {
    const v = r[judgeCol];
    return v !== null && v !== undefined && /^(ok|ng)$/i.test(String(v).trim());
  });
  const maxCol = rows.reduce((m, r) => Math.max(m, r.length), 0);

  // 时间列：判定列左侧 Date 占比高的列
  let timeCol = -1;
  for (let c = judgeCol - 1; c >= 0; c--) {
    let total = 0;
    let dates = 0;
    recRows.forEach(r => {
      const v = r[c];
      if (v !== null && v !== undefined && String(v).trim() !== '') {
        total++;
        if (v instanceof Date) dates++;
      }
    });
    if (total > recRows.length * 0.5 && dates > total * 0.5) {
      timeCol = c;
      break;
    }
  }

  // 序号列：判定列左侧（跳过时间列）数值且递增
  let seqCol = -1;
  for (let c = judgeCol - 1; c >= 0; c--) {
    if (c === timeCol) continue;
    let nums = 0;
    let inc = 0;
    let pairs = 0;
    let prev = null;
    recRows.forEach(r => {
      const v = r[c];
      if (v !== null && v !== undefined && v !== '' && !isNaN(Number(v))) {
        nums++;
        const n = Number(v);
        if (prev !== null) {
          pairs++;
          if (n > prev) inc++;
        }
        prev = n;
      }
    });
    if (nums > recRows.length * 0.5 && pairs > 0 && inc / pairs > 0.8) {
      seqCol = c;
      break;
    }
  }

  // 测量列：判定列右侧数值占比 > 80%
  const measureCols = [];
  for (let c = judgeCol + 1; c < maxCol; c++) {
    let total = 0;
    let nums = 0;
    recRows.forEach(r => {
      const v = r[c];
      if (v !== null && v !== undefined && String(v).trim() !== '') {
        total++;
        if (v !== '' && !isNaN(Number(v))) nums++;
      }
    });
    if (total > recRows.length * 0.5 && nums > total * 0.8) measureCols.push(c);
  }

  return { timeCol, seqCol, measureCols };
}

/** 时间格式化为 'YYYY-MM-DD HH:mm:ss'，兼容 Date 对象与 Excel 日期序列号 */
export function formatTimeVal (v) {
  if (v instanceof Date) {
    return v.getFullYear() + '-' + pad2(v.getMonth() + 1) + '-' + pad2(v.getDate()) + ' ' +
      pad2(v.getHours()) + ':' + pad2(v.getMinutes()) + ':' + pad2(v.getSeconds());
  }
  if (typeof v === 'number') {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) {
      return d.y + '-' + pad2(d.m) + '-' + pad2(d.d) + ' ' + pad2(d.H) + ':' + pad2(d.M) + ':' + pad2(d.S);
    }
  }
  return v === null || v === undefined ? '' : String(v);
}

/** 测量值格式化：数值统一保留 3 位小数，非数值原样输出 */
export function formatMeasureVal (v) {
  if (v === null || v === undefined || v === '') return '';
  const n = Number(v);
  return isNaN(n) ? String(v) : n.toFixed(3);
}

/**
 * 按列映射把原始行转为结构化记录，并汇总统计数字。
 * @param {Array<Array>} rows 原始二维数组
 * @param {{ judgeCol: number, timeCol?: number, seqCol?: number, measureCols?: number[] }} mapping 列映射
 * @returns {{ records: Array<{seq,time,judge,measures}>, stats: { total, ok, ng } }}
 */
export function buildRecords (rows, mapping) {
  const { judgeCol, timeCol, seqCol, measureCols } = Object.assign(
    { timeCol: -1, seqCol: -1, measureCols: [] }, mapping);
  const records = [];
  rows.forEach(r => {
    const v = r[judgeCol];
    if (v === null || v === undefined) return;
    const judge = String(v).trim().toUpperCase();
    if (judge !== 'OK' && judge !== 'NG') return; // 跳过表头/噪声行
    // 序号：去掉 Excel 数值化带来的尾部 .0
    let seq = '';
    if (seqCol >= 0) {
      const sv = r[seqCol];
      seq = sv === null || sv === undefined ? '' : String(sv).replace(/\.0+$/, '');
    }
    const time = timeCol >= 0 ? formatTimeVal(r[timeCol]) : '';
    const measures = measureCols.map(c => formatMeasureVal(r[c]));
    records.push({ seq, time, judge, measures });
  });
  const ok = records.filter(r => r.judge === 'OK').length;
  return { records, stats: { total: records.length, ok, ng: records.length - ok } };
}

/**
 * 一站式解析：文件二进制 → 列识别 → 结构化记录（绑定页直接消费）。
 * @param {ArrayBuffer} buf 文件二进制
 * @param {string} name 文件名（型号猜测用）
 * @returns {{ rows, fileName, model, judgeCol, timeCol, seqCol, measureCols, records, stats }}
 * @throws {Error} 判定列未识别（非检测设备导出数据）或工作簿解析失败
 */
export function parseQcExcel (buf, name) {
  const rows = readSheetRows(buf);
  const hit = detectJudgeCol(rows);
  // 有效判定值不足 3 个则认为不是检测设备导出的数据（与生成页判定一致）
  if (!hit || hit.count < 3) {
    throw new Error('未找到判定列（OK/NG），请确认这是检测设备导出的数据');
  }
  const others = detectOtherCols(rows, hit.col);
  const built = buildRecords(rows, Object.assign({ judgeCol: hit.col }, others));
  return Object.assign({
    rows,
    fileName: name,
    model: guessModelFromName(name)
  }, others, { judgeCol: hit.col }, built);
}
