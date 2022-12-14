<template>
	<view class="content">
		<uni-tab :tab-list="tabList" :tabCur.sync="tabCur" tab-class="opening-record-view-tab" textFlex @change="tabChange"></uni-tab>
		<swiper :current="tabCur" class="swiper custom-swiper" @change="swiperChange" duration="300" :circular="true"
		 indicator-color="rgba(255,255,255,0)" indicator-active-color="rgba(255,255,255,0)">
			<swiper-item>
				<scroll-view scroll-y="true" class="scroll-view" >
					<ul v-if="repairList.length > 0">
						<li v-for="(item, index) in repairList" class="record" :key="index">
							<view class='first-line'>
								<view class='left-text'>{{ repair["order-id"] || "报修单号" }} {{ item.orderId }}</view>
								<view class='right-text':class="[`repair-status-${item.status}`]">{{ acceptStatus[item.status].status }}</view>
							</view>
							<view class='second-line'  @click='getRepairDetail' :id='item.id' :data-status="item.status">
								<view class="repair-item">
									<view class="repair-left">{{ repair["repair-address"] || "报修地址" }}</view>
									<view class="repair-right">{{ item.cityName }}/{{ item.policeStationName }}/{{ item.communityName }}/{{ item.buildingName }}/{{ item.roomName }}</view>
								</view>
							</view>
							<view class='third-line'>
								<view class="order-time">{{ repair["create-time"] || "下单时间" }} {{ item.createTime }}</view>
								<view class="op-btn"><button :data-status="`${item.status}`" @click="clickBtn" :data-item="item.id">{{ item.btnName }}</button></view>
							</view>
						</li>
					</ul>
					<view v-else class="no-record">暂无维修数据</view>
				</scroll-view>
			</swiper-item>
			<swiper-item>
				<uni-search @input="onInput" style="background-color: #FFFFFF;"/>
				<scroll-view scroll-y="true" class="scroll-view">
					<ul v-if="applyList.length > 0" style="margin-top: 100upx;">
						<li v-for="applyItem in applyList">
							<view class="room-address">
								<view class="left-info">
									<view style="float: left;">
										{{ applyItem.roomFullName }}
									</view>
								</view>
								<view :class="['right-status', `status-${applyItem.isAudit}`]">
									{{ reviewStatusList[applyItem.isAudit] }}
								</view>
							</view>
							<view class="record-info">
								<text class="info-name">{{ "原设备序列号" }}：</text><text>{{ applyItem.devSn }}</text><br>
								<text class="info-name">{{ "申请设备序列号" }}：</text><text>{{ applyItem.newDevSn }}</text><br>
								<text class="info-name">{{ "申请时间" }}：</text><text>{{ applyItem.createTime }}</text><br>
							</view>
							<!-- 根据状态判断：测试门锁、导入门卡、提交竣工信息、已竣工 -->
							<view class="undo" v-if="applyItem.isAudit == 1">
								<view class="uni-list-cell-text" @click="clickStatusBtn(applyItem)">
									<text v-if="applyItem.isTest == 0 && applyItem.isImportCardSuccess == 0 && applyItem.isComplete == 0" style="color: #ffaa00;">测试门锁</text>
									<text v-else-if="applyItem.isTest == 1 && applyItem.isImportCardSuccess == 0 && applyItem.isComplete == 0" style="color: #ff5500;">导卡</text>
									<text v-else-if="applyItem.isTest == 1 && applyItem.isImportCardSuccess == 1 && applyItem.isComplete == 0" style="color: #007AFF;">提交竣工</text>
									<text v-else-if="applyItem.isTest == 1 && applyItem.isImportCardSuccess == 1 && applyItem.isComplete == 1" style="color: #00aa00;">已竣工</text>
								</view>
							</view>
						</li>
					</ul>
					<view v-else class="no-data">暂无申请记录</view>
				</scroll-view>
			</swiper-item>
		</swiper>
		<!-- <view class="bottom-btn-view add-tenant-view">
			<button type="primary" class="primary btn" @click="replaceLock">{{ "申请更换门锁" }}</button>
		</view> -->
	</view>
</template>

