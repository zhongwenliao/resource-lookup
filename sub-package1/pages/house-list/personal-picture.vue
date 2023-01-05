<template>
	<uni-base-page class="content">
		<view class="photo-view">
			<avatar
				fileType="jpg"
				quality="0.5"
				selWidth="300px" selHeight="600upx" headPortrait="0" ref="child" @upload="myUpload" :avatarSrc="imgSrc"
				avatarStyle="width: 400upx; height: 400upx;">
			</avatar>
		</view>
		<view class="tips">
			<h2>{{ house["face_entry_requirements"] || "人脸资料录入要求" }}</h2>
			<p>{{ house["face_entry_requirements1"] || "1、照片背景光线明亮均匀适中，避免出现过亮和过暗的现象" }}</p>
			<p>{{ house["face_entry_requirements2"] || "2、头发不能遮住眉毛和脸部正面" }}</p>
			<p>{{ house["face_entry_requirements3"] || "3、表情自然，不能扭曲，以免影响识别" }}</p>
			<p>{{ house["face_entry_requirements4"] || "4、 照片不能过度美颜功能" }}</p>
			<p>{{ house["face_entry_requirements5"] || "5、 照片以肩部以上为最佳(类似证件照)" }}</p>
			<p>{{ house["face_entry_requirements6"] || "6、 照片中只能有一人存在，且照片角度屿人站立角度一致" }}</p>
			<!-- <text>{{ house["first"] || "请在柔和的正面光源下进行验证" }}</text><br>
			<text>{{ house["second"] || "头发尽量不要遮挡脸部，并保持正脸注视屏幕" }}</text> -->
		</view>
		<view class="app-privacy">
			<view>
				<checkbox @click="checkboxChange" value="cb" :checked="checked" />
				我已阅读并同意
				<text class="primary" @click="goToPrivacyPage">《{{ i18n['privacy-policy'] || '隐私政策' }}》</text>
			</view>
		</view>
		<view class="btn-view">
			<button class="select-photo" @click="changeAvatar">{{ house["select-photo"] || "选择照片" }}</button>
			<button @click="uploadPhoto">{{ house["submit"] || "提交" }}</button>
		</view>
		
	</uni-base-page>
</template>

