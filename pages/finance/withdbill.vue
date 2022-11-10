<template>
	<view>
		<view class="uni-container">
			<uni-table ref="table" :loading="loading" border stripe emptyText="暂无更多数据">
				<uni-tr>
					<uni-th width="10" align="center">金额(元)</uni-th>
					<uni-th width="20" align="center">时间</uni-th>
					<!-- <uni-th width="20" align="center">用户</uni-th> -->
					<uni-th width="20" align="center">银行卡号</uni-th>
					<!-- <uni-th width="10" align="center">手机号</uni-th> -->
					<uni-th width="20" align="center">状态</uni-th>
				</uni-tr>
				<uni-tr v-for="(item, index) in tableData" :key="index">
					<uni-td align="center">{{ item.je/100 }}</uni-td>
					<uni-td align="center">{{ item.tx_time }}</uni-td>
					<!-- <uni-td align="center">{{ item.uname }}</uni-td> -->
					<uni-td align="center">{{ item.cardnum }}</uni-td>
					<!-- <uni-td align="center">{{ item.mobile }}</uni-td> -->
					<uni-td align="center">{{ item.ztmc }}</uni-td>
				</uni-tr>
			</uni-table>
			<view class="uni-pagination-box">
				<uni-pagination show-icon :page-size="pageSize" :current="pageCurrent" :total="total" @change="change" />
			</view>
		</view>
	</view>
</template>

<script>
	import BASE_URL from '../../utils/api.js'

	export default {
		data() {
			return {
				userid: uni.getStorageSync("userid"),
				tableData: [],
				// 每页数据量
				pageSize: 20,
				// 当前页
				pageCurrent: 1,
				// 数据总量
				total: 0,
				loading: false
			}
		},
		onLoad(){
			if (uni.getStorageSync('userid')) {
				this.showinfo()
			}else{//未登录
				uni.redirectTo({
					url:'/pages/public/login'
				})
			}
			
		},
		methods: {
			showinfo(page=1){	
				
				this.$http("txBankListUser",JSON.stringify({
						userid: this.userid,
						tx_time:'',
						pg:page-1
					})).then(res=>{
					console.log(res.data.para)
					this.tableData = res.data.para.txs
					this.total = res.data.para.pgInfo.total_num
					this.loading = false
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
page {
		padding-top: 40rpx;
	}

.uni-container{
	font-size: 20rpx;
}
	
.uni-group {
		display: flex;
		align-items: center;
}

</style>
