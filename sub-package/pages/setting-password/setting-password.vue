<template>
	<view class="content mobile-register-view">
		<view class="logo-view">
			<image class="logo-image" :src="logoUrl"/>
		</view>
		<form @submit="submit" class="form">
			<view class="input-view">
				<view class="input-row">
					<input class="uni-input" type="password" :placeholder="`${mobile['input-password']}`|| '请输入密码'" name="password" v-model="inputPassword"/>
				</view>
				<view class="input-row">
					<input class="uni-input" type="password" v-model="inputPassword2" :placeholder="`${mobile['password-again']}`|| '请再次输入密码'" name="password2" />
				</view>
			</view>
			<view class="bottom-view">
				<button type="primary" class="button primary" formType="submit" :disabled="completeDisabled">{{ mobile["finish"] || "完成" }}</button>
			</view>
		</form>
	</view>
</template>

<script>
	let systemInfo = uni.getStorageSync("appInfo").systemInfo;
	let param = {};
	export default {
		data() {
			return {
				userTypeCode: null,
				inputPassword: "",
				inputPassword2: "",
				verifyCode: "",
				logoUrl: uni.getStorageSync("appInfo").logo
			}
		},
		computed: {
			completeDisabled() {
				return this.inputPassword === "" || this.inputPassword2 === "";
			},
			mobile() {
				return this.$t("mobile");
			}
		},
		methods: {
			submit(e) {
				// /^[\S]{6,16}$/
				let rule = [{
						name: "password",
						checkType: "string",
						checkRule: "6,16",
						errorMsg: this.mobile["password-limit"] || "请输入6-16位密码"
					},
					{
						name: "password2",
						checkType: "same",
						checkRule: e.detail.value.password,
						errorMsg: this.mobile["password-differ"] || "密码不一致"
					}
				];
				//进行表单检查
				let formData = e.detail.value;
				this.$formCheck({
					formData: formData,
					rule: rule,
					success: () => {
						formData = Object.assign(formData, param);
						if(param["type"] == 1) {
							this.register(formData);
						} else if(param["type"] == 2) {
							this.resetPwd(formData);
						}
					}
				});
			},
			register(formData) {
				let _this = this;
				let sendDataObj = {
					appVersion: "1.1.0",
					platform: systemInfo.platformType,
					brand: systemInfo.brand,
					model: systemInfo.model,
					system: systemInfo.system
				};
				sendDataObj = Object.assign(sendDataObj, formData);
				let reqUrl = "";
				if(this.userTypeCode == 1) {
					reqUrl = "/appUser/app/emailRegister";
				} else if(this.userTypeCode == 2) {
					reqUrl = '/appUser/app/register';
				}
				this.$req.request({
					url: reqUrl,
					data: sendDataObj,
					success: res => {
						console.log("设置密码请求----",res);
						if (res.code == 0) {
							this.$showToast(this.mobile["register-success"] || "注册成功，请登录");
							console.log("where is phone: ",sendDataObj["phone"]);
							this.$editUserInfo("phone", sendDataObj["phone"]);
							setTimeout(() => {
								console.log("是否打印准备跳转==>==>");
								uni.reLaunch({
									url: "/sub-package/pages/login/login"
								});
							}, 1000);
						} else {
							this.$showToast(res.msg);
						}
					}
				});
			},

			//忘记密码重置密码
			resetPwd(formData) {
				if (this.userTypeCode == 1) {
					var reqUrl = "/appUser/app/emailForgetPassword";
					var data = {
						email: formData.email,
						verifyCode: this.verifyCode,
						password: formData.password2
					}
				} else if (this.userTypeCode == 2) {
					var reqUrl = '/appUser/app/appForgetPassword';
					var data = {
						phone: formData.phone,
						verifyCode: this.verifyCode,
						password: formData.password2
					}
				}
				this.$req.request({
					url: reqUrl,
					data: data,
					success: (res) => {
						if (res.code === 0) {
							this.$showToast(this.mobile["set-password-success"] || '密码设置成功，请登录');
							// uni.showToast({
							// 	title: this.mobile["set-password-success"] || '密码设置成功',
							// 	icon: 'none'
							// })
							setTimeout(() => {
								uni.reLaunch({
									url: "../../pages/login/login"
								});
							}, 1000);
						} else {
							this.$showToast(res.msg);
						}
					}
				});
			}
		},

		onLoad: function(options) {
			this.$setTitle(this.mobile["set"]);
			if (options.param !== undefined) {
				param = JSON.parse(options.param)
				if (param.email) {
					//邮箱用户
					this.userTypeCode = 1;
					this.verifyCode = param.verifyCode;
				} else if (param.phone) {
					//手机用户
					this.userTypeCode = 2;
					this.verifyCode = param.verifyCode;
				}
			}
		}
	}
</script>

<style lang="scss">
	.content.mobile-register-view {
		background-color: #FFFFFF;
		padding: 20upx;

		.logo-view {
			width: 100%;
			height: 20%;

			.logo-image {
				width: 140upx;
				height: 140upx;
				top: 100upx;
				bottom: 0;
				left: 0;
				right: 0;
				margin: 0 auto;
				position: absolute;
			}
		}

		.form {
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
