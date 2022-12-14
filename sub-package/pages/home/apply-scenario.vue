<template>
	<uni-base-page style="width: 100%;">
		<!-- <swiper :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000" style="width: 100%; height:1250upx"> -->
			<!-- <swiper-item v-for="(img,index) in imgList" :key="index"  style="width: 100%; height:100%"> -->
				<view class="swiper-item"  style="width: 100%; height:100%">
					<image :src="img" style="width: 100%; height:1250upx">
				</view>
			<!-- </swiper-item> -->
			
		<!-- </swiper> -->
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				img: "http://www.thinmoo.com/wp-content/uploads/2020/01/one-key-bg.jpg",
			}
		},
		computed: {
			title() {
				return this.$t("title");
			},
		},
		onReady() {
			uni.setNavigationBarTitle({
				title: this.title["app-senerio"]
			})
		}
	}
</script>

<style>
	
</style>
