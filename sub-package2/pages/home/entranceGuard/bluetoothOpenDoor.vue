<template>
	<view>
		<z-paging ref="paging" v-model="dataList" @query="getInfo">
			<view slot="top" class="u-m-b-20">
				<u-navbar class="navbar" :title="tabCur?'远程开门':'蓝牙开门'" :border-bottom="false">
				</u-navbar>
				<!-- 头部搜索 -->
				<view class="search">
					<u-search @search="search" placeholder="请输入关键字" :show-action="false" v-model="form.keywordSearch">
					</u-search>
				</view>

				<!-- <view class="head">
					<u-dropdown @close="close" :selectData="selectData" ref="floorDropdown" :border-bottom="true"
						active-color="#e35d5d" menu-icon="xialasanjiao" menu-icon-size="20">
						<u-dropdown-item :title="selectData[0] ?selectData[0].label:'楼栋'">
							<scroll-view scroll-y scroll-with-animation class="u-tab-view menu-scroll-view">
								<view v-for="(item,index) in buildingList" :key="index" class="u-tab-item"
									:class="[item.active ? 'u-tab-item-active' : '']" :data-current="index"
									@click.stop="floorScroll(item,buildingList,0)">
									<text class="u-line-1">{{item.label}}</text>
								</view>
							</scroll-view>
						</u-dropdown-item>
						<u-dropdown-item :title="selectData[1]?selectData[1].label:'楼层'">
							<scroll-view scroll-y scroll-with-animation class="u-tab-view menu-scroll-view">
								<view v-for="(item,index) in floorList" :key="index" class="u-tab-item"
									:class="[item.active ? 'u-tab-item-active' : '']" :data-current="index"
									@click.stop="floorScroll(item,floorList,1)">
									<text class="u-line-1">{{item.label}}</text>
								</view>
							</scroll-view>
						</u-dropdown-item>
					</u-dropdown>
				</view> -->
			</view>
			<view class="box u-p-20">
				<view class="card-box u-flex u-row-between u-m-b-10" v-for="(item, index) in dataList" :key="item.id">
						<u-icon class="head_left_icon" :label="item.deviceInstallAddress" margin-left="10" label-size="30"
							label-color="#333333" name="https://file.yuanzhoulvwego.com/prod/uploadFiles/home/entranceGuard/shebei-lan.png" size="60"></u-icon>
					<view @click="clickKey(item,index)" class="u-font-md">
						点击开门
					</view>
				</view>
			</view>
		</z-paging>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tabCur:this.$Route.query.tabCur,
				selectData: [],
				buildingList: [],
				floorList: [{
					label: '全部',
					value: 0,
					active: false
				}],
				dataList: [],
				form: {
					keywordSearch: '',
					currPage: 1,
					pageSize: 10,
				},
			};
		},
		onLoad() {
			this.$enum.buildfloorEnum(res => {
				this.buildingList = res.map(item => {
					return {
						value: item.id,
						label: item.name,
						children: item.children
					}
				})
				this.buildingList.push({
					value: '',
					label: '全部',
					children: []
				})
			})
			this.roomStatus = this.$u.deepClone(this.$enum.roomStatus)
			this.roomStatus.push({
				value: '',
				label: '全部'
			})
			this.roomStatus = this.roomStatus.map((item) => {
				item.active = false
				return item
			})
			this.selectType = this.$enum.roomType.map((item) => {
				item.checked = 0
				return item
			})
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
			close() {
				this.$refs.paging.updatePageScrollTopHeight()
			},
			search() {
				this.$refs.paging.reload();
			},
			//点击开门钥匙
			clickKey(dev, index) {
				var _this = this;
				uni.showLoading({
					title: _this.common["open-door"],
					mask: true
				});
				console.log(this.tabCur);
				if (this.tabCur == 0) {
					//蓝牙开门
					this.bluetoothOpenDoor(dev);
				} else if (this.tabCur == 1) {
					//远程开门
					this.remoteOpenDoor(dev);
				}
			},
			// 远程开门
			remoteOpenDoor(dev) {
				var _this = this;
				console.log("远程开门");
				let errorMsg = this.opendoor["remote-failed"] || "远程开门失败， ";
				this.$api('equipment.remoteDoor', {
					relayIndex: dev.relayIndex,
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
						this.ifNeedBluetoothOpen(errorMsg, dev);
					}
				}).catch((e) => {
					this.ifNeedBluetoothOpen(errorMsg, dev);
				});
			},
			// 蓝牙开门
			bluetoothOpenDoor(dev) {
				var sdkUtil = this.$sdkUtil;
				let devObj = dev
				sdkUtil.bluetoothOpenDoor(dev, (res) => {
					let refObj = {
						doorName: dev.doorName,
						ref: this.$refs
					};
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
					// sim卡不知道为什么要上传
					// setTimeout(() => {
					// 	if (homeInfo.isUploadSimByOpenDoor == 1) {
					// 		devObj.controlWay = 1;
					// 		devObj.eKey = dev.appEkey
					// 		devObj.devType = dev.deviceModelValue
					// 		console.log('获取sim卡信息')
					// 		sdkUtil.getSimstatus(devObj, result => {
					// 			if (result.errorCode === 0) {
					// 				let data = result.data;
					// 				this.uploadServer(data, dev)
					// 			}
					// 		});
					// 	}
					// }, 4000)
			
				});
			},
			//上传卡信息
			uploadServer(data, dev) {
				this.$req.request({
					url: "/devDevice/app/configSimNumber",
					method: "POST",
					data: {
						devSn: dev.devSn,
						modelName: data.model_name,
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
							console.log('上传设备剩余电量');
							// that.$req.request({
							// 	url: "/devDevice/app/uploadRemainingBattery",
							// 	data: {
							// 		devSn: dev.devSn.toString(),
							// 		remainingBattery: data.electricity.toString()
							// 	},
							// 	success: res => {
							// 		// console.log( '上传设备剩余电量'+res.code)
							// 	}
							// })
							//上传设备固件版本
							console.log('上传设备固件版本');
							// that.$req.request({
							// 	url: "/devDevice/app/uploadFirmVersion",
							// 	data: {
							// 		devSn: dev.devSn.toString(),
							// 		firmwareVersion: data.systemVersion.toString()
							// 	},
							// 	success: res => {
							// 		// console.log('上传设备固件版本'+res.code)
							// 	}
							// })
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
			getInfo(pageNo, pageSize) {
				this.form.currPage = pageNo
				this.form.pageSize = pageSize
				// this.form.isSupportNetwork = this.tabCur
				this.selectData.forEach((item, index) => {
					switch (index) {
						case 0:
							this.form.buildingId = this.selectData[0].value || ''
							break;
						case 1:
							this.form.floorId = this.selectData[1].value || ''
							break;
					}
				})
				let params = this.$u.deepMerge(this.form, this.formDropdown);
				params.isSupportNetwork = this.$Route.query.tabCur?1:''
				this.$api('equipment.getAppDevAuthorize', params).then(res => {

					this.$refs.paging.complete(res.data.list);
				}).catch((e) => {
					console.log(e);
					this.$refs.paging.complete(false);
				});
			},
			floorScroll(res, arr, indexSelect) {
				if (indexSelect === 0) {
					this.$set(this.selectData, 1, '')
					this.floorList = res.children.map(item => {
						return {
							value: item.id,
							label: item.name,
						}
					})
					this.floorList.push({
						value: '',
						label: '全部'
					})
				}
				if (res.label == '全部') {
					arr.forEach((item) => {
						if (res.value === item.value) {
							item.active = true
						} else {
							item.active = false
						}

					})
					this.$set(this.selectData, indexSelect, '')
				} else {
					arr.forEach((item) => {
						if (res.value === item.value) {

							item.active = true
						} else {
							item.active = false
						}
					})
					this.$set(this.selectData, indexSelect, res)
				}
				this.$refs.paging.reload(false);
				this.$refs.floorDropdown.close();
			},
		}
	}
</script>
<style>
	page {
		background: #F1F2F3;
	}
</style>
<style scoped lang="scss">
	.head_left_icon {
		/deep/ .u-icon__label {
			font-weight: bold;
			color: #333333;
		}
	}
	/deep/ .zp-paging-container {
		background-color: #FFFFFF;
		border-radius: 20upx 20upx 0px 0px;
	}

	// .box{

	// }
	.card-box {
		background-color: #F0F6FF;
		box-shadow: 0px 0px 10upx 0px rgba(221, 221, 221, 0.35);
		padding: 30upx 20upx;
		border-radius: 15upx;
	}

	.search {
		padding: 17upx 20upx;
		background: #FFFFFF;
	}

	.head {
		background-color: #ffffff;
		margin-bottom: 20upx;

		.u-tab-item-active {
			color: #e35d5d !important;
		}

		.u-tab-view {
			height: 500upx;
		}

		.u-tab-item {
			height: 110rpx;
			background: #FFFFFF;
			box-sizing: border-box;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 30rpx;
			color: #333333;
			font-weight: 400;
			line-height: 1;
		}
	}
</style>
