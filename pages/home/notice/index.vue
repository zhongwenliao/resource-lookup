<template>
	<page>
		<z-paging ref="paging" v-model="dataList" @query="getInfo">
			<view slot="top" class="">
				<u-navbar title="园区通知" :border-bottom="false">
				</u-navbar>
			</view>
			<view class="u-p-t-30">
				<u-cell-group :border="false">
					<view v-for="(item,index) of dataList" :key="index" @click="goNotice(item.id)" class="u-p-l-40 u-p-r-40">
						<u-cell-item :title-style="{fontSize:'30upx'}" :border-bottom="false" :title="item.title" value="">
							<view slot="icon" :style="{backgroundColor: noticeColor(index)}" class="yuan">
							</view>
						</u-cell-item>
					</view>
				</u-cell-group>
			</view>
		</z-paging>
	</page>
</template>

<script>
	export default {
		data() {
			return {
				dataList: [],
			};
		},
		computed: {
			noticeColor: function() {
				return function(index) {
					if(index==0){
						return '#DC6060'
					}
					if(index==1){
						return '#609ddc'
					}
					if(index==2){
						return '#dca660'
					}
					return '#cccccc'
				}
			}
		},
		methods: {
			goNotice(id) {
				this.$Router.push({
					path: '/pages/home/notice/noticeInfo',
					query: {
						id
					}
				});
			},
			getInfo(pageNo, pageSize) {
				const params = {
					currPage: pageNo,
					pageSize: pageSize,
				}
				this.$api('notice.noticeList', params).then(res => {
					console.log(res);
					if (res.code == 200) {
						if (this.checkedAll) {
							res.data.list.forEach((res) => {
								res.checked = true
							})
						}
						this.$refs.paging.complete(res.data.list);
					} else {
						this.$refs.paging.complete(false);
					}
			
				}).catch((e) => {
					this.$refs.paging.complete(false);
				});
			},
		}
	}
</script>

<style scoped lang="scss">
	.yuan {
		width: 20upx;
		height: 20upx;
		border-radius: 50%;
		margin-right: 12upx;
	}

	/deep/ .u-cell {
		padding: 20upx 0;
		border-bottom: 1upx solid $uni-border-color;
	}

	/deep/ .u-cell_title {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		word-break: break-all;
	}
</style>
