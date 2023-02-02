<template>
	<page>
		<u-navbar class="navbar" :title="title" :border-bottom="false">
			<view style=" width: 100%; text-align: right; " @click="DoorRecord">开门记录</view>
		</u-navbar>
		<scroll-view :scroll-y='true' style="height: 100vh;">
			<view class="container">
				<!-- 二维码 -->
				<!-- <view class="qrcode"> -->
				<!-- <yz-qr :qrPath.sync="qrPath" :text="qrCode"></yz-qr> -->
				<!-- <uqrcode v-if="qrCode" ref="uQRCode" :mode="mode" :text="qrCode" :size="size" :margin="margin"
						:background-color="backgroundColor" :foreground-color="foregroundColor"
						:error-correct-level="errorCorrectLevel" :type-number="typeNumber" :file-type="fileType">
					</uqrcode> -->
				<!-- <view v-else class="u-text-center u-type-error" style="width: 278upx;height: 278upx;line-height: 278upx;margin: 0 auto;">
						
						暂不支持二维码
					</view> -->
				<!-- <view class="" style="margin-top: 50upx;">
						<view  class="anniu" @click="getHouseholdQrCode" :plain="true">刷新</view>
					</view> -->
				<!-- </view> -->
				<!-- 蓝牙状态 -->
				<view class="lanya"
					:style="{ 'display': 'flex', 'alignItems': 'center', 'background': isOpenBluetooth ? '#618FFC' : '#FFFFFF' }">
					<u-image style="margin-left: 10upx;" width="24upx" height="30upx"
						:src="isOpenBluetooth ? 'https://file.yuanzhoulvwego.com/prod/uploadFiles/entranceGuard/lanya.png' : 'https://file.yuanzhoulvwego.com/prod/uploadFiles/entranceGuard/bluetooth.png'" />
					<text class="lanyadoor" :style="{ 'color': isOpenBluetooth ? '#FFFFFF' : '#E64340' }">
						{{ isOpenBluetooth ? "蓝牙已开启" : "蓝牙未开启" }}</text>
					<view class="anniu1"
						:style="{ 'background': isOpenBluetooth ? '#FFFFFF' : '#618FFC', 'color': isOpenBluetooth ? '#618FFC' : '#FFFFFF' }"
						@click="bluebox(isOpenBluetooth)">
						{{ isOpenBluetooth ? "去开门" : "打开蓝牙" }}
					</view>
				</view>
				<view>
					<u-toast ref="uToast" />
				</view>
				<view
					style="background-color: #ffffff; border-radius: 23upx;margin-top: 20upx; padding: 20upx 10upx 30upx 10upx;">
					<text class="shebeiliebiao">设备列表</text>
					<u-search class="shousuo" :clearabled="true" :show-action="false" placeholder="请输入设备名称"
						v-model="keyword" @change="fuzzySearch"></u-search>
					<view v-for='(item,index) in this.ContactProperty' :key='item.id' class="box">
						<view class="liebiao">
							<u-row gutter="16">
								<u-col span="1">
									<text>
										<u-image width="60upx" height="60upx"
											src="https://file.yuanzhoulvwego.com/prod/uploadFiles/entranceGuard/shebei-tubiao.png"></u-image>
									</text>
								</u-col>
								<u-col span="6">
									<text @click="checkInfo(item)" style="margin-left: 10upx;">{{ item.name }}</text>
									<span v-if="item.RSSI && item.RSSI !== -100000"
										style="width: 40upx;height: 40upx; display: inline-block;margin-left: 20upx;">
										<!--  -->
										<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/entranceGuard/bluetooth.png"
											style="width: 40upx;height: 40upx; vertical-align: middle;"></image>
									</span>
								</u-col>
								<u-col v-if="item.type=='bluetooth'" span="1" style="margin-left: 20upx;">
									<text v-if="item.isSupportNetwork==1&&item.connectionStatus==1"
										@click="remoteOpenDoor(item)">
										<!--  -->
										<u-image width="60upx" height="60upx"
											src="https://file.yuanzhoulvwego.com/prod/uploadFiles/entranceGuard/yckm.png"></u-image>
									</text>
								</u-col>
								<u-col span="1" style="margin-left: 20upx;">
									<text v-if="item.type==='bluetooth'" @click="temporaryPassword(item);">
										<u-image width="60upx" height="60upx"
											src="https://file.yuanzhoulvwego.com/prod/uploadFiles/entranceGuard/lsmm.png"></u-image>
									</text>
								</u-col>
								<u-col span="1" style="margin-left: 20upx;">
									<text v-if="item.type=='bluetooth'" @click="bluetoothOpenDoor(item); ">
										<u-image width="60upx" height="60upx"
											src="https://wxmini-1258758873.cos.ap-guangzhou.myqcloud.com/bluetooth.png">
										</u-image>
									</text>
								</u-col>
								<u-col v-if="item.type=='remote'" span="1" style="margin-left: 20upx;">
									<text @click="remoteOpenDoor(item)">
										<u-image width="60upx" height="60upx"
											src="https://file.yuanzhoulvwego.com/prod/uploadFiles/entranceGuard/yckm.png"></u-image>
									</text>
								</u-col>
							</u-row>
						</view>
					</view>
				</view>
			</view>
			</view>
		</scroll-view>
	</page>
