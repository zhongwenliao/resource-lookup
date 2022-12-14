<template>
	<view class="boby">
		<u-navbar title="人员详情">
			<u-icon slot="right" name="more-dot-fill" size="30" @click="openOperation"></u-icon>
		</u-navbar>
		<u-gap height="20" bg-color="#f1f2f3"></u-gap>
		<view class="content">
			<view class="unit">
				<view class="left">
					姓名
				</view>
				<view class="right">
					{{ forms.userName || '--'}}
				</view>
			</view>
			<view class="unit">
				<view class="left">
					手机号
				</view>
				<view class="right">
					{{ forms.phone || '--'}}
				</view>
			</view>
			<view class="unit">
				<view class="left">
					性别
				</view>
				<view class="right">
					{{ forms.gender === 1 ? '男' : '女' }}
				</view>
			</view>
			<view class="unit">
				<view class="left">
					部门
				</view>
				<view class="right">
					{{ forms.roleName === '租户员工' ? '租户员工' : forms.roleName }}
				</view>
			</view>
			<view class="unit">
				<view class="left">
					人员权限
				</view>
				<view class="right">
					{{ forms.personnelAccess }}
				</view>
			</view>
			<view class="unit">
				<view class="left">
					备注
				</view>
				<view class="right">
					{{ forms.remark  || '无' }}
				</view>
			</view>
		</view>
		<!-- 操作 -->
		<u-popup v-model="operationSelect" mode="bottom" height="360upx" border-radius="25" @close="closeOperation">
			<view style="padding: 0px 40upx;">
				<u-cell-group>
					<u-cell-item
						v-for="(item, index) in operationList"
						:key="index"
						:title="item.label"
						:arrow="false"
						:title-style="{ width: '100%', textAlign: 'center', fontSize: '16px', color: '#333333', fontWeight: 'bold' }"
						@click="confirm(item)"
					></u-cell-item>
				</u-cell-group>
			</view>
			<u-gap height="20" bg-color="#f1f2f3"></u-gap>
			<view class="popup-close" @click="closeOperation">取消</view>
		</u-popup>
		<!-- 删除弹窗 -->
		<u-modal
			v-model="showModel"
			:title="''"
			:show-cancel-button="true"
			confirm-text="确定"
			cancel-color="#333"
			@confirm="knowConfirm"
		>
			<view class="slot-content">
				<view style="margin: 22upx 0 94upx; text-align: center;">确认删除该员工吗？</view>
			</view>
		</u-modal>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 人员信息
				forms: {},
				// 操作标识
				operationSelect: false,
				// 弹窗标识
				showModel: false,
				// 判断弹窗是1禁用还是2删除
				modelId: 0,
				// 操作列表
				operationList: [
					{ value: 1, label: '编辑人员' },
					{ value: 2, label: '删除人员' }
				]
			}
		},
		onLoad() {
			this.getByIdEnterpriseUser(this.$Route.query.id)
		},
		methods: {
			// 根据id获取当前人员信息
			getByIdEnterpriseUser(id) {
				let params = { id }
				this.$api('employeeManagement.getByIdEnterpriseUser', params).then(res => {
					if (res.code == 200) {
						this.forms = res.data
						if (this.forms.rooms.length > 0 || this.forms.cardNumber.length > 0) {
							this.forms.personnelAccess = '已选权限'
						} else {
							this.forms.personnelAccess = '暂无选择'
						}
						// if (this.forms.cardNumber.length > 0) this.forms.personnelAccess = '卡权限'
						// if (this.forms.rooms.length > 0) {
						// 	this.forms.personnelAccess = this.forms.personnelAccess.length > 0 ?
						// 		this.forms.personnelAccess + ',门禁权限' : '门禁权限'
						// }
					}
				})
			},
			// 打开抽屉
			openOperation() {
				this.operationSelect = true
			},
			// 关闭抽屉
			closeOperation() {
				this.operationSelect = false
			},
			// 抽屉点击之后的返回
			confirm(e) {
				if (e.value === 1) {
					this.$Router.push({
						path: '/pages/home/employeeManagement/newStaff',
						query: this.forms
					})
				} else {
					this.showModel = true
					this.modelId = e.value
				}
				this.closeOperation()
			},
			// 弹窗确认
			knowConfirm() {
				if (this.modelId === 2) {
					let params = { ids: this.forms.id }
					// 删除人员
					this.$api('employeeManagement.delByIdsEnterpriseUser', params).then(res => {
						if (res.code == 200) {
							uni.navigateBack()
						}
					})
				} else {
					this.$Router.push({
						path: '/pages/home/employeeManagement/personnelList',
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.boby {
		.content {
			padding: 78upx 40upx;
			.unit {
				display: flex;
				justify-content: space-between;
				padding: 15upx 0upx;
				font-size: 30upx;
			
				.left {
					color: #666666;
				}
			
				.right {
					color: #333333;
				}
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
