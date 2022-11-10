<template>
	<view>
		<view class="goods-section">			
			<!-- 商品列表 -->
			<view class="g-item">				
				<image :src="orderInfo.iconUrl" />
				
				<view class="right">
					<text class="title">{{orderInfo.spName}}</text>
				</view>
				
				<view class="price-box">
					<text class="num">x{{orderInfo.num}}</text>
				</view>
			</view>
		</view>
		
		<!-- 金额明细 -->
		<view class="yt-list">
			<view class="yt-list-cell b-b">
				<text class="cell-tit clamp">实付金额</text>
				<text class="cell-tip">{{orderInfo.money}}</text>
			</view>
			
			<view class="yt-list-cell_b">
				<view class="cell-tit clamp">配送地址</view>
				<view class="cell-tip">{{orderInfo.sjr}}, {{orderInfo.sjrdh}}, {{address}}</view>
			</view>
			
			<view class="yt-list-cell b-b" @click="orderExpress(orderInfo.orderID)">
				<text class="cell-tit clamp">订单号</text>
				<text class="cell-tip red">{{orderInfo.orderID}}</text>
			</view>
			
			<view class="yt-list-cell b-b">
				<text class="cell-tit clamp">下单时间</text>
				<text class="cell-tip">{{orderInfo.inputTime}}</text>
			</view>
			
			<view class="yt-list-cell_b b-b">
				<view class="cell-tit clamp">备注</view>
				<view class="cell-tip">{{orderInfo.remark}}</view>
			</view>
		</view>
		
		<view class="yt-list" v-if="orderInfo.expressNo">
			<view class="yt-list-cell b-b">
				<text class="cell-tit clamp">快递公司</text>
				<text class="cell-tip">{{orderInfo.expressName}}</text>
			</view>
			
			<view class="yt-list-cell b-b" @click="orderExpress(orderInfo.expressNo)">
				<text class="cell-tit clamp">快递单号</text>
				<text class="cell-tip red">{{orderInfo.expressNo}}</text>
			</view>
			
			<view class="yt-list-cell b-b">
				<text class="cell-tit clamp">快递时间</text>
				<text class="cell-tip">{{orderInfo.expressTime}}</text>
			</view>
		</view>
		
		<!-- 底部 -->
		<view class="footer" v-if="orderInfo.orderStatus == 1">
			<view class="price-content">
				<text>订单金额</text>
				<text class="price-tip">￥</text>
				<text class="price">{{orderInfo.money}}</text>
			</view>
			<text class="submit1" @click="deleteOrder()">删除订单</text>
			<text class="submit" @click="orderToPay(orderInfo.orderID)">立即付款</text>
		</view>
	</view>
</template>