<script>
	import avatar from "../../../components/yq-avatar/yq-avatar.vue";
	var faceImageBase64 = "";
	// 获取缓存的APP信息
	let appInfo = uni.getStorageSync("appInfo");
	// 从缓存的APP信息获取系统信息
	let systemInfo = appInfo.systemInfo;
	export default {
		components: {
			avatar
		},
		data() {
			return {
				imgList: [],
				imgSrc: "http://yuanzhoulvwego.com/wp-content/uploads/static/static/img/house/take-photo.jpg",
				hasImg: null,
				communityId: "",
				roomId: null,
				page: "",
				household: null,
				houseObj: "",
				checked: this.$getLanguageLowerCase().indexOf('cn') > -1 ? (uni.getStorageSync("personalPrivacyPolicy") || false) : true
			}
		},
		computed: {
			i18n() {
				return this.$t("login");
			},
			house() {
				return this.$t("house")
			},
			title() {
				return this.$t("title")
			}
		},
		methods: {
			// 跳转到隐私政策页面
			goToPrivacyPage() {
				uni.navigateTo({
					url: "../../../sub-package/pages/privacy/privacy?index=1"
				});
			},
			checkboxChange(){
				this.checked = !this.checked;
				uni.setStorageSync("personalPrivacyPolicy", this.checked);
			},
			myUpload(rsp) {
				let quality = 50 , imagePath = rsp.path;
				this.imgSrc = imagePath;
				// this.$compressImage(imagePath, quality, () => {
					this.$getImageBase64(imagePath, (imageBase64) => {
						faceImageBase64 = imageBase64
						if (imageBase64.indexOf("base64,") > -1) {
							faceImageBase64 = imageBase64.split("base64,")[1];
						}
					});
				// });
			},
			// 更换头像
			changeAvatar() {
				this.$refs.child.fSelect()
			},
			//获取人脸照片
			getFacePicture(communityId) {
				this.$req.request({
					url: "/persBioTemplate/app/getRegisteredFace",
					data: {
						communityId: communityId,
					},
					success: (res) => {
						console.log("res-----", res.data);
						this.imgList = res.data;
						if (this.imgList.length > 0) {
							var faceImage = this.imgList[0].faceImage;
							this.imgSrc = faceImage === undefined ? "http://yuanzhoulvwego.com/wp-content/uploads/static/static/img/house/take-photo.jpg" : faceImage;
							
						}
					}

				})
			},

			//拍摄照片
			takePhoto() {
				var _this = this;
				this.$chooseImage({
					sizeType: ['compressed'],
					success: function(res) {
						// console.log(JSON.stringify(res.tempFiles));
						_this.imgSrc = res.imagePath;
						faceImageBase64 = res.imageBase64;
						console.log("base64---",res)
					}
				});
				
			},

			//上传照片到服务器
			uploadPhoto() {
				if(faceImageBase64 == "") {
					this.$showToast(this.house["select-photo"] || "请选择照片");
					return;
				}
				if (!this.checked) {
					this.$showToast(this.i18n["agree-privacy-policy"] || "请先勾选同意后再登录");
					return;
				}
				var url = "";
				var sendData = null;
				if(this.page === "house") {
					url = "/persBioTemplate/app/uploadFaceImages";
					sendData = {
						communityId: this.communityId,
						base64Image: faceImageBase64,
						roomId: this.roomId
					};
				}else if(this.page === "household"){
					url = "/persBioTemplate/app/uploadHouseholdFaceImage";
					sendData = {
						base64Image: faceImageBase64,
						roomId: this.household.roomId,
						empId: this.household.empId,
						identityType: this.household.identityType
					};
				}
				this.$req.request({
					url: url,
					data: sendData,
					method: "POST",
					success: (res) => {
						if(res.code == 0){
							console.log("结果结果",res)
							this.$showToast(this.house["upload-success"] || "上传成功");
							setTimeout( () => {
								let houseObj = JSON.stringify(this.houseObj)
								uni.redirectTo({
									url: '/sub-package1/pages/house-list/face-list?house=' + houseObj 
								})
							},1000)
						}else{
							this.$showToast(res.msg)
						}
					}
				})
			}
		},
		onReady() {
			this.$setTitle(this.title["face"]);
		},
		onLoad(options) {
			var house = options.house;
			var household = options.household;
			if (house !== "" && house !== undefined) {
				this.page = "house";
				house = JSON.parse(house);
				this.houseObj = house;
				this.communityId = house.communityId;
				this.roomId = house.id;
				// this.getFacePicture(this.communityId);
			} else if (household !== "" && household !== undefined) {
				this.page = "household";
				household = JSON.parse(household);
				this.household = household;
				if(household.faceImage) {
					this.imgSrc = household.faceImage;
					this.hasImg = true;
				}
			}
		},
		
		onShow() {
			faceImageBase64 = "";
		}
	}
</script>

<style lang="scss">
	.content {
		background-color: #FFFFFF;
	}
	.photo-view {
		margin-top: 40upx;
		padding: 20upx;
		text-align: center;
	}
	.app-privacy{
		padding: 0 30upx;
		padding-bottom: 20upx;
	}
	.camera {
		width: 100upx;
		height: 100upx;
		margin-top: 150upx;
	}

	.face-img {
		width: 400upx;
		height: 400upx;
		padding: 0 auto;
	}

	.btn-view {
		margin: 20upx 10% 0;
	}

	.btn-view button {
		display: inline-block;
		width: 40%;
		padding: 0;
		margin: 0 5%;
		background: $theme-bg-color;
		color: #FFFFFF;
		font-size: 34upx;
		border-radius: 50upx;
	}

	.btn-view .select-photo {
		background: transparent; 
		border: 1upx solid $theme-bg-color; 
		color: $theme-bg-color;
	}
	
	.tips {
		/* margin-top: 40upx; */
		padding: 30upx;
		/* color: #AAAAAA; */
		/* text-align: center; */
	}
	.tips p {
		color: #AAAAAA;
	}
</style>
