<template>
	<view class="complaint_main">
		<!--自定义导航栏-->
		<uni-nav-bar background-color="#fff" color="#000" :status-bar="status_bar" @clickLeft="clickNavLeft()"
			:title="complaintProposa['Suggestion']||'投诉建议'" @clickRight="clickNavRight()">
			<!-- 导航栏左侧插槽 -->
			<view slot="left">
				<image src="../../static/img/left.png" mode="" style="width: 15px;height: 15px;"></image>
			</view>
		</uni-nav-bar>
		<!--自定义导航栏end-->
		<view class="list">
			<!--没有列表数据的话展示-->
			<u-empty :text="articleRelease['NodDataAvailable']||'暂无数据'" mode="list" v-if="list.length==0"
				style="padding: 30% 0;">
			</u-empty>
			<!--没有列表数据的话展示end-->
			<ul>
				<li @click="info(item.id)" v-for="(item,index) in list" :key="index">
					<view class="box">
						<span class="text">{{item.content}}</span>
						<span class="time">{{item.createTime}}</span>
					</view>
					<p class="answered" v-if="item.status==0">{{complaintProposa['Tobeanswered']||'待回复'}}</p>
					<p class="replied" v-if="item.status==1">{{complaintProposa['Replied']||'已回复'}}</p>
				</li>
			</ul>
		</view>
		<u-back-top :scroll-top="scrollTop" top="200"></u-back-top>
	</view>
</template>

<script>
	let userInfo = ''
	let token = ''
	export default {
		data() {
			return {
				status_bar: true,
				list: '',
				scrollTop: 0
			}
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
		computed: {
			complaintProposa() {
				return this.$t("complaint-proposal")
			},
			articleRelease() {
				return this.$t("article-release") //返回出国际化的语言数据
			},
		},
		onLoad(options) {
			this.bool = options.bool
			userInfo = uni.getStorageSync("userInfo")
			token = uni.getStorageSync("token")
			//判断是从哪里进入的
			if (this.bool == 1) {
				this.propertyList() //调取物业的接口
			} else {
				this.proposalList() //调取用户的接口
			}
		},
		onShow() {

		},
		methods: {
			// 点击导航栏左侧
			clickNavLeft() {
				if (this.bool == 1) {
					uni.navigateBack({
						delta:1
					})
				} else {
					uni.navigateTo({
						url: "/sub-package1/pages/complaint-proposal/complaint-proposal"
					})
				}
			},
			info(id) {
				uni.navigateTo({
					url: "/sub-package1/pages/complaint-proposal/complaint-proposal-info?id=" + id
				})
			},
			//获取投诉列表(用户)
			proposalList() {
				this.$req.request({
					url: "/appComplaint/app/listByUser",
					method: "POST",
					data: {
						accessToken: token,
						communityId: userInfo.currentCommunity.id,
					},
					success: res => {
						if (res.code == 0) {
							this.list = res.data
						} else {
							this.$showToast(res.msg);
						}

					}
				});
			},
			//获取投诉列表(物业)
			propertyList() {
				this.$req.request({
					url: "/appComplaint/app/listByWyEmp",
					method: "POST",
					data: {
						accessToken: token,
						communityId: userInfo.currentCommunity.id
					},
					success: res => {
						if (res.code == 0) {
							this.list = res.data
						} else {
							this.$showToast(res.msg);
						}

					}
				});
			},
		}
	}
</script>

<style scoped>
	ul,
	li {
		padding: 0px;
		margin: 0px;
		list-style: none;
	}

	.complaint_main {
		width: 100%;
		font-size: 30upx;
		background-color: #F5F5F5;
	}

	.top_box {
		height: 53%;
		padding-top: 15%;
	}

	.title-box {
		width: 100%;
		display: flex;
		flex-direction: column;
		text-align: center;
		padding: 80upx 0px;
	}

	.title-box uni-image {
		margin: auto;
	}

	.list {
		width: 100%;
		margin-top: 2%;
	}

	.list li {
		padding: 20upx 15upx;
		margin-bottom: .5%;
		background: #FFFFFF;
		display: flex;
		justify-content: space-between;
	}

	.box {
		width: 80%;
	}

	.list li .text {
		width: 75%;
		overflow: hidden;

		text-overflow: ellipsis;

		white-space: nowrap;
	}

	.box>span {
		display: block;
	}

	.list li .time {
		color: #a3a3a3;
	}

	.answered {
		width: 150upx;
		height: 55upx;
		line-height: 55upx;
		text-align: center;
		background: #fff;
		border: 1px solid #CCCCCC;
		border-radius: 30upx;
		margin: auto;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding: 0 15upx;
	}

	.replied {
		width: 150upx;
		height: 55upx;
		line-height: 55upx;
		text-align: center;
		background: #0571FF;
		border: 1px solid #CCCCCC;
		border-radius: 30upx;
		color: #FFFFFF;
		margin: auto;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding: 0 15upx;
	}
</style>
