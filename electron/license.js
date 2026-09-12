/**
 * 授权状态管理(依赖 Electron app,主进程使用)
 *
 * 状态文件:{userData}/license.json,记录:
 *   firstRun   首次启动时间戳(试用期起点)
 *   lastSeen   最近一次启动时间戳(防时钟回拨:当前时间早于它则按它算)
 *   activated  是否已激活
 *   licenseCode 已验证的授权码(每次启动重新校验,防止直接改文件伪造)
 *   sig        以上字段的 HMAC 签名(手改任何字段即失配 → 判定篡改,要求激活)
 *
 * 状态流转:
 *   首次启动 → trial(3 天)→ expired(需授权码激活)→ activated
 *   文件被篡改 → expired(需授权码激活)
 *
 * 已知局限(离线授权固有):删除整个 license.json 可重置试用;
 * 如需更严格可在注册表存第二份交叉校验,或接入在线验证服务。
 */
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { getMachineCode, isValidLicense, signPayload } = require('./license-core');

// 试用期天数
const TRIAL_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

function licenseFile () {
  return path.join(app.getPath('userData'), 'license.json');
}

/**
 * 读取并校验状态文件:
 *   无文件 → {}(首次启动)
 *   签名有效 → 完整状态
 *   有文件但签名失配 → { tampered: true }(被篡改/损坏)
 */
function readStore () {
  try {
    const obj = JSON.parse(fs.readFileSync(licenseFile(), 'utf8'));
    if (!obj || typeof obj !== 'object') return {};
    const payload = {
      firstRun: obj.firstRun,
      lastSeen: obj.lastSeen,
      activated: !!obj.activated,
      licenseCode: obj.licenseCode || ''
    };
    if (obj.sig && signPayload(payload) === obj.sig) return payload;
    return { tampered: true };
  } catch (e) {
    return {}; // 文件不存在(首次启动)或 JSON 解析失败
  }
}

function writeStore (data) {
  const payload = {
    firstRun: data.firstRun,
    lastSeen: data.lastSeen,
    activated: !!data.activated,
    licenseCode: data.licenseCode || ''
  };
  const sig = signPayload(payload);
  fs.writeFileSync(licenseFile(), JSON.stringify(Object.assign({ sig }, payload), null, 2), 'utf8');
}

/**
 * 获取当前授权状态(每次启动调用;同时落盘 firstRun / lastSeen)
 * 返回:
 *   { status: 'activated', machineCode }
 *   { status: 'trial', machineCode, daysLeft, trialEndDate }
 *   { status: 'expired', machineCode, trialEndDate?, tampered? }
 */
function getState () {
  const store = readStore();
  const machineCode = getMachineCode();
  const now = Date.now();

  // 状态文件被篡改/损坏:直接要求激活(正常使用不会手改此文件)
  if (store.tampered) {
    return { status: 'expired', machineCode, tampered: true };
  }

  // 已激活:重新校验授权码与机器码仍匹配(防止改文件伪造 activated 标记)
  if (store.activated && isValidLicense(store.licenseCode, machineCode)) {
    return { status: 'activated', machineCode };
  }

  // 防时钟回拨:系统时间早于上次记录,则按上次时间计算(回拨无法延长试用)
  // 防 firstRun 篡改到未来:firstRun 不得晚于 effectiveNow,晚则重置(签名机制下已难发生,双保险)
  const effectiveNow = Math.max(now, store.lastSeen || 0);
  if (!store.firstRun || store.firstRun > effectiveNow) store.firstRun = effectiveNow;
  store.lastSeen = effectiveNow;
  writeStore(store);

  const trialEnd = store.firstRun + TRIAL_DAYS * DAY_MS;
  if (effectiveNow >= trialEnd) {
    return { status: 'expired', machineCode, trialEndDate: new Date(trialEnd) };
  }
  const daysLeft = Math.max(0, Math.ceil((trialEnd - effectiveNow) / DAY_MS));
  return { status: 'trial', machineCode, daysLeft, trialEndDate: new Date(trialEnd) };
}

/**
 * 激活:校验授权码,通过则落盘(带签名)
 * 返回 { ok: true } 或 { ok: false, error }
 */
function activate (code) {
  const machineCode = getMachineCode();
  if (!code || !String(code).trim()) {
    return { ok: false, error: '请输入授权码' };
  }
  if (!isValidLicense(code, machineCode)) {
    return { ok: false, error: '授权码无效:授权码与机器码绑定,请核对后重试' };
  }
  const store = readStore();
  // 文件被篡改过也不影响激活:激活即以当前时间为 lastSeen 重新起算落盘
  const now = Date.now();
  writeStore({
    firstRun: store.firstRun || now,
    lastSeen: Math.max(now, store.lastSeen || 0),
    activated: true,
    licenseCode: String(code).trim().toUpperCase()
  });
  return { ok: true };
}

module.exports = { getState, activate, TRIAL_DAYS };
