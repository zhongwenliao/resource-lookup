import Vue from 'vue';
var mpBluetoothSDK = null;

// 就目前而言，小程序平台只考虑微信小程序和支付宝小程序开发，其他小程序暂不考虑
// 微信小程序
// #ifdef MP-WEIXIN
mpBluetoothSDK = require("./doormaster-weixin-bluetooth-sdk-v1.5.js");
// #endif

// 支付宝小程序
// #ifdef MP-ALIPAY
mpBluetoothSDK = require("./doormaster-alipay-bluetooth-sdk-v1.7.js");
// #endif

var sdkRequest = require("./sdk-request.js");

var platform = uni.getSystemInfoSync().platform.toLowerCase();

// APP平台使用插件，该插件集成蓝牙和音视频相关功能，目前该插件在ios上使用，在安卓被分离成sysLanguagePlugin、bluetoothPlugin、vphonePlugin
let plugin = {};

// 获取系统语言插件，在安卓端使用
let sysLanguagePlugin = {};

// 蓝牙插件
let bluetoothPlugin = {};

// 音视频插件
let vphonePlugin = {};

// 推送
let pushPlugin = {};

// #ifdef APP-PLUS
// 引入蓝牙插件，实现蓝牙功能
bluetoothPlugin = uni.requireNativePlugin("DoorMaster-Bluetooth-Plugin") || {};
vphonePlugin = uni.requireNativePlugin("DoorMaster-VPhone-Plugin") || {};


// 当前的操作平台的系统版本
const SYSTEM = uni.getSystemInfoSync().system.toLowerCase();

/**
 * 插件引入方式，具体参考官方文档：https://uniapp.dcloud.io/plugin/native-plugin.html
 * 1. 本地引入蓝牙插件（插件名：DoorMaster-Bluetooth-Plugin，放在项目根目录下的nativeplugins目录下）
 * 2. 放在插件市场上进行云端调用
 */
// #ifdef APP-PLUS
const BLUETOOTH_PLUGIN_SDK = uni.requireNativePlugin("DoorMaster-Bluetooth-Plugin") || {};
const permission = uni.requireNativePlugin("DoorMaster-Permission-Plugin") || {};
// #endif


if (platform.indexOf("ios") > -1) {
	// plugin = uni.requireNativePlugin('DCloud-PluginModule') || {};
	// ios平台
	// sysLanguagePlugin = plugin;
	pushPlugin = vphonePlugin; // 目前在ios平台推送功能集成到音视频对讲插件（vphonePlugin）
} else {
	sysLanguagePlugin = uni.requireNativePlugin("SysLanguagePlugin") || {};
	pushPlugin = uni.requireNativePlugin("DoorMaster-Push-Plugin") || {}; // // 针对国内应用市场，苹果推送集成到苹果音视频对讲插件
	// pushPlugin = uni.requireNativePlugin("DoorMaster-Push-Plugin-google") || {};  // 针对谷歌应用市场
}
// #endif

var _this = Vue.prototype;

// 蓝牙SDK工具类
class BluetoothSDKUtil {
	constructor(arg) {
		// 扫描的设备列表
		this.scanDeviceList = [];
		// 开门的结果
		this.openDoorResult = {};
		// 蓝牙扫描开始时间
		this.scanStartTime = null;
		// 蓝牙匹配有权限的设备开始时间
		this.matchStartTime = null;
		// 蓝牙开门开始时间
		this.openDoorStartTime = null;
		// 经过排序的个人设备列表
		this.sortPermissionDeviceList = [];
		// 蓝牙扫描的结果
		this.scanResult = {};
		// 定时器
		this.timer = null;
		// 请求次数
		this.number = 6;
		this.errMsgObj = {};
		// this.bluetoothOneKeyOpenDoorStartTime = null;
		this.bluetoothOpenDoorTimeInfo = {};
		this.mainI18n = null;
		this.commonI18n = null;
		this.sdkI18n = null;
		this.btCode = null;
	}
	
	init() {
		this.mainI18n = _this.$t("main");
		this.commonI18n = _this.$t("common");
		this.sdkI18n = _this.$t("sdk");
		this.btCode = _this.$t("bt-error-code");
		this.openDoorResult = {
			title: this.commonI18n["open-fail"] || "开门失败",
			image: "https://file.yuanzhoulvwego.com/prod/uploadFiles/img/failed.png",
			icon: "none"
		};
		this.scanResult = {
			title: this.sdkI18n["scan-fail"] || "扫描失败",
			image: "https://file.yuanzhoulvwego.com/prod/uploadFiles/img/failed.png"
		};
		this.errMsgObj = {
			"1": this.sdkI18n["no-device-detected"] || "没有扫描到任何设备，请靠近设备再重试"
		};
		// 固件升级错误码
		this.firmwareUpgradeErrorMsgObj = {
			"-1": this.sdkI18n["no-connect"] || "尚未连接设备",
			"-2": this.sdkI18n["disconnect"] || "与设备断连",
			"-3": this.sdkI18n["error"] || "错误",
			"-4": this.sdkI18n["param-error"] || "参数错误",
			"-5": this.sdkI18n["maybe-not-support"] || "蓝牙未打开，或不支持",
			"-6": this.sdkI18n["upgrading"] || "正在升级",
			"-7": this.sdkI18n["server-error"] || "服务错误",
			"-8": this.sdkI18n["crc-failed"] || "CRC校验失败",
			"-9": this.sdkI18n["file-failed"] || "文件头部校验失败",
			"-10": this.sdkI18n["out-storage-error"] || "外部存储错误",
			"-11": this.sdkI18n["inside-storage-error"] || "内部存储错误",
			"-12": this.sdkI18n["invalid-storage"] || "无效存储",
			"-13": this.sdkI18n["app-abnormal"] || "应用异常",
			"-15": this.sdkI18n["invalid-image-bank"] || "镜像库无效", // （Invalid image bank）
			"-16": this.sdkI18n["invalid-image-header"] || "镜像头无效", // （Invalid image header）
			"-17": this.sdkI18n["invalid-image-size"] || "镜像文件大小无效", // （Invalid image size）
			"-18": this.sdkI18n["invalid-product-header"] || "无效产品信息头", // （Invalid product header）
			"-19": this.sdkI18n["same-firmware"] || "已是当前固件版本", // （Same firmware）
			"-20": this.sdkI18n["cannot-read"] || "无法从外部存储设备读取" // （Failed to read from external memory device）
		};
		// 初始化EID SDK，用于读取放置在设备上身份证信息，目前只能在安卓使用
		console.log('初始化');
		this.initEID();
		this.initBluetooth();
		console.log('初始化d44444444445');
	}

	/**
	 * 【功能说明】
	 *  初始化EID SDK，用于读取放置在设备上身份证信息，目前只能在安卓使用，只支持蓝牙版本号为4.2及以上
	 */
	initEID() {
		// #ifdef APP-PLUS
		if (_this.$platformObj.isAndroid()) {
			
			if (bluetoothPlugin.initEID) {
				console.log('初始化3');
				bluetoothPlugin.initEID();
				// bluetoothPlugin.setLogSwitch(true);
			} else {
				_this.$showToast("该APP不支持初始化身份证读取功能");
			}
		}
		// #endif
	}

