<template>
	<uni-base-page style="background: #FFFFFF; width: 100%;">
		<view class="point-box">
			{{ totalPoints }}
		</view>
		<view class="gift-box">
			<view class="point-title">积分记录</view>
			<!-- <uni-tab :tab-list="tabList" :tabCur.sync="tabCur" tab-class="points-tab" select-class= "text-green" textFlex @change="tabChange"></uni-tab> -->
			<ul>
				<li v-for="(record, index) in pointRecordList" :key="index">
					<view class="li-left">{{ record.integralDescription }}</view>
					<view class="li-mid">{{ record.createTime }}</view>
					<view class="li-right">+{{ record.integralNumber }}</view>
				</li>
			</ul>
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				tabList: [{
					name: "积分兑换"
				}, {
					name: "积分记录"
				}],
				tabCur: 0,
				pointRecordList: [],
				totalPoints: null
			}
		},
		
		methods: {
			// 获取开门积分记录
			getPointRecordList() {
				this.$req.request({
					url: "/appIntegral/app/getList",
					success: res => {
						this.pointRecordList = res.data;
					}
				})
			}
		},
		
		onLoad(options) {
			if(options.points) {
				this.totalPoints = options.points;
			}
			this.getPointRecordList();
		}
	}
</script>

<style>
	.point-box {
		font-family: Arial, Helvetica, sans-serif;
		background: linear-gradient(#478a56, #9bd697) ;
		color: #FFFFFF;
		text-align: center;
		font-size: 100upx;
		font-weight: bold;
		height: 400upx;
		line-height: 400upx;
	} 
	
	.gift-box {
		width: 100%;
		background-color: #FFFFFF; 
		border-top-left-radius: 50upx;
		border-top-right-radius: 50upx;
		/* height: 70%; */
	}
	
	.gift-box ul {
		padding: 0;
	}
	
	.gift-box ul li{
		width: 94%;
		padding: 20upx 3%;
		/* border-bottom: 1upx solid #DDDDDD; */
	}
	
	.points-tab {
		color: #005500;
	}
	
	.text-green {
		color: #005500;
	}
	
	.li-left {
		display: inline-block;
		width: 40%;
		text-align: left;
		color: #005500;
	}
	
	.li-mid {
		display: inline-block;
		width: 40%;
		text-align: center;
		color: #DDDDDD;
	}
	
	.li-right {
		display: inline-block;
		width: 20%;
		text-align: right;
		color: #ffaa00;
		font-weight: bold;
	}
	
	.point-title {
		width: 100%;
		text-align: center;
		padding: 20upx;
		color: #005500;
	}
	
	
</style>
