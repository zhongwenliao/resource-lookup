<template>
	<page class="body">
		<z-paging :auto="false" ref="paging" v-model="dataList" @query="getInfo">
			<!-- 导航栏 -->
			<view slot="top">
				<u-navbar :title="departmentInfo.roleName">
					<u-icon v-if="!tacitly" slot="right" name="more-dot-fill" size="30"
						@click="operationSelect = true"></u-icon>
				</u-navbar>
				<u-gap height="20" bg-color="#f1f2f3"></u-gap>
				<u-gap height="20" bg-color="#fff"></u-gap>
			</view>
			<!-- 内容 -->
			<view class="content">
				<u-cell-group :border="false">
					<view v-for="(item, index) in dataList" :key="index">
						<!-- 有选择标识，列表的显示 -->
						<u-checkbox v-if="showChecked" @change="checkbox(index)" class="checkbox"
							v-model="item.checked" shape="circle">
							<u-cell-item :arrow="true" @click="toStaffDetails(item)" style="width: 660upx;">
								<text slot="title" class="content-title">{{ item.userName }}</text>
							</u-cell-item>
						</u-checkbox>
						<!-- 没有选择标识，列表的显示 -->
						<u-cell-item v-else :arrow="true" @click="toStaffDetails(item)">
							<text slot="title" class="content-title">{{ item.userName }}</text>
						</u-cell-item>
					</view>
				</u-cell-group>
			</view>
			<!-- 底部按钮 -->
			<view slot="bottom" class="bottoms">
				<view v-if="showChecked">
					<view class="bottoml">
						<u-checkbox class="u-m-l-40" @change="checkboxAll"
							v-model="checkedAll" shape="circle">全选
						</u-checkbox>
					</view>
					<view class="bottomr">
						<view class="bottoms-button" @click="moveSubmit">移动至</view>
						<view class="bottoms-text"></view>
						<view class="bottoms-button" @click="delSubmit">删除</view>
					</view>
				</view>
				<u-button v-else class="btn_box_button" @click="onSubmit" type="primary" shape="circle">添加人员</u-button>
			</view>
		</z-paging>
		<!-- 操作 -->
		<u-popup v-model="operationSelect" mode="bottom" height="353upx" border-radius="25"
			@close="closeOperation">
			<view style="padding: 0px 40upx;">
				<u-cell-group>
					<u-cell-item
						v-for="(item, index) in operationList"
						:key="index"
						:title="item.label"
						:arrow="false"
						:title-style="{ width: '100%', height: '62upx', lineHeight: '62upx',
							textAlign: 'center', fontSize: '32upx', color: '#333333', fontWeight: 'bold' }"
						@click="confirm(item)"
					></u-cell-item>
				</u-cell-group>
			</view>
			<u-gap height="20" bg-color="#f1f2f3"></u-gap>
			<view class="popup-close" @click="closeOperation">取消</view>
		</u-popup>
		<!-- 弹窗 -->
		<u-modal v-model="modeShow" :title="dataList.length > 0 ? '温馨提示' :''"
			:title-style="{ fontSize: '36upx', fontWeight: 'bold', color: '#333333' }"
			:content-style="{ textAlign: 'center', margin: '30upx'}" :show-cancel-button="true"
			confirm-text="确定" @confirm="modelConfirm">
			<view class="slot-content">
				<view style="margin-bottom: 64upx;">
					{{ dataList.length > 0 ? '请先删除部门所有员工或移动至其他部门才能删除部门' : '确认删除该部门吗？'}}
				</view>
			</view>
		</u-modal>
		<!-- 部门选择 -->
		<u-select @confirm="departmentConfirm" value-name="id" label-name="roleName" mode="mutil-column-auto"
			v-model="departmentSelect" :list="departmentSelectList">
		</u-select>
		<u-toast ref="uToast" />
	</page>
</template>