	/**
	 * 【功能说明】
	 *  读取身份证信息，用于读取放置在设备上身份证信息，目前只能在安卓使用，只支持蓝牙版本号为4.2及以上
	 * 
	 * 【参数说明】
	 *  @param {Object} devObj 放置身份证的设备信息
	 *  @param {Function} callback 将读取身份证信息结果回调出去 
	 */
	readEID(devObj, callback) {
		if (bluetoothPlugin.readEID) {
			_this.$showLoading();
			bluetoothPlugin.readEID(devObj, (result) => {
				_this.$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					// 获取身份证信息成功
					_this.$showToast("获取身份证信息成功");
					if (callback && typeof callback === "function") {
						callback(result);
					}
				} else if (errorCode === 48) {
					_this.$showToast("获取身份证信息超时");
				} else {
					_this.$showToast("获取身份证信息失败（" + errorCode + "）");
				}
			});
		} else {
			_this.$showToast("该APP不支持身份证读取功能");
		}
	}

	/**
	 * 【功能说明】
	 *  蓝牙初始化SDK
	 */
	initBluetooth() {
		// #ifdef APP-PLUS
		if (bluetoothPlugin.initBluetooth) {
			_this.$showLog("是否调用初始化蓝牙", true);
			bluetoothPlugin.initBluetooth();
		} else {
			_this.$showLog("是否能初始化蓝牙", false);
		}
		// #endif
	}

	//蓝牙扫描周边设备
	bluetoothScanNearDevice(callback, scanTime) {
		var __this = this;
		_this.$showLoading();
		bluetoothPlugin.blueToothScanDevice(res => {
			_this.$hideLoading();
			uni.debugLog(JSON.stringify(res));
			var errorCode = res.errorCode;
			if (errorCode === 0) {
				var scanDeviceList = res.data;
				if (scanDeviceList.length === 0) {
					var systemInfo = _this.$getAppInfo().systemInfo;
					var platform = systemInfo.platform;
					var system = systemInfo.system;
					var msg = __this.sdkI18n["no-device-detected"] || "没有扫描到任何设备，请靠近设备再重试";
					if (platform.indexOf("android") > -1 && parseFloat(system) >=
						6) { // 安卓操作系统并且安卓版本是6.0及以上
						msg = __this.sdkI18n["location"] || "没有扫描到任何设备，请打开定位权限，靠近设备再重试";
						return;
					}
				}
				scanDeviceList = scanDeviceList.sort(_this.$sortBy("RSSI", false));
				if (callback !== undefined) {
					callback(scanDeviceList);
				}
			} else {
				if (errorCode === -112) {
					_this.$showToast(__this.sdkI18n["frequent"] || "扫描过于频繁");
				} else {
					_this.$showToast(__this.sdkI18n["scan-fail"] || "扫描失败，" + this.btCode[errorCode] ||
						`(${errorCode})`);
				}
			}
		}, scanTime);
	}

	// 蓝牙扫描设备(针对有权限的设备列表进行排序)
	bluetoothScanDevice(permissionDeviceList, callback, isOpenNearField, scanTime) {
		var __this = this;
		if (permissionDeviceList.length > 0) {
			var scanStartTime = new Date().getTime();
			isOpenNearField = isOpenNearField === undefined ? false : isOpenNearField;
			// #ifdef MP-WEIXIN || MP-ALIPAY
			// 小程序蓝牙开门，需要传deviceId，
			// 蓝牙扫描方法就是将扫描到的设备列表和个人设备列表进行匹配，将deviceId传给个人设备，没扫描到的设备默认deviceId为空，RSSI默认为-1000000
			// 回调函数返回经过排序的设备列表，默认从大到小排序
			mpBluetoothSDK.scanDevices(res => {
				uni.debugLog("蓝牙扫描耗时", (new Date().getTime() - scanStartTime) + "ms", "扫描SDK");
				if (res.errCode === 0) {
					var matchStartTime = new Date().getTime();
					this.scanDeviceList = res.scanList;
					for (var device of permissionDeviceList) {
						device["bluetoothDeviceId"] = "";
						device["RSSI"] = -1000000;
						for (var scanDevice of this.scanDeviceList) {
							if (device["devSn"] === scanDevice["name"].replace(/[^\d]/g, "")) {
								device["RSSI"] = scanDevice["RSSI"];
								device["bluetoothDeviceId"] = scanDevice["deviceId"];
								break;
							}
						}
					}
					console.log("匹配有权限设备耗时", new Date().getTime() - matchStartTime);
					var sortStartTime = new Date().getTime();
					this.sortPermissionDeviceList = permissionDeviceList.sort(_this.$sortBy("RSSI", false));
					console.log("蓝牙排序最强设备耗时", new Date().getTime() - sortStartTime);
					if (callback !== undefined) {
						callback(this.sortPermissionDeviceList);
					}
				}
			});
			// #endif

			// #ifdef APP-PLUS
			// 原生APP蓝牙开门，不需要deviceId，扫描方法返回经过排序的设备列表，默认从大到小排序
			uni.debugLog("蓝牙开门原生");
			bluetoothPlugin.blueToothScanDevice(res => {
				uni.debugLog(JSON.stringify(res));
				var errorCode = res.errorCode;
				if (errorCode === 0) {
					var scanDeviceList = res.data;
					if (scanDeviceList.length === 0) {
						var systemInfo = _this.$getAppInfo().systemInfo;
						var platform = systemInfo.platform;
						var system = systemInfo.system;
						var msg = __this.sdkI18n["no-device-detected"] || "没有扫描到任何设备，请靠近设备再重试";
						if (platform.indexOf("android") > -1 && parseFloat(system) >=
							6) { // 安卓操作系统并且安卓版本是6.0及以上
							msg = __this.sdkI18n["location"] || "没有扫描到任何设备，请打开定位权限，靠近设备再重试";
							if (!isOpenNearField) {
								_this.$showToast(msg);
							}

							return;
						}
					}
					this.scanDeviceList = scanDeviceList;
					this.sortPermissionDeviceList = permissionDeviceList;
					if (permissionDeviceList.length === 0) {
						if (!isOpenNearField) {
							_this.$showToast(commonI18n["no-rights"] || "当前账号没设备权限，请联系物业管理处再重试");
						}
						return;
					}
					this.sortPermissionDeviceList.map(device => device["RSSI"] = -1000000);
					for (var device of permissionDeviceList) {
						// device["RSSI"] = -1000000;
						for (var scanDevice of this.scanDeviceList) {
							// console.log("device.devSn", device["devSn"], "scanDevice.devSn", scanDevice["devSn"], device["devSn"] ===
							// 	scanDevice["devSn"].replace(/[^\d]/g, ""));
							if (device["devSn"] === scanDevice["devSn"].replace(/[^\d]/g, "")) {
								device["RSSI"] = scanDevice["RSSI"];
								break;
							}
						}
					}
					this.sortPermissionDeviceList = permissionDeviceList.sort(_this.$sortBy("RSSI", false));
					// console.log("this.sortPermissionDeviceList=============", JSON.stringify(this.sortPermissionDeviceList));
					if (callback !== undefined) {
						callback(this.sortPermissionDeviceList);
					}
				} else {
					if (!isOpenNearField) {
						uni.hideLoading();
						if (errorCode === -112) {
							_this.$showToast(__this.sdkI18n["frequent"] || "扫描过于频繁");
						} else {
							_this.$showToast(this.btCode[errorCode] || __this.sdkI18n["scan-fail"] ||
								"扫描失败，" + `(${errorCode})`);
						}
					}
				}
			}, scanTime);
			// #endif
		} else {
			// if (!param.isOpenNearField) {
			// 	_this.$hideLoading();
			// }
			// var msg = res.msg;
			// if (code !== 0) {
			// 	_this.$showToast(msg + "," + __this.mainI18n["cannot-get-door"] || "无法获取绑定门禁");
			// } else {
			// 	_this.$showToast(__this.mainI18n["no-door"] || "暂无绑定门禁");
			// }
			if (!isOpenNearField) {
				_this.$hideLoading();
			}
			_this.$showToast(__this.mainI18n["no-dev"] || "暂无绑定设备");
		}
	}

	// 蓝牙开门
	bluetoothOpenDoor(device, isOpenNearField, bluetoothOneKeyOpenDoorStartTime, callback) {
		device.keyType=device.ekeyType;//蓝牙秘钥类型
		console.log("开始蓝牙开门",device);
		var openDoorStartTime = new Date().getTime();
		isOpenNearField = isOpenNearField === undefined ? false : isOpenNearField;
		var __this = this;
		// #ifdef MP-WEIXIN || MP-ALIPAY
		let devObj = {
			"deviceId": device.bluetoothDeviceId,
			"ekey": device.miniEkey,
			"devSn": device.devSn
		};
		mpBluetoothSDK.openDoor(devObj, function(res) {
			let code = res.errCode;
			if (code !== 0) {
				uni.showToast({
					title: __this.commonI18n["open-fail"] || "开门失败" + "，" + this.btCode[code],
					image: "https://file.yuanzhoulvwego.com/prod/uploadFiles/img/failed.png"
				});
			} else {
				sdkUtil.openDoorAduioPlay();
				callback(res);
			}
		}, device.devSn);
		// #endif

		// #ifdef APP-PLUS
		this._nativeBluetoothOpendoor(isOpenNearField, device, () => {
			console.log("_nativeBluetoothOpendoor");
			if (callback && typeof callback === "function") {
				callback();
			}
		})
		// #endif
	}

	/**
	 * 设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 * appEkey组成：
	 * 设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 * d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 * d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 */
	_nativeBluetoothOpendoor(isOpenNearField, device, callback) {
		let __this = this;
		if (isOpenNearField) {
			let userInfo = _this.$getUserInfo(),
				openingIntervalTimeSameDevice = userInfo.openingIntervalTimeSameDevice;
			openingIntervalTimeSameDevice = openingIntervalTimeSameDevice ? openingIntervalTimeSameDevice : 0;
			if (userInfo.openNearFieldDevSn === device.devSn && userInfo.openNearFieldTime !==
				undefined && (new Date().getTime() - userInfo.openNearFieldTime < openingIntervalTimeSameDevice *
					1000)) {
				return;
			}
		}
		bluetoothPlugin.blueToothOpenDoor(device, result => {
			// 非近场开门，在开门过程中会有加载，等有了结果就把加载隐藏
			if (!isOpenNearField) {
				uni.hideLoading();
			}
			let errorCode = result.errorCode,
				title = "";
			let openDoorResultObj = {
				devSn: device.devSn,
				eventType: errorCode === 0 ? 19 : 79,
				desc: errorCode === 0 ? "手机蓝牙开门成功" : "手机蓝牙开门失败"
			};
			if (errorCode === -107) {
				_this.$showToast("设备正在处理数据，请稍后再试");
				return;
			} else if (errorCode === 0) {
				// 开门成功，分近场开门成功和非近场开门成功
				// title = isOpenNearField ? "近场开门成功" :
				// 	"开门成功";
				// _this.$editUserInfo("openNearFieldDevSn", device.devSn);
				// _this.$editUserInfo("openNearFieldTime", new Date().getTime());
				// sdkUtil.openDoorAduioPlay();
				console.log('到我了')
			} else {
				let errorCodeObj = {
					11: "devKey检测错误",
					48: "通信连接超时"
				}
				if (errorCode in errorCodeObj) {
					title = errorCodeObj[errorCode];
					_this.$showToast(device.doorName + " - " + title);
				} else if (errorCode !== 0) {
					title = isOpenNearField ? ("近场开门失败") +
						"(code: " + errorCode + ")" :
						("开门失败") + "(code: " + errorCode + ")";
					_this.$showToast(device.doorName + " - " + title);
				}
			}

			if (errorCode === 0 && callback && typeof callback === "function") {
				console.log("走了回调:", device);
				callback();
				uni.navigateTo({
					url: "/sub-package2/pages/home/entranceGuard/openDoor"
				})
			}
		});
	}

	// 蓝牙一键开门
	bluetoothOneKeyOpenDoor(param, callback) {
		var bluetoothOneKeyOpenDoorStartTime = new Date().getTime();
		// #ifdef H5
		_this.$showToast(this.mainI18n["not-support"] || "浏览器不支持一键开门");
		return;
		// #endif
		param = param !== undefined ? param : {};
		var currentCommunity = _this.$getUserInfo().currentCommunity;
		console.log("currentCommunity: ", JSON.stringify(_this.$getUserInfo().currentCommunity));
		if (_this.$isEmpty(currentCommunity)) {
			_this.$showToast(this.mainI18n["no-community-bind"] || "当前暂未绑定小区");
			return;
		}
		// #ifdef MP-WEIXIN
		var appInfo = _this.$getAppInfo();
		var bluetoothAdapterStatus = appInfo.bluetoothAdapterStatus;
		if (!bluetoothAdapterStatus) {
			var obj = {
				content: this.mainI18n["open-bluetooth"] || "请打开蓝牙",
				confirmText: this.commonI18n["confirm"] || "确认",
				cancelText: this.commonI18n["cancel"] || "取消"
			};
			var systemInfo = appInfo.systemInfo;
			console.log("systemInfo.platform===%o", systemInfo.platform, "systemInfo.version=====%o", systemInfo
				.system);
			if (systemInfo.platform.indexOf("ios") > -1 && _this.$parseFloat(systemInfo.system) > 1200) {
				console.log("ios系统版本高于12");
				obj.content = this.mainI18n["bluetooth-author"] || "请打开手机蓝牙，并打开设置-微信-蓝牙进行授权";
			}
			uni.showModal(obj);
			return;
		}
		// #endif

		// 近场开门不提示正在开门
		param.isOpenNearField = param.isOpenNearField === undefined ? false : param.isOpenNearField;
		if (!param.isOpenNearField) {
			_this.$showLog("main", this.mainI18n["open-door"]);
			_this.$showLoading(this.mainI18n["open-door"] || "正在开门...");
		}
		var permissionDeviceList = _this.$getUserInfo().allDevList;
		let scanTime = param.scanTime
		if (permissionDeviceList === undefined || permissionDeviceList.length === 0) {
			var sendData = Object.assign({
				isShowLoad: false,
				url: "/sqDoor/app/getAllDoorRole",
				needNetwork: false
			}, param);
			_this.$fetchDevList(sendData, result => {
				if (result.code !== 0) {
					_this.$showToast(mainI18n["cannot-get-door"] || "无法获取绑定门禁");
					return;
				}
				permissionDeviceList = result.data;
				uni.debugLog("蓝牙一键开门有网络请求前期耗时", (new Date().getTime() - bluetoothOneKeyOpenDoorStartTime) +
					"ms");
				this.bluetoothOpenDoorTimeInfo["前期"] = (new Date().getTime() -
					bluetoothOneKeyOpenDoorStartTime) + "ms";
				this.bluetoothOneKeyOpenDoorScanCallback(permissionDeviceList, param.isOpenNearField,
					bluetoothOneKeyOpenDoorStartTime, callback);
			});
		} else {
			uni.debugLog("蓝牙一键开门无网络请求前期耗时", (new Date().getTime() - bluetoothOneKeyOpenDoorStartTime) + "ms");
			this.bluetoothOpenDoorTimeInfo["前期"] = (new Date().getTime() - bluetoothOneKeyOpenDoorStartTime) + "ms";
			this.bluetoothOneKeyOpenDoorScanCallback(permissionDeviceList, param.isOpenNearField,
				bluetoothOneKeyOpenDoorStartTime, callback, scanTime);
		}
	}

	// 蓝牙一键开门扫描回调
	bluetoothOneKeyOpenDoorScanCallback(permissionDeviceList, isOpenNearField, bluetoothOneKeyOpenDoorStartTime,
		callback, scanTime) {
		this.bluetoothScanDevice(permissionDeviceList, sortPermissionDeviceList => {
			uni.debugLog("蓝牙一键开门扫描离开始耗时", (new Date().getTime() - bluetoothOneKeyOpenDoorStartTime) + "ms");
			this.bluetoothOpenDoorTimeInfo["扫描"] = (new Date().getTime() -
				bluetoothOneKeyOpenDoorStartTime) + "ms";
			if (isOpenNearField) {
				// 近场开门时
				// 近场开门和一键开门不同，近场开门涉及到每隔一段时间蓝牙开门，如果是获取信号值最强的设备，那么有可能是同一个设备，
				// 如果这个设备上一次的开门时间和这次这设备扫描到的时间间隔小于同一台设备开门间隔时长
				// 先获取本地用户缓存数据中的近场开门距离
				let openDoorDistance = parseInt(_this.$getUserInfo().openDoorDistance);
				// 通过距离，计算出该距离对应的RSSI值
				let signalValue = parseInt(-60 - (openDoorDistance - 50) * 0.8);
				_this.$showLog("近场开门的信号值", signalValue);
				_this.$showLog("近场开门通过近场开门距离筛选前的所有设备列表信号值", sortPermissionDeviceList.map((deviceObj) => {
					return deviceObj["RSSI"]
				}));
				// 通过大于或等于该值的筛选条件筛选出符合该距离下的所有设备列表
				sortPermissionDeviceList = sortPermissionDeviceList.filter((deviceObj) => {
					if (parseInt(deviceObj["RSSI"]) >= signalValue) {
						return deviceObj;
					}
				});
				_this.$showLog("近场开门通过近场开门距离筛选后的所有设备列表", sortPermissionDeviceList.map((deviceObj) => {
					return deviceObj["RSSI"]
				}));
				if (sortPermissionDeviceList && sortPermissionDeviceList.length > 0) {
					this.bluetoothOpenDoor(sortPermissionDeviceList[0], isOpenNearField,
						bluetoothOneKeyOpenDoorStartTime);
				}
			} else {
				// 非近场开门时,就是一键开门
				let strongestSignalDevice = sortPermissionDeviceList[0]; // 排在最前面的就是信号最强的
				_this.$showLog("一键开门时信号值最强的设备", strongestSignalDevice);
				if (strongestSignalDevice["RSSI"] == "-1000000") {
					// 默认每个设备的RSSI是-1000000，如果连最前面的RSSI是-1000000，证明附近没有可蓝牙扫描的设备
					_this.$hideLoading();
					_this.$showToast(this.mainI18n["device-far"] || "设备距离太远，请靠近设备后重试");
				} else {
					// 一键开门要信号最强的设备
					this.bluetoothOpenDoor(strongestSignalDevice, isOpenNearField,
						bluetoothOneKeyOpenDoorStartTime, () => {
							console.log("一键开门蓝牙开门回调", callback);
							if (callback && typeof(callback) == "function") {
								callback(strongestSignalDevice);
							}
						});
				}
			}
		}, isOpenNearField, scanTime);
	}

	// 近场开门，调用原生的近场开门方法
	openNearField(param) {
		var platform = uni.getSystemInfoSync().platform.toLowerCase();
		var activity = null;
		if (platform === "android") {
			activity = plus.android.runtimeMainActivity(); // native.js和安卓相关知识
		} else if (platform === "ios") {

		}
		plugin.openNearField(activity, param, result => {
			_this.$showToast(result);
		});
	}


	// 蓝牙近场开门，在前端做个定时器，每隔一定时间调用蓝牙一键开门
	bluetoothOpenDoorNearField() {
		this.bluetoothOneKeyOpenDoor({
			"isNetworkRequest": false,
			"isGetAll": true,
			"isOpenNearField": true
		});
	}

	// 向原生传递设备列表
	sendDevListToNative(param) {
		plugin.sendDevListToNative(param, result => {
			_this.$showToast(result);
		})
	}

	// 配置通讯参数
	configCommunicationParams(devObj, configParam) {
		if (this.timer !== null) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		_this.$showLoading();
		if (devObj.hardwarePlatform == 1) {
			// 需要配置wifi（单片机）
			this.configWifi(devObj, configParam);
		} else {
			// 配置ip（嵌入式、安卓）
			this.setServerIP(devObj, configParam);
		}
	}

	// 蓝牙配置wifi
	configWifi(devObj, configParam) {
		var manage = _this.$t("manage");
		if (bluetoothPlugin.configWifi) {
			bluetoothPlugin.configWifi(devObj, configParam, result => {
				_this.$hideLoading();
				var errorCode = result.errorCode;
				if (errorCode === 0) {
					// errorMsg = "蓝牙配置wifi成功";
					if (configParam.ipAddress == "106.52.94.106") {
						//我们自己服务器地址
						_this.$showLoading(manage["config"] || "配置已完成, 正在联网...");
						this._getDeviceOnlineStatus(devObj);
					} else {
						_this.$showToast(this.sdkI18n["successfully-configured"] || "配置成功");
					}

				} else {
					_this.$showToast(this.btCode[errorCode] || (manage["set-failed"] || "配置失败") +
						`(${errorCode})`);
				}
			});
		}
	}

	//配置APN
	setAPNSetting(devObj, configParam, callback) {
		uni.showLoading()
		var manage = _this.$t("manage");
		if (bluetoothPlugin.setAPNSetting) {
			
			bluetoothPlugin.setAPNSetting(devObj, configParam, result => {
				var errorCode = result.errorCode;
				if (callback && typeof callback == "function") {
					callback(errorCode);
					return
				}
				
				if (errorCode === 0) {
					// errorMsg = "蓝牙配置APN成功";
					_this.$showToast(this.sdkI18n["successfully-configured"] || "配置成功");
				} else {
					_this.$showToast(this.btCode[errorCode] || (manage["set-failed"] || "配置失败") +
						`(${errorCode})`);
				}
			});
		}
	}

	//获取APN信息
	getAPNSetting(devObj, callback) {
		var sdkI18n = this.sdkI18n;
		_this.$showLoading("", false);
		if (bluetoothPlugin.getAPNSetting) {
			bluetoothPlugin.getAPNSetting(devObj, result => {
				var errorCode = result.errorCode;
				if (errorCode === 0) {
					if (callback !== undefined && typeof callback == "function") {
						callback(result);
					} else {
						_this.$showToast(sdkI18n["acquire-success"] || "获取APN信息成功");
					}
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["get-timeout"] || "获取APN信息超时");
				} else {
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["get-fail"] || "获取APN信息失败") +
						`(${errorCode})`);
				}
			});
		}
	}

	// 获取设备系统信息
	getDeviceConfig(devObj, callback) {
		var sdkI18n = this.sdkI18n;
		_this.$showLoading("", false);
		console.log("devObj=====", devObj);
		if (bluetoothPlugin.getDeviceConfig) {
			bluetoothPlugin.getDeviceConfig(devObj, result => {
				_this.$hideLoading();
				var errorCode = result.errorCode;
				if (errorCode === 0) {
					if (callback !== undefined && typeof callback == "function") {
						callback(result);
					} else {
						_this.$showToast(sdkI18n["successfully-get-dev-info"] || "获取设备系统信息成功");
					}
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["timeout-get-dev-info"] || "获取设备系统信息超时");
				} else {
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["failed-get-dev-info"] ||
						"获取设备系统信息失败") + `(${errorCode})`);
				}
			});
		} else {
			_this.$hideLoading();
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持获取设备系统信息功能");
			return;
		}
	}

	// 蓝牙配置ip
	setServerIP(devObj, configParam) {
		var manage = _this.$t("manage");
		if (bluetoothPlugin.setServerIP) {
			bluetoothPlugin.setServerIP(devObj, configParam, result => {
				_this.$hideLoading();
				var errorCode = result.errorCode;
				if (errorCode === 0) {
					// errorMsg = "蓝牙配置wifi成功";
					_this.$showLoading(manage["config"] || "配置已完成, 正在联网...");
					this._getDeviceOnlineStatus(devObj);
				} else {
					_this.$showToast(this.btCode[errorCode] || (manage["set-failed"] || "配置失败") +
						`(${errorCode})`);
				}
			});
		}
	}

	// 配置读卡扇区密钥
	setReadSectorKey(devObj, configParam) {
		// var manage = _this.$t("manage");
		var sdkI18n = this.sdkI18n;
		_this.$showLoading();
		if (bluetoothPlugin.setReadSectorKey) {
			bluetoothPlugin.setReadSectorKey(devObj, configParam, result => {
				_this.$hideLoading();
				var errorCode = result.errorCode;
				if (errorCode === 0) {
					_this.$showToast(sdkI18n["successfully-configured"] || "配置读卡扇区密钥成功");
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["timeout-configured"] || "配置读卡扇区密钥超时");
				} else {
					_this.$showToast(this.btCode[errorCode] + (sdkI18n["failed-configured"] ||
						"配置读卡扇区密钥失败") + `(${errorCode})`);
				}
			});
		} else {
			_this.$hideLoading();
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持配置读卡扇区密钥功能");
			return;
		}
	}

	// 配置设备IP地址
	setDeviceStaticIP(devObj, configParam) {
		var manage = _this.$t("manage");
		var sdkI18n = this.sdkI18n;
		_this.$showLoading();
		if (bluetoothPlugin.setDeviceStaticIP) {
			bluetoothPlugin.setDeviceStaticIP(devObj, configParam, result => {
				_this.$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					_this.$showToast(sdkI18n["successfully-configured"] || "配置设备IP地址成功");
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["timeout-configured"] || "配置设备IP地址超时");
				} else {
					_this.$showToast(this.btCode[errorCode] + (sdkI18n["failed-configured"] ||
						"配置设备IP地址失败") + `(${errorCode})`);
				}
			});
		} else {
			_this.$hideLoading();
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持配置设备IP地址功能");
			return;
		}
	}

	// 配置设备紧急开门密码
	modifyPwd(devObj, configParam , callback) {
		var manage = _this.$t("manage");
		var sdkI18n = this.sdkI18n;
		_this.$showLoading();
		if (bluetoothPlugin.modifyPwd) {
			bluetoothPlugin.modifyPwd(devObj, configParam, result => {
				_this.$hideLoading();
				let errorCode = result.errorCode;
				if (callback && typeof callback == "function") {
					if (errorCode === 0) {
						callback(errorCode);
					} else if (errorCode === 48) {
						_this.$showToast(sdkI18n["set-pwd-timeout"] || "配置紧急开门密码超时");
					} else {
						_this.$showToast(this.btCode[errorCode] || (sdkI18n["set-pwd-failed"] || "配置紧急开门密码失败") +
							`(${errorCode})`);
					}
					return
				}
				
				if (errorCode === 0) {
					_this.$showToast(sdkI18n["set-pwd-succeed"] || "配置紧急开门密码成功");
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["set-pwd-timeout"] || "配置紧急开门密码超时");
				} else {
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["set-pwd-failed"] || "配置紧急开门密码失败") +
						`(${errorCode})`);
				}
			});
		} else {
			_this.$hideLoading();
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持配置设备IP地址功能");
			return;
		}
	}

	//同步设备时间
	syncDeviceTime(devObj, syncTime, callback) {
		// var manage = _this.$t("manage");
		var sdkI18n = this.sdkI18n;
		_this.$showLoading();
		if (bluetoothPlugin.syncDeviceTime) {
			bluetoothPlugin.syncDeviceTime(devObj, syncTime, result => {
				_this.$hideLoading();
				var errorCode = result.errorCode;
				if (errorCode === 0) {
					_this.$showToast(sdkI18n["successfully-configured"] || "同步设备时间成功");
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["timeout-configured"] || "同步设备时间超时");
				} else {
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["failed-configured"] ||
						"同步设备时间失败") + `(${errorCode})`);
				}
				if (callback && typeof callback == "function") {
					callback(errorCode);
				}
			});
		} else {
			_this.$hideLoading();
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持同步设备时间功能");
			return;
		}
	}

	// 重置设备信息
	resetDeviceConfig(devObj, callback) {
		var sdkI18n = this.sdkI18n;
		// var manage = _this.$t("manage");
		_this.$showLoading();
		if (bluetoothPlugin.getDeviceConfig) {
			bluetoothPlugin.resetDeviceConfig(devObj, result => {
				_this.$hideLoading();
				var errorCode = result.errorCode;
				if (errorCode === 0) {
					_this.$showToast(sdkI18n["reset-dev-success"] || "恢复设备出厂设置成功");
					callback(result);
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["reset-dev-timeout"] || "恢复设备出厂设置超时");
				} else {
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["reset-dev-failed"] ||
						"恢复设备出厂设置失败") + `(${errorCode})`);
				}
			});
		} else {
			_this.$hideLoading();
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持获取设备系统信息功能");
			return;
		}
	}

	// 请求设备状态
	_getDeviceOnlineStatus(devObj) {
		var that = this;
		var manage = _this.$t("manage");
		if (this.number > 1) {
			this.timer = setTimeout(function() {
				_this.$req.request({
					url: "/devDevice/app/getDeviceOnlineStatus",
					data: {
						"devSn": devObj.devSn,
						"isShowLoad": false
					},
					success: result => {
						var code = result.code;
						if (code === 0 && that.number > 1) {
							var onlineStatus = result.data.onlineStatus;
							if (onlineStatus == 1) {
								_this.$hideLoading();
								_this.$showToast(manage["connect-net"] || "设备已联网");
								that.number = 6;
							} else {
								that._getDeviceOnlineStatus(devObj);
							}
						} else if (that.number == 1) {
							_this.$hideLoading();
							_this.$showToast(manage["connect-fail"] || "联网失败，请检查参数");
							that.number = 6;
						} else {
							that._getDeviceOnlineStatus(devObj);
						}
					},
					fail: () => {
						if (that.number == 1) {
							_this.$hideLoading();
							_this.$showToast(manage["connect-fail"] || "联网失败，请检查参数");
							that.number = 6;
						} else {
							that._getDeviceOnlineStatus(devObj);
						}
					},
					complete: () => {
						that.number--;
						uni.log("请求设备状态倒数次数", that.number);
						// clearTimeout(that.timer);
						// that.timer = null;
					}
				});
			}, 10000);
		}
	}

	// 通过手机蓝牙获取到放置在该设备上的卡的卡号
	getSwipeAddCardno(devObj, callback) {
		let sdkI18n = this.sdkI18n
		_this.$showLoading(sdkI18n["card-reading"] || "读卡中...");
		if (bluetoothPlugin.getSwipeAddCardno) {
			bluetoothPlugin.getSwipeAddCardno(devObj, result => {
				// _this.$hideLoading();
				var errorCode = result.errorCode;
				if (errorCode === 0) {
					_this.$hideLoading();
					// _this.showToast("读取卡号成功")
					// _this.$showToast("获取卡号成功, 卡号：" + result.data.cardNo);					
					callback(result);
				} else if (errorCode === 48) {
					_this.$hideLoading();
					_this.$showToast(sdkI18n["card-read-timeout"] || "读取卡号超时，开卡失败");
				} else {
					_this.$hideLoading();
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["card-read-failed"] ||
						"未读取到刷卡，开卡失败") + `(${errorCode})`);
				}
			});
		} else {
			_this.$hideLoading();
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持获取卡号功能");
			return;
		}
	}

	// 写卡,append为是否追加，若为true，就是直接添加，若为false，则先清空再添加
	writeCard(devObj, cardDataStr, append, callback) {
		var manage = _this.$t("manage");
		var sdkI18n = this.sdkI18n;
		_this.$showLoading(sdkI18n["card-writing"] || "正在写卡...");
		if (bluetoothPlugin.writeCard) {
			bluetoothPlugin.writeCard(devObj, cardDataStr, append, result => {
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					if (callback) {
						callback(result);
					} else {
						_this.$showToast(sdkI18n["write-card-success"] || "写卡成功");
					}
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["write-card-timeout"] || "写卡超时");
				} else {
					_this.$showToast(this.btCode[errorCode] + (sdkI18n["write-card-failed"] || "写卡失败") +
						`(${errorCode})`);
				}
			});
		} else {
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持配置设备IP地址功能");
			return;
		}
	}

	//旧版刷卡添卡
	swipeAddCardModel(devObj, callback) {
		var sdkI18n = this.sdkI18n;
		if (bluetoothPlugin.swipeAddCardModel) {
			bluetoothPlugin.swipeAddCardModel(devObj, result => {
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					if (callback) {
						callback(result);
					} else {
						_this.$showToast(sdkI18n["swipe-add-card-model"] || "进入刷卡添卡模式，请刷卡");
					}
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["swipe-add-card-timeout"] || "进入刷卡添卡模式超时");
				} else {
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["swipe-add-card-failed"] ||
						"进入刷卡添卡模式失败") + `(${errorCode})`);
				}
			})
		}
	}

	//退出刷卡添卡模式
	existSwipeCardAddModel(devObj, callback) {
		var sdkI18n = this.sdkI18n;
		if (bluetoothPlugin.existSwipeCardAddModel) {
			bluetoothPlugin.existSwipeCardAddModel(devObj, result => {
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					if (callback) {
						callback(result);
					} else {
						_this.$showToast(sdkI18n["exit-swipe-add-card-model"] || "已退出刷卡添卡模式");
					}
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["exit-swipe-add-card-timeout"] || "退出刷卡添卡模式超时");
				} else {
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["exit-swipe-add-card-failed"] ||
						"退出刷卡添卡模式失败") + `(${errorCode})`);
				}
			})
		}
	}

	//旧版刷卡删卡
	swipeCardDeleteModel(devObj, callback) {
		if (bluetoothPlugin.swipeCardDeleteModel) {
			bluetoothPlugin.swipeCardDeleteModel(devObj, result => {
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					if (callback) {
						callback(result);
					} else {
						_this.$showToast(sdkI18n["swipe-delete-card-model"] || "进入刷卡删卡模式，请刷卡");
					}
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["swipe-delete-card-timeout"] || "进入刷卡删卡模式超时");
				} else {
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["swipe-delete-card-failed"] ||
						"进入刷卡删卡模式失败") + `(${errorCode})`);
				}
			})
		}
	}

	//退出刷卡删卡模式
	existSwipeCardDeleteModel(devObj, callback) {
		if (bluetoothPlugin.existSwipeCardDeleteModel) {
			bluetoothPlugin.existSwipeCardDeleteModel(devObj, result => {
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					if (callback) {
						callback(result);
					} else {
						_this.$showToast(sdkI18n["exit-swipe-delete-card-model"] || "已退出刷卡删卡模式");
					}
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["exit-swipe-delete-card-timeout"] || "退出刷卡删卡模式超时");
				} else {
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["exit-swipe-delete-card-failed"] ||
						"退出刷卡删卡模式失败") + `(${errorCode})`);
				}
			})
		}
	}

	// 删卡
	deleteCard(devObj, cardDataStr, callback) {
		_this.$showLoading();
		var manage = _this.$t("manage");
		var sdkI18n = this.sdkI18n;
		// _this.$showLoading();
		if (bluetoothPlugin.deleteCard) {
			_this.$showLog("删卡devObj", devObj);
			_this.$showLog("删卡cardDataStr", cardDataStr);
			bluetoothPlugin.deleteCard(devObj, cardDataStr, result => {
				let errorCode = result.errorCode;
				_this.$showLog("删卡状态码", errorCode);
				if (errorCode === 0 || errorCode == 18) {
					if (callback) {
						callback(result);
					} else {
						_this.$showToast(sdkI18n["delete-card-success"] || "删卡成功");
					}
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["delete-card-timeout"] || "删卡超时");
				} else {
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["delete-card-failed"] || "删卡失败") +
						`(${errorCode})`);
				}
			});
		} else {
			_this.$hideLoading();
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持配置设备IP地址功能");
			return;
		}
	}

	//清除所有卡数据
	cleanCard(devObj, callback) {
		var sdkI18n = this.sdkI18n;
		_this.$showLoading();
		if (bluetoothPlugin.cleanCard) {
			console.log("-----开始清空所有卡数据-----", JSON.stringify(devObj));
			bluetoothPlugin.cleanCard(devObj, result => {
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					if (callback) {
						callback(errorCode);
					} else {
						_this.$hideLoading();
						_this.$showToast(sdkI18n["clean-card-success"] || "清除卡数据成功");
					}
				} else if (errorCode === 48) {
					_this.$hideLoading();
					_this.$showToast(sdkI18n["clean-card-timeout"] || "清除卡数据超时");
				} else {
					_this.$hideLoading();
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["clean-card-failed"] || "清除卡数据失败") +
						`(${errorCode})`);
				}
			});
		} else {
			_this.$hideLoading();
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持配置设备IP地址功能");
			return;
		}
	}

	//获取设备卡号
	getCardNumbersFromDevice(devObj, callback) {
		let sdkI18n = this.sdkI18n;
		_this.$showLoading();
		if (bluetoothPlugin.getCardNumbersFromDevice) {
			bluetoothPlugin.getCardNumbersFromDevice(devObj, result => {
				_this.$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					if (callback) {
						callback(result);
					}
				} else if (errorCode === 14) {
					_this.$showToast(sdkI18n["no-card"] || "暂无卡数据");
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["read-dev-card-timeout"] || "读取设备卡号超时");
				} else {
					console.log("---读取设备卡号失败---", errorCode);
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["read-dev-card-failed"] ||
						"读取设备卡号失败") + `(${errorCode})`);
				}
			});
		} else {
			_this.$hideLoading();
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持配置设备IP地址功能");
			return;
		}
	}

	// 设置设备蓝牙开锁时长
	setDeviceConfig(devObj, configParam, callback) {
		var manage = _this.$t("manage");
		var sdkI18n = this.sdkI18n;
		_this.$showLoading();
		if (bluetoothPlugin.setDeviceConfig) {
			console.log('配置前');
			console.log(devObj);
			console.log(configParam);
			bluetoothPlugin.setDeviceConfig(devObj, configParam, result => {
				console.log('配置后',sdkI18n);
				_this.$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					_this.$showToast(sdkI18n["set-open-time-success"] || "配置蓝牙开锁时长成功");
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["set-open-time-timeout"] || "配置蓝牙开锁时长超时");
				} else {
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["set-open-time-failed"] ||
						"配置蓝牙开锁时长失败") + `(${errorCode})`);
				}
				callback(errorCode);
			});
		} else {
			_this.$hideLoading();
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持配置设备IP地址功能");
			callback(-1);
		}
	}

	//蓝牙固件升级
	upgradeDevice(devObj, firmwarePath, callback) {
		var manage = _this.$t("manage");
		var sdkI18n = this.sdkI18n;
		if (bluetoothPlugin.upgradeDevice) {
			bluetoothPlugin.upgradeDevice(devObj, firmwarePath, result => {
				console.log("upgradeDevice: ", result);
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					uni.showToast({
						icon: "none",
						title: sdkI18n["firmware-upgrade-finish"] || "升级结束正在检测升级结果",
						duration: 8000
					});
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["firmware-upgrade-timeout"] || "设备蓝牙固件升级超时");
				} else if (this.firmwareUpgradeErrorMsgObj[errorCode]) {
					_this.$showToast(this.firmwareUpgradeErrorMsgObj[errorCode]);
				} else if (errorCode === 3) {
					console.log("errorCode 为 3", result);
				} else if (errorCode === -2) {
					console.log("errorCode 为 -2", result);
				} else if (errorCode !== 2) {
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["firmware-upgrade-failed"] ||
						"设备蓝牙固件升级失败") + `(${errorCode})`);
				}
				if (callback && typeof callback === "function") {
					callback(result);
				}
			});
		} else {
			_this.$hideLoading();
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持配置设备IP地址功能");
			return;
		}
	}

	// 获取设备联网信号值
	getDeviceSignal(devObj, callback) {
		var sdkI18n = this.sdkI18n;
		if (bluetoothPlugin.getDeviceSignal) {
			bluetoothPlugin.getDeviceSignal(devObj, result => {
				var errorCode = result.errorCode;
				if (errorCode === 0) {
					callback(result);
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["get-signal-value-timeout"] || "获取设备联网信号值超时");
				} else {
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["get-signal-value-failed"] ||
						"获取设备联网信号值失败") + `(${errorCode})`);
				}
			});
		} else {
			_this.$hideLoading();
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持获取设备系统信息功能");
			return;
		}
	}

	//设备登记指纹
	deviceRegistFingerprint(devObj, param, callback) {
		var sdkI18n = this.sdkI18n;
		uni.showLoading({
			title: sdkI18n["connecting"] || "正在连接中"
		})
		if (bluetoothPlugin.deviceRegistFingerprint) {
			bluetoothPlugin.deviceRegistFingerprint(devObj, param, result => {
				_this.$showLog("devObj", devObj);
				var errorCode = result.errorCode;
				console.log("结果结果", result.errorCode)
				if (errorCode === 0) {
					callback(result);
				} else if (errorCode === 48) {
					_this.$hideLoading();
					_this.$showToast(sdkI18n["register-fingerprint-timeout"] || "登记指纹数据超时");
				} else if (errorCode === 56) {
					//正在登记
					uni.showLoading({
						title: "录入中"
					})
				} else {
					_this.$hideLoading();
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["register-fingerprint-failed"] ||
						"登记指纹数据失败") + `(${errorCode})`);
				}
			});
		} else {
			_this.$hideLoading();
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持获取设备系统信息功能");
			return;
		}
	}

	//删除指纹
	deleteFingerprints(devObj, param, callback) {
		var sdkI18n = this.sdkI18n;
		uni.showLoading({
			title: sdkI18n["deleting"] || "正在删除"
		})
		if (bluetoothPlugin.deleteFingerprints) {
			bluetoothPlugin.deleteFingerprints(devObj, param, result => {
				var errorCode = result.errorCode;
				if (errorCode === 0) {
					callback(result);
				} else {
					//没有国际化
					_this.$showToast(sdkI18n["del-fingerprint-failed"] || "删除指纹操作失败");
				}
			});
		} else {
			_this.$hideLoading();
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持获取设备系统信息功能");
			return;
		}
	}

	//同步指纹数据, append表示是否追加，若为true，则直接添加指纹，若为false，则先清空再添加
	syncFingerPrintToDevice(devObj, fingerprintList, append, callback) {
		var sdkI18n = this.sdkI18n;
		if (bluetoothPlugin.syncFingerPrintToDevice) {
			bluetoothPlugin.syncFingerPrintToDevice(devObj, fingerprintList, append, result => {
				var errorCode = result.errorCode;
				if (errorCode === 0) {
					callback(result);
				} else if (errorCode === 48) {
					_this.$hideLoading();
					_this.$showToast(sdkI18n["sync-fingerprint-timeout"] || "同步指纹数据超时");
				} else {
					_this.$hideLoading();
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["sync-fingerprint-failed"] ||
						"同步指纹数据失败") + `(${errorCode})`);
				}
			});
		} else {
			_this.$hideLoading();
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持获取设备系统信息功能");
			return;
		}
	}

	//清空指纹
	cleanFingerprints(devObj, callback) {
		console.log('清空方法')
		var sdkI18n = this.sdkI18n;
		if (bluetoothPlugin.cleanFingerprints) {
			_this.$showLoading();
			console.log(666)
			bluetoothPlugin.cleanFingerprints(devObj, result => {
				console.log(7777)
				var errorCode = result.errorCode;
				_this.$hideLoading();
				if (errorCode === 0) {
					callback(result);
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["clean-fingerprint-timeout"] || "清空指纹数据超时");
				} else {
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["clean-fingerprint-failed"] ||
						"清空指纹数据失败") + `(${errorCode})`);
				}
			});
		} else {
			_this.$hideLoading();
			_this.$showToast("清空指纹方法不存在");
			console.log('清空指纹方法不存在')
		}
	}

	// 蓝牙登录，方便蓝牙开门时上传蓝牙开门记录
	bluetoothlogin(account, baseUrl, appId, appSecret) {
		// #ifdef MP-WEIXIN
		mpBluetoothSDK.login(account, baseUrl, appId, appSecret);
		// #endif

		// #ifdef APP-PLUS
		console.log('zsx', account, baseUrl, appId, appSecret)
		if (bluetoothPlugin.loginServer) {
			bluetoothPlugin.loginServer({
				"server": baseUrl,
				"appId": appId,
				"appSecret": appSecret,
				"account": account
			}, (result) => {
				console.log("APP蓝牙登录结果", JSON.stringify(result));
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					console.log("APP蓝牙登录成功");
				} else {
					console.log("APP蓝牙登录失败, 错误码: ", errorCode);
				}
			});
		} else {
			_this.$showToast("当前app不支持蓝牙登录功能");
		}
		// #endif
	}

	// 从设备获取最近开门记录
	getRecentOpenDoorRecordFromDevice(devObj, callback) {
		// 针对门锁设备,蓝牙开门成功后才去读取最近开门记录
		console.log("-----蓝牙开门成功后，设备获取最近开门记录-----");
		let isSupportGetOpenDoorRecord = devObj.isSupportGetOpenDoorRecord;
		console.log("是否支持获取开门记录", isSupportGetOpenDoorRecord);
		if (bluetoothPlugin.getRecentOpenDoorRecordFromDevice) {
			bluetoothPlugin.getRecentOpenDoorRecordFromDevice(devObj, (result) => {
				var errorCode = result.errorCode;
				if (errorCode === 0) {
					console.log("-----从设备获取最近开门记录成功-----");
					if (isSupportGetOpenDoorRecord == 1) {
						let recordList = result.data,
							openByCardRecord = [];
						console.log("获取开门记录列表", JSON.stringify(recordList));
						let openDoorRecord = sdkRequest.filterOpenDoorType(recordList, devObj);
						let networkStatus = _this.$getAppInfo().isConnected;
						console.log("刷卡开门记录列表", openDoorRecord);
						console.log("是否支持联网", networkStatus);
						// 上传刷卡开门记录
						if (networkStatus && openDoorRecord.length > 0) {
							// 移动设备联网
							sdkRequest.addBluetoothOpenDoorRecord(openDoorRecord);
						}
					} else {
						if (callback) {
							callback(result);
						}
					}
				} else if (errorCode === 17) {
					console.log("-----当前设备无记录-----");
					// uni.showModal({
					// 	title: '读取最近开门记录失败',
					// 	content: errorCode
					// })
				} else {
					console.log("-----从设备获取开门记录失败-----", errorCode);
				}
			});
		}
	}

	// 从设备获取所有开门记录
	getOpenDoorRecordFromDevice(devObj, callback) {
		var sdkI18n = this.sdkI18n;
		_this.$showLoading();
		if (bluetoothPlugin.getOpenDoorRecordFromDevice) {
			bluetoothPlugin.getOpenDoorRecordFromDevice(devObj, (result) => {
				var errorCode = result.errorCode;
				_this.$hideLoading();
				if (errorCode === 0) {
					console.log("-----从设备获取所有开门记录成功-----");
					// _this.$showToast("获取所有开门记录成功");
					callback(result);
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["get-timeout"] || "获取所有开门记录超时");
				} else {
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["get-fail"] || "获取所有开门记录失败") +
						`(${errorCode})`);
				}
			});
		} else {
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持从设备获取所有开门记录功能");
		}
	}

	// 配置智能门锁联网模式
	setNBNetworkSetting(devObj, param, callback) {
		var sdkI18n = this.sdkI18n;
		if (bluetoothPlugin.setNBNetworkSetting) {
			_this.$showLoading(sdkI18n["configuration"] || "正在配置中");
			bluetoothPlugin.setNBNetworkSetting(devObj, param, (result) => {
				var errorCode = result.errorCode;
				_this.$hideLoading();
				if (errorCode === 0) {
					console.log("======配置智能门锁联网模式成功======");
					_this.$showToast(sdkI18n["successfully-configured"] || "配置成功");
					callback(result);
				} else if (errorCode === 48) {
					_this.$showToast(sdkI18n["timeout-configured"] || "配置超时");
				} else {
					_this.$showToast(this.btCode[errorCode] || (sdkI18n["failed-configured"] ||
						"配置失败，错误码：") + `(${errorCode})`);
				}
			});
		} else {
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持配置联网模式功能");
		}
	}

	// 获取sim卡信息
	getSimstatus(devObj, callback) {
		let homeInfo = uni.getStorageSync("homeInfo");
		var sdkI18n = this.sdkI18n;
		if (bluetoothPlugin.getSimstatus) {
			if(!homeInfo.isUploadSimByOpenDoor) _this.$showLoading(sdkI18n['card-reading']);
			bluetoothPlugin.getSimstatus(devObj, (result) => {
				console.log('获取sim',result,6666)
				var errorCode = result.errorCode;
				_this.$hideLoading();
				if (errorCode === 0) {
					console.log("======获取sim卡信息成功======");
					callback(result);
				} else if (errorCode === 48) {
					if(!homeInfo.isUploadSimByOpenDoor) _this.$showToast(sdkI18n["get-timeout"] || "获取sim卡信息超时");
				} else {
					if(!homeInfo.isUploadSimByOpenDoor) _this.$showToast(this.btCode[errorCode] || (sdkI18n["get-fail"] || "获取sim卡信息失败，错误码：") +
						`(${errorCode})`);
				}
			});
		} else {
			_this.$showToast(sdkI18n["no-support"] || "当前app不支持获取sim卡信息功能");
		}
	}
}

