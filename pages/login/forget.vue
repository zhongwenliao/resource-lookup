<template>
	<view class="page">
		<u-navbar class="navbar" title="忘记密码" :border-bottom="false">
		</u-navbar>
		<u-gap height="20" bg-color="#F9F9F9"></u-gap>
		<u-form :border-bottom="false" label-width="190" style="padding: 70upx 20px 0upx 20px;" :model="form"
			ref="uForm">
			<view class="form-item_box">
				<u-form-item class="form-item" prop="phone" :border-bottom="true" label=" ">
					<u-input v-model="form.phone" class="field" placeholder-style="color:#999999;" label-width="0"
						:border-bottom="false" :field-style="fieldStyle" placeholder="请输入手机号">
						<u-button class="codeBut" size="mini" slot="right" @click="getCode">{{codeText}}</u-button>
					</u-input>
				</u-form-item>

				<u-form-item class="form-item" prop="code" :border-bottom="true" label=" ">
					<u-input placeholder-style="color:#999999;" :custom-style="fieldStyle" placeholder="请输入验证码"
						v-model="form.code">
					</u-input>
				</u-form-item>
				<u-form-item class="form-item" prop="password" :border-bottom="true" label=" ">
					<u-input placeholder-style="color:#999999;" type="password" :custom-style="fieldStyle"
						placeholder="请输入密码" v-model="form.password">
					</u-input>
				</u-form-item>
				<u-form-item class="form-item" prop="confirmPassword" :border-bottom="true" label=" ">
					<u-input placeholder-style="color:#999999;" type="password" :custom-style="fieldStyle"
						placeholder="请输入再次输入密码" v-model="form.confirmPassword">
					</u-input>
				</u-form-item>
			</view>
		</u-form>
		<view class="btn_box">
			<u-button shape="circle" @click="onSubmit" type="primary">确认</u-button>
		</view>
	</view>
