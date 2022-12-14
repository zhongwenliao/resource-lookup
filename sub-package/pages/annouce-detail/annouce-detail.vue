<template>
	<uni-base-page class="content">
		<view class="title">{{ annouceDetailObj.title }}</view>
		<view class="update-time">{{ annouceDetailObj.updateTime }}</view>
		<view class="announcement">
			<rich-text :nodes="annouceDetailObj.content"></rich-text>
			<!-- <view v-html="content"></view> -->
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				// 公告详情
				annouceDetailObj: {}
			}
		},
		computed: {
			title() {
				return this.$t('title')
			}
		},
		onReady() {
			uni.setNavigationBarTitle({
				title: this.title["announce-detail"]
			});
		},
		onLoad: function(options) {
			// console.log("options---", options.announcementObj);
			if(options.announcementObj) {
				let annouceDetailObj = JSON.parse(options.announcementObj);
				try {
					annouceDetailObj.content = decodeURIComponent(options.content);
				} catch(e) {
					// TODO handle the exception
					console.log("公告decodeURIComponent异常: ", e);
					annouceDetailObj.content = options.content;
				} finally {
					this.annouceDetailObj = annouceDetailObj;
					this.$editUserInfo("annouceId-" + annouceDetailObj.communityId, annouceDetailObj.id);
				}
			}
		},
		methods: {

		}
	}
</script>

<style>
	.content {
		width: 100%;
		height: 100%;
		/* position: absolute; */
		/* padding: 0 20upx; */
		/* background: linear-gradient(#32a6f0, #8de0fb); */
		background: #FFFFFF;
		font-size: 24upx;
		margin: 0;
	}

	.title {
		width: 96%;
		text-align: left;
		/* color: #ffffff; */
		font-size: 32upx;
		font-weight: bold;
		padding: 10upx 2%;
	}
	
	.update-time {
		font-size: 24upx;
		color: #AAAAAA;
		width: 96%;
		padding: 0 2%;
	}

	.announcement {
		/* width: 90%;
		height: 80%; */
		width: 96%;
		background-color: #ffffff;
		padding: 20upx 2%;
		/* border-radius: 10upx; */
		margin: 0 auto;
	}
</style>
