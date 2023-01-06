<template>
	<view class="r-top">
		<textarea :maxlength="maxlength" placeholder-style="color:rgba(153,153,153,1);" v-model="content" :placeholder="placeholder" />
		<view class="r-top-t">
		 	<view></view>
			<view v-if="showLength"> {{contentLength}}/{{maxlength}}</view>
		 </view>
	</view>
</template>

<script>
	export default {
		computed:{
			contentLength(){
				return this.content.length;
			}
		},
		props:{
			value:{
				type: String,
				default: ""
			},
			placeholder:{
				type: String,
				default: "请输入备注信息"
			},
			showLength:{
				type: Boolean,
				default: true
			},
			maxlength:{
				type: Number,
				default: 50
			},
			// content:{
			// 	type: String,
			// 	default: ""
			// }
		},
		data() {
			return {
				content: this.value
			}
		},
		watch: {
			value(nVal, oVal) {
				this.content = nVal;
				
			},
			content(nVal, oVal) {
				 this.$emit("update:value", nVal);
				
			},
		},
	}
</script>

<style>
	uni-textarea{
		width: auto;
	}
.r-top{
	width: 100%;
	padding: 10rpx;
	background: #f5f5f5;
	height: 300upx;
	font-size: 28upx;
	padding: 20upx 20upx;
	/* border-radius: 20rpx; */
	position: relative;
}
.r-top-t{
	display: flex;
	justify-content: space-between;
	font-family:PingFang SC;
	font-weight:400;
	position: absolute;
	right: 10upx;
	bottom: 0;
	color:rgba(153,153,153,1);
	opacity:1;
}
</style>
