<!-- 登录界面排版 start -->
<template>
	<view class="" style="width: 100%;height: 100%;background: #fff;">
		<uni-base-page class="login-page">
			<view class="login-page-view">
				<!-- logo区域 start -->
				<view class="login-page-logo-view">
					<!-- <image class="login-page-logo-image" src="https://wxmini-1258758873.cos.ap-guangzhou.myqcloud.com/logo.png" /> -->
					<image class="login-page-logo-image" :src="logoUrl" />
				</view>
				<!-- logo区域 end -->

				<!-- 表单区域 start -->
				<form class="form login-page-form" @submit="onLoginSubmit">
					<view class="input-view">
						<!-- 手机号/邮箱输入框 start -->
						<view class="input-row"><input class="uni-input" type="text" :placeholder="`${i18n.phone}` || '请输入手机号/邮箱'" name="phone" :value="account" /></view>
						<!-- 手机号/邮箱输入框 end -->

						<!-- 密码输入框 start -->
						<view class="input-row"><input class="uni-input" :password="true" :placeholder="`${i18n.password}` || '请输入密码'" name="password" /></view>
						<!-- 密码输入框 end -->

						<!-- #ifndef MP-WEIXIN || MP-ALIPAY -->
						<!-- 隐私政策 start -->
						<!-- 由于只在安卓操作系统以及中文简体语言下显示隐私政策，所以就没有国际化 -->
						<view class="app-privacy" v-if="currentLanguage.indexOf('cn') > -1">
							<view>
								<checkbox @click="checkboxChange" value="cb" :checked="checked" />
								{{ i18n['Loginc-onsent'] || '登录即同意' }}
								<text class="primary" @click="goToPrivacyPage">《{{ i18n['privacy-policy'] || '隐私政策' }}》</text>
								<text class="">{{ i18n['and'] || '及' }}</text>
								<text class="primary" @click="goToAgreementPage">《{{ i18n['service'] || '用户协议' }}》</text>
							</view>
						</view>
						<!-- 隐私政策 end -->
						<!-- #endif -->
					</view>

					<!-- #ifdef MP-WEIXIN -->
					<!-- 微信一键登录 start -->
					<view v-if="ifAddWxLogin" class="other-login">
						<button open-type="getPhoneNumber" @getphonenumber="getPhoneNumber" @click="wxLogin">
							<image style="display: inline-block;" src="../../static/img/weixin.png" />
							<text class="weixin-login-text">微信一键登录</text>
						</button>
					</view>
					<!-- 微信一键登录 end -->
					<!-- #endif -->

					<!-- 登录按钮 start -->
					<view class="login-btn-view">
						<button class="button primary" type="primary" formType="submit">{{ i18n.login || '登录' }}</button>
					</view>
					<!-- 登录按钮 end -->

					<!-- 注册/忘记密码按钮区域 start -->
					<view class="other-btn-view">
						<!-- 注册按钮 start -->
						<view class="left">
							<navigator class="navigator-common" :url="toRegister">{{ i18n.register || '注册' }}</navigator>
						</view>
						<!-- 注册按钮 end -->

						<!-- 忘记密码  start -->
						<view class="right">
							<navigator class="navigator-common" :url="toChangePassword">{{ i18n['forget-password'] || '忘记密码' }}?</navigator>
						</view>
						<!-- 忘记密码  end -->
					</view>
					<!-- 注册/忘记密码按钮区域 end -->
				</form>
				<!-- 表单区域 -->
			</view>
		</uni-base-page>
		<!-- <view v-if="theFirstTime" class="">
			<UserAgreementRivacyPolicy v-on:consent="consent"></UserAgreementRivacyPolicy>
		</view> -->
		<!-- 异地登录提示弹窗  --> 
		<view class="distance-login" v-show="distanceShow">
			<view class="login-content">
				<view class="login-title">异地登录提示</view>
				<view class="login-tips">您的账号正在非常用手机登录，请输入验证码进行登录。</view>
				<view class="login-form">
					<input type="number" v-model="verifyCode" placeholder="请输入验证码" />
					<view class="get-code">验证码获取：请到管理处获取。</view>
				</view>
				<view class="login-btn"><button type="default" @click="seconedLogin">登录</button></view>
				<view class="cancel-login" @click="cancelLogin">取消登录</view>
			</view>
		</view>
	</view>
