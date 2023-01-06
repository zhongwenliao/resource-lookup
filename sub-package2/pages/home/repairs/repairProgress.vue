<template>
	<view class="body">
		<u-navbar :title="'报修进度'">
			<view
				v-if="ruleForm.processingStatus === 4"
				slot="right"
				@click="goRepairEvaluate"
			>{{ ruleForm.evaluationStatus ? '已评价' : '去评价' }}</view>
		</u-navbar>
		<view class="repair-progress">
			<view class="repair-progress-top">
				<u-steps class="repair-progress-top-steps" :list="numList" :current="current" active-color="#FBDA67"
					un-active-color="#FFFFFF"></u-steps>
			</view>
			<view class="repair-progress-conter">
				<!-- 报修信息 start -->
				<view class="form-item_box">
					<view class="form-item_box_head">
						<span class="form-item_box_head_text">报修信息</span>
					</view>
					<view class="form-item_box_body">
						<view class="unit">
							<view class="left">房间号</view>
							<view class="right">{{ ruleForm.roomName }}</view>
						</view>
						<view class="unit">
							<view class="left">联系人</view>
							<view class="right">{{ ruleForm.repairer }}</view>
						</view>
						<view class="unit">
							<view class="left">联系电话</view>
							<view class="right">{{ ruleForm.phone }}</view>
						</view>
						<view class="unit">
							<view class="left">报修类型</view>
							<view class="right">{{ ruleForm.classificationName }}</view>
						</view>
					</view>
				</view>
				<!-- 报修信息 end -->
				<!-- 报修问题 start -->
				<view class="form-item_box">
					<view class="form-item_box_head">
						<span class="form-item_box_head_text">报修问题</span>
					</view>
					<view class="form-item_box_body">
						<view class="form-item_box_body_text">{{ ruleForm.remark }}</view>
					</view>
				</view>
				<!-- 报修问题 end -->
				<!-- 现场照片 start -->
				<view class="form-item_box">
					<view class="form-item_box_head">
						<span class="form-item_box_head_text">现场照片</span>
					</view>
					<view class="form-item_box_body">
						<u-row gutter="16" justify="between" v-if="ruleForm.livePhoto && ruleForm.livePhoto.length > 0">
							<u-col span="4" v-for="(item, index) in ruleForm.livePhoto" :key="index" @click="previewImage(item)">
								<u-image width="179" height="179" :src="item" class="form-item_box_body_image">
									<u-loading slot="loading"></u-loading>
									<view slot="error" style="font-size: 24rpx;">加载失败</view>
								</u-image>
							</u-col>
						</u-row>
						<text v-else>暂无图片</text>
					</view>
				</view>
				<!-- 现场照片 end -->
				<!-- 维修照片 start -->
				<view class="form-item_box" v-if="ruleForm.processingStatus === 4">
					<view class="form-item_box_head">
						<span class="form-item_box_head_text">维修照片</span>
					</view>
					<view class="form-item_box_body">
						<u-row gutter="16" justify="between" v-if="ruleForm.images && ruleForm.images.length > 0">
							<u-col span="4" v-for="(item, index) in ruleForm.images" :key="index" @click="previewImage(item)">
								<u-image width="179" height="179" :src="item" class="form-item_box_body_image">
									<u-loading slot="loading"></u-loading>
									<view slot="error" style="font-size: 24rpx;">加载失败</view>
								</u-image>
							</u-col>
						</u-row>
						<text v-else>暂无图片</text>
					</view>
				</view>
				<!-- 维修照片 end -->
				<!-- 我的评价 start -->
				<view class="form-item_box" v-if="this.ruleForm.evaluationStatus">
					<view class="form-item_box_head">
						<span class="form-item_box_head_text">我的评价</span>
					</view>
					<view class="form-item_box_body">
						<view class="form-item_box_body_text">{{ ruleForm.suggestions || '暂无评价' }}</view>
						<u-line color="#F1F2F3" />
						<view class="form-item_box_body_result">
							<span class="">评价结果：</span>
							<u-rate
								v-model="ruleForm.commentResults"
								:count="5"
								size="36"
								:disabled="true"
								active-color="#FBDA67"
								inactive-color="#DDDDDD"
								gutter="11"
							></u-rate>
						</view>
						<view class="form-item_box_body_result">
							<span class="">评价工人：</span>
							<u-rate
								v-model="ruleForm.commentWorkers"
								:count="5"
								size="36"
								:disabled="true"
								active-color="#FBDA67"
								inactive-color="#DDDDDD"
								gutter="11"
							></u-rate>
						</view>
					</view>
				</view>
				<!-- 我的评价 end -->
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 步骤
				numList: [
					{
						name: '提交'
					}, {
						name: '待处理'
					}, {
						name: '处理中'
					}, {
						name: '已完成'
					}
				],
				// 进度
				current: 0,
				// 表单
				ruleForm: {},
			}
		},
		onLoad() {
			let that = this
			that.getByIdMaintenanceInfo(that.$Route.query.id)
		},
		onShow() {
			let that = this
			that.getByIdMaintenanceInfo(that.$Route.query.id)
		},
		methods: {
			getByIdMaintenanceInfo(id) {
				let params = { id: id }
				this.$api('repairs.getByIdMaintenanceInfo', params).then(res => {
					if (res.code == 200) {
						this.ruleForm = res.data
						this.current = this.ruleForm.processingStatus === 0 || this.ruleForm.processingStatus === 1 ? 1 :
							this.ruleForm.processingStatus === 4 ? 3 : 2
					}
				})
			},
			// 预览图片
			previewImage(src) {
				uni.previewImage({
					urls: [src]
				});
			},
			// 跳转到报修评价
			goRepairEvaluate() {
				if (!this.ruleForm.evaluationStatus) {
					this.$Router.push({
						path: '/sub-package2/pages/home/repairs/repairEvaluate',
						query: {
							id: this.$Route.query.id,
							classificationId: this.ruleForm.classificationId,
							phone: this.ruleForm.phone,
							repairer: this.ruleForm.repairer,
							roomId: this.ruleForm.roomId
						}
					});
				}
			}
		}
	}
