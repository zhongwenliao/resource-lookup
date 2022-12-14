<template>
	<uni-base-page class="content wigan-output-params info">
		<view class="form info-content">
			<ul class="list-view">
				<!-- 卡号模式 start -->
				<li>
					<view class="left-content">
						<text class="require-text">*</text>
						<text>{{ manage["card-mode"] || '卡号模式' }}</text>：
					</view>
					<radio-group name="cardMode" class="right-content" @change="bindCardModeChange">
						<label class="radio">
							<radio value="true" :checked="isRealCardNo == true" />
							{{ manage["real-card-no"] || "真实卡号" }}
						</label>
						<label class="radio">
							<radio value="false" :checked="isRealCardNo == false" />
							{{ manage["virtual-card-no"] || "虚拟卡号" }}
						</label>
					</radio-group>
					<view class="info-item" v-if="!isRealCardNo">
						<view class="left-content">
							<text class="require-text">*</text>
							<text>{{ manage["virtual-card-no"] || "虚拟卡号" }}</text>：
						</view>
						<view class="right-content">
							<input type="text" :placeholder="manage['virtual-card-no-desc'] || '虚拟卡号(10位)'" v-model="virtualCardNo" />
						</view>
					</view>
				</li>
				<!-- 卡号模式 end -->

				<!-- 韦根输出字节序 start -->
				<li>
					<view class="left-content">
						<text class="require-text">*</text>
						<text>{{ manage["wigan-output-byte-order"] || "韦根输出字节序" }}</text>：
					</view>
					<radio-group name="outputByteSort" class="right-content" @change="bindOutputByteSortChange">
						<view style="margin-bottom: 10upx;">
							<label class="radio">
								<radio value="true" :checked="isSequence == true" />
								{{ manage["positive-order"] || "正序" }}
							</label>
							<label class="radio">
								<radio value="false" :checked="isSequence == false" />
								{{ manage["reverse-order"] || "反序" }}
							</label>
						</view>
					</radio-group>
				</li>
				<!-- 韦根输出字节序 end -->
			</ul>
			<view class="set-info-btn">
				<button type="primary" class="button primary" @click="setWiganOutputParams">{{ common["config"] || "设置" }}</button>
			</view>
			<view class="get-info-btn">
				<button type="primary" class="button primary" @click="getWiganOutputParams">{{ common["get"] || "获取" }}</button>
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
			// 是否真实卡号
			isRealCardNo: true,
			// 是否正序
			isSequence: true,
			// 虚拟卡号
			virtualCardNo: ""
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
		// 卡号模式单选按钮选择事件
		bindCardModeChange(event) {
			this.isRealCardNo = JSON.parse(event.detail.value);
			// 如果当前卡号模式为真实卡号，则将虚拟卡号置为空字符串
			if (this.isRealCardNo) {
				this.virtualCardNo = "";
			} 
		},
		
		// 韦根输出字节序单选按钮选择事件
		bindOutputByteSortChange(event) {
			this.isSequence = JSON.parse(event.detail.value);
		},
		
		// 设置韦根输出参数
		setWiganOutputParams() {
			// #ifdef APP-PLUS
			if (!this.isRealCardNo && !this.virtualCardNo) {
				this.$showToast(this.manage["virtual-card-no-is-null"]);
				return;
			}
			this.$showLoading();
			bluetoothPlugin.setWiganOutputparams(devInfo, this.isRealCardNo, this.isSequence, this.virtualCardNo, (res) => {
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

		// 获取韦根输出参数
		getWiganOutputParams() {
			// #ifdef APP-PLUS
			this.$showLoading();
			bluetoothPlugin.getwiganOutputparams(devInfo, (res) => {
				this.$hideLoading();
				let errorCode = res.errorCode;
				let errorMsg = operateSuccessMsg;
				if (errorCode == 0) {
					let { card_type, wigan_output_byte_order } = res.data;
					// 真实卡号
					if (card_type == 0) {
						this.isRealCardNo = true;
					}
					// 虚拟卡号
					else {
						this.isRealCardNo = false;
						this.virtualCardNo = res.data["virtual card"];
					}
					
					// 正序
					if (wigan_output_byte_order == 1) {
						this.isSequence = true;
					}
					// 反序
					else {
						this.isSequence = false;
					}
				}
				else if (errorCode == 48) {
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
		},
		
		// isEnable为true, 代表开启防复制，isEnable为false, 代表关闭防复制
		enableAntiCopy(isEnable) {
			// #ifdef APP-PLUS
			this.$showLoading();
			bluetoothPlugin.enableAntiCopy(devInfo, isEnable, (res) => {
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
		}
	},

	onLoad(options) {
		devInfo = JSON.parse(options.devObj || "{}");
	},
	
	onReady() {
		uni.setNavigationBarTitle({
			title: this.manage["wigan-output-params"]
		});
	}
};
</script>

<style lang="scss">
.wigan-output-params {
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
