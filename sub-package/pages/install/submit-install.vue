<template>
	<view class="content">
		<view class="feedback-view">
			<view class="feedback-img">
				<view><text style="color: red;">*</text> 请分别拍摄锁前面板、锁后面板、锁舌、锁导向和回执单照片</view>
				<view class="feedback-btn" v-for="(picture,index) in pictureList">
					<view v-if="picture.itemPicture">
						<image :src='picture.itemPicture' class='item-picture'>
							<button class='delete-btn' @click='deletePhoto(index)'>
								<image src='https://file.yuanzhoulvwego.com/prod/uploadFiles/img/delete.png' class="delete-icon"></image>
							</button>
						</image>
					</view>
					<view v-else>
						<button @click="choosePic(index)" class="add-btn">
							<span style="font-size: 80upx; color: #BEBEBE;">+</span>
						</button>
					</view>
				</view>
			</view>
		</view>
		<button type="primary" @click="submit" :disabled="img.length < 5" class="submit-btn">{{ "提交" }}</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				pictureList: [
					{
						itemPicture: ""
					},
					{
						itemPicture: ""
					},
					{
						itemPicture: ""
					},
					{
						itemPicture: ""
					},
					{
						itemPicture: ""
					}
				],
				img:[],
				roomInfo: {}
			}
		},
		computed: {
			mine() {
				return this.$t("mine")
			},
			title() {
				return this.$t("title")
			}
		},
		
		methods: {
			submit() {
				this.uploadImgList();
			},
			
			//上传竣工图片
			uploadImgList() {
				this.$req.request({
					url: "/devDevice/app/uploadInstallationCompleteImages",
					method: "POST",
					data: {
						devSn: this.roomInfo.devSn,
						lockFrontPanelImage: this.img[0],
						lockRearPanelImage: this.img[1],
						lockTongueImage: this.img[2],
						lockGuideImage: this.img[3],
						singleReceiptImage: this.img[4]
					},
					success : res => {
						this.$showToast("提交成功");
						setTimeout(() => {
							uni.switchTab({
								url: "../../../pages/main/main"
							})
						}, 1000)
					}
				})
			},
			
			//选择照片
			choosePic(num) {
				var _this = this;
				_this.$chooseImage({
					imageSize: 40,
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['camera'],
					success: res => {
						_this.pictureList[num].itemPicture = res.imagePath;
						_this.img[num] = res.imageBase64;
					}
				});
			},
			
			//删除照片
			deletePhoto(num) {
				this.pictureList[num].itemPicture = "";
				this.img[num] = "";
				console.log("img array-----",this.img)
			}
		},
		
		onLoad(options) {
			this.roomInfo = JSON.parse(options.devObj);
		}
	}
</script>

<style>
	.content {
		width: 100%;
		background: #FFFFFF;
	}
	
	.feedback-view {
		padding: 20upx;
		clear: both;
		overflow: hidden;
		border: 1upx solid #EEEEEE;
	}
	
	.title {
		font-size: 32upx;
		font-weight: bold;
	}
	
	.submit-btn {
		width: 60%;
		margin: 40upx auto 0;
		font-size: 32upx;
		padding: 5upx;
	}
	
	.feedback-img {
		width: 96%;
		height: 220upx;
		padding: 20upx 10upx;
		/* border: 1upx solid #EEEEEE; */
		margin: 0 auto;
	}
	
	.add-btn {
		width: 200upx;
		height: 200upx;
		margin: 10upx auto;
		display: inline-block;
		line-height: 200upx;
	}
	
	.add-btn img {
		width: 60upx;
		height: 60upx;
	}
	
	.feedback-btn {
		width: 33%;
		float: left;
		text-align: center;
		vertical-align: middle;
	}
	
	.delete-btn {
		width: 32upx;
		height: 32upx;
		line-height: 32upx;
		float: right;
		border-width: 0upx !important;
		border-style: none;
		padding: 0;
		margin-right: 14upx;
		margin-top: -214upx;
		background: transparent;
	}
	
	.delete-btn::after {
		border: none;
	}
	
	.delete-icon {
		width: 32upx;
		height: 32upx;
	}
	
	.item-picture {
		width: 200upx;
		height: 200upx;
		margin: 0;
	}
</style>