</template>
<!-- 登录界面排版 end -->

<!-- 登录界面交互行为 start -->
<script>
// 导入aes对称加密的加密和解密方法，在登录界面，如果当前APP版本为4.3.124及以上，将用户名和密码经加密处理后，传给服务器，低于4.3.124版本，不用做加密处理
import { encrypted, decrypted } from "../../../sub-package1/common/js/utils/encryption-decryption/crypto.js";
// 获取缓存的APP信息
let appInfo = uni.getStorageSync("appInfo");
// 从缓存的APP信息获取系统信息
let systemInfo = appInfo.systemInfo;
// 微信一键登录所需的参数，目前只在微信小程序使用
let jsCode = "";
// 当前的配置文件参数信息
let configParam = {};
export default {
	data() {
		return {
			ifLogin: false,
			distanceShow: false,
			verifyCode: "",
			formData:{},
			// 当前语言
			currentLanguage: this.$getLanguageLowerCase(),
			// 从缓存的APP信息获取logo信息
			logoUrl: uni.getStorageSync("appInfo").logo,
			// 从缓存的用户信息获取用户名，主要是处理当APP用户登录过之后，退出APP时，将之前登录的用户名自动赋值在登录界面的用户名输入框
			account: uni.getStorageSync("userInfo").phone,
			// 从缓存的APP信息获取系统信息中的平台，主要用来处理只有当前手机操作系统为安卓时才显示隐私政策信息
			platform: systemInfo.platform,
			// 从配置文件中获取是否需要微信一键登录参数
			ifAddWxLogin: this.$getConfigParam().ifAddWxLogin,
			toRegister: "",
			toChangePassword: "",
			// #ifndef MP-WEIXIN || MP-ALIPAY
			// 1. 在安卓操作系统以及中文简体语言下显示隐私政策，那么隐私政策选中状态的值就从缓存中获取，没有就默认为false
			// 2. 在非安卓操作系统或者非中文简体语言下不显示隐私政策，那么隐私政策选中状态的值一定只为true
			checked: this.$getLanguageLowerCase().indexOf('cn') > -1 ?
					 (uni.getStorageSync("loginAgreePrivacyPolicy") || false) : true
			// #endif

			// #ifdef MP-WEIXIN || MP-ALIPAY
			checked: true
			// #endif

		};
	},
	computed: {
		i18n() {
			return this.$t("login");
		},
		common() {
			return this.$t("common");
		},
		mobile() {
			return this.$t("mobile");
		}
	},
	onShow() {
		// #ifdef MP-WEIXIN || MP-ALIPAY
		// 微信授权登录
		uni.login({
			provider: "weixin",
			success: (res) => {
				this.$showLog("微信授权登录成功", res, "登录界面");
				jsCode = res.code;
			},
			fail: (err) => {
				this.$showErrorLog("微信授权登录失败", err, "登录界面");
			}
		});
		// #endif

		this.$quitApp();
	},
	onLoad() {
		// 获取当前的配置文件参数信息
		configParam = this.$getConfigParam();

		// 国际化标题
		this.$setTitle(this.i18n["login"]);

		// 当在浏览器上刷新当前登录页面的时候，会出现左上角的返回按钮，所以在H5端将左上角的返回按钮隐藏
		// #ifdef H5
		document.getElementsByClassName("uni-page-head-hd")[0].style.display = "none";
		// #endif

		// 如果当前语言是简体中文，那么注册界面和忘记密码界面的账号都是手机号
		if (this.currentLanguage.indexOf('cn') != -1) {
			this.toRegister = "../mobile/mobile?mobileType=1";
			this.toChangePassword = "../mobile/mobile?mobileType=2";
		}
		// 如果当前语言不是简体中文，那么注册界面和忘记密码界面的账号都是邮箱
		else {
			this.toRegister = "../email/email?emailType=1";
			this.toChangePassword = "../email/email?emailType=2";
		}
	},
	methods: {
		// 隐私政策和用户协议复选框改变事件
		checkboxChange() {
			this.checked = !this.checked;
			uni.setStorageSync("loginAgreePrivacyPolicy", this.checked);
		},

		// 跳转到隐私政策页面
		goToPrivacyPage() {
			uni.navigateTo({
				url: "../privacy/privacy?index=1"
			});
		},
		// #ifdef MP-WEIXIN
		goToPrivacyPage() {
			uni.navigateTo({
				url: "../weixin-privacy/privacy"
			});
		},
		// #endif
		// 跳转到用户协议页面
		goToAgreementPage() {
			uni.navigateTo({
				url: "../privacy/privacy?index=2"
			});
		},

		// 微信小程序登录需要订阅消息模板
		wxLogin() {
			// 调用订阅消息模板
			// #ifdef MP-WEIXIN
			wx.requestSubscribeMessage({
				tmplIds: this.$getConfigParam().wxPushTemplateId,
				success: (res) => {
					this.$showLog("微信小程序调用订阅消息模板成功", res, "登录界面");
				},
				fail: (err) => {
					this.$showLog("微信小程序调用订阅消息模板失败", err, "登录界面");
				}
			});
			// #endif
		},

		// 获取用户手机号
		getPhoneNumber(e) {
			this.$showLog("获取手机号结果", e.detail, "登录界面");
			let detail = e.detail || {};
			if (detail.errMsg == "getPhoneNumber:fail user deny") {
				this.$showToast("授权失败");
			} else {
				this.$req.request({
					url: "/appUser/app/wxMiniLogin",
					data: {
						jsCode: jsCode,
						iv: detail.iv,
						encryptedData: detail.encryptedData,
						wxMiniAppId: this.$getConfigParam().wxMiniAppId
					},
					success: res => {
						this.$showLog("微信一键登录结果", res, "登录界面");
						if (res.code == 0) {
							this.ifLogin = true;
							uni.setStorageSync("ifLogin",this.ifLogin);
							// 微信一键登录成功，保存用户信息，跳转到主界面
							this.$showToast(this.i18n["login-success"]);
							uni.setStorageSync("userInfo", res.data);
							uni.switchTab({
								url: "/pages/main/main"
							});
							// uni.setStorageSync("openId",)
						} else {
							// 微信一键登录失败，弹出错误信息
							this.$showToast(res.msg);
						}
					}
				});
			}
		},

		// 校验表单数据
		_checkFormData(formData) {
			return new Promise((resolve, reject) => {
				// 规定了表单校验的规则
				let checkList = [
					{
						name: "phone",
						rules: [
							{
								required: true,
								message: this.i18n["account-null"]
							}
						]
					},
					{
						name: "password",
						rules: [
							{
								required: true,
								message: this.i18n["password-null"]
							}
						]
					}
				];
				// 表单校验
				this.$formSubmitCheck({
					formData: formData,
					checkList: checkList,
					success: () => {
						// 通过了表单的校验规则（phone和password都不能为空），接下来判断form表单phone字段输入值如果不带@符号，就将其作为手机号来校验处理
						if (formData["phone"].indexOf("@") === -1) {
							if (!this.$checkPhoneNumber(formData["phone"])) {
								this.$showToast(this.mobile["correct-phone"] || "请输入正确手机号");
								reject();
								return;
							}
						}
						resolve();
					},
					fail: () => {
						// 没有通过表单的校验规则
						reject();
					}
				});
			});
		},

		// 当校验表单数据无误后，将表单数据提交到服务器，进行登录
		_requestLogin(formData) {
			let sdkUtil = this.$sdkUtil, clientId = this.$getAppInfo().clientId;
			formData = Object.assign(formData, systemInfo);
			formData["clientId"] = clientId, formData["jsCode"] = jsCode;
			// 当前APP版本（从配置文件中获取）
			let appVersion = this.$getConfigParam().appVersion;
			// APP加密的最低版本（从配置文件中获取）
			let appEncryptedLowestVersion = this.$getConfigParam().appEncryptedLowestVersion;
			// 调用登录接口
			this.$req.request({
				url: "/appUser/app/login",
				data: {
					...formData,
					deviceId: systemInfo.deviceId,
					verifyCode: this.verifyCode,
					deviceBrand: systemInfo.model,
					appVersion: "1.1.0",
					deviceVersion: systemInfo.system,
					isForceLogin: true,
					wxMiniAppId: this.$getConfigParam().wxMiniAppId,
					// 从4.3.124版本开始phone和password用密文传输，对手机号和密码对称加密
					phone: appVersion >= appEncryptedLowestVersion ? encrypted(formData["phone"]) : formData["phone"],
					password: appVersion >= appEncryptedLowestVersion ? encrypted(formData["password"]) : formData["password"]
				},
				isLogin: true,
				success: res => {
					if (res.code === 0) {
						this.ifLogin = true;
						uni.setStorageSync("ifLogin",this.ifLogin);
						// 界面弹出登录成功的提示
						this.$showToast(this.i18n["login-success"]);

						let data = res.data, currentPhone = formData["phone"], oldPhone = this.$getUserInfo().phone;

						// 当前登录的APP用户名和上一次登录的APP用户名不一样，将缓存的APP用户数据清空
						if (oldPhone !== undefined && currentPhone !== oldPhone) {
							this.$removeUserInfo();
						}

						// 只在APP端做登录DMVPhone音视频服务器处理
						// #ifdef APP-PLUS
						sdkUtil.loginVPhoneServer(formData["phone"]);
						// #endif

						// 微信小程序蓝牙SDK登录，APP蓝牙SDK登录，即可在蓝牙开门后，将蓝牙开门记录上传到服务器
						// APP蓝牙SDK登录成功后，在蓝牙SDK层（不在uniapp层）做蓝牙开门记录上传处理
						// 微信小程序蓝牙SDK登录成功后，在微信小程序蓝牙SDK层（不在uniapp层）做蓝牙开门记录上传处理
						// #ifdef MP-WEIXIN || MP-ALIPAY || APP-PLUS
						sdkUtil.bluetoothlogin(formData["phone"], configParam.baseUrl, configParam.appId, configParam.appSecret);
						// #endif

						let oldUserInfo = this.$getUserInfo();
						if (oldUserInfo !== undefined && oldUserInfo !== null && JSON.stringify(oldUserInfo) !== '{}') {
							data = {
								...oldUserInfo,
								...data
							};
						}
						// 缓存用户数据
						uni.setStorageSync("userInfo", data);

						this.$editUserInfo("phone", currentPhone);

						// 将是否近场开门保存在用户数据
						this.$editUserInfo("isOpenNearField", data["isNearOpenDoorParam"] === 1);

						// 获取当前用户的所有门禁
						this.$fetchDevList({
							isShowLoad: false,
							isForceLogin: false,
							url: "/sqDoor/app/getAllDoorRole"
						});

						// 推送注册账号
						this.$sdkUtil.registerPushSDK(data.phone);

						// 推送数据监听
						this.$sdkUtil.addPushListener();

						// 跳转到社区tabbar
						uni.switchTab ({
							url: "/pages/main/main"
						});
					}else if(res.code === 10039){
						uni.hideToast();
						this.distanceShow = true;
					}
				}
			});
		},

		// 登录
		onLoginSubmit(e) {
			// 获取表单数据
			this.formData = e.detail.value;
			console.log("登录登录",this.formData)
			// 开始校验表单数据
			this._checkFormData(this.formData).then(() => {
				// 校验表单数据成功，判断是否勾选了同意《隐私政策》和《用户协议》，如果勾选了，开始将表单数据提交到服务器，否则提示APP用户"请先勾选同意后再登录"
				if (this.checked) {
					this._requestLogin(this.formData);
				} else {
					this.$showToast(this.i18n["agree-privacy-policy"] || "请先勾选同意后再登录");
				}
			});
		},
		// 异地提示登录
		seconedLogin(){
			if(!this.verifyCode){
				this.$showToast("请输入验证码")
				return;
			}
			this._requestLogin(this.formData);
		},
		cancelLogin(){
			this.distanceShow = false;
		}
	}
};
</script>
<!-- 登录界面交互行为 end -->

