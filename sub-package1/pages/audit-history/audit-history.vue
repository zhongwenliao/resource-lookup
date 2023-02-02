<template>
	<uni-base-page class="uni-base-page" style="background-color: #f5f5f5;">
		<!--自定义导航栏-->
		<uni-nav-bar background-color="#fff" color="#000" :status-bar="status_bar" :title="`${appointment['audit-logging']}` || '审核记录'"
			@clickLeft="clickNavLeft()">
			<!-- 导航栏左侧插槽 -->
			<view slot="left">
				<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/left.png" mode="" style="width: 15px;height: 15px;"></image>
			</view>
		</uni-nav-bar>
		<!--自定义导航栏end-->
		<view class="list-view-container">
			<ul class='list-ul-container'>
				<li class="list-item-container" v-for= "(item,index) in visAuditList" :key="index" style="background-color: #FFFFFF;">
					<view class="list-item top-title-item">
						<view class="top-title">{{ item.visitedPlace }}</view>
						<view class="status-tab" style="background: #1E90FF;color: #fff;" v-if="item.reviewStatus == 0">{{ appointment["to-audit"] || "待审核" }}</view>
						<view class="status-tab" style="background: #1E90FF;color: #fff;" v-else-if="item.reviewStatus == 1">{{ appointment["passed"] || "已通过" }}</view>
						<view class="status-tab" v-else="item.reviewStatus == 2">{{ appointment["rejected"] || "已驳回" }}</view>
					</view>
					<view class="list-item">
						<view class="left-name">{{ appointment["vis-name"] || "访客姓名" }}:</view>
						<view class="right-info">{{ item.name }}</view>
					</view>
					<view class="list-item">
						<view class="left-name">{{ vis["visitor-phone"] || "访客手机" }}:</view>
						<view class="right-info">{{ item.phone }}</view>
					</view>
					<view class="list-item">
						<view class="left-name">{{ appointment["appoint-start-time"] || "预约开始时间" }}:</view>
						<view class="right-info">{{ item.accStartdatetime }}</view>
					</view>
					<view class="list-item">
						<view class="left-name">{{ appointment["appoint-end-time"] || "预约结束时间" }}:</view>
						<view class="right-info">{{ item.accEnddatetime }}</view>
					</view>
				</li>
			</ul>
			<view class="" style="text-align: center;padding-top: 50%;" v-if="visAuditList.length == 0">
				{{ common["no-data"] || "暂无数据" }}
			</view>
		</view>
	</uni-base-page>
</template>

<script>
	var currPage = 1;
	export default {
		data() {
			return {
				visAuditList: [],
				type: "",
				status_bar: true
			}
		},
		
		computed: {
			appointment() {
				return this.$t("appointment");
			},
			vis() {
				return this.$t("vis");
			},
			title() {
				return this.$t("title")
			},
			common() {
				return this.$t("common");
			}
		},
		
		methods: {
			// 点击导航栏左侧
			clickNavLeft() {
				if(this.type == '1'){
					uni.navigateBack({
						delta: 2
					})
				}else{
					uni.navigateBack({
						delta: 1
					})
				}
			},
			//获取访客预约审核记录列表
			getVisRecord() {
				this.$req.request ({
					url: "/visRecord/app/list",
					data: {
						communityId: this.$getUserInfo().currentCommunity.id,
						currPage: currPage,
						pageSize: 10
					},
					success: res => {
						let visAuditList = res.data.list;
						this.visAuditList = this.visAuditList.concat(res.data.list);
					}
				})
			},
			
		},
		onLoad(options) {
			this.type = options.type
		},
		onShow() {
			currPage = 1;
			this.visAuditList = [];
			this.getVisRecord();
		},
		onPullDownRefresh() {
			currPage = 1;
			this.visAuditList = [];
			this.getVisRecord();
		},
		onReachBottom() {
			currPage++;
			this.getVisRecord();
		}
	}
</script>

<style lang="scss">
	
</style>
