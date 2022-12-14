<template>
	<web-view :src="urlSrc"></web-view>
	<!-- <web-view src="https://www.baidu.com/"></web-view> -->
</template>

<script>
	export default {
		data() {
			return {
				urlSrc: ""
			}
		},
		methods: {
			//获取H5传来的message
			// getWebMessage(e) {
			// 	console.log("h5传来的消息-----",e.detail.data);
			// }
		},
		onLoad(options) {
			this.urlSrc = "http://192.168.20.187:8080/#/vis-pwd?pwd=" + options.pwd + "&qrcode=" + options.qrcode + '&room=' + options.room;
			// this.urlSrc = "http://127.0.0.1:8080/#/vis-pwd";
			console.log("link -----",this.urlSrc);
		}
	};
</script>

<style>
</style>
