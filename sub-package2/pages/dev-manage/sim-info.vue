<template>
	<uni-base-page class="system-info-page">
		<view class="system-info-content">
			<!-- sim卡信息 start-->
			<view class="system-info-item">
				<text class="left">{{ manage["model_name"]||"模块名称" }}</text>
				<text class="right">{{simstatusObj.model_name ? simstatusObj.model_name : manage["without"] || '无'}}</text>
			</view>
			<view class="system-info-item" >
				<text class="left">{{ manage["model_sn"]||"模块序列号" }}</text>
				<text class="right">{{simstatusObj.model_sn ? simstatusObj.model_sn : manage["without"] || '无'}}</text>
			</view>
			<view class="system-info-item" >
				<text class="left">{{ manage["model_status"]||"模块状态" }}</text>
				<text class="right">{{simstatusObj.model_status == 1 ? manage["normal"] || '正常' : manage["abnormal"] || '异常'}}</text>
			</view>
			<view class="system-info-item" >
				<text class="left">{{ manage["card_status"]||"卡状态" }}</text>
				<text class="right">{{simstatusObj.card_status  == 1 ? manage["normal"] || '正常' : manage["abnormal"] || '异常'}}</text>
			</view>
			<view class="system-info-item">
				<text class="left">{{ manage["iccid"]||"ICCID" }}</text>
				<text class="right">{{simstatusObj.iccid ? simstatusObj.iccid : manage["without"] || '无'}}</text>
			</view>
			<view class="system-info-item" >
				<text class="left">{{ manage["community_id"]||"小区 ID" }}</text>
				<text class="right">{{simstatusObj.community_id ? simstatusObj.community_id : manage["without"] || '无'}}</text>
			</view>
			<view class="system-info-item">
				<text class="left">{{ manage["lac_idlac"]||"基站 ID" }}</text>
				<text class="right">{{simstatusObj.lac_idlac ? simstatusObj.lac_idlac : manage["without"] || '无'}}</text>
			</view>
			
			<!-- sim卡信息 end-->
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				simstatusObj: {},
				devObj: {}
			};
		},
		computed: {
			title() {
				return this.$t("title");
			},
			manage() {
				return this.$t("manage")
			},
			sdk(){
				return this.$t("sdk")
			},
			main(){
				return this.$t("main")
			}
		},
		onLoad(options) {
			this.devObj = JSON.parse(options.devObj);
			this.devObj.controlWay = 1;
			this.devObj.eKey = this.devObj.appEkey
			this.devObj.devType = this.devObj.deviceModelValue
			let params = {
				eKey: this.devObj.appEkey,
				devSn: this.devObj.devSn,
				devType: this.devObj.deviceModelValue,
				devMac: this.devObj.devMac,
			};
			this.$sdkUtil.getSimstatus(this.devObj, result => {
				if(result.errorCode === 0) {
					let data = result.data;
					this.simstatusObj = data
					this.uploadServer(data)
				}
			});
		},
		methods:{
			uploadServer(data){
				this.$api('equipment.modifyParameters',{
					devSn:this.devObj.devSn,
					deviceModelName: data.model_name,
					simId:data.model_sn,
					modelStatus:data.model_status,
					simNumber:data.iccid,
					baseStationId:data.lac_idlac
				}).then(res => {
					if (res.code == 200) {
						this.$showToast(this.sdk["acquire-success"] || "获取成功");
					} else {
						this.$showToast(this.sdk["acquire-success"] || "获取成功"+',' +
						this.main["upload-server-failed"] ||"上传服务器失败");
					}
				})
				// this.$req.request({
				// 	url: "/devDevice/app/configSimNumber",
				// 	method: "POST",
				// 	data: {
						
				// 	},
				// 	success: res => {
						
				// 	}
				// })
			},
		},
		onReady() {
			this.$setTitle(this.title["sim-title"]);
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
