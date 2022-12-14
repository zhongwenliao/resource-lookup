<template>
	<uni-base-page class="system-info-page">
		<view class="system-info-content">
			<view v-if="devObj.category === 7" class="top-item-container">
				<view class="system-info-item" v-if="devObj.category === 7">
					<text class="left">{{ manage["protocol"]||"韦根协议" }}</text>
					<text class="right">{{devObj.wiegand || 26}}</text>
				</view>
			</view>
			<view v-else class="top-item-container">
				<view class="system-info-item">
					<text class="left">{{ manage["open-door-time"] || "开门时长" }}</text>
					<text class="right">{{devObj.openDelay || 5}}</text>
				</view>
				<view class="system-info-item">
					<text class="left">{{ manage["card-num"] || "卡登记数" }}</text>
					<text class="right">{{devObj.regCardNums || 0}}</text>
				</view>
				<view class="system-info-item">
					<text class="left">{{ manage["phone-num"] || "手机登记数" }}</text>
					<text class="right">{{devObj.regPhoneNums || 0}}</text>
				</view>
				<view class="system-info-item">
					<text class="left">{{ manage["maxium"] || "最大用户容量" }}</text>
					<text class="right">{{devObj.maxContainer || 1000}}</text>
				</view>
				<view class="system-info-item">
					<text class="left">{{ manage["dev-switch"]||"设备开关控制信号" }}</text>
					<text class="right">{{devControlType[devObj.controlWay] || '电锁控制'}}</text>
				</view>
			</view>
			
			<view class="system-info-item" v-if="devObj.deviceDoorNo !== undefined">
				<text class="left">{{ manage["dev-door-number"]||"设备门编号" }}</text>
				<text class="right">{{devObj.deviceDoorNo}}</text>
			</view>
			<view class="system-info-item" v-if="devObj.mifareSector !== undefined">
				<text class="left">{{ manage["dev-sector"]||"设备扇区" }}</text>
				<text class="right">{{devObj.mifareSector}}</text>
			</view>
			<view class="system-info-item" v-if="devObj.sectorKey !== undefined">
				<text class="left">{{ manage["dev-sector-key"]||"设备扇区密钥" }}</text>
				<text class="right">{{devObj.sectorKey}}</text>
			</view>
			<view class="system-info-item" v-if="devObj.serverIp !== undefined && devObj.serverPort !== undefined">
				<text class="left">{{ manage["sever-ip"] || "服务器地址"}}</text>
				<text class="right">{{devObj.serverIp + ":" + devObj.serverPort}}</text>
			</view>
			<view class="system-info-item" v-if="devObj.wifiName !== undefined">
				<text class="left">{{ manage["wifi-name"]||"Wifi名称" }}</text>
				<text class="right">{{devObj.wifiName}}</text>
			</view>
			<view class="system-info-item" v-if="devObj.wifiPwd !== undefined">
				<text class="left">{{ manage["wifi-pwd"]||"Wifi密码" }}</text>
				<text class="right">{{devObj.wifiPwd}}</text>
			</view>
			<view class="system-info-item" v-if="devObj.deviceDate !== undefined">
				<text class="left">{{ manage["dev-time"]||"设备时间" }}</text>
				<text class="right">{{devObj.deviceDate}}</text>
			</view>
			<view class="system-info-item" v-if="devObj.electricity !== undefined">
				<text class="left">{{ manage["dev-electricity"] || "设备电量" }}</text>
				<text class="right">{{devObj.electricity}}</text>
			</view>
			<view class="system-info-item" v-if="devObj.isSupportGetNetSignal === 1">
				<text class="left">{{ manage["signal-value"]||"联网信号值" }}</text>
				<text class="right">{{ signalValue }}</text>
			</view>
			<view class="system-info-item">
				<text class="left">{{ manage["dev-version"]||"设备版本信息" }}</text>
				<text class="right">{{devObj.systemVersion || 1}}</text>
			</view>
			<view class="retry-get-btn-view">
				<button type="primary" class="button primary" formType="submit" @click="getDeviceConfig">{{ manage["re-get"] || '重新获取设备信息'}}</button>
			</view>
		</view>
		
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				devObj: {},
				simstatusObj: {},
				signalValue: ""
			}
		},
		methods: {
			getDeviceConfig() {
				var _this = this;
				// 获取设备信息
				this.$sdkUtil.getDeviceConfig(this.devObj, result => {
					if(result.errorCode === 0) {
						let data = result.data;
						if("deviceDate" in data) {
							data.deviceDate = uni.getFormatTimeStr(data.deviceDate);
						}
						data.openDelay = data.openDelay === undefined || data.openDelay <= 0 ? 5 : data.openDelay;
						_this.devObj = {
							..._this.devObj,
							...data
						}
						if(this.devObj.isSupportGetNetSignal === 1) {
							//单片机类型
							this.$sdkUtil.getDeviceSignal(this.devObj, (result) => {
								this.signalValue = result.data.signal;
							})
						}
					}
				});
			}
		},
		computed: {
			devControlType() {
				return this.$t("dev-control-type");
			},
			title() {
				return this.$t("title");
			},
			manage() {
				return this.$t("manage");
			}
		},
		onReady() {
			this.$setTitle(this.title["get-system-info"]);
		},
		onLoad(options) {
			this.devObj = JSON.parse(options.devObj);
			this.devObj.controlWay = 1;
			this.signalValue = this.manage["getting"] || "正在获取中...";
		},
		
		onUnload() {
			this.devObj = {};
			this.signalValue = this.manage["getting"] || "正在获取中...";
		}
	}
</script>
	
<style lang="scss">
	.system-info-page {
		width: 100%;
		.system-info-content {
			width: 100%;
			.top-item-container {
				border-top: 2upx solid #cccccc;
			}
			.system-info-item {
				padding: 20upx;
				overflow: hidden;
				border-bottom: 2upx solid #cccccc;
			}
			.retry-get-btn-view {
				padding: 30upx 20upx 0;
			}
		}
	}
	
</style>
