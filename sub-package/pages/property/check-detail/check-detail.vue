<template>
	<view class="content check-detail-content">
		<form @submit="submit" style="margin-top: 10upx; padding-left: 30upx; padding-right: 30upx;">
			
			<!-- 小区地址 start -->
			<view class="form-item">
				<text style="margin-right: 10upx;">{{ "小区地址: " }}</text>
				<text>{{ "丽水小区" }}</text>
			</view>
			<!-- 小区地址 end -->
			
			<!-- 楼栋单元 start -->
			<view class="form-item">
				<text style="margin-right: 10upx;">{{ "楼栋单元: " }}</text>
				<text>{{ "11栋2单元" }}</text>
			</view>
			<!-- 小区地址 end -->
			
			<!-- 抓拍照片 start -->
			<view class="form-item" style="">
				<text style="margin-right: 10upx;">{{ "抓拍照片: " }}</text>
				<!-- <image src="../../../static/img/1.jpg" mode="aspectFit" style="width: 300upx;"></image> -->
				<view style="display: flex; justify-content: flex-start;">
					<image src="../../../static/img/1.jpg" mode="widthFix" style="width: 200upx;"></image>
				</view>
			</view>
			<!-- 小区地址 end -->
			
			<!-- 第一次抓拍时间 start -->
			<view class="form-item">
				<text style="margin-right: 10upx;">{{ "第一次抓拍时间: " }}</text>
				<text>{{ "2021-05-25 16:24:22" }}</text>
			</view>
			<!-- 第一次抓拍时间 end -->
			
			<!-- 最后一次抓拍时间 start -->
			<view class="form-item">
				<text style="margin-right: 10upx;">{{ "第一次抓拍时间: " }}</text>
				<text>{{ "2021-05-29 16:24:22" }}</text>
			</view>
			<!-- 最后一次抓拍时间 end -->
			
			<!-- 7天内进入次数 start -->
			<view class="form-item">
				<text style="margin-right: 10upx;">{{ "7天内进入次数: " }}</text>
				<text>{{ "4" }}</text>
			</view>
			<!-- 7天内进入次数 end -->
			
			<!-- 总进入次数 start -->
			<view class="form-item">
				<text style="margin-right: 10upx;">{{ "总进入次数: " }}</text>
				<text>{{ "16" }}</text>
			</view>
			<!-- 总进入次数 end -->
			
			<!-- 问题标记 start -->
			<view class="form-item">
				<text style="margin-right: 10upx;">{{ "问题标记: " }}</text>
				<picker v-if="status == 0" mode="selector" style="display: inline-block; width: 60%; border: 2upx solid #DDDDDD; padding-left: 20upx;" @change="onQuestionMarkChange" name="questionMark" :range="questionMarkList" range-key="name">
					<text :class="['input-view', questionMarkIndex > -1 ? '' : 'input-placeholder-view']">{{ questionMarkIndex > -1 ? questionMarkList[questionMarkIndex]['name'] : '请选择' }}</text>
					<image src="http://www.thinmoo.com/wp-content/uploads/2020/10/down.png" style="width: 50upx; height: 50upx; position: absolute; top: 0; right: 0;"></image>
				</picker>
				
				<text v-else>{{ "外卖员" }}</text>
			</view>
			<!-- 问题标记 end -->
			
			<!-- 核查情况 start -->
			<view class="form-item">
				<text style="margin-right: 10upx;">{{ "核查情况: " }}</text>
				<textarea value="" :disabled="status == 1" :placeholder="status == 1 ? '经查是外卖员' : '请输入核查详情'" style="width: 60%; height: 200upx; display: inline-block; background-color: #FFFFFF; padding-left: 10upx;"/>
			</view>
			<!-- 核查情况 end -->
			
			<!-- 现场照片 start -->
			<view class="form-item">
				<text style="margin-right: 10upx;">{{ "现场照片: " }}</text>
				<!-- 上传图片 start -->
				<view class="uni-form-item input_item" style="flex-flow: column; display: inline-block;">
					<p class="img_box" v-if="!status">
						<view class="picture" v-for="(item,index) in imageList" :key="index">
							<view class="tu">
								<!--删除图片-->
								<u-icon class="del" name="close-circle-fill" color="#000000" size="45"
									@click="DelImg(index,imageList)">
								</u-icon>
								<!--删除图片end-->
				
								<image :src="item" @click="ViewImage(index,imageList)"></image>
							</view>
						</view>
						<view @click="photo" class="photo" v-if="imageList.length < 6 && status == 1">
							<image src="../../../../sub-package1/static/img/adds.png"></image>
						</view>
					</p>
					<view v-else="status">
						<image src="../../../static/img/1.jpg" mode="widthFix" style="width: 200upx;"></image>
					</view>
				</view>
				<!-- 上传图片 end-->
			</view>
			<!-- 现场照片 end -->
			
			<!-- 提交 -->
			<view class="btn-row">
				<!-- rgb(75, 121, 2) -->
				<button :class="[status == 1 ? '' : 'primary']" :style="{'width': '60%', 'background': status == 1 ? 'rgb(75, 121, 2)' : 'rgb(0, 122, 255)'}" formType="submit" :disabled="status == 1">{{ status == 1 ? "已处理" : "提交" }}</button>
			</view>
			<!-- 提交 -->
		</form>
	</view>
