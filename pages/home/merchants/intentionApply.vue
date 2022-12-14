<template>
	<!-- 客户信息 -->
	<view>
		<u-navbar title="意向申请" :border-bottom="true">
		</u-navbar>
		<view class="content">
			<u-form :border-bottom="false" label-width="190" style="padding: 20upx 20px 0upx 20px;" :model="form"
				ref="uForm">
				<view class="title">
					客户信息
				</view>
				<view class="form-item_box">
					<u-form-item required class="form-item" prop="name" :border-bottom="false" label="客户名称">
						<u-input placeholder="请输入客户名称" v-model="form.name" />
					</u-form-item>

					<u-form-item required class="form-item" prop="phone" :border-bottom="false" label="联系方式">
						<u-input type="number" placeholder="请输入联系方式" v-model="form.phone" />
					</u-form-item>

					<!-- <u-form-item required class="form-item" prop="sourceName" :border-bottom="false" label="来源">
						<u-input type="select" @click="sourceSelect = true" placeholder="请选择来源" v-model="form.sourceName" />
					</u-form-item>
					
					<u-form-item required class="form-item" prop="investmentName" :border-bottom="false" label="意向房间">
						<u-input type="select" @click="investmentSelect = true" placeholder="请选择房间" v-model="form.investmentName" />
					</u-form-item> -->
				</view>
				<view class="title">
					备注
				</view>
				<view class="form-item_box">
					<u-form-item label-position="top" :border-bottom="false" label="">
						<my-textarea :value.sync="form.remark"></my-textarea>
					</u-form-item>
				</view>
				<view class="btn_box">
					<u-button @click="onSubmit" shape="circle" type="primary">保存</u-button>
				</view>
			</u-form>
		</view>
		<!-- 成功框 -->
		<u-modal v-model="showModel" title='' confirm-text="我知道了" :content-style="{ textAlign: 'center' }"
			@confirm="knowConfirm">
			<view class="u-flex-col u-col-center">
				<u-image width="125upx" height="125upx" shape="circle"
					:src="'../../../static/home/employeeManagement/tijiao.png'">
					<u-loading slot="loading"></u-loading>
					<view slot="error" style="font-size: 24upx;">加载失败</view>
				</u-image>
				<view style="font-size: 34upx; margin: 22upx 0 42upx;">信息提交成功</view>
			</view>
		</u-modal>
	</view>
</template>

<script>
	import myTextarea from "@/components/my-textarea/my-textarea.vue"
	export default {
		components: {
			myTextarea
		},
		data() {
			return {
				// 成功框标识
				showModel: false,
				investmentSelect: false,
				sourceSelect: false,
				investmentSelectList: [],
				sourceSelectList: this.$enum.source,
				form: {

				},
				rules: {
					name: [{
						required: true,
						message: '请输入客户名称',
						trigger: ['blur']
					}],
					phone: [{
						required: true,
						message: '请输入联系方式',
						trigger: ['blur']
					}],
					// sourceName: [{
					// 	required: true,
					// 	message: '请选择客户来源',
					// 	trigger: ['blur']
					// }],
					// investmentName: [{
					// 	required: true,
					// 	message: '请选择意向房间',
					// 	trigger: ['blur']
					// }]
				}
			}
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		methods: {
			knowConfirm() {
				uni.navigateBack()
			},
			onSubmit() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						let params = {
							investmentId: this.$Route.query.id,
							zoneId: this.$Route.query.zoneId,
							name: this.form.name,
							phone: this.form.phone,
							personId: uni.getStorageSync('userInfo').id,
							remark: this.form.remark || ''
						}
						this.$api('merchants.intentionApply', params).then(res => {
							if(res.code == 200){
								this.showModel = true
							}
						})
						console.log('验证通过');
					} else {
						console.log('验证失败');
					}
				});

			},
		},
		onLoad() {
		},
		onShow() {

		},
	}
</script>

<style scoped lang="scss">
	.content_top {
		display: flex;
		justify-content: flex-end;

		.subsection {
			width: 145upx;
			border-radius: 18upx !important;
			border: 1px solid #dddddd;

			/deep/ .u-item {
				border: 0 !important;
			}

			/deep/ .u-item-bg {
				width: 72.5upx !important;
				// height: 36upx !important;
				// bottom:0 !important;
				background: #3875f6 !important;
				border-radius: 18upx !important;
				// height: 50%;
			}
		}
	}

	.btn_box {
		margin-top: 20px;
		padding: 0 40upx;
		height: 100px;
	}

	.title {
		padding: 40upx 0 0 0;
		font-size: 34upx;
		color: #333333;
		font-weight: bold;
	}

	.form-item_box {
		padding: 0 15upx;
	}


	.upload {
		padding: 15upx;
	}

	.content {
		background: #FFFFFF;
		margin-top: 3px;

		.form-item {
			position: relative;

			&:before {
				content: '';
				position: absolute;
				bottom: 0;
				right: 40upx;
				height: 1px;
				width: calc(100% - 180upx);
				background-color: #dddddd;
			}
		}
	}
</style>
