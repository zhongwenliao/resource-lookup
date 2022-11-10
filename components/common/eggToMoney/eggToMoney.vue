<template>
	<view class="eggToMoney">
		<view class="row b-b">
			<text class="tit">鸡蛋兑换</text><br>
			<input class="input" type="number" v-model="mentMoney" placeholder="鸡蛋兑换"
				placeholder-class="placeholder" />
		</view>
		<view class="row b-b">
			<text class="tit">可兑换鸡蛋数量</text>
			<text>{{numEggs}}枚</text>
		</view>
		<view class="statement">{{txt}}</view>
		
		<button class="add-btn ymcode_ml" @click="confirm">兑换</button>
	</view>	
</template>

<script>
	export default {
		data() {
			return {
				mentMoney: '',
				numEggs: 0,
				txt: ''
			}
		},
		mounted() {
			this.setxts();
			this.showinfo();
		},
		methods: {
			showinfo() {
				this.$http("userInfo", JSON.stringify({
					token: uni.getStorageSync("token")
				})).then(res => {
					if (res.data.code == 0) {
						this.numEggs = res.data.userInfo.numEggs; //余额
					} else if (res.data.code == 99) {
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
			},
			//提交
			confirm() {
				if(this.mentMoney == ''){
				    uni.showToast({
				    	title: "兑换数量不能为空",
				    	icon: "none"
				    });
				    return
				}
				
				if(!(/^[1-9]\d*$/.test(this.mentMoney))){
				    uni.showToast({
				    	title: "请输入正确的兑换数量",
				    	icon: "none"
				    });
				    return
				}
				
				var menMoney = this.mentMoney * 100;
				if (menMoney < 10000) {
					uni.showToast({
						title: "兑换数量须大于100枚",
						icon: "none"
					});
					return false;
				}

				if (menMoney > this.numEggs * 100) {
					uni.showToast({
						title: "兑换数量超支",
						icon: "none"
					});
					return false;
				}

				if (this.isNumberBy100(menMoney) == false) {
					uni.showToast({
						title: "兑换数量须为100的整数倍",
						icon: "none"
					});
					return false;
				}

				this.$http("userEggToMoney", JSON.stringify({
					token: uni.getStorageSync("token"),
					numEggs: this.mentMoney
				}), ).then(res => {
					if (res.data.code == 0) {
						let current = 3
						this.$emit("eggToMoneyIndex", current)
					} else if (res.data.code == 99) {
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
						this.$api.msg(res.data.msg);
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//获取文本注释
			setxts() {
				this.$http("appTxtGet", JSON.stringify({
					token: 'token',
					txtID: 'eggToMoney'
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
			isNumberBy100(ssn) {
				var re = /^[0-9]*[0-9]$/i; //校验是否为数字
				if (re.test(ssn) && ssn % 10000 === 0) {
					return true;
				} else {
					return false;
				}
			},
		}
	}
</script>

<style scoped lang="scss">
.eggToMoney{
	padding: 0 20rpx;
}

.row {
	display: flex;
	align-items: center;
	// position: relative;
	padding: 0 30upx;
	height: 110upx;
	border-bottom: 1rpx solid #E5E5E5;

	.tit {
		flex-shrink: 0;
		width: 250upx;
		font-size: 30upx;
		color: $font-color-dark;
	}

	.input {
		flex: 1;
		font-size: 30upx;
		color: $font-color-dark;
	}

	.icon-shouhuodizhi {
		font-size: 36upx;
		color: $font-color-light;
	}
}

.default-row {
	margin-top: 16upx;

	.tit {
		flex: 1;
	}

	switch {
		transform: translateX(16upx) scale(.9);
	}
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

.statement {
	display: flex;
	align-items: center;
	position: relative;
	padding: 30rpx 20rpx;
	background: #fff;
}
</style>
