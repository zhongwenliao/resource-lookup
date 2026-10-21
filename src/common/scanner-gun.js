/**
 * 扫码枪（USB/蓝牙 HID 键盘模式）全局输入监听
 *
 * 原理：扫码枪以键盘设备身份工作，扫码后把码值逐字符快速打出并以结束键（回车/Tab）收尾。
 * 与手动打字的本质区别是字符间隔极短且均匀，借此判定输入来源：
 *   - 焦点在输入框时字符自然落入（v-model 同步），结束键被拦截避免换行/跳焦点；
 *   - 焦点不在输入框时由内部缓冲拼接，页面任意位置扫码都能取到完整码值。
 *
 * 判定规则（结束键时刻校验，全部满足才回调）：
 *   1. 缓冲字符数 >= MIN_LEN（过滤误触）；
 *   2. 平均字符间隔 <= AVG_GAP_MAX（手动打字难以达到的速度）；
 *   3. 结束键紧邻最后字符（距上一按键 <= GAP_RESET_MS，残留半截码不误触发）。
 * 无结束键的扫码枪（部分枪配置为不发回车/Tab 后缀）：高速序列静止超过
 * AUTO_SUBMIT_MS 即视为扫码完成自动提交——手动打字平均间隔远超 AVG_GAP_MAX
 * 且难以连续凑出 MIN_LEN_AUTO 个高速字符，不会误提交。
 *
 * 边界处理：
 *   - 中文输入法（工厂电脑常态）：组合期间 e.key 为 'Process'，若只认 e.key
 *     则每个字符都会打断序列、扫码永远无反应；此时改用物理键位 e.code 还原字符；
 *   - 长按连发（e.repeat）是键盘 auto-repeat 而非扫码枪逐键输入，忽略不计入序列；
 *   - Shift 组合（大写字母）忽略修饰键本身，不打断序列；
 *   - Ctrl/Alt/Win 组合视为快捷键，清空缓冲；
 *   - 功能键（退格/方向键等）打断序列；
 *   - 序列中途停顿超过 GAP_RESET_MS 自动清缓冲，半截码不混入下一次扫码。
 *
 * 已知限制（扫码场景常规要求）：
 *   - 多行明文码会被逐行触发（每行一个回车），多行码建议用摄像头或粘贴。
 */

// 判定扫码枪的平均字符间隔上限（ms）：放宽到 80 兼容蓝牙/无线枪——
// 其省电连接间隔与 2.4G 重传会拉大字符间隔，过严会把整条码判为手动输入而丢弃
const AVG_GAP_MAX = 80;
// 字符间隔超过该值视为新序列开始（ms）：同样为蓝牙枪放宽，过严会把慢速枪的码
// 拦腰截断，后半截被当成完整码回调，绑出错误数据比扫不出更难察觉
const GAP_RESET_MS = 150;
// 无结束键自动提交的静止时长（ms）：取 200 兼顾蓝牙枪卡顿重传（一般 < 200ms，
// 避免把卡顿当扫码结束提交出半截码）与无回车枪扫完后的等待体感
const AUTO_SUBMIT_MS = 200;
// 自动提交（无结束键）的最小字符数：比结束键提交更严——自动提交没有明确的
// 结束意图，门槛提高到 8 位（本系统规则码约 20 位、常见外部条码 > 10 位），
// 手动飞快打字几乎不可能连续凑出 8 个高速字符，杜绝误绑
const MIN_LEN_AUTO = 8;
// 自动提交后的回声抑制窗口（ms）：无结束键枪若配有回车但延迟较大（蓝牙），
// 自动提交已完成后紧随的回车会被拦截，避免触发聚焦按钮/输入框造成二次提示
const SUBMIT_ECHO_MS = 300;
// 判定为码值的最小字符数（过滤误触）
const MIN_LEN = 4;

// 物理键位 → 字符还原表（仅中文输入法把 e.key 置为 'Process' 时兜底使用）
const CODE_CHAR_MAP = {
  Minus: '-',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Semicolon: ';',
  Quote: '\'',
  Comma: ',',
  Period: '.',
  Slash: '/',
  Backquote: '`',
  Space: ' ',
  NumpadAdd: '+',
  NumpadSubtract: '-',
  NumpadMultiply: '*',
  NumpadDivide: '/',
  NumpadDecimal: '.'
};
// 数字行 Shift 后的上档符号（与 US 键盘布局一致）
const DIGIT_SHIFT_MAP = {
  Digit1: '!',
  Digit2: '@',
  Digit3: '#',
  Digit4: '$',
  Digit5: '%',
  Digit6: '^',
  Digit7: '&',
  Digit8: '*',
  Digit9: '(',
  Digit0: ')'
};

