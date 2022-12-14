<template>
	<view>
		<view class="product-box">
			<view class="product-image" style="height: 500upx;">
				<swiper class="swiper" indicator-dots="true" autoplay="true" :interval="interval"
					style="height: 500upx;">
					<swiper-item class="swiper-item" v-for="(swiperImg, index) in productImgList" :key="index">
						<image :src="swiperImg" mode="aspectFit" class="slide-image" style="height: 500upx;" />
					</swiper-item>
				</swiper>
			</view>
			<view class="product-main-title">{{ productObj.title }}</view>
			<view class="product-discout-title">{{ productObj.discountTitle }}</view>
			<view class="original-price" v-if="productObj.price">价格： <text
					style="text-decoration: line-through;">{{ productObj.price }}</text></view>
			<view class="share-source">{{ productObj.sourceName }} | {{ productObj.updateTime }}</view>
			<view class="product-lable">
				<text v-for="label in labelList">{{ label }}</text>
			</view>
			<view class="product-coupon" v-if="productObj.isCoupon == 1" @click="getCoupon(productObj.couponUrl)">
				<text style="font-size: 40upx;">优惠券</text>
				<text style="color: #E62828; float: right;font-size: 40upx;">领取</text>
			</view>
			<view class="product-content borderBottom1">
				<rich-text :nodes="productObj.content"></rich-text>
			</view>
			<five-mul-commentlist
				title="评论"
				:commentList="commentList"
				@commentDetails="commentDetails"
				@clickPraise="clickPraiseComment"
				@clickDelete="clickDeleteComment"
				@clickDeleteChild="clickDeleteCommentChild"
				@clickRecomment="clickRecomment"
				@clickRecommentChild="clickRecommentChild"
			></five-mul-commentlist>
			<five-comment ref="detailComment" @showbtnF="showbtnF" @sendComment="sendComment" :placeholder="placeholder"></five-comment>
		</view>
		
		<view v-if="showbtn" class="bottom-btn-view direct-url verticalCenter">
			<button @click="clickComment" class="verticalCenter" style="margin: 0;width: 30%;background-color: #FFFFFF;color: #000000;">
				<u-icon size="36" name="chat"></u-icon><text>{{totalCount}}</text>
			</button>
			<button style="width: 70%;margin: 0;" @click="getCoupon(productObj.detailUrl)">去购买（直达链接）</button>
		</view>
		<view class="height100"></view>
	</view>
</template>

