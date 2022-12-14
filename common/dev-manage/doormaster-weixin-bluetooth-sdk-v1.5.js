// 如果跟uniapp官方提倡的有顺序出入，不要见怪，能使用就行
/**
 * 1. 获取本机蓝牙适配器状态 uni.getBluetoothAdapterState
 * 2. 初始化蓝牙适配器 uni.openBluetoothAdapter()
 * 3. 启动蓝牙发现 uni.startBluetoothDevicesDiscovery()
 * 4. 获取扫描到的所有设备 uni.getBluetoothDevices()
 * 
 * 
 * 参数：
 * @callback function 回调函数，用于接收返回值
 * 
 * 返回值：
 * ret:{isBluetoothAvailable:true, isBluetoothSearching:true, scanList:[]}
 * isBluetoothAvailable boolean 蓝牙适配器状态，true表示初始化蓝牙适配器成功
 * isBluetoothSearching boolean 蓝牙搜索状态，true表示开启蓝牙发现成功
 * scanList array 搜索的设备列表
 */
function scanDevices(callback) {
	if (typeof callback != "function") {
		// console.log('Parameter callback is not a function');
		return;
	};
	//scanList格式如下：
	//[{RSSI:-xx, advertisServiceUUIDs:[], deviceId:'', name:''},{...}]
	//注意：Android系统的deviceId是设备的mac地址，iOS系统的deviceId是设备的UUID
	var ret = {
		isBluetoothAvailable: false,
		isBluetoothSearching: false,
		errCode: -1,
		scanList: []
	};

	/**
	 * 获取蓝牙适配器状态
	 * 
	 */
	uni.getBluetoothAdapterState({
		success: function(res) {
			// console.log("---getBluetoothAdapterState--success:", res)
			ret.isBluetoothAvailable = res.available;
			ret.isBluetoothSearching = res.discovering;
		},
		fail: function(res) {
			console.log("---getBluetoothAdapterState--fail:", res)
			console.log("res===", res);
		},
		complete: function(res) {
			/**
			 * 初始化蓝牙
			 */
			if (!ret.isBluetoothAvailable) {
				uni.openBluetoothAdapter({
					success: function(res) {
						// console.log("---openBluetoothAdapter--success:", res);
						ret.isBluetoothAvailable = true;
						startBluetoothDiscoveryAndScanDevice(ret, callback);
					},
					fail: function(res) {
						// console.log("---openBluetoothAdapter--fail:", res);
						var systemInfo = uni.getSystemInfoSync();
						if (systemInfo.platform.indexOf("ios") > -1 && stringParseInt(systemInfo.system) > 1200) {
							ret.errCode = 1;
							// console.log("ios系统版本高于12");
							ret.errMsg = "请打开手机蓝牙，并打开设置-微信-蓝牙进行授权";
						}
						callback(ret); //蓝牙初始化失败，直接返回，不进行后续搜索操作
						return;
					}
				});
			} else {
				startBluetoothDiscoveryAndScanDevice(ret, callback);
			}
		}
	});
}

function startBluetoothDiscoveryAndScanDevice(ret, callback) {
	/**
	 * 开启蓝牙发现
	 */
	if (!ret.isBluetoothSearching) {
		uni.startBluetoothDevicesDiscovery({
			services: [],
			allowDuplicatesKey: true,
			success: function(res) {
				// console.log("---startBluetoothDevicesDiscovery--success: ", res);
				ret.isBluetoothSearching = res.isDiscovering;
			},
			fail: function(res) {
				// console.log('---startBluetoothDevicesDiscovery--fail:', res);
				// 刷新页面后，开启蓝牙发现失败，暂时忽略10008错误
				// if (res.errCode != 10008) {
				//   callback(ret);
				// }
			},
			complete: function(res) {
				// console.log('---startBluetoothDevicesDiscovery--complete:', res)
				if (res.errCode === 0 || res.errCode === 10008) {
					scanBluetoothDevice(ret, callback);
				} else {
					callback(ret);
				}
			}
		});
	} else {
		scanBluetoothDevice(ret, callback);
	}
}

