<template>
	<view class="container">
		<view class="top ymcode_ml"></view>
		<view class="content">
			<view class="entrance">
				<view class="title">销售业绩</view>
				<view class="navs">
					<view class="num">{{xsyj_td}}</view>
					<view class="b-btn" @click="navcode()">去邀请</view>
				</view>
				<view class="params">
					<span>直推业绩:&nbsp;&nbsp;{{xsyj}}元</span>
					<span>团队业绩:&nbsp;&nbsp;{{xsyj_td}}元</span>
					<span>直推成员:&nbsp;&nbsp;{{num_yx}}/{{num}}</span>
					<span>团队成员:&nbsp;&nbsp;{{num_td_yx}}/{{num_td}}</span>
					<span>大区:&nbsp;&nbsp;&nbsp;&nbsp;{{userid_dq}}</span>
					<span>大区业绩:&nbsp;&nbsp;{{xsyj_dq}}元</span>
				</view>
			</view>
		</view>
		
		<view class="member-news">
				<view class="header">
					<view class="title">团队成员信息</view>
				</view>
				<view class="list">
					<view v-for="(item, index) in tableData" :key="index" :class="[item.user_flmc=='客官'?'item':'item2']">
						<view class="lab">
							<view class="left">
								<text class="name">账号：</text>
								<text class="val b1">{{ item.userid }}</text>
							</view>
							<view class="right">
								<text class="name">级别：</text>
								<text class="val" v-if="item.user_flmc=='客官'">{{ item.user_flmc }}</text>
								<text class="val r1" v-else>{{ item.user_flmc }}</text>
							</view>
						</view>
						<view class="lab">
							<view class="left">
								<text class="name">名称：</text>
								<text class="val">{{ item.username }}</text>
							</view>
							<view class="right">
								<text class="name2">注册时间：</text>
								<text class="val">{{date_format(item.reg_time)}}</text>
							</view>
						</view>
						<view class="lab">
							<view class="left">
								<text class="name2">直推成员：</text>
								<text class="val2">{{ item.num_yx }}/{{ item.num }}</text>
							</view>
							<view class="right">
								<text class="name2">团队成员：</text>
								<text class="val2">{{ item.num_td_yx }}/{{ item.num_td }}</text>
							</view>
						</view>
						<view class="lab">
							<view class="left">
								<text class="name2">直推业绩：</text>
								<text class="val2 r1">{{ item.xsyj/100 }}元</text>
							</view>
							<view class="right">
								<text class="name2">团队业绩：</text>
								<text class="val2 r1">{{ item.xsyj_td/100 }}元</text>
							</view>
						</view>
						<view class="lab">
							<view class="left">
								<text class="name">大区：</text>
								<text class="val">{{ item.userid_dq }}</text>
							</view>
							<view class="right">
								<text class="name2">大区业绩：</text>
								<text class="val2 r1">{{ item.xsyj_dq/100 }}元</text>
							</view>
						</view>
					</view>
							
		
				</view>
		</view>
		
		<!-- <view class="txts">{{txt}}</view> -->
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
				loading: false,
				txt: '',
				//直推num，有效直推num_yx  团队num_td 有效团队num_td_yx
				num: 0,
				num_yx:0,
				num_td:0,
				num_td_yx:0,
				yqm:'',
				//直推业绩xsyj  团队业绩xsyj_td
				xsyj:0,
				xsyj_td:0,
				xsyj_dq:0,
				userid_dq:''
			}
		},
		onLoad(){
			if (uni.getStorageSync('userid')) {
				this.showinfo()
				this.setxts()
				this.get_user()
			}else{//未登录
				uni.redirectTo({
					url:'/pages/public/login'
				})
			}
			
		},
		
		onReachBottom() {
			setTimeout(() => {
				this.load_more();
				//console.log(this.tableData)
			}, 500);
		},
		
		methods: {
			showinfo(page=1){
				this.$http("userListUser",JSON.stringify({
						mobile: '',
						username: '',
						userid: this.userid,
						pg:page-1	
					})).then(res=>{
						this.tableData = res.data.para.users
						this.total = res.data.para.pgInfo.total_num
						this.loading = false
					}).catch(err=>{
						console.log(err);
					})
		
			},
			
			//加载下一页
			load_more(){
				this.pageCurrent++
				this.$http("userListUser",JSON.stringify({
						mobile: '',
						username: '',
						userid: this.userid,
						pg:this.pageCurrent-1	
					})).then(res=>{
						if (res.data.code == 0) {
							let arr = res.data.userList.datas
							
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
			},
			
			//获取文本注释
			setxts(){
				
				this.$http("txtGet",JSON.stringify({
						txtid: "QDRSSM",
						userid: this.userid,
					})).then(res=>{
						this.txt = res.data.para.txt
					}).catch(err=>{
						console.log(err);
					})
			},
			
			get_user(){
				this.$http("userInfo",JSON.stringify({
						userid: this.userid,
					})).then(res=>{
						this.num = res.data.para.num;
						this.num_yx = res.data.para.num_yx;
						this.num_td = res.data.para.num_td;
						this.num_td_yx = res.data.para.num_td_yx;
						this.yqm = res.data.para.yqm
						this.xsyj = Number(res.data.para.xsyj)/100
						this.xsyj_td = Number(res.data.para.xsyj_td)/100
						this.userid_dq = res.data.para.userid_dq
						this.xsyj_dq = Number(res.data.para.xsyj_dq)/100
					}).catch(err=>{
						console.log(err);
					})
			},
			
			navcode(){
				let urlcode= "/pages/spread/qrcode?yqm="+this.yqm
				uni.navigateTo({
					url: urlcode
				})
			},
			date_format(str){
				return str.substring(0,10)
			}
			
		}
	}
</script>

<style lang='scss' scoped>
page {
		padding-top: 40rpx;
	}

.top {
	position: relative;
	width: 100%;
	height: 200rpx;
	padding: 20rpx 30rpx 0rpx;
	
}

.content {
	padding: 0 30rpx;
}

.entrance {
	position: relative;
	margin-top: -120rpx;
	margin-bottom: 30rpx;
	border-radius: 10rpx;
	background-color: #ffffff;
	box-shadow: $box-shadow;
	padding: 30rpx 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 280rpx;
	display: flex;
	flex-direction: column;
	
	.title{
		width: 100%;
		position: relative;
		padding: 10rpx 0;
		font-size: 28rpx;
		margin-top: 20rpx;
	}
	
	.navs{
		width: 100%;
		height: 70rpx;
		margin-bottom: 20rpx;
		.num{
			display: block;
			float: left;
			font-size: 48rpx;
			color: #FD7031;
			height: 70rpx;
			line-height: 70rpx;
		}
		
		.b-btn{
			width: 140rpx;
			height: 50rpx;
			text-align: center;
			line-height: 50rpx;
			font-size: 28rpx;
			color: #ffffff;
			border-radius: 20px;
			background: linear-gradient(left, #FD7031, #FD7031);
			display: block;
			float: right;
			margin-top: 10rpx;
		}
	}
	
	.params{
		width: 100%;
		border-top:2rpx solid #DDDDDD;
		padding: 20rpx 0;
		
		span{
			display: block;
			float: left;			
			font-size: 28rpx;
			height: 40rpx;
			line-height: 40rpx;
			width: 320rpx;
		}


	}
}

.uni-container{
	font-size: 20rpx;
	margin-top: 20rpx;
}
	
.uni-group {
		display: flex;
		align-items: center;
}

.txts{
	margin-top: 80rpx;
	padding: 0 20rpx;
}

.nav{
	font-size: 30rpx;
	padding: 30rpx;
}

.member-news {
	width: 100%;
	padding: 0 30rpx;
	background-color: #F5F6F9;
	
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 0;
		
		.title {
			font-size: 28rpx;
			font-weight: bold;
		}
	}
	
	.list {
		width: 100%;
		display: flex;
		flex-direction: column;
		
		.item {
			width: 100%;
			position: relative;
			padding: 20rpx;
			font-size: 26rpx;
			background-color: #FFFFFF;
			margin-bottom: 20rpx;
					
		}
		
		.item2{
				width: 100%;
				position: relative;
				padding: 20rpx;
				font-size: 26rpx;
				background-color: #FAEAE1;
				margin-bottom: 20rpx;
		}
		
		.lab{
			width: 100%;
			height: 40rpx;
			
			.left{
				display: block;
				float: left;
				margin-right: 10rpx;
			}
			
			.right{
				display: block;
				float: left;
			}
			
			.name{
				display: block;
				float: left;
				width: 90rpx;
			}
			
			.val{
				display: block;
				float: left;
				width: 200rpx;
			}
			
			.name2{
				display: block;
				float: left;
				width: 150rpx;
			}
			
			.val2{
				display: block;
				float: left;
				width: 140rpx;
			}
			
		}
	}
}

.r1{
	color: #FD7031;
}

.b1{
	font-weight: 500;
}


			
</style>
