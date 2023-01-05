<template>
	<view class="body">
		<u-navbar style="background:#02A7F0;color: #fff;" :title="id>0?'申请成功':'延期成功'"></u-navbar>
		<view class="head">
			<span>审批成功</span> 
			<image class="img" src="http://yuanzhoulvwego.com/wp-content/uploads/static/home/employeeManagement/tijiao.png" mode=""></image>
		</view>
		<view class="month-card-info">
			<view class="title">
				月卡信息
			</view>
			<view class="conter">
				<view >月卡编号：<span>{{dataInfo.parkingSpaceNumber}}</span>	</view>
				<view >持卡人姓名：<span>{{dataInfo.userName}}</span>	</view>
				<view>手机号：<span>{{dataInfo.phone}}</span>	</view>
				<view>车牌号：<span  style="color: #4FA7F0;">{{dataInfo.licensePlateNumber}}</span></view>
				<view>月卡开始时间：<span>{{dataInfo.startDate}}</span>	</view>
				<view v-if="dataInfo.type==0">月卡结束时间：<span>{{dataInfo.endDate}}</span>	</view>
				<view v-if="dataInfo.type==1">延长时长：<span>{{dataInfo.parkingSpaceNumber}}</span></view>
				<view v-if="dataInfo.type==1">有效期至：<span>{{dataInfo.parkingSpaceNumber}}</span> <span style="color: #FA9504;">有效</span>	</view>
				<view v-if="dataInfo.type==1">本次延期：<span>{{dataInfo.parkingSpaceNumber}} -- {{dataInfo.parkingSpaceNumber}}</span>	</view>
				<view v-if="dataInfo.type==1">续费时间：<span>{{dataInfo.parkingSpaceNumber}}</span>	</view>
				<view v-if="dataInfo.type==1">审核时间：<span>{{dataInfo.parkingSpaceNumber}}</span>	</view>
				<view>缴纳费用：<span style="color: #4FA7F0;">{{dataInfo.amountReceivable}}</span></view>
			</view>
			<view class="but">
				<view style="margin: 0 auto;width: 400upx;">
					<u-button @click="goRouter" type="primary">支付</u-button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id: 0,
				dataInfo:{}
			}
		},
		onLoad() {
			this.id = this.$Route.query.id
			this.queryData()
		},
		methods:{
			 queryData(){
				 	this.$api('monthCard.parkUserInfoGetById', {id:this.id}).then(res => {
						console.log(res)
						if(res.code==200){
							this.dataInfo = res.data
						}
					})
			 },
			goRouter(){
				// 
			 let obj={
					id:this.id,
					amountReceived:this.dataInfo.amountReceivable,
					type:'Android',
				}
				if(uni.getSystemInfoSync().platform==='ios'){
					obj.type='iOS'
				}else if(uni.getSystemInfoSync().platform==='android'){
					obj.type='Android'
				}else{
					obj.type='Wap'
				}
				this.$api('monthCard.parkUserInfoPayment', obj).then(res => {
					console.log(res)
					if(res.code==200){
						uni.showLoading({
							title: "支付成功"
						});
						setTimeout(()=>{
							uni.navigateBack({
								delta: 1 // 返回的页面数
							})
						},1000)
						// this.dataInfo = res.data
					}
				})
				
				// this.$Router.push({
				// 	path: '/pages/home/payParking/progressTrial',
				// 	query:{
				// 		id: 0,
				// 	}
				// })
			},
		}
		// methods:{
	
		// }
	}
</script>

<style lang="scss" scoped>
	.body{
	
		.head{
			width: 100%;
			text-align: center;
			margin: 60upx 0;
			color: #02A7F0;
			font-size: 40upx;
			.img{
				width: 50upx;
				height: 50upx;
				margin-left: 20upx;
			}
		}
		
		.month-card-info{
			width: 96%;
			margin: 20upx 2%;
			.title{
				font-weight: 300;
				font-size: 32upx;
				margin-left: 40upx;
				margin-bottom: 20upx;
			}
			.conter{
				margin-left: 80upx;
				font-size: 30upx;
				view{
					line-height: 60upx;
				}
			}
		}
		
		
		.but{
				width: 100%;
				position: fixed;
				bottom: 40upx;
		}
	}
	
</style>
