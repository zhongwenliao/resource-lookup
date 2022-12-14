<template>
	<uni-base-page class="content">
		<view style="background: #FFFFFF;" class="form-view">
			
			<view v-if="userInfo.checkInStatus == 0 || userInfo.checkInStatus == 2">
				<!-- 身份证号码 start -->
				<view class="fill-area">
					<view class="left-name"><text class="require-text"> * </text>{{ "入住人身份证号码" }}</view>
					<view class="right-input">
						<input type="text" @input="inputCertNo" :placeholder="'请输入身份证号码'" :password="false" v-model="certNo" />
					</view>
				</view>
				<!-- 身份证号码 end -->
				
				<!-- 人脸照片 start -->
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
				<!-- 人脸照片 end -->
			</view>
			
			<view v-if="isVerifyId" style="margin-top: 10upx; width: 100%;">
				
				<view style="text-align: center;">
					入住信息
				</view>
				
				<!-- 入住人姓名 start -->
				<view class="fill-area" style="border-bottom: none;">
					<view class="left-name">{{ "入住人姓名" }}</view>
					<view class="right-input">
						<input type="text" :password="false" v-model="userInfo.name" :disabled="true" />
					</view>
				</view>
				<!-- 入住人姓名 end -->
				
				<!-- 入住人手机号 start -->
				<view class="fill-area" style="border-bottom: none;">
					<view class="left-name">{{ "入住人手机号" }}</view>
					<view class="right-input">
						<input type="text" :password="false" v-model="userInfo.phone" :disabled="true" />
					</view>
				</view>
				<!-- 入住人手机号 end -->
				
				<!-- 入住地址 start -->
				<!-- <view class="fill-area" style="border-bottom: none;">
					<view class="left-name">{{ "入住地址" }}</view>
					<view style="width: 58%; margin-left: 5%; padding-right: 50upx; margin-top: 3%; display: inline-block;">
						<input type="text" :password="false" v-model="userInfo.roomName" :disabled="true" />
					</view>
				</view> -->
				<!-- 入住地址 end -->
				
				<!-- 入住时间 start -->
				<view class="fill-area" style="border-bottom: none;">
					<view class="left-name">{{ "入住时间" }}</view>
					<view class="right-input">
						<input type="text" :password="false" v-model="userInfo.accStartdatetime" :disabled="true" />
					</view>
				</view>
				<!-- 入住时间 end -->
				
				<!-- 离店时间 start -->
				<view class="fill-area" style="border-bottom: none;">
					<view class="left-name">{{ "离店时间" }}</view>
					<view class="right-input">
						<input type="text" :password="false" v-model="userInfo.accEnddatetime" :disabled="true" />
					</view>
				</view>
				<!-- 离店时间 end -->
				
				<!-- 临时密码 start -->
				<!-- <view class="fill-area" style="border-bottom: none;">
					<view class="left-name">{{ "临时密码" }}</view>
					<view class="right-input">
						<input type="text" :password="false" v-model="userInfo.tempPwd" :disabled="true" />
					</view>
				</view> -->
				<!-- 临时密码 end -->
				
			</view>
			
		</view>
		<view class="submit-btn" v-if="!isVerifyId">
			<button type="primary" class="btn" :disabled="isVerifyId" @click="onClick">{{ "提交" }}</button>
		</view>
		<view class="submit-btn" v-if="isShowOpenDoorBtn">
			<button type="primary" class="btn" @click="openDoor">{{ "蓝牙开门" }}</button>
		</view>
	</uni-base-page>
</template>

