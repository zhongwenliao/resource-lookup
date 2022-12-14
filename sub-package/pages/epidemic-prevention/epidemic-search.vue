<template>
	 <view>
	        <web-view :webview-styles="webviewStyles" src="https://cloud.thinmoo.com/static/h5/xinguan/plague_query/index.html"></web-view>
	 </view>
</template>

<script>
	 export default {
	        data() {
	            return {
	                webviewStyles: {
	                    progress: {
	                        color: '#FF3333'
	                    }
	                }
	            }
	        }
	    }
</script>

<style>
</style>
