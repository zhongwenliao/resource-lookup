<template>
	<uni-base-page class="talk">
		<!-- 头部 -->
		<view class="head clear">
			<span class="cancel fl" @click="cancel">{{ manypage["cancel"] || "取消" }}</span>
			<span class="fr" @click="release">{{ manypage["release"] || "发布" }}</span>
		</view>
		<view class="title">
			<input v-model="name" :placeholder="`${manypage['title-placeholder']}` || '标题'" />
		</view>
		<view class="address">
			<input v-model="address" :placeholder="`${manypage['address']}` || '地址'"  />
		</view>
		<view class="time clear">
			<text class="fl">{{ manypage["time"] || "时间" }}</text>
			<view class='right-value fl'>
				<picker mode="multiSelector" :value="multiIndex" :range="multiArray" @change="bindPickerChange" @columnchange="bindColumnChange">
					<text>{{ reserveDate }}</text>
				</picker>
			</view>
		</view>
		<view class="hold15"></view>
		<!-- 富文本编辑器展示区 start -->
		<editor id="editor" :placeholder="`${manypage['cont-placeholder']}` || '输入内容'" :showImgToolbar="false" :showImgResize="true" :showImgSize="true" @ready="onEditorReady"/>
		<!-- 富文本编辑器展示区 end -->
		
		<!-- 上传图片展示区 start -->
		<view style="width: 100%;background: #fff;height: 19%;">
			<view class="upload" @tap="chooseImage()">
				<view class="tu">
					<image src="../../static/img/talkupload.png" />
				</view>
			</view>
		</view>
		<!-- 上传图片展示区 end -->
	</uni-base-page>
</template>

