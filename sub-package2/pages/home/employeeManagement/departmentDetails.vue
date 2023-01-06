<template>
	<view class="body">
		<u-navbar :title="id > 0 ? '编辑部门' : '新增部门'"></u-navbar>
		<u-gap height="20" bg-color="#f1f2f3"></u-gap>
		<view class="content" style="padding: 40upx 20upx 80upx">
			<u-form :border-bottom="false" label-width="190" :model="form" ref="uForm">
				<view class="form-item_box">
					<u-form-item required class="form-item" prop="roleName" :border-bottom="false" label="部门名称：" label-width="160upx">
						<u-input placeholder="请输入部门名称" v-model="form.roleName" style="border-bottom: 2upx solid #999999;" />
					</u-form-item>
					<u-form-item required class="form-item" label-position="top" prop="jurisdiction" :border-bottom="false" label="选择部门权限：">
						<u-checkbox-group>
							<u-checkbox shape="circle" class="check-all" v-model="checkedAll" @change="checkboxAll">全选</u-checkbox>
							<view v-for="(item, index) in list" :key="index" style="width: 100%;" class="">
								<view class="u-m-b-20">
									<u-icon
										:name="item.hidden === true ? 'arrow-down-fill' : 'play-right-fill'"
										size="12"
										class="u-m-r-20 u-m-l-10"
										@click="showOrHide(item)"
									></u-icon>
									<u-checkbox 
										@change="checkboxChange" 
										v-model="item.checked"
										:name="item.name"
										:active-color="item.childMenu.filter((ccitem) => { return ccitem.checked == true }).length ===
											item.childMenu.length ? '#2979FF' : '#FF9900'"
									>
										<view>{{ item.name }}</view>
									</u-checkbox>
								</view>
								<view class="u-m-b-20" :class="item.hidden === true ? '' : 'displayNone'">
									<view class="u-flex u-flex-wrap">
										<view
											v-for="(citem, cindex) in item.childMenu"
											:key="cindex"
											style="width: 212upx; height: 60upx; line-height: 60upx; border-radius: 5upx;
												text-align: center; font-size: 24upx; font-weight: 400;"
											:style="citem.checked ? checkStyle : noCheckStyle"
											class="u-m-b-20"
											:class="(cindex + 1) % 3 === 0 ? '' :'u-m-r-16'"
											@click="checkJurisdiction(citem, item)">
											{{ citem.name }}
										</view>
									</view>
								</view>
							</view>
						</u-checkbox-group>
					</u-form-item>
				</view>
			</u-form>
		</view>
		<view class="btn_box">
			<u-button class="btn_box_button" @click="onSubmit" type="primary" shape="circle">{{ id > 0 ? '修改' : '添加' }}</u-button>
		</view>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 部门id ，用于编辑部门
				id: 0,
				// 当前园区id
				zoneId: 0,
				// 表单
				form: {
					roleName: ''
				},
				// 没有选择的房间样式
				noCheckStyle: {
					backgroundColor:' #F1F2F3',
					color: '#666666'
				},
				// 选择的房间样式
				checkStyle: {
					backgroundColor: '#3E76F4',
					color: 'white'
				},
				// 权限列表
				list: [],
				// 选择的权限列表
				checkList: [],
				// 全选标识
				checkedAll: false,
				// 总权限数量
				num: 0,
				// 规则
				rules: {
					roleName: [{ required: true, message: '请输入部门名称', trigger: ['blur'] }],
				}
			}
		},
		onLoad() {
			this.zoneId = uni.getStorageSync("zoneInfo").zoneId
			this.roleMenuList ()
			this.id = this.$Route.query.id
			if (this.id > 0) this.getDepartmentInfo(this.id)
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		methods: {
			// 获取权限树
			roleMenuList () {
				let params = {
					menuType: 2,
					zoneId: this.zoneId
				}
				this.$api('employeeManagement.roleMenuList', { menuType: 2, zoneId: this.zoneId }).then(res => {
					if (res.code == 200) {
						this.list = res.data.filter(ditem => ditem.childMenu.length > 0)
						this.list.forEach(item => {
							item.checked = false
							item.hidden = false
							if (item.childMenu.length > 0) {
								item.childMenu.forEach(citem => {
									citem.checked = false
								})
							}
						})
					} else {
						this.$refs.uToast.show({
							title: res.msg,
							type: 'error'
						})
					}
				}).catch((e) => {
					this.$refs.uToast.show({
						title: '获取失败',
						type: 'error'
					})
				})
			},
			// 获取部门信息
			getDepartmentInfo(id){
				this.$api('employeeManagement.departmentInfo', {
					id
				}).then(res => {
					if (res.code == 200) {
						this.form = res.data
						this.checkList = this.form.menuId
						this.list.forEach(item => {
							// 匹配权限树与选择的数组， 选择的数组有就赋予true
							item.childMenu.forEach(citem => {
								if (this.checkList.some(chitem => chitem == citem.id)) citem.checked = true
								this.num = this.num + 1
							})
							
							// 子选择有选的，选择框为true
							if (item.childMenu.filter(ccitem => ccitem.checked === true).length === 0) {
								item.checked = false
							} else {
								if(item.childMenu.length > 0) item.checked = true
								
							}
						})
						// 选择列表有全部选择，才有全选标志
						this.checkedAll = this.num === this.checkList.length
					}
				})
			},
			// 全选
			checkboxAll(res) {
				this.list.forEach((item) => {
					item.checked = res.value
					item.childMenu.forEach((citem) => {
						citem.checked = res.value
						// 判断当前是全选，选择列表中没有的id才加入
						if (res.value && !this.checkList.some(ritem => ritem === citem.id)) this.checkList.push(citem.id)
					})
				})
				if (!res.value) this.checkList = []
				this.$forceUpdate()
			},
			// 展示隐藏选择权限
			showOrHide(item) {
				if(item.hidden === true) item.hidden = false
				else item.hidden = true
				this.$forceUpdate()
			},
			// 选中某个复选框时，由checkbox时触发
			checkboxChange(e) {
				let arr = this.list.filter(item => item.name === e.name)[0].childMenu
				if (e.value) {
					arr.forEach(item => {
						item.checked = true
						// 为true时， 将它底下的id添加到选择的权限列表
						if (!this.checkList.some(ritem => ritem === item.id)) this.checkList.push(item.id)
					})
				} else {
					arr.forEach(item => {
						item.checked = false
						// 为false时， 将它底下的id 从选择的权限列表删除
						this.checkList.splice(this.checkList.indexOf(item.id), 1)
					})
				}
				let arrCheck = this.list.filter((item) => {
					return item.checked == true
				});
				this.checkedAll = (arrCheck.length == this.list.length)
				this.$forceUpdate()
			},
			// 选择权限
			checkJurisdiction(citem, item) {
				if (citem.checked) {
					// 子选择为true时，改为false
					citem.checked = false
					this.checkList.splice(this.checkList.indexOf(citem.id), 1)
				} else {
					// 子选择为false时，改为true
					citem.checked = true
					if (!this.checkList.some(ritem => ritem === item.id)) this.checkList.push(citem.id)
				}
				// 子选择有选的，选择框为true
				if (item.childMenu.filter(ccitem => ccitem.checked === true).length === 0) {
					item.checked = false
				} else {
					item.checked = true
				}
				// 选择列表有全部选择，才有全选标志
				this.checkedAll = this.num === this.checkList.length
				this.$forceUpdate()
			},
			// 保存
			onSubmit() {
				let _this = this
				_this.$refs.uForm.validate(valid => {
					if (valid) {
						if (_this.checkList.length > 0) {
							let params = {
								ids: _this.checkList.join(),
								roleName: _this.form.roleName,
								roleDescription: '无',
								roleType: 4,
								zoneId: _this.zoneId
							}
							if (_this.id > 0) {
								params.id = _this.id
								// 编辑部门
								_this.$api('employeeManagement.updateDepartment', params, false).then(res => {
									if(res.code == 200){
										_this.$refs.uToast.show({
											title: res.msg,
										})
									}
								})
							} else {
								// 新增部门
								_this.$api('employeeManagement.addDepartment', params, false).then(res => {
									if (res.code == 200) {
										_this.$refs.uToast.show({
											title: res.msg,
										})
										_this.$Router.push({
											path: '/sub-package2/pages/home/employeeManagement/index',
										})
									}
								}).catch((e) => {
									_this.$refs.uToast.show({
										title: '添加失败',
										type: 'error'
									})
								})
							}
						} else {
							_this.$refs.uToast.show({
								title: '请选择权限',
								type: 'error'
							})
						}
					} else {
						console.log('验证失败');
					}
				});
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
				margin: 0 20upx;
				.form-item {
					position: relative;
					.check-all {
						position: absolute;
						top: 30upx;
						right: -26upx;
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
		.displayNone {
			display: none;
		}
	}
</style>
