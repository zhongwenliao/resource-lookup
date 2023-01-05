<template>
	<!-- 招商详情页面 -->
	<page>
		<u-navbar :title="title" :border-bottom="false"></u-navbar>
		<view class="head">
			<u-swiper :list="merchantsInfo.images" mode="dot" :autoplay="false" height="450" @click="swiperImage"></u-swiper>
		</view>
		<view class="body" style="padding-bottom: 100upx;">
			<view class="head_box">
				<view class="head_box_top">
					<view class="title">
						{{investmentTitle}}
					</view>
				</view>

				<view class="head_box_data">
					<u-row gutter="12">
						<u-col span="4">
							<view class="data_box">
								<view class="data_box_top u-line-1">
									{{merchantsInfo.area || '0'}}m²
								</view>
								<view class="data_box_bottom">
									总面积
								</view>
							</view>
						</u-col>
						<u-col span="4">
							<view class="data_box border">
								<view class="data_box_top u-line-1">
									{{ merchantsInfo.rentMonth || 0 }}元
								</view>
								<view class="data_box_bottom">
									月租金
								</view>
							</view>
						</u-col>
						<u-col span="4">
							<view class="data_box">
								<view class="data_box_top u-line-1">
									{{merchantsInfo.zone.district || '无'}}
								</view>
								<view class="data_box_bottom">
									{{merchantsInfo.zone.city || '无'}}
								</view>
							</view>
						</u-col>
					</u-row>
				</view>
			</view>

			<view class="info">
				<view class="title">
					基本信息
				</view>
				<view class="info_foot">
					<u-row gutter="12">
						<u-col span="12">
							<text class="info_foot_left">
								房间号
							</text>
							<text class="info_foot_right">
								{{ merchantsInfo.buildName + '/' + merchantsInfo.floorName + '/' + merchantsInfo.roomName }}
							</text>
						</u-col>
						<u-col span="6">
							<text class="info_foot_left">
								房间类型
							</text>
							<text class="info_foot_right">
								{{enumFilter($enum.roomType,merchantsInfo.roomType).label}}
							</text>
						</u-col>
						<u-col span="6">
							<text class="info_foot_left">
								月租金
							</text>
							<text class="info_foot_right">
								{{merchantsInfo.rentMonth || 0}}元/月
							</text>
						</u-col>
						<u-col span="6">
							<text class="info_foot_left">
								房间面积
							</text>
							<text class="info_foot_right">
								{{merchantsInfo.area || 0}}m²
							</text>
						</u-col>
						<u-col span="6">
							<text class="info_foot_left">
								管理费
							</text>
							<text class="info_foot_right">
								{{merchantsInfo.propertyCosts || 0}}元/月
							</text>
						</u-col>
					</u-row>
				</view>
			</view>

			<view v-if="merchantsInfo.investmentRequire" class="situation">
				<view class="title">
					概况
				</view>
				<view class="richText">
					<text :decode="true">
						{{merchantsInfo.investmentRequire || ''}}
					</text>
				</view>
			</view>
			<view class="recommended">
				<view class="title">
					其他
				</view>
				<view class="richText">
					<view class="u-m-b-20" v-for="(item,index) in recommendedList" :key="index"
						@click="goDetails(item)">
						<view class="card-box" style="display: flex;background: #fff;border-radius: 15upx;">
							<view class="card-box-left">
								<u-image width="250" height="210" :src="item.images[0]"></u-image>
							</view>
							<view class="card-box-right u-m-l-20" style="width: 100%;">
								<view class="u-font-lg u-main-color u-line-2 u-m-b-15" style="width: 100%;">
									{{item.investmentTitle}}
								</view>
								<view class="unitPrice u-flex u-m-b-15 u-font-xs2">
									<view class="u-flex-1 u-line-1">
										管理费:{{item.propertyCosts || 0}}元/月
									</view>
									<view class="u-flex-1 u-line-1">
										<!-- 月租金:{{item.rentMonth || 0}}元 -->
										面积:{{ item.area || 0 }}m²
									</view>
								</view>
								<view class="type u-flex u-m-b-10">
									<text class="">
										类型：
									</text>
									<u-tag v-for="(data,subIndex) in typeList" class="u-m-l-4" shape="circle" :key="subIndex"
										:color="item.roomType==data.value?'#e35d5d':'#999999'" bg-color="#ffffff"
										:border-color="item.roomType==data.value?'#e35d5d':'#999999'" size="mini"
										:text="data.label" type="info" />
								</view>
								<view class="u-type-price u-font-lg2 u-text-bold">
									<!-- {{ Math.round((item.rentMonth / item.area) * 100) / 100 || 0}}元/m<sup>2</sup> -->
									月租金：{{ item.rentMonth || 0}} 元 
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="but_box u-flex u-row-between">
				<view class="u-m-l-60 u-flex">
					<u-icon @click="$u.throttle(collection, 1000)" label="收藏" label-color="#333333" label-size="22" label-pos="bottom" width="44" height="42"
						:name="merchantsInfo.collectStatus?yishoucang:shoucang"></u-icon>
					<u-icon @click="share" label="转发" class="u-p-l-50" label-color="#333333"  label-size="22" label-pos="bottom"
						width="44" height="39" name="http://yuanzhoulvwego.com/wp-content/uploads/static/home/merchants/zhuangfa.png"></u-icon>
				</view>
				<view class="right-but_box" @click="intentionApply">
					意向申请
				</view>
			</view>
		</view>
	</page>
