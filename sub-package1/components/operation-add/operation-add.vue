<template>
	<view class="">
		<u-popup  ref="popupChild" class="" style="z-index: 99999;" mode="right">
			<navigator url="" style="width: 200upx;" class="borderBottom1 pad20">
				<u-icon class="verticalCenter" name="chat-fill"></u-icon>
				爆好物
			</navigator>
			<navigator style="width: 200upx;" class="borderBottom1 pad20">
				<u-icon class="verticalCenter" name="chat-fill"></u-icon>
				发说说
			</navigator>
			<navigator style="width: 200upx;" class="borderBottom1 pad20">
				<u-icon class="verticalCenter" name="chat-fill"></u-icon>
				发活动
			</navigator>
			<navigator style="width: 200upx;" class="borderBottom1 pad20">
				<u-icon class="verticalCenter" name="chat-fill"></u-icon>
				发周边优惠
			</navigator>
		</u-popup>
		<!-- <u-button @click="show = true">打开</u-button> -->
	</view>
</template>

<script>
	export default {
		props:{
			show: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				
			}
		},
		methods: {
			open() {
				this.$refs.popupChild.open()
				// this.$emit('clickNavRight')
			}
		}
	}
</script>

<style>
	
</style>
