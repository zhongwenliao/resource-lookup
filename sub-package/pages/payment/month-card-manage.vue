<template>
	<view class="manage">
		<view class="item" v-for="(item, index) in cardList" :key= "index" v-if="cardList.length != 0">
			<view class="card clear" @click="goMonthCardInfo(item.id)">
				<view class="left fl">
					<view class="park-name">
						<span style="margin-right: 20upx;">卡ID:{{item.id}}</span>
						<span v-if="item.cardNo">编号:{{item.cardNo}}</span>
					</view>
					<view class="plate-number">
						{{item.carNo}}
					</view>
				</view>
				<view class="right fr">
					<image src="../../../sub-package/static/img/payment/yk.png"></image>
				</view>
			</view>
			<view class="time">
				<text class="validity">有效期至{{item.endTime}}</text><text class="statu" v-if="item.status == 1" style="color: #3ABD9E;">正常</text><text class="statu" v-if="item.status == 2" style="color: #BF0000;">过期</text>
				<button class="fr" @click="apply(item,item.id)" v-if="isOnlineCard === 1">申请延期</button>
			</view>
		</view>
		<view class="history" @click="goToHistory" v-if="cardList.length != 0">
			历史记录
		</view>
		<view class="" v-if="cardList.length == 0" style="text-align: center;margin-top: 60%;font-size: 17px;">
			暂无数据
		</view>
		<view class="null" style="height: 140upx;"></view>
		<view class="buy" v-if="isOnlineCard === 1">
			<button @click="buyCard">申办月卡</button>
		</view>
	</view>
</template>

<script>
	let currPage = 1;
	let isShowLoad = false;
	export default {
		data(){
			return{
				cardList: [],
				isOnlineCard: ""
			}
		},
		methods:{
			// 获取月卡列表
			getMonthCard() {
				var currentCommunity = this.$getUserInfo().currentCommunity;
				if (currentCommunity !== undefined) {
					var communityId = currentCommunity.id;
					this.$req.request({
						url: "/parkCard/app/list",
						method: "POST",
						data: {
							pageSize: 10,
							currPage: currPage,
							communityId: communityId
						},
						isShowLoading: false,
						success: res => {
							currPage ++ ;
							this.cardList = this.cardList.concat(res.data.list);
						}
					});
				}
			},
			apply(cardInfo,id) {
				this.$req.request({
					url: "/parkCard/app/get",
					method: "POST",
					data: {
						id: id
					},
					isShowLoading: false,
					success: res => {
						let item = JSON.stringify(res.data);
						let cardInfoObj = JSON.stringify(cardInfo);
						if(res.data && res.data.status == 1 || res.data && res.data.status == 3){
							uni.navigateTo({
								url: "month-card-audit?item=" + item
							});
						}else if(res.data && res.data.status == 2){
							uni.navigateTo({
								url: "card-postpone-status?item=" + item
							});
						}else{
							uni.navigateTo({
								url: "month-card-postpone?item=" + cardInfoObj
							});
						}
					}
				});
			},
			buyCard(){
				uni.navigateTo({
					url: "apply-month-card"
				})
			},
			goToHistory(){
				uni.navigateTo({
					url: "month-card-history"
				})
			},
			//跳转月卡详情
			goMonthCardInfo(id){
				uni.navigateTo({
					url:'./month-card-info?id=' + id
				})
			},
		},
		onLoad() {
			this.isOnlineCard = uni.getStorageSync("isOnlineCard");
			currPage = 1;
			this.cardList = [];
			this.getMonthCard();
		},
		// 上拉加载更多
		onReachBottom(){
			this.getMonthCard();
		},
		// 下拉刷新
		onPullDownRefresh(){
			currPage = 1;
			this.cardList = [];
			this.getMonthCard();
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000)
		}
	}
</script>

<style scoped="scoped">
	.manage{
		width: 100%;
		background: #F2F2F2;
		padding-top: 50upx;
	}
	.card{
		background: #3ABD9E;
		margin: 30upx 20upx 0 20upx;
		border-radius: 10upx;
	}
	.card .left{
		width: 62%;
	}
	.card .right{
		width: 38%;
	}
	.card .right image{
		display: block;
		width: 250upx;
		height: 250upx;
		margin: auto;
	}
	.park-name{
		color: #fff;
		font-size: 28upx;
		padding-left: 20upx;
		padding-top: 20upx;
	}
	.plate-number{
		color: #fff;
		font-size: 40upx;
		padding-left: 60upx;
		padding-top: 40upx;
	}
	.time{
		background: #fff;
		margin: 0 20upx;
		padding: 20upx;
	}
	.time button{
		display: inline-block;
		height: 60upx;
		line-height: 60upx;
		background: #FD8804;
		color: #fff;
		font-size: 28upx;
		padding-left: 20upx;
		padding-right: 20upx;
	}
	.validity{
		color: #000;
		font-size: 33upx;
	}
	.statu{
		font-size: 33upx;
		margin-left: 10upx;
	}
	.history{
		width: 93%;
		color: #3ABD9E;
		position: fixed;
		top: 88upx;
		/* #ifdef MP-WEIXIN || MP-ALIPAY || APP-PLUS */
		top: 0;
		/* #endif */
		text-align: right;
		padding: 2% 4%;
		background: #f2f2f2;
	}
	.buy {
		width: 100%;
		position: fixed;
		bottom: 0;
		left: 0;
		height: 88upx;
		padding-bottom: 40upx;
		z-index: 1;
		background: #f2f2f2;
	}
	.buy button {
		width: 80%;
		height: 88upx;
		line-height: 88upx;
		background: linear-gradient(118deg, #01dca3 0%, #088b68 100%);
		box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
		border-radius: 50upx 50upx 50upx 50upx;
		color: #ffffff;
	}
</style>
