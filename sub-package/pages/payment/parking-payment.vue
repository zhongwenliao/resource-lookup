<template>
	<uni-base-page class="content">
		<view class="no-data-view">
			<image src="../../static/img/no-data.png" alt=""><br>
			<!-- {{ payment["unauthorize"] || "您的车辆还未授权" }}<br>
			{{ payment["register-car"] || "请到云平台登记，物业审核认证" }} -->
			{{ payment["no-bill"] || "暂无账单" }}
		</view>
	</uni-base-page>
</template>
<script>
	export default {
		computed: {
			payment() {
				return this.$t("payment")
			},
			title() {
				return this.$t("title");
			}
		},
		onLoad() {
			this.$setTitle(this.payment["parking"] || "房租缴费")
		}
	}
</script>
<style>
	.no-data-view {
		width: 100%;
		height: 300upx;
		text-align: center;
		margin-top: 40% ;
	}
	
	.no-data-view image {
		width: 160upx;
		height: 160upx;
	}
</style>