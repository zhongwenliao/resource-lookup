<template>
	<page>
		<z-paging ref="paging" v-model="dataList" @query="getInfo">
			<view slot="top" class="">
				<u-navbar :custom-back="customBack" title-color="#fff" back-icon-color="#fff"
					:background="{background: '#3E76F4' }" title="预约记录">
				</u-navbar>
				<view class="u-tabs-box">
					<u-tabs bar-width="120" :is-scroll="false" activeColor="#3E76F4" ref="tabs" :list="topList"
						:current="current" @change="topChange">
					</u-tabs>
				</view>
			</view>
			<view class="card-box">
				<view class="card" v-for="(item, index) in dataList" :key="item.id">
					<view class="card-head">
						<u-icon style="font-weight: bold;" color="#1677FF" labelSize="32" label-color="#333333"
							name="dizhi" :label="item.room.buildingName+item.room.ownedFloor+item.room.name"
							custom-prefix="custom-icon" size="33"></u-icon>
						<view v-if="item.approvalStatus === 0" class="card-head-right" @click="openModal(item)">
							取消预约
						</view>
					</view>
					<u-line color="#F1F2F3" />
					<view class="card-body" @click="review(item)">
						<view class="card-body-box">
							<view class="card-body-title">
								联系人：
							</view>
							<view class="card-body-content">
								{{ item.contact + '/' + item.phone }}
							</view>
						</view>
						<view class="card-body-box" v-if="enterpriseId > 0">
							<view class="card-body-title">
								企业名称：
							</view>
							<view class="card-body-content">
								{{ item.enterprise.companyName || '-' }}
							</view>
						</view>
						<!-- <view class="card-body-box">
							<view class="card-body-title">
								所属房间：
							</view>
							<view class="card-body-content">
								<view class="card-body-content card-body-text-top" v-if="item.enterprise.rooms">
									<view v-for="ritem in item.enterprise.rooms" :key="ritem.id">
										{{ (ritem.ownedBuilding + '/' + ritem.ownedFloor + '/' + ritem.name) }}
									</view>
								</view>
								<text class="card-body-content" v-else>-</text>
							</view>
						</view> -->
						<view class="card-body-box" v-if="item.approvalStatus !== 0">
							<view class="card-body-title">
								审批人：
							</view>
							<view class="card-body-content">
								{{ item.updateBy || '-'}}
							</view>
						</view>
						<view class="card-body-box">
							<view class="card-body-title">
								会议时间：
							</view>
							<view class="card-body-content card-body-text-top">
								<view v-for="fitem in item.fwYuyueRoomReservationForms" :key="fitem.id">
									{{ fitem.appointmentDate }} {{ fitem.appointmentTime }}
								</view>
							</view>
						</view>
					</view>
					<view v-if="item.approvalStatus === 2" class="card-foot">
						<u-line color="#F1F2F3" />
						<view class="card-foot-remark">
							<text class="card-foot-title">理由：</text>
							<text class="card-foot-content">{{ item.reasonRejection }}</text>
						</view>
					</view>
				</view>
			</view>
			<!-- 底部按钮 跳转页面 -->
			<view slot="bottom" class="meeting-bottom">
				<u-row style="height: 98upx;">
					<u-col span="6" v-for="(item, index) in meetingRoomTabbar" :key="index" style="text-align: center;"
						@click="goPaths(item)">
						<u-image width="42" height="42" :src="item.iconPath" class="meeting-bottom_image"></u-image>
						<span class="u-font-22"
							:class="item.text === '预约记录' ? 'meeting-bottom-ctext': 'meeting-bottom-text'">
							{{ item.text }}
						</span>
					</u-col>
				</u-row>
			</view>
		</z-paging>
		<!-- 弹窗 -->
		<u-modal v-model="modeShow" title="温馨提示"
			:title-style="{ fontSize: '36upx', fontWeight: 'bold', color: '#333333' }"
			:content-style="{ textAlign: 'center', margin: '30upx'}" :show-cancel-button="true" confirm-text="确定"
			@confirm="modelConfirm">
			<view class="slot-content">
				取消预约后，系统将撤回预约申请， 确定取消预约吗？
			</view>
		</u-modal>
		<u-toast ref="uToast" />
	</page>
</template>

