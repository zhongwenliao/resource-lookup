/**
 * 二维码内容解析纯函数（溯源查询端）
 *
 * parseQrContent(text) 按设计 D3 顺序识别三种内容模式（先具体后宽泛）：
 *   1. url  网页链接 —— http(s):// 开头且 # 后含 base64url 数据，解码还原记录；
 *      解码失败直接报错，不回退其他模式（避免把损坏链接误判为规则码）
 *   2. text 明文文本 —— 含「型号:」特征行 + 至少一个已知字段行
 *   3. rule 编码规则 —— 单行无空白且按 KBWK@@##*!%YMMDDXXXXX 拆段校验通过
 * 返回 { mode, data } 或 { mode: 'unknown', error }。
 */
import { decodeRecordFromBase64url, splitRuleCode } from './qc-code-rules';

// 明文模式的字段行前缀（与生成端 buildQrText 一致）
const TEXT_FIELD_PREFIXES = ['型号:', '序号:', '时间:', '判定:', '测量:'];

/**
 * 明文文本解析：按「型号:/序号:/时间:/判定:/测量:」行前缀提取字段，
 * 测量值按逗号拆分为数组；缺失行容错为空。
 * 返回与网页链接模式一致的字段结构 { m, s, t, j, v }，便于查询页统一展示。
 */
export function parsePlainText (text) {
  const data = { m: '', s: '', t: '', j: '', v: [] };
  String(text || '').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    for (let i = 0; i < TEXT_FIELD_PREFIXES.length; i++) {
      const p = TEXT_FIELD_PREFIXES[i];
      if (trimmed.indexOf(p) === 0) {
        const val = trimmed.slice(p.length).trim();
        if (p === '型号:') data.m = val;
        else if (p === '序号:') data.s = val;
        else if (p === '时间:') data.t = val;
        else if (p === '判定:') data.j = val;
        else if (p === '测量:') data.v = val ? val.split(',').map(x => x.trim()) : [];
        break;
      }
    }
  });
  return data;
}

/**
 * 解析二维码内容，识别模式并返回结构化结果：
 *   url  → { mode: 'url',   data: { m, s, t, j, v } }
 *   text → { mode: 'text',  data: { m, s, t, j, v } }
 *   rule → { mode: 'rule',  data: splitRuleCode 各段（project/component/stage/color/…/serial） }
 *   无法识别 → { mode: 'unknown', error: 具体原因 }
 */
export function parseQrContent (text) {
  const raw = String(text || '');
  const trimmed = raw.trim();
  if (!trimmed) {
    return { mode: 'unknown', error: '内容为空' };
  }

  // ---- 1. 网页链接模式：http(s):// 开头 + # 后非空 → 解码（失败直接报错，不回退）----
  if (/^https?:\/\//i.test(trimmed)) {
    const hashIdx = trimmed.indexOf('#');
    const b64 = hashIdx >= 0 ? trimmed.slice(hashIdx + 1).trim() : '';
    if (!b64) {
      return { mode: 'unknown', error: '链接中未包含记录数据（# 后为空），无法解析' };
    }
    try {
      const data = decodeRecordFromBase64url(b64);
      if (!data || typeof data !== 'object') {
        return { mode: 'unknown', error: '链接数据解析失败：解码结果不是有效记录对象' };
      }
      return { mode: 'url', data };
    } catch (e) {
      return { mode: 'unknown', error: '链接数据解析失败：' + (e && e.message ? e.message : '不是合法的 base64url 记录数据') };
    }
  }

  // ---- 2. 明文文本模式：「型号:」行 + 至少一个其他已知字段行共同判定 ----
  const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const hasModelLine = lines.some(l => l.indexOf('型号:') === 0);
  const knownFieldLines = lines.filter(l => TEXT_FIELD_PREFIXES.some(p => l.indexOf(p) === 0)).length;
  if (hasModelLine && knownFieldLines >= 2) {
    return { mode: 'text', data: parsePlainText(trimmed) };
  }
  if (hasModelLine) {
    return { mode: 'unknown', error: '含「型号:」行但缺少其他字段行（序号/时间/判定/测量），不像生成端产出的明文码' };
  }

  // ---- 3. 编码规则模式：单行、无空白、拆段校验通过 ----
  if (lines.length === 1) {
    const rule = splitRuleCode(trimmed);
    if (rule) {
      return { mode: 'rule', data: rule };
    }
  }

  // ---- 4. 无法识别 ----
  return {
    mode: 'unknown',
    error: lines.length > 1
      ? '多行文本但无明文特征行（型号:/序号:/时间:/判定:/测量:），无法识别'
      : '不是链接、无明文特征行、也不符合编码规则拆段校验，无法识别'
  };
}
