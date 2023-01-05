<template>
	<view class="register_page">
		<view class="logo">
			<u-image width="185" height="185" src="http://yuanzhoulvwego.com/wp-content/uploads/static/logo.png"></u-image>
		</view>
		<view class="body">
			<u-row style="margin-bottom: 60upx;">
				<u-col >
					<view class="">
						<view class="input_box"><input type="text" v-model="username" placeholder="账号/手机号" /></view>
					</view>
				</u-col>
			</u-row>
			<u-row >
				<u-col >
					<view class="">
						<view class="input_box">
							<u-input type="password" password v-model="password" placeholder="密码"  :password="!flag"></u-input>
						</view>
					</view>
				</u-col>
			</u-row>
			<view class="input_box" v-if="type == 1000">
				<input type="number" v-model="code" placeholder="请输入手机号验证码" maxlength="6" @confirm="onSubmit" />
				<button class="active" @click="onSetCode">{{ codeText }}</button>
			</view>
			<view class="nav_box" v-if="type == 2000">
				<text></text>
				<text @click="onPageJump('/pages/login/forget')">忘记密码？</text>
			</view>
		</view>
		<view class="btn_box">
			<u-button :custom-style="customStyle" class="u-m-b-20" shape="circle" @click="onSubmit" type="primary">登录</u-button>
			<u-button :custom-style="customStyle2" shape="circle" @click="onPageJump('/pages/login/register')" >注册</u-button>
		</view>
	</view>
</template>

