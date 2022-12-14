<template>
	<view class="body">
		<u-navbar :title="'报修评价'"></u-navbar>
		<view v-if="!evaluationStatus">
			<view class="repairEvaluate-box">
				<my-textarea :value.sync="ruleForm.suggestions" :placeholder="'写点什么呢？'"></my-textarea>
			</view>
			<view class="repairEvaluate-box u-p-l-30 u-font-32">
				<view class="repairEvaluate-box-title">评价结果</view>
				<u-rate
					class="repairEvaluate-box-rate"
					v-model="ruleForm.commentResults"
					:count="count"
					size="50"
					active-color="#FBDA67"
					inactive-color="#DDDDDD"
					gutter="11"
				></u-rate>
			</view>
			<view class="repairEvaluate-box u-p-l-30 u-font-32">
				<view class="repairEvaluate-box-title">评价工人</view>
				<u-rate
					class="repairEvaluate-box-rate"
					v-model="ruleForm.commentWorkers"
					:count="count"
					size="50"
					active-color="#FBDA67"
					inactive-color="#DDDDDD"
					gutter="11"
				></u-rate>
			</view>
			<view class="btn_box">
				<u-button class="btn_box_button" @click="onSubmit" type="primary" shape="circle">
					提交评价
				</u-button>
			</view>
		</view>
		<view v-else>
			<view class="evaluate-title" :style="topBackground">
				<view class="evaluate-title-top">
					<view class="evaluate-title-top-left">
						<u-image width="54upx" height="54upx" :fade="false" src="/static/home/repairs/pingjiachenggong.png">
							<u-loading slot="loading"></u-loading>
						</u-image>
					</view>
					<span>评价成功</span>
				</view>
				<view class="u-m-t-20">感谢您的评价！</view>
			</view>
			<view>
				<u-image class="evaluate-image" width="195upx" height="189upx" :fade="false"
					src="/static/home/repairs/weixiao.png">
					<u-loading slot="loading"></u-loading>
				</u-image>
			</view>
			<view class="tbtn_box">
				<u-button class="tbtn_box_button" @click="goBefore" type="primary" shape="circle">
					确定
				</u-button>
			</view>
		</view>
	</view>
</template>

<script>
	import myTextarea from "@/components/my-textarea/my-textarea.vue"
	export default {
		data() {
			return {
				// 是否评价成功
				evaluationStatus: 0,
				// 表单
				ruleForm: {
					suggestions: '', // 意见建议
					commentResults: 0, // 评论结果
					commentWorkers: 0 // 评价工人
				},
				// 可选择
				count: 5,
				// 背景图
				topBackground: {
					backgroundImage: 'url(' + '../../../static/home/repairs/xingxing.png' + ')',
					backgroundSize: '100% 100%',
					backgroundRepeat: 'no-repeat'
				}
			}
		},
		methods: {
			// 提交
			onSubmit() {
				if (this.ruleForm.suggestions.length || this.ruleForm.commentResults > 0 || this.ruleForm.commentWorkers > 0) {
					let params = { ...this.ruleForm, ...this.$Route.query }
					this.$api('repairs.userEvaluation', params).then(res => {
						if (res.code == 200) {
							this.evaluationStatus = 1
						}
					}) 
				}
			},
			// 评价成功，返回
			goBefore() {
				uni.navigateBack()
				// let ids = this.$Route.query.id
				// let pages = getCurrentPages(); // 当前页面
				// let beforePage = pages[pages.length - 2]; // 上一页
				// uni.navigateBack({
				//     success: function() {
				//         beforePage.getByIdMaintenanceInfo(ids); // 执行上一页的onLoad方法
				//     }
				// })
			}
		}
	}
</script>

<style>
	page {
		background: #F9F9F9;
	}
</style>
<style lang="scss" scoped>
	.body {
		.repairEvaluate-box {
			margin: 20upx 20upx 0 20upx;
			padding: 42upx 15upx;
			background: #FFFFFF;
			border-radius: 15upx;
			.repairEvaluate-box-title {
				display: inline-block;
				height: 50upx;
				line-height: 50upx;
				vertical-align: top;
			}
			.repairEvaluate-box-rate {
				margin-left: 28upx;
			}
		}
		.btn_box {
			height: 98upx;
			position: fixed;
			width: 100%;
			bottom: 0px;
			background-color: white;
			padding: 0 64upx;
			z-index: 99;
			.btn_box_button {
				position: relative;
				top: 50%;
				transform: translateY(-50%);
			}
		}
		.evaluate-title {
			height: 185upx;
			width: 481upx;
			position: relative;
			left: 50%;
			transform: translateX(-50%);
			margin-top: 88upx;
			text-align: center;
			.evaluate-title-top {
				position: relative;
				height: 64upx;
				font-size: 52upx;
				color: #FA5656;
				font-weight: bold;
				.evaluate-title-top-left {
					display: inline-block;
					position: relative;
					top: 47%;
					transform: translateY(-50%);
					margin-right: 20upx;
				}
			}
		}
		.evaluate-image {
			position: relative;
			left: 50%;
			transform: translateX(-50%);
		}
		.tbtn_box {
			padding: 0 76upx;
			margin-top: 175upx;
		}
	}
</style>
