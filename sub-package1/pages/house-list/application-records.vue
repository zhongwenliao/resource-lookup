<template>
	<uni-base-page class="list-view">
		<uni-tab :tab-list="tabList" :tabCur.sync="tabCur" tab-class="opening-record-view-tab" textFlex @change="tabChange"></uni-tab>
		
		<swiper :style="{height: windowHeight + 'px'}" :current="tabCur" @change="swiperChange" duration="500" :circular="true"
		 indicator-color="rgba(255,255,255,0)" indicator-active-color="rgba(255,255,255,0)" class="swiper">
		 <!-- 房屋申请 -->
			<swiper-item>
				 <view class="search-view" v-if="statusList.length > 0">
					<form action="" class="search-form">
						<view class="filter-view">
							<picker class="filter-picker" @change="statusChange" mode="selector" :range="statusList">
								<text class="input-text">{{ statusList.length > 0 && statusList[index] }}</text>
								<image class="filter-view-down-image" src="http://www.thinmoo.com/wp-content/uploads/2020/10/down.png" style="width: 40upx; height: 30upx"></image>
							</picker>
						</view>
					</form>
				 </view>
				 <view style="height: 100%;" class="records-list" v-if="recordList !== null && recordList.length > 0">
					<scroll-view style="height: 100%;width: 100%;" scroll-y="true" refresher-enabled="true" >
						<ul class="ul_height">
							<li v-for="application in recordList" @click="goToApplyDetail(application)">
								<view class="room-address">
									<view class="left-info">
										<view style="float: left;">
											{{ application.communityName }}/{{ application.buildingName }}/{{ application.roomName }}
										</view>
									</view>
									<view :class="['right-status', `status-${application.reviewStatus}`]">
										{{ common["status"][application.reviewStatus] }}
									</view>
								</view>
								<view class="record-info">
									<text class="info-name">{{ house["authType"] || "认证方式" }}：</text><text>{{ house["authTypeList"][application.authType] }}</text><br>
									<text class="info-name">{{ house["name"] || "姓名" }}：</text><text>{{ application.realName }}</text><br>
									<view v-if="application.authType !== 1"><text class="info-name">{{ house["identity"] || "身份类型" }}：</text><text>{{ common["identity-type-list"][parseInt(application.identityType) - 1] }}</text><br></view>
									<view v-if="application.faceImage"><text class="info-name"  style="vertical-align: top;">{{ house["face-img"] || "人脸照片" }}：</text><image :src="application.faceImage" mode="aspectFill" style="width: 200upx; height: 200upx;display: inline-block;"></image><br></view>
									<text class="info-name">{{ house["create-time"] || "申请时间" }}：</text><text>{{ application.createTime }}</text><br>
									<text v-if="application.reviewTime"><text class="info-name">{{ house["review-time"] || "审核时间" }}：</text>{{ application.reviewTime }}</text>
									<text v-if="application.reviewStatus == 2"><br /><text class="info-name">{{ house["reject-reason"] || "驳回原因" }}：</text>{{ application.reviewResult }}</text>
								</view>
								<view class="undo" v-if="application.reviewStatus == 0">
									<button @click.stop="ifUndo(application.id)">{{ house['undo']||"撤销" }}</button>
								</view>
								<view class="undo" v-else-if="application.reviewStatus == 3">
									<button @click.stop="ifDelete(application.id)">{{ house['delete']||"删除" }}</button>
								</view>
							</li>
							<view class="" style="height: 100px;"></view>
						</ul>
					</scroll-view>
				 </view>
				 <view v-else class="no-data">{{ house["no-data"] || "暂无申请记录" }}</view>
			</swiper-item>
			
			<swiper-item>
				 <!-- 入住审批 -->
				<view class="search-view">
					<form action="" class="search-form">
						<view class="filter-view">
							<picker class="filter-picker" mode="selector" @change="communityChange" :range="communityList">
								<text class="input-text">{{ communityList.length > 0 ? communityList[index] : "" }}</text>
								<image class="filter-view-down-image" src="http://www.thinmoo.com/wp-content/uploads/2020/10/down.png"></image>
							</picker>
						</view>
					</form>
				 </view>
				 <view style="height: 100%;" class="records-list" v-if="tenantApplyList.length > 0">
					<scroll-view style="height: 100%;width: 100%;" scroll-y="true" refresher-enabled="true">
						<ul style="height: 100%;">
							<li v-for="applyItem in tenantApplyList">
								<view class="room-address">
									<view class="left-info">
										<view style="float: left;">
											{{ applyItem.communityName }}/{{ applyItem.buildingName }}/{{ applyItem.roomName }}
										</view>
									</view>
									<view :class="['right-status', `status-${applyItem.reviewStatus}`]">
										{{ common["status"][applyItem.reviewStatus] }}
									</view>
								</view>
								<view class="record-info">
									<text class="info-name">{{ house["authType"] || "认证方式" }}：</text><text>{{ house["authTypeList"][applyItem.authType] }}</text><br>
									<text class="info-name">{{ house["name"] || "姓名" }}：</text><text>{{ applyItem.realName }}</text><br>
									<text class="info-name">{{ house["gender"] || "性别" }}：</text><text>{{ genderList[applyItem.gender] }}</text><br>
									<text class="info-name">{{ house["cert-num"] || "证件号" }}：</text><text>{{ applyItem.certNo }}</text><br>
									<!-- <text class="info-name">{{ "成员关系" }}：</text><text>{{ applyItem.relationshipName }}</text><br> -->
									<text class="info-name">{{ house["phone"] || "申请人手机" }}：</text><text>{{ applyItem.appUserPhone }}</text><br>
									<view v-if="applyItem.rentStartTime"><text class="info-name">{{ house["checkin-time"] || "入住时间" }}：</text><text>{{ applyItem.rentStartTime }}</text><br></view>
									<view v-if="applyItem.rentEndTime"><text class="info-name">{{ house["end-time"] || "到期时间" }}：</text><text>{{ applyItem.rentEndTime }}</text><br></view>
									<text class="info-name">{{ house["create-time"] || "申请时间" }}：</text><text>{{ applyItem.createTime }}</text><br>
								</view>
								<view class="undo" v-if="applyItem.reviewStatus == 0">
									<picker class="uni-list-cell-text operation" @change="reviewStatusChange($event, applyItem)" :range="reviewList">{{ house["review"]||"审核" }}</picker>
								</view>
							</li>
							<view class="" style="height: 100px;"></view>
						</ul>
					</scroll-view>
				 </view>
				 <view v-else class="no-data">{{ house["no-data"] || "暂无租客申请记录" }}</view>
			</swiper-item>
		</swiper>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				roomAddress: "",
				status: "",
				name: "",
				identityType: "",
				applyDate: "",
				nodata: false,
				recordList: [],
				copyRecordList: [],
				statusList: [],
				index: 0,
				tabList: [],
				tabCur: 0,
				tenantApplyList: [],
				communityList: [],
				communityId: null,
				communityNameList: [],
				communityIdList: [],
				reviewList: [],//审核通过，驳回
				genderList: [],
				swiperHeight: 1000,
				windowHeight: 500
			}
			
		},
		onLoad() {
			this.getApplicationList();
			this.statusList = this.house["apply-status"];
			this.getCommunityList();
			this.communityId = this.communityIdList[0];
			this.tabList = [{
				name: this.house["house-apply"] || "房屋申请"
			}, {
				name:  this.house["apply-review"] || "入住审批"
			}];
			this.reviewList= [this.house["review-passed"], this.house["review-rejected"]],
			this.genderList = this.common["gender-list"];
			uni.getSystemInfo({
				success: (res) => {
					// console.log('手机屏幕高度',res.windowHeight)
					let windowHeight = res.windowHeight;
					this.windowHeight = windowHeight - 45;
					uni.setStorageSync('windowHeight',windowHeight)
				}
			})
			
		},
		onReady() {
			this.$setTitle(this.title["application-record"]);
		},
		methods: {
			//动态获取高度
			getElementHeight(element) {
				//一定要 this.$nextTick 完成之后在获取dom节点高度
				this.$nextTick(()=>{
					let query = uni.createSelectorQuery().in(this);
					query.select(element).boundingClientRect(data => {
						console.log(data)
						// this.swiperHeight = data.height;
						// console.log('####zsx',this.swiperHeight)
					}).exec()
				})
			},
			tabChange(index) {
				this.tabCur = index;
			},
			
			swiperChange(e) {
				let page = e.detail.current;
				this.tabCur = page;
				if (page == 0) {
					this.getApplicationList();
				} else if (page == 1) {
					this.getTenantApplyList();
				}
			},
			
			// 切换社区onchange
			communityChange(e) {
				var index = e.target.value;
				var communityIsChange = true;
				var communityId = this.communityIdList[index];
				this.communityId = communityId;
				this.index = index;
				this.getTenantApplyList();
			},
			
			//审核状态改变
			reviewStatusChange(e, applyItem) {
				let chooseValue = e.target.value;
				//0为通过，1为驳回
				this.$req.request({
					url: "/persIdentityAuth/app/reviewTenement",
					data: {
						id: applyItem.id,
						communityId: applyItem.communityId,
						reviewStatus: parseInt(chooseValue) + 1,
						reviewUserId: this.$getUserInfo().id,
						reviewResult: " "
					},
					success: res => {
						console.log("审核状态结果---",res.data);
						this.$showToast(this.common["operate-success"] || "审核状态变更成功");
						setTimeout(()=> {
							this.getTenantApplyList();
						},1000)
					}
				})
			},
			
			// 获取社区列表
			getCommunityList() {
				var _this = this;
				this.$req.request({
					url: "/appUser/app/getCommunityList",
					data: {
						isShowLoad: false
					},
					success: res => {
						this.getElementHeight('.ul_height')
						var data = res.data;
						if (data.length === 0) {
							data.push({
								"id": "",
								"name": _this.myhouse["no-community"] || "暂无绑定社区",
								"cityName": ""
							});
						}
						_this.communityList = data.map(item => {
							return item.name;
						});
						_this.communityIdList = data.map(item => {
							return item.id;
						});
						// console.log("community id list ---", _this.communityList)
						_this.communityId = _this.communityIdList[0];
					}
				});
			},
			
			getApplicationList() {
				var _this = this;
				var currentCommunity = this.$getUserInfo().currentCommunity;
				this.$req.request({
					url: "/persIdentityAuth/app/list",
					success: (res) => {
						// this.recordList = res.data.list;
						this.copyRecordList = res.data.list;
						if (res.data.list.length == 0) {
							this.nodata = true;
						}
						_this.getStatusList(_this.index);
						uni.stopPullDownRefresh();
						
					}
				})
			},

			//是否撤销
			ifUndo(id) {
				var _this = this;
				uni.showModal({
					content: _this.house['if-undo']||'是否确定撤销房屋申请？',
					confirmText: _this.common["confirm"],
					cancelText: _this.common["cancel"],
					success: (res) => {
						if (res.confirm) {
							this.$req.request({
								url: "/persIdentityAuth/app/revocationAuth",
								data: {
									id: id
								},
								success: (res) => {
									console.log(res);
									this.$showToast(this.house['undo-success']||"撤销成功");
									setTimeout(() => {
										this.getApplicationList();
									},500)
								}
							})
							
						}
					}
				})
			},
			
			//是否删除
			ifDelete(id) {
				var _this = this;
				uni.showModal({
					content: _this.house["if-delete"] || '是否确定删除该房屋申请？',
					confirmText: _this.common["confirm"],
					cancelText: _this.common["cancel"],
					success: (res) => {
						if (res.confirm) {
							this.$req.request({
								url: "/persIdentityAuth/app/delByIds",
								data: {
									ids: id
								},
								success: (res) => {
									console.log(res);
									this.$showToast(this.house["delete-success"] || "删除成功");
									setTimeout(() => {
										this.getApplicationList();
									},500)
								}
							})
							
						}
					}
				})
			},

			//选择状态改变
			statusChange(e) {
				this.index = e.target.value;
				this.getStatusList(e.target.value);
			},
			//根据picker值分组
			getStatusList(index) {
				// if(index == 0) {
				// 	this.recordList = this.copyRecordList;
				// }else if(index == 1) {
				// 	//待审核
				// 	this.filterRecordList(0);
				// }else if(index == 2) {
				// 	//审核通过
				// 	this.filterRecordList(1);
				// }else if(index == 3) {
				// 	//驳回
				// 	this.filterRecordList(2);
				// }else if(index == 4) {
				// 	this.filterRecordList(3);
				// }
				if(index == 0) {
					this.recordList = this.copyRecordList;
				}else {
					this.filterRecordList(index-1);
				}
			},
			
			//过滤房屋列表
			filterRecordList(statusNum) {
				this.recordList = [];
				var recordList = this.copyRecordList;
				for(let i in recordList) {
					if(recordList[i].reviewStatus == statusNum) {
						this.recordList.push(recordList[i]);
					}
				}
			},
			
			//查看申请记录详情
			goToApplyDetail(application) {
				uni.navigateTo({
					url: 'application-detail?applicationObj=' + JSON.stringify(application)
				})
			},
			
			//业主获取租客认证列表
			getTenantApplyList() {
				this.$req.request({
					url: "/persIdentityAuth/app/getTenementList",
					data: {
						communityId: this.communityId
					},
					success: (res) => {
						this.tenantApplyList = res.data;
						uni.stopPullDownRefresh();
					}
				})
			},
			
			
		},
		
		onPullDownRefresh() {
			if(this.tabCur == 0) {
				this.getApplicationList();
			} else if (this.tabCur == 1) {
				this.getTenantApplyList();
			}
		},
		computed: {
			title() {
				return this.$t("title")
			},
			house() {
				return this.$t("house")
			},
			common() {
				return this.$t("common")
			}
		}
	}
