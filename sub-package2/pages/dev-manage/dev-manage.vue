<template>
	<page class="content">
		<view class="search-view search">
			<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/search.png" />
			<input type="text" :placeholder="`${manage['dev-search']}` || '请输入设备名称/安装位置/设备序列号' " @input="filterDev">
		</view>
		<view v-if="!isLoad" class="dev-list">
			<view class="operation-text" style="text-align: left; padding: 0 0 0 2%;" @click="goToAddDevice">
				{{ manage["add-device"] || "添加设备" }}</view>
			<!-- <view class="operation-text" style="text-align: left; padding: 0 0 0 2%;">
					</view> -->
			<view class="operation-text" style="text-align: right; padding: 0 2% 0 0;" @click="goToScanList">
				{{ manage["scan-device"] || "扫描附近设备" }}
			</view>
			<ul v-if="devList.length > 0">
				<li v-for="(dev,index) in devList" :key="index" @click="checkInfo(dev)">
					<view class="sub-list">
						<!-- connectionStatus 设备在线状态【0离线,1 在线】-->
						<!-- accRelayStatus 锁开闭状态（-1:未知 0:关闭 1:打开）-->
						<image v-if=" dev.connectionStatus && dev.connectionStatus === 1 "
							:src=" dev.accRelayStatus !== -1? onlineImgList[dev.accRelayStatus] : 'https://file.yuanzhoulvwego.com/prod/uploadFiles/img/manage/dev-manage-green.png'" />
						<image v-else-if=" dev.connectionStatus && dev.connectionStatus === 0 "
							:src=" dev.accRelayStatus !== -1? offlineImgList[dev.accRelayStatus] : 'https://file.yuanzhoulvwego.com/prod/uploadFiles/img/manage/dev-manage.png'" />
						<image v-else src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/manage/dev-manage.png" />
						<view class="dev-name">
							<view>
								{{ dev.name }} <text style="color: #AAAAAA;"> ( {{ dev.devSn}} )</text>
							</view>
							<view>
								{{dev.deviceInstallAddress}}
							</view>
						</view>
						<view class="dev-type" v-if="dev.isSupportNetwork == 0">
							<view>
								<image v-if="dev.RSSI && dev.RSSI !== -100000"
									src="https://wxmini-1258758873.cos.ap-guangzhou.myqcloud.com/bluetooth.png"
									style="width: 40upx;height: 40upx; vertical-align: middle;"></image>
								<text class="connect-status status-2">{{ manage["no-network"]||"脱机" }}</text>
							</view>
							{{dev.deviceModelName}}
						</view>
						<view class="dev-type" v-else>
							<view>
								<image v-if="dev.RSSI && dev.RSSI !== -100000"
									src="https://wxmini-1258758873.cos.ap-guangzhou.myqcloud.com/bluetooth.png"
									style="width: 40upx;height: 40upx; vertical-align: middle;"></image>
								<text
									:class="['connect-status', `status-${dev.connectionStatus}`]">{{ dev.connectionStatus == 0 ? manage["offline"]:manage["online"]}}</text>
							</view>
							{{dev.deviceModelName}}
						</view>
					</view>
					<view style="width: 96%; padding: 10upx 2%; overflow: hidden;" v-if="dev.positionType === 5">
						<view class="tag-style" v-if="dev.isBindOwner === 0 " @click.stop="clickBindOwner(dev)">
							{{ manage["bind-owner"] || "绑定业主"}}
						</view>
						<view class="tag-style" v-else-if="dev.isBindOwner === 1 && dev.isCompleted !== 1"
							@click.stop="clickFinish(dev)">{{"完成安装"}}</view>
						<view class="tag-style" @click.stop="clickChangeDev(dev)">
							{{ manage["change-device"] || "更换设备" }}
						</view>
					</view>
				</li>
			</ul>
			<view class="no-data" v-else>{{ manage["no-dev"] || "暂无权限设备" }}</view>
		</view>
	</page>
</template>

