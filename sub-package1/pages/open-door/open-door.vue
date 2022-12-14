<template>
	<uni-base-page class="content open-door-page">
		<view class="showbox" v-show="showbox" @click="showboxClose">
			<p>{{opentype}}</p>
		</view>

		<uni-open-door-poster ref="uniOpenDoorPoster" :openDoorDeviceDoorName="openDoorDeviceDoorName"
			:devSn="currentDevSn"></uni-open-door-poster>
		<view class="float-box">
			<view style="padding: 0 30rpx; height: 320upx;" class="">
				<sh-banner :swiperImgList="swiperImgList"></sh-banner>
			</view>
			<!-- #ifndef MP-ALIPAY -->
			<uni-tab :tab-list="tabList" :tabCur.sync="tabCur" tab-class="open-door-tab-view" textFlex
				v-if="isFunctionRemoteOpenDoor === 1 && isFunctionBluetoothDoor === 1" @change="tabChange"></uni-tab>
			<view v-else-if="isFunctionBluetoothDoor === 1" class="open-way-tag">
				{{ opendoor["bluetooth-open-door"] || "蓝牙开门" }}
			</view>
			<view v-else-if="isFunctionRemoteOpenDoor === 1" class="open-way-tag">
				{{ opendoor["remote-open-door"] || "远程开门" }}
			</view>
			<!-- #endif -->
			<view style="width: 100%; background-color: #F5F5F5; height: 20upx"></view>
			<view class="search-view-1">
				<view class="search-input">
					<image src="/sub-package1/static/img/search.png">
					<input type="text" :placeholder="`${opendoor['search']}` || '搜索'" style="font-size: 30upx;" @input="getInputValue">
				</view>
			</view>
		</view>
		<view class="door-key">
			<ul v-if="hasList">
				<li :key="index" v-for="(dev, index) in devList" class="key-list">
					<button @click="clickKey(dev,index)" :data-deviceIndex="dev.relayIndex" :data-devSn="dev.devSn"
						:data-status="dev.connectionStatus" :data-ekey="dev.devKey" :data-devId="dev.deviceId">
						<image
							:src="`https://wxmini-1258758873.cos.ap-guangzhou.myqcloud.com/doorkey/doorkey${index + 1}.png`"
							v-if="index < 5" />
						<image
							:src="`https://wxmini-1258758873.cos.ap-guangzhou.myqcloud.com/doorkey/doorkey${index%5 + 1}.png`"
							v-else />
						<text>{{ dev.doorName }}</text>
					</button>
				</li>
			</ul>
			<div v-else class="no-list">{{ noDataText }}</div>
		</view>
	</uni-base-page>
</template>