var bluetoothSDKUtil = new BluetoothSDKUtil();

// 音视频SDK工具类
class VPhoneSDKUtil {
	constructor(arg) {
		this.errMsgObj = {};
		this.sdkI18n = {};
		this.configParam = {};
	}

	init() {
		var common = _this.$t("common");
		this.sdkI18n = _this.$t("sdk");
		// this.errMsgObj = {
		// 	// 安卓音视频SDK特有错误码
		// 	"1": common["port-error"] || "失败（本地端口异常）",
		// 	"2": common["token-error"] || "Token错误",
		// 	"3": common["login-data-processing-failed"] || "登录数据处理失败",
		// 	"4": common["net-error"] || "网络错误",
		// 	"9": common["video-error"] || "音视频注册失败",
		// 	"601": common["services-have-been-destroyed"] || "音视频服务已销毁",
		// 	"802": common["cameraId"] || "参数 cameraId 错误",
		// 	"803": common["video-rotation"] || "参数 videoRotation 错误，角度错误：角度范围 0~360",
		// 	"804": common["video-size"] || "参数 videoSize 错误,需传入字符串：720p、vga、qvga、qcif",
		// 	"805": common["uninit"] || "未初始化错误",
		// 	"806": common["login-error"] || "未登录错误",
		// 	"807": common["call-status"] || "不在通话状态",
		// 	"808": common["unsupported-audio-and-video-formats"] || "不支持的音视频格式",
		// 	"809": common["context-is-empty"] || "Context为空",
		// 	"811": common["invalid-heartbeat-interval"] || "无效的心跳间隔",
		// 	"812": common["local-port-error"] || "本地端口错误",
		// 	"820": common["service"] || "服务未准备",
		// 	"821": common["no-account"] || "当前设备没有对讲账号",
		// 	"822": common["not-bound-video-communication-account"] || "登录账号未绑定视频通讯帐号",
		// 	"823": common["cpu-architecture-does-not-support"] || "CPU架构不支持",
		// 	"824": common["parameter-error"] || "参数错误",
		// 	"826": common["door-open-timeout"] || "开门超时",
		// 	"999": common["unknown"] || "未知错误",
		// 	// ios音视频SDK特有错误码
		// 	"-1": common["initialization-interface-has-not-been-called"] || "尚未调用初始化接口",
		// 	"-2": common["wrong-account-name-or-password"] || "登录失败，账户名或者密码错误",
		// 	"-3": common["calling-account-cannot-be-empty"]|| "呼叫账号不能为空",
		// 	"-4": common["call-account-is-offline"] || "呼叫账户不在线",
		// 	"-5": common["no-incoming-call"] || "当前无来电通话，不能 接听/挂断/开门",
		// 	"-6": common["opening-failure"] || "开门失败，无响应",
		// 	"-7": common["set-account-list-white-list"] || "设置的账户列表--白名单，不能为空",
		// 	"-8": common["voip-is-empty"] || "VOIP 为空",
		// 	"-9": common["wrong-input-information"] || "输入信息有误",
		// 	"-10": common["can't-call-yourself"] || "不能呼叫自己",
		// 	"-11": common["no-network-connection"] || "无网络连接",
		// 	"-12": common["login-failed"] || "登陆失败",
		// 	"-13": common["incoming-parameter-format-error"] || "传入参数格式错误",
		// 	"-14": common["blacklist-requires-login-first"] || "设置黑名单需先登陆",
		// 	"-15": common["failed-to-set-blacklist"] || "设置黑名单失败",
		// 	"-16": common["call-is-initializing"] || "通话正在初始化，请稍后再拨",
		// 	"-17": common["refuses-to-use"] || "用户拒绝在 2G/3G/4G 环境下使用通话功能",
		// 	"-18": common["no-call-monitoring-has-been-added"] || "尚未添加来电监听",
		// 	// 安卓音视频SDK、ios音视频SDK共有错误码
		// 	"825": common["accessToken-is-empty"] || "AccessToken为空"
		// };
	}

