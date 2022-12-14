<template>
	<page>
		<u-navbar title="缴费记录"></u-navbar>
		<view class="body u-p-20">
			<view class="card" v-for="(item,index) in dataList">
				<view class="card-head-title">
					{{ item.year }}年缴费记录
				</view>
				
				<view class="card-body u-flex u-row-between" v-for="(citem,cindex) in item.child" @click="gobillInfo(citem)">
					<view class="u-flex-row">
						<view class="time-box u-text-color-fff bg1">
							<text class="u-font-42 u-text-bold">{{ citem.billStartTime.split('-')[1] }}</text>
							<text class="u-font-24">月</text>
						</view>
						<view class="u-m-l-15 u-flex-col u-row-between">
							<view class="u-font-weight">
								账单已结清
							</view>
							<view class="u-font-md u-content-color">
								{{ citem.billStartTime + ' 至 ' + citem.billEndTime }}
							</view>
						</view>
					</view>
					<!-- <view class="">
						<u-button v-if="!citem.invoiceState" shape="square" :custom-style="customStyle" size="mini">去开票</u-button>
						<u-button v-if="citem.invoiceState" shape="square" hover-class="none" :custom-style="customStyle2" size="mini">已开票</u-button>
					</view> -->
				</view>
			</view>
			<view v-if="dataList.length === 0" class="no-data">没有数据哦~</view>
		</view>
	</page>
</template>

<script>
	export default {
		data() {
			return {
				// 当前租户id
				enterpriseId: uni.getStorageSync("userInfo").enterpriseId,
				current: 0,
				customStyle:{
					fontSize: '30upx',
					color:'#3E76F4',
					height:'55upx',
				},
				customStyle2:{
					fontSize: '30upx',
					color:'#CCCCCC',
					height:'55upx',
				},
				dataList:[]
			};
		},
		onLoad() {
			this.paymentRecord()
		},
		methods: {
			paymentRecord() {
				this.$api('billPay.paymentRecord', { enterpriseId: this.enterpriseId })
				.then(res => {
					if (res.code == 200) {
						let arr = res.data
						// 筛选出年份，并去重、降序
						let [...yearList] = new Set(arr.map(item => { return item.billStartTime.split('-')[0] }).sort((a, b) => { return b - a }))
						// 年份加入数组
						yearList.forEach(yitem => {
							this.dataList.push({ year: yitem, child: [] })
						})
						// 年份相同的加进child，降序
						this.dataList.forEach(ditem => {
							arr.forEach(aitem => {
								if (ditem.year == aitem.billStartTime.split('-')[0]) {
									ditem.child.push(aitem)
								}
							})
							ditem.child.sort((a, b) => { return b.billStartTime.split('-')[1] - a.billStartTime.split('-')[1] })
						})
					}
				})
			},
			gobillInfo(data) {
				this.$Router.push({
					path: '/pages/home/billPay/billInfo',
					query:{
						id: data.id,
						month: data.billStartTime.split('-')[1]
					}
				});
			},
		}
		
	}
</script>
<style>
	page {
		background-color: #f1f2f3;
	}
</style>
<style lang="scss" scoped>
	.bg1 {
		background: #6980FF;
	}
	/deep/ .u-hairline-border::after{
		border: 3px solid currentColor;
	}
	/deep/ uni-button::after{
		border-radius: 8px !important;
	}
	.time-box{
		width: 90upx;
		height: 90upx;
		border-radius: 45upx;
		line-height: 90upx;
		text-align: center;
	}
	.card-head-title{
		padding: 20upx 0 30upx 10upx;
	}
	.card-body{
		background: #FFFFFF;
		padding: 30upx 10upx 30upx 20upx;
		margin-bottom: 20upx;
	}
	.no-data {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 26rpx;
		color: #aaaaaa;
	}
</style>
