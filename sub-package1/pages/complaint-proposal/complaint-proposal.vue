3<template>
	<!--投诉建议页面-->
	<view class="complaint_main">
		<!--自定义导航栏-->
		<uni-nav-bar background-color="#fff" color="#000" :status-bar="status_bar" :title="complaintProposa['Suggestion']||'投诉建议'"
			@clickLeft="clickNavLeft()" @clickRight="clickNavRight()">
			<!-- 导航栏左侧插槽 -->
			<view slot="left">
				<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/left.png" mode="" style="width: 15px;height: 15px;"></image>
			</view>
			<!-- 右侧插槽 -->
			<view slot="right" class="right">{{articleRelease['record']||'记录'}}</view>
		</uni-nav-bar>
		<!--自定义导航栏end-->

		<!--输入手机号-->
		<view class="uni-form-item input_item">
			<view class="input_text"><span>{{complaintProposa['contactNumber']||'联系电话'}}</span></view>
			<input type="number" class="uni-input" confirm-type="search"
				:placeholder="complaintProposa['phone']||'请输入手机号'" v-model="phone">
		</view>
		<!--输入手机号获 end-->

		<!--建议输入框-->
		<view class="uni-form-item input_item">
			<textarea style="margin-left: 20upx;" type="number" maxlength="400" :placeholder="complaintProposa['proposal']||'请输入您的建议:(限400字)'"
				v-model="content" />
		</view>
		<!--建议end-->

		<!--上传图片-->
		<view class="uni-form-item input_item" style="flex-flow: column;">
			<p style="margin-left: 20upx;">{{complaintProposa['UploadPictures']||'上传图片'}}</p>
			<p class="img_box" style="margin-left: 20upx;">
				<view class="picture" v-for="(item,index) in imageList" :key="index">
					<view class="tu">
						
						<!--点击图标 删除图片-->
						<u-icon class="del" name="close-circle-fill" color="#000000" size="45" @click="DelImg(index,imageList)">
						</u-icon>
						<!--删除图片end-->
						
						<image :src="item" @click="ViewImage(index,imageList)"></image>
					</view>
				</view>
				
				<!--点击上传图片-->
				<view @click="photo" class="photo" v-if="imageList.length<6">
					<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/adds.png"></image>
				</view>
			</p>
		</view>
		<!--上传图片end-->

		<!--提交按钮-->
		<button @click="changes">{{complaintProposa['submit']||'提交'}}</button>
		<!--提交按钮 end-->
	</view>
</template>

