<template>
	<view class="record">
		<view class="record-tab clear">
			<view class="tab-box" @click="tabSwitch(0)">
				<text :class="currentIndex == 0 ? 'active' : '' ">申办记录</text>
			</view>
			<view class="tab-box" @click="tabSwitch(1)">
				<text :class="currentIndex == 1 ? 'active' : '' ">支付记录</text>
			</view>
		</view>
		<!-- 月卡申办记录 -->
		<view class="apply" v-show="apply">
			<view class="item" v-for="(item,i) in applyList" :key="i">
				<view class="fill" @click="audit(item)">
					<button type="default" class="item_tip" v-if="item.status == 2">去支付</button>
					<view class="type">
						<span v-if="item.type == 1">申请</span>
						<span v-else-if="item.type == 2">新办</span>
						<span v-else-if="item.type == 3">延期</span>
						<span v-else="item.type == 4">退卡</span>
						<span v-if="item.status == 1">待审核</span>
						<span v-else-if="item.status == 2">审核通过</span>
						<span v-else-if="item.status == 3">审核驳回</span>
						<span v-else="item.status == 4">办理成功</span>
					</view>
					<view class="item_row" v-if="item.cardId">
						<text class="label">卡ID</text>
						<text class="item_content">{{item.cardId}}</text>
					</view>
					<view class="item_row" v-if="item.cardNo">
						<text class="label">编号</text>
						<text class="item_content">{{item.cardNo}}</text>
					</view>
					<view class="item_row" v-if="item.carNo">
						<text class="label">车牌号</text>
						<text class="item_content">{{item.carNo}}</text>
					</view>
					<view class="item_row" v-if="item.lot">
						<text class="label">车位号</text>
						<text class="item_content">{{item.lot}}</text>
					</view>
					<view class="item_row" v-if="item.timeNum">
						<text class="label">申请时长</text>
						<text class="item_content">{{item.timeNum}}月</text>
					</view>
					<view class="item_row" v-if="item.createTime">
						<text class="label">申办时间</text>
						<text class="item_content">{{item.createTime}}</text>
					</view>
					<view class="item_row" v-if="item.auditTime">
						<text class="label">审核时间</text>
						<text class="item_content">{{item.auditTime}}</text>
					</view>
				</view>
			</view>
			<view class="" v-if="applyList.length == 0" style="text-align: center;margin-top: 70%;font-size: 17px;">
				暂无数据
			</view>
		</view>
		<!-- 月卡支付记录 -->
		<view class="payment" v-show="payment">
			<view class="item" v-for="(item,j) in payList" :key="j">
				<view class="type" v-if="item.status == 1">
					支付成功
				</view>
				<view class="type" v-else-if="item.status == 2">
					已退款
				</view>
				<view class="type" v-else="item.status == 3">
					待支付
				</view>
				<view class="time">
					订单编号：{{item.orderNo}}
				</view>
				<view class="time">
					订单时间：{{item.orderTime}}
				</view>
				<view class="time" v-if="item.payTime">
					支付时间：{{item.payTime}}
				</view>
				<view class="money">
					+{{item.payFee}}
				</view>
				<view class="payType" style="color: #088b68;" v-if="item.payType == 1">
					微信支付
				</view>
				<view class="payType" style="color: #088b68;" v-if="item.payType == 2">
					支付宝支付
				</view>
			</view>
			<view class="" v-if="payList.length == 0" style="text-align: center;margin-top: 70%;font-size: 17px;">
				暂无数据
			</view>
		</view>
		<!-- <view class="back">
			<button>返回</button>
		</view> -->
	</view>
</template>