</script>

<style>
	.list-view{
		background: #F2F2F2;
	}
	.search-view .filter-view {
		height: 60upx;
	}
	.opening-record-view-tab {
		background: #FFFFFF;
		border-bottom: 1px solid #E3E3E3;
		color: #959595;
	}

	.records-list {
		width: 100%;
		margin-top: 100upx;
		background: #EEEEEE;
	}
	.filter-view-down-image{
		width: 40upx;
		height: 30upx;
		position: absolute;
		right: 40upx;
		top: 35upx;
	}
	.records-list ul {
		padding: 0;
	}

	.records-list ul li {
		background: #FFFFFF;
		padding: 0 30upx;
		margin: 20upx 10upx;
		border-radius: 10upx;
	}

	.room-address {
		width: 100%;
		float: left;
		padding: 16upx 0px;
		display: block;
		border-bottom: 2upx dashed #EEEEEE;
	}

	.left-info {
		float: left;
		width: 80%;
		vertical-align: middle;
	}

	.left-info image {
		width: 50upx;
		height: 50upx;
		vertical-align: middle;
		margin-top: -10upx;
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
		min-height: 150upx;
		line-height: 50upx;
		padding: 20upx 0;
	}

	.info-name {
		/* text-align: right; */
		width: 30%;
		display: inline-block;
		color: gray;
	}

	.undo {
		width: 100%;
		height: 80upx;
		display: block;
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

	.no-data {
		height: 300upx;
		line-height: 300upx;
		text-align: center;
	}
	
	.operation {
		width: 20%;
		text-align: center;
		border-radius: 10upx;
		color: #006FFF;
		border: 1upx solid #0081ff;
	}
</style>
