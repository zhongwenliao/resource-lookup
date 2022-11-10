<template>
	<view class="orderJs">
		<view class="goods-section">
			<!-- 商品列表 -->
			<view class="g-item">
				<image :src="orderInfo.iconUrl" />
				<view class="right">
					<text class="title clamp">{{orderInfo.spName}}</text>
					<view class="price-box">
						<text class="price">{{orderInfo.money}}元</text>
						<text class="number"> {{orderInfo.num}}份</text>
					</view>
				</view>
			</view>

		</view>

		<!-- 金额明细 -->
		<view class="yt-list">
			<view class="yt-list-cell b-b">
				<text class="cell-tit clamp">实付金额</text>
				<text class="cell-tip">{{orderInfo.money}}</text>
			</view>
			
			<view class="yt-list-cell_b">
				<view class="cell-tit clamp">配送地址</view>
				<view class="cell-tip">{{orderInfo.sjr}}, {{orderInfo.sjrdh}}, {{address}}</view>
			</view>
			
			<view class="yt-list-cell b-b">
				<text class="cell-tit clamp">订单号</text>
				<text class="cell-tip red">{{orderInfo.orderID}}</text>
			</view>
			
			<view class="yt-list-cell b-b">
				<text class="cell-tit clamp">下单时间</text>
				<text class="cell-tip">{{orderInfo.inputTime}}</text>
			</view>
			
			<view class="yt-list-cell_b b-b">
				<view class="cell-tit clamp">备注</view>
				<view class="cell-tip">{{orderInfo.remark}}</view>
			</view>

			<view class="yt-list-cell b-b">
				<view class="tip1">支付方式</view>
				<view class="tip2">
					<radio-group @change="radioChange">
						<label class="uni-list-cell uni-list-cell-pd" v-for="(item, index) in paytypes" :key="item.index">
							<view class="nav1">{{item.selectTxt}}</view>
							<view class="nav2">
								<radio :value="item.selectValue" :checked="index === current"
									style="transform: scale(0.7)" />
							</view>
						</label>
					</radio-group>
				</view>
			</view>
		</view>

		<!-- 底部 -->
		<view class="footer">
			<view class="price-content">
				<text>实付款</text>
				<text class="price-tip">￥</text>
				<text class="price">{{total}}</text>
			</view>
			<text class="add-btn ymcode_ml" @click="submit">立即付款</text>
		</view>
		
		<uni-popup ref="popup" :is-mask-click="false" background-color="#ffffff">
			<view class="popup-content">
				<view class="popup-title">交易密码</view>
				<input class="popup_index" type="password" v-model="dealPassword" placeholder="请输入交易密码" maxlength="6" />
				<view class="state_view">
					<view class="cancel" @click="cancelClick">取消</view>
					<view class="confirm ymcode_ml" @click="confirmClick">确定</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				code: "",
				iswx: false,
				yhje: 0,
				yhjsm: "选择优惠券",
				ddid: "",
				yhqid: 0,
				total: 0,
				userid: uni.getStorageSync('userid'),
				maskState: 0, //优惠券面板显示状态				
				openid: "",
				je: 0,
				desc: '', //备注
				payType: 1, //1微信
				payTypeaaa: 4,
				paytypes: [],
				current: 0,
				choose: 1,
				yqps_time: '',
				name: '',
				address: '',
				psfsid: 0,
				fee: 0, //配送费
				discount: 0, //优惠金额
				show: false,
				cpyezf: false,
				orderInfo: [],
				
				// 支付订单ID
				payOrderID: '',
				// 交易密码
				dealPassword: ''
			}
		},
		onLoad(option) {
			this.ddid = option.ddid
			this.orderInfoGet();
			this.get_pay();
		},
		methods: {
			orderInfoGet() {
				this.$http("shangPinOrderInfo",
					JSON.stringify({
						token: uni.getStorageSync("token"),
						orderID: this.ddid
					})).then(res => {
					if (res.data.code == 0) {
						this.orderInfo = res.data.shangPinOrderInfo;
						this.address = this.orderInfo.sheng + this.orderInfo.shi + this.orderInfo.qu + this.orderInfo.xxdz
						this.total = this.orderInfo.money
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
			//立即支付 获取code和openid
			submit() {
				var that = this
				//优惠券后
				this.getorderData();
			},
			
			// 订单参数
			getorderData() {
				var that = this

				this.$http("shangPinOrderToCashin",
					JSON.stringify({
						token: uni.getStorageSync("token"),
						orderID: this.ddid,
						yhqID: this.yhqid
					}), ).then(res => {
					if (res.data.code == 0) {
						console.log("订单参数", res);
						that.getPayData(res); //调用获取支付参数
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
			// 取消交易密码
			cancelClick(){
				this.dealPassword = ''
				this.$refs.popup.close()
			},
			// 确认交易密码
			confirmClick(){
				console.log('00000',this.dealPassword);
				this.userPwdMoneyCheck()
			},
			// 交易密码验证是否存在
			userPwdMoneyExists(){
				this.$http("userPwdMoneyExists", JSON.stringify({
					token: uni.getStorageSync("token")
				})).then(res => {
					if(res.data.code == 0){
						this.$refs.popup.open('bottom')
					} else {
						uni.showModal({
							title: '提示',
							content: '交易密码未设定',
							success: function (res) {
								if (res.confirm) {
									uni.redirectTo({
										url: "/pages/finance/transactionPassword"
									})
								}
							}
						});
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			// 交易密码验证接口
			userPwdMoneyCheck(){
				this.$http("userPwdMoneyCheck", JSON.stringify({
					pwdMoney: this.dealPassword,
					token: uni.getStorageSync("token")
				})).then(res => {
					if(res.data.code == 0){
						// 关闭弹出窗口
						this.$refs.popup.close()
						this.cashinPayByRemain(this.payOrderID);
					} else if(res.data.code == 99){
						uni.showModal({
						    content: "请先登录",
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
					}else{
						uni.showToast({title:res.data.msg,icon:'none'});
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			// 支付参数接口调用
			getPayData(res) {
				console.log("getPayData  choose=",this.choose);
				if (this.choose == 1) {
					this.userPwdMoneyExists()
					this.payOrderID = res.data.data
				} else if (this.choose == 2) {
					var that = this;
					that.ddid = res.data.data;
					that.je = res.data.dataExtend;
					// #ifdef APP-PLUS
					uni.getProvider({
						service: 'oauth',
						success: function(res) {

							if (~res.provider.indexOf('weixin')) {
								uni.login({
									provider: 'weixin',
									success: loginRes => {

										console.log('getProvider3===' + JSON.stringify(loginRes));
										//console.log(loginRes.authResult.openid);
										that.openid = loginRes.authResult.openid;
										//that.wxpay(that.orderCode, that.totalMoney);
										that.wxpayApp(that.je, that.ddid, that.openid);
									}
								});
							}
						}
					});
					// #endif
					//#ifdef MP-WEIXIN
						uni.login({
						provider:"weixin",
						//onlyAuthorize:true,
						success:loginRes=>{
							this.code=loginRes.code
							console.log("getPayData==",JSON.stringify(loginRes));
							this.openIDfun(res.data.dataExtend,res.data.data)//调用openid接口
							
						}});
					// #endif
				}
			},
			// 余额支付
			cashinPayByRemain(cashinid) {
				this.$http("cashinPayByRemain", JSON.stringify({
					token: uni.getStorageSync("token"),
					cashinID: cashinid
				})).then(res => {
					if (res.data.code == 0) {
						console.log("订单参数", res);
						uni.redirectTo({
							url: './order?state=3'
						})
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
						uni.showToast({ title: res.data.msg, icon: 'none' });
					}
				}).catch(err => {
					console.log(err);
				})
			},
			wxpayApp(fee, orderid, openid) {
				uni.request({
					url: 'https://funong.abillchen.top/weiXinPayApp',
					data: JSON.stringify({
						fee: fee, //res.data.dataExtend,
						orderId: orderid, //res.data.data,
						openid: openid //this.openid
					}),
					header: {
						'content-type': 'application/json' //自定义请求头信息
					},
					method: 'POST',
					//dataType:'json',
					success: (res) => {
						console.log('weiXinPayApp====', JSON.stringify(res));
						if (res.data.code == 0) {
							this.wxPayApp(res.data.payData) //调用支付接口
						} else {
							uni.showToast({
								title: res.data.msg,
								icon: 'none'
							});
						}
					}
				});
			},
			//调用openid接口
			openIDfun(fee, orderid) {
				console.log("openIDfun,code=", this.code);
				// #ifdef APP-PLUS
				this.$http("getOpenidForApp",
					JSON.stringify({
						code: this.code
					}), ).then(res => {
					console.log('openIDfun=', JSON.stringify(res));
					if (res.data.code == 0) {
						this.openid = res.data.data
						//this.getorderData()//调用支付订单接口
						this.weiXinPayApp(fee, orderid, this.openid);
					} else {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
					}

				}).catch(err => {
					console.log(err);
				});
				// #endif
				// #ifdef MP-WEIXIN
				this.$http("getOpenidByCode",
					JSON.stringify({
						code: this.code
					}), ).then(res => {
					console.log(res, `openid显示`)
					this.openid = res.data.data
					//this.getorderData()//调用支付订单接口
					this.weiXinPay(fee, orderid, this.openid);
				}).catch(err => {
					console.log(err);
				});
				// #endif
			},
			weiXinPay(fee, orderid, openid) {
				uni.request({
					url: 'https://funong.abillchen.top/weiXinPay',
					data: JSON.stringify({
						fee: fee, //res.data.dataExtend,
						orderId: orderid, //res.data.data,
						openid: openid //this.openid
					}),
					header: {
						'content-type': 'application/json' //自定义请求头信息
					},
					method: 'POST',
					//dataType:'json',
					success: (res) => {
						this.payment(res.data.payData) //调用支付接口
					}
				});
			},

			//支付接口调用
			payment(item) {
				var that = this
				console.log('payment', JSON.stringify(item));
				uni.requestPayment({
					provider: 'wxpay',
					timeStamp: item.timestamp, //时间戳
					nonceStr: item.nonce_str, //随机字符串
					package: "prepay_id=" + item.prepay_id, //统一下单接口返回的 prepay_id 参数值
					signType: 'MD5',
					paySign: item.sign, //签名内容
					success: function(res) {
						setTimeout(() => {
							let web = '/pages/order/order?state=0&ddid=' + that.ddid
							uni.redirectTo({
								url: web
							})
						}, 1000);
					},
					fail: function(err) {

						setTimeout(() => {
							uni.switchTab({
								url: '/pages/index/index',
							})
						}, 2000);
					}
				});
			},

			wxPayApp(data) {
				let orderInfo = {
					appid: data.appid,
					noncestr: data.nonce_str,
					package: 'Sign=WXPay',
					partnerid: data.mch_id,
					prepayid: data.prepay_id,
					timestamp: data.timestamp,
					sign: data.sign // 根据签名算法生成签名  
				};

				uni.requestPayment({
					provider: 'wxpay',
					//signType: 'MD5',
					orderInfo: orderInfo, //微信、支付宝订单数据  
					success: function(res) {
						setTimeout(() => {
							let web = '/pages/order/order?state=0&ddid=' + that.ddid
							uni.redirectTo({
								url: web
							})
						}, 1000);
					},
					fail: function(err) {
						setTimeout(() => {
							uni.switchTab({
								url: '/pages/index/index',
							})
						}, 2000);
					}
				});
			},

			radioChange(evt) {
				console.log(evt.detail.value + ' sss');
				this.choose = evt.detail.value
			},
			get_pay() {
				this.$http("selectItemList",
					JSON.stringify({
						tag: "order_pay",
						token: "",
					}), ).then(res => {
					if (res.data.code == 0) {
						this.paytypes = res.data.itemList
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
							icon: "none"
						})
					}
				}).catch(err => {
					console.log(err);
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	page {
		background: $page-color-base;
		padding-bottom: 100upx;
	}
	
	.orderJs ::v-deep .uni-popup {
		z-index: 1400;
		
		.popup-content {
			padding: 30rpx 20rpx 0;
			height: 300rpx;
			font-size: 32rpx;
		}
		
		.popup-title{
			padding: 0 40rpx 20rpx;
		}
		
		.popup_index{
			width: 80%;
			margin: 0 auto;
			display: flex;
			height: 70rpx;
			border: 1rpx solid #E5E5E5;
			padding-left: 20rpx;
			align-items: center;
			font-size: 30rpx;
		}
		
		.state_view{
			display: flex;
			height: 120rpx;
			justify-content: space-between;
			width: 80%;
			margin: 0 auto;
		}
		.cancel{
			display: flex;
			justify-content: center;
			align-items: center;
			border: 1rpx solid #E5E5E5;
			margin: 30rpx 0;
			border-radius: 10rpx;
			height: 70rpx;
			padding: 0 70rpx;
		}
		.confirm{
			display: flex;
			justify-content: center;
			align-items: center;
			border: 1rpx solid #E5E5E5;
			margin: 30rpx 0;
			border-radius: 10rpx;
			height: 70rpx;
			padding: 0 70rpx;
		}
	}
	
	.address-section {
		padding: 30upx 0;
		background: #fff;
		position: relative;

		.order-content {
			display: flex;
			align-items: center;
		}

		.icon-shouhuodizhi {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 90upx;
			color: #888;
			font-size: 44upx;
		}

		.cen {
			display: flex;
			flex-direction: column;
			flex: 1;
			font-size: 28upx;
			color: $font-color-dark;
		}

		.name {
			font-size: 34upx;
			margin-right: 24upx;
		}

		.address {
			margin-top: 16upx;
			margin-right: 20upx;
			color: $font-color-light;
		}

		.icon-you {
			font-size: 32upx;
			color: $font-color-light;
			margin-right: 30upx;
		}

		.a-bg {
			position: absolute;
			left: 0;
			bottom: 0;
			display: block;
			width: 100%;
			height: 5upx;
		}
	}

	.goods-section {
		background: #fff;
		padding: 20rpx;

		.g-header {
			display: flex;
			align-items: center;
			height: 84upx;
			padding: 0 30upx;
			position: relative;
		}

		.logo {
			display: block;
			width: 50upx;
			height: 50upx;
			border-radius: 100px;
		}

		.name {
			font-size: 30upx;
			color: $font-color-base;
			margin-left: 24upx;
		}

		.g-item {
			display: flex;
			margin: 20upx 30upx;

			image {
				flex-shrink: 0;
				display: block;
				width: 140upx;
				height: 140upx;
				border-radius: 10upx;
			}

			.right {
				flex: 1;
				padding-left: 24upx;
				overflow: hidden;
			}

			.title {
				font-size: 30upx;
				color: $font-color-dark;
			}

			.spec {
				font-size: 26upx;
				color: $font-color-light;
			}

			.price-box {
				display: flex;
				align-items: center;
				font-size: 32upx;
				color: $font-color-dark;
				padding-top: 58upx;
				justify-content: space-between;

				.price {
					margin-bottom: 4upx;
				}

				.number {
					font-size: 26upx;
					color: $font-color-base;
					margin-left: 20upx;
				}
			}

			.step-box {
				position: relative;
			}
		}
	}

	.yt-list {
		margin-top: 16upx;
		background: #fff;
	}
	
	.yt-list-cell_b {
		display: flex;
		align-items: center;
		padding: 10rpx 30rpx 10rpx 40rpx;
		line-height: 50rpx;
		position: relative;
	
		&.b-b:after {
			left: 30upx;
		}
	
		.cell-tit {
			flex: 1;
			font-size: 26upx;
			color: $font-color-light;
			margin-right: 10upx;
		}
	
		.cell-tip {
			font-size: 26rpx;
			color: #303133;
			height: 100%;
			width: 60%;
			text-align: right;
		}
	}

	.yt-list-cell {
		display: flex;
		align-items: center;
		padding: 10upx 30upx 10upx 40upx;
		line-height: 70upx;
		position: relative;

		&.cell-hover {
			background: #fafafa;
		}

		&.b-b:after {
			left: 30upx;
		}

		.cell-icon {
			height: 32upx;
			width: 32upx;
			font-size: 22upx;
			color: #fff;
			text-align: center;
			line-height: 32upx;
			background: #f85e52;
			border-radius: 4upx;
			margin-right: 12upx;

			&.hb {
				background: #ffaa0e;
			}

			&.lpk {
				background: #3ab54a;
			}

		}

		.cell-more {
			align-self: center;
			font-size: 24upx;
			color: $font-color-light;
			margin-left: 8upx;
			margin-right: -10upx;
		}

		.cell-tit {
			flex: 1;
			font-size: 26upx;
			color: $font-color-light;
			margin-right: 10upx;
		}

		.cell-tip {
			font-size: 26upx;
			color: $font-color-dark;

			&.disabled {
				color: $font-color-light;
			}

			&.active {
				color: $base-color;
			}

			&.red {
				color: $base-color;
			}
		}

		&.desc-cell {
			.cell-tit {
				max-width: 90upx;
			}
		}

		.desc {
			flex: 1;
			font-size: $font-base;
			color: $font-color-dark;
		}
	}

	/* 支付列表 */
	.pay-list {
		padding-left: 40upx;
		margin-top: 16upx;
		background: #fff;

		.pay-item {
			display: flex;
			align-items: center;
			padding-right: 20upx;
			line-height: 1;
			height: 110upx;
			position: relative;
		}

		.icon-weixinzhifu {
			width: 80upx;
			font-size: 40upx;
			color: #6BCC03;
		}

		.icon-alipay {
			width: 80upx;
			font-size: 40upx;
			color: #06B4FD;
		}

		.icon-xuanzhong2 {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 60upx;
			height: 60upx;
			font-size: 40upx;
			color: $base-color;
		}

		.tit {
			font-size: 32upx;
			color: $font-color-dark;
			flex: 1;
		}
	}

	.footer {
		position: fixed;
		left: 0;
		bottom: 0;
		z-index: 995;
		display: flex;
		align-items: center;
		width: 100%;
		height: 90upx;
		justify-content: space-between;
		font-size: 30upx;
		background-color: #fff;
		z-index: 998;
		color: $font-color-base;
		box-shadow: 0 -1px 5px rgba(0, 0, 0, .1);

		.price-content {
			padding-left: 30upx;
		}

		.price-tip {
			color: $base-color;
			margin-left: 8upx;
		}

		.price {
			font-size: 36upx;
			color: $base-color;
		}

		.add-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 280upx;
			height: 100%;
			color: #fff;
			font-size: 32upx;
		}
	}

	/* 优惠券面板 */
	.mask {
		display: flex;
		align-items: flex-end;
		position: fixed;
		left: 0;
		top: var(--window-top);
		bottom: 0;
		width: 100%;
		background: rgba(0, 0, 0, 0);
		z-index: 9995;
		transition: .3s;

		.mask-content {
			width: 100%;
			min-height: 30vh;
			max-height: 70vh;
			background: #f3f3f3;
			transform: translateY(100%);
			transition: .3s;
			overflow-y: scroll;
		}

		&.none {
			display: none;
		}

		&.show {
			background: rgba(0, 0, 0, .4);

			.mask-content {
				transform: translateY(0);
			}
		}
	}

	/* 优惠券列表 */
	.coupon-item {
		display: flex;
		flex-direction: column;
		margin: 20upx 24upx;
		background: #fff;

		.con {
			display: flex;
			align-items: center;
			position: relative;
			height: 120upx;
			padding: 0 30upx;

			&:after {
				position: absolute;
				left: 0;
				bottom: 0;
				content: '';
				width: 100%;
				height: 0;
				border-bottom: 1px dashed #f3f3f3;
				transform: scaleY(50%);
			}
		}

		.left {
			display: flex;
			flex-direction: column;
			justify-content: center;
			flex: 1;
			overflow: hidden;
			height: 100upx;
		}

		.title {
			font-size: 32upx;
			color: $font-color-dark;
			margin-bottom: 10upx;
		}

		.time {
			font-size: 24upx;
			color: $font-color-light;
		}

		.right {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			font-size: 26upx;
			color: $font-color-base;
			height: 100upx;
		}

		.price {
			font-size: 44upx;
			color: $base-color;

			&:before {
				content: '￥';
				font-size: 34upx;
			}
		}

		.tips {
			font-size: 24upx;
			color: $font-color-light;
			line-height: 60upx;
			padding-left: 30upx;
		}

		.circle {
			position: absolute;
			left: -6upx;
			bottom: -10upx;
			z-index: 10;
			width: 20upx;
			height: 20upx;
			background: #f3f3f3;
			border-radius: 100px;

			&.r {
				left: auto;
				right: -6upx;
			}
		}
	}

	.tip1 {
		font-size: 26rpx;
		display: block;
		float: left;
		color: #909399;
		width: 200rpx;
	}

	.tip2 {
		display: block;
		float: left;
		font-size: 26rpx;
		margin-left: 60rpx;

		.uni-list-cell {
			display: block;
			float: left;
			margin-right: 20rpx;

			.nav1 {
				display: block;
				float: left;

				image {
					width: 40rpx;
					height: 40rpx;
					vertical-align: middle;
					margin-right: 4rpx;
				}

				margin-right: 10rpx;
			}

			.nav2 {
				display: block;
				float: left;

				radio {}
			}

		}
	}

	.timepicker {
		clear: both;
		margin-top: 10rpx;
		background: #fff;
		padding: 20rpx;
		height: 80rpx;

		.tip1 {
			font-size: 26rpx;
			display: block;
			float: left;
			color: #909399;
		}

		.tip2 {
			display: block;
			float: left;
			font-size: 26rpx;
			margin-left: 60rpx;
			width: 500rpx;
		}
	}

	.item {
		width: 100%;
		height: 120rpx;
		position: relative;
		padding: 0 20rpx;

		.item-left {
			display: block;
			float: left;
			margin-right: 20rpx;

			image {
				height: 100rpx;
				width: 100rpx;
			}
		}

		.item-right {
			display: block;
			float: left;
			height: 100%;

			.shopname {
				font-size: 28rpx;
				font-weight: 500rpx;
				padding: 0 20rpx 30rpx;
			}

			.adress {
				font-size: 22rpx;
				color: #999999;

				text {
					display: block;
					float: left;
					width: 50rpx !important;
				}

				p {
					display: block;
					float: left;
					height: 50rpx;
					line-height: 50rpx;
				}
			}
		}

	}

	.list-cell {
		justify-content: flex-start;
		display: flex;
		align-items: center;

		.coupon {
			width: 620rpx;
			height: 170rpx;
			background-color: #FFF1EA;
			padding: 20rpx;
			margin: 10rpx 20rpx;
			border: 2rpx dotted #000000;

			.left {
				display: block;
				float: left;
				width: 500rpx;

				.title {
					font-size: 34rpx;
					color: #000000;
					width: 100%;
					display: block;
					height: 50rpx;
					line-height: 50rpx;
				}

				.time {
					font-size: 28rpx;
					color: #FD7031;
					width: 100%;
					display: block;
					height: 40rpx;
					line-height: 40rpx;
				}
			}

			.right {
				display: block;
				float: right;

				image {
					height: 40rpx;
					width: 70rpx;
				}
			}

		}

		.selection {
			margin-left: 10rpx;
		}
	}
</style>
