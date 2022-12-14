import Vue from "vue";
import {
	devConfig
} from '@/env'

// 引入表单验证文件
let graceChecker = require("./grace-checker.js");
// SDK工具
let sdkUtil = require("./sdk-util.js");
let expandedFunctionObj = require("./uni-expanded-functions.js");

// 事件分发的Javascript库
let onfire = require("./onfire.js");
let _this = Vue.prototype;

// 表单校验
let formChecker = require("./form-checker.js");
// 简单手机号校验
_this.$checkPhoneNumber = function(phone) {
	if (!(/^1(2|3|4|5|6|7|8|9)\d{9}$/.test(phone))) {
		return false;
	} else {
		return true;
	}
};

// 从缓存里获取用户信息的公共方法
_this.$getUserInfo = function() {
	let userInfo = {};
	try {
		userInfo = uni.getStorageSync("userInfo");
	} catch (e) {
		uni.debugLog("获取用户信息错误", e);
	}
	return userInfo;
};

// 对象合并
_this.$objectAssign = function(object1, object2) {
	for (let key in object1) {
		if ((this.$isObject(object1[key]) && this.$isObject(object2[key])) || (this.$isArray(object1[key]) && this
				.$isArray(object2[key]))) {
			object1[key] = {
				...object1[key],
				...object2[key]
			};
		} else if (this.$isString(object1[key]) && this.$isString(object2[key])) {
			object1[key] = object2[key];
		}
	}
	return object1;
}

/**
 * @description 时间格式化
 * @method $formatTime
 * @param {String} timeStr - 时间的字符串格式 "20210903103957"
 * @param {String} formatStr - 时间的格式化形式  默认格式为YYYY-MM-DD hh:mm:ss，即2021-09-03 10:39:57         
 * @returns {String} 返回以formatStr的时间格式化的形式的时间字符串
 * 
 */
_this.$formatTime = function(timeStr, formatStr = "YYYY-MM-DD hh:mm:ss") {
	let formatTimeStr = "";
	switch (formatStr) {
		case "YYYY-MM-DD hh:mm:ss":
			formatTimeStr = timeStr.substring(0, 4) + "-" +
				timeStr.substring(4, 6) + "-" +
				timeStr.substring(6, 8) + " " +
				timeStr.substring(8, 10) + ":" +
				timeStr.substring(10, 12) + ":" +
				timeStr.substring(12, 14);
			break;
	}
	return formatTimeStr;
}

// 判断数据类型是否对象
_this.$isObject = function(obj) {
	return this.$typeof(obj) == "[object Object]";
};

// 在js中，判断一个对象是属于什么类型的最精准方法Object.prototype.toString.call
_this.$typeof = function(obj) {
	return Object.prototype.toString.call(obj);
};

// 之前的表单验证插件方法统一调用，调用插件市场下载的表单验证插件graceChecker，渐渐被废弃
_this.$formCheck = function(param) {
	let checkRes = this.$graceChecker.check(param.formData, param.rule);
	if (checkRes) {
		param.success();
	} else {
		this.$showToast(this.$graceChecker.error);
		if (this.$isFunction(param.fail)) {
			param.fail();
		}
	}
};

// 自己封装的表单验证插件，逐步替代之前的表单验证插件graceChecker，支持一个字段设置多种规则
_this.$formChecker = formChecker;

// 表单验证插件方法统一调用，调用自己封装的表单验证插件formChecker
_this.$formSubmitCheck = function(param) {
	let formData = param.formData;
	for (let property in formData) {
		if (this.$isString(formData[property])) {
			// 当前值如果是字符串，就要首尾去空格
			formData[property] = formData[property].trim();
		}
	}
	let checkResult = this.$formChecker.formCheck(param.formData, param.checkList);
	if (checkResult.code == 0) {
		param.success();
	} else {
		this.$showToast(checkResult.msg);
		if (this.$isFunction(param.fail)) {
			param.fail();
		}
	}
};



// 判断数据类型是否字符串
_this.$isString = function(obj) {
	return this.$typeof(obj) == "[object String]";
};

// 判断数据类型是否函数
_this.$isFunction = function(obj) {
	return this.$typeof(obj) == "[object Function]";
};

// 判断数据类型是否对象
_this.$isObject = function(obj) {
	return this.$typeof(obj) == "[object Object]";
};

// 判断数据类型是否数组
_this.$isArray = function(obj) {
	return this.$typeof(obj) == "[object Array]";
};

//设置导航栏title
_this.$setTitle = function(title) {
	uni.setNavigationBarTitle({
		title: title
	});
};

// 显示loading公共方法
_this.$showLoading = function(content, mask) {
	if (mask === undefined) {
		mask = false;
	}
	uni.showLoading({
		title: content || "",
		mask: mask
	});
};

// 隐藏loading公共方法
_this.$hideLoading = function() {
	uni.hideLoading();
};