</template>
<script>
	var clear;
	export default {
		data() {
			return {
				fieldStyle: {
					padding: 0,
					fontSize: '30upx',
				},
				form: {
					//手机号
					phone: '',
					// 密码
					password: '',
					//验证码
					code: '',
					//确认密码
					confirmPassword: '',
				},
				rules: {
					/* phone: [{
							required: true,
							message: '请输入手机号',
							trigger: ['change', 'blur'],
						},
						{
							// 自定义验证函数，见上说明
							validator: (rule, value, callback) => {
								// 上面有说，返回true表示校验通过，返回false表示不通过
								// this.$u.test.mobile()就是返回true或者false的
								return this.$u.test.mobile(value);
							},
							message: '手机号码不正确',
							// 触发器可以同时用blur和change
							trigger: ['blur'],
						}
					],
					password: [{
							required: true,
							message: '请输入新密码',
							trigger: ['blur'],
						},
						{
							// 自定义验证函数，见上说明
							validator: (rule, value, callback) => {
								console.log(value);
								console.log();
								// 上面有说，返回true表示校验通过，返回false表示不通过
								if (!/^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*).{6,20}$/.test(value)) {
									callback(new Error('必须包含大写字母，小写字母和数字并长度在6-20'));
								} else {
									return true
								}


							},
							// 触发器可以同时用blur和change
							trigger: ['blur'],
						}
					],
					passwordTwo: [{
							required: true,
							message: '请再次输入新密码',
							trigger: ['blur'],
						},
						{
							// 自定义验证函数，见上说明
							validator: (rule, value, callback) => {
								// 上面有说，返回true表示校验通过，返回false表示不通过
								if (!/^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*).{6,20}$/.test(value)) {
									callback(new Error('必须包含大写字母，小写字母和数字并长度在6-20'));
								} else if (value !== this.form.password) {
									callback(new Error('密码不一致,请重新输入'));
								} else {
									return true
								}
							},
							// 触发器可以同时用blur和change
							trigger: ['blur'],
						}
					],
				}, */
					phone: [{
							required: true,
							message: '请输入手机号',
							trigger: ['change', 'blur'],
						},
						{
							// 自定义验证函数，见上说明
							validator: (rule, value, callback) => {
								// 上面有说，返回true表示校验通过，返回false表示不通过
								// this.$u.test.mobile()就是返回true或者false的
								return this.$u.test.mobile(value);
							},
							message: '手机号码不正确',
							// 触发器可以同时用blur和change
							trigger: ['change', 'blur'],
						}
					],
					code: [{
							required: true,
							message: '请输入验证码',
							trigger: ['blur'],
						}	
					],
					password: [{
							required: true,
							message: '请输入密码',
							trigger: ['blur'],
						},
						{
							// 自定义验证函数，见上说明
							validator: (rule, value, callback) => {
								console.log(value);
								console.log();
								// 上面有说，返回true表示校验通过，返回false表示不通过
								if (!/^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*).{6,20}$/.test(value)) {
									callback(new Error('必须包含大写字母，小写字母和数字并长度在6-20'));
								} else {
									return true
								}
							},
							// 触发器可以同时用blur和change
							trigger: ['blur'],
						}
					],
					confirmPassword: [{
							required: true,
							message: '请再次输入新密码',
							trigger: ['blur'],
						},
						{
							// 自定义验证函数，见上说明
							validator: (rule, value, callback) => {
								// 上面有说，返回true表示校验通过，返回false表示不通过
								if (!/^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*).{6,20}$/.test(value)) {
									callback(new Error('必须包含大写字母，小写字母和数字并长度在6-20'));
								} else if (value !== this.form.password) {
									callback(new Error('密码不一致,请重新输入'));
								} else {
									return true
								}
				
				
							},
							// 触发器可以同时用blur和change
							trigger: ['blur'],
						}
					],
				},
				/* //手机号
				phone: '',
				// 密码
				password: '',
				//验证码
				code: '',
				//确认密码
				confirmPassword: '', */
				//验证码
				codeText: '获取验证码',
				//验证码已发
				readonly: false
			};
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		//第一次加载
		onLoad(e) {},
		//页面显示
		onShow() {},
		//方法
		methods: {
			//获取验证码
			getCode() {
				if (this.readonly) {
					uni.showToast({
						title: '验证码已发送',
						icon: 'none'
					});
					return;
				}
				if (!this.form.phone) {
					uni.showToast({
						title: '请输入手机号',
						icon: 'none'
					});
					return;
				}
				let params = {
					phone: this.form.phone
				}
				/* this.$api('user.verificationCode', params).then(res => {
					console.log(res);
					uni.showToast({
							title: res.msg || '请求出错,稍后重试',
							icon: 'none',
							duration: 1000,
							mask: true
						});
						if (res.code == 200) {
							/* setTimeout(() => {
								this.$Router.push({
									path: "/pages/login/login",
									// query: {msg:'我要登录！'}
								});
							}, 1000) 
							this.getCodeState();
						}
					}).catch((e) => {
						uni.hideLoading();
					}); */
				this.$api('user.verificationCode', params).then(res => {
					if (res.code == 200) {
						this.getCodeState();
					} else {
						uni.showToast({
							title: res.msg || '请求出错,稍后重试',
							icon: 'none',
							duration: 1000,
							mask: true
						});
					}
				}).catch((e) => {
					uni.hideLoading();
				});
			},
			//验证码按钮文字状态
			getCodeState() {
				const _this = this;
				this.readonly = true;
				this.codeText = '60S后重新获取';
				var s = 60;
				clear = setInterval(() => {
					s--;
					_this.codeText = s + 'S后重新获取';
					if (s <= 0) {
						clearInterval(clear);
						_this.codeText = '获取验证码';
						_this.readonly = false;
					}
				}, 1000);
			},
			onSubmit() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						this.$api('user.forgotPassword', this.form).then(res => {
							uni.showToast({
								title: res.msg || '修改成功',
								icon: 'none',
								duration: 1000,
								mask: true
							});
							if (res.code == 200) {
								setTimeout(() => {
									this.$Router.push({
										path: "/pages/login/login",
										// query: {msg:'我要登录！'}
									});
								}, 1000)
							}
						}).catch((e) => {
							console.log(e);
						});
					}
				});
			},
		},
		//页面隐藏
		onHide() {},
		//页面卸载
		onUnload() {},
		//页面下来刷新
		onPullDownRefresh() {},
		//页面上拉触底
		onReachBottom() {},
		//用户点击分享
		onShareAppMessage(e) {
			return this.wxShare();
		}
	};
</script>
<style lang="scss" scoped>
	@import '@/style/mixin.scss';
	/deep/ .u-form-item__message {
		padding-left: 0 !important;
	}
	.field {
		padding: 0 !important;
		width: 100%;

		/deep/ .u-flex {
			margin: 0 0 !important;
		}
	}

	.codeBut {
		font-size: 24upx;
		color: #6f89ff;
		height: 60upx !important;
		line-height: 60upx !important;
		padding: 0 15upx !important;
	}

	.project_name {
		opacity: 1;
		font-size: 26upx;
		font-family: PingFang SC, PingFang SC-Regular;
		font-weight: 400;
		position: fixed;
		left: 0;
		right: 0;
		bottom: 87upx;
		text-align: center;
		color: #666666;
		line-height: 30upx;
	}

	.body {
		padding: 0 65upx;
	}


	.btn_box {
		width: 90vw;
		margin: 0 auto;
		padding: 200upx 0 0 0;

		button {
			@include theme('btn_bg');
			color: #fff;
			height: 92upx;
			font-size: 34upx;
			font-weight: bold;
			line-height: 92upx;
		}
	}
</style>
