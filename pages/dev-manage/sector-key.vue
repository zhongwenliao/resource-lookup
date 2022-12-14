<template>
	<uni-base-page class="content">
		<view class="input-field">
			<view class="input-title">{{ manage["dev-door-number"]||"设备门编号"}}（0-255）</view>
			<view class="input-box">
				<input type="number" v-model="configParam.devId">
			</view>
		</view>
		<view class="input-field">
			<view class="input-title">{{ manage["sector-address"]||"扇区地址" }}（0-15）</view>
			<view class="input-box">
				<input type="number" v-model="configParam.mifareSector">
			</view>
		</view>
		<view class="input-field">
			<view class="input-title">{{ manage["sector-key-input"]||"请输入设备的扇区密钥" }}（ {{ manage["key-example"] || "由12位十六进制数组成，例如"}} 012389ABCDEF）</view>
			<view class="input-box">
				<input type="text" v-model="configParam.sectorKey">
			</view>
		</view>
		<view class="input-field">

			<button type="primary" class="button primary setting-button" @click="setSectorKey()">{{  manage["setting"]||"设置" }}</button>
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				configParam: {},
				devObj: {},
				devId: null,
				sectorParam: {}
			}
		},
		computed: {
			manage() {
				return this.$t("manage");
			},
			title() {
				return this.$t("title");
			}
		},
		methods: {
			setSectorKey() {
				var _this = this;
				var sdkUtil = this.$sdkUtil;
				var checkList = [{
					name: "devId",
					rules: [{
						required: true,
						message: this.manage["no-door-num"]||"门编号不能为空"
					}]
				}, {
					name: "mifareSector",
					rules: [{
						required: true,
						message: this.manage["no-sector"] || "扇区不能为空"
					}]
				}, {
					name: "sectorKey",
					rules: [{
						required: true,
						message: this.manage["no-key"] || "扇区密钥不能为空"
					}]
				}];
				this.$formSubmitCheck({
					formData: this.configParam,
					checkList: checkList,
					success: () => {
						sdkUtil.setReadSectorKey(this.devObj, this.configParam);
					}
				});
			},
			
			//获取设备扇区配置参数
			// getDevSectorParam(devId) {
			// 	this.$req.request ({
			// 		url: "/devDevice/app/getDeviceSectionParam",
			// 		data: {
			// 			id: devId
			// 		},
			// 		success: (res) => {
			// 			let sectorParam = res.data;
			// 			this.configParam = {
			// 				"devId": sectorParam.accDoorNo === undefined? sectorParam.doorNo : sectorParam.accDoorNo,
			// 				"mifareSector": sectorParam.cardAccMifareSection === undefined? 0 : sectorParam.cardAccMifareSection,
			// 				"sectorKey": sectorParam.cardMifareSecretKey === undefined? "": sectorParam.cardMifareSecretKey
			// 			}
			// 		}
 		// 		})
			// }
		},
		onReady() {
			this.$setTitle(this.title["set-sector-key"]);
		},
		onLoad(options) {
			this.devObj = JSON.parse(options.devObj);
			console.log(this.devObj);
			this.configParam = {
				"devId": this.devObj.accDoorNo === undefined? this.devObj.doorNo : this.devObj.accDoorNo,
				"mifareSector": this.devObj.cardAccMifareSection,
				"sectorKey": this.devObj.cardMifareSecretKey
			};
		}
	}
</script>
	
<style>
	.content {
		display: flex;
		flex: 1;
		flex-direction: column;
		background-color: #efeff4;
		padding: 20upx 0;
		width: 100%;
		
	}
	.input-field {
		padding: 20upx 30upx;
	}
	
	.input-title {
		padding: 10upx 0;
	}
	
	.input-box {
		background: #FFFFFF;
		border-radius: 10upx;
	}
	
	.input-box input {
		padding: 15upx;
	}
	
	.setting-button {
		margin: 40upx auto;
		color: #FFFFFF;
		background-color: #0081ff;
	}
	
</style>
