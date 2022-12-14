<template>
	<!-- 联通NB平台参数页面 start -->
	<uni-base-page class="info">
		<view class="info-content">
			<!-- unlink_pk start -->
			<view class="info-item">
				<input type="text" placeholder="unlink_pk" v-model="nbUnicomPlatformParams.unlink_pk" />
			</view>
			<!-- unlink_pk end -->
			
			<!-- unlink_devsecret start -->
			<view class="info-item">
				<input type="text" placeholder="unlink_devsecret" v-model="nbUnicomPlatformParams.unlink_devsecret" />
			</view>
			<!-- unlink_devsecret end -->
			
			<!-- 联通NB平台参数配置 start -->
			<view class="set-info-btn">
				<button type="primary" class="button primary" @click="setNBUnicomPlatformParams">{{ common["config"] || "配置" }}</button>
			</view>
			<!-- 联通NB平台参数配置 end -->
			
			<!-- 获取联通NB平台参数 start -->
			<view class="get-info-btn">
				<button type="primary" class="button primary" @click="getNBUnicomPlatfromParams">{{ common["get"] || "获取" }}</button>
			</view>
			<!-- 获取联通NB平台参数 end -->
		</view>
	</uni-base-page>
	<!-- 联通NB平台参数页面 end -->
</template>

<script>
	// 引入蓝牙连接超时、蓝牙配置功能不支持、蓝牙配置操作失败、蓝牙配置操作成功、的消息提示语
	import { connectTimeoutMsg, featureNotSupportedMsg, operateFailMsg, operateSuccessMsg, appUseMsg } from "@/common/js/bluetooth-data.js";
	// 引入蓝牙插件
	const bluetoothPlugin = uni.requireNativePlugin("DoorMaster-Bluetooth-Plugin");
	// 设备信息
	let devInfo = {};
	export default {
		data() {
			return {
				// 联通NB平台参数
				nbUnicomPlatformParams: {
					"unlink_pk": "",
					"unlink_devsecret": ""
				}
			};
		},
		computed: {
			manage() {
				return this.$t("manage");
			},
			common() {
				return this.$t("common");
			}
		},
		
		onLoad(options) {
			devInfo = JSON.parse(options.devObj);
		},
		
		onReady() {
			uni.setNavigationBarTitle({
				title: this.manage["nb-unicom-platform-params"]
			});
		},
		
		methods: {
			// 联通NB平台参数配置
			setNBUnicomPlatformParams() {
				// #ifdef APP-PLUS
				let { unlink_pk, unlink_devsecret } = this.nbUnicomPlatformParams;
				if (unlink_pk == "" || unlink_devsecret == "") {
					this.$showToast(this.manage["pk-or-devsecret-null"]);
					return;
				}
				this.$showLoading();
				bluetoothPlugin.setNBUnicomPlatformParams(devInfo, unlink_pk, unlink_devsecret, (res) => {
					this.$hideLoading();
					if (typeof res == "string") {
						res = JSON.parse(res);
					}
					let errorCode = res.errorCode;
					let errorMsg = operateSuccessMsg;
					if (errorCode == 48) {
						errorMsg = connectTimeoutMsg;
					}
					else if (errorCode != 0) {
						errorMsg = res.errorMsg || operateFailMsg;
					}
					this.$showToast(errorMsg);
					this.$showLog("联通NB平台参数配置", res);
					this.$showLog("unlink_pk", unlink_pk);
					this.$showLog("unlink_devsecret", unlink_devsecret);
				});
				// #endif
				
				// #ifndef APP-PLUS
				this.$showToast(featureNotSupportedMsg);
				// #endif
			},
			
			// 获取联通NB平台参数
			getNBUnicomPlatfromParams() {
				// #ifdef APP-PLUS
				this.$showLoading();
				bluetoothPlugin.getNBUnicomPlatfromParams(devInfo, (res) => {
					this.$hideLoading();
					if (typeof res == "string") {
						res = JSON.parse(res);
					}
					let errorCode = res.errorCode;
					let errorMsg = operateSuccessMsg;
					if (errorCode == 0) {
						let { unlink_pk, unlink_devsecret } = res.data;
						this.nbUnicomPlatformParams = {
							"unlink_pk": unlink_pk.replace(/\u0000/g, ""),
							"unlink_devsecret": unlink_devsecret.replace(/\u0000/g, "")
						};
					}
					else if (errorCode == 48) {
						errorMsg = connectTimeoutMsg;
					}
					else {
						errorMsg = res.errorMsg || operateFailMsg;
					}
					this.$showToast(errorMsg);
					this.$showLog("获取联通NB平台参数", res);
				});
				// #endif
				
				// #ifndef APP-PLUS
				this.$showToast(featureNotSupportedMsg);
				// #endif
			}
		}
	}
</script>