	getErrMsgObj() {
		var common = _this.$t("common");
		return {
			// 安卓音视频SDK特有错误码
			"1": common["port-error"] || "失败（本地端口异常）",
			"2": common["token-error"] || "Token错误",
			"3": common["login-data-processing-failed"] || "登录数据处理失败",
			"4": common["net-error"] || "网络错误",
			"9": common["video-error"] || "音视频注册失败",
			"601": common["services-have-been-destroyed"] || "音视频服务已销毁",
			"802": common["cameraId"] || "参数 cameraId 错误",
			"803": common["video-rotation"] || "参数 videoRotation 错误，角度错误：角度范围 0~360",
			"804": common["video-size"] || "参数 videoSize 错误,需传入字符串：720p、vga、qvga、qcif",
			"805": common["uninit"] || "未初始化错误",
			"806": common["login-error"] || "未登录错误",
			"807": common["call-status"] || "不在通话状态",
			"808": common["unsupported-audio-and-video-formats"] || "不支持的音视频格式",
			"809": common["context-is-empty"] || "Context为空",
			"811": common["invalid-heartbeat-interval"] || "无效的心跳间隔",
			"812": common["local-port-error"] || "本地端口错误",
			"820": common["service"] || "服务未准备",
			"821": common["no-account"] || "当前设备没有对讲账号",
			"822": common["not-bound-video-communication-account"] || "登录账号未绑定视频通讯帐号",
			"823": common["cpu-architecture-does-not-support"] || "CPU架构不支持",
			"824": common["parameter-error"] || "参数错误",
			"826": common["door-open-timeout"] || "开门超时",
			"999": common["unknown"] || "未知错误",
			"10000": common["devsn-not-null"] || "设备序列号不能为空",
			// ios音视频SDK特有错误码
			"-1": common["initialization-interface-has-not-been-called"] || "尚未调用初始化接口",
			"-2": common["wrong-account-name-or-password"] || "登录失败，账户名或者密码错误",
			"-3": common["calling-account-cannot-be-empty"] || "呼叫账号不能为空",
			"-4": common["call-account-is-offline"] || "呼叫账户不在线",
			"-5": common["no-incoming-call"] || "当前无来电通话，不能 接听/挂断/开门",
			"-6": common["opening-failure"] || "开门失败，无响应",
			"-7": common["set-account-list-white-list"] || "设置的账户列表--白名单，不能为空",
			"-8": common["voip-is-empty"] || "VOIP 为空",
			"-9": common["wrong-input-information"] || "输入信息有误",
			"-10": common["can't-call-yourself"] || "不能呼叫自己",
			"-11": common["no-network-connection"] || "无网络连接",
			"-12": common["login-failed"] || "登陆失败",
			"-13": common["incoming-parameter-format-error"] || "传入参数格式错误",
			"-14": common["blacklist-requires-login-first"] || "设置黑名单需先登陆",
			"-15": common["failed-to-set-blacklist"] || "设置黑名单失败",
			"-16": common["call-is-initializing"] || "通话正在初始化，请稍后再拨",
			"-17": common["refuses-to-use"] || "用户拒绝在 2G/3G/4G 环境下使用通话功能",
			"-18": common["no-call-monitoring-has-been-added"] || "尚未添加来电监听",
			// 安卓音视频SDK、ios音视频SDK共有错误码
			"825": common["accessToken-is-empty"] || "AccessToken为空"
		};
	}

