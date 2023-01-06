<template>
	<page>
		<u-navbar title="" :border-bottom="true" />
		<!-- 标题 -->
		<view class="content">
			<view class="head u-border-bottom u-margin-bottom-20">
				<view class="title">
					{{info.title}}
				</view>
				<!-- <view class="subtitle u-text-color-grey u-font-xs2 u-padding-bottom-15">
					发布者：{{info.createBy}} {{info.updateTime}}
				</view> -->
				<view class="subtitle u-text-color-grey u-font-xs2 u-padding-bottom-15">
					发布者：{{info.createBy}} 
				</view>
				<view class="subtitle u-text-color-grey u-font-xs2 u-padding-bottom-15">
					发布时间：{{info.updateTime}}
				</view>
			</view>
			<!-- 富文本 -->
			<view class="u-p-10">
				<u-parse :content="info.content"></u-parse>
			</view>
		</view>
		
	</page>
</template>

<script>
	import uParse from "@/sub-package2/components/feng-parse/parse.vue"
	export default {
		components: {
			uParse
		},
		data() {
			return {
				info:{}
			};
		},
		onLoad() {
			this.getInfo()
		},
		methods: {
			getInfo() {
				this.$api('notice.noticeInfo', {
					id: this.$Route.query.id
				}).then(res => {
					console.log("获取通知详情");
					if (res.code == 200) {
						this.info = res.data
					} else {
						uni.showToast({
							title: res.msg || '请求出错,稍后重试',
							icon: 'none',
							duration: 500,
							mask: true
						});
					}
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.content{
		padding: 20upx;
	}
	.head{
		padding: 10upx;
		.title{
			font-size: 36upx;
			font-weight: 800;
			padding-bottom: 40upx;
		}
	}
</style>