<script>
	import uniSearch from '../../components/uni-search/uni-search.vue';
	export default {
		components: {
			uniSearch
		},
		data() {
			return {
				idx: null,
				typeIdx: null,
				index: 0,
				roomId: "",
				phone: "",
				itemPicture: "",
				img: "",
				repairList: [],
				ifHaveRecords: false,
				data: {},
				acceptStatus: [],
				isShow: null,
				btnName: [],
				tabList: [
					{
						name: "维修列表"
					},
					{
						name: "更换门锁"
					}
				],
				tabCur: 0,
				applyList: [],
				reviewStatusList: ["审核驳回", "审核通过"]
			}
		},

		onLoad: function(options) {
			var user = this.$getUserInfo();
			this.phone = user.phone.indexOf("@") > -1 ? "" : user.phone;
			this.acceptStatus = [{
						index: 0,
						status: this.repair["wait"] || "待处理"
					},
					{
						index: 1,
						status: this.repair["handling"] || "处理中"
					},
					{
						index: 2,
						status: this.repair["wait-comment"] || "已完成待评价"
					},
					{
						index: 3,
						status: this.repair["finished"] || "已完成"
					},
					{
						index: 4,
						status: this.repair["revoked"] || "已撤销"
					}
				];
			this.btnName = [
					{
						index: 0,
						name: this.repair["undo"] || "撤销"
					},
					{
						index: 1,
						name: this.repair["detail"] || "查看详情"
					},
					{
						index: 2,
						name: this.repair["detail"] || "查看详情"
					},
					{
						index: 3,
						name: this.repair["detail"] || "查看详情"
					},
					{
						index: 4,
						name: this.repair["detail"] || "查看详情"
					}
				];
			this.textareaValue = this.repair["repair-content"] || "请输入报修内容：（限400字）";
			this.$setTitle("维修列表");
		},
		
		onShow() {
			this.getRepairList();
			this.getLockReplaceList();
		},
		
		computed: {
			common() {
				return this.$t("common")
			},
			repair() {
				return this.$t("repair")
			},
			title() {
				return this.$t("title")
			}
		},

		methods: {
			tabChange(index) {
				this.tabCur = index;
			},
			
			swiperChange(e) {
				let page = e.detail.current;
				this.tabCur = page;
				if (page == 0) {
					this.getRepairList();
				}
			},

			//获取联系电话
			getPhoneNumber(e) {
				this.phone = e.detail.value;
			},

			//关闭弹窗
			closeModal() {
				this.ifRepairModal = false;
				this.roomModalShow = false;
			},

			//调用拍照或从相册选取
			takePhoto() {
				var _this = this;
				uni.chooseImage({
					count: 1,
					sizeType: ['original', 'compressed'],
					sourceType: ['album', 'camera'],
					success: function(res) {
						_this.itemPicture = res.tempFilePaths[0];
						_this.$getImageBase64(res.tempFilePaths[0], (imageBase64) => {
							_this.img = imageBase64;
						});
					},
				})
			},

			//删除照片
			deletePhoto() {
				this.itemPicture = "";
				this.img = "";
			},
			
			//获取报修记录列表
			getRepairList() {
				var communityId = this.$getUserInfo().currentCommunity.id;
				this.$req.request({
					url: '/sysDoorLockRepair/app/getListByInstallEmp',
					data: {
					},
					method: "POST",
					success: res => {
						if(res.data.length == 0) {
							this.ifHaveRecords = false;
						}else {
							this.ifHaveRecords = true;
							this.repairList = res.data;
							for(let i in this.repairList) {
								for(let j in this.btnName) {
									if(this.repairList[i].status == this.btnName[j].index) {
										this.repairList[i].btnName = this.btnName[j].name;
									}
								}
							}
						}
						uni.stopPullDownRefresh();
					}
				})
			},
			
			//获取记录详情
			getRepairDetail(e) {
				uni.navigateTo({
					url:"detail?itemId=" + e.currentTarget.id + "&status=" + e.currentTarget.dataset.status + "&isStaff=1",
				})
			},
			
			//点击下方按钮
			clickBtn(e) {
				var that = this;
				var status = e.currentTarget.dataset.status;
				var itemId = e.currentTarget.dataset.item;
				if(status == 0) {
					uni.showModal({
						title: that.repair["undo-tips"] || "撤销提示",
						content: that.repair["undo-confirm"] || "是否确定撤销报修申请？",
						confirmText: that.common["confirm"] || "确认",
						cancelText: that.common["cancel"] || "取消",
						success:function(res){
							if(res.confirm) {
								//执行撤销
								uni.debugLog("用户点击确定");
								that.cancelRecord(itemId);
							} else if(res.cancel) {
								uni.debugLog("用户点击取消");
							}
						}
					})
				} else {
					//查看详情
					uni.navigateTo({
						url:"detail?itemId=" + itemId + "&status=" + status + "&isStaff=1",
					})
				}
				
			},
			//撤销报修记录
			cancelRecord(id) {
				this.$req.request({
					url:"/sysDoorLockRepair/app/updateById",
					data: {
						id: id
					},
					success: res => {
						if(res.code == 0) {
							uni.showToast({
								title: this.repair["undo-success"] || "撤销成功",
								icon: "none",
								confirmText: this.common["confirm"] || "确认",
								cancelText: this.common["cancel"] || "取消",
								duration: 1000
							})
							this.currentIndex = 1;
							this.getRepairList();
						}
					}
				})
			},
			
			//更换门锁
			replaceLock() {
				uni.navigateTo({
					url: "../../sub-package/pages/door-lock/door-lock?type=3"
				})
			},
			
			//获取门锁更换记录
			getLockReplaceList() {
				this.$req.request({
					url: "/sysDoorLockReplace/app/list",
					data: {
						applicantId: this.$getUserInfo().id
					},
					success: res => {
						this.applyList = res.data.list;
						console.log("record---",res.data)
					}
				})
			},
			
			//根据状态判断操作：测试门锁、导卡、提交竣工
			clickStatusBtn(applyItem) {
				let roomInfoObj = {
					devSn: applyItem.newDevSn,
					id: applyItem.roomId,
					isBindOwner: true,
					communityId: applyItem.communityId,
					type: 3
				}
				if(applyItem.isTest == 0 && applyItem.isImportCardSuccess == 0 && applyItem.isComplete == 0) {
					//测试门锁
					uni.navigateTo({
						url: "../../sub-package/pages/door-lock/door-test?roomInfo=" + JSON.stringify(roomInfoObj)
					})
				} else if (applyItem.isTest == 1 && applyItem.isImportCardSuccess == 0 && applyItem.isComplete == 0) {
					//导卡
					uni.navigateTo({
						url: "../../sub-package/pages/door-lock/import-card?roomInfo=" + JSON.stringify(roomInfoObj)
					})
				} else if (applyItem.isTest == 1 && applyItem.isImportCardSuccess == 1 && applyItem.isComplete == 0) {
					//提交竣工
					uni.navigateTo({
						url: "../../sub-package/pages/door-lock/finish-install?roomInfo=" + JSON.stringify(roomInfoObj)
					})
				}
				
			}
			

		},
		
		onPullDownRefresh() {
			this.getRepairList()
		}
	}
