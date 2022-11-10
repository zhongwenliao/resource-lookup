<template>
	<view class="eggMarketAdd">
		<view class="eggMarketAdd_item b-b">
			<text class="item_texe">鸡蛋价格</text>
			<input v-if="cfgValue != 0" class="item_input" v-model="formData.eggPrice" disabled/>
			<input v-else class="item_input" type="text" v-model="formData.eggPrice" placeholder="请输入鸡蛋价格" maxlength="16"/>
		</view>
		
		<view class="eggMarketAdd_item b-b">
			<text class="item_texe">鸡蛋数量</text>
			<input class="item_input" type="number" v-model="formData.eggNum" placeholder="请输入鸡蛋数量" placeholder-class="placeholder" maxlength="16"/>
		</view>
		
		<view class="eggMarketAdd_item b-b">
			<text class="item_texe">挂单类型</text>
			<hpy-form-select class="hpy-form-select" :dataList="eggMarketType" text="selectTxt" name="selectValue" v-model="formData.marketType" />
		</view>
		
		<view class="eggMarketAdd_item b-b">
			<text class="item_texe">结算方式</text>
			<hpy-form-select class="hpy-form-select" :dataList="eggMarketPay" text="selectTxt" name="selectValue" v-model="formData.channel" @change="change" />
		</view>
		
		<view class="eggMarketAdd_item b-b" v-if="numPay == 2">
			<text class="item_texe">微信信息</text>
			<view style="font-size: 30rpx;">
				<view style="padding-bottom: 10rpx;">
					<text>{{wxInfo.uname}}</text>
					<text style="padding-left: 10rpx;">{{wxInfo.mobile}}</text>
				</view>
			</view>
		</view>
		
		<view class="eggMarketAdd_item b-b" v-if="numPay == 3">
			<text class="item_texe">支付宝信息</text>
			<view style="font-size: 30rpx;">
				<view style="padding-bottom: 10rpx;">
					<text>{{zfbInfo.uname}}</text>
					<text style="padding-left: 10rpx;">{{zfbInfo.mobile}}</text>
				</view>
				<view class="">{{zfbInfo.cardnum}}</view>
			</view>
		</view>
		
		<view class="eggMarketAdd_item b-b" v-if="numPay == 4">
			<text class="item_texe">银行卡信息</text>
			<view style="font-size: 30rpx;">
				<view style="padding-bottom: 10rpx;">
					<text>{{bankInfo.uname}}</text>
					<text style="padding-left: 10rpx;">{{bankInfo.mobile}}</text>
				</view>
				<view class="">{{bankInfo.cardnum}}</view>
			</view>
		</view>
		
		<view class="eggMarketAdd_textarea b-b">
			<text class="item_texe">备注</text>
			<textarea class="item_textarea" placeholder-style="font-size: 30rpx" v-model="formData.remark" placeholder="请输入备注(选填)" maxlength="80" />
		</view>
		
		<button class="add-btn ymcode_ml" @click="eggAddConfirm">提交</button>
	</view>
</template>

