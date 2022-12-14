<template>
	<!-- 修改密码 -->
	<view class="box">
		<u-navbar title="更换登录手机号"></u-navbar>
		<u-form label-width="200" class="cell-group" :model="form" ref="uForm">
			<u-form-item required label="原手机号：" prop="password">
				<u-input type="number" v-model="form.password" placeholder="请输入原手机号码" />
			</u-form-item>

			<u-form-item required label="验证码：" prop="passwordTwo">
				<u-input type="number" v-model="form.passwordTwo" placeholder="请输入验证码" />
				<text slot="right" class="u-m-r-40 u-type-primary" @click="getCode">{{codeTips}}</text>
			</u-form-item>

			<u-gap height="20" bg-color="#F1F2F3"></u-gap>

			<u-form-item required label="新手机号：" prop="password">
				<u-input type="number" v-model="form.password" placeholder="请输入新手机号码" />
			</u-form-item>

			<u-form-item required label="验证码：" prop="passwordTwo">
				<u-input type="number" v-model="form.passwordTwo" placeholder="请输入验证码" />
				<text slot="right" class="u-m-r-40 u-type-primary" @click="getCode">{{codeTips}}</text>
			</u-form-item>
		</u-form>
		<u-verification-code seconds="60" ref="uCode" @change="codeChange"></u-verification-code>
		<view class="btn_box">
			<u-button @click="onSubmit" type="primary" shape="circle">确定修改</u-button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				codeTips: '',
				cellTitle: {
					fontSize: '30upx',
					letterSpacing: '2upx',
					color: '#333333'
				},
				form: {
					id: uni.getStorageSync('userInfo').id,
					password: '',
					passwordTwo: ''
				},
				rules: {
					password: [{
							required: true,
							message: '请输入手机号',
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
							message: '请输入验证码',
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
				}
			};
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		methods: {
			codeChange(text) {
				this.codeTips = text;
			},
			getCode() {
				if (this.$refs.uCode.canGetCode) {
					// 模拟向后端请求验证码
					uni.showLoading({
						title: '正在获取验证码',
						mask: true
					})
					setTimeout(() => {
						uni.hideLoading();
						// 这里此提示会被this.start()方法中的提示覆盖
						this.$u.toast('验证码已发送');
						// 通知验证码组件内部开始倒计时
						this.$refs.uCode.start();
					}, 2000);
				} else {
					this.$u.toast('倒计时结束后再发送');
				}
			},
			onSubmit() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						uni.showToast({
							title: res.msg || '修改成功',
							icon: 'none',
							duration: 1000,
							mask: true
						});
						// this.$api('user.updatePassword', this.form).then(res => {
						// 	if (res.code == 200) {
						// 		uni.showToast({
						// 			title: res.msg || '修改成功',
						// 			icon: 'none',
						// 			duration: 1000,
						// 			mask: true
						// 		});
						// 	}

						// }).catch((e) => {
						// 	console.log(e);
						// });
					}
				});
			}
		}
	}
</script>
<style>
	page {
		background: #F1F2F3;
		height: 100%;
	}
</style>
<style scoped lang="scss">
	.box {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.btn_box {
		flex: 1;
		display: flex;
		width: 100%;
		align-items: center;
		padding: 0 75upx;
		margin-bottom: 80upx;

		/deep/ .u-btn {
			width: 100%;
		}
	}

	.cell-group {
		margin-top: 20upx;
		background: #FFFFFF;
	}

	/deep/ .u-form-item {
		padding-left: 30upx;
	}
</style>
