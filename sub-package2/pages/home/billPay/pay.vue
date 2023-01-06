<template>
	<page>
		<u-navbar title="支付账单" title-color="#fff" back-icon-color="#fff" :background="{background: '#5984F6'}"
			:border-bottom="false"></u-navbar>
		<view class="head u-flex-col u-row-center u-col-center u-text-color-fff">
			<view class="">
				<text class="u-font-48 u-text-bold-800">￥</text>
				<text class="u-font-74 u-text-bold-600">26644.</text>
				<text class="u-font-58 u-text-bold">82</text>
			</view>
			<view class="u-font-sm u-m-t-20">
				7月物业账单
			</view>
		</view>
		<view class="body u-m-30 u-m-t-50">
			<view class="body-prompt">
				请选择支付方式
			</view>
			<view class="u-m-t-50">
				<u-cell-group :border="false">
					<u-radio-group size="45" icon-size="30" v-model="radioValue" @change="radioGroupChange">
					<u-cell-item @click="radioValue='支付宝'" :arrow="false" :title-style="titleStyle" title="支付宝支付">
						<u-icon slot="icon" size="50" name="http://yuanzhoulvwego.com/wp-content/uploads/static/home/billPay/zhifubao.png"></u-icon>
						<u-radio slot="right-icon" name="支付宝"></u-radio>
					</u-cell-item>
					<u-cell-item @click="radioValue='微信'" :border-bottom="false" :arrow="false" :title-style="titleStyle" title="微信支付">
						<u-icon slot="icon" size="50" name="http://yuanzhoulvwego.com/wp-content/uploads/static/home/billPay/weixinzhifu.png"></u-icon>
						<u-radio slot="right-icon" name="微信"></u-radio>
					</u-cell-item>
					</u-radio-group>
				</u-cell-group>
			</view>
		</view>
		<view class="but_box u-flex u-row-between">
			<u-button class="but" @click="onSubmit" shape="circle" size="medium" type="primary">确认支付</u-button>
		</view>
		<u-modal
			v-model="modeShow"
			title="确认要离开收银台？"
			:title-style="modalTitleStyle"
			:content-style="contentStyle"
			:show-cancel-button="true"
			cancel-text="确认离开"
			:cancel-style="cancelStyle"
			:confirm-style="confirmStyle"
			confirm-text="继续支付"
			@confirm="confirm"
			@cancel="cancel"
		>
			<view class="slot-content">
				<text>您的账单还未完成支付，请尽快支付。</text>
			</view>
		</u-modal>
	</page>
</template>

<script>
	export default {
		data() {
			return {
				modeShow: false,
				exitPage: false,
				// 弹窗标题样式
				modalTitleStyle: {
					fontSize: '36upx',
					fontWeight: 'bold',
					color: '#333333'
				},
				// 弹窗内容样式
				contentStyle: {
					textAlign: 'center',
					margin: '30upx'
				},
				cancelStyle:{
					fontSize: '32upx',
					fontWeight: 'bold',
					color: '#333333'
				},
				confirmStyle:{
					fontSize: '32upx',
					fontWeight: 'bold',
					color: '#3E76F4'
				},
				radioValue:'支付宝',
				titleStyle:{
					fontSize: '32upx',
					marginLeft: '15upx'
				}
			};
		},
		methods:{
			confirm(){
				this.exitPage=false
			},
			cancel(){
				this.exitPage=true	
				this.$Router.back(1);
			},
			radioGroupChange(e){
				console.log(e);
			},
			onBackPress(from){
				if(this.exitPage){
					
				}else{
					this.modeShow=true
					return true
				}
			},
			onSubmit(){
				let results = 0
				if(this.$u.random(0, 1)){
					results = 1
				}else{
					results = 0
				}
				this.$Router.push({
					path: '/sub-package2/pages/home/billPay/payResults',
					query:{
						results
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.slot-content{
		padding: 20upx;
		font-size: 30upx;
	}
	.but_box{
		width: 100%;
		position: absolute;
		bottom: 0;
		padding: 0 55upx;
	}
	.but{
		font-size: 34upx;
		width: 100%;
		height: 100upx;
	}
	.head{
		width: 100%;
		height: 380upx;
		background: url('http://yuanzhoulvwego.com/wp-content/uploads/static/home/billPay/beijin.png') no-repeat;
		background-size: 100% 100%;
	}
	/deep/ .u-radio-group {
		width: 100%;
		.u-radio__label{
			margin-left: 0;
			margin-right: 0;
		}
	}
</style>
