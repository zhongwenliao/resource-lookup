<template>
	<!-- networkType值：1为支持以太网，2为支持wifi，3为支持2G，4为支持4G,5为支持NB,6为支持LORA -->
	<view class="content uni-base-page">
		<view class="form-view">
			<form @submit="settingParam" class="form"  v-if="(networkType.indexOf('2') > -1 || networkType.indexOf('3') > -1 || networkType.indexOf('4') > -1) && supportVideo != 1 && devObj.hardwarePlatform == 1">
				<view class="wifi-setting">
					<!-- hardwarePlatform  1单片机  2嵌入式  3Android -->
					<view v-if="!$isEmpty(devObj.supportNetworkType) && devObj.supportNetworkType.indexOf('2') > -1 && devObj.hardwarePlatform == 1"> 
						<ul>
							<li v-if="isAndroid && manualMode === 1" @click="goToWifiList">
								<view class="info-title">{{ manage["wifi-name"] || "WiFi名称" }}</view>
								<view class="info-name">
									<input type="text" :placeholder="`${common['select']}` || '请选择'" disabled name="wifiName" :value="wifiName"/>
								</view>
							</li>
							<li v-if="isAndroid && manualMode === 2">
								<view class="info-title">{{ manage["wifi-name"] || "WiFi名称" }}</view>
								<view class="info-name">
									<input type="text" :placeholder="`${common['input']}` || '请输入'" name="wifiName" :value="wifiName"/>
								</view>
							</li>
							<view v-if="isAndroid" class="manual-mode-btn" hover-class="manual-mode-btn-hover" @click="changeManualMode">{{ manualMode === 1 ? manage["manual-input"] || "手动输入" : manage["manual-select"] || "手动选择"}}</view>
							<li v-if="!isAndroid">
								<view class="info-title">{{ manage["wifi-name"] || "WiFi名称" }}</view>
								<view class="info-name">
									<input type="text" :placeholder="`${manage['input-name']}` || '请输入WiFi名称'" name="wifiName"/>
								</view>
							</li>
							<li>
								<view class="info-title">{{ manage["wifi-pwd"] || "WiFi密码" }}</view>
								<view class="info-name">
									<input type="text" :placeholder="`${manage['input-pwd']}` || '请输入WiFi密码'" name="wifiPwd"/>
								</view>
							</li>
						</ul>
						<view class="set-more" @click="moreSettings">{{ manage["advanced-settings"] || "高级设置" }}<span class="icon-more"></span></view>
					</view>
					<ul v-if="networkType.indexOf('2') > -1 ? ifShowMore : true">
						<li>
							<view class="info-title">{{ manage["ip-address"] || "IP地址"}}</view>
							<view class="info-name">
								<input type="text" :placeholder="`${manage['input-ip-address']}` || '请输入IP地址'" name="ipAddress" @input="inputIpAddress" :value="configParam.ipAddress"/>
							</view>
						</li>
						<li>
							<view class="info-title">{{ manage["port"] || "端口"}}</view>
							<view class="info-name">
								<input type="text" :placeholder="`${manage['input-port']}` || '请输入端口号'" name="port" @input="inputPort" :value="configParam.port"/>
							</view>
						</li>
					</ul>
					<view class="setting-button">
						<button type="primary" class="button primary" formType="submit">{{ manage["save-set"] || "保存配置" }}</button>
					</view>
				</view>
			</form>
			
			<form @submit="settingParam" class="form" v-else>
				<view class="wifi-setting">
					<ul>
						<li>
							<view class="info-title">{{ manage["ip-address"] || "IP地址"}}</view>
							<view class="info-name">
								<input type="text" :placeholder="`${manage['input-ip-address']}` || '请输入IP地址'" name="ipAddress" @input="inputIpAddress" :value="configParam.ipAddress"/>
							</view>
						</li>
						<li>
							<view class="info-title">{{ manage["port"] || "端口"}}</view>
							<view class="info-name">
								 <!-- 硬件平台 （1 单片机， 2. 嵌入式， 3 Android） -->
								<input type="text" :placeholder="`${manage['input-port']}` || '请输入端口号'" name="port" @input="inputPort" :value="configParam.port"/>
							</view>
						</li>
					</ul>
					<view class="setting-button">
						<button type="primary" class="button primary" formType="submit">{{ manage["save-set"] || "保存配置" }}</button>
					</view>
				</view>
			</form>
			
		</view>
	</view>
</template>

<script>
	var devObj = {};
	export default {
		data() {
			return {
				wifiName: "",
				ifShowMore: false,
				isAndroid: uni.getSystemInfoSync().platform === "android",
				supportVideo: null,
				manualMode: 1,
				networkType: "",
				devObj: {},
				configParam: {
					ipAddress: this.$getConfigParam().iotIPAddress,
					port: "",
				}
			}
		},
		methods: {
			//修改高级设置里面的 IP地址
			inputIpAddress(e) {
				this.configParam.ipAddress = e.target.value
			},
			//修改端口
			inputPort(e) {
				this.configParam.port = e.target.value
			},
			// 进入获取wifi列表页面，仅适用于安卓
			goToWifiList() {
				uni.navigateTo({
					url: "wifi-list"
				});
			},
			
			// 显示或隐藏高级设置
			moreSettings() {
				this.ifShowMore = !this.ifShowMore;
			},
			
			// 切换手动输入或手动选择WiFi名称(1：手动输入，2：手动选择)
			changeManualMode() {
				this.manualMode = this.manualMode === 1 ? 2 : 1;
			},
			
			// 提交保存参数
			settingParam(e) {
				var _this = this;
				var sdkUtil = this.$sdkUtil;
				var checkList = [{
					name: "wifiName",
					rules: [{
						required: true,
						message: _this.manage['name-null'] || "WiFi名称不能为空"
					}]
				}, {
					name: "wifiPwd",
					rules: [{
						required: true,
						message: _this.manage['pwd-null'] || "WiFi密码不能为空"
					}]
				}];
				// 进行表单检查
				var formData = e.detail.value;
				formData.ipAddress = this.configParam.ipAddress;
				formData.port = this.configParam.port;
				if(this.networkType.indexOf("3") > -1 || this.networkType.indexOf("4") > -1) {
					formData["wifiName"] = "12345678";
					formData["wifiPwd"] = "12345678";
				}
				this.$formSubmitCheck({
					formData: formData,
					checkList: checkList,
					success: () => {
						formData["ipAddress"] = formData["ipAddress"] || "106.52.94.106";
						if(this.supportVideo == 1) {
							formData["port"] = formData["port"] || "8089";
						}else {
							formData["port"] = formData["port"] || "8169";
						}
						sdkUtil.configCommunicationParams(devObj, formData);
					}
				});
			}
			
			
		},
		onLoad(options) {
			devObj = options.devObj;
			this.devObj = JSON.parse(devObj);
			console.log(this.devObj)
			var _this = this;
			if(devObj !== undefined && devObj !== "") {
				devObj = JSON.parse(devObj);
				this.networkType = devObj.supportNetworkType;
				this.supportVideo = devObj.isSupportSipVideo;
				this.configParam = {
					"ipAddress": devObj.iotServerIp,
					"port": devObj.iotServerPort,
				};
			}
			uni.setNavigationBarTitle({
				title: this.manage["set-params"]
			});
			this.$onfire.on("EventWifiNameChange", e => {
				_this.wifiName = e.wifiName;
			})
		},
		computed: {
			manage() {
				return this.$t("manage");
			},
			common() {
				return this.$t("common");
			}

		},
		onUnload() {
			this.$onfire.un("EventWifiNameChange");
		}
	}
</script>

<style>
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
