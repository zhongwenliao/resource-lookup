<template>
	<view class="main">
		<!--自定义导航栏-->
		<uni-nav-bar background-color="#fff" color="#000" :status-bar="status_bar" @clickLeft="clickNavLeft()"
			:title="articleRelease['Releaserecord']||'放行记录'" @clickRight="clickNavRight()">
			<!-- 导航栏左侧插槽 -->
			<view slot="left">
				<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/left.png" mode="" style="width: 15px;height: 15px;"></image>
			</view>
		</uni-nav-bar>
		<!--自定义导航栏end-->

		<p class="hold15"></p>

		<view class="list">
			<!--没有列表数据的话展示-->
			<u-empty :text="articleRelease['NodDataAvailable']||'暂无数据'" mode="list"
				v-if="list.length==0" style="padding: 30% 0;">
			</u-empty>
			<!--没有列表数据的话展示end-->
			<ul>
				<li v-for="(item,index) in list" :key="index">
					<view class="centerBox">
						<view class="text">
							<p class="fontWitch">{{articleRelease['Deliverydate']||'搬运日期'}}：{{item.deliveryDate}}</p>
							<p v-for="(j,i) in item.goodsList" :key="i">{{i+1+'.'}}{{articleRelease['goods']||'物品'}}：{{j.name}}<span
									style="margin-left: 40upx;">{{articleRelease['number']||'数量'}}：{{j.number}}</span></p>

						</view>
						<view class="stateBox">
							<view>
								<image v-if="item.reviewStatus==1" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/pass.png" mode="" class="icon">
								</image>
								<p v-if="item.reviewStatus==1">{{articleRelease['Approved']||'已通过审批'}}</p>

								<image v-if="item.reviewStatus==0" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/dd.png" mode="" class="icon">
								</image>
								<p v-if="item.reviewStatus==0">{{articleRelease['Approvalinprogress']||'正在审核'}}</p>

								<image v-if="item.reviewStatus==2" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/nopass.png" mode="" class="icon">
								</image>
								<p v-if="item.reviewStatus==2">{{articleRelease['Notapproved']||'未通过审批'}}</p>

								<p class="time">{{item.createTime.substring(0,10)}}</p>
							</view>
						</view>
					</view>
					<view class="picture" v-if="item.goodsPicture">
						<image :src="imgitem" v-for="(imgitem, index) in item.goodsPicture.split(',')" :key="index"
							@click="ViewImage(index,imgitem.split(','))" />
					</view>
					<p v-if="item.reviewResult" style="color: #005500;">{{articleRelease['Reasonsforfailure']||'不通过原因:'}}:{{item.reviewResult}}</p>
				</li>

			</ul>
		</view>
		<u-back-top :scroll-top="scrollTop" top="100"></u-back-top>
	</view>
</template>

<script>
	let userInfo = ''
	let token = ''
	export default {
		data() {
			return {
				status_bar: true,
				scrollTop: 0,
				list:[] //列表信息
			}
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
		onLoad(options) {
			userInfo = uni.getStorageSync("userInfo")
			token = uni.getStorageSync("token")
			this.releaseList() //调取用户的接口
		},
		computed: {
			articleRelease() {
				return this.$t("article-release") //返回出国际化的语言数据
			},
			
		},
		methods: {
			// 点击导航栏左侧
			clickNavLeft() {
				uni.navigateTo({
					url: "/sub-package1/pages/article-release/article-release"
				});
			},
			//用户所看到的列表
			releaseList() {
				this.$req.request({
					url: "/appGoodsRelease/app/listByUser",
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

	.main {
		width: 100%;
		font-size: 30upx;
		background-color: #F5F5F5;
	}

	.top_box {
		height: 53%;
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
	}

	.list li {
		padding: 30upx 15upx;
		margin-bottom: .5%;
		background: #FFFFFF;
		/* display: flex;
		justify-content: space-between; */
	}

	.list li .text {
		width: 75%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.centerBox {
		display: flex;
		justify-content: space-between;
	}

	.list li .time {
		color: #a3a3a3;
	}

	.stateBox {
		display: flex;
		flex-direction: column;
		text-align: center;
		width: 25%;
	}

	.stateBox image {
		margin: 0 auto;
	}

	.stateBox>view {
		margin: auto;
	}

	.picture {
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

	.stateBox>uni-view{
		line-height: 1.2;
	}

	button {
		margin: 0px 10%;
		background: linear-gradient(118deg, #01DCA3 0%, #088B68 100%);
		box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
		border-radius: 50upx 50upx 50upx 50upx;
		color: #FFFFFF;
	}
</style>
