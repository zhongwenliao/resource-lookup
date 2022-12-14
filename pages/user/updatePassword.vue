<template>
	<!-- 修改密码 -->
	<view class="box">
		<u-navbar title="修改密码"></u-navbar>
		<u-form label-width="200" class="cell-group" :model="form" ref="uForm">
			<u-form-item required label="新密码：" prop="password">
				<u-input type="password" v-model="form.password" placeholder="请输入新密码" />
			</u-form-item>
			<u-form-item required label="确认新密码：" prop="passwordTwo">
				<u-input type="password" v-model="form.passwordTwo" placeholder="请再次输入新密码" />
			</u-form-item>
		</u-form>
		<view class="btn_box">
			<u-button @click="onSubmit" type="primary" shape="circle">提交</u-button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				cellTitle: {
					fontSize: '30upx',
					letterSpacing: '2upx',
					color: '#333333'
				},
				form: {
					id:uni.getStorageSync('userInfo').id,
					phone:uni.getStorageSync('userInfo').phone,
					password: '',
					passwordTwo: ''
				},
				rules: {
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
								} else if(value !== this.form.password){
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
			onSubmit() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						this.$api('user.updatePassword2',this.form ).then(res => {
							if (res.code == 200) {
								uni.showToast({
									title: res.msg || '修改成功',
									icon: 'none',
									duration: 1000,
									mask: true
								});
								setTimeout(()=>{
									this.$store.commit('OUT_LOGIN');
									this.$Router.replaceAll({
										path: '/pages/login/login',
									});
								},1000)
								
							}
						
						}).catch((e) => {
							console.log(e);
						});
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
