<!-- 输入交易密码框 -->

<template>
	<view class="back" v-if="show">
		<view class="pay-box">
			<view class="title">
				<view class="close-icon" @click="close"><u-icon name="close"></u-icon></view>
				<view class="title-text">请输入支付密码</view>
			</view>
			<view v-if="payType!='99'" class="">
				<view class="type-1" v-if="payType==0">众邦支付</view>
				<view class="type-1" v-else-if="payType==1">众邦提现</view>
				<view class="type-1" v-else-if="payType==2">余额提现</view>
				<view class="type-1" v-else-if="payType==3">转赠</view>
				<view class="type-1" v-else-if="payType==4">在线养鸡点餐</view>
				<view class="type-1" v-else-if="payType==5">余额支付</view>
				<view class="type-1" v-else-if="payType==7">余额支付</view>
				<view class="type-1" v-else></view>
				<view class="price" v-if="payType==8"></view>
				<view class="price" v-else>￥ {{ mentMoney }}</view>
			</view>
			<view class="br"></view>
			<!-- <view class="type">
				<view class="source">资金来源</view>
				<view class="balance" v-if="payType == 0">
					<image src="../static/zhongbang/icon/qb.png" mode=""></image>
					在线养鸡余额
				</view>
				<view class="balance" v-if="payType == 1">
					<image src="../static/zhongbang/icon/yhk.png" mode=""></image>
					银行卡
				</view>
			</view> -->
			<view class="input">
				<u-message-input :maxlength="6" focus :dot-fill="true" width="70" @finish="commit"></u-message-input>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		price: {
			type: Number //金额
		},
		show: {
			type: Boolean, //支付框显示隐藏
			default: true
		},
		statusm: {
			type: Number //弹框状态
		},
		payType: {
			type: Number ,// 0是众邦支付  1是众邦提现  2是余额提现 3是转赠 4余额支付 5是余额支付365 
						  // 6服务中心提现 7子账号支付  8转赠优惠券  99是众邦开户手续费
		},
		mentMoney: {
			type: String //金额
		},
		phoneno: {
			type: String //转赠人id
		},
		nums: {
			type: String //数量
		},
		ddid:{
			type: String 
		},
		yhqid:{
			type: String
		},
		hdid:{
			type: String
		},
		pono:{
			type: String //
		}
	},
	data() {
		return {
			transaction: false,
			xzpay: 1,
			aaa: '',
			userid_out: '', //转出
			userid_in: '', //转入
			userid: uni.getStorageSync('userid')
		}
	},
	onLoad() {
		this.payStatus()
		// this.transaction=this.show
	},
	methods: {
		payStatus() {
			if (this.payType == 1) {
				this.xzpay = 1
			} else {
				this.xzpay = 0
			}
		},
		//支付弹框false隐藏
		close() {
			// this.show = false
			this.$emit('close', false)
		},
		openBox() {
			this.$emit('openBox', true)
		},
		commit(e) {
			console.log(e, this.statusm, this.mentMoney)
			if (this.payType == 0) {
				if (this.statusm == 0) {
					console.log('转入')
					
					this.zbpayment(e)
				} else {
					console.log('转出')
				
					this.zbpayment(e)
				}
				// this.zbpayment(e)
			}  else if (this.payType == 1) {
				this.zbWithdrawal(e)
			} else if (this.payType == 2) {
				// this.verifyPassword(e)balanceWithdrawal
				this.verifyPassword(e, 2)
				console.log(222)
			} else if (this.payType == 3) {
				this.verifyPassword(e, 3)
			} else if(this.payType == 4){
				this.verifyPassword(e, 4)
			}else if(this.payType == 5){
				this.verifyPassword(e, 5)
			}else if(this.payType == 99){
				// this.verifyPassword(e, 99)
				this.$emit('zfpwd', e)
				this.$emit('close', false)
			}else if(this.payType == 6){
				this.verifyPassword(e,6)
			}else if(this.payType == 7){
				this.verifyPassword(e,7)
			}else if(this.payType == 8){
				this.verifyPassword(e,8)
			}
		},
		/**
		 * 余额提现
		 * */
		balanceWithdrawal(e) {
			this.$http(
				'txBank',
				JSON.stringify({
					userid: this.userid,
					pwd: e,
					je: this.mentMoney*100
				})
			)
				.then(res => {
					console.log(res)
					if (res.data.status != 0) {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						})
						this.$emit('close', false)
						return false
					}
					uni.showToast({ title: res.data.msg })
					setTimeout(() => {
						uni.redirectTo({
							url: `/pages/finance/bill`
						})
					}, 2000)
				})
				.catch(err => {
					console.log(err)
				})
		},
		/**
		 * 验证密码
		 * */
		verifyPassword(e, type) {			
			this.$http(
				'userPwdCheck',
				JSON.stringify({
					userid: this.userid,
					pwd: e,
					bz: 'jymm'
				})
			)
				.then(res => {
					console.log(res)
					if (res.data.status == 0) {
						if (type == 2) {
							this.balanceWithdrawal(e)
						} else if(type == 3) {
							this.Transfer(e)
						}else if(type ==4){
							if(this.mentMoney==0){
								this.zerozf()
							}else{
								this.cpyuezf()
							}
						}else if(type ==5){
							this.hdyuezf()
						}else if(type ==6){
							this.groupzf()
						}else if(type ==7){
							
						}else if(type ==8){
							this.push_yhq()
						}
					}else if(res.data.status == 3){
						uni.showModal({
						    content: '失败：请先设置交易密码',
						    success: (e)=>{
						    	if(e.confirm){
						    		setTimeout(()=>{
						    			uni.redirectTo({
						    				url:"/pages/finance/transactionPassword"
						    			})
						    		}, 200)
						    	}
						    }
						});
						
						this.$emit('close', false)
					}else {
						uni.showToast({ title: res.data.msg, icon: 'none' })
						this.$emit('close', false)
					}
				})
				.catch(err => {
					console.log(err)
				})
		},
		/**
		 * 余额支付365
		 * */
		hdyuezf(){
			this.$http("hdDdAdd",
			JSON.stringify({
				userid: this.userid,
				hdid:this.hdid,
				num:this.nums
			}),).then(res=>{	
				console.log(res,77)
				if (res.data.status != 0) {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					});
					this.$emit('close', false)
				} else {
					this.$http("hdDdYezf",
					JSON.stringify({
						userid: this.userid,
						zfddid: res.data.para.zfddid
					}),).then(res=>{
						console.log(res,88)
						if (res.data.status == 0) {
							uni.showToast({ title: '支付成功' });
							setTimeout(() => {
								uni.redirectTo({
									url:'/pages/finance/bill',
								})										   											
							}, 1000)
							 this.$emit('close', false)
						}else{
							uni.showToast({
								title: res.data.msg,
								icon: 'none'
							})
							this.$emit('close', false)
						}							
					}).catch(err=>{
						console.log(err);
					})
				}
			}).catch(err=>{
				console.log(err);
			})
		},
		
		//zero pay
		zerozf(){
			this.$http("ddZeroZfBzc",
			JSON.stringify({
				userid: this.userid,
				yhqid: this.yhqid,
				ddid: this.ddid
			}),).then(res=>{	
				if(res.data.status==0){
					uni.showToast({ title: '支付成功' });
					setTimeout(() => {
						let web = '/pages/order/ddmx?state=4&ddid='+this.ddid
						uni.redirectTo({
							url:web
						})										   											
					}, 1000)
					 this.$emit('close', false)
				}else{
					uni.showToast({
						title: res.data.msg,
						icon: "none"
					})
					this.$emit('close', false)
				}
			}).catch(err=>{
				console.log(err);
			})
		},
		
		/**
		 * 余额购买饭
		 * */
		 cpyuezf(){
			 	this.$http("ddToZfBzc",
			 	JSON.stringify({
			 		userid: this.userid,
			 		ddid: this.ddid,
			 		yhqid: this.yhqid
			 	}),).then(res=>{	
					console.log(res,77)
			 		if(res.data.status==0){
			 			//支付
			 			this.$http("ddYezfBzc",
			 			JSON.stringify({
			 				userid:this.userid,
			 				zfddid: res.data.data_gl
			 			}),).then(res=>{
			 				console.log(res,66)
			 				if(res.data.status==0){
								uni.showToast({ title: '支付成功' });
			 					setTimeout(() => {
			 						let web = '/pages/order/ddmx?state=4&ddid='+this.ddid
			 						uni.redirectTo({
			 							url:web
			 						})										   											
			 					}, 1000)
								 this.$emit('close', false)
			 				}else{
			 					uni.showToast({
			 						title: res.data.msg,
			 						icon: "none"
			 					})
								this.$emit('close', false)
			 				}
			 			}).catch(err=>{
			 				console.log(err);
			 			})
			 			
			 		}else{
			 			uni.showToast({
			 				title: res.data.msg,
			 				icon: "none"
			 			})
						this.$emit('close', false)
			 		}
			 		
			 	}).catch(err=>{
			 		console.log(err);
			 	})
		 },
		/**
		 * 转赠
		 * */
		Transfer(e) {
			this.$http(
				'userYezz',
				JSON.stringify({
					userid: this.userid,
					bz: this.phoneno,
					pwd: e,
					dqye: this.mentMoney * 100
				})
			).then(res => {
				console.log(res)
				if (res.data.status == 0) {
					uni.showToast({ title: res.data.msg, icon: 'none' })
					setTimeout(() => {
						uni.redirectTo({
							url: `/pages/finance/bill`
						})
					}, 3000)
				} else {
					uni.showToast({ title: res.data.msg, icon: 'none' })
					this.$emit('close', false)
				}
			})
			.catch(err => {
				console.log(err)
			})
		},
		//支付接口
		zbpayment(e) {
			uni.request({
				url: 'https://pay.abillchen.top/zshm-pay-api/rmTech/orderPay',
				data: JSON.stringify({
					transferType: this.statusm,
					puserNo:uni.getStorageSync('puserNo'),
					payerAccount:uni.getStorageSync('account'),
					payeeAccount: "2000001020001010000003",
					orderNo:this.pono,
					amount: this.mentMoney,
					password: e
				}),
				header: {
					'content-type': 'application/json' //自定义请求头信息
				},
				method: 'POST',
				//dataType:'json',
				success: res => {
					console.log(res, 333)
					if (res.data.status != 0) {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						})
						this.close()
						// this.show=false
					} else {
						console.log(this.statusm, '查看状态')
						let zf = {
							zfje: this.mentMoney,
							statusm: this.statusm,
							xzpay: this.payType
						}
						uni.setStorage({
							key: 'zfDatas',
							data: zf
						})
						this.close()
						uni.navigateTo({
							url: '/pages/zbwallet/paymentSuccessful'
						})
					}
				}
			})
		},
		//提现接口
		zbWithdrawal(e) {
			uni.request({
				url: 'https://pay.abillchen.top/zshm-pay-api/rmt/rmtWithdrawBalance',
				data: JSON.stringify({
					mobile: this.userid,
					totalAmt: this.mentMoney,
					password: e
				}),
				header: {
					'content-type': 'application/json' //自定义请求头信息
				},
				method: 'POST',
				//dataType:'json',
				success: res => {
					console.log(res)
					if (res.data.status != 0) {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						})
						this.close()
						// this.show=false
					} else {
						let a ={
							zfje: this.mentMoney,
							statusm: this.statusm,
							xzpay: this.payType
						}
						uni.setStorage({
							key: 'zfDatas',
							data: this.mentMoney
						})
						this.close()
						uni.navigateTo({
							url: '/pages/zbwallet/paymentSuccessful'
						})
					}
				}
			})
		},
		
		//服务中心提现
		groupzf(){
			this.$http("groupMy",JSON.stringify({
				userid: this.userid
			})).then(res=>{
				if(res.data.status==0){
					let groupid = res.data.para.groupid
					
					this.$http(
						'groupZjtq',
						JSON.stringify({
							userid: this.userid,
							dqye: this.mentMoney * 100,
							groupid: groupid
						})
					)
						.then(res => {
							if (res.data.status == 0) {
								uni.showToast({ title: res.data.msg, icon: 'none' })
								setTimeout(() => {
									uni.redirectTo({
										url: `/pages/user/server`
									})
								}, 3000)
							} else {
								uni.showToast({ title: res.data.msg, icon: 'none' })
								this.$emit('close', false)
							}
						})
						.catch(err => {
							console.log(err)
						})
					
				 }else{
					 uni.showToast({
						icon: 'none',
						title: res.data.msg
					 })
					 
					 this.$emit('close', false)
				 }
			}).catch(err=>{
				console.log(err);
			})	
		},
		push_yhq(){
			this.$http("youHQtoUser",JSON.stringify({
					userid: this.phoneno,
					yhqid:this.yhqid,
					superid:this.userid
				})).then(res=>{
					uni.showToast({
						title: res.data.msg,
						icon: "none"
					})
					
					if(res.data.status==0){
						setTimeout(() => {
							uni.redirectTo({
								url:'/pages/user/yhq',
							})										   											
						}, 1000)
					}
					
					this.$emit('close', false)
				}).catch(err=>{
					console.log(err);
				}) 
		}
	}
}
</script>

