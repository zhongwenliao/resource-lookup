/**
 * 二维码编码规则共享模块（生成端与解析端共用，防止规则漂移）
 *
 * 生成端（QcLabel.vue）与解析端（qr-parse.js / 溯源查询页）必须使用同一份
 * 映射常量与编解码函数：生成端新增颜色/阶段时解析端自动跟进。
 */

/* ==================== 数字补零 ==================== */

// 数字补零：9 -> '09'（时间格式化用）
export const pad2 = n => (n < 10 ? '0' + n : '' + n);
// 数字补零到五位：123 -> '00123'（编码规则流水码用）
export const pad5 = n => ('00000' + n).slice(-5);

/* ==================== 编码规则映射（KBWK@@##*!%YMMDDXXXXX） ==================== */

// 试制阶段「名称→码值」映射：V3→3、V4→4、VN1→5、VN2→6、LV→7
export const STAGE_CODE_MAP = { V3: '3', V4: '4', VN1: '5', VN2: '6', LV: '7' };
// 试制阶段「码值→名称」反查映射（解析端展示用）
export const STAGE_NAME_MAP = { 3: 'V3', 4: 'V4', 5: 'VN1', 6: 'VN2', 7: 'LV' };
// 颜色「名称→码值」映射：锖色→Q、银色→Y（小写码也归一为大写）
export const COLOR_CODE_MAP = { '锖色': 'Q', '银色': 'Y', Q: 'Q', Y: 'Y' };
// 颜色「码值→名称」反查映射（解析端展示用）
export const COLOR_NAME_MAP = { Q: '锖色', Y: '银色' };
// 编码规则月份码：1-9 月用数字 1-9，10/11/12 月用 A/B/C
export const MONTH_CODES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C'];
// 月份码 → 月份数字反查映射（解析端展示用）：'1'→1 … '9'→9、'A'→10、'B'→11、'C'→12
export const MONTH_NAME_MAP = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12 };

// 试制阶段输入归一化：直接填码值（3/4/5/6/7）原样使用，填阶段名（V3 等，忽略大小写）自动转码
export const normalizeStage = s => {
  const k = String(s || '').trim();
  return STAGE_CODE_MAP[k.toUpperCase()] || k;
};

/**
 * 试制阶段段拼码（生成端）：填阶段名（V3/V4/VN1/VN2/LV，忽略大小写）时输出
 * 「名称-码值」（如 V3 → V3-3，连字符分隔名称与码值）；直接填码值（3-7）时仅输出码值。
 */
export const buildStageSegment = s => {
  const k = String(s || '').trim().toUpperCase();
  const code = STAGE_CODE_MAP[k];
  return code ? k + '-' + code : normalizeStage(s);
};
// 颜色输入归一化：直接填码值（Q/Y）原样使用，填颜色名（锖色/银色）或小写码自动转码
export const normalizeColor = c => {
  const k = String(c || '').trim();
  return COLOR_CODE_MAP[k] || COLOR_CODE_MAP[k.toUpperCase()] || k;
};

/* ==================== 规则码拆段（解析端） ==================== */

// 内置组件词表：规则码前缀（项目+组件直接拼接，无法无损拆分）按词表从尾部匹配拆分
// （含字母组件代号与中文组件名）
export const COMPONENT_WORDS = [
  'WK',
  '中框', '后盖', '电池盖', '前壳', '后壳', '中板', '底壳', '面板',
  '装饰圈', '装饰件', '摄像头圈', '按键', '镜片', '支架', '卡托'
];

// 规则码固定段长度：流水码 5 + 日期 2 + 月份 1 + 年份 1 + 供方/原材/阳极 3 = 12
const RULE_TAIL_LEN = 12;
// 规则码最小总长：尾部固定 12 位 + 试制阶段码 1 位 + 颜色码 1 位（前缀允许为空）
export const RULE_CODE_MIN_LEN = RULE_TAIL_LEN + 2;

