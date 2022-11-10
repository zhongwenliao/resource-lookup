<template>
	<view class="tiaoliaoBox">
		<view class="right" v-if="spflid != 8">
			<block v-if="rightData.length > 0">
				<scroll-view scroll-y="true" class="scroll-Y-right">
					<view class="left_itemBox">
						<view class="left_item" v-for="(item,index) in rightData" :key='index'>
							<image :src="item.iconUrl" @click="navaddressTo(item.spID)" class="goods_img"></image>
							<view class="goods_view">
								<view class="goods_spname">{{item.spName}}</view>
								<view class="goods_price">
									<view class="goods_text">
										<text>￥</text>
										<text>{{item.price}}</text>
									</view>
									<image src="/static/tab-cart-current.png" @click="addcar(item.spID)"></image>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</block>
			<uni-load-more :status="statusLoadMore" :content-text="contentText" />
		</view>
		<view class="video_hose" v-else>
			<block v-if="videoList.length > 0">
				<block v-for="(item, index) in videoList" :key="index">
					<view class="hose_list">
						<text class="hose_title">{{item.title}}</text>
						<view class="hose_video">
							<video class="video_my" id="myVideo" :title="item.title" :src="item.url" controls
								show-loading mobilenet-hint-type auto-pause-if-open-native></video>
						</view>
					</view>
				</block>
			</block>
			<uni-load-more :status="statusLoadMore" :content-text="contentText" />
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				sizeCalcState: false,
				tabScrollTop: 0,
				currentId: 1,
				spflid: 2, //分类
				currentid: '1',
				name: '',
				address: '',
				flid: 0,
				pages: 0,
				catList: [],
				catNum: 0,
				params: {},
				current: 0,
				show: true,
				leftTitle: [],
				rightData: [],
				value: 0,
				// 视频
				videoList: [],

				statusLoadMore: "more",
				contentText: {
					contentdown: '',
					contentrefresh: '加载中',
					contentnomore: '没有更多数据了'
				},
				pagesInfo: {
					total_num: 0,
					per_num: 0
				}
			}
		},
		onLoad(option) {
			console.log('option', option);
			this.spflid = option.spflid

			uni.setNavigationBarTitle({
				title: option.spflname
			});

			if (this.spflid == 8) {
				this.videoListClient()
			} else {
				this.loadData();
				this.set_tabBar();
			}
		},
		onReachBottom() {
			if (this.pagesInfo.total_num > this.pagesInfo.per_num) {
				this.statusLoadMore = "loading"
				this.pages++

				var that = this
				setTimeout(function() {
					// 显示没有更多数据了
					that.statusLoadMore = "nomore"
				}, 2000)
			}
		},
		methods: {
			videoListClient() {
				this.$http("videoListClient", JSON.stringify({
					token: uni.getStorageSync("token"),
					pg: this.pages,
				})).then(res => {
					if (res.data.code == 0) {
						this.videoList = [...this.videoList, ...res.data.videoList.datas];

						if (res.data.videoList.pgInfo.total_num == 0) {
							console.log('12');
							this.contentText.contentdown = '暂无数据'
						} else {
							console.log('112');
							this.pagesInfo = res.data.videoList.pgInfo
						}
					} else {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
					}
				}).catch(err => {
					console.log(err);
				})
			},
			navaddressTo(id) {
				uni.navigateTo({
					url: '/pages/product/product?spid=' + id
				});
			},
			loadData() {
				this.$http("shangPinListClient", JSON.stringify({
					token: uni.getStorageSync("token"),
					spFlid: this.spflid,
					spName: '',
					pg: this.pages,
				})).then(res => {
					if (res.data.code == 0) {
						this.rightData = [...this.rightData, ...res.data.shangPinList.datas];

						if (res.data.shangPinList.pgInfo.total_num == 0) {
							this.contentText.contentdown = '暂无数据'
						} else {
							this.pagesInfo = res.data.shangPinList.pgInfo
						}
					} else {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
					}
				}).catch(err => {
					console.log(err);
				})
			},

			//设置购物车数字角标
			set_tabBar() {
				if (uni.getStorageSync('cat_num')) {
					let value = uni.getStorageSync('cat_num')
					this.value = value;

					if (value > 0) {
						uni.setTabBarBadge({
							index: 2,
							text: String(value),
							complete(e) {
								console.log(e);
							}
						});
					} else {
						//清除数字角标
						uni.hideTabBarRedDot({
							index: 2
						});
					}
				} else {
					this.value = 0;
					//清除数字角标
					uni.hideTabBarRedDot({
						index: 2
					});
				}
			},

			addcar(id) {
				this.$http("gwcAdd", JSON.stringify({
					spID: id,
					token: uni.getStorageSync('token'),
					num: 1,
				}), ).then(res => {
					if (res.data.code == 0) {
						this.value = this.value + 1
						uni.setStorage({
							key: "cat_num",
							data: this.value
						})
						uni.setTabBarBadge({
							index: 2,
							text: String(this.value)
						})
					} else if (res.data.code == 99) {
						uni.showModal({
							content: "请先登录",
							success: (e) => {
								if (e.confirm) {
									uni.clearStorage();
									setTimeout(() => {
										uni.redirectTo({
											url: "../public/login"
										})
									}, 200)
								}
							}
						});
					} else {
						uni.showToast({
							title: res.data.msg,
							icon: "none"
						})
					}
				}).catch(err => {
					console.log(err);
				})
			}
		}
	}
