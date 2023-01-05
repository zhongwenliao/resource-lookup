<template>
	<page>
		<u-navbar class="navbar" title="会议室预约" :border-bottom="false"></u-navbar>
		<u-image width="100%" height="450" mode="scaleToFill"
			:src="roomInfo.images[0]"></u-image>
		<view class="top">
			<view class="top-title">
				{{ roomInfo.conferenceRoomTitle }}
			</view>
			<view class="top-address">
				位置：{{ roomInfo.ownedBuilding + '/' + roomInfo.ownedFloor + '/' + roomInfo.name }}
			</view>
			<view class="top-grid">
				<u-grid :border="false" :col="4">
					<u-grid-item>
						<view class="grid-text-top">
							{{ roomInfo.chargeAmountOfHour || 0 }}
						</view>
						<view class="grid-text">元/小时</view>
					</u-grid-item>
					<u-grid-item>
						<view class="grid-text-top">
							{{ roomInfo.chargeAmountOfDay || 0 }}
						</view>
						<view class="grid-text">元/天</view>
					</u-grid-item>
					<u-grid-item>
						<view class="grid-text-top">
							{{ roomInfo.maximumCapacity || 0 }}
						</view>
						<view class="grid-text">容纳人数</view>
					</u-grid-item>
					<u-grid-item>
						<view class="grid-text-top">
							{{ roomInfo.area || 0 }}
						</view>
						<view class="grid-text">面积(m²)</view>
					</u-grid-item>
				</u-grid>
			</view>
			<view class="top-reminder">
			    <u-image width="29" height="29" :src="'http://yuanzhoulvwego.com/wp-content/uploads/static/home/meetingRoom/wenxintishi.png'" class="top-reminder-image"></u-image>
			    <text>园区入驻企业可免费使用会议室{{ feeTime }}小时</text>
			   </view>
			   <view class="top-reminder">
			    <u-image width="29" height="29" :src="'http://yuanzhoulvwego.com/wp-content/uploads/static/home/meetingRoom/wenxintishi.png'" class="top-reminder-image"></u-image>
			    <text style="color: red;">会议室审核成功，支持首页一键开门</text>
			   </view>
		</view>
		<view class="middle">
			<view>设施：</view>
			<text class="middle-text">
				{{roomInfo.remark || '无'}}
			</text>
		</view>
		<view class="middle-form">
			<u-form :border-bottom="false" label-width="190" :model="form" ref="uForm">
				<view class="form-item_box_body">
					<u-form-item class="form-item" prop="contact" :border-bottom="false" label="联系人:" label-width="160upx">
						<u-input placeholder="请输入联系人" v-model="form.contact" />
					</u-form-item>
					<u-form-item class="form-item" prop="phone" :border-bottom="false" label="联系电话:" label-width="160upx">
						<u-input placeholder="请输入联系电话" v-model="form.phone" />
					</u-form-item>
				</view>
			</u-form>
		</view>
		<view class="bottom">
			<view v-if="enterpriseId > 0" class="bottom-title">
				<!-- 您本月会议室免费使用时长还剩余
				<text class="bottom-title-r">{{ nowTime >= 0 ? nowTime : 0 }}</text>小时，超过时长
				<text class="bottom-title-r">{{ nowTime >= 0 ? 0 : Math.abs(nowTime) }}</text>小时，超过时长费用将按相应收费标准收费！ -->
				<view v-if="this.nowTime >= this.duration">
					您本月会议室免费使用总时长<text class="bottom-title-r">{{ feeTime }}</text>小时，
					还剩余<text class="bottom-title-r">{{ nowTime >= 0 ? nowTime : 0 }}</text>小时。
				</view>
				<view v-else>您本月会议室免费使用时长还剩余<text class="bottom-title-r">{{ nowTime >= 0 ? nowTime : 0 }}</text>小时，
				如需继续使用会议室请联系物管人员申请预约。预约超过免费时长，则按相应收费标准收费！</view>
			</view>
			<view class="bottom-head">
				<view class="bottom-head-left" @click="pickerShow = true">
					<u-icon labelWeight="bold" color="#3E76F4" labelSize="30" name="clock-fill"
						:label="dataTime" size="33"></u-icon>
					<u-icon name="arrow-down-fill" color="#666666" size="28" style="margin-left: 10rpx;"></u-icon>
				</view>
				<view class="bottom-head-right">
					<view class="bottom-head-right-box">
						<view class="box">
						</view>
						<text class="box-title-right">
							空闲
						</text>
					</view>
					<view class="bottom-head-right-box">
						<view class="box box-oselected">
						</view>
						<text class="box-title-right">
							已预订
						</text>
					</view>

				</view>
			</view>
			<!-- 时间段列表 -->
			<u-row gutter="30" justify="start">
				<u-col span="4" text-align="center" v-for="(item, index) in leftTime" :key="item.id" @click="changeState(item, 'left')">
					<view class="periodTime boxs" :class="item.state ? (item.isMyslef === 1 ? 'box-oselected' : 'box-selected'): ''">
						<text class="u-font-20" style="vertical-align: text-bottom;">
							{{item.time}}
						</text>
					</view>
				</u-col>
			</u-row>
		</view>
		<view class="btn_box">
			<u-button class="btn_box_button" @click="onSubmit" type="primary" shape="circle">
				提交预约
			</u-button>
		</view>
		<u-toast ref="uToast" />
		<!-- 日历 -->
		<u-calendar mode="date" v-model="pickerShow" :min-date="dataTime" :max-date="maxData" @change="confirm"></u-calendar>
	</page>
