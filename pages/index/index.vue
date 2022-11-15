<template>
	<!-- 没有定位的时候用 style="margin-top: 86rpx;" -->
	<view class="container" style="margin-top: 86rpx;">
		<!-- 小程序头部兼容 -->
		<!-- <view class="top ymcode_ml">
			<view class="adresp">
				<text class="yticon icon-shouhuodizhi"></text>{{nowAddress}}
			</view>
		</view> -->

		<view class="content">
			<view class="entrance">
				<swiper class="ads" id="ads" autoplay :interval="3000" indicator-dots>
					<swiper-item v-for="(item, index) in swiperData" :key='index' @click="navToWwiperPage(item.herf)">
						<image :src="item.imgUrl"></image>
					</swiper-item>
				</swiper>
			</view>

			<!-- 八个小图标 -->
			<view class="iconMeiShi_list" v-if="cfgValue == 1">
				<block v-for="(item, index) in classifyData" :key="index">
					<navigator url="../iconCook/iconCook" hover-class="none">
						<view class="iconMeiShi_item" @click="shangPinListByFlid(item.classifyID, item.classifyName)">
							<image :src="item.fyImage"></image>
							<text class="iconMeiShi_list_text">{{item.classifyName}}</text>
						</view>
					</navigator>
				</block>
			</view>

			<view v-for="(item,index) in shangPinListIndex" :key='index'>
				<view class="goods_box" v-if="item.subList.length>0">
					<view class="con_title">
						<view class="left">
							<view class="tianchong"></view>
							<view class="tianchong_title">{{item.sp_flmc}}</view>
						</view>
						<view class="right">
							<view class="addshop" @click="moreShangPin(item.sp_flid)">更多&nbsp;>></view>
							<view class="">
								<text class="iconfont icon-xiaochi"></text>
							</view>
						</view>
					</view>

					<view class="list-box">
						<view class="box_for">
							<view class="item" v-for="(goods,key) in item.subList" :key='key'>
								<view class="goods_img" @click="navaddressTo(goods.spID)">
									<image class="goods_image" :src="goods.iconUrl"></image>
								</view>
								<view class="goods_list">
									<view class="goods_title" @click="navaddressTo(goods.spID)"> {{goods.spName}}</view>
									<view class="goods_price">
										<text class="icon">￥</text>
										<text class="price">{{goods.price}}</text>
										<image src="/static/tab-cart-current.png" @click="addcar(goods.spID)"></image>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import qqmapsdk from '@/components/qqmap-wx-jssdk.min.js'
	const QQMapWX = new qqmapsdk({
		key: 'KEFBZ-KW5KR-FF5W4-WZVKQ-RZR2Z-UNF3U'
	});
	export default {
		data() {
			return {
				iswx: false,
				userid: uni.getStorageSync('userid'),
				titleNViewBackground: '',
				swiperCurrent: 0,
				swiperLength: 0,
				swiperData: [],
				shangPinListIndex: [],
				nowAddress: "正在获取地理位置中....",
				longitude: "",
				latitude: "",
				shoplist: [],
				hdthlist: [],
				hotlist: [],
				bandiconlist: [],
				bandData: [],
				mdData: [],
				value: 0,
				detail: {},
				configs: {
					more: true,
					autoplay: true,
					shadow: true,
					multiple: 3,
				},

				cfgValue: 0,

				classifyData: [{
						classifyID: 6,
						classifyName: '个性订制',
						fyImage: '../../static/index/huoDong.png'
					},
					{
						classifyID: 1,
						classifyName: '作品大厅',
						fyImage: '../../static/index/tuTeCuan.png'
					},
					{
						classifyID: 2,
						classifyName: '美文库',
						fyImage: '../../static/index/fuMinGuoYuan.png'
					},
					{
						classifyID: 3,
						classifyName: '美图库',
						fyImage: '../../static/index/nongJiaLe.png'
					},

				]
			};
		},
		onLoad() {
			this.reqSwiper();
			// this.get_local();
			this.getListIndex();
			this.getBandList();
			this.systemCfgInfoClient()
		},
		onShow() {
			this.set_tabBar();
			// #ifdef APP-PLUS
			this.versionCheck();
			// #endif
		},
		methods: {
			systemCfgInfoClient() {
				this.$http("systemCfgInfoClient", JSON.stringify({
					cfgKey: 'trueModule',
					token: 'token'
				})).then(res => {
					if (res.data.code == 0) {
						this.cfgValue = res.data.systemCfgInfo.cfgValue;
					}
				}).catch(err => {
					console.log(err);
				})
			},
			get_num() {
				if (uni.getStorageSync('cat_num')) {
					this.value = uni.getStorageSync('cat_num')
				}
			},
			getListIndex() {
				uni.showLoading({
					title: '加载中'
				});
				this.$http("shangPinListIndex",
					JSON.stringify({
						token: ""
					})).then(res => {
					uni.hideLoading();
					if (res.data.code != 0) {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
					} else {
						//uni.hideLoading();
						this.shangPinListIndex = res.data.shangPinList;
					}
				}).catch(err => {
					console.log(err);
				})
			},

			async reqSwiper() {
				this.$http("topViewListClient", JSON.stringify({
					token: "",
				})).then(res => {
					//console.log(res);
					if (res.data.code != 0) {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
					} else {
						let swiperData = res.data.viewList;
						this.swiperLength = swiperData.length;
						this.swiperData = swiperData;
					}
				}).catch(err => {
					console.log(err);
				})

			},
			//轮播图切换修改背景色
			swiperChange(e) {
				this.swiperCurrent = e.detail.current;;
			},

			//轮播跳转
			navToWwiperPage(href) {
				if (href != "" || href != undefined) {
					uni.navigateTo({
						url: href
					})
				}
			},
			//详情页
			moreShangPin(id) {
				uni.setStorage({
					key: 'gjfFl',
					data: id
				});

				uni.switchTab({
					url: '/pages/category/category'
				})
			},
			shangPinListByFlid(classifyID, classifyName) {
				if (classifyID == 7) {
					if (!uni.getStorageSync('token')) {
						uni.showModal({
							content: '请先登录',
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
						uni.navigateTo({
							url: '/pages/adoption/adoption'
						})
					}
				} else {
					if (classifyID == 6) {
						uni.navigateTo({
							url: '/pages/custom/custom'
						})
					} else {
						uni.navigateTo({
							url: '/pages/category/shangPinListClient?spflid=' + classifyID + '&spflname=' +
								classifyName
						})
					}

				}
			},
			navaddressTo(id) {
				uni.navigateTo({
					url: '/pages/product/product?spid=' + id
				});
			},
			versionCheck() {
				var that = this;
				this.$http("versionLast", JSON.stringify({
					userid: '',
				})).then(res => {
					plus.runtime.getProperty(plus.runtime.appid, function(wgtinfo) {
						if (res.data.versionInfo.vid > wgtinfo.versionCode) {
							uni.showModal({
								title: '版本更新',
								content: res.data.versionInfo.remark,
								success: function(resa) {
									if (resa.confirm) {
										that.appdownload(res.data.versionInfo.downUrl);
									} else if (resa.cancel) {
										console.log('用户点击取消');
									}
								}
							});
							console.log("不是最新版本"); //需要升级
						}
						//alert(Appversion);
					});
				}).catch(err => {
					console.log(err);
				})
			},
			appdownload: function(url) {
				console.log("来下载了");
				var that = this;
				// 更新文件 wgt 文件地址
				plus.nativeUI.showWaiting("正在更新...");
				plus.downloader.createDownload(url, {
					filename: '_downloads/tuanCuan.apk'
				}, function(d, status) {
					if (status == 200) {
						that.installWgt(d.filename); // 安装wgt方法
					} else {
						plus.nativeUI.alert("下载apk文件失败！");
					}
					plus.nativeUI.closeWaiting();
				}).start();
			},
			installWgt: function(path) {
				// console.log("来安装了")   {filename:`_downloads/ftzb.apk`}
				plus.nativeUI.showWaiting("安装apk文件...");
				plus.runtime.install(path, {
					filename: '_downloads/tuanCuan.apk'
				}, function() {
					plus.nativeUI.closeWaiting();

					plus.nativeUI.alert("应用资源更新完成！", function() {
						plus.runtime.restart();
					});
				}, function(e) {

					plus.nativeUI.closeWaiting();

					plus.nativeUI.alert("安装apk文件失败[" + e.code + "]：" + e.message);
				});

			},
			//获取当前位置方法
			get_local() {
				var that = this
				uni.getLocation({
					type: 'gcj02',
					geocode: true,
					success: (res) => {
						this.latitude = res.latitude;
						this.longitude = res.longitude;
						console.log("获取经纬度成功 lon:" + res.longitude + " lat:" + this.latitude);
						//this.shops(this.longitude, this.latitude)
					},
					fail: () => {
						console.log("获取经纬度失败");
					},
					complete: () => {
						// 解析地址
						QQMapWX.reverseGeocoder({
							location: {
								latitude: this.latitude,
								longitude: this.longitude
							},
							success: function(res) {
								// console.log(res.result.address);
								that.nowAddress = res.result.address
							},
							fail: function(res) {
								uni.showToast({
									title: '定位失败',
									duration: 2000,
									icon: "none"
								})
								console.log(res);
							},
							complete: function(res) {
								//console.log(res);
							}
						})
					}
				})
			},
			navcate() {
				uni.switchTab({
					url: '/pages/category/category'
				});
			},

			combacks() {
				var userid = ''
				if (uni.getStorageSync('userid')) {
					userid = uni.getStorageSync('userid')
				}
				uni.navigateToMiniProgram({
					appId: 'wxc0ee037bcc5d05f8',
					path: 'pages/index/index',
					extraData: {
						'userid': userid
					},
					success(res) {
						// 打开成功
					}
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
			getBandList() {
				this.$http("selectItemList", JSON.stringify({
					tag: "bandicon",
					token: "",
				}), ).then(res => {
					if (res.data.code != 0) {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
					} else {
						this.detail = res.data
					}
				}).catch(err => {
					console.log(err);
				})
			},
			go_hots(hdid) {
				let web = '/pages/product/product2?hdid=' + hdid
				uni.navigateTo({
					url: web
				})
			},

			addcar(id) {
				this.$http("gwcAdd",
					JSON.stringify({
						spID: id,
						token: uni.getStorageSync('token'),
						num: 1,
					}), ).then(res => {
					if (res.data.code == 0) {
						this.value = this.value + 1
						// console.log('---->'+this.value)
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
			},
		}

	}
</script>

<style scoped lang="scss">
	.content {
		padding: 0 20rpx;
	}

	.top {
		position: relative;
		width: 100%;
		height: 180rpx;
		padding: 20rpx 30rpx 0rpx;

		.adresp {
			width: 100%;
			clear: both;
			margin-top: 12rpx;
			color: #FFFF;
			font-size: 28rpx;
		}
	}

	.entrance {
		position: relative;
		margin-top: -80rpx;
		/* margin-bottom: 30rpx; */
		border-radius: 10rpx;
		background-color: #ffffff;
		box-shadow: $box-shadow;
		display: flex;
		align-items: center;
		justify-content: center;

		.item {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			position: relative;
		}

		.ads {
			width: 714rpx;
			height: 330rpx;

			image {
				width: 100%;
				height: 100%;
				border-radius: 8rpx;
			}
		}
	}

	.goods_box {

		// margin: 15rpx;
		.con_title {
			display: flex;
			justify-content: space-between;
			padding: 20rpx 0;
			// line-height: 124rpx;

			.left {
				display: flex;
				// line-height: 124rpx;
				font-weight: bold;
				font-size: 22px;
			}

			.tianchong {
				border-left: 8upx solid #00aa7f;
				margin-right: 10upx;
			}

			.tianchong_title {
				font-size: 40rpx;
				width: 240rpx;
				line-height: 52rpx;
				align-items: center;
				display: flex;
			}

			.right {
				display: flex;
				align-items: center;

				.addshop {
					font-size: 32rpx;
					color: #999999;
					display: flex;
					justify-content: flex-end;
				}
			}
		}

		.list-box {
			.box_for {
				display: flex;
				flex-wrap: wrap;
				justify-content: space-between;

				.item {
					width: 48%;
					background-color: #ffffff;
					margin-bottom: 30upx;
					border: 1rpx solid #e5e5e5;
					border-radius: 10rpx;

					.goods_img {
						width: 100%;
						height: 360rpx;

						image {
							width: 100%;
							height: 100%;
							border-radius: 10rpx 10rpx 0 0;
						}
					}

					.goods_list {
						padding: 0 10rpx;

						.goods_title {
							font-size: 36rpx;
							display: flex;
							overflow: hidden;
							text-overflow: ellipsis;
							display: -webkit-box;
							-webkit-line-clamp: 2;
							-webkit-box-orient: vertical;
						}

						.goods_price {
							color: #E51515;

							.icon {
								font-size: 14px;
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

	.navigators {
		color: #FFFFFF;
		font-size: 34rpx;
		width: 100%;
		margin-bottom: 20rpx;
		border-radius: 10rpx;
		background-color: #ffffff;
		box-shadow: $box-shadow;
		padding: 30rpx 0;
		display: flex;
		align-items: stretch;

		.left {
			width: 320rpx;
			text-align: center !important;
			height: 130rpx;
			border-radius: 10rpx;
			// height: 250rpx;
			line-height: 130rpx;
			border-radius: 10rpx;
			margin-right: 53rpx;
			background-color: #fff;
			background: url(../../static/nav/group.png) no-repeat;
			background-size: cover;
			-webkit-background-size: cover;
			-o-background-size: cover;
			background-position: center 0;
		}

		.right {
			width: 320rpx;
			// text-align: center;
			text-align: center !important;
			line-height: 130rpx;
			height: 130rpx;
			border-radius: 10rpx;
			flex-direction: column;
			background-color: #fff;
			background: url(../../static/nav/vips.png) no-repeat;
			background-size: cover;
			-webkit-background-size: cover;
			-o-background-size: cover;
			background-position: center 0;

			.tea-activity,
			.member-gifts {
				text-align: center;
				width: 100%;
				display: flex;
				align-items: center;
				position: relative;
			}

			.tea-activity {
				text-align: center;
				padding: 0 10rpx 0;
			}

			.member-gifts {
				padding: 30rpx 10rpx 0;

				image {
					width: 100%;
					height: 100rpx;
				}
			}
		}
	}

	.maps {
		display: none;
	}

	navigator {
		width: 100%;
	}

	.iconMeiShi_list {
		display: flex;
		flex-wrap: wrap;
		margin-top: 20rpx;
		justify-content: space-between;
		align-items: center;

		navigator {
			width: 150rpx;
			height: 180rpx;
			margin: 10rpx 0;
			font-size: 30rpx;
			display: flex;
			justify-content: center;

			.iconMeiShi_item {
				width: 120rpx;
				height: 120rpx;
				text-align: center;

				image {
					width: 100%;
					height: 100%;
					// border-radius: 50%;
				}
			}
		}
	}
</style>
