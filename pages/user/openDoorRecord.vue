<template>
	<!-- 意向管理 -->
	<page class="body">
		<z-paging ref="paging" v-model="dataList" @query="getInfo">
			<view slot="top" class="">
				<u-navbar title="开门记录" :border-bottom="false">
				</u-navbar>
				<!-- <view class="search">
					<u-search  @search="search" placeholder="请输入关键字" :show-action="false" v-model="keywordSearch"></u-search>
				</view> -->
			</view>
			<view class="content">
				<view class="card" v-for="(item,index) in dataList">
					<view class="head">
						<view class="head-left">
							{{item.deviceInstallAddress}}
						</view>
					</view>
					<view class="body">
						<view class="body-text">
							<text>{{item.empName || '无'}}</text>
						</view>
						<view class="body-text body-but-box">
							<view class="">
								<text>{{item.eventTime}}</text>
							</view>
							<view class="body-but">
								<text>{{item.eventName}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</z-paging>
	</page>
</template>

<script>
	export default {
		data() {
			return {
				keywordSearch:'',
				dataList: [],
			}
		},
		methods: {
			search() {
				this.$refs.paging.reload();
			},
			getInfo(pageNo, pageSize) {
				const params = {
					currPage: pageNo,
					pageSize: pageSize,
					// keywordSearch: this.keywordSearch
				}
				console.log(params);
				this.$api('equipment.openDoorRecord', params).then(res => {
					console.log(res);
					if (res.code == 200) {
						this.$refs.paging.complete(res.data.list);
					} else {
						this.$refs.paging.complete(false);
					}
			
				}).catch((e) => {
					this.$refs.paging.complete(false);
				});
			}
		},
		onShow() {
			this.$nextTick(()=>{
				this.$refs.paging.reload();
			})
		},
	}
</script>
<style>
	page {
		background-color: #f1f2f3;
	}
</style>
<style scoped lang="scss">
	.list_button {
		width: 110upx;
		border-radius: 5upx !important;
		font-size: 26upx;
		font-weight: bold;
	}


	.search {
		padding: 20upx 20upx;
		background-color: #ffffff;
	}

	.content {
		padding: 20upx;

		.card {
			background: #ffffff;
			border-radius: 15upx;
			margin-bottom: 10upx;

			.head {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 25upx 20upx;
				border-bottom: 1px solid $uni-border-color;

				.head-left {
					font-size: 32upx;
				}

				.head-right {
					font-size: 26upx;
					color: #1677ff;
				}
			}

			.body {
				padding: 30upx 20upx 0 20upx;

				.body-text {
					font-size: 26upx;
					color: $uni-text-color-prompt;
					padding-bottom: 20upx;

					.body-text-title {
						font-size: 28upx;
						color: $uni-text-color;
					}

				}

				.body-but-box {
					display: flex;
					justify-content: space-between;
				}
			}
		}
	}
</style>
