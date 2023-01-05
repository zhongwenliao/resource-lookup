<template>
	<view class="life-payment">
		<view class="item">
			<view class="room">
				{{details.communityName}}{{details.roomName}}
			</view>
			<view class="payment-mess" v-for="(item,index) in detailsList" :key="index">
				<view class="cost-type clear">
					<text class="name fl">{{item.name}}</text>
					<text class="money fr">{{item.fee}}元</text>
				</view>
				<view class="quantity">
					<text>单价：{{item.feeStandard}}元/
						<text v-if="item.name ==='水费'">吨</text>
						<text v-if="item.name ==='电费'">度</text>
						<text v-if="item.name ==='物业费'">户</text>
					</text>
					<text v-if="item.used && item.name !=='物业费'">使用量：{{item.used}}
						<text v-if="item.unit==0">平方米</text>
						<text v-else-if="item.unit==1">吨</text>
						<text v-else-if="item.unit==2">度</text>
						<text v-else="item.unit==3">户</text>
					</text>
				</view>
				<view class="meter_img" v-if="item.name !=='物业费'">
					<text>上月读数：{{item.lastRead}}</text>
					<text>当月读数：{{item.currentRead}}</text>
				</view>
			</view>
		</view>
		<view class="pay-bottom">
			<view class="all">
				合计：<text>￥{{details.fee}}元</text> 
			</view>
			<button @click="account">立即结算</button>
		</view>
		<!-- 支付方式类型 -->
		<view class="pay-mark" v-show="payShow">
			<view class="pay-con">
				<view class="title">
					支付方式
				</view>
				<view class="pay-item clear">
					<view class="fl" v-for="(item,index) in supportPayList" :key="index">
						<view class="" v-if="item == 1" @click="selectPay(item)">
							<view class="img-box">
								<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/wxzf.png" mode=""></image>
							</view>
							<text>微信支付</text>
						</view>
						<!-- <view class="" v-if="item == 2" @click="selectPay(item)">
							<view class="img-box">
								<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/zfbzf.png" mode=""></image>
							</view>
							<text>支付宝支付</text>
						</view> -->
					</view>
				</view>
				<view style="text-align: center;padding-top: 40upx;" v-if="supportPayList.length == 0">
					暂不支持任何支付！
				</view>
				<view class="cancel" @click="cancel">
					取消
				</view>
			</view>
		</view>
	</view>
</template>
<script>
export default {
	data() {
		return {
			payShow: false,
			id: "",
			detailsList: [],
			details:{},
			supportPayList: [],
			payParam: {},
			selectSupportPay: null, //选择的支付对象
			orderId: ""
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
						this.orderId = this.details.orderId;
					}
				}
			});
		},
		account(){
			this.payShow = true;
		},
		cancel(){
			this.payShow = false
		},
		//选择支付方式
		selectPay(supportPay) {
			console.log(supportPay);
		    this.selectSupportPay = supportPay;
		    this.payByOrderId(this.selectSupportPay);
		},
		
		// 微信小程序支付
		// #ifdef MP-WEIXIN
		payByOrderId(payType){
			var currentCommunity = this.$getUserInfo().currentCommunity;
			if (currentCommunity !== undefined) {
				var communityId = currentCommunity.id;
				this.$req.request({
					url: "/wyLivingPaymentBill/app/payByOrderId",
					method: "POST",
					data: {
						communityId: communityId,
						orderId: this.orderId,
						payPlat: 1,
						payScene: 6,
						payMode: 4,
						payType: payType,
						openId: uni.getStorageSync("userInfo").wxMiniOpenId,
					},
					isShowLoading: false,
					success: res => {
						if(res.code == 0){
							this.payParam = res.data.payParam;
							wx.requestPayment({
							  timeStamp: this.payParam.timeStamp,
							  nonceStr: this.payParam.nonceStr,
							  package: this.payParam.package,
							  signType: this.payParam.signType,
							  paySign: this.payParam.paySign,
							  success:function(res) { 
								   setTimeout(()=>{
									   wx.reLaunch({
											url: "/sub-package/pages/payment/paySuccess"
										})
								   },100)
							  },
							  fail : res => { 
								console.log(res)
							  }
							})
						}
					}
				});
			}
		}
		// #endif
	},
	onLoad(options) {
		this.id = options.id;
		this.getBillDetail(this.id);
		let supportPayList = uni.getStorageSync("getSupportPay");
		this.supportPayList = supportPayList.map(item => {
			return item.supportPay;
		});
	}
};
</script>

<style lang="scss" scoped>
	.life-payment{
		width: 100%;
		background: #f9f9f9;
		border-top: 1px solid #eee;
	}
	.life-payment .item{
		margin-bottom: 20upx;
	}
	.room{
		padding-left: 30upx;
		background: #fff;
		padding-top: 30upx;
	}
	.payment-mess{
		background: #fff;
		// margin-top: 20upx;
		padding: 30upx;
		// border-top: 1px solid #eee;
	}
	.cost-type{
		font-size: 30upx;
		line-height: 24upx;
		margin-bottom: 30upx;
	}
	.payment-mess .money{
		color: #088B68;
	}
	.quantity text{
		font-size: 28upx;
		margin-right: 40upx;
		color: #333333;
	}
	.meter_img text{
		font-size: 28upx;
		margin-right: 40upx;
		color: #333333;
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
	.pay-bottom{
		width: 100%;
		height: 100upx;
		position: fixed;
		left: 0;
		bottom: 0;
		background: #fff;
	}
	.pay-bottom .all{
		display: inline-block;
		margin-left: 20upx;
		margin-top: 24upx;
	}
	.all text{
		color: #088B68;
	}
	.pay-bottom button{
		width: 250upx;
		height: 100upx;
		line-height: 100upx;
		background: linear-gradient(118deg, #01dca3 0%, #088b68 100%);
		box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
		color: #ffffff;
		position: absolute;
		right: 0;
		bottom: 0;
		border-radius: 0;
	}
	.pay-mark{
		width: 100%;
		height: 100%;
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
		background: rgba(0,0,0,.3);
		transition: all 2s;
		z-index: 999;
	}
	.pay-con{
		width: 100%;
		background: #fff;
		position: fixed;
		left: 0;
		bottom: 0;
		border-radius: 20upx 20upx 0 0;
	}
	.pay-con .title{
		color: #000;
		padding: 30upx 0;
		font-size: 38upx;
		text-align: center;
		border-bottom: 1px solid #eee;
	}
	.pay-item .fl{
		text-align: center;
		margin-left: 40upx;
	}
	.pay-item .img-box{
		border-radius: 10upx;
		padding: 20upx;
		margin-top: 30upx;
		// margin-bottom: 10upx;
	}
	.pay-item .fl text{
		color: #aaa;
		font-size: 24upx;
	}
	.pay-item image{
		width: 80upx;
		height: 80upx;
		display: block;
	}
	.pay-con .cancel{
		width: 90%;
		color: #fff;
		font-size: 30upx;
		text-align: center;
		padding: 16upx 0;
		border-top: 1px solid #ddd;
		margin-top: 10upx;
		background: #00af81;
		border-radius: 10upx;
		margin: auto;
		margin-bottom: 40upx;
		margin-top: 40upx;
	}
</style>