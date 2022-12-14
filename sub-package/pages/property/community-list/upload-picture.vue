<template>
	<uni-base-page class="content">
		<view class="photo-view">
			<!-- 以前的写法 start -->
			<!-- <image v-if="imgSrc" :src="imgSrc" class="face-img"></image>
			<image src="../../../../sub-package1/static/img/house/take-photo.jpg"  @click="takePhoto" class="photo-view-image" v-else ></image> -->
			<!-- 以前的写法 end -->
			
			<!-- 现在的写法 start -->
			<avatar fileType="jpg" quality="0.5" selWidth="300px" selHeight="600upx" headPortrait="0" ref="child" @upload="myUpload" 
				:avatarSrc="imgSrc" avatarStyle="width: 400upx; height: 400upx;">
			</avatar>
			<!-- 现在的写法 end -->
		</view>
		<view class="tips">
			<text>{{ house["first"] || "请在柔和的正面光源下进行验证" }}</text><br>
			<text>{{ house["second"] || "头发尽量不要遮挡脸部，并保持正脸注视屏幕" }}</text>
		</view>
		<view class="btn-view">
			<button style="background: transparent; border: 1upx solid #32A6F0; color: #32A6F0;" @click="changeAvatar">{{ house["select-photo"] || "选择照片" }}</button>
			<button @click="uploadPhoto">{{ house["submit"] || "提交" }}</button>
		</view>
		
	</uni-base-page>
</template>

<script>
	var faceImageBase64 = "";
	import avatar from "@/components/yq-avatar/yq-avatar.vue";
	export default {
		components: {
			avatar
		},
		data() {
			return {
				imgList: [],
				imgSrc: "../../../../sub-package1/static/img/house/take-photo.jpg",
				hasImg: null,
				communityId: "",
				roomId: null,
				page: "",
				household: null,
				houseObj: ""
			}
		},
		computed: {
			house() {
				return this.$t("house");
			},
			title() {
				return this.$t("title");
			}
		},
		methods: {
			myUpload(rsp) {
				let quality = 50 , imagePath = rsp.path;
				this.imgSrc = imagePath;
				this.$compressImage(imagePath, quality, () => {
					this.$getImageBase64(imagePath, (imageBase64) => {
						faceImageBase64 = imageBase64
						if (imageBase64.indexOf("base64,") > -1) {
							faceImageBase64 = imageBase64.split("base64,")[1];
							// console.log('我是物业上传图片', faceImageBase64);
						}
					});
				});
			},
			
			// 更换头像
			changeAvatar() {
				this.$refs.child.fSelect();
			},

			// 上传照片到服务器
			uploadPhoto() {
				if(faceImageBase64 == "") {
					this.$showToast(this.house["select-photo"] || "请选择照片");
					return;
				}
				this.$req.request({
					url: "/wyBioTemplate/app/uploadFaceImages",
					data:  {
						communityId: this.communityId,
						base64Image: faceImageBase64
					},
					method: "POST",
					success: (res) => {
						this.$showToast(this.house["upload-success"] || "上传成功");
						uni.redirectTo({
							url: "picture-list?community=" + JSON.stringify(this.communityObj)
						});
					}
				});
			}
		},
		onReady() {
			this.$setTitle(this.title["face"]);
		},
		onLoad(options) {
			this.communityObj = JSON.parse(options.community);
			this.communityId = this.communityObj.communityId;
		},
		onShow() {
			faceImageBase64 = "";
		}
	}
</script>

<style>
	.content {
		background-color: #FFFFFF;
	}
	
	.photo-view {
		margin-top: 40upx;
		padding: 20upx;
		text-align: center;
	}
	
	.photo-view-image {
		width: 400upx;
		height: 400upx;
	}

	.photo-view button {
		width: 400upx;
		height: 400upx;
	}

	.camera {
		width: 100upx;
		height: 100upx;
		margin-top: 150upx;
	}

	.face-img {
		width: 280upx;
		height: 400upx;
		padding: 0 auto;
	}

	.btn-view {
		margin: 80upx 10% 0;
	}

	.btn-view button {
		display: inline-block;
		width: 40%;
		padding: 0;
		margin: 0 5%;
		background: #32A6F0;
		color: #FFFFFF;
		font-size: 34upx;
		border-radius: 50upx;
	}

	.tips {
		margin-top: 40upx;
		padding: 30upx 7%;
		color: #AAAAAA;
		text-align: center;
	}
</style>