</script>

<style>
	.content {
		width: 100%;
		padding: 0;
		background-color: #FFFFFF;
	}
	
	.content ul {
		width: 100%;
		padding: 0;
		list-style: none;
	}
	
	.custom-swiper {
		height: 1300upx;
		overflow: auto;
	}
	
	.scroll-view {
		height: calc(100% - 50px);
	}
	
	.left-name {
		width: 27%;
		text-align: left;
		display: inline-block;
		margin-top: 3%;
	}

	.right-value {
		display: inline-block;
		text-align: left;
		width: 65%;
		margin-top: 3%;
		margin-left: 5%;
		padding-right: 60upx;
	}

	.right-value input {
		font-size: 28upx;
	}
	
	.content ul li {
		width: 90%;
		background-color: #FFFFFF;
		height: auto;
		/* display: inline-flex; */
		margin: 3%;
		padding: 15upx 15upx 0;
		border-radius: 10upx;
		border: 1upx solid #d9d9d9;
		/* border-bottom: 1upx solid #eeeeee; */
	}
	
	.first-line {
		display: block;
		padding: 5upx 5upx 15upx;
		border-bottom: 1upx solid #f5f5f5;
	}
	
	.left-text {
		display: inline-block;
		width: 70%;
		text-align: left;
		color: gray;
	}
	
	.right-text {
		display: inline-block;
		width: 30%;
		text-align: right;
	}
	
	.second-line {
		display: block;
		padding: 10upx 5upx;
		border-bottom: 1upx solid #f5f5f5;
	}
	
	.repair-item {
		height: auto;
		display: inline-flex;
		width: 100%; 
	}
	
	.repair-left {
		display: inline-block;
		margin-top: 3%;
		width: 20%;
		color: gray;
	}
	
	.repair-right {
		display: inline-block;
		width: 70%;
		padding-left: 18upx;
		margin-top: 3%;
	}
	
	.third-line {
		display: block;
	}
	
	.order-time {
		display: inline-block;
		width: 75%;
		color: gray;
		vertical-align: top;
		margin-top: 20upx;
	}
	
	.op-btn {
		display: inline-block;
		width: 25%;
		text-align: right;
	}
	
	.op-btn button {
		width: 100%;
		font-size: 24upx;
		margin-left: 0;
		margin-right: 0;
		margin-top: 10upx;
		color: #FFFFFF;
		background-color: #4274ff;
	}
	
	.no-record {
		text-align: center;
		font-size: 40upx;
		margin-top: 50%;
	}
	
	.no-data {
		text-align: center;
		width: 100%;
		height: 300upx;
		padding-top: 30%;
	}
	
	.left-info {
		float: left;
		width: 80%;
		vertical-align: middle;
	}
	.right-status {
		float: right;
		text-align: right;
		width: 16%;
		border-radius: 20upx;
		color: #FFFFFF;
		text-align: center;
		font-size: 24upx;
	}
	
	.status-0 {
		background-color: #007AFF;
	}
	
	.status-1 {
		background-color: #09BB07;
	}
	
	.status-2 {
		background-color: #F76260;
	}
	
	.status-3 {
		background-color: #bebebe;
	}
	
	.record-info {
		clear: both;
		display: block;
		width: 100%;
		/* min-height: 150upx; */
		line-height: 50upx;
		padding: 20upx 0;
	}
	
	.info-name {
		/* text-align: right; */
		width: 40%;
		display: inline-block;
		color: gray;
	}
	
	.undo {
		width: 100%;
		height: 80upx;
		display: block;
		text-align: right;
		/* line-height: 80upx; */
	}
	
	.undo button {
		margin-top: 10upx;
		height: 60upx;
		font-size: 24upx;
		color: #1E90FF;
		float: right;
		border: 1upx solid #1E90FF;
		border-radius: 10upx;
	}
	
</style>

