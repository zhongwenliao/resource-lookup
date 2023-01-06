<template>
	<page>
		<z-paging ref="paging" v-model="dataList" @query="getInfo">
			<view slot="top" class="">
				<u-navbar class="navbar" title="账单缴费" :border-bottom="false">
					<view @click="payRecord" slot="right">
						缴费记录
					</view>
				</u-navbar>
			</view>
			<view class="content u-p-35">
				<view class="card u-text-color-fff u-m-b-30" v-for="(item,index) in dataList" :class="item.bg" @click="gobillInfo(item)">
					<view class="card-head u-p-20 u-flex u-row-between">
						<view class="u-font-lg2">
							{{item.year}}年/{{item.month}}月缴费账单
						</view>
						<view  class="">
							<!-- 账单明细 -->
							<u-icon name="arrow-right" label-pos="left" label-size="30" label-color="#ffffff"
								label="账单明细" color="#ffffff" size="30"></u-icon>
						</view>
					</view>
					<view class="card-body u-p-50">
						<text class="u-font-xl u-font-weight">￥</text>
						<text class="u-font-58 u-font-weight">{{item.totalReceivable}}</text>
					</view>
					<view class="card-foot u-flex-col u-col-bottom u-font-md">
						致：{{ companyName }}
					</view>
				</view>
			</view>
		</z-paging>
	</page>
</template>

<script>
	export default {
		data() {
			return {
				title: '素胚勾勒出青花，笔锋浓转淡',
				subTitle: '2020-05-15',
				thumb: 'http://pic2.sc.chinaz.com/Files/pic/pic9/202002/hpic2119_s.jpg',
				current: 0,
				dataList: [],
				companyName: uni.getStorageSync('userInfo').companyName
			};
		},
		computed: {},
		onLoad() {},
		methods: {
			payRecord() {
				this.$Router.push({
					path: '/sub-package2/pages/home/billPay/payRecord',
				});
			},
			gobillInfo(data) {
				this.$Router.push({
					path: '/sub-package2/pages/home/billPay/billInfo',
					query:{
						id:data.id,
						month:data.month
					}
				});
			},
			getInfo(pageNo, pageSize, from) {
				const params = {
					currPage: pageNo,
					pageSize: pageSize,
				}
				if (from == 0) {
					this.current = 0
				}
				let bgArr = [
					'bg1',
					'bg2',
					'bg1',
					'bg3',
				]
				this.$api('billPay.getBillByMyself', params).then(res => {
					if (res.code == 200) {
						let arr = []
						arr = res.data.list.map((item, index) => {

							if (this.current > 3) {
								this.current = 0
							}
							let startTimeArr = item.billStartTime.split('-')
							let endTimeArr = item.billEndTime.split('-')
							item.year = startTimeArr[0]
							item.month = startTimeArr[1]
							item.timeSection =
								`${startTimeArr[1]}/${startTimeArr[2]}-${endTimeArr[1]}/${endTimeArr[2]}`
							item.bg = bgArr[this.current]
							this.current++
							return item
						})
						this.$refs.paging.complete(arr);
					} else {
						this.$refs.paging.complete(false);
					}

				}).catch((e) => {
					this.$refs.paging.complete(false);
				});
			}
		}
	}
</script>
<style>
	page {
		background-color: #f1f2f3;
	}
</style>
<style lang="scss">
	.bg1 {
		background: url('http://yuanzhoulvwego.com/wp-content/uploads/static/home/billPay/zhangdandi-lan.png') no-repeat;
		background-size: 100% 100%;
		position: relative;
	}

	.bg1::before {
		content: "";
		position: absolute;
		left: 35upx;
		right: 35upx;
		bottom: -27.5upx;
		height: 55upx;
		background: url('http://yuanzhoulvwego.com/wp-content/uploads/static/home/billPay/yinying-lan.png') no-repeat;
		background-size: 100% 100%;
		z-index: -1;
		opacity: 0.4;
		border-radius: 6upx;
	}

	.bg2 {
		background: url('http://yuanzhoulvwego.com/wp-content/uploads/static/home/billPay/di-hong.png') no-repeat;
		background-size: 100% 100%;
		position: relative;
	}

	.bg2::before {
		content: "";
		position: absolute;
		left: 35upx;
		right: 35upx;
		bottom: -27.5upx;
		height: 55upx;
		background: url('http://yuanzhoulvwego.com/wp-content/uploads/static/home/billPay/yinying-hong.png') no-repeat;
		background-size: 100% 100%;
		z-index: -1;
		opacity: 0.4;
		border-radius: 6upx;
	}

	.bg3 {
		background: url('http://yuanzhoulvwego.com/wp-content/uploads/static/home/billPay/di-cheng.png') no-repeat;
		background-size: 100% 100%;
		position: relative;
	}

	.bg3::before {
		content: "";
		position: absolute;
		left: 35upx;
		right: 35upx;
		bottom: -27.5upx;
		height: 55upx;
		background: url('http://yuanzhoulvwego.com/wp-content/uploads/static/home/billPay/yinying-cheng.png') no-repeat;
		background-size: 100% 100%;
		z-index: 1;
		opacity: 0.4;
		border-radius: 6upx;
	}

	.content {
		padding-bottom: 0upx !important;
	}

	.card {
		width: 100%;
		// overflow: hidden;

		.card-foot {
			padding: 30upx 28upx 11upx 17upx;
		}
	}
</style>
