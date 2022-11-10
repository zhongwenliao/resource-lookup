<template>
	<view class="eggMarketList" :style="eggUserList.length < 2 ? 'height: calc(100vh - 60px);' : ''">
		<block v-if="eggUserList.length > 0">
			<block v-for="(item, index) in eggUserList" :key="index">
				<view class="eggMarketList_egg">
					<view class="egg_odd egg_comm">
						<text>单号: {{item.marketID}}</text>
						<text>时间: {{item.inputTime}}</text>
					</view>
					<view class="egg_user egg_comm">
						<text>用户: {{item.userid}}</text>
						<text>结算: {{item.channelName}}</text>
					</view>
					<view class="egg_user egg_comm">
						<text>价格: {{item.eggPrice}}</text>
						<text>数量: {{item.eggNum}}</text>
					</view>
					<view class="egg_user egg_comm">
						<text>服务费: {{item.feeMoney}}</text>
						<text>总价: {{item.eggMoney}}</text>
					</view>
					
					<view class="egg_user egg_comm">
						<text>状态: {{item.statusName}}</text>
						<text>挂单类型: {{item.typeName}}</text>
					</view>
					<view class="egg_user egg_comm">
						<text v-if="item.useridDone != ''">接单用户: {{item.useridDone}}</text>
					</view>
					
					<view v-if="item.channel == 2" style="font-size: 30rpx;">
						<view class="egg_remark" v-if="item.uname" @click="cardnumClick(item.uname)">
							<text>收款人: {{item.uname}}</text>
						</view>
						<view class="egg_user1">
							<view class="egg_user1_text">微信收款码: </view>
							<view style="width: 220rpx;" @click="checkQiniuImage(item.receiveUrl)">
								<image style="width: 100%; height: 100%;" :src="item.receiveUrl"></image>
							</view>
						</view>
						<view class="egg_remark" v-if="item.mobile" @click="cardMobileClick(item.mobile)">
							<text>手机号码: {{item.mobile}}</text>
						</view>
					</view>
					
					<view v-if="item.channel == 3" style="font-size: 30rpx;">
						<view class="egg_remark" v-if="item.uname" @click="cardnumClick(item.uname)">
							<text>收款人: {{item.uname}}</text>
						</view>
						<view class="egg_remark" v-if="item.cardnum" @click="cardnumClick(item.cardnum)">
							<text>支付宝: {{item.cardnum}}</text>
						</view>
						<view class="egg_user1">
							<view class="egg_user1_text">支付宝收款码: </view>
							<view style="width: 220rpx;" @click="checkQiniuImage(item.receiveUrl)">
								<image style="width: 100%; height: 100%;" :src="item.receiveUrl"></image>
							</view>
						</view>
						<view class="egg_remark" v-if="item.mobile" @click="cardMobileClick(item.mobile)">
							<text>手机号码: {{item.mobile}}</text>
						</view>
					</view>
					
					<view v-if="item.channel == 4" style="font-size: 30rpx;">
						<view class="egg_remark" v-if="item.uname" @click="cardnumClick(item.uname)">
							<text>收款人: {{item.uname}}</text>
						</view>
						<view class="egg_remark" v-if="item.cardnum" @click="cardnumClick(item.cardnum)">
							<text>银行卡号: {{item.cardnum}}</text>
						</view>
						<view class="egg_remark" v-if="item.mobile" @click="cardMobileClick(item.mobile)">
							<text>手机号码: {{item.mobile}}</text>
						</view>
					</view>
					
					<view class="egg_user1" v-if="item.marketStatus > 2">
						<view class="egg_user1_text">支付截图: </view>
						<view style="width: 220rpx;" @click="checkQiniuImage(item.payImgUrl)">
							<image style="width: 100%; height: 100%;" :src="item.payImgUrl"></image>
						</view>
					</view>
					
					<view class="egg_user1" v-if="(item.marketStatus == 2 && item.marketType == 1 && item.userid == eggUser) || 
					(item.marketStatus == 2 && item.marketType == 2 && item.useridDone == eggUser)">
						<view class="egg_user1_text">支付截图: </view>
						<view v-if="item.payImgUrl == ''" @click="qiniuImage(item.marketID)">上传支付截图</view>
						<view v-else style="width: 220rpx;" @click="checkQiniuImage(item.payImgUrl)">
							<image style="width: 100%; height: 100%;" :src="item.payImgUrl"></image>
						</view>
					</view>
					
					<view class="egg_remark" v-if="item.remark != ''">
						<view>备注: </view>
						<view>{{item.remark}}</view>
					</view>
					
					<block v-if="item.marketStatus == 1">
						<button class="add-btn revoke" @click="eggUserConfirm('revoke', item.marketID)">撤 单</button>
					</block>

					<block v-if="(item.marketStatus == 2 && item.marketType == 1 && item.userid == eggUser) || 
					(item.marketStatus == 2 && item.marketType == 2 && item.useridDone == eggUser)">
						<button class="add-btn ymcode_ml" @click="eggUserConfirm('payment', item.marketID, item.payImgUrl)">
							付款已确认<block v-if="item.expSecond != 86400 && item.expSecond != 0">（<uni-countdown :show-day="false" color="#FFFFFF" :second="item.expSecond"  @timeup="timeup(index)" />）</block>
							</button>
						<button class="add-btn revoke" @click="eggMarketCancle(item.marketID)">取消订单</button>
					</block>
					
					<block v-if="(item.marketStatus == 3 && item.marketType == 1 && item.useridDone == eggUser) || 
					(item.marketStatus == 3 && item.marketType == 2 && item.userid == eggUser)">
						<button class="add-btn ymcode_ml" @click="eggUserConfirm('proceeds', item.marketID)">
							收款已确认<block v-if="item.expSecond != 86400 && item.expSecond != 0">（<uni-countdown :show-day="false" color="#FFFFFF" :second="item.expSecond" @timeup="timeup(index)" />）</block>
						</button>
						<button class="add-btn revoke" @click="complain(item.marketID)">申 诉</button>
					</block>
					
		<!-- 			<block v-if="(item.marketStatus == 2 && item.marketType == 1 && item.useridDone == eggUser) || 
					(item.marketStatus == 2 && item.marketType == 2 && item.userid == eggUser)">
						<button class="add-btn overtime" @click="eggUserConfirm('overtime', item.marketID)">超时</button>
					</block> -->
				</view>
			</block>
		</block>
		
		<uni-load-more :status="statusLoadMore" :content-text="contentText" />
		
		<uni-popup ref="popup" :is-mask-click="false" background-color="#ffffff">
			<view class="popup-content">
				<view class="popup-title">交易密码</view>
				<input class="popup_index" type="password" v-model="dealPassword" placeholder="请输入交易密码" maxlength="6" />
				<view style="font-size: 25upx;padding: 20upx 57upx 0;">{{skqrsm}}</view>
				<view class="state_view">
					<view class="cancel" @click="cancelClick">取消</view>
					<view class="confirm ymcode_ml" @click="confirmClick">确定</view>
				</view>
			</view>
		</uni-popup>
		
		<uni-popup ref="popup1" :is-mask-click="false" background-color="#ffffff">
			<view class="popup-content1">
				<view class="popup-title1">申诉内容</view>
				<textarea class="popup_index1" v-model="complainText" placeholder="请输入申诉内容" maxlength="100" />
				<view class="state_view1">
					<view class="cancel1" @click="complainelClick">取消</view>
					<view class="confirm1 ymcode_ml" @click="complainrmClick">确定</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
