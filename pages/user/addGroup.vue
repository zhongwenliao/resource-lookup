<template>
	<view class="container">
		<!-- 设置白色背景防止软键盘把下部绝对定位元素顶上来盖住输入框等 -->
		<view class="wrapper">
			<view class="input-content">
				<view class="group_view">
					<view class="group_img">
						<image :src="shangInfo.iconUrl" mode="aspectFill"></image>
					</view>
					<view class="group_title">
						<view class="group_name ellipsis">{{shangInfo.spName}}</view>
						<view class="group_price">直购(元)：{{shangInfo.price}}</view>
						<view class="group_price">团购(元)：{{shangInfo.priceHy}}</view>
						<view class="navs">
							<uni-number-box class="b-btn" :min = "1" :max = "max" v-model="vModelValue" @change="changeValue" ></uni-number-box>
						</view>
					</view>
				</view>

				<navigator url="/pages/address/address?source=2" class="address-section">
					<view class="order-content">
						<text class="yticon icon-shouhuodizhi"></text>
						<view class="cen">
							<view class="top">
								<text class="name">{{addressData.sjr}}</text>
								<text class="mobile">{{addressData.sjrdh}}</text>
							</view>
							<text class="address" v-if="addressData.sjr != '请选择地址'">
							{{addressData.sheng}}{{addressData.shi}}{{addressData.qu}}{{addressData.xxdz}}
							</text>
						</view>
						<text class="yticon icon-you"></text>
					</view>
				</navigator>
				
				<view class="yqmtxt_view">
					<block v-for="(item, index) in aboutAddGroup" :key="index" class="">
						<view class="yqmtxt">{{item.txt}}</view>
					</block>
				</view>
			</view>
			<button class="confirm-btn confirm-btn" @click="addGroup">开团</button>
		</view>
	</view>
</template>

<script>
	export default {
		onLoad(options) {
			this.spid=options.spid;
			this.getAboutAddGroup();
			this.shangPinInfo()
		},
		onShow(){
			this.addressget();
		},
		onUnload() {

		},
		data() {
			return {
				shangInfo: {},
				aboutAddGroup: [],
				spid:'',
				vModelValue: 1,
				max: 999 ,//设置最大值
				num: 0,
				addressData: {
					sjr: '请选择地址ַ',					
				},
				aid: 0, 
			}
		},
		computed: {

		},
		methods: {
			shangPinInfo(){
				this.$http("shangPinInfo",JSON.stringify({
					token: uni.getStorageSync("token"),
					spID: this.spid
				})).then(res=>{
					if (res.data.code == 0){
						this.shangInfo = res.data.shangPinInfo
					} else {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			getAboutAddGroup() {
				this.$http("appTxtListTeam",
					JSON.stringify({
						teamID: 'aboutAddGroup'
					}), ).then(res => {
					if (res.data.code != 0) {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
					} else {
						this.aboutAddGroup = res.data.txtList;
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//数量
			changeValue(value) {
				this.num = value
			},
			addressget(){
				if(this.aid == undefined){
					this.aid = 0
				}
			
				this.$http("addressGet",
				JSON.stringify({
					token: uni.getStorageSync('token'),
					aid: this.aid
				})).then(res=>{	
					if(res.data.code == 0){
						this.addressData=res.data.address;
						this.aid = res.data.address.aid;
					} else {
						this.addressData = this.addressData;
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			addGroup(){
				if(this.aid=='0'){
					uni.showToast({
						title: "请选择地址",
						icon: 'none'
					});
					return;
				}
				this.$http("orderGroupAdd", JSON.stringify({
					token: uni.getStorageSync("token"),
					spID: this.spid,
					num: this.num,
					aid: this.aid
				})).then(res => {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					});
				
					if (res.data.code == 0) {
						uni.showToast({
							title: res.data.msg
						});
						
						uni.redirectTo({
							url: `/pages/order/order?state=1`
						})
					}else if (res.data.code == 99) {
						uni.showModal({
							content: "请先登录",
							success: (e) => {
								if (e.confirm) {
									uni.clearStorage();
									setTimeout(() => {
										uni.redirectTo({
											url: "../public/login"
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
			}
		}
	}
</script>

<style scoped lang='scss'>
page {
	background: #fff;
}

.wrapper {
	position: relative;
	z-index: 90;
	background: #fff;
}

.input-content {
	padding: 0 20upx;
	
	.group_view{
		display: flex;
		padding: 16upx;
		border: 1upx solid #e5e5e5;
		margin-bottom: 20upx;
		
		.group_img{
			width: 220upx;
			height: 220upx;
			margin-right: 10upx;
			
			image{
				width: 100%;
				height: 100%;
				border-radius: 10upx;
			}
		}
		
		.group_title{
			width: 50%;
			.group_name{
				color: #000000;
				font-size: 40rpx;
			}
			.group_price{
				font-size: 32upx;
				padding: 10upx 0;
				color: #919293;
			}
		}
		
		.navs{
			position: relative;
			margin-left: -24upx;
			margin-top: 94upx;
		}
	}
	
	.address-section {
		padding: 20rpx 10rpx;
		background: #ffffff;
		border: 1rpx solid #e5e5e5;
		border-radius: 10rpx;
	
		.order-content {
			display: flex;
			align-items: center;
		}
	
		.icon-shouhuodizhi {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			width: 60upx;
			color: #888;
			font-size: 44upx;
		}
	
		.cen {
			display: flex;
			flex-direction: column;
			flex: 1;
			font-size: 28upx;
			color: $font-color-dark;
			width: 80%;
		}
	
		.name {
			font-size: 34upx;
			margin-right: 24upx;
		}
		.mobile{
			font-size: 35upx;
		}
		
		.address {
			margin-top: 16upx;
			color: $font-color-light;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	
		.icon-you {
			font-size: 32upx;
			color: $font-color-light;
		}
	
		.a-bg {
			position: absolute;
			left: 0;
			bottom: 0;
			display: block;
			width: 100%;
			height: 5upx;
		}
	}
}

.yqmtxt_view{
	margin-top: 20upx;
	border: 1upx solid #e5e5e5;
	border-radius: 10upx;
	padding: 20upx;
	.yqmtxt {
		font-size: 30upx;
		color: $font-color-base;
	}
}

.yzm {
	margin-left: 424rpx;
	margin-top: -75rpx;
	z-index: 2;
	color: #FF7D13;
	font-size: 24upx;
	line-height: 64upx;
	padding-left: 10upx;
	padding-right: 10upx;
	width: auto;
	height: 64upx;
	border: 1upx solid #FFA800;
	border-radius: 50upx;
}

.confirm-btn {
	width: 630upx;
	height: 76upx;
	line-height: 76upx;
	border-radius: 50px;
	margin-top: 50upx;
	color: #fff;
	font-size: $font-lg;

	&:after {
		border-radius: 100px;
	}
}
</style>
