// uni打印日志功能拓展，分为普通打印、开发环境打印、生产环境打印，在项目中尽量使用uni.log或者uni.debugLog来替代console.log打印日志
import Vue from 'vue';
var _this = Vue.prototype;
var expandedFunctionObj = {
	_dataConveyString(data) {
		// 当前数据如果是字符串，则不管，如果是对象，则转换成字符串
		if (_this.$isObject(data) || _this.$isArray(data)) {
			data = JSON.stringify(data);
		}
		return data;
	},
	log(tag, content, logName, env) {
		// 普通打印，在所有环境下都可打印日志
		content = content !== undefined ? this._dataConveyString(content) : "";
		logName = logName !== undefined ? "（" + logName + "）" : "";
		if (env !== undefined) {
			if (env === 1) {
				env = "开发环境";
			}else {
				env = "生产环境";
			}
		} else {
			env = "";
		}
		console.log("【App" + env + logName + "】" + tag + ": " + content);
	},
	prodLog(tag, content, logName) {
		// 只在生产环境下打印日志
		var configParam = _this.$getConfigParam();
		if(!configParam.isDebug) {
			this.log(tag, content, logName, 3);
		}
	},
	debugLog(tag, content, logName) {
		// 只在开发环境下打印日志
		var configParam = _this.$getConfigParam();
		if(configParam.isDebug) {
			this.log(tag, content, logName, 1);
		}
	},
	formatTime(time) {
		if(typeof time !== 'number' || time < 0) {
			return time;
		}
		var hour = parseInt(time / 3600);
		time = time % 3600;
		var minute = parseInt(time / 60);
		time = time % 60;
		var second = time;
		return ([hour, minute, second]).map(function (n) {
			n = n.toString();
			return n[1] ? n : '0' + n;
		}).join(':');
	},
	formatLocation(longitude, latitude) {
		if(typeof longitude === 'string' && typeof latitude === 'string') {
			longitude = parseFloat(longitude);
			latitude = parseFloat(latitude);
		}
		longitude = longitude.toFixed(2);
		latitude = latitude.toFixed(2);
		return {
			longitude: longitude.toString().split('.'),
			latitude: latitude.toString().split('.')
		};
	},
	formatDate(year, month, day) {
		return year + '-' + this.getTwo(month) + '-' + this.getTwo(day);
	},
	getTwo(num) {
		if (Number(num) < 10) {
			return '0' + num;
		} else {
			return num;
		}
	},
	getFormatTimeStr(timeStr, format = "YYYY-MM-DD hh:mm:ss") {
		var formatTimeStr = "";
		if(format === "YYYY-MM-DD hh:mm:ss") {
			formatTimeStr = timeStr.slice(0, 4) + "-" + timeStr.slice(4, 6) + "-" + timeStr.slice(6, 8) + " " + timeStr.slice(8, 10) + ":" + timeStr.slice(10, 12) + ":" + timeStr.slice(12, 14);
		}
		return formatTimeStr;
	}
};
module.exports = expandedFunctionObj;