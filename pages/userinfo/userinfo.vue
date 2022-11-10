<template>
	<view class="userInfo">
		<view class="userInfo_view">
			<view class="view_head1">
				<text>头像</text>
				<view class="view_image">
					<image :src="titleData.imgUrl || '/static/missing-face.png'" mode="" @click="qiniuImage"></image>
					<uni-icons type="right" size="20"></uni-icons>
				</view>
			</view>
			<view class="view_head" @click="username">
				<text>昵称</text>
				<view class="view_text">
					<text>{{titleData.userName}}</text>
					<uni-icons type="right" size="20"></uni-icons>
				</view>
			</view>
			<view class="view_head">
				<text>账号</text>
				<view class="view_text1">
					<text>{{titleData.userid}}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default{
	data(){
		return{
			titleData: ''
		}
	},
	onLoad(option){
		this.__init()
	},
	methods: {
		__init(){
			this.$http("userInfo", JSON.stringify({
				token: uni.getStorageSync("token")
			})).then(res => {
				if (res.data.code == 0) {
					this.titleData = res.data.userInfo
				}
			}).catch(err => {
				console.log(err);
			})
		},
		// 上传图片到七牛
		qiniuImage(){
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
								
								this.$http("userImgurlUpd", JSON.stringify({
									imgUrl: 'http://zddimages.abillchen.top/' + jsondata.hash,
									token: uni.getStorageSync("token")
								})).then(res => {
									if (res.data.code == 0) {
										this.titleData.imgUrl = 'http://zddimages.abillchen.top/' + jsondata.hash
									}
								}).catch(err => {
									console.log(err);
								})
							}
						})
					})
				}
			})
		},
		username(){
			uni.redirectTo({
				url: '/pages/userName/userName?nickname=' + this.titleData.userName
			})
		}
	}
}
</script>

<style scoped lang="scss">
.userInfo{
    background-color: #F5F5F5;
    padding: 10rpx 20rpx 0;
	height: 100vh;
}
.userInfo_view{
	padding: 20rpx 20rpx 0;
	border-radius: 10rpx;
	background: #FFFFFF;
	margin-bottom: 10rpx;
}
.view_head1{
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 32rpx;
    padding: 10rpx 0;
}

.view_head{
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 32rpx;
    padding: 30rpx 0;
}

.view_head:nth-child(2){border-top: 1rpx solid #e5e5e5;}
.view_head:nth-child(3){border-top: 1rpx solid #e5e5e5;}

.view_image{
	display: flex;
	align-items: center;
	
	image{
		width: 100rpx;
		height: 100rpx;
		border: 5rpx solid #FFFFFF;
		border-radius: 50%;
	}
	
	text{
		padding-left: 10rpx;
		color: #939393;
	}
}
.view_text{
	display: flex;
	align-items: center;
	
	text{
		padding-left: 10rpx;
		color: #aeaeae;
	}
}

.view_text1{
	display: flex;
	align-items: center;
	margin-right: 20rpx;
	
	text{
		padding-left: 10rpx;
		color: #aeaeae;
	}
}

::v-deep.qiniu{
	width: 100rpx;
	height: 100rpx;
	
	view{
		width: 100%;
		height: 100%;
		
		image{
			width: 100%;
			height: 100%;
		}
	}
}
</style>