<script>
	let currPage = 1;
	import fiveMulCommentlist from '@/components/five-mul-commentlist/five-mul-commentlist.vue'
	import fiveComment from '@/components/five-comment/five-comment.vue'
	import data from '@/data';
	import utils from '@/common/js/index'
	export default {
		components: {
			fiveMulCommentlist,
			fiveComment
		},
		data() {
			return {
				interval: 3000,
				productObj: {},
				productImgList: [],
				labelList: [],
				totalCount: 0,
				detailInfo: {},
				
				//评论组件相关
				placeholder: '请输入评论内容…',
				commentTargetId: 1,
				commentTargetType: 1,
				productObjId : null,
				commentList: [],
				id: null,
				showbtn: true
			}
		},
		onLoad(options) {
			this.url = 'https://oss.thinmoo.com';
			currPage = 1;
			let productObj = {};
			if (options.productId) {
				productObj.id = parseInt(options.productId);
				this.productObjId = productObj.id;
				this.id = this.productObjId;
				this.commentTargetId = this.productObjId;
			}
			if (options.clickOriginType) {
				// 点击推送消息进入详情
				productObj.clickOriginType = parseInt(options.clickOriginType);
			}
			this.getProductDetail(productObj);
			this.getComment(); //获取评论列表
			/*
			if (options.productId) {
				let productStr = options.productId;
				let productObj = {};
				if (productStr.indexOf("-") !== -1) {
					// 通过推送点击商品推广，跳转到商品详情
					productObj = {
						"id": parseInt(productStr.split("-")[0]),
						"clickOriginType": parseInt(productStr.split("-")[1].split("=")[1])
					};
				} else {
					// 用户通过首页点击新闻，跳转到新闻详情
					productObj.id = parseInt(productStr);
				}
				this.getProductDetail(productObj);
			}
			*/
		},

		onShow() {
			// this.getComment()
		},
		methods: {
			showbtnF() {
				console.log(111)
				this.showbtn = true;
			},
			/*跳转评论详情*/
			commentDetails(item) {
				uni.navigateTo({
					url: './comment-details?index=' + item.id
				})
			},
			/*监听触底*/
			onReachBottom() {
				console.log('监听触底')
				this.getComment(); //获取评论列表
			},
			
			/**
			 * 回复评论的评论
			 * @param {Object} item
			 */
			clickRecommentChild(item) {
				console.log('回复评论的评论')
				this.$refs.detailComment.open();
				this.placeholder = '回复' + item.commentUserNickname + ':';
			},
			/**
			 * 发送评论
			 * @param {Object} result
			 */
			sendComment(result) {
				this.showbtn = true;
				let params = {
					commentTargetId: this.commentTargetId,
					commentTargetType: this.commentTargetType, //评论目标类型（1.推广 2.新闻 3.评论，4.回复）
					content: result
				}
				if(result !=""){
					this.$req.request({
						url: "/omComment/app/comment",
						data: params,
						success: res => {
							console.log(res)
							this.$showToast(res.msg)
							if( res.code === 0 ) {
								currPage = 1;
								this.commentList = []
								this.getComment()
							}
						}
					});
				}else{
					this.$showToast(this.$t("manypage")["noCan"] || "评论内容不能为空");
					this.showbtn = true;		
				}
			},
			/*评论管理-获取评论列表*/
			getComment() {
				let pageSize = 5;
				let params = {
					pid: this.id, //评论对象ID(推广链接ID,新闻Id)
					commentTargetType: 1, //评论目标类型（1.推广 2.新闻 3.评论，4.回复）
					ascs: 'id', //升序字段【使用列表中返回的字段进行排序】
					descs: 'createTime',
					currPage: currPage, //当前页数
					pageSize: pageSize //每页记录数
				}
				this.$req.request({
					url: "/omComment/app/list",
					data: params,
					success: res => {
						if(res.code == 0) {
							this.showbtn = true;
							this.totalCount = res.data.totalCount
							if( res.data.list.length > 0 ) {
								currPage++;
								this.commentList = this.commentList.concat(res.data.list) 
								this.commentList.forEach( item => {
									item.num = 3;
									item.createTime = utils.fromCurrentTime(item.createTime)
									if( item.commentUserAvatar ) {
										item.commentUserAvatar = this.url + item.commentUserAvatar
									}
								})
								// console.log(this.commentList)
							}
						}
					}
				});
			},
			
			/**
			 * 格式化发布日期
			 * @param {Object} dateString
			 */
			formateDate(dateString) {
				dateString = parseInt(dateString) * 1000;
				let date = new Date(dateString);
				let formatStr = dateUtils.dateFormat('YYYY年mm月dd日 HH:MM:SS', date);
				return formatStr;
			},
			
			/**
			 * 评论
			 */
			clickComment() {
				this.commentTargetId = this.productObjId;
				this.commentTargetType = 1;
				console.log('评论')
				this.showbtn = false;
				this.$refs.detailComment.open();
			},
			/**
			 * 回复 评论
			 * @param {Object} item
			 */
			clickRecomment(item) {
				this.$refs.detailComment.open();
				this.commentTargetType = 3;
				this.commentTargetId = item.id;
				this.showbtn = false;
				console.log('回复 评论')
				this.placeholder = '回复' + item.commentUserNickname + ':';
			},
			/**
			 * 点赞多级评论
			 * @param {Object} item
			 */
			clickPraiseComment(item) {
				//只能点赞不能取消
				if (item.IS_PRAISE == '1') {
					return;
				}
				let params = {
					likeTargetId: item.id,
					likeTargetType: 3 //点赞目标类型（3.评论，4.回复）
				}
				console.log('点赞')
				this.like(params,item)
			},
			like(params,item) {
				this.$req.request({
					url: "/omComment/app/like",
					data: params,
					success: res => {
						console.log('zsx1',res)
						if(res.code == 0) {
							item.IS_PRAISE = '1';
							item.likes++;
						}
					}
				});
			},
			
			// 获取商品详情
			getProductDetail(productObj) {
				this.$showLog("productObj", productObj);
				this.$req.request({
					url: "/omProductTgLink/app/getById",
					data: productObj,
					success: res => {
						this.productObj = res.data;
						this.productImgList = this.productObj.images.split(",");
						this.labelList = this.productObj.labels.split(",");
					}
				});
			},

			// 跳转到优惠券页面
			getCoupon(couponUrl) {
				this.$showLog("购物链接", couponUrl);
				// #ifdef APP-PLUS
				let url = couponUrl, openUrl = couponUrl, source = this.productObj.source;
				this.$showLog("类型", source, "product-detail.vue");
				
				if (source === 1) {
					// 跳转到京东
					// 按照打开淘宝的方式打开京东，会出现无法跳转到对应的商品链接的问题
					// 这里需要添加上参数，这样就能够正确跳转，这个方法是在uni-app社区看到的
					if (url.substr(0, 5) === "https") {
						url = url.substr(8);
					} else if (url.substr(0, 4) === "http") {
						url = url.substr(7);
					}
					let data = {
						"category": "jump",
						"des": "getCoupon",
						"url": url
					};
					openUrl = `openApp.jdMobile://virtual?params=${JSON.stringify(data)}`;
					this.$showLog("openUrl", openUrl, "product-detail.vue");
					this.$showLog("couponUrl", couponUrl, "product-detail.vue");
					if (plus.runtime.isApplicationExist({
							pname: "com.jingdong.app.mall",
							action: "openApp.jdMobile://"
						})) {
							// 已经安装京东APP
							plus.runtime.openURL(encodeURI(openUrl), (res) => {
								plus.runtime.openURL(couponUrl, (errInfo) => {
									this.$showLog("在已经安装京东APP的情况下打开京东APP失败，打开链接也失败的情况下的错误信息", errInfo);
								});
							});
					} else {
						// 未安装京东APP
						plus.runtime.openURL(couponUrl, (errInfo) => {
							this.$showLog("在未安装京东APP的情况下打开京东APP失败，打开链接也失败的情况下的错误信息", errInfo);
						});
					}
					
				} else if (source === 2) {
					// 跳转到拼多多
					// this.$showLog("类型", url, "product-detail.vue");
					if (openUrl.indexOf("mobile.yangkeduo.com") > -1 && this.$platformObj.isAndroid()) {
						// 推广链接为长链接，在安卓，将链接的https改成pinduoduo，则可以直接打开拼多多APP
						openUrl = "pinduoduo://" + url;
						plus.runtime.openURL(openUrl, function(res) {
							uni.showModal({
								content: '本机未检测到对应客户端，是否打开浏览器访问页面？',
								success: function(res) {
									if (res.confirm) {
										plus.runtime.openURL(url);
									}
								}
							});
						});
					}
					
				}else if( source === 3 ) {
					//跳转到淘宝
					if (url.substr(0, 5) === 'https') {
						openUrl = `taobao://${url.substr(8)}`;
					} else if (url.substr(0, 4) === 'http') {
						openUrl = `taobao://${url.substr(7)}`;
					}
					plus.runtime.openURL(openUrl, function(res) {
						uni.showModal({
							content: '本机未检测到对应客户端，是否打开浏览器访问页面？',
							success: function(res) {
								if (res.confirm) {
									plus.runtime.openURL(url);
								}
							}
						});
					});
				}
				// #endif

				// #ifndef APP-PLUS
				this.$showToast("暂不支持此功能，请前往APP版达管家体验");
				// #endif
			}
		}

		
	}
