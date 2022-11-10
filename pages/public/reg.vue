<template>
	<view class="container">
		<view class="left-bottom-sign"></view>
		<view class="back-btn" @click="navBack">
			<uni-icons class="uni-icons" type="back" size="22"></uni-icons>
			<view class="welcome">注册</view>
		</view>

		<view class="right-top-sign"></view>
		<!-- 设置白色背景防止软键盘把下部绝对定位元素顶上来盖住输入框等 -->
		<view class="wrapper">
			<view class="input-content">
				<view class="input-item">
					<text class="tit">手机号码</text>
					<input class="biaoti" v-model="mobile" type="number" maxlength="11" placeholder="请输入手机号" />
				</view>
				<view class="input-item">
					<text class="tit">昵称</text>
					<input class="biaoti" v-model="username" type="text" maxlength="20" placeholder="请输入昵称" />
				</view>
				<view class="input-item">
					<text class="tit">密码</text>
					<input class="biaoti" v-model="password" type="text" maxlength="14" placeholder="请设置密码"
						:password="!showPassword" />
				</view>
				<view class="input-item">
					<text class="tit">验证码</text>
					<input class="biaoti" v-model="code" type="number" maxlength="6" placeholder="请输入动态验证码" />
					<view class="yzm" :class="{ yzms: codeTime > 0 }" @tap="getcode">{{!codeTime ? '获取验证码' : codeTime + ' s'}}</view>
				</view>
				<view class="input-item">
					<text class="tit">邀请码</text>
					<input class="biaoti" v-model="invitation" type="text" maxlength="11" placeholder="请输入邀请码" />
				</view>
				<view class="yqmtxt">{{yqmsm}}</view>
			</view>
			<button class="confirm-btn ymcode_ml" @click="bindLogin">注册</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				username: '',
				mobile: '',
				password: '',
				code: '',
				invitation: '',
				xieyi: true,
				showPassword: false,
				codeTime: 0,
				yqmsm: ''
			}
		},
		onLoad(options) {
			if(options.q){
				this.invitation = this.getQueryParams(options.q)
			}
			if (options.yqm) {
				this.invitation = options.yqm
			}
			this.getYqmsm();
		},
		onUnload() {
			this.codeTime = 0;
		},
		methods: {
			navBack() {
				uni.navigateBack();
			},
			getQueryParams(queryString) {
				// 微信扫码得到的内容进行了一次编码，所以官方要求需要进行decodeURIComponent一次
				var params = ''
			
				if (queryString != undefined) {
					let url = decodeURIComponent(queryString)
					params = url.substring(url.length - 4)
			
					if (params.length != 4) {
						params = ''
					}
				}
			
				return params
			},
			getYqmsm() {
				this.$http("appTxtGet", JSON.stringify({
					token: 'token',
					txtID: 'yqmsm'
				})).then(res => {
					if (res.data.code != 0) {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
					} else {
						this.yqmsm = res.data.txtInfo.txt;
					}
				}).catch(err => {
					console.log(err);
				})
			},
			getcode() {
				var myreg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/;
				
				if (!myreg.test(this.mobile)) {
					uni.showToast({
						icon: 'none',
						title: '请输入正确的手机号'
					});
					return
				}
				
				if(this.codeTime > 0){
					return;
				}
					
				this.$http("valicodeForReg", JSON.stringify({
					mobile: this.mobile
				})).then(res => {
					if (res.data.code != 0) {
						this.captchaTime = 0;
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
					} else {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
						this.codeTime = res.data.dataExtend
						let timer = setInterval(()=>{
							this.codeTime--;
							
							if(this.codeTime < 1){
								clearInterval(timer);
								this.codeTime = 0
							}
						}, 1000)
						return;
					}
				}).catch(err => {
					console.log(err);
				})
			},
			bindLogin() {
				let fkyz = /[^(^\s*)|(\s*$)]/;
				var myreg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/;
				
				if (!myreg.test(this.mobile)) {
					uni.showToast({
						icon: 'none',
						title: '手机号码不正确,请重新输入'
					});
					return;
				}
				if (!fkyz.test(this.username)) {
					uni.showToast({
						icon: 'none',
						title: '昵称不能为空'
					});
					return;
				}
				if (this.password.length < 6) {
					uni.showToast({
						icon: 'none',
						title: '密码不能少于6位'
					});
					return;
				}

				var myregPass = /^[A-Za-z0-9]{6,14}$/;
				if (!myregPass.test(this.password)) {
					uni.showToast({
						icon: 'none',
						title: '密码只能输入大小写字母和数字'
					});
					return
				}

				this.$http("userReg", JSON.stringify({
					userid: this.mobile,
					userName: this.username,
					mobile: this.mobile,
					pwdLogin: this.password,
					valicode: this.code,
					userCode: this.invitation
				})).then(res => {
					if (res.data.code == 0) {
						setTimeout(() => {
							uni.redirectTo({
								url: `/pages/public/login`
							})
						}, 500)
					} else {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
					}
				}).catch(err => {
					console.log(err);
				})
			}
		}
	}
