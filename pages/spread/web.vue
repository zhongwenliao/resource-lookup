<template>
	<view>
		<web-view  :src="url"></web-view>
	</view>
</template>

<script>
	export default {
		data(){
			return{
				url:''
			}
		},
		
		onLoad(option) {
			
			if(option.type){
				this.url = uni.getStorageSync('authUrl')
			}else{
				this.url = option.u
			}
		}
		
	}
</script>

<style>
</style>
