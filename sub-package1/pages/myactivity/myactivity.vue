<template>
	<uni-base-page class="myact">
		<!-- <view class="hold15"></view> -->
		<view class="swiper-tab">
			<view :class="0 == currentIndex? 'titleSel' : 'titleUnsel'" @click="tabSwitch(0)">
				<text>{{ manypage["release"] || "已发布" }}</text>
				<hr :class="0 == currentIndex? 'headerLineSel' : 'headerLineUnsel'" />
			</view>
			<view :class="1 == currentIndex? 'titleSel' : 'titleUnsel'" @click="tabSwitch(1)">
				<text>{{ manypage["signed"] || "已报名" }}</text>
				<hr :class=" 1 == currentIndex? 'headerLineSel' : 'headerLineUnsel' " />
			</view>
		</view>
		<!-- 内容布局 -->
		<swiper class='swiper' :current='currentIndex' @change="swiperChange">
			<!-- 已发布的活动 -->
			<swiper-item>
				<scroll-view scroll-y class='release-scroll'>
					<movable-area>
						<view class="hold15"></view>
						<ul style="padding-bottom: 10upx;">
							<li v-for="(item,index) in activitylist" :key="index" @click="releaseDetail(item.id)">
								<view class="clear">
									<view class="imgBox fl" v-if="item.activityImgSrcList">
										<view class="picture" v-for="(imgSrc, srcIndex) in item.activityImgSrcList" :key="srcIndex"
											v-if="srcIndex<1 && imgSrc" :style="{'background-image':'url('+imgSrc+')'}">
										</view>
									</view>
									<view :class="[(item.activityImgSrcList.length !== 0) ? 'width63' : 'width100']">
										<view class="title">{{item.name}}</view>
										<view class="mess" style="padding-top: 70upx;"><text style="color: #000;">{{ main["time"] || "时间" }}：</text>{{item.releaseDate}}</view>
										<view class="clear">
											<view :class="[(item.activityImgSrcList.length !== 0) ? 'address56' : 'address65']"><text style="color: #000;">{{ main["address"] || "地点" }}：</text>{{item.address}}</view>
											<view class="fr">
												<i class="pinglun">
													<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/talkpinglun.png"></image>
												</i>
												<i class="num" style="margin-right: 20upx;">{{item.comments ? item.comments : '0'}}</i>
												<i class="look">
													<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/talklook.png"></image>
												</i>
												<i class="num">{{item.views ? item.views : '0'}}</i>
											</view>
										</view>
									</view>
								</view>
							</li>
							<view v-if="activitylist.length == 0" class="text-view1">
								<image style="width: 100upx;height: 100upx;" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/no-data.png" />
								<view style="color: #808080;">{{ main["no-data"] || "发点什么吧~" }}</view>
							</view>
						</ul>
						<movable-view :x="x" :y="y" direction="all" @change="onChange">
							<image @click="goToact" class="send" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/sendicon.png"></image>
						</movable-view>
					</movable-area>
				</scroll-view>
			</swiper-item>
			<!-- 已报名的活动 -->
			<swiper-item class="apply-list">
				<scroll-view scroll-y class='apply-scroll' v-show="ifHaveRecords">
					<view class="hold15"></view>
					<ul style="padding-bottom: 10upx;">
						<li v-for="(item,index) in applylist" :key="index" @click="applyDetail(item.id)">
							<view class="clear">
								<view class="imgBox fl" v-if="item.applyImgSrcList">
									<view class="picture" v-for="(imgSrc, srcIndex) in item.applyImgSrcList" :key="srcIndex"
										v-if="srcIndex<1 && imgSrc" :style="{'background-image':'url('+imgSrc+')'}">
									</view>
								</view>
								<view :class="[(item.applyImgSrcList.length !== 0) ? 'width63' : 'width100']">
									<view class="title">{{item.name}}</view>
									<view class="mess" style="padding-top: 70upx;"><text style="color: #000;">{{ main["time"] || "时间" }}：</text>{{item.releaseDate}}</view>
									<view class="clear">
										<view :class="[(item.applyImgSrcList.length !== 0) ? 'address56' : 'address65']"><text style="color: #000;">{{ main["address"] || "地点" }}：</text>{{item.address}}</view>
										<view class="fr">
											<i class="pinglun">
												<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/talkpinglun.png"></image>
											</i>
											<i class="num" style="margin-right: 20upx;">{{item.comments ? item.comments : '0'}}</i>
											<i class="look">
												<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/talklook.png"></image>
											</i>
											<i class="num">{{item.views ? item.views : '0'}}</i>
										</view>
									</view>
								</view>
							</view>
						</li>
						<view v-if="applylist.length == 0" class="text-view1">
							<image style="width: 100upx;height: 100upx;" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/no-data.png" />
							<view style="color: #808080;">{{ main["no-data"] || "暂无数据" }}</view>
						</view>
					</ul>
				</scroll-view>
			</swiper-item>
		</swiper>
		
	</uni-base-page>
