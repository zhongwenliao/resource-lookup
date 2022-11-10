<template>
	<view v-if="list.length>0">		
		<view class="notice-item" v-for="item in list" :key="item.msgId">
			<text class="time">{{item.inputTime}}</text>
			<view class="content">
				<view class="left"><image src="/static/icons/top.png"></image></view>
				<view class="right">
					<view class="header">
						<view class="h1">系统消息</view>
						<view class="h2" @click="deletes(item.msgId)">删除</view>
					</view>
					<view class="title">{{item.title}}</view>
					<view class="txt">{{item.txt}}</view>
				</view>
			</view>
		</view>
		
		<view class="page-bottom">
			<button class="add-btn ymcode_ml" @click="clear">一键清除</button>
		</view>
	</view>
	<view class="nomore" v-else>
		没有消息
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list:[]
			}
		},
		
		onLoad() {
			if (uni.getStorageSync('token')){
				
				this.show_info()
			  }else{						
				uni.navigateTo({
					url:'/pages/public/login'
				})
			}
		},
		
		methods: {
			
			show_info(){
				this.$http("userMsgListUser",JSON.stringify({
						token:uni.getStorageSync("token"),
						typeId:'0',
						pg:'0'
					})).then(res=>{
						
						if(res.data.code==0){
							this.list = res.data.msgList.datas
						}else{
							uni.showToast({
								title: res.data.msg,
								icon: "none"
							})
						}
					}).catch(err=>{
						console.log(err);
					})
				
			},
			
			
			deletes(msgid){
				
				this.$http("msgDel",JSON.stringify({
						userid: uni.getStorageSync('userid'),
						msgid:msgid
					})).then(res=>{
						if(res.data.status==0){
							setTimeout(() => {
								uni.redirectTo({
									url:'/pages/notice/notice',
								})										   											
							}, 500)
						}
					}).catch(err=>{
						console.log(err);
					})
			},
			
			clear(){
				
				this.$http("msgClear",JSON.stringify({
						userid: uni.getStorageSync('userid'),
					})).then(res=>{
						if(res.data.status==0){
							setTimeout(() => {
								uni.redirectTo({
									url:'/pages/notice/notice',
								})										   											
							}, 500)
						}
					}).catch(err=>{
						console.log(err);
					})
			}
			
		}
	}
</script>

<style lang='scss'>
	page {
		background-color: #f7f7f7;
		padding-bottom: 30upx;
	}

	.notice-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.time {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 80upx;
		padding-top: 10upx;
		font-size: 26upx;
		color: #7d7d7d;
	}

	.content {
		width: 710upx;
		padding: 20rpx 0 20rpx 20rpx;
		background-color: #fff;
		border-radius: 4upx;
		
		.left{
			display: block;
			float: left;
			
			image{
				width: 50rpx;
				height: 50rpx;
			}
		}
		
		.right{
			display: block;
			float: left;
			width: 620rpx;
			margin-left: 20rpx;
			
			.header{
				height: 60rpx;
				border-bottom: 2rpx solid #DDDDDD;
				
				.h1{
					display: block;
					float: left;
					font-size: 34rpx;
				}
				
				.h2{
					display: block;
					float: right;
					font-size: 28rpx;
					color: #919293;
					padding: 0 20rpx;
				}
			}
			
			.title{
				clear: both;
				font-size: 28rpx;
				padding: 16rpx 0;
			}
			
			.txt{
				font-size: 28rpx;
				color: #919293;
			}
		}
		
	}

.page-bottom {
		position: fixed;
		left: 30upx;
		bottom: 30upx;
		z-index: 95;
		/* display: flex; */
		justify-content: center;
		align-items: center;
		width: 690upx;
		height: 160rpx;
}

.add-btn{
		display: flex;
		align-items: center;
		justify-content: center;
		width: 690upx;
		height: 80upx;
		margin: 60upx auto;
		font-size: $font-lg;
		color: #fff;
		border-radius: 10upx;
}

.nomore{
	text-align: center;
	padding: 180rpx 0;
	color: #919293;
}
</style>
