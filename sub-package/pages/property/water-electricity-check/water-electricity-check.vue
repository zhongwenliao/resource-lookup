<template>
	<view class="check">
		<view class="fill-in">
			<label>位置：</label>
			<view class="filter-view">
				<picker class="filter-picker" mode="selector" :range="array">
					<!-- <text class="input-text">{{array[index]}}</text> -->
					<input placeholder="请输入水表所在位置" />
					<image class="filter-view-down-image" src="http://www.thinmoo.com/wp-content/uploads/2020/10/down.png"></image>
				</picker>
			</view>
		</view>
		<view class="fill-in">
			<label>水表编号：</label>
			<view class="filter-view">
				<picker class="filter-picker" mode="selector" :range="array1">
					<input placeholder="请输入水表编号" />
					<image class="filter-view-down-image" src="http://www.thinmoo.com/wp-content/uploads/2020/10/down.png"></image>
				</picker>
			</view>
		</view>
		<view class="fill-in">
			<label>上月抄表：</label>
			<text class="last-month">123</text>
			<text>单位：吨</text>
		</view>
		<view class="fill-in">
			<label>本月抄表：</label>
			<input class="month" type="number" />
			<text class="unit">单位：吨</text>
		</view>
		<view class="tip">
			数值不能小于上月抄表数
		</view>
		<view class="cont">
			<!-- <editor
				id="editor"
				:placeholder="`${manypage['record-placeholder']}` || '记录你身边的事'"
				:showImgToolbar="false"
				:showImgResize="true"
				:showImgSize="true"
				@ready="onEditorReady"
			/> -->
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
						<image src="../../../../sub-package1/static/img/talkupload.png"></image>
					</view>
				</view>
			</view>
		</view>
		<button class="form">确定</button>
	</view>
</template>

<script>

export default {
	data() {
		return {
			index: 0,
			// index1: 0,
			array: ['中国', '美国', '巴西', '日本'],
			array1: ['1', '2', '3', '4'],
			imageList: [],
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
          
          // // 富文本编辑器初始化
          // onEditorReady() {
          // 	uni.createSelectorQuery().select("#editor").context((res) => {
          // 		editorCtx = res.context;
          // 	}).exec();
          // },
          
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
};
</script>

<style lang="scss">
	.check{
		width: 100%;
		background: #F5F5F5;
		border-top: 1px solid #eee;
	}
	.fill-in{
		background: #fff;
		padding: 20upx 20upx 0 20upx;
	}
	.fill-in label{
		display: inline-block;
		vertical-align: top;
		font-size: 32upx;
		width: 160upx;
		text-align: right;
	}
	.filter-view {
		width: 70%;
		display: inline-block;
	}
	.filter-picker{
		height: 60upx;
		border: 1px solid #888;
		position: relative;
	}
	.filter-picker input{
		display: block;
		width: 98%;
		height: 60upx;
		line-height: 60upx;
		padding-left: 2%;
		font-size: 30upx;
	}
	.last-month{
		display: inline-block;
		font-size: 30upx;
		width: 55%;
	}
	.unit{
		display: inline-block;
		vertical-align: top;
		margin-left: 32upx;
	}
	.fill-in .month{
		border: 1px solid #888;
		width: 48%;
		display: inline-block;
		height: 60upx;
		line-height: 60upx;
		padding-left: 2%;
		font-size: 30upx;
	}
	.filter-view-down-image{
		width: 40upx;
		height: 30upx;
		position: absolute;
		right: 20upx;
		top: 20upx;
	}
	.tip{
		background: #fff;
		color: red;
		padding-left: 180upx;
		padding-bottom: 20upx;
	}
	.cont {
		background: #fff;
		padding: 4%;
		margin-top: 20upx;
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
	.form {
		width: 80%;
		height: 88upx;
		line-height: 88upx;
		background: linear-gradient(118deg, #01dca3 0%, #088b68 100%);
		box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
		border-radius: 50upx 50upx 50upx 50upx;
		color: #ffffff;
		margin-top: 80upx;
	}
</style>