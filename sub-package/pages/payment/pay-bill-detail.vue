<template>
	<view class="details">
		<view class="payment-list">
			<view class="title">
				基本信息
			</view>
			<view class="payment-mess" v-for="(item,index) in detailsList" :key="index">
				<view class="cost-type clear">
					<text class="name fl">{{item.name}}</text>
					<text class="money fr">{{item.fee}}元</text>
				</view>
				<view class="" v-if="item.name !== '物业费' && item.name === '水费'">
					<view class="quantity">
						<text>单价：{{item.feeStandard}}元/吨</text>
						<text>用水量：{{item.used}}吨</text>
					</view>
					<view class="meter_img">
						<text>上月抄表：{{item.lastRead}}吨</text>
						<text>当月抄表：{{item.currentRead}}吨</text>
					</view>
				</view>
				<view class="" v-else-if="item.name !== '物业费' && item.name === '电费'">
					<view class="quantity">
						<text>单价：{{item.feeStandard}}元/度</text>
						<text>用水量：{{item.used}}度</text>
					</view>
					<view class="meter_img">
						<text>上月抄表：{{item.lastRead}}度</text>
						<text>当月抄表：{{item.currentRead}}度</text>
					</view>
				</view>
				<view class="" v-else>
					<view class="quantity">
						<text>收费标准：每户</text>
					</view>
				</view>
			</view>
			<view class="all">
				合计：<text>{{details.fee}}元</text> 
			</view>
			<view class="title" style="margin-top: 20upx;">
				账单信息
			</view>
			<view class="bill-info">
				<view class="item clear">
					<view class="label fl">
						账单编号
					</view>
					<view class="value fr">
						{{details.orderId}}
					</view>
				</view>
				<view class="item clear">
					<view class="label fl">
						支付金额
					</view>
					<view class="value fr">
						￥{{details.fee}}
					</view>
				</view>
				<view class="item clear">
					<view class="label fl">
						支付方式
					</view>
					<view class="value fr" v-if="details.payMode == 1">现场</view>
					<view class="value fr" v-if="details.payMode == 2">H5</view>
					<view class="value fr" v-if="details.payMode == 3">公众号</view>
					<view class="value fr" v-if="details.payMode == 4">微信小程序</view>
					<view class="value fr" v-if="details.payMode == 5">App</view>
				</view>
				<view class="item clear">
					<view class="label fl">
						支付类型
					</view>
					<view class="value fr" v-if="details.payType == 1">微信</view>
					<view class="value fr" v-if="details.payType == 2">支付宝</view>
					<view class="value fr" v-if="details.payType == 3">现金</view>
					<view class="value fr" v-if="details.payType == 4">PP支付</view>
					<view class="value fr" v-if="details.payType == 5">第三方支付</view>
				</view>
				<view class="item clear">
					<view class="label fl">
						支付日期
					</view>
					<view class="value fr">
						{{details.payTime}}
					</view>
				</view>
				<view class="item clear">
					<view class="label fl">
						交易账单
					</view>
					<view class="value fr">
						{{details.payOrderNo}}
					</view>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
export default {
	data() {
		return {
			id: "",
			detailsList: [],
			details:{},
		};
	},
	methods: {
		// 缴费详情
		getBillDetail(id){
			this.$req.request({
				url: "/wyLivingPaymentBill/app/getById",
				method: "POST",
				data: {
					id: id,
				},
				isShowLoading: false,
				success: res => {
					if(res.code == 0){
						this.details = res.data;
						this.detailsList = res.data.billDetailList;
					}
				}
			});
		},
	},
	onLoad(options) {
		this.id = options.id;
		this.getBillDetail(this.id);
	}
};
</script>

<style lang="scss" scoped>
	.details{
		width: 100%;
		background: #F2F2F2;
	}
	.payment-list{
		margin-top: 20upx;
	}
	.payment-list .title{
		font-size: 38upx;
		padding: 20upx 30upx;
		background: #fff;
	}
	.all{
		background: #fff;
		text-align: right;
		padding: 20upx 30upx 20upx 0;
	}
	.all text{
		color: #088B68;
	}
	.payment-mess{
		background: #fff;
		padding: 30upx;
		border-bottom: 1px solid #eee;
	}
	.cost-type{
		font-size: 30upx;
		line-height: 24upx;
		margin-bottom: 30upx;
	}
	.quantity text{
		font-size: 28upx;
		margin-right: 40upx;
		color: #333333;
	}
	.meter_img text{
		font-size: 28upx;
		margin-right: 40upx;
		color: #999999;
	}
	.meter_img image{
		width: 100upx;
		height: 100upx;
	}
	.meter_img .item{
		width: 49%;
		text-align: center;
		margin-right: 2%;
	}
	.meter_img .item:last-child{
		margin-right: 0;
	}
	.meter_img .item .month{
		font-size: 24upx;
		line-height: 0;
	}
	.bill-info .item{
		background: #fff;
		border-bottom: 1px solid #eee;
		padding: 20upx 30upx;
	}
</style>