</template>

<script>
	export default {
		data() {
			return {
				zoneId: '',
				shoucang: 'http://yuanzhoulvwego.com/wp-content/uploads/static/home/merchants/shoucang.png',
				yishoucang: 'http://yuanzhoulvwego.com/wp-content/uploads/static/home/merchants/yishoucang.png',
				title: '招商详情',
				merchantsInfo: {
					collection:0,//收藏状态
					zone: {}
				}, //招商信息
				recommendedList: [],
				typeList: [],
			}
		},
		computed: {
			investmentTitle() {
				return this.merchantsInfo.investmentTitle ?
					`${this.merchantsInfo.investmentTitle}(${this.merchantsInfo.zone.name})` : ''
			}
		},
		methods: {
			intentionApply(){
				let _this = this
				this.$Router.push({
					path: "/pages/home/merchants/intentionApply",
					query: {
						id: _this.merchantsInfo.id,
						zoneId:_this.$Route.query.zoneId,
						customerInfo:_this.merchantsInfo.fwZsCustomerIntentForms[0]
					}
				});
			},
			// 点击图片
			swiperImage(index) {
				uni.previewImage({
					urls: this.merchantsInfo.images,
					current: index
				});
			},
			// 收藏
			collection(){
				let params = {
					id:this.$Route.query.id
				}
				this.$api('merchants.collect', params).then(res => {
					uni.showToast({
						title: res.msg ||  '请求出错,稍后重试',
						icon: 'none',
						duration: 1000,
						mask: true,
					});
					if (res.code == 200) {
						this.$set(this.merchantsInfo, "collectStatus", !this.merchantsInfo.collectStatus);
					}
				})
				
			},
			// 转发
			share(){
				uni.shareWithSystem({
				  summary: '测试分享',
				  href: 'https://baidu.com',
				  success(){
				    // 分享完成，请注意此时不一定是成功分享
				  },
				  fail(){
				    // 分享失败
				  }
				})
			},
			// 去往详情页
			goDetails(res) {
				this.$Router.push({
					path: "/pages/home/merchants/detailsMerchants",
					query: res
				});
			},
			getMerchants() {
				let params = {
					currPage: 1,
					pageSize: 20,
					investmentStatus: 1,
					zoneId: this.zoneId
				}

				this.$api('merchants.merchantsList', params).then(res => {
					if (res.code == 200) {
						this.recommendedList = res.data.list
					}

				})
			},
			getInfo(id,zoneId) {
				this.$api('merchants.merchantsInfo', {
					id,
					zoneId
				}).then(res => {
					if (res.code == 200) {
						this.merchantsInfo = res.data
					}

				})
			},
		},
		onLoad(...options) {
			this.zoneId = uni.getStorageSync('zoneInfo').id
			this.title = '招商详情'
			this.typeList = this.$enum.roomType.filter(item => {
				return (item.value != 2 && item.value != 3 && item.value != 6 && item.value != 7)
			})
			this.getInfo(this.$Route.query.id,this.$Route.query.zoneId)
			this.getMerchants()
		},
		onShow() {},
	}
