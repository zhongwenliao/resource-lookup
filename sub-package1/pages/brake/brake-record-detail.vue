<template>
	<view class="brake-record-detail">
		<!-- 车闸设备名称、状态展示区 start -->
		<view class="brake-record-detail-top-status">
			<view class="brake-record-detail-top-status-left">
				<text>{{ currentCameraDevObj.name || "暂无摄像头设备" }}</text>
			</view>
			
			<view class="brake-record-detail-top-status-right">
				<text>状态：</text>
				<text :class="[currentCameraDevObj.status ? (currentCameraDevObj.status == 1 ? 'online' : 'offline') : '']">
					{{ currentCameraDevObj.status ? (currentCameraDevObj.status == 1 ? "在线" : "离线") : "暂无信息" }}
				</text>
			</view>
		</view>
		<!-- 车闸设备名称、状态展示区 end -->
		
		<!-- 车闸的模式展示区 start -->
		<view class="brake-record-detail-mode">
			<image 
				:src="parkEvent.carResult.img" 
				mode="widthFix" 
				style="width: 100%;"
				@click="previewImage(parkEvent.carResult.img)"
				v-if="parkEvent.carResult.img" 
			/>
			<image 
				src="../../static/img/parking-assistant/che.png" 
				mode="widthFix" 
				style="width: 100%;"
				@click="previewImage('../../static/img/parking-assistant/che.png')"
				v-else 
			/>
			<view class="brake-record-detail-mode__in-out-type">
				<text>进出类型：</text>
				<text>{{ currentCameraDevObj.inOutType ? (currentCameraDevObj.inOutType == 1 ? "进" : "出") : "暂无信息" }}</text>
			</view>
			<view class="brake-record-detail-mode__area">
				<text>区域：</text>
				<text>{{ !currentCameraDevObj.outAreaName ? "场外" : currentCameraDevObj.outAreaName }}->{{ !currentCameraDevObj.inAreaName ? "场外" : currentCameraDevObj.inAreaName }}</text>
			</view>
		</view>
		<!-- 车闸的模式展示区 end -->
		
		<!-- 事件展示区 start -->
		<view class="brake-record-detail__event">
			<view class="brake-record-detail__event__title">
				<view class="brake-record-detail__event__title__text">
					<!-- <text>事件：</text> -->
					<text>{{ parkEvent.parkEventMsg }}</text>
				</view>
			</view>
			
			<view class="brake-record-detail__event__content">
				<!-- 车牌、车牌类型 start -->
				<view class="brake-record-detail__event__content__field">
					<!-- 车牌 start -->
					<view class="field-left">
						<text>车牌：</text>
						<text class="in-normal">{{ parkEvent.carResult.carNo.length > 10 ? "无牌车" : parkEvent.carResult.carNo }}</text>
					</view>
					<!-- 车牌 end -->
					
					<!-- 车牌类型 start -->
					<view class="field-right">
						<text>车牌类型：</text>
						<text>{{ $t(`parking.carNoTypeList_${parkEvent.carResult.carNoType || parkEvent.carResult.parkInParkRecord.carNoType}`) }}</text>
					</view>
					<!-- 车牌类型 end -->
				</view>
				<!-- 车牌、车牌类型 end -->
				
				<!-- 车辆类型 start -->
				<view class="brake-record-detail__event__content__field" v-if="parkEvent.carResult.carType">
					<view>
						<text>车辆类型：</text>
						<text :class="[parkEvent.carResult.carType == 1 ? 'car-type' : parkEvent.carResult.carType == 3 ? 'black-car-type' : '']">
							{{ $t(`parking.carTypeList_${parkEvent.carResult.carType}`) }}
						</text>
					</view>
				</view>
				<!-- 车辆类型 end -->
				
				<!-- 限制车辆原因 start -->
				<view class="brake-record-detail__event__content__field" v-if="isCarLimit(parkEvent.parkEventType)">
					<text>原因：</text>
					<text>{{ parkEvent.carResult.remark }}</text>
				</view>
				<!-- 限制车辆原因 end -->
				
				<!-- 停车时长 start -->
				<view class="brake-record-detail__event__content__field" v-if="parkEvent.outCarResult && parkEvent.outCarResult.parkingDuration">
					<text>停车时长：</text><text style="color: #1890ff;">{{ parkEvent.outCarResult.parkingDuration }}</text>
				</view>
				<!-- 停车时长 end -->
				
				<!-- 入场时间、出场时间 start -->
				<view class="brake-record-detail__event__content__field" v-if="parkEvent.carResult.parkInParkRecord">
					<!-- 入场时间 start -->
					<view class="field-left" v-if="parkEvent.carResult.parkInParkRecord.inTime">
						<text>入场时间：</text>
						<text>{{ $formatTimeUtil.formatStandardTime(parkEvent.carResult.parkInParkRecord.inTime, 'MM-DD hh:mm:ss') }}</text>
					</view>
					<!-- 入场时间 end -->
					
					<!-- 出场时间 start -->
					<view class="field-right" v-if="parkEvent.carResult.parkInParkRecord.outTime">
						<text>出场时间：</text>
						<text>{{ $formatTimeUtil.formatStandardTime(parkEvent.carResult.parkInParkRecord.outTime, 'MM-DD hh:mm:ss') }}</text>
					</view>
					<!-- 出场时间 end -->
				</view>
				<!-- 入场时间、出场时间 end -->
				
				<!-- 优惠 start -->
				<view 
					class="brake-record-detail__event__content__field" 
					v-if="parkEvent.outCarResult && parkEvent.outCarResult.coupons && parkEvent.outCarResult.coupons.length > 0"
				>
					<view v-for=" (couponDisInfoDto, index) in parkEvent.outCarResult.coupons">
						<view v-if="parseInt(couponDisInfoDto.isSelect)">
							<!-- 优惠类型 start -->
							<view class="field-left">
								<text>优惠类型：</text>
								<text>{{ $t(`parking.disTypeList_${couponDisInfoDto.coupon.disType}`) }}</text>
							</view>
							<!-- 优惠类型 end -->
							
							<!-- 优惠费用 start -->
							<view class="field-right">
								<text>优惠费用：</text>
								<text>￥{{ couponDisInfoDto.disFee }}</text>
							</view>
							<!-- 优惠费用 end -->
						</view>
					</view>
				</view>
				<!-- 优惠 end -->
				
				<!-- 停车费用、应缴费用 start -->
				<view 
					class="brake-record-detail__event__content__field" 
					v-if="parkEvent.outCarResult && (parkEvent.outCarResult.parkFee || parkEvent.outCarResult.payFee)"
				>
					<!-- 停车费用 start -->
					<view class="field-left">
						<text>停车费用：￥</text>
						<text>{{ parkEvent.outCarResult.parkFee }}</text>
					</view>
					<!-- 停车费用 end -->
					
					<!-- 已缴费用 start -->
					<view 
						class="field-right" 
						v-if="parkEvent.carResult && parkEvent.carResult.parkInParkRecord && parkEvent.carResult.parkInParkRecord.payFee"
					>
						<text>已缴费用：￥</text>
						<text>{{ parkEvent.carResult.parkInParkRecord.payFee }}</text>
					</view>
					<!-- 已缴费用 end -->
				</view>
				<!-- 停车费用、应缴费用 end -->
				
				<!-- 已缴费用、支付类型 start -->
				<view class="brake-record-detail__event__content__field" v-if="parkEvent.outCarResult">
					<!-- 应缴费用 start -->
					<view class="field-left">
						<text>应缴费用：</text>
						<text style="color: rgb(227, 46, 46); font-weight: bold;">￥{{ parkEvent.outCarResult.payFee }}</text>
					</view>
					<!-- 应缴费用 end -->
					
					<!-- 支付类型 start -->
					<view class="field-right" v-if="parkEvent.parkEventType === 23002 && parkEvent.outCarResult.payType">
						<text>支付类型：</text>
						<view :class="'js-type-' + parkEvent.outCarResult.payType">{{ jsTypeList[parkEvent.outCarResult.payType - 1] }}</view>
					</view>
					<!-- 支付类型 end -->
				</view>
				<!-- 已缴费用、支付类型 end -->
			</view>
		</view>
		<!-- 事件展示区 end -->
	</view>