export default {
	props: {
		current: {
			type: Number
		},
		pages: {
			type: Number,
			default: 0
		},
		statusLoadMore: {
			type: String,
			default: 'more'
		},
		contentText: Object
	},
	watch: {
		pages: {
			handler(val) {
				this.__init()
			}
		}
	},
	data() {
		return{
			eggUserList: [],
			eggUser: uni.getStorageSync("userid"),
			
			// 交易密码
			dealPassword: '',
			// 申诉内容
			complainText: '',
			// 收款说明
			skqrsm: ''
		}
	},
	mounted(){
		this.__init();
	},
	methods: {
		__init(){
			if (this.current != 2) return;
			this.$http("eggMarketListUser", JSON.stringify({
				token: uni.getStorageSync("token"),
				pg: this.pages
			})).then(res => {
				if (res.data.code == 0) {
					this.eggUserList = [...this.eggUserList, ...res.data.marketList.datas];

					this.$emit("marketUserInfo", res.data.marketList.pgInfo)
				} else if(res.data.code == 99){
					uni.showModal({
						content: "请先登录",
						success: (e)=>{
							if(e.confirm){
								uni.clearStorage();				    		
								setTimeout(()=>{
									uni.redirectTo({
										url: "/pages/public/login"
									})
								}, 200)
							}
						}
					});
				} else {
					uni.showToast({title:res.data.msg,icon:'none'});
				}
			})
		},
		__initRevoke(marketID){
	 		this.$http("eggMarketWithdraw", JSON.stringify({
				token: uni.getStorageSync("token"),
				marketID: marketID
			})).then(res => {
				if(res.data.code == 0){
					this.$emit("marketUserIndex", this.current)
					
					this.eggUserList.forEach(item => {
						if (item.marketID == marketID) {
							item.marketStatus = -1
							item.statusName = '用户撤回'
						}
					});
				} else if(res.data.code==99){
					uni.showModal({
					    content: "请先登录",
					    success: (e)=>{
					    	if(e.confirm){
								uni.clearStorage();				    		
					    		setTimeout(()=>{
					    			uni.redirectTo({
					    				url: "/pages/public/login"
					    			})
					    		}, 200)
					    	}
					    }
					});
				} else {
					uni.showToast({title:res.data.msg,icon:'none'})
				}
			}).catch(err => {
				console.log(err);
			})
		},
		__initPayment(marketID, payImgUrl){
			if(payImgUrl == ''){
				uni.showToast({
					title: '请上传支付截图', 
					icon:'none',
				});
				
				return
			}
			
			this.$http("appTxtGet", JSON.stringify({
				token: uni.getStorageSync("token"),
				txtID: 'GDFKSM'
			})).then(res => {
				if (res.data.code == 0) {
					var that = this;
					
					uni.showModal({
						title: '提示',
						content: res.data.txtInfo.txt,
						success: function (res) {
							if (res.confirm) {
								that.$http("eggMarketPayOK", JSON.stringify({
									token: uni.getStorageSync("token"),
									payImgUrl: payImgUrl,
									marketID: marketID
								})).then(res => {
									if (res.data.code == 0) {
										that.eggUserList.forEach(item => {
											if (item.marketID == marketID) {
												item.marketStatus = 3
												item.statusName = '付款已确认'
											}
										});
									} else if(res.data.code == 99){
										uni.showModal({
										    content: "请先登录",
										    success: (e)=>{
										    	if(e.confirm){
													uni.clearStorage();				    		
										    		setTimeout(()=>{
										    			uni.redirectTo({
										    				url: "/pages/public/login"
										    			})
										    		}, 200)
										    	}
										    }
										});
									} else {
										uni.showToast({title:res.data.msg, icon:'none'});
									}
								}).catch(err => {
									console.log(err);
								})
							}
						}
					});
				} else {
					uni.showToast({ title: res.data.msg, icon: 'none'});
				}
			}).catch(err => {
				console.log(err);
			})
		},
		__initProceeds(){
			this.$http("eggMarketCashinOK", JSON.stringify({
				token: uni.getStorageSync("token"),
				marketID: this.eggCashinMarketID
			})).then(res => {
				if (res.data.code == 0) {
					this.eggUserList.forEach(item => {
						if (item.marketID == this.eggCashinMarketID) {
							item.marketStatus = 4
							item.statusName = '收款已确认'
						}
					});
				} else if(res.data.code == 99){
					uni.showModal({
					    content: "请先登录",
					    success: (e)=>{
					    	if(e.confirm){
								uni.clearStorage();				    		
					    		setTimeout(()=>{
					    			uni.redirectTo({
					    				url: "/pages/public/login"
					    			})
					    		}, 200)
					    	}
					    }
					});
				} else {
					uni.showToast({title:res.data.msg,icon:'none'});
				}
			})
		},
		__initOvertime(marketID){
			this.$http("eggMarketOverTime", JSON.stringify({
				token: uni.getStorageSync("token"),
				marketID: marketID
			})).then(res => {
				if(res.data.code == 0){
					this.$emit("marketUserIndex", this.current)
					
					this.eggUserList.forEach(item => {
						if (item.marketID == marketID) {
							item.marketStatus = -2;
							item.statusName = '超时撤回';
						}
					});
				} else if(res.data.code==99){
					uni.showModal({
					    content: "请先登录",
					    success: (e)=>{
					    	if(e.confirm){
								uni.clearStorage();				    		
					    		setTimeout(()=>{
					    			uni.redirectTo({
					    				url: "/pages/public/login"
					    			})
					    		}, 200)
					    	}
					    }
					});
				} else {
					uni.showToast({title:res.data.msg,icon:'none'});
				}
			}).catch(err => {
				console.log(err);
			})
		},
		eggUserConfirm(eggStatus, marketID, payImgUrl){
			switch(eggStatus) {
				case 'revoke':
					this.__initRevoke(marketID)
				break;
				case 'payment':
					this.__initPayment(marketID, payImgUrl)
				break;
				case 'proceeds':
					this.eggCashinMarketID = marketID
					this.userPwdMoneyExists()
				break;
				case 'overtime':
					this.__initOvertime(marketID)
				break;
			}
		},
		// 取消订单
		eggMarketCancle(marketID){
			this.$http("appTxtGet", JSON.stringify({
				token: uni.getStorageSync("token"),
				txtID: 'GDQXSM'
			})).then(res => {
				if (res.data.code == 0) {
					var that = this
					
					uni.showModal({
						title: '提示',
						content: res.data.txtInfo.txt,
						success: function (res) {
							if (res.confirm) {
								that.$http("eggMarketCancle", JSON.stringify({
									token: uni.getStorageSync("token"),
									marketID: marketID
								})).then(res => {
									if(res.data.code == 0){
										that.eggUserList.forEach(item => {
											if (item.marketID == marketID) {
												item.marketStatus = 1;
												item.statusName = '待交易';
											}
										});
									} else {
										uni.showToast({title:res.data.msg,icon:'none'});
									}
								}).catch(err => {
									console.log(err);
								})
							}
						}
					})
				} else {
					uni.showToast({ title: res.data.msg, icon: 'none'});
				}
			})
		},
		// 申诉窗口
		complain(complainMarketID){
			this.complainMarketID = complainMarketID
			this.$refs.popup1.open('center')
		},
		// 取消申诉
		complainelClick(){
			this.complainText = ''
			this.$refs.popup1.close()
		},
		// 确认申诉
		complainrmClick(){
			this.$http("eggMarketAppeal", JSON.stringify({
				token: uni.getStorageSync("token"),
				marketID: this.complainMarketID,
				appealTxt: this.complainText
			})).then(res => {
				if(res.data.code == 0){
					this.$refs.popup1.close()
					
					this.eggUserList.forEach(item => {
						if (item.marketID == this.complainMarketID) {
							item.marketStatus = -3;
							item.statusName = '申诉';
						}
					});
				} else if(res.data.code==99){
					uni.showModal({
					    content: "请先登录",
					    success: (e)=>{
					    	if(e.confirm){
								uni.clearStorage();				    		
					    		setTimeout(()=>{
					    			uni.redirectTo({
					    				url: "/pages/public/login"
					    			})
					    		}, 200)
					    	}
					    }
					});
				} else {
					uni.showToast({title:res.data.msg,icon:'none'});
				}
			}).catch(err => {
				console.log(err);
			})
		},
		// 复制内容
		cardnumClick(cardnum){
			uni.setClipboardData({
				data: cardnum
			});
		},
		// 拨打电话
		cardMobileClick(phone){
			uni.makePhoneCall({
				phoneNumber: phone.replace(/\D/g,'').replace(/^/,'$& ').replace(/....(?!$)/g,'$& ')
			});
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
					this.$refs.popup.open('center')
					
					this.$http("appTxtGet", JSON.stringify({
						token: uni.getStorageSync("token"),
						txtID: 'SKQRSM'
					})).then(res => {
						if (res.data.code == 0) {
							this.skqrsm = res.data.txtInfo.txt
						}
					})
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
					
					this.__initProceeds()
				} else {
					uni.showToast({title:res.data.msg,icon:'none'});
				}
			}).catch(err=>{
				console.log(err);
			})
		},
		// 上传图片到七牛
		qiniuImage(marketID){
			uni.chooseImage({
				count: 1, //默认9
				sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
				sourceType: ['camera', 'album'], //从相册选择
				success: (res) => {
					let tempFilePaths = res.tempFilePaths;
					this.showImg = res.tempFilePaths[0];
					
					this.$http("qiNiuToken", JSON.stringify({
						token: uni.getStorageSync("token")
					})).then(res => {
						uni.uploadFile({
							url: 'https://upload.qiniup.com',
							filePath: tempFilePaths[0],
							name: 'file',
							formData: {
								'token': res.data.para.upToken
							},
							success: (uploadFileRes) => {
								var jsondata = JSON.parse(uploadFileRes.data);
								
								this.eggUserList.forEach(item => {
									if (item.marketID == marketID) {
										item.payImgUrl = 'http://zddimages.abillchen.top/' + jsondata.hash
									}
								});
							}
						})
					})
				}
			})
		},
		// 预览图片 和 长按保存图片到相册
		checkQiniuImage(qnImageUrl){
			let array = [];
			array.push(qnImageUrl);
			uni.previewImage({
				urls: array,
				current: array[0],
				longPressActions: {  //长按保存图片到相册
					itemList: ['保存图片'],
					success: (data)=> {
						uni.saveImageToPhotosAlbum({ //保存图片到相册
							filePath: payUrl,
							success: function () {
								uni.showToast({icon:'success',title:'保存成功'})
							},
							fail: (err) => {
								uni.showToast({icon:'none',title:'保存失败，请重新尝试'})
							}
						});
					},
					fail: (err)=> {
						console.log(err.errMsg);
					}
				}
			});
		},
		timeup(index) {
			this.eggUserList[index].expSecond = 0;
		}
	}
}
</script>

