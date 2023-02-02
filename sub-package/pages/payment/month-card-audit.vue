<template>
	<view class="manage">
		<view class="top">
			<image v-if="cardInfo.status == 1" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/payment/jxz.png" mode=""></image>
			<image v-if="cardInfo.status == 3" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/payment/bh.png" mode=""></image>
		</view>
		<view class="auditStatus clear">
			<view class="item fl">
				<view class="green">
					申请提交
				</view>
				<view class="green">
					已完成
				</view>
				<view class="gray">
					付款时间：
				</view>
				<view class="gray" style="font-size: 24upx;">
					{{cardInfo.createTime}}
				</view>
			</view>
			<view class="item fl">
				<view class="green">
					内部审批
				</view>
				<view class="green">
					进行中
				</view>
				<view class="gray">
					3-5个工作日
				</view>
			</view>
			<view class="item fl">
				<view class="gray">
					审批成功
				</view>
			</view>
		</view>
		<view class="reject" v-if="cardInfo.status == 3 && cardInfo.rejectRemark">
			<view class="">
				驳回理由：
			</view>
			<view class="">
				{{cardInfo.rejectRemark}}
			</view>
		</view>
		<view class="back" @click="back" v-if="cardInfo.status == 1">
			<button>返回</button>
		</view>
		<view class="back" @click="anew"  v-if="cardInfo.status == 3">
			<button>重新申请</button>
		</view>
	</view>
</template>

<script>
	export default {
		data(){
			return{
				cardInfo:{}
			}
		},
		methods:{
			back(){
				uni.navigateBack({
					delta: 1
				})
			},
			anew(){
				if(this.cardInfo.type == 2){
					uni.navigateTo({
						url: "apply-month-card"
					})
				}else if(this.cardInfo.type == 3){
					uni.navigateTo({
						url: "month-card-postpone"
					})
				}
			}
		},
		onLoad(option) {
			this.cardInfo = JSON.parse(option.item)
		}
	}
</script>

<style>
	.manage{
		width: 100%;
		border-top: 1px solid #eee;
	}
	.top{
		width: 70%;
		margin: auto;
		margin-top: 40upx;
		margin-bottom: 20upx;
	}
	.top image{
		display: block;
		width: 100%;
		height: 56upx;
	}
	.auditStatus{
		width: 94%;
		margin: auto;
	}
	.auditStatus .item{
		width: 33.3%;
		text-align: center;
	}
	.auditStatus .item view{
		font-size: 30upx;
	}
	.green{
		color: #088b68;
	}
	.reject{
		margin: 40upx 30upx;
	}
	.reject view{
		font-size: 30upx;
	}
	.back {
		width: 100%;
		position: fixed;
		bottom: 0;
		left: 0;
		height: 88upx;
		padding-bottom: 40upx;
		z-index: 1;
	}
	.back button {
		width: 80%;
		height: 88upx;
		line-height: 88upx;
		background: linear-gradient(118deg, #01dca3 0%, #088b68 100%);
		box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
		border-radius: 50upx 50upx 50upx 50upx;
		color: #ffffff;
	}
</style>