<script>
	let currPage = 1;
	export default {
		data(){
			return{
				currentIndex: 0,
				apply: true,
				payment: false,
				applyList:[],
				payList:[]
			}
		},
		methods:{
			tabSwitch(index){
				this.currentIndex = index;
				if(index == 0){
					currPage = 1
					this.apply = true;
					this.payment = false;
					this.applyList = [];
					this.getApplyList();
				}else if(index == 1){
					currPage = 1
					this.payment = true;
					this.apply = false;
					this.payList = [];
					this.getPayList()
				}
			},
			// 获取申办记录
			getApplyList(){
				var currentCommunity = this.$getUserInfo().currentCommunity;
				if (currentCommunity !== undefined) {
					var communityId = currentCommunity.id;
					this.$req.request({
						url: "/parkCardRecord/app/list",
						method: "POST",
						data: {
							pageSize: 10,
							currPage: currPage,
							communityId: communityId
						},
						isShowLoading: false,
						success: res => {
							if(res.code == 0){
								currPage ++;
								this.applyList = this.applyList.concat(res.data.list);
							}
						}
					});
				}
			},
			// 获取支付记录
			getPayList(){
				var currentCommunity = this.$getUserInfo().currentCommunity;
				if (currentCommunity !== undefined) {
					var communityId = currentCommunity.id;
					this.$req.request({
						url: "/parkCardOrder/app/list",
						method: "POST",
						data: {
							pageSize: 10,
							currPage: currPage,
							communityId: communityId
						},
						isShowLoading: false,
						success: res => {
							if(res.code == 0){
								currPage ++;
								this.payList = this.payList.concat(res.data.list);
							}
						}
					});
				}
			},
			// 跳转到审核详情页面
			audit(cardInfo){
				console.log("itemitem",cardInfo)
				let item = JSON.stringify(cardInfo);
				if(cardInfo.status == 1 || cardInfo.status == 3){
					uni.navigateTo({
						url: "month-card-audit?item=" + item
					})
				}else if(cardInfo.status == 2){
					uni.navigateTo({
						url: "card-postpone-status?item=" + item
					})
				}
			}
		},
		onLoad() {
			currPage = 1;
			this.applyList = [];
			this.getApplyList();
		},
		// 下拉刷新
		onPullDownRefresh(){
			if(this.currentIndex == 0){
				currPage = 1;
				this.applyList = [];
				this.getApplyList();
			}else if(this.currentIndex == 1){
				currPage = 1;
				this.payList = [];
				this.getPayList()
			}
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000)
		},
		// 上拉加载更多
		onReachBottom() {
			if(this.currentIndex == 0){
				this.getApplyList();
			}else if(this.currentIndex == 1){
				this.getPayList()
			}
		}
	}
</script>

<style>
	.record{
		width: 100%;
		border-top: 1px solid #F2F2F2;
	}
	.record-tab{
		width: 100%;
		position: fixed;
		top: 88upx;
		/* #ifdef MP-WEIXIN || MP-ALIPAY */
		top: 0;
		/* #endif */
		background: #fff;
		padding: 3%;
		border-bottom: 1px solid #eee;
		z-index: 99;
	}
	.tab-box{
		float: left;
		margin-right: 50upx;
	}
	.active{
		padding-bottom: 5px;
		border-bottom: 1px solid #088b68;
		color: #088b68;
	}
	.tab-box text{
		font-size: 32upx;
		font-weight: bold;
	}
	.apply{
		margin-top: 100upx;
		background: #F8F9FB;
		padding-top: 20upx;
		height: 100%;
	}
	.apply .item{
		margin-bottom: 20upx;
	}
	.payment{
		margin-top: 100upx;
		padding-top: 20upx;
		height: 100%;
	}
	.payment .item{
		position: relative;
	}
	.payment .item .money{
		position: absolute;
		top: 20upx;
		right: 20upx;
		font-size: 30upx;
		color: #088b68;
	}
	.payment .item .payType{
		position: absolute;
		bottom: 20upx;
		right: 20upx;
		font-size: 30upx;
	}
	.payment .item{
		border-bottom: 1px solid #eee;
		padding: 20upx;
		padding-top: 0;
	}
	.payment .type{
		color: #088b68;
		font-size: 36upx;
		padding-top: 15upx;
	}
	.payment .item .time{
		padding-top: 15upx;
	}
	.fill {
		background: #FFFFFF;
		box-shadow: 0upx 2upx 16upx rgba(182, 186, 193, 0.16);
		border-radius: 16upx;
		padding: 24upx;
		box-sizing: border-box;
		margin: 0upx 24upx;
		position: relative;
	}
	.fill .type{
		color: #088b68;
		font-size: 28upx;
		padding: 10upx 0;
	}
	.fill .item_tip{
		position: absolute;
		top: 30upx;
		right: 20upx;
		background: #fff;
		border: 1px solid #088b68;
		color: #088b68;
		height: 50upx;
		line-height: 50upx;
		font-size: 28upx;
		padding: 0 10upx;
	}
	.fill .item_row {
		padding: 10upx 0;
		font-size: 28upx;
		color:#24272E;
	}
	
	.item_row .label {
		display: inline-block;
		width: 140upx;
		margin-right: 20upx;
		color: #787F8A;
	}
	
	.item_row .item_content{
		    width: 75%;
		    display: inline-block;
		    text-align: right;
	}
	.back {
		width: 100%;
		position: fixed;
		bottom: 0;
		left: 0;
		height: 88upx;
		padding-bottom: 40upx;
		z-index: 1;
	}
	.back button {
		width: 80%;
		height: 88upx;
		line-height: 88upx;
		background: linear-gradient(118deg, #01dca3 0%, #088b68 100%);
		box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
		border-radius: 50upx 50upx 50upx 50upx;
		color: #ffffff;
	}
</style>
