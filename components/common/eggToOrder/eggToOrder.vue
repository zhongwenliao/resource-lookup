<template>
	<view class="content">
		<view class="row b-b">
			<text class="tit">提取数量</text><br>
			<input type="number" v-model="numEggsMoney" placeholder="提取数量"
				placeholder-class="placeholder" />
		</view>
		
		<view class="row b-b">
			<text class="tit">可提取鸡蛋数量</text>
			<text>{{numEggs}}枚</text>
		</view>
		
		<view class="address-section">
			<view class="order-content" @click="addressClick">
				<text class="yticon icon-shouhuodizhi"></text>
				<view class="cen">
					<view class="top">
						<text class="name">{{addressData.sjr}}</text>
						<text class="mobile" v-show="address">{{addressData.sjrdh}}</text>
					</view>
					<view class="address" v-if="addressData.sjr != '请选择地址' && address != ''">{{address}}</view>
				</view>
				<text class="yticon icon-you"></text>
			</view>
		</view>
		
		<view class="txt_view">{{txt}}</view>
		
		<button class="add-btn ymcode_ml" @click="userEggToOrder">提交</button>
	</view>
</template>

<script>
export default {
	props: {
		aid: Number,
		addressData: Object,
		address: String
	},
	data() {
		return {
			numEggsMoney: '',
			numEggs: 0,
			txt: ''
		}
	},
	mounted() {
		this.userInfo();
		this.appTxtGet()
	},
	methods: {
		userInfo() {
			this.$http("userInfo", JSON.stringify({
				token: uni.getStorageSync("token")
			})).then(res => {
				if (res.data.code == 0) {
					this.numEggs = res.data.userInfo.numEggs
				}
			}).catch(err => {
				console.log(err);
			})
		},
		appTxtGet() {
			this.$http("appTxtGet", JSON.stringify({
				token: uni.getStorageSync("token"),
				txtID: 'eggToOrder'
			})).then(res => {
				if (res.data.code != 0) {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					});
				} else {
					this.txt = res.data.txtInfo.txt;
				}
			}).catch(err => {
				console.log(err);
			})
		},
		addressClick(){
			uni.navigateTo({
				url: '/pages/address/address?source=2'
			})
		},
		userEggToOrder() {
			console.log(this.numEggsMoney);
			if (this.numEggsMoney == '') {
				uni.showToast({
					title: "请输入提取数量",
					icon: "none"
				});
				return false;
			}
			
			if(!(/^[1-9]\d*$/.test(this.numEggsMoney))){
			    uni.showToast({
			    	title: "请输入正确的提取数量",
			    	icon: "none"
			    });
			    return
			}

			if (this.numEggsMoney > parseFloat(this.numEggs)) {
				uni.showToast({
					title: "提取数量超支",
					icon: "none"
				});
				return false;
			}

			this.$http("userEggToOrder", JSON.stringify({
				token: uni.getStorageSync("token"),
				numEggs: this.numEggsMoney,
				aid: this.aid
			})).then(res => {
				if (res.data.code == 0) {
					let current = 3
					this.$emit("eggToOrderIndex", current)
				} else if (res.data.code == 99) {
					uni.showModal({
						content: "请登陆",
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
					uni.showToast({ title: res.data.msg, icon: "none"});
				}
			}).catch(err => {
				console.log(err);
			})
		}
	}
}
</script>

<style scoped lang="scss">
page {
	background: $page-color-base;
	padding-top: 16upx;
}
.content {
	padding: 0 20rpx;
	margin-bottom: 30upx;
}

.row{
    display: flex;
    align-items: center;
    height: 100upx;
    border-bottom: 1rpx solid #E5E5E5;

	.tit {
		flex-shrink: 0;
		width: 250upx;
		font-size: 30upx;
		color: #303133;
	}

	input {
		flex: 1;
		color: $font-color-dark;
	}
}

.address-section {
	padding: 20rpx 0;
	border-bottom: 1rpx solid #E5E5E5;
	height: 136rpx;

	.order-content {
		display: flex;
		align-items: center;
		height: 100%;
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
.txt_view{
	margin: 20rpx 0 80rpx;
}
.add-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 660upx;
	height: 80upx;
	margin: 40rpx auto 0;
	font-size: 32rpx;
	color: #FFFFFF;
	border-radius: 10upx;
}
</style>