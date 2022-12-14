<template>
	<web-view :src="url"></web-view>
</template>

<script>
	export default {
		data() {
			return {
				url: ""
			}
		},
		
		onLoad(options) {
			if(options.productUrl) {
				this.url = options.productUrl
			}
		}
	}
</script>

<style>
</style>
