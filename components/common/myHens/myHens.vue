<template>
	<view class="content" :class="myHensIn < 5 ? 'myHensContent' : ''">
		<view class="list">
			<block v-if="myHens.length > 0">
				<view class="item" v-for="(hen,index) in myHens" :key="index">
					<view class="item-left">
						<image :src="hen.iconUrl"></image>
					</view>
					<view class="item-right" >
						<view class="item_title">{{hen.hdmc}}</view>
						<view class="item-font">领养时间：{{hen.inputTime}}</view>
						<view class="item-font">鸡：{{hen.numHens}}只</view>
						<view class="item-font">每日产蛋：{{hen.numEgg}}枚</view>
						<view class="item-font">产蛋剩余天数：{{hen.numExp}}天</view>
						<view class="item-font">累计领取：{{hen.incomeEggSum}}枚</view>
					</view>
					<view class="adopt_view" v-if="hen.feedSecond != 0" @click="signFeed(hen.ucid)">
						<view class="adopt_title" :style="{background: hen.feedSecond == 86400 ? '#00aa7f' : '#e7e7e7'}">
							<text v-if="hen.feedSecond == 86400">喂养</text>
							<uni-countdown v-else :show-day="false" :fontSize="20" :second="hen.feedSecond" @timeup="timeup(index)" />
						</view>
					</view>
					<view class="adopt_view" v-if="hen.feedSecond == 0" @click="signToday(hen.ucid, hen.numEgg, hen.incomeEggSum)">
						<view class="adopt_title" :style="{background: hen.isSign == 0 ? '#e7e7e7' : '#00aa7f'}">
							<text>收蛋</text>
						</view>
					</view>
				</view>
			</block>
			<uni-load-more :status="statusLoadMore" :content-text="contentText" />
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			pages: {
				type: Number,
				default: 0
			},
			statusLoadMore: {
				type: String,
				default: 'more'
			},
			contentText: Object
		},
		watch: {
			pages: {
				handler() {
					this.loadData()
				}
			}
		},
		data() {
			return {
				myHens:[],
				myHensIn: 0
			};
		},
		mounted() {
			this.loadData()
		},
		methods:{
			loadData(){
				this.$http("userHuodongListUser", JSON.stringify({
					token:uni.getStorageSync("token"),
					pg: this.pages,
					hdmc:''
				})).then(res=>{
					if (res.data.code == 0) {
						this.myHens = [...this.myHens, ...res.data.userHuodongList.datas]
						this.myHensIn = res.data.userHuodongList.pgInfo.total_num
						
						this.$emit("myHensInfo", res.data.userHuodongList.pgInfo)
					} else if (res.data.code == 99) {
						uni.showModal({
							content: "请先登录",
						success: (e) => {
							if (e.confirm) {
									uni.clearStorage();
									setTimeout(() => {
										uni.redirectTo({
											url: "../public/login"
										})
									}, 200)
								}
							}
						});
					} else {
						uni.showToast({ title: res.data.msg, icon: 'none'});
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			signFeed(ucid){
				this.$http("userHuodongFeed", JSON.stringify({
					token:uni.getStorageSync("token"),
					ucid: ucid
				})).then(res=>{
					if (res.data.code != 0) {
						uni.showToast({ title: res.data.msg, icon: 'none'});
					} else {
						this.myHens.forEach(item => {
							if(item.ucid == ucid){
								item.feedSecond = res.data.data
							}
						});
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			signToday(ucid, numEgg, incomeEggSum){
				this.$http("userHuodongSignToday", JSON.stringify({
					token:uni.getStorageSync("token"),
					ucid: ucid
				})).then(res=>{
					if (res.data.code != 0) {
						uni.showToast({ title: res.data.msg, icon: 'none'});
					} else {
						this.myHens.forEach(item => {
							if (item.ucid == ucid) {
								item.isSign = 0
								item.incomeEggSum = (parseFloat(item.incomeEggSum) + parseFloat(numEgg)).toFixed(2)
							}
						});
						
						let current = 1
						this.$emit("myHensIndex", current)
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			timeup(index) {
				//console.log('timeup run='+index);
				// this.myHens.forEach(item => {
				// 	if (item.feedSecond == feedSecond) {
				// 		item.feedSecond = 0
				// 	}
				// });
				this.myHens[index].feedSecond=0;
			}
		}
	}
</script>

<style scoped lang='scss'>
.myHensContent{
	height: calc(100vh - 90rpx);
}
.content {
	width: 100%;
/* 	padding: 0 20upx;
	margin-bottom: 30upx;
	height: 100%; */
	background: #f5f5f5;
	
	.list {
		width: 100%;
		
		.item {
			width: 100%;
			/* height: 230rpx; */
			border: 1rpx solid #e5e5e5;
			display: flex;
			border-radius: 8rpx;
			margin-bottom: 10rpx;
			background: #FFFFFF;
			padding: 10rpx;
			
			.item-left{
				margin-right: 8rpx;
				width: 240rpx;
				float: left;
				
				image{
					height: 100%;
					width: 100%;
				}
			}
			
			.item-right{
				height: 100%;
				width: 360rpx;
				
				.item_title{
					font-size: 38rpx; 
					overflow:hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
					-o-text-overflow:ellipsis;
				}
				.item-font{
					font-size: 24upx;
					color:#999999;
					overflow:hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
					-o-text-overflow:ellipsis;
				}
				.item_remark{
					font-size: 22rpx;
					color:#999999;
					display: flex;
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
				}
				.item_price{
					color: #E51515;
					text:nth-child(2){font-size: 40rpx;}
				}
			}
			.adopt_view{
				width: 140rpx;
				height: 210rpx;
				display: flex;
				align-items: center;
				justify-content: flex-end;
				float: right;
				
				.adopt_title{
					width: 110rpx;
					height: 110rpx;
					border-radius: 50%;
					margin: 0 10rpx;
					
					.adopt{
						background: #e7e7e7;
					}
					
					text {
						width: 100%;
						height: 100%;
						color: #FFFFFF;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 40rpx;
					}
				}
			}
		}
	}
	.adopt_title::v-deep .uni-countdown{
		font-size: 20rpx;
		.uni-countdown__number{
			
		}
	}
}
</style>
