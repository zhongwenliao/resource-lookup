<template>
	<view class="list-view visit-list">
		<u-navbar class="navbar" title="月卡记录" :border-bottom="false"></u-navbar>
		<uni-tab :tab-list="tabList" :tabCur.sync="tabCur" tab-class="opening-record-view-tab" textFlex
			@change="tabChange"></uni-tab>
		<swiper :current="tabCur" class="swiper custom-swiper" @change="swiperChange" duration="300" :circular="true"
			indicator-color="rgba(255,255,255,0)" indicator-active-color="rgba(255,255,255,0)">
			<!-- 按园区门禁 -->
			<swiper-item>
				<view class="scroll-view">
					<view class="event-list-view">
						<view class="card" v-for="(item,index) in devOpenRecordList" :key="index">
							<view v-if="item.applicationStatus==1||item.applicationStatus==4">
								<view class="head" style="color: #3E76F4;">
									<view class="head-left">
										申办成功
									</view>
								</view>
								<view class="body">
									<view class="body-text body-but-box">
										<view style="width: 100%;font-size: 28upx;line-height: 50upx;">
											<view>车牌号：{{item.licensePlateNumber}}</view>
											<view>申请时长：{{item.processingTime}}个月</view>
											<view>有效期至{{item.endDate}} <span style='color: F59A23;'>有效</span></view>
											<view>申办时间：{{item.applicationTime}}</view>
											<view>审核时间：{{item.reviewTimeZone}}</view>
											<view>费用：<span style='color: #3E76F4;'>￥200</span></view>
										</view>
									</view>
								</view>
							</view>
							<view v-if="item.applicationStatus==2||item.applicationStatus==4">
								<view class="head" style="color: red;">
									<view class="head-left">
										申办失败
									</view>
								</view>
								<view class="body">
									<view class="body-text body-but-box">
										<view style="width: 100%;font-size: 28upx;line-height: 50upx;">
											<view>车牌号：{{item.licensePlateNumber}}</view>
											<view>申请时长：{{item.processingTime}}个月</view>
											<view>申办时间：{{item.applicationTime}}</view>
											<view>驳回理由：{{item.overruleReasonProperty}}</view>
										</view>
									</view>
								</view>
							</view>



						</view>

					</view>
				</view>
				<view class="no-data-view" style="color: black;">
					暂无数据
				</view>
			</swiper-item>
			<!-- 按公寓门禁 -->
			<swiper-item>
				<view class="scroll-view">
					<view class="event-list-view">

						<view class="card" v-for="(itme,index) in paymentHistoryList">
							<view class="head">
								<view class="head-left" style="color: #3E76F4;">
									支付成功
								</view>
								<view class="head-right">
									+{{item.amountReceived}}
								</view>
							</view>
							<view class="body">
								<view class="body-text body-but-box">
									<view style="display: flex;justify-content: space-between;width: 100%;">
										<view style="font-size: 28upx;">
											<view>
												订单时间：{{item.createTime}}
											</view>
											<view>
												支付时间：{{item.reviewTimeProperty}}
											</view>
										</view>
										<view style="margin: 20upx 20upx 0 0 ;color: #3E76F4; ">微信支付</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="no-data-view" style="color: black;">
					暂无数据
				</view>

			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tabCur: 0,
				dataStatus: true,
				roomList: [],
				paymentHistoryList: [],
				devOpenRecordList: [],
				tabList: [],
				allDoorList: [],
				doorName: "",
				timeout: null,
				devOpenRecordParams: {
					currPage: 1,
					pageSize: 15
				},
				paymentHistoryParams: {
					currPage: 1,
					pageSize: 15,
					applicationStatus:3
				}
			}
		},
		computed: {
			vis() {
				return this.$t("vis")
			},
			title() {
				return this.$t("title")
			}
		},
		onReady() {
			console.log("ces1");
			this.$setTitle(this.title["vis-address"]);
		},

		onLoad(options) {
			this.tabList = [{
				name: "申办记录"
			}, {
				name: '支付记录'
			}]
			this.initData();
			// this.getRoomList();
			this.devApartmentOpenRecordGetAllDoorList();
		},
		/*上拉加载*/
		onReachBottom: function() {
			if (this.doorName === '申办记录') {
				this.devOpenRecordAddgetAllDoorList()
			} else {
				this.paymentHistoryAllDoorAddgetAllDoorList();
			}
		},
		/*下拉刷新*/
		onPullDownRefresh: function() {
			if (this.doorName === '申办记录') {
				this.devApartmentOpenRecordGetAllDoorList();
			} else {
				this.paymentHistoryAllDoorList();
			}
		},
		methods: {
			//获取支付记录列表
			paymentHistoryAllDoorList() {
				uni.showLoading({
					title: '加载中'
				});
				this.paymentHistoryParams.keywordSearch = this.doorName
				this.paymentHistoryParams.currPage = 1
				this.paymentHistoryParams.pageSize = this.paymentHistoryList.length || 15
				this.$api('monthCard.parkUserInfolist', this.paymentHistoryParams).then(res => {
					console.log(res);
					if (res.code == 200) {
						this.paymentHistoryList = res.data.list;
						this.allDoorList = res.data;
						uni.hideLoading();
						uni.stopPullDownRefresh(); //得到数据后停止下拉刷新
						this.dataStatus = true
					}
				})
			},
			//获取支付记录列表
			paymentHistoryAllDoorAddgetAllDoorList() {
				const that = this
				uni.showLoading({
					title: '加载中'
				});
				this.paymentHistoryParams.currPage++
				this.paymentHistoryParams.pageSize = 15
				uni.showNavigationBarLoading();
				this.$api('monthCard.parkUserInfolist', this.paymentHistoryParams).then(res => {
					console.log(res);
					if (res.code == 200) {
						this.paymentHistoryList = this.paymentHistoryList.concat(res.data.list);
						uni.hideLoading();
						uni.hideNavigationBarLoading(); //关闭加载动画
						this.dataStatus = true
					}
				})
			},
			//获取申办记录列表
			devApartmentOpenRecordGetAllDoorList() {
				this.dataStatus = false
				uni.showLoading({
					title: '加载中'
				});
				this.devOpenRecordParams.keywordSearch = this.doorName
				this.devOpenRecordParams.currPage = 1
				this.devOpenRecordParams.pageSize = this.devOpenRecordList.length || 15

				this.$api('monthCard.parkUserInfolist', this.devOpenRecordParams).then(res => {
					this.doorList = this.devOpenRecordList = []
					if (res.code == 200) {
						this.devOpenRecordList = [...this.devOpenRecordList, ...res.data.list];
						uni.hideLoading();
						uni.stopPullDownRefresh(); //得到数据后停止下拉刷新
						this.dataStatus = true
					}

				})
			},
			//获取申办记录列表
			devOpenRecordAddgetAllDoorList() {
				const that = this
				this.dataStatus = false
				uni.showLoading({
					title: '加载中'
				});
				this.devOpenRecordParams.currPage++
				this.devOpenRecordParams.pageSize = 15
				uni.showNavigationBarLoading();
				this.$api('monthCard.parkUserInfolist', this.devOpenRecordParams).then(res => {
					console.log(res);
					if (res.code == 200) {
						this.devOpenRecordList = this.devOpenRecordList.concat(res.data.list);
						uni.hideLoading();
						uni.hideNavigationBarLoading(); //关闭加载动画
						this.dataStatus = true
					}
				})
			},

			initData() {
				this.tabCur = 0;
			},
			swiperChange(e) {
				console.log(e.detail.current)
				let page = e.detail.current;
				this.tabCur = page;
				if (page == 0) {
					this.devApartmentOpenRecordGetAllDoorList();
				} else if (page == 1) {
					this.paymentHistoryAllDoorList();
				}
			},
			tabChange(index) {
				this.tabCur = index;
			},
			//选择房间
			selectRoom(room) {
				uni.debugLog("roomInfo", room)
				var param = {
					"roomId": room.id,
					// "name": room.zoneName + "/" + room.buildingName + "/" + room.name,
					"name": room.buildingName + "/" + room.name,
					"communityId": room.communityId
				};
				this.$onfire.fire("EventAddressChange", param);
				uni.navigateBack(1);
			},

			//选择门禁
			selectDoor(door) {
				var param = {
					"devSn": door.devSn,
					"name": door.name,
					"communityId": door.communityId
				};
				this.$onfire.fire("EventAddressChange", param);
				uni.navigateBack(1);
			},

			//过滤设备
			filterDevice(e) {
				if (this.timeout) {
					clearTimeout(this.timeout);
				}
				this.timeout = setTimeout(() => {
					if (e == null || e == undefined || e == "") {
						this.doorName = ''
					}
					if (this.tabCur == 0) {
						this.devApartmentOpenRecordGetAllDoorList()
					} else {
						this.paymentHistoryAllDoorList();
					}
				}, 500)
				return



			}
		}
	}
