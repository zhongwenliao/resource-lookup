<template>
	<uni-base-page class="uni-base-page">
		<view class="mobile-view">
			<view class="logo-view">
				<image class='logo-image' :src='logoUrl'/>
			</view>
			<form @submit="submit" class="form">
				<view class="input-view">
					<view class="input-row">
						<view class="phone-prefix-view" @click="chooseArea">
							<text class="phone-prefix">{{ `+${phoneTypeNum} >` }}</text>
						</view>
						<input class="uni-input" type="number" :placeholder="`${i18n.phone}` || '请输入手机号'" name="phone" v-model="inputPhone" maxlength="11"/>
					</view>
					<view class="input-row">
						<input class="uni-input" type="number" v-model="inputVerifyCode" :placeholder="`${i18n.verifycode}` || '请输入验证码'"
						 name="verifyCode"/>
						<view class="verify-code-view">
							<button class="verify-code-button" @click="getCode" :disabled="disabled">{{ codeName }}</button>
						</view>
					</view>
				</view>
				<view class="bottom-view">
					<button type="primary" class="button primary" formType="submit" :disabled="nextDisabled">{{ i18n.nextstep || '下一步' }}</button>
					<view class="email-register-view" v-if="curLanguage.indexOf('cn') == -1">
						<navigator :url="'../email/email?emailType='+ mobileType" class="email-reg-navigator">{{ mobileType == "1" ? `${i18n["email-reg"]}` || '邮箱注册' : `${i18n["email-forget-password"]}` || '邮箱忘记密码' }}</navigator>
					</view>
				</view>
			</form>
		</view>
	</uni-base-page>
</template>

<script>
	let systemInfo = uni.getStorageSync("appInfo").systemInfo;
	let timer = null;
	export default {
		data() {
			return {
				mobileType: 0,
				codeName: "",
				phoneTypeNum: "86",
				inputPhone: "",
				inputVerifyCode: "",
				logoUrl: uni.getStorageSync("appInfo").logo,
				disabled: false,
				curLanguage: this.$getLanguageLowerCase()
			}
		},
		computed: {
			i18n() {
				return this.$t("mobile");
			},
			nextDisabled() {
				return this.inputPhone === "" || this.inputVerifyCode === "";
			}
		},
		methods: {
			
			submit(e) {
				let formData = e.detail.value;
				formData["type"] = this.mobileType;
				formData = Object.assign(formData, systemInfo);
				if(this.phoneTypeNum === "86") {
					if(this.$checkPhoneNumber(formData["phone"])) {
						uni.navigateTo({
							url: ("../setting-password/setting-password?param=" + JSON.stringify(formData)).replace(/%/g, '%25')
						});
					} else {
						this.$showToast( this.i18n["correct-phone"] || "请输入正确格式手机号");
					} 
				} else {
					uni.navigateTo({
						url: ("../setting-password/setting-password?param=" + JSON.stringify(formData)).replace(/%/g, '%25')
					});
				}
				
			},

			//  点击获取验证码
			getCode() {
				let phone = this.inputPhone;
				if(!this.$isEmpty(phone)) {
					// console.log("phoneTypeNum：" + this.phoneTypeNum);
					if(this.phoneTypeNum == 86) {
						if (this.mobileType == 1) {
							this.checkPhone();
						} else if (this.mobileType == 2) {
							this.requestVerifyCode("change");
						}
					} else {
						this.$showToast(this.i18n["not-support"] || "暂不支持手机注册，请前往邮箱注册");
					}
				} else {
					this.$showToast(this.i18n["phone-null"] || "手机号不能为空");
				}
			},

			chooseArea() {
				uni.navigateTo({
					url: "../area-select/area-select?type=1"
				});
			},

			//  判断手机号是否已被注册
			checkPhone() {
				this.$req.request({
					url: '/appUser/app/verifyPhone',
					data: {
						phone: this.inputPhone.trim()
					},
					success: (res) => {
						if(res.code == 0) {
							this.requestVerifyCode("reg");
						}else {
							this.$showToast(res.msg);
						}
						
					}
				});
			},

			// 请求验证码
			requestVerifyCode(type) {
				let _this = this;
				this.$req.request({
					url: '/sms/app/validate',
					data: {
						phone: this.inputPhone.trim(),
						codeType: type
					},
					success: res => {
						// if(res.code !== 0) {
						// 	this.$showToast(res.msg);
						// 	return;
						// }
						this.$showToast(this.i18n['verifycode-sent'] || "验证码已发送");
						let num = 60;
						_this.codeName = num + "s";
						timer = setInterval(() => {
							num--;
							if (num <= 0 && timer !== null) {
								clearInterval(timer);
								timer = null;
								this.codeName = this.i18n["resend"] || "重新发送";
								this.disabled = false;
							} else {
								this.codeName = num + "s";
								this.disabled = true;
							}
						}, 1000);
					}
				});
			}
		},

		// 页面加载的时候
		onLoad(options) {
			let title = options.mobileType == "1" ? this.i18n["mobile-register"] || "手机注册" : this.i18n["mobile-forget-password"] || "手机忘记密码";
			uni.setNavigationBarTitle({
				title: title
			});
			this.mobileType = options.mobileType;
			this.codeName = this.i18n["get-verifycode"] || "获取验证码";
			this.$onfire.on("EventAreaChange", e => {
				this.phoneTypeNum = e.phoneTypeNum;
			});
		},

		// 页面卸载的时候
		onUnload() {
			if (timer !== null) {
				clearInterval(timer);
				timer = null;
			}
			this.$onfire.un("EventAreaChange");
		}
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
					background: #FFFFFF;
					color: $theme-bg-color;
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