function scanBluetoothDevice(ret, callback) {
	/**
	 * 获取扫描到的所有设备
	 * 3s时间扫描设备，如果改成1s，可以让蓝牙打开门禁时间在安卓上是4s以内，ios上是3s左右，这里我先不做修改
	 */
	setTimeout(function() {
		uni.getBluetoothDevices({
			success: function(res) {
				//{devices: Array[11], errMsg: "getBluetoothDevices:ok"}
				// console.log('---getBluetoothDevices--success:', res);
				console.log('---getBluetoothDevices--success:', res.devices);
				var scanAllDeviceList = res.devices;
				var filterDeviceList = [];
				// 根据广播UUID进行设备列表筛选, 因为扫描出来的是所有设备,所以要筛选
				for (var i = 0; i < scanAllDeviceList.length; i++) {
					var deviceObj = scanAllDeviceList[i];
					if (!('advertisServiceUUIDs' in deviceObj)) {
						delete scanAllDeviceList[i];
						continue;
					}
					for (let j = 0; j < deviceObj.advertisServiceUUIDs.length; j++) {
						if (deviceObj.advertisServiceUUIDs[j].toUpperCase().indexOf('FEF5') != -1) {
							var devSn = deviceObj.name;
							// console.log("devSn:", devSn);
							if (devSn.indexOf("-") >= 0) {
								filterDeviceList.push({
									"deviceId": deviceObj.deviceId,
									"name": devSn.split("-")[1],
									"RSSI": deviceObj.RSSI
								});
							}
						}
					}
				}
				ret.scanList = filterDeviceList.sort(sortBy("RSSI", false));
				ret.errCode = 0;
				callback(ret);
			},
			fail: function(res) {
				console.log('---getBluetoothDevices--fail:', res);
				callback(ret);
			}
		});
	}, 1500);
}

/**
 * 
 * 参数：
 * @deviceid String 参考scanDevices方法
 * @sendData String 发送到设备的开门指令
 * @callback function 回调函数，用于处理返回值
 * 
 * 返回值：
 * ret{errCode:'', errMsg:'', receiveData:''}
 * errCode: 错误码, 0表示开门成功
 * errMsg: 错误信息，Ok表示开门成功
 * receiveData: 接收的设备消息，消息内容为ac1c8表示开门成功
 */
