<template>
	<uni-base-page class="content">
		<view class="top-bg">
			<image src="http://www.thinmoo.com/wp-content/uploads/2019/12/payment-bg.png" alt="">
		</view>
		<view class="payment-type-view">
			<button @click="goToProperty">
				<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/payment/property.png" alt=""><br>
				<text>{{ payment["property"] || "物业缴费" }}</text>
			</button>
			<button @click="goToParking">
				<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/payment/house.png" alt=""><br>
				<text>{{ payment["parking"] || "房租缴费" }}</text>
			</button>
			<!-- <button @click="goToLifePayment">
				<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/payment/shjf.png" alt=""><br>
				<text>生活缴费</text>
			</button> -->
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		computed: {
			payment() {
				return this.$t("payment");
			},
			title() {
				return this.$t("title");
			}
		},
		onReady() {
			this.$setTitle(this.title["payment"])
		},
		methods: {
			goToProperty() {
				uni.navigateTo({
					url: "property-payment"
				})
			},
			
			goToParking() {
				uni.navigateTo({
					url: "parking-payment"
				})
			},
			goToStopPayment(){
				uni.navigateTo({
					url: "stop-payment"
				})
			},
			goToLifePayment(){
				uni.navigateTo({
					url: "life-payment"
				})
			},
		}
	}
</script>

<style>
	.content {
		padding: 0;
	}
	
	.top-bg image {
		width: 100%;
	}

	.payment-type-view {
		width: 96%;
		margin-top: 40upx;
		margin: 40upx auto 0;
	}
	
	.payment-type-view image {
		width: 80upx;
		height: 80upx;
	}
	
	.payment-type-view button {
		display: inline-block;
		width: 48%;
		margin: 0 1%;
		text-align: center;
		padding: 40upx;
		background: #FFFFFF;
		border: 1upx solid #EEEEEE;
		border-style: none;
	}
</style>