	// 初始化vphone
	initDMVPhoneSDK(appName) {
		uni.debugLog("initDMVPhoneSDK调用状态", "有调用初始化vphone(initDMVPhoneSDK)方法");
		this.configParam = _this.$getConfigParam();
		if (vphonePlugin.initDMVPhoneSDK) {
			/**
			 *  对讲服务器地址由应用服务器分配。initDMVPhoneSDK接口参数由原来的3个改回1个，只需要填应用服务器地址即可
			 *  新的音视频对讲SDK实现了由应用服务器动态分配下发音视频服务器地址给新的音视频对讲SDK，让达管家APP登录账号能动态登录音视频对讲服务器，解决卡顿的问题。
			 */
			vphonePlugin.initDMVPhoneSDK(this.configParam.baseUrl);
		} else {
			_this.$showToast(this.sdkI18n["not-support-initializing-audio-and-video-servers"] ||
				"当前app不支持初始化音视频服务器");
		}
	}

	// 登录音视频服务器 (loginType=1,account为手机号,loginType=2,account设备序列号,呼叫时呼叫端和被呼叫端都需登录音视频服务器)
	loginVPhoneServer(account) {
		// var _this = this;
		var sdkI18n = this.sdkI18n;
		if (vphonePlugin.loginVPhoneServer) {
			console.log("123");
			var errorMsgObj = this.getErrMsgObj();
			var obj = {
				"account": account,
				"appId": this.configParam.appId,
				"appSecret": this.configParam.appSecret,
				"loginType": 1,
				"vphoneServerIp": this.configParam.vphoneServerIp,
				"vphoneServerPort": this.configParam.vphoneServerPort
			};

			vphonePlugin.loginVPhoneServer(obj, res => {
				var errorMsg = sdkI18n["login-video-fail"] || "当前登录音视频服务器失败";
				var errorCode = res.errorCode;
				if (errorCode == 0) {
					console.log("当前登录音视频服务器成功", "res============", res);
				} else {
					console.log("当前登录音视频服务器失败", "res============", res);
					for (var i in errorMsgObj) {
						if (i == errorCode) {
							errorMsg = errorMsgObj[i];
							break;
						}
					}
					_this.$showToast(errorMsg + "(" + errorCode + ")");
				}
			});
		} else {
			_this.$showToast(sdkI18n["not-support-logging-in-to-the-audio-and-video-server"] || "当前app不支持登录音视频服务器");
		}
	}

