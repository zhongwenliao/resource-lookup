<template>
	<view class="uni-base-page" @touchstart="start" @touchend="end">
		<slot></slot>
		<uni-base-toast ref="toast"/>
		<!-- <view ref="view-111">111</view> -->
	</view>
</template>
<script>
	export default {
		name: "UniBasePage",
		data() {
			return {
				startData: {
					
				}
			}
		},
		methods: {
			start(e) {
			    this.startData.clientX = e.changedTouches[0].clientX;
			    this.startData.clientY = e.changedTouches[0].clientY;
				// console.log("x: " + this.startData.clientX + ", y: " + this.startData.clientY);
			},
			end(e) {
				if(this.$platformObj.isAndroid()) {
					const subX = e.changedTouches[0].clientX - this.startData.clientX;
					const subY = e.changedTouches[0].clientY - this.startData.clientY;
					if(subY > 50 || subY < -50){
					    console.log('上下滑');
					}else{
					    if(subX > 50){
					        console.log('右滑');
							if(this.startData.clientX <= 10) {
								uni.navigateBack({
									
								});
							}
					    }else if(subX < -50){
					        console.log('左滑');
					    }else{
					        console.log('无效');
					    }
					}
				}
			}
		}
	}
</script>
<style>
	.uni-base-page {
		width: 100%;
		height: 100%;
	}
	.content {
		display: flex;
		flex: 1;
		flex-direction: column;
		background-color: #efeff4;
		padding: 20upx 0;
		width: 100%;
	}
</style>
