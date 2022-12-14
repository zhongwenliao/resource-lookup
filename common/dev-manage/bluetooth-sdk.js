/**
 * @file: uniapp层调用蓝牙SDK插件方法的文件
 * @description: uniapp层调用蓝牙SDK插件方法
 * @author: xxx
 * @createDate: xxx
 * @copyright: xxx公司
 */
// 引入Vue
import Vue from "vue";
// 引入权限工具
import PermissionUtil from "./permission.js";

// 当前的操作平台
const PLATFORM = uni.getSystemInfoSync().platform.toLowerCase();

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

// #ifndef APP-PLUS
const BLUETOOTH_PLUGIN_SDK = {};
// #endif

// 蓝牙插件SDK操作状态码字典(含Android蓝牙插件SDK操作状态码和iOS蓝牙插件SDK操作状态码)
const STATUS_CODE_DICT = {
	// Android蓝牙插件SDK操作状态码
	"0": "操作成功",
	"1": "CRC校验错误",
	"2": "通信命令格式错误",
	"3": "设备旧密码错误",
	"4": "ERROR_POWER(仅适用于锁)",
	"5": "数据读写错误",
	"6": "用户未注册在设备中",
	"7": "随机数检测错误",
	"8": "获取随机数错误",
	"9": "命令长度不匹配",
	"10": "未进入添加设备模式",
	"11": "devKey检测错误",
	"12": "功能不支持",
	"13": "容量超过限制",
	"48": "通信连接超时",
	"49": "蓝牙服务未发现",
	"50": "通信数据长度错误，重新添加",
	"51": "接受数据为空",
	"52": "命令解析错误",
	"53": "未获取到随机数",
	"54": "未获取到配置子命令",
	"55": "未获取数据操作子命令",
	"56": "录入中",
	"57": "指纹登记失败",
	"58": "指纹已满",
	"59": "接收指纹模组数据超时",
	"60": "采集指纹信息超时",
	"61": "指纹已存在",
	"806": "当前账号未登录音视频服务器，请重新登录",
	// iOS蓝牙插件SDK操作状态码
	"-1": "卡号为空",
	"-2": "Sn为空",
	"-3": "Mac为空",
	"-4": "E-Key为空",
	"-5": "设备类型为空",
	"-6": "设备权限为空",
	"-7": "开门方式值错误",
	"-8": "验证方式值错误",
	"-9": "起始时间格式错误",
	"-10": "冻结时间格式错误",
	"-11": "使用次数未设置",
	"-12": "值未定义",
	"-13": "operation其他功能未开放",
	"-14": "非法时间开门，即不在有效期内开门错误",
	"-15": "超过设置的开门距离",
	"-16": "韦根格式错误，当前仅支持26和34",
	"-17": "开门时长值范围错误，仅支持1-254秒",
	"-18": "电器开关参数值错误，仅支持 0 电锁控制，1 电器开关",
	"-19": "密码必须为 6 位数字",
	"-20": "卡号列表不能为空",
	"-21": "卡号写入设备，每次不能大于 200 张卡",
	"-22": "扇区密钥必须是 16 进制字符串，并且长度为 12",
	"-23": "设备编号范围只能是 0-255",
	"-24": "卡扇区编号范围只能是 0-15",
	"-25": "scanTime 参数不能为空",
	"-41": "device 不能为 null",
	"-42": "context 不能为 null",
	"-43": "Device 过期",
	"-44": "Device 未到使用时间",
	"-100": "不支持 BLE",
	"-101": "BLE 未打开",
	"-102": "指定的 SN 不存在",
	"-103": "蓝牙通信返回值为空",
	"-104": "开门失败",
	"-105": "设备未反应",
	"-106": "设备不在附近",
	"-107": "设备正在操作中",
	"-108": "sec 扫描时间单位错误",
	"-109": "设置扫描秒数超出范围",
	"-110": "设备已经存在超级用户，必须先初始化设备才能添加设备",
	"-111": "设备 MAC 地址错误",
	"-112": "使用蓝牙扫描太频繁（Android 7.0 的限制）",
	"-10000": "操作失败",
	// 蓝牙插件SDK操作通用状态码
	"14": "暂无卡数据",
	"17": "当前设备无最近开门记录"
};

// 蓝牙插件SDK固件升级状态码字典(含Android蓝牙插件SDK固件升级状态码字典和iOS蓝牙插件SDK固件升级状态码字典)
const FIRMWARE_UPGRADE_STATUS_CODE_DICT = {
	"-1": "尚未连接设备",
	"-2": "与设备断连",
	"-3": "错误",
	"-4": "参数错误",
	"-5": "蓝牙未打开，或不支持",
	"-6": "正在升级",
	"-7": "服务错误",
	"-8": "CRC校验失败",
	"-9": "文件头部校验失败",
	"-10": "外部存储错误",
	"-11": "内部存储错误",
	"-12": "无效存储",
	"-13": "应用异常",
	"-15": "镜像库无效", // （Invalid image bank）
	"-16": "镜像头无效", // （Invalid image header）
	"-17": "镜像文件大小无效", // （Invalid image size）
	"-18": "无效产品信息头", // （Invalid product header）
	"-19": "已是当前固件版本", // （Same firmware）
	"-20": "无法从外部存储设备读取" // （Failed to read from external memory device）
};

// "该APP不支持该操作"提示
const APP_NOT_SUPPORT_OPERATE_TEXT = "该APP不支持该操作";

// "请在APP上进行操作"提示
const APP_PLATFORM_OPERATE_TEXT = "请在APP上进行操作";

// "蓝牙扫描成功"提示
const BLUETOOTH_SCAN_SUCCESSFULLY_TEXT = "蓝牙扫描成功";

// "蓝牙扫描失败"提示
const BLUETOOTH_SCAN_FAILED_TEXT = "蓝牙扫描失败";

// "蓝牙开门成功"提示
const BLUETOOTH_OPEN_DOOR_SUCCESSFULLY_TEXT = "蓝牙开门成功";

// "蓝牙开门失败"提示
const BLUETOOTH_OPEN_DOOR_FAILED_TEXT = "蓝牙开门失败";

// "正在蓝牙操作中"提示
const BLUETOOTH_OPERATING_TEXT = "正在蓝牙操作中";