	// 呼叫 callType为1时，表示callAccount是手机账号，callType为2时，表示callAccount是设备序列号
	callAccount(callAccount, callType, account, name) {
		var common = _this.$t("common");
		if (vphonePlugin.callAccount) {
			var errorMsgObj = this.getErrMsgObj();
			_this.$showLoading();
			vphonePlugin.callAccount(callAccount, callType, account, name, result => {
				_this.$hideLoading();
				var errorCode = result.errorCode;
				var errorMsg = _this.$t("common")["call-fail"] || "呼叫失败";
				if (errorCode !== 0) {
					for (var i in errorMsgObj) {
						if (i == errorCode) {
							errorMsg = errorMsgObj[i];
							break;
						}
					}
					_this.$showToast(errorMsg + "(" + errorCode + ")");
				}
			});
		} else {
			_this.$showToast(sdkI18n["app-does-not-support-calling"] || "当前app不支持呼叫");
		}
	}

	// 添加设备到黑名单列表，account为设备序列号，accountType为2
	addAccountToBlackList(account, accountType, callback) {
		var sdkI18n = this.sdkI18n;
		if (vphonePlugin.addAccountToBlackList) {
			_this.$showLoading();
			vphonePlugin.addAccountToBlackList(account, accountType, result => {
				_this.$hideLoading();
				var errorCode = result.errorCode;
				var errorMsg = errorCode == 0 ? (_this.$t("common")["add-blacklist-success"] || "添加黑名单成功") :
					(_this.$t("common")["add-blacklist-fail"] || "添加黑名单失败");
				_this.$showToast(errorMsg);
				if (result.errorCode == 0) {
					callback(result);
				}
			});
		} else {
			_this.$showToast(sdkI18n["does-not-support-adding-blacklist"] || "当前app不支持添加黑名单");
		}
	}