<style scoped lang="scss">
// 公共
.egg_comm{
	display: flex;
	
	text{
		width: 50%;
	}
}
.eggMarketList_egg{
	background: #FFFFFF;
	border: 1rpx solid #E5E5E5;
	padding: 30rpx 20rpx;
	border-radius: 10rpx;
	margin-top: 10rpx;
}
.egg_odd{
	font-size: 26rpx;
}
.egg_user{
	font-size: 30rpx;
	padding-top: 14rpx;
}

.egg_user1{
	font-size: 30rpx;
	padding-top: 14rpx;
	height: 50rpx;
	display: flex;
	
	.egg_user1_text{ margin-right: 10rpx;}
	view:nth-child(2){ color: #5500ff;}
}

.egg_remark{
	display: flex;
	padding-top: 16rpx;
	
	view:nth-child(1){
		width: 90rpx;
		font-size: 32rpx;
	}
	
	view:nth-child(2){
		width: 100%;
		font-size: 30rpx;
	}
}

.add-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 660upx;
	height: 80upx;
	margin: 30rpx auto 0;
	font-size: 32rpx;
	color: #FFFFFF;
	border-radius: 10upx;

}
.revoke{
	background-color: #ca0000;
}
.overtime{
	background-color: #FD7031;
}
</style>
