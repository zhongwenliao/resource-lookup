<template>
	<!-- 更多 -->
	<view>
		<u-navbar title="更多" :border-bottom="true">
		</u-navbar>
		<view class="content">
			<view class="content-head">
				<view class="title">
					租金信息
				</view>
				<view class="u-p-10">
					<view class="unit">
						<view class="left">
							月租金
						</view>
						<view class="right">
							{{ customerInfo.incrementalRent.length?customerInfo.incrementalRent[0].rentMonth:0  }}元
						</view>
					</view>
					<view class="unit">
						<view class="left">
							管理费
						</view>
						<view class="right">
							{{ customerInfo.propertyCosts}}元
						</view>
					</view>
					<view class="unit">
						<view class="left">
							押金
						</view>
						<view class="right">
							{{ customerInfo.deposit}}元
						</view>
					</view>
					<view class="unit">
						<view class="left">
							租金递增率
						</view>
						<view class="right">
							{{ customerInfo.incrementalRent.length?customerInfo.incrementalRent[0].rentIncreaseRate:0 }}%
						</view>
					</view>
					<view class="unit">
						<view class="left">
							签约时间
						</view>
						<view class="right">
							{{ customerInfo.contractDate}}
						</view>
					</view>
					<view class="unit">
						<view class="left">
							到期时间
						</view>
						<view class="right">
							{{ customerInfo.expiryDate}}
						</view>
					</view>
					<view class="unit">
						<view class="left">
							合同年限
						</view>
						<view class="right">
							{{ customerInfo.contractExpiry}}年
						</view>
					</view>
					<!-- <view class="unit">
						<view class="left">
							支付方式
						</view>
						<view class="right">
							月付
						</view>
					</view> -->
					<view class="unit">
						<view class="left">
							是否含税
						</view>
						<view class="right">
							{{isIncludeTaxList[customerInfo.isIncludeTax].label}}
						</view>
					</view>
				</view>
				<view v-if="customerInfo.otherFee.length>0" class="title">
					其他费用
				</view>
				<view class="u-p-10">
					<view class="unit" v-for="(item,index) in customerInfo.otherFee">
						<view class="left">
							{{item.feeName || '--'}}
						</view>
						<view class="right">
							<view class="">
								金额：{{item.amount || '0'}}
							</view>
							<view class="">
								税率：{{item.taxRate  || '0'}}
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				customerInfo: {},
				isIncludeTaxList: this.$enum.isIncludeTax,
			}
		},
		onReady() {

		},
		methods: {

		},
		onLoad() {
			console.log(this.$Route.query);
			this.customerInfo = this.$Route.query
		},
		onShow() {

		},
	}
</script>
<style scoped lang="scss">
	.content {
		padding-top: 20upx;
		background: #F9F9F9;
	}

	.content-head {

		background: #FFFFFF;
		border-radius: 15px;
		padding: 30upx;
	}

	.title {
		font-size: 34upx;
		color: #333333;
		font-weight: bold;
		margin-bottom: 15upx;
	}

	.unit {
		display: flex;
		justify-content: space-between;
		padding: 20upx 0upx 15upx 0upx;

		.left {
			font-size: 30upx;
			color: #333333;
		}

		.right {
			font-size: 30upx;
			color: #333333;
		}
	}
</style>
