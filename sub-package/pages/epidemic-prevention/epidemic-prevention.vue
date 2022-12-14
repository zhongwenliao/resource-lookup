<template>
	<uni-base-page class="epidemic-prevention-page">
		<view class='menu-button-list' style="padding: 70upx 0;">
			<navigator url="epidemic-search" style="width:100%; font-size: 34upx; text-align: center;">疫情查询</navigator>
		</view>
		<view class='menu-button-list'>
			<view class="menu-title">防疫登记</view>
			<navigator url="./register">
				<image src='../../../sub-package1/static/img/epidemic-prevention/register.png' class='menu-icon'></image><text>{{ "登记" }}</text>
			</navigator>
			<navigator url="./search">
				<image src='../../../sub-package1/static/img/epidemic-prevention/list.png' class='menu-icon'></image><text>{{ "列表" }}</text>
			</navigator>
			<navigator url="./echart">
				<image src='../../../sub-package1/static/img/epidemic-prevention/echart.png' class='menu-icon'></image><text>{{ "图表" }}</text>
			</navigator>
			<!-- <navigator url="./search">
				<image src='../../static/img/epidemic-prevention/search.png' class='menu-icon'></image><text>{{ "搜索" }}</text>
			</navigator> -->
		</view>
		
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			
		}
	}
</script>

<style lang="scss">
	.epidemic-prevention-page {
		width: 100%;
		background: #FFFFFF;
		.menu-button-list {
			width: 98%;
			position: relative;
			-webkit-box-sizing: border-box;
			-moz-box-sizing: border-box;
			box-sizing: border-box;
			background: #0000FF;
			border-radius: 10upx;
			padding: 10px 0;
			margin: 10upx auto;
			.menu-title {
				text-align: center;
				font-size: 34upx;
				color: #FFFFFF;
			}
			navigator {
				display: inline-block;
				width: calc(100% / 3);
				text-align: center;
				color: #FFFFFF;
				padding: 5px 0;
				font-size: 12px;
				.menu-icon {
					width: 30px;
					height: 30px;
				}
				text {
					display: block;
				}
			}
		}
	}
</style>