<script>
	let imageBase64List = [];
	export default {
		data() {
			return {
				phone: '', //用户手机号(接口获取)
				content: '', //投诉内容
				userList: '', //用户信息列表
				imageList: [],//展示图片列表
				status_bar: true
			}
		},
		computed: {
			complaintProposa() {
				return this.$t("complaint-proposal") //投诉建议国际化
			},
			common() {
				return this.$t("common") 
			},
			articleRelease() {
				return this.$t("article-release") //物品放行国际化
			},
		},
		onShow() {
			this.userInfo = uni.getStorageSync("userInfo")
			this.token = uni.getStorageSync("token")
			this.phone = this.userInfo.phone

			//进入页面初始化
			imageBase64List = []
		},
		methods: {
			// 点击导航栏左侧
			clickNavLeft() {
				uni.switchTab({
				    url: '/pages/main/main'
				});
			},
			
			// 点击导航栏右侧 
			clickNavRight() {
				uni.navigateTo({
					url: "/sub-package1/pages/complaint-proposal/proposal-list?bool=0"
				});

			},

			//用户信息
			usernameInof() {
				this.$req.request({
					url: "/appUser/app/getVerifyStatusErrorByPhone",
					method: "POST",
					data: {
						phone: this.phone
					},
					success: res => {
						this.userList = res.data
					}
				});
			},
			
			//调用拍照或从相册选取
			photo() {
					uni.chooseImage({
						count: 6 - this.imageList.length, // 允许上传的照片数量 总数减去图片数组总数
						sizeType: ['compressed'],
						success: (result) => {
							console.log(result)
							this.imageList = this.imageList.concat(result.tempFilePaths); //数组拼接
						}
					});
			},
			
			//预览图片 i是下标 imgList是图片列表
			ViewImage(i, imgList) {
				let imgurl = []
				imgList.forEach(item => imgurl.push(item))
				uni.previewImage({
					urls: imgurl,
					current: imgList[i],
					 loop:true
				});
			},

			//删除图片
			DelImg(i, imgList) {
				uni.showModal({
					title:this.common['hint']||'提示',
					content: this.articleRelease['delphoto']||'确定要删除照片吗？',
					cancelText: this.common['cancel']||'取消',
					confirmText: this.common['confirm']||'确定',
					success: res => {
						if (res.confirm) {
							imgList.splice(i, 1)
						}
					}
				})
			},
			
			//提交接口
			changes() {
				imageBase64List = [] //进入提交初始化

				//处理base转型图片数据
				for (var i = 0; i < this.imageList.length; i++) {
					this.$getImageBase64(this.imageList[i], (imageBase64) => {
						this.$showLog("图片大小", this.$getImageSizeByBase64(imageBase64));
						imageBase64List.push(imageBase64);
					});
				}

				//避免还未执行完上面的就执行接口 做个延时处理
				setTimeout(() => {
					this.$req.request({
						url: "/appComplaint/app/add",
						method: "POST",
						data: {
							accessToken: this.token,
							communityId: this.userInfo.currentCommunity.id,
							phone: this.phone,
							content: this.content,
							contentPictureBase64: imageBase64List.join("||")
						},
						success: res => {
							if (res.code == 0) {
								this.$showToast(res.msg);
								setTimeout(() => {
									uni.navigateTo({
										url: "/sub-package1/pages/complaint-proposal/complaint-proposal-submit"
									});
								}, 500);
							} else {
								this.$showToast(res.msg);
							}
						}
					});
				}, 1000);
			}
		},
	}
</script>

<style scoped>
	.complaint_main {
		width: 100%;
		font-size: 30upx;
		background-color: #F5F5F5;
			overflow-x:hidden;
	}

	.uni-form-item {
		padding: 10px 0px;
	}

	.uni-input {
		height: 65upx;
		font-size: 30upx;
		padding: 0px;
	}

	uni-textarea {
		font-size: 30upx;
		width: 95%;
	}

	.input_item {
		/* display: flex; */
		background: #FFFFFF;
		/* padding: 20upx 20upx; */
		margin-top: 15upx;

	}

	.input_text {
		margin:0 20upx;
		height: 65upx;
		line-height: 65upx;
	}


	.img_box {
		width: 95%;
		height: 100%;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;

	}

	.img_box:after {
		content: "";
		height: 0;
		width: 30%;
	}

	.img_box>uni-view {
		display: flex;
	}

	.picture {
		width: 30%;
		height: 200upx;
		position: relative;
	}
	.del{
		position: absolute;
		right: 0;
	}
	.tu,
	.picture image {
		width: 100%;
		height: 100%;
	}

	.photo {
		width: 30%;
		height: 200upx;
		display: flex;
		    border: 1px solid #f1f1f1cc;
		    background: #f1f1f1cc;
	}

	.photo image {
		margin: auto;
		width: 35%;
		height: 35%;
	}

	.img_box>view {
		margin: 10upx;
	}

	.tu {
		position: relative;
	}

	.tu>.u-icon {
		position: absolute;
		right: 0;
		z-index: 2;
	}


	button {
		margin: 0px 10%;
		margin-top: 10%;
		background: linear-gradient(118deg, #01DCA3 0%, #088B68 100%);
		box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
		border-radius: 50upx 50upx 50upx 50upx;
		color: #FFFFFF;
	}
</style>
