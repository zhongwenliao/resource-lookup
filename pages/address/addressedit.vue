<template>
	<view class="addressEdit">
		<view class="addressEdit_hoses">
			<view class="addressEdit_item b-b">
				<text class="item_texe">姓名</text>
				<input class="item_input" type="text" v-model="addressData.sjr" placeholder="请输入姓名"
					placeholder-class="placeholder" maxlength="11" />
			</view>
			
			<view class="addressEdit_item b-b">
				<text class="item_texe">手机号码</text>
				<input class="item_input" type="number" v-model="addressData.sjrdh" placeholder="请输入手机号码"
					placeholder-class="placeholder" maxlength="11"/>
			</view>
			
			<view class="addressEdit_item b-b">
				<text class="item_texe">省市区</text>
				<uni-data-picker :localdata="items" popup-title="请选择地址" @change="onchange"></uni-data-picker>
			</view>
			
			<view class="addressEdit_textarea">
				<text class="item_texe">详细地址</text>
				<textarea class="item_textarea" placeholder-style="font-size: 30rpx" v-model="addressData.xxdz" 
				placeholder="请输入详细地址" maxlength="50" />
			</view>
			
			<button class="add-btn ymcode_ml" @click="addressEditCon">确定提交</button>
		</view>
	</view>
</template>

<script>
import province from '@/static/js/province.json'

export default {
	data() {
		return {
			source: 0,
			adit: "",
			addressData: {
				sheng: '',
				shi: '',
				qu: '',
				xxdz: '',
				sjr: '',
				sjrdh: ''
			},
			items: province
		}
	},
	onLoad(option) {
		console.log('addressEdit', option);
		this.source= option.source;
		this.adit = option.aid
		this.__init()
	},
	methods: {
		// 获取地址
		__init(){
			this.$http("addressGet", JSON.stringify({
				token: uni.getStorageSync("token"),
				aid: this.adit
			})).then(res => {
				if (res.data.code == 0) {
					this.addressData = res.data.address
				}
			}).catch(err => {
				console.log(err);
			})
		},
		addressEditCon(){
			let fkyz=/[^(^\s*)|(\s*$)]/;
			let myreg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
			
			if (!fkyz.test(this.addressData.sjr)) {
				uni.showToast({
					title:"请填写收货人",
					icon:'none'
				})
				return false;
			}
			
			if(this.addressData.sjrdh===""){
				uni.showToast({
					title:"请填写手机号",
					icon:'none'
				})
				return false;
			}
			
			if(!myreg.test(this.addressData.sjrdh)){
				uni.showToast({
					title:"请输入正确的手机号",
					icon:'none'
				})
				return false;
			}
			
			if(!fkyz.test(this.addressData.xxdz)){
				uni.showToast({
					title:"请填写详细地址",
					icon:'none'
				})
				return false;
			}
			
			this.$http("addressEdit", JSON.stringify({
				token: uni.getStorageSync("token"),
				aid: this.adit,
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
							
							uni.navigateBack({  //uni.navigateTo跳转的返回，默认1为返回上一级
								delta: 1
							})
						}, 500)
					} else {
						setTimeout(()=>{
							uni.redirectTo({
								url: `/pages/address/address`
							})
						}, 500)
					}
				}else{
					this.$api.msg(res.data.msg);
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
.addressEdit {
	padding: 10rpx 20rpx 0;
	background-color: #F5F5F5;
	height: 100vh;
}

.addressEdit_hoses{
	background-color: #FFFFFF;
	padding: 20rpx 20rpx 4rpx;
	border-radius: 10rpx;
	font-size: 32rpx;
	margin: 10rpx 0;
}

.addressEdit_item {
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

.addressEdit_item:nth-child(2){
	border-top: 1rpx solid #e5e5e5;
	border-bottom: 1rpx solid #e5e5e5;
}

.addressEdit_item:nth-child(3){
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

.addressEdit_textarea{
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