<!-- 登录界面样式 start -->
<style lang="scss" scoped>
.distance-login {
	background: #f1f1f1;
	width: 100%;
	height: 100%;
	position: fixed;
	top: 0;
	bottom: 0;
}
.login-content {
	height: 100%;
	text-align: center;
	margin: auto;
	margin-top: 240upx;
	width: 90%;
}
.login-title {
	font-size: 34upx;
	color: #000;
	font-weight: bold;
}
.login-tips {
	font-size: 30upx;
	color: #e1344a;
	text-align: left;
	margin-top: 40upx;
	margin-bottom: 80upx;
	line-height: 40upx;
}
.login-form {
	width: 70%;
	margin: auto;
}
.login-content input {
	background: #fff;
	border: 1px solid #bbb;
	height: 60upx;
	width: 100%;
	margin: auto;
	border-radius: 20upx;
}
.get-code {
	font-size: 30upx;
	color: #aaa;
	margin-top: 10upx;
	text-align: left;
}
.login-btn button {
	width: 280upx;
	height: 70upx;
	line-height: 70upx;
	background: #13bc75;
	border-radius: 15upx;
	color: #ffffff;
	font-size: 28upx;
	margin-top: 50%;
	margin-bottom: 40upx;
}
.cancel-login {
	font-size: 30upx;
	color: #0faeff;
}
.login-page {
	width: 100%;
	background-color: #ffffff;
}
.login-page-logo-view {
	width: 100%;
	padding: 80upx 0;
	text-align: center;
}
.login-page-logo-image {
	width: 140upx;
	height: 140upx;
}

