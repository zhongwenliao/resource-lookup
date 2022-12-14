<template>
	<view class="uni-empty-page">
		<view class="uni-empty-content" style="">
			<image src="../../static/no-data.png" alt=""><br/>
			<text>{{ common["no-data"] || "暂无数据" }}</text>
		</view>
	</view>
</template>
<script>
	export default {
		name: "UniEmptyPage",
		data() {
			return {
				
			}
		},
		methods: {
			
		},
		computed: {
			common() {
				return this.$t("common");
			}
		}
	}
</script>
<style lang="scss">
	.uni-empty-page {
		color: #CCCCCC;
		position: absolute;
		width: 100%;
		height: 100%;
		text-align: center;
		
		.uni-empty-content {
			height: 100%; 
			width: 100%; 
			display: flex; 
			align-items: center; 
			justify-content: center;
			
			image {
				width: 120upx;
				height: 120upx;
			}
		}
		// margin-top: 50%;
		
	}
</style>
