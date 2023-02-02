<template>
	
	<view>
		<u-navbar class="navbar" title="" :border-bottom="false">
			<view style=" width: 100%; text-align: right; " @click="applicationRecord">申请记录</view>
		</u-navbar>
		<view class="beijin">
			
		</view>
		<view class="box-na">
			<u-row gutter="8" justify="center">
				<u-col span="6">
					<view class="box-car" @click="payFees">
						<u-image width="55upx" height="60upx" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/home/payParking/lintingjiaofei.png"></u-image>
						<view class="yueka-box">临停缴费</view>
					</view>
				</u-col>
				<u-col span="1">
					<view class="box-car" @click="monthlyCard">
						<u-image width="55upx" height="60upx" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/home/payParking/yuekaishenqing.png"></u-image>
						<view class="yueka-box">月卡管理</view>
					</view>
				</u-col>
			</u-row>
		</view>
	</view>
	
</template>

<script>
	export default {
			data() {
				return {
				}
			},
			methods:{
				payFees() {
					this.$Router.push({
						path: '/sub-package2/pages/home/payParking/suspendedPayment',
					})
				},
				monthlyCard() {
					this.$Router.push({
						path: '/sub-package2/pages/home/payParking/monthlyCard',
					})
				},
				applicationRecord(){
					this.$Router.push({
						path: '/sub-package2/pages/home/payParking/monthlyCardRecord',
					})
				},
			}
		}
</script>
<style>
	page {
		background: #F9F9F9;
	}
</style>
<style>
	.beijin{
		width: 100%;
		height: 250upx;
		background: url('https://file.yuanzhoulvwego.com/prod/uploadFiles/home/payParking/beijin.png');
		background-size: 100% 100%;
		position: relative;
	}
	.box-na{
		background-color: #FFFFFF;
		height: 250upx;
		margin: 30upx 20upx 0upx 20upx ;
		border-radius: 20upx;
	}
	.box-car{
		position: relative;
		transform:translateY(50%);
	}
	.yueka-box{
		margin-top: 10upx;
		width: 150upx;
		position: relative;
		right: 30upx;
	}
</style>
