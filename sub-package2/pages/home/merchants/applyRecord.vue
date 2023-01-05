<template>
	<page>
		<z-paging ref="paging" v-model="dataList" @query="getInfo">
			<view slot="top" class="">
				<u-navbar class="navbar" :title="pageType ? '我的收藏' : '申请记录'" :border-bottom="false">
					<view v-if="pageType" @click="deleteApply" class="u-font-lg" slot="right">
						{{showChecked?'取消':'删除'}}
					</view>
				</u-navbar>
				<u-gap height="20" bg-color="#f1f2f3"></u-gap>
			</view>
			<view class="content-years" v-for="(item,index) in dataList" :key="index">
				<view class="u-flex u-p-30" style="margin: 0rpx 0 20rpx 0;background: #FFFFFF;border-radius: 15upx;">
					<u-checkbox size="35" v-if="showChecked" @change="checkbox" class="checkbox" v-model="item.checked"
						shape="circle">
					</u-checkbox>
					<view class="" style="width: 100%;">
						<view class="" @click="goDetails(item)" style="width: 100%;">
							<view class="card-box u-flex-1"
								style="display: flex;background: #fff;border-radius: 15upx;width: 100%;">
								<view class="u-m-r-14">
									<u-image width="168" height="134" :src="pageType == 0 ? item.investment.images[0] : item.record.images[0]"></u-image>
								</view>
								<view class="u-flex-col u-row-between" style="flex-grow: 1;">
									<view class="u-font-lg u-main-color u-line-2 u-m-b-15" style="width: 100%;">
										{{ pageType == 0 ? `${item.buildName}/${item.floorName}/${item.roomName}` : 
										`${item.record.buildName}/${item.record.floorName}/${item.record.roomName}` }}
									</view>
									<view class="u-flex u-row-between  ">
										<text class="u-type-price u-font-32 u-text-bold">
											{{ pageType == 0 ? item.investment.rentMonth : item.record.rentMonth }}元
										</text>
										<text class="u-tips-color u-font-26">{{ item.createTime.split(' ')[0] }}</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view slot="bottom" v-if="showChecked">
				<view class="but_box u-flex u-row-between">
					<view class="u-m-l-40 u-flex">
						<u-checkbox @change="checkboxAll" v-model="checkedAll" shape="circle">全选
						</u-checkbox>
					</view>
					<view class="right-but_box" @click="intentionApply">
						删除
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
				pageType: 0, //0为申请记录， 1为收藏
				title: '',
				dataList: [],
				showChecked: false,
				checkedAll: false,
			};
		},
		onLoad() {
			this.pageType = this.$Route.query.pageType
		},
		onShow() {
			this.$nextTick(() => {
				this.$refs.paging.reload();
			})
		},
		methods: {
			goDetails(res){
				let item =  this.pageType == 0 ? res.investment : res.record
				this.$Router.push({
					path: "/pages/home/merchants/detailsMerchants",
					query: item
				});
			},
			deleteApply() {
				this.showChecked = !this.showChecked
			},
			getInfo(pageNo, pageSize) {
				let arr = []
				if (this.pageType == 0) {
					let params = {
						currPage: pageNo,
						pageSize: pageSize,
						personId: uni.getStorageSync('userInfo').id,
					}
					this.$api('merchants.intentionApplyList', params).then(res => {
						if (res.code == 200) {
							arr = res.data.list.map((item) => {
								if (this.checkedAll) {
									item.checked = true
								}

								return item
							})
							
							this.$refs.paging.complete(arr);
						} else {
							this.$refs.paging.complete(false);
						}
					})
				} else {
					let params = {
						currPage: pageNo,
						pageSize: pageSize,
					}
					this.$api('merchants.getCollectList', params).then(res => {
						if (res.code == 200) {
							arr = res.data.list.map((item) => {
								if (this.checkedAll) {
									item.checked = true
								}
								return item
							})
							this.$refs.paging.complete(arr);
						} else {
							this.$refs.paging.complete(false);
						}
					})
				}

			},
			checkbox() {
				let arr = this.dataList.filter((item) => {
					return item.checked == true
				});
				this.checkedAll = (arr.length == this.dataList.length)
			},
			checkboxAll(res) {
				this.dataList.forEach((item) => {
					item.checked = res.value
				})
			},
			// 批量删除
			intentionApply() {
				let ids = this.dataList.filter((item) => {
					return item.checked == true
				}).map(mitem => mitem.id).join()
				this.$api('merchants.delCollect', { ids: ids}).then(res => {
					uni.showToast({
						title: res.msg ||  '请求出错,稍后重试',
						icon: 'none',
						duration: 1000,
						mask: true,
					});
					if (res.code == 200) {
						this.$refs.paging.reload();
						this.showChecked = false
					}
				})
			}
		}
	}
</script>
<style>
	page {
		height: 100%;
		background-color: #F9F9F9;
	}
</style>
<style scoped lang="scss">
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

	.checkbox {
		/deep/ .u-checkbox__label {
			margin: 16upx;
		}
	}
</style>