<script>
	export default {
		data() {
			return {
				devList: [],
				isLoad: true,
				copyDevList: [],
				communityId: "",
				accRelayStatusList: ["关", "开"],
				onlineImgList: ["https://file.yuanzhoulvwego.com/prod/uploadFiles/img/manage/close-online.png",
					"https://file.yuanzhoulvwego.com/prod/uploadFiles/img/manage/open-online.png"
				],
				offlineImgList: ["https://file.yuanzhoulvwego.com/prod/uploadFiles/img/manage/close-offline.png",
					"https://file.yuanzhoulvwego.com/prod/uploadFiles/img/manage/open-offline.png"
				],
			}
		},
		methods: {
			checkInfo(dev) {
				console.log(dev)
				uni.navigateTo({
					url: "dev-info?dev=" + JSON.stringify(dev)
				});
			},

			//获取设备列表
			getDevList(pageNo, pageSize) {
				this.isLoad = true;
				this.$api('equipment.getAppDevAuthorizeList').then(res => {
					console.log(res);
					if (res.code == 200) {
						uni.stopPullDownRefresh();
						this.devList = res.data;
						this.copyDevList = res.data;
					}
					this.isLoad = false;
					this.scanDevice(this.devList);

				}).catch((e) => {
					this.isLoad = false;
					this.scanDevice(this.devList);
				});
			},
			// getDevList(communityId) {
			// 	this.isLoad = true;
			// 	this.$req.request({
			// 		url: "/sqDoor/app/getAppDevAuthorizeList",
			// 		data: {
			// 			communityId: communityId
			// 		},
			// 		success: res => {

			// 		},
			// 		complete: () => {

			// 		}
			// 	});
			// },

			//过滤设备名称
			filterDev(e) {
				var input = e.detail.value;
				this.devList = [];
				console.log()
				for (var i in this.copyDevList) {
					if (this.copyDevList[i].name.indexOf(input) > -1 || this.copyDevList[i].deviceInstallAddress.indexOf(
							input) > -
						1 || this.copyDevList[i].devSn.indexOf(input) > -1) {
						this.devList.push(this.copyDevList[i]);
					}
				}
			},

			//扫描周边设备
			scanDevice(devList) {
				//配置扫描 时间
				let scanTime = 1500;
				this.$sdkUtil.bluetoothScanNearDevice((result) => {
					let scanDevList = result;
					for (var i = 0; i < devList.length; i++) {
						devList[i].RSSI = -100000;
						for (var j = 0; j < scanDevList.length; j++) {
							if (devList[i].devSn == scanDevList[j].devSn) {
								devList[i].RSSI = scanDevList[j].RSSI;
							}
						}
					}
					this.devList = devList.sort(this.$sortBy("RSSI", false));
				}, scanTime)
			},

			// 点击扫描设备，跳转到附近设备列表
			goToScanList() {
				uni.navigateTo({
					url: "/sub-package2/pages/dev-manage/scan-dev-list"
				})
			},

			// 点击添加设备，跳转到添加设备页面
			goToAddDevice() {
				uni.navigateTo({
					url: "/sub-package2/pages/dev-manage/addEquipment"
				})
			},

			// 点击绑定业主
			clickBindOwner(dev) {
				uni.navigateTo({
					url: "/sub-package/pages/add-device/device-test?devObj=" + JSON.stringify(dev)
				})
			},

			// 点击完成安装
			clickFinish(dev) {
				uni.navigateTo({
					url: "/sub-package/pages/install/submit-install?devObj=" + JSON.stringify(dev)
				})
			},

			// 点击更换设备
			clickChangeDev(dev) {
				uni.navigateTo({
					url: "/sub-package/pages/add-device/change-dev?devObj=" + JSON.stringify(dev)
				})
			}

		},
		onReady() {},
		onLoad() {
			var _this = this;
			// let communityId = this.$getUserInfo().currentCommunity.id;
			// this.communityId = communityId;
			// this.devList = this.$getUserInfo()["devList-" + communityId] || [];
			this.accRelayStatusList = this.manage["accRelayStatusList"] || ["关", "开"];
			// if (communityId !== undefined) {
			this.getDevList();
			uni.setNavigationBarTitle({
				title: _this.title["dev-manage"]
			})
			// }
		},

		onPullDownRefresh() {
			this.getDevList();
		},

		computed: {
			devType() {
				return this.$t("devType");
			},
			title() {
				return this.$t("title")
			},
			manage() {
				return this.$t("manage");
			}
		}
	}
</script>

<style>
	view,
	text {
		box-sizing: content-box;
	}

	.content {
		padding: 0;
	}

	.search {
		width: 100%;
		position: fixed;
		text-align: center;
		background: #FFFFFF;
		line-height: 60upx;
	}

	.search image {
		display: inline-block;
		vertical-align: middle;
		width: 44upx;
		height: 44upx;
	}

	.search input {
		display: inline-block;
		vertical-align: middle;
		width: 50%;
		font-size: 28upx;
	}

	.operation-text {
		width: 48%;
		color: #06AE56;
		float: left;
		margin: 100upx 0 0;
	}

	.dev-list ul {
		padding: 0;
		margin-top: 12s0upx;
	}

	.dev-list ul li {
		background: #ffffff;
		width: 100%;
		margin-bottom: 6upx;
		border-bottom: 2upx solid #eee;
	}

	.sub-list {
		min-height: 100upx;
		height: auto;
		display: inline-flex;
		width: 100%;
		align-items: center;
		padding: 10upx 0;
		border-bottom: 1upx dotted #eee;
	}

	.sub-list:after {
		content: " ";
		float: right;
		transform: rotate(45deg);
		height: 8px;
		width: 8px;
		border-width: 5upx 5upx 0 0;
		border-color: #c8c8cd;
		border-style: solid;
		position: relative;
		margin-right: 18upx;
		margin-left: .3em;
	}

	.dev-list ul li image {
		padding: 0 10upx;
		width: 80upx;
		height: 80upx;
	}

	.dev-name {
		text-align: left;
		width: 60%;
		display: inline-block;
		padding-left: 16upx;
	}

	.dev-type {
		text-align: right;
		width: 25%;
		display: inline-block;
		padding-right: 10upx;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.dev-info-btn {
		display: inline-block;
		width: 30%;
		margin-top: 3%;
		text-align: right;
		padding-right: 16upx;
	}

	.dev-info-btn button {
		border: none;
		background: transparent;
		display: inline-block;
		padding: 0;
		width: 80upx;
		height: 80upx;
		margin-left: 5upx;
	}

	.dev-info-btn button:after {
		border: none;
		padding: 0;
		width: 80upx;
		height: 80upx;
	}

	.dev-info-btn button image {
		width: 80upx;
		height: 80upx;
	}

	.no-data {
		width: 100%;
		height: 400upx;
		text-align: center;
		line-height: 400upx;
	}

	.connect-status {
		border-radius: 10upx;
		padding: 0 10upx;
		font-size: 24upx;
		color: #FFFFFF;
	}

	.status-0 {
		background-color: red;
	}

	.status-1 {
		background-color: #06AE56;
	}

	.status-2 {
		background-color: #BEBEBE
	}

	.tag-style {
		width: 25%;
		color: #06AE56;
		border: 1upx solid #06AE56;
		margin: 0 8upx;
		text-align: center;
		font-size: 24upx;
		border-radius: 25upx;
		float: left;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
</style>
