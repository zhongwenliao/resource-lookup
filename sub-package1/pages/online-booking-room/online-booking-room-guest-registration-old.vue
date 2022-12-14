<template>
	<uni-base-page class="content">
		<view style="background: #FFFFFF;" class="form-view">
			<!-- 预约手机号 start -->
			<view class="fill-area">
				<view class="left-name"><text class="require-text"> * </text>{{ "预约手机号" }}</view>
				<view class="right-input">
					<input type="text" @input="inputPhoneNumber" :placeholder="'请输入手机号'" :password="false" />
				</view>
			</view>
			<!-- 预约手机号 end -->
			
			<!-- 姓名 start -->
			<view class="fill-area" v-if="userInfo.name">
				<view class="left-name"><text class="require-text"> * </text>{{ "姓名" }}</view>
				<view class="right-input">
					<input type="text" :password="false" :disabled="true" v-model="userInfo.name" />
				</view>
			</view>
			<!-- 姓名 end -->
			
			<!-- 身份证号码 start -->
			<view class="fill-area" v-if="userInfo.certNo">
				<view class="left-name"><text class="require-text"> * </text>{{ "身份证号码" }}</view>
				<view class="right-input">
					<input type="text" :password="false" :disabled="true" v-model="userInfo.certNo" />
				</view>
			</view>
			<!-- 身份证号码 end -->
			
			<!-- 入住时间 start -->
			<view class="fill-area" v-if="userInfo.accStartdatetime">
				<view class="left-name"><text class="require-text"> * </text>{{ "入住时间" }}</view>
				<view class="right-input">
					<input type="text" :password="false" :disabled="true" v-model="userInfo.accStartdatetime" />
				</view>
			</view>
			<!-- 入住时间 end -->
			
			<!-- 离店时间 start -->
			<view class="fill-area" v-if="userInfo.accEnddatetime">
				<view class="left-name"><text class="require-text"> * </text>{{ "离店时间" }}</view>
				<view class="right-input">
					<input type="text" :password="false" :disabled="true" v-model="userInfo.accEnddatetime" />
				</view>
			</view>
			<!-- 离店时间 end -->
			
			<template v-if="idVerifyStatus">
				<!-- 上传人脸照片 start -->
				<view class="fill-area">
					<view class="upload-photo">
						<text class="require-text">*</text> <text>{{ "人脸照片" }}</text>
						<view v-if="faceCaptureImagePath" style="margin: 30upx 0;">
							<image :src="faceCaptureImagePath" class="item-picture">
								<button class="delete-btn" @click="deletePhoto">
									<image src="/sub-package1/static/img/delete.png" />
								</button>
							</image>
						</view>
						<view v-else style="margin: 30upx 0;">
							<button @click="takePhoto" class="take-photo-btn">
								<image src="/sub-package1/static/img/camera.png" />
							</button>
						</view>
					</view>
				</view>
				<!-- 上传人脸照片 end -->
			</template>
			
		</view>
		<view class="submit-btn">
			<button type="primary" class="btn" :disabled="!phoneNumber" @click="onClick">{{ idVerifyStatus ? "提交" : "下一步" }}</button>
		</view>
		<view class="submit-btn">
			<button type="primary" class="btn" @click="openDoor">{{ "蓝牙开门" }}</button>
		</view>
	</uni-base-page>
</template>

