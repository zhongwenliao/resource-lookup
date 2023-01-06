<template>
	<view class="wrap">
		<form @submit="settingParam" @reset="reset" class="form">
			<view class="wifi-setting">
				<ul>
					<li>
						<view class="info-title">{{ manage["name-APN"] || "APN名称"}}</view>
						<view class="info-name">
							<input type="text" onpaste="return false" ondragenter="return false"
								style="ime-mode:disabled" :placeholder="`${manage['input-name-APN']}` || '请输入APN名称'"
								name="apnName" v-model="configParam.apnName" />
						</view>
					</li>
					<li>
						<view class="info-title">{{ manage["user-name"] || "用户名"}}</view>
						<view class="info-name">
							<input type="text" onpaste="return false" ondragenter="return false"
								style="ime-mode:disabled" :placeholder="`${manage['input-user-name']}` || '请输入用户名'"
								name="username" v-model="configParam.username" />
						</view>
					</li>
					<li>
						<view class="info-title">{{ manage["password"] || "密码"}}</view>
						<view class="info-name">
							<input type="text" onpaste="return false" ondragenter="return false"
								style="ime-mode:disabled" :placeholder="`${manage['input-password']}` || '请输入密码'"
								name="password" v-model="configParam.password" />
						</view>
					</li>
				</ul>
				<view class="setting-button">
					<button type="primary" class="button primary"
						formType="submit">{{ manage["save-set"] || "保存配置" }}</button>
				</view>
				<view class="setting-button">
					<button type="primary" @click="resetBtn"
						class="button primary">{{ manage["reset-APN"] || "重置APN" }}</button>
				</view>
			</view>
		</form>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				devObj: {},
				configParam: {
					apnName: '',
					username: "",
					password: ''
				}
			}
		},
		computed: {
			manage() {
				return this.$t("manage")
			},
			common() {
				return this.$t("common")
			},
			sdk() {
				return this.$t("sdk")
			},
			main() {
				return this.$t("main")
			}
		},
		onLoad(options) {
			this.devObj = JSON.parse(options.devObj);
			uni.setNavigationBarTitle({
				title: this.manage["set-APN"]
			});
			this.getAPN()
		},

		methods: {
			//获取 APN信息
			getAPN() {
				this.$sdkUtil.getAPNSetting(this.devObj, result => {
					uni.hideLoading()
					if (result.errorCode === 0) {
						console.log(result);
						let data = result.data;
						this.configParam = data
					}
				})
			},
			//保存配置
			settingParam(e) {
				let formData = e.detail.value
				if (formData.apnName == '') {
					this.$showToast(this.manage["please-input"] + ' ' + this.manage["name-APN"]);
					return
				}
				this.$sdkUtil.setAPNSetting(this.devObj, formData, errorCode => {
					uni.hideLoading()
					console.log(errorCode)
					if (errorCode === 0) {
						this.$api('equipment.modifyParameters',{
							devSn: this.devObj.devSn,
							apnName: formData.apnName,
							username: formData.username,
							password: formData.password
						}).then(res => {
							if (res.code == 200) {
								this.$showToast(this.sdk["successfully-configured"] || "配置成功");
							} else {
								this.$showToast(this.sdk["successfully-configured"] || "配置成功" +
									',' + this.main["upload-server-failed"] || "上传服务器失败");
							}
						})
						// this.$req.request({
						// 	url: "/devDevice/app/configApn",
						// 	method: "POST",
						// 	data: {
						// 		devSn: this.devObj.devSn,
						// 		apnName: formData.apnName,
						// 		username: formData.username,
						// 		password: formData.password
						// 	},
						// 	success: res => {
						// 		if (res.code == 0) {
						// 			this.$showToast(this.sdk["successfully-configured"] || "配置成功");
						// 		} else {
						// 			this.$showToast(this.sdk["successfully-configured"] || "配置成功" +
						// 				',' + this.main["upload-server-failed"] || "上传服务器失败");
						// 		}
						// 	}
						// })
					} else {
						this.$showToast(this.btCode[errorCode] || (this.manage["set-failed"] || "配置失败") +
							`(${errorCode})`);
					}
				})
			},
			resetBtn() {
				let that = this
				uni.showModal({
					title: that.common['hint'],
					content: that.manage['are-you-sure-reset-APN'],
					confirmText: that.common['confirm'],
					cancelText: that.common['cancel'],
					success: function(res) {
						if (res.confirm) {
							that.reset()
						} else if (res.cancel) {}
					}
				});
			},
			//重置APN
			reset(e) {
				this.configParam = {
					apnName: '',
					username: "",
					password: ''
				}
				this.$sdkUtil.setAPNSetting(this.devObj, this.configParam)
			}
		}
	}
</script>

<style>
	page {
		background-color: #efeff4;
	}

	.wrap {
		padding: 18upx 0;

	}

	.wifi-setting ul {
		padding: 0
	}

	.wifi-setting ul li {
		background: #ffffff;
		min-height: 80upx;
		height: auto;
		display: inline-flex;
		line-height: 80upx;
		width: 96%;
		padding: 0 2%;
		border-bottom: 2upx solid #eee;
	}

	.wifi-setting .manual-mode-btn {
		padding: 10upx 23upx;
		color: #1E90FF;
		margin: 8upx 0;
		text-align: right;
	}

	.wifi-setting .manual-mode-btn-hover {
		background-color: #D3D3D3;
	}

	.info-title {
		width: 30%;
		display: inline-block;
		padding: 10upx;
		line-height: 80upx;
	}

	.info-name {
		width: 70%;
		display: inline-block;
		text-align: right;
		padding: 10upx;
		line-height: 80upx;
		color: grey;
	}

	.info-name input {
		font-size: 28upx;
		height: 80upx;
		line-heigth: 80upx;
	}

	.setting-button {
		width: 100%;
	}

	.setting-button button {
		width: 80%;
		margin: 40upx auto;
	}
</style>
