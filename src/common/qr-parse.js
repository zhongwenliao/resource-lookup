/**
 * 二维码内容解析纯函数（溯源查询端）
 *
 * parseQrContent(text) 按先具体后宽泛的顺序识别两种内容模式：
 *   1. text 明文文本 —— 含「型号:」特征行 + 至少一个已知字段行
 *   2. rule 编码规则 —— 单行无空白且按 KBWK@@##*!%YMMDDXXXXX 拆段校验通过
 * 返回 { mode, data } 或 { mode: 'unknown', error }。
 */
import { splitRuleCode } from './qc-code-rules';

// 明文模式的字段行前缀（生成端早期明文码格式；生成端已收窄为仅编码规则模式，此处仅解析历史明文码）
const TEXT_FIELD_PREFIXES = ['型号:', '序号:', '时间:', '判定:', '测量:'];

/**
 * 明文文本解析：按「型号:/序号:/时间:/判定:/测量:」行前缀提取字段，
 * 测量值按逗号拆分为数组；缺失行容错为空。
 * 返回记录字段结构 { m, s, t, j, v }，供查询页统一展示。
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

  // ---- 1. 明文文本模式：「型号:」行 + 至少一个其他已知字段行共同判定 ----
  const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const hasModelLine = lines.some(l => l.indexOf('型号:') === 0);
  const knownFieldLines = lines.filter(l => TEXT_FIELD_PREFIXES.some(p => l.indexOf(p) === 0)).length;
  if (hasModelLine && knownFieldLines >= 2) {
    return { mode: 'text', data: parsePlainText(trimmed) };
  }
  if (hasModelLine) {
    return { mode: 'unknown', error: '含「型号:」行但缺少其他字段行（序号/时间/判定/测量），不像生成端产出的明文码' };
  }

  // ---- 2. 编码规则模式：单行、无空白、拆段校验通过 ----
  if (lines.length === 1) {
    const rule = splitRuleCode(trimmed);
    if (rule) {
      return { mode: 'rule', data: rule };
    }
  }

  // ---- 3. 无法识别 ----
  return {
    mode: 'unknown',
    error: lines.length > 1
      ? '多行文本但无明文特征行（型号:/序号:/时间:/判定:/测量:），无法识别'
      : '无明文特征行、也不符合编码规则拆段校验，无法识别'
  };
}
