<template>
	<uni-base-page class="descounts">
		<!-- 标题展示区 satrt -->
		<view class="title"><input v-model="name" :placeholder="`${manypage['title-placeholder']}` || '标题'" /></view>
		<!-- 标题展示区 end -->

		<!-- 边距展示区 start -->
		<view class="hold15"></view>
		<!-- 边距展示区 end -->

		<!-- 富文本编辑器展示区 start -->
		<editor 
			id="editor" 
			:placeholder="`${manypage['cont-placeholder']}` || '输入内容'" 
			:showImgToolbar="false" 
			:showImgResize="true" 
			:showImgSize="true"  
			@ready="onEditorReady"
		/>
		<!-- 富文本编辑器展示区 end -->

		<!-- 上传图片展示区 start -->
		<view style="width: 100%;background: #fff;padding: 4%;">
			<view class="upload" @tap="chooseImage()">
				<view class="tu">
					<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/talkupload.png" />
				</view>
			</view>
		</view>
		<!-- 上传图片展示区 end -->
		<view style="height: 150upx;"></view>
		<!-- 提交审核按钮展示区 start -->
		<view class="btn-box">
			<button class="form" @click="submit">{{ manypage['submit'] || '提交审核' }}</button>
		</view>
		<!-- 提交审核按钮展示区 end -->
	</uni-base-page>
</template>

<script>
	let editorCtx = "";
	let releaseable = true;
	export default {
		data() {
			return {
				name: "",
				sendsucc: false,
				sendfail: false,
				communityId: "",
				content: "",
				imageList: []
			};
		},
		computed: {
			title() {
				return this.$t("title")
			},
			manypage() {
				return this.$t('manypage');
			}
		},
		onReady() {
			this.$setTitle(this.title["discounts"])
		},
		onLoad() {
			releaseable = true;
			if (this.$getUserInfo().currentCommunity) {
				this.communityId = this.$getUserInfo().currentCommunity.id;
			}
		},
		methods: {
			// 提交审核
			submit() {
				if(releaseable){
				// 获取富文本格式内容
					setTimeout(() => {
						editorCtx.getContents({
							success: data => {
								this.content = data.html;
								// this.content = this.content.replace(/<[^>]+>/g, "");
								this.$showLog("富文本编辑器内容", this.content);
								if (this.content) {
									this.$req.request({
										url: "/omCoupon/app/add",
										method: "POST",
										data: {
											name: this.name,
											content: this.content,
											communityId: this.communityId
										},
										success: res => {
											if(res.code==0){
												this.content = '';
												this.$showToast("发布成功");
												releaseable = false;
												setTimeout(() => {
													uni.switchTab({
														url: "/pages/main/main"
													});
												}, 1500);
											}else{
												this.$showToast(res.msg);
												let sensitiveWordList = res.data; // 获取敏感词数组
												// 过滤敏感词
												sensitiveWordList = sensitiveWordList.filter((sensitiveWord, index) => {
													if (!sensitiveWordList.some((i, j) => {
														return i.indexOf(sensitiveWord) > -1 && i !== sensitiveWord;
													})) {
														return sensitiveWord;
													}					
												});
												let content = this.content;
												sensitiveWordList.forEach((sensitiveWord, index) => {
													this.$showLog("sensitiveWord", sensitiveWord);
													let sensitiveWordStr = new RegExp(sensitiveWord, "ig");
													content = content.replace(sensitiveWordStr, "<span style='color: red;'>" + sensitiveWord + "</span>");
												});
												editorCtx.setContents({"html": content});
											}
										}
									});
								} else {
									this.$showToast("内容不能为空");
								}
							}
						});
					}, 500);
				}
			},

			// 富文本编辑器初始化
			onEditorReady() {
				uni.createSelectorQuery().select('#editor').context(res => {
					editorCtx = res.context;
				}).exec();
			},

			// 将图片插入富文本编辑器
			insertImg(imageUrlList) {
				for (var i = 0; i < imageUrlList.length; i++) {
					editorCtx.insertImage({
						src: imageUrlList[i],
						alt: "该处是图片",
						data: ""
					});
				}
			},
			// 上传图片时需要的接口
			uploadImage(imageBase64List) {
				this.$req.request({
					url: '/omCoupon/app/uploadImage',
					method: "POST",
					data: {
						imagesBase64: imageBase64List.join(",")
					},
					success: res => {
						if (res.code === 0) {
							let imageUrlList = res.data;
							this.insertImg(imageUrlList);
						}
					}
				});
			},

			// 打开相册、拍照选择图片
			chooseImage() {
				uni.chooseImage({
					count:9 - this.imageList.length, // 允许上传的照片数量 总数减去图片数组总数
					sizeType: ['compressed'],
					success: res => {
						// this.imageList = this.imageList.concat(res.tempFilePaths)
						this.imageList = res.tempFilePaths;
						let imageBase64List = [];
						for (var i = 0; i < this.imageList.length; i++) {
							this.$getImageBase64(this.imageList[i], imageBase64 => {
								imageBase64List.push(imageBase64)
							});
						}
						setTimeout(() => {
							console.log("imageBase64", imageBase64List, this.imageList);
							this.uploadImage(imageBase64List)
						}, 1000);

					}
				});
			},

		}
	};
</script>

<style lang="scss" scoped>
	.descounts {
		width: 100%;
		background-color: #F5F5F5;

		#editor {
			min-height: 600upx;
			height: auto;
			background-color: #fff;
			padding: 20upx 40upx;
		}

		.title {
			background: #fff;
			height: 88upx;
			padding: 0 40upx;
			border-top: 1px solid #eee;
			color: #000;
		}

		.title input {
			display: block;
			height: 88upx;
			line-height: 88upx;
			font-size: 36upx;
		}

		.cont {
			margin-top: 15upx;
			background: #fff;
			height: 40%;
			padding: 4%;

			textarea {
				width: 100%;
				height: 50%;
				display: block;
				font-size: 30upx;
			}
		}
		.upload{
			width: 30%;
			.tu {
				width: 100%;
				padding-bottom: 100%;
				position: relative;
				image{
					width: 100%;
					height: 100%;
					display: block;
					margin: auto;
					position: absolute;
					left: 0;
				}
			}
		}
		.btn-box{
			width: 100%;
			position: fixed;
			bottom: 40upx;
			left: 0;
		}
		.form {
			width: 80%;
			height: 88upx;
			background: linear-gradient(118deg, #01dca3 0%, #088b68 100%);
			box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
			border-radius: 50upx 50upx 50upx 50upx;
			color: #ffffff;
		}
	}
</style>
