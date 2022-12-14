<template>
	<uni-base-page class="content uni-base-page">
		<form @submit="setDevPwd" class="form">
			<view class="tips">{{ manage["set-dev-pwd-tips"] || "提示：若未设置过密码，旧密码不需填写，设备密码为六位数" }}</view>
			<view class="wifi-setting">
				<ul>
					<li>
						<view class="info-title"> {{ manage["old-pwd"] || "旧密码"}}</view>
						<view class="info-name">
							<input type="text" :placeholder="`${manage['input-old-pwd']}` || '请输入旧密码'" name="oldPwd" />
						</view>
					</li>
					<li>
						<view class="info-title">{{ manage["new-pwd"]||"新密码" }}</view>
						<view class="info-name">
							<input type="text" :placeholder="`${manage['input-new-pwd']}` || '请输入新密码'" name="newPwd" />
						</view>
					</li>
				</ul>
				<view class="setting-button">
					<button type="primary" class="button primary"
						formType="submit">{{ manage["save-set"] || "保存配置" }}</button>
				</view>
			</view>
		</form>
	</uni-base-page>
</template>

<script>
	var devObj = {};
	export default {
		data() {
			return {
				configParam: {
					oldPwd: "",
					newPwd: "",
				}
			}
		},

		computed: {
			manage() {
				return this.$t("manage");
			},
			common() {
				return this.$t("common");
			},
			title() {
				return this.$t("title");
			},
			sdk(){
				return this.$t("sdk")
			},
			main(){
				return this.$t("main")
			}
		},

		onLoad(options) {
			let devObjStr = options.devObj;
			let _this = this;
			if (devObjStr !== undefined && devObjStr !== "") {
				devObj = JSON.parse(devObjStr);
			}
		},
		onReady() {
			uni.setNavigationBarTitle({
				title: this.title["set-dev-pwd"]
			})
		},
		methods: {
			setDevPwd(e) {
				let _this = this;
				let sdkUtil = this.$sdkUtil;
				let formData = this.configParam;
				let checkList = [];
				checkList = [{
					name: "oldPwd",
					rules: [{
						required: false,
						message: this.manage["input-old-pwd"]
					}]
				}, {
					name: "newPwd",
					rules: [{
						required: true,
						message: this.manage["input-new-pwd"]
					}]
				}];
				formData = e.detail.value;
				// 进行表单检查
				this.$formSubmitCheck({
					formData: formData,
					checkList: checkList,
					success: () => {
						sdkUtil.modifyPwd(devObj, formData, errorCode => {
							uni.hideLoading()
							this.$api('equipment.modifyParameters',{
								devSn: this.devObj.devSn,
								devAccSupperPassword: formData.newPwd,
							}).then(res => {
								if (res.code == 200) {
									this.$showToast(this.sdk["set-pwd-succeed"] || "配置紧急开门密码成功");
									console.log(666)
								} else {
									this.$showToast(this.sdk["set-pwd-succeed"] || "配置紧急开门密码成功"+',' +
									this.main["upload-server-failed"] ||"上传服务器失败");
								}
							})
							// this.$req.request({
							// 	url: "/devDevice/app/setDevAccSupperPassword",
							// 	method: "POST",
							// 	data: {
							// 		devSn:devObj.devSn,
							// 		devAccSupperPassword: formData.newPwd,
							// 	},
							// 	success: res => {
							// 		if (res.code == 0) {
							// 			this.$showToast(this.sdk["set-pwd-succeed"] || "配置紧急开门密码成功");
							// 			console.log(666)
							// 		} else {
							// 			this.$showToast(this.sdk["set-pwd-succeed"] || "配置紧急开门密码成功"+',' +
							// 			this.main["upload-server-failed"] ||"上传服务器失败");
							// 		}
							// 	}
							// })
						});
					}
				});
			}
		}
	}
</script>

<style>
	.content {
		width: 100%;
		height: 100%;
		position: absolute;
	}

	.tips {
		color: #AAAAAA;
		padding: 10upx 2%;
	}

	.wifi-setting ul {
		padding: 0
	}

	.dynamic-setting {
		width: 100%;
		height: 300upx;
		line-height: 300upx;
		text-align: center;
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

	.set-more {
		width: 96%;
		margin: 10upx 2%;
		padding: 0 10upx;
	}

	.icon-more {
		display: inline-block;
		vertical-align: middle;
		margin-left: 10upx;
		width: 0;
		height: 0;
		border: 10upx solid transparent;
		border-bottom-color: #000;
		transform: rotate(180deg);
		transition: .2s ease-in;
	}

	.setting-button {
		width: 100%;
	}

	.setting-button button {
		width: 80%;
		margin: 40upx auto;
	}
</style>
