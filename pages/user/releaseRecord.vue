<template>
	<page>
		<z-paging
			ref="paging"
			v-model="dataList"
			@query="getInfo"
			:emptyViewText="'暂无信息,请先发布信息'"
			:emptyViewImg="'/static/home/repairs/fabuxinxi.png'"
			:emptyViewStyle="{ 'margin-top': '-200upx' }"
			:emptyViewImgStyle="{ 'width': '641upx', 'height': '297upx' }">
			<view slot="top" class="">
				<u-navbar title="放行记录"></u-navbar>
			</view>
			<view class="content">
				<view style="" class="boxs" v-for="(item, index) in dataList" @click="record(item)" >
					<view class="boxs-top" v-if>
						<span class="u-font-33">搬运日期:</span>
						<span class="u-font-32 u-m-l-10">{{ item.movingDate }}</span>
						<view class="u-font-32"
							style="float: right; margin-right: 40upx;"
							:class="item.approvalStatus === 0 ? 'bcolor' : (item.approvalStatus === 1 ? (item.approvalStatus === 1 &&
							item.releaseStatus === 0 ? 'bcolor' : item.approvalStatus === 1 && item.releaseStatus === 1 ? '' :
							'rcolor'): 'rcolor')">
							{{ item.approvalStatus === 0 ? "待审核" : (item.approvalStatus === 1 ? (item.approvalStatus === 1 &&
							item.releaseStatus === 0 ? '待放行' : item.approvalStatus === 1 && item.releaseStatus === 1 ? '已放行' :
							'未放行'): '未通过') }}
						</view>
					</view>
					<view class="boxs-center">
						<view class="boxs-center-left">
							<view class="u-m-t-10">房间号：{{ item.room.buildingName + item.room.name }}</view>
							<view class="u-m-t-10">申请人：{{ item.user.userName || '--'}}</view>
							<view class="u-m-t-10">手机号：{{ item.phone }}  </view>
							<view class="u-m-t-10">申请时间： {{ item.createTime }} </view>
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
				// 当前租户id
				userId: uni.getStorageSync("userInfo").id,
				// 列表
				dataList: [],
				
			}
		},
		methods: {
			record(item) {
				this.id = item.id
				this.$Router.push({
					path: '/pages/user/releaseDetails',
					query: { id: item.id }
				});
			},
			// goRepairProgress(item) {
			// 	console.log(item.processingStatus);
				
			// 	if(item.processingStatus === 0 || item.processingStatus === 1 || item.processingStatus === 2 || item.processingStatus === 4 || item.processingStatus === 5) {
			// 		this.$Router.push({
			// 			path: '/pages/home/userComplaints/complaintProgress',
			// 			query: { id: item.id }
			// 		});
			// 	}
			// },
			getInfo(pageNo, pageSize) {
				let that = this
				const params = {
					currPage: pageNo,
					pageSize: pageSize,
					userId: that.userId
				}
				that.$api('user.releaseList', params).then(res => {
					if (res.code == 200) {
						that.$refs.paging.complete(res.data.list)
					} else {
						that.$refs.paging.complete(false);
					}
				}).catch((e) => {
					that.$refs.paging.complete(false);
				});
			},
		}
	}
</script>

<style>
	page{
		background: #F9F9F9;
	}
</style>
<style lang="scss" scoped>
	.rcolor {
		color: #E64340;
	}
	.bcolor {
		color: #3E76F4;
	}
	.chakan {
		position: relative;
		right: 30upx;
		top: -45upx;
		font-size: 24upx;
		width: 120upx;
		padding: 4upx 10upx;
		border-radius: 23upx;
		border: 2rpx solid #000000;
		float: right;
	}
	.content{
		// padding-top: 160upx;
	}
	.boxs{
		background: #FFFFFF;
		border-radius: 15px;
	}
	.boxs-top{
		padding-top: 30upx;
		margin-left: 40upx;
		margin-top: 30upx;
		font-family: PingFang SC;
		font-weight: bold;
	}
	.boxs-center{
		margin-left: 40upx;
		margin-top: 30upx;
		padding-bottom: 30upx;
	}
</style>
