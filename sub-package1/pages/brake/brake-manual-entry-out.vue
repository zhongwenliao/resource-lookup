<template>
	<view class="brake-manual-entry-out">
		<view class="brake-manual-entry-out_content">
			<!-- 车牌号展示区 start -->
			<view class="brake-manual-entry-out__field">
				<view class="brake-manual-entry-out__field__label">
					<text class="require-text">*</text><text style="margin-left: 10upx;">车牌号</text>
				</view>
				<view class="brake-manual-entry-out__field__value">
					<input type="text" placeholder="请输入车牌号" @focus="bindCarNoInputFocus" v-model="form.carNo" />
				</view>
			</view>
			<!-- 车牌号展示区 end -->
			
			<!-- 车牌类型展示区 start -->
			<view class="brake-manual-entry-out__field brake-manual-entry-out__picker-field">
				<view class="brake-manual-entry-out__field__label">
					<text class="require-text">*</text><text style="margin-left: 10upx;">车牌类型</text>
				</view>
				<view class="brake-manual-entry-out__field__value">
					<picker @change="bindLicensePlateTypePickerChange" :value="licensePlateTypeIndex" :range="licensePlateTypeArray">
						<view class="field__value__picker-view">{{ licensePlateTypeIndex > -1 ? licensePlateTypeArray[licensePlateTypeIndex] : "请选择车牌类型" }}</view>
					</picker>
				</view>
				<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/right.png" mode="aspectFit" />
			</view>
			<!-- 车牌类型展示区 end -->
			
			<!-- 进场、出场设备展示区 start -->
			<view class="brake-manual-entry-out__field brake-manual-entry-out__picker-field">
				<view class="brake-manual-entry-out__field__label">
					<text class="require-text">*</text><text style="margin-left: 10upx;">{{ pageType === 1 ? "进场设备" : "出场设备" }}</text>
				</view>
				<view class="brake-manual-entry-out__field__value">
					<picker range-key="name" :value="devIndex" :range="devArray" @change="bindDevPickerChange">
						<view  class="field__value__picker-view">{{ devIndex > -1 ? devArray[devIndex]["name"] : "请选择设备" }}</view>
					</picker>
				</view>
				<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/right.png" mode="aspectFit"></image>
			</view>
			<!-- 进场、出场设备展示区 end -->
			
			<!-- 入场、出场时间展示区 start -->
			<view class="brake-manual-entry-out__field brake-manual-entry-out__picker-field">
				<view class="brake-manual-entry-out__field__label">
					<text class="require-text">*</text><text style="margin-left: 10upx;">{{ pageType === 1 ? "入场时间" : "出场时间" }}</text>
				</view>
				<view class="brake-manual-entry-out__field__value">
					<rattenking-dtpicker
						fields="second"
						start="2021-01-01 00:00:00"
						end="2030-12-30 23:59:59"
						:value="form.time"
					></rattenking-dtpicker>
					<!-- <picker mode="date" @change="bindDateChange">
						<view>{{ form.time }}</view>
					</picker> -->
				</view>
				<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/right.png" mode="aspectFit"></image>
			</view>
			<!-- 入场、出场时间展示区 end -->
			
			<!-- 入场、出场图片展示区 start -->
			<view class="brake-manual-entry-out__field brake-manual-entry-out__picker-field" style="margin-top: 60upx;">
				<view class="brake-manual-entry-out__field__label">
					<text class="require-text">*</text><text style="margin-left: 10upx;">{{ pageType === 1 ? "入场图片" : "出场图片" }}</text>
				</view>
			</view>
				
			<view class="brake-manual-entry-out__image-field">
				<view class="img_box" style="margin-left: 20upx;">
					<view class="picture" v-for="(item, index) in form.imageList" :key="index">
						<view class="tu">
							
							<!-- 删除图片 start -->
							<u-icon class="del" name="close-circle-fill" color="#000000" size="45" @click="deleteImage(index, form.imageList)"></u-icon>
							<!-- 删除图片 end -->
							
							<image :src="item" @click="previewImage(index, form.imageList)"></image>
						</view>
					</view>
					
					<!-- 点击上传图片 start -->
					<view class="photo" @click="photo" v-if="form.imageList.length < 1">
						<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/adds.png"></image>
					</view>
					<!-- 点击上传图片 end -->
				</view>
			</view>
			<!-- 入场、出场图片展示区 end -->
			
			<!-- 备注展示区 start -->
			<view class="brake-manual-entry-out__field" style="margin-top: 60upx;" v-if="pageType === 1">
				<view class="brake-manual-entry-out__remarks-field-label">
					<text style="margin-left: 10upx;">备注</text>
				</view>
				<view class="brake-manual-entry-out__remarks-field-value">
					<textarea class="brake-manual-entry-out__remarks-field-value__textarea" :maxlength="50" placeholder="请输入内容" v-model="form.remark"></textarea>
					<text class="brake-manual-entry-out__remarks-field-value__text">{{ form.remark.length }} / 50</text>
				</view>
			</view>
			
			<!-- 备注展示区 end -->
			
			<view class="brake-manual-entry-out__operation">
				<view class="brake-manual-entry-out__operation__btn cancel" hover-class="hover-class" @click="bindCancelClick">取 消</view>
				<view class="brake-manual-entry-out__operation__btn confirm" hover-class="hover-class" @click="bindConfirmClick">确 定</view>
			</view>
		</view>

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
				// 提交到后端的表单数据
				form: {
					// 车牌号
					carNo: "",
					// 车牌类型
					carNoType: null,
					// 设备id
					deviceId: null,
					// 备注内容
					remark: "",
					// 图片
					imageFile: null,
					// 时间
					time: this.$dateFormat.format(new Date()),
					// 上传图片列表
					imageList: []
				},
				// 车牌类型数组
				licensePlateTypeArray: [],
				// 车牌类型索引
				licensePlateTypeIndex: -1,
				// 设备数组
				devArray: [],
				// 进场设备索引
				devIndex: -1,
				// 0: 未知   1: 手动入场   2: 手动出场
				pageType: 0,
				// 车牌软键盘组件是否打开
				isShowParkingKeyboard: false,
				// 车牌软键盘接受判断转中英 1: 中文  2: 英文
				rjpNumber: 1
			}
		},
		watch: {
			// 监听车牌号输入框的值变化，当第一个字符的中字输入之后，自动切换当前车牌软键盘的输入方式为英文(包含数字)
			"form.carNo"(newVal, oldVal) {
				this.$showLog("newVal", newVal);
				// 当前车牌软键盘的输入方式切换为中文
				if (newVal === "") {
					this.rjpNumber = 1;
				}
				// 当前车牌软键盘的输入方式切换为英文
				else {
					this.rjpNumber = 2;
				}
			}
		},
		methods: {
			// 车牌类型选择事件
			bindLicensePlateTypePickerChange(e) {
				this.licensePlateTypeIndex = e.target.value;
				this.form.carNoType = e.target.value + 1;
			},
			
			// 设备选择事件
			bindDevPickerChange(e) {
				this.devIndex = e.target.value;
				this.form.deviceId = this.devArray[this.devIndex]["id"];
			},
			
			// 入场时间选择事件
			bindDateChange(e) {
				this.form.time = e.target.value;
			},
			
			// 调用拍照或从相册选取
			photo() {
				uni.chooseImage({
					count: 1 - this.form.imageList.length, // 允许上传的照片数量 总数减去图片数组总数
					sizeType: ["compressed"],
					success: (result) => {
						console.log(result)
						this.form.imageList = this.form.imageList.concat(result.tempFilePaths); //数组拼接
						this.form.imageFile = result.tempFiles[0];
					}
				});
			},
			
			// 预览图片 i是下标 imgList是图片列表
			previewImage(i, imgList) {
				let imgurl = []
				imgList.forEach(item => imgurl.push(item))
				uni.previewImage({
					urls: imgurl,
					current: imgList[i],
					loop: true
				});
			},
			
			// 删除图片
			deleteImage(i, imgList) {
				uni.showModal({
					title: "提示",
					content: "确定要删除照片吗？",
					cancelText: "取消",
					confirmText: "确定",
					success: (res) => {
						if (res.confirm) {
							imgList.splice(i, 1)
							this.form.imageFile = null;
						}
					}
				});
			},
			
			// 获取设备根据进出类型
			getDevListByInOutType() {
				let communityId = this.$getUserInfo().currentCommunity.id;
				this.$req.request({
					url: "/parkDevice/app/getByInOutType",
					method: "POST",
					data: {
						inOutType: this.pageType,
						communityId: communityId
					},
					isShowLoading: false,
					success: (res) => {
						if (res.code === 0) {
							this.devArray = res.data;
						}
					}
				});
			},
			
			// 重置表单数据
			resetFormData() {
				this.form = {
					// 车牌号
					carNo: "",
					// 车牌类型
					carNoType: null,
					// 设备id
					deviceId: null,
					// 备注内容
					remark: "",
					// 图片
					imageFile: null,
					// 时间
					time: this.$dateFormat.format(new Date()),
					// 上传图片列表
					imageList: []
				};
				this.licensePlateTypeIndex = -1;
				this.devIndex = -1;
			},
			
			// 取消点击事件
			bindCancelClick() {
				uni.showModal({
					title: "提示",
					content: "确定要取消吗？",
					cancelText: "取消",
					confirmText: "确定",
					success: (res) => {
						if (res.confirm) {
							this.resetFormData();
						}
					}
				});
			},
			
			// 确定点击事件
			bindConfirmClick() {
				let { carNo, carNoType, deviceId, imageFile } = this.form;
				if (!carNo) {
					this.$showToast("车牌号不能为空");
				}
				else if (carNoType == null) {
					this.$showToast("车牌类型不能为空");
				}
				else if (deviceId == null) {
					this.$showToast("设备不能为空");
				}
				else if (imageFile == null) {
					this.$showToast("图片不能为空");
				}
				else {
					this.$getImageBase64(this.form.imageList[0], (imageBase64) => {
						// 手动入场页面
						if (this.pageType === 1) {
							this.form.inImg = imageFile;
							// this.form.inImg = "data:image/png;base64," + imageBase64;
							this.form.inTime = this.form.time;
							
						}
						// 手动出场页面
						else {
							this.form.outImg = imageFile;
							// this.form.outImg = imageBase64;
							this.form.outTime = this.form.time;
							delete this.form.remark;
						}
						// this.$showLog("form", this.form);
						this.formSubmit();
					});
				}
			},
			
			// 文件上传
			uploadFile(serverURL, imgKey, timeKey) {
				this.$showLoading();
				let uploadFileTask = plus.uploader.createUpload(serverURL, {
					method: "POST",
					headers: {
						"Content-Type": "multipart/form-data"
					}
				},  (data, status) => {
						this.$showLog("data", data);
						// this.$hideLoading();
						// 请求上传文件成功
						if (status == 200) {
							let result = data.responseText;
							if (typeof result == "string") {
								result = JSON.parse(result);
							}
							
							// 手动入场或者手动出场成功
							if (result.code == 0) {
								this.$showToast("操作成功");
							}
							// 手动入场或者手动出场失败，提示失败信息
							else {
								this.$showToast(result.msg);
							}
						}
						// 请求上传文件失败
						else {
							this.$showLog("上传失败", status);
						}
					}
				);
				
				// 添加图片
				uploadFileTask.addFile(this.form.imageList[0], {
					key: imgKey  // 图片文件对应的字段名
				});
				
				// 添加的小区id为字符串格式，否则添加失败
				uploadFileTask.addData("communityId", this.$getUserInfo().currentCommunity.id + "");
				// 添加的车牌类型为字符串格式，否则添加失败
				uploadFileTask.addData("carNoType", this.form.carNoType + "");
				// 添加的设备id为字符串格式，否则添加失败
				uploadFileTask.addData("deviceId", this.form.deviceId + "");
				
				// 添加其他数据
				uploadFileTask.addData("accessToken", this.$getUserInfo().accessToken);
				uploadFileTask.addData("carNo", this.form.carNo);
				uploadFileTask.addData([timeKey], this.form[timeKey]);
				
				// 手动入场有备注字段
				if (timeKey == "inTime") {
					uploadFileTask.addData("remark", this.form.remark);
				}
				
				// 开始上传
				uploadFileTask.start();
			},
			
			// 表单提交
			formSubmit() {
				// 定义接口地址、图片字段名，时间字段名
				let serverURL = "", imgKey = "", timeKey = "";
				// pageType: 1 调手动入场接口  2: 调手动出场接口
				if (this.pageType == 1) {
					// 手动入场接口
					serverURL = this.$getConfigParam().baseUrl + "/parkInfo/app/carInPark";
					// 手动入场图片
					imgKey = "inImg";
					// 手动入场时间
					timeKey = "inTime"; 
				}
				else {
					// 手动出场接口
					serverURL = this.$getConfigParam().baseUrl + "/parkInfo/app/carOutPark";
					// 手动出场图片
					imgKey = "outImg";
					// 手动出场时间
					timeKey = "outTime";
				}
				// 文件上传
				this.uploadFile(serverURL, imgKey, timeKey);
			},
			
			// 绑定车牌号输入框聚焦事件
			bindCarNoInputFocus() {
				this.$showLog("bindCarNoInputFocus");
				uni.hideKeyboard();
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
					this.form.carNo = this.form.carNo.substring(0, this.form.carNo.length - 1);
				}
				// 添加到当前车牌号的最后面
				else {
					this.form.carNo += val;
				}
			},
			
			// 绑定车牌软键盘组件确认事件
			bindParkingKeyboardOK() {
				this.isShowParkingKeyboard = false;
			}
		},
		onLoad(params) {
			this.pageType = parseInt(params.type);
			// 手动入场页面
			if (this.pageType === 1) {
				this.$setTitle("手动入场");
			}
			// 手动出场页面
			else {
				this.$setTitle("手动出场");
			}
			// 车牌类型数组
			this.licensePlateTypeArray = [
				this.$t("parking.carNoTypeList_1"),
				this.$t("parking.carNoTypeList_2"),
				this.$t("parking.carNoTypeList_3"),
				this.$t("parking.carNoTypeList_4"),
				this.$t("parking.carNoTypeList_5")
			];
			// 获取设备根据进出类型
			this.getDevListByInOutType();
		},
		onUnload() {
			this.resetFormData();
		}
	}
