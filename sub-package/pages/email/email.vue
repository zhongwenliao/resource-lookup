<template>
	<uni-base-page class="uni-base-page">
		<view class="mobile-view">
			<view class="logo-view">
				<image class='logo-image' :src='logoUrl'></image>
			</view>
			<form @submit="submit" class="form">
				<view class="input-view">
					<view class="input-row">
						<input class="uni-input" :placeholder="`${email['email-account']}` || '请输入邮箱账号'" name="email" v-model="inputEmail" />
					</view>
					<view class="input-row">
						<input class="uni-input" type="number" v-model="inputVerifyCode" :placeholder="`${email.verifycode}` || '请输入验证码'"
						 name="verifyCode" />
						<view class="verify-code-view">
							<button class="verify-code-button" @click="getCode" :disabled="disabled">{{ codename }}</button>
						</view>
					</view>
				</view>
				<view class="bottom-view">
					<button type="primary" class="button primary" formType="submit" :disabled="nextDisabled">{{ email.nextstep }}</button>
					<!-- <view class="email-register-view">
						<navigator :url="'../mobile/mobile?mobileType='+ emailType" class="email-reg-navigator">{{ emailType == "1" ? `${mobile["mobile-register"]}` || '手机注册' : `${mobile["mobile-forget-password"]}` || '手机忘记密码' }}</navigator>
					</view> -->
				</view>
			</form>
		</view>
	</uni-base-page>
</template>

<script>
	var systemInfo = uni.getStorageSync("appInfo").systemInfo;
	var timer = null;
	export default {
		data() {
			return {
				emailType: 0,
				codename: '',
				inputEmail: "",
				inputVerifyCode: "",
				logoUrl: uni.getStorageSync("appInfo").logo,
				disabled: false,
			}
		},
		computed: {
			email() {
				return this.$t("email");
			},
			mobile() {
				return this.$t("mobile");
			},
			nextDisabled() {
				return this.inputPhone === "" || this.inputVerifyCode === ""
			}
		},
		methods: {
			submit(e) {
				var checkList = [{
					name: "email",
					rules: [{
						required: true,
						message: this.email['email-null'] || "邮箱账号不能为空"
					}, {
						reg: this.$getEmailReg(),
						message: this.email["email-format-error"] || "邮箱账号格式不正确"
					}]
				}];
				//进行表单检查
				var formData = e.detail.value;
				this.$formSubmitCheck({
					formData: formData,
					checkList: checkList,
					success: () => {
						formData["type"] = this.emailType;
						formData = Object.assign(formData, systemInfo)
						uni.navigateTo({
							url: "../setting-password/setting-password?param=" + JSON.stringify(formData)
						})
					}
				})
			},

			// 点击获取验证码
			getCode() {
				var email = this.inputEmail.trim();
				console.log("phone============", email);
				if (email === "") {
					this.$showToast(this.email['email-null'] || "邮箱账号不能为空");
				} else if (!this.$getEmailReg().test(email)) {
					this.$showToast(this.email['enter-correct-email'] || "请输入正确的邮箱格式");
				} else {
					this.checkEmail();
				}
			},

			//检测邮箱号是否注册,若未被注册，则获取验证码
			checkEmail() {
				var _this = this;
				this.$req.request({
					url: '/appUser/app/verifyEmail',
					data: {
						email: _this.inputEmail.trim()
					},
					hasCallback: _this.emailType !== 1,
					success: (res) => {
						var emailType = _this.emailType;
						var code = res.code;
						if (emailType == 1) {
							_this.requestVerifyCode("reg");
						} else if (emailType == 2) {
							if (code == 10000) {
								_this.requestVerifyCode("change");
							} else if (code == 0) {
								_this.$showToast(_this.email['no-account'] || "账号信息不存在");
							}
						}
					}
				});
			},

			//请求验证码
			requestVerifyCode(type) {
				var _this = this;
				this.$req.request({
					url: '/sms/app/getEmailVerifyCode',
					data: {
						email: this.inputEmail.trim(),
						codeType: type
					},
					success: res => {
						this.$showToast(this.email['verifycode-sent'] || "验证码已发送");
						var num = 60;
						timer = setInterval(() => {
							num--;
							if (num <= 0 && timer !== null) {
								clearInterval(timer);
								timer = null;
								this.codename = this.email["resend"] || "重新发送";
								this.disabled = false;
							} else {
								this.codename = num + "s";
								this.disabled = true;
							}
						}, 1000);
					}
				})
			},
		},

		onLoad(options) {
			console.log("options", options.emailType);
			this.codename = this.email["get-verifycode"] || "获取验证码";
			this.emailType = options.emailType;
			setTimeout( () => {
				if (this.emailType == 1) {
					uni.setNavigationBarTitle({
						title: this.email["email-reg"] || "邮箱注册"
					})
					this.$forceUpdate()
				} else if (this.emailType == 2) {
					uni.setNavigationBarTitle({
						title: this.email["email-forget-password"] || "邮箱忘记密码"
					})
					this.$forceUpdate()
				}
			},300 )
		},

		onUnload() {
			console.log("页面卸载");
			if (timer !== null) {
				clearInterval(timer);
				timer = null;
			}
		},
		onBackPress(options) {
			console.log("谁也阻挡不了我返回登录界面");
			if (options.from === 'navigateBack') {
				return false;
			}
			uni.navigateBack({
				delta: 2
			});
			return true;
		},
	}
</script>

<style lang="scss">
	.mobile-view {
		width: 100%;
		background-color: #FFFFFF;

		.logo-view {
			padding: 80upx 0;
			text-align: center;

			.logo-image {
				max-width: 140upx;
				max-height: 140upx;
			}
		}

		.form {
			display: block;
			padding: 0 30upx;

			.phone-prefix-view {
				display: flex;
				align-items: center;

				.phone-prefix {
					display: block;

					padding-right: 10upx;
				}
			}

			.verify-code-view {
				display: flex;
				align-items: center;

				.verify-code-button {
					background: #ffffff;
					color: #0FAEFF;
					font: inherit;

					&:after {
						border: none;
					}
				}
			}
		}

		.bottom-view {
			margin-top: 60upx;

			.email-register-view {
				margin-top: 18upx;
				width: 100%;
				text-align: center;

				.email-reg-navigator {
					display: inline-block;
					padding: 20upx;
				}
			}
		}
	}

	.title {
		text-align: center;
	}

	.title image {
		width: 27px;
		height: 27px;
	}

	.uni-input {
		height: 27px;
		padding: 8px 0;
		font-size: 18px;
		line-height: 27px;
	}

	.code-btn {
		font-size: 13px;
		padding: 0;
		color: #007AFF;
		border: 1px solid #007AFF;
		background-color: #FFFFFF;
	}

	.default {
		width: 60%;
	}
</style>
