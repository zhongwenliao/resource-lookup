<template>
	<view class="box4">
		<u-navbar title="联系物业" :border-bottom="false"></u-navbar>
		<view v-for='(item,index) in ContactProperty' :key='item.id' class="box">
			<text class="box1">{{item.contactName}}</text>
			<text class="box2">{{item.phone}}</text>
			<text class="box3" @click="CallOut(item),show = true">拨打</text>
		</view>
		<view>
			<!-- <u-action-sheet :list="list" v-model="show"></u-action-sheet> -->
			<u-mask :show="show" @click="show = false" :mask-click-able='false'>
				<view class="warp">
					<!-- <u-image src="../../../static/hujiao.png"></u-image> -->
					
					<view class="rect" @click="call">
						<view class="rect-t">
							<u-image class="rect2" style="margin-right: 20upx;" width="44rpx" height="44rpx" src="../../../static/hujiao.png"></u-image>
							<text style="vertical-align: -webkit-baseline-middle;">呼叫{{this.text}}</text>
						</view>
					</view>
					<view class="rect1" @click="show = false">取消</view>
				</view>
					

			</u-mask>
		</view>
		<u-toast ref="uToast" />
		
	</view>
</template>
<script>
	export default {
		data() {
			return {
				ContactProperty:[],
				text: '',
				show: false
			}
		},
		onReady() {
			if (uni.getStorageSync('zoneInfo').id) {
				console.log('I have got')
				this.getcontactAdd();
			}else{
				this.$refs.uToast.show({
					title: '请先选择园区',
					type: 'error'
				})
			}
		},
		methods: {
			
			getcontactAdd() {
				this.$api('contact.getcontactAll').then(res => {
					if (res.code == 200) {
						this.ContactProperty = res.data
					}
				})
			},
			call() {
				let res = uni.getSystemInfoSync();
				console.log(res)
				// ios系统默认有个模态框
					uni.makePhoneCall({
					phoneNumber: this.text,
					success(){
						console.log('拨打成功了');
					},
					fail() {
						console.log('拨打失败了');
					}
				})	
			},
			// 拨打
			CallOut(item) {
				this.text = item.phone
				console.log(item.name,item.phone);
				
			}
		}
	}
</script>
<style>
	page {
		background-color: #F9F9F9;
	}
</style>
<style scoped lang="scss">
	.box {
		background-color: #ffffff;
		padding: 40upx;
		margin-top: 20upx;
		font-size: 30upx;
	}
	.box1 {
		display: inline-block;
		width: 170upx;
		vertical-align: middle;
		margin-right: 20rpx;
	}
	.box2 {
		display: inline-block;
	}
	.box3 {
		color: #3E76F4;
		float: right;
	}
	.warp {
			height: 100%;
		}
    .rect {
		position: fixed;
		bottom: 115upx;
		left: 0;
		right: 0;
		height: 100upx;
		margin: 15upx;
		background-color: #fff;
		font-size: 34upx;
		color: #3E76F4;
		.rect-t {
			position: relative;
			height: 100upx;
			width: 56%;
			left: 50%;
			transform: translateX(-50%);
			text-align: center;
			.rect2 {
				position: relative;
				top: 50%;
				transform: translateY(-50%);
				display: inline-block;
			}
		}
	}
	.rect1 {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100upx;
		margin: 15upx;
		background-color: #fff;
		text-align: center;
		line-height: 100upx;
		font-size: 17px;
		color: #3E76F4;
	}
</style>