</script>

<style>
	page {
		background: linear-gradient(0deg,  #A9C2FB, #779DF1);
	}
</style>
<style lang="scss" scoped>
	.repair-progress {
		padding-bottom: 20upx;
		.repair-progress-top {
			height: 180upx;
			.repair-progress-top-steps {
				position: relative;
				top: 50%;
				transform: translateY(-50%);
				.u-steps .u-steps__item {
					font-size: 30upx;
				}
			}
		}
		.repair-progress-conter {
			.form-item_box {
				margin: 0upx 20upx 20upx 20upx;
				padding: 38upx 30upx 20upx 0upx;
				background-color: #FFFFFF;
				border-radius: 15upx;
				.form-item_box_head {
					height: 34upx;
					margin-left: 10upx;
					border-left: 10upx solid #3E76F4;
					font-weight: bold;
					display: flex;
					justify-content: space-between;
					align-items: center;
					.form-item_box_head_text {
						display: inline-block;
						font-size: 34upx;
						margin-left: 6upx;
					}
				}
				.form-item_box_body {
					margin-top: 41upx;
					margin-left: 29upx;
					.form-item_box_body_result {
						margin-top: 12upx;
						margin-bottom: 12upx;
						font-size: 28upx;
					}
					.unit {
						display: flex;
						justify-content: space-between;
						font-size: 30upx;
						padding: 14upx 0upx;
						.left {
							color: #333333;
						}
						.right {
							color: #333333;
						}
					}
					.form-item_box_body_text {
						text-indent: 1em;
						margin-bottom: 28upx;
					}
					.form-item_box_body_image {
						position: relative;
						left: 50%;
						transform: translateX(-50%);
					}
				}
			}
		}
	}
</style>