<script>
	let originatePage = "";
	let editorCtx = "";
	let releaseable = true;
	const date = new Date();
	const years = [];
	const months = [];
	const days = [];
	const hours = [];
	const minutes = [];
	// const second = [];
	//获取年
	for (let i = date.getFullYear(); i <= date.getFullYear() + 20; i++) {
		years.push("" + i);
	}
	//获取月份
	for (let i = 1; i <= 12; i++) {
		if (i < 10) {
			i = "0" + i;
		}
		months.push("" + i);
	}
	//获取日期
	for (let i = 1; i <= 31; i++) {
		if (i < 10) {
			i = "0" + i;
		}
		days.push("" + i);
	}
	//获取小时
	for (let i = 0; i < 24; i++) {
		if (i < 10) {
			i = "0" + i;
		}
		hours.push("" + i);
	}
	//获取分钟
	for (let i = 0; i < 60; i++) {
		if (i < 10) {
			i = "0" + i;
		}
		minutes.push("" + i);
	}
	// 获取秒
	// for (let i = 0; i < 60; i++) {
	// 	if (i < 10) {
	// 		i = "0" + i;
	// 	}
	// 	second.push("" + i);
	// }
	export default{
		data() {
			return {
				sendsucc: false,
				sendfail: false,
				communityId: "",
				content: "",
				name: "",
				imageList: [],
				errWord: [],
				address: "",
				reserveDate: "",
				releaseTime: "",
				multiArray: [years, months, days, hours, minutes],
				multiIndex: [0, new Date().getMonth(), new Date().getDate() - 1, new Date().getHours(), new Date().getMinutes()],
			}
		},
		computed:{
			manypage() {
				return this.$t('manypage');
			},
			repair() {
				return this.$t("repair")
			}
		},
		onShow() {
			// #ifdef MP-WEIXIN
			// 隐藏返回home按钮
			if (wx.canIUse("hideHomeButton")) {
				wx.hideHomeButton();
			}
			// #endif
		},
		onLoad(options) {
			this.reserveDate = this.repair["select-time"] || "请选择预约时间";
			originatePage = options.originatePage;
			if (this.$getUserInfo().currentCommunity) {
				this.communityId = this.$getUserInfo().currentCommunity.id;
			}
			releaseable = true;
		},
		methods: {
			cancel() {
				if(originatePage == 1){
					uni.navigateBack({
						delta: 1
					});
				}else{
					uni.switchTab({
						url: originatePage
					});
				}
			},
			//时间选择器值改变
			bindPickerChange(e) {
				this.multiIndex = e.detail.value;
				const index = this.multiIndex;
				const year = this.multiArray[0][index[0]];
				const month = this.multiArray[1][index[1]];
				const day = this.multiArray[2][index[2]];
				const hour = this.multiArray[3][index[3]];
				const minute = this.multiArray[4][index[4]];
				this.reserveDate = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
				this.releaseTime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':00';
			},
			//监听picker的滚动事件
			bindColumnChange(e) {
				//获取年份
				if (e.detail.column == 0) {
					this.chooseYear = this.multiArray[e.detail.column][e.detail.value];
					if (e.detail.column == 1) {
						let num = parseInt(this.data.multiArray[e.detail.column][e.detail.value]);
						let temp = [];
						if (num == 1 || num == 3 || num == 5 || num == 7 || num == 8 || num == 10 || num == 12) { //判断31天的月份
							for (let i = 1; i <= 31; i++) {
								if (i < 10) {
									i = "0" + i;
								}
								temp.push("" + i);
							};
							this.multiArray[2] = temp;
						} else if (num == 4 || num == 6 || num == 9 || num == 11) { //判断30天的月份
							for (let i = 1; i <= 30; i++) {
								if (i < 10) {
									i = "0" + i;
								}
								temp.push("" + i);
							};
							this.multiArray[2] = temp;
						} else if (num == 2) { //判断2月份天数
							let year = parseInt(this.chooseYear);
							if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) {
								for (let i = 1; i <= 29; i++) {
									if (i < 10) {
										i = "0" + i;
									}
									temp.push("" + i);
								}
								this.multiArray[2] = temp;
							} else {
								for (let i = 1; i <= 28; i++) {
									if (i < 10) {
										i = "0" + i;
									}
									temp.push("" + i);
								}
								this.multiArray[2] = temp;
							}
						}
					}
					var data = {
						multiArray: this.multiArray,
						multiIndex: this.multiIndex
					};
					data.multiIndex[e.detail.column] = e.detail.value;
					this.data = data;
				}
			
			},
			// 发布
			release() {
				if(releaseable){
					this.$showLoading("", true);
				// 获取富文本格式内容
					editorCtx.getContents({
						success: data => {
							this.content = data.html;
							this.$showLog("富文本编辑器内容", this.content);
							// let regExp = this.$regExp;
							// let iframeRegExp = regExp.iframeRegExp;
							// let imgRegExp = regExp.imgRegExp;
							// let videoRegExp = regExp.videoRegExp;
							// let imagesStr = this.content.replace(iframeRegExp, "").replace(videoRegExp, "").match(imgRegExp).join(",").replace(/src=/g, "").replace(/"/g, "");
							// if (imagesStr) {
							// 	let imageList = imagesStr.split(",");  // 将图片路径字符串转成数组
							// 	for (let i = 0; i < imageList.length; i++) {
							// 		let imageBase64Str = this.$getImageBase64Sync(imageList[0]);
							// 		imageBase64List.push(imageBase64Str);
							// 	}
							// }
							// this.$showLog("imageBase64List", imageBase64List);
							this.$req.request({
								url: "/appActivity/app/add",
								method: "POST",
								data: {
									name: this.name,
									content: this.content,
									communityId: this.communityId,
									address: this.address,
									releaseTime: this.releaseTime
								},
								success:res => {
									if(res.code==0){
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
						}
					});
				}
			},
		
			// 富文本编辑器初始化
			onEditorReady() {
				uni.createSelectorQuery().select("#editor").context((res) => {
					editorCtx = res.context;
				}).exec();
			},
		
			// 将图片插入富文本编辑器
			insertImg(imageUrlList) {
				for (let i = 0; i < imageUrlList.length; i++) {
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
					url: "/appActivity/app/uploadImage",
					method: "POST",
					data: {
						"imagesBase64": imageBase64List.join(",")
					},
					success: (res) => {
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
					count: 9 - this.imageList.length, // 允许上传的照片数量 总数减去图片数组总数
					sizeType: ['compressed'],
					success: (res) => {
						// this.$showLog("tempFilePaths", res.tempFilePaths);
						// this.imageList = this.imageList.concat(res.tempFilePaths);
						this.imageList = res.tempFilePaths;
						let imageBase64List = [];
						for (let i = 0; i < this.imageList.length; i++) {
							this.$getImageBase64(this.imageList[i], (imageBase64) => {
								imageBase64List.push(imageBase64);
							});
						}
						setTimeout(() => {
							console.log("imageBase64", imageBase64List, this.imageList);
							this.uploadImage(imageBase64List);
						}, 1000);
					}
				});
			},
			
		}
	}
</script>

<style lang="scss" scoped>
	.talk{
		background: #F5F5F5;
		width: 100%;
		position: relative;
		.head{
			background: #fff;
			height: 88upx;
			padding: 0 40upx;
			border-bottom: 1px solid #eee;
			.cancel{
				color: #ccc;
			}
			span{
				display: block;
				height: 88upx;
				line-height: 88upx;
				font-size: 30upx;
			}
		}
		.title,.address{
			background: #fff;
			height: 88upx;
			padding: 0 40upx;
			color: #000;
			border-bottom: 1px solid #eee;
		}
		.title input{
			display: block;
			height: 88upx;
			line-height: 88upx;
			font-size: 36upx;
		}
		.address input{
			display: block;
			height: 88upx;
			line-height: 88upx;
			font-size: 32upx;
		} 
		.time{
			background: #fff;
			height: 88upx;
			line-height: 88upx;
			padding: 0 40upx;
			font-size: 30upx;
			color: grey;
		}
		.right-value {
			display: inline-block;
			text-align: left;
			width: 65%;
			margin-top: 3%;
			margin-left: 5%;
			padding-right: 60upx;
		}
		
		.right-value input {
			font-size: 28upx;
		}
		#editor {
			width: 100%;
			min-height: 400upx;
			height: auto;
			background-color: #fff;
			padding: 20upx 40upx;
		}
		.cont{
			margin-top: 15upx;
			background: #fff;
			height: 40%;
			padding: 4%;
			textarea{
				width: 100%;
				height: 50%;
				display: block;
				font-size: 30upx;
			}
		}
		.upload{
			width: 30%;
			float: left;
			margin-left: 4%;
			margin-bottom: 20px;
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
</style>
