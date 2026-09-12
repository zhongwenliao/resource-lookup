/**
 * 授权核心算法(纯 Node,不依赖 Electron,主进程与注册机共用)
 *
 * 机器码:取 Windows MachineGuid(重装系统才变化)→ SHA-256 → XXXX-XXXX-XXXX-XXXX
 * 授权码:机器码 + 内置密钥 → HMAC-SHA256 → XXXXX-XXXXX-XXXXX-XXXXX-XXXXX(与机器码一一绑定)
 *
 * 说明:离线授权无法做到绝对防破解(密钥随代码分发),此方案用于常规商业防护已足够。
 */
const crypto = require('crypto');
const os = require('os');
const { execSync } = require('child_process');

// 内置密钥:主进程与注册机必须一致;修改它会使所有已发放的授权码失效
const SECRET = 'qc-label-generator#2026$license-secret';

/** Windows MachineGuid(稳定硬件标识,重装系统才变);失败回退 MAC 地址 */
function getMachineGuid () {
  try {
    // 绝对路径调用:部分环境 PATH 不含 System32,导致 reg 不可用
    const regExe = require('path').join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'reg.exe');
    const out = execSync('"' + regExe + '" query "HKLM\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid',
      { windowsHide: true, encoding: 'utf8' });
    const m = out.match(/MachineGuid\s+REG_SZ\s+(\S+)/i);
    if (m) return m[1].trim();
  } catch (e) { /* 非 Windows 或权限不足,走回退 */ }
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (!net.internal && net.mac && net.mac !== '00:00:00:00:00:00') return net.mac;
    }
  }
  return os.hostname();
}

/** 本机机器码,格式 XXXX-XXXX-XXXX-XXXX(展示给用户换取授权码) */
function getMachineCode () {
  const h = crypto.createHash('sha256')
    .update(SECRET + '|machine|' + getMachineGuid())
    .digest('hex').toUpperCase();
  return [h.slice(0, 4), h.slice(4, 8), h.slice(8, 12), h.slice(12, 16)].join('-');
}

/** 由机器码计算对应授权码,格式 XXXXX-XXXXX-XXXXX-XXXXX-XXXXX */
function computeLicenseCode (machineCode) {
  const h = crypto.createHmac('sha256', SECRET)
    .update('license|' + String(machineCode).toUpperCase())
    .digest('hex').toUpperCase();
  return [h.slice(0, 5), h.slice(5, 10), h.slice(10, 15), h.slice(15, 20), h.slice(20, 25)].join('-');
}

/** 归一化用户输入:去分隔符、统一大写,便于宽松比对 */
function normalizeCode (s) {
  return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** 校验授权码是否与指定机器码匹配 */
function isValidLicense (code, machineCode) {
  return normalizeCode(code) === normalizeCode(computeLicenseCode(machineCode));
}

/** 状态文件签名:license.json 的字段被手改后签名失配,主进程据此判定篡改 */
function signPayload (payload) {
  return crypto.createHmac('sha256', SECRET + '|file-sign')
    .update(JSON.stringify(payload))
    .digest('hex');
}

module.exports = { getMachineCode, computeLicenseCode, normalizeCode, isValidLicense, signPayload };