</template>

<script>
	// import utils from '@/common/js/index'
	export default{
		data(){
			return {
				activitylist:[],
				activityImgList:[],
				activityImgSrcList:[],
				applylist:[],
				applyImgList:[],
				applyImgSrcList:[],
				x: 300,
				y: 400,
				scale: 2,
				old: {
					x: 0,
					y: 0,
					scale: 2
				},
				ifHaveRecords: true,
				currentIndex: 0,
			}
		},
		computed: {
			main() {
				return this.$t("main");
			},
			manypage() {
				return this.$t('manypage');
			},
			title() {
				return this.$t("title")
			}
		},
		onReady() {
			this.$setTitle(this.title["my-acitis"])
		},
		methods:{
			onChange(e) {
				this.old.x = e.detail.x
				this.old.y = e.detail.y
			},
			//tab切换
			tabSwitch(index) {
				this.currentIndex = index;
				if (this.currentIndex === 0) {
					this.releaseList();
				}else{
					this.applyList();
				}
			},
			
			// swiperChange
			swiperChange(e) {
				this.currentIndex = e.detail.current;
				if (this.currentIndex === 0) {
					this.releaseList();
				}else{
					this.applyList();
				}
			},
			// 获取我已发布的活动列表
			releaseList(){
				this.$req.request({
					url: "/appActivity/app/getCurrentAppUserActivity",
					success: res => {
						if (res.code === 0){
							this.activitylist=res.data;
							this.activitylist.forEach(item => {
								let releaseTime = new Date(item.releaseTime);
								let month = releaseTime.getMonth() + 1; //月
								let date = releaseTime.getDate(); //日
								let day = releaseTime.getDay(); //周几
								let weeks = [this.$t("manypage.sunday"),
											this.$t("manypage.monday"), 
											this.$t("manypage.tuesday"), 
											this.$t("manypage.wednesday"), 
											this.$t("manypage.thursday"), 
											this.$t("manypage.friday"), 
											this.$t("manypage.saturday")];
								let week = weeks[day];
								item.releaseDate = month + "/" + date + " " + week;
							})		
							for (var i = 0; i < this.activitylist.length; i++) {
								this.activityImgList.push(this.getObjectKeys(this.activitylist[i].content.match(this.$regExp.imgRegExp)));
								this.activitylist[i].activityImgSrcList = this.activityImgList[i].join(",").replace(/src=/g, "").replace(/"/g, "").split(",").filter((activityObj, index) => {return activityObj});;
							}
						}
					},
				});
			},
			
			//获取我已报名的活动列表
			applyList(){
				this.$req.request({
					url: "/appActivity/app/getActivityByAppUserId",
					success: res => {
						if (res.code === 0){
							this.applylist=res.data;
							this.applylist.forEach(item => {
								let releaseTime = new Date(item.releaseTime);
								let month = releaseTime.getMonth() + 1; //月
								let date = releaseTime.getDate(); //日
								let day = releaseTime.getDay(); //周几
								let weeks = [this.$t("manypage.sunday"),
											this.$t("manypage.monday"), 
											this.$t("manypage.tuesday"), 
											this.$t("manypage.wednesday"), 
											this.$t("manypage.thursday"), 
											this.$t("manypage.friday"), 
											this.$t("manypage.saturday")];
								let week = weeks[day];
								item.releaseDate = month + "/" + date + " " + week;
							})		
							for (var i = 0; i < this.applylist.length; i++) {
								this.applyImgList.push(this.getObjectKeys(this.applylist[i].content.match(this.$regExp.imgRegExp)));
								this.applylist[i].applyImgSrcList = this.applyImgList[i].join(",").replace(/src=/g, "").replace(/"/g, "").split(",").filter((activityObj, index) => {return activityObj});;
							}
						}
					},
				});
			},
			
			//处理富文本框回来的数据
			getObjectKeys(object) {
				var values = [];
				for (var property in object)
					values.push(object[property]);
				return values;
			},
			// 跳转到我发布的活动详情
			releaseDetail(id){
				uni.navigateTo({
					url:"https://file.yuanzhoulvwego.com/prod/uploadFiles/pages/activitydetail/activitydetail?id=" + id + "&type=release"
				});
			},
			// 跳转到我报名的活动详情
			applyDetail(id){
				uni.navigateTo({
					url:"https://file.yuanzhoulvwego.com/prod/uploadFiles/pages/activitydetail/activitydetail?id=" + id + "&type=apply"
				});
			},
			goToact(){
				uni.navigateTo({
					url:"https://file.yuanzhoulvwego.com/prod/uploadFiles/pages/activity/activity?originatePage=1"
				});
			},
		},
		onShow() {
			this.releaseList();
			this.applyList()
		}
	}
</script>

<style lang="scss" scoped>
	.myact{
		width: 100%;
		background: #fff;
		.swiper-tab {
			width: 100%;
			height: 88upx;
			display: flex;
			align-items: center;
			position: absolute;
			background-color: #ffffff;
			.titleSel {
				color: #088b68;
				font-size: 32upx;
				width: 50%;
				display: block;
				text-align: center;
				align-items: center;
			}
			.titleUnsel {
				color: #666666;
				font-size: 32upx;
				width: 50%;
				display: block;
				text-align: center;
				align-items: center;
			}
			.headerLineSel {
				background: #088b68;
				height: 4upx;
				width: 30%;
				display: block;
				// align-items: center;
				margin-left: 10%;
				position: absolute;
				margin-top: 20upx;
				border: none;
			}
			.headerLineUnsel {
				background: #666666;
				height: 4upx;
				width: 30%;
				display: block;
				// align-items: center;
				margin-left: 10%;
				position: absolute;
				margin-top: 20upx;
				border: none;
			}
		}
		.swiper {
			width: 100%;
			padding: 0;
			position: absolute;
			top: 100upx;
			height: 90%;
			margin: 0 auto;
			background-color: #ffffff;
		}
		
		.release-scroll {
			height: 85%;
		}
		// .apply-list {
		// 	background-color: #f5f5f5;
			
		// }
		
		.apply-scroll {
			height: 100%;
		}
		movable-view {
			position: fixed;
			width: 70upx;
			height: 70upx;
		}
		
		movable-area {
			height: 100%;
			width: 100%;
			overflow: hidden;
		}
		
		.send {
			display: block;
			width: 70upx;
			height: 70upx;
		}
		ul{
			padding: 0;
		}
		li {
			border-bottom: 1px solid #eee;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			margin: 24upx 32upx;
			padding-bottom: 20upx;
			.title{
				overflow: hidden;
				display: -webkit-box;
				-webkit-box-orient:vertical;
				-webkit-line-clamp:2;
				font-size: 32upx;
				color: #000;
				line-height: 40upx;
				// font-weight: bold;
			}
			.width63{
				float: left;
				width: 63%;
				margin-left: 4%;
			}
			.width100{
				float: left;
				width: 100%;
			}
			.mess{
				color: #888;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
			.address56{
				color: #888;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
				width: 56%;
				float: left;
			}
			.address65{
				color: #888;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
				width: 65%;
				float: left;
			}
			.imgBox {
				display: flex;
				.picture {
					margin: 0upx 10upx;
					width: 200upx;
					height: 200upx;
					border: 1px solid #ccc;
					background-position: center center;
					background-size: cover;
					background-repeat: no-repeat;
				}
			}
		}
		.text-view1{
			width: 100%;
			text-align: center;
			margin-top: 40vh;
		}
	}
</style>
