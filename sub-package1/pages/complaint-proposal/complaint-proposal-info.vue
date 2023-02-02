<template>
	<view class="complaint_main">
		<!--自定义导航栏-->
		<uni-nav-bar background-color="#fff" color="#000" :status-bar="status_bar" @clickLeft="clickNavLeft()"
			:title="complaintProposa['Proposaldetails']||'建议详情'" @clickRight="clickNavRight()">
			<!-- 导航栏左侧插槽 -->
			<view slot="left">
				<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/left.png" mode="" style="width: 15px;height: 15px;"></image>
			</view>
		</uni-nav-bar>
		<!--自定义导航栏end-->


		<view class="text">
			<span>{{releaseinfo.content}}</span>
			<view class="picture">
				<image :src="item" v-for="(item,index) in imgList" :key="index" @click="ViewImage(index,imgList)">
				</image>
			</view>
			<p v-if="releaseinfo.createTime">{{releaseinfo.createTime.substr(0,10)}}</p>
		</view>

		<!--评论列表-->
		<view class="CommentlBox">
			<view v-for="(item,index) in releaseinfo.appComplaintReplyList" :key="index" class="CommentlList" @click="$refs.detailComment.open()">
				
				<!--评论人 信息-->
				<p class="complaintreplyInfo">
					<image :src="item.appAvatar" v-if="item.appAvatar" class="appAvatar"></image>
					<!--没有头像就使用默认头像-->
					<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/tx.png" v-if="!item.appAvatar" class="appAvatar"></image>

					<span v-if="item.nickname">{{item.nickname}}</span>
					<span v-if="!item.nickname&&item.phone">{{item.phone.substr(0,3)+'****'+item.phone.substr(7,4)}}</span>

				</p>

				<!--回复的信息-->
				<p>{{item.content}}</p>

				<!--评论的时间-->
				<span style="color: #a3a3a3;font-size: 13px;">{{item.createTime| formatData}}</span>
				
			</view>
			
		
		</view>

		<!--回复框-->
		<view style="position: fixed;width: 100%;bottom: 0;height: 100upx;">
			<input style="background: #FFF;width: 90%;margin: auto;padding: 20upx 20upx;border: 1px solid #CCCCCC;"
				:placeholder="complaintProposa['reply']||'回复'" @click="$refs.detailComment.open()" />
		</view>
		<five-comment ref="detailComment" @sendComment="sendComment" :placeholder="complaintProposa['comment']||'请输入评论内容…'"></five-comment>
		<!--回复框end-->
	</view>
</template>

<script>
	let token = ''
	import utils from '@/common/js/index'
	export default {
		data() {
			return {
				status_bar: true,
				imgList: [], //图片列表
				releaseinfo: '', //详情列表
			}
		},
		computed: {
			complaintProposa() {
				return this.$t("complaint-proposal")
			},
		},
		onLoad(options) {
			this.id = options.id
		},
		onShow() {
			this.proposalInfo()//进入页面时获取页面信息
			token = uni.getStorageSync("token")
		},
		filters: {
			formatData(data) {
				//给回复时间做处理 列：三分钟前 一小时前..
				let datas = utils.fromCurrentTime(data)
				return datas
			}
		},
		methods: {
			// 点击导航栏左侧
			clickNavLeft() {
					uni.navigateBack(1)
			},
			//获取建议详情
			proposalInfo() {
				this.$req.request({
					url: "/appComplaint/app/getById",
					method: "POST",
					data: {
						accessToken: token,
						id: this.id,
					},
					success: res => {
						if (res.code == 0) {
							this.releaseinfo = res.data
							console.log(res.data, res.data.contentPicture)
							if (res.data.contentPicture) {
								if (res.data.contentPicture.indexOf(",")) {
									this.imgList = res.data.contentPicture.split(',')
								} else {
									this.imgList.push(res.data.contentPicture)
								}
							}

							console.log(this.imgList)
						} else {
							this.$showToast(res.msg);
						}

					}
				});
			},
			//预览图片
			ViewImage(i, imgList) {
				let imgurl = []
				console.log(imgList)
				imgList.forEach(item => imgurl.push(item))
				uni.previewImage({
					urls: imgurl,
					current: imgList[i],
					 loop:true
				});
			},
			/**
			 * 发送评论
			 * @param {Object} result
			 */
			sendComment(result) {
				let params = {
					// accessToken: token,
					id: this.id,
					replyContent: result
				}
				this.$req.request({
					url: "/appComplaint/app/addReply",
					data: params,
					success: res => {
						console.log(res)
						this.$showToast(res.msg)
						if (res.code === 0) {
							this.proposalInfo()
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
		overflow-x: hidden;
	}

	.text {
		background: #FFFFFF;
		margin-top: 2%;
		padding: 20upx 35upx;
		border-bottom: 1PX solid #CCC;
	}

	.text span {
		display: inline-block;
		height: 200upx;
		width: 100%;
	}

	.text p {
		text-align: right;
		color: #a3a3a3;
	}

	.picture {
		width: 100%;
		height: 100%;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	.picture:after {
		content: "";
		height: 0;
		width: 30%;
	}


	.picture image {
		margin: 10upx 0;
		width: 30%;
		height: 200upx;
	}

	.appAvatar {
		width: 70upx;
		height: 70upx;
		border-radius: 50%;
	}

	.complaintreplyInfo {
		display: flex;
	}

	.complaintreplyInfo>span {
		margin: auto 0;
		margin-left: 10upx;
	}

	.CommentlList {
		margin: 0 35upx;
		padding: 20upx 0;
		border-bottom: 1PX solid #CCC;
	}

	.CommentlBox {
		background-color: #FFFFFF;
		height: 80%;
	}

	button {
		margin: 0px 10%;
		background: linear-gradient(118deg, #01DCA3 0%, #088B68 100%);
		box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
		border-radius: 50upx 50upx 50upx 50upx;
		color: #FFFFFF;
	}
</style>
