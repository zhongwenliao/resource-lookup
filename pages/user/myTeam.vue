<template>
	<view>
		<view class="content_view">
			<view class="entrance1">
				<view class="group_view">
					<view class="portrait-box">
						<image class="portrait" :src="userData.imgUrl || '/static/missing-face.png'" @click="upImg"></image>
						<view class="grade_view">
							<view class="grade_title" :style="'color:' + userData.color + ';background:' + userData.bgColor">{{ userData.gradeName }}</view>
						</view>
					</view>
					<view class="hens_list1">
						<view class="hens_view">
							<text class="view-text">帐号：{{ userData.userid }}</text>
						</view>
						<view class="hens_view">
							<text class="view-text">名称：{{ userData.userName }}</text>
							<text class="text_x" v-if="cfgValue == 1">直推人数：{{ userData.num }}</text>
						</view>
						<view class="hens_view" v-if="cfgValue == 1">
							<text class="view-text">直推业绩：{{ userData.numSales }}</text>
							<text class="text_x">团队业绩：{{ userData.numSalesTeam }}</text>
						</view>
						<view class="hens_view" v-if="cfgValue == 1">
							<text class="view-text">认养数量：{{ userData.numHens }}</text>
							<text class="text_x">注册：{{ userData.inputTime }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<view class="content">
			<block v-for="(item, index) in tableData" :key="index">
				<view class="content_view1">
					<view class="entrance">
						<view class="group_view">
							<view class="portrait-box">
								<image class="portrait" :src="item.imgUrl || '/static/missing-face.png'" @click="upImg"></image>
								<view class="grade_view">
									<view class="grade_title" :style="'color:' + item.color + ';background:' + item.bgColor">{{ item.gradeName }}</view>
								</view>
							</view>
							<view class="hens_list1">
								<view class="hens_view">
									<text class="view-text">帐号：{{ item.userid }}</text>
								</view>
								<view class="hens_view">
									<text class="view-text">名称：{{ item.userName }}</text>
									<text class="text_x" v-if="cfgValue == 1">直推人数：{{ item.num }}</text>
								</view>
								<view class="hens_view" v-if="cfgValue == 1">
									<text class="view-text">直推业绩：{{ item.numSales }}</text>
									<text class="text_x">团队业绩：{{ item.numSalesTeam }}</text>
								</view>
								<view class="hens_view" v-if="cfgValue == 1">
									<text class="view-text">认养数量：{{ item.numHens }}</text>
									<text class="text_x">注册：{{ item.inputTime }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</block>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userData: {},
			userid: uni.getStorageSync("userid"),
			tableData: [],
			// 每页数据量
			pageSize: 20,
			// 当前页
			pageCurrent: 1,
			// 数据总量
			total: 0,
			loading: false,
			cfgValue: 0
		}
	},
	onLoad() {
		this.systemCfgInfoClient();
	},
	onShow(){
		if (uni.getStorageSync('token')) {
			this.showinfo()
			this.userInfo()
		}else{//未登录
			uni.redirectTo({
				url:'/pages/public/login'
			})
		}
	},
	onReachBottom() {
		setTimeout(() => {
			this.load_more();
		}, 500);
	},
	methods: {
		systemCfgInfoClient(){
			this.$http("systemCfgInfoClient", JSON.stringify({
				cfgKey: 'trueModule',
				token: 'token'
			})).then(res => {
				if (res.data.code == 0) {
					this.cfgValue = res.data.systemCfgInfo.cfgValue;
				}
			}).catch(err => {
				console.log(err);
			})
		},
		userInfo(){
			this.$http("userInfo", JSON.stringify({
				token: uni.getStorageSync("token")
			})).then(res => {
				if (res.data.code == 0) {
					this.userData = res.data.userInfo;
					this.userData.inputTime=res.data.userInfo.inputTime.substring(0,10);
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
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					});
				}
			}).catch(err => {
				console.log(err);
			})
		},
		showinfo(page = 1){
			uni.showLoading({
				title: '加载中'
			});
			
			this.$http("userListUser",JSON.stringify({
				token: uni.getStorageSync("token"),
				eggType:0,
				pg:page-1
			})).then(res=>{
				uni.hideLoading();
				// console.log(res.data.eggList);
				
				if(res.data.code==0){
					this.tableData = res.data.userList.datas;
					this.total = res.data.userList.pgInfo.total_num
					this.loading = false;
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
				}else{
					this.$api.msg(res.data.msg);
				}
			}).catch(err=>{
				console.log(err);
			})	
		},
		
		//加载下一页
		load_more(){
			this.pageCurrent++
			this.$http("userListUser",JSON.stringify({
				token: uni.getStorageSync("token"),
				eggType:0,
				pg: this.pageCurrent-1
			})).then(res=>{
				if (res.data.code == 0) {
					let arr = res.data.userList.datas;
					
					if(arr.length>0){
						this.tableData = [...this.tableData, ...arr];
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
		}
	}
}
</script>

<style lang='scss' scoped>
.content{
	font-size: 26upx;
	padding: 20upx;
	background: #f5f5f5;
	height: 100%;
	margin-bottom: 30upx;
}
.content_view{
	position: fixed;
	z-index: 95;
	width: 100%;
	font-size: 28rpx;
}
.content_view1:nth-child(1){
	margin-top: 210rpx;
}
.entrance1 {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1rpx solid #e5e5e5;
	background-color: #FFFFFF;
	
	.portrait-box{
		display: flex;
		align-items: center;
	}
}
.entrance {
	position: relative;
	margin-bottom: 10rpx;
	border-radius: 10rpx;
	background-color: #ffffff;
	box-shadow: 0 20rpx 20rpx -20rpx rgba(51, 51, 51, 0.1);
	justify-content: center;
	display: flex;
	flex-direction: column;
	height: 100%;
	border: 1rpx solid #e5e5e5;
	
	.portrait-box{
		display: flex;
		align-items: center;
	}
}
.group_view{
	display: flex;
	padding: 16upx 16upx 0;
	
	.portrait {
		width: 100upx;
		height: 100upx;
		border: 2rpx solid #dbdbdb;
		border-radius: 50%;
	}
}
	
.hens_list1{
	width: 100%;
	border-radius: 8rpx;
	padding-left: 20rpx;
	margin-bottom: 5upx;
}
.hens_list{
	background: #FFFFFF;
	border: 1rpx solid #e5e5e5;
	border-radius: 8upx;
	padding: 10upx;
	margin-bottom: 5upx;
}
.hens_view{
	display: flex;
	justify-content: space-between;
	padding-bottom: 10upx;
}

.hens_money{
	display: flex;
}
.money:nth-child(2){
	color: #55aa00;
}
.money_text:nth-child(2){
	color: #ff0000;
}
.view-text{
	width: 280rpx;
	overflow:hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	-o-text-overflow:ellipsis;
}
.text_x{
	width: 280rpx;
	overflow:hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	-o-text-overflow:ellipsis;
}
.grade_view{
	position: absolute;
	bottom: 17rpx;
	background: #FFFFFF;
	left: 20rpx;
	border-radius: 50%;
}
.grade_title{
	border: 1rpx solid #E5E5E5;
	border-right: 173rpx;
	padding: 5rpx 10rpx;
	border-radius: 200rpx;
	font-size: 20rpx;
	width: 96rpx;
	display: flex;
	justify-content: center;
}
</style>