<script>
	let clear;
	import {
		mapState,
		mapMutations,
		mapActions
	} from 'vuex';
	export default {
		data() {
			return {
				flag: false,
				customStyle:{
					fontSize:'32upx',
				},
				customStyle2:{
					fontSize:'32upx',
					// fontWeight: 'bold',
					color:'#3E76F4',
				},
				type: 2000,
				code: '',
				username: '',
				password: '',
				//验证码
				codeText: '获取验证码',
				//验证码已发
				readonly: false,
				isIos: true
			};
		},
		//第一次加载
		onLoad(e) {
			// #ifdef APP-PLUS
			this.isIos = (plus.os.name == "iOS");
			// #endif
		},
		//页面显示
		onShow() {

		},
		mounted() {
			let that = this;
			const username = uni.getStorageSync('username');
			const password = uni.getStorageSync('password');
			if (username && password) {
				that.username = username;
				that.password = password;
			} else {
				that.loginname = "";
				that.password = "";
			}
		},
		//方法
		methods: {
			...mapActions(['setTokenAndBack']),
			onPageJump(url) {
				console.log(url);
				this.$Router.push({
					path: url,
					// query: {msg:'我要登录！'}
				});
			},
			//验证码按钮文字状态
			getCodeState() {
				clear && clearInterval(clear);
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
			// 发送验证码
			onSetCode() {
				if (!this.username) {
					uni.showToast({
						title: '请输入手机号',
						icon: 'none'
					});
					return;
				}
				if (!this.$base.usernameRegular.test(this.username)) {
					uni.showToast({
						title: '手机号格式不正确',
						icon: 'none'
					});
					return;
				}
				this.$http
					.post('api/common/v1/send_sms', {
						username: this.username,
						type: 2000
					})
					.then(res => {
						this.getCodeState();
					});
			},
			onSubmit() {
				uni.showLoading({
					title: '加载中'
				});
				let params = {
					grant_type: 'password',
					client_id: 'client_user',
					client_secret: 'secret',
					username: this.username,
					password: this.password
				}
				// this.$Router.replaceAll('/pages/index/index')
				// uni.setStorageSync('username', this.username);
				// uni.setStorageSync('password', this.password);
				// this.setTokenAndBack({
				// 	data: {},
				// 	username: this.username
				// });
				this.$api('user.login', params).then(res => {
					if (res.code == 200) {
						uni.setStorageSync('username', this.username);
						uni.setStorageSync('password', this.password);
						this.setTokenAndBack({
							data: res,
							username: this.username
						});
					} else {
						uni.showToast({
							title: res.message || '请求出错,稍后重试',
							icon: 'none',
							duration: 1000,
							mask: true
						});
					}
				}).catch((e) => {
					uni.hideLoading();
				});

			},
			// 微信APP登录
			onWxAppLogin() {
				uni.login({
					provider: 'weixin',
					success: res => {
						if (res.authResult.openid && res.authResult.unionid) {
							this.$http
								.post('api/open/v1/login', {
									wxAppOpenId: res.authResult.openid,
									unionid: res.authResult.unionid
								})
								.then(data => {
									this.setUserInfo({
										openId: res.authResult.openid,
										unionid: res.authResult.unionid,
										...data,
									});
									if (data.thirdLoginSuccess) {
										socket.init();
										uni.showToast({
											title: '登录成功',
											duration: 2000
										});
										setTimeout(() => {
											uni.navigateBack();
										}, 2000);
									} else {
										uni.showModal({
											title: '提示',
											content: '您还未绑定手机号，请先绑定~',
											confirmText: '去绑定',
											cancelText: '再逛会',
											success: res => {
												if (res.confirm) {
													uni.redirectTo({
														url: '/pages/user/bindusername'
													});
												}
											}
										});
									}
								});
						} else {
							uni.showToast({
								title: '数据缺失，请重新点击',
								icon: "none"
							});
						}
					}
				});
			}
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
	page {
		width: 100%;
	}
	/deep/ .uni-input-placeholder{
		color: $uni-text-color-grey;
	}
	.img {
		width: 40upx;
		height: 40upx;
	}
	.logo{
		display: flex;
		justify-content: center;
		height: 480upx;
		align-items: center;
	}
	.project_name {
		opacity: 1;
		font-size: 26upx;
		font-family: PingFang SC, PingFang SC-Regular;
		position: fixed;
		left: 0;
		right: 0;
		bottom: 80upx;
		text-align: center;
		color: #ffffff;
		line-height: 30upx;
	}

	.body {
		width: 85vw;
		margin: 0 auto;
	}

	.register_page {
		background-color: #fff;
		background-repeat: no-repeat;
		background-size: 100% 100%;
		width: 100%;

		.input_box {
			display: flex;
			border-bottom: 2upx solid $uni-border-color;
			align-items: center;
			input {
				margin-bottom: 10upx;
				flex: 1;
				font-size: 32upx;
				color: #333;
				height: 60upx;
			}

			button {
				height: 60upx;
				background-color: #f7f7f7;
				font-size: 24upx;
				border-radius: 8upx;
				padding: 0 14upx;
				color: #333;
				line-height: 60upx;
				margin-left: 20upx;
			}
		}

		.btn_box {
			width: 90vw;
			margin: 0 auto;
			padding: 100upx 0 0 0;

			button {
				color: #fff;
				height: 92upx;
				font-size: 34upx;
				font-weight: bold;
				line-height: 92upx;
			}
		}

		.agreement {
			font-size: 24upx;
			color: #999999;

		}

		.password_register {
			margin-top: 110upx;
			text-align: center;

			text {
				font-size: 24upx;
				color: #333333;
				text-decoration: underline;
			}
		}

		.nav_box {
			margin-top: 30upx;
			display: flex;
			justify-content: space-between;

			>text {
				font-size: 26upx;
				color: $uni-text-color-grey;
			}
		}
	}

	.station {
		height: 230upx;
	}

	.third_party_login_box {
		position: absolute;
		bottom: 0;
		width: 100%;
		left: 0;
		height: 230upx;
		padding: 0 30upx;

		.third_party_title {
			display: flex;
			align-items: center;

			&:before,
			&:after {
				content: '';
				flex: 1;
				height: 2upx;
				background-color: #f5f5f5;
			}

			text {
				font-size: 24upx;
				color: #999999;
				flex-shrink: 0;
				padding: 0 20upx;
			}
		}

		.third_party_content {
			height: 200upx;
			display: flex;
			justify-content: center;
			align-items: center;

			image {
				width: 60upx;
				height: 52upx;
			}
		}
	}
</style>
