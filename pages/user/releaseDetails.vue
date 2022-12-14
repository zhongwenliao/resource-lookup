<template>
	<view class="body">
		<u-navbar :title="'物品放行详情'" >
		</u-navbar>
		<view class="repair-progress">
			<view class="repair-progress-conter">
				<!-- 放行信息 start -->
				<view class="form-item_box">
					<view class="form-item_box_head">
						<span class="form-item_box_head_text">申请信息</span>
					</view>
					<view class="form-item_box_body" style="margin-top: 20upx;">
						<view class="unit">
							<view class="left">房间号</view>
							<view class="right">{{ ruleForm.room.ownedBuilding + '/' + ruleForm.room.name }}</view>
						</view>
						<view class="unit">
							<view class="left">申请人</view>
							<view class="right">{{ ruleForm.user.userName }}</view>
						</view>
						<view class="unit">
							<view class="left">申请人电话</view>
							<view class="right">{{ ruleForm.phone }}</view>
						</view>
						<view class="unit">
							<view class="left">申请时间</view>
							<view class="right">{{ ruleForm.createTime }}</view>
						</view>
						<view class="unit">
							<view class="left">搬运日期</view>
							<view class="right">{{ ruleForm.movingDate }}</view>
						</view>
					</view>
				</view>
				<!-- 放行信息 end -->
				<!-- 物品名称 start -->
				<view class="form-item_box" >
					<view class="form-item_box_head">
						<span class="form-item_box_head_text">物品名称</span>
						<text>数量</text>
					</view>
					<view class="form-item_box_body">
						<view class="unit" v-for="(item, index) in ruleForm.fwItemReleaseDetails" :key="index">
							<view class="left">{{item.name}}</view>
							<text class="right" > {{item.count}}</text>
						</view>
					</view>
				</view>
				<view class="form-item_box" v-if="ruleForm.approvalStatus !== 0" >
					<view class="form-item_box_head">
						<span class="form-item_box_head_text">审批人</span>
						<text>时间</text>
					</view>
					<view class="form-item_box_body">
						<view class="unit" >
							<view class="left">{{ ruleForm.reviewer }}</view>
							<text class="right" >{{ ruleForm.reviewerTime }} </text>
						</view>
					</view>
				</view>

				<!-- 现场照片 start -->
				<view class="form-item_box">
					<view class="form-item_box_head">
						<span class="form-item_box_head_text">照片</span>
					</view>
					<view class="form-item_box_body">
						<u-row gutter="16" justify="between">
							<u-col span="4" v-for="(item, index) in ruleForm.fwItemReleaseImages" :key="index" @click="previewImage(item.imagePath)">
								<u-image width="179" height="179" :src="item.imagePath" class="form-item_box_body_image">
									<u-loading slot="loading"></u-loading>
									<view slot="error" style="font-size: 24rpx;">加载失败</view>
								</u-image>
							</u-col>
							<view class="form-item_box_head_text" v-if="ruleForm.fwItemReleaseImages && ruleForm.fwItemReleaseImages.length === 0">
								暂无图片
							</view>
						</u-row>
					</view>
				</view>
				<!-- 现场照片 end -->
				<!-- 放行码 start -->
				<view class="form-item_box" v-if="ruleForm.approvalStatus === 1 && ruleForm.releaseStatus === 0">
					<view class="form-item_box_head">
						<span class="form-item_box_head_text">放行码</span>
					</view>
					<view class="form-item_box_body">
						<view class="form-item_box_body_uqrcode">
							<uqrcode v-if="ruleForm.releaseAddress" ref="uQRCode" :mode="mode" :text="ruleForm.releaseAddress" :size="size" :margin="margin"
								:background-color="backgroundColor" :foreground-color="foregroundColor"
								:error-correct-level="errorCorrectLevel" :type-number="typeNumber" :file-type="fileType">
							</uqrcode>
							<view v-else class="u-text-center u-type-error" style="width: 236upx;height: 236upx; margin: 0 auto;">
								{{errorMsg}}!
							</view>
						</view>
					</view>
				</view>
				<!-- 放行码 end -->
				<!-- 驳回原因 start -->
				<view class="form-item_box" v-if="ruleForm.approvalStatus === 2">
					<view class="form-item_box_head">
						<span class="form-item_box_head_text">驳回原因</span>
					</view>
					<view class="form-item_box_body">
						<view class="unit">
							<view class="left" style="width: 100%;">{{ ruleForm.reasonRejection }}</view>
						</view>
					</view>
				</view>
				<!-- 驳回原因 end -->
			</view>
		</view>
	</view>
</template>

<script>
	import uQRCode from '@/uni_modules/Sansnn-uQRCode/components/uqrcode/common/uqrcode'
	export default {
		data() {
			return {
				// 表单
				ruleForm: {
					room: {},
					user: {}
				},
				mode: 'canvas',
				qrCode: '',
				size: 118,
				margin: 10,
				backgroundColor: '#FFFFFF',
				foregroundColor: '#000000',
				errorCorrectLevel: uQRCode.errorCorrectLevel.H,
				typeNumber: -1,
				fileType: 'png',
			}
		},
		onLoad() {
			let that = this
			that.getComplaintsByld(that.$Route.query.id)
		},
		
		methods: {
			getComplaintsByld(id) {
				let params = { id: id }
				this.$api('user.releaseByldList', params).then(res => {
					if (res.code == 200) {
						this.ruleForm = res.data
					}
				})
			},
			// 预览图片
			previewImage(src) {
				uni.previewImage({
					urls: [src]
				});
			}
		},
	}
</script>
<style>
	page {
		background: #F9F9F9;
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
			margin-top: 20upx;
			border-radius: 15upx 15upx 0 0;
			.form-item_box {
				padding: 26upx 30upx 20upx 0upx;
				background-color: #FFFFFF;
				.form-item_box_head {
					height: 34upx;
					margin-left: 10upx;
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
						// justify-content: space-between;
						font-size: 30upx;
						padding: 10upx 0upx;
						.left {
							color: #333333;
							width: 200upx;
						}
						.right {
							color: #333333;
							width: 100%;
							text-align: right;
						}
					}
					.form-item_box_body_text {
						background: #F5F5F5;
						border-radius: 10upx;
						white-space: pre-wrap;
						word-wrap: break-word;
						padding: 10px;
						text-indent: 1em;
					}
					.form-item_box_body_image {
						position: relative;
						left: 50%;
						transform: translateX(-50%);
					}
					.form-item_box_body_uqrcode {
						width: 240rpx;
						border: 2rpx solid #DDDDDD;
					}
				}
			}
		}
	}
</style>
