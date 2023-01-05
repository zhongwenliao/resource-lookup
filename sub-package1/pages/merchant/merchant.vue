<template>
	<uni-base-page style="width: 100%;">
		<view class="merchant">
			<ul class="clear">
				<li class="fl" @click="disTemplate">
					<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/moban.png"></image>
					<text>{{ coupon["dis-coupon-template"] || "优惠券模板" }}</text>
				</li>
				<li class="fl" @click="discount">
					<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/yhq.png"></image>
					<text>{{ coupon["dis-coupon"] || "优惠券" }}</text>
				</li>
			</ul>
		</view>
	</uni-base-page>
</template>

<script>
	export default{
		data(){
			return {
				
			}
		},
		computed:{
			coupon() {
				return this.$t("coupon")
			}
		},
		// onReady() {
		// 	this.$setTitle(this.title["details"])
		// },
		methods:{
			// 跳转到优惠券模板页面
			disTemplate(){
				uni.navigateTo({
					url: "/sub-package1/pages/discount-template/discount-template"
				})
			},
			// 跳转到优惠券页面
			discount(){
				uni.navigateTo({
					url: "/sub-package1/pages/discount-coupon/discount-coupon"
				})
			},
		}
	}
</script>

<style>
	.merchant{
		width: 100%;
		border-top: 1px solid #eee;
		padding-top: 80upx;
		}
		.merchant ul{
			padding-left: 0;
			}
			.merchant ul li{
				width: 50%;
				text-align: center;
				font-size: 32upx;
				}
				.merchant ul li image{
					width: 100upx;
					height: 100upx;
					display: block;
					margin: auto;
				}
				.merchant ul li text{
					display: inline-block;
					padding-top: 10upx;
				}
</style>