<script>
	let mpBluetoothSDK = require("@/common/js/doormaster-weixin-bluetooth-sdk-v1.7.js");
	let devObj = {};
	let isIdVerify = false, faceCaptureImageBase64 = "", certNo = "", name = "", timer = null, communityId = null, roomId = null;
	export default {
		data() {
			return {
				phoneNumber: "",
				disabled: false,
				userInfo: {
					name: "",
					certNo: "",
					id: null,
					certNoEncode: ""   // 加密的64位身份证识别码
				},
				idVerifyStatus: false,
				faceCaptureImagePath: ""
			}
		},
		onLoad(options) {
			// this.$showToast(options.devSn);
			devObj.devSn = options.devSn;
			// devObj.devMac = options.devMac;
			this.$showLog("devSn", options.devSn);
			// #ifdef MP-WEIXIN 
			mpBluetoothSDK.scanDevices((res) => {
				this.$showLog("scanDev", res);
				if (res.errCode === 0) {
					let scanDevList = res.scanList;
					for (let i = 0; i < scanDevList.length; i++) {
						if (scanDevList[i]["name"].indexOf(devObj.devSn) > -1) {
							// 匹配到设备
							devObj.deviceId = scanDevList[i]["deviceId"];
							break;
						}
					}
					this.$showLog("devObj", devObj);
					if (!devObj.deviceId) {
						// 没有扫描到该设备
						this.$showToast("没有扫描到该设备，请退出后重新扫描");
					}
				}
			});
			// #endif
		},
		methods: {

			// 输入框内容
			inputPhoneNumber(e) {
				this.phoneNumber = e.detail.value;
			},
			
			// 身份证核验
			idVerify() {
				uni.request({
					url: "https://app-api.thinmoo.com/persEmpHousehold/app/getByPhoneAndDevSn?devSn=" + devObj.devSn + "&phone=" + this.phoneNumber + "&appId=" + "54a4210c2e2b4116b3b67d9b72d8660e",
					method: "GET",
					success: (res) => {
						let result = res.data;
						this.$showLog("result", result);
						if (result.code === 0) {
							let data = result.data, devInfo = data.devDevice;
							this.userInfo = data.persEmp;
							certNo = this.userInfo.certNo;
							name = this.userInfo.name;
							communityId = this.userInfo.communityId;
							roomId = this.userInfo.roomId;
							// this.userInfo.certNo = this.userInfo.certNo.replace(/(\d{5})\d{9}(\d{4})/, "$1******$2");
							// this.userInfo.name = this.userInfo.name.replace(/^(.).+(.)$/g, "$1*$2");
							this.userInfo.certNo = this.$encryptionUtil.encryptCertNo(this.userInfo.certNo);
							this.userInfo.name = this.$encryptionUtil.encryptName(this.userInfo.name);
							devObj.devMac = devInfo.platDeviceStock.devMac;
							devObj.devKey = devInfo.platDeviceStock.devKey;
							// devObj.devMac = devInfo.platDeviceStock.devMac;
							devObj.ekey = "AC1053" + this.devKeyReverse(devObj.devKey) + this.userInfo.certNoEncode;
							this.$showLog("ekey", devObj.ekey);
							// this.$showToast("certNo: " + certNo + ", userId: " + userId + ", 验证通过，请在10秒内在门锁上刷身份证验证身份");
							this.$showToast("请在5秒内在门锁上刷身份证验证身份");
							this.idVerifyStatus = false;
							setTimeout(() => {
								this.$showLoading("正在验证身份");
								mpBluetoothSDK.verifyIdInfo(devObj, (res) => {
									if (res.errCode === 0) {
										// 表明设备已经成功接收小程序发送的数据，顺延8s，再发一条指令，获取验证结果
										devObj.ekey = "AC1112" + this.devKeyReverse(devObj.devKey);  // AC1112788cb3fa75e43b328e6c2c0c2ac08f4f
										setTimeout(() => {
											mpBluetoothSDK.verifyIdInfo(devObj, (res) => {
												if (res.errCode === 1000) {
													// 默认为设备没响应，3s后再连接一次
													setTimeout(() => {
														mpBluetoothSDK.verifyIdInfo(devObj, (res) => {
															if (timer) {
																clearTimeout(timer);
															}
															this.$hideLoading();
															if (res.errCode === 0) {
																this.idVerifyStatus = true;
																this.$showToast("身份验证成功，请拍摄入住人人脸照片");
															} else {
																this.idVerifyStatus = false;
																this.$showToast(res.errMsg);
															}
														});
													}, 3000);
												} else {
													if (timer) {
														clearTimeout(timer);
													}
													this.$hideLoading();
													if (res.errCode === 0) {
														this.idVerifyStatus = true;
														this.$showToast("身份验证成功，请拍摄入住人人脸照片");
													} else {
														this.idVerifyStatus = false;
														this.$showToast(res.errMsg);
													}
												}
											});
										}, 8000);
									} else {
										if (timer) {
											clearTimeout(timer);
										}
										this.$hideLoading();
										this.idVerifyStatus = false;
										this.$showToast(res.errMsg);
									}
								});
							}, 1500);
							if (timer) {
								clearTimeout(timer);
								timer = null;
								timer = setTimeout(() => {
									if (!this.idVerifyStatus) {
										this.$hideLoading();
										this.$showToast("验证超时，请重新验证");
									}
								}, 22000);
							}
						} else {
							this.$showToast(result.msg);
						}
					}
				});
			},
			
			// 人证核验，验证是否本人
			peopleIDVerify() {
				// 验证是否本人
				let sendData = {
					"realName": name,
					"idCard": certNo,
					"gender": this.userInfo.gender,
					// "faceCaptureImage": "123"
					"faceCaptureImage": faceCaptureImageBase64,
					"communityId": communityId,
					"roomId": roomId
				};
				this.$showLog("sendData", sendData);
				this.$showLoading("正在审核信息...");
				
				uni.request({
					url: "https://app-api.thinmoo.com/persEmpHousehold/app/verifyIdCardPhoto",
					method: "POST",
					header: {
						"content-type": "application/x-www-form-urlencoded"
					},
					data: sendData,
					success: (res) => {
						this.$hideLoading();
						let result = res.data;
						this.$showLog("result", result);
						if (result.code === 0) {
							this.$showToast("身份核验成功");
							setTimeout(() => {
								this.$showLoading("正在门锁授权");
								// 清空vsam数据
								devObj.type = 14;
								devObj.ekey = "AC1413" + this.devKeyReverse(devObj.devKey);  // "AC" + 14(14指令表示清空vsam数据) + 13(devKey有16个字节，加上前面的三个字节，一共有19个字节，转成16进制为13)
								let _this = this;
								mpBluetoothSDK.sendEkey(devObj, (res) => {
									if (res.errCode === 0) {
										// 清空vsam数据成功，开始执行同步时间，先获取当前时间
										devObj.type = 13;
										let time = new Date(), timeArr = [];
										let year = (time.getFullYear() + "").substr(2);
										let month = time.getMonth() + 1;
										let date = time.getDate();
										let hour = time.getHours();
										let min = time.getMinutes();
										let sec = time.getSeconds();
										let day = time.getDay();
										timeArr = timeArr.concat(year, month, date, hour, min, sec, day);
										let timeStr = "";
										for (let i = 0; i < timeArr.length; i++) {
											timeStr += this.intToHex(parseInt(timeArr[i]));
										}
										timeStr = timeStr;
										this.$showLog("timeStr", timeStr);
										devObj.ekey = "AC131A" + this.devKeyReverse(devObj.devKey) + timeStr; // "AC" + 13(13指令表示同步时间) + 1B(devKey有16个字节，加上前面的三个字节，加上后面的时间有8个字节（2020111513010000），一共27个字节，转为16进制为1B)
										mpBluetoothSDK.sendEkey(devObj, (res) => {
											if (res.errCode === 0) {
												// 同步时间成功，开始执行门禁授权
												// this.$hideLoading();
												// this.$showToast("门禁授权成功");
												devObj.type = 12;
												let accStartdatetimeStr = this.userInfo.accStartdatetime.split("-").join("").split(":").join("").replace(/\s+/g, "");
												accStartdatetimeStr = accStartdatetimeStr.substr(2, 8);
												let accEnddatetimeStr = this.userInfo.accEnddatetime.split("-").join("").split(":").join("").replace(/\s+/g, "");
												accEnddatetimeStr = accEnddatetimeStr.substr(2, 8);
												devObj.ekey = "AC1267" + this.devKeyReverse(devObj.devKey) + this.userInfo.certNoEncode + 
														this.userInfo.id + this.$strToHexCharCode(accStartdatetimeStr) + this.$strToHexCharCode(accEnddatetimeStr);
												
												mpBluetoothSDK.sendEkey(devObj, (res) => {
													if (res.errCode === 0) {
														// 同步时间成功，开始执行门禁授权
														this.$hideLoading();
														this.$showToast("门禁授权成功");
													} else {
														this.$hideLoading();
														this.$showToast("门禁授权失败");
													}
												});
											} else {
												this.$hideLoading();
												this.$showToast("门禁授权失败");
											}
										});
									} else {
										this.$hideLoading();
										this.$showToast("门禁授权失败");
									}
								});
							}, 1000);
						} else {
							this.$showToast(result.msg);
						}
					}
				});
				
				
				
				
				// setTimeout(() => {
				// 	this.$hideLoading();
				// 	this.$showToast("身份核验成功");
				// 	setTimeout(() => {
				// 		this.$showLoading("正在门锁授权");
				// 		// 清空vsam数据
				// 		devObj.type = 14;
				// 		devObj.ekey = "AC1413" + this.devKeyReverse(devObj.devKey);  // "AC" + 14(14指令表示清空vsam数据) + 13(devKey有16个字节，加上前面的三个字节，一共有19个字节，转成16进制为13)
				// 		let _this = this;
				// 		mpBluetoothSDK.sendEkey(devObj, (res) => {
				// 			if (res.errCode === 0) {
				// 				// 清空vsam数据成功，开始执行同步时间，先获取当前时间
				// 				devObj.type = 13;
				// 				let time = new Date(), timeArr = [];
				// 				let year = (time.getFullYear() + "").substr(2);
				// 				let month = time.getMonth() + 1;
				// 				let date = time.getDate();
				// 				let hour = time.getHours();
				// 				let min = time.getMinutes();
				// 				let sec = time.getSeconds();
				// 				let day = time.getDay();
				// 				timeArr = timeArr.concat(year, month, date, hour, min, sec, day);
				// 				let timeStr = "";
				// 				for (let i = 0; i < timeArr.length; i++) {
				// 					timeStr += this.intToHex(parseInt(timeArr[i]));
				// 				}
				// 				timeStr = timeStr;
				// 				this.$showLog("timeStr", timeStr);
				// 				devObj.ekey = "AC131A" + this.devKeyReverse(devObj.devKey) + timeStr; // "AC" + 13(13指令表示同步时间) + 1B(devKey有16个字节，加上前面的三个字节，加上后面的时间有8个字节（2020111513010000），一共27个字节，转为16进制为1B)
				// 				mpBluetoothSDK.sendEkey(devObj, (res) => {
				// 					if (res.errCode === 0) {
				// 						// 同步时间成功，开始执行门禁授权
				// 						// this.$hideLoading();
				// 						// this.$showToast("门禁授权成功");
				// 						devObj.type = 12;
				// 						let accStartdatetimeStr = this.userInfo.accStartdatetime.split("-").join("").split(":").join("").replace(/\s+/g, "");
				// 						accStartdatetimeStr = accStartdatetimeStr.substr(2, 8);
				// 						let accEnddatetimeStr = this.userInfo.accEnddatetime.split("-").join("").split(":").join("").replace(/\s+/g, "");
				// 						accEnddatetimeStr = accEnddatetimeStr.substr(2, 8);
				// 						devObj.ekey = "AC1267" + this.devKeyReverse(devObj.devKey) + this.userInfo.certNoEncode + 
				// 								this.userInfo.id + this.$strToHexCharCode(accStartdatetimeStr) + this.$strToHexCharCode(accEnddatetimeStr);
												
				// 						// devObj.ekey = "AC126B" + this.devKeyReverse(devObj.devKey) + this.userInfo.id + 
				// 						// 			  this.$strToHexCharCode(accStartdatetimeStr) + this.$strToHexCharCode(accEnddatetimeStr);
												
				// 						mpBluetoothSDK.sendEkey(devObj, (res) => {
				// 							if (res.errCode === 0) {
				// 								this.$hideLoading();
				// 								this.$showToast("门禁授权成功");
				// 							} else {
				// 								this.$hideLoading();
				// 								this.$showToast("门禁授权失败");
				// 							}
				// 						});
				// 					} else {
				// 						this.$hideLoading();
				// 						this.$showToast("门禁授权失败");
				// 					}
				// 				});
				// 			} else {
				// 				this.$hideLoading();
				// 				this.$showToast("门禁授权失败");
				// 			}
				// 		});
				// 	}, 1000);
				// }, 2000);
				
			},

			// 点击
			onClick() {
				if (!this.idVerifyStatus) {
					this.idVerify();
				} else {
					this.peopleIDVerify();
				}
			},
			
			// 调用拍照
			async takePhoto() {
				this.$chooseImage({
					imageSize: 40,
					sourceType: ["camera"],
					success: (res) => {
						// console.log("调用公共方法,", res);
						faceCaptureImageBase64 = res.imageBase64;
						this.faceCaptureImagePath = res.imagePath;
					}
				});
			},
			
			// 删除照片
			deletePhoto() {
				this.faceCaptureImagePath = "";
				faceCaptureImageBase64 = "";
			},
			
			// 蓝牙开门
			openDoor() {
				// devObj.ekey = "AC0105472a32b1c023fe07a5c10a51c6e693bf";  // 1488118895
				devObj.ekey = "AC0105788cb3fa75e43b328e6c2c0c2ac08f4f";  // 1016291521
				mpBluetoothSDK.openDoor(devObj, (res) => {
					this.$showLog("开门结果", res);
				});
			},
			
			// devKey倒转
			devKeyReverse(devKey) {
				let strList = [];
				for (let i = 0; i < devKey.length; i+=8) {
					let subStr = devKey.substr(i, 8);
					let subStrList = [];
				    for (let j = 0; j < subStr.length; j+=2) {
						let subSubStr = subStr.substr(j, 2);
						subStrList.unshift(subSubStr);
					}
					strList.push(subStrList.join(""));
				}
				return strList.join("");
			},
			
			intToHex(num) {
				let result = num.toString(16);
				if (result.length === 1) {
					result = "0" + result;
				}
				return result;
			}
		}
	}
