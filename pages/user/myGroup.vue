<template>
	<view class="container">
		<view class="top"></view>
		<view class="content">
			<view class="entrance">
				<view class="group_view">
					<view class="group_img">
						<image :src="shangInfo.iconUrl" mode="aspectFill"></image>
					</view>
					<view class="group_title">
						<view class="group_name ellipsis">{{shangInfo.spName}}</view>
						<view class="group_price">直购(元)：{{shangInfo.price}}</view>
						<view class="group_price">团购(元)：{{shangInfo.priceHy}}</view>
					</view>
					<view class="navs">
						<view class="b-btn" @click="addGroup()">开团</view>
					</view>
				</view>
			</view>
		</view>
		
		<view class="member-news">
			<view class="news_header">
				<view class="header">
					<view class="title">可加入团列表</view>
				</view>
				
				<view class="list">
					<block v-for="(item, index2) in groupListClient" :key="index2">
						<view class="list_item">
							<view class="lab">
								<view class="left">
									<text class="name">发起人：</text>
									<view class="val ellipsis">{{ item.userName }}</view>
								</view>
								<view class="right">
									<text class="name">时间：</text>
									<text class="val">{{ item.inputTime }}</text>
								</view>
							</view>
							<view class="lab">
								<text class="val">满团人数 {{item.num}} 人，已有 {{item.numUser}} 人</text>
							</view>
							
							<view class="bottom_group" @click="joinInGroup(item.groupID)">
								<text>加入拼团</text>
							</view>
						</view>
					</block>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import BASE_URL from '../../utils/api.js'

export default {
	data() {
		return {
			shangInfo: {},
			groupListClient:[],
			groupInfo: [],
			spid: "",
			aid: 0
		}
	},
	onLoad(options){
		if (uni.getStorageSync('token')) {
			this.spid=options.spid;
		}else{//未登录
			uni.redirectTo({
				url:'/pages/public/login'
			})
		}
	},
	onShow(){
		this.shangPinInfo();
		this.getGroupListClient();
	},
	onReachBottom() {
		setTimeout(() => {
			this.load_more();
		}, 500);
	},
	methods: {
		shangPinInfo(){
			this.$http("shangPinInfo",JSON.stringify({
				token: uni.getStorageSync("token"),
				spID: this.spid
			})).then(res=>{
				if (res.data.code == 0){
					this.shangInfo = res.data.shangPinInfo
				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					});
				}
			}).catch(err=>{
				console.log(err);
			})
		},
		getGroupListClient(){
			this.$http("orderGroupListClient",JSON.stringify({
				token: uni.getStorageSync("token"),
				pg:'0',
				spID: this.spid
			})).then(res=>{
				if (res.data.code == 0){
					this.groupListClient = res.data.groupList.datas;
				}else if (res.data.code == 99) {
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
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					});
				}
				
			}).catch(err=>{
				console.log(err);
			})
		},
		
		joinInGroup(groupid){
			uni.navigateTo({
				url:"/pages/user/joinGroup?groupid=" + groupid + '&spid=' + this.spid
			});
		},
		
		//加载下一页
		load_more(){
			this.pageCurrent++
			this.$http("orderGroupListClient",JSON.stringify({
				token: uni.getStorageSync("token"),
				pg:this.pageCurrent-1,
				spID: this.spid
			})).then(res=>{
				if (res.data.code == 0) {
					let arr = res.data.userList.datas
					
					if(arr.length>0){
						this.groupUserList = [...this.groupUserList, ...arr];
					}else{
						uni.showToast({
							icon: 'none',
							title: '没有更多数据'
						})
						uni.stopPullDownRefresh();
					}
				}
			}).catch(err=>{
				console.log(err);
			})
		},
		
		// 分页触发
		change(e) {
			this.showinfo(e.current)
		},
		
		addGroup(){
			uni.navigateTo({
				url:"/pages/user/addGroup?spid="+this.spid
			});
		},
		navcode(){
			let urlcode= "/pages/spread/qrcode?yqm="+this.yqm
			uni.navigateTo({
				url: urlcode
			})
		}
	}
}
</script>

<style lang='scss' scoped>
.top {
    position: relative;
    width: 100%;
    height: 160rpx;
    background-color: #FD7031;
}

.content {
	padding: 0 20rpx;
    height: 260rpx;
	
	.entrance {
	    position: relative;
	    margin-top: -120rpx;
	    margin-bottom: 30rpx;
	    border-radius: 10rpx;
	    background-color: #ffffff;
	    box-shadow: 0 20rpx 20rpx -20rpx rgba(51, 51, 51, 0.1);
	    justify-content: center;
	    display: flex;
	    flex-direction: column;
	    height: 100%;
	    border: 1rpx solid #e5e5e5;
		
		.group_view{
			display: flex;
			padding: 16rpx;
			
			.group_img{
				width: 220rpx;
				height: 220rpx;
				margin-right: 10rpx;
				
				image{
					width: 100%;
					height: 100%;
					border-radius: 10rpx;
				}
			}
			
			.group_title{
				width: 50%;
				.group_name{
					color: #000000;
					font-size: 40rpx;
				}
				.group_price{
					font-size: 32rpx;
					padding: 10rpx 0;
					color: #919293;
				}
			}
			
			.navs{
				width: 150rpx;
				height: 150rpx;
				background: #fb0505;
				border-radius: 50%;
				display: flex;
				align-items: center;
				margin-top: 36rpx;
				
				.b-btn{
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

.member-news {
	width: 100%;
	padding: 0 20rpx;
	background-color: #F5F6F9;
	
	.news_header{
		border: 1rpx solid #e5e5e5;
		margin-top: 20rpx;
		border-radius: 10rpx;
		padding: 18rpx;
		
		.header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding-bottom: 20rpx;
			
			.title {
				font-size: 28rpx;
				font-weight: bold;
			}
		}
		
		.list {
			width: 100%;
			display: flex;
			flex-direction: column;
			
			.list_item{
				width: 100%;
				position: relative;
				padding: 20rpx 26rpx 0;
				font-size: 32rpx;
				background-color: #FAEAE1;
				margin-bottom: 20rpx;
				
				.lab{
					width: 100%;
					
					.left{
						width: 100%;
						float: left;
						margin-right: 10upx;
						
						.name{
							display: block;
							float: left;
							width: 126upx;
						}
						.val{
							width: 80%;
						}
					}
					
					.right{
						display: block;
						float: left;
						width: 100%;
						padding: 8rpx 0;
						
						.name{
							display: block;
							float: left;
						}
					}
				}
				
				.bottom_group{
					margin: 26rpx 0;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 32rpx;
					background: #FD7031;
					border-radius: 10rpx;
					padding: 12rpx;
					
					text{
						width: 100%;
						height: 100%;
						color: #FFFFFF;
						display: flex;
						justify-content: center;
						font-size: 40rpx;
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
