<template>
	<page style="width: 100%;overflow:auto !important;">
		<u-navbar :is-fixed="false" class="navbar" title="我的账单" title-color="#fff" back-icon-color="#fff"
			:background="{background: ''}" :border-bottom="false">
			<view v-if="billInfo.hydropowerDetails" @click="goDetails" style="color: #FFFFFF;" slot="right">
				查看详情
			</view>
		</u-navbar>
		<view style="padding:20upx 20upx 50upx 20upx;">
			<view class="head u-m-b-20">
				<view class="main main-top u-flex u-text-bold u-font-xl">
					<view class="u-text-center" style="width: 100%">
						{{ billInfo.month || '' }}月缴费通知单
					</view>
				</view>
				<view class="main-bottom">
					<view class="line"></view>
					<view class="connector1"></view>
					<view class="connector2"></view>
					<view class="u-row-between u-p-b-40" style="width: 100%">
						<view class="u-text-bold u-p-t-20 u-p-b-10 u-p-l-20 u-p-r-20">
							<view v-if="billInfo.billNumber!=undefined" class="u-p-5">
								<text class="main-bottom-text">账单编号：</text>
								<view class="main-bottom-view">{{ billInfo.billNumber || '--' }}</view>
							</view>
							<view v-if="billInfo.companyName!=undefined" class="u-p-5">
								<text class="main-bottom-text">租户名称：</text>
								<view class="main-bottom-view">{{ billInfo.companyName || '--' }}</view>
							</view>
							<view v-if="billInfo.rooms!=undefined" class="u-p-5">
								<text class="main-bottom-text">租赁地址：</text>
								<view class="main-bottom-view">{{ billInfo.rooms || '--' }}</view>
							</view>
							<view v-if="billInfo.contractCode!=undefined" class="u-p-5">
								<text class="main-bottom-text">合同编号：</text>
								<view class="main-bottom-view">{{ billInfo.contractCode  || '--'}}</view>
							</view>
							<view v-if="billInfo.publicInfo!=undefined">
								<view class="u-p-5">
									<text class="main-bottom-text">开户名：</text>
									<view class="main-bottom-view">{{ billInfo.publicInfo.bankAccountName  || '--'}}</view>
								</view>
								<view class="u-p-5">
									<text class="main-bottom-text">银行卡号：</text>
									<view class="main-bottom-view">{{ billInfo.publicInfo.bankCardNumber  || '--'}}</view>
								</view>
								<view class="u-p-5">
									<text class="main-bottom-text">开户银行：</text>
									<view class="main-bottom-view">{{ billInfo.publicInfo.depositaryBank  || '--'}}</view>
								</view>
							</view>
							<!-- <view v-if="billInfo.accountPeriod!=undefined" class="u-p-5">
								账单日期：{{ billInfo.accountPeriod || '--' }}
							</view> -->
							<view v-if="billInfo.collectionDeadline!=undefined" class="u-p-5 u-m-b-20">
								收款截止日期：{{ billInfo.collectionDeadline || '--' }}
							</view>
							<!-- 提示 -->
							<view v-if="billInfo.remark!=undefined && billInfo.remark.length > 0" class="tishi u-font-22 u-content-color">
								<u-icon name="info-circle" color="#3E76F4" size="28" top="1" style="vertical-align: top;"></u-icon>
								<text class="u-m-l-15 main-bottom-texts"> 提示：</text>
								<view class="main-bottom-views">{{ billInfo.remark }}</view>
							</view>
							<!-- <view class="biaoqian u-m-r-20">
								<view class="time-bg">
									<view class="">
										<view
											style="display:flex; flex-wrap:wrap;line-height: 24upx;justify-content: center;"
											class="">
											<text style="display:block;">{{billInfo.month || ''}}月</text>
										</view>
										<view
											style="display:flex; flex-wrap:wrap;line-height: 24upx;justify-content: center;"
											class="">
											<text style="display:block;">账单</text>
										</view>
									</view>
								</view>
							</view> -->
						</view>

					</view>
				</view>
			</view>
			<view class="foot u-p-t-30">
				<view v-if="billInfo.rent!=undefined" class="card u-border-bottom">
					<view class="card-title u-p-20 u-flex u-row-between">
						<view class="card-title-left u-font-lg2 u-font-weight">
							租金
							<text v-if="billInfo.fwHtContractInfo.rentalTaxRate" class="u-type-price">（不含税）</text>
						</view>
						<view class="card-title-right u-font-weight">
							￥{{ billInfo.rent}}
						</view>
					</view>
				</view>

				<view v-if="billInfo.waterFee!=undefined" class="card u-border-bottom">
					<view class="card-title u-p-20 u-flex u-row-between">
						<view class="card-title-left u-font-lg2 u-font-weight">
							水费
							<text v-if="billInfo.fwHtContractInfo.waterTaxRate" class="u-type-price">（不含税）</text>
						</view>
						<view class="card-title-right u-font-weight">
							￥{{ billInfo.waterFee}}
						</view>
					</view>
					<view class="u-flex u-m-l-20 u-font-28" style="padding-bottom: 26rpx;"
						v-if="billInfo.fwHtContractInfo.basicWaterFee && billInfo.fwHtContractInfo.comprehensiveWaterFee">
						<view style="width: 50%;">基础水费:{{ billInfo.basicWaterFeeAll }}元</view>
						<view>综合水费:{{ billInfo.comprehensiveWaterFeeAll }}元</view>
					</view>
				</view>
				<view v-if="billInfo.electricityBill!=undefined" class="card u-border-bottom">
					<view class="card-title u-p-20 u-flex u-row-between">
						<view class="card-title-left u-font-lg2 u-font-weight">
							电费
							<text v-if="billInfo.fwHtContractInfo.electricityTaxRate" class="u-type-price">（不含税）</text>
						</view>
						<view class="card-title-right u-font-weight">
							￥{{ billInfo.electricityBill}}
						</view>
					</view>
					<view class="u-flex u-m-l-20 u-p-b-26 u-font-28"
						v-if="billInfo.fwHtContractInfo.basicElectricityPrice && billInfo.fwHtContractInfo.comprehensiveElectricityPrice">
						<view style="width: 50%;">基础电费:{{ billInfo.basicElectricityPriceAll }}元</view>
						<view>综合电费:{{ billInfo.comprehensiveElectricityPriceAll }}元</view>
					</view>
				</view>
				<view v-if="billInfo.propertyCosts!=undefined" class="card u-border-bottom">
					<view class="card-title u-p-20 u-flex u-row-between">
						<view class="card-title-left u-font-lg2 u-font-weight">
							物业管理费
							<text v-if="billInfo.fwHtContractInfo.managementFeeRate" class="u-type-price">（不含税）</text>
						</view>
						<view class="card-title-right u-font-weight">
							￥{{ billInfo.propertyCosts}}
						</view>
					</view>
				</view>
				<view v-if="billInfo.lateFee!=undefined" class="card u-border-bottom">
					<view class="card-title u-p-20 u-flex u-row-between">
						<view class="card-title-left u-font-lg2 u-font-weight">
							滞纳金
							<text v-if="billInfo.lateFeeDay" class="u-type-price">（逾期{{billInfo.lateFeeDay}}天）</text>
						</view>
						<view class="card-title-right u-font-weight">
							￥{{ billInfo.lateFee}}
						</view>
					</view>
				</view>
				<view v-if="billInfo.taxes!=undefined" class="card u-border-bottom">
					<view class="card-title u-p-20 u-flex u-row-between">
						<view class="card-title-left u-font-lg2 u-font-weight">
							税费
						</view>
						<view class="card-title-right u-font-weight">
							￥{{ billInfo.taxes}}
						</view>
					</view>
				</view>
				<view v-if="billInfo.otherFee!=undefined" class="card">
					<view class="card-title u-p-20 u-flex u-row-between">
						<view class="card-title-left u-font-lg2 u-font-weight">
							其他费用
						</view>
						<view class="card-title-right u-font-weight">
							￥{{ billInfo.otherFee}}
						</view>
					</view>
					<view class="u-flex u-m-l-20 u-p-b-4 u-font-28" v-for="item in billInfo.otherFeeList">
						<view style="width: 50%;">{{ item.feeName }}</view>
						<view>费用:{{ item.amount }}元</view>
					</view>
					<view class="u-m-20" style="position: relative;">
						<view class="line1"></view>
					</view>
				</view>
				<view v-if="billInfo.totalReceivable!=undefined" class="card-combined u-p-b-10">
					<view class="card-title u-p-20 u-font-lg2 u-flex u-row-between">
						<view class="card-title-left u-font-weight">
							合计：
						</view>
						<view class="card-title-right u-type-price u-font-weight">
							{{ billInfo.totalReceivable}}元
						</view>
					</view>
				</view>
				<view v-if="billInfo.totalReceived > 0" class="card-combined u-p-t-10 u-p-b-10">
					<view class="card-title u-p-l-20 u-p-r-20 u-p-b-20 u-font-lg2 u-flex u-row-between">
						<view class="card-title-left u-font-weight">
							实际收款：
						</view>
						<view class="card-title-right u-type-price u-font-weight">
							{{ billInfo.totalReceived}}元
						</view>
					</view>
				</view>
			</view>
			<!-- 说明 -->
			<view class="u-p-t-40 u-p-l-20 u-p-r-20" v-if="billInfo.totalReceived === 0">
				<view class="u-p-b-8">说明</view>
				<text class="u-font-24">{{ billInfo.illustrate || '暂无' }}</text>
			</view>
		</view>
		<!-- <view class="but_box u-flex u-row-between">
			<view class="u-font-lg2 u-m-l-30">
				<text class="card-title-left">
					合计：
				</text>
				<text class="card-title-right u-type-price">
					{{ billInfo.totalReceivable  || '0'}}元
				</text>
			</view>
			<view class="right-but_box" @click="goPay">
				立即结算
			</view>
		</view> -->
	</page>
