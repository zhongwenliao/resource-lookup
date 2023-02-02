<template>
	<uni-base-page>
	<!-- <view class=""> -->
		<view v-if="!checkImg" style="width: 100%; position: absolute;">
			<view class="picture-list">
				<view class="text-tips" v-if="imgList && imgList.length > 0">
					<text>{{house["click-tips"] || "点击图片即可放大图片并进行删除操作"}}</text>
				</view>
				<view class="no-picture" v-if="imgList && imgList.length === 0">
					<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/static/img/house/take-photo.jpg"></image><br/>
					<text>{{house["no-img"] || "暂无图片"}}</text>
				</view>
				<ul v-else :class="imgList && imgList.length === 1 ? 'one-picture' : 'multi-picture'">
					<li class="picture-container" v-for="(img,index) in imgList" :key="index" @click="checkPhoto(img)">
						<image :src="img.faceImage" mode="aspectFit"></image>
					</li>
				</ul>
			</view>
			<view class="bottom-btn-view add-house-view">
				<button class="add-btn" @click="goToAdd">{{house["add-face"] || "添加人脸"}}</button>
			</view>
		</view>
		<view v-else class="img-background" @click="closeBigImg">
			<view class="img-div">
				<image :src="imgSrc" mode="aspectFit"></image>
			</view>
			<view class="bottom-btn-view add-house-view">
				<button class="delete-btn" @click="deleteImg()">{{house["delete"] || "删除"}}</button>
			</view>
		</view>
	</uni-base-page>
	<!-- </view> -->
</template>

<script>
	var houseObj = {};
	export default {
		data() {
			return {
				imgList: null,
				checkImg: false,
				imgSrc: "",
				maxImgNum: null,
				imgId: null
			}
		},
		methods: {
			//获取用户登记人脸图像
			getUserFaceList(communityId) {
				this.$req.request({
					url: "/persBioTemplate/app/getRegisteredFace",
					data: {
						communityId: communityId,
					},
					success: (res) => {
						this.imgList = res.data;
					}

				})
			},

			//跳转到添加人脸页面
			goToAdd() {
				if(this.imgList.length >= this.maxImgNum) {
					this.$showToast((this.house["limit-img-one"] || "该小区最多只能上传") + this.maxImgNum + (this.house["limit-img-two"] || "张人脸照片"));
				}else {
					uni.redirectTo({
						url: "personal-picture?house=" + JSON.stringify(houseObj)
					})
				}
			},

			//查看大图
			checkPhoto(img) {
				this.checkImg = true;
				this.imgSrc = img.faceImage;
				this.imgId = img.id;
			},

			//关闭大图
			closeBigImg() {
				this.checkImg = false;
			},
			
			//删除人脸
			deleteImg() {
				this.checkImg = false;
				this.$req.request({
					url: "/persBioTemplate/app/deleteFaceImage",
					data: {
						id: this.imgId
					},
					success: (res) => {
						if(res.code==0){
							this.getUserFaceList(this.communityId);
							this.$showToast(this.house["delete-success"] || "删除成功");
						}else{
							this.$showToast(res.msg);
						}
					}
				})
			}
			
		},
		computed: {
			house() {
				return this.$t("house")
			},
			title() {
				return this.$t("title")
			}
		},
		onReady() {
			this.$setTitle(this.title["face"] || "人脸照片");
		},
		onLoad(options) {
			houseObj = JSON.parse(options.house);
			this.maxImgNum = houseObj.appUploadFaceImageNumber;
			this.communityId = houseObj.communityId;
			
		},
		
		onShow() {
			this.imgList = null;
			this.imgId = "";
			this.imgSrc = "";
			this.getUserFaceList(this.communityId);
		}
		
	}
</script>

<style lang="scss">
	.text-tips {
		/* position: absolute; */
		color: #AAAAAA;
		width: 90%;
		margin: 10upx 5%;
	}

	.picture-list ul {
		/* position: relative; */
		width: 100%;
		margin: 0 calc(50% - 352upx);   /* 预备方案 */
		padding: 20upx 0 90upx;
		list-style: none;
		overflow: hidden;
	}

	.one-picture {
		text-align: center;
		margin: 40upx auto;
	}

	.multi-picture {
		width: 100%;
		margin: 0;
		text-align: center;
	}

	.picture-container {
		float: left;
		/* display: inline-block; */
		width: 320upx;
		margin: 10upx 20upx;
		height: 320upx;
		background-color: #F5F5F5;
		vertical-align: middle;
		text-align: center;
		border: 1upx solid #e5e5e5;
	}

	.picture-container image {
		max-width: 100%;
		max-height: 100%;
	}

	.add-btn {
		background-color: $theme-bg-color;
		color: white;
	}

	.img-background {
		position: absolute;
		width: 100%;
		background: black;
		height: 100%;
		margin: 0;
		padding: 0;
	}

	.img-div {
		width: 100%;
		margin-top: 40%;
		text-align: center;
	}

	.img-div image {
		margin: 0 auto;
	}
	
	.no-picture {
		width: 100%;
		text-align: center;
		margin-top: 40%;
	}
	
	.no-picture image {
		width: 320upx;
		height: 320upx;
	}
</style>
