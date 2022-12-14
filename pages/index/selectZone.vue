<template>
	<page>
		<z-paging ref="paging" empty-view-text="暂无数据，请先添加园区" v-model="dataList" @query="getInfo">
			<view slot="top" class="">
				<u-navbar title="选择园区" :border-bottom="true">
				</u-navbar>
				<view class="search">
					<u-search @search="search" placeholder="请输入园区名称" :show-action="false" v-model="form.keywordSearch">
					</u-search>
				</view>
				<view class="head">
					<u-dropdown :selectData="selectData" ref="floorDropdown" :border-bottom="true"
						active-color="#e35d5d" menu-icon="xialasanjiao" menu-icon-size="20">
						<u-dropdown-item :title="selectData[0] ?selectData[0].name:'省份'">
							<scroll-view scroll-y scroll-with-animation class="u-tab-view menu-scroll-view">
								<block v-if="provinceList.length>0">
									<view v-for="(item,index) in provinceList" :key="index" class="u-tab-item"
										:class="[item.active ? 'u-tab-item-active' : '']" :data-current="index"
										@click.stop="floorScroll(item,provinceList,0)">
										<text class="u-line-1">{{item.name}}</text>
									</view>
								</block>
								<view v-else class="u-tab-item prompt">
									暂无数据
								</view>
							</scroll-view>
						</u-dropdown-item>
						<u-dropdown-item :title="selectData[1] ?selectData[1].name:'城市'">
							<scroll-view scroll-y scroll-with-animation class="u-tab-view menu-scroll-view">
								<block v-if="cityList.length>0">
									<view v-for="(item,index) in cityList" :key="index" class="u-tab-item"
										:class="[item.active ? 'u-tab-item-active' : '']" :data-current="index"
										@click.stop="floorScroll(item,cityList,1)">
										<text class="u-line-1">{{item.name}}</text>
									</view>
								</block>

								<view v-else class="u-tab-item prompt">
									请先选择省份！
								</view>
							</scroll-view>
						</u-dropdown-item>
						<u-dropdown-item :title="selectData[2] ?selectData[2].name:'地区'">
							<scroll-view scroll-y scroll-with-animation class="u-tab-view menu-scroll-view">
								<block v-if="districtList.length>0">
									<view v-for="(item,index) in districtList" :key="index" class="u-tab-item"
										:class="[item.active ? 'u-tab-item-active' : '']" :data-current="index"
										@click.stop="floorScroll(item,districtList,2)">
										<text class="u-line-1">{{item.name}}</text>
									</view>
								</block>
								<view v-else class="u-tab-item prompt">
									请先选择城市！
								</view>
							</scroll-view>
						</u-dropdown-item>
					</u-dropdown>
				</view>
			</view>
			<view class="">
				<view class="order" @click="clickZone(item)" v-for="(item, index) in dataList" :key="item.id">
					<view class="left">
						<u-image style="margin-right: 20rpx;" :fade="false" shape="circle" width="100" height="100"
							src="https://img1.baidu.com/it/u=3420584700,3273220013&fm=26&fmt=auto&gp=0.jpg"></u-image>
					</view>
					<view class="right">
						<view class="title">
							<text>{{item.name}}</text>
							<view class="title-right">
								成立时间：{{item.established}}
							</view>
						</view>
						<view class="">
							{{item.province}}/{{item.city}}/{{item.district}}
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
				selectData: [],
				provinceList: [],
				cityList: [],
				districtList: [],
				dataList: [],
				form: {

				}
			};
		},
		methods: {
			clickZone(item) {
				uni.setStorageSync('zoneInfo', item);
				let pages = getCurrentPages()
				console.log(pages);
				uni.$emit('refreshData');
				if(pages.length>2){
					this.$Router.back(1)
				}else{
					this.$tools.routerTo('/pages/index/index', {}, true)
				}
				
			},
			getInfo(pageNo, pageSize) {
				this.form.currPage = pageNo
				this.form.pageSize = pageSize
				this.selectData.forEach((item, index) => {
					switch (index) {
						case 0:
							this.form.province = this.selectData[0].name || ''
							break;
						case 1:
							this.form.city = this.selectData[1].name || ''
							break;
						case 2:
							this.form.district = this.selectData[2].name || ''
							break;
					}
				})
				this.$api('zoneInfo.zoneList', this.form).then(res => {
					console.log(res);
					this.$refs.paging.complete(res.data.list);

				}).catch((e) => {
					this.$refs.paging.complete(false);
				});
			},
			search() {
				this.$refs.paging.reload();
			},
			floorScroll(res, arr, indexSelect) {
				if (indexSelect === 0) {
					this.$set(this.selectData, 1, '')
					this.$set(this.selectData, 2, '')
					this.$enum.addressEnum({
						pid: res.code
					}, (res) => {
						this.cityList = res.map((item) => {
							item.active = false
							return item
						})
					})
				}
				if (indexSelect === 1) {
					this.$set(this.selectData, 2, '')
					this.$enum.addressEnum({
						pid: res.code
					}, (res) => {
						this.districtList = res.map((item) => {
							item.active = false
							return item
						})
					})
				}
				arr.forEach((item) => {
					if (res.code === item.code) {

						item.active = true
					} else {
						item.active = false
					}
				})
				this.$set(this.selectData, indexSelect, res)
				this.$refs.paging.reload(false);
				this.$refs.floorDropdown.close();
			},
		},
		onLoad() {
			this.$enum.addressEnum({
				pid: ''
			}, (res) => {
				this.provinceList = res.map((item) => {
					item.active = false
					return item
				})
			})
		}
	}
</script>
<style>
	page {
		height: 100%;
		background-color: #f1f2f3;
	}
</style>
<style scoped lang="scss">
	/deep/ .u-dropdown__menu__item__text {
		max-width: 170upx;
	}

	.prompt {
		font-size: 26upx !important;
		color: #999999 !important;
	}

	.head {
		background-color: #ffffff;
		margin-bottom: 20upx;

		.u-tab-item-active {
			color: #e35d5d !important;
		}

		.u-tab-view {
			height: 500upx;
		}

		.u-tab-item {
			height: 110rpx;
			background: #FFFFFF;
			box-sizing: border-box;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 30rpx;
			color: #333333;
			font-weight: 400;
			line-height: 1;
		}
	}

	.search {
		padding: 20upx 20upx;
		background: #FFFFFF;
	}

	.order {
		background-color: #ffffff;
		border-radius: 15upx;
		box-sizing: border-box;
		padding: 20upx 20upx;
		margin-bottom: 10upx;
		font-size: 28rpx;
		display: flex;

		.left {
			font-size: 30rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			color: #333333;
		}

		.right {
			display: flex;
			width: 100%;
			height: auto;
			flex-direction: column;
			justify-content: space-between;

			.title {
				font-size: 32upx;
				color: #333333;
				display: flex;
				justify-content: space-between;
				align-items: center;

				.title-right {
					font-size: 22upx;
					color: $uni-text-color-placeholder;
					margin-right: -10upx;
				}
			}

			font-size: 26rpx;
			color: #666666;
		}
	}
</style>
