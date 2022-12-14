<template>
	<uni-base-page>
		<view class="get-point-box">
			<view class="point" v-if="pointObj.isGet == 1">积分   <text>+{{ pointObj.integralNumber }}</text></view>
			<view class="point" v-else>您今天已领过积分啦~</view>
		</view>
		<!-- 这里有广告 -->
		<view style="width: 100%;" v-if="currentLanguage.indexOf('cn') > -1"  class="">
			<ad :adpid="adpid"></ad>
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				currentLanguage: this.$getLanguageLowerCase(),  
				pointObj: {},
				adpid: this.$getConfigParam().pointAdpid
			}
		},
		
		methods: {
			getOpenDoorPoint() {
				this.$req.request ({
					url: "/appIntegral/app/openReceiveIntegral",
					success: res => {
						this.pointObj = res.data;
					}
				})
			}
		},
		
		onLoad() {
			this.getOpenDoorPoint();
		}
		
	}
</script>

<style>
	.get-point-box {
		width: 100%;
		height: 600upx;
		text-align: center;
		background: #fffede;
	}
	
	.point {
		text-align: center;
		color: #333333;
		font-size: 36upx;
		line-height: 600upx;
	}
	
	.point text {
		font-size: 100upx;
		color:#ffd813;
		padding-left: 20upx;
	}
</style>