	// 将设备从黑名单列表中移除
	removeAccountFromBlackList(account, callback) {
		var sdkI18n = this.sdkI18n;
		if (vphonePlugin.removeAccountFromBlackList) {
			_this.$showLoading();
			vphonePlugin.removeAccountFromBlackList(account, result => {
				_this.$hideLoading();
				var errorCode = result.errorCode;
				var errorMsg = errorCode == 0 ? (_this.$t("common")["remove-blacklist-success"] ||
					"移除黑名单成功") : (_this.$t("common")["remove-blacklist-fail"] || "移除黑名单失败");
				_this.$showToast(errorMsg);
				if (result.errorCode == 0) {
					callback(result);
				}
			});
		} else {
			_this.$showToast(sdkI18n["does-not-support-removing-the-blacklist"] || "当前app不支持移除黑名单");
		}
	}

	// 获取设备黑名单列表
	getBlackList(callback) {
		if (vphonePlugin.getBlackList) {
			_this.$showLoading();
			vphonePlugin.getBlackList(result => {
				_this.$hideLoading();
				var errorCode = result.errorCode;
				if (errorCode == 0) {
					callback(result);
				} else {
					_this.$showToast((_this.$t("common")["get-blacklist-fail"] || "获取黑名单列表失败"));
				}
			});
		} else {
			// 不支持获取黑名单列表
			// callback(result);
		}
	}

	// 退出音视频服务器
	exitVPhoneServer() {
		var sdkI18n = this.sdkI18n;
		if (vphonePlugin.exitVPhoneServer) {
			vphonePlugin.exitVPhoneServer();
		} else {
			_this.$showToast(sdkI18n["does-not-support-exiting-the-audio-and-video-server"] || "当前app不支持退出音视频服务器");
		}
	}
}

var vphoneSDKUtil = new VPhoneSDKUtil();


/**
 *  推送
 *  新的推送SDK，集成了国内的各大推送平台（华为、小米、OPPO、VIVO、魅族、个推）以及谷歌推送（FCM）。至于苹果端推送(APNS)则被集成到苹果端音视频对讲SDK
 *  新的推送SDK处理手机语言在简体中文的情况下，根据手机的型号由相应的推送平台推送消息给达管家APP。（如华为手机由华为推送平台推送消息，当非简体中文情况下，由谷歌推送平台推送消息）
 */
class PushSDKUtil {
	constructor(arg) {

	}

	init() {
		if (platform && platform.indexOf("ios") === -1) {
			_this.$showLog("初始化推送当前运行环境", platform);
			pushPlugin.initPushSDK();
		}
	}

	registerPushSDK(account) {
		if (pushPlugin.registerPushSDK) {
			pushPlugin.registerPushSDK(account);
		}
	}

	addPushListener() {
		if (pushPlugin.addPushListener) {
			pushPlugin.addPushListener(res => {
				console.log("推送监听: " + JSON.stringify(res));
				// _this.$showToast("推送监听: " + JSON.stringify(res));
				if ("token" in res) {
					let token = res.token;
					if (res.brands?.toLowerCase().indexOf("ios") > -1) {
						// 苹果推送
						_this.$editUserInfo("apnsToken", token);
					} else {
						_this.$editUserInfo("pushToken", token);
						vphonePlugin.setPushToken(res.brands, res.token);
					}
					_this.$showLog("setPushToken开始上传", "token: " + res.token);
					_this.$showLog("当前用户的访问令牌", "token: " + _this.$getUserInfo().accessToken);
				}
				if (res.url) {
					let jumpUrl = decodeURIComponent(res.url);
					// let jumpDecodeUrl = decodeURI(jumpUrl);
					// let jumpDecodeComponentUrl = decodeURIComponent(jumpUrl);
					console.log("jumpUrl: " + jumpUrl);
					if (jumpUrl.indexOf("http") === -1) {
						// 默认打开应用内页
						uni.navigateTo({
							url: jumpUrl
						});
					} else if (jumpUrl.indexOf("http") > -1) {
						// 打开应用内网页链接
					}
				} 
				else {
					_this.$showLog("音视频对讲插件调用receivePushNotification方法");
					vphonePlugin.receivePushNotification(JSON.stringify(res));
				}
				
				// if (res.url && res.url.indexOf("http") === -1) {
				// 	uni.navigateTo({
				// 		url: res.url
				// 	});
				// }
			});
		} else {
			_this.$showToast("当前app不支持推送监听");
		}
	}
}

let pushSDKUtil = new PushSDKUtil();

// SDK工具类
class SDKUtil {
	constructor(arg) {
		// 手机蓝牙开门声音
		this.openDoorAudio = uni.createInnerAudioContext();
		this.openDoorAudio.src = "/static/audio/open-door.wav";
		this.platform = uni.getSystemInfoSync().platform.toLowerCase();
		this.sdkI18n = null;
	}

	init() {
		// #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY
		bluetoothSDKUtil.init();
		// #endif
		// #ifdef APP-PLUS
		// vphoneSDKUtil.init();
		// pushSDKUtil.init();
		// #endif

		// this.sdkI18n = bluetoothSDKUtil.sdkI18n;
	}

	// // 获取app参数，该方法本来主要用于判断当前app是否处于debugger版本还是release版本，如果是debugger版本，则开放切换服务器地址功能（如切换开发环境、测试环境、生产环境），release版本不支持，不过这个方法和下边的获取系统信息可以合并起来，用一个方法就行了
	// getAppParam(callback) {
	// 	var configParam = _this.$getConfigParam();
	// 	var appParam = {
	// 		"envType": configParam.envType,
	// 		"currAppName": configParam.appName,
	// 		"isDebug": configParam.isDebug,
	// 	};
	// 	// #ifdef APP-PLUS
	// 	if (this.platform.indexOf("android") > -1) {
	// 		// 该app是安卓
	// 		if (plugin.getAppParam) {
	// 			plugin.getAppParam(result => {
	// 				if (result.errorCode === 0) {
	// 					callback(result.data);
	// 				}
	// 			});
	// 		} else {
	// 			callback(appParam);
	// 		}
	// 	} else {
	// 		callback(appParam);
	// 	}
	// 	// #endif
	// }

	// 获取系统信息
	getSystemInfo(callback) {
		// #ifdef APP-PLUS
		if (plugin.getSystemInfo) {
			plugin.getSystemInfo(result => {
				callback(result);
			});
		} else {
			// _this.$showToast("当前app不支持获取系统信息");
		}
		// #endif
	}

	readEID(devObj, callback) {
		// #ifdef APP-PLUS
		bluetoothSDKUtil.readEID(devObj, callback);
		// #endif
	}

	// 获取系统语言
	getSystemLanguage(callback) {
		// #ifdef APP-PLUS
		if (sysLanguagePlugin.getSystemLanguage) {
			sysLanguagePlugin.getSystemLanguage(result => {
				callback(result);
				// if (result.errorCode === 0) {
				// 	let sysLanguage = result.data.language;
				// 	callback(sysLanguage);
				// }
			})
		}
		// #endif
	}

	// 蓝牙登录，主要为后边蓝牙开门上传开门记录
	bluetoothlogin(account, baseUrl, appId, appSecret) {
		// #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY
		bluetoothSDKUtil.bluetoothlogin(account, baseUrl, appId, appSecret);
		// #endif
	}

	//蓝牙扫描周边设备
	bluetoothScanNearDevice(callback) {
		// #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY
		// 调用bluetoothOpenDoorUtil的bluetoothScanNearDevice方法
		bluetoothSDKUtil.bluetoothScanNearDevice(callback);
		// #endif
	}

	// 蓝牙扫描（有权限设备）
	bluetoothScanDevice(permissionDeviceList, callback) {
		// #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY
		// 调用bluetoothOpenDoorUtil的bluetoothScanDevice方法
		bluetoothSDKUtil.bluetoothScanDevice(permissionDeviceList, callback);
		// #endif
	}

	// 蓝牙一键开门
	bluetoothOneKeyOpenDoor(param, callback = undefined) {
		// #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY
		bluetoothSDKUtil.bluetoothOneKeyOpenDoor(param, callback);
		// #endif
	}

	// 近场开门, 调用原生近场开门
	openNearField(param) {
		// #ifdef APP-PLUS
		bluetoothSDKUtil.openNearField(param);
		// #endif
	}

	// 蓝牙近场开门，前端定时器
	bluetoothOpenDoorNearField() {
		// #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY
		bluetoothSDKUtil.bluetoothOpenDoorNearField();
		// #endif
	}

	// 向原生传递设备列表
	sendDevListToNative(param) {
		// #ifdef APP-PLUS
		bluetoothSDKUtil.sendDevListToNative(param);
		// #endif
	}

	// 蓝牙开门
	bluetoothOpenDoor(device, callback = undefined) {
			// #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY
								// 调用bluetoothOpenDoorUtil的bluetoothOpenDoor方法
			 bluetoothSDKUtil.bluetoothOpenDoor(device, undefined, undefined, callback);
		 // #endif
	}

	// 配置通讯参数
	configCommunicationParams(device, param) {
		// #ifdef APP-PLUS
		// 调用configCommunicationParams方法
		bluetoothSDKUtil.configCommunicationParams(device, param);
		// #endif
	}

	// 配置APN
	setAPNSetting(device, param,callback) {
		// #ifdef APP-PLUS
		// 调用setAPN方法
		bluetoothSDKUtil.setAPNSetting(device, param, callback);
		// #endif
	}

	// 读取APN
	getAPNSetting(device, callback) {
		// #ifdef APP-PLUS
		// 调用getAPNSetting方法
		bluetoothSDKUtil.getAPNSetting(device, callback);
		// #endif
	}

	// 蓝牙配置wifi(已废弃)
	configWifi(device, param) {
		// #ifdef APP-PLUS
		// 调用configWifi方法
		bluetoothSDKUtil.configWifi(device, param);
		// #endif
	}

