<template>
	<view class="addressAdd">
		<view class="addressAdd_hoses">
			<view class="address_item b-b">
				<text class="item_texe">姓名</text>
				<input class="item_input" type="text" v-model="addressData.sjr" placeholder="请输入姓名"
					placeholder-class="placeholder" maxlength="11" />
			</view>
			
			<view class="address_item b-b">
				<text class="item_texe">手机号码</text>
				<input class="item_input" type="number" v-model="addressData.sjrdh" placeholder="请输入手机号码"
					placeholder-class="placeholder" maxlength="11"/>
			</view>
			
			<view class="address_item b-b">
				<text class="item_texe">省市区</text>
				<uni-data-picker :localdata="items" popup-title="请选择地址" @change="onchange"></uni-data-picker>
			</view>
			
			<view class="address_textarea">
				<text class="item_texe">详细地址</text>
				<textarea class="item_textarea" placeholder-style="font-size: 30rpx" v-model="addressData.xxdz" 
				placeholder="请输入详细地址" maxlength="50" />
			</view>
			
			<button class="add-btn ymcode_ml" @click="addressCon">确定提交</button>
		</view>
	</view>
</template>

<script>
import province from '@/static/js/province.json'
export default {
	data() {
		return {
			source:0,
			addressData: {
				sheng: '',
				shi: '',
				qu: '',
				xxdz: '',
				sjr: '',
				sjrdh: ''
			},
			items: province
		};
	},
	onLoad(option){
		this.source=option.source;
	},
	methods: {
		// 地址列表
		addressCon(){
			let fkyz=/[^(^\s*)|(\s*$)]/;
			let myreg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
			
			if (!fkyz.test(this.addressData.sjr)) {
				uni.showToast({
					title:"请填写收货人",
					icon:'none',
					duration: 2000
				})
				return false;
			}
			if(this.addressData.sjrdh===""){
				uni.showToast({
					title:"请填写手机号",
					icon:'none',
					duration: 2000
				})
				return false;
			}
			if(!myreg.test(this.addressData.sjrdh)){
				uni.showToast({
					title:"请输入正确的手机号",
					icon:'none',
					duration: 2000
				})
				return false;
			}
			if(!fkyz.test(this.addressData.xxdz)){
				uni.showToast({
					title:"请填写详细地址",
					icon:'none',
					duration: 2000
				})
				return false;
			}
			
			this.$http("addressAdd", JSON.stringify({
				token: uni.getStorageSync("token"),
				sjr: this.addressData.sjr,
				sjrdh: this.addressData.sjrdh,
				sheng: this.addressData.sheng,
				shi: this.addressData.shi,
				qu: this.addressData.qu,
				xxdz: this.addressData.xxdz
			})).then(res => {
				if(res.data.code==0){
					if(this.source==1 || this.source == 2){
						setTimeout(()=>{
							let pages = getCurrentPages();  //获取所有页面栈实例列表
							let prevPage = pages[ pages.length - 2 ];  //上一页页面实例
							
							prevPage.$vm.source = this.source;   //修改上一页data里面的searchVal参数值为1211
							prevPage.onShow()
							
							uni.navigateBack({ 
								delta: 1
							})
						}, 1000)
					}else{
						setTimeout(()=>{
							uni.redirectTo({
								url: `/pages/address/address`
							})
						}, 2000)
					}
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
				} else {
					uni.showToast({ title: res.data.msg, icon: 'none'})
				}
			}).catch(err => {
				console.log(err);
			})
		},
		onchange(e) {
		    const value = e.detail.value
			console.log('value', value);
			if(value != ''){
				this.addressData.sheng = value[0].text
				this.addressData.shi = value[1].text
				this.addressData.qu = value[2].text
			}
		}
	}
}
</script>

<style scoped lang="scss">
.addressAdd {
	padding: 10rpx 20rpx 0;
	background-color: #F5F5F5;
	height: 100vh;
}

.addressAdd_hoses{
	background-color: #FFFFFF;
	padding: 20rpx 20rpx 4rpx;
	border-radius: 10rpx;
	font-size: 32rpx;
	margin: 10rpx 0;
}

.address_item {
	display: flex;
	align-items: center;
	position: relative;
	padding-left: 10rpx;
	height: 110upx;

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
	}

	.icon-shouhuodizhi {
		font-size: 36upx;
		color: #303133;
	}
}

.address_item:nth-child(2){
	border-top: 1rpx solid #e5e5e5;
	border-bottom: 1rpx solid #e5e5e5;
}

.address_item:nth-child(3){
	border-bottom: 1rpx solid #e5e5e5;
}

::v-deep .uni-data-tree-input{
	width: 490rpx;
	
	.input-value-border{
		border: 0;
	}
	.input-value{
		padding: 0;
	}
}

.address_textarea{
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
	width: 650upx;
	height: 80upx;
	margin: 60upx auto;
	font-size: 32rpx;
	color: #FFFFFF;
	border-radius: 10upx;
}
</style>