function openDoor(deviceid, sendData, callback, devSn) {
	var ret = {
		errCode: 0,
		errMsg: 'Ok',
		receiveData: ''
	};

	if (typeof callback != "function") {
		ret.errCode = 6;
		ret.errMsg = 'parameter callback is not a function';
		addBluetoothOpenDoorRecord(devSn, 79, "手机蓝牙开门失败");
		callback(ret);
		return;
	} else if (typeof deviceid != "string" || deviceid === '') {
		ret.errCode = 4;
		ret.errMsg = 'deviceId is not a string type or is empty';
		addBluetoothOpenDoorRecord(devSn, 79, "手机蓝牙开门失败");
		callback(ret);
		return;
	} else if (typeof sendData != "string" || sendData === '') {
		ret.errCode = 5;
		ret.errMsg = 'sendData is not a string type or is empty';
		addBluetoothOpenDoorRecord(devSn, 79, "手机蓝牙开门失败");
		callback(ret);
		return;
	}

	var serviceId = '';
	var characteristics = [];
	var notifyCharacter = '';
	var writeCharacter = '';
	var readCharacter = '';
	var deviceId = deviceid.toUpperCase();

	//BLE蓝牙连接
	uni.createBLEConnection({
		deviceId: deviceId,
		success: function(res) {
			// console.log('---createBLEConnection--success:', res);

			/**
			 * 监听特定BLE设备连接状态变化
			 */
			uni.onBLEConnectionStateChange(function(res) {
				// 该方法回调中可以用于处理连接意外断开等异常情况
				// console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`);
			});

			//获取指定设备的所有服务
			uni.getBLEDeviceServices({
				deviceId: deviceId,
				success: function(res) {

					//筛选指定的服务UUID
					for (var i = 0; i < res.services.length; i++) {
						if (res.services[i].uuid.toLowerCase().indexOf('0886') != -1 ||
							res.services[i].uuid.toLowerCase().indexOf('ffe0') != -1) {
							serviceId = res.services[i].uuid;
							break;
						}
					}

					/**
					 * 获取指定服务下的所有特征值
					 */
					uni.getBLEDeviceCharacteristics({
						deviceId: deviceId,
						serviceId: serviceId,
						success: function(res) {
							for (var i = 0; i < res.characteristics.length; i++) {
								if (res.characteristics[i].uuid.toLowerCase().indexOf('878b') != -1) {
									notifyCharacter = res.characteristics[i].uuid;
								} else if (res.characteristics[i].uuid.toLowerCase().indexOf('878c') != -1) {
									writeCharacter = res.characteristics[i].uuid;
									readCharacter = res.characteristics[i].uuid;
								}
							}

							/**
							 * 启用低功耗蓝牙设备特征值变化时的 notify 功能
							 */
							uni.notifyBLECharacteristicValueChange({
								deviceId: deviceId,
								serviceId: serviceId,
								characteristicId: notifyCharacter,
								state: true,
								success: function(res) {
									console.log('---notifyBLECharacteristicValueChange--success:', JSON.stringify(res));
								}
							});

							/**
							 * 监听低功耗蓝牙设备的特征值变化
							 */
							uni.onBLECharacteristicValueChange(function(res) {
								console.log(`characteristic ${res.characteristicId} has changed, now is ${JSON.stringify(res)}`);
								let buffer = res.value;
								let dataView = new DataView(buffer);
								let receiveData = '';
								for (let i = 0; i < buffer.byteLength; i++) {
									receiveData += dataView.getUint8(i).toString(16);
								}

								/**
								 * 原先的写法
								 */
								// if (sendData.length <= 20) {
								//   // 向蓝牙设备发送20字节16进制数据，如果不超过20字节数据，监听低功耗蓝牙设备的特征值变化，如果超过，就不监听
								//   if (receiveData != 'ac1c8') {
								//     ret.errCode = 7;
								//     ret.errMsg = "paramater 'sendData' is incorrect."
								//   }
								//   ret.receiveData = receiveData;
								//   callback(ret);
								// }

								if (receiveData != 'ac1c8') {
									ret.errCode = 7;
									ret.errMsg = "paramater 'sendData' is incorrect."
								}
								ret.receiveData = receiveData;
								addBluetoothOpenDoorRecord(devSn, 79, "手机蓝牙开门失败");
								callback(ret);

							});

							//向蓝牙设备发送20字节16进制数据，超过20字节数据，分包续传
							var data = sendData;
							var buffer_size = (data.length) > 20 ? (data.length) / 2 : 20;
							var buffer = new ArrayBuffer(buffer_size);
							var dataView = new DataView(buffer);
							for (let i = 0; i < (data.length) / 2; i++) {
								var subData = data.slice(2 * i, 2 * i + 2);
								dataView.setUint8(i, parseInt('0x' + subData));
							}

							/**
							 * 写入特征值下的二进制数据
							 * 
							 */
							setTimeout(function() {
								var count = 0;
								if (buffer_size == 20) {
									count = 1;
								} else {
									count = 2;
								}
								var send_data_array = new Array();
								for (let i = 0; i < count; i++) {
									var start_buffer = i * 20;
									var end_buffer = (i + 1) * 20;
									if (end_buffer > buffer.byteLength) {
										end_buffer = buffer.byteLength;
									}
									var buffer_content = buffer.slice(start_buffer, end_buffer);
									if (buffer_content.byteLength > 0) {
										send_data_array.push(buffer_content);
									}
								}

								var send_index = 0;
								send_bledata_device(send_index, send_data_array);

								function send_bledata_device(send_index, send_data_array) {
									// console.log("----deviceId=" + deviceId + "--serviceId=" + serviceId + "--send_index=" + send_index);                 
									uni.writeBLECharacteristicValue({
										deviceId: deviceId,
										serviceId: serviceId,
										characteristicId: writeCharacter,
										value: send_data_array[send_index],
										success: function(res) {
											console.log('++++++++writeBLECharacteristicValue-success:', res);
											if (send_index < (send_data_array.length - 1)) {
												setTimeout(function() {
													send_index += 1;
													send_bledata_device(send_index, send_data_array);
												}, 250);
											} else {
												// ret.errCode = 0;
												// callback(ret);
												readDevice();
											}
										},
										fail: function(res) {
											ret.errCode = res.errCode; //3
											ret.errMsg = 'writeBLECharacteristicValue fail';
											console.log('++++++++writeBLECharacteristicValue-fail-errorCode:', ret.errCode);
											addBluetoothOpenDoorRecord(devSn, 79, "手机蓝牙开门失败");
											callback(ret);
										},
									})
								}
							}, 500);

							function readDevice() {
								// 必须在这里的回调才能获取
								uni.onBLECharacteristicValueChange(function(res) {
									console.log("ab2hex: " + ab2hex(res.value));
									var value = ab2hex(res.value);
									if (value.length > 10) {
										if(value.startsWith("ac")) {
											return;
										}
									}
									// value是写入特征值成功后，设备回给小程序的响应值，最后两位如果是c8，证明开门成功，否则开门失败，凡是能通过小程序蓝牙开门的，都是这样的，c8转成10进制就是200
									if (value.indexOf("c8") > -1) {
										ret.errCode = 0;
										ret.errMsg = "开门成功";
									} else {
										ret.errCode = 100;
										ret.errMsg = "开门失败";
									}
									var eventType = ret.errCode === 0 ? 19 : 79;
									var desc = ret.errCode === 0 ? "手机蓝牙开门成功" : "手机蓝牙开门失败";
									addBluetoothOpenDoorRecord(devSn, eventType, desc);
									callback(ret);
								});

								uni.readBLECharacteristicValue({
									// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
									deviceId: deviceId,
									// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
									serviceId: serviceId,
									// 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
									characteristicId: writeCharacter,
									success(res) {
										console.log('readBLECharacteristicValue:', JSON.stringify(res));
									}
								});
							}
						},

						fail: function(res) {
							ret.errCode = res.errCode; //2
							ret.errMsg = 'getBLEDeviceCharacteristics fail';
							addBluetoothOpenDoorRecord(devSn, 79, "手机蓝牙开门失败");
							callback(ret);
						},
					})
				},
			})
		},
		fail: function(res) {
			ret.errCode = res.errCode; //1
			ret.errMsg = 'createBLEConnection fail';
			addBluetoothOpenDoorRecord(devSn, 79, "手机蓝牙开门失败");
			callback(ret);
		},
	});
}