// "蓝牙操作成功"提示
const BLUETOOTH_OPERATE_SUCCESSFULLY_TEXT = "蓝牙操作成功";

// "蓝牙操作失败"提示
const BLUETOOTH_OPERATE_FAILED_TEXT = "蓝牙操作失败";

// "蓝牙读卡成功"提示
const BLUETOOTH_READ_CARD_SUCCESSFULLY_TEXT = "蓝牙读卡成功";

// "蓝牙读卡失败"提示
const BLUETOOTH_READ_CARD_FAILED_TEXT = "蓝牙读卡失败";

// "蓝牙写卡成功"提示
const BLUETOOTH_WRITE_CARD_SUCCESSFULLY_TEXT = "蓝牙写卡成功";

// "蓝牙写卡失败"提示
const BLUETOOTH_WRITE_CARD_FAILED_TEXT = "蓝牙写卡失败";

/**
 * @description public method - 公共方法，界面显示提示框
 * @param { String } content - 提示的内容，长度与 icon 取值有关。
 * @param { Number } duration - 提示的过渡时间，即多长时间后该提示框隐藏
 */
const $showToast = (content, duration) => {
	uni.showToast({
		title: content || "",
		duration: duration || 1500,
		icon: "none"
	});
};

/**
 * @description public method - 公共方法，界面显示加载框
 * @param { String } content - 提示的文字内容，显示在loading的下方
 */
const $showLoading = (content, duration) => {
	uni.showLoading({
		title: content || ""
	});
};

/**
 * @description public method - 公共方法，界面隐藏加载框
 */
const $hideLoading = () => {
	uni.hideLoading();
};

// 蓝牙SDK工具类
class BluetoothPluginSDK {
	constructor(arg) {
		this.timer = null;
	}

	init() {
		this.initBluetooth();
	}

	/**
	 * 【功能说明】
	 *  蓝牙初始化SDK
	 */
	initBluetooth() {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.initBluetooth) {
			console.log("开始初始化蓝牙");
			BLUETOOTH_PLUGIN_SDK.initBluetooth();
		} else {
			console.log("不支持初始化蓝牙");
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}
	
	/**
	 * 【功能说明】
	 *  获取蓝牙权限
	 * 1. android12新增一个权限，该权限为附近的设备权限。
	 * 
	 * 2.【低版本】（系统版本6及以上但在10以下）
	 * 需要APP应用的定位权限，否则蓝牙无法搜索周边的门禁设备，但可以对某一台设备进行蓝牙开门。
	 * 
	 * 3.【android10 ~ android12以下（不含12）】
	 * 需要android系统定位权限、APP应用的定位权限，否则蓝牙无法搜索周边的门禁设备，但可以对某一台设备进行蓝牙开门。
	 * 
	 * 4.【android12】
	 * 4.1 进行蓝牙开门，需要附近的设备权限。
	 * 4.2 进行蓝牙扫描周边设备时，同时需要附近的设备权限、android系统定位权限、APP应用的定位权限，调用该方法即可申请附近的设备权限。
	 * 
	 * 5. 该方法只适用于安卓平台，iOS平台可忽略。
	 */
	initPermission() {
		return new Promise((resolve, reject) => {
			// #ifdef APP-PLUS
			// 安卓12需要额外申请附近的设备权限，否则无法蓝牙开门以及蓝牙搜索
			// 附近设备的权限对应三个权限："android.permission.BLUETOOTH_SCAN", "android.permission.BLUETOOTH_ADVERTISE", "android.permission.BLUETOOTH_CONNECT"
			if (PLATFORM == "android") {
				if (permission.obtainBluetoothpermission) {
					// 申请蓝牙权限
					permission.obtainBluetoothpermission((result) => {
						console.log('permission.obtainBluetoothpermission', result);
						// 申请附近的设备权限成功
						if (result.errorCode == 0) {
							resolve();
						}
						// 申请附近的设备权限失败
						else {
							uni.hideLoading();
							let bluetoothPermissionPrompte = "";     // 安卓蓝牙权限提示内容
							// 安卓12版本，需要授权APP附近的设备权限、APP定位权限
							if ( parseFloat(SYSTEM)>= 12) {
								bluetoothPermissionPrompte = "需要授权附近的设备权限、定位权限，否则APP功能将会受到影响，是否确定授权？";
							}
							// 安卓6及以上、安卓12以下版本，需要授权APP定位权限
							else if (parseFloat(SYSTEM) >= 6 && parseFloat(SYSTEM) < 12) {
								bluetoothPermissionPrompte = "需要授权定位权限，否则APP功能将会受到影响，是否确定授权？";
							}
							uni.showModal({
								title: "温馨提示",
								content: bluetoothPermissionPrompte,
								success: (res) => {
									if (res.confirm) {
										console.log("用户点击确定");
										// 跳转到APP设置界面
										PermissionUtil.gotoAppPermissionSetting();
									} 
									else if (res.cancel) {
										console.log("用户点击取消");
									}
								}
							});
							reject();
						}
					});
				}
				else {
					console.log('获取蓝牙权限不存在permission.obtainBluetoothpermission');
					resolve();
				}
			}
			else {
				resolve();
			}
			// #endif
			
			// #ifndef APP-PLUS
			resolve();
			// #endif
		});
	}

