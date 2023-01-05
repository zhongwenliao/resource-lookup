<template>
	<view class="open-door">
		<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/yes.png" mode=""></image>
		<view class="open">{{ appointment["open-door"] || "开门成功" }}</view>
		<view class="dev-name">{{doorName}}</view>
		<button type="default" class="back" @click="back">{{ appointment["back"] || "返回" }}</button>
		<view class="ad-box">
			<ad :adpid="adpid" unit-id="adunit-bfedf0a5b8c2943b"></ad>
		</view>
	</view>
</template>

<script>
export default {
	name: '',
	data() {
		return {
			adpid: this.$getConfigParam().openDoorAdpid,
			doorName: "",
			isShowAd: null,
		};
	},
	computed: {
		appointment() {
			return this.$t("appointment");
		}
	},
	methods: {
		back(){
			uni.navigateBack({
				delta: 1
			})
		},
	},
	onLoad(options) {
		this.doorName = options.doorName;
	}
};
</script>

<style>
.open-door {
	width: 100%;
	text-align: center;
	border-top: 1px solid #eee;
}
.open-door image {
	width: 100upx;
	height: 100upx;
	margin-top: 120upx;
	margin-bottom: 35upx;
}
.open-door .open {
	font-size: 50upx;
	color: #000;
	margin-top: 20upx;
}
.open-door .dev-name{
	color: #aaa;
}
.open-door .back{
	width: 80%;
	height: 88upx;
	line-height: 88upx;
	background: linear-gradient(118deg, #01dca3 0%, #088b68 100%);
	box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
	border-radius: 50upx 50upx 50upx 50upx;
	color: #ffffff;
	margin-top: 180upx;
}
.open-door .ad-box{
	width: 100%;
	/* #ifndef MP-WEIXIN */
	height: 450upx;
	/* #endif */
	position: fixed;
	left: 0;
	bottom: 0;
	right: 0;
	text-align: center;
	color: #aaa;
}
</style>
