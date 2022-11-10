<template>
	<view class="content b-t">
		<block v-if="wxInfo.mobile">
			<view class="u-box1">微信</view>
			<view class="wrapper">
				<view class="bank_box">
					<image src="../../static/bank/wxImage.jpeg" mode=""></image>
				</view>
				<view class="bank_view">
					<view class="u-box">
						<text>姓名：</text>
						<text @click="bankClick(wxInfo.uname)">{{wxInfo.uname}}</text>
					</view>
					<view class="u-box">
						<text>手机号码：</text>
						<text @click="mobileClick(wxInfo.mobile)">{{wxInfo.mobile}}</text>
					</view>
					<view class="u-box2" @click="remarkClick(wxInfo.remark)">
						<text>微信收款码</text>
						<uni-icons type="right" size="18"></uni-icons>
					</view>
				</view>
			</view>
		</block>
		<block v-if="zfbInfo.cardnum">
			<view class="u-box1">支付宝</view>
			<view class="wrapper">
				<view class="bank_box">
					<image src="../../static/bank/zfb.jpeg" mode=""></image>
				</view>
				<view class="bank_view">
					<view class="u-box">
						<text>姓名：</text>
						<text @click="bankClick(zfbInfo.uname)">{{zfbInfo.uname}}</text>
					</view>
					<view class="u-box">
						<text>支付宝账号：</text>
						<text @click="bankClick(zfbInfo.cardnum)">{{zfbInfo.cardnum}}</text>
					</view>
					<view class="u-box">
						<text>手机号码：</text>
						<text @click="mobileClick(zfbInfo.mobile)">{{zfbInfo.mobile}}</text>
					</view>
					<view class="u-box2" @click="remarkClick(zfbInfo.remark)">
						<text>支付宝收款码</text>
						<uni-icons type="right" size="18"></uni-icons>
					</view>
				</view>
			</view>
		</block>
		<block v-if="bankInfo.cardnum">
			<view class="u-box1">银行卡</view>
			<view class="wrapper">
				<view class="bank_box">
					<image src="../../static/bank/snipaste.png" mode=""></image>
				</view>
				<view class="bank_view">
					<view class="u-box">
						<text>姓名：</text>
						<text @click="bankClick(bankInfo.uname)">{{bankInfo.uname}}</text>
					</view>
					<view class="u-box">
						<text>银行卡号：</text>
						<text @click="bankClick(bankInfo.cardnum)">{{bankInfo.cardnum}}</text>
					</view>
					<view class="u-box">
						<text>手机号码：</text>
						<text @click="mobileClick(bankInfo.mobile)">{{bankInfo.mobile}}</text>
					</view>
				</view>
			</view>
		</block>
		
		<button class="add-btn ymcode_ml" @click="addAddress">收款方式</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				source: 0,
				addressList: [],
				bankInfo:{},
				wxInfo: {},
				zfbInfo: {}
			}
		},
		onLoad(option){
			this.userWxInfo();
			this.userZfbInfo();
			this.userBankInfo();
		},
		methods: {
			addAddress(){
				uni.navigateTo({
					url: '/pages/bank/create'
				})
			},
			userBankInfo(){
				this.$http("userBankInfo", JSON.stringify({
					token: uni.getStorageSync("token")
				})).then(res=>{	
					if(res.data.code == 0){
						this.bankInfo = res.data.bankInfo;					
					}else if (res.data.code == 99) {
						this.userLog()
					}else{
						if(res.data.code != 4){
							uni.showToast({ title: res.data.msg, icon: 'none'});
						}
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			userZfbInfo(){
				this.$http("userZfbInfo", JSON.stringify({
					token: uni.getStorageSync("token")
				})).then(res=>{	
					if(res.data.code == 0){
						uni.hideLoading();
						this.zfbInfo = res.data.zfbInfo;					
					}else if (res.data.code == 99) {
						this.userLog()
					}else{
						if(res.data.code != 4){
							uni.showToast({ title: res.data.msg, icon: 'none'});
						}
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			userWxInfo(){
				this.$http("userWxInfo", JSON.stringify({
					token: uni.getStorageSync("token")
				})).then(res=>{	
					if(res.data.code == 0){
						uni.hideLoading();
						this.wxInfo = res.data.wxInfo;					
					}else if (res.data.code == 99) {
						this.userLog()
					}else{
						if(res.data.code != 4){
							uni.showToast({ title: res.data.msg, icon: 'none'});
						}
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			bankClick(title){
				uni.setClipboardData({
					data: title
				});
			},
			mobileClick(mobile){
				uni.makePhoneCall({
					phoneNumber: mobile.replace(/\D/g,'').replace(/^/,'$& ').replace(/....(?!$)/g,'$& ')
				});
			},
			remarkClick(imageUrl){
				let array = [];
				array.push(imageUrl);
				
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
			userLog(){
				uni.clearStorage();
				setTimeout(() => {
					uni.redirectTo({
						url: "../public/login"
					})
				}, 200)
			}
		}
	}
</script>

<style scoped lang='scss'>
.list{
	display: flex;
	align-items: center;
	padding: 20upx 30upx;;
	background: #fff;
	position: relative;
}
.u-box1{
	font-size: 30upx;
	margin: 20upx;
	font-weight: 600;
}
.wrapper{
	margin: 20upx;
	border: 1upx solid #E5E5E5;
	border-radius: 10upx;
	padding: 20upx;
	display: flex;
	align-items: center;
}
.bank_box{
	width: 125upx;
	height: 80upx;
	image{
		width: 100%;
		height: 100%;
		border-radius: 10upx;
	}
}
.bank_view{
	width: 100%;
	padding-left: 20upx;
}
.u-box{
	font-size: 28upx;
}
.u-box2{
	font-size: 28upx;
	display: flex;
	justify-content: space-between;
}
.u-box:nth-child(2){
	padding: 10upx 0;
}
.u-box:nth-child(3){
	padding-bottom: 10upx;
}
	
page{
	padding-bottom: 120upx;
}

.add-btn{
	position: fixed;
	left: 30upx;
	right: 30upx;
	bottom: 16upx;
	z-index: 95;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 690upx;
	height: 80upx;
	font-size: 32upx;
	color: #fff;
	border-radius: 10upx;
}
</style>
