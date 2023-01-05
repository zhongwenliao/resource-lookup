<template>
	<view class="brake-helper">
		<!-- <view class="title">相机列表</view>
		<view class="item" v-for="(item,index) in brakeInfoList" :key="index">
			<view class="brakeInfo clear">
				<span class="door fl">{{item.name}}</span>
				<span class="doorStatus fr">状态：<span class="online" v-if="item.status == 1">在线</span><span class="offline" v-if="item.status == 2">离线</span></span>
			</view>
			<view class="brakeBtn clear">
				<button type="default" class="open fl" @click="open(item.id)">开闸</button>
				<button type="default" class="preview fr">实时预览</button>
			</view>
		</view>	
		<view class="" v-if="brakeInfoList.length == 0" style="text-align: center;margin-top: 60%;font-size: 17px;">
			暂无数据
		</view> -->
		
		<!-- 车闸设备名称、状态展示区 start -->
		<view class="brake-helper-top-status">
			<view class="brake-helper-top-status-left">
				<picker range-key="name" :range="brakeInfoList" @change="bindCameraPickerChange" style="display: inline-block;">
					<text>{{ currentCameraDevObj.name || "暂无摄像头设备" }}</text>
				</picker>
				<image src="/static/img/xiala.png" mode="aspectFit" />
			</view>
			
			<view class="brake-helper-top-status-right">
				<text>状态：</text>
				<text :class="[currentCameraDevObj.status ? (currentCameraDevObj.status == 1 ? 'online' : 'offline') : '']">
					{{ currentCameraDevObj.status ? (currentCameraDevObj.status == 1 ? "在线" : "离线") : "暂无信息" }}
				</text>
			</view>
		</view>
		<!-- 车闸设备名称、状态展示区 end -->
		
		<!-- 车闸的模式展示区 start -->
		<view class="brake-helper-mode">
			<image 
				mode="widthFix" 
				style="width: 100%;" 
				:src="parkEventList[0].carResult.img" 
				@error="loadCarResultImgError"
				@click="previewImage(parkEventList[0].carResult.img)"
				v-if="parkEventList && parkEventList[0] && parkEventList[0].carResult.img"
			/>
			<image 
				src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/parking-assistant/che.png" 
				mode="aspectFill" 
				style="width: 100%;"
				@click="previewImage('http://yuanzhoulvwego.com/wp-content/uploads/static/img/parking-assistant/che.png')" 
				v-else 
			/>
			<view class="brake-helper-mode-in-out-type">
				<text>进出类型：</text>
				<text>{{ currentCameraDevObj.inOutType ? (currentCameraDevObj.inOutType == 1 ? "进" : "出") : "暂无信息" }}</text>
			</view>
			<view class="brake-helper-mode-area">
				<text>区域：</text>
				<text>{{ !currentCameraDevObj.outAreaName ? "场外" : currentCameraDevObj.outAreaName }}->{{ !currentCameraDevObj.inAreaName ? "场外" : currentCameraDevObj.inAreaName }}</text>
			</view>
			<view class="brake-helper-mode-text-description">视频模式</view>
		</view>
		<!-- 车闸的模式展示区 end -->
		
		<!-- 操作展示区 start -->
		<view class="brake-helper-operation">
			<view class="brake-helper-operation-btn" hover-class="hover-class" @click="open(currentCameraDevObj.devSn)">开闸</view>
			<view class="brake-helper-operation-btn" hover-class="hover-class" @click="goToBrakeManualEntryPage">手动入场</view>
			<view class="brake-helper-operation-btn" hover-class="hover-class" @click="goToBrakeManualOutPage">手动出场</view>
			<view class="brake-helper-operation-btn" hover-class="hover-class" @click="goToBrakeCorrectLicensePlatePage">校正车牌</view>
			<!-- <view class="brake-helper-operation-history-record" hover-class="hover-class" @click="goToBrakeRecordPage">历史记录</view> -->
		</view>
		<!-- 操作展示区 end -->
		
		<!-- 事件展示区 start -->
		<view v-if="parkEventList && parkEventList.length">
			<view hover-class="hover-class" v-for="(parkEvent, index) in parkEventList" @click="goToBrakeRecordDetailPage(parkEvent)">
				<view :class="['brake-helper-event', index == 0 ? 'first-event' : 'not-first-event']">
					<view class="brake-helper-event-title">
						<view class="brake-helper-event-title-event-name">
							<!-- <text>事件：</text> -->
							<text>{{ parkEvent.parkEventMsg }}</text>
						</view>
						<view class="brake-helper-event-title-detail">详情</view>
					</view>
					
					<view class="brake-helper-event-content">
						<view class="brake-helper-event-content-field">
							<view class="field-left">
								<text>车牌：</text>
								<text class="in-normal">{{ parkEvent.carResult.carNo.length > 10 ? "无牌车" : parkEvent.carResult.carNo }}</text>
							</view>
							<view class="field-right" v-if="parkEvent.carResult.carNoType || parkEvent.carResult.parkInParkRecord">
								<text>车牌类型：</text>
								<text>{{ $t(`parking.carNoTypeList_${parkEvent.carResult.carNoType || parkEvent.carResult.parkInParkRecord.carNoType}`) }}</text>
							</view>
						</view>
						
						<view class="brake-helper-event-content-field" v-if="parkEvent.carResult.carType">
							<view>
								<text>车辆类型：</text>
								<text :class="[parkEvent.carResult.carType == 1 ? 'car-type' : parkEvent.carResult.carType == 3 ? 'black-car-type' : '']">
									{{ $t(`parking.carTypeList_${parkEvent.carResult.carType}`) }}
								</text>
							</view>
						</view>
						
						<!-- <view v-if="parkEvent.carResult.parkInParkRecord">
							<view class="brake-helper-event-content-field" v-if="parkEvent.carResult.parkInParkRecord.inTime">
								<text>入场时间：</text><text>{{ $formatTimeUtil.formatStandardTime(parkEvent.carResult.parkInParkRecord.inTime, 'MM-DD hh:mm:ss') }}</text>
							</view>
							
							<view class="brake-helper-event-content-field" v-if="parkEvent.carResult.parkInParkRecord.outTime">
								<text>出场时间：</text><text>{{ $formatTimeUtil.formatStandardTime(parkEvent.carResult.parkInParkRecord.outTime, 'MM-DD hh:mm:ss') }}</text>
							</view>
						</view> -->
						
						<!-- 限制车辆原因 start -->
						<view class="brake-helper-event-content-field" v-if="isCarLimit(parkEvent.parkEventType)">
							<text>原因：</text>
							<text>{{ parkEvent.carResult.remark }}</text>
						</view>
						<!-- 限制车辆原因 end -->
						
						<!-- 入场时间、出场时间 start -->
						<view class="brake-helper-event-content-field" v-if="parkEvent.carResult.parkInParkRecord">
							<view class="field-left" v-if="parkEvent.carResult.parkInParkRecord.inTime">
								<text>入场时间：</text>
								<text>{{ $formatTimeUtil.formatStandardTime(parkEvent.carResult.parkInParkRecord.inTime, 'MM-DD hh:mm:ss') }}</text>
							</view>
							<view class="field-right" v-if="parkEvent.carResult.parkInParkRecord.outTime">
								<text>出场时间：</text>
								<text>{{ $formatTimeUtil.formatStandardTime(parkEvent.carResult.parkInParkRecord.outTime, 'MM-DD hh:mm:ss') }}</text>
							</view>
						</view>
						<!-- 入场时间、出场时间 end -->
						
						<!-- 停车时长 start -->
						<view class="brake-helper-event-content-field" v-if="parkEvent.outCarResult && parkEvent.outCarResult.parkingDuration">
							<text>停车时长：</text><text style="color: #1890ff;">{{ parkEvent.outCarResult.parkingDuration }}</text>
						</view>
						<!-- 停车时长 end -->
						
						<!-- 优惠 start -->
						<view class="brake-helper-event-content-field" v-if="parkEvent.outCarResult && parkEvent.outCarResult.coupons && parkEvent.outCarResult.coupons.length > 0">
							<view v-for=" (couponDisInfoDto, index) in parkEvent.outCarResult.coupons">
								<view v-if="parseInt(couponDisInfoDto.isSelect)">
									<view class="field-left">
										<text>优惠类型：</text><text>{{ $t(`parking.disTypeList_${couponDisInfoDto.coupon.disType}`) }}</text>
									</view>
									
									<view class="field-right">
										<text>优惠费用：</text><text>￥{{ couponDisInfoDto.disFee }}</text>
									</view>
								</view>
							</view>
						</view>
						<!-- 优惠 end -->
						
						<!-- 停车费用、应缴费用 start -->
						<view class="brake-helper-event-content-field" v-if="parkEvent.outCarResult && (parkEvent.outCarResult.parkFee || parkEvent.outCarResult.payFee)">
							<view class="field-left">
								<text>停车费用：￥</text>
								<text>{{ parkEvent.outCarResult.parkFee }}</text>
							</view>
							<view class="field-right" v-if="parkEvent.carResult && parkEvent.carResult.parkInParkRecord && parkEvent.carResult.parkInParkRecord.payFee">
								<text>已缴费用：￥</text>
								<text>{{ parkEvent.carResult.parkInParkRecord.payFee }}</text>
							</view>
						</view>
						<!-- 停车费用、应缴费用 end -->
							
						<!-- 支付成功事件   -->
						<!-- <view class="brake-helper-event-content-field payment" v-if="parkEvent.parkEventType === 23002">
							
							<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/parking-assistant/wxjs.png" mode="aspectFit" v-if="parkEvent.outCarResult.payType === 1" />
							<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/parking-assistant/zfbjs.png" mode="aspectFit" v-else-if="parkEvent.outCarResult.payType === 2" />
							<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/parking-assistant/xjjs.png" mode="aspectFit" v-else="parkEvent.outCarResult.payType === 3" />
						</view> -->
						
						<!-- 已缴费用、支付类型 start -->
						<view class="brake-helper-event-content-field" v-if="parkEvent.outCarResult">
							<view class="field-left">
								<text>应缴费用：</text>
								<text style="color: rgb(227, 46, 46); font-weight: bold;">￥{{ parkEvent.outCarResult.payFee }}</text>
							</view>
							<view class="field-right" v-if="parkEvent.parkEventType === 23002 && parkEvent.outCarResult.payType">
								<text>支付类型：</text>
								<view :class="'js-type-' + parkEvent.outCarResult.payType">{{ jsTypeList[parkEvent.outCarResult.payType - 1] }}</view>
							</view>
						</view>
						<!-- 已缴费用、支付类型 end -->
						
						<!-- 车辆图片 start -->
						<view class="brake-helper-event-content-field img-field" v-if="index !== 0 && parkEvent.carResult.img">
							<image :src="parkEvent.carResult.img" mode="widthFix" style="width: 50%;" @click.stop="previewImage(parkEvent.carResult.img)" />
						</view>
						<!-- 车辆图片 end -->
						
						<view class="brake-helper-operation" v-if="index == 0 && !isCarLimit(parkEvent.parkEventType)">
							<!-- 现金收费 start -->
							<view 
								class="brake-helper-operation-btn cash" 
								hover-class="hover-class" 
								@click.stop="bindCashPayClick(parkEvent.carResult.parkInParkRecord.id)"
								v-if="parkEvent.parkEventType == 23001 && parkEvent.carResult.parkInParkRecord"
							>
								现金收费
							</view>
							<!-- 现金收费 end -->
							
							
							<!-- 异常放行 start -->
							<view 
								class="brake-helper-operation-btn error" 
								hover-class="hover-class" 
								@click.stop="bindExceptionPassClick(parkEvent)"
								v-if="parkEvent.parkEventType == 22001"
							>
								异常放行
							</view>
							<!-- 异常放行 end -->
						</view>
					</view>
					<!-- 最新一条记录(第一条记录)后面显示历史记录 start -->
					<view class="history-record-text" v-if="index == 0">历史记录</view>
					<!-- 最新一条记录(第一条记录)后面显示历史记录 end -->
				</view>
			</view>
		</view>
		<!-- 事件展示区 end -->
		
		<view class="no-brake-helper-event-list" v-else>
			暂无停车记录
		</view>
	</view>