</template>

<script>
	export default {
		// 只要上面的选项跟下面的swiper-item个数相同，直接加上面的个数，下面的会自动对应显示，很简便，拿来就能用
		data() {
			return {
				questionMarkList: [
					{
						name: "外卖员",
						value: 0
					},
					{
						name: "快递员",
						value: 1
					}
				],
				
				questionMarkIndex: -1,
				imageList: [],
				status: 0
			}
		},

		onLoad(options) {
			uni.getSystemInfo({
				success: (res) => {
					// console.log('手机屏幕高度',res.windowHeight)
					let windowHeight = res.windowHeight;
					this.windowHeight = windowHeight -40;
				}
			});
			this.status = options.status;
			console.log(this.status);
		},
		
		methods: {
			
			// 切换触发的事件
			toggle(e){
				this.index = e.detail.current;
				console.log("index", this.index);
			},
			
			// 点击nav控制下面的展示
			onQuestionMarkChange(e) {
				this.questionMarkIndex = e.detail.value;
			},
			
			// 调用拍照或从相册选取 上传图片
			photo() {
				uni.chooseImage({
					count: 6 - this.imageList.length, // 允许上传的照片数量
					sizeType: ['compressed'],
					success: (result) => {
						this.imageList = this.imageList.concat(result.tempFilePaths); //数组拼接
					}
				});
			},
			
			//预览图片
			ViewImage(i, imgList) {
				let imgurl = []
				console.log(imgList)
				imgList.forEach(item => imgurl.push(item))
				uni.previewImage({
					urls: imgurl,
					current: imgList[i],
					loop: true
				});
			},
			
			//删除图片
			DelImg(i, imgList) {
				uni.showModal({
					title: '提示',
					content: '确定要删除照片吗？',
					cancelText: '取消',
					confirmText: '确定',
					success: res => {
						if (res.confirm) {
							imgList.splice(i, 1)
						}
						console.log(this.imageList)
					}
				})
			},
			
			submit() {
				this.$showToast("提交成功");
			}
		}
	}
</script>

<style lang="scss" scoped>
	.check-detail-content {
		background-color: rgb(249, 249, 249);
		
		.form-item {
			margin-top: 30upx;
			
			uni-image {
				img {
					background-position: left top;
				}
			}
			
			.photo {
				width: 30%;
				height: 200upx;
				display: flex;
				border: 1px solid #f1f1f1cc;
				background: #f1f1f1cc;
				
				image {
					margin: auto;
					width: 35%;
					height: 35%;
				}
			}

			.img_box {
				width: 95%;
				display: flex;
				justify-content: space-between;
				flex-wrap: wrap;
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
			
			.tu,
			.picture image {
				width: 100%;
				height: 100%;
			}
			
			.checked {
				background: rgb(75, 121, 2) !important;
			}
		}
	}
</style>