</template>

<script>
	export default {
		data() {
			return {
				// 当前租户id
				enterpriseId: uni.getStorageSync("userInfo").enterpriseId,
				// 预约的房间的园区id
				zoneId: 0,
				// 会议室信息
				roomInfo:{},
				// 提交预约的表单
				form: {
					contact: '',
					phone: ''
				},
				// 当前的时间
				dataTime: '',
				// 最迟选定时间
				maxData: '',
				// 打开选择时间
				pickerShow: false,
				// 选择时间的参数
				params: {
					year: true,
					month: true,
					day: true,
					hour: false,
					minute: false,
					second: false
				},
				// 左边时间列表
				leftTime: [],
				// 右边时间列表
				rightTime: [],
				// 免费使用时长
				feeTime: 0,
				// 本月剩余时长
				nowTime: 0,
				// 本月超过时长
				exceedTime: 0,
				// 时间段为0分钟还是1小时
				timeType: 0,
				// 分隔的时间
				duration: 0,
				// 规则
				rules: {
					contact: [{ required: true, message: '请输入联系人', trigger: ['blur'] }],
					phone: [{
						// 自定义验证函数
						validator: (rule, value, callback) => {
							//返回true表示校验通过，返回false表示不通过
							if(this.$u.test.isEmpty(value)){
								callback(new Error('请输入手机号码'));
							}else if(!this.$u.test.mobile(value)){
								callback(new Error('请输入正确的手机号码'));
							}else{
								return true
							}
							
						},
						// 触发器可以同时用blur和change
						trigger: ['blur', 'change']
					}]
				}
			}
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		onLoad() {
			this.roomInfo = this.$Route.query
			let day = new Date();
			this.dataTime = this.$u.timeFormat(day,"yyyy-mm-dd")
			this.zoneId = this.$Route.query.zoneId
			this.getAppointmentDate()
			this.getInfo()
		},
		methods: {
			// 获取允许提前预约日期
			getAppointmentDate() {
				const params = { zoneId: this.zoneId }
				this.$api('meetingRoom.getAppointmentDate', params).then(res => {
					if (res.code == 200) {
						this.maxData = res.data.endDay
					}
				})
			},
			getInfo() {
				const params = {
					enterpriseId: this.enterpriseId,
					roomId: this.roomInfo.id,
					date: this.dataTime,
					zoneId: this.zoneId
				}
				this.$api('meetingRoom.roomTimeList', params).then(res => {
					if (res.code == 200) {
						this.nowTime = Math.round((res.data.now / 60 ) * 100) / 100 
						let mapArr = res.data.settings
						let temp = [];
						let ranm = [];
						mapArr.forEach((item, index)=> {
							if (item.state === true) {
								item.isMyslef = 1
							} else {
								item.isMyslef = 0
							}
							temp.push(item)
						})
						this.leftTime = temp
						this.timeType = this.leftTime[0].type
						// 免费时长
						this.feeTime = this.leftTime[0].feeTime
						// 时间段 时长
						this.duration = this.timeType ? this.leftTime[0].duration : Math.round((this.leftTime[0].duration / 60) * 100) / 100 
					}
				}).catch((e) => {
					
				});
			},
			// 选择时间的回显
			confirm(val) {
				this.dataTime = val.result
				this.getInfo()
			},
			// 选择预约时间
			changeState(item, type) {
				if (item.isMyslef === 0) {
					// 没有选中并且剩余时长大于等于时间段 或者 选中的 可以改变状态
					if (!item.state && this.nowTime >= this.duration || item.state) {
						item.state = !item.state
					} else {
						// 否则提示
						this.$refs.uToast.show({
							title: '请联系物管人员申请预约',
							icon: false,
							type: 'warning'
						})
						return
					}
					// 选中时 剩余时长=剩余时长-时间段；没选中时 剩余时长=剩余时长+时间段
					if (item.state) this.nowTime = Math.round((this.nowTime - this.duration) * 100) / 100 
					else this.nowTime = Math.round((this.nowTime + this.duration) * 100) / 100 
				}
			},
			// 确定预约按钮
			onSubmit() {
				let selectTimeL = this.leftTime.filter(item => item.isMyslef === 0 && item.state).map(item => item.id)
				let selectTimeR = this.rightTime.filter(item => item.isMyslef === 0 && item.state).map(item => item.id)
				let selectTime = selectTimeL.concat(selectTimeR)
				this.$refs.uForm.validate(valid => {
					if (valid) {
						if (selectTime.length > 0) {
							let params = {
								appointmentDate: this.dataTime,
								...this.form,
								buildingId: this.roomInfo.buildingId,
								floorId: this.roomInfo.floorId,
								roomId: this.roomInfo.id,
								settingsIds: selectTime,
								enterpriseId: this.enterpriseId
							}
							if (this.enterpriseId) params.zoneId = this.zoneId
							this.$api('meetingRoom.addMeetingRoom', params).then(res => {
								if (res.code == 200) {
									this.$refs.uToast.show({
										title: '预约成功',
										icon: false,
										type: 'success'
									})
									this.form = { contact: '', phone: ''}
									uni.navigateBack()
								}
							})
						} else {
							this.$refs.uToast.show({
								title: '请至少选择一个时间段',
								icon: false
							})
							return
						}
					}
				})
			}
		}
	}
</script>

<style>
	page {
		background: #f1f2f3;
	}
</style>
<style lang="scss" scoped>
	.top {
		border-radius: 40upx 40upx 0px 0px;
		background: #FFFFFF;
		margin-top: -40upx;
		z-index: 1;
		padding: 50upx 30upx 32upx 30upx;
		position: relative;
		margin-bottom: 20upx;
	
		.top-title {
			font-size: 38upx;
			font-weight: bold;
			margin-bottom: 30upx;
		}
	
		.top-address {
			color: $uni-text-color-prompt;
		}
	
		.top-grid {
			.grid-text-top {
				font-size: 48upx;
				font-weight: 800;
				color: #E64340;
			}
	
			.grid-text {
				font-size: 24upx;
				color: $uni-text-color-prompt;
			}
		}
		.top-reminder {
			font-size: 26upx;
			color: #999999;
			.top-reminder-image {
				margin-right: 5px;
				display: inline-block;
				vertical-align: middle;
			}
		}
	}
	.middle {
		background: #FFFFFF;
		padding: 50upx 30upx;
		display: flex;
		margin-bottom: 20upx;
	
		.middle-text {
			font-size: 28upx;
			color: $uni-text-color-prompt;
		}
	}
	.middle-form {
		background: #FFFFFF;
		padding: 10upx 30upx 40upx;
		margin-bottom: 20upx;
		.form-item_box_body {
			// margin-left: 16upx;
			.form-item {
				position: relative;
						
				&:before {
					content: '';
					position: absolute;
					bottom: 0;
					right: 40upx;
					height: 2upx;
					width: calc(100% - 180upx);
					background-color: #dddddd;
				}
			}
		}
	}
	.bottom {
		padding: 34upx 30upx 100upx 30upx;
		background: #FFFFFF;
	
		.bottom-title {
			margin-bottom: 30rpx;
			font-size: 26rpx;
			.bottom-title-r {
				color: #E64340;
			}
		}
		.bottom-head {
			display: flex;
			justify-content: space-between;
			padding-bottom: 50upx;
	
			.bottom-head-left {
				display: flex;
			}
	
			.bottom-head-right {
				display: flex;
	
				.bottom-head-right-box {
					display: flex;
					align-items: center;
					margin-left: 40upx;
				}
			}
		}
		
		.periodTime {
			// display: flex;
			// align-items: center;
			margin-bottom: 40upx;
		}
		
		.box-periodTime {
			width: 120upx !important;
			height: 45upx !important;
			margin-left: 10upx;
		}
		
		.box {
			width: 40upx;
			height: 34upx;
			border: 1px solid #dddddd;
			border-radius: 3upx;
		}
		.boxs {
			// width: 160upx;
			padding: 0 16rpx;
			height: 60upx;
			line-height: 60upx;
			border: 2upx solid #DDDDDD;
			border-radius: 50upx;
			text-align: center;
		}
		
		.box-oselected {
			background: #1677FF;
			border: 1px solid #1677FF;
			color: #FFFFFF;
		}
		
		.box-selected {
			background: #F8926A;
			border: 1px solid #F8926A;
			color: #FFFFFF;
		}
		
		.box-title-right {
			margin-left: 10upx;
			font-size: 28upx;
		}
	
		.bottom-foot {
			display: flex;
			padding: 0upx 40upx 0upx 40upx;
	
			.bottom-foot-left {
				padding-left: 15upx;
				flex: 1;
				// color: #f8926a;
				.bottom-foot-left-head {
					padding-bottom: 50upx;
				}
			}
	
			.bottom-foot-right {
				padding-left: 15upx;
				flex: 1;
				// color: #68d29c;
				border-left: 1px solid $uni-border-color;
	
				.bottom-foot-right-head {
					padding-bottom: 50upx;
				}
			}
		}
	}
	.btn_box {
		height: 98upx;
		position: fixed;
		width: 100%;
		bottom: 0px;
		background-color: white;
		padding: 0 64upx;
		.btn_box_button {
			position: relative;
			top: 50%;
			transform: translateY(-50%);
		}
	}
</style>
