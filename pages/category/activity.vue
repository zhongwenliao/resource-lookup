<template>
	<view class="content">
		<view class="member-news">
			<view class="list">
				<block v-for="(titem, index) in hotlist" :key="index">
					<view class="item">
						<view class="item-left">
							<image :src="titem.iconUrl"></image>
						</view>
						<view class="item-right">
							<view class="item_title ellipsis">{{titem.hdmc}}</view>
							<view class="item-font ellipsis">鸡：{{titem.numHens}}只</view>
							<view class="item-font ellipsis">每日产蛋：{{titem.numEggs}}个</view>
							<view class="item-font ellipsis">产蛋天数：{{titem.numExp}}天</view>
							<view class="item_remark">{{titem.remark}}</view>
							<view class="item_price">
								<text>￥</text>
								<text>{{titem.price}}</text>
							</view>
						</view>
						<view class="adopt_view" @click="go_hots(titem.hdid)">
							<view class="adopt_title">
								<text>领养</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				hotlist:[]
			};
		},
		
		onLoad() {
			this.loadData()
		},
		
		methods:{
			loadData(){
				this.$http("huodongListClient",
				JSON.stringify({
					token:uni.getStorageSync("token"),
						pg: 0,
						hdmc:''
					})).then(res=>{
					//console.log(res);
					if (res.data.code != 0) {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
					} else {
						this.hotlist = res.data.huodongList.datas
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			
			go_hots(hdid){
				if(uni.getStorageSync("token")){
					uni.navigateTo({
						url: '/pages/product/product2?hdid=' + hdid
					})
				} else {
					uni.showModal({
					    content: '请先登录',
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
			}
		}
	}
</script>

<style scoped lang='scss'>
.content {
	padding: 0 20upx 30upx;
	background: #f5f5f5;
	height: 100%;
}

.member-news {
	width: 100%;
	margin-bottom: 30rpx;
	
	.list {
		width: 100%;
		
		.item {
			width: 100%;
			height: 245rpx;
			border: 1rpx solid #e5e5e5;
			display: flex;
			border-radius: 8rpx;
			margin-bottom: 10rpx;
			background: #FFFFFF;
			
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
				width: 280rpx;
				
				.item_title{
					font-size: 38rpx; 
				}
				.item-font{
					font-size: 24upx;
					color:#999999;
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
					height: 45upx;
					text:nth-child(2){font-size: 40rpx;}
				}
			}
			.adopt_view{
				width: 180rpx;
				height: 245rpx;
				display: flex;
				align-items: center;
				justify-content: flex-end;
				float: right;
				
				.adopt_title{
					width: 150rpx;
					height: 150rpx;
					background: #fb0505;
					border-radius: 50%;
					margin: 0 20rpx;
					
					text {
						width: 100%;
						height: 100%;
						color: #FFFFFF;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 56rpx;
					}
				}
			}
		}
	}
}
.ellipsis{
	overflow:hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	-o-text-overflow:ellipsis;
}
</style>
