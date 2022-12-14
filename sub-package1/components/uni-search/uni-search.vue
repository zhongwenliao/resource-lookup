<template>
	<view class="search-view">
		<view :class="['search-input-view', centerd ? 'center' : '']">
			<uni-icons type="search" size="30" class="search-icon"></uni-icons>
			<input type="text" class="search-input" @input="_onInput" :placeholder="common['input']" />
		</view>
	</view>
</template>
<script>
	export default {
		name: 'UniSearch',
		props: {
			centerd: {
				type: Boolean,
				default: false
			},
			size: {
				type: [Number, String],
				default: 16
			}
		},
		methods: {
			_onInput(e) {
				var value = e.target.value;
				this.$emit("input", value || "");
			}
		},
		computed: {
			common() {
				return this.$t("common")
			}
		}
	}
</script>
<style lang="scss">
	.search-view {
		width: 100%;
		padding-top: 10upx;
		background: #FFFFFF;
		position: fixed;
		z-index: 100;
		height: 70upx;
	
		.search-input-view {
			width: 90%;
			padding: 0 10upx;
			background: #F5F5F5;
			border: 1px solid #E6E6E6;
			border-radius: 35upx;
			align-items: center;
			display: flex;
			height: 70upx;
			margin: 0 auto;
	
			.search-input {
				width: auto;
			}
			
			&.center {
				justify-content: center;
			}
		}
	}
</style>