</script>

<style lang="scss">
	.submit-btn {
		width: 25%;
		margin: 40upx auto;
	}

	.btn {
		background: #1E90FF;
		color: #FFFFFF;
		font-size: 28upx;
	}
	
	
	.auth-id-tip {
		display: flex;
		flex-direction: row;
		align-items: center;
		color: #EDA329;
		padding: 10upx 3%;
		background: #FDFAE9;
	}
	
	.content {
		background-color: #FFFFFF;
	}
	
	.fill-area {
		background: #FFFFFF;
		min-height: 100upx;
		height: auto;
		display: flex;
		width: 94%;
		margin-left: 3%;
		margin-right: 3%;
		margin-bottom: 4upx;
		border-bottom: 2upx solid #EEEEEE;
		align-items: center;
	}
	
	.left-name {
		width: 27%;
		margin-top: 3%;
		text-align: left;
		display: inline-block;
		overflow: auto;
	}
	
	.right-input {
		width: 65%;
		margin-left: 5%;
		padding-right: 50upx;
		margin-top: 3%;
		overflow: auto;
		text-align: left;
		display: inline-block;
	}
	
	.right-input input {
		font-size: 28upx;
		padding: 6upx;
	}
	
	.middle-input {
		width: 40%;
		margin-left: 5%;
		margin-top: 3%;
		overflow: auto;
		text-align: left;
		display: inline-block;
	}
	
	.middle-input input {
		font-size: 28upx;
		padding: 6upx;
	}
	
	.right-btn {
		width: 25%;
		margin-top: 3%;
		margin-left: 2%;
		overflow: auto;
		display: inline-block;
	}
	
	.verify-code-button {
		background: #ffffff;
		color: #1E90FF;
		border: 1upx solid #1E90FF;
		font-size: 24upx;
		padding: 0;
	}
	
	
	.submit-btn {
		width: 95%;
		margin: 40upx auto;
	}
	
	.btn {
		background: #1E90FF;
		color: #FFFFFF;
		font-size: 28upx;
	}
	
	.step-style {
		width: 96%;
		margin: 10upx 2%;
		font-size: 32upx;
		font-weight: 700;
	}
	
	.upload-photo {
		width: 94%;
		margin: 3% 0;
		background-color: #ffffff;
	}
	
	.take-photo-btn {
		display: block;
		width: 200upx;
		height: 200upx;
		/* border: 1upx solid #d2d2d2; */
		border-radius: 0;
	}
	
	.take-photo-btn image {
		display: inline-block;
		width: 40upx;
		height: 40upx;
		vertical-align: middle;
		margin-top: 50%;
	}
	
	.item-picture {
		display: block;
		width: 250upx;
		height: 300upx;
		margin: 0 auto;
	}
	
	.change-button {
		border-radius: 25upx;
		color: #FDFAE9;
		text-align: center;
		background-color: #EDA329;
		width: 35%;
		padding: 0;
	}
	
	.delete-btn {
		position: absolute;
		border-width: 0upx !important;
		border-style: none;
		padding: 0;
		margin-left: 424upx;
		margin-top: -328upx;
		background: transparent;
	}
	
	.upload-photo button::after {
		border: none;
	}
	
	.delete-btn image {
		width: 32upx;
		height: 32upx;
	}
	
	.info-box {
		border-radius: 20upx;
		margin-top: 5%;
	}
	
	.form-view-box {
		width: 96%;
		margin: 0 auto;
	}
	
	.right-arrow:after {
		font-family: uniicons;
		content: '\e583';
		position: absolute;
		right: 24upx;
		top: 50%;
		color: #bbb;
		-webkit-transform: translateY(-50%);
		transform: translateY(-50%);
	}
	
	.auth-id-page {
		.aui-poster-main .aui-poster-view {
			width: 90%;
			height: 50vh;
			border: 10upx solid #057D7F;
			border-radius: 20upx;
			pointer-events: auto;
			position: static;
			/* z-index: 9; */
			padding: 30upx 20upx;
		}
		
		.aui-poster-top {
			height: 120upx;
			line-height: 120upx;
			color: #057D7F;
			padding: 10upx;
			/* margin-bottom: 40upx; */
		}
		
		.aui-poster-top image{
			width: 120upx;
			height: 120upx;
			display: inline-block;
		}
		
		/* .annouce-tips {
			display: inline-block;
			height: 120upx;
			vertical-align: middle;
		} */
		
		.aui-poster-title {
			font-size: 32upx;
			font-weight: bold;
			text-align: center;
		}
	}
</style>
