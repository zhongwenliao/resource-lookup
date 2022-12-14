import Vue from 'vue';
let CryptoJS = require('./crypto-js.js');
// 密钥 16 位
// let key = '1f537a5e52f0%@#c08d5051#!3060169';
// 初始向量 initial vector 16 位
let iv = '';
// key 和 iv 可以一致
// tips：key和iv和后端开发人员沟通后保持一致
// key = CryptoJS.enc.Utf8.parse(key);
iv = CryptoJS.enc.Utf8.parse(iv);

let _this = Vue.prototype;
// 加密
function encrypted(param) {
	let key = _this.$getConfigParam().encryptedKey;
	key = CryptoJS.enc.Utf8.parse(key);
	let encrypted = CryptoJS.AES.encrypt(param, key, {
		// iv: iv,
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	});
	encrypted = encrypted.toString();
	// encrypted = encrypted.toString().replaceAll(System.lineSeparator(), ""); //将换行符替换为空
	// encrypted = encrypted.toString().replaceAll(System.lineSeparator(), ""); //将换行符替换为空
	return encrypted;
}

// 解密
function decrypted(param) {
	let key = _this.$getConfigParam().encryptedKey;
	key = CryptoJS.enc.Utf8.parse(key);
	let decrypted = CryptoJS.AES.decrypt(param, key, {
		// iv: iv,
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	});
	decrypted = CryptoJS.enc.Utf8.stringify(decrypted);
	return decrypted;
}

module.exports = {
  encrypted: encrypted,
  decrypted: decrypted
}

// 用法
// encrypted("福田区") // 加密
// decrypted("ZOrm989bMUvrC4E2YHrCYQ==") // 解密