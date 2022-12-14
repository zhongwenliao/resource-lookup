import Vue from 'vue';
let that = Vue.prototype;
// import {
// 		checkLocationPermission
// 	} from '@/common/permission/check-permission.js';
// 获取当前操作平台
let platform = uni.getSystemInfoSync().platform.toLowerCase();
// 蓝牙插件DoorMaster-Bluetooth-Plugin
let bluetoothPlugin = {};
let permission = {}
// #ifdef APP-PLUS
// ios平台和安卓平台引入本地插件DoorMaster-Ibeacon-Plugin(蓝牙插件)
bluetoothPlugin = uni.requireNativePlugin("DoorMaster-Bluetooth-Plugin") || {};
 permission = uni.requireNativePlugin("DoorMaster-Permission-Plugin") || {};
// #endif

// ios平台需先调用初始化蓝牙方法, 而安卓平台则不用
export function initBluetooth() {
	if (platform.indexOf("ios") > -1) {
		console.log('ios平台需先调用初始化蓝牙方法')
		// ios平台需先调用初始化蓝牙方法, 而安卓平台则不用
		if (bluetoothPlugin.initBluetooth) {
			bluetoothPlugin.initBluetooth();
		}
	}
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
	export function initPermission() {
		return new Promise((resolve, reject) => {
			// #ifdef APP-PLUS
			// 安卓12需要额外申请附近的设备权限，否则无法蓝牙开门以及蓝牙搜索
			// 附近设备的权限对应三个权限："android.permission.BLUETOOTH_SCAN", "android.permission.BLUETOOTH_ADVERTISE", "android.permission.BLUETOOTH_CONNECT"
			if (platform == "android") {
				console.log(permission)
				if (permission.obtainBluetoothpermission) {
					// 申请蓝牙权限
					permission.obtainBluetoothpermission((result) => {
						console.log(result,888888888888888888)
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
	
// 设备信号排列
export function blueToothScanDevice(callback) {
	initBluetooth()
	if (bluetoothPlugin.blueToothScanDevice) {
		// uni.showLoading();
		initPermission().then(() => {
		bluetoothPlugin.blueToothScanDevice(res => {
			// 获取蓝牙扫描返回状态码
			console.log(res);
			let errorCode = res.errorCode;
			if (errorCode === 0) {
				// 搜索成功
				let scanDeviceList = res.data;
				if (scanDeviceList.length === 0) {
					uni.showToast({
						title: "没有设备",
						icon: "none"
					});
				} else {
					this.scanDeviceList = scanDeviceList.sort((a, b) => {
						return b.RSSI - a.RSSI;
					});
					console.log(scanDeviceList)
					callback(scanDeviceList)
				}
				uni.hideLoading();
			} else {
				uni.showToast({
					title: '蓝牙扫描失败, 错误代码：' + errorCode,
					icon: "none"
				});
				uni.hideLoading();
			}
			// this.orbitLayer = this.orbitLayer == this.lang.orbit_layer_start ? this.lang.orbit_layer_end : this
			// 	.lang.orbit_layer_start;A
		}, 1300);
		})
	} else {
		uni.showToast({
			title: '当前环境不支持蓝牙搜索',
			icon: "none"
		});
	}
}


export function blueToothOpenDoor(devObj) {
	// initBluetooth()
	if (bluetoothPlugin.blueToothOpenDoor) {
		initPermission().then(() => {
		bluetoothPlugin.blueToothOpenDoor(devObj, (result) => {
			console.log(result)
			let errorCode = result.errorCode;
			// let msg = "";
			if (errorCode === 0) {
				uni.showToast({
					title: "开门成功",
					icon: "none"
				});
				uni.hideLoading();
				// msg = that.lang.door_success;
				// let openDoorAudio = uni.createInnerAudioContext();
				// openDoorAudio.autoplay = true;
				// openDoorAudio.src = "/static/audio/open-door.wav";
				// openDoorAudio.onPlay(() => {
				// 	console.log('开始播放');
				// });
				uni.showToast({
					title: "开门成功",
					icon: "none"
				});
			} else if (errorCode === 48) {
				uni.hideLoading();
				// msg = that.lang.door_timeout;
				uni.showToast({
					title: "通信连接超时",
					icon: "none"
				});
			} else if (errorCode == "-121") {
				uni.showLoading({
					title: "暂停便捷开门.."
				});
			} else if (errorCode == "-122") {
				uni.showLoading({
					title: "暂停成功,正在操作"
				});
			} else if (errorCode == "-123") {
				uni.hideLoading();
				// msg = that.lang.unauthorized_positioning_permission;
				uni.showToast({
					title: '未授权定位权限',
					icon: "none"
				});
			} else {
				uni.hideLoading();
				// msg = that.lang.door_failure + errorCode;
				uni.showToast({
					title: errorCode,
					icon: "none"
				});
			}
		})
		})
	} else {
		uni.showToast({
			title: '当前环境不支持蓝牙',
			icon: "none"
		});
	}
}