</template>

<script>
	import uQRCode from '@/uni_modules/Sansnn-uQRCode/components/uqrcode/common/uqrcode'
	export default {
		data() {
			return {
				ContactProperty: [],
				screenData: [],
				listDataArr: [],
				listDataNew: [],
				keyword: '',
				show: false,
				errorMsg: '',
				qrPath: '',
				mode: 'canvas',
				qrCode: '',
				size: 200,
				margin: 10,
				backgroundColor: '#FFFFFF',
				foregroundColor: '#000000',
				errorCorrectLevel: uQRCode.errorCorrectLevel.H,
				typeNumber: -1,
				fileType: 'png',
				title: uni.getStorageSync('zoneInfo').name,
				isOpenBluetooth: false
			};
		},
		onShow() {
			this.getDeviceList()
		},
		onLoad() {
			// this.getHouseholdQrCode()
			this.openBluetoothAdapter().then(() => {
				this.getBluetoothAdapterState();
			}).finally(() => {
				console.log("蓝牙模块初始化完成");
				uni.onBluetoothAdapterStateChange((res) => {
					this.isOpenBluetooth = res.available;
					console.log('adapterState changed, now is', res);
				});
			});
		},
		methods: {
			bluebox(isOpenBluetooth) {
				if (isOpenBluetooth == true) {
					return
				} else {
					this.openBluetoothAdapter()
				}
			},
			// 远程开门
			remoteOpenDoor(dev) {
				var _this = this;
				console.log("远程开门");
				if (dev.type === 'bluetooth') {
					let errorMsg = this.opendoor["remote-failed"] || "远程开门失败， ";
					this.$api('equipment.remoteDoor', {
						id: dev.id,
						devSn: dev.devSn
					}).then(res => {
						if (res.code === 200) {
							uni.showToast({
								title: '远程开门成功',
								// icon: 'none',
								duration: 1000,
								mask: true,
							});
						} else {
							if (dev.type == 'bluetooth') this.ifNeedBluetoothOpen(errorMsg, dev);
						}
					}).catch((e) => {
						if (dev.type == 'bluetooth') this.ifNeedBluetoothOpen(errorMsg, dev);
					});
				} else {
					this.$api('equipment.appRemoteDoor', {
						roomNum: dev.roomNum
					}).then(res => {
						if (res.code === 0) {
							uni.showToast({
								title: "开门成功",
								icon: "none"
							});
						} else {
							uni.showToast({
								title: `开门失败,${res.errmsg}`,
								icon: "none"
							});

						}
					})
				}
			},
			// 远程开门失败后后蓝牙开门提示
			ifNeedBluetoothOpen(errorMsg, dev) {
				let _this = this;
				uni.showModal({
					title: _this.opendoor["bluetooth-tips"] || "蓝牙开门提示",
					content: errorMsg + _this.opendoor["if-need-bluetooth"] || "是否需要进行蓝牙开门",
					confirmText: _this.common["confirm"] || "确认",
					cancelText: _this.common["cancel"] || "取消",
					success: res => {
						if (res.confirm) {
							this.bluetoothOpenDoor(dev)
						} else {
							uni.hideLoading();
						}
					}
				})
			},
			bluetoothOpenDoor(dev) {
				uni.showLoading({
					title: '开门中'
				});
				setTimeout(function() {
					uni.hideLoading();
				}, 3000);
				var sdkUtil = this.$sdkUtil;
				let homeInfo = uni.getStorageSync("homeInfo");
				let devObj = dev
				console.log(111, dev, homeInfo, homeInfo.isUploadSimByOpenDoor)
				sdkUtil.bluetoothOpenDoor(dev, (res) => {
					let refObj = {
						doorName: dev.doorName,
						ref: this.$refs
					};
					uni.showToast({
						title: "开门成功",
						icon: "none"
					});
					this.openDoorDeviceDoorName = dev.doorName;
					uni.navigateTo({
						url: "../../pages/open-door-success/open-door-success?doorName=" + this
							.openDoorDeviceDoorName
					})
					let timestamp = Date.parse(new Date());
					let openDoor_timestamp = uni.getStorageSync('openDoor').timestamp
					setTimeout(() => {
						// dev.isSupportGetOpenDoorRecord 是室内设备时，才上传开门记录
						if (dev.isSupportGetOpenDoorRecord == 1) {
							//设备获取最近开门记录 并上传
							this.$sdkUtil.getRecentOpenDoorRecordFromDevice(dev);
							//根据本地存储6小时上传一次剩余电量 、固件版本
							if (openDoor_timestamp) {
								let hour_6 = 1000 * 3600 * 6;
								if (timestamp - openDoor_timestamp > hour_6) {
									uni.setStorageSync('openDoor', {
										timestamp
									})
									setTimeout(() => {
										this.dumpEnergy_firmwareVersion(dev)
									}, 6000)
								}
							} else {
								uni.setStorageSync('openDoor', {
									timestamp
								})
								setTimeout(() => {
									this.dumpEnergy_firmwareVersion(dev)
								}, 6000)
							}
						} else {
							this.dumpEnergy_firmwareVersion(dev)
						}
					}, 4000)

					//根据isUploadSimByOpenDoor上传sim卡信息
					setTimeout(() => {
						if (homeInfo.isUploadSimByOpenDoor == 1) {
							devObj.controlWay = 1;
							devObj.eKey = dev.appEkey
							devObj.devType = dev.deviceModelValue
							console.log('获取sim卡信息')
							sdkUtil.getSimstatus(devObj, result => {
								if (result.errorCode === 0) {
									let data = result.data;
									this.uploadServer(data, dev)
								}
							});
						}
					}, 4000)

				});
			},
			temporaryPassword(e) {
				uni.navigateTo({
					url: `/sub-package1/pages/vis/vis?name=${e.name}&roomId=${e.roomId}&devSn=${e.devSn}`
				})
			},
			openBluetoothAdapter() {
				return new Promise((resolve, reject) => {
					uni.openBluetoothAdapter({
						success: e => {
							console.log('初始化蓝牙成功:' + e.errMsg);
							console.log(JSON.stringify(e));
							resolve();
						},
						fail: e => {
							console.log(e)
							console.log('初始化蓝牙失败，错误码：' + (e.errCode || e.errMsg));
							uni.showModal({
								title: '提示！',
								content: '初始化蓝牙失败，请到设置里打开本机蓝牙！',
								showCancel: false,
								confirmText: "确定",
								success: (res) => {
									if (res.confirm) {

									}
								}
							});
							if (e.errCode !== 0) {
								//initTypes(e.errCode, e.errMsg);
							}
							this.isOpenBluetooth = false;
							reject();
						}
					});
				});
			},
			getBluetoothAdapterState() {
				uni.getBluetoothAdapterState({
					success: res => {
						// 
						console.log(JSON.stringify(res));
						this.isOpenBluetooth = true;
					},
					fail: e => {
						this.isOpenBluetooth = false;
						console.log('获取本机蓝牙适配器状态失败，错误码：' + e.errCode);
						if (e.errCode !== 0) {
							//initTypes(e.errCode);
						}
					}
				});
			},
			//过滤设备名称
			fuzzySearch(e) {
				this.contactProperty = this.screenData
				if (e === '') {
					this.contactProperty = this.listDataArr
					return
				}
				this.listDataNew = this.contactProperty.filter(item => {
					let flag = false
					for (const key in item) {
						if (item.name && item.name.toString().includes(e)) {
							flag = true
							break
						}
					}
					if (flag) {
						return item
					}
				})
				this.contactProperty = this.listDataNew

			},
			// 根据园区id获取权限门禁设备列表
			getDeviceList() {
				let params = {
					currPage: 1,
				};
				this.$api('equipment.equipmentList', params, false).then((res) => {
					if (res.code == 200) {
						uni.setStorageSync("deviceList", res.data);
						this.ContactProperty = res.data;
						this.screenData = JSON.parse(JSON.stringify(res.data))
						this.listDataArr = JSON.parse(JSON.stringify(res.data))
						const brr = JSON.parse(JSON.stringify(this.ContactProperty))
						if (res.data === []) {
							this.showToast();
						}

					}
				});
			},
			showToast() {
				this.$refs.uToast.show({
					title: '没有绑定设备',
				})
			},
			// 点击了宫格，然后进行路由跳转
			goPage(data) {
				this.$Router.push({
					path: data.url,
					query: data
				});
			},
			// 暂无二维码设备
			// getHouseholdQrCode() {
			// 	console.log('opopopo')
			// 	this.$api('equipment.getHouseholdQrCode').then(res => {
			// 		if (res.code === 200) {
			// 			this.qrCode = res.data.tempCode
			// 		}else{
			// 			this.errorMsg = res.msg
			// 		}
			// 	})
			// },
			DoorRecord() {
				this.$Router.push({
					path: "/pages/user/openDoorRecord"
				});

			},
			// 暂时无用
			save(id) {
				console.log("点击");
				uni.showLoading({
					mask: true,
					title: '请稍后...'
				})
				this.$refs[id].save({
					success: res => {
						console.log(res)
						uni.hideLoading()
						uni.showToast({
							icon: 'none',
							title: res.msg
						})
					},
					fail: err => {
						uni.hideLoading()
						uni.showToast({
							icon: 'none',
							title: JSON.stringify(err)
						})
					}
				})
			},
		},
	}
