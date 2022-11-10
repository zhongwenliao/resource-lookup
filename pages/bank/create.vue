<template>
	<view class="content">
		<view class="payt_list">
			<view class="payt_title">选择收款方式</view>
			<view class="payt_box">
				<block v-for="(item, index) in payment" :key="index">
					<view class="payt_image" :class="{active: bankIndex === index}" @click="tabClick(index)">
						<image :src="item.payImage" mode=""></image>
					</view>
				</block>
			</view>
		</view>
		<view class="payt_list">
			<view class="payt_title">填充信息</view>
			<view class="info_list" v-if="bankIndex === 0">
				<view class="payt_info">
					<text>姓名</text>
					<input type="text" class="payt_index" v-model="wxInfo.uname"  maxlength="6" placeholder="请输入姓名" />
				</view>
				<view class="payt_info">
					<text>手机号码</text>
					<input type="number" class="payt_index" v-model="wxInfo.mobile"  maxlength="11" placeholder="请输入手机号码" />
				</view>
				<view class="payt_info1">
					<text>微信收款码</text>
					<view class="uni-file" @click="bankImageClick(0)">
						<block v-if="wxInfo.remark">
							<image :src="wxInfo.remark" mode=""></image>
						</block>
						<view v-else class="file-picker__box-content is-add">
							<view class="is-add">
								<view class="icon-add"></view>
								<view class="icon-add rotate"></view>
							</view>
						</view>
					</view>
				</view>
				<button class="add-btn ymcode_ml" @click="wxClick">{{ Object.keys(wxInfo).length > 0 ? '编辑微信' : '添加微信'}}</button>
			</view>
			
			<view class="info_list" v-if="bankIndex === 1">
				<view class="payt_info">
					<text>姓名</text>
					<input type="text" class="payt_index" v-model="zfbInfo.uname"  maxlength="6" placeholder="请输入姓名" />
				</view>
				<view class="payt_info">
					<text>手机号码</text>
					<input type="number" class="payt_index" v-model="zfbInfo.mobile"  maxlength="11" placeholder="请输入手机号码" />
				</view>
				<view class="payt_info">
					<text>支付宝账号</text>
					<input type="text" class="payt_index" v-model="zfbInfo.cardnum"  maxlength="20" placeholder="请输入支付宝账号" />
				</view>
				<view class="payt_info1">
					<text>支付宝收款码</text>
					<view class="uni-file" @click="bankImageClick(1)">
						<block v-if="zfbInfo.remark">
							<image :src="zfbInfo.remark" mode=""></image>
						</block>
						<view v-else class="file-picker__box-content is-add">
							<view class="is-add">
								<view class="icon-add"></view>
								<view class="icon-add rotate"></view>
							</view>
						</view>
					</view>
				</view>
				<button class="add-btn ymcode_ml" @click="zfbClick">{{ Object.keys(zfbInfo).length > 0 ? '编辑支付宝' : '添加支付宝'}}</button>
			</view>
			
			<view class="info_list" v-if="bankIndex === 2">
				<view class="payt_info">
					<text>姓名</text>
					<input type="text" class="payt_index" v-model="bankInfo.uname"  maxlength="6" placeholder="请输入姓名" />
				</view>
				<view class="payt_info">
					<text>手机号码</text>
					<input type="number" class="payt_index" v-model="bankInfo.mobile"  maxlength="11" placeholder="请输入手机号码" />
				</view>
				<view class="payt_info">
					<text>银行卡卡号</text>
					<input type="number" class="payt_index" v-model="bankInfo.cardnum"  maxlength="19" placeholder="请输入银行卡卡号" />
				</view>
				<button class="add-btn ymcode_ml" @click="bankClick">{{ Object.keys(bankInfo).length > 0 ? '编辑银行卡' : '添加银行卡'}}</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				payment: [
					{ payID: 1, payImage: '../../static/bank/wxImage.jpeg' },
					{ payID: 2, payImage: '../../static/bank/zfb.jpeg' },
					{ payID: 3, payImage: '../../static/bank/snipaste.png' }
				],
				bankIndex: 0,

				wxInfo: {
					remark: ''
				},
				zfbInfo: {
					remark: ''
				},
				bankInfo:{}
			}
		},
		onLoad(option){
			this.userWxInfo()
		},
		methods: {
			tabClick(index){
				this.bankIndex = index
				
				if(this.bankIndex === 0){
					this.userWxInfo()
				} else if(this.bankIndex === 1) {
					this.userZfbInfo()
				} else if(this.bankIndex === 2){
					this.userBankInfo()
				}
			},
			// 微信查询
			userWxInfo(){
				this.$http("userWxInfo", JSON.stringify({
					token: uni.getStorageSync("token")
				})).then(res=>{
					if(res.data.code == 0){
						this.wxInfo = res.data.wxInfo;
					} else if (res.data.code == 99) {
						this.userLog()
					} else {
						if(res.data.code != 4){
							uni.showToast({ title: res.data.msg, icon: 'none'});
						}
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			// 支付宝查询
			userZfbInfo(){
				this.$http("userZfbInfo", JSON.stringify({
					token: uni.getStorageSync("token")
				})).then(res=>{
					if(res.data.code == 0){
						this.zfbInfo = res.data.zfbInfo;
					} else if (res.data.code == 99) {
						this.userLog()
					} else {
						if(res.data.code != 4){
							uni.showToast({ title: res.data.msg, icon: 'none'});
						}
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			// 银行卡查询
			userBankInfo(){
				this.$http("userBankInfo", JSON.stringify({
					token: uni.getStorageSync("token")
				})).then(res=>{
					if(res.data.code == 0){
						this.bankInfo = res.data.bankInfo;
					} else if (res.data.code == 99) {
						this.userLog()
					} else {
						if(res.data.code != 4){
							uni.showToast({ title: res.data.msg, icon: 'none'});
						}
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			userLog(){
				uni.clearStorage();
				setTimeout(() => {
					uni.redirectTo({
						url: "../public/login"
					})
				}, 200)
			},
			// 微信提交
			wxClick(){
				let fkyz = /[^(^\s*)|(\s*$)]/;
				var myreg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/;
				
				if(this.wxInfo.uname == ""){
					uni.showToast({
					    icon: 'none',
					    title: '姓名不能为空'
					});
					return false;
				}
			
				if (!fkyz.test(this.wxInfo.uname)) {
					uni.showToast({
						icon: 'none',
						title: '请填写正确的姓名'
					});
					return;
				}

				if(this.wxInfo.mobile == ""){
					uni.showToast({
					    icon: 'none',
					    title: '手机号码不能为空'
					});
					return false;
				}
				
				if (!myreg.test(this.wxInfo.mobile)) {
					uni.showToast({
						icon: 'none',
						title: '手机号码不正确,请输入正确的手机号码'
					});
					return;
				}
				
				if(this.wxInfo.remark == ""){
					uni.showToast({
					    icon: 'none',
					    title: '微信收款码不能为空'
					});
					return false;
				}
				
				this.$http("userWxAdd",JSON.stringify({
					token: uni.getStorageSync("token"),
					mobile: this.wxInfo.mobile,
					cardnum: 'wx',
					uname: this.wxInfo.uname,
					remark: this.wxInfo.remark
				})).then(res => {	
					if(res.data.code == 0){
						uni.showToast({title:res.data.msg, icon: 'none'});
					  
						setTimeout(()=>{
							this.bankNavigateBack()
						}, 1000)
					} else if (res.data.code == 99) {
						this.userLog()
					} else {
						this.$api.msg(res.data.msg);
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			// 支付宝提交
			zfbClick(){
				let fkyz = /[^(^\s*)|(\s*$)]/;
				var myreg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/;
				
				if(this.zfbInfo.uname == ""){
					uni.showToast({
					    icon: 'none',
					    title: '姓名不能为空'
					});
					return false;
				}

				if (!fkyz.test(this.zfbInfo.uname)) {
					uni.showToast({
						icon: 'none',
						title: '请填写正确的姓名'
					});
					return;
				}
				
				if(this.zfbInfo.mobile == ""){
					uni.showToast({
					    icon: 'none',
					    title: '手机号码不能为空'
					});
					return false;
				}
				
				if (!myreg.test(this.zfbInfo.mobile)) {
					uni.showToast({
						icon: 'none',
						title: '手机号码不正确,请输入正确的手机号码'
					});
					return;
				}
				
				if(this.zfbInfo.cardnum == ""){
					uni.showToast({
					    icon: 'none',
					    title: '支付宝账号不能为空'
					});
					return false;
				}
				
				if(this.zfbInfo.cardnum == ""){
					uni.showToast({
					    icon: 'none',
					    title: '支付宝账号不能为空'
					});
					return false;
				}
				
				if(this.zfbInfo.remark == ""){
					uni.showToast({
					    icon: 'none',
					    title: '支付宝收款码不能为空'
					});
					return false;
				}
				
				this.$http("userZfbAdd",JSON.stringify({
					token: uni.getStorageSync("token"),
					mobile: this.zfbInfo.mobile,
					cardnum: this.zfbInfo.cardnum,
					uname: this.zfbInfo.uname,
					remark: this.zfbInfo.remark
				})).then(res => {	
					if(res.data.code == 0){
						uni.showToast({title:res.data.msg, icon: 'none'});
					  
						setTimeout(()=>{
							this.bankNavigateBack()
						}, 1000)
					} else if (res.data.code == 99) {
						this.userLog()
					} else {
						this.$api.msg(res.data.msg);
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			//银行卡提交
			bankClick(){
				let fkyz = /[^(^\s*)|(\s*$)]/;
				let cardeg = /^([1-9]{1})(\d{15}|\d{16}|\d{18})$/
				var myreg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/;
				
				if(this.bankInfo.uname == ""){
					uni.showToast({
					    icon: 'none',
					    title: '姓名不能为空'
					});
					return false;
				}
			
				if (!fkyz.test(this.bankInfo.uname)) {
					uni.showToast({
						icon: 'none',
						title: '请填写正确的姓名'
					});
					return;
				}
				
				if(this.bankInfo.mobile == ""){
					uni.showToast({
					    icon: 'none',
					    title: '手机号码不能为空'
					});
					return false;
				}
				
				if (!myreg.test(this.bankInfo.mobile)) {
					uni.showToast({
						icon: 'none',
						title: '手机号码不正确,请输入正确的手机号码'
					});
					return;
				}
				
				if(this.bankInfo.cardnum == ""){
					uni.showToast({
					    icon: 'none',
					    title: '银行卡号不能为空'
					});
					return false;
				}
				
				if (!cardeg.test(this.bankInfo.cardnum)) {
					uni.showToast({
						icon: 'none',
						title: '银行卡号不正确,请输入正确的银行卡号'
					});
					return;
				}
				
				this.$http("userBankAdd",JSON.stringify({
					token: uni.getStorageSync("token"),
					mobile:this.bankInfo.mobile,
					cardnum:this.bankInfo.cardnum,
					uname:this.bankInfo.uname,
					bankname: '',
					remark:''
				})).then(res => {	
					if(res.data.code == 0){
						uni.showToast({title:res.data.msg, icon: 'none'});
					  
						setTimeout(()=>{
							this.bankNavigateBack()
						}, 1000)
					} else if (res.data.code == 99) {
						this.userLog()
					} else {
						this.$api.msg(res.data.msg);
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			bankNavigateBack(){
				let pages = getCurrentPages();  //获取所有页面栈实例列表
				let prevPage = pages[ pages.length - 2 ];  //上一页页面实例
				
				prevPage.$vm.source = this.source;   //修改上一页data里面的searchVal参数值为1211
				prevPage.onLoad()
				
				uni.navigateBack({ 
					delta: 1
				})
			},
			bankImageClick(index){
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
									
									if(index === 0){
										this.wxInfo.remark = 'http://zddimages.abillchen.top/' + jsondata.hash
									} else {
										this.zfbInfo.remark = 'http://zddimages.abillchen.top/' + jsondata.hash
									}
								}
							})
						})
					}
				})
			}
		}
	}
</script>

<style scoped lang="scss">
.payt_list{
	padding: 0 20upx;
}
.payt_title{
	font-size: 30upx;
}
.payt_box{
	display: flex;
	justify-content: space-around;
	padding: 20upx 0 30upx;
}
.payt_image{
	width: 170upx;
	height: 100upx;
	border: 1upx solid #E5E5E5;
	padding: 20upx 30upx;
	border-radius: 10upx;
	
	image{
		width: 100%;
		height: 100%;
		border-radius: 10upx;
	}
}

.active{
	border: 1upx solid #00aa7f;
}

.payt_info{
	font-size: 28upx;
	display: flex;
	align-items: center;
	border: 1upx solid #E5E5E5;
	padding: 10upx 20upx;
	margin: 20upx 0;
	border-radius: 10upx;
	
	text{
		padding-right: 10upx;
	}
	
	.payt_index{
		width: 70%;
		padding-left: 10upx;
	}
}

.payt_info1{
	font-size: 28upx;
	border: 1upx solid #E5E5E5;
	padding: 10upx 20upx;
	margin: 20upx 0;
	border-radius: 10upx;
	display: flex;
	align-items: center;
	
	text{
		padding-right: 10upx;
		width: 300upx;
	}
	.uni-file{
		width: 500rpx;
		height: 200rpx;
		position: relative;
		box-sizing: border-box;
		
		image{
			width: 100%;
			height: 100%;
			border-radius: 10upx;
		}
	}
}

.add-btn{
	display: flex;
	align-items: center;
	justify-content: center;
	width: 690upx;
	height: 80upx;
	margin: 100upx auto 0;
	font-size: 32upx;
	color: #FFFFFF;
	border-radius: 10upx;
}

.is-add {
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-add {
    width: 100rpx;
    height: 10rpx;
    background-color: #f1f1f1;
    border-radius: 4rpx;
}
.rotate {
    position: absolute;
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
}

.file-picker__box-content {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: 10rpx;
    border: 1rpx #eee solid;
    border-radius: 10rpx;
    overflow: hidden;
}
</style>
