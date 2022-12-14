<template>
	<view class="apply">
		<view class="postpone_status">
			<span>审批成功</span><image src="../../static/img/yes.png" mode=""></image> 
		</view>
		<!--月卡信息-->
		<div>
			<view class="title">
				月卡信息
			</view>
			<view class="fill">
				<view class="item" v-if="cardInfo.cardId">
					<text class="label">卡ID</text>
					<text class="item_content">{{cardInfo.cardId}}</text>
				</view>
				<view class="item" v-if="cardInfo.cardNo">
					<text class="label">编号</text>
					<text class="item_content">{{cardInfo.cardNo}}</text>
				</view>
				<view class="item" v-if="cardInfo.timeNum">
					<text class="label">申请时长</text>
					<text class="item_content">{{cardInfo.timeNum}}月</text>
				</view>
				<view class="item" v-if="cardInfo.endTime">
					<text class="label">有效期</text>
					<text class="item_content">{{cardInfo.endTime}}</text>
				</view>
				<view class="item" v-if="cardInfo.createTime">
					<text class="label">申办时间</text>
					<text class="item_content">{{cardInfo.createTime}}</text>
				</view>
				<view class="item" v-if="cardInfo.auditTime">
					<text class="label">审核时间</text>
					<text class="item_content">{{cardInfo.auditTime}}</text>
				</view>
				<view class="item">
					<text class="label">状态</text>
					<text class="item_content" v-if="cardInfo.status == 1">待审核</text>
					<text class="item_content" v-if="cardInfo.status == 2">审核通过</text>
					<text class="item_content" v-if="cardInfo.status == 3">审核驳回</text>
					<text class="item_content" v-if="cardInfo.status == 4">办理成功</text>
				</view>
			</view>
		</div>
		
		<!--车牌号-->
		<div>
			<view class="title">
				车牌号
			</view>
			<view class="fill">
				<view class="item" v-for="(item, index) in carNo" :key="index">
					<text>{{item}}</text>
				</view>
			</view>
		</div>
		
		<!--车位信息-->
		<div v-if="cardInfo.lot">
			<view class="title">
				车位信息
			</view>
			<view class="fill">
				<view class="item">
					<text>{{cardInfo.lot}}</text>
				</view>
			</view>
		</div>
		
		<view class="form">
			<button @click="pay">支付</button>
		</view>
		<!-- APP支付方式弹窗 -->
		<!-- <view class="" v-show="payType">
			支付宝
		</view> -->
	</view>
</template>

<script>
	export default {
		data() {
			return {
				cardId: "",
				cardInfo: {},
				supportPayList: [],
				payParam: {},
				payType: false,
				carNo: []
			}
		},
		methods: {
			// 获取支付类型
			// getSupportPay(){
			// 	var currentCommunity = this.$getUserInfo().currentCommunity;
			// 	if (currentCommunity !== undefined) {
			// 		var communityId = currentCommunity.id;
			// 		this.$req.request({
			// 			url: "/payConfig/app/getSupportPay",
			// 			method: "POST",
			// 			data: {
			// 				communityId: communityId
			// 			},
			// 			isShowLoading: false,
			// 			success: res => {
			// 				if(res.code == 0){
			// 					this.supportPayList = res.data.data.map(item =>{
			// 						return item.supportPay
			// 					});
			// 				}
			// 			}
			// 		});
			// 	}
			// },
			
			// 微信小程序支付
			// #ifdef MP-WEIXIN
			pay(){
				var currentCommunity = this.$getUserInfo().currentCommunity;
				if (currentCommunity !== undefined) {
					var communityId = currentCommunity.id;
					this.$req.request({
						url: "/parkCard/app/payByCardRecordId",
						method: "POST",
						data: {
							communityId: communityId,
							cardRecordId: this.cardInfo.id,
							openId: uni.getStorageSync("userInfo").wxMiniOpenId,
							payMode: 4,
							payPlat: 1,
							payScene: 4,
							payType: 1,
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
										   uni.showToast({
										       title: '标题',
										       duration: 2000
										   });
										   wx.reLaunch({
												url: "/sub-package/pages/payment/month-card-history"
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
			
			// APP支付
			// #ifdef APP-PLUS || H5
			// pay(){
			// 	this.payType = true
			// }
			// #endif
		},
		onLoad(option) {
			// this.getSupportPay();
			this.cardInfo = JSON.parse(option.item);
			this.carNo = this.cardInfo.carNo.split(",");
		},
	}
</script>

<style lang="scss">
	.apply {
		width: 100%;
		background: #F8F9FB;
	}
	.postpone_status{
		text-align: center;
		padding-top: 20upx;
	}
	.postpone_status span{
		font-size: 36upx;
		color: #088b68;
		margin-right: 20upx;
	}
	.postpone_status image{
		width: 60upx;
		height: 60upx;
		display: inline-block;
		vertical-align: top;
	}
	.title {
		color: #000;
		font-size: 36upx;
		font-weight: 500;
		padding: 10upx 30upx 12upx;
	}

	.fill {
		// width:97%;
		background: #FFFFFF;
		box-shadow: 0upx 2upx 16upx rgba(182, 186, 193, 0.16);
		border-radius: 16upx;
		padding: 24upx;
		box-sizing: border-box;
		margin: 0upx 24upx;
	}

	.fill .item {
		padding: 10upx 0;
		font-size: 28upx;
		color:#24272E;
	}

	.item .label {
		display: inline-block;
		width: 140upx;
		margin-right: 20upx;
		color: #787F8A;
	}

	.item .item_content{
		    width: 75%;
		    display: inline-block;
		    text-align: right;
	}
		
	.form {
		width: 100%;
		height: 88upx;
		margin-top: 40upx;
		margin-bottom: 40upx;
	}

	.form button {
		height: 88upx;
		line-height: 88upx;
		background: linear-gradient(118deg, #01dca3 0%, #088b68 100%);
		box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
		border-radius: 50upx 50upx 50upx 50upx;
		color: #ffffff;
		margin: 0 32upx;
	}
</style>
