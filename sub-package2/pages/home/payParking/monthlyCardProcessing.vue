<template>
	<view class="body">
		<u-navbar :title="type > 0 ? '月卡延期' : '月卡申请'"></u-navbar>
		<u-gap height="20" bg-color="#f1f2f3"></u-gap>
		<view class="content">
			<u-form :border-bottom="false" label-width="150upx" style="padding: 40upx 40upx 110upx 40upx;" :model="form"
				ref="uForm">
				<view class="form-item_box">
					<u-form-item required class="form-item" prop="userName" :border-bottom="false" label="个人姓名">
						<u-input :disabled="true" placeholder="请输入个人姓名" v-model="form.userName" />
					</u-form-item>

					<u-form-item required class="form-item" prop="phone" :border-bottom="false" label="手机号码">
						<u-input :disabled="true" type="number" placeholder="请输入手机号码" maxlength="11"
							v-model="form.phone" />
					</u-form-item>
					<u-form-item required class="form-item" prop="roleName" :border-bottom="false" label="选择房间">
						<u-input @click="roomIdSelect = true" placeholder="请选择房间" v-model="form.roleName" />
					</u-form-item>
					<u-form-item ref="vlicensePlateNumberData" class="form-item" prop="licensePlateNumber"
						:border-bottom="false" label="车牌号码">
						<u-input type="text" @click=" licensePlateNumberStatus=true " placeholder="请输入车牌号码"
							v-model="form.licensePlateNumber" />
						<u-keyboard ref="uKeyboard" @change="licensePlateNumberChange"
							@backspace="licensePlateNumberbackspace" mode="car" :mask="false"
							v-model="licensePlateNumberStatus">
						</u-keyboard>
					</u-form-item>
					<u-form-item required class="form-item" prop="processingTime" :border-bottom="false" label="办理时长">
						<u-input type="select" @click=" processingTimeStattus=true " placeholder="请选择办理时长"
							v-model="processingTimename" />
						<u-select v-model="processingTimeStattus" @confirm="confirm" mode="mutil-column-auto"
							value-name="value" label-name="label" :list="timeList"></u-select>
					</u-form-item>
					<u-form-item required class="form-item" prop="startDate" :border-bottom="false" label="开始时间">
						<u-input type="select" @click="openTimePicker('start')" placeholder="请选择开始时间"
							v-model="form.startDate" />
					</u-form-item>
				</view>

				<view class="form-item_box basebox">
					<view class="form-item_box_head head">
						<span class="form-item_box_head_text">身份证：</span>
					</view>
					<view class="form-item_box_body">
						<u-form-item v-if="type==1" label-position="top" prop="" :label-style="labelStyle" :border-bottom="false"
							label="">
							<u-image v-for="item in form.idPhoto" :src="item.imageUrl" width="181" height="181">
							</u-image>
							<!-- <text v-if="form.idPhoto && form.idPhoto.length === 0">暂无</text> -->
						</u-form-item>
						<u-form-item v-else label-position="top" prop="" :label-style="labelStyle" :border-bottom="false"
							label="">
							<u-upload width="181" height="181" :max-size="1 * 1024 * 1024" class="upload" max-count="2"
								:custom-btn="true" :file-list="form.idPhoto" upload-text="" ref="uUpload"
								:action="action" @on-list-change="idPhotolistChange" @on-success="idPhotoUploadSuccess"
								:auto-upload="true">
								<view slot="addBtn">
									<u-image src="http://yuanzhoulvwego.com/wp-content/uploads/static/home/repair/shangchuangtupian.png" width="181" height="181">
									</u-image>
								</view>
							</u-upload>
						</u-form-item>
					</view>
				</view>
				<view class="form-item_box basebox">
					<view class="form-item_box_head head">
						<span class="form-item_box_head_text">驾驶证：</span>
					</view>
					<view class="form-item_box_body">
						<u-form-item v-if="type==1" label-position="top" prop="" :label-style="labelStyle" :border-bottom="false"
							label="">
							<u-image v-for="item in form.driverPhoto" :src="item.imageUrl" width="181" height="181">
							</u-image>
							<!-- <text v-if="form.driverPhoto && form.driverPhoto.length === 0">暂无</text> -->
						</u-form-item>
						<u-form-item v-else label-position="top" prop="" :label-style="labelStyle" :border-bottom="false"
							label="">
							<u-upload width="181" height="181" :max-size="1 * 1024 * 1024" class="upload" max-count="2"
								:custom-btn="true" :file-list="form.driverPhoto" upload-text="" ref="uUpload"
								:action="action" @on-list-change="driverPhotolistChange"
								@on-success="driverPhotoUploadSuccess" :auto-upload="true">
								<view slot="addBtn">
									<u-image src="http://yuanzhoulvwego.com/wp-content/uploads/static/home/repair/shangchuangtupian.png" width="181" height="181">
									</u-image>
								</view>
							</u-upload>
						</u-form-item>
					</view>
				</view>



				<view class="title">
					备注
				</view>
				<view class="form-item_box">
					<u-form-item label-position="top" :border-bottom="false" label="">
						<my-textarea :value.sync="form.remark"></my-textarea>
					</u-form-item>
				</view>
			</u-form>
		</view>
		<view class="btn_box">
			<u-button class="btn_box_button" @click="onSubmit" type="primary" shape="circle">
				提交
			</u-button>
		</view>
		<!--房间列表选择 -->
		<u-select @confirm="confirm" value-name="value" label-name="label" mode="mutil-column-auto"
			v-model="roomIdSelect" :list="roomIdSelectList">
		</u-select>
		<!-- 时间选择 -->
		<u-picker @confirm="confirm" mode="time" v-model="timePicker" :params="timeParams"></u-picker>
		<!-- 成功框 -->
		<u-modal v-model="showModel" title='' confirm-text="我知道了" :content-style="{ textAlign: 'center' }"
			@confirm="knowConfirm">
			<view class="slot-content">
				<u-image class="model-image" width="125upx" height="125upx" shape="circle"
					:src="'http://yuanzhoulvwego.com/wp-content/uploads/static/home/employeeManagement/tijiao.png'">
					<u-loading slot="loading"></u-loading>
					<view slot="error" style="font-size: 24upx;">加载失败</view>
				</u-image>
				<view style="font-size: 34upx; margin: 22upx 0 42upx;">信息提交成功</view>
			</view>
		</u-modal>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	import myTextarea from "@/sub-package2/components/my-textarea/my-textarea.vue"
	export default {
		data() {
			return {
				id:0,
				// 当前租户id
				enterpriseId: uni.getStorageSync("userInfo").enterpriseId,
				userId: uni.getStorageSync("userInfo").id,
				// 表单
				form: {
					personnelAccess: '',
					licensePlateNumber: '',
					remark:''
				},
				// 权限选择后的卡号
				cardList: [],
				// 0为啥申请月卡 1为月卡延期
				type: 0,
				//房间列表下拉框标识
				roomIdSelect: false,
				// 时间选择框标识
				timePicker: false,
				// 成功框标识
				showModel: false,
				//车牌键盘
				licensePlateNumberStatus: false,
				//办理时长
				processingTimeStattus: false,
				//办理时长中文
				processingTimename: '',
				// 是开始时间0还是结束时间1
				timeType: 0,
				// 房间列表
				roomIdSelectList: [],
				// 图片上传接口
				action: '/image/web/add',
				// 时间框的所需
				timeParams: {
					year: true,
					month: true,
					day: true,
					hour: true,
					minute: true,
					second: true
				},
				timeList: [
					// {
					// 	label: '1月',
					// 	value: 1
					// },
					// {
					// 	label: '2月',
					// 	value: 2
					// },
					{
						label: '3月',
						value: 3
					},
					{
						label: '4月',
						value: 4
					},
					{
						label: '5月',
						value: 5
					},
					{
						label: '6月',
						value: 6
					},
					{
						label: '7月',
						value: 7
					},
					{
						label: '8月',
						value: 8
					},
					{
						label: '9月',
						value: 9
					},
					{
						label: '10月',
						value: 10
					},
					{
						label: '11月',
						value: 11
					},
					{
						label: '12月',
						value: 12
					},
				],

				// 图片上传的标题样式
				labelStyle: {
					fontSize: '34upx',
					fontWeight: 'bold',
					color: '#333333'
				}, // 规则licensePlateNumber
				rules: {
					roleName: [{
						required: true,
						message: '请选择所属部门',
						trigger: ['change']
					}],
					personnelAccess: [{
						required: true,
						message: '请选择权限',
						trigger: ['change']
					}],
					startDate: [{
							required: true,
							message: '请选择开始时间',
							trigger: ['change']
						},
						{
							validator: (rule, value, callback) => {
								if (!this.form.accEndDateTime) {
									return true
								}
								return this.$tools.compareDateTime(value, this.form.accEndDateTime)
							},
							message: '开始时间不能大于结束',
							trigger: ['change', 'blur'],
						}
					],
					accEndDateTime: [{
							required: true,
							message: '请选择结束时间',
							trigger: ['change']
						},
						{
							validator: (rule, value, callback) => {
								if (!this.form.startDate) {
									return true
								}
								return this.$tools.compareDateTime(this.form.startDate, value)
							},
							message: '开始时间不能大于结束',
							trigger: ['change', 'blur'],
						}
					]
				}
			}
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		onLoad() {
			console.log(this.$Route.query.type)
			this.type = this.$Route.query.type
			let userInfo = uni.getStorageSync('userInfo')
			this.form.phone = userInfo.phone
			this.form.userName = userInfo.userName
			this.form.licensePlateNumber = ''
			this.form.remark=''
			this.form.idPhoto = []
			this.form.driverPhoto = []
			this.getDepartmentAll()
		},
		methods: {
			infoData(){
				if(this.type===1){
					this.id = this.$Route.query.id
					this.$api('monthCard.parkUserInfoGetById', {id:this.id}).then(res => {
						console.log(res)
						if(res.code==200){
							this.form.phone =  res.data.phone
							this.form.userName =  res.data.userName
							this.form.licensePlateNumber =  res.data.licensePlateNumber
							// this.form.phone =  res.data.phone
							// this.dataInfo = res.data
						}
					})
					
				}
			},
			// 房间列表
			getDepartmentAll() {
				this.$api('monthCard.jgRoomInfoGetRoomListByEnterpriseId', {
						enterpriseId: this.enterpriseId
					})
					.then(res => {
						if (res.code == 200) {
							let arr = res.data
							this.roomIdSelectList = []
							arr.forEach(item => {
								this.roomIdSelectList.push({
									label: item.room.name,
									value: item.room.id
								})
							})
							console.log(this.roomIdSelectList)
						}
					})
			},
			//办理时长选择
			bindPickerChange: function(e) {
				console.log('picker发送选择改变，携带值为', e.detail.value)
				this.index = e.detail.value
			},
			// 提交表单
			onSubmit() {
				this.$refs.uForm.validate(valid => {
					this.form.endDate = this.commonAddMouth(this.form.startDate, this.form.processingTime, 1)
					if (valid) {
						let params = {
							enterpriseId: this.enterpriseId,
							userName: this.form.userName,
							type: this.type,
							userId: this.userId,
							licensePlateNumber: this.form.licensePlateNumber,
							processingTime: this.form.processingTime,
							phone: this.form.phone,
							driverPhoto: this.form.driverPhoto,
							idPhoto: this.form.idPhoto,
							roomId: this.form.roomId,
							startDate: this.form.startDate,
							endDate: this.form.endDate,
							remark: this.form.remark
						}
						console.log(params)
						this.$api('monthCard.parkUserInfoAdd', params).then(res => {
							console.log(res)
							if (res.code === 200) {
								// this.showModel = true
								this.$Router.push({
									path: '/sub-package2/pages/home/payParking/progressTrial',
									query: {
										id: res.data,
									}
								})
							} else {
								// console.log(res)
								this.$refs.uToast.show({
									title: res.msg,
									type: 'error'
								})
							}
						})
					} else {
						console.log('验证失败');
					}
				});

			},

			//车牌键盘输入事件
			licensePlateNumberChange(val) {
				this.form.licensePlateNumber += val;
				console.log(this.form.licensePlateNumber, val)
			},
			licensePlateNumberChange2(val) {

				console.log(this.form.licensePlateNumber, val)
			},
			//车牌键盘删除
			licensePlateNumberbackspace() {
				if (this.form.licensePlateNumber.length) this.form.licensePlateNumber = this.form.licensePlateNumber
					.substr(0, this.form.licensePlateNumber.length - 1);
			},
			// 图片列表改变
			idPhotolistChange(lists, name) {
				// this.form.idPhoto = []
				// console.log(lists)
				// if(lists.length>0){
				// 	lists.forEach(item => {
				// 		this.form.idPhoto.push(item.response.data)
				// 	})
				// }

			},
			// 图片上传成功
			idPhotoUploadSuccess(data, index, lists, name) {
				console.log(lists)
				if (data.code == 200) {
					this.form.idPhoto = []
					lists.forEach(item => {
						console.log(item.response.data)
						this.form.idPhoto.push(item.response.data)
					})
				}
			},
			// 图片列表改变
			driverPhotolistChange(lists, name) {
				// this.form.driverPhoto = []
				// lists.forEach(item => {
				// 	this.form.driverPhoto.push(item.response.data)
				// })
				// this.form.driverPhoto = lists
			},
			// 图片上传成功
			driverPhotoUploadSuccess(data, index, lists, name) {
				if (data.code == 200) {
					this.form.driverPhoto = []
					lists.forEach(item => {
						this.form.driverPhoto.push(item.response.data)
					})
				}
			},


			// 打开时间选择框
			openTimePicker(type) {
				this.timePicker = true
				if (type === 'start') this.timeType = 0
				else this.timeType = 1
			},


			// 下拉框选择之后，数据赋值
			confirm(e) {
				console.log(this.roomIdSelect)
				if (this.roomIdSelect) {
					console.log(e)
					this.form.roomId = e[0].value;
					this.form.roleName = e[0].label;
				}
				if (this.processingTimeStattus) {
					console.log(e)
					this.form.processingTime = e[0].value
					this.processingTimename = e[0].label
				}
				if (this.timePicker) {
					let times = e.year + '-' + e.month + '-' + e.day + ' ' + e.hour + ':' + e.minute + ':' + e.second
					if (this.timeType) this.form.accEndDateTime = times
					else this.form.startDate = times
				}
			},
			// 提交后的弹窗 确认按钮 如果是编辑，就是修改后的表单； 新增，表单重置
			knowConfirm() {
				this.form = {
					personnelAccess: ''
				}
				uni.navigateBack()
			},

			/**
			 * 当前日期增加n月
			 * @param dateStr 当前日期
			 * @param num 月
			 * @param type 0:2022-05-30   1：2022-05-30 11:11:11
			 * @returns {string}
			 */
			commonAddMouth(dateStr, num, type) {
				var monthnum = 0;
				if (typeof(num) == "string") {
					monthnum = parseInt(num);
				} else {
					monthnum = num;
				}
				var date = new Date(dateStr);
				//获取原日
				var day = date.getDate();
				//获取原月份
				var month = date.getMonth();
				//设置增加月份
				date.setMonth(date.getMonth() + (monthnum * 1), 1);
				//获取增加的后的月份
				var Jmonth = date.getMonth() + 1;
				//获取增加的后的年份
				var Jyear = date.getFullYear();
				if (Jmonth == 4 || Jmonth == 6 || Jmonth == 9 || Jmonth == 11) {
					//小月
					if (day > 30) {
						day = 30;
					}
				} else if (Jmonth == 2) {
					//2月判断是否闰年
					if (((Jyear % 4) == 0) && ((Jyear % 100) != 0) || ((Jyear % 400) == 0)) {
						if (day > 29) {
							day = 29;
						} else {
							day = 28;
						}
					}
					if (day > 28) {
						day = 28
					}

				} else {
					//大月
					if (day > 31) {
						day = 31;
					}
				}
				var tHours = date.getHours();
				var tMinutes = date.getMinutes();
				var tSeconds = date.getSeconds();
				Jmonth = this.doHandleMonth(Jmonth);
				day = this.doHandleMonth(day);
				if (type == "0") {
					return Jyear + "-" + Jmonth + "-" + day;
				}
				return Jyear + "-" + Jmonth + "-" + day + " " + tHours + ":" + tMinutes + ":" + tSeconds;
			},
			doHandleMonth(month) {
				var m = month;
				if (month.toString().length == 1) {
					m = "0" + month;
				}
				return m;
			}

		}
	}
</script>

<style lang="scss" scoped>
	.body {
		.content {
			background: #FFFFFF;
			margin-top: 6upx;

			.form-item_box {
				padding: 0 15upx;

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

				.form-item_box_head {
					height: 34upx;
					font-weight: bold;
					display: flex;
					justify-content: space-between;
					align-items: center;

					.form-item_box_head_text {
						font-size: 34upx;
						margin-left: 6upx;
					}
				}

				.form-item_box_body {
					margin-left: 16upx;

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

			.title {
				padding: 40upx 0 0 20upx;
				font-size: 34upx;
				color: #333333;
				font-weight: bold;
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

		.model-image {
			position: relative;
			left: 50%;
			transform: translate(-50%, 0px);
		}
	}


	.u-form-item {
		padding: 10upx 0;
	}

	.basebox {
		display: flex;

		.head {
			width: 150upx;
			padding-top: 100upx;
		}
	}
</style>
