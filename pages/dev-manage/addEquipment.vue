<template>
	<!-- 新增师傅 -->
	<view style="height: 100%;">
		<u-navbar class="navbar" title="添加设备"></u-navbar>
		<view class="content">
			<u-form :border-bottom="false" label-width="190" style="padding: 20upx 20px 0upx 20px;" :model="form"
				ref="uForm">
				<view class="form-item_box">
					<u-form-item required class="form-item" prop="positionTypeName" :border-bottom="false" label="安装位置">
						<u-input type="select" @click="positionTypeSelect = true" placeholder="请选择安装位置"
							v-model="form.positionTypeName" />
						<u-select @confirm="confirm" v-model="positionTypeSelect" :list="positionTypeList"></u-select>
					</u-form-item>
					<u-form-item required class="form-item" prop="name" :border-bottom="false" label="设备名称">
						<u-input placeholder="请输入设备名称" v-model="form.name" />
					</u-form-item>

					<u-form-item required class="form-item" prop="deviceInstallAddress" :border-bottom="false"
						label="设备地址">
						<u-input placeholder="请输入设备地址" v-model="form.deviceInstallAddress" />
					</u-form-item>

					<u-form-item required class="form-item" prop="devSn" :border-bottom="false" label="设备序列号">
						<u-input placeholder="请输入设备序列号" v-model="form.devSn">
							<span @click="goToScanList" class="unit" slot="unit">扫描</span>
						</u-input>
					</u-form-item>

					<!-- 					<u-form-item class="form-item" prop="idCard" :border-bottom="false" label="身份证">
						<u-input placeholder="请输入身份证" v-model="form.idCard" />
					</u-form-item> -->
				</view>

			</u-form>
		</view>
		<view class="btn_box">
			<u-button @click="onSubmit" type="primary">提交</u-button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				labelStyle: {
					fontSize: '34upx',
					fontWeight: 'bold',
					color: '#333333'
				},
				positionTypeSelect: false,
				form: {

				},
				positionTypeList: [{
						value: 0,
						label: '园区'
					},
					{
						value: 1,
						label: '楼栋'
					},
					{
						value: 2,
						label: '房间'
					}
				],
				rules: {
					name: [{
						required: true,
						message: '请输入设备名称',
						trigger: ['blur']
					}],
					deviceInstallAddress: [{
						required: true,
						message: '请输入设备地址',
						trigger: 'blur'
					}],
					devSn: [{
						required: true,
						message: '请输入设备序列号',
						trigger: 'blur'
					}],
					positionTypeName: [{
						required: true,
						message: '请选择安装位置',
						trigger: ['change']
					}],
				}
			}
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		methods: {
			goToScanList() {
				uni.navigateTo({
					url: "/pages/dev-manage/scan-dev-list"
				})
			},
			onSubmit() {
				// setDevDevice
				this.$refs.uForm.validate(valid => {
					if (valid) {
						let params = {
							devSn:this.form.devSn,
							name:this.form.name,
							deviceInstallAddress:this.form.deviceInstallAddress,
							positionType:this.form.positionType,
						}
						this.$api('equipment.setDevDevice', params).then(res => {
								uni.showToast({
									title: res.msg || '请求出错,稍后重试',
									icon: 'none',
									duration: 500,
									mask: true
								});
							})
						console.log('验证通过');
					} else {
						console.log('验证失败');
					}
				});
			},
			confirm(e) {
				if (this.positionTypeSelect) {
					this.form.positionTypeName = e[0].label;
					this.form.positionType = e[0].value;
				}
			}
		},
		onLoad() {

		},
		onShow() {

		},
	}
</script>

<style scoped lang="scss">
	page {
		height: 100vh;
	}
	.unit{
		color: rgb(0, 122, 255);
	}
	.btn_box {
		// position: sticky;
		// position: fixed;
		width: 100%;
		// bottom: 0;
		margin-top: 20px;
		padding: 0 75upx;
		margin-bottom: 10upx;

	}

	.title {
		font-size: 34upx;
		color: #333333;
		font-weight: bold;
	}

	.form-item_box {
		padding: 0 15upx;
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
