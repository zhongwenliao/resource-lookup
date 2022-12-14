<template>
	<view class="apply">
		<!--月卡信息-->
		<view>
			<view class="title">
				月卡信息
			</view>
			<view class="fill">
				<view class="item" v-if="cardInfo.cardNo">
					<text class="label">编号</text>
					<text class="item_content">{{cardInfo.cardNo}}</text>
				</view>
				<view class="item">
					<text class="label">持卡人姓名</text>
					<text class="item_content">{{cardInfo.person}}</text>
				</view>
				<view class="item">
					<text class="label">手机号</text>
					<text class="item_content">{{cardInfo.phone}}</text>
				</view>
				<view class="item">
					<text class="label">开始时间</text>
					<text class="item_content">{{cardInfo.startTime}}</text>
				</view>
				<view class="item">
					<text class="label">结束时间</text>
					<text class="item_content">{{cardInfo.endTime}}</text>
				</view>
				<view class="item">
					<text class="label">卡状态</text>
					<text class="item_content" v-if="cardInfo.status == 1">正常</text>
					<text class="item_content" v-if="cardInfo.status == 2">过期</text>
				</view>
			</view>
		</view>
		
		<!--车牌号-->
		<view>
			<view class="title">
				车牌号
			</view>
			<view class="fill">
				<view class="item" v-for="(item,index) in cardInfo.carNoArray" :key="index">
					<text>{{item}}</text>
				</view>
			</view>
		</view>
		
		<!--车位信息-->
		<view v-if="cardInfo.lotArray.length != 0">
			<view class="title">
				车位信息
			</view>
			<view class="fill">
				<view class="item" v-for="(item,index) in cardInfo.lotArray" :key="index">
					<text>{{item}}</text>
				</view>
			</view>
		</view>
		
		<view class="form" v-if="isOnlineCard === 1">
			<button @click="apply(cardInfo,cardInfo.id)">申请延期</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				cardId: "",
				cardInfo: {},
				isOnlineCard: ""
			}
		},
		methods: {
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
			// 卡信息
			getParkCard(){
				this.$req.request({
					url: "/parkCard/app/getById",
					method: "POST",
					data: {
						id: this.cardId
					},
					isShowLoading: false,
					success: res => {
						this.cardInfo = res.data;
					}
				});
			},
		},
		onLoad(option) {
			this.cardId = option.id;
			this.getParkCard();
			this.isOnlineCard = uni.getStorageSync("isOnlineCard");
		},
	}
</script>

<style lang="scss">
	.apply {
		width: 100%;
		background: #F8F9FB;
	}

	.title {
		color: #000;
		font-size: 36upx;
		font-weight: 500;
		padding: 24upx 30upx 12upx;
	}

	.fill {
		// width:97%;
		background: #FFFFFF;
		box-shadow: 0upx 2upx 16upx rgba(182, 186, 193, 0.16);
		border-radius: 16upx;
		padding: 24upx;
		box-sizing: border-box;
		margin: 0upx 24upx;
	}

	.fill .item {
		padding: 10upx 0;
		font-size: 28upx;
		color:#24272E;
	}

	.item .label {
		display: inline-block;
		width: 140upx;
		margin-right: 20upx;
		color: #787F8A;
	}

	.item .item_content{
		    width: 75%;
		    display: inline-block;
		    text-align: right;
	}
		
	.form {
		width: 100%;
		height: 88upx;
		padding-top: 40upx;
		
	}

	.form button {
		height: 88upx;
		line-height: 88upx;
		background: linear-gradient(118deg, #01dca3 0%, #088b68 100%);
		box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
		border-radius: 50upx 50upx 50upx 50upx;
		color: #ffffff;
		margin: 0 32upx;
	}
</style>