// toast弹窗公共方法
_this.$showToast = function(content, icon, duration) {
	let obj = {
		"title": content,
		"icon": icon !== undefined ? icon : "none",
		// "hasIcon": icon ? true : false,  // 用于第三方的toast组件
		"duration": duration !== undefined ? duration : 2000
	};
	uni.showToast(obj);
	// #ifdef APP-PLUS
	// let toastStyles = {"verticalAlign": "center"};
	// if(!this.$isEmpty(resource)) {
	// 	toastStyles = Object.assign(toastStyles, {"icon": "/static/img/" + resource + ".png", "iconWidth": "50px", "iconHeight": "50px"});
	// }
	// // if(content.length <= 5) {
	// // 	// content = "            " + content + "            ";
	// // }
	// plus.nativeUI.toast(content, toastStyles);
	// #endif
};

/**
 * @method 公共的打印方法
 * @param {String} label 被打印的对象名称  
 * @param {String} value 被打印的对象名称对应的值  
 * @example  
 * $showLog("注册成功", {"code": 0, "msg": "注册成功"}, "注册界面")  
 */
_this.$showLog = function(label, value, tag = "") {
	
};

/**
 * @method 获取当前时间的公共方法  
 * @example
 * $getCurrentTime()
 */
_this.$getCurrentTime = function() {
	let dateObj = new Date(),
		month = this.$numToStr(dateObj.getMonth() + 1, 2),
		date = this.$numToStr(dateObj.getDate(), 2),
		hour = this.$numToStr(dateObj.getHours(), 2),
		minute = this.$numToStr(dateObj.getMinutes(), 2),
		second = this.$numToStr(dateObj.getSeconds(), 2);
	return [dateObj.getFullYear(), month, date].join("-") + " " + [hour, minute, second].join(":");
};

_this.$onfire = onfire;

_this.$sdkUtil = sdkUtil;

// 根据参数来确定是升序还是降序
_this.$sortBy = function(attr, rev) {
	// 第二个参数没有传递，默认升序排列
	if (rev == undefined) {
		rev = 1;
	} else {
		rev = rev ? 1 : -1;
	}
	return function(a, b) {
		let n1 = a[attr];
		let n2 = b[attr];
		if (n1 < n2) {
			return rev * -1;
		}
		if (n1 > n2) {
			return rev * 1;
		}
		return 0;
	};
};
let systemInfo = uni.getSystemInfoSync();
let appInfo = {};
let platform = systemInfo.platform;
let system = systemInfo.system;
systemInfo.platform = systemInfo.platform.toLowerCase();
systemInfo.system = systemInfo.system.toLowerCase();
systemInfo.osType = platform.indexOf("ios") > -1 ? 2 : 1;
// #ifdef MP-WEIXIN
// systemInfo.osType = 3;
systemInfo.terminalType = 2; // 终端类型（-1：设备；0：平台（服务端）；1：APP；2：微信小程序；3：支付宝小程序；4：钉钉小程序；10：云闪付APP）
systemInfo.appVersion = "1.0.0";
// #endif
// #ifdef MP-ALIPAY
systemInfo.terminalType = "3";
// systemInfo.appVersion = "1.0.0";
// #endif
// #ifdef APP-PLUS
// systemInfo.appVersion = plus.runtime.version;
// #endif

// #ifdef APP-PLUS || H5
systemInfo.terminalType = 1;
// #endif
systemInfo.terminalAppVersion = systemInfo.appVersion;
systemInfo.terminalDeviceVersion = (system.indexOf("android") > -1 || system.indexOf("ios") > -1) ? system : platform +
	" " + system;
systemInfo.terminalDeviceBrand = systemInfo.brand;
appInfo.systemInfo = systemInfo;
uni.setStorageSync("appInfo", appInfo);
// 获取终端平台管理对象
_this.$platformObj = {
	// 当前平台
	
	platform: uni.getStorageSync("appInfo").systemInfo.platform.toLowerCase(),

	// 当前平台是否是安卓
	isAndroid: function() {
		// console.log("platform: ", this.platform);
		return this.platform.indexOf("android") > -1;
	},

	// 当前平台是否是ios
	isIOS: function() {
		return this.platform.indexOf("ios") > -1;
	},

	isApp: function() {
		return this.platform.indexOf("android") > -1 || this.platform.indexOf("ios") > -1;
	},

	// 当前平台当前语言是否是简体中文
	isCN: function() {
		return uni.getStorageSync("appInfo").language.toLowerCase().indexOf("cn") > -1;
	}
};



uni = Object.assign(uni, expandedFunctionObj);

// 获取配置参数
_this.$getConfigParam = function() {
	let configParam = devConfig;
	
	
	return configParam;
};

Date.prototype.pattern = function(formatStr) {
	let o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时
		"H+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3),
		/* 季度 */
		"S": this.getMilliseconds() //毫秒
	};
	let week = {
		"0": "\u65e5",
		"1": "\u4e00",
		"2": "\u4e8c",
		"3": "\u4e09",
		"4": "\u56db",
		"5": "\u4e94",
		"6": "\u516d"
	};
	if (/(y+)/.test(formatStr)) {
		formatStr = formatStr.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	if (/(E+)/.test(formatStr)) {
		formatStr = formatStr.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" :
				"\u5468") :
			"") + week[this.getDay() + ""]);
	}
	for (let k in o) {
		if (new RegExp("(" + k + ")").test(formatStr)) {
			formatStr = formatStr.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" +
				o[k]).length)));
		}
	}
	return formatStr;
};