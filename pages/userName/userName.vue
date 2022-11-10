<template>
	<view class="username">
		<view class="updatePassword_item b-b">
			<text class="item_texe">昵称</text>
			<input class="item_input" v-model="userName" placeholder="请输入昵称" maxlength="20"/>
		</view>
		
		<view class="username_title">设置后，其他人将看到你的昵称</view>
		
		<button class="add-btn ymcode_ml" @click="username">确定提交</button>
	</view>
</template>

<script>
export default{
	data(){
		return{
			userName: ''
		}
	},
	onLoad(option){
		this.userName = option.nickname
	},
	onShow() {

	},
	methods: {
		username(){
			this.$http("usernameUpd", JSON.stringify({
				token: uni.getStorageSync("token"),
				userName: this.userName,
			})).then(res => {
				if (res.data.code == 0) {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					})
					setTimeout(() => {
						uni.redirectTo({
							url: '/pages/userinfo/userinfo'
						})
					}, 500)
				}
			}).catch(err => {
				console.log(err);
			})
		}
	}
}
</script>

<style scoped lang="scss">
.username{
	background-color: #F0F0F0F0;
	height: 100vh;
	padding-top: 20rpx;
}
.updatePassword_item {
	display: flex;
	align-items: center;
	position: relative;
	padding-left: 10rpx;
	height: 110upx;
	background: #fff;
	padding: 0 30rpx;

	.item_texe {
		flex-shrink: 0;
		width: 250upx;
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
.username_title{
	font-size: 30rpx;
	padding: 20rpx 30rpx 0;
	color: #a5a5a5;
}
.add-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 690upx;
	height: 80upx;
	margin: 60upx auto;
	font-size: 32rpx;
	color: #FFFFFF;
	border-radius: 10upx;
}
</style>