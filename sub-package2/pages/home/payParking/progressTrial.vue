<template>
	<view class="body">
		<u-navbar style="background:#02A7F0;color: #fff;" title="审批进度"></u-navbar>
		<view class="conter">
			<u-steps :list="numList" mode="number" :current="current"></u-steps>
			<view class="conter-text">
				<view class="text">
					已完成
					<view class="text-size">
						付款时间：
						<view>
							<!-- {{dataInfo.updateTime}} -->
						</view>
					</view>

				</view>
				<view class="text">
					进行中：
					<view class="text-size">
						{{dataInfo.applicationTime}}
					</view>
				</view>
				<view class="text">
					审批成功：{{dataInfo.reviewTimeProperty}}
					
				</view>
			</view>
		</view>
		<u-gap height="1" bg-color="#F2F2F2" margin-bottom="40" margin-top="40"></u-gap>
		<view v-if="dataInfo.applicationStatus==5" class="grounds-rejection">
			<span>驳回理由：	</span>
			<view class="content">
				         {{dataInfo.overruleReasonProperty}}
			</view>
		</view>
		<view v-else-if="dataInfo.applicationStatus==2" class="grounds-rejection">
			<span>驳回理由：	</span>
			<view class="content">
				         {{dataInfo.overruleReasonZone}}
			</view>
		</view>
	<view class="but">
		<view v-if="dataInfo.applicationStatus==0" style="margin: 0 auto;width:600upx;">
			<u-button  @click="looktg" type="primary">返回</u-button>
		</view>
		<view v-if="dataInfo.applicationStatus==1" style="margin: 0 auto;width:600upx;">
			<u-button  @click="checkInfo"  type="primary">去支付</u-button>
		</view>
		<view  v-if="dataInfo.applicationStatus==5||dataInfo.applicationStatus==2" style="margin: 0 auto;width:600upx;">
			<u-button  @click="reapply"   type="primary">重新申请</u-button>
		</view>
	</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				numList: [{
					name: '申请提交'
				}, {
					name: '内部审核'
				}, {
					name: '驳回'
				}, {
					name: '审批成功'
				}, ],
				current:0,
				id:0,
				status:false,
				dataInfo:{},
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
							console.log(126)
							if(this.dataInfo.applicationStatus===0){
								this.current=0
							}else if(this.dataInfo.applicationStatus===1){
								this.current=1
							}else if(this.dataInfo.applicationStatus==5||this.dataInfo.applicationStatus==2){
								this.current=2
							}else{
								this.current=3
							}
							
							if(this.dataInfo.applicationStatus!==5&&this.dataInfo.applicationStatus!==2){
								this.numList.splice(2,1)
								this.status=false
							}else{
								this.status=true
							}
							
						}
					})
			 },
			 //返回
			 looktg(){
				uni.navigateBack();
			 },
			 //去支付
			 checkInfo(){
				 this.$Router.push({
				 	path: '/pages/home/payParking/successfulApproval',
				 	query:{
				 		id: this.id,
				 	}
				 })
			 },
			 //重新申请
			 reapply(){
				 console.log(123456)
				 this.$Router.push({
				 	path: '/pages/home/payParking/monthlyCardProcessing',
				 	query:{
				 		
				 	}
				 })
			 }
		}
	}
</script>

<style lang="scss" scoped>
	.body {
		.conter {
			margin-top: 60upx;
		}

		.conter-text {
			display: flex;
			width: 100%;
			// margin: 0 40upx;

			.text {
				width: 280upx;
				font-size: 26upx;
				text-align: center;
				color: #22BE9F;
				// background-color: red;
				// height: 40upx;
				.text-size {
					font-size: 20upx;
					color: #ccc;
				}
			}

		}
		.grounds-rejection{
			margin-left: 40upx;
			.content{
				margin: 40upx 0 0 40upx;
			}
		}
		.but{
				width: 100%;
				position: fixed;
				bottom: 40upx;
		}
	}
</style>