<script>
	export default {
		data() {
			return {
				// 当前租户id
				enterpriseId: uni.getStorageSync("userInfo").enterpriseId,
				// 预约列表
				dataList: [],
				// 底部按钮列表
				meetingRoomTabbar: [{
						pagePath: "/pages/home/meetingRoom/index",
						iconPath: "http://yuanzhoulvwego.com/wp-content/uploads/static/home/meetingRoom/huiyishiyuyue2.png",
						text: "会议室预约",
					},
					{
						pagePath: "/pages/home/meetingRoom/record",
						iconPath: "http://yuanzhoulvwego.com/wp-content/uploads/static/home/meetingRoom/yuyuejilu.png",
						text: "预约记录",
					}
				],
				// 顶部分类
				topList: [{
					name: '已通过',
					value: 0
				}, {
					name: '待审核',
					value: 1
				}, {
					name: '已驳回',
					value: 2
				}],
				// 顶部选择的id
				current: 0,
				// 取消预约的id
				checkId: 0,
				// 取消预约弹窗显示
				modeShow: false
			}
		},
		methods: {
			// 表单点击事件
			review(item) {
				this.$Router.push({
					path: '/pages/home/meetingRoom/appointMent',
					query: {
						id:item.id ,
						zoneId:item.zoneId
					}
				});
				// if(item.approvalStatus === 0) {
				// 	this.$Router.push({
				// 		path: '/pages/home/meetingRoom/reservePass',
				// 		query: {
				// 			id: item.id,
				// 			zoneId: item.zoneId
				// 		}
				// 	});
				// }else if(item.approvalStatus === 1) {
				// 	this.$Router.push({
				// 		path: '/pages/home/meetingRoom/appointMent',
				// 		query: {
				// 			id: item.id,
				// 			zoneId: item.zoneId
				// 		}
				// 	});
				// }else {
				// 	this.$Router.push({
				// 		path: '/pages/home/meetingRoom/reserveFail',
				// 		query: {
				// 			id: item.id,
				// 			zoneId: item.zoneId
				// 		}
				// 	});
				// }
			},
			// 加载会议室预约记录列表，并赋值
			getInfo(pageNo, pageSize) {
				let approvalStatus = 0
				if (this.current === 0) {
					approvalStatus = 1
				} else if (this.current === 1) {
					approvalStatus = 0
				} else {
					approvalStatus = 2
				}
				const params = {
					currPage: pageNo,
					pageSize: pageSize,
					approvalStatus: approvalStatus
				}
				if (pageNo === 0) this.$refs.paging.complete(this.dataList)
				this.$api('meetingRoom.getMeetingRoomlist', params).then(res => {
					if (res.code == 200) {
						this.$refs.paging.complete(res.data.list);
					} else {
						this.$refs.paging.complete(false);
					}

				}).catch((e) => {
					this.$refs.paging.complete(false);
				});
			},
			// 返回到首页
			customBack() {
				uni.switchTab({
					url: '/pages/index/index'
				})
			},
			// 顶部改变选择
			topChange(index) {
				console.log(index)
				this.current = index;
				this.$refs.paging.reload();
			},
			openModal(item) {
				this.modeShow = true
				this.checkId = item.id
			},
			// 取消预约弹窗 确认
			modelConfirm() {
				let params = {
					ids: [this.checkId]
				}
				this.$api('meetingRoom.cancelAppointment', params).then(res => {
					if (res.code == 200) {
						this.$refs.uToast.show({
							title: res.msg,
							type: 'success'
						})
						this.$nextTick(() => {
							this.$refs.paging.reload();
						})
					}
				})
				this.modeShow = false
			},
			// 跳转到会议室预约页面
			goPaths(item) {
				if (item.text === '会议室预约') {
					this.$Router.push({
						path: item.pagePath
					})
				}
			}
		}
	}
</script>

<style>
	page {
		background: #F1F2F3;
	}
</style>

<style lang="scss" scoped>
	.card-box {
		margin-bottom: 30upx;

		.card {
			margin: 20upx 20upx 0upx 20upx;
			background: #fff;
			border-radius: 15upx;
			padding: 17upx 20upx 30upx 20upx;
			overflow: hidden;
			position: relative;

			.right_label {
				position: absolute;
				right: 13upx;
				top: 0
			}

			.card-head {
				padding: 0upx 0upx 11upx 0upx;
				display: flex;
				justify-content: space-between;
				align-items: center;

				.card-head-right {
					width: 160upx;
					height: 60upx;
					line-height: 56upx;
					font-size: 28upx;
					border-radius: 30upx;
					border: 1px solid;
					text-align: center;
					color: #3E76F4;
				}
			}

			.card-body {
				padding: 32upx 0upx 20upx 0upx;
				display: flex;
				flex-direction: column;
				justify-content: space-between;

				.card-body-box {
					margin-bottom: 10upx;

					.card-body-title {
						display: inline-block;
						width: 150upx;
					}

					.card-body-content {
						display: inline-block;
						color: $uni-text-color-prompt;
					}

					.card-body-text-top {
						vertical-align: text-top;
					}
				}
			}

			.card-foot {
				font-size: 30upx;

				.card-foot-remark {
					margin-top: 30upx;

					.card-foot-title {
						font-weight: bold;
					}

					.card-foot-content {
						color: #E64340;
						line-height: 24px;
					}
				}
			}
		}
	}

	.meeting-bottom {
		height: 98upx;
		background: #FFFFFF;

		.meeting-bottom_image {
			position: relative;
			left: 50%;
			transform: translateX(-50%);
		}

		.meeting-bottom-text {
			color: #666666;
		}

		.meeting-bottom-ctext {
			color: #3E76F4
		}
	}
</style>