<script>
export default{
	data(){
		return{
			bankInfo:{},
			wxInfo: {},
			zfbInfo: {},
			// 提交的数据
			formData:{
				channel: '',
                eggNum: '',
                eggPrice: '',
                marketType: '',
                remark: ''
			},
			eggMarketType: [],
			eggMarketPay: [],
			isShows: false,
			// 鸡蛋价格 0:用户自己输入，非零显示蛋价并锁定
			cfgValue: '',
			numPay: 0, //结算方式
			numPayEgg: false
		}
	},
	mounted(){
		this.systemCfgInfoClient()
		this.__initType()
		this.__initPay()
	},
	methods: {
		systemCfgInfoClient(){
			this.$http("systemCfgInfoClient", JSON.stringify({
				token: uni.getStorageSync("token"),
				cfgKey: 'eggPriceLock'
			})).then(res => {
				if (res.data.code != 0) {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					});
				} else {
					this.cfgValue = res.data.systemCfgInfo.cfgValue;
					
					if(this.cfgValue != 0){
						this.formData.eggPrice = this.cfgValue
					}
				}
			}).catch(err => {
				console.log(err);
			})
		},
		__initType(){
			this.$http("selectItemList", JSON.stringify({
				token: uni.getStorageSync("token"),
				tag: 'marketType'
			})).then(res => {
				if (res.data.code == 0) {
					this.eggMarketType = res.data.itemList
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
		__initPay(){
			this.$http("selectItemList", JSON.stringify({
				token: uni.getStorageSync("token"),
				tag: 'marketPay'
			})).then(res => {
				if (res.data.code == 0) {
					this.eggMarketPay= res.data.itemList
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
		change(e){
			this.numPay = e.value
			
			if(e.value == 2){
				this.userWxInfo()
			} else if(e.value == 3){
				this.userZfbInfo()
			} else if(e.value == 4){
				this.userBankInfo()
			}
		},
		userZfbInfo(){
			this.$http("userZfbInfo", JSON.stringify({
				token: uni.getStorageSync("token")
			})).then(res=>{	
				if (res.data.code == 0) {
					this.zfbInfo = res.data.zfbInfo;
					this.isShows = false
				} else {
					this.isShows = true
					
					uni.showModal({
					    content: "还没有添加支付宝信息,请先添加支付宝信息",
						showCancel: false,
					    success: (e)=>{
					    	if(e.confirm){		    		
					    		setTimeout(()=>{
					    			uni.navigateTo({
					    				url: "/pages/bank/list"
					    			})
					    		}, 200)
					    	}
					    }
					});
				}
			}).catch(err=>{
				console.log(err);
			})
		},
		userWxInfo(){
			this.$http("userWxInfo", JSON.stringify({
				token: uni.getStorageSync("token")
			})).then(res=>{	
				if (res.data.code == 0) {
					this.wxInfo = res.data.wxInfo;	
					this.isShows = false
				} else {
					this.isShows = true
					
					uni.showModal({
					    content: "还没有添加微信信息,请先添加微信信息",
						showCancel: false,
					    success: (e)=>{
					    	if(e.confirm){		    		
					    		setTimeout(()=>{
					    			uni.navigateTo({
					    				url: "/pages/bank/list"
					    			})
					    		}, 200)
					    	}
					    }
					});
				}
				
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
		userBankInfo(){
			this.$http("userBankInfo", JSON.stringify({
				token: uni.getStorageSync("token")
			})).then(res => {
				if (res.data.code == 0) {
					this.bankInfo= res.data.bankInfo
					this.isShows = false
				} else {
					this.isShows = true
					
					uni.showModal({
					    content: "还没有添加银行卡信息,请先添加银行卡信息",
						showCancel: false,
					    success: (e)=>{
					    	if(e.confirm){		    		
					    		setTimeout(()=>{
					    			uni.navigateTo({
					    				url: "/pages/bank/list"
					    			})
					    		}, 200)
					    	}
					    }
					});
				}
			}).catch(err => {
				console.log(err);
			})
		},
		eggAddConfirm() {
			let priceRes = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/
			
			if(!priceRes.test(this.formData.eggPrice)){
				uni.showToast({
					icon: 'none',
					title: '请输入正确的鸡蛋价格,最多两位小数'
				});
				return
			}
			
			if(this.numPay == 2){
				if(this.isShows == true){
					this.userWxInfo()
					return
				}
			} else if(this.numPay == 3){
				if(this.isShows == true){
					this.userZfbInfo()
					return
				}
			} else if(this.numPay == 4){
				if(this.isShows == true){
					this.userBankInfo()
					return
				}
			}

			this.$http("eggMarketAdd", JSON.stringify({
				token: uni.getStorageSync("token"),
				channel: this.formData.channel,
                eggNum: this.formData.eggNum,
                eggPrice: this.formData.eggPrice,
                marketType: this.formData.marketType,
                remark: this.formData.remark
			})).then(res => {
				if(res.data.code == 0){
					let current = 2
					this.$emit("marketAddIndex", current)
					this.formData = {}
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
				}else{
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
.addressAdd{
	padding: 0 20rpx;
}
.eggMarketAdd_item {
	display: flex;
	align-items: center;
	position: relative;
	padding-left: 10rpx;
	height: 110upx;
	background: #FFFFFF;

	.item_texe {
		flex-shrink: 0;
		width: 180upx;
		font-size: 32upx;
		color: #303133;
	}

	.item_input {
		flex: 1;
		font-size: 32upx;
		color: #303133;
		height: 40rpx;
	}

	.icon-shouhuodizhi {
		font-size: 32upx;
		color: #303133;
	}
}
.eggMarketAdd_item:nth-child(2n){
	border-top: 1rpx solid #e5e5e5;
	border-bottom: 1rpx solid #e5e5e5;
}

.hpy-form-select{
	font-size: 32rpx;
	width: 510rpx;
}

.eggMarketAdd_textarea{
	display: flex;
	padding: 20rpx 10rpx 0;
	height: 160rpx;
	.item_texe {
		flex-shrink: 0;
		width: 180upx;
		font-size: 32upx;
		color: #303133;
	}
	.item_textarea{
		height: 160rpx;
	}
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