/**
 * 规则码从右向左拆固定段并校验（KBWK@@##*!%YMMDDXXXXX）：
 *   [前缀=项目+组件] 试制阶段码(1) 颜色码(1) 供方(1) 原材(1) 阳极(1) 年份(1) 月份(1) 日期(2) 流水码(5)
 * 各段校验：流水码 5 位数字、日期 2 位数字、月份码 ∈ 1-9/A/B/C、年份 1 位数字、
 *           供方/原材/阳极各 1 位字母、阶段码 ∈ 3/4/5/6/7、颜色码 ∈ Q/Y。
 * 前缀拆分：优先用内置组件词表在尾部匹配组件名，匹配不到返回合并前缀并标记 prefixAmbiguous。
 * 校验通过返回各段对象，失败返回 null。
 */
export function splitRuleCode (code) {
  const s = String(code || '');
  // 单行、无空白字符、长度不小于固定段 + 阶段码 + 颜色码
  if (!s || /\s/.test(s) || s.length < RULE_CODE_MIN_LEN) return null;
  const tail = s.slice(-RULE_TAIL_LEN);
  const head = s.slice(0, s.length - RULE_TAIL_LEN);
  // 从左到右：供方(1) 原材(1) 阳极(1) 年份(1) 月份(1) 日期(2) 流水码(5)
  const m = /^([A-Za-z])([A-Za-z])([A-Za-z])(\d)([1-9ABC])(\d{2})(\d{5})$/.exec(tail);
  if (!m) return null;
  // 阶段码与颜色码位于固定段之前
  if (head.length < 2) return null;
  const colorCode = head.slice(-1).toUpperCase();
  const stageCode = head.slice(-2, -1);
  if (!COLOR_NAME_MAP[colorCode] || !STAGE_NAME_MAP[stageCode]) return null;
  const rawPrefix = head.slice(0, head.length - 2);
  // 生成端阶段段为「名称-码值」格式（如 V3-3）：前缀尾部若带「阶段名-」则归入阶段段，
  // 避免阶段名混入项目/组件拆分（旧格式码/直填码值无此尾缀，不受影响）。
  // stageSegment 与剥离量严格对应：prefix + stageSegment + 后续段可无损还原原码
  let stageSegment = stageCode;
  let prefix = rawPrefix;
  const stageTail = STAGE_NAME_MAP[stageCode] + '-';
  if (rawPrefix.endsWith(stageTail)) {
    stageSegment = stageTail + stageCode;
    prefix = rawPrefix.slice(0, rawPrefix.length - stageTail.length);
  }

  // 前缀拆分：项目名称 + 组件名称（生成端为两个自由字符串直接拼接，无法无损拆分）
  let project = prefix;
  let component = '';
  let prefixAmbiguous = false;
  const hit = COMPONENT_WORDS.filter(w => prefix.endsWith(w))
    .sort((a, b) => b.length - a.length)[0]; // 取最长命中（如「摄像头圈」优先于「圈」）
  if (hit && prefix.length > hit.length) {
    project = prefix.slice(0, prefix.length - hit.length);
    component = hit;
  } else {
    prefixAmbiguous = true;
  }

  return {
    code: s, // 原始完整码值（查询端按码回查关联记录直接使用，免去重组）
    project,
    component,
    prefixAmbiguous,
    prefix,
    stage: { code: stageCode, name: STAGE_NAME_MAP[stageCode] },
    stageSegment, // 完整试制阶段段（名称-码值如 V3-3，或直填码值如 3），重组完整码用
    color: { code: colorCode, name: COLOR_NAME_MAP[colorCode] },
    supplier: m[1].toUpperCase(),
    raw: m[2].toUpperCase(),
    anode: m[3].toUpperCase(),
    year: m[4],
    month: m[5],
    monthNum: MONTH_NAME_MAP[m[5]],
    day: m[6],
    serial: m[7]
  };
}
