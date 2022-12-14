<template>
	<page class="body">
		<z-paging ref="paging" v-model="dataList" @query="getInfo">
			<view slot="top" class="">
				<u-navbar title="我的消息" :border-bottom="false"></u-navbar>
			</view>
			<view class="content">
				<view  v-for="(item,index) in dataList">
					<view class="content-text">
						<text>{{item.createTime}}</text>
					</view>
					<view class="card">
						<view class="head">
							<view class="head-left">
								{{item.title}}
							</view>
						</view>
						<view class="body">
							<view class="body-text body-but-box">
								<text>{{item.center}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</z-paging>
	</page>
</template>

<script>
	export default {
		data() {
			return {
				dataList: [{
					time: '2022-12-23 14:23:05',
					title: '停车消息',
					center: '您的停车月卡申请已审核通过，请尽快前往停车缴费界面支付月卡费用。'
				},{
					time: '2022-12-23 14:23:05',
					title: '报修消息',
					center: '您的报修问题现已处理完成。如有问题请联系园区管理处工作人员反馈，期待您的评价哦！'
				},{
					time: '2022-12-23 14:23:05',
					title: '预约消息',
					center: '您预约的于本月12号下午14:00-16:00使用的园区1栋会议室1已审核通过，请安排好时间进入。'
				}],
			}
		},
		methods: {
			getInfo(pageNo, pageSize) {
				const params = {
					currPage: pageNo,
					pageSize: pageSize,
				}
				this.$api('user.userInformationList', params).then(res => {
					if (res.code == 200) {
						this.$refs.paging.complete(res.data.list);
					} else {
						this.$refs.paging.complete(false);
					}
			
				}).catch((e) => {
					this.$refs.paging.complete(false);
				});
			}
			
		}
	}
</script>

<style>
	page {
		background-color: #f1f2f3;
	}
</style>

<style scoped lang="scss">
.content { 
	padding: 20upx 20upx 0upx 20upx;
	
	.content-text {
		color: #999999;
		text-align: center;
		line-height: 40upx;
		font-size: 26upx;
	}
	
	.card {
		background: #ffffff;
		border-radius: 15upx;
		margin-bottom: 24upx;

		.head {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 25upx 20upx;
			border-bottom: 1px solid #F1F2F3;

			.head-left {
				font-size: 32upx;
				font-weight: bold;
			}
		}

		.body {
			padding: 30upx 20upx 40upx 20upx;

			.body-text {
				color: #333333;

			}

			.body-but-box {
				display: flex;
				justify-content: space-between;
			}
		}
	}
}
</style>
