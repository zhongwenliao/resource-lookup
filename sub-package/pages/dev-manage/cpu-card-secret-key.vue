<template>
	<uni-base-page class="info">
		<view class="info-content">
			<!-- CPU卡秘钥(32位) start -->
			<view class="info-item">
				<!-- <text class="left">{{ "CPU卡秘钥(32位)" }}</text>
				<text class="right">{{ "" }}</text> -->
				 <input type="text" :placeholder="manage['cpu-card-secret-key-desc'] || 'CPU卡密钥(32位的16进制数)'" v-model="cardSecretKey" />
			</view>
			<!-- CPU卡秘钥(32位) end -->
			
			<!-- CPU卡秘钥配置 start 涉及到安全问题，现在暂时屏蔽该按钮 -->
			<!-- <view class="set-info-btn">
				<button type="primary" class="button primary" formType="submit" @click="setCPUCardKey">{{ "配置" }}</button>
			</view> -->
			<!-- CPU卡秘钥配置 end 涉及到安全问题，现在暂时屏蔽该按钮 -->
			
			<!-- 获取CPU卡秘钥 start -->
			<view class="get-info-btn">
				<button type="primary" class="button primary" formType="submit" @click="getCpuCardkey">{{ common["get"] || "获取" }}</button>
			</view>
			<!-- 获取CPU卡秘钥 end -->
		</view>
	</uni-base-page>
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
				// CPU卡秘钥
				cardSecretKey: ""
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
				title: this.manage["cpu-card-secret-key"]
			});
		},
		
		methods: {
			// CPU卡秘钥配置
			setCPUCardKey() {
				// #ifdef APP-PLUS
				if (!/^[A-Fa-f0-9]{32}$/.test(this.cardSecretKey)) {
					this.$showToast(this.manage["cpu-card-secret-key-error"]);
					return;
				}
				this.$showLoading();
				bluetoothPlugin.setCPUCardKey(devInfo, this.cardSecretKey, (res) => {
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
					this.$showLog("CPU卡秘钥配置", res);
				});
				// #endif
				
				// #ifndef APP-PLUS
				this.$showToast(featureNotSupportedMsg);
				// #endif
			},
			
			// 获取CPU卡秘钥
			// {0x74,0x68,0x69,0x6e,0x6d,0x6f,0x6f,0x2e,0x32,0x30,0x31,0x34,0x31,0x30,0x30,0x31}; // thinmoo.20141001的hex数据作为原始密钥
			getCpuCardkey() {
				// #ifdef APP-PLUS
				this.$showLoading();
				bluetoothPlugin.getCpuCardkey(devInfo, (res) => {
					this.$hideLoading();
					if (typeof res == "string") {
						res = JSON.parse(res);
					}
					let errorCode = res.errorCode;
					let errorMsg = operateSuccessMsg;
					if (errorCode == 0) {
						this.cardSecretKey = res.data.card_key.replace(/ /g, "");
						// this.cardSecretKey = this.$hextoString(res.data.card_key.replace(/ /g, ""));
					}
					else if (errorCode == 48) {
						errorMsg = connectTimeoutMsg;
					}
					else {
						errorMsg = res.errorMsg || operateFailMsg;
					}
					this.$showToast(errorMsg);
					this.$showLog("获取CPU卡秘钥", res);
				});
				// #endif
				
				// #ifndef APP-PLUS
				this.$showToast(featureNotSupportedMsg);
				// #endif
			}
		}
	}
</script>
