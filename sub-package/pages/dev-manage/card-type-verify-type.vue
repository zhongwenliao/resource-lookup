<template>
	<uni-base-page class="content card-type-verify-type info">
		<view class="form info-content">
			<ul class="list-view">
				<!-- 卡类型 start -->
				<li>
					<view style="float:left; width: 25%;">
						<text class="require-text">*</text>
						<text>{{ manage["card-type"] || '卡类型' }}</text>
						：
					</view>
					<radio-group name="cardType" style="float:left; width: 75%;" @change="bindCardTypeChange">
						<label class="radio">
							<radio value="1" :checked="cardType == 1" />
							{{ manage["card-type-a"] || "A卡" }}
						</label>
						<label class="radio">
							<radio value="2" :checked="cardType == 2" />
							{{ manage["card-type-b"] || "B卡" }}
						</label>
						<label class="radio">
							<radio value="3" :checked="cardType == 3" />
							{{ manage["card-type-ab"] || "AB卡" }}
						</label>
					</radio-group>
				</li>
				<!-- 卡类型 end -->

				<!-- 验证方式 start -->
				<li>
					<view style="float:left; width: 25%;">
						<text class="require-text">*</text>
						<text>{{ manage["verify-type"] || '验证方式' }}</text>
						：
					</view>
					<radio-group name="verificationMethod" style="float:left; width: 70%;" @change="bindVerificationMethodChange">
						<view style="margin-bottom: 10upx;">
							<label class="radio">
								<radio value="1" :checked="verificationMethod == 1" />
								{{ manage["verify-type-card-no"] || "仅卡号" }}
							</label>
							<label class="radio" v-show="cardType != 2">
								<radio value="2" :checked="verificationMethod == 2" />
								{{ manage["verify-type-card-no-or-sector-key"] || "卡号或扇区密钥" }}
							</label>
						</view>
						<view v-show="cardType != 2">
							<label class="radio">
								<radio value="3" :checked="verificationMethod == 3" />
								{{ manage["verify-type-card-no-and-sector-key"] || "卡号加扇区密钥" }}
							</label>
							<label class="radio">
								<radio value="4" :checked="verificationMethod == 4" />
								{{ manage["verify-type-cpu-card"] || "CPU卡" }}
							</label>
						</view>
					</radio-group>
				</li>
				<!-- 验证方式 end -->
			</ul>
			<view class="set-info-btn">
				<button type="primary" class="button primary" @click="setCardTypeVerifyType">{{ common["config"] || "设置" }}</button>
			</view>
			<view class="get-info-btn">
				<button type="primary" class="button primary" @click="getCardTypeVerifyType">{{ common["get"] || "获取" }}</button>
			</view>
			<view class="operation-btn">
				<button type="primary" class="button primary" @click="enableAntiCopy(true)">{{ manage["enable-anti-copy"] || '开启防复制' }}</button>
			</view>
			<view class="operation-btn">
				<button type="primary" class="button primary" @click="enableAntiCopy(false)">{{ manage["close-anti-copy"] || "关闭防复制" }}</button>
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
// 10进制数转成16进制数
const decToHex = (num) => {
	if (num == 1) {
		return 0x01;
	}
	if (num == 2) {
		return 0x02;
	}
	if (num == 3) {
		return 0x03;
	}
	if (num == 4) {
		return 0x04;
	}
};
// #endif
export default {
	data() {
		return {
			// 卡类型
			cardType: 1,
			// 验证方式
			verificationMethod: 1
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
		// 卡类型单选按钮选择事件
		bindCardTypeChange(event) {
			this.cardType = parseInt(event.detail.value);
			// B卡没有扇区密钥、CPU卡
			if (this.cardType == 2) {
				this.verificationMethod = 1;
			}
		},
		
		// 验证方式单选按钮选择事件
		bindVerificationMethodChange(event) {
			this.verificationMethod = parseInt(event.detail.value);
		},
		
		// 设置卡类型及验证方式
		setCardTypeVerifyType() {
			// #ifdef APP-PLUS
			this.$showLoading();
			bluetoothPlugin.setCardTypeVerifyType(devInfo, decToHex(this.cardType), decToHex(this.verificationMethod), (res) => {
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
			this.$showToast(appUseMsg);
			// #endif
		},

		// 获取卡类型及验证方式
		getCardTypeVerifyType() {
			// #ifdef APP-PLUS
			this.$showLoading();
			bluetoothPlugin.getCardTypeVerifyType(devInfo, (res) => {
				this.$hideLoading();
				let errorCode = res.errorCode;
				let errorMsg = operateSuccessMsg;
				if (errorCode == 0) {
					let { card_type, verification_method } = res.data;
					this.cardType = parseInt(card_type);
					this.verificationMethod = parseInt(verification_method);
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
			this.$showToast(appUseMsg);
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
			this.$showToast(appUseMsg);
			// #endif
		}
	},

	onLoad(options) {
		devInfo = JSON.parse(options.devObj || "{}");
	},
	
	onReady() {
		uni.setNavigationBarTitle({
			title: this.manage["card-type-verify-type"]
		});
	}
};
</script>

<style lang="scss">
.card-type-verify-type {
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
	}
}
</style>
