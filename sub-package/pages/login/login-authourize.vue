<template>
	<view>
		<view class="logo-box">
			<image src="http://www.thinmoo.com/wp-content/uploads/2020/10/logo.jpg"></image><br />
			<text>达管家社区</text>
		</view>
		<view class="instruction-box">
			您暂未授权“达管家社区”小程序获取您的头像、昵称等信息, 将无法正常使用小程序的功能。如需正常使用，请点击“立即授权”按钮。
		</view>
		<view class="authorize-box">
			<button type="primary" @click="goToLogin">立即授权</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			
		},
		methods: {
			goToLogin() {
				uni.navigateTo({
					url: "login"
				})
			}
		}
	}
</script>

<style>
	.logo-box {
		width: 100%;
		margin-top: 20%;
		text-align: center;
		font-size: 36upx;
	}
	
	.logo-box image {
		width: 200upx;
		height: 200upx;
	}
	
	.instruction-box {
		width: 80%;
		margin: 70upx 10%;
		color: #6D6D72;
	}
	
	.authorize-box {
		width: 100%;
		margin-top: 30upx;
		text-align: center;
	}
	
	.authorize-box button {
		width: 80%;
	}
	
</style>
