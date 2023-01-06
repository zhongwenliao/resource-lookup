<template>
	<page>
		<u-navbar style="background:#02A7F0;color: #fff;" title="月卡管理">
			<view style=" width: 100%; text-align: right; ">申请记录</view>
		</u-navbar>
		<view>
			<scroll-view class="bobo" v-if="dataList.length!==0">
				<view class="monthly-management" v-for="(item,index) in dataList">
					<view class="car-information" @click="detail(item.id)">
						<view>
							{{item.parkingSpaceNumber}}
						</view>
						<view>
							有效期至{{item.endDate}}
						</view>
					</view>
					<view class="postpone">
						<view class="car-status">
							<span>{{item.statusName}}</span>
						</view>
						<u-button v-if="item.status==1||item.status==2" @click="applyForGo(item.type,item.id)" :custom-style="customStyle">申请延期</u-button>
						<u-button v-if="item.status==0" @click="iewProgress(item.id)" :custom-style="customStyle">查看进度</u-button>
					</view>
				</view>
				<!-- <view class="bobo-a">1、请提供月卡申请人身份证复印件;</view>
				<view class="bobo-a">2、请提供办理车辆行驶证复印件;</view>
				<view class="bobo-a">3、前往微谷A座155物业办公室申请办理;</view> -->
			</scroll-view>
			<view  class="bobo no-data-view" style="color: black;"  v-else>
				暂无数据
			</view>

			<view class="apply-for">
				<u-button @click="applyForGo(0,0)" :custom-style="applyFor">申办月卡</u-button>
			</view>
		</view>

	</page>

</template>

<script>
	export default {
		data() {
			return {
				//申请延期按钮样式
				customStyle: {
					backgroundColor: '#02A7F0',
					color: '#F2F2F2',
					height: '60upx'
				},
				applyFor: {
					backgroundColor: '#02A7F0',
					color: '#F2F2F2',
					// height:'60upx'
				},
				listParams: {
					currPage: 1,
					pageSize: 15,
					userId: uni.getStorageSync("userInfo").id,
				},
				dataList: []

			}
		},
		onLoad() {
			this.queryData()
		},
		/*下拉刷新*/
		onPullDownRefresh: function() {
			this.queryData()
		},
		/*上拉加载*/
		onReachBottom: function() {
			this.queryDataAdd()
		},
		methods: {
			queryData() {
				uni.showLoading({
					title: '加载中'
				});
				this.listParams.currPage = 1
				this.listParams.pageSize = 15
				this.$api('monthCard.parkUserInfolist', this.listParams)
					.then(res => {
						if (res.code == 200) {
							this.dataList = res.data.list
							this.dataList = this.arrFilter(this.dataList)
							uni.hideLoading();
							uni.stopPullDownRefresh(); //得到数据后停止下拉刷新
							console.log(res)
						}
					})
			},
			//获取申办记录列表
			queryDataAdd() {
				const that = this
				this.dataStatus = false
				uni.showLoading({
					title: '加载中'
				});
				this.listParams.currPage++
				this.listParams.pageSize = 15
				uni.showNavigationBarLoading();
				this.$api('monthCard.parkUserInfolist', this.listParams).then(res => {
					console.log(res);
					if (res.code == 200) {
						this.dataList = this.dataList.concat(res.data.list);
						this.dataList = this.arrFilter(this.dataList)
						uni.hideLoading();
						uni.hideNavigationBarLoading(); //关闭加载动画
						
					}
				})
			},
			arrFilter(arr){
				if(arr.length===0) return arr 
					// this.
					arr.forEach(item=>{
						if(item.status==0){
							item.statusName= '未生效'
						}else if(item.status==1){
							item.statusName= '已生效'
						}else if(item.status==2){
							item.statusName= '已过期'
						}else if(item.status==3){
							item.statusName= '下发失败'
						}
					})
					return arr
					
			},

			applyForGo(type,id) {
				console.log(type)
				this.$Router.push({
					path: '/sub-package2/pages/home/payParking/monthlyCardProcessing',
					query: {
						type: type,
						id:id,
					}
				})
			},
			iewProgress(id) {
				this.$Router.push({
					path: '/sub-package2/pages/home/payParking/progressTrial',
					query: {
						id:id,
					}
				})
			},
			detail(id) {
				this.$Router.push({
					path: '/sub-package2/pages/home/payParking/monthlyCardDetail',
					query: {
						id: id,
					}
				})
			},
		}
	}
</script>
<style>
	page {
		background: #F2F2F2;
	}
</style>
<style>
	.bobo {
			width: 100%;
	}

	.bobo-a {
		margin-top: 20upx;
		color: #333333;
		font-family: PingFang SC;
	}

	.monthly-management {
		background-color: #fff;
		width: 96%;
		margin: 20upx auto;
		display: flex;
		justify-content: space-between;
		height: 140upx;
	}

	.postpone {
		margin-top: 15upx;
		width: 30%;
		margin-right: 20upx;
	}

	.car-information {
		margin-top: 20upx;
		margin-left: 20upx;
		line-height: 50upx;
		font-size: 28upx;
	}

	.car-status {
		color: #FD8804;
		font-size: 26upx;
		width: 100%;
		text-align: right;
		margin-bottom: 10upx;
	}

	.apply-for {
		position: fixed;
		bottom: 5%;
		width: 90%;
		margin: 0 5%;
	}
	.no-data-view{
		margin-top: 200upx;
		width: 100%;
		text-align: center;
	}
</style>
