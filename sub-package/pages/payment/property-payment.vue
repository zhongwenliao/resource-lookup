<template>
	<view class="content">
		<view class="total-fee-view">
			<image src="/static/img/pay-home-bg.png" alt="">
			<view class="count-view">{{ payment["total-fee"] || "应缴物业费（元）" }}</view>
		</view>
		<uni-tab :tab-list="tabList" :tabCur.sync="tabCur" tab-class="opening-record-view-tab" textFlex @change="tabChange"
		 class="tab-view"></uni-tab>
		<swiper :current="tabCur" class="swiper custom-swiper" @change="swiperChange" duration="300" :circular="true"
		 indicator-color="rgba(255,255,255,0)" indicator-active-color="rgba(255,255,255,0)">
			<!-- 全部 -->
			<swiper-item class="swiper">
				<view class="no-data-view">
					<image src="../../static/img/no-data.png" alt=""><br>
					{{ payment["no-bill"] || "暂无账单" }}
				</view>
			</swiper-item>
			<!-- 未缴 -->
			<swiper-item class="swiper">
				<view class="no-data-view">
					<image src="../../static/img/no-data.png" alt=""><br>
					{{ payment["has-payed"] || "您的账单已缴清~" }}
				</view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tabList: [],
				tabCur: 0,

			}
		},

		computed: {
			payment() {
				return this.$t("payment")
			},
			title() {
				return this.$t("title")
			}
		},
		onReady() {
			this.$setTitle(this.title["parking-pay"])
		},
		onLoad() {
			this.tabList = [{
				name: this.payment["all"] || "全部账单"
			}, {
				name: this.payment["unpaid"] || "未缴账单"
			}];
		},

		methods: {
			swiperChange(e) {
				let page = e.detail.current;
				this.tabCur = page;
			},
			tabChange(index) {
				this.tabCur = index;
			},
		}
	}
</script>

<style>
	.content {
		width: 100%;
		/* height: 100%; */
		/* position: absolute; */
		position: relative;
		padding: 0;
	}

	.total-fee-view {
		position: relative;
		width: 100%;
		height: 40%;
		text-align: center;
		color: #FFFFFF;

	}

	.total-fee-view image {
		position: absolute;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.count-view {
		position: absolute;
		margin-top: 15%;
		width: 100%;
		text-align: center;
		align-items: center;
		font-size: 40upx;
	}

	.tab-view {
		background: #FFFFFF;
		font-size: 34upx;
	}

	.no-data-view {
		text-align: center;
		margin-top: 20%;
	}

	.swiper {
		height: 100%;
	}

	.no-data-view image {
		width: 120upx;
		height: 120upx;
	}
</style>