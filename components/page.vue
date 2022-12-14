<template>
	<!-- 总组件 -->
	<view class="cpage" :class="isWaterMark ? 'water-mark' : ''">
		<slot></slot>
		<u-no-network image="/static/error/wuwangluo.png"></u-no-network>
	</view>
</template>

<script>

export default {

	data() {
		return {
			isWaterMark: false //显示水印
		};
	},

	mounted() {
	},

	methods: {
		// 水印
		waterMark() {
			this.isWaterMark = true;
		}
	}
};
</script>

<style scoped lang="scss">
// .water-mark {
// 	background-image: url(~@/static/watermark.png);
// }
.cpage{
	width: 100%;
	height: 100%;
}
</style>