</template>

<script>
	let currPage = 1;
	export default {
		data() {
			return {
				brakeInfoList: [],
				currentCameraDevObj: {
					
				},
				parkEventList: null,
				// 结算类型
				jsTypeList: [
					"微信",
					"支付宝",
					"现金"
				]
			}
		},
		methods:{
			// 获取摄像头设备列表
			getCameraList(deviceId, isStopPullDownRefresh) {
				var currentCommunity = this.$getUserInfo().currentCommunity;
				if (currentCommunity !== undefined) {
					var communityId = currentCommunity.id;
					this.$req.request({
						url: "/parkDevice/app/list",
						method: "POST",
						data: {
							pageSize: 10000,
							currPage: currPage,
							communityId: communityId,
						},
						isShowLoading: false,
						success: res => {
							this.brakeInfoList = res.data.list;
							if (this.brakeInfoList.length) {
								// 进入该页面
								if (deviceId == null) {
									this.currentCameraDevObj = this.brakeInfoList[0];
									deviceId = this.currentCameraDevObj.id;
								}
								// 刷新当前页面
								else {
									this.currentCameraDevObj = this.brakeInfoList.filter((cameraDevObj, index) => {
										if (cameraDevObj.id == deviceId) {
											return cameraDevObj;
										}
									})[0];
								}
								this.getParkEventList(deviceId, isStopPullDownRefresh);
							}
						}
					});
				}
			},
			
			// 摄像头设备选择
			bindCameraPickerChange(e) {
				this.currentCameraDevObj = this.brakeInfoList[e.detail.value];
				this.getParkEventList(this.currentCameraDevObj.id);
			},
			
			// 获取事件记录	
			getParkEventList(deviceId, isStopPullDownRefresh) {
				let currentCommunity = this.$getUserInfo().currentCommunity;
				if (currentCommunity !== undefined && deviceId) {
					let communityId = currentCommunity.id;
					this.$req.request({
						url: "/parkDevice/app/getParkEventPageList",
						method: "POST",
						data: {
							pageSize: 1000,
							deviceId: deviceId,
							communityId: communityId
						},
						success: res => {
							if (res.code === 0) {
								// 获取到事件列表根据时间排序
								this.parkEventList = res.data.list.sort((a, b) => {
									if (a.eventTime >= b.eventTime) {
										return -1;
									}
									else {
										return 1;
									}
								});
								
								// 要停止下拉刷新
								if (isStopPullDownRefresh) {
									uni.stopPullDownRefresh();
								}
							}
						}
					});
				}
			},
			
			// 开闸
			open(devSn) {
				var currentCommunity = this.$getUserInfo().currentCommunity;
				if (currentCommunity !== undefined) {
					var communityId = currentCommunity.id;
					if (devSn) {
						this.$req.request({
							url: "/parkInfo/app/openOrCloseDoor",
							method: "POST",
							data: {
								devSn: devSn,
								communityId: communityId,
							},
							success: res => {
								if (res.code == 0) {
									this.$showToast("开闸成功");
								}
							}
						});
					}
					else {
						this.$showToast("暂无设备");
					}
				}
			},
			
			// 跳转到车闸历史记录页面
			goToBrakeRecordPage() {
				this.$navigateTo("./brake-record");
			},
			
			// 跳转到车闸记录详情页面
			goToBrakeRecordDetailPage(parkEvent) {
				this.$navigateTo(`./brake-record-detail?currentCameraDevObj=${JSON.stringify(this.currentCameraDevObj)}&parkEvent=${JSON.stringify(parkEvent)}`);
			},
			
			// 跳转到车闸手动入场页面
			goToBrakeManualEntryPage() {
				this.$navigateTo("./brake-manual-entry-out?type=1");
			},
			
			// 跳转到车闸手动出场页面
			goToBrakeManualOutPage() {
				this.$navigateTo("./brake-manual-entry-out?type=2");
			},
			
			// 跳转到车闸校正车牌页面
			goToBrakeCorrectLicensePlatePage() {
				this.$navigateTo("./brake-correct-license-plate");
			},
			
			// 加载停车事件图片失败
			loadCarResultImgError(error) {
				this.$showLog("加载停车事件图片失败", error);
				this.parkEventList[0].carResult.img = "";
			},
			
			// 客户端发送消息给服务器端
			sendSocketMessage() {
				uni.sendSocketMessage({
					data: "心跳",
					success: () => {
						this.$showLog("通过实时获取停车事件的Websocket连接发送数据成功");
					},
					fail: (error) => {
						this.$showLog("通过实时获取停车事件的Websocket连接发送数据失败");
					}
				});
			},
			
			// 现金收费点击事件
			bindCashPayClick(recordId) {
				let communityId = this.$getUserInfo().currentCommunity.id;
				this.$req.request({
					url: "/parkInfo/app/cashPay",
					method: "POST",
					data: {
						communityId: communityId,
						recordId: recordId
					},
					success: res => {
						if (res.code == 0) {
							this.$showToast("操作成功");
							setTimeout(() => {
								this.getParkEventList(this.currentCameraDevObj.id, false);
							}, 1000);
						}
					}
				});
			},
			
			// 异常放行点击事件
			bindExceptionPassClick(parkEvent) {
				let communityId = this.$getUserInfo().currentCommunity.id;
				this.$req.request({
					url: "/parkInfo/app/exceptionPass",
					method: "POST",
					data: {
						outDeviceId: parkEvent.deviceId,
						carNo: parkEvent.carResult.carNo,
						carNoType: parkEvent.carResult.carNoType,
						outImg: parkEvent.carResult.img,
						communityId: communityId
					},
					success: res => {
						if (res.code == 0) {
							this.$showToast("操作成功");
							setTimeout(() => {
								this.getParkEventList(this.currentCameraDevObj.id, false);
							}, 1000);
						}
					}
				});
			},
			
			// 点击图片来预览图片
			previewImage(imgPath) {
				uni.previewImage({
					urls: [imgPath]
				});
			},
			
			// 是否车辆限制
			isCarLimit(code) {
				return code == 12001 || code == 22003;
			}
		},
		onLoad() {
			this.getCameraList(null, false);
			
			// APP端做实时太麻烦,目前只需要下拉刷新页面即可
			// // 实时获取停车事件的Websocket地址
			// let webSocketParkingURL = "wss://cloud-api.thinmoo.com/webSocket/park";
			// // 创建一个实时获取停车事件的Websocket连接
			// uni.connectSocket({
			//     url: webSocketParkingURL,
			// 	success: (data) => {
			// 		this.$showLog("创建一个实时获取停车事件的Websocket连接成功", data);
			// 	},
			// 	fail: (error) => {
			// 		this.$showLog("创建一个实时获取停车事件的Websocket连接失败", error);
			// 	}
			// });
			
			// // 监听实时获取停车事件的Websocket连接打开事件
			// uni.onSocketOpen((res) => {
			// 	this.$showLog("实时获取停车事件的Websocket连接已打开！", res);
				
			// 	// 客户端每隔一段时间（这里设置为2分钟）主动发送消息给服务器端，避免因为长时间没有数据更新发送导致Websocket自动断开连接
			// 	setTimeout(() => {
			// 		this.sendSocketMessage();
			// 	}, 120000);
			// });
			
			// // 监听实时获取停车事件的Websocket接受到服务器的消息事件
			// uni.onSocketMessage((res) => {
			// 	this.$showLog("收到服务器内容", res.data);
			// 	this.sendSocketMessage();
			// });
			
			// // 监听实时获取停车事件的Websocket错误
			// uni.onSocketError((res) => {
			// 	this.$showLog("实时获取停车事件的WebSocket连接打开失败，请检查！", res);
			// });
		},
		
		onPullDownRefresh() {
			this.$showLog("当前用户下拉刷新");
			this.getCameraList(this.currentCameraDevObj.id, true);
		}
	}
