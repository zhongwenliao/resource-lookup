<template>
	<view class="brake-correct-license-plate">
		<view class="brake-correct-license-plate__form">
			<!-- 车牌号展示区 start -->
			<view class="form__carNo-field">
				<view class="form__carNo-field__label">
					<text style="margin-left: 10upx;">车牌号</text>
				</view>
				<view class="form__carNo-field__value">
					<input 
						class="form__carNo-field__value__input" 
						type="text" 
						placeholder="请输入车牌号" 
						@focus="bindCarNoInputFocus" 
						v-model="form.carNo" 
					/>
				</view>
			</view>
			<!-- 车牌号展示区 end -->
			
			<!-- 相似度展示区 start -->
			<view class="form__similarity-field">
				<view class="form__similarity-field__label">
					<text style="margin-left: 10upx;">相似度</text>
				</view>
				<view class="form__similarity-field__value">
					<input class="form__similarity-field__value__input" type="text" placeholder="请输入相似度"  v-model="form.similarity" />
				</view>
			</view>
			<!-- 相似度展示区 end -->
			
			<!-- 查询按钮展示区 start -->
			<view class="form__search-btn">
				<view class="search-btn" hover-class="hover-class" @click="bindQueryResultClick">查 询</view>
			</view>
		</view>
		
		<!-- 查询结果展示区 start -->
		<view class="search-result">
			<view class="search-result__text">查询结果</view>
			<!-- 事件展示区 start -->
			<view v-if="queryResult && queryResult.length">
				<view class="search-result__park-record" v-for="(parkRecord, index) in queryResult">
					<view style="padding: 15upx;">
						<!-- 车牌号、相似度、区域 start -->
						<view class="search-result__park-record__title">
							<view class="park-record__title__car-no-similarity">
								<text style="font-size: 36upx;">{{ parkRecord.carNo }}</text>
								<view class="park-record__title__car-no-similarity__container">
									<image src="../../static/img/parking-assistant/shi.png" mode="aspectFit" />
									<!-- <text style="background-color: rgb(58, 169, 240); color: #FFFFFF; font-size: 26upx; padding: 0 10upx; border-radius: 10upx;">似</text> -->
									<text>{{ parkRecord.similarity }}</text>
								</view>
							</view>
							<view class="search-result__park-record__title__area">
								<text>区域：</text>
								<text>{{ parkRecord.areaName }}</text>
							</view>
						</view>
						<!-- 车牌号、相似度、区域 end -->
						
						<!-- 车辆类型、车牌类型 start -->
						<view class="search-result__park-record__field">
							<view class="search-result__park-record__field__left">
								<text>车辆类型：</text>
								<text>{{ $t(`parking.carTypeList_${parkRecord.carType}`) }}</text>
							</view>
							<view class="search-result__park-record__field__right">
								<text>车牌类型：</text>
								<text>{{ $t(`parking.carNoTypeList_${parkRecord.carNoType}`) || "无牌车" }}</text>
							</view>
						</view>
						<!-- 车辆类型、车牌类型 end -->
						
						<!-- 进场设备、出场设备 start -->
						<view class="search-result__park-record__field">
							<view class="search-result__park-record__field__left">
								<text>进场设备：</text>
								<text>{{ parkRecord.inDeviceName || "暂无" }}</text>
							</view>
							<view class="search-result__park-record__field__right">
								<text>出场设备：</text>
								<text>{{ parkRecord.outDeviceName || "暂无" }}</text>
							</view>
						</view>
						<!-- 进场设备、出场设备 end -->
						
						<!-- 入场时间、出场时间 start -->
						<view class="search-result__park-record__field">
							<view v-if="parkRecord.inTime">
								<text>入场时间：</text>
								<text>{{ parkRecord.inTime }}</text>
							</view>
							
							<view v-if="parkRecord.outTime">
								<text>出场时间：</text>
								<text>{{ parkRecord.outTime }}</text>
							</view>
						</view>
						<!-- 入场时间、出场时间 end -->
						
						<!-- 现场图片、校 正 start -->
						<view class="search-result__park-record__field img-correct-field">
							<view class="img-field">
								<view class="img-field-container" v-if="parkRecord.inImg || parkRecord.outImg">
									<text>现场图片：</text>
									<!-- 入场图片 start -->
									<view class="img-field-container__in-img-container" v-if="parkRecord.inImg">
										<image 
											:src="parkRecord.inImg" 
											mode="widthFix" 
											@error="loadParkRecordImgError(1, parkRecord)"
											@click="previewImage(parkRecord.inImg)"
										/>
										<text>入</text>
									</view>
									<!-- 入场图片 end -->
									
									<!-- 出场图片 start -->
									<view class="img-field-container__out-img-container" v-if="parkRecord.outImg">
										<image 
											:src="parkRecord.outImg" 
											mode="aspectFill" 
											style="left: 160upx;" 
											@error="loadParkRecordImgError(2, parkRecord)"
											@click="previewImage(parkRecord.outImg)"
										/>
										<text style="left: 160upx;">出</text>
									</view>
									<!-- 出场图片 end -->
								</view>
							</view>
							
							<view class="correct-btn" hover-class="hover-class" @click="bindCorrectClick(parkRecord)">
								校 正
							</view>
						</view>
						<!-- 现场图片、校 正 end -->
					</view>
				</view>
			</view>
			<!-- 事件展示区 end -->
			
			<view class="search-result__no-record" v-else-if="queryResult && queryResult.length == 0">
				暂无查询结果
			</view>
		</view>
		<!-- 查询结果展示区 end -->
		
		<!-- 校正弹窗展示区 start -->
		<uni-neil-modal
			ref="NeilModal"
			title="校正车牌" 
			confirm-text="确定" 
			:show="isShowModal"  
			:auto-close="false" 
			@confirm="bindConfirmClick"
			@cancel="bindCancelClick"
			v-if="correctLicensePlateForm.carNo || correctLicensePlateForm.inTime">
		    <view class="neil-modal-container">
		        <!-- 车牌号展示区 start -->
		        <view class="neil-modal-container__car-no-field">
		        	<view class="car-no-field__label">
		        		<text class="require-text">*</text>
						<text style="margin-left: 10upx;">车牌号</text>
		        	</view>
		        	<view class="car-no-field__value">
		        		<input 
							type="text" 
							placeholder="请输入车牌号" 
							@focus="bindCarNoInputFocus" 
							v-model="correctLicensePlateForm.carNo" 
						/>
		        	</view>
		        </view>
		        <!-- 车牌号展示区 end -->
				
				<!-- 入场时间展示区 start -->
				<view class="neil-modal-container__in-time-field">
					<view class="in-time-field__label">
						<text class="require-text">*</text>
						<text style="margin-left: 10upx;">入场时间</text>
					</view>
					<view class="in-time-field__value">
						<rattenking-dtpicker
							fields="second"
							start="2021-01-01 00:00:00"
							end="2030-12-30 23:59:59"
							:value="correctLicensePlateForm.inTime"
						></rattenking-dtpicker>
					</view>
					<image src="../../static/img/right.png" mode="aspectFit" />
				</view>
				<!-- 入场时间展示区 end -->
		    </view>
		</uni-neil-modal>
		<!-- 校正弹窗展示区 end -->
		
		<!-- 车牌软键盘组件 start -->
		<parking-keyboard 
			:isShow="isShowParkingKeyboard" 
			@exit="bindParkingKeyboardExit" 
			@inputchange="bindParkingKeyboardInputchange" 
			@ok="bindParkingKeyboardOK" 
			:rjpNumber="rjpNumber"
			oinp=""
		></parking-keyboard>
		<!-- 车牌软键盘组件 end -->
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 查询提交的表单数据
				form: {
					// 车牌号
					carNo: "",
					// 相似度
					similarity: "0.5",
					// 访问小区id
					communityId: this.$getUserInfo().currentCommunity.id
				},
				queryResult: null,
				isShowModal: false,
				// 校正提交的表单数据
				correctLicensePlateForm: {
					carNo: "",
					inTime: ""
				},
				// 车牌软键盘组件是否打开
				isShowParkingKeyboard: false,
				// 车牌软键盘接受判断转中英 1: 中文  2: 英文
				rjpNumber: 1
			}
		},
		watch: {
			// 监听车牌号输入框的值变化，当第一个字符的中字输入之后，自动切换当前车牌软键盘的输入方式为英文(包含数字)
			"form.carNo"(newVal, oldVal) {
				this.switchKeyboardInput(newVal, oldVal);
			},
			
			// 监听校正弹窗中车牌号输入框的值变化，当第一个字符的中字输入之后，自动切换当前车牌软键盘的输入方式为英文(包含数字)
			"correctLicensePlateForm.carNo"(newVal, oldVal) {
				this.switchKeyboardInput(newVal, oldVal);
			}
		},
		methods: {
			// 查询点击事件
			bindQueryResultClick() {
				if (!this.form.carNo) {
					this.$showToast("车牌号不能为空");
				}
				else if (!this.form.similarity) {
					this.$showToast("车牌号不能为空");
				}
				else {
					this.$req.request({
						url: "/parkInParkRecord/app/getSimilarCars",
						// method: "GET",
						data: this.form,
						success: (res) => {
							if (res.code === 0) {
								this.queryResult = res.data.list;
							}
						}
					});
				}
			},
			
			// 校正点击事件
			bindCorrectClick(parkRecord) {
				this.correctLicensePlateForm = {
					...this.correctLicensePlateForm,
					"carNo": parkRecord.carNo,
					"inTime": parkRecord.inTime || this.$dateFormat.format(new Date()),
					"id": parkRecord.id,
					// 访问小区id
					communityId: this.$getUserInfo().currentCommunity.id
				};
				this.$nextTick(() => {
					this.isShowModal = true;
				});
			},
			
			closeModal() {
				this.correctLicensePlateForm = {
					carNo: "",
					inTime: ""
				};
				this.isShowModal = false;
			},
			
			// 入场时间选择事件
			bindDateChange(e) {
				this.date = e.target.value;
			},
			
			// 校正确定点击事件
			bindConfirmClick() {
				let { carNo, inTime } = this.correctLicensePlateForm;
				if (!carNo) {
					this.$showToast("车牌号不能为空");
				}
				else if (!inTime) {
					this.$showToast("入场时间不能为空");
				}
				else {
					this.$req.request({
						url: "/parkInParkRecord/app/check",
						method: "POST",
						data: this.correctLicensePlateForm,
						success: (res) => {
							if (res.code === 0) {
								this.$showToast("校正车牌成功");
								this.closeModal();
								this.$refs.NeilModal.closeModal();
							}
						}
					});
				}
			},
			
			// 校正取消点击事件
			bindCancelClick() {
				this.closeModal();
				this.$refs.NeilModal.closeModal();
			},
			
			// 加载停车图片失败
			loadParkRecordImgError(type, parkRecord) {
				// 进场图片
				if (type == 1) {
					parkRecord.inImg = "../../static/img/parking-assistant/che.png";
				}
				// 出场图片
				else {
					parkRecord.outImg = "../../static/img/parking-assistant/che.png";
				}
			},
			
			// 点击图片来预览图片
			previewImage(imgPath) {
				uni.previewImage({
					urls: [imgPath]
				});
			},
			
			// 切换车牌软键盘输入方式
			switchKeyboardInput(newVal, oldVal) {
				this.$showLog("newVal", newVal);
				// 当前车牌软键盘的输入方式切换为中文
				if (newVal === "") {
					this.rjpNumber = 1;
				}
				// 当前车牌软键盘的输入方式切换为英文
				else {
					this.rjpNumber = 2;
				}
			},
			
			// 绑定车牌号输入框聚焦事件
			bindCarNoInputFocus() {
				this.$showLog("bindCarNoInputFocus");
				uni.hideKeyboard();
				// 当前显示矫正车牌弹窗，操作校正车牌弹窗中车牌号，判断该车牌号是否为空，如果为空，则显示中文输入，输入省份、自治区、直辖市的简称，否则显示英文输入(包含数字)
				if (this.isShowModal) {
					// 该车牌号为空，显示中文输入，输入省份、自治区、直辖市的简称
					if (this.correctLicensePlateForm.carNo == "") {
						this.rjpNumber = 1;
					}
					// 显示英文输入(包含数字)
					else {
						this.rjpNumber = 2;
					}
				}
				// 当前不显示矫正车牌弹窗，表明操作查询中车牌号，判断该车牌号是否为空，如果为空，则显示中文输入，输入省份、自治区、直辖市的简称，否则显示英文输入(包含数字)
				else {
					// 该车牌号为空，显示中文输入，输入省份、自治区、直辖市的简称
					if (this.form.carNo == "") {
						this.rjpNumber = 1;
					}
					// 显示英文输入(包含数字)
					else {
						this.rjpNumber = 2;
					}
				}
				this.isShowParkingKeyboard = true;
			},
			
			// 绑定车牌软键盘组件退出事件
			bindParkingKeyboardExit() {
				// 关闭软键盘
				this.isShowParkingKeyboard = false; 
			},
			
			// 绑定车牌软键盘组件的改变事件
			bindParkingKeyboardInputchange(val, type) {
				this.$showLog("val", val);
				// 删除当前车牌号的最后一个字符
				if (val == 'delete') {
					// 当前的校正弹窗处于显示状态，修改的是校正弹窗中车牌号
					if (this.isShowModal) {
						this.correctLicensePlateForm.carNo = this.correctLicensePlateForm.carNo.substring(0, this.correctLicensePlateForm.carNo.length - 1);
					}
					// 当前的校正弹窗处于隐藏状态，修改的是查询中车牌号
					else {
						this.form.carNo = this.form.carNo.substring(0, this.form.carNo.length - 1);
					}
				}
				// 添加到当前车牌号的最后面
				else {
					// 当前的校正弹窗处于显示状态，操作的是校正弹窗中车牌号
					if (this.isShowModal) {
						this.correctLicensePlateForm.carNo += val;
					}
					else {
						this.form.carNo += val;
					}
				}
			},
			
			// 绑定车牌软键盘组件确认事件
			bindParkingKeyboardOK() {
				this.isShowParkingKeyboard = false;
			}
		},
		onLoad() {
			this.queryResult = null;
		}
	}