</script>

<style lang="scss">
	// 手动入场、手动出场
	.brake-manual-entry-out {
		width: 100%;
		.brake-manual-entry-out_content {
			width: calc(100% - 60upx);
			padding: 30upx;
			// 手动入场、手动出场字段
			.brake-manual-entry-out__field {
				width: 100%;
				color: #AAAAAA; 
				overflow: hidden; 
				margin-top: 30upx;
				&.brake-manual-entry-out__picker-field {
					display: flex;
					align-items: center;
					.field__value__picker-view {
						font-size: 30upx !important;
						color: grey;
					}
					// 右边的箭头图片
					image {
						margin-left: 10upx; 
						width: 16upx; 
						height: 16upx;
					}
				}
				// 手动入场、手动出场字段label
				.brake-manual-entry-out__field__label {
					float: left;
					width: 25%; 
					text-align: right;
				}
				// 手动入场、手动出场字段value
				.brake-manual-entry-out__field__value {
					float: left;
					width: 65%; 
					margin-left: 10upx;
					text-align: center;
					border-bottom: 3upx solid #AAAAAA;
					// 文本输入框
					input {
						text-align: center; 
						font-size: 30upx;
						color: grey;
					}
				}
				// 手动入场、手动出场备注字段label
				.brake-manual-entry-out__remarks-field-label {
					width: 25%; 
					text-align: left; 
					margin-left: 30upx;
				}
				// 手动入场、手动出场备注字段value
				.brake-manual-entry-out__remarks-field-value {
					background: #FFFFFF; 
					margin: 15upx 30upx; 
					position: relative;
					.brake-manual-entry-out__remarks-field-value__textarea {
						background-color: #F1F2F3; 
						text-indent: 1rem; 
						padding: 10upx; 
						border-radius: 30upx;
						width: calc(100% - 30upx);
						color: grey;
						font-size: 30upx;
					}
					.brake-manual-entry-out__remarks-field-value__text {
						position: absolute; 
						bottom: 0; 
						right: 30upx;
					}
				}
				.rui-picker {
					border: none;
					justify-content: center;
					height: 1.4em;
					color: grey;
					font-size: 30upx;
				}
			}
			// 手动入场、手动出场图片字段
			.brake-manual-entry-out__image-field {
				flex-flow: column; 
				padding: 10px 0px; 
				background: #FFFFFF; 
				margin-top: 15upx;
				
				.img_box {
					width: 95%;
					height: 100%;
					display: flex;
					flex-wrap: wrap;
					justify-content: space-between;
				
				}
				
				.img_box:after {
					content: "";
					height: 0;
					width: 30%;
				}
				
				.img_box > uni-view {
					display: flex;
				}
				
				.picture {
					width: 30%;
					height: 200upx;
					position: relative;
				}
				
				.del {
					position: absolute;
					right: 0;
				}
				
				.tu, .picture image {
					width: 100%;
					height: 100%;
				}
				
				.photo {
					width: 30%;
					height: 200upx;
					display: flex;
					border: 3upx solid #F1F1F1CC;
					background: #F1F1F1CC;
				}
				
				.photo image {
					margin: auto;
					width: 35%;
					height: 35%;
				}
				
				.img_box > view {
					margin: 10upx;
				}
				
				.tu {
					position: relative;
				}
				
				.tu > .u-icon {
					position: absolute;
					right: 0;
					z-index: 2;
				}
			}
			// 手动入场、手动出场操作
			.brake-manual-entry-out__operation {
				border-top: 6upx solid #EEEEEE; 
				margin: 30upx -30upx 0; 
				display: flex; 
				justify-content: space-around;
				// 手动入场、手动出场操作按钮
				.brake-manual-entry-out__operation__btn {
					width: 45%; 
					// background-color: rgb(221, 221, 221); 
					padding: 15upx 0; 
					margin-top: 10upx; 
					// color: #666666; 
					text-align: center;
					// 取消按钮
					&.cancel {
						background-color: rgb(221, 221, 221); 
						color: #666666;
					}
					// 确定按钮
					&.confirm {
						background-color: rgb(58, 169, 240); 
						color: #FFFFFF;
					}
				}
			}
		}
	}
</style>