<script>
	let adView = null;
	// #ifdef MP-WEIXIN
	// 在页面中定义插屏广告
	let interstitialAd = null;
	// #endif

	// #ifdef APP-PLUS
	let cpAd = null;
	// #endif
	let isShowLoad = false;
	import shBanner from '../../../pages/main/components/sh-banner.vue';
	export default {
		components: {
			shBanner
		},
		data() {
			return {
				tabCur: this.$getUserInfo().openDoorMethod || 0,
				devList: [],
				hasList: true,
				noDataText: "",
				tabList: [],
				filterDevList: [],
				allDevList: [],
				adData: null,
				openDoorDeviceDoorName: "",
				cumulativeCheckInDays: "000", // 累计签到天数
				isIndependentDeploy: this.$getConfigParam().isIndependentDeploy,
				// isSupportRemoteOpenDoor: this.$getUserInfo().functionConfig.isFunctionRemoteOpenDoor,
				// isSupportBluetoothOpenDoor: this.$getUserInfo().functionConfig.isFunctionBluetoothDoor,
				isFunctionRemoteOpenDoor: "",
				isFunctionBluetoothDoor: "",
				currentDevSn: "",
				swiperImgList: this.$getConfigParam().swiperImgList,
				showbox: false,
				opentype: "",
				adOption: {},
				error: true,
				isShieldAppAd: null,
				newCityListlist: [],
				params: [],
				// userId: uni.getStorageSync('user').userId,
				user: uni.getStorageSync('user'),
				communityId: "",
				searchList: false,
			}
		},

		computed: {
			opendoor() {
				return this.$t("open-door")
			},
			common() {
				return this.$t("common")
			},
			title() {
				return this.$t("title")
			}
		},

		methods: {
			getMainInfo() {
				this.$req.request({
					url: "/appHomePage/app/getHomePageData",
					data: {
						isShowLoad: isShowLoad,
						communityId: this.$getUserInfo().currentCommunity.id,
						currPage: 1
					},
					isShowLoading: false,
					success: res => {
						if (res.code === 0) {
							this.isShieldAppAd = res.data.isShieldAppAd;
							this.isFunctionRemoteOpenDoor = res.data.functionConfig.isFunctionRemoteOpenDoor;
							this.isFunctionBluetoothDoor = res.data.functionConfig.isFunctionBluetoothDoor;
						}
					}
				})
			},
			// 关闭弹窗
			showboxClose() {
				this.showbox = false
			},
			// 广告关闭
			onAdClose() {
				this.$refs.poster.hide();
				this.cumulativeCheckInDays = "000";
				this.adData = null;
			},
			//切换tab
			tabChange(index) {
				//index为0，远程开门，index为1，蓝牙开门
				console.log('ndex为0，远程开门，index为1，蓝牙开门', index)
				this.tabCur = index;
				this.$editUserInfo("openDoorMethod", index);
				this.filterByOpenMethod();
			},
			// 获取门禁列表
			getDoorList() {
				this.$showLoading();
				var _this = this;
				let currentCommunity = this.$getUserInfo().currentCommunity;
				if (!currentCommunity) {
					this.hasList = false;
					this.noDataText = _this.common["no-community"] || "暂未绑定小区";
					return;
				}
				var communityId = currentCommunity.id;
				// var communityId = "1889090m";
				this.$getDevList({
					communityId: communityId,
					needNetwork: false
				}, res => {
					uni.hideLoading();
					if (uni.getStorageSync('devList') && this.$getUserInfo().currentCommunity.id == uni
						.getStorageSync("communityID")) {
						this.allDevList = uni.getStorageSync('devList')
					} else {
						this.allDevList = res.data;
					}
					this.filterByOpenMethod();
					var code = res.code;
					var msg = res.msg;
					if (this.devList.length == 0) {
						if (code === -1) {
							// _this.$showToast(msg);
						} else if (code === -2) {
							// _this.$showToast(msg);
						}
						this.hasList = false;
					} else {
						// #ifdef MP-WEIXIN 
						this.$sdkUtil.bluetoothScanDevice(this.devList);
						// #endif
					}
				});
			},

			//点击开门钥匙
			clickKey(dev, index) {
				this.devList.unshift(dev);
				this.devList.splice(index + 1, 1);
				// 搜索出来的列表点击不缓存
				if(!this.searchList){
					uni.setStorageSync("devList", this.devList);
					uni.setStorageSync("communityID", this.$getUserInfo().currentCommunity.id);
				}
				var network = dev.isSupportNetwork;
				var _this = this;
				uni.showLoading({
					title: _this.common["open-door"],
					mask: true
				});
				if (this.tabCur == 0) {
					if (uni.getStorageSync('devList')) {
						this.allDevList = uni.getStorageSync('devList');
					}
					//远程开门
					this.remoteOpenDoor(dev);
				} else if (this.tabCur == 1) {
					if (uni.getStorageSync('devList')) {
						this.allDevList = uni.getStorageSync('devList');
					}
					//蓝牙开门
					this.bluetoothOpenDoor(dev);
				}
			},
			//获取输入内容
			getInputValue(e) {
				var inputDev = e.detail.value;
				var allDevList = this.allDevList;
				var filterDevList = [];
				for (var i in allDevList) {
					if (allDevList[i].doorName.indexOf(inputDev) > -1) {
						filterDevList.push(allDevList[i]);
					}
				}
				this.devList = filterDevList;
				this.searchList = true;
				console.log("设备列表",this.devList)
			},
			// 远程开门
			remoteOpenDoor(dev) {
				var _this = this;
				let errorMsg = this.opendoor["remote-failed"] || "远程开门失败， ";
				this.$req.request({
					hasCallback: true,
					timeout: 3000,
					url: "/sqDoor/app/openDoor",
					data: {
						relayIndex: dev.relayIndex,
						devSn: dev.devSn
					},
					success: res => {
						if (res.code === 0) {
							this.openDoorDeviceDoorName = dev.doorName;
							uni.navigateTo({
								url: "../../pages/open-door-success/open-door-success?doorName=" + this.openDoorDeviceDoorName
							})
							setTimeout(() => {
								this.cumulativeCheckInDays = "013";
							}, 5000);
						} else {
							this.ifNeedBluetoothOpen(errorMsg, dev);
						}
					},
					fail: res => {
						this.ifNeedBluetoothOpen(errorMsg, dev);
					}
				});
			},
			//上传卡信息
			uploadServer(data, dev) {
				this.$req.request({
					url: "/devDevice/app/configSimNumber",
					method: "POST",
					data: {
						devSn: dev.devSn,
						deviceModelName: data.model_name,
						simId: data.model_sn,
						modelStatus: data.model_status,
						simNumber: data.iccid,
						baseStationId: data.lac_idlac
					},
					success: res => {
						if (res.code == 0) {
							console.log('sim卡 上传成功')
						} else {
							console.log('sim卡 上传失败')
						}
					}
				})
			},

			// 蓝牙开门
			bluetoothOpenDoor(dev) {
				var sdkUtil = this.$sdkUtil;
				let homeInfo = uni.getStorageSync("homeInfo");
				let devObj = dev
				console.log(111, dev, homeInfo, homeInfo.isUploadSimByOpenDoor)
				sdkUtil.bluetoothOpenDoor(dev, (res) => {
					let refObj = {
						doorName: dev.doorName,
						ref: this.$refs
					};
					this.openDoorDeviceDoorName = dev.doorName;
					uni.navigateTo({
						url: "../../pages/open-door-success/open-door-success?doorName=" + this.openDoorDeviceDoorName
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
			//上传剩余电量 、固件版本 掌握
			dumpEnergy_firmwareVersion(dev) {
				let that = this
				//dev.isNeedUploadRemainingBattery是否需要上传剩余电量
				//dev.isNeedUploadFirmVersion是否需要上传固件版本
				if (dev.isNeedUploadRemainingBattery || dev.isNeedUploadFirmVersion) {
					//获取当前设备信息
					that.$sdkUtil.getDeviceConfig(dev, result => {
						if (result.errorCode === 0) {
							let data = result.data;
							//上传设备剩余电量
							that.$req.request({
								url: "/devDevice/app/uploadRemainingBattery",
								data: {
									devSn: dev.devSn.toString(),
									remainingBattery: data.electricity.toString()
								},
								success: res => {
									// console.log( '上传设备剩余电量'+res.code)
								}
							})
							//上传设备固件版本
							that.$req.request({
								url: "/devDevice/app/uploadFirmVersion",
								data: {
									devSn: dev.devSn.toString(),
									firmwareVersion: data.systemVersion.toString()
								},
								success: res => {
									// console.log('上传设备固件版本'+res.code)
								}
							})
						}
					});
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

			//根据选择开门方式过滤
			filterByOpenMethod() {
				var allDevList = this.allDevList;
				var networkedDevList = [];
				// var offlineDevList = [];
				for (var i in allDevList) {
					if (allDevList[i].isSupportNetwork !== undefined && allDevList[i].isSupportNetwork == 1) {
						//支持联网设备
						networkedDevList.push(allDevList[i]);
					}
				}
				if (this.tabCur == 0) {
					//远程开门
					if (networkedDevList.length > 0) {
						this.hasList = true;
						this.devList = networkedDevList;
					} else {
						this.hasList = false;
					}
				} else if (this.tabCur == 1) {
					//蓝牙开门
					if (this.allDevList.length > 0) {
						this.hasList = true;
						this.devList = this.allDevList;
					} else {
						this.hasList = false;
					}
				}
			},

			// 获取banner图
			getAdvList(communityId) {
				this.$req.request({
					url: "/omMaterial/app/getOmMaterial",
					data: {
						promoteBitId: 1,
						communityId: communityId
					},
					success: res => {
						if (res.code === 0) {
							let bannerConfigList = res.data;
							if (bannerConfigList && bannerConfigList.length) {
								let swiperList = [];
								for (let i = 0; i < bannerConfigList.length; i++) {
									swiperList.push(bannerConfigList[i].images);
								}
								if (swiperList.length > 0) {
									this.swiperImgList = swiperList;
								}
							}
						}
					}
				})
			},
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.getMainInfo();
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000)
		},
		onReady() {
			uni.setNavigationBarTitle({
				title: this.title["open-door"]
			})
		},
		onLoad(options) {
			let currentCommunity = this.$getUserInfo().currentCommunity;
			this.noDataText = this.opendoor["no-dev"] || "暂未绑定设备";
			if (this.isSupportRemoteOpenDoor) {
				this.tabCur = 0;
			} else if (this.isSupportBluetoothOpenDoor) {
				this.tabCur = 1;
			}
			this.tabList = [{
				name: this.opendoor["remote-open-door"] || "远程开门"
			}, {
				name: this.opendoor["bluetooth-open-door"] || "蓝牙开门"
			}];
			//获取设备列表   判断是否有网络，有网络发起网络请求，没有网络获取本地设备列表
			if (currentCommunity) {
				let currentCommunityId = currentCommunity.id;
				this.getAdvList(currentCommunityId);
				if (this.$getAppInfo().isConnected) {
					this.getDoorList();
				} else {
					let storageDevList = this.$getUserInfo()["devList-" + currentCommunityId];
					// this.$showLog("当前小区的设备列表", storageDevList);
					if (storageDevList.length > 0) {
						this.hasList = true;
						this.devList = this.allDevList = storageDevList;
					}
					// this.devList = this.$getUserInfo().devList
				}
			} else {
				this.swiperImgList = this.$getConfigParam().swiperImgList;
			}

			this.filterByOpenMethod();
			// #ifndef H5 
			//监听蓝牙适配器状态变化
			uni.onBluetoothAdapterStateChange(function(res) {
				// console.log("监听蓝牙状态", res);
				if (res.available === false) {
					uni.showToast({
						title: this.opendoor["notice-bluetooth"] || "注意,蓝牙已关闭",
						icon: 'none'
					});
				}
			});
			// #endif
		},
		onShow() {
			this.getMainInfo();
		},
	}
</script>

<style lang="scss" scoped>
	.showbox {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 2147483647;
	}

	.showbox p {
		width: 100%;
		height: 20upx;
		color: #fff;
		text-align: center;
		position: absolute;
		left: 50%;
		margin-left: -50%;
		bottom: 8%;
		font-size: 36upx;
		// top: 8%;
	}

	.float-box {
		padding: 20upx 0;
		background-color: #FFFFFF;
		line-height: 1;
		z-index: 100;
		width: 100%;
	}

	.open-door-tab-view {
		width: 100%;
	}

	.open-way-tag {
		width: 100%;
		padding: 20upx 0;
		font-size: 30upx;
		color: #007AFF;
		text-align: center;
		border-bottom: 1upx solid #007AFF;
	}

	.content.open-door-page {
		width: 100%;
		// height: 100%;
		position: absolute;
		padding: 0 0 20upx;
		background-color: #FFFFFF;
	}

	.search-view-1 {
		padding: 0 30upx 0;
	}

	.search-input {
		margin-top: 20upx;
		margin-bottom: 20upx;
		/* #ifndef MP-ALIPAY */
		padding: 14upx 20upx;
		/* #endif */
		border: 1upx solid #BEBEBE;
		border-radius: 20upx;
		text-align: left;
		color: #BEBEBE;
	}

	.search-input image {
		width: 42upx;
		height: 42upx;
		/* #ifndef MP-ALIPAY */
		float: left;
		margin-right: 16upx;
		/* #endif */

		/* #ifdef MP-ALIPAY */
		margin-left: 16upx;
		/* #endif */
	}

	.door-key {
		width: 100%;
		position: relative;
		// padding: 540upx 0 20upx;
	}

	.door-key ul {
		width: 100%;
		padding: 0;
	}

	.key-list {
		display: inline-block;
		width: 25%;
		// height: 220upx;
		height: 180upx;
		border-width: 0 !important;
		border-style: none;
		// align-items: center;
		// justify-content: center;
	}

	.key-list:active {
		background: #dedede;
	}

	.key-list button {
		background-color: transparent;
		font-size: 20upx;
		// height: 110px;
		height: 180upx;
		line-height: 1.5;
		border-width: 0 !important;
		border-style: none;
		margin: 10upx 0;
		padding: 0;
	}

	.key-list button::after {
		border: none;
	}

	.key-list text {
		display: block;
		// position: absolute;
		width: 100%;
		text-align: center;
	}

	.door-key image {
		// width: 70px;
		// height: 70px;
		width: 100upx;
		height: 100upx;
		position: relative;
	}

	.no-list {
		text-align: center;
		font-size: 36upx;
		line-height: 500upx;
	}
</style>
