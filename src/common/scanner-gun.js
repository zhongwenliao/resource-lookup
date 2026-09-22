/**
 * 扫码枪（USB/蓝牙 HID 键盘模式）全局输入监听
 *
 * 原理：扫码枪以键盘设备身份工作，扫码后把码值逐字符快速打出并以回车结尾。
 * 与手动打字的本质区别是字符间隔极短（通常 < 30ms）且均匀，借此判定输入来源：
 *   - 焦点在输入框时字符自然落入（v-model 同步），回车被拦截避免 textarea 换行；
 *   - 焦点不在输入框时由内部缓冲拼接，页面任意位置扫码都能取到完整码值。
 *
 * 判定规则（回车时刻校验，全部满足才回调）：
 *   1. 缓冲字符数 >= MIN_LEN（过滤误触）；
 *   2. 平均字符间隔 <= AVG_GAP_MAX（手动打字难以达到的速度）。
 *
 * 边界处理：
 *   - Shift 组合（大写字母）忽略修饰键本身，不打断序列；
 *   - Ctrl/Alt/Win 组合视为快捷键，清空缓冲；
 *   - 功能键（退格/方向/输入法 Process）打断序列；
 *   - 序列中途停顿超过 IDLE_CLEAR_MS 自动清缓冲，半截码不混入下一次扫码。
 *
 * 已知限制（扫码场景常规要求）：
 *   - 扫码枪需配置为回车结尾（绝大多数出厂默认）；
 *   - 系统输入法需为英文（中文输入法会拦截按键）；
 *   - 多行明文码会被逐行触发（每行一个回车），多行码建议用摄像头或粘贴。
 */

// 判定扫码枪的平均字符间隔上限（ms）：手动打字难以达到
const AVG_GAP_MAX = 50;
// 字符间隔超过该值视为新序列开始（ms）
const GAP_RESET_MS = 80;
// 序列静止超时清理（ms）：半截扫码/异常中断后清缓冲
const IDLE_CLEAR_MS = 600;
// 判定为码值的最小字符数（过滤误触）
const MIN_LEN = 4;

/**
 * 创建扫码枪监听。
 * @param {function(string)} onScan 回调，参数为完整码值（不含结尾回车）
 * @returns {function} 销毁函数，页面销毁时调用以移除全局监听
 */
export function createScannerGun (onScan) {
  let buf = '';
  let lastAt = 0;
  let startAt = 0;
  let idleTimer = null;

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
    // Shift 仅作大写组合，忽略按键本身，不打断序列
    if (e.key === 'Shift') return;
    // 快捷键组合（复制/粘贴/刷新等）不属于扫码输入，清空序列
    if (e.ctrlKey || e.altKey || e.metaKey) {
      reset();
      return;
    }
    // 间隔过大：手动输入或其他来源，开启新序列
    if (now - lastAt > GAP_RESET_MS) {
      buf = '';
      startAt = now;
    }
    lastAt = now;

    if (e.key === 'Enter') {
      const code = buf;
      const avg = startAt && code.length ? (now - startAt) / code.length : Infinity;
      reset();
      if (code.length >= MIN_LEN && avg <= AVG_GAP_MAX) {
        e.preventDefault(); // 拦截回车：避免 textarea 换行 / 焦点按钮被误触
        onScan(code);
      }
      return; // 不满足扫码枪特征的普通回车（手动输入）不干预
    }

    if (e.key.length === 1) {
      buf += e.key;
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(reset, IDLE_CLEAR_MS);
    } else {
      reset(); // 功能键（退格/方向/输入法 Process 等）打断序列
    }
  };

  window.addEventListener('keydown', handler, true);
  return () => {
    window.removeEventListener('keydown', handler, true);
    reset();
  };
}
