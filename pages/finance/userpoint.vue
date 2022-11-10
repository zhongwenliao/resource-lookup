<template>
	<view class="content" :class="tableData.length < 8 ? 'contentData' : ''">
		<block v-for="(item, index) in tableData" :key="index">
			<view class="hens_list">
				<view class="hens_view">
					<text>时间：{{ item.inputTime }}</text>
					<text>类型：{{ item.capitalTypeName }}</text>
				</view>
				<view class="hens_view">
					<text>当前积分：{{ item.moneyRemain }}</text>
					<view class="hens_money">
						<text>变动积分：</text>
						<text class="money" v-if="item.inOut==1">{{ item.inOut==1?"+":"-" }}{{ item.money}}</text>
						<text class="money_text" v-else>{{ item.inOut==1?"+":"-" }}{{ item.money}}</text>
					</view>
				</view>
				<view class="text_x">详情：{{ item.txt }}</view>
			</view>
		</block>
		<uni-load-more v-if="tableData.length === 0" :status="statusLoadMore" :content-text="contentText" />
	</view>
</template>

<script>
export default {
	data() {
		return {
			tableData: [],
			// 每页数据量
			pageSize: 20,
			// 当前页
			pageCurrent: 1,
			// 数据总量
			total: 0,
			loading: false,
			
			statusLoadMore: "more",
			contentText: {
				contentdown: '暂无数据'
			},
		}
	},
	onLoad(){
		if (uni.getStorageSync('token')) {
			this.showinfo(1)
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
		showinfo(page){
			uni.showLoading({
				title: '加载中'
			});
			
			this.$http("userPointListUser",JSON.stringify({
				token: uni.getStorageSync("token"),
				capitalType:0,
				pg:page-1
			})).then(res=>{
				uni.hideLoading();
				console.log(res.data.pointList);
				
				if(res.data.code==0){
					this.tableData = res.data.pointList.datas;
					this.total = res.data.pointList.pgInfo.total_num
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
			this.$http("userCapitalListUser",JSON.stringify({
				token: uni.getStorageSync("token"),
				capitalType:0,
				pg: this.pageCurrent-1
			})).then(res=>{
				if (res.data.code == 0) {
					let arr = res.data.eggList.datas;
					
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
	font-size: 30upx;
	padding: 20upx;
	background: #f5f5f5;
	height: 100%;
	margin-bottom: 30upx;
}
.contentData {
	height: 100vh;
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
.text_x{
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}
</style>