<script>
	export default {
		data() {
			return {
				// 当前园区id
				zoneId: uni.getStorageSync("zoneInfo").zoneId,
				// 当前租户id
				enterpriseId: uni.getStorageSync("userInfo").enterpriseId,
				// 部门信息
				departmentInfo: {},
				// 标题
				title: "",
				// 默认 当true时为租户或者租户员工
				tacitly: false,
				// 操作标识
				operationSelect: false,
				// 弹窗标识
				modeShow: false,
				// 显示出选择框，用于删除人员或移到别的部门
				showChecked: false,
				// 全选标识
				checkedAll: false,
				// 打开部门选择框标识
				departmentSelect: false,
				// 列表
				dataList: [],
				// 部门列表
				departmentSelectList: [],
				// 操作
				operationList: [{
						value: 1,
						label: '编辑部门'
					},
					{
						value: 2,
						label: '删除部门'
					}
				]
			}
		},
		onLoad() {
			let that =  this
			if (that.$Route.query.roleName !== '租户' && that.$Route.query.roleName !== '租户员工') {
				that.tacitly = false
				that.getDepartmentInfo(that.$Route.query.id)
			} else {
				that.tacitly = true
				that.departmentInfo.roleName = that.$Route.query.roleName 
				that.getInfo(1, 10)
			}
			that.getDepartmentAll()
		},
		onShow() {
			let that =  this
			if (that.$Route.query.roleName !== '租户' && that.$Route.query.roleName !== '租户员工') {
				that.tacitly = false
				that.$nextTick(() => {
					that.$refs.paging.reload();
				})
			} else {
				that.tacitly = true
				that.departmentInfo.roleName = that.$Route.query.roleName 
			}
		},
		methods: {
			// 获取部门信息
			getDepartmentInfo(id){
				this.$api('employeeManagement.departmentInfo', {
					id
				}).then(res => {
					if (res.code == 200) {
						this.departmentInfo = res.data
					}
				})
			},
			// 部门列表
			getDepartmentAll() {
				this.$api('employeeManagement.getDepartmentAll', { enterpriseId: this.enterpriseId })
				.then(res => {
					if (res.code == 200) {
						this.departmentSelectList = res.data
					}
				})
			},
			// 获取人员列表
			getInfo(pageNo, pageSize) {
				let that = this
				const params = {
					currPage: pageNo,
					pageSize: pageSize,
					enterpriseId: that.enterpriseId,
					zoneId: that.zoneId,
					roleId: that.$Route.query.id
				}
				that.$api('employeeManagement.departmentPersonnelList', params).then(res => {
					if (res.code == 200) {
						res.data.list.forEach((res) => {
							res.checked = false
						})
						// if (this.checkedAll) {
						// 	res.data.list.forEach((res) => {
						// 		res.checked = true
						// 	})
						// }
						that.$refs.paging.complete(res.data.list)
						// 当前列表没有值时，全选关闭，底部的按钮恢复初始化
						if (res.data.list.length === 0) {
							that.showChecked = false
							that.checkedAll = false
						}
					} else {
						that.$refs.paging.complete(false);
					}
				}).catch((e) => {
					that.$refs.paging.complete(false);
				});
			},
			// 跳转到人员详情
			toStaffDetails(item) {
				this.$Router.push({
					path: '/pages/home/employeeManagement/staffDetails',
					query: { id: item.id }
				})
			},
			// 跳转添加人员
			onSubmit() {
				this.$Router.push({
					path: '/pages/home/employeeManagement/newStaff',
				});
			},
			// 操作
			confirm(e) {
				if (e.value !== 1) {
					this.modeShow = true
					this.operationSelect = false
				} else {
					// 跳转到部门详情
					this.$Router.push({
						path: '/pages/home/employeeManagement/departmentDetails',
						query: this.$Route.query
					})
					this.operationSelect = false
				}
			},
			// 关闭操作
			closeOperation() {
				this.operationSelect = false
			},
			// 删除弹窗确认按钮
			modelConfirm() {
				let _this = this
				// 当前没有人员才可以删除部门
				if (_this.dataList.length === 0) {
					_this.$api('employeeManagement.delDepartment', {
						ids: _this.departmentInfo.id
					}).then(res => {
						if (res.code == 200) {
							uni.showToast({
								title: res.msg,
								icon: 'none',
								duration: 500,
								mask: true
							});
							_this.$Router.push({
								path: '/pages/home/employeeManagement/index',
							})
						} else {
							uni.showToast({
								title: res.msg || '请求出错,稍后重试',
								icon: 'none',
								duration: 500,
								mask: true
							});
						}
					})
				} else {
					// 有人员就打开可以选择的标识，删除完人员才可以
					this.showChecked = true
				}
			},
			// 全选
			checkboxAll(res) {
				this.dataList.forEach((item) => {
					item.checked = res.value
				})
			},
			// 单个选择
			checkbox(index) {
				this.dataList[index].checked = this.dataList[index].checked ? true : false
				let arr = this.dataList.filter((item) => {
					return item.checked == true
				});
				this.checkedAll = (arr.length == this.dataList.length)
				this.$forceUpdate()
			},
			// 部门确认
			departmentConfirm(e) {
				let arr = this.dataList.filter((item) => {
					return item.checked == true
				}).map(item => item.id)
				let params = { roleId: e[0].value, userIds: arr.join() }
				// 移动人员到别的部门
				this.$api('employeeManagement.getByEnterpriseId', params).then(res => {
					if (res.code == 200) {
						this.getInfo(1, 10)
					}
				})
			},
			// 移动到某个部门
			moveSubmit() {
				let arr = this.dataList.filter((item) => {
					return item.checked == true
				})
				if (arr.length > 0) {
					this.departmentSelect = true
				} else {
					this.$refs.uToast.show({
						title: '请至少选择一项',
						type: 'warning'
					})
				}
			},
			// 删除多个人员
			delSubmit() {
				let arr = this.dataList.filter((item) => {
					return item.checked == true
				}).map(item => item.id)
				if (arr.length > 0) {
					let params = { ids: arr.join() }
					// 删除人员
					this.$api('employeeManagement.delByIdsEnterpriseUser', params).then(res => {
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
				} else {
					this.$refs.uToast.show({
						title: '请至少选择一项',
						type: 'warning'
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.body {
		.content {
			padding-left: 20upx;
			padding-right: 20upx;

			.content-title {
				color: #333333;
			}
			.checkbox {
				margin-left: 20upx;
			
				/deep/ .u-checkbox__label {
					margin: 0;
				}
			}
		}

		.bottoms {
			height: 98upx;
			position: relative;
			.bottoml {
				width: 35%;
				height: 98upx;
				line-height: 98upx;
				vertical-align: top;
				display: inline-block;
			}
			.bottomr {
				display: inline-block;
				background-color: #2979ff;
				width: 65%;
				.bottoms-button {
					width: 49%;
					height: 98upx;
					line-height: 98upx;
					float: left;
					color: #fff;
					text-align: center;
					cursor: pointer;
				}
				
				.bottoms-text {
					width: 2upx;
					height: 69upx;
					margin-top: 15upx;
					float: left;
					background-color: #fff;
				}
			}
			.btn_box_button {
				position: relative;
				top: 50%;
				transform: translateY(-50%);
				margin: 0 64upx;
			}
		}

		.popup-close {
			text-align: center;
			font-size: 34upx;
			color: #3E76F4;
			line-height: 100upx;
			height: 100upx;
		}
	}
</style>