</script>

<style>
	.header-name {
		display: flex;
		align-items: center;
	}
	.product-box {
		margin: 0 30upx;
		width: 690upx;
	}

	.product-image {
		width: 100%;
	}

	.swiper image {
		width: 100%;
	}

	.product-main-title {
		margin-top: 30upx;
		font-weight: 700;
		font-size: 34upx;
	}

	.product-discout-title {
		color: #e62828;
		font-size: 34upx;
		font-weight: 400;
	}

	.original-price {
		font-size: 28upx;
		color: #999999;
	}

	.share-source {
		font-size: 24upx;
		color: #999999;
	}

	.product-coupon {
		margin: 20upx 0;
		background-color: #F5F5F5;
		padding: 24upx 20upx;
		color: #999999;
		font-size: 28upx;
		overflow: hidden;
		font-weight: 400;
		border-left: 24upx solid #e62828;
	}

	.product-lable {
		margin-top: 30upx;
	}

	.product-lable text {
		background-color: #F5F5F5;
		padding: 8upx;
		border-radius: 5upx;
		color: #999999;
		font-size: 24upx;
		margin: 0 10upx;
	}
	.direct-url {
		box-shadow: 0 0 5px 1px #999    
	}
	.direct-url button {
		border-radius: 0;
		padding: 8upx;
		background-color: #E62828;
		color: #FFFFFF;
		font-size: 30upx;
	}
	.direct-url button::after { border: none }
	.product-content {
		margin: 20upx 0 30upx 0;
	}
</style>