/**
 * 从物理键位还原字符：KeyA→a/A、Digit3→3/#、Numpad5→5；
 * 无法还原的键位返回空串（由调用方打断序列）。
 */
function charFromCode (code, shift) {
  if (!code) return '';
  if (code.indexOf('Key') === 0 && code.length === 4) {
    const ch = code.charAt(3).toLowerCase();
    return shift ? ch.toUpperCase() : ch;
  }
  if (code.indexOf('Digit') === 0 && code.length === 6) {
    return shift ? (DIGIT_SHIFT_MAP[code] || '') : code.charAt(5);
  }
  if (code.indexOf('Numpad') === 0 && code.length === 7) {
    const n = code.charAt(6);
    return (n >= '0' && n <= '9') ? n : '';
  }
  return CODE_CHAR_MAP[code] || '';
}

/**
 * 创建扫码枪监听。
 * @param {function(string)} onScan 回调，参数为完整码值（不含结尾回车/Tab）
 * @returns {function} 销毁函数，页面销毁时调用以移除全局监听
 */
export function createScannerGun (onScan) {
  let buf = '';
  let lastAt = 0;
  let startAt = 0;
  let idleTimer = null;
  let lastSubmitAt = 0; // 最近一次回调时刻（回声抑制用）

  const reset = () => {
    buf = '';
    lastAt = 0;
    startAt = 0;
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  };

  const handler = (e) => {
    const now = Date.now();
    // 长按连发是键盘 auto-repeat（间隔极短且无结束键语义），混入会凑出假码值
    if (e.repeat) return;
    // Shift 仅作大写组合，忽略按键本身，不打断序列
    if (e.key === 'Shift') return;
    // 快捷键组合（复制/粘贴/刷新等）不属于扫码输入，清空序列
    if (e.ctrlKey || e.altKey || e.metaKey) {
      reset();
      return;
    }

    // 结束键（回车/Tab，部分扫码枪出厂配置 Tab 收尾）：先判定再清缓冲，
    // 判定需要「结束键距最后字符的间隔」来排除此前残留的半截码
    if (e.key === 'Enter' || e.key === 'Tab') {
      const code = buf;
      const avg = startAt && code.length ? (now - startAt) / code.length : Infinity;
      const stale = code.length > 0 && now - lastAt > GAP_RESET_MS;
      const hit = code.length >= MIN_LEN && avg <= AVG_GAP_MAX && !stale;
      // 刚自动提交过（无结束键枪的延迟回车/Tab）：缓冲已空必然不命中，
      // 但仍需拦截结束键，避免触发聚焦的「绑定」按钮或输入框造成二次提示
      const justSubmitted = now - lastSubmitAt < SUBMIT_ECHO_MS;
      reset();
      if (hit) {
        e.preventDefault(); // 拦截结束键：避免 textarea 换行 / 焦点跳转 / 按钮误触
        lastSubmitAt = now;
        onScan(code);
      } else if (justSubmitted) {
        e.preventDefault();
      }
      return; // 未命中扫码枪特征的结束键（手动操作）不干预
    }

    // 取字符：优先 e.key（正常键盘布局下最可靠）；中文输入法组合期 e.key 为
    // 'Process'/'Unidentified'，改用物理键位 e.code 还原，否则扫码枪整条码
    // 会被输入法逐字符打断而扫不出来
    let ch = '';
    if (e.key && e.key.length === 1) {
      ch = e.key;
    } else if (e.key === 'Process' || e.key === 'Unidentified') {
      ch = charFromCode(e.code, e.shiftKey);
    }

    // 间隔过大：手动输入或其他来源，开启新序列
    if (now - lastAt > GAP_RESET_MS) {
      buf = '';
      startAt = now;
    }
    lastAt = now;
    if (ch) {
      buf += ch;
      // 静止判定定时器（每字符重置）：静止 AUTO_SUBMIT_MS 后统一裁决——
      // 高速序列（扫码枪速度）+ 足够长度 → 无结束键的扫码枪自动提交；
      // 否则是手动输入残留/半截码，静默清缓冲
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        const code = buf;
        const avg = startAt && code.length ? (Date.now() - startAt) / code.length : Infinity;
        const hit = code.length >= MIN_LEN_AUTO && avg <= AVG_GAP_MAX;
        reset();
        if (hit) {
          lastSubmitAt = Date.now();
          onScan(code);
        }
      }, AUTO_SUBMIT_MS);
    } else {
      reset(); // 功能键（退格/方向键等）打断序列
    }
  };

  window.addEventListener('keydown', handler, true);
  return () => {
    window.removeEventListener('keydown', handler, true);
    reset();
  };
}
