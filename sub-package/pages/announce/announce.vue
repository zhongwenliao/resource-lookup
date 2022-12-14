<template>
	<uni-base-page class="announce-view content">
		<view class="announce-main-view">
			<view v-if="ifShow">
				<view class='announcement-img'>
					<image src='http://www.thinmoo.com/wp-content/uploads/2020/10/announcement.png'></image>
					<span style="position: absolute; top: 50upx; color: #FFFFFF;">{{ announce["tips"] || "温馨提示：点击公告，可查看公告详情" }}</span>
				</view>
				<scroll-view scroll-y class='announcement-list'>
					<ul>
						<li v-for='item in announcementList' @click='gotoDetail(item)' :data-content='item.content' :data-title='item.title' :data-time="item.updateTime">
							<view class='title-line'>{{ item.title }}</view>
							<view class='show-content'>{{ item.contentText }}</view>
							<view class='date'>{{ item.updateTime }}</view>
						</li>
					</ul>
				</scroll-view>
			</view>
			<view v-else class="no-data-view">
				{{ announce["no-data"] || "暂无公告"}}
			</view>
		</view>
	</uni-base-page>
	
</template>

<script>
	let currentClickAnnouceDetailObj = {}; 
	export default {
		data() {
			return {
				announcementList: [],
				ifShow: true
			}
		},
		methods: {
			getAnnouceList(communityId) {
				// console.log("小区id", communityId);
				this.$req.request({
					url: '/wyAppAnnmDetail/app/list',
					data:{
						communityId:communityId
					},
					success: (res) => {
						// console.log("公告列表", res.data);
						let announceList = res.data.list;
						for(let i in announceList) {
							let content = announceList[i].content.replace(/<[^>]*>|/g,"");
							let contentText = content.replace(/&nbsp;/g,"");
							// console.log("content text---",contentText);
							announceList[i].contentText = contentText;
						}
						this.announcementList = announceList;
						// console.log("this.announceList===",this.announcementList)
						if (this.announcementList.length === 0) {
							this.ifShow = false;
						}
					}
				})
			},
			
			gotoDetail(announceDetailObj) {
				console.log("annouce-----", announceDetailObj);
				currentClickAnnouceDetailObj = { ...announceDetailObj };
				delete currentClickAnnouceDetailObj["content"];
				// 跳转到公告详情页面
				uni.navigateTo({
					url: "../annouce-detail/annouce-detail?announcementObj=" + JSON.stringify(currentClickAnnouceDetailObj) 
						 + "&content=" + encodeURIComponent(announceDetailObj.content.replace(/%/g, "%25"))
				});
			}
		},
		computed: {
			announce() {
				return this.$t("announce")
			},
			common() {
				return this.$t("common")
			},
			title() {
				return this.$t("title")
			}
		},
		onReady() {
			uni.setNavigationBarTitle({
				title: this.title['announce']
			});
		},
		onLoad() {
			currentClickAnnouceDetailObj = {};
			let currentCommunity = this.$getUserInfo().currentCommunity;
			if (currentCommunity === undefined) {
				this.$showToast(this.common["no-community"]||"暂未绑定小区");
				this.ifShow = false;
				return;
			}
			var communityId = currentCommunity.id;
			this.getAnnouceList(communityId);
			
		},
		
		onPullDownRefresh() {
			var communityId = this.$getUserInfo().currentCommunity.id;
			this.getAnnouceList(communityId);
		}
	}
</script>

<style>
	.content {
		width: 100%;
		margin: 0 20upx;
		background:linear-gradient(#32a6f0, #8de0fb);
		font-size: 24upx;
		margin: 0;
	}
	.content .announce-main-view {
		padding: 0 20upx;
	}
	.announcement-img {
		width: 95%;
		text-align: left;
	}
	
	.announcement-img image {
	    width: 122rpx;
	    height: 106rpx;
	}
	
	.announcement-list {
		width: 100%;
		height:85%;
	}
	
	.announcement-list ul {
		padding: 0;
	}
	
	.announcement-list ul li {
	    display: block;
	    width: auto;
	    height: 200upx;
	    background-color: #fff;
	    border-radius: 10upx;
	    padding: 20upx;
	    margin-bottom: 20upx;
	}
	
	.title-line {
	    text-align: left;
	    color: #32a6f0;
	    font-size: 32upx;
	    font-weight: bold;
	}
	
	.show-content {
		font-size: 28upx;
		/* width: 650upx; */
		height: 110upx;
		overflow: hidden;
		text-overflow: ellipsis;
		-webkit-line-clamp: 2;
		/* white-space: nowrap; */
	}
	
	.show-content p {
		display: block;
		/* width: 600upx; */
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.date {
	    display: block;
	    text-align: right;
	    color:#32a6f0;
	    padding-right: 20upx;
	    bottom: 0;
	}
	
	.no-data-view {
		font-size: 40upx;
		color: #FFFFFF;
		text-align: center;
		margin-top: 50%;
	}
</style>
