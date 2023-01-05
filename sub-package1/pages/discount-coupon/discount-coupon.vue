<template>
	<uni-base-page style="background: rgb(239,239,244);width: 100%;">
		<view class="dis-coupon">
			<view class="swiper-tab">
				<view :class="currentIndex == 0 ? 'titleSel' : 'titleUnsel'" @click="tabSwitch(0)">
					<text>{{ coupon["all"] || "全部" }}</text>
					<span v-if="num == 0">({{ totalCount }})</span>
					<hr :class="currentIndex == 0 ? 'headerLineSel' : 'headerLineUnsel'" />
				</view>
				<view :class="currentIndex == 1 ? 'titleSel' : 'titleUnsel'" @click="tabSwitch(1)">
					<text>{{ coupon["used"] || "已使用" }}</text>
					<span v-if="num == 1">({{ totalCount }})</span>
					<hr :class="currentIndex == 1 ? 'headerLineSel' : 'headerLineUnsel'" />
				</view>
				<view :class="currentIndex == 2 ? 'titleSel' : 'titleUnsel'" @click="tabSwitch(2)">
					<text>{{ coupon["unused"] || "未使用" }}</text>
					<span v-if="num == 2">({{ totalCount }})</span>
					<hr :class="currentIndex == 2 ? 'headerLineSel' : 'headerLineUnsel'" />
				</view>
				<view :class="currentIndex == 3 ? 'titleSel' : 'titleUnsel'" @click="tabSwitch(3)">
					<text>{{ coupon["lost"] || "已失效" }}</text>
					<span v-if="num == 3">({{ totalCount }})</span>
					<hr :class="currentIndex == 3 ? 'headerLineSel' : 'headerLineUnsel'" />
				</view>
			</view>
			<!-- 内容布局 -->
			<swiper class="swiper" :current="currentIndex" @change="swiperChange">
				<!-- 全部 -->
				<swiper-item class="all-type">
					<view class="search-box" @tap.stop>
						<u-icon name="search"></u-icon>
						<input type="text" confirm-type="search" @confirm="onSearch" class="search" v-model="searchVal" :placeholder="`${coupon['coupon-placeholder']}` || '请输入车牌号'"/>
						<image v-show="searchVal" @tap="clearSearch" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/search-del.png" style="width: 30upx;height: 30upx;" mode=""></image>
					</view>
					<scroll-view scroll-y class="discount-scroll" @scrolltolower="scroll">
						<ul>
							<li class="clear" v-for="(item, index) in discountList" :key="item.id">
								<view class="dis-left fl">
									<view class="money" v-if="item.disType == 1">￥{{ item.disAmont }}</view>
									<view class="money" v-else-if="item.disType == 2">{{ item.disRate *10 }}折</view>
									<view class="money" v-else-if="item.disType == 3">{{item.disTimeSec/60/60}}{{ coupon["hours"] || "小时" }}</view>
									<!-- <view class="money" v-else="item.disType == 4">￥{{item.disAmontLimit}}</view> -->
									<view class="money" v-else><image class="opacity" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/free.png"></image></view>
									<view class="template-id">{{ coupon["template-id"] || "模板ID" }}:{{ item.templateId }}</view>
								</view>
								<view class="dis-right fl">
									<view class="park" v-if="item.disType == 1">{{ coupon["money"] || "金额代金券" }}</view>
									<view class="park" v-else-if="item.disType == 2">{{ coupon["discount"] || "折扣代金券" }}</view>
									<view class="park" v-else-if="item.disType == 3">{{ coupon["time"] || "时间代金券" }}</view>
									<view class="park" v-else>{{ coupon["full"] || "全额代金券" }}</view>
									<view class="plate-number">{{ coupon["plate-number"] || "车牌号" }}：{{ item.owner }}</view>
									<view class="time" v-if="item.invaildTime">{{ coupon["validity"] || "有效期" }}：{{ item.invaildTime }}</view>
									<view class="time" v-else>{{ coupon["validity"] || "有效期" }}：{{ coupon["perpetual"] || "永久" }}</view>
								</view>
								<view class="use-type" v-if="item.useType == 1">{{ coupon["once"] || "仅限一次使用" }}</view>
								<view class="use-type" v-else-if="item.useType == 2">{{ coupon["more"] || "可多次使用" }}</view>
								<image v-if="item.isInvaild == 1" class="lose-img" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/lose.png"></image>
								<image v-if="item.isUse == 1" class="used-img" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/uesd.png"></image>
							</li>
						</ul>
					</scroll-view>
				</swiper-item>
				<!-- 已使用 -->
				<swiper-item class="used">
					<view class="search-box" @tap.stop>
						<u-icon name="search"></u-icon>
						<input type="text" confirm-type="search" @confirm="onSearch" class="search" v-model="searchVal" :placeholder="`${coupon['coupon-placeholder']}` || '请输入车牌号'"/>
						<image v-show="searchVal" @tap="clearSearch" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/search-del.png" style="width: 30upx;height: 30upx;" mode=""></image>
					</view>
					<scroll-view scroll-y class="discount-scroll" @scrolltolower="scroll">
						<ul>
							<li class="clear" v-for="(item, index) in discountList" :key="item.id">
								<view class="dis-left fl">
									<view class="money" v-if="item.disType == 1">￥{{ item.disAmont }}</view>
									<view class="money" v-else-if="item.disType == 2">{{ item.disRate }}折</view>
									<view class="money" v-else-if="item.disType == 3">{{item.disTimeSec/60/60}}{{ coupon["hours"] || "小时" }}</view>
									<!-- <view class="money" v-else="item.disType == 4">￥{{item.disAmontLimit}}</view> -->
									<view class="money" v-else><image class="opacity" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/free.png"></image></view>
									<view class="template-id">{{ coupon["template-id"] || "模板ID" }}:{{ item.templateId }}</view>
								</view>
								<view class="dis-right fl">
									<view class="park" v-if="item.disType == 1">{{ coupon["money"] || "金额代金券" }}</view>
									<view class="park" v-else-if="item.disType == 2">{{ coupon["discount"] || "折扣代金券" }}</view>
									<view class="park" v-else-if="item.disType == 3">{{ coupon["time"] || "时间代金券" }}</view>
									<view class="park" v-else>{{ coupon["full"] || "全额代金券" }}</view>
									<view class="plate-number">{{ coupon["plate-number"] || "车牌号" }}：{{ item.owner }}</view>
									<view class="time" v-if="item.invaildTime">{{ coupon["validity"] || "有效期" }}：{{ item.invaildTime }}</view>
									<view class="time" v-else>{{ coupon["validity"] || "有效期" }}：{{ coupon["perpetual"] || "永久" }}</view>
								</view>
								<view class="use-type" v-if="item.useType == 1">{{ coupon["once"] || "仅限一次使用" }}</view>
								<view class="use-type" v-else-if="item.useType == 2">{{ coupon["more"] || "可多次使用" }}</view>
								<image v-if="item.isInvaild == 1" class="lose-img" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/lose.png"></image>
								<image v-if="item.isUse == 1" class="used-img" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/uesd.png"></image>
							</li>
						</ul>
					</scroll-view>
				</swiper-item>
				<!-- 未使用 -->
				<swiper-item class="noused">
					<view class="search-box" @tap.stop>
						<u-icon name="search"></u-icon>
						<input type="text" confirm-type="search" @confirm="onSearch" class="search" v-model="searchVal" :placeholder="`${coupon['coupon-placeholder']}` || '请输入车牌号'"/>
						<image v-show="searchVal" @tap="clearSearch" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/search-del.png" style="width: 30upx;height: 30upx;" mode=""></image>
					</view>
					<scroll-view scroll-y class="discount-scroll" @scrolltolower="scroll">
						<ul>
							<li class="clear" v-for="(item, index) in discountList" :key="item.id">
								<view class="dis-left fl">
									<view class="money" v-if="item.disType == 1">￥{{ item.disAmont }}</view>
									<view class="money" v-else-if="item.disType == 2">{{ item.disRate }}折</view>
									<view class="money" v-else-if="item.disType == 3">{{item.disTimeSec/60/60}}{{ coupon["hours"] || "小时" }}</view>
									<!-- <view class="money" v-else="item.disType == 4">￥{{item.disAmontLimit}}</view> -->
									<view class="money" v-else><image class="opacity" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/free.png"></image></view>
									<view class="template-id">{{ coupon["template-id"] || "模板ID" }}:{{ item.templateId }}</view>
								</view>
								<view class="dis-right fl">
									<view class="park" v-if="item.disType == 1">{{ coupon["money"] || "金额代金券" }}</view>
									<view class="park" v-else-if="item.disType == 2">{{ coupon["discount"] || "折扣代金券" }}</view>
									<view class="park" v-else-if="item.disType == 3">{{ coupon["time"] || "时间代金券" }}</view>
									<view class="park" v-else>{{ coupon["full"] || "全额代金券" }}</view>
									<view class="plate-number">{{ coupon["plate-number"] || "车牌号" }}：{{ item.owner }}</view>
									<view class="time" v-if="item.invaildTime">{{ coupon["validity"] || "有效期" }}：{{ item.invaildTime }}</view>
									<view class="time" v-else>{{ coupon["validity"] || "有效期" }}：{{ coupon["perpetual"] || "永久" }}</view>
								</view>
								<view class="use-type" v-if="item.useType == 1">{{ coupon["once"] || "仅限一次使用" }}</view>
								<view class="use-type" v-else-if="item.useType == 2">{{ coupon["more"] || "可多次使用" }}</view>
								<image v-if="item.isInvaild == 1" class="lose-img" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/lose.png"></image>
								<image v-if="item.isUse == 1" class="used-img" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/uesd.png"></image>
							</li>
						</ul>
					</scroll-view>
				</swiper-item>
				<!-- 已失效 -->
				<swiper-item class="lose">
					<view class="search-box" @tap.stop>
						<u-icon name="search"></u-icon>
						<input type="text" confirm-type="search" @confirm="onSearch" class="search" v-model="searchVal" :placeholder="`${coupon['coupon-placeholder']}` || '请输入车牌号'"/>
						<image v-show="searchVal" @tap="clearSearch" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/search-del.png" style="width: 30upx;height: 30upx;" mode=""></image>
					</view>
					<scroll-view scroll-y class="discount-scroll" @scrolltolower="scroll">
						<ul>
							<li class="clear" v-for="(item, index) in discountList" :key="item.id">
								<view class="dis-left fl">
									<view class="money" v-if="item.disType == 1">￥{{ item.disAmont }}</view>
									<view class="money" v-else-if="item.disType == 2">{{ item.disRate }}折</view>
									<view class="money" v-else-if="item.disType == 3">{{item.disTimeSec/60/60}}{{ coupon["hours"] || "小时" }}</view>
									<!-- <view class="money" v-else="item.disType == 4">￥{{item.disAmontLimit}}</view> -->
									<view class="money" v-else><image class="opacity" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/free.png"></image></view>
									<view class="template-id">{{ coupon["template-id"] || "模板ID" }}:{{ item.templateId }}</view>
								</view>
								<view class="dis-right fl">
									<view class="park" v-if="item.disType == 1">{{ coupon["money"] || "金额代金券" }}</view>
									<view class="park" v-else-if="item.disType == 2">{{ coupon["discount"] || "折扣代金券" }}</view>
									<view class="park" v-else-if="item.disType == 3">{{ coupon["time"] || "时间代金券" }}</view>
									<view class="park" v-else>{{ coupon["full"] || "全额代金券" }}</view>
									<view class="plate-number">{{ coupon["plate-number"] || "车牌号" }}：{{ item.owner }}</view>
									<view class="time" v-if="item.invaildTime">{{ coupon["validity"] || "有效期" }}：{{ item.invaildTime }}</view>
									<view class="time" v-else>{{ coupon["validity"] || "有效期" }}：{{ coupon["perpetual"] || "永久" }}</view>
								</view>
								<view class="use-type" v-if="item.useType == 1">{{ coupon["once"] || "仅限一次使用" }}</view>
								<view class="use-type" v-else-if="item.useType == 2">{{ coupon["more"] || "可多次使用" }}</view>
								<image v-if="item.isInvaild == 1" class="lose-img" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/lose.png"></image>
								<image v-if="item.isUse == 1" class="used-img" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/uesd.png"></image>
							</li>
						</ul>
					</scroll-view>
				</swiper-item>
			</swiper>
		</view>
	</uni-base-page>
