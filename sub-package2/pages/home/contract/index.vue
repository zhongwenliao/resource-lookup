<template>
	<page>
		<view class="top-top" :style="topBackground">
			<u-navbar title="" :border-bottom="false" back-icon-color="#ffffff" :background="navbarBackground">
			</u-navbar>
		</view>
		<view class="u-p-20">
			<view class="">
				<block v-if="contractList.length>0">
					<view v-for="(item,index) in contractList" class="card" @click="goContractInfo(item)">
						<view class="head">
							<view class="head-left">
								<u-icon class="u-m-r-10" name="https://file.yuanzhoulvwego.com/prod/uploadFiles/home/contract/hetong.png" size="30"></u-icon>
								合同编号{{item.contractCode}}
							</view>
							<view v-if="item.contractStatus<2" class="head-right" style="color: #3E76F4;">
								进行中
							</view>
							<view v-else class="head-right" style="color: #666666;">
								已过期
							</view>
						</view>
						<view class="body">
							<view class="body-text body-but-box">
								<view class="u-m-b-10 u-flex-row">
									<view class="u-m-r-10">
										租用地址: 
									</view>
									
									<view class="">
										<view v-for="(item2,index2) in item.rooms" class="">
											{{item2.ownedBuilding}}/{{item2.name}}
										</view>
									</view>
								</view>
								<view class="u-m-b-10">
									租用企业: {{item.enterpriseInfo.companyName}}
								</view>
								<view class="u-m-b-10">
									租赁单价: {{item.enterpriseInfo.rentMonth}}元/m2
								</view>
								<view class="u-m-b-10">
									合同期限: {{item.contractDate}} - {{item.expiryDate}}
								</view>
							</view>
						</view>
					</view>
				</block>
				<view v-else class="u-m-t-150 u-text-center u-font-sm">
					<u-image width="100%" height="300rpx" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/home/contract/zanwuhetong.png"></u-image>
					<text class="u-m-t-20" style="color: #999999;">暂无合同</text>
				</view>
			</view>
		</view>
	</page>
</template>

<script>
	export default {
		data() {
			return {
				contractList: [],
				topBackground: {
					backgroundImage: 'url(' + 'https://file.yuanzhoulvwego.com/prod/uploadFiles/home/contract/chahua.png' + ')',
					backgroundSize: '100% 100%',
					backgroundRepeat: 'no-repeat'
				},
				// 导航栏的背景颜色不赋予颜色
				navbarBackground: {
					backgroundColor: ''
				},
			};
		},
		onLoad() {
			this.getInfo()
		},
		methods: {
			getInfo() {
				const params = {
					currPage: 1,
					pageSize: 100,
				}
				this.$api('contract.contractList', params).then(res => {
					if (res.code == 200) {
						this.contractList = res.data.list
						console.log(res);
					}

				})
			},
			goContractInfo(data) {
				this.$Router.push({
					path: '/sub-package2/pages/home/contract/contractInfo',
					query:{
						id:data.id
					}
				});
			},
		}

	}
</script>
<style>
	page {
		background: #F9F9F9;
	}
</style>
<style scoped lang="scss">
	.card {
		background: #ffffff;
		border-radius: 15upx;
		margin-bottom: 24upx;

		.head {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20upx 20upx 20upx 10upx;
			border-bottom: 1px solid #F1F2F3;
			font-size: 32upx;
			font-weight: bold;

			.head-left {
				display: flex;
				align-items: center;
			}
		}

		.body {
			padding: 30upx 20upx 20upx 10upx;
		}
	}

	.top-top {
		height: 343upx;

		.top-top-title {
			text-align: center;
			color: #FFFFFF;
			font-size: 40upx;
		}
	}
</style>