</script>

<style scoped lang='scss'>
	.content {
		padding: 0 30rpx;
	}

	.tiaoliaoBox {
		display: flex;
		color: #666;

		.left {
			width: 180upx;
			height: 100vh;
			text-align: center;
			background-color: #F8F6FC;

			.scroll-Y-left {
				height: 100vh;

				.scroll-view-item-left {
					height: 88upx;
					line-height: 88upx;
					font-size: 32upx;
				}

				.active {
					color: #ffffff;
					background-color: #fa436a;
				}
			}

		}

		.right {
			flex: 1;
			background-color: #fff;
			width: 70%;

			.scroll-Y-right {
				padding: 10upx;
				height: 100vh;

				.left_itemBox {
					display: flex;
					flex-wrap: wrap;
					justify-content: space-between;

					.left_item {
						width: 48%;
						background-color: #fff;
						border-radius: 10upx;
						margin-bottom: 20upx;
						border: 1upx solid #c4c4c4;

						.goods_img {
							width: 100%;
							height: 360upx;
						}

						.goods_view {
							padding: 0 10upx 10upx;

							.goods_spname {
								padding-bottom: 10upx;
								white-space: nowrap;
								overflow: hidden;
								text-overflow: ellipsis;
								font-size: 28rpx;
							}

							.goods_price {
								color: #E51515;
								display: flex;
								justify-content: space-between;
								align-items: center;

								.goods_text {
									width: 160rpx;
									font-size: 28rpx;
								}

								.price {
									font-weight: bold;
									font-size: 20px;
								}

								image {
									display: block;
									float: right;
									width: 40rpx;
									height: 40rpx;
									margin-right: 20rpx;
								}
							}
						}
					}
				}
			}
		}
	}

	.video_hose {
		width: 100%;

		.hose_list {
			padding: 10rpx 20rpx 30rpx;

			.hose_title {
				word-break: break-all;
				padding-bottom: 20rpx;

				width: 100%;
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
			}

			.hose_video {
				width: 100%;
				height: 280rpx;

				.video_my {
					width: 100%;
					height: 100%;
				}
			}
		}
	}

	.img_hose {
		width: 100%;

		.hose_list {
			padding: 10rpx 20rpx 30rpx;

			.hose_title {
				word-break: break-all;
				padding-bottom: 20rpx;

				width: 100%;
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
			}

			.hose_video {
				width: 100%;
				height: 280rpx;

				.video_my {
					width: 100%;
					height: 100%;
				}
			}
		}
	}
</style>
