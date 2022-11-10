<template>
	<view class="container">
		<view class="carousel">
			<swiper indicator-dots circular=true duration="400" autoplay="true">
				<swiper-item class="swiper-item" v-for="(item,index) in imgList" :key="index">
					<view class="image-wrapper">
						<image :src="item.url" class="loaded" mode=""></image>
					</view>
				</swiper-item>
			</swiper>
		</view>

		<view class="introduce-section">
			<text class="title">{{spmc}}</text>
			<text class="spsm" style="display: flex;font-size: 26rpx;">{{spsm}}</text>
			<view class="price-box">
				<text class="price-tip">{{splsj}}</text>
				<text class="price" style="font-size: 30rpx;padding-left: 10rpx;">枚蛋</text>
			</view>
		</view>

		<view class="detail-desc">
			<view class="d-header">
				<text>活动详情</text>
			</view>
			<div v-for="(item,index) in spxqimg" :key="index">
				<image style="width:100%;"mode="widthFix" v-bind:src="item.url"></image>				
			</div>
		</view>

		<!-- 底部操作菜单 -->
		<view class="page-bottom">
			<view class="tip2">
				<text>{{hdsmTxt}}</text>
				 <!-- <radio-group @change="radioChange">
					 <label class="uni-list-cell uni-list-cell-pd" v-for="(item, index) in paytypes" :key="item.k">							 
						 <view class="nav1">{{item.selectTxt}}</view>
						 <view class="nav2"><radio :value="item.selectValue" :checked="index === current" style="transform: scale(0.7)" /></view>
					 </label>
				 </radio-group> -->
			</view>
			<view class="cart">
				<view class="action-btn-group">	
					<button type="primary" class="action-btn no-border add-cart-btn"@click="immeAdopted()">立即认养</button>
				</view>
			</view>
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
				payType:5,
				spxqimg:'',
				spsm:'',
				spmc: '',
				splsj: '',
				json: {},
				imgList: [],								
				hdid:0,
				nums:1,
				paytypes:[],
				current: 0,
				choose:0,
				show:false,
				hdsmTxt:'',
				
				// 交易密码
				dealPassword: ''
			};
		},
		onLoad(options) {
			this.hdid = options.hdid;
			//this.get_pay();			
			this.get_ad();
			this.getHdsmTxt();
		},
		methods: {
			get_ad(){
				this.$http("huodongInfo", JSON.stringify({
					token: "",
					hdid: this.hdid
				})).then(res=>{
					if (res.data.code != 0) {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
					} else {
						this.json = res.data.huodongInfo;
						this.imgList = this.json.imgList.viewList;						 
						this.spxqimg=this.json.imgList.detailList;
						this.spmc = this.json.hdmc;
						this.splsj = this.json.price;
						this.spsm=this.json.remark;
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			
			numberChange(e) {
				this.nums = e				
			},
			
			get_pay() {
				this.$http("selectItemList", JSON.stringify({
					tag:"user_cz",
					token: "",
				}),).then(res=>{	
					if(res.data.code==0){
						this.paytypes = res.data.itemList
					}else{
						uni.showToast({
							title: res.data.msg,
							icon: "none"
						})
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			
			radioChange: function(evt) {
				for (let i = 0; i < this.paytypes.length; i++) {
					if (this.paytypes[i].value === evt.detail.value) {
						this.current = i;
						break;
					}
				}
				console.log(evt.detail.value+' sss')
				this.choose = evt.detail.value
			},
			getHdsmTxt(){
				this.$http("appTxtGet", JSON.stringify({
					token: 'token',
					txtID: 'RYSM'
				})).then(res => {
					if (res.data.code != 0) {
						uni.showToast({ title: res.data.msg, icon: 'none'});
					} else {
						this.hdsmTxt = res.data.txtInfo.txt;
					}
				}).catch(err => {
					console.log(err);
				})
			},
			immeAdopted(){
				if(!uni.getStorageSync("token")){
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
					this.userPwdMoneyExists()
				}
			},
			// 取消交易密码
			cancelClick(){
				this.dealPassword = ''
				this.$refs.popup.close()
			},
			// 确认交易密码
			confirmClick(){
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
						this.huoDongBuyByEgg()
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
			huoDongBuyByEgg(){
				this.$http("huodongBuyByEgg", JSON.stringify({
					token: uni.getStorageSync("token"),
					hdid: this.hdid
				})).then(res=>{	
					if(res.data.code==0){
						uni.navigateTo({
							url: '/pages/adoption/adoption'
						})
					}else{
						uni.showToast({title: res.data.msg, icon: "none"})
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			submit(){
				if (uni.getStorageSync('token')) {
					if(Number(this.nums)!=0){
						//this.pay_submit();
						this.getorderData();
					}else{
						console.log('发生错误!')
					}
				}else{//未登录
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
			
			pay_submit(){
				var that=this
				if(that.choose==1){	//0.微信 ye
				// #ifdef MP-WEIXIN
					uni.login({
					provider:"weixin",
					success:loginRes=>{
						this.code=loginRes.code
						console.log("getPayData==",JSON.stringify(loginRes));
						this.openIDfun()//调用openid接口
					}});
				// #endif
					
				//#ifdef APP-PLUS
					uni.getProvider({
						service: 'oauth',
						success: function(res) {
					
							if (~res.provider.indexOf('weixin')) {
								uni.login({
								provider: 'weixin',
									success: loginRes => {
										that.openid = loginRes.authResult.openid;
										that.getorderData();
									}
								});
							}
						}
					});
				//#endif
				}else if(that.choose==2){
					this.show=true				
					
				}else{
					console.log('error! 发生支付错误')
				}
			},
			
			//调用openid接口
			openIDfun(){
				   this.$http("getOpenidByCode",
				   JSON.stringify({
				   	code: this.code
				   }),).then(res=>{	
						this.openid=res.data.data
						this.getorderData()//调用支付订单接口
				   }).catch(err=>{
				   	console.log(err);
				   })
			},
			wxpayApp(fee, orderid, openid) {
				//console.log('fee='+fee+',orderid='+orderid+',openid='+openid);
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
						setTimeout(() => {uni.switchTab({
								url: '/pages/user/user',
							})									   											
						}, 1000);
					},
					fail: function(err) {
						uni.showToast({title:err});
					}
				});
			},
			// 订单参数
			getorderData(){
				var that=this
				
				this.$http("huodongToCashin",
				JSON.stringify({
					hdid:this.hdid,
					payType:that.choose,
					token:uni.getStorageSync("token")
				}),).then(res=>{
					if (res.data.code == 0) {
						if(that.choose==1){
							//#ifdef MP-WEIXIN
								that.getPayData(res);
							//#endif
							
							//#ifdef APP-PLUS
								that.wxpayApp(res.data.dataExtend,res.data.data, that.openid);
							//#endif
						}
						else if(that.choose==2){
							this.cashinPayByRemain(res.data.data);
						}
					
					}
					else if(res.data.code == 99){
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
					}
					else{
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
					}				
				}).catch(err=>{
					console.log(err);
				})
				
			},
			cashinPayByRemain(cashinid) {
				var that = this
			
				this.$http("cashinPayByRemain",
					JSON.stringify({
						token: uni.getStorageSync("token"),
						cashinID: cashinid
					}), ).then(res => {
					if (res.data.code == 0) {
						console.log("订单参数", res);
						//that.getPayData(res);//调用获取支付参数
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
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
					}
			
				}).catch(err => {
					console.log(err);
				})
			},
			// 支付参数接口调用
			getPayData(res){
				uni.request({
					url: 'https://funong.abillchen.top/weiXinPay',
					data: JSON.stringify({
						fee: res.data.dataExtend,
						orderId: res.data.data,
						openid: this.openid
					}),
					header: {
						'content-type': 'application/json' //自定义请求头信息
					},
					method: 'POST',
					//dataType:'json',
					success: (res) => {
						this.payment(res.data.payData)//调用支付接口
					}
				});
			},
			
			//支付接口调用
			payment(item){
				uni.requestPayment({
					provider: 'wxpay',
					timeStamp: item.timestamp,//时间戳
					nonceStr: item.nonce_str,//随机字符串
					package: "prepay_id="+item.prepay_id,//统一下单接口返回的 prepay_id 参数值
					signType: 'MD5',
					 paySign: item.sign,//签名内容
					 success: function (res) {
						setTimeout(() => {
							uni.switchTab({
								url: '/pages/user/user',
							})									   											
						}, 1000);
					 },
					 fail: function (err) {
							uni.showToast({title:err});
					 }
				});
			},
			   
			//支付成功后跳转订单
			go_order(){
				setTimeout(() => {
					uni.redirectTo({
						url:'/pages/finance/bill',
					})										   											
				}, 1000)
			}
		},

	}
</script>

<style lang='scss' scoped>
	page {
		background: $page-color-base;
		padding-bottom: 160upx;
	}

	.icon-you {
		font-size: $font-base + 2upx;
		color: #888;
	}

	.carousel {
		height: 560upx;
		position: relative;

		swiper {
			height: 100%;
		}

		.image-wrapper {
			width: 100%;
			height: 100%;
		}

		.swiper-item {
			display: flex;
			justify-content: center;
			align-content: center;
			height: 750upx;
			overflow: hidden;

			image {
				width: 100%;
				height: 100%;
			}
		}

	}

	/* 标题简介 */
	.introduce-section {
		background: #fff;
		padding: 20upx 30upx;

		.title {
			font-size: 32upx;
			color: $font-color-dark;
			height: 50upx;
			line-height: 50upx;
		}

		.price-box {
			display: flex;
			align-items: baseline;
			height: 64upx;
			padding: 10upx 0;
			font-size: 26upx;
			color: $uni-color-primary;
		}

		.price {
			font-size: $font-lg + 2upx;
		}

		.m-price {
			margin: 0 12upx;
			color: $font-color-light;
			text-decoration: line-through;
		}

		.coupon-tip {
			align-items: center;
			padding: 4upx 10upx;
			background: $uni-color-primary;
			font-size: $font-sm;
			color: #fff;
			border-radius: 6upx;
			line-height: 1;
			transform: translateY(-4upx);
		}
	}

	/* 分享 */
	.share-section {
		display: flex;
		align-items: center;
		color: $font-color-base;
		background: linear-gradient(left, #fdf5f6, #fbebf6);
		padding: 12upx 30upx;

		.share-icon {
			display: flex;
			align-items: center;
			width: 70upx;
			height: 30upx;
			line-height: 1;
			border: 1px solid $uni-color-primary;
			border-radius: 4upx;
			position: relative;
			overflow: hidden;
			font-size: 22upx;
			color: $uni-color-primary;

			&:after {
				content: '';
				width: 50upx;
				height: 50upx;
				border-radius: 50%;
				left: -20upx;
				top: -12upx;
				position: absolute;
				background: $uni-color-primary;
			}
		}

		.icon-xingxing {
			position: relative;
			z-index: 1;
			font-size: 24upx;
			margin-left: 2upx;
			margin-right: 10upx;
			color: #fff;
			line-height: 1;
		}

		.tit {
			font-size: $font-base;
			margin-left: 10upx;
		}

		.icon-bangzhu1 {
			padding: 10upx;
			font-size: 30upx;
			line-height: 1;
		}

		.share-btn {
			flex: 1;
			text-align: right;
			font-size: $font-sm;
			color: $uni-color-primary;
		}

		.icon-you {
			font-size: $font-sm;
			margin-left: 4upx;
			color: $uni-color-primary;
		}
	}

	.c-list {
		font-size: $font-sm + 2upx;
		color: $font-color-base;
		background: #fff;

		.c-row {
			display: flex;
			align-items: center;
			padding: 20upx 30upx;
			position: relative;
		}

		.tit {
			width: 140upx;
		}

		.con {
			flex: 1;
			color: $font-color-dark;

			.selected-text {
				margin-right: 10upx;
			}
		}

		.bz-list {
			height: 40upx;
			font-size: $font-sm+2upx;
			color: $font-color-dark;

			text {
				display: inline-block;
				margin-right: 30upx;
			}
		}

		.con-list {
			flex: 1;
			display: flex;
			flex-direction: column;
			color: $font-color-dark;
			line-height: 40upx;
		}

		.red {
			color: $uni-color-primary;
		}
	}

	/* 评价 */
	.eva-section {
		display: flex;
		flex-direction: column;
		padding: 20upx 30upx;
		background: #fff;
		margin-top: 16upx;

		.e-header {
			display: flex;
			align-items: center;
			height: 70upx;
			font-size: $font-sm + 2upx;
			color: $font-color-light;

			.tit {
				font-size: $font-base + 2upx;
				color: $font-color-dark;
				margin-right: 4upx;
			}

			.tip {
				flex: 1;
				text-align: right;
			}

			.icon-you {
				margin-left: 10upx;
			}
		}
	}

	.eva-box {
		display: flex;
		padding: 20upx 0;

		.portrait {
			flex-shrink: 0;
			width: 80upx;
			height: 80upx;
			border-radius: 100px;
		}

		.right {
			flex: 1;
			display: flex;
			flex-direction: column;
			font-size: $font-base;
			color: $font-color-base;
			padding-left: 26upx;

			.con {
				font-size: $font-base;
				color: $font-color-dark;
				padding: 20upx 0;
			}

			.bot {
				display: flex;
				justify-content: space-between;
				font-size: $font-sm;
				color: $font-color-light;
			}
		}
	}

	/*  详情 */
	.detail-desc {
		background: #fff;
		margin-top: 16upx;

		.d-header {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 80upx;
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			position: relative;

			text {
				padding: 0 20upx;
				background: #fff;
				position: relative;
				z-index: 1;
			}

			&:after {
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translateX(-50%);
				width: 300upx;
				height: 0;
				content: '';
				border-bottom: 1px solid #ccc;
			}
		}
		
		div{ 
			margin-top: -20rpx;
		}
	}

	/* 规格选择弹窗 */
	.attr-content {
		padding: 10upx 30upx;

		.a-t {
			display: flex;

			image {
				width: 170upx;
				height: 170upx;
				flex-shrink: 0;
				margin-top: -40upx;
				border-radius: 8upx;
				;
			}

			.right {
				display: flex;
				flex-direction: column;
				padding-left: 24upx;
				font-size: $font-sm + 2upx;
				color: $font-color-base;
				line-height: 42upx;

				.price {
					font-size: $font-lg;
					color: $uni-color-primary;
					margin-bottom: 10upx;
				}

				.selected-text {
					margin-right: 10upx;
				}
			}
		}

		.attr-list {
			display: flex;
			flex-direction: column;
			font-size: $font-base + 2upx;
			color: $font-color-base;
			padding-top: 30upx;
			padding-left: 10upx;
		}

		.item-list {
			padding: 20upx 0 0;
			display: flex;
			flex-wrap: wrap;

			text {
				display: flex;
				align-items: center;
				justify-content: center;
				background: #eee;
				margin-right: 20upx;
				margin-bottom: 20upx;
				border-radius: 100upx;
				min-width: 60upx;
				height: 60upx;
				padding: 0 20upx;
				font-size: $font-base;
				color: $font-color-dark;
			}

			.selected {
				background: #fbebee;
				color: $uni-color-primary;
			}
		}
	}

	/*  弹出层 */
	.popup {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: 99;

		&.show {
			display: block;

			.mask {
				animation: showPopup 0.2s linear both;
			}

			.layer {
				animation: showLayer 0.2s linear both;
			}
		}

		&.hide {
			.mask {
				animation: hidePopup 0.2s linear both;
			}

			.layer {
				animation: hideLayer 0.2s linear both;
			}
		}

		&.none {
			display: none;
		}

		.mask {
			position: fixed;
			top: 0;
			width: 100%;
			height: 100%;
			z-index: 1;
			background-color: rgba(0, 0, 0, 0.4);
		}

		.layer {
			position: fixed;
			z-index: 99;
			bottom: 0;
			width: 100%;
			min-height: 40vh;
			border-radius: 10upx 10upx 0 0;
			background-color: #fff;

			.btn {
				height: 66upx;
				line-height: 66upx;
				border-radius: 100upx;
				background: $uni-color-primary;
				font-size: $font-base + 2upx;
				color: #fff;
				margin: 30upx auto 20upx;
			}
		}

		@keyframes showPopup {
			0% {
				opacity: 0;
			}

			100% {
				opacity: 1;
			}
		}

		@keyframes hidePopup {
			0% {
				opacity: 1;
			}

			100% {
				opacity: 0;
			}
		}

		@keyframes showLayer {
			0% {
				transform: translateY(120%);
			}

			100% {
				transform: translateY(0%);
			}
		}

		@keyframes hideLayer {
			0% {
				transform: translateY(0);
			}

			100% {
				transform: translateY(120%);
			}
		}
	}

	/* 底部操作菜单 */
	.page-bottom {
		position: fixed;
		left: 30upx;
		bottom: 30upx;
		z-index: 95;
		/* display: flex; */
		justify-content: center;
		align-items: center;
		width: 690upx;
		height: 160rpx;
		background: rgba(255, 255, 255, .9);
		box-shadow: 0 0 20upx 0 rgba(0, 0, 0, .5);
		border-radius: 16upx;

		.p-b-btn {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			font-size: $font-sm;
			color: $font-color-base;
			width: 96upx;
			height: 80upx;

			.yticon {
				font-size: 40upx;
				line-height: 48upx;
				color: $font-color-light;
			}

			&.active,
			&.active .yticon {
				color: $uni-color-primary;
			}

			.icon-fenxiang2 {
				font-size: 42upx;
				transform: translateY(-2upx);
			}

			.icon-shoucang {
				font-size: 46upx;
			}
		}

		.action-btn-group {
			.action-btn {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 180rpx;
				height: 76rpx;
				font-size: 28rpx;
				border-radius: 50rpx;
			}
		}
	}
	/* 优惠券面板 */
	.mask{
		display: flex;
		align-items: flex-end;
		position: fixed;
		left: 0;
		top: var(--window-top);
		bottom: 0;
		width: 100%;
		background: rgba(0,0,0,0);
		z-index: 9995;
		transition: .3s;
		
		.mask-content{
			width: 100%;
			min-height: 30vh;
			max-height: 70vh;
			background: #f3f3f3;
			transform: translateY(100%);
			transition: .3s;
			overflow-y:scroll;
		}
		&.none{
			display: none;
		}
		&.show{
			background: rgba(0,0,0,.4);
			
			.mask-content{
				transform: translateY(0);
			}
		}
	}
	
	/* 优惠券列表 */
	.coupon-item{
		display: flex;
		flex-direction: column;
		margin: 20upx 24upx;
		background: #fff;
		.con{
			display: flex;
			align-items: center;
			position: relative;
			height: 120upx;
			padding: 0 30upx;
			&:after{
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
		.left{
			display: flex;
			flex-direction: column;
			justify-content: center;
			flex: 1;
			overflow: hidden;
			height: 100upx;
		}
		.title{
			font-size: 32upx;
			color: $font-color-dark;
			margin-bottom: 10upx;
		}
		.time{
			font-size: 24upx;
			color: $font-color-light;
		}
		.right{
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			font-size: 26upx;
			color: $font-color-base;
			height: 100upx;
		}
		.price{
			font-size: 44upx;
			color: $base-color;
			&:before{
				content: '￥';
				font-size: 34upx;
			}
		}
		.tips{
			font-size: 24upx;
			color: $font-color-light;
			line-height: 60upx;
			padding-left: 30upx;
		}
		.tipsbutton{
			font-size: 24upx;
			color: #55C47D;
			line-height: 72upx;
			padding-left: 30upx;
			margin-left: 270px;
			margin-top: -30px;
			
		}
		.circle{
			position: absolute;
			left: -6upx;
			bottom: -10upx;
			z-index: 10;
			width: 20upx;
			height: 20upx;
			background: #f3f3f3;
			border-radius: 100px;
			&.r{
				left: auto;
				right: -6upx;
			}
		}
	}
	
	.tip2{
		font-size: 26rpx;
		width: 100%;
		padding: 10rpx;
		height: 60rpx;
		
		text{
			display: block;
			float: left;
			margin: 0 30rpx 0 10rpx;
		}
		
		radio-group{
			height: 50rpx;
			
			.uni-list-cell{
				display: block;
				float: left;
				margin-right: 20rpx;
				
				.nav1{
					display: block;
					float: left;
					image{
						width: 40rpx;
						height: 40rpx;
						vertical-align: middle;
						margin-right: 4rpx;
					}
					margin-right: 10rpx;
				}
				
				.nav2{
					display: block;
					float: left;
					radio{
						
					}
				}
				
			}
			
		}
		
	}
	
	.cart{
		width: 100%;
		height: 100rpx;
		
		
		.step{
			width: 250rpx;
			 display: block;
			/**/float: left; 
			margin-left: 100rpx;
			margin-top: 4rpx;
		}
		
		.action-btn-group{
			width: 200rpx;
			/* display: block; */
			float: right;
			margin-top: -8rpx;
		}
	}
	
	.operation {
		display: flex;
		justify-content: center;
	}
	.gwcsr{
		width: 60rpx;
		text-align: center;
	}
	.plus {
		background: #fd7031;
	}
	
	.container ::v-deep .uni-popup {
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
</style>
