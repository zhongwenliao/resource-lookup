<template>
	<view class="container">
		<view class="content">
			<view class="member-news">
					<view class="header">
						<view class="title">所有门店</view>
					</view>
					<view class="list">						
						<view class="item" v-for="(titem,index) in shoplist" @click="select(titem)">
							<view class="item-left">						
								<image src="/static/nav/chicken.png"></image>
							</view>
							<view class="item-right">
								<view class="shop" v-if="titem.mdztmc=='营业中'">{{titem.mdmc}}<span class="st1">{{titem.mdztmc}}</span></view>
								<view class="shop" v-if="titem.mdztmc!='营业中'">{{titem.mdmc}}<span class="st2">{{titem.mdztmc}}</span></view>
								<view class="adress">
									<uni-icons type="location" size="15" color="#999999"></uni-icons>{{titem.bz}}
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				shoplist:[]
			};
		},
		
		onLoad() {
			this.loadData()
		},
		
		methods:{
			loadData(){
				
			},
			
			//选择门店
			select(shops){
				uni.setStorage({
					key: "mdid",
					data: shops.mdid
				}),
				
				uni.setStorage({
					key: "shopname",
					data: shops.mdmc
				}),
				
				uni.setStorage({
					key: "shopaddress",
					data: shops.mdsm
				})
				
				uni.switchTab({
					url: '/pages/category/category'
				});
			}
			
		}
		
	}
</script>

<style  lang='scss'>
.content {
	padding: 0 30rpx;
}
.member-news {
	width: 100%;
	margin-bottom: 30rpx;
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 0;
		
		.title {
			font-size: 28rpx;
			font-weight: bold;
		}
		
		.iconfont {
			font-size: 52rpx;
			color: $text-color-assist;
		}
	}
	
	.list {
		width: 100%;
		display: flex;
		flex-direction: column;
		
		.item {
			width: 100%;
			height: 140rpx;
			position: relative;
			padding: 20rpx;
			
			.item-left{
				display: block;
				float: left;
				margin-right: 20rpx;
				
				image{
					height: 100rpx;
					width: 100rpx;
				}
			}
			
			.item-right{
				display: block;
				float: left;
				height: 100%;
				
				.shop{
						font-size: 28rpx; 
						font-weight: 500rpx;
						padding: 0 0 30rpx 0;
					}
					
				.st1{
					margin-left: 20rpx;
					font-size: 22rpx;
					color: #FD7031;
					border: 2rpx solid #FD7031;
					padding: 2rpx;
					border-radius: 8rpx;
				}
				
				.st2{
					margin-left: 20rpx;
					font-size: 22rpx;
					color: #999999;
					border: 2rpx solid #999999;
					padding: 2rpx;
					border-radius: 8rpx;
				}
				
				.adress{font-size: 22rpx; color:#999999;}
			}
		}
	}
}
</style>
