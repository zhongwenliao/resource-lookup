<template>
	<uni-base-page class="talk">
		<!-- 头部 -->
		<view class="head clear">
			<span class="cancel fl" @click="cancel">{{ manypage['cancel'] || '取消' }}</span>
			<span class="fr" @click="release">{{ manypage['release'] || '发布' }}</span>
		</view>
		<view class="cont">
			<editor
				id="editor"
				:placeholder="`${manypage['record-placeholder']}` || '记录你身边的事'"
				:showImgToolbar="false"
				:showImgResize="true"
				:showImgSize="true"
				@ready="onEditorReady"
			/>
			<view class="talkpicture clear">
				<view class="picture" v-for="(item, index) in imageList" :key="index">
					<view class="tu">
						<!--删除图片-->
						<u-icon class="del" name="close-circle-fill" color="#000000" size="45" @click="deleteImg(index, imageList)"></u-icon>
						<image class="showimg" mode="aspectFill" :src="item" @click="previewImage(index, imageList)"></image>
					</view>
				</view>
				<view class="upload fl" @click="photo" v-if="imageList.length < 9 || imageList.length == 0">
					<view class="tu">
						<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/talkupload.png"></image>
					</view>
				</view>
			</view>
		</view>
	</uni-base-page>
</template>

<script>
// 声明图片base64字符串列表、来源页面、富文本、可发布
let imageBase64List = [], originatePage = "", editorCtx = "", releaseable = true;
import utils from "@/common/js/index";
export default {
	data() {
		return {
			communityId: '',
			content: '',
			imageList: []
		};
	},
	computed: {
		manypage() {
			return this.$t('manypage');
		}
	},

	methods: {
		// 预览图片
		previewImage(i, imgList) {
			let imgurl = [];
			console.log(imgList);
			imgList.forEach(item => imgurl.push(item));
			uni.previewImage({
				urls: imgurl,
				current: imgList[i],
				loop:true
			});
		},
		
		// 富文本编辑器初始化
		onEditorReady() {
			uni.createSelectorQuery().select("#editor").context((res) => {
				editorCtx = res.context;
			}).exec();
		},
		
		// 删除图片
		deleteImg(i, imgList) {
			uni.showModal({
				title: '提示',
				content: '确定要删除照片吗？',
				cancelText: '取消',
				confirmText: '确定',
				success: res => {
					if (res.confirm) {
						imgList.splice(i, 1);
					}
					console.log(this.imageList);
				}
			});
		},
		
		// 取消
		cancel() {
			if (originatePage == 1) {
				uni.navigateBack({
					delta: 1
				});
			} else {
				uni.switchTab({
					url: originatePage
				});
			}
		},
		
		// 发布
		release() {
			if (releaseable) {
				this.$showLoading("", true);
				imageBase64List = []; //进入提交初始化
				// 处理base转型图片数据
				for (var i = 0; i < this.imageList.length; i++) {
					this.$getImageBase64(this.imageList[i], imageBase64 => {
						imageBase64List.push(imageBase64);
					});
				}
				// 避免还未执行完上面的就执行接口 做个延时处理
				setTimeout(() => {
					editorCtx.getContents({
						success: data => {
							this.content = data.html;
							this.content = this.content.replace(/<[^>]+>/g, "");
							this.$showLog("富文本编辑器内容", this.content);
							if (this.content) {
								this.$req.request({
									url: '/appNote/app/add',
									method: 'POST',
									data: {
										communityId: this.communityId,
										content: this.content,
										imagesBase64: imageBase64List.join(',')
									},
									success: res => {
										if (res.code == 0) {
											this.content = '';
											this.imageList = [];
											this.$showToast('发布成功');
											releaseable = false;
											setTimeout(() => {
												uni.switchTab({
													url: '/pages/main/main'
												});
											}, 1000);
										} else {
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
												let sensitiveWordReg = new RegExp(sensitiveWord, "ig");
												content = content.replace(sensitiveWordReg, "<span style='color: red;'>" + sensitiveWord + "</span>");
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
		
		// 调用拍照或从相册选取
		photo() {
			uni.chooseImage({
				count: 9 - this.imageList.length, // 允许上传的照片数量 总数减去图片数组总数
				sizeType: ['compressed'],
				success: result => {
					this.imageList = this.imageList.concat(result.tempFilePaths); // 数组拼接
				}
			});
		}
	},
	
	onLoad(options) {
		releaseable = true;
		console.log(options.originatePage);
		originatePage = options.originatePage;
		if (this.$getUserInfo().currentCommunity) {
			this.communityId = this.$getUserInfo().currentCommunity.id;
		}
	},
	
	onShow() {
		// #ifdef MP-WEIXIN
		// 隐藏返回home按钮
		if (wx.canIUse('hideHomeButton')) {
			wx.hideHomeButton();
		}
		// #endif
	},
};
</script>

<style lang="scss" scoped>
.talk {
	background: #f5f5f5;
	width: 100%;
	position: relative;
	.head {
		background: #fff;
		height: 88upx;
		padding: 0 40upx;
		border-bottom: 1px solid #eee;
		.cancel {
			color: #ccc;
		}

		span {
			display: block;
			height: 88upx;
			line-height: 88upx;
			font-size: 30upx;
		}
	}

	.cont {
		background: #fff;
		padding: 4%;
		.active {
			color: red;
		}
		textarea {
			width: 100%;
			height: 400upx;
			display: block;
			font-size: 30upx;
		}

		.talkpicture {
			background: #fff;
			.picture {
				width: 30%;
				float: left;
				margin-right: 4%;
				.tu {
					width: 100%;
					padding-bottom: 100%;
					position: relative;
					.del {
						position: absolute;
						right: 0;
						z-index: 99;
					}
					.u-icon {
						position: absolute;
						right: 0;
						z-index: 2;
					}
					.showimg {
						width: 100%;
						height: 100%;
						display: block;
						margin: auto;
						position: absolute;
						left: 0;
					}
				}
			}
			.picture:nth-child(3n) {
				margin-right: 0;
			}
			.upload{
				width: 30%;
				float: left;
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
		}
	}
}
</style>
