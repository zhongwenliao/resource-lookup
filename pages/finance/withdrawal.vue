<template>
	<view class="content">
		<view class="row b-b">
			<text class="tit">提现金额</text><br>
			<input class="input" type="number" v-model="addressData.mentMoney" placeholder="提现金额"
				placeholder-class="placeholder" />
			<!-- <view class="uni-list">
				<view class="uni-list-cell">
					<view class="uni-list-cell-db">
						<picker @change="bindPickerChange" :value="index" :range="arrs">
							<view class="uni-input">{{arrs[index]}}</view>
						</picker>
					</view>
				</view>
			</view> -->
		</view>
		<view class="row b-b">
			<text class="tit">可提现金额</text>
			<text>￥{{balance}}元</text>
		</view>
		<view class="statement">{{txt}}</view>


		<button class="add-btn ymcode_ml" @click="confirm">提交申请</button>
		<!-- 		<m-input  :mentMoney="addressData.mentMoney" :payType="payType"  :show="show" @close="show = false"></m-input> -->
	</view>

</template>

<script>
	// import BASE_URL from '../../utils/api.js'
	// import AddressPicker from '@/components/lingdang-AddressPicker/BankPicker.vue';
	//  import mInput from '../../components/mInput.vue'
	export default {
		//	components:{AddressPicker,mInput},
		data() {
			return {
				nowAid: '',
				planLocate: '请选择开户行',
				userid: uni.getStorageSync("userid"),
				balance: 0,
				payType: 2,
				show: false,
				addressData: {},
				arrs: [],
				index: 0,
				moneys: '100元',
				txt: ''
			}
		},
		onLoad(option) {
			this.source = option.source;

			let title = '提现';
			if (option.type === 'edit') {
				title = '提现'

				this.addressData = JSON.parse(option.data)
			}
			//this.setmoney();
			this.setxts();
			this.showinfo();
			this.manageType = option.type;
			uni.setNavigationBarTitle({
				title
			})
		},
		methods: {
			showinfo() {
				this.$http("userInfo", JSON.stringify({
					token: uni.getStorageSync("token")
				})).then(res => {
					if (res.data.code == 0) {
						this.balance = res.data.userInfo.money; //余额
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
				var mentMoney = this.addressData.mentMoney;

				mentMoney = mentMoney.trim() * 100;
				if (mentMoney < 10000) {
					uni.showToast({
						title: "提现金额需大于100元",
						icon: "none"
					});
					return false;
				}

				if (mentMoney > this.balance * 100) {
					uni.showToast({
						title: "提现金额超支",
						icon: "none"
					});
					return false;
				}

				if (this.isNumberBy100(mentMoney) == false) {
					uni.showToast({
						title: "提现金额需为100元的整数倍",
						icon: "none"
					});
					return false;
				}
				this.show = true
				this.$http("cashOutAdd",
					JSON.stringify({
						token: uni.getStorageSync("token"),
						money: this.addressData.mentMoney
					}), ).then(res => {
					if (res.data.code == 0) {
						uni.showToast({
							title: res.data.msg
						});

						setTimeout(() => {
							uni.redirectTo({
								url: `/pages/user/user`
							})
						}, 2000)

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


			bindPickerChange: function(e) {
				this.index = e.target.value

				console.log('picker发送选择改变，携带值为', this.arrs[this.index])
				this.moneys = this.arrs[this.index]
			},

			setmoney() {

				this.$http("txjelbUser", JSON.stringify({
					userid: this.userid,
					txfsid: 1
				})).then(res => {
					console.log(res.data.para)
					res.data.para.forEach((item, index) => {
						this.arrs.push(item.je_txt)

						//console.log(item.je_txt)
					})
				}).catch(err => {
					console.log(err);
				})
			},

			//获取文本注释
			setxts() {

				this.$http("appTxtGet", JSON.stringify({
					token: 'token',
					txtID: 'TXSM'
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

<style lang="scss">
	page {
		background: $page-color-base;
		padding-top: 16upx;
	}

	.row {
		display: flex;
		align-items: center;
		position: relative;
		padding: 0 30upx;
		height: 110upx;
		background: #fff;

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
		width: 690upx;
		height: 80upx;
		margin: 60upx auto;
		font-size: $font-lg;
		color: #fff;
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
