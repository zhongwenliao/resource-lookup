/**
 * 注册机(软件提供方使用,不随功能流程运行)
 *
 * 用法:
 *   node electron/keygen.js <机器码>
 *   node electron/keygen.js XXXX-XXXX-XXXX-XXXX
 *
 * 输出与该机器码绑定的授权码,发给用户在激活界面输入即可。
 * 机器码在应用「试用提示条 / 激活界面」中展示,用户复制发给你。
 *
 * 注意:密钥在 electron/license-core.js 的 SECRET 中,与打包进应用的必须一致。
 */
const { computeLicenseCode } = require('./license-core');

const arg = process.argv[2];
if (!arg) {
  console.log('用法: node electron/keygen.js <机器码>');
  console.log('示例: node electron/keygen.js A1B2-C3D4-E5F6-0718');
  process.exit(1);
}

const machineCode = arg.toUpperCase();
const code = computeLicenseCode(machineCode);
console.log('机器码: ' + machineCode);
console.log('授权码: ' + code);
