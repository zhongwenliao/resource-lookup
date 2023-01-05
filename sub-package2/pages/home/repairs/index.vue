<template>
	<page class="body">
		<!-- 有数据时 -->
		<z-paging
			:auto="false"
			ref="paging"
			v-model="dataList"
			@query="getInfo"
			:emptyViewText="'暂无信息,请先发布信息'"
			:emptyViewImg="'http://yuanzhoulvwego.com/wp-content/uploads/static/home/repairs/fabuxinxi.png'"
			:emptyViewStyle="{ 'margin-top': '-200upx' }"
			:emptyViewImgStyle="{ 'width': '641upx', 'height': '297upx' }">
			<view slot="top" class="tops" :style="topBackground">
				<u-navbar title="" :border-bottom="false" back-icon-color="#ffffff" :background="navbarBackground"></u-navbar>
			</view>
			<view class="content">
				<view class="boxs" v-for="(item, index) in dataList" @click="goRepairProgress(item.id)">
					<view class="boxs-top">
						<view class="boxs-top-image" >
							<u-image width="30upx" height="30upx" src="http://yuanzhoulvwego.com/wp-content/uploads/static/home/repairs/weixiu.png"></u-image>
						</view>
						<span class="u-font-32 boxs-top-text">{{ item.classificationName }}</span>
					</view>
					<view class="boxs-center">
						<view class="boxs-center-left">
							<view class="u-m-t-10">维修地址：{{ item.roomName }}</view>
							<view class="u-m-t-10">报修时间：{{ item.repairTime }}</view>
						</view>
						<view class="boxs-center-right" :class="item.processingStatus !== 4 ? 'bules' : 'grays'">
							{{ item.processingStatus === 0 || item.processingStatus === 1 ? '待处理' :
								(item.processingStatus === 4 ? '已完成' : '处理中') }}
						</view>
					</view>
				</view>
			</view>
			<u-toast ref="uToast" />
			<!-- 没有数据时 -->
		</z-paging>
		<!-- 报修按钮 -->
		<view class="fixed" @click="goRepairApplication" v-if="$permission(['zoneRepair:addZoneRepair'])">
			<u-image width="158upx" height="164upx" src="http://yuanzhoulvwego.com/wp-content/uploads/static/home/repairs/baoxiu.png"></u-image>
		</view>
	</page>
</template>

<script>
	export default {
		data() {
			return {
				// 当前租户id
				enterpriseId: uni.getStorageSync("userInfo").enterpriseId,
				// 列表
				dataList: [],
				// 导航栏的背景图
				topBackground: {
					backgroundImage: 'url(' + 'http://yuanzhoulvwego.com/wp-content/uploads/static/home/repairs/chahua.png' + ')',
					backgroundSize: '100% 100%',
					backgroundRepeat: 'no-repeat'
				},
				// 导航栏的背景颜色不赋予颜色
				navbarBackground: {
					backgroundColor: ''
				}
			}
		},
		onShow() {
			this.$nextTick(() => {
				this.$refs.paging.reload();
			})
		},
		onReady() {
			if (uni.getStorageSync('zoneInfo').id) {
				console.log("I have got");
			}else{
				this.$refs.uToast.show({
					title: '请先选择园区',
					type: 'error'
				})
			}
		},
		methods: {
			getInfo(pageNo, pageSize) {
				let that = this
				const params = {
					currPage: pageNo,
					pageSize: pageSize,
					enterpriseId: that.enterpriseId
				}
				that.$api('repairs.getMaintenanceInfoList', params).then(res => {
					if (res.code == 200) {
						that.$refs.paging.complete(res.data.list)
					} else {
						that.$refs.paging.complete(false);
					}
				}).catch((e) => {
					that.$refs.paging.complete(false);
				});
			},
			// 跳转到报修申请页
			goRepairApplication() {
				this.$Router.push({
					path: '/pages/home/repairs/repairApplication'
				});
			},
			// 跳转到报修进度页
			goRepairProgress(id) {
				this.$Router.push({
					path: '/pages/home/repairs/repairProgress',
					query: { id: id }
				});
			}
		}
	}
</script>

<style>
	page {
		background: #F9F9F9;
	}
</style>
<style lang="scss" scoped>
	.body {
		.tops {
			height: 340upx;
		}
		.content {
			padding: 20upx;
			.boxs {
				height: 214upx;
				background: #FFFFFF;
				border-radius: 15upx;
				margin-bottom: 20upx;
				padding: 30upx 20upx 30upx 10upx;
				position: relative;
				.boxs-top {
					height: 50upx;
					line-height: 50upx;
					.boxs-top-image {
						height: 50upx;
						display: inline-block;
						vertical-align: middle;
						margin-right: 10upx;
					}
					.boxs-top-text {
						font-weight: bold;
					}
				}
				.boxs-center {
					.boxs-center-left {
						display: inline-block;
						width: 82%;
					}
					.boxs-center-right {
						color: white;
						width: 120upx;
						height: 60upx;
						text-align: center;
						line-height: 60upx;
						border-radius: 6upx;
						position: absolute;
						right: 20upx;
						top: 50%;
						transform: translateY(-50%);
					}
				}
			}
		}
		.fixed {
			position: fixed;
			right: 44upx;
			bottom: 172upx;
		}
		.bules {
			background-color: #3E76F4;
		}
		.grays {
			background-color: #CCCCCC;
		}
	}
</style>