</script>
<style>
	page {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(#A3C1FD, #EBF1FE);
		z-index: 0;
	}
</style>
<style scoped lang="scss">
	.background {
		margin-top: 100upx;
	}

	.wenben {
		position: relative;
		font-size: 22upx;
		left: 30upx;
		bottom: 70upx;
		width: 140upx;
		/*要显示文字的宽度*/
		text-overflow: ellipsis;
		/*让截断的文字显示为点点。还有一个值是clip意截断不显示点点*/
		white-space: nowrap;
		/*让文字不换行*/
		overflow: hidden;
		/*超出要隐藏*/
	}

	.shousuo {
		width: 350upx;
		float: right;

	}

	.bz-img {
		width: 168upx;
		height: 78upx;
		top: -70upx;
	}

	.container {
		padding: 30upx 20upx 100upx 20upx;

	}

	.liebiao {
		margin-top: 30upx;
		padding: 30upx 0upx 20upx 10upx;
		border: 1upx solid #CCCCCC;
		border-radius: 23upx;
		margin-bottom: 20upx;
	}

	.shebei {
		float: left;
	}

	.lanyadoor {
		width: 75%;
		float: left;
		margin-left: 10upx;
		// margin-top: 40upx; 
		font-size: 30upx;
		// line-height: 30upx;
		color: #ffffff;
	}

	.lanyadoor1 {
		width: 72%;
		float: left;
		margin-left: 10upx;
		margin-top: 40upx;
		font-size: 30upx;
		line-height: 30upx;
		color: #E64340;
	}

	.lanya {
		margin: 0 auto;
		height: 120upx;
		background: #618FFC;
		border-radius: 15px;
	}

	.lanya1 {
		margin: 0 auto;
		height: 120upx;
		background: #FFFFFF;
		border-radius: 15px;
		margin-top: 30upx;
	}

	.anniu {
		font-size: 24upx;
		width: 120upx;
		padding: 4upx 0upx;
		border-radius: 23upx;
		border: 1px solid #000000;
		text-align: center;
		margin: 0 auto;
	}

	.anniu1 {
		float: left;
		font-size: 24upx;
		height: 48upx;
		line-height: 48upx;
		width: 120upx;
		// padding: 11upx 0upx;
		border-radius: 24upx;
		text-align: center;
	}

	.bg-img {
		margin-top: 10%;
		position: fixed;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		z-index: -1;
	}

	.bg-img2 {}

	.bg-img1 {
		width: 100%;
		top: -120upx;
		left: 0;
		z-index: -1;
	}

	.qrcode {
		padding: 10upx;
		margin: 0 auto;
		height: 540upx;
		background: url('https://file.yuanzhoulvwego.com/prod/uploadFiles/entranceGuard/beijinyuansu.png');
		background-size: 100% 100%;
		position: relative;

		.uqrcode {
			left: 50%;
			transform: translateX(-50%);
		}
	}

	// .card{
	// 	margin: 0 -15upx;
	// }
	// .grid-left{
	// 	margin-right: 2%;
	// }
	// .head_left_icon {
	// 	/deep/ .u-icon__label {
	// 		font-weight: bold;
	// 	}
	// }
	// .qrcode-box{
	// 	border: 1upx solid #DDDDDD;
	// 	border-radius: 20upx;
	// 	.qrcode {
	// 		/* #ifndef APP-NVUE */
	// 		display: flex;
	// 		/* #endif */
	// 		flex-direction: column;
	// 		align-items: center;
	// 		justify-content: center;
	// 		padding: 80rpx 0 50upx;
	// 	}
	// 	/deep/ .u-size-default{
	// 		height: 60upx;
	// 		line-height: 60upx;
	// 	}
	// }
</style>
