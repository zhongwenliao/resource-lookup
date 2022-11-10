<template>
	<view class="login">
		<view class="left-bottom-sign"></view>
		<view class="back-btn" @click="navBack">
			<uni-icons class="uni-icons" type="back" size="22"></uni-icons>
			<view class="welcome">登录</view>
		</view>
		<view class="right-top-sign"></view>
		<view class="wrapper">
			<view class="left-top-sign">LOGIN</view>
			<view class="input-content">
				<view class="input-item">
					<text class="tit">手机号码</text>
					<input class="biaoti" v-model="userid" type="number" maxlength="11" placeholder="请输入手机号码" />
				</view>
				<view class="input-item">
					<text class="tit">密码</text>
					<input class="biaoti" v-model="password" type="password" maxlength="14" placeholder="请输入密码" />
				</view>
			</view>
			<view class="cbtn">
				<label class="radio">
					<checkbox-group @change="checkboxChange">
						<checkbox style="zoom:64%"  value="1" :checked="check"  />
					</checkbox-group>
				</label>
				阅读并同意
				<text class="yhxy" @click="openweb('https://funong.abillchen.top/yongHuXieYe')">《华歌行用户协议》</text>
				<text class="yhxy" @click="openweb('https://funong.abillchen.top/yinSiXieYe')">《华歌行隐私政策》</text>
			</view>
			
			<button class="confirm-btn ymcode_ml" @click="toLogin">登录</button>
			
			<view class="xypwd">
				<view class="qxy" @click="toRegist">注册</view>
				<view class="qxy" @click="pwdforget">忘记密码</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userid: '',
			password: '',
			ykms: false,
			check: false
		}
	},
	onLoad(option) {
		console.log('options0', option);
		this.loginIndex = option.loginIndex
	},
	methods: {
		toLogin() {
			if (this.userid == "") {
				uni.showToast({
					icon: 'none',
					title: '手机号码不能为空'
				});
				return;
			}
			if (this.password == "") {
				uni.showToast({
					icon: 'none',
					title: '密码不能为空'
				});
				return;
			}
			
			if (this.check == false){
				uni.showToast({
					icon: 'none',
					title: '用户登录, 必须同意用户协议'
				})
				return
			}

			this.$http('userLoginByPwd', JSON.stringify({
				userid: this.userid,
				pwdLogin: this.password
			})).then(res => {
				if (res.data.code != 0) {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					});
				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					});
					
					uni.setStorage({ key: "userid", data: this.userid })
					uni.setStorage({ key: 'token', data: res.data.data })
					
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/index/index'
						})
					}, 500)
				}
			}).catch(err => {
				console.log(err);
			})
		},
		checkboxChange: function (e) {
			if(e.detail.value == '1'){
					this.check = true
				}else{
					this.check = false
				}
			console.log(this.check);		
		},
		//打开h5页面
		openweb(web){
			uni.navigateTo({
				url: '/pages/spread/web?u='+web
			})
		},
		navBack() {
			uni.redirectTo({
				url: "/pages/index/index"
			});
		},
		toRegist(){
			uni.navigateTo({
				url: '/pages/public/reg'
			})
		},
		pwdforget() {
			uni.navigateTo({
				url: '/pages/public/pwdfoget'
			})
		},
	}
}
</script>

<style scoped lang='scss'>
page {
	background: #ffffff;
}

.login {
	padding-top: 100upx;
	position: relative;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
	background: #fffff;
}

.back-btn{
	position:absolute;
	left: 40upx;
	z-index: 9999;
	padding-top: var(--status-bar-height);
	top: 40upx;
	font-size: 40upx;
	color: #303133;
	display: flex;
}

.uni-icons{
	display: flex;
	align-items: center;
}

.yzm {
	margin-left: 424rpx;
	margin-top: -75rpx;
	z-index: 2;
	color: #FF7D13;
	font-size: 24upx;
	line-height: 64upx;
	padding-left: 10upx;
	padding-right: 10upx;
	width: auto;
	height: 64upx;
	border: 1upx solid #FFA800;
	border-radius: 50upx;
}

.yzms {
	color: #999999 !important;
	border: 1upx solid #999999;
}

.left-bottom-sign{
	position:absolute;
	left: -270upx;
	bottom: -320upx;
	border: 100upx solid #d0d1fd;
	border-radius: 50%;
	padding: 180upx;
}

.wrapper {
	position: relative;
	z-index: 90;
	background: #fff;
	padding-bottom: 40upx;
}

.left-top-sign {
	font-size: 120upx;
	color: #f8f8f8;
	position: relative;
	left: -16upx;
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
	}
}
.welcome {
	position: relative;
	left: 10upx;
	font-size: 46upx;
	color: #555;
	text-shadow: 1px 0px 1px rgba(0, 0, 0, .3);
}

.input-content {
	padding: 0 60upx;
}

.input-item {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
	padding: 0 30upx;
	background: #f8f6fc;
	height: 120upx;
	border-radius: 4px;
	margin-bottom: 50upx;

	&:last-child {
		margin-bottom: 0;
	}

	.tit {
		height: 50upx;
		line-height: 56upx;
		font-size: 26rpx;
		color: #606266;
	}

	input {
		height: 60upx;
		font-size: 26rpx;
		color: #303133;
		width: 100%;
	}
}

.confirm-btn {
	width: 630upx;
	height: 76upx;
	line-height: 76upx;
	border-radius: 50px;
	color: #ffffff;
	font-size: 32rpx;

	&:after {
		border-radius: 100px;
	}
}

.cbtn{
	margin-top: 50rpx;
	font-size: 30rpx;
	margin: 80rpx 60rpx 30rpx;
	
	.radio{
		display: block;
		float: left;
	}
}
.yhxy {
	color: #1492e6;
}

.xypwd{
	ustify-content: space-around;
	display: flex;
	color: #1492e6;
	margin-top: 20rpx;
	font-size: 32rpx;
}

.xypwd {
	display: flex;
	color: #1492e6;
	margin-top: 30rpx;
	font-size: 32rpx;
	justify-content: space-around;
}
.qxy{
    display: flex;
    border: 1rpx solid #777777;
    width: 230rpx;
    justify-content: center;
    border-radius: 40rpx;
    padding: 16rpx 0;
}
</style>
