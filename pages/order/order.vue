<template>
	<view class="content">
		<view class="navbar">
			<view v-for="(item, index) in navList" :key="index" class="nav-item"
				:class="{current: tabCurrentIndex === index}" @click="tabClick(index,item.state)">
				{{item.text}}
			</view>
		</view>

		<swiper :current="tabCurrentIndex" class="swiper-box" duration="300" @change="changeTab">
			<swiper-item class="tab-content" v-for="(tabItem,tabIndex) in navList" :key="tabIndex">
				<scroll-view class="list-scroll-content" scroll-y >
					<!-- 空白页 -->
					<empty v-if="tabItem.loaded === true && tabItem.orderList.length === 0"></empty>
					
					<!-- 订单列表 -->
					<block v-for="(item,index) in tabItem.orderList" :key="index">
						<view class="order-item">
							<view class="top">
								<text>{{item.inputTime}}</text>
								<text style="color: #ff0000;">{{item.orderStatusName}}</text>
							</view>
							
							<view class="goods-box" @click="ddmx(item.orderID,tabItem.orderStatus)">
								<view class="goods-item">
									<image class="goods-img" :src="item.iconUrl" mode="aspectFill"></image>
								</view>
								
								<view class="right title">
									<view class="title ellipsis">{{item.spName}}</view>
									<view class="title_text ellipsis">{{item.remark}}</view>
								</view>
							</view>						
													
							<view class="price-box">
								共
								<text class="num">{{item.num}}</text>
								件商品 实付款
								<text class="price">{{item.money}}</text>
							</view>
							
							<view class="action-box b-t" v-if="item.orderStatus == 1">
								<button class="action-btn" @click="deleteOrder(index,item.orderID)">删除订单</button>
								<button class="action-btn recom" @click="orderToPay(item.orderID)">立即支付</button>
							</view>
						</view>
					</block>
					
					<uni-load-more :status="tabItem.loadingType"></uni-load-more>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	import empty from "@/components/empty";

	export default {
		components: {
			empty
		},
		data() {
			return {
				code:"",
				openid:"",
				iswx: false,
				ddztid: 0,
				userid: uni.getStorageSync('userid'),
				tabCurrentIndex: 0,
				navList: [
					{
						state: 0,
						text: '全部',
						loadingType: 'more',
						orderList: []
					},
					{
						state: 1,
						text: '待付款',
						loadingType: 'more',
						orderList: []
					},
					{
						state: 3,
						text: '已付款',
						loadingType: 'more',
						orderList: []
					},
					{
						state: 7,
						text: '已发货',
						loadingType: 'more',
						orderList: []
					}
				],
			};
		},

		onLoad(options) {
			if(options.state==1){
				this.tabCurrentIndex=0;
			}
			else if(options.state==3){
				this.tabCurrentIndex=1;
			}
			else if(options.state==19){
				this.tabCurrentIndex=2;
			}
			else if(options.state==-7){
				this.tabCurrentIndex=3;
			}
			else{
				this.tabCurrentIndex=0;
			}
				
			this.loadData()
		},

		methods: {
			//获取订单列表
			loadData(source) {
				//这里是将订单挂载到tab列表下
				let index = this.tabCurrentIndex;
				let navItem = this.navList[index];
				let state = navItem.state;				

				if (source === 'tabChange' && navItem.loaded === true) {
					//tab切换只有第一次需要加载数据
					return;
				}
				if (navItem.loadingType === 'loading') {
					
					//防止重复加载
					return false;
				}

				navItem.loadingType = 'loading';

				setTimeout(() => {						
					this.$http("shangPinOrderListUser",JSON.stringify({
							token:uni.getStorageSync("token"),
							orderStatus: state,
							pg:'0'
						})).then(res=>{
							if (res.data.code == 0) {
								
								let orderList = res.data.shangPinOrderList.datas;
								orderList.forEach(item => {
									item.state === state;
									navItem.orderList.push(item);
									
								})
								this.$set(navItem, 'loaded', true);
								navItem.loadingType = 'noMore';
							}
							else if(res.data.code == 99){
								uni.showModal({
								    content: "请先登录",
								    success: (e)=>{
								    	if(e.confirm){
											uni.clearStorage();				    		
								    		setTimeout(()=>{
								    			uni.redirectTo({
								    				url:"../public/login"
								    			})
								    		}, 200)
								    	}
								    }
								});
							}
							else{
								uni.showToast({
									title: res.data.msg,
									icon: 'none'
								});
							}
						}).catch(err=>{
							console.log(err);
						})													
				}, 600);
				
			},
			orderToPay(ddid){
				uni.redirectTo({
					url:'./orderjs?ddid='+ddid
				})	
			},
			
			//获取地址栏参数
			getQueryString(name) {
				let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
				let reg_rewrite = new RegExp("(^|/)" + name + "/([^/]*)(/|$)", "i");
				let r = window.location.search.substr(1).match(reg);
				let q = window.location.pathname.substr(1).match(reg_rewrite);
				if (r != null) {
					return unescape(r[2]);
				} else if (q != null) {
					return unescape(q[2]);
				} else {
					return null;
				}
			},

			//swiper 切换
			changeTab(e) {
				this.tabCurrentIndex = e.target.current;
				this.loadData('tabChange');
			},
			
			//顶部tab点击
			tabClick(index, state) {				
				this.tabCurrentIndex = index;
				this.ddztid = state;
			},
			
			//删除订单
			deleteOrder(index, item) {
				var that = this;
				uni.showModal({
					title: '提示',
					content: '确定删除吗',
					success: function(res) {
						if (res.confirm) {
							that.$http("shangPinOrderDel",JSON.stringify({
									token:uni.getStorageSync("token"),
									orderID: item
								})).then(res=>{
									if (res.data.code == 0) {
										uni.showToast({
											title: res.data.msg,
											icon: "none"
										})
										setTimeout(() => {
											uni.redirectTo({
												url:'./order?state=0'
											})
										}, 600)
									} else {
										uni.showToast({
											title: res.data.msg,
											icon: "none"
										})
									}
								}).catch(err=>{
									console.log(err);
								})
							
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			ddmx(ddid,state){
				console.log(ddid,state);
				uni.navigateTo({
					url:"./ddmx?ddid="+ddid+"&state="+state
				})
			}

		},
	}
</script>

<style lang="scss">
page, .content {
	background: $page-color-base;
	height: 100%;
}

.swiper-box {
	height: calc(100% - 40px);
}

.list-scroll-content {
	height: 100%;
}

.navbar {
	display: flex;
	height: 40px;
	padding: 0 5px;
	background: #fff;
	box-shadow: 0 1px 5px rgba(0, 0, 0, .06);
	position: relative;
	z-index: 10;

	.nav-item {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		font-size: 15px;
		color: $font-color-dark;
		position: relative;

		&.current {
			color: $base-color;

			&:after {
				content: '';
				position: absolute;
				left: 50%;
				bottom: 0;
				transform: translateX(-50%);
				width: 44px;
				height: 0;
				border-bottom: 2px solid $base-color;
			}
		}
	}
}

.uni-swiper-item {
	height: auto;
}

.order-item {
	padding: 0 20rpx;
	background: #fff;
	margin: 16rpx 20rpx;
	border-radius: 10rpx;
	
	.top{
		padding-top: 20rpx;
		color: #909399;
		font-size: 26rpx;
		display: flex;
		justify-content: space-between;
	}

	/* 多条商品 */
	.goods-box {
		height: 160upx;
		padding: 20upx 0;
		display: flex;

		.goods-item {
			width: 120upx;
			height: 120upx;
			margin-right: 24upx;
		}

		.goods-img {
			width: 100%;
			height: 100%;
			border-radius: 10rpx;
		}
	}

	.right {
		width: 80%;

		.title {
			font-size: $font-base + 2upx;
			color: $font-color-dark;
		}
		
		.title_text{
			font-size: $font-base + 2upx;
			color: #909399;
			margin-top: 40rpx;
		}
	}
	
	.price-box {
		display: flex;
		justify-content: flex-end;
		align-items: baseline;
		padding-bottom: 20upx;
		font-size: 26upx;
		color: #909399;

		.num {
			margin: 0 8upx;
			color: $font-color-dark;
		}

		.price {
			font-size: $font-lg;
			color: $font-color-dark;

			&:before {
				content: '￥';
				font-size: $font-sm;
				margin: 0 2upx 0 8upx;
			}
		}
	}

	.action-box {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		height: 100upx;
		position: relative;
	}

	.action-btn {
		width: 160upx;
		height: 60upx;
		margin: 0;
		margin-left: 24upx;
		padding: 0;
		text-align: center;
		line-height: 60upx;
		font-size: $font-sm + 2upx;
		color: $font-color-dark;
		background: #fff;
		border-radius: 100px;

		&:after {
			border-radius: 100px;
		}

		&.recom {
			background: #fff9f9;
			color: $base-color;

			&:after {
				border-color: #f7bcc8;
			}
		}
	}
}
/* load-more */
.uni-load-more {
	display: flex;
	flex-direction: row;
	height: 80upx;
	align-items: center;
	justify-content: center
}

.uni-load-more__text {
	font-size: 28upx;
	color: #999
}

.uni-load-more__img {
	height: 24px;
	width: 24px;
	margin-right: 10px
}

.uni-load-more__img>view {
	position: absolute
}

.uni-load-more__img>view view {
	width: 6px;
	height: 2px;
	border-top-left-radius: 1px;
	border-bottom-left-radius: 1px;
	background: #999;
	position: absolute;
	opacity: .2;
	transform-origin: 50%;
	animation: load 1.56s ease infinite
}

.uni-load-more__img>view view:nth-child(1) {
	transform: rotate(90deg);
	top: 2px;
	left: 9px
}

.uni-load-more__img>view view:nth-child(2) {
	transform: rotate(180deg);
	top: 11px;
	right: 0
}

.uni-load-more__img>view view:nth-child(3) {
	transform: rotate(270deg);
	bottom: 2px;
	left: 9px
}

.uni-load-more__img>view view:nth-child(4) {
	top: 11px;
	left: 0
}

.load1,
.load2,
.load3 {
	height: 24px;
	width: 24px
}

.load2 {
	transform: rotate(30deg)
}

.load3 {
	transform: rotate(60deg)
}

.load1 view:nth-child(1) {
	animation-delay: 0s
}

.load2 view:nth-child(1) {
	animation-delay: .13s
}

.load3 view:nth-child(1) {
	animation-delay: .26s
}

.load1 view:nth-child(2) {
	animation-delay: .39s
}

.load2 view:nth-child(2) {
	animation-delay: .52s
}

.load3 view:nth-child(2) {
	animation-delay: .65s
}

.load1 view:nth-child(3) {
	animation-delay: .78s
}

.load2 view:nth-child(3) {
	animation-delay: .91s
}

.load3 view:nth-child(3) {
	animation-delay: 1.04s
}

.load1 view:nth-child(4) {
	animation-delay: 1.17s
}

.load2 view:nth-child(4) {
	animation-delay: 1.3s
}

.load3 view:nth-child(4) {
	animation-delay: 1.43s
}

@-webkit-keyframes load {
	0% {
		opacity: 1
	}

	100% {
		opacity: .2
	}
}
.ellipsis{
	overflow:hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	-o-text-overflow:ellipsis;
}
</style>
