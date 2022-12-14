<template>
	<page>
		<u-navbar :title="title"></u-navbar>
		<view class="u-flex-col u-col-center u-row-center">
			<view class="u-m-t-80">
				<u-image :fade="false" :lazy-load="false" width="168" height="168" :src="resultsImage"></u-image>
			</view>
			<view class="u-m-t-20 u-font-xl u-text-bold">
				{{results?'支付成功':'支付失败'}}
			</view>
			<view class="u-m-t-30">
				<text class="u-font-48 u-text-bold-800">￥</text>
				<text class="u-font-74 u-text-bold-600">26644.</text>
				<text class="u-font-58 u-text-bold">82</text>
			</view>
			
			<view class="but_box u-flex-col u-row-between">
				<u-button v-if="results" class="but" @click="complete" shape="circle" size="medium" type="primary">完成</u-button>
				<u-button v-if="!results" class="but" @click="againPay" shape="circle" size="medium" type="primary">重新支付</u-button>
				<u-button v-if="results" class="but u-m-t-20" @click="goBillInfo" :custom-style="{color:'#3E76F4'}" shape="circle" size="medium">账单详情</u-button>
			</view>
		</view>
	</page>
</template>

<script>
	export default {
		data() {
			return {
				title:'',
				results:'',
				resultsImage:'',
			};
		},
		methods:{
			complete(){
				// uni.reLaunch({
				// 	url: '/pages/home/billPay/index'
				// });
				this.$Router.back(3);
			},
			againPay(){
				// uni.reLaunch({
				// 	url: '/pages/home/billPay/pay'
				// });
				this.$Router.back(1);
			},
			goBillInfo(){
				this.$Router.back (2);
			}
		},
		onLoad() {
			this.results = this.$Route.query.results
			if(this.results){
				this.title = '支付成功'
				this.resultsImage = '/static/home/billPay/zhifuichenggong.png'
			}else{
				this.title = '支付失败'
				this.resultsImage = '/static/home/billPay/zhifuishibai.png'
			}
		}
	}
</script>

<style lang="scss" scoped>
	.but_box{
		margin-top: 130upx;
		width: 100%;
		padding: 0 74upx;
	}
	.but{
		font-size: 34upx;
		width: 100%;
		height: 100upx;
	}
</style>
