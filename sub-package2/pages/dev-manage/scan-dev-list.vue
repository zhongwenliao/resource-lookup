<template>
	<uni-base-page>
		<view class="dev-list">
			<ul v-if="scanDeviceList.length > 0">
				<li v-for="device in scanDeviceList">
					<view class="left-info">{{ device.devSn }}</view>
					<view class="middle-info">{{ manage["signal"] || "信号值" }}： {{ device.RSSI }}</view>
					<view class="right-info" @click="copyDevSn(device.devSn)">{{ vis["copy"]||"复制" }}</view>
				</li>
			</ul>
			<view v-else style="width: 100%; text-align: center; padding: 50upx 0;">{{ manage["scan-no-device"]||"未扫描到设备" }}</view>
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				scanDeviceList: []
			}
		},
		
		computed: {
			manage() {
				return this.$t("manage");
			},
			
			vis() {
				return this.$t("vis");
			}
		},
		
		methods: {
			//扫描周边设备
			scanDevice() {
				console.log("scan------")
				//配置扫描 时间
				let scanTime = 1500;
				this.$sdkUtil.bluetoothScanNearDevice((result) => {
					console.log("执行扫描结果---",result);
					uni.stopPullDownRefresh();
					this.scanDeviceList = result;
				},scanTime)
			},
			
			//复制设备序列号
			copyDevSn(devSn) {
				uni.setClipboardData({
					data: devSn,
					success: res => {
						this.$showToast( this.vis["copy"]||"复制成功" );
					}
				})
			}
		},
		
		onShow() {
			this.scanDevice();
		},
		
		onPullDownRefresh() {
			this.scanDevice();
		},
		
		onLoad() {
			this.$setTitle( this.manage["nearby-device"] || "附近设备" );
		}
		
	}
</script>

<style>
	.dev-list {
		width: 98%;
		margin: 0 1%;
	}
	
	.dev-list ul {
		padding: 0;
	}
	
	.dev-list ul li {
		width: 96%;
		padding: 20upx 2%;
		overflow: hidden;
		border-bottom: 1upx solid #bebebe;
	}
	
	.left-info {
		width: 50%;
		float: left;
	}
	
	.middle-info {
		width: 30%;
		float: left;
	}
	
	.right-info {
		width: 20%;
		float: left;
		color: #007AFF;
		text-align: right;
	}
</style>
