<template>
	<view>
		<u-navbar :title="'评价'"></u-navbar>
		<view class="pingjiachenggong">
			<u-image width="54rpx" height="54rpx" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/userComplaints/pingjiachenggong.png"></u-image>
		</view>
		<view class="pingjia">评价成功</view>
		<view class="evaluation">
			感谢您的评价！
		</view>
		<view class="xingxing">
			<u-image width="481rpx" height="185rpx" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/userComplaints/xingxing.png"></u-image>
		</view>
		
		<view  class="weixiao">
			<u-image width="195rpx" height="189rpx" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/userComplaints/weixiao.png"></u-image>
		</view>
		<view class="btn_box">
			<u-button @click="btn" class="btn_box_button" type="primary" shape="circle">
				确定
			</u-button>
		</view>
		
	</view>
</template>
	
<script>
	export default {
		
		methods:{
			btn(){
				this.$Router.push({
					path: '/sub-package2/pages/home/userComplaints/index'
				});
			}
		}
		
	}
</script>
	
<style scoped lang="scss">
	.evaluation{
		position: absolute;
		margin-left: 281rpx;
		margin-top: 280rpx;
	}
	.weixiao{
		position: absolute;
		margin-left: 278rpx;
		margin-top: 380rpx;
	}
	.xingxing{
		position: absolute;
		margin-left: 131rpx;
		margin-top: 216rpx;
	}
	.pingjiachenggong{
		position: absolute;
		margin-left: 234rpx;
		margin-top: 207rpx;
	}
	.pingjia{
		position: absolute;
		margin-left: 310rpx;
		margin-top: 195rpx;
		font-size: 52rpx;
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



