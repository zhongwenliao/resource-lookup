<template>
	<view class="content">
		<view class="logo">
			<image :src="logoUrl" alt=""><br/><br/>
			<text>{{ currentApp }}</text><br/>
			<text>Version {{ version }}</text>
		</view>
		<view class="copyright">
			{{`Copyright © 2014-${currentYear} All Rights Reserved.`}}
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				version: "",
				logoUrl: uni.getStorageSync("appInfo").logo,
				currentApp: "",
				currentYear: new Date().getFullYear()
			}
		},
		computed: {
			appName() {
				return this.$t("app-name");
			},
			title() {
				return this.$t("title")
			}
		},
		onReady() {
			this.$setTitle(this.title["about"]);
		},
		onLoad() {
			var configParam = this.$getConfigParam();
			this.version = configParam.appVersion;
			// #ifdef APP-PLUS
			// this.version = plus.runtime.version;
			// #endif
			// #ifdef MP-WEIXIN || MP-ALIPAY
			// this.version = configParam.mpWeixinVersion;
			// #endif
			this.currentApp = this.$getAppConfigI18n(configParam["appName"]);
		}
	}
</script>

<style>
	.logo {
		text-align: center;
		margin-top: 80upx;
		font-size: 34upx;
		font-weight: bold;
	}
	
	.logo image {
		width: 200upx;
		height: 200upx;
	}
	
	.copyright {
		position: absolute;
		width: 100%;
		bottom: 20upx;
		text-align: center;
		color: #BEBEBE;
	}
</style>
