<template>
	<uni-base-page style="width: 100%;">
		<view class="pirkHelper">
			<ul class="clear">
				<li class="fl" @click="goToMonthCard" v-if="currentLanguage.indexOf('cn') > -1">
					<image src="../../static/img/yk.png"></image>
					<text>{{ parkingAssistant["card-management"] || "月卡管理" }}</text>
				</li>
				<li class="fl" @click="disTemplate" v-if="brake && brake.permAppParkManage == 1">
					<image src="../../static/img/cz.png"></image>
					<text>{{ parkingAssistant["brake-assistant"] || "车闸助手" }}</text>
				</li>
				<!-- <li class="fl" @click="disTemplate" v-if="brake && brake.permAppParkManage == 1">
					<image src="https://wxmini-1258758873.cos.ap-guangzhou.myqcloud.com/menu/dev-manage.png"></image>
					<text>设备管理</text>
				</li> -->
			</ul>
		</view>
	</uni-base-page>
</template>

<script>
export default {
	data() {
		return {
			currentLanguage: uni.getStorageSync('appInfo').language.toLowerCase(),
			ifLogin: null,
			brake: {}
		};
	},
	computed: {
		parkingAssistant() {
			return this.$t("parking-assistant");
		},
		title() {
			return this.$t("title")
		}
	},
	methods: {
		// 跳转到车闸助手页面
		disTemplate() {
			uni.navigateTo({
				url: '/sub-package1/pages/brake/brake'
			});
		},
		goToMonthCard() {
			// 调用一次性订阅消息模板
			// #ifdef MP-WEIXIN
			if (this.ifLogin == true) {
				wx.requestSubscribeMessage({
					tmplIds: this.$getConfigParam().monthCarTemplateId,
					success: res => {
						this.$showLog('微信小程序调用订阅消息模板成功', res, '登录界面');
						this.ifLogin = false;
					},
					fail: err => {
						this.$showLog('微信小程序调用订阅消息模板失败', err, '登录界面');
					}
				});
			}
			// #endif
			uni.navigateTo({
				url: '../../../sub-package/pages/payment/month-card-manage'
			});
		}
	},
	onLoad() {
		this.ifLogin = uni.getStorageSync('ifLogin');
		this.brake = uni.getStorageSync('home-wyDept');
		// this.$showLog(this.brake && this.brake.permAppParkManage == 1);
	}
};
</script>

<style>
.pirkHelper {
	width: 100%;
	border-top: 1px solid #eee;
	padding-top: 60upx;
}
.pirkHelper ul {
	padding-left: 0;
}
.pirkHelper ul li {
	width: calc(100% / 3);
	text-align: center;
	font-size: 32upx;
}
.pirkHelper ul li image {
	width: 100upx;
	height: 100upx;
	display: block;
	margin: auto;
}
.pirkHelper ul li text {
	display: inline-block;
	padding-top: 10upx;
}
</style>
