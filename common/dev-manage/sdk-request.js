/**
 * @file 蓝牙操作后的相关服务器请求
 * @author chenzhiwei zhangya chenli
 * @createDate 2020-09-04
 * 
 */
import Vue from 'vue';
var _this = Vue.prototype;
// 添加蓝牙开门记录

// 解析卡号为指纹id，解决指纹开门记录上传到后台，没有显示姓名问题，该方法只用于处理指纹开门，现在将这个转化操作放在服务器端处理，前端不做处理
function parsingCardNo (cardNo) {
	// 通过蓝牙读取门锁设备最近开门记录，将指纹开门类型中的卡号转成服务器能识别的指纹id（这个指纹id是首先APP在登记指纹前，先从服务器获
	// 取到指纹id，然后将指纹id登记到门锁设备，只不过在获取指纹开门记录中，卡号对应的值不是服务器给的指纹id，得转）
	
	// 将卡号转成16进制，再转成全大写
	if (!cardNo) {
		return cardNo;
	}
	let cardNo16 = parseInt(cardNo).toString(16).toUpperCase();
	let fingerprintId = 0;
	if (cardNo16.match(/.{2}/g)) {
		// 将16进制卡号倒转
		cardNo16 = cardNo16.match(/.{2}/g).reverse().join("");
		// 将倒转的16进制卡号转成10进制指纹id
		fingerprintId = parseInt(cardNo16, 16);
	}
	_this.$showLog("转化指纹id", fingerprintId);
	return fingerprintId;
}
class SdkRequest {
	constructor(args) {
	    
	}
	
	// 上传开门记录
	addBluetoothOpenDoorRecord(openDoorRecord) {
		let accessToken = _this.$getUserInfo().accessToken, baseUrl = _this.$getConfigParam().baseUrl,
			time = _this.$getCurrentTime(), platform = uni.getSystemInfoSync().platform.toLowerCase(),
			terminalOsType = platform.indexOf("ios") > -1 ? 2 : 1;
		// console.log("------accessToken------", accessToken);
		console.log("------time------", time);
		
		if (accessToken === undefined) {
			uni.showModal({
				title: 'accessToken === undefined',
				content: '``````',
				success() {
					// console.log(111)
				}
			})
			return;
		}
		// 登录过
		let notUploadedRecord = uni.getStorageSync("notUploadedRecord");
		if(notUploadedRecord.length > 0) {
			openDoorRecord = openDoorRecord.concat(notUploadedRecord);
		}
		var recordStr = JSON.stringify(openDoorRecord);
		
		console.log("上传开门记录:", recordStr);
		// uni.showToast({
		// 	title: '发起请求了'
		// })
		uni.request({
			url: baseUrl + "/accEventlog/app/add?accessToken=" + accessToken,
			data: recordStr,
			header: {
				'content-type': 'application/json',
			},
			timeout: 60000,
			method: "POST",
			success: (res) => {
				// console.log("res-----",res.data);
				let data = res.data;
				if (data.code === 0) {
					console.log("-----添加开门记录成功-----");
					uni.setStorageSync("notUploadedRecord", []);
				} else {
					uni.setStorageSync("notUploadedRecord", openDoorRecord);
				}
			},
			fail: (err) => {
				// uni.showToast('请求失败了')
				console.log("-----添加开门记录失败-----, fail=", err);
				uni.setStorageSync("notUploadedRecord", openDoorRecord);
			}
		});
	}
	
	/**
	 * 过滤开门类型
	 * 设备返回的开门记录类型：1:蓝牙开门, 2:刷卡开门, 3: 密码开门, 4:远程开门, 5:触摸开门,6:指纹开门, 7:二维码，8:固定密码，9: vsam身份证模式识别开门
	 * 开门记录结果openDoorResult：0：成功，1：失败
	 */
	filterOpenDoorType(recordList, device, callback) {
		// console.log("-----设备-----",device);
		let openDoorRecord = [];
		for(let i in recordList) {
			let result = recordList[i].result;
			let openDoorEvent = {
				1: result == 0 ? 19 : 79,
				2: result == 0 ? 0 : 47,
				3: result == 0 ? 20 : 77,
				4: 999,
				5: 999,
				6: result == 0 ? 24 : 65,
				7: result == 0 ? 23 : 74,
				8: result == 0 ? 4 : 50,
				9: result == 0 ? 67 : 68
			}
			let eventReturnNumber = {
				1: "",
				2: recordList[i].cardno,
				3: recordList[i].password,
				4: "",
				5: "",
				6: recordList[i].cardno,
				7: "",
				8: recordList[i].password,
				9: recordList[i].identity
			}
			let recordTime = recordList[i].date; 
			let recordTimeStr = recordTime.substring(0, 4) + "-" + recordTime.substring(4, 6) + "-" +
				recordTime.substring(6, 8) + " " + recordTime.substring(8, 10) + ":" + recordTime.substring(10, 12) + ":" + recordTime.substring(12, 14);
			openDoorRecord.push({
				devSn: device.devSn,
				eventType: openDoorEvent[recordList[i].type],
				eventTime: recordTimeStr,
				number: eventReturnNumber[recordList[i].type]
			});
		}
		return openDoorRecord;
	}
}

let sdkRequest = new SdkRequest();
module.exports = sdkRequest;