</template>

<script>
	let currPage = 1;
	export default {
		data(){
			return {
				currentCameraDevObj: {
					
				},
				
				parkEvent: {
					
				},
				// 结算类型
				jsTypeList: [
					"微信",
					"支付宝",
					"现金"
				]
			}
		},
		methods: {
			// 是否车辆限制
			isCarLimit(code) {
				return code == 12001 || code == 22003;
			},
			
			// 点击图片来预览图片
			previewImage(imgPath) {
				uni.previewImage({
					urls: [imgPath]
				});
			}
		},
		onLoad(params) {
			this.currentCameraDevObj = JSON.parse(params.currentCameraDevObj);
			this.parkEvent = JSON.parse(params.parkEvent);
			this.$showLog("事件详情", this.parkEvent);
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
	// 车闸记录详情页面
	.brake-record-detail {
		width: 100%;
		background: #f9f9f9;
		// 车闸设备名称、状态
		.brake-record-detail-top-status {
			padding: 15upx 30upx; 
			overflow: hidden;
			// 车闸设备名称
			.brake-record-detail-top-status-left {
				float: left;
			}
			// 车闸设备状态
			.brake-record-detail-top-status-right {
				float: right; 
				color: rgb(178, 178, 178);
				// 在线状态
				.online {
				    color: rgb(37, 182, 51);
				}
				// 离线状态
				.offline {
				    color: rgb(229, 50, 50);
				}
			}
		}
		// 模式
		.brake-record-detail-mode {
			position: relative;
			// 进出类型
			.brake-record-detail-mode__in-out-type {
				position: absolute; 
				color: #FFFFFF; 
				top: 10upx; 
				left: 30upx;
			}
			// 区域
			.brake-record-detail-mode__area {
				position: absolute; 
				color: #FFFFFF; 
				top: 10upx; 
				right: 30upx;
			}
		}
		// 事件
		.brake-record-detail__event {
			padding: 15upx; 
			margin-top: 30upx;
			// title 
			.brake-record-detail__event__title {
				overflow: hidden; 
				padding: 15upx; 
				border-bottom: 3upx solid #DDDDDD;
				// title文本
				.brake-record-detail__event__title__text {
					float: left; 
					font-size: 36upx; 
					font-weight: 600;
				}
			}
			// content 
			.brake-record-detail__event__content {
				padding: 15upx 10upx;
				.brake-record-detail__event__content__field {
					color: #AAAAAA; 
					overflow: hidden;
					margin-bottom: 10upx;
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
					    color: #FFFFFF !important;
					    background: rgb(243, 186, 3);
					    display: inline-block;
					    padding: 0px 5px;
					    border-radius: 4px;
					}
					.car-type {
					    color: #FFFFFF !important;
					    background: rgb(240, 147, 47);
					    border-radius: 4upx;
					    display: inline-block;
					    padding: 0 6upx;
					}
					.black-car-type {
					    color: #FFFFFF !important;
					    background: rgb(229, 50, 50);
					    border-radius: 4upx;
					    display: inline-block;
					    padding: 0 6upx;
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
				}
			}
		}
	}
</style>