</script>

<style scoped lang='scss'>
page {
	background: #FFFFFF;
}

.container {
	padding-top: 100px;
	position: relative;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
	background: #fff;
}
.wrapper {
	position: relative;
	z-index: 90;
	background: #fff;
}

.back-btn {
	position: absolute;
	left: 40upx;
	z-index: 9999;
	padding-top: var(--status-bar-height);
	top: 40upx;
	font-size: 40upx;
	color: #303133;
	display: flex;
}

.right-top-sign {
	position: absolute;
	top: 80upx;
	right: -30upx;
	z-index: 95;

	&:before,
	&:after {
		display: block;
		content: "";
		width: 400upx;
		height: 80upx;
		background: #b4f3e2;
	}

	&:before {
		transform: rotate(50deg);
		border-radius: 0 50px 0 0;
	}

	&:after {
		position: absolute;
		right: -198upx;
		top: 0;
		transform: rotate(-50deg);
		border-radius: 50px 0 0 0;
		/* background: pink; */
	}
}

.left-bottom-sign {
	position: absolute;
	left: -270upx;
	bottom: -320upx;
	border: 100upx solid #d0d1fd;
	border-radius: 50%;
	padding: 180upx;
}

.welcome {
	position: relative;
	left: 10upx;
	font-size: 46upx;
	color: #555555;
	text-shadow: 1px 0px 1px rgba(0, 0, 0, .3);
	margin-bottom: 40rpx;
}

.input-content {
	padding: 0 60upx;
}

.yqmtxt {
	font-size: 26rpx;
	color: #606266;
}

.input-item {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
	padding: 0 20upx;
	background: #f8f6fc;
	height: 100upx;
	border-radius: 8rpx;
	margin-bottom: 20upx;

	&:last-child {
		margin-bottom: 0;
	}

	.tit {
		height: 50upx;
		line-height: 56upx;
		font-size: 26upx;
		color: #606266;
	}

	input {
		height: 60upx;
		font-size: 26rpx;
		color: #606266;
		width: 74%;
	}
}

.yzm {
	color: #FF7D13;
	font-size: 24upx;
	border: 1upx solid #FFA800;
	border-radius: 50upx;
	padding: 10rpx 20rpx;
	
	position: absolute;
	right: 0;
	margin-right: 70rpx;
	margin-top: 40rpx;
}

.yzms {
	color: #999999 !important;
	border: 1upx solid #999999;
}

.confirm-btn {
	width: 630upx;
	height: 76upx;
	line-height: 76upx;
	border-radius: 50px;
	margin-top: 50upx;
	color: #FFFFFF;
	font-size: 32rpx;

	&:after {
		border-radius: 100px;
	}
}
</style>