</script>

<style lang="scss">
	// 查询表单input样式
	@mixin search-input {
	   text-align: center;
	   font-size: 30upx;
	}
	
	// 查询表单field样式
	@mixin search-field {
	   width: 100%;
	   color: #AAAAAA; 
	   overflow: hidden; 
	   margin-top: 30upx;
	}
	
	// 查询表单field中label样式
	@mixin search-field-label {
	   float: left;
	   width: 20%; 
	   text-align: right;
	}
	
	// 查询表单field中value样式
	@mixin search-field-value {
	   float: left;
	   width: 65%; 
	   margin-left: 10upx; 
	   border-bottom: 3upx solid #AAAAAA;
	}
	
	// 校正车牌页面
	.brake-correct-license-plate {
		width: 100%; 
		background-color: rgb(250, 250, 250);
		// 校正车牌页面查询表单
		.brake-correct-license-plate__form {
			background-color: #FFFFFF; 
			padding: 30upx 15upx; 
			margin-top: 30upx;
			// 车牌号字段
			.form__carNo-field {
				@include search-field;
				// 车牌号字段label
				.form__carNo-field__label {
					@include search-field-label;
				}
				// 车牌号字段value
				.form__carNo-field__value {
					@include search-field-value;
					// 车牌号字段value中input
					.form__carNo-field__value__input {
						@include search-input;
					}
				}
			}
			// 相似度字段
			.form__similarity-field {
				@include search-field; 
				display: flex; 
				align-items: center;
				// 相似度字段label
				.form__similarity-field__label {
					@include search-field-label;
				}
				// 相似度字段value
				.form__similarity-field__value {
					@include search-field-value;
					// 相似度字段value中input
					.form__similarity-field__value__input {
						@include search-input;
					}
				}
			}
			// 查询按钮区域
			.form__search-btn {
				display: flex; 
				justify-content: center; 
				margin-top: 30upx;
				// 查询按钮
				.search-btn {
					width: 50%; 
					background-color: rgb(58, 169, 240); 
					padding: 15upx 0; 
					margin-top: 10upx; 
					color: #FFFFFF; 
					text-align: center;
				}
			}
		}
		// 查询结果
		.search-result {
			margin-top: 30upx;
			// 查询结果文本
			.search-result__text {
				font-size: 36upx; 
				font-weight: 300; 
				margin-left: 30upx; 
				color: rgb(36, 36, 36);
			}
			// 查询结果停车记录
			.search-result__park-record {
				padding: 15upx; 
				border-radius: 30upx; 
				box-shadow: 0 0 10upx #DDDDDD; 
				margin-top: 60upx;
				// 停车记录头部
				.search-result__park-record__title {
					overflow: hidden; 
					display: flex; 
					align-items: center;
					// 停车记录头部车牌号、相似度
					.park-record__title__car-no-similarity {
						float: left; 
						width: 50%; 
						display: flex; 
						align-items: flex-start;
						.park-record__title__car-no-similarity__container {
							display: flex; 
							align-items: center;
							image {
								width: 33upx; 
								height: 23upx; 
								margin-left: 10upx; 
								margin-right: 5upx;
							}
							text {
								color: #AAAAAA; 
								font-size: 26upx;
							}
						}
					}
					// 停车记录头部区域
					.search-result__park-record__title__area {
						float: left; 
						width: 50%;
					}
				}
				// 停车记录field
				.search-result__park-record__field {
					color: #AAAAAA; 
					overflow: hidden;
					// 图片、校正
					&.img-correct-field {
						display: flex; 
						align-items: flex-end;
						// 图片
						.img-field {
							float: left; 
							width: 80%;
							.img-field-container {
								display: flex; 
								align-items: flex-start;
								.img-field-container__in-img-container,
								.img-field-container__out-img-container {
									position: relative; 
									height: 90upx;
									image {
										width: 150upx; 
										height: 90upx; 
										position: absolute; 
										bottom: 0; 
										left: 0;
									}
									text {
										position: absolute; 
										background: rgba(0, 0, 0, 0.3); 
										color: #FFFFFF; 
										bottom: 0; 
										left: 0; 
										padding: 0 10upx;
									}
								}
							}
						}
						// 校正
						.correct-btn {
							float: right; 
							width: 20%; 
							background-color: rgb(58, 169, 240); 
							color: #FFFFFF; 
							text-align: center; 
							font-size: 36upx;
						}
					}
					// left、right
					.search-result__park-record__field__left, 
					.search-result__park-record__field__right {
						float: left; 
						width: 50%;
					}
				}
			}
			// 暂无记录
			.search-result__no-record {
				text-align: center; 
				margin-top: 30upx; 
				color: #AAAAAA;
			}
		}
		// 校正弹窗
		.neil-modal-container {
			min-height: 90upx; 
			padding: 32upx 15upx;
			// 校正弹窗车牌号field
			.neil-modal-container__car-no-field {
				width: 100%; 
				color: #AAAAAA; 
				overflow: hidden; 
				margin-top: 30upx;
				// 校正弹窗车牌号label
				.car-no-field__label {
					float: left; 
					width: 25%; 
					text-align: right;
				}
				// 校正弹窗车牌号value
				.car-no-field__value {
					float: left; 
					width: 65%; 
					margin-left: 10upx; 
					border-bottom: 3upx solid #AAAAAA;
					input {
						text-align: center; 
						font-size: 30upx;
					}
				}
			}
			// 校正弹窗入场时间field
			.neil-modal-container__in-time-field {
				width: 100%; 
				color: #AAAAAA; 
				overflow: hidden; 
				margin-top: 30upx; 
				display: flex; 
				align-items: center;
				// 校正弹窗入场时间label
				.in-time-field__label {
					float: left; 
					width: 25%; 
					text-align: right;
				}
				// 校正弹窗入场时间value
				.in-time-field__value {
					float: left; 
					width: 65%; 
					text-align: center; 
					margin-left: 10upx; 
					border-bottom: 3upx solid #AAAAAA;
				}
				image {
					margin-left: 10upx; 
					width: 16upx; 
					height: 16upx;
				}
			}
		}
		.rui-picker {
			border: none;
			height: 1.4em;
			justify-content: center;
		}
	}
</style>
