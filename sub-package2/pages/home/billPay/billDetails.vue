<template>
	<page>
		<u-navbar title="账单详情"></u-navbar>
		<view class="u-m-20">
			<axb-check-box ref="radio" :mandatory="true" background="#3E76F4" color="#FFFFFF"
				@change="dropdownRadioChange" :list="selectType">
			</axb-check-box>
		</view>
		<view class="foot">
			<!-- <view class="card u-border-bottom">
				<view class="card-title u-p-20 u-flex u-row-between">
					<view class="card-title-left u-font-lg2 u-font-weight">
						租金
						<text v-if="billInfo.rentalTaxRate" class="u-type-price">（不含税）</text>
					</view>
					<view class="card-title-right u-font-weight">
						￥{{ billDetails.room.rentPrice }}
					</view>
				</view>
			</view> -->
			<view class="card">
				<view class="card-title u-p-20 u-flex u-row-between">
					<view class="card-title-left u-font-lg2 u-font-weight">
						水费
						<text v-if="billInfo.waterTaxRate" class="u-type-price">（不含税）</text>
					</view>
					<view class="card-title-right u-font-weight">
						￥{{ billDetails.waterBill }}
					</view>
				</view>
				<view class="card-body u-border-bottom" v-for="item in billDetails.detailsList1">
					水表名称：{{ item.devMeter.name }}
					<u-row>
						<u-col span="5">上月抄表:{{ item.readBefore }}吨</u-col>
						<u-col span="5">当月抄表:{{ item.readNow }}吨</u-col>
						<u-col span="2">倍率:{{ item.magnification }}</u-col>
					</u-row>
				</view>
			</view>
			<view class="card">
				<view class="card-title u-p-20 u-flex u-row-between">
					<view class="card-title-left u-font-lg2 u-font-weight">
						电费
						<text v-if="billInfo.electricityTaxRate" class="u-type-price">（不含税）</text>
					</view>
					<view class="card-title-right u-font-weight">
						￥{{ billDetails.electricityBill }}
					</view>
				</view>
				<view class="card-body u-border-bottom" v-for="item in billDetails.detailsList0">
					电表名称：{{ item.devMeter.name }}
					<u-row>
						<u-col span="5">上月抄表:{{ item.readBefore }}度</u-col>
						<u-col span="5">当月抄表:{{ item.readNow }}度</u-col>
						<u-col span="2">倍率:{{ item.magnification }}</u-col>
					</u-row>
				</view>
			</view>
<!-- 			<view class="card u-border-bottom">
				<view class="card-title u-p-20 u-flex u-row-between">
					<view class="card-title-left u-font-lg2 u-font-weight">
						物业管理费
					</view>
					<view class="card-title-right u-font-weight">
						￥1000.00
					</view>
				</view>
			</view>
			<view class="card u-border-bottom">
				<view class="card-title u-p-20 u-flex u-row-between">
					<view class="card-title-left u-font-lg2 u-font-weight">
						滞纳金
						<text v-if="billInfo.lateFeeTime" class="u-type-price">（逾期{{billDetails.lateFeeTime}}天）</text>
					</view>
					<view class="card-title-right u-font-weight">
						￥122.00
					</view>
				</view>
			</view>
			<view class="card u-border-bottom">
				<view class="card-title u-p-20 u-flex u-row-between">
					<view class="card-title-left u-font-lg2 u-font-weight">
						税费
					</view>
					<view class="card-title-right u-font-weight">
						￥600.82
					</view>
				</view>
			</view>
			<view class="card">
				<view class="card-title u-p-20 u-flex u-row-between">
					<view class="card-title-left u-font-lg2 u-font-weight">
						其他费用
					</view>
					<view class="card-title-right u-font-weight">
						￥300.00
					</view>
				</view>
				<view class="u-m-20" style="position: relative;">
					<view class="line1"></view>
				</view>
			</view> -->
		</view>
	</page>
</template>

<script>
	import axbCheckBox from '@/components/axb-checkbox/axb-checkbox.vue'
	export default {
		components: {
			axbCheckBox
		},
		data() {
			return {
				billDetails: {},
				billInfo: {},
				selectType: [{
					label: '全部',
					value: '',
					checked: 1
				}, {
					label: '办公',
					value: 0,
					checked: 0
				}, {
					label: '商铺',
					value: 1,
					checked: 0
				}],
			};
		},
		onLoad() {
			let _this = this
			_this.billInfo = _this.$Route.query
			// detailsList0: []detailsList1: []
			_this.selectType = _this.$Route.query.hydropowerDetails.map(item => {
				item.rentalTaxRate = _this.billInfo.fwHtContractInfo.rentalTaxRate
				item.lateFeeTime = _this.billInfo.lateFeeTime
				item.waterTaxRate = _this.billInfo.fwHtContractInfo.waterTaxRate
				item.electricityTaxRate = _this.billInfo.fwHtContractInfo.electricityTaxRate
				item.managementFeeRate = _this.billInfo.fwHtContractInfo.managementFeeRate
				return {
					label: item.room.name,
					value: item,
					checked: false
				}
			})
			this.billDetails = _this.selectType[0].value
			_this.selectType[0].checked = true
			console.log(_this.selectType)
		},
		methods: {
			dropdownRadioChange(value) {
				console.log(value);
				this.billDetails = value ||{}
			}
		}
	}
</script>

<style lang="scss" scoped>
	/deep/ .radio {
		background: #F6F6F6 !important;
		border-radius: 30upx;
		border: 0;
		min-width: 160upx;
		text-align: center;
		font-size: 26upx;
		height: 60upx;
		line-height: 60upx;
		padding: 0 30upx;
	}

	/deep/ .u-col {
		padding: 0 0 !important;
	}

	.card-body {
		padding: 0 20upx 20upx 20upx;
		font-size: 28upx;
	}

	.foot {
		margin-left: 10px;
		margin-right: 10px;
		background-color: #FFFFFF;
		// border-radius: 0 0 15upx 15upx;
	}
</style>
