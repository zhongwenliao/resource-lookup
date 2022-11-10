<template>
	<view class="container">
		<view class="user-info-box ymcode_ml">
			<view class="portrait-box">
				<image class="portrait" :src="userIn.imgUrl || '/static/missing-face.png'"></image>
			</view>
			<view class="info-box">
				<text class="username">账号: {{userIn.userid}}</text>
				<p class="username">昵称: {{userIn.userName}}</p>			
			</view>
		</view>
		<view class="qrcode-image">
			<image class="bg-set" :src="bgImgUrl || '/static/webp.png'" />
			<view class="yuanqi-qrcode" :style="'bottom:' + qrCodeCss">
				<w-qrcode class="tki-qrcode" :options="options"></w-qrcode>
				<view class="image_view">
					<!-- <button @click="SaveCode">保存图片</button> -->
					<button class="ymcode_ml" open-type="share">分享至微信</button>
				</view>
				<view class="image_title">本活动最终版权归华歌行所有</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				options:{
					code: '',// 生成二维码的值
					size: 420,// 460代表生成的二维码的宽高均为460rpx
					border:{//非必传
						color: ['#FFFFFF'], //边框颜色支持渐变色 最多10种颜色 如果默认黑色此属性不需要传
						lineWidth: 4, //边框宽度
					},
					img: {// 二维码log配置 非必传
						src: '/static/logImage.png', // 图片地址
						size: 80,// 图片大小
						degree: 15,// 圆角大小 如果type为round生效
						type: 'none',//图片展示类型 默认none 可选值  round圆角  circle圆 如果为round 可以传入degree设置圆角大小 默认 5
						color: '#ffffff', //图片周围的白色边框
						width: 8 //图片周围白色边框的宽度 默认5
					},
				},
				
				userIn: {
					userCode: ''
				},
				yqm:'',
				bgImgUrl:'',
				qrCodeCss: '',
				varUrl: 'https://funong.abillchen.top/#/pages/public/reg?yqm='
			};
		},
		onLoad(options) {
			if (uni.getStorageSync('userid')) {
				this.person();
				this.getBgImgUrl();
				this.qrCodeY()
			} else {						
				uni.redirectTo({
					url:'/pages/public/login'
				})
			}
		},
		onShareAppMessage(res){
			return {
				title: '邀请您升级VIP会员',
				path: '/pages/public/reg?yqm='+ this.userIn.userCode
			}
		},
		methods: {
			person(){
				this.$http("userInfo", JSON.stringify({
					token:uni.getStorageSync("token"),
				})).then(res=>{
					this.userIn = res.data.userInfo
					
					this.options.code = this.varUrl + this.userIn.userCode
				}).catch(err=>{
					console.log(err);
				})	
			},
			getBgImgUrl(){
				this.$http("systemCfgInfoClient",JSON.stringify({
					token:uni.getStorageSync("token"),
					cfgKey:'qrCodeBgImg'
				})).then(res=>{
					this.bgImgUrl = res.data.systemCfgInfo.cfgValue;
				}).catch(err=>{
					console.log(err);
				})	
			},
			qrCodeY(){
				this.$http("systemCfgInfoClient",JSON.stringify({
					token:uni.getStorageSync("token"),
					cfgKey:'qrCodeY'
				})).then(res=>{
					this.qrCodeCss = res.data.systemCfgInfo.cfgValue;
				}).catch(err=>{
					console.log(err);
				})	
			}
		}
	}
</script>

<style lang="scss" scoped>
	.bg-set{
		position: fixed;
		width: 100%;
		height: 100%;
		left: 0;
		z-index: -1;
	}
	
	.yuanqi-qrcode{
		position: absolute;
		bottom: 6%;
		right: 0;
		left: 0;
	}
	
	.user-info-box {
		height: 180upx;
		display: flex;
		align-items: center;
		position: relative;
		z-index: 1;
		background-color: #45B0F4;
		padding: 0 20rpx;
		
		.portrait {
			width: 130upx;
			height: 130upx;
			border: 5upx solid #fff;
			border-radius: 50%;
		}
	
		.username {
			font-size: 26rpx;
			color: white;
			margin-left: 20upx;
		}
	}
	.qrcode-image{
		width: 100%;
		height: calc(100vh - 180rpx);
	}
	.image_view{
		text-align: center;
		margin: 0 140rpx;
		color: #FFFFFF;
		font-size: 32rpx;
		
		button:nth-child(1){
			margin: 20rpx 0;
			display: flex;
			justify-content: center;
			border-radius: 50rpx;
			color: #FFFFFF;
		}
		
		button:nth-child(2) {
			background-color: #3F51B5;
			display: flex;
			justify-content: center;
			border-radius: 50rpx;
			color: #FFFFFF;
		}
	}
	.image_title{
		font-size: 26rpx;
		display: flex;
		justify-content: center;
		margin-top: 30rpx;
		color: #929292;
	}
	.tki-qrcode{
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>