<template>
	<view class="body">
		<u-navbar :title="id > 0 ? '编辑人员' : '新增人员'"></u-navbar>
		<u-gap height="20" bg-color="#f1f2f3"></u-gap>
		<view class="content">
			<u-form :border-bottom="false" label-width="150upx" style="padding: 40upx 40upx 110upx 40upx;" 
				:model="form" ref="uForm">
				<view class="form-item_box">
					<u-form-item required class="form-item" prop="userName" :border-bottom="false"
						label="个人姓名">
						<u-input placeholder="请输入个人姓名" v-model="form.userName" />
					</u-form-item>
			
					<u-form-item required class="form-item" prop="phone" :border-bottom="false"
						label="手机号码">
						<u-input type="number" placeholder="请输入手机号码" maxlength="11"
							v-model="form.phone" />
					</u-form-item>
					<u-form-item required class="form-item" prop="genderName" :border-bottom="false"
						label="性别">
						<u-input type="select" @click="genderSelect = true" placeholder="请选择性别"
							v-model="form.genderName" />
					</u-form-item>
					<u-form-item required class="form-item" prop="roleName" :border-bottom="false"
						label="所属部门">
						<u-input type="select" @click="departmentSelect = true" placeholder="请选择所属部门"
							v-model="form.roleName" />
					</u-form-item>
					<u-form-item required class="form-item" prop="personnelAccess" :border-bottom="false"
						label="人员权限">
						<u-input @click="toPersonnelAccess" placeholder="请选择人员权限"
							v-model="form.personnelAccess" />
						<u-icon name="http://yuanzhoulvwego.com/wp-content/uploads/static/xiala.png" size="11"></u-icon>
					</u-form-item>
					<u-form-item required class="form-item" prop="accStartDateTime" :border-bottom="false"
						label="权限时间">
						<u-input type="select" @click="openTimePicker('start')" placeholder="请选择开始时间"
							v-model="form.accStartDateTime" />
					</u-form-item>
					<u-form-item class="form-item" prop="accEndDateTime" :border-bottom="false" label=" ">
						<u-input type="select" @click="openTimePicker('end')" placeholder="请选择结束时间"
							v-model="form.accEndDateTime" />
					</u-form-item>
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
				{{ this.id > 0 ? '修改' : '添加' }}
			</u-button>
		</view>
		<!-- 性别选择 -->
		<u-select @confirm="confirm" value-name="value" label-name="label" mode="mutil-column-auto"
			v-model="genderSelect" :list="genderSelectList">
		</u-select>
		<!-- 部门选择 -->
		<u-select @confirm="confirm" value-name="id" label-name="roleName" mode="mutil-column-auto"
			v-model="departmentSelect" :list="departmentSelectList">
		</u-select>
		<!-- 时间选择 -->
		<u-picker @confirm="confirm" mode="time" v-model="timePicker" :params="timeParams"></u-picker>
		<!-- 成功框 -->
		<u-modal v-model="showModel" title='' confirm-text="我知道了" :content-style="{ textAlign: 'center' }"
			@confirm="knowConfirm">
			<view class="slot-content">
				<u-image
					class="model-image"
					width="125upx"
					height="125upx"
					shape="circle"
					:src="'http://yuanzhoulvwego.com/wp-content/uploads/static/home/employeeManagement/tijiao.png'"
				>
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
	import myTextarea from "@/components/my-textarea/my-textarea.vue"
	export default {
		data() {
			return {
				// 当前租户id
				enterpriseId: uni.getStorageSync("userInfo").enterpriseId,
				// 表单
				form: {
					personnelAccess: ''
				},
				// 权限选择后的卡号
				cardList: [],
				// 权限选择后的房间ids
				checkList: [],
				// 人员id 用于编辑人员
				id: 0,
				// 性别下拉框标识
				genderSelect: false,
				// 部门下拉框标识
				departmentSelect: false,
				// 时间选择框标识
				timePicker: false,
				// 成功框标识
				showModel: false,
				// 是开始时间0还是结束时间1
				timeType: 0,
				// 性别列表
				genderSelectList: [
					{
						value: 1,
						label: '男'
					},
					{
						value: 2,
						label: '女'
					}
				],
				// 部门列表
				departmentSelectList: [],
				// 时间框的所需
				timeParams: {
					year: true,
					month: true,
					day: true,
					hour: true,
					minute: true,
					second: true
				},
				// 规则
				rules: {
					userName: [{ required: true, message: '请输入个人姓名', trigger: ['blur'] }],
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
						trigger: ['blur']
					}],
					genderName: [{ required: true, message: '请选择性别', trigger: ['change'] }],
					roleName: [{ required: true, message: '请选择所属部门', trigger: ['change'] }],
					personnelAccess: [{ required: true, message: '请选择权限', trigger: ['change'] }],
					accStartDateTime: [
						{ required: true, message: '请选择开始时间', trigger: ['change'] },
						{
							validator: (rule, value, callback) => {
								if(!this.form.accEndDateTime){
									return true
								}
								return this.$tools.compareDateTime(value,this.form.accEndDateTime)
							},
							message: '开始时间不能大于结束',
							trigger: ['change', 'blur'],
						}
					],
					accEndDateTime: [
						{ required: true, message: '请选择结束时间', trigger: ['change'] },
						{
							validator: (rule, value, callback) => {
								if(!this.form.accStartDateTime){
									return true
								}
								return this.$tools.compareDateTime(this.form.accStartDateTime,value)
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
			if (this.$Route.query.hasOwnProperty( "id" )) {
				this.form = this.$Route.query
				this.form.genderName = this.form.gender === 1 ? '男' : '女'
				this.form.roleName = this.form.roleName === '租户员工' ? '租户员工' : this.form.roleName
				this.cardList = this.form.cardNumber.split(',')
				if (this.form.rooms.length > 0) this.checkList = this.form.rooms.map(item => item.id)
				this.id = this.$Route.query.id
			}
			this.getDepartmentAll()
		},
		onShow() {
			let that = this
			uni.$on('updateData', function(cardList, checkList) {
				that.cardList = cardList
				that.checkList = checkList
				if (cardList.length > 0 || checkList.length > 0) that.form.personnelAccess = '已选权限'
				else that.form.personnelAccess = ''
			})
		},
		methods: {
			// 部门列表
			getDepartmentAll() {
				this.$api('employeeManagement.getDepartmentAll', { enterpriseId: this.enterpriseId })
				.then(res => {
					if (res.code == 200) {
						this.departmentSelectList = res.data
					}
				})
			},
			onSubmit() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						let params = {
							enterpriseId: this.enterpriseId,
							personType: 1,
							userName: this.form.userName,
							phone: this.form.phone,
							gender: this.form.gender,
							roleId: this.form.roleId,
							accStartDateTime: this.form.accStartDateTime,
							accEndDateTime:  this.form.accEndDateTime,
							remark: this.form.remark
						}
						params.roomIds = this.checkList
						if (this.cardList.length > 0) params.card = this.cardList
						if (this.id > 0) {
							// 有id则为修改
							params.id = this.id
							this.$api('employeeManagement.updateEnterpriseUser', params, false).then(res => {
								if (res.code === 200) {
									this.showModel = true
								} else {
									this.$refs.uToast.show({
										title: res.msg,
										type: 'error'
									})
								}
							})
						} else {
							// 无id则为新增
							this.$api('employeeManagement.addEnterpriseUser', params, false).then(res => {
								if (res.code === 0) {
									this.showModel = true
								} else {
									this.$refs.uToast.show({
										title: res.msg,
										type: 'error'
									})
								}
							})
						}
					} else {
						console.log('验证失败');
					}
				});
			
			},
			// 打开时间选择框
			openTimePicker(type) {
				this.timePicker = true
				if (type === 'start') this.timeType = 0
				else this.timeType = 1
			},
			// 跳转到人员权限页面
			toPersonnelAccess() {
				this.$Router.push({
					path: '/pages/home/employeeManagement/selectPermissions',
					query: { cardList: this.cardList, checkList: this.checkList }
				})
			},
			// 下拉框选择之后，数据赋值
			confirm(e) {
				if (this.genderSelect) {
					this.form.gender = e[0].value;
					this.form.genderName = e[0].label;
				}
				if (this.departmentSelect) {
					this.form.roleId = e[0].value;
					this.form.roleName = e[0].label;
				}
				if (this.timePicker) {
					let times = e.year + '-' + e.month + '-' + e.day + ' ' + e.hour + ':' + e.minute + ':' + e.second
					if (this.timeType) this.form.accEndDateTime = times
					else this.form.accStartDateTime = times
				}
			},
			// 提交后的弹窗 确认按钮 如果是编辑，就是修改后的表单； 新增，表单重置
			knowConfirm() {
				this.form = { personnelAccess: '' }
				uni.navigateBack()
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
			}
			.title {
				padding: 40upx 0 0 0;
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
</style>
