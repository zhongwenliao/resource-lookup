<template>
	<view class="complaint_main">
		<!--自定义导航栏-->
		<uni-nav-bar background-color="#fff" color="#000" 
			@clickLeft="clickNavLeft()">
			<!-- 导航栏左侧插槽 -->
			<view slot="left">
				<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/left.png" mode="" style="width: 15px;height: 15px;"></image>
			</view>

		</uni-nav-bar>
		<!--自定义导航栏end-->
		<view class="top_box">
			<!--提示部分-->
			<view class="title-box">
				<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/yes.png" mode="" style="width: 260upx;height: 250upx;"></image>
				<p>{{repair['submit-success']||'提交成功'}}</p>
			</view>
			<!--提示部分end-->
			
			<!--广告部分-->
			
			<!--广告部分end-->
		</view>

		<!--返回按钮-->
		<button @click="clickNavLeft">{{articleRelease['complete']||'完成'}}</button>
		<!--返回按钮 end-->
	</view>
</template>

<script>
	export default {
		computed: {
			complaintProposa() {
				return this.$t("complaint-proposal")
			},
			articleRelease() {
				return this.$t("article-release") //返回出国际化的语言数据
			},
			repair() {
				return this.$t("repair") //返回出国际化的语言数据
			},
		},
		methods: {
			// 点击导航栏左侧
			clickNavLeft() {
				uni.switchTab({
					url: '/pages/main/main'
				});
			}
		}
	}
</script>

<style scoped>
	.top_box{height: 53%;padding-top:15%;}
	.title-box{width: 100%;display: flex;flex-direction: column;text-align: center;padding: 80upx 0px;}
	.title-box uni-image{margin: auto;}
	.complaint_main {
		width: 100%;
		font-size: 30upx;
		background-color: #F5F5F5;
	}

	button {
		margin: 0px 10%;
		background: linear-gradient(118deg, #01DCA3 0%, #088B68 100%);
		box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
		border-radius: 50upx 50upx 50upx 50upx;
		color: #FFFFFF;
	}
</style>
