<template>
	<view class="container">
		<view class="top ymcode_ml"></view>
		<view class="content">
			<view class="entrance">
				<view class="title"><image src="/static/nav/yhq.png" />当前优惠券可用(张)</view>
				<view class="navs">
					<view class="num">{{num}}</view>
					<!-- <view class="b-btn">去获取</view> -->
				</view>
			</view>
		</view>
		
		<view class="member-news">
			<view class="header">
				<view class="tiao ymcode_ml"></view>
				<view class="title">优惠券明细</view>
			</view>
			
			<view class="list">					
				<label class="list-cell" v-for="item in coupon" :key="item.yhqID">
					<view class="coupon">
						<view class="left">
							<text class="title">{{item.yhqFlmc}}</text>
							<text class="time">获得时间:&nbsp;&nbsp;{{item.getTime}}</text>
							<text class="time">有效期还剩{{item.expDays}}天</text>
							<text class="time">最大可优惠金额{{item.money}}元</text>
						</view>
						<view class="right">
							<!-- <image src="/static/nav/logo.png"></image> -->
							<view class="b-btn" @click="navcode(item.yhqID, item.yhqFlmc)">转赠</view>
						</view>
					</view>				
				</label>
			</view>
			
		</view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userid: uni.getStorageSync("userid"),
				num: 0,
				coupon:[]
			}
		},
		onShow(){
			if (uni.getStorageSync('userid')) {
				this.showinfo()
			}else{//未登录
				uni.navigateTo({
					url:'/pages/public/login'
				})
			}
			
		},
		methods: {
			showinfo(){
				this.$http("yhqListUser",JSON.stringify({
						pg:'0',
						token:uni.getStorageSync("token"),
					})).then(res=>{
						if(res.data.code==0){
							this.coupon = res.data.yhqList.datas
							this.num = res.data.yhqList.pgInfo.total_num;
						}
						else if(res.data.code == 99){
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
						}
						else{
							uni.showToast({
								title: res.data.msg,
								icon: "none"
							})
						}
					}).catch(err=>{
						console.log(err);
					})
		
			},
			
			navcode(yhqid, name){
				let web = '/pages/user/given?yhqid='+yhqid+'&name='+name
				uni.redirectTo({
					url:web
				})	
			}
		}
	}
</script>

<style lang='scss' scoped>
page {
		padding-top: 40rpx;
	}

.top {
	position: relative;
	width: 100%;
	height: 100rpx;
	padding: 10rpx 10rpx 0rpx;
	
}

.content {
	padding: 0 20rpx;
}

.entrance {
	position: relative;
	margin-top: -120rpx;
	margin-bottom: 30rpx;
	border-radius: 10rpx;
	background-color: #ffffff;
	box-shadow: $box-shadow;
	padding: 30rpx 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 200rpx;
	display: flex;
	flex-direction: column;
	
	.title{
		width: 100%;
		height: 50rpx;
		position: relative;
		font-size: 28rpx;
		color: #FD7031;
		
		image{
			height: 35rpx;
			width: 45rpx;
			display: block;
			float: left;
			margin-right: 4rpx;
		}
	}
	
	.navs{
		width: 100%;
		height: 70rpx;
		margin-bottom: 20rpx;
		.num{
			display: block;
			float: left;
			font-size: 48rpx;
			color: #000000;
			height: 70rpx;
			line-height: 70rpx;
			margin-left: 40rpx;
		}
		
		.b-btn{
			width: 140rpx;
			height: 50rpx;
			text-align: center;
			line-height: 50rpx;
			font-size: 28rpx;
			color: #ffffff;
			border-radius: 20px;
			background: linear-gradient(left, #000000, #999999);
			display: block;
			float: right;
			margin-top: 10rpx;
		}
	}
	
	.params{
		width: 100%;
		border-top:2rpx solid #DDDDDD;
		padding: 20rpx 0;
		
		span{
			display: block;
			float: left;			
			font-size: 28rpx;
			height: 40rpx;
			line-height: 40rpx;
			width: 320rpx;
		}


	}
}

.container{
	font-size: 20rpx;
	margin-top: 20rpx;
}

.member-news {
	width: 100%;
	margin-bottom: 30rpx;
	.header {
		display: flex;
		padding: 20rpx;
		
		.title {
			font-size: 28rpx;		
		}
		
		.tiao{
			width:4rpx;
			margin-right: 6rpx;			
		}
	}
	
	.list {
		width: 100%;
		display: flex;
		flex-direction: column;
		padding: 0 20rpx;
	}
}

.list-cell {
		justify-content: flex-start;
		display: flex;
		align-items: center;
		
		.coupon{
			width: 650rpx;
			height: 190rpx;
			background-color: #FFF1EA;
			padding: 20rpx;
			margin: 10rpx 20rpx;
			border: 2rpx dotted #000000;
			
			.left{
				display: block;
				float: left;
				width: 500rpx;
				
				.title{
					font-size: 34rpx;
					color: #000000;
					width: 100%;
					display: block;
					height: 50rpx;
					line-height: 50rpx;
				}
				
				.time{
					font-size: 28rpx;
					color: #FD7031;
					width: 100%;
					display: block;
					height: 40rpx;
					line-height: 40rpx;
				}
			}
			
			.right{
				display: block;
				float: right;
				width: 100rpx;
				
				image{
					height: 50rpx;
					width: 100rpx;
				}
				
				.b-btn{
					width: 100rpx;
					height: 50rpx;
					text-align: center;
					line-height: 50rpx;
					font-size: 24rpx;
					color: #ffffff;
					border-radius: 20px;
					background: linear-gradient(left, #FD7031, #FD7031);
					display: block;
					float: right;
					margin-top: 30rpx;
				}
			}
			
		}

	}
</style>