.login-page-form {
	padding: 0 30upx;
	display: block;
}
/* #ifdef MP-WEIXIN */
.login-btn-view {
	margin-top: 10upx;
}
.login-btn-view button {
	background-color: #fff !important;
	border-radius: 0;
	font-size: 14px;
	color: #000;
}
.login-btn-view button::after {
	border: none;
}
/* #endif */

/* #ifdef APP-PLUS || H5 */
.login-btn-view {
	background-color: #0faeff !important;
	border-radius: 50upx;
	margin-top: 36upx;
}
/* #endif */
/* #ifdef MP-ALIPAY */
.login-btn-view {
	margin-top: 40upx;
}
/* #endif */

.other-btn-view {
	margin-top: 30upx;
}
.other-btn-view .left,
.other-btn-view .right {
	padding: 20upx;
}

.app-privacy {
	margin: 15upx 0 0;
	color: #b4b4b4;
}
.privacy-text {
	text-decoration: underline;
	// font-style:italic;
	&.italic {
		font-style: italic;
	}
}

.background-view {
	display: flex;
	flex-direction: row;
	justify-content: center;
	width: 100%;
	bottom: 0;
	position: absolute;
}
/* padding: 0; */
.bg-img {
	display: inline-block;
	margin: 0;
	width: 100%;
}

.other-login {
	width: 100%;
	height: 100upx;
	line-height: 100upx;
	text-align: center;
	margin-top: 36upx;
}
.other-login button {
	background-color: #0faeff !important;
	color: #fff;
	border-radius: 50rpx;
	font-size: 30upx;
}
.other-login button image {
	display: inline-block;
	vertical-align: middle;
	// margin-top: 20upx;
	width: 60upx;
	height: 60upx;
}

.weixin-login-text {
	display: inline-block;
	font-size: 28upx;
	height: 100upx;
	line-height: 100upx;
}

.privacy-text {
	text-decoration: underline;
}
</style>
<!-- 登录界面样式 end -->