<script>
	import myRequest from '../../utils/api.js';
	export default {
		data() {
			return {
				ddid:'',
				footershow:true,
				isshow:true,
				orderInfo:[],
				address: ''
			}
		},
		onLoad(option){				
			this.ddid=option.ddid;
			//this.status=option.state;	
			this.orderInfoGet();
		},
		methods: {
			orderExpress(orderExpressN){
				uni.setClipboardData({
					data: orderExpressN
				});
			},
			//用户收货地址获取
			orderInfoGet(){				
				this.$http("shangPinOrderInfo",
				JSON.stringify({
					token: uni.getStorageSync('token'),
					orderID: this.ddid
				}),).then(res => {	
					if(res.data.code==0){
						this.orderInfo = res.data.shangPinOrderInfo;
						this.address = this.orderInfo.sheng + this.orderInfo.shi + this.orderInfo.qu + this.orderInfo.xxdz
					} else if(res.data.code==99){
						uni.showModal({
						    content: "请先登录",
						    success: (e)=>{
						    	if(e.confirm){
									uni.clearStorage();				    		
						    		setTimeout(()=>{
						    			uni.redirectTo({
						    				url:"../public/login"
						    			})
						    		}, 200)
						    	}
						    }
						});
					} else {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
					}
				}).catch(err => {
					console.log(err);
				})								
			},
			
			//删除订单			
			deleteOrder(){
				var that = this;
				uni.showModal({
					title: '提示',
					content: '确定删除吗',
					success: function(res) {
						if (res.confirm) {							
							that.$http("shangPinOrderDel",
							JSON.stringify({
								token: uni.getStorageSync('token'),
								orderID: that.ddid
							}),).then(res=>{
								if (res.data.code == 0) {
									uni.showToast({
										title: res.data.msg,
										icon: "none"
									})
									setTimeout(() => {
										uni.redirectTo({
											url:'./order?state=0'
										})										   											
									}, 1000)
								} else {
									uni.showToast({
										title: res.data.msg,
										icon: "none"
									})
								}
							}).catch(err=>{
								console.log(err);
							})
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			numberChange(data) {
				this.number = data.number;
			},
			changePayType(type){
				this.payType = type;
			},
			submit(){
				uni.login({
				provider:"weixin",
				success:loginRes=>{
					this.code=loginRes.code
					console.log(loginRes.code,`code显示`)
					this.openIDfun()//调用openid接口
				}});
			},
			
			orderToPay(ddid){
				uni.redirectTo({
					url:'./orderjs?ddid='+ddid
				})	
			},		
			
		}
	}
</script>

<style scoped lang="scss">
	page {
		background: $page-color-base;
		padding-bottom: 100upx;
	}

	.goods-section {
		background: #fff;
		padding: 20rpx;

		.g-header {
			display: flex;
			align-items: center;
			height: 84upx;
			padding: 0 30upx;
			position: relative;
		}

		.logo {
			display: block;
			width: 50upx;
			height: 50upx;
			border-radius: 100px;
		}

		.name {
			font-size: 30upx;
			color: $font-color-base;
			margin-left: 24upx;
		}

		.g-item {
			display: flex;

			image {
				flex-shrink: 0;
				display: block;
				width: 140upx;
				height: 140upx;
				border-radius: 4upx;
			}

			.right {
				flex: 1;
				padding-left: 24upx;
				overflow: hidden;
			}

			.title {
				font-size: 30upx;
				color: $font-color-dark;
			}

			.spec {
				font-size: 26upx;
				color: $font-color-light;
			}

			.price-box {
				display: flex;
				align-items: center;
				font-size: 32upx;
				color: $font-color-dark;
				padding-top: 10upx;

				.price {
					margin-bottom: 4upx;
				}
				.number{
					font-size: 26upx;
					color: $font-color-base;
					margin-left: 30upx;
				}
			}

			.step-box {
				position: relative;
			}
		}
	}
	
	.yt-list {
		margin-top: 16upx;
		background: #fff;
	}

	.yt-list-cell {
		display: flex;
		align-items: center;
		padding: 10upx 30upx 10upx 40upx;
		line-height: 70upx;
		position: relative;

		&.cell-hover {
			background: #fafafa;
		}

		&.b-b:after {
			left: 30upx;
		}

		.cell-icon {
			height: 32upx;
			width: 32upx;
			font-size: 22upx;
			color: #fff;
			text-align: center;
			line-height: 32upx;
			background: #f85e52;
			border-radius: 4upx;
			margin-right: 12upx;

			&.hb {
				background: #ffaa0e;
			}

			&.lpk {
				background: #3ab54a;
			}

		}

		.cell-more {
			align-self: center;
			font-size: 24upx;
			color: $font-color-light;
			margin-left: 8upx;
			margin-right: -10upx;
		}

		.cell-tit {
			flex: 1;
			font-size: 26upx;
			color: $font-color-light;
			margin-right: 10upx;
		}

		.cell-tip {
			font-size: 26upx;
			color: $font-color-dark;

			&.disabled {
				color: $font-color-light;
			}

			&.active {
				color: $base-color;
			}
			&.red{
				color: $base-color;
			}
		}

		&.desc-cell {
			.cell-tit {
				max-width: 90upx;
			}
		}

		.desc {
			flex: 1;
			font-size: $font-base;
			color: $font-color-dark;
		}
	}
	
	.yt-list-cell_b {
		display: flex;
		align-items: center;
		padding: 10rpx 30rpx 10rpx 40rpx;
		line-height: 50rpx;
		position: relative;
	
		&.b-b:after {
			left: 30upx;
		}
	
		.cell-tit {
			flex: 1;
			font-size: 26upx;
			color: $font-color-light;
			margin-right: 10upx;
		}
	
		.cell-tip {
			font-size: 26rpx;
			color: #303133;
			height: 100%;
			width: 60%;
			text-align: right;
		}
	}
	
	/* 支付列表 */
	.pay-list{
		padding-left: 40upx;
		margin-top: 16upx;
		background: #fff;
		.pay-item{
			display: flex;
			align-items: center;
			padding-right: 20upx;
			line-height: 1;
			height: 110upx;	
			position: relative;
		}
		.icon-weixinzhifu{
			width: 80upx;
			font-size: 40upx;
			color: #6BCC03;
		}
		.icon-alipay{
			width: 80upx;
			font-size: 40upx;
			color: #06B4FD;
		}
		.icon-xuanzhong2{
			display: flex;
			align-items: center;
			justify-content: center;
			width: 60upx;
			height: 60upx;
			font-size: 40upx;
			color: $base-color;
		}
		.tit{
			font-size: 32upx;
			color: $font-color-dark;
			flex: 1;
		}
	}
	
	.footer{
		position: fixed;
		left: 0;
		bottom: 0;
		z-index: 995;
		display: flex;
		align-items: center;
		width: 100%;
		height: 90upx;
		justify-content: space-between;
		font-size: 30upx;
		background-color: #fff;
		z-index: 998;
		color: $font-color-base;
		box-shadow: 0 -1px 5px rgba(0,0,0,.1);
		.price-content{
			padding-left: 30upx;
		}
		.price-tip{
			color: $base-color;
			margin-left: 8upx;
		}
		.price{
			font-size: 36upx;
			color: $base-color;
		}
		.submit{
			display:flex;
			align-items:center;
			justify-content: center;
			width: 220upx;
			height: 100%;
			color: #fff;
			font-size: 32upx;
			background-color: $base-color;
		}
		.submit1{
			display:flex;
			align-items:center;
			justify-content: center;
			width: 220upx;
			height: 100%;
			color: #fff;
			font-size: 32upx;
			background-color:#606266;
			margin-left: 75upx;
		}
	}
	
	/* 优惠券面板 */
	.mask{
		display: flex;
		align-items: flex-end;
		position: fixed;
		left: 0;
		top: var(--window-top);
		bottom: 0;
		width: 100%;
		background: rgba(0,0,0,0);
		z-index: 9995;
		transition: .3s;
		
		.mask-content{
			width: 100%;
			min-height: 30vh;
			max-height: 70vh;
			background: #f3f3f3;
			transform: translateY(100%);
			transition: .3s;
			overflow-y:scroll;
		}
		&.none{
			display: none;
		}
		&.show{
			background: rgba(0,0,0,.4);
			
			.mask-content{
				transform: translateY(0);
			}
		}
	}

	/* 优惠券列表 */
	.coupon-item{
		display: flex;
		flex-direction: column;
		margin: 20upx 24upx;
		background: #fff;
		.con{
			display: flex;
			align-items: center;
			position: relative;
			height: 120upx;
			padding: 0 30upx;
			&:after{
				position: absolute;
				left: 0;
				bottom: 0;
				content: '';
				width: 100%;
				height: 0;
				border-bottom: 1px dashed #f3f3f3;
				transform: scaleY(50%);
			}
		}
		.left{
			display: flex;
			flex-direction: column;
			justify-content: center;
			flex: 1;
			overflow: hidden;
			height: 100upx;
		}
		.title{
			font-size: 32upx;
			color: $font-color-dark;
			margin-bottom: 10upx;
		}
		.time{
			font-size: 24upx;
			color: $font-color-light;
		}
		.right{
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			font-size: 26upx;
			color: $font-color-base;
			height: 100upx;
		}
		.price{
			font-size: 44upx;
			color: $base-color;
			&:before{
				content: '￥';
				font-size: 34upx;
			}
		}
		.tips{
			font-size: 24upx;
			color: $font-color-light;
			line-height: 60upx;
			padding-left: 30upx;
		}
		.circle{
			position: absolute;
			left: -6upx;
			bottom: -10upx;
			z-index: 10;
			width: 20upx;
			height: 20upx;
			background: #f3f3f3;
			border-radius: 100px;
			&.r{
				left: auto;
				right: -6upx;
			}
		}
	}
	
	.item {
		width: 100%;
		height: 120rpx;
		position: relative;
		padding: 0 20rpx;
		
		.item-left{
			display: block;
			float: left;
			margin-right: 20rpx;
			
			image{
				height: 100rpx;
				width: 100rpx;
			}
		}
		
		.item-right{
			display: block;
			float: left;
			height: 100%;
			
			.shopname{
				font-size: 28rpx; 
				font-weight: 500rpx;
				padding: 0 20rpx 30rpx;
			}
			
			.adress{
				font-size: 22rpx; 
				color:#999999;
				
				text{
					display: block;
					float: left;
					width: 50rpx !important;
				}
				
				p{
					display: block;
					float: left;
					height: 50rpx;
					line-height: 50rpx;
				}
			}
		}
	}
</style>