</template>

<script>
	export default {
		data() {
			return {
				billInfo: {}
			};
		},
		onLoad() {
			this.getInfo()
		},
		methods: {
			goDetails() {
				this.$Router.push({
					path: '/sub-package2/pages/home/billPay/billDetails',
					query:this.billInfo
				});
			},
			getInfo() {
				this.$api('billPay.billPreview', {
					id: this.$Route.query.id
				}).then(res => {
					if (res.code == 200) {
						res.data.month = this.$Route.query.month
						this.billInfo = res.data
						// 计算所有房间的总用水量(每个房间的每个水表的用量*每个水表的倍率)
						this.billInfo.monthlyWaterBill = this.billInfo.hydropowerDetails.reduce((sum, item) => {
							return sum + item.detailsList1.reduce((dsum, ditem) => { return dsum + (ditem.readNow - ditem.readBefore) *
							ditem.magnification }, 0) }, 0)
						// 基础总水费（所有房间的总用水量*基础水费）
						this.billInfo.basicWaterFeeAll = Math.round((this.billInfo.fwHtContractInfo.basicWaterFee *
							this.billInfo.monthlyWaterBill) * 100) / 100
						// 综合总水费（所有房间的总用水量*综合水费）
						this.billInfo.comprehensiveWaterFeeAll = Math.round((this.billInfo.fwHtContractInfo.comprehensiveWaterFee *
							this.billInfo.monthlyWaterBill) * 100) / 100
						// 计算所有房间的总用电量(每个房间的每个电表的用量*每个电表的倍率)
						this.billInfo.monthlyElectricityBill = this.billInfo.hydropowerDetails.reduce((sum, item) => {
							return sum + item.detailsList0.reduce((dsum, ditem) => { return dsum + (ditem.readNow - ditem.readBefore) *
							ditem.magnification }, 0) }, 0)
						// 基础总电费（所有房间的总用电量*基础电费）
						this.billInfo.basicElectricityPriceAll = Math.round((this.billInfo.fwHtContractInfo.basicElectricityPrice *
							this.billInfo.monthlyElectricityBill) * 100) / 100
						// 综合总电费（所有房间的总用电量*综合电费）
						this.billInfo.comprehensiveElectricityPriceAll = Math.round((this.billInfo.fwHtContractInfo.comprehensiveElectricityPrice *
							this.billInfo.monthlyElectricityBill) * 100) / 100
						uni.showToast({
							title: res.msg || '请求出错,稍后重试',
							icon: 'none',
							duration: 500,
							mask: true
						});
					}
				})
			},
			goPay() {
				this.$Router.push({
					path: '/sub-package2/pages/home/billPay/pay',
				});
			},
		}
	}