<script>
	let mpBluetoothSDK = require("@/common/js/doormaster-weixin-bluetooth-sdk-v1.7.js");
	let devObj = {};
	let gender = 0, faceCaptureImageBase64 = "", certNo = "", name = "", phone = "", devSn = "", accStartdatetime = "", 
		accEnddatetime = "", deviceId = "", miniEkey = "", communityId = null, roomId = null, roomName = "", accessToken = ""; // accessToken用于上传蓝牙开门记录
	export default {
		data() {
			return {
				certNo: "",
				userInfo: {
					name: "",
					certNo: "",
					id: null,
					phone: "",
					accStartdatetime: "",
					accEnddatetime: "",
					tempPwd: "",
					checkInStatus: 0,
					roomName: ""
				},
				faceCaptureImagePath: "",
				isVerifyId: false,
				isShowOpenDoorBtn: false
			}
		},
		onLoad(options) {
			gender = options.gender;
			certNo = options.certNo;
			name = options.name;
			phone = options.phone;
			devSn = options.devSn;
			accStartdatetime = options.accStartdatetime;
			accEnddatetime = options.accEnddatetime;
			deviceId = options.deviceId;
			miniEkey = options.miniEkey;
			communityId = options.communityId;
			roomId = options.roomId;
			roomName = options.roomName;
			this.userInfo.checkInStatus = options.checkInStatus;
			if (this.userInfo.checkInStatus == 1) {
				this.isVerifyId = true;
				this.userInfo = {
					"phone": phone,
					"name": name,
					"accStartdatetime": accStartdatetime,
					"accEnddatetime": accEnddatetime,
					"roomName": roomName
				};
				this.openDoor();
			} else {
				this.isVerifyId = false;
			}
			this.$showLog("checkInStatus", this.userInfo.checkInStatus);
			this.sdkLogin(phone);  // sdk登录，当蓝牙开门成功后，上传蓝牙开门记录
		},
		methods: {
			// SDK登录
			sdkLogin(account) {
				let sendData = {
					"account": account,
					"appId": "54a4210c2e2b4116b3b67d9b72d8660e",
					"appSecret": "1d559bc993d550af5d6b6291ed2ae296",
					"accountType": 1
				};
				uni.request({
					url: "https://app-api.thinmoo.com/appUserSdk/login",
					method: "POST",
					header: {
						"content-type": "application/x-www-form-urlencoded"
					},
					data: sendData,
					success: (res) => {
						let result = res.data;
						if (result.code === 0) {
							accessToken = result.data.accessToken;
						}
						this.$showLog("result", result);
					}
				});
			},
			// 输入框内容
			inputCertNo(e) {
				this.certNo = e.detail.value;
			},
			
			// 人证核验，验证是否本人
			peopleIDVerify() {
				// 验证是否本人
				let sendData = {
					"realName": name,
					"idCard": certNo,
					"gender": gender,
					// "faceCaptureImage": "123"
					"faceCaptureImage": faceCaptureImageBase64,
					"communityId": communityId,
					"roomId": roomId,
					"appId": "54a4210c2e2b4116b3b67d9b72d8660e"
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
						let result = res.data;
						// this.$hideLoading();
						// this.$showLog("result", result);
						if (result.code === 0) {
							this.$showToast("身份核验成功");
							this.isVerifyId = true;
							this.userInfo = {
								"phone": phone,
								"name": name,
								"roomName": roomName,
								"accStartdatetime": accStartdatetime,
								"accEnddatetime": accEnddatetime
							};
							setTimeout(() => {
								this.openDoor();
							}, 1500);
							
							
							// uni.request({
							// 	url: "https://www.doormaster.me:15566/doormaster/lock_temppwd",
							// 	method: "POST",
							// 	header: {
							// 		"content-type": "application/json"
							// 	},
							// 	data: JSON.stringify(sendData),
							// 	success: (res) => {
							// 		this.$hideLoading();
							// 		let data = res.data;
							// 		if (data.ret === 0) {
										
							// 		} else {
							// 			this.$showToast(data.msg);
							// 		}
							// 		this.$showLog("ret", data.ret);
							// 	},
							// 	fail: (err) => {
							// 		this.$hideLoading();
							// 		this.$showToast("生成临时二维码失败");
							// 	}
							// });
							
							
							// this.$navigateTo("./online-booking-room-temp-password?phone=" + phone + "&devSn=" + devSn + "&accStartdatetime=" + accStartdatetime + "&accEnddatetime=" + accEnddatetime);
						} else {
							this.$hideLoading();
							this.$showToast(result.msg);
						}
					}
				});
			},

			// 点击
			onClick() {
				if (!this.certNo) {
					this.$showToast("请输入身份证号码");
				} else if (!faceCaptureImageBase64) {
					this.$showToast("请拍摄本人人脸照片");
				} else if (this.certNo !== certNo) {
					this.$showToast("当前身份证号码不匹配，请重新输入");
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
				let devObj = {
					"devSn": devSn
				};
				this.$showLoading("正在蓝牙开门...");
				// devObj.ekey = "AC0105788cb3fa75e43b328e6c2c0c2ac08f4f";  // 1016291521
				devObj.ekey = miniEkey;
				devObj.deviceId = deviceId;
				mpBluetoothSDK.openDoor(devObj, (res) => {
					this.$hideLoading();
					this.$showLog("开门结果", res);
					if (res.errCode === 0) {
						this.$showToast("开门成功");
						this.uploadOpenDoorRecord(devObj);
					} else {
						this.$showToast("开门失败" + "(" + res.errCode + ")");
						this.isShowOpenDoorBtn = true;
					}
				});
			},
			
			// 上传蓝牙开门记录
			uploadOpenDoorRecord(devObj) {
				let sendData = [{
					"devSn": devObj.devSn,
					"eventType": 19,
					"terminalApplyType": 2,
					"terminalOsType": this.$platformObj.isAndroid() ? 1 : 2,
					"eventTime": this.$getCurrentTime()
				}];
				this.$showLog("添加蓝牙开门记录 sendData", sendData);
				uni.request({
					url: "https://app-api.thinmoo.com/appBluetoothSdk/addEventLog?accessToken=" + accessToken,
					method: "POST",
					header: {
						"content-type": "application/json",
					},
					data: sendData,
					success: (res) => {
						let result = res.data;
						let code = result.code;
						this.$showLog("添加蓝牙开门记录结果", result);
						if (code === 0) {
							this.$showLog("添加开门记录成功");
						} else {
							this.$showLog("添加开门记录失败" + "(" + code + ")");
						}
					}
				});
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
		width: 35%;
		margin-top: 3%;
		text-align: left;
		display: inline-block;
		overflow: auto;
	}
	
	.right-input {
		width: 58%;
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