</script>

<style lang="scss">
	page {
		display: flex;
		height: 100%;
	}

	.visit-list {
		border-top: 1px solid #DBDBDB;
		width: 100%;
		font-size: 30upx;
		background: #f2f2f2;

		.opening-record-view-tab {
			background: #FFFFFF;
			color: #333333;
			font-weight: bold;
			font-size: 34rpx;
		}

		.custom-swiper {
			height: calc(100% - 50px);
			// overflow: auto;
		}

		.opening-record-view-list {
			width: 100%;
		}

	}

	.search-input {
		padding: 0 40rpx 0 20rpx;
		// padding: 10upx 10%;
		// background: #eeeeee;
		// border: 1upx solid #EEEEEE;
		// border-radius: 10upx;
		// line-height: 40upx;
	}

	.search-input image {
		width: 40upx;
		height: 40upx;
		padding: 10upx;
		// background: #FFFFFF;
		display: inline-block;
		padding-right: 10upx;
	}

	.search-input input {
		width: 80%;
		padding: 10upx;
		background: #FFFFFF;
		display: inline-block;
		font-size: 32upx;
	}

	.event-list-view ul {
		padding: 0 20upx;
		list-style: none;
	}

	.scroll-view {
		height: calc(100% - 50px);
		overflow: auto;
	}

	.event-list-view ul li {
		background: #FFFFFF;
		word-break: break-all;
		min-height: 70upx;
		line-height: 70upx;
		width: 94%;
		padding-top: 20upx;
		padding-bottom: 20upx;
		margin-left: 3%;
		/* margin-right: 3%;
		margin-bottom: 4upx; */
		border-bottom: 2upx solid #EEEEEE;
		font-size: 30upx;
	}

	.card {
		background: #ffffff;
		border-radius: 15upx;
		margin-bottom: 24upx;

		.head {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 15upx 20upx;
			border-bottom: 1px solid #F1F2F3;
			font-size: 30upx;
		}

		.body {
			padding: 30upx 20upx 40upx 20upx;

			.body-text {
				color: #333333;

			}

			.body-but-box {
				display: flex;
				justify-content: space-between;
			}
		}
	}
</style>