</script>
<style>
	page {
		background: linear-gradient(-8deg, #FFFFFF, #3E76F4);
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

	.tishi {
		padding: 15upx 10upx;
		border-radius: 5upx;
		background: #F1F2F3;
	}

	.biaoqian {
		position: absolute;
		top: 20upx;
		right: 0;
	}

	.head {
		position: relative;
		background-image: url('http://yuanzhoulvwego.com/wp-content/uploads/static/home/billPay/zhangdan1.png');
		background-size: 100% 100%;
		background-repeat: no-repeat;
		// margin: 0 15upx;
	}

	/deep/ .u-col {
		padding: 0 0 !important;
	}

	.card-body {
		padding: 0 20upx 20upx 20upx;
		font-size: 28upx;
	}

	.foot {
		margin-top: 20upx;
		background-color: #FFFFFF;
		border-radius: 0 0 15upx 15upx;
	}

	.time-bg {
		width: 110upx;
		font-size: 18upx;
		font-weight: bold;
		display: flex;
		justify-content: center;
		padding-top: 30upx;
		color: #E64340;
		height: 140upx;
		background: url('http://yuanzhoulvwego.com/wp-content/uploads/static/home/billPay/zhangdan.png') no-repeat;
		background-size: 100% 100%;

		.time-bg-text {
			margin-top: 15upx;
			display: inline-block;
			width: 60upx;

		}
	}

	.main {
		position: relative;
		width: 100%;
		height: 130upx;
	}

	.main-bottom {
		position: relative;
		width: 100%;
		.main-bottom-text {
			display: inline-block;
			width: 5em;
			vertical-align: top;
		}
		.main-bottom-view {
			display: inline-block;
			width: 17em;
		}
		.main-bottom-texts {
			display: inline-block;
			width: 76rpx;
			vertical-align: top;
		}
		.main-bottom-views {
			display: inline-block;
			width: 542rpx;
		}
	}

	.line1 {
		position: absolute;
		bottom: -2upx;
		z-index: 100;
		width: 100%;
		height: 2upx;
		background-image: linear-gradient(to right, #3E76F4 0%, #3E76F4 50%, transparent 50%);
		background-size: 18upx 2upx;
		background-repeat: repeat-x;
		margin: 0 auto;
	}

	.line {
		position: absolute;
		// bottom: -2upx;
		top: 0px;
		z-index: 100;
		left: 2.5%;
		width: 95%;
		height: 2upx;
		background-image: linear-gradient(to right, #3E76F4 0%, #3E76F4 50%, transparent 50%);
		background-size: 18upx 2upx;
		background-repeat: repeat-x;
		margin: 0 auto;
	}

	.main-bottom .connector1 {
		background: url('http://yuanzhoulvwego.com/wp-content/uploads/static/home/billPay/lianjiexian.png') no-repeat;
		background-size: 100% 100%;
		position: absolute;
		left: 25%;
		bottom: -50upx;
		width: 20upx;
		height: 80upx;
	}

	.main-bottom .connector2 {
		background: url('http://yuanzhoulvwego.com/wp-content/uploads/static/home/billPay/lianjiexian.png') no-repeat;
		background-size: 100% 100%;
		position: absolute;
		left: 75%;
		bottom: -50upx;
		width: 20upx;
		height: 80upx;
	}
</style>