// 添加蓝牙开门记录
function addBluetoothOpenDoorRecord(devSn, eventType, desc) {
	if (devSn === undefined) return;
	var loginInfo = uni.getStorageSync("loginInfo");
	var accessToken = loginInfo.accessToken;
	console.log("token", accessToken);
	if (accessToken === undefined) return;
	// 登录过
	var time = getCurrentTime();
	// var record = [{"devSn": devSn, "eventType": eventType, "desc": desc, "eventTime": time}];
	var platform = uni.getSystemInfoSync().platform.toLowerCase();
	var terminalOsType = platform.indexOf("ios") > -1 ? 2 : 1;
	// var record = [{
	// 		"devSn": "3759239441",
	// 		"eventType": 19,
	// 		"terminalApplyType": 2,
	// 		"terminalOsType": terminalOsType,
	// 		"eventTime": "2019-11-16 16:46:55"
	// 	},
	// 	{
	// 		"devSn": "3759239441",
	// 		"eventType": 19,
	// 		"terminalApplyType": 2,
	// 		"terminalOsType": terminalOsType,
	// 		"eventTime": "2019-11-16 16:46:55"
	// 	}
	// ];
	var record = [{
		"devSn": devSn,
		"eventType": eventType,
		"terminalApplyType": 2,
		"terminalOsType": terminalOsType,
		"eventTime": time
		},
	];
	uni.request({
		url: loginInfo.baseUrl + "/appBluetoothSdk/addEventLog?accessToken=" + accessToken,
		data: record,
		header: {
			// 'content-type': 'application/json; charset=UTF-8', 
			'content-type': 'application/json',
		},
		method: "POST",
		success: (res) => {
			console.log("添加蓝牙开门记录---", res);
			var data = res.data;
			if (data.code === 0) {
				console.log("添加蓝牙开门记录成功");
			} else {
				console.log("添加蓝牙开门记录失败, errCode=", data.code);
			}
		},
		fail: (err) => {
			console.log("添加蓝牙开门记录失败, fail=", err);
		}
	});
}

