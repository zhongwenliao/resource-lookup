<template>
	<uni-base-page class="content list-view">
		<view class="wrap">
			<ul style="list-style-type:circle" v-if="wifiList.length > 0">
				<li class="list_li" v-for="(wifi, index) in wifiList" :key="index" @click="getWifiName(wifi)">{{wifi.SSID}}</li>
			</ul>
			<view v-else class="no-data-view">{{ manage["no-wifi"] || "暂未搜索到可用WiFi" }}</view>
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				wifiList: [],
				isLoad: true
			}
		},
		onLoad() {
			this.getWifiList();
		},
		onReady() {
			uni.setNavigationBarTitle({
				title: this.title["wifi-list"]
			})
		},
		methods: {
			getWifiList() {
				this.isLoad = true;
				// #ifdef APP-PLUS
				this.$sdkUtil.getWifiList(result => {
					this.isLoad = false;
					var errorCode = result.errorCode;
					if (errorCode === 0) {
						this.wifiList = result.data;
					}
				});
				// #endif
				
			},
			
			//获取WiFi名称
			getWifiName(wifi) {
				var wifiName = wifi.SSID;
				this.$onfire.fire("EventWifiNameChange", {"wifiName": wifiName});
				uni.navigateBack();
			}
		},
		computed: {
			manage() {
				return this.$t("manage")
			},
			title() {
				return this.$t("title")
			}
		}
	}
</script>

<style lang="scss">
	.wrap {
		background-color: #FFFFFF;
	}
	.list_li {
		border-bottom: 1px solid #DCDFE6;
		padding: 20upx 10upx;
	}
	.wifi-list {
		background: #FFFFFF;
		
		ul {
			padding: 0;
			
			li {
				background: #FFFFFF;
				height: 80upx;
				line-height: 80upx;
				width: 96%;
				padding: 0 10%;
				border-bottom: 2upx solid #eee;
			}
		}
	}
</style>
