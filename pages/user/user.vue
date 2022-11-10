<template>
	<view class="container">
		<view class="user-section">
			<image class="bg" src="/static/user.jpg"></image>
			<view class="user-info-box" @click="userinfo">
				<view class="portrait-box">
					<image class="portrait" :src="userIInfo.imgUrl || '/static/missing-face.png'"></image>
				</view>
				<view class="info-box">
					<text class="username" @click="login(isNum)">账号：{{userIInfo.userid}}</text>
					<p class="username" @click="login(isNum)">昵称：{{userIInfo.userName}}</p>
					<p class="username" @click="login(isNum)">邀请码：{{userIInfo.userCode}}</p>
				</view>
			</view>
		</view>

		<view class="cover-container" :style="[{
				transform: coverTransform,
				transition: coverTransition
			}]" @touchstart="coverTouchstart" @touchmove="coverTouchmove" @touchend="coverTouchend">

			<image class="arc" src="/static/arc.png"></image>

			<view class="tj-sction">
				<view class="tj-item" @click="balanceClick(1)">
					<text class="num">{{userIInfo.money}}</text>
					<text>余额</text>
				</view>
				<view class="tj-item" @click="balanceClick(2)">
					<text class="num">{{userIInfo.points}}</text>
					<text>积分</text>
				</view>
				<view class="tj-item" @click="balanceClick(3)" v-if="cfgValue == 1">
					<text class="num">{{userIInfo.numHens}}</text>
					<text>鸡</text>
				</view>
				<view class="tj-item" @click="balanceClick(4)" v-if="cfgValue == 1">
					<text class="num">{{userIInfo.numEggs}}</text>
					<text>鸡蛋</text>
				</view>
			</view>
			<!-- 订单 -->
			<view class="order-section">
				<view class="order-item" @click="navTo('/pages/order/order?state=0',0, isNum)" hover-class="common-hover"
					:hover-stay-time="50">
					<image src="/static/icons/order_3.png"></image>
					<text>全部</text>
				</view>
				<view class="order-item" @click="navTo('/pages/order/order?state=1',1, isNum)" hover-class="common-hover"
					:hover-stay-time="50">
					<image src="/static/icons/order_1.png"></image>
					<text>待付款</text>
				</view>
				<view class="order-item" @click="navTo('/pages/order/order?state=3',2, isNum)" hover-class="common-hover"
					:hover-stay-time="50">
					<image src="/static/icons/order_2.png"></image>
					<text>已付款</text>
				</view>
				<view class="order-item" @click="navTo('/pages/order/order?state=7',3, isNum)" hover-class="common-hover"
					:hover-stay-time="50">
					<image src="/static/icons/order_2.png"></image>
					<text>已发货</text>
				</view>
			</view>

			<view class="service-box"  v-if="cfgValue == 1">
				<view class="headers">财务中心</view>
				<view class="row">
					<view class="grid" @tap="navsetTo('/pages/finance/withdrawal', isNum)">
						<view class="image">
							<image src="/static/icons/cash.png"></image>
						</view>
						<view>提现</view>
					</view>
					<view class="grid" @tap="navsetTo('/pages/bank/list', isNum)">
						<view class="image">
							<image src="/static/icons/card.png"></image>
						</view>
						<view>收款管理</view>
					</view>
					<view class="grid" @tap="navsetTo('/pages/finance/bill', isNum)">
						<view class="image">
							<image src="/static/icons/money.png"></image>
						</view>
						<view>资金明细</view>
					</view>
				</view>
			</view>
			
			<view class="service-box">
				<view class="headers">账号密码</view>
				<view class="row">
					<view class="grid" @tap="navsetTo('/pages/finance/transactionPassword', isNum)">
						<view class="image">
							<image src="/static/icons/lock.png"></image>
						</view>
						<view>交易密码</view>
					</view>
					<view class="grid" @tap="navsetTo('/pages/public/pwdfoget', isNum)">
						<view class="image">
							<image src="/static/icons/pw.png"></image>
						</view>
						<view>登录密码</view>
					</view>
				</view>
			</view>
			
			<view class="service-box">
				<view class="headers">更多服务</view>
				<view class="row">
					<view class="grid" @click="navcode(isNum)">
						<view class="image">
							<image src="/static/icons/play.png"></image>
						</view>
						<view>推广</view>
					</view>
					<view class="grid" @tap="navsetTo('/pages/user/myTeam')">
						<view class="image">
							<image src="/static/icons/person.png"></image>
						</view>
						<view>我的团队</view>
					</view>
					<view class="grid" @tap="navsetTo('/pages/address/address', isNum)">
						<view class="image">
							<image src="/static/icons/potion.png"></image>
						</view>
						<view>地址管理</view>
					</view>
					<view class="grid" @tap="navsetTo('/pages/notice/notice', isNum)">
						<view class="image">
							<image src="/static/icons/miss.png"></image>
						</view>
						<view>消息通知</view>
					</view>
					<view class="grid" @tap="navsetTo('/pages/user/aboutUs')">
						<view class="image">
							<image src="/static/icons/server.png"></image>
						</view>
						<view>联系我们</view>
					</view>
					<view class="grid" v-if="isShow" @tap="toLogout(isShow)">
						<view class="image">
							<image src="/static/icons/back.png"></image>
						</view>
						<view>退出</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex';
	
	let startY = 0,
		moveY = 0,
		pageAtTop = true;
		
	export default {
		data() {
			return {
				iswx: false,
				coverTransform: 'translateY(0px)',
				coverTransition: '0s',
				moving: false,
				isShow: false,
				isNum: 0,
				cfgValue: 0,
				userIInfo: {
					userid: '未登录',
					userName: '未登录',
					userCode: '未登录',
					imgUrl: '',
					yzcode: '',
					money: 0,
					numHens: 0,
					numEggs: 0,
					points: 0
				}
			}
		},
		onLoad() {
			this.systemCfgInfoClient();
		},
		onShow() {
			if (uni.getStorageSync('token')) {
				this.showinfo();
			}
			this.set_tabBar();
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		methods: {
			systemCfgInfoClient(){
				this.$http("systemCfgInfoClient", JSON.stringify({
					cfgKey: 'trueModule',
					token: 'token'
				})).then(res => {
					if (res.data.code == 0) {
						this.cfgValue = res.data.systemCfgInfo.cfgValue;
					}
				}).catch(err => {
					console.log(err);
				})
			},
			userinfo(){
				if (!uni.getStorageSync('token')) {
					uni.showModal({
						content: "请先登录",
						success: (e) => {
							if (e.confirm) {
								uni.clearStorage();
								setTimeout(() => {
									uni.redirectTo({
										url:"/pages/public/login"
									})
								}, 200)
							}
						}
					})	
				} else {
					uni.navigateTo({
						url: '/pages/userinfo/userinfo'
					})
				}
			},
			// 跳转
			balanceClick(index){
				if (!uni.getStorageSync('token')) {
					uni.showModal({
						content: "请先登录",
						success: (e) => {
							if (e.confirm) {
								uni.clearStorage();
								setTimeout(() => {
									uni.redirectTo({
										url:"/pages/public/login"
									})
								}, 200)
							}
						}
					})
				} else {
					if(index == 1){
						uni.navigateTo({
							url: '/pages/finance/bill'
						})
					} else if(index == 2){
						uni.navigateTo({
							url: '/pages/finance/userpoint'
						})
					} else if(index == 3){
						uni.navigateTo({
							url: '/pages/adoption/adoption'
						})
					} else if(index == 4){
						let current = 3
						uni.setStorageSync('current', current)
						uni.navigateTo({
							url: '/pages/adoption/adoption'
						})
					}
				}
			},
			login(isNum) {
				if(uni.getStorageSync("token") == '' && isNum == 0){
					uni.showModal({
					    content: '请先登录',
					    success: (e)=>{
					    	if(e.confirm){
								uni.clearStorage();				    		
					    		setTimeout(()=>{
					    			uni.redirectTo({
					    				url:"../public/login"
					    			})
					    		}, 200)
					    	}
					    }
					});
				}
			},
			navcode(isNum) {
				if(uni.getStorageSync("token") == '' && isNum == 0){
					uni.showModal({
					    content: '请先登录',
					    success: (e)=>{
					    	if(e.confirm){
								uni.clearStorage();				    		
					    		setTimeout(()=>{
					    			uni.redirectTo({
					    				url:"../public/login"
					    			})
					    		}, 200)
					    	}
					    }
					});
				} else {
					uni.navigateTo({
						url: "/pages/spread/qrcode?yqm=" + this.yzcode
					})
				}
			},
			navsetTo(url, isNum) {
				if(uni.getStorageSync("token") == '' && isNum == 0){
					uni.showModal({
					    content: '请先登录',
					    success: (e)=>{
					    	if(e.confirm){
								uni.clearStorage();				    		
					    		setTimeout(()=>{
					    			uni.redirectTo({
					    				url:"../public/login"
					    			})
					    		}, 200)
					    	}
					    }
					});
				} else {
					uni.navigateTo({
						url
					})
				}
			},
			showinfo() {
				this.$http("userInfo", JSON.stringify({
					token: uni.getStorageSync("token")
				})).then(res => {
					if (res.data.code == 0) {
						this.userIInfo = res.data.userInfo
						this.isShow = true
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
			
			/**
			 * 统一跳转接口,拦截未登录路由
			 * navigator标签现在默认没有转场动画，所以用view
			 */
			navTo(url, num, isNum) {
				if (this.iswx == true) {
					var url1 = 'http://zsh.abillchen.top/#/pages/order/order?state=' + num;
					var pageUrl = url1
					 .replace(/[/]/g, "%2f")
						.replace(/[:]/g, "%3a")
						.replace(/[#]/g, "%23")
						.replace(/[&]/g, "%26")
						.replace(/[=]/g, "%3d");
					var url1 =
						"https://open.weixin.qq.com/connect/oauth2/authorize?appid=" +
						"wxc0ee037bcc5d05f8" +
						"&redirect_uri=" +
						pageUrl + //这里放当前页面的地址
						"&response_type=code&scope=snsapi_base&connect_redirect=1#wechat_redirect";
					window.location.href = url1;
				} else {
					if(uni.getStorageSync("token") == '' && isNum == 0){
						uni.showModal({
						    content: '请先登录',
						    success: (e)=>{
						    	if(e.confirm){
									uni.clearStorage();				    		
						    		setTimeout(()=>{
						    			uni.redirectTo({
						    				url:"../public/login"
						    			})
						    		}, 200)
						    	}
						    }
						});
					} else {
						uni.navigateTo({
							url
						})
					}
				}
			},

			toLogout(e) {
				uni.showModal({
					content: '确定要退出登录么',
					success: (e) => {
						if (e.confirm) {
							uni.clearStorage();
							const pages = getCurrentPages()
							const curPage = pages[pages.length - 1]
							curPage.onShow()
							
							this.userIInfo.userid = '未登录'
							this.userIInfo.userName = '未登录'
							this.userIInfo.userCode = '未登录'
							this.userIInfo.imgUrl = ''
							this.userIInfo.yzcode = ''
							this.userIInfo.money = 0
							this.userIInfo.numHens = 0
							this.userIInfo.numEggs = 0
							this.userIInfo.points = 0
							this.isShow = false
						}
					}
				});
			},

			/**
			 *  会员卡下拉和回弹
			 *  1.关闭bounce避免ios端下拉冲突
			 *  2.由于touchmove事件的缺陷（以前做小程序就遇到，比如20跳到40，h5反而好很多），下拉的时候会有掉帧的感觉
			 *    transition设置0.1秒延迟，让css来过渡这段空窗期
			 *  3.回弹效果可修改曲线值来调整效果，推荐一个好用的bezier生成工具 http://cubic-bezier.com/
			 */
			coverTouchstart(e) {
				if (pageAtTop === false) {
					return;
				}
				this.coverTransition = 'transform .1s linear';
				startY = e.touches[0].clientY;
			},
			coverTouchmove(e) {
				moveY = e.touches[0].clientY;
				let moveDistance = moveY - startY;
				if (moveDistance < 0) {
					this.moving = false;
					return;
				}
				this.moving = true;
				if (moveDistance >= 80 && moveDistance < 100) {
					moveDistance = 80;
				}

				if (moveDistance > 0 && moveDistance <= 80) {
					this.coverTransform = `translateY(${moveDistance}px)`;
				}
			},
			coverTouchend() {
				if (this.moving === false) {
					return;
				}
				this.moving = false;
				this.coverTransition = 'transform 0.3s cubic-bezier(.21,1.93,.53,.64)';
				this.coverTransform = 'translateY(0px)';
			},
			//设置购物车数字角标
			set_tabBar() {
				if (uni.getStorageSync('cat_num')) {
					let value = uni.getStorageSync('cat_num')

					if (value > 0) {
						uni.setTabBarBadge({
							index: 2,
							text: String(value),
							complete(e) {
								console.log(e);
							}
						});
					} else {
						//清除数字角标
						uni.hideTabBarRedDot({
							index: 2
						});
					}
				} else {
					//清除数字角标
					uni.hideTabBarRedDot({
						index: 2
					});
				}
			},

			message() {
				uni.showToast({
					title: '开发中...',
					icon: "none"
				});
			},
		}
	}
</script>

<style scoped lang='scss'>
	%flex-center {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	%section {
		display: flex;
		justify-content: space-around;
		align-content: center;
		background: #fff;
		border-radius: 10upx;
	}

	.user-section {
		height: 520upx;
		padding: 100upx 30upx 0;
		position: relative;

		.bg {
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			filter: blur(1px);
		}
	}

	.user-info-box {
		height: 180upx;
		display: flex;
		align-items: center;
		position: relative;
		z-index: 1;

		.portrait {
			width: 130upx;
			height: 130upx;
			border: 5upx solid #fff;
			border-radius: 50%;
		}

		.username {
			font-size: 26rpx;
			color: white;
			margin-left: 20upx;
		}
	}

	.vip-card-box {
		display: flex;
		flex-direction: column;
		color: #f7d680;
		height: 240upx;
		background: linear-gradient(left, rgba(0, 0, 0, .7), rgba(0, 0, 0, .8));
		border-radius: 16upx 16upx 0 0;
		overflow: hidden;
		position: relative;
		padding: 20upx 24upx;

		.card-bg {
			position: absolute;
			top: 20upx;
			right: 0;
			width: 380upx;
			height: 260upx;
		}

		.b-btn {
			position: absolute;
			right: 20upx;
			top: 16upx;
			width: 140upx;
			height: 40upx;
			text-align: center;
			line-height: 40upx;
			font-size: 22upx;
			color: #36343c;
			border-radius: 20px;
			background: linear-gradient(left, #f9e6af, #ffd465);
			z-index: 1;
		}

		.tit {
			font-size: $font-base+2upx;
			color: #f7d680;
			margin-bottom: 28upx;

			.yticon {
				color: #f6e5a3;
				margin-right: 16upx;
			}
		}

		.e-b {
			font-size: $font-sm;
			color: #d8cba9;
			margin-top: 10upx;
		}
	}

	.cover-container {
		background: $page-color-base;
		margin-top: -150upx;
		padding: 0 20upx;
		position: relative;
		background: #f5f5f5;
		padding-bottom: 20upx;

		.arc {
			position: absolute;
			left: 0;
			top: -34upx;
			width: 100%;
			height: 36upx;
		}
	}

	.tj-sction {
		@extend %section;

		.tj-item {
			@extend %flex-center;
			flex-direction: column;
			height: 140upx;
			font-size: $font-sm;
			color: #919293;
		}

		.num {
			font-size: $font-lg;
			color: #919293;
			margin-bottom: 8upx;
		}
	}

	.order-section {
		@extend %section;
		padding: 28upx 0;
		margin: 20upx 0;

		.order-item {
			@extend %flex-center;
			width: 120upx;
			height: 120upx;
			border-radius: 10upx;
			font-size: $font-sm;
			color: #919293;
		}

		.yticon {
			font-size: 48upx;
			margin-bottom: 18upx;
			color: #FD7031;
		}

		.icon-shouhoutuikuan {
			font-size: 44upx;
		}

		image {
			width: 50rpx;
			height: 50rpx;
			margin-bottom: 18rpx;
		}
	}

	.history-section {
		/* padding: 30upx 0 0; */
		margin-top: 30upx;
		background: #fff;
		border-radius: 20upx;

		.sec-header {
			display: flex;
			align-items: center;
			font-size: $font-base;
			color: $font-color-dark;
			line-height: 40upx;
			margin-left: 30upx;

			.yticon {
				font-size: 44upx;
				color: #5eba8f;
				margin-right: 16upx;
				line-height: 40upx;
			}
		}

		.h-list {
			white-space: nowrap;
			padding: 30upx 30upx 0;

			image {
				display: inline-block;
				width: 160upx;
				height: 160upx;
				margin-right: 20upx;
				border-radius: 10upx;
			}
		}
	}

	.major-box {
		border: 2rpx 0 solid;
		z-index: 100;
		position: fixed;
		top: 20%;
		right: 0;
		transition: left 0.5s;
		overflow: hidden;
	}

	.click-btn {
		width: 220rpx;
		height: 90rpx;
		background-color: #999;
		color: #fff;
		opacity: 0.7;
		text-align: center;
		border-radius: 100rpx 0 0 100rpx;
		padding: 20rpx 0;

		.zb-a {
			display: block;
			float: left;
			margin-left: 30rpx;

			image {
				width: 40rpx;
				height: 40rpx;
			}
		}

		.zb-b {
			font-size: 26rpx;
		}
	}

	.bdwx {
		padding: 10rpx 20rpx;
		background-color: #FFFFFF;
		border-radius: 10rpx;
		margin-left: 80rpx;
		color: #FD7031;
	}

	.blcok-sction {
		@extend %section;
		columns: 100rpx 4;

		.tj-item {
			@extend %flex-center;
			flex-direction: column;
			height: 140upx;
			font-size: $font-sm;
			color: #75787d;
		}

		.num {
			font-size: $font-lg;
			color: $font-color-dark;
			margin-bottom: 8upx;
		}
	}

	.service-box {
		width: 100%;
		background-color: #FFFFFF;
		padding: 30rpx 20rpx 10rpx;
		box-shadow: $box-shadow;
		margin-bottom: 20rpx;

		.headers {
			font-size: 34rpx;
			margin-bottom: 50rpx;
		}

		.row {
			display: flex;
			flex-wrap: wrap;
			color: $text-color-assist;
			font-size: 24rpx;
			padding-bottom: -40rpx;

			.grid {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				margin-bottom: 40rpx;
				width: 25%;
				position: relative;

				.image {
					image {
						width: 50rpx;
						height: 50rpx;
						margin-bottom: 10rpx;
					}
				}

				.new-badage {
					width: 40rpx;
					height: 40rpx;
					position: absolute;
					top: 0;
					right: 30rpx;
				}
			}
		}
	}
</style>
