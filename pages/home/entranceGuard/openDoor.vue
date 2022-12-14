<template>
	<view>
		<u-navbar :title="'开门成功'"></u-navbar>
		<view class="open">
			<u-image class="opendoor" width="195rpx" height="189rpx" src="../../../static/entranceGuard/kaimenchenggong.png"></u-image>
		</view>
		<view class="open1">开门成功</view>
		<view class="btn_box">
			<u-button @click="btn" class="btn_box_button" type="primary" shape="circle">
				返回
			</u-button>
		</view>
		
	</view>
</template>
	
<script>
	export default {
		
		methods:{
			
			btn(){
				uni.navigateBack({
						delta:1,//返回层数，2则上上页
					})
			}
		}
		
	}
</script>
	
<style scoped lang="scss">
	.open {
		margin-top: 17%;
	}
	.opendoor {
		margin: 0 auto
		
	}
	.open1 {
		text-align: center;
		margin-top: 37rpx;
		font-size: 34upx;
		font-family: PingFang SC;
		font-weight: bold;
	}
	.open2 {
		text-align: center;
		margin-top: 58rpx;
		font-size: 26upx;
		font-family: PingFang SC;
	}

	.btn_box {
		height: 98upx;
		position: fixed;
		width: 100%;
		bottom: 35%;
		background-color: white;
		padding: 0 64upx;
		z-index: 99;
	}

</style>



