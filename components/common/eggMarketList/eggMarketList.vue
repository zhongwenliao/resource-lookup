<template>
	<view class="eggMarketList" :style="eggClientList.length < 3 ? 'height: calc(100vh - 60px);' : ''">
		<block v-if="eggClientList.length > 0">
			<block v-for="(item, index) in eggClientList" :key="index">
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
					<view v-if="item.channel == 2">
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
					<view v-if="item.channel == 3">
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
					<view v-if="item.channel == 4">
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
					<view class="egg_remark" v-if="item.remark">
						<view>备注: </view>
						<view class="">{{item.remark}}</view>
					</view>

					<block v-if="item.typeName == '卖单'">
						<button class="add-btn ymcode_ml" @click="eggClient(item.marketID)">买 入</button>
					</block>
					<block v-if="item.typeName == '买单'">
						<button class="add-btn ymcode_ml" @click="eggClient(item.marketID)">卖 出</button>
					</block>
				</view>
			</block>
		</block>
		<uni-load-more :status="statusLoadMore" :content-text="contentText" />
	</view>
</template>

<script>
export default {
	props: {
		marketType: {
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
				this.__init();
			}
		}
	},
	data() {
		return {
			eggClientList: []
		}
	},
	mounted(){
		this.__init()
	},
	methods:{
		__init(){
			this.$http("eggMarketListClient", JSON.stringify({
				marketType: this.marketType,
				token: uni.getStorageSync("token"),
				pg: this.pages
			})).then(res => {
				if (res.data.code == 0) {
					this.eggClientList = [...this.eggClientList, ...res.data.marketList.datas]
					
					this.$emit("eggClientInfo", res.data.marketList.pgInfo)
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
		eggClient(marketID){
			this.$http("eggMarketAccept", JSON.stringify({
				token: uni.getStorageSync("token"),
				marketID: marketID
			})).then(res => {
				if (res.data.code == 0) {
					let topBarIndex = 2;
					this.$emit("marketListIndex", topBarIndex)
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
			}).catch(err => {
				console.log(err);
			})
		}
	}
}
</script>

<style scoped lang="scss">
// 公共
.egg_comm{
	display: flex;
	justify-content: space-between;
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

.egg_remark{
	display: flex;
	padding-top: 16rpx;
	font-size: 30rpx;

	view:nth-child(1){
		width: 90rpx;
	}
	
	view:nth-child(2){
		width: 100%;
	}
}
.egg_user1{
	font-size: 30rpx;
	padding-top: 14rpx;
	height: 50rpx;
	display: flex;
	
	.egg_user1_text{ margin-right: 10rpx;}
	view:nth-child(2){ color: #5500ff;}
}
.add-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 660upx;
	height: 80upx;
	margin: 40rpx auto 0;
	font-size: 32rpx;
	color: #FFFFFF;
	border-radius: 10upx;
}
</style>