</script>

<style lang="scss">
	@mixin mask {
		color: #FFFFFF !important;
		border-radius: 4upx;
		display: inline-block;
		padding: 0px 6upx;
	}
	// 车闸助手页面
	.brake-helper {
		width: 100%;
		background: #F9F9F9;
		// 车闸设备名称、状态
		.brake-helper-top-status {
			padding: 15upx 30upx; 
			overflow: hidden;
			// 车闸设备名称
			.brake-helper-top-status-left {
				float: left;
				image {
					width: 20upx; 
					height: 20upx; 
					margin-left: 16upx;
				}
			}
			// 状态
			.brake-helper-top-status-right {
				float: right; 
				color: rgb(178, 178, 178);
				.online {
				    color: rgb(37, 182, 51);
				}
				.offline {
				    color: rgb(229, 50, 50);
				}
			}
		}
		// 车闸的模式
		.brake-helper-mode {
			position: relative;
			// 进出类型
			.brake-helper-mode-in-out-type {
				position: absolute; 
				color: #FFFFFF; 
				top: 10upx; 
				left: 30upx;
			}
			// 区域
			.brake-helper-mode-area {
				position: absolute; 
				color: #FFFFFF; 
				top: 10upx; 
				right: 30upx;
			}
			// 文字说明
			.brake-helper-mode-text-description {
				position: absolute; 
				bottom: 30upx; 
				right: 30upx; 
				background-color: rgba(256, 256, 256, 0.5); 
				padding: 6upx 30upx; 
				border-radius: 30upx;
			}
		}
		// 操作展示区
		.brake-helper-operation {
			padding: 30upx; 
			overflow: hidden;
			.brake-helper-operation-btn {
				background-color: rgb(58, 169, 240); 
				color: #FFFFFF; 
				width: 20%; 
				text-align: center; 
				float: left; 
				margin-right: 30upx;
			}
			.brake-helper-operation-history-record {
				color: rgb(97, 186, 243); 
				float: right; 
				margin-right: 15upx;
			}
			// 现金缴费
			.cash {
			    background: rgb(0, 190, 190);
				margin-left: -30upx;
				padding: 0 10upx;
			}
			// 异常放行
			.error {
			    background: rgb(227, 46, 46);
				margin-left: -30upx;
				padding: 0 10upx;
			}
		}
		// 事件展示区
		.brake-helper-event {
			padding: 15upx 10upx;  
			margin-top: 30upx;
			// 第一个停车事件
			&.first-event {
				// 添加文本历史记录
				// &::after {
				// 	content: "\5386 \53f2 \8bb0 \5f55" !important;
				// 	text-align: center;
				// 	display: block;
				// 	color: rgb(97, 186, 243);
				// 	letter-spacing: 6upx;
				// 	font-size: 36upx;
				// 	// border-left: 3upx solid rgb(97, 186, 243);  
				// 	// border-right: 3upx solid rgb(97, 186, 243);
				// }
			}
			// 不是第一个停车事件
			&.not-first-event {
				border: 3upx solid #DDDDDD;
				border-radius: 30upx; 
				box-shadow: 0 0 10upx #DDDDDD;
				margin-top: 60upx;
			}
			// 事件展示区头部
			.brake-helper-event-title {
				overflow: hidden; 
				padding: 15upx; 
				border-bottom: 3upx solid #DDDDDD;
				// 事件展示区头部事件名
				.brake-helper-event-title-event-name {
					float: left; 
					font-size: 36upx; 
					font-weight: 600;
				}
				// 事件展示区头部事件详情
				.brake-helper-event-title-detail {
					float: right; 
					color: #BBBBBB;
				}
			}
			// 事件展示区内容
			.brake-helper-event-content {
				padding: 15upx;
				position: relative;
				.brake-helper-event-content-field {
					color: #AAAAAA; 
					overflow: hidden;
					margin-bottom: 10upx;
					// position: relative;
					.field-left {
						float: left; 
						width: 48%; 
						overflow: hidden; 
						text-overflow: ellipsis; 
						white-space: nowrap;
					}
					.field-right {
						float: left; 
						width: 48%; 
						margin-left: 16upx;
						overflow: hidden;
						text-overflow: ellipsis; 
						white-space: nowrap;
					}
					.in-normal {
						@include mask;
					    background: rgb(243, 186, 3);
					}
					.car-type {
						@include mask;
					    background: rgb(240, 147, 47);
					}
					.black-car-type {
						@include mask;
					    background: rgb(229, 50, 50);
					}
					// 微信结算
					.js-type-1 {
						@include mask;
						background: rgb(37, 182, 51);
					}
					// 支付宝结算 
					.js-type-2 {
						@include mask;
						background: rgb(58, 169, 240);
					}
					// 现金结算
					.js-type-3 {
						@include mask;
						background: rgb(227, 46, 46);
					}
					&.payment {
						text-align: center;
						width: 100%;
						// 图片样式
						image {
							position: absolute;
							width: 50%;
							bottom: 0;
							right: 0;
							opacity: 0.5;
						}
					}
					&.img-field {
						display: flex; 
						align-items: flex-start;
					}
				}
			}
			// 最新一条记录后面的历史记录文本
			.history-record-text {
				margin-top: 20upx;
				position: relative;
				text-align: center;
				overflow: hidden;
				display: block;
				color: rgb(97, 186, 243);
				letter-spacing: 6upx;
				font-size: 36upx;
				// 显示分割线 start
				&::after, &::before {
					content: "";
					display: inline-block;
					width: 100%;
					height: 1px;
					position: absolute;
					background: rgb(97, 186, 243);
					top: 50%;
				}
				&::before {
					margin-left: -20upx;
					transform: translateX(-100%);
				}
				&::after {
					margin-left: 20upx;
				}
				// 显示分割线 end
			}
		}
		// 没有事件记录
		.no-brake-helper-event-list {
			margin-top: 16upx;
			text-align: center;
			color: #AAAAAA;
		}
	}
</style>
