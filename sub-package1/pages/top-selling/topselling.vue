<template>
	<view class="top">
		
		<view class="cont">
			<textarea :placeholder="`${talking['record-placeholder']}` || '请填写你推荐好物的理由'"/>
		</view>
		<view class="upload" @click="photo">
			<image src="../../static/img/talkupload.png"></image>
		</view>
		<!-- 发布成功提示 -->
		<view class="success" v-if="sendsucc">
			<p>发布成功</p>
			<image src="../../static/img/talksuccess.png"></image>
		</view>
		<!-- 发布失败提示 -->
		<view class="fail" v-if="sendfail">
			<p>发布失败</p>
			<image src="../../static/img/talkfail.png"></image>
		</view>
	</view>
</template>

<script>
	export default{
		data(){
			return {
				
			}
		},
		computed:{
			talking() {
				return this.$t("talking");
			}
		},
		onLoad(){
			
		},
		methods:{
			
		}
	}
</script>

<style lang="scss">
	.clear::before, .clear::after {
		content: "";
		display: block;
		clear: both;
	}
	.fl {
		float: left;
	}
	.fr {
		float: right;
	}
	.top{
		background: #eee;
		width: 100%;
		position: relative;
		.head{
			background: #fff;
			height: 88upx;
			padding: 0 40upx;
			.cancel{
				color: #ccc;
			}
			span{
				display: block;
				height: 88upx;
				line-height: 88upx;
				font-size: 30upx;
			}
		}
		.cont{
			margin-top: 16upx;
			background: #fff;
			height: 50%;
			width: 100%;
			textarea{
				width: 100%;
				height: 100%;
				display: block;
				font-size: 30upx;
				padding: 30upx;
			}
		}
		.upload{
			padding: 30upx;
		}
		.upload image{
			display: block;
			width: 60upx;
			height: 60upx;
		}
		.success{
			width: 260upx;
			height: 200upx;
			border-radius: 20upx;
			background: rgba(0,0,0,0.3);
			position: absolute;
			top: 50%;
			left: 50%;
			margin-top: -100upx;
			margin-left: -130upx;
			p{
				color: #fff;
				text-align: center;
				padding: 30upx 0;
			}
			image{
				display: block;
				width: 70upx;
				height: 70upx;
				margin: auto;
			}
		}
		.fail{
			width: 260upx;
			height: 200upx;
			border-radius: 20upx;
			background: rgba(0,0,0,0.3);
			position: absolute;
			top: 50%;
			left: 50%;
			margin-top: -100upx;
			margin-left: -130upx;
			p{
				color: #fff;
				text-align: center;
				padding: 30upx 0;
			}
			image{
				display: block;
				width: 60upx;
				height: 60upx;
				margin: auto;
			}
		}
	}
</style>