<style scoped>
.type-1 {
	margin-bottom: 10rpx;
	font-size: 28rpx;
	font-family: PingFang SC, PingFang SC-Regular;
	font-weight: 400;
	text-align: center;
}
.source {
	font-size: 28rpx;
	font-family: PingFang SC, PingFang SC-Regular;
	font-weight: 400;
	color: #707070;
}
.balance {
	font-size: 28rpx;
	font-family: PingFang SC, PingFang SC-Bold;
	font-weight: 700;
	text-align: left;
	color: #222222;
}
.balance image {
	padding-top: 6rpx;
	width: 38rpx;
	height: 40rpx;
}
.type {
	display: flex;
	justify-content: space-between;
	margin-bottom: 50rpx;
}
.br {
	width: 560rpx;
	height: 1rpx;
	opacity: 1;
	background: #dddddd;
	margin: 50rpx auto;
}
.price {
	font-size: 72rpx;
	font-family: PingFang SC, PingFang SC-Heavy;
	font-weight: 500;
	text-align: center;
}
.back {
	z-index: 99999999999;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
}
.title {
	display: flex;
	text-align: center;
	margin-bottom: 50rpx;
}
.close-icon {
	margin-right: 15rpx;
}
.pay-box {
	opacity: 1;
	background: #ffffff;
	border: 1rpx solid #707070;
	border-radius: 20rpx;
	padding: 50rpx 30rpx;
	margin: 200rpx 65rpx;
}
.title-text {
	text-align: center;
}
/deep/ .u-box.u-char-item {
	margin-right: 16rpx !important;
}
</style>
