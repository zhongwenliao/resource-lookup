<template>
	<uni-base-page class="info nb-base-station">
		<view class="info-content">
			<!-- NB基站各参数 start-->
			<!-- ECL参数 start -->
			<view class="info-item">
				<text class="left">{{ "ECL" }}</text>
				<text class="right">{{ (nbParamInfo.ecl + "") || "" }}</text>
			</view>
			<!-- ECL参数 end -->
			
			<!-- LAC小区ID参数 start -->
			<view class="info-item" >
				<text class="left">{{ manage["lac-id"] || "LAC小区ID" }}</text>
				<text class="right">{{ nbParamInfo.lac_id || "" }}</text>
			</view>
			<!-- LAC小区ID参数 end -->
			
			<!-- CID基站ID参数 start -->
			<view class="info-item" >
				<text class="left">{{ manage["cid-id"] || "CID基站ID" }}</text>
				<text class="right">{{ nbParamInfo.cid_id || "" }}</text>
			</view>
			<!-- CID基站ID参数 end -->
			
			<!-- EARFCN参数 start -->
			<view class="info-item" >
				<text class="left">{{ "EARFCN" }}</text>
				<text class="right">{{ nbParamInfo.earfcn || "" }}</text>
			</view>
			<!-- EARFCN参数 end -->
			
			<!-- EARFCN_OFFSET参数 start -->
			<view class="info-item">
				<text class="left">{{ "EARFCN_OFFSET" }}</text>
				<text class="right">{{ nbParamInfo.earfcn_offset || "" }}</text>
			</view>
			<!-- EARFCN_OFFSET参数 end -->
			
			<!-- RSSI参数 start -->
			<view class="info-item" >
				<text class="left">{{ "RSSI" }}</text>
				<text class="right">{{ nbParamInfo.rssi || "" }}</text>
			</view>
			<!-- RSSI参数 end -->
			
			<!-- TX_PWR参数 start -->
			<view class="info-item">
				<text class="left">{{ "TX_PWR" }}</text>
				<text class="right">{{ nbParamInfo.tx_pwr || "" }}</text>
			</view>
			<!-- TX_PWR参数 end -->
			
			<!-- RSRQ参数 start -->
			<view class="info-item">
				<text class="left">{{ "RSRQ" }}</text>
				<text class="right">{{ nbParamInfo.rsrq || "" }}</text>
			</view>
			<!-- RSRQ参数 end -->
			
			<!-- SNR参数 start -->
			<view class="info-item">
				<text class="left">{{ "SNR" }}</text>
				<text class="right">{{ nbParamInfo.snr || "" }}</text>
			</view>
			<!-- SNR参数 end -->
			
			<!-- RSRP参数 start -->
			<view class="info-item">
				<text class="left">{{ "RSRP" }}</text>
				<text class="right">{{ nbParamInfo.rsrp || "" }}</text>
			</view>
			<!-- RSRP参数 end -->
			
			<!-- PCI参数 start -->
			<view class="info-item">
				<text class="left">{{ "PCI" }}</text>
				<text class="right">{{ nbParamInfo.pci || "" }}</text>
			</view>
			<!-- PCI参数 end -->
			<!-- NB基站各参数 end-->
			
			<view class="get-info-btn">
				<button type="primary" class="button primary" formType="submit" @click="getNBParamInfo">{{ common["get"] || "获取" }}</button>
			</view>
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
				// NB基站各参数
				nbParamInfo: {
					"ecl": "",
					"lac_id": "",
					"cid_id": "",
					"earfcn": "",
					"earfcn_offset": "",
					"rssi": "",
					"band": "",
					"tx_pwr": "",
					"rsrq": "",
					"snr": "",
					"rsrp": "",
					"pci": ""
				}
			};
		},
		computed: {
			title() {
				return this.$t("title");
			},
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
				title: this.manage["nb-base-station-params"]
			});
		},
		
		methods: {
			// 获取nb基站各参数
			getNBParamInfo() {
				this.$showLoading();
				bluetoothPlugin.getNBParamInfo(devInfo, (res) => {
					this.$hideLoading();
					if (typeof res == "string") {
						res = JSON.parse(res);
					}
					let errorCode = res.errorCode;
					let errorMsg = operateSuccessMsg;
					if (errorCode == 0) {
						this.nbParamInfo = res.data;
					}
					else if (errorCode == 48) {
						errorMsg = connectTimeoutMsg;
					}
					else {
						errorMsg = res.errorMsg || operateFailMsg;
					}
					this.$showToast(errorMsg);
					this.$showLog("获取nb基站各参数", res);
				});
			}
		}
	}
</script>
