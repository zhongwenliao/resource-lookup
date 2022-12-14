<template>
	<uni-base-page class="content">
		<view class="dev-info">
			<ul>
				<li>
					<view class="info-title">{{ manage["dev-sn"] || "设备序列号" }}</view>
					<view class="info-name">{{ devObj.devSn }}</view>
				</li>
				<li>
					<view class="info-title">{{ video["dev-model"] || "设备型号" }}</view>
					<view class="info-name">{{ devObj.deviceModelName }}</view>
				</li>
				<li>
					<view class="info-title">{{ manage["dev-type"] || "设备类型" }}</view>
					<view class="info-name">{{ devType[devObj.category] }}</view>
				</li>
				<li>
					<view class="info-title">{{ manage["dev-name"] || "设备名称" }}</view>
					<view class="info-name">{{ devObj.name }}</view>
				</li>
				<li>
					<view class="info-title">{{ manage["dev-position"] || "设备安装位置" }}</view>
					<view class="info-name">{{ devObj.deviceInstallAddress }}</view>
				</li>
				<view class="dividing-line"></view>
				<li v-if="![10, 20, 21, 22, 23, 24].includes(devObj.category)">
					<navigator class="select-li" :url="'dev-system-info?devObj='+ JSON.stringify(devObj) ">{{ manage["get-dev-info"] || "获取设备信息" }}</navigator>
				</li>
				<li>
					<navigator class="select-li" :url="'sector-key?devObj='+ JSON.stringify(devObj) ">{{ manage["set-card-key"] || "配置设备读卡扇区密钥" }}</navigator>
				</li>
				<li>
					<view class="select-li" @click="goToSetDevConfig(devObj)">{{ manage["set-unlock-time"] || "配置设备开锁时长" }}</view>
				</li>
				<view v-if="settingShow">
					<li>
						<view class="select-li" @click="goToSetWifi(devObj)">{{ manage["set-params"] || "配置通讯参数" }}</view>
					</li>
				</view>
				<view>
					<li>
						<view class="select-li" @click="goToSetAPN(devObj)">{{ manage["set-APN"] || "配置APN" }}</view>
					</li>
				</view>
				<!-- <view v-if="devObj.isSupportOfflineBluetoothSendCard == 1 && ifDevManage">
					<li>
						<view class="select-li" @click="goToCardManage(devObj)">{{  manage["card-manage"] || "卡管理" }}</view>
					</li>
				</view> -->
				<view v-if="devObj.hardwarePlatform == 2">
					<li>
						<navigator class="select-li" :url="'set-dev-ip?devObj='+ JSON.stringify(devObj)">{{ manage["set-dev-ip"] || "配置设备IP" }}</navigator>
					</li>
				</view>
				<view v-if="devObj.hardwarePlatform == 1 && ifDevManage">
					<li>
						<navigator class="select-li" :url="'set-dev-pwd?devObj='+ JSON.stringify(devObj)">{{ manage["emergency-pwd"] || "设置固定开门密码" }}</navigator>
					</li>
				</view>
				<li>
					<view class="select-li" @click="synchroTime(devObj)">{{ manage["sync-time"] || "同步时间" }}</view>
				</li>
				<li>
					<view class="select-li" @click="goToOpenDoorRecord(devObj)">{{ manage["read-open-door-records"]||"读取开门记录" }}</view>
				</li>
				<!-- <view v-if="devObj.isSupportBluetooth === 1">
					<li>
						<navigator class="select-li" :url="'/sub-package/pages/dev-manage/bt-version-upgrade?devObj='+ JSON.stringify(devObj)+'&source='+'0'">{{ manage["upgrade-bluetooth-firmware"] || "升级蓝牙固件" }}</navigator>
					</li>
				</view> -->
				<view v-if="devObj.category === 9">
					<!-- 配置联网模式 start -->
					<li>
						<navigator class="select-li" :url="'/sub-package/pages/dev-manage/configure-networking-mode?devObj='+ JSON.stringify(devObj)">{{ manage["configure-networking-mode"] || "配置联网模式" }}</navigator>
					</li>
					<!-- 配置联网模式 end -->
					
					<!-- NB基站参数 start -->
					<!-- <li>
						<navigator class="select-li" :url="'/sub-package/pages/dev-manage/nb-base-station?devObj=' + JSON.stringify(devObj)">{{ manage["nb-base-station-params"] || "NB基站参数" }}</navigator>
					</li> -->
					<!-- NB基站参数 end -->
					
					<!-- 联通NB平台参数 start -->
					<!-- <li>
						<navigator class="select-li" :url="'/sub-package/pages/dev-manage/nb-unicom-platform-params?devObj='+ JSON.stringify(devObj)">{{ manage["nb-unicom-platform-params"] || "联通NB平台参数" }}</navigator>
					</li> -->
					<!-- 联通NB平台参数 end -->
				</view>
				<view>
					<li>
						<navigator class="select-li" :url="'/pages/dev-manage/sim-info?devObj='+ JSON.stringify(devObj)">{{ manage["sim-title"] || "sim卡信息" }}</navigator>
					</li>
				</view>
				
				<!-- CPU卡密钥 start -->
				<!-- <li>
					<navigator class="select-li" :url="'/sub-package/pages/dev-manage/cpu-card-secret-key?devObj='+ JSON.stringify(devObj)">{{ manage["cpu-card-secret-key"] || "CPU卡密钥" }}</navigator>
				</li> -->
				<!-- CPU卡密钥  end -->
				
				<!-- <view v-if="devObj.category != 9"> -->
					<!-- 设置卡类型及验证方式 start -->
					<!-- 目前锁不支持这个功能，锁没有扇区密钥，新的蓝牙固件版本的安卓设备、M364支持，我这里就不做判断是否显示或者隐藏该选项了，当前设备进行蓝牙配置时，若不支持该功能，直接提示功能不支持即可 -->
					<!-- <li>
						<navigator class="select-li" :url="'/sub-package/pages/dev-manage/card-type-verify-type?devObj='+ JSON.stringify(devObj)">{{ manage["card-type-verify-type"] || "设置卡类型及验证方式" }}</navigator>
					</li> -->
					<!-- 设置卡类型及验证方式 end -->
					
					<!-- 韦根输出参数 start -->
					<!-- <li>
						<navigator class="select-li" :url="'/sub-package/pages/dev-manage/wigan-output-params?devObj='+ JSON.stringify(devObj)">{{ manage["wigan-output-params"] || "韦根输出参数" }}</navigator>
					</li> -->
					<!-- 韦根输出参数  end -->
					
					<!-- 常开常闭模式 start -->
					<!-- <li>
						<navigator class="select-li" :url="'/sub-package/pages/dev-manage/normally-open-closed-mode?devObj='+ JSON.stringify(devObj)">{{ manage["normally-open-closed-mode"] || "常开常闭模式" }}</navigator>
					</li> -->
					<!-- 常开常闭模式  end -->
				<!-- </view> -->
				
				<!-- 恢复设备出厂设置 start -->
				<li>
					<view class="select-li" @click="resetDev(devObj)">{{ manage["reset-dev-config"] || "恢复设备出厂设置" }}</view>
				</li>
				<!-- 恢复设备出厂设置 end -->
			</ul>
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				devObj: {},
				settingShow: false,
				ifDevManage: this.$getUserInfo().ifDevManage,
				installEmpType: this.$getUserInfo().installEmpType
			}
		},
		computed: {
			devType() {
				return this.$t("devType");
			},
			manage() {
				return this.$t("manage")
			},
			title() {
				return this.$t("title")
			},
			common() {
				return this.$t("common")
			},
			video() {
				return this.$t("video")
			}
		},
		methods: {
			// 跳转配置通讯参数
			goToSetWifi(devObj) {
				// #ifdef MP-WEIXIN
				 this.$showToast(this.common["goto-app-use"] || "请前往APP使用此功能");
				// #endif
				uni.navigateTo({
					url: "setting-wifi-param?devObj=" + JSON.stringify(devObj)
				});
			},
			// 跳转配置APN
			goToSetAPN(devObj) {
				// #ifdef MP-WEIXIN
				 this.$showToast(this.common["goto-app-use"] || "请前往APP使用此功能");
				// #endif
				uni.navigateTo({
					url: "set-APN?devObj=" + JSON.stringify(devObj)
				});
			},
			// 同步设备时间
			synchroTime(devObj) {
				console.log(devObj)
				var _this = this;
				let timeStr = (new Date()).pattern("yyyy-MM-dd HH:mm:ss");
				timeStr = timeStr.replace(/:|-| /g, "");
				let curDay = new Date().getDay();
				timeStr += curDay == 0 ? "07" : "0" + curDay;
				uni.showModal({
					title: _this.manage["sync-time"],
					content: _this.manage["ensure-time"] || "请确保您的手机时间准确",
					confirmText: _this.manage["sync"] || "同步",
					cancelText: _this.common["cancel"] || "取消",
					success: function(res) {
						if(res.confirm) {
							_this.$sdkUtil.syncDeviceTime(devObj, timeStr);
						}
					}
				});
			},
			
			// 跳转到卡管理页面
			goToCardManage(devObj) {
				// #ifdef MP-WEIXIN 
				 this.$showToast(this.common["goto-app-use"] || "请前往APP使用此功能");
				// #endif
				uni.navigateTo({
					url: "card-management?devObj=" + JSON.stringify(devObj)
				});
			},
			
			// 读取身份证信息
			readEID(devObj) {
				this.$sdkUtil.readEID(devObj, (result) => {
					let reqID = result.data.reqID;
					this.$showToast("reqID: " + reqID);
				});
			},
			
			// 恢复出厂设置
			resetDev(devObj) {
				var _this = this;
				uni.showModal({
					title: _this.manage["reset-dev-config"] || "恢复出厂设置",
					content: _this.manage["if-reset-dev"] || "确定将此设备恢复出厂设置？",
					confirmText: _this.common["confirm"] || "确认",
					cancelText: _this.common["cancel"] || "取消",
					success: function(res) {
						if(res.confirm) {
							_this.$sdkUtil.resetDeviceConfig(devObj);
						}
					}
				});
			},
			
			// 跳转至开门记录列表页面
			goToOpenDoorRecord(devObj) {
				uni.navigateTo({
					url: "/sub-package/pages/dev-manage/all-open-door-records?devObj=" + JSON.stringify(devObj)
				});
			},
			
			// 跳转到设置蓝牙开锁时长页面
			goToSetDevConfig(devObj) {
				uni.navigateTo({
					url: "set-lock-open-time?devObj=" + JSON.stringify(devObj)
				});
			}
		},
		onReady() {
			uni.setNavigationBarTitle({
				title: this.title["dev-info"]
			});
		},
		onLoad(options) {
			this.devObj = JSON.parse(options.dev);
			var devObj = this.devObj;
			if(devObj.supportNetworkType !== undefined) {
				var networkType = devObj.supportNetworkType;
				if(networkType.indexOf("2") > -1 || networkType.indexOf("3") > -1 || networkType.indexOf("4") > -1) {
					this.settingShow = true;
				}
			}
		}
	}
