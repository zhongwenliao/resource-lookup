<template>
	<view class="body">
		<u-navbar style="background:#02A7F0;color: #fff;" title="月卡详情"></u-navbar>
		<view class="month-card-info">
			<view class="title">
				月卡信息
			</view>
			<view class="conter">
				<view>所属房间：<span>{{dataInfo.roomName}}</span> </view>
				<view>持卡人姓名：<span>{{dataInfo.userName}}</span> </view>
				<view>手机号：<span>{{dataInfo.phone}}</span> </view>
				<view> 车牌号：<span style="color: #4FA7F0;">{{dataInfo.parkingSpaceNumber}}</span></view>
				<view>开始时间：<span>{{dataInfo.startDate}}</span> <span style="color: #FA9504;">有效</span> </view>
				<view>结束时间：<span>{{dataInfo.endDate}}</span> </view>
				<view>卡状态：<span>{{dataInfo.statusName}}</span> </view>
				<view style="display: flex;height: 300upx;">
					<view>
						身份证：
					</view>
					<view style="display: flex;">
						<u-image style="margin-right: 20upx;" v-for="(item,index) in dataInfo.idPhoto" :src="item" :key="index" width="181"
							height="181">
						</u-image>
					</view>
				</view>
				<view style="display: flex;height: 300upx;">
					<view>
						行驶证：
					</view>
					<view style="display: flex;">
						<u-image style="margin-right: 20upx;" v-for="(item,index) in dataInfo.driverPhoto" :src="item" :key="index" width="181"
							height="181">
						</u-image>
					</view>
				</view>
				<view> 备注：<span>{{dataInfo.remark}}</span></view>
			</view>
			<view v-if="dataInfo.status==1||dataInfo.status==2" class="but">
				<view style="margin: 0 auto;width: 400upx;">
					<u-button @click="goRouter(dataInfo.type,dataInfo.id)" type="primary">申请延期</u-button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id: 0,
				dataInfo: {}
			}
		},
		onLoad() {
			this.queryData()
		},
		methods: {
			queryData() {
				uni.showLoading({
					title: '加载中'
				});
				this.id = this.$Route.query.id
				this.$api('monthCard.parkUserInfoGetById', {
						id: this.id
					})
					.then(res => {
						if (res.code == 200) {
							this.dataInfo = res.data
							if (this.dataInfo.status == 0) {
								this.dataInfo.statusName = '未生效'
							} else if (this.dataInfo.status == 1) {
								this.dataInfo.statusName = '已生效'
							} else if (this.dataInfo.status == 2) {
								this.dataInfo.statusName = '已过期'
							} else if (this.dataInfo.status == 3) {
								this.dataInfo.statusName = '下发失败'
							}
							uni.hideLoading();
							uni.stopPullDownRefresh(); //得到数据后停止下拉刷新
							console.log(res)
						}
					})
			},
			goRouter(type,id) {
				this.$Router.push({
					path: '/pages/home/payParking/monthlyCardProcessing',
					query: {
						type: type,
						id:id,
					}
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.body {

		.head {
			width: 100%;
			text-align: center;
			margin: 60upx 0;
			color: #02A7F0;
			font-size: 40upx;

			.img {
				width: 50upx;
				height: 50upx;
				margin-left: 20upx;
			}
		}

		.month-card-info {
			width: 96%;
			margin: 20upx 2%;

			.title {
				font-weight: 300;
				font-size: 32upx;
				margin-left: 40upx;
				margin-bottom: 20upx;
			}

			.conter {
				margin-left: 80upx;
				font-size: 30upx;

				view {
					line-height: 60upx;
				}
			}
		}


		.but {
			width: 100%;
			position: fixed;
			bottom: 40upx;
		}
	}
</style>
