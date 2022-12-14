<template>
	<uni-base-page class="uni-base-page content" style="background-color: #f5f5f5;">
		<view class="list-view-container">
			<ul class='list-ul-container' v-if="visRecordList.length > 0">
				<li class="list-item-container" v-for="record in visRecordList" style="background-color: #FFFFFF;">
					<view class="list-item top-title-item">
						<view class="top-title">{{ record.deviceInstallAddress }}</view>
						<view class="status-tab" v-if="record.status == 1">{{ vis["expired"] || "已过期" }}</view>
						<view class="status-btn" v-else-if="record.status == 0" @click="editPwdPeriod(record)">
							{{ vis["edit"] || "更改" }}</view>
					</view>
					<view class="list-item">
						<view class="left-name">{{ vis["visitor-phone"] || "访客手机" }}:</view>
						<view class="right-info">{{ record.phone }}</view>
					</view>
					<view class="list-item">
						<view class="left-name">{{ vis["relationship"] || "访客关系" }}:</view>
						<view class="right-info">{{ record.remark }}</view>
					</view>
					<view class="list-item">
						<view class="left-name">{{ vis["start-date"] || "开始时间" }}:</view>
						<view class="right-info">{{ record.accStartDateTime }}</view>
					</view>
					<view class="list-item">
						<view class="left-name">{{ vis["end-date"] || "结束时间" }}:</view>
						<view class="right-info">{{ record.accEndDateTime }}</view>
					</view>
				</li>
			</ul>
			<uni-empty-page v-else></uni-empty-page>
		</view>
	</uni-base-page>
</template>

<script>
	var currPage = 1;
	export default {
		data() {
			return {
				visRecordList: []
			}
		},

		computed: {
			vis() {
				return this.$t("vis");
			},
			title() {
				return this.$t("title")
			}
		},

		methods: {
			//获取访客授权记录列表
			getVisRecord() {
				console.log("current page---", currPage)
				this.$api('equipment.getVisitorHistory', {
					currPage: currPage,
					pageSize: 10
				}).then(res => {
					uni.stopPullDownRefresh();
					// console.log("访客授权记录列表---", res.data.list);
					let visRecordList = res.data.list;
					this.visRecordList = this.visRecordList.concat(res.data.list);
				})
			},

			//更改访客密码有效期
			editPwdPeriod(record) {
				uni.navigateTo({
					url: "edit-pwd-period?pwdObj=" + JSON.stringify(record)
				})
			}
		},

		onShow() {
			currPage = 1;
			this.visRecordList = [];
			this.getVisRecord();
		},

		onPullDownRefresh() {
			currPage = 1;
			this.visRecordList = [];
			this.getVisRecord();
		},

		onReachBottom() {
			currPage++;
			this.getVisRecord();
		},

		onReady() {
			this.$setTitle(this.title["vis-pwd-history"]);
		}
	}
</script>
<style>
	page{
		background-color: rgb(245, 245, 245);
	}
</style>
<style lang="scss">
	.status-btn{
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.status-tab{
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.top-title-item{
		padding: 15upx 0 20upx 0 !important;
	}
	.top-title{
		display: flex;
		align-items: center;
	}
</style>