</template>

<script>
let currPage = 1;
export default {
	data() {
		return {
			currentIndex: 0,
			discountList: [],
			searchVal: '',  //搜索需要传的字段
			discountlength: '',
			isUse: '',      //已使用需要传的字段
			isInvaild: '',  //已失效需要传的字段
			totalCount: '',
			num: 0, //当前下标
			allTotalCount: '', //全部的优惠券数量
			usedTotalCount: '', //已使用的优惠券数量
			nouseTotalCount: '', //未使用的优惠券数量
			loseTotalCount: '', //已失效的优惠券数量
			getMore: false
		};
	},
	computed:{
		coupon() {
			return this.$t("coupon")
		}
	},
	// onReady() {
	// 	this.$setTitle(this.title["repair"]);
	// },
	onLoad(options) {},

	onShow() {
		currPage = 1;
		this.isUse = null;
		this.isInvaild = null;
		this.getDiscountList();
	},

	methods: {
		//tab切换
		tabSwitch(index) {
			this.currentIndex = index;
			if (this.currentIndex == 0) {
				currPage = 1;
				this.discountList = [];
				this.isUse = null;
				// this.getDiscountList();
			} else if (this.currentIndex == 1) {
				currPage = 1;
				this.discountList = [];
				this.isUse = true;
				// this.getDiscountList();
			} else if (this.currentIndex == 2) {
				currPage = 1;
				this.discountList = [];
				this.isUse = false;
				// this.getDiscountList();
			} else {
				currPage = 1;
				this.discountList = [];
				this.isInvaild = true;
				// this.getDiscountList();
			}
		},

		// swiperChange
		swiperChange(e) {
			this.num = e.detail.current;
			this.totalCount=''
			this.currentIndex = e.detail.current;
			if (this.currentIndex == 0) {
				currPage = 1;
				this.discountList = [];
				this.isUse = null;
				this.isInvaild = null;
				if(this.searchVal){
					this.getDiscountList(this.searchVal);
				}else{
					this.getDiscountList();
				}
				// this.getDiscountList();
			} else if (this.currentIndex == 1) {
				currPage = 1;
				this.discountList = [];
				this.isUse = true;
				this.isInvaild = null;
				if(this.searchVal){
					this.getDiscountList(this.searchVal);
				}else{
					this.getDiscountList();
				}
				// this.getDiscountList();
			} else if (this.currentIndex == 2) {
				currPage = 1;
				this.discountList = [];
				this.isUse = false;
				this.isInvaild = null;
				if(this.searchVal){
					this.getDiscountList(this.searchVal);
				}else{
					this.getDiscountList();
				}
				// this.getDiscountList();
			} else {
				currPage = 1;
				this.discountList = [];
				this.isInvaild = true;
				this.isUse = null;
				if(this.searchVal){
					this.getDiscountList(this.searchVal);
				}else{
					this.getDiscountList();
				}
				// this.getDiscountList();
			}
		},
		// 键盘搜索
		onSearch() {
			this.discountList = [];
			currPage = 1;
			this.getDiscountList(this.searchVal);
			// 收起键盘
			uni.hideKeyboard();
		},
		// 清除搜索框
		clearSearch() {
			currPage = 1;
			this.searchVal = '';
			this.discountList = [];
			this.getDiscountList();
		},
		// 获取优惠券列表
		getDiscountList(searchVal) {
			let params = {
				pageSize: 10,
				currPage: currPage,
				communityId: this.$getUserInfo().currentCommunity.id,
				isUse: this.isUse,
				owner: searchVal,
				isInvaild: this.isInvaild
			};
			if (params.isUse == null) {
				delete params.isUse;
			}
			if (params.owner == null) {
				delete params.owner;
			}
			if (params.isInvaild == null) {
				delete params.isInvaild;
			}
			this.$req.request({
				url: '/prefCoupon/app/list',
				method: 'POST',
				data: params,
				isShowLoading: false, // 值为false时，不显示uni.showLoading
				success: res => {
					if (res.code === 0) {
							currPage++;
							this.discountList = this.discountList.concat(res.data.list);
						if(res.data.totalCount==0){
							this.totalCount = "0"
						}else{
							this.totalCount = res.data.totalCount; //总条数
						}
					}
				}
			});
		},
		//滚动到底部后加载更多
		scroll() {
			this.getDiscountList();
		},
	},
	// 下拉刷新
	onPullDownRefresh() {
		currPage = 1;
		this.discountList = [];
		this.getDiscountList();
		setTimeout(() => {
			uni.stopPullDownRefresh();
		}, 1000);
	}
};
</script>