</script>
<style>
	page {
		background: #F9F9F9;
	}
</style>
<style scoped lang="scss">
	.card-box {
		padding: 40upx 20upx;
	}

	.but_box {
		position: fixed;
		width: 100%;
		height: 100upx;
		line-height: 100upx;
		bottom: 0;
		z-index: 100;
		font-weight: 500;
		background: #ffffff;

		.right-but_box {
			width: 270upx;
			color: #FFFFFF;
			font-size: 32upx;
			background-color: #3E76F4;
			text-align: center;
		}
	}

	.recommended {

		// padding: 0 20upx 20upx 20upx;
		.title {
			padding: 10upx 20upx 20upx 30upx;
			border: 0;
			// padding-bottom: 0;
		}
	}

	/deep/ .u-select__header__title {
		font-size: 34upx;
		color: #333333;
	}

	/deep/ .u-select__header {
		border-bottom: 1px solid $uni-border-color;
	}

	.negotiation {
		padding-bottom: 100upx;
	}

	.followUpName {
		font-size: 26upx;
		color: #1677ff;
	}

	.list {
		display: flex;
		align-items: center;
		padding: 30upx 15upx;
		margin: 10upx 0;
		border-radius: 15upx;

		.list_content {
			flex-grow: 1;
			padding-left: 15upx;

			.list_top {
				display: flex;
				justify-content: space-between;

				.list_name {
					font-size: 32upx;
					color: #333333;
					padding-bottom: 20upx;
				}

				.list_time {
					font-size: 24upx;
					color: #666666;
				}
			}

			.list_bottom {
				display: flex;
				justify-content: space-between;

				.list_phone {
					display: flex;
					align-items: center;
					font-size: 26upx;
					color: #333333;

					.list_icon {
						margin-left: 18upx;
					}
				}

				.list_button {
					width: 110upx;
					border-radius: 5upx !important;
					font-size: 26upx;
				}
			}
		}
	}

	.title {
		font-size: 34upx;
		font-weight: bold;
		color: #333333;
		padding-left: 10upx;
		padding-bottom: 30upx;
		border-bottom: 1upx solid $uni-border-color;
	}

	.head {

		.head_but {
			position: absolute;
			width: 100%;
			bottom: 48upx;
			text-align: center;
			margin: 0 auto;
		}
	}

	.foot {
		/deep/ .u-cell {
			padding: 40upx 0 !important;
		}
	}

	.order {
		background-color: #ffffff;
		border-top: 1px solid #dddddd;
		box-sizing: border-box;
		padding: 60rpx 0;
		font-size: 28rpx;
		position: relative;

		.right_icon {
			position: absolute;
			right: 0;
			top: 0;
		}

		.top {
			display: flex;
			justify-content: space-between;

			.left {
				display: flex;
				align-items: center;

				.store {
					margin: 0 10rpx;
					font-size: 32rpx;
					font-weight: bold;
				}
			}

			.right {
				color: $u-type-warning-dark;
			}
		}

		.item {
			display: flex;
			margin: 20rpx 0 0;

			.left {
				margin-right: 20rpx;

				image {
					width: 200rpx;
					height: 200rpx;
					border-radius: 10rpx;
				}
			}

			.content {
				.title {
					font-size: 28rpx;
					padding-left: 0;
				}

				.type {
					padding: 20upx 0;
					font-size: 24rpx;
					color: $u-tips-color;
					display: flex;
					justify-content: space-between;
				}

				.delivery-time {
					color: #e64340;
					padding-top: 10upx;
					font-size: 32rpx;
					font-weight: bold;
				}
			}

			.right {
				margin-left: 10rpx;
				padding-top: 20rpx;
				text-align: right;

				.decimal {
					font-size: 24rpx;
					margin-top: 4rpx;
				}

				.number {
					color: $u-tips-color;
					font-size: 24rpx;
				}
			}
		}

		.total {
			margin-top: 20rpx;
			text-align: right;
			font-size: 24rpx;

			.total-price {
				font-size: 32rpx;
			}
		}

		.bottom {
			display: flex;
			margin-top: 40rpx;
			padding: 0 10rpx;
			justify-content: space-between;
			align-items: center;

			.btn {
				line-height: 52rpx;
				width: 160rpx;
				border-radius: 26rpx;
				border: 2rpx solid $u-border-color;
				font-size: 26rpx;
				text-align: center;
				color: $u-type-info-dark;
			}

			.evaluate {
				color: $u-type-warning-dark;
				border-color: $u-type-warning-dark;
			}
		}
	}

	.body {
		background: #F1F2F3;

		.situation {
			padding: 0 20upx;
			background: #FFFFFF;
			margin-bottom: 20upx;
			padding-bottom: 100upx;

			.title {
				padding: 40upx 10upx 40upx 10upx;
				border-bottom: 1px solid #dddddd;
			}

			.richText {
				padding: 55upx 10upx 55upx 10upx;
				color: #333333;
				font-size: 30upx !important;
			}
		}

		.info {
			background: #FFFFFF;
			padding: 40upx 20upx 0 20upx;
			margin-bottom: 20upx;
			border-radius: 15rpx;

			.info_body {
				padding-left: 10upx;
				padding: 30upx 0;
				border-bottom: 1px solid #dddddd;

				.tag {
					margin-right: 20upx;
				}
			}

			.info_foot {
				padding-left: 10upx;
				padding-top: 40upx;
				padding-bottom: 10upx;

				.info_foot_left {
					font-size: 28upx;
					color: #666666;
					width: 120upx;
					display: inline-block;
					margin-right: 19upx;
				}

				.info_foot_right {
					font-size: 28upx;
					font-weight: bold;
					color: #333333;
				}

				/deep/ .u-col {
					margin-bottom: 40upx;
				}
			}
		}

		.head_box {
			border-radius: 15rpx;
			padding: 0 20upx 30upx 20upx;
			margin-bottom: 20upx;
			background: #FFFFFF;
			padding-bottom: 30upx;
		}

		.head_box_top {
			padding-left: 10upx;
			padding-bottom: 30upx;

			.time {
				display: flex;
				justify-content: space-between;
				padding: 37upx 0;

				.tag {
					margin-right: 10upx;
				}

				.time_right_text {
					color: #999999;
					font-size: 18upx;
				}
			}

			.title {
				padding-top: 37upx;
				font-size: 34upx;
				border-bottom: 0;
				padding-bottom: 0;
				font-weight: bold;
				color: #333333;
			}
		}

		.head_box_data {
			padding: 40upx 0;
			border-top: 1px solid #dddddd;
			border-bottom: 1px solid #dddddd;

			.data_box {
				text-align: center;
				height: 83upx;
				display: flex;
				flex-direction: column;
				justify-content: space-between;

				.data_box_top {
					font-size: 32upx;
					font-weight: bold;
					color: #e64340;
				}

				.data_box_bottom {
					font-size: 26upx;
					color: #999999;
				}
			}

			.border {
				border-right: 1px solid #dddddd;
				border-left: 1px solid #dddddd;
			}
		}
	}
</style>
