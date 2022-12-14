<template>
	<uni-base-page class="content normally-open-closed-mode info">
		<view class="form info-content">
			<ul class="list-view">
				<!-- 指继电器的常开常闭状态，不是指设备的常开常闭状态 -->
				<!-- 常开常闭模式 start -->
				<li style="display: flex; align-items: center;">
					<view class="left-content">
						<text class="require-text">*</text>
						<text>{{ manage["normally-open-closed-mode"] || '常开常闭模式' }}</text>：
					</view>
					<view class="right-content">
						<text>{{ manage["normally-close"] || "常闭" }}</text>
						<switch :checked="isNormallyOpen" style="transform:scale(0.6)" @change="bindModeSwitchChange" />
						<text>{{ manage["normally-open"] || "常开" }}</text>
					</view>
				</li>
				<!-- 常开常闭模式 end -->
			</ul>
			<view class="set-info-btn">
				<button type="primary" class="button primary" @click="setNormallyOpenClosedMode">{{ common["config"] || "设置" }}</button>
			</view>
			<view class="get-info-btn">
				<button type="primary" class="button primary" @click="getNormallyOpenClosedMode">{{ common["get"] || "获取" }}</button>
			</view>
		</view>
	</uni-base-page>
</template>

<script>
// 设备信息
let devInfo = {};
// 引入蓝牙连接超时、蓝牙配置功能不支持、蓝牙配置操作失败、蓝牙配置操作成功、的消息提示语
import { connectTimeoutMsg, featureNotSupportedMsg, operateFailMsg, operateSuccessMsg, appUseMsg } from "@/common/js/bluetooth-data.js";
// #ifdef APP-PLUS
// 引入蓝牙插件
const bluetoothPlugin = uni.requireNativePlugin("DoorMaster-Bluetooth-Plugin");
// #endif
export default {
	data() {
		return {
			// 是否常开
			isNormallyOpen: true
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

	methods: {
		// 常开常闭模式开关按钮选择事件
		bindModeSwitchChange(event) {
			this.isNormallyOpen = JSON.parse(event.target.value); 
		},
		
		// 设置常开常闭模式
		setNormallyOpenClosedMode() {
			// #ifdef APP-PLUS
			this.$showLoading();
			bluetoothPlugin.setNormallyOpenclosedmode(devInfo, this.isNormallyOpen, (res) => {
				this.$hideLoading();
				let errorCode = res.errorCode;
				let errorMsg = operateSuccessMsg;
				if (errorCode == 48) {
					errorMsg = connectTimeoutMsg;
				}
				else if (errorCode == 12) {
					errorMsg = featureNotSupportedMsg;
				}
				else if (errorCode != 0) {
					errorMsg = operateFailMsg;
				}
				this.$showToast(errorMsg);
				console.log(JSON.stringify(res));
			});
			// #endif
			
			// #ifndef APP-PLUS
			this.$showToast("请在APP上体验此功能");
			// #endif
		},

		// 获取常开常闭模式
		getNormallyOpenClosedMode() {
			// #ifdef APP-PLUS
			this.$showLoading();
			bluetoothPlugin.getNormallyOpenclosedmode(devInfo, (res) => {
				this.$hideLoading();
				let errorCode = res.errorCode;
				let errorMsg = operateSuccessMsg;
				if (errorCode == 48) {
					errorMsg = connectTimeoutMsg;
				}
				else if (errorCode == 12) {
					errorMsg = featureNotSupportedMsg;
				}
				else if (errorCode != 0) {
					errorMsg = operateFailMsg;
				}
				this.$showToast(errorMsg);
				// callback(res);
				console.log(JSON.stringify(res));
			});
			// #endif
			
			// #ifndef APP-PLUS
			this.$showToast("请在APP上体验此功能");
			// #endif
		}
	},

	onLoad(options) {
		devInfo = JSON.parse(options.devObj || "{}");
		// this.$setTitle("配置联网模式");
	},
	
	onReady() {
		uni.setNavigationBarTitle({
			title: this.manage["normally-open-closed-mode"]
		});
	}
};
</script>

<style lang="scss">
.normally-open-closed-mode {
	.list-view {
		background-color: #FFFFFF;
		list-style: none;
		padding: 0;
		.radio {
			margin: 0 10upx 10upx;
		}
	}
	.list-view li {
		width: 96%;
		padding: 20upx 2%;
		overflow: hidden;
		border-bottom: 1upx solid #F5F5F5;
		position: relative;
		.left-content {
			float: left; 
			width: 35%;
		}
		.right-content {
			float: left; 
			width: 65%;
			input {
				margin: 0 10upx 10upx;
			}
		}
		.info-item {
			padding: 20upx 0 0; 
			border-bottom: none; 
			width: 100%;
		}
	}
}
</style>