	/**
	 * 【功能说明】
	 *  原生APP蓝牙扫描门禁设备(带蓝牙模块)
	 * 
	 * 【参数说明】
	 *  @param               { Object }          options           原生APP蓝牙扫描门禁设备(带蓝牙模块)的参数
	 *  @property            { Object }          isShowLoading     蓝牙扫描设备的操作过程中是否显示加载框，默认为true
	 *  @property            { Function }        complete          蓝牙扫描门禁设备后的回调
	 *  @completeProperty    { Object }          result            蓝牙扫描门禁设备后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息", "data": "蓝牙扫描到的门禁设备列表" }
	 */
	bluetoothScanDevice(options) {
		// #ifdef APP-PLUS
		options = Object.assign({ isShowLoading: true }, options);
		// 原生APP蓝牙扫描门禁设备(带蓝牙模块)
		if (BLUETOOTH_PLUGIN_SDK.blueToothScanDevice) {
			if (options.isShowLoading) {
				$showLoading();
			}
			this.initPermission().then(() => {
				BLUETOOTH_PLUGIN_SDK.blueToothScanDevice((result) => {
					if (options.isShowLoading) {
						$hideLoading();
					}
					let errorCode = result.errorCode;
					// 蓝牙扫描设备成功
					if (errorCode === 0) {
						let scanDeviceList = result.data;
						// 蓝牙扫描不到门禁设备
						if (scanDeviceList.length === 0) {
							result.errorMsg = "没有扫描到任何设备，请靠近设备再重试";
							// 安卓操作系统
							if (PLATFORM.indexOf("android") > -1) {
								// 安卓版本是10及以上，需要打开APP定位权限
								if (parseFloat(SYSTEM) >= 6) {
									result.errorMsg = "没有扫描到任何设备，请打开APP定位权限，靠近设备再重试";
								}
								// 安卓版本是10及以上，需要打开系统定位服务
								if (parseFloat(SYSTEM) >= 10) {
									// 获取android端的定位服务，android端需要开启定位服务才能蓝牙搜索周边的门禁设备
									const locationResult = PermissionUtil.checkSystemEnableLocation();
									if (!locationResult) {
										uni.showModal({
											title: "温馨提示",
											content: "请打开系统定位服务功能",
											success(res) {
												if (res.confirm) {
													console.log("用户点击确定");
													// 跳转到设置界面
													PermissionUtil.gotoSystemLocationSetting();
												} 
												else if (res.cancel) {
													console.log("用户点击取消");
												}
											}
										});
										// result.errorMsg = "没有扫描到任何设备，请打开系统定位服务，靠近设备再重试";
									}
								}
							}
						}
						// 蓝牙扫描到门禁设备
						else {
							result.errorMsg = BLUETOOTH_SCAN_SUCCESSFULLY_TEXT;
						}
					}
					// 蓝牙扫描设备失败
					else {
						result.errorMsg = STATUS_CODE_DICT[errorCode] || `${BLUETOOTH_SCAN_FAILED_TEXT}(${errorCode})`;
						$showToast(result.errorMsg);
					}
					
					console.log("--------------------\n");
					console.log(`蓝牙操作: 扫描\n操作结果: ${JSON.stringify(result)}`);
					console.log("--------------------\n");
					
					options.complete && typeof options.complete == "function" && options.complete(result);
				}, 1500);
			});
		}
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP对门禁设备(带蓝牙模块)进行蓝牙开门
	 * 
	 * 【参数说明】
	 *  @param          { Object }          deviceInfo                   被蓝牙操作的门禁设备信息
	 *  @property       { String }          deviceInfo.devSn             门禁设备的序列号
	 *  @property       { String }          deviceInfo.devMac            门禁设备的MAC地址
	 *  @property       { Number }          deviceInfo.deviceModelValue  门禁设备的型号值
	 *  @property       { String }          deviceInfo.appEkey           门禁设备开门的密钥(APP端密钥，微信小程序端为另一个蓝牙开门密钥)
	 *  ---------- deviceInfo.appEkey 参数说明 ----------
	 * 	@description    deviceInfo.appEkey
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  ---------- deviceInfo.appEkey 参数说明 ----------
	 * 
	 *  @property       { Number }          deviceInfo.ekeyType          门禁设备开门的蓝牙密钥类型
	 *  ---------- deviceInfo.ekeyType 参数说明 ----------
	 *  @description    deviceInfo.ekeyType
	 *  密钥类型，默认值为0
	 *  1: 一体机 2: 门禁读头 3: 梯控读头
	 *  ---------- deviceInfo.ekeyType 参数说明 ----------
	 *  
	 *  @param          { Object }          configParams                 配置参数
	 *  @property       { Boolean }         configParams.isShowLoading   蓝牙开门的过程中是否显示加载框，默认为true
	 * 
	 *  @param          { Function }        callback                     对门禁设备(带蓝牙模块)进行蓝牙开门后的回调(成功或失败)
	 *  @property       { Object }          result                       对门禁设备(带蓝牙模块)进行蓝牙开门后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	bluetoothOpenDoor(deviceInfo, configParams, callback) {
		// #ifdef APP-PLUS
		configParams = Object.assign({ isShowLoading: true }, configParams);
		if (BLUETOOTH_PLUGIN_SDK.blueToothOpenDoor) {
			if (configParams.isShowLoading) {
				$showLoading("正在开门...");
			}
			console.log("开始蓝牙开门，门禁设备信息: ", JSON.stringify(deviceInfo));
			// 蓝牙密钥类型
			deviceInfo.keyType = deviceInfo.ekeyType;
			BLUETOOTH_PLUGIN_SDK.blueToothOpenDoor(deviceInfo, (result) => {
				if (configParams.isShowLoading) {
					$hideLoading();
				}
				let errorCode = result.errorCode;
				result.errorMsg = errorCode === 0 ? BLUETOOTH_OPEN_DOOR_SUCCESSFULLY_TEXT : (STATUS_CODE_DICT[errorCode] || `${BLUETOOTH_OPEN_DOOR_FAILED_TEXT}(${errorCode})`);
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 开门\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback === "function") {
					callback(result);
				}
			});
		}
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP对门禁设备(带蓝牙模块)进行蓝牙配置通讯参数
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备开门的蓝牙秘钥类型
	 *  @property { Number } hardwarePlatform: 门禁设备的硬件平台(1：单片机，其他：嵌入式、安卓)
	 *  
	 *  @param { Object } configParam: 配置参数
	 */
	configCommunicationParams(deviceInfo, configParam) {
		// #ifdef APP-PLUS
		if (deviceInfo.hardwarePlatform == 1) {
			// 需要配置wifi（单片机）
			this.configWifi(deviceInfo, configParam);
		} else {
			// 配置ip（嵌入式、安卓）
			this.setServerIP(deviceInfo, configParam);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP对门禁设备(带蓝牙模块)进行蓝牙配置WiFi，需要两个参数：deviceInfo（被操作的门禁设备信息），configParam（连接的ip地址、端口号等）
	 * 
	 * 【参数deviceInfo说明】
	 *  @param        { Object }         deviceInfo            被蓝牙操作的门禁设备信息
	 *  @property     { String }         devSn                 门禁设备的序列号
	 *  @property     { String }         devMac                门禁设备的MAC地址
	 *  @property     { Number }         deviceModelValue      门禁设备的型号值
	 *  @property     { String }         appEkey               蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  @property     { Number }         ekeyType              门禁设备开门的蓝牙秘钥类型
	 *  @property     { Number }         hardwarePlatform      门禁设备的硬件平台(1：单片机，其他：嵌入式、安卓)
	 *
     *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
     *  appEkey组成：
     *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
     *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
     *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 * 
	 *
	 * 【参数configParam说明】
	 *  @param        { Object }         configParam           配置参数
	 *  @property     { String }         wifiName              门禁设备连接的wifi名         （单片机设备（非可视对讲）需传）
	 *  @property     { String }         wifiPwd               门禁设备连接的wifi密码       （单片机设备（非可视对讲）需传）
	 *  @property     { String }         ipAddress             门禁设备连接的ip地址         （单片机设备（非可视对讲）、嵌入式设备（可视对讲）、安卓设备（可视对讲）需传）
	 *  @property     { Number }         port                  门禁设备连接的端口号         （单片机设备（非可视对讲）、嵌入式设备（可视对讲）、安卓设备（可视对讲）需传）
	 * 
	 * 单片机的设备使用的配置参数（configParam）为：{ "wifiName":  "",  "wifiPwd": "", "ipAddress": "", "port":  整型数据 }
	 * Linux设备或者安卓设备（均支持可视对讲功能）使用的配置参数（configParam）为：{ "ipAddress": "", "port": 整型数据 }
	 * 
	 */
	configWifi(deviceInfo, configParam) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.configWifi) {
			$showLoading(BLUETOOTH_OPERATING_TEXT);
			if (this.timer !== null) {
				clearTimeout(this.timer);
				this.timer = null;
			}
			BLUETOOTH_PLUGIN_SDK.configWifi(deviceInfo, configParam, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					// errorMsg = "蓝牙配置wifi成功";
					if (configParam.ipAddress == "106.52.94.106") {
						// 我们自己服务器地址
						result.errorMsg = "配置已完成, 正在联网...";
						$showLoading(result.errorMsg);
						this._getDeviceOnlineStatus(deviceInfo);
					} else {
						result.errorMsg = "配置成功";
						$showToast(result.errorMsg);
					}
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `配置失败(${errorCode})`;
					$showToast(result.errorMsg);
				}
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 配置WiFi\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
			});
		}
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP对门禁设备(带蓝牙模块)进行蓝牙配置APN
	 * 
	 * 【参数说明】
	 *  @param {Object} deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property {String} devSn: 门禁设备的序列号
	 *  @property {String} devMac: 门禁设备的MAC地址
	 *  @property {Number} deviceModelValue: 门禁设备的型号值
	 *  @property {String} appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property {Number} ekeyType: 门禁设备的秘钥类型
	 *  
	 *  @param {Object} configParam: 配置参数
	 * 
	 * 	@param {Function} callback: 对门禁设备(带蓝牙模块)进行蓝牙配置APN后的回调(成功或失败)
	 *  @property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙配置APN后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	setAPNSetting(deviceInfo, configParam, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.setAPNSetting) {
			$showLoading(BLUETOOTH_OPERATING_TEXT);
			BLUETOOTH_PLUGIN_SDK.setAPNSetting(deviceInfo, configParam, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = BLUETOOTH_OPERATE_SUCCESSFULLY_TEXT;
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `${BLUETOOTH_OPERATE_FAILED_TEXT}(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 配置APN\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		}
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP对门禁设备(带蓝牙模块)进行蓝牙获取APN信息
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 * 	@param { Function } callback: 对门禁设备(带蓝牙模块)进行蓝牙获取APN信息后的回调(成功或失败)
	 *  @property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙获取APN信息后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	getAPNSetting(deviceInfo, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.getAPNSetting) {
			$showLoading(BLUETOOTH_OPERATING_TEXT);
			BLUETOOTH_PLUGIN_SDK.getAPNSetting(deviceInfo, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = BLUETOOTH_OPERATE_SUCCESSFULLY_TEXT;
				} else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `${BLUETOOTH_OPERATE_FAILED_TEXT}(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 获取APN信息\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		}
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP对门禁设备(带蓝牙模块)进行蓝牙获取设备系统信息
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 * 	@param { Function } callback: 对门禁设备(带蓝牙模块)进行蓝牙获取设备系统信息后的回调(成功或失败)
	 *  @property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙获取设备系统信息后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	getDeviceConfig(deviceInfo, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.getDeviceConfig) {
			$showLoading(BLUETOOTH_OPERATING_TEXT);
			BLUETOOTH_PLUGIN_SDK.getDeviceConfig(deviceInfo, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = BLUETOOTH_OPERATE_SUCCESSFULLY_TEXT;
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `${BLUETOOTH_OPERATE_FAILED_TEXT}(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 获取设备系统信息\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP对门禁设备(带蓝牙模块)进行蓝牙配置ip
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 *  @param { Object } configParam: 配置参数
	 */
	setServerIP(deviceInfo, configParam) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.setServerIP) {
			$showLoading(BLUETOOTH_OPERATING_TEXT);
			BLUETOOTH_PLUGIN_SDK.setServerIP(deviceInfo, configParam, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = "配置已完成, 正在联网...";
					$showLoading(result.errorMsg);
					this._getDeviceOnlineStatus(deviceInfo);
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `${BLUETOOTH_OPERATE_FAILED_TEXT}(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 配置ip\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
			});
		}
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP对门禁设备(带蓝牙模块)进行蓝牙配置读卡扇区密钥
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number} ekeyType: 门禁设备的秘钥类型
	 *  
	 *  @param { Object } configParam: 配置参数
	 */
	setReadSectorKey(deviceInfo, configParam) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.setReadSectorKey) {
			$showLoading(BLUETOOTH_OPERATING_TEXT);
			BLUETOOTH_PLUGIN_SDK.setReadSectorKey(deviceInfo, configParam, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = BLUETOOTH_OPERATE_SUCCESSFULLY_TEXT;
				}
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `${BLUETOOTH_OPERATE_FAILED_TEXT}(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 配置读卡扇区密钥\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP对门禁设备(带蓝牙模块)进行蓝牙配置设备IP地址
	 * 
	 * 【参数说明】
	 *  @param {Object} deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property {String} devSn: 门禁设备的序列号
	 *  @property {String} devMac: 门禁设备的MAC地址
	 *  @property {Number} deviceModelValue: 门禁设备的型号值
	 *  @property {String} appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property {Number} ekeyType: 门禁设备的秘钥类型
	 *  
	 *  @param {Object} configParam: 配置参数
	 */
	setDeviceStaticIP(deviceInfo, configParam) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.setDeviceStaticIP) {
			$showLoading(BLUETOOTH_OPERATING_TEXT);
			BLUETOOTH_PLUGIN_SDK.setDeviceStaticIP(deviceInfo, configParam, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = BLUETOOTH_OPERATE_SUCCESSFULLY_TEXT;
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `${BLUETOOTH_OPERATE_FAILED_TEXT}(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 配置设备IP地址\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP对门禁设备(带蓝牙模块)进行蓝牙配置设备紧急开门密码
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 *  @param { Object } configParam: 配置参数
	 * 
	 * 	@param { Function } callback: 对门禁设备(带蓝牙模块)进行蓝牙配置设备紧急开门密码后的回调(成功或失败)
	 *  @property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙配置设备紧急开门密码后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	modifyPwd(deviceInfo, configParam , callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.modifyPwd) {
			$showLoading(BLUETOOTH_OPERATING_TEXT);
			BLUETOOTH_PLUGIN_SDK.modifyPwd(deviceInfo, configParam, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = BLUETOOTH_OPERATE_SUCCESSFULLY_TEXT;
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `${BLUETOOTH_OPERATE_FAILED_TEXT}(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 配置设备紧急开门密码\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP对门禁设备(带蓝牙模块)进行蓝牙同步设备时间
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 *  @param { String } syncTime: 同步时间
	 * 
	 * 	@param { Function } callback: 对门禁设备(带蓝牙模块)进行蓝牙同步设备时间后的回调(成功或失败)
	 * 	@property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙同步设备时间后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	syncDeviceTime(deviceInfo, syncTime, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.syncDeviceTime) {
			$showLoading(BLUETOOTH_OPERATING_TEXT);
			BLUETOOTH_PLUGIN_SDK.syncDeviceTime(deviceInfo, syncTime, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = BLUETOOTH_OPERATE_SUCCESSFULLY_TEXT;
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `${BLUETOOTH_OPERATE_FAILED_TEXT}(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 同步设备时间\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP蓝牙重置设备信息
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 * 	@param { Function } callback: 对门禁设备(带蓝牙模块)进行蓝牙重置设备信息后的回调(成功或失败)
	 *  @property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙重置设备信息后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	resetDeviceConfig(deviceInfo, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.getDeviceConfig) {
			$showLoading(BLUETOOTH_OPERATING_TEXT);
			BLUETOOTH_PLUGIN_SDK.resetDeviceConfig(deviceInfo, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = BLUETOOTH_OPERATE_SUCCESSFULLY_TEXT;
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `${BLUETOOTH_OPERATE_FAILED_TEXT}(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 重置设备信息\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  查询门禁设备联网状态(在线离线状态，每隔10s查询该设备的联网状态)
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 */
	_getDeviceOnlineStatus(deviceInfo) {
		if (this.number > 1) {
			$showLoading();
			this.timer = setTimeout(() => {
				// 接口请求查询门禁设备的联网状态
				_this.$req.request({
					url: "/devDevice/app/getDeviceOnlineStatus",
					data: {
						"devSn": deviceInfo.devSn,
						"isShowLoad": false
					},
					success: (result) => {
						let code = result.code;
						if (code === 0 && this.number > 1) {
							let onlineStatus = result.data.onlineStatus;
							// 门禁设备已联网，停止继续查询门禁设备联网状态
							if (onlineStatus == 1) {
								$hideLoading();
								$showToast("设备已联网");
								this.number = 6;
							}
							// 没联网，继续查询门禁设备联网状态，直到1分钟后或者查询到门禁设备已联网才停止继续查询
							else {
								this._getDeviceOnlineStatus(deviceInfo);
							}
						} 
						else if (this.number == 1) {
							$hideLoading();
							$showToast("联网失败，请检查参数");
							this.number = 6;
						} 
						else {
							this._getDeviceOnlineStatus(deviceInfo);
						}
					},
					fail: () => {
						if (this.number == 1) {
							$hideLoading();
							$showToast("联网失败，请检查参数");
							this.number = 6;
						} 
						else {
							this._getDeviceOnlineStatus(deviceInfo);
						}
					},
					complete: () => {
						this.number--;
					}
				});
			}, 10000);
		}
	}

	/**
	 * 【功能说明】
	 *  通过原生APP蓝牙获取到放置在该门禁设备上的卡的卡号(刷卡开门)
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 * 	@param { Function } callback: 获取到放置在该门禁设备上的卡的卡号后的回调(成功或失败)
	 *  @property { Object } result: 获取到放置在该门禁设备上的卡的卡号后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息", "data": { "cardNo": "卡号" } }
	 */
	getSwipeAddCardno(deviceInfo, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.getSwipeAddCardno) {
			$showLoading("读卡中...");
			BLUETOOTH_PLUGIN_SDK.getSwipeAddCardno(deviceInfo, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = BLUETOOTH_READ_CARD_SUCCESSFULLY_TEXT;
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `${BLUETOOTH_READ_CARD_FAILED_TEXT}(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 获取到放置在该门禁设备上的卡的卡号\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP蓝牙写卡，即把卡号添加到门禁设备，然后使用该卡对门禁设备进行刷卡开门。
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 *  @param { String } cardDataStr: 写入门禁设备的卡号，支持多张卡，写入多张卡时用逗号隔开
	 * 
	 *  @param { Boolean } append: 是否追加，若为true，就是直接添加，若为false，则先清空再添加
	 * 
	 * 	@param { Function } callback:对门禁设备(带蓝牙模块)进行蓝牙写卡后的回调(成功或失败)
	 *  @property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙写卡后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	writeCard(deviceInfo, cardDataStr, append, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.writeCard) {
			$showLoading("正在写卡...");
			BLUETOOTH_PLUGIN_SDK.writeCard(deviceInfo, cardDataStr, append, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = BLUETOOTH_WRITE_CARD_SUCCESSFULLY_TEXT;
				} else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `${BLUETOOTH_WRITE_CARD_FAILED_TEXT}(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 写卡\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  旧版原生APP蓝牙刷卡添卡
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 * 	@param { Function } callback: 对门禁设备(带蓝牙模块)进行蓝牙刷卡添卡后的回调(成功或失败)
	 * 	@property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙刷卡添卡后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	swipeAddCardModel(deviceInfo, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.swipeAddCardModel) {
			$showLoading(BLUETOOTH_OPERATING_TEXT);
			BLUETOOTH_PLUGIN_SDK.swipeAddCardModel(deviceInfo, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = "进入刷卡添卡模式，请刷卡";
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `进入刷卡添卡模式失败(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作:刷卡添卡\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		}
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP蓝牙退出刷卡添卡模式
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 * 	@param { Function } callback: 对门禁设备(带蓝牙模块)进行蓝牙退出刷卡添卡模式后的回调(成功或失败)
	 *  @property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙退出刷卡添卡模式后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	existSwipeCardAddModel(deviceInfo, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.existSwipeCardAddModel) {
			$showLoading();
			BLUETOOTH_PLUGIN_SDK.existSwipeCardAddModel(deviceInfo, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = "已退出刷卡添卡模式";
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `退出刷卡添卡模式失败(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 退出刷卡添卡模式\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		}
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  旧版原生APP蓝牙刷卡删卡
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 * 	@param { Function } callback: 对门禁设备(带蓝牙模块)进行蓝牙刷卡删卡后的回调(成功或失败)
	 *  @property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙刷卡删卡后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	swipeCardDeleteModel(deviceInfo, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.swipeCardDeleteModel) {
			$showLoading();
			BLUETOOTH_PLUGIN_SDK.swipeCardDeleteModel(deviceInfo, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = "进入刷卡删卡模式，请刷卡";
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `进入刷卡删卡模式失败(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 进入刷卡删卡模式\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		}
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP蓝牙退出刷卡删卡模式
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 * 	@param { Function } callback: 对门禁设备(带蓝牙模块)进行蓝牙退出刷卡删卡模式后的回调(成功或失败)
	 *  @property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙退出刷卡删卡模式后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	//
	existSwipeCardDeleteModel(deviceInfo, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.existSwipeCardDeleteModel) {
			$showLoading();
			BLUETOOTH_PLUGIN_SDK.existSwipeCardDeleteModel(deviceInfo, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = "已退出刷卡删卡模式";
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `退出刷卡删卡模式失败(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 退出刷卡删卡模式\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		}
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP蓝牙删卡(当成功进入刷卡删卡模式后，就可以进行原生APP蓝牙删卡的操作)
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 *  @param { Object } cardDataStr: 删除已写入门禁设备的卡号，支持多张卡，删除多张卡时用逗号隔开
	 * 
	 * 	@param { Function } callback: 对门禁设备(带蓝牙模块)进行蓝牙删卡后的回调(成功或失败)
	 *  @property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙删卡后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	deleteCard(deviceInfo, cardDataStr, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.deleteCard) {
			$showLoading("正在删卡...");
			BLUETOOTH_PLUGIN_SDK.deleteCard(deviceInfo, cardDataStr, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0 || errorCode == 18) {
					result.errorMsg = "删卡成功";
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `删卡失败(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 删卡\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP蓝牙清除所有卡数据
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 * 	@param { Function } callback: 对门禁设备(带蓝牙模块)进行蓝牙清除所有卡数据后的回调(成功或失败)
	 * 	@property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙清除所有卡数据后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	cleanCard(deviceInfo, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.cleanCard) {
			$showLoading("正在清除卡...");
			BLUETOOTH_PLUGIN_SDK.cleanCard(deviceInfo, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = "清除卡数据成功";
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `清除卡数据失败(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 清除所有卡数据\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP蓝牙获取已写入设备里的卡号
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 * 	@param { Function } callback: 对门禁设备(带蓝牙模块)进行蓝牙获取已写入设备里的卡号后的回调(成功或失败)
	 *  @property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙获取已写入设备里的卡号后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	getCardNumbersFromDevice(deviceInfo, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.getCardNumbersFromDevice) {
			$showLoading("正在获取...");
			BLUETOOTH_PLUGIN_SDK.getCardNumbersFromDevice(deviceInfo, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = BLUETOOTH_OPERATE_SUCCESSFULLY_TEXT;
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `读取设备卡号失败(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 获取已写入设备里的卡号\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP蓝牙设置设备蓝牙开锁时长
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 *  @param { Object } configParam: 配置参数
	 * 
	 * 	@param { Function } callback: 对门禁设备(带蓝牙模块)进行蓝牙设置设备蓝牙开锁时长后的回调(成功或失败)
	 *  @property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙设置设备蓝牙开锁时长后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	setDeviceConfig(deviceInfo, configParam, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.setDeviceConfig) {
			$showLoading(BLUETOOTH_OPERATING_TEXT);
			BLUETOOTH_PLUGIN_SDK.setDeviceConfig(deviceInfo, configParam, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = BLUETOOTH_OPERATE_SUCCESSFULLY_TEXT;
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `${BLUETOOTH_OPERATE_FAILED_TEXT}(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 设置设备蓝牙开锁时长\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP蓝牙固件升级
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 *  @param { String } firmwarePath: 蓝牙固件地址
	 * 
	 * 	@param { Function } callback: 对门禁设备(带蓝牙模块)进行蓝牙固件升级后的回调(成功或失败)
	 *  @property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙固件升级后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	upgradeDevice(deviceInfo, firmwarePath, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.upgradeDevice) {
			$showLoading("正在升级...");
			BLUETOOTH_PLUGIN_SDK.upgradeDevice(deviceInfo, firmwarePath, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = "升级结束正在检测升级结果";
					$showToast(result.errorMsg, 8000);
				}
				else if (errorCode === 2 || errorCode === 3) {
					console.log("蓝牙固件升级操作不会返回2或3这两个状态码，如果返回了，不用管");
				}
				else {
					result.errorMsg = FIRMWARE_UPGRADE_STATUS_CODE_DICT[errorCode] || `设备蓝牙固件升级失败(${errorCode})`;
					$showToast(result.errorMsg);
				}
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 蓝牙固件升级\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}
	
	/**
	 * 【功能说明】
	 *  原生APP蓝牙固件URL升级(网络URL地址)
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 *  @param { String } firmwarePath: 蓝牙固件地址
	 * 
	 * 	@param { Function } callback: 对门禁设备(带蓝牙模块)进行蓝牙固件URL升级后的回调(成功或失败)
	 * 	@property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙固件URL升级后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	deviceUpgradeByNetwork(deviceInfo, firmwarePath, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.deviceUpgradeByNetwork) {
			$showLoading();
			BLUETOOTH_PLUGIN_SDK.deviceUpgradeByNetwork(deviceInfo, firmwarePath, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = "升级结束正在检测升级结果";
					$showToast(result.errorMsg, 8000);
				} 
				else {
					result.errorMsg = FIRMWARE_UPGRADE_STATUS_CODE_DICT[errorCode] || `蓝牙固件URL升级失败(${errorCode})`;
					$showToast(result.errorMsg);
				}
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 配置固件URL升级\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP蓝牙获取设备联网信号值
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 * 	@param { Function } callback: 对门禁设备(带蓝牙模块)进行蓝牙获取设备联网信号值后的回调(成功或失败)
	 * 	@property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙获取设备联网信号值后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	getDeviceSignal(deviceInfo, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.getDeviceSignal) {
			$showLoading();
			BLUETOOTH_PLUGIN_SDK.getDeviceSignal(deviceInfo, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = "获取设备联网信号值成功";
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `获取设备联网信号值失败(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 取设备联网信号值\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP蓝牙登记指纹数据到门禁设备
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 *  @param { Object } param: 指纹数据
	 * 
	 * 	@param { Function } callback: 在门禁设备上进行登记指纹数据后的回调(成功或失败)
	 * 	@property { Object } result: 在门禁设备上进行登记指纹数据后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	deviceRegistFingerprint(deviceInfo, param, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.deviceRegistFingerprint) {
			$showLoading("正在连接中...");
			BLUETOOTH_PLUGIN_SDK.deviceRegistFingerprint(deviceInfo, param, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = "登记指纹数据成功";
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `登记指纹数据失败(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 登记指纹数据到门禁设备\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP蓝牙删除指纹
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 *  @param { Object } param: 指纹数据
	 * 
	 * 	@param { Function } callback: 在门禁设备上进行删除指纹数据后的回调(成功或失败)
	 * 	@property { Object } result: 在门禁设备上进行删除指纹数据后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	deleteFingerprints(deviceInfo, param, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.deleteFingerprints) {
			$showLoading("正在删除...");
			BLUETOOTH_PLUGIN_SDK.deleteFingerprints(deviceInfo, param, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = "删除指纹数据成功";
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `删除指纹数据失败(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 删除指纹\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *   原生APP蓝牙同步指纹数据，即把指纹数据同步到门禁设备，然后使用指纹进行开门
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 *  @param { Array } fingerprintList: 指纹数据列表
	 * 
	 *  @param { Boolean } append: 是否追加，若为true，则直接添加指纹，若为false，则先清空再添加指纹
	 * 
	 * 	@param { Function } callback: 蓝牙同步指纹数据到门禁设备后的回调(成功或失败)
	 *  @property { Object } result: 蓝牙同步指纹数据到门禁设备后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	syncFingerPrintToDevice(deviceInfo, fingerprintList, append, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.syncFingerPrintToDevice) {
			$showLoading("正在同步指纹...");
			BLUETOOTH_PLUGIN_SDK.syncFingerPrintToDevice(deviceInfo, fingerprintList, append, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = "同步指纹数据成功";
				} else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `同步指纹数据失败(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 同步指纹数据\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP蓝牙清空指纹数据
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 * 	@param { Function } callback: 把门禁设备上的指纹数据清空后的回调(成功或失败)
	 *  @property { Object } result: 把门禁设备上的指纹数据清空后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	cleanFingerprints(deviceInfo, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.cleanFingerprints) {
			$showLoading(BLUETOOTH_OPERATING_TEXT);
			BLUETOOTH_PLUGIN_SDK.cleanFingerprints(deviceInfo, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = BLUETOOTH_OPERATE_SUCCESSFULLY_TEXT;
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `${BLUETOOTH_OPERATE_FAILED_TEXT}(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 清空指纹数据\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP蓝牙登录，方便蓝牙开门时上传蓝牙开门记录，该功能一般不提示"正在蓝牙登录操作"给用户
	 * 
	 * 【参数说明】
	 *  @param { String } account: APP登录用户的账号
	 * 
	 *  @param { String } baseURL: 服务器接口请求基础路径
	 * 
	 *  @param { String } appId: 服务器接口请求所需的appId(不同平台如达管家APP、绘生活APP、FirstKeeperAPP的appId不同)，通过appId将各个平台区分开
	 * 
	 *  @param { String } appSecret: 服务器接口请求所需的appSecret(不同平台如达管家APP、绘生活APP、FirstKeeperAPP的appSecret不同)，通过appSecret将各个平台区分开
	 * 
	 * 	@param {Function} callback: 蓝牙登录后的回调(成功或失败)
	 * 	@property { Object } result: 蓝牙登录后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	bluetoothlogin(account, baseURL, appId, appSecret, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.loginServer) {
			// $showLoading();
			BLUETOOTH_PLUGIN_SDK.loginServer({
				"server": baseURL,
				"appId": appId,
				"appSecret": appSecret,
				"account": account
			}, (result) => {
				console.log("APP蓝牙登录结果", JSON.stringify(result));
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					console.log("APP蓝牙登录成功");
				} 
				else {
					console.log("APP蓝牙登录失败, 错误码: ", errorCode);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP蓝牙获取门禁设备中的最近开门记录，该功能一般不提示"正在蓝牙登录操作"给用户，根据具体情况来决定是否提示
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  @property { Number } isSupportGetOpenDoorRecord: 门禁设备是否支持获取开门记录
	 *  
	 * 	@param { Function } callback: 蓝牙获取门禁设备中的最近开门记录后的回调(成功或失败)
	 * 	@property { Object } result: 蓝牙获取门禁设备中的最近开门记录后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	getRecentOpenDoorRecordFromDevice(deviceInfo, callback) {
		// #ifdef APP-PLUS
		// 针对门锁设备，蓝牙开门成功后才去读取最近开门记录，前提是该门禁设备支持获取开门记录
		let isSupportGetOpenDoorRecord = deviceInfo.isSupportGetOpenDoorRecord;
		// 该门禁设备支持获取开门记录
		if (isSupportGetOpenDoorRecord == 1) {
			if (BLUETOOTH_PLUGIN_SDK.getRecentOpenDoorRecordFromDevice) {
				// $showLoading(BLUETOOTH_OPERATING_TEXT);
				BLUETOOTH_PLUGIN_SDK.getRecentOpenDoorRecordFromDevice(deviceInfo, (result) => {
					// $hideLoading();
					let errorCode = result.errorCode;
					if (errorCode === 0) {
						// $showToast(BLUETOOTH_OPERATE_SUCCESSFULLY_TEXT);
						result.errorMsg = BLUETOOTH_OPERATE_SUCCESSFULLY_TEXT;
					} 
					else {
						result.errorMsg = STATUS_CODE_DICT[errorCode] || `${BLUETOOTH_OPERATE_FAILED_TEXT}(${errorCode})`;
					}
					$showToast(result.errorMsg);
					
					console.log("--------------------\n");
					console.log(`蓝牙操作: 获取门禁设备中的最近开门记录\n操作结果: ${JSON.stringify(result)}`);
					console.log("--------------------\n");
					
					if (typeof callback == "function") {
						callback(result);
					}
				});
			}
			else {
				// $showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
				console.log(`----------蓝牙获取门禁设备中的最近开门记录: ${APP_NOT_SUPPORT_OPERATE_TEXT}----------`);
			}
		}
		else {
			// $showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
			console.log(`----------蓝牙获取门禁设备中的最近开门记录: ${APP_NOT_SUPPORT_OPERATE_TEXT}----------`);
		}
		// #endif
		
		// #ifndef APP-PLUS
		// $showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP蓝牙获取门禁设备中的所有开门记录
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 * 	@param { Function } callback: 蓝牙获取门禁设备中的所有开门记录后的回调(成功或失败)
	 * 	@property { Object } result: 蓝牙获取门禁设备中的所有开门记录后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	getOpenDoorRecordFromDevice(deviceInfo, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.getOpenDoorRecordFromDevice) {
			$showLoading(BLUETOOTH_OPERATING_TEXT);
			BLUETOOTH_PLUGIN_SDK.getOpenDoorRecordFromDevice(deviceInfo, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = BLUETOOTH_OPERATE_SUCCESSFULLY_TEXT;
				}
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `${BLUETOOTH_OPERATE_FAILED_TEXT}(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 获取门禁设备中的所有开门记录\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP对门禁设备(带蓝牙模块)进行蓝牙配置智能门锁联网模式
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 *  @param { Object } param: 参数
	 * 
	 * 	@param { Function } callback: 对门禁设备(带蓝牙模块)进行蓝牙配置智能门锁联网模式后的回调(成功或失败)
	 *  @property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙配置智能门锁联网模式后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	setNBNetworkSetting(deviceInfo, param, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.setNBNetworkSetting) {
			$showLoading(BLUETOOTH_OPERATING_TEXT);
			BLUETOOTH_PLUGIN_SDK.setNBNetworkSetting(deviceInfo, param, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = BLUETOOTH_OPERATE_SUCCESSFULLY_TEXT;
				}
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `${BLUETOOTH_OPERATE_FAILED_TEXT}(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 配置智能门锁联网模式\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}

	/**
	 * 【功能说明】
	 *  原生APP对门禁设备(带蓝牙模块)进行蓝牙获取sim卡信息
	 * 
	 * 【参数说明】
	 *  @param { Object } deviceInfo: 被蓝牙操作的门禁设备信息
	 *  @property { String } devSn: 门禁设备的序列号
	 *  @property { String } devMac: 门禁设备的MAC地址
	 *  @property { Number } deviceModelValue: 门禁设备的型号值
	 *  @property { String } appEkey: 蓝牙操作门禁设备的密钥(APP端密钥，微信小程序端为另一个密钥)
	 *  设备类型，主要三种，1：读头，加上卡号，2：梯控，appEkey长度是74位，3：其他，deviceModelValue可以是任意值
	 *  appEkey组成：
	 *  设备key（32位） + 11位用户id（不够后面补0） + 来源id（11位，一般全是0）+ 卡号（11位，如果是读头类型的，就不能全是0） + 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 26000000000 00000000000 0000000000 1000
	 *  d1e78f1a6becbe8f73d5e73e05d5d08e 18820420115 00000000000 0000000000 1000
	 *  @property { Number } ekeyType: 门禁设备的秘钥类型
	 *  
	 * 	@param { Function } callback: 对门禁设备(带蓝牙模块)进行蓝牙获取sim卡信息后的回调(成功或失败)
	 *  @property { Object } result: 对门禁设备(带蓝牙模块)进行蓝牙获取sim卡信息后的回调参数 - 格式: { errorCode: "蓝牙操作状态码", "errorMsg": "蓝牙操作描述信息" }
	 */
	getSimstatus(deviceInfo, callback) {
		// #ifdef APP-PLUS
		if (BLUETOOTH_PLUGIN_SDK.getSimstatus) {
			$showLoading(BLUETOOTH_OPERATING_TEXT);
			BLUETOOTH_PLUGIN_SDK.getSimstatus(deviceInfo, (result) => {
				$hideLoading();
				let errorCode = result.errorCode;
				if (errorCode === 0) {
					result.errorMsg = BLUETOOTH_OPERATE_SUCCESSFULLY_TEXT;
				} 
				else {
					result.errorMsg = STATUS_CODE_DICT[errorCode] || `${BLUETOOTH_OPERATE_FAILED_TEXT}(${errorCode})`;
				}
				$showToast(result.errorMsg);
				
				console.log("--------------------\n");
				console.log(`蓝牙操作: 获取sim卡信息\n操作结果: ${JSON.stringify(result)}`);
				console.log("--------------------\n");
				
				if (typeof callback == "function") {
					callback(result);
				}
			});
		} 
		else {
			$showToast(APP_NOT_SUPPORT_OPERATE_TEXT);
		}
		// #endif
		
		// #ifndef APP-PLUS
		$showToast(APP_PLATFORM_OPERATE_TEXT);
		// #endif
	}
}

let bluetoothPluginSDK = new BluetoothPluginSDK();
export default bluetoothPluginSDK;

