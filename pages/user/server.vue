<template>
	<view class="content">
		<view v-if="flag">
			<view class="top"><image src="/static/nav/scontent.png"></image></view>
			<view class="blcoks">
				<view><text class="t1">您未开通服务中心</text></view>
				<view style="padding: 0 80rpx;"><text class="t2">{{title}}</text></view>
			</view>
		</view>
		<view v-else>
			<view class="info">
				<view><text class="t2">当前余额(元)</text></view>
				<view class="n1">
					<view class="num">{{dqye}}</view>
					<view class="b-btn" @click="navcode()">提取</view>
				</view>
				<view class="n2">
					<text class="t4">会员数: {{num_yx}}/{{num}}</text>
					<text class="t5">销售业绩: {{xsyj}}</text>
				</view>
				<view class="n3">
					<text>服务中心名称: {{groupname}}</text>
					<text>顶点用户: {{uid}}</text>
					<text>补贴比例:{{btbl}}%</text>
				</view>
			</view>
			
			<view class="uni-container">
				<uni-table ref="table" :loading="loading" border stripe emptyText="暂无更多数据">
					<uni-tr>
						<uni-th width="40" align="center">时间</uni-th>					
						<uni-th width="20" align="center">当前余额(元)</uni-th>
						<uni-th width="20" align="center">变动金额(元)</uni-th>			
						<uni-th width="40" align="center">详情</uni-th>
					</uni-tr>
					<uni-tr v-for="(item, index) in tableData" :key="index">
						<uni-td align="left">{{ item.jl_time }}</uni-td>
						<uni-td align="center">{{ item.ye/100 }}</uni-td>
						<uni-td align="center"><text style="color: #FD7031;">{{ item.sz==1?"+":"-" }}{{ item.je/100 }}</text></uni-td>				
						<uni-td align="left">{{ item.txt }}</uni-td>
					</uni-tr>
				</uni-table>
				<view class="uni-pagination-box">
					<uni-pagination show-icon :page-size="pageSize" :current="pageCurrent" :total="total" @change="change" />
				</view>
			</view>
			
			
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userid:uni.getStorageSync("userid"),
				flag:false,
				title:'',
				dqye:0,
				num:0,
				num_yx:0,
				xsyj:0,
				uid:'',
				groupname:'',
				btbl:0,
				groupid:0,
				// 数据
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
		onLoad(option){
			  if (uni.getStorageSync('userid')){
					console.log("存在userid")
					this.uerinfo()
					
			  }else{						
				uni.navigateTo({
					url:'/pages/public/login'
				})
			}
		},
		methods: {

			uerinfo(){
				this.$http("groupMy",JSON.stringify({
						userid: this.userid
					})).then(res=>{
						if(res.data.code==0){
							let arr = res.data.para
							this.dqye = Number(arr.dqye)/100
							this.num = arr.num
							this.num_yx = arr.num_yx
							this.xsyj = Number(arr.xsyj)/100
							this.uid = arr.userid
							this.groupname = arr.groupname
							this.btbl = arr.btbl
							this.groupid = arr.groupid
							
							this.showinfo()
						}else{
							this.flag = true
							this.title = res.data.msg							
						}
					}).catch(err=>{
						console.log(err);
					})
			},
					
			showinfo(page=1){
				
				this.$http("groupZjmxList",JSON.stringify({
						groupid: this.groupid,
						userid: this.userid,
						pg:page-1
					})).then(res=>{
						this.tableData = res.data.para.zjmxs
						this.total = res.data.para.pgInfo.total_num
						this.loading = false
					}).catch(err=>{
						console.log(err);
					})	
			},
			
			// 分页触发
			change(e) {
				this.showinfo(e.current)
			},
			
			navcode(){
				if(this.userid == this.uid){
					uni.navigateTo({
						url: "/pages/user/cash"
					})
				}else{
					uni.showToast({
						icon: '只有顶点用户才可以提取资金',
						title: res.data.msg
					})
				}
				
			},
			 
		}
	}
</script>

<style lang="scss" scoped>
.top{
	margin-top: 100rpx;
	text-align: center;
}
.blcoks{
	padding: 30rpx;
	text-align: center;
	
	.t1{
		font-size: 46rpx;
		line-height: 90rpx;
	}
	
}
.t2{
		font-size: 28rpx;
		color: #707070;
}

.info{
	padding: 30rpx;
	width: 100%;
	
	.n1{
		width: 100%;
		height: 110rpx;
		padding: 20rpx 0;
		
		.num{
			display: block;
			float: left;
			font-size: 60rpx;
		}
		
		.b-btn{
			width: 140rpx;
			height: 50rpx;
			text-align: center;
			line-height: 50rpx;
			font-size: 28rpx;
			color: #FD7031;
			border-radius: 20px;
			background: linear-gradient(left, #FFF1EA, #FFF1EA);
			display: block;
			float: right;
			margin-top: 16rpx;
			border: 2rpx solid #FD7031;
		}
	}
	
	.n2{
		width: 100%;
		font-size: 36rpx;
		height: 50rpx;
		
		.t4{
			display: block;
			float: left;			
			width: 350rpx;
		}
		
		.t5{
			display: block;
			float: left;			
			width: 320rpx;
		}
	}
	
	.n3{
		width: 100%;
		height: 100rpx;
		font-size: 24rpx;
		border-top: 2rpx solid #DDDDDD;
		margin-top: 20rpx;
		padding: 20rpx 0;
		
		text{
			display: block;
			float: left;
			margin-right: 60rpx;
		}
	}
}

.uni-container{
	background-color: #F5F6F9;
	padding: 20rpx 0;
}

</style>