function ab2hex(buffer) {
	let hexArr = Array.prototype.map.call(
		new Uint8Array(buffer),
		function(bit) {
			return ('00' + bit.toString(16)).slice(-2);
		}
	)
	return (hexArr.join('')).toLowerCase();
}

// 获取当前时间 返回YYYY-MM-DD HH:MM:SS
function getCurrentTime() {
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var second = date.getSeconds();
	return [year, month, day].join('-') + ' ' + [hour, minute, second].join(':');
}

// 蓝牙sdk登录，上传蓝牙开门记录
function login(account, baseUrl, appId, appSecret) {
	console.log("开始蓝牙登录");
	var loginInfo = {
		"baseUrl": baseUrl,
		"appId": appId,
		"appSecret": appSecret
	};
	uni.setStorageSync("loginInfo", loginInfo);
	uni.request({
		url: baseUrl + "/appUserSdk/login",
		data: {
			"account": account,
			"appId": appId,
			"appSecret": appSecret,
			"accountType": 1
		},
		// header: {
		// 	'content-type': 'application/x-www-form-urlencoded', 
		// },
		// method: "POST",
		success: (res) => {
			console.log("蓝牙登录返回，res---", res);
			var data = res.data;
			if (data.code === 0) {
				loginInfo.accessToken = data.data.accessToken;
				uni.setStorageSync("loginInfo", loginInfo);
				console.log("蓝牙登录成功，loginInfo===", loginInfo);
			} else {
				uni.showToast({
					title: data.msg
				})
				console.log("蓝牙登录失败，code-", data.code);
			}

		},
		fail: (err) => {
			uni.showToast({
				title: err
			});
		}
	})
}



// 根据参数来确定是升序还是降序
function sortBy(attr, rev) {
	// 第二个参数没有传递，默认升序排列
	if (rev == undefined) {
		rev = 1;
	} else {
		rev = rev ? 1 : -1;
	}
	return function(a, b) {
		var n1 = a[attr];
		var n2 = b[attr];
		if (n1 < n2) {
			return rev * -1;
		}
		if (n1 > n2) {
			return rev * 1;
		}
		return 0;
	}
}

function stringParseInt(string) {
	var stringNumber = string.replace(/[^0-9]+/g, '');
	if (stringNumber !== "") {
		return parseInt(stringNumber);
	}
	return NaN;
}

module.exports = {
	scanDevices: scanDevices,
	login: login,
	openDoor: openDoor
}