<style lang="scss" scoped>
.dis-coupon {
	width: 100%;
	flex: 1;
	background: rgb(239, 239, 244);
}
.swiper-tab {
	width: 100%;
	height: 88upx;
	display: flex;
	align-items: center;
	position: fixed;
	/* #ifdef MP-WEIXIN  */
	top: 0;
	/* #endif */
	/* #ifdef APP-PLUS || H5*/
	top: 90upx;
	/* #endif */
	z-index: 999;
	background: rgb(239, 239, 244);
}
.search-box {
	width: 88%;
	height: 80upx;
	background-color: rgb(228, 228, 233);
	border-radius: 10upx;
	display: flex;
	flex-direction: row;
	align-items: center;
	position: fixed;
	/* #ifdef MP-WEIXIN */
	top: 30upx;
	/* #endif */
	/* #ifdef APP-PLUS || H5*/
	top: 30upx;
	/* #endif */
	left: 4%;
	padding-left: 4%;
	image {
	}
	.search {
		width: 85%;
		padding-left: 10upx;
		font-size: 28upx;
	}
}
.swiper {
	width: 100%;
	padding: 0;
	position: absolute;
	top: 90upx;
	height: 90%;
	margin: 0 auto;
}
.titleSel {
	color: rgb(89, 166, 148);
	font-size: 32upx;
	width: 25%;
	display: block;
	text-align: center;
	align-items: center;
}
.titleUnsel {
	color: #666666;
	font-size: 32upx;
	width: 25%;
	display: block;
	text-align: center;
	align-items: center;
}
.headerLineSel {
	background: rgb(89, 166, 148);
	height: 2upx;
	width: 25%;
	display: block;
	align-items: center;
	position: absolute;
	margin-top: 16upx;
	border-left: 0;
	border-right: 0;
	border-bottom: 0;
}
.headerLineUnsel {
	background: #bbb;
	height: 2upx;
	width: 25%;
	display: block;
	align-items: center;
	position: absolute;
	margin-top: 16upx;
	border-left: 0;
	border-right: 0;
	border-bottom: 0;
}
.discount-scroll {
	padding-top: 100upx;
	height: 94%;
	/* #ifdef MP-WEIXIN  */
	height: 100%;
	/* #endif */
}
.all-type,
.used,
.noused,
.lose {
	ul {
		padding: 40upx 20upx;
		li {
			background: rgb(228, 228, 228);
			border-radius: 20upx;
			margin-bottom: 30upx;
			padding: 20upx 0;
			position: relative;
			.dis-left {
				width: 35%;
				text-align: center;
				.money {
					font-size: 45upx;
					color: #59a694;
					font-weight: bolder;
					image {
						width: 90upx;
						height: 90upx;
						margin-bottom: -20upx;
					}
					.opacity {
						opacity: 0.6;
					}
				}
				.template-id {
					font-size: 24upx;
					color: #8a8a8a;
				}
			}
			.dis-right {
				width: 60%;
				.park {
					font-size: 30upx;
					color: #088b68;
				}
				.plate-number,
				.time {
					font-size: 28upx;
					color: #aaa;
					line-height: 40upx;
				}
			}
			.use-type {
				font-size: 26upx;
				color: #aaa;
				position: absolute;
				right: 20upx;
				top: 72upx;
			}
			.used-img {
				width: 90upx;
				height: 90upx;
				position: absolute;
				right: 40upx;
				top: 34upx;
			}
			.lose-img {
				width: 90upx;
				height: 90upx;
				position: absolute;
				right: 40upx;
				top: 40upx;
			}
		}
	}
}
</style>
