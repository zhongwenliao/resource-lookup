<template>
	<uni-base-page>
		<view class="test-btn-box">
			<view class="test-btn-cell">
				<button type="primary" @click="openDoor">{{ manage["open-door-test"] || "开门测试" }}</button>
				<view class="img-view" v-if="openDoorPass">
					<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/test-success.png"></image>
				</view>
			</view>
			<view class="test-btn-cell">
				<button type="primary" @click="sycLockInfo">{{ manage["sync-door-param"] || "同步门锁设备参数"}}</button>
				<view class="img-view" v-if="sycLockInfoPass">
					<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/test-success.png"></image>
				</view>
			</view>
			<view class="test-btn-cell">
				<button type="primary" @click="readCard">{{ manage["write-card-test"] || "开卡测试" }}</button>
				<view class="img-view" v-if="readCardPass">
					<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/test-success.png"></image>
				</view>
			</view>
			<view class="test-btn-cell">
				<button style="background-color: #ff4b33; color: #FFFFFF;" @click="changeDevice">{{manage["change-device"]||"更换门锁"}}</button>
			</view>
			<view class="test-btn-cell" style="color: #AAAAAA; text-align: left;">{{manage["change-dev-tips"]||"若测试失败，请点击更换门锁进行更换"}}</view>
		</view>
	</uni-base-page>	
</template>

<script>
	export default {
		data() {
			return {
				devObj: {},
				isSuccess: false,
				roomId: null,
				isBindOwner: false,
				devSn: "",
				openDoorPass: false,
				readCardPass: false,
				sycLockInfoPass: false,
				cardNo: "",
				password: "",
				configParam: {},
				communityId: ""
			}
		},
		
		computed: {
			opendoor() {
				return this.$t("open-door")
			},
			manage() {
				return this.$t("manage")
			}
		},
		
		methods: {
			// 开门测试
			openDoor() {
				this.$showLoading();
				this.$sdkUtil.bluetoothOpenDoor(this.devObj, () => {
					this.openDoorPass = true;
					this.ifGoToBindOwner();
				});
			},
			
			// 绑定业主
			// bindOwner() {
			// 	uni.navigateTo({
			// 		url: "bind-owner?roomId=" + this.roomId
			// 	})
			// },
			
			// 测试开卡功能
			readCard() {
				this.$sdkUtil.getSwipeAddCardno(this.devObj, (result) => {
					//读卡成功，状态值改变
					if(result.errorCode == 0) {
						this.$showToast(this.manage["write-card-success"]||"开卡成功");
						this.readCardPass = true;
						this.ifGoToBindOwner();
					}
				})
			},
			
			// 同步门锁设备参数
			sycLockInfo() {
				let timeStr = (new Date()).pattern("yyyy-MM-dd HH:mm:ss");
				timeStr = timeStr.replace(/:|-| /g, "");
				let curDay = new Date().getDay();
				timeStr += curDay == 0 ? "07" : "0" + curDay;
				console.log("当前时间： ",timeStr);
				this.$sdkUtil.syncDeviceTime(this.devObj, timeStr, (result) => {
					if(result == 0) {
						this.sycLockInfoPass = true;
						this.ifGoToBindOwner();
					}
				})
				
			},
			
			// 获取读卡扇区密钥
			// getSectorKey() {
			// 	this.$req.request({
			// 		url: "/devDevice/app/getDeviceSectionParam",
			// 		data: {
			// 			id: this.devInfo.deviceId
			// 		},
			// 		success: res => {
			// 			console.log("卡扇区参数---",res.data);
			// 			let sectorParam = res.data;
			// 			this.configParam = {
			// 				"devId": 1,
			// 				"mifareSector": sectorParam.cardAccMifareSection,
			// 				"sectorKey": sectorParam.cardMifareSecretKey
			// 			}
			// 		}
			// 	})
			// },
			
			//检测是否通过所有测试
			checkTestStatus() {
				if(this.openDoorPass && this.sycLockInfoPass && this.readCardPass) {
					console.log("测试成功");
					this.$showToast(this.manage["test-success"]||"测试成功");
					return true;
				} else {
					return false;
				}
			},
			
			// 检测是否已绑定业主进行页面跳转判断
			ifGoToBindOwner() {
				if(this.checkTestStatus()) {
					let isBindOwner = this.devObj.isBindOwner;
					// 通过所有测试
					if(isBindOwner == 0) {
						// 测试通过未绑定业主
						console.log("测试通过未绑定业主");
						uni.navigateTo({
							url: "bind-owner?devObj=" + JSON.stringify(this.devObj)
						})
					}else {
						// 测试通过且绑定了业主
						console.log("测试通过且绑定了业主");
						// 跳转到完成安装
						uni.navigateTo({
							url: "../install/submit-install?devObj=" + JSON.stringify(this.devObj)
						})
					}
				}
			},
			
			//更换门锁
			changeDevice() {
				uni.navigateTo({
					url: "change-dev?devObj=" + JSON.stringify(this.devObj)
				})
			}
		},
		
		onLoad(options) {
			if(options.devObj) {
				this.devObj = JSON.parse(options.devObj);
			}
		}
	}
</script>

<style>
	.test-btn-box {
		margin-top: 30%;
		width: 100%;
	}
	
	.test-btn-cell {
		width: 80%;
		text-align: center;
		margin: 20upx 10%;
		clear: both;
		overflow: hidden;
	}
	
	.test-btn-cell button{
		width: 75%;
		padding: 10upx;
		float: left;
	}
	
	.img-view {
		width: 25%;
		float: left;
		text-align: right;
	}
	
	.img-view image {
		width: 100upx;
		height: 100upx;
	}
	
	.operation-btn {
		margin-left: 20upx;
		background-color: transparent;
		color: #FFFFFF;
		background-color: #ff5f4a;
	}
	
	.manual-btn {
		width: 75%;
		padding: 10upx;
		float: left;
		color: #AAAAAA;
	}
	
	.success-btn {
		background-color: #06AE56;
		color: #FFFFFF;
		margin: 0 20upx;
		width: 40%;
		float: left;
		border-radius: 10upx;
		padding: 10upx 0;
	}
	
	.fail-btn {
		background-color: #ff5f4a;
		color: #FFFFFF;
		margin: 0 20upx;
		width: 40%;
		float: left;
		border-radius: 10upx;
		padding: 10upx 0;
	}
	
	.pwd-box {
		padding: 20upx 0;
		width: 90%;
		color: #0081ff;
		font-size: 28upx;
		text-align: center;
		border-radius: 10upx;
		margin-left: 10upx;
		border: 1upx solid #0081ff;
		background-color: transparent;
	}
</style>