	// 配置读卡扇区密钥
	setReadSectorKey(device, param) {
		// #ifdef APP-PLUS
		// 调用setReadSectorKey方法
		bluetoothSDKUtil.setReadSectorKey(device, param);
		// #endif
	}

	// 配置设备IP地址
	setDeviceStaticIP(device, param) {
		// #ifdef APP-PLUS
		// 调用setDeviceStaticIP方法
		bluetoothSDKUtil.setDeviceStaticIP(device, param);
		// #endif
	}

	// 配置设备紧急开门密码
	modifyPwd(device, param , callback) {
		// #ifdef APP-PLUS
		// 调用modifyPwd方法
		bluetoothSDKUtil.modifyPwd(device, param , callback);
		// #endif
	}

	// 登记指纹
	deviceRegistFingerprint(device, param, callback) {
		// #ifdef APP-PLUS
		// 调用deviceRegistFingerprint方法
		bluetoothSDKUtil.deviceRegistFingerprint(device, param, callback);
		// #endif
	}
	// 删除指纹
	deleteFingerprints(device, param, callback) {
		// #ifdef APP-PLUS
		// 调用deleteFingerprints方法
		bluetoothSDKUtil.deleteFingerprints(device, param, callback);
		// #endif
	}

	// 同步指纹数据到设备
	syncFingerPrintToDevice(device, param, append, callback) {
		// #ifdef APP-PLUS
		// 调用syncFingerPrintToDevice方法
		bluetoothSDKUtil.syncFingerPrintToDevice(device, param, append, callback);
		// #endif
	}

	// 清空指纹数据
	cleanFingerprints(device, callback) {
		// #ifdef APP-PLUS
		// 调用cleanFingerprints方法
		bluetoothSDKUtil.cleanFingerprints(device, callback);
		// #endif
	}

	// 同步设备时间
	syncDeviceTime(device, param, callback) {
		// #ifdef APP-PLUS
		// 调用syncDeviceTime方法
		bluetoothSDKUtil.syncDeviceTime(device, param, callback);
		// #endif
	}

	// 获取设备系统信息
	getDeviceConfig(device, callback) {
		// #ifdef APP-PLUS
		// 调用getDeviceConfig方法
		bluetoothSDKUtil.getDeviceConfig(device, callback);
		// #endif
	}

	// 获取设备联网信号值
	getDeviceSignal(device, callback) {
		// #ifdef APP-PLUS
		// 调用getDeviceSignal方法
		bluetoothSDKUtil.getDeviceSignal(device, callback);
		// #endif
	}

	// 重置设备系统信息
	resetDeviceConfig(device, callback) {
		// #ifdef APP-PLUS
		// 调用syncDeviceTime方法
		bluetoothSDKUtil.resetDeviceConfig(device, callback);
		// #endif
	}

	// 通过手机蓝牙获取到放置在该设备上的卡的卡号
	getSwipeAddCardno(devObj, callback) {
		// #ifdef APP-PLUS || H5
		bluetoothSDKUtil.getSwipeAddCardno(devObj, callback);
		// #endif
	}

	//删卡
	deleteCard(device, param, callback) {
		// #ifdef APP-PLUS
		// 调用deleteCard方法
		bluetoothSDKUtil.deleteCard(device, param, callback);
		// #endif
	}

	//写卡
	writeCard(device, param, append, callback) {
		// #ifdef APP-PLUS
		// 调用writeCard方法
		bluetoothSDKUtil.writeCard(device, param, append, callback);
		// #endif
	}

	//旧版刷卡添卡
	swipeAddCardModel(device, callback) {
		// #ifdef APP-PLUS
		// 调用swipeAddCardModel方法
		bluetoothSDKUtil.swipeAddCardModel(device, callback);
		// #endif
	}

	//旧版退出刷卡添卡模式
	existSwipeCardAddModel(device, callback) {
		// #ifdef APP-PLUS
		// 调用existSwipeCardAddModel方法
		bluetoothSDKUtil.existSwipeCardAddModel(device, callback);
		// #endif
	}

	//旧版退出刷卡删卡模式
	existSwipeCardDeleteModel(device, callback) {
		// #ifdef APP-PLUS
		// 调用existSwipeCardDeleteModel方法
		bluetoothSDKUtil.existSwipeCardDeleteModel(device, callback);
		// #endif
	}

	//旧版刷卡删卡模式
	swipeCardDeleteModel(device, callback) {
		// #ifdef APP-PLUS
		// 调用swipeCardDeleteModel方法
		bluetoothSDKUtil.swipeCardDeleteModel(device, callback);
		// #endif
	}

	//读取设备卡号
	getCardNumbersFromDevice(device, callback) {
		// #ifdef APP-PLUS
		// 调用writeCard方法
		bluetoothSDKUtil.getCardNumbersFromDevice(device, callback);
		// #endif
	}

	//清空设备卡数据
	cleanCard(device, callback) {
		// #ifdef APP-PLUS
		// 调用cleanCard方法
		bluetoothSDKUtil.cleanCard(device, callback);
		// #endif
	}

	//配置蓝牙开门开锁时长
	setDeviceConfig(device, param, callback) {
		// #ifdef APP-PLUS
		// 调用setDeviceConfig方法
		bluetoothSDKUtil.setDeviceConfig(device, param, callback);
		// #endif
	}

	//从设备获取最近蓝牙开门记录
	getRecentOpenDoorRecordFromDevice(device, callback) {
		// #ifdef APP-PLUS
		// 调用getRecentOpenDoorRecordFromDevice方法
		bluetoothSDKUtil.getRecentOpenDoorRecordFromDevice(device, callback);
		// #endif
	}

	//从设备获取所有蓝牙开门记录
	getOpenDoorRecordFromDevice(device, callback) {
		// #ifdef APP-PLUS
		// 调用getRecentOpenDoorRecordFromDevice方法
		bluetoothSDKUtil.getOpenDoorRecordFromDevice(device, callback);
		// #endif
	}

	//蓝牙固件升级
	upgradeDevice(device, param, callback) {
		// #ifdef APP-PLUS
		// 调用setDeviceConfig方法
		bluetoothSDKUtil.upgradeDevice(device, param, callback);
		// #endif
	}

	// 配置智能门锁联网模式
	setNBNetworkSetting(device, param, callback) {
		// #ifdef APP-PLUS
		bluetoothSDKUtil.setNBNetworkSetting(device, param, callback);
		// #endif
	}

	getSimstatus(device, callback) {
		// #ifdef APP-PLUS
		bluetoothSDKUtil.getSimstatus(device, callback);
		// #endif
	}

	// 开门播放开门声音
	openDoorAduioPlay() {
		this.openDoorAudio = uni.createInnerAudioContext();
		this.openDoorAudio.autoplay = true;
		this.openDoorAudio.src = "/static/audio/open-door.wav";
		this.openDoorAudio.onPlay(() => {
			console.log('开始播放');
		});
	}

	// 消息推送
	pushMessage(callback) {
		// #ifdef APP-PLUS
		if (plugin.pushMessage) {
			plugin.pushMessage(result => {
				callback(result);
			});
		} else {
			// _this.$showToast("当前app不支持普通消息推送功能");
		}
		// #endif
	}

	// 初始化vphone
	initDMVPhoneSDK(appName) {
		// #ifdef APP-PLUS
		vphoneSDKUtil.initDMVPhoneSDK(appName);
		// #endif
	}

	// 登录vphone
	loginVPhoneServer(account) {
		// #ifdef APP-PLUS
		vphoneSDKUtil.loginVPhoneServer(account);
		// #endif
	}

	// 退出vphone
	exitVPhoneServer() {
		// #ifdef APP-PLUS
		vphoneSDKUtil.exitVPhoneServer();
		// #endif
	}

	// 呼叫 callType为1时，表示callAccount是手机账号，callType为2时，表示callAccount是设备序列号
	callAccount(callAccount, callType, account, name) {
		// #ifdef APP-PLUS
		vphoneSDKUtil.callAccount(callAccount, callType, account, name);
		// #endif
	}

	// 加入黑名单列表，在呼叫列表中可拦截来电请求
	addAccountToBlackList(account, accountType, callback) {
		// #ifdef APP-PLUS
		vphoneSDKUtil.addAccountToBlackList(account, accountType, callback);
		// #endif
	}

	// 将设备从黑名单列表中移除
	removeAccountFromBlackList(account, callback) {
		// #ifdef APP-PLUS
		vphoneSDKUtil.removeAccountFromBlackList(account, callback);
		// #endif
	}

	// 获取设备黑名单列表
	getBlackList(callback) {
		// #ifdef APP-PLUS
		vphoneSDKUtil.getBlackList(callback);
		// #endif
	}

	// 获取wifi列表
	getWifiList(callback) {
		var sdkI18n = this.sdkI18n;
		// #ifdef APP-PLUS

		// var Context = plus.android.importClass("android.content.Context");  
		// var WifiManager = plus.android.importClass("android.net.wifi.WifiManager");  
		// var wifiManager = plus.android.runtimeMainActivity().getSystemService(Context.WIFI_SERVICE);  
		// var List = plus.android.importClass("java.util.List");  
		// var ArrayList = plus.android.importClass("java.util.ArrayList");  
		// var ScanResult = plus.android.importClass("android.net.wifi.ScanResult");     
		// var wifis = new ArrayList();  
		// wifis = wifiManager.getScanResults();  
		// console.log("wifis", wifis);
		if (bluetoothPlugin.getWifiList) {
			_this.$showLoading();
			var systemInfo = _this.$getAppInfo().systemInfo;
			bluetoothPlugin.getWifiList(result => {
				var data = result.data;
				if (data !== undefined && _this.$isArray(data)) {
					if (data.length > 0) {
						data.sort(function(a, b) {
							return b.level - a.level
						});
					} else if (systemInfo.platform.indexOf("android") > -1 && _this.$parseFloat(systemInfo
							.system) >= 6) {
						// 安卓6及以上，获取wifi需要定位权限
						_this.$showToast(sdkI18n["cannot-scan-any-wifi-location"] ||
							"扫描不到任何wifi，请确保定位权限开启");
					} else {
						_this.$showToast(sdkI18n["cannot-scan-any-wifi"] || "扫描不到任何wifi");
					}
				} else {
					_this.$showToast(sdkI18n["cannot-scan-any-wifi"] || "扫描不到任何wifi");
				}
				_this.$hideLoading();
				callback(result);
			});
		} else {
			_this.$showToast(sdkI18n["does-not-support-wifi-search-function"] || "当前app不支持wifi搜索功能");
		}
		// #endif

	}

	/**
	 * 推送模块
	 */
	registerPushSDK(account) {
		// #ifdef APP-PLUS
		if (platform && platform.indexOf("ios") === -1) {
			_this.$showLog("当前运行环境", platform);
			_this.$showLog("当前注册推送账号", account);
			pushSDKUtil.registerPushSDK(account);
		}
		// #endif
	}

	addPushListener() {
		// #ifdef APP-PLUS
		pushSDKUtil.addPushListener();
		// #endif
	}
}

var sdkUtil = new SDKUtil();
module.exports = sdkUtil;