</script>

<style lang="scss">
	view,
	text {
		box-sizing: content-box;
	}
	.dev-info {
		ul {
			padding: 0;
		}
		li {
			background: #ffffff;
			min-height: 80upx;
			height: auto;
			display: inline-flex;
			line-height: 80upx;
			width: 96%;
			padding: 0 2%;
			border-bottom: 2upx solid #eee;
			.info-title {
				width: 40%;
				display: inline-block;
				padding: 10upx;
				line-height: 80upx;
			}
			.info-name {
				width: 60%;
				display: inline-block;
				text-align: right;
				padding: 10upx;
				line-height: 80upx;
				input {
					height: 80upx;
					line-heigth: 80upx;
				}
			}
			.select-li {
				width: 98%;
				padding: 10upx;
				line-height: 80upx;
				display: inline-block;
				&::after {
					float: right;
					content: " ";
					display: inline-block;
					transform: rotate(45deg);
					height: 6px;
					width: 6px;
					border-width: 2px 2px 0 0;
					border-color: #c8c8cd;
					border-style: solid;
					position: relative;
					top: 30upx;
					margin-left: .3em;
				}
			}
		}
		button {
			width: 80%;
			margin: 80upx auto 0;	
		}
		.dividing-line {
			font-family: PingFangSC-Regular; 
			font-size: 14px; 
			color: rgb(136, 136, 136); 
			letter-spacing: 0px; 
			text-align: left; 
			padding: 4px; 
			background: rgb(238, 238, 238);
		}
	}
</style>
