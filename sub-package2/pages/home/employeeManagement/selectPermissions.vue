<template>
	<page @click="hideIsShow">
		<u-navbar class="navbar" title="选择权限" :border-bottom="false">
			<view  @click="save" slot="right">
				保存
			</view>
		</u-navbar>
		<u-gap height="20" bg-color="#F1F2F3"></u-gap>
		<view class="u-p-l-20 u-p-r-20 u-p-t-38 u-p-b-38">
			<!-- 卡权限 -->
			<view class="card-permiss">
				<view class="head u-flex u-row-between">
					<text class="u-font-36 u-font-weight">卡权限</text>
					<view class="add-btn u-font-md u-p-8 u-border-radius-8 u-font-weight">
						<u-icon name="plus" color="#3E76F4" size="30"></u-icon>
						<text @click="addCardNo">添加卡号</text>
					</view>
				</view>
				<view class="card-permiss-center u-m-t-45 u-p-b-40 u-flex u-flex-wrap">
					<view
						v-for="(item, index) in cardList"
						:key="index"
						class="card-permiss-center-view"
						:class="(index + 1)%2 === 1 ? 'u-m-r-6' : 'u-m-l-6'"
					>
						<view style="padding-left: 124upx" @click.stop="operations(index)">{{ item }}</view>
						<u-icon
							class="card-permiss-center-view-clear"
							:class="[isShow == index ? 'show' : 'hide']"
							:name="'http://yuanzhoulvwego.com/wp-content/uploads/static/home/employeeManagement/quxiao.png'"
							size="32"
							@click="delCard(index)"
						></u-icon>
					</view>
				</view>
			</view>
			<!-- 卡权限 -->
			<!-- 门禁权限 -->
			<view class="access-authority u-m-t-54">
				<view class="head u-flex u-row-between">
					<text class="u-font-36 u-font-weight">门禁权限</text>
				</view>
				<view class="access-authority-center u-m-t-50 u-m-l-10 u-m-r-10">
					<view class="u-m-b-48">
						<u-icon size="30" :name="'http://yuanzhoulvwego.com/wp-content/uploads/static/home/employeeManagement/yuanqu.png'"></u-icon>
						<text class="u-m-l-10 u-font-32 u-font-weight">坂田高新技术工业园</text>
					</view>
					<u-checkbox-group>
						<view v-for="(item, index) in list" :key="index" style="width: 100%;" class="">
							<view class="u-m-b-32">
								<u-icon
									:name="item.hidden === true ? 'arrow-down-fill' : 'play-right-fill'"
									size="12"
									class="u-m-r-20 u-m-l-10"
									@click="showOrHide(item)"
								></u-icon>
								<u-checkbox 
									@change="checkboxChange" 
									v-model="item.checked"
									:name="item.buildIngName"
								>
									<view>{{ item.buildIngName }}</view>
								</u-checkbox>
							</view>
							<view class="u-m-b-54" :class="item.hidden === true ? '' : 'displayNone'">
								<view class="u-flex u-flex-wrap">
									<view
										v-for="(citem, cindex) in item.children"
										:key="cindex"
										style="width: 160upx; height: 60upx; line-height: 60upx; border-radius: 5upx;
											text-align: center; font-size: 26upx; font-weight: 400;"
										:style="citem.checked ? checkStyle : noCheckStyle"
										class="u-m-r-12 u-m-b-20"
										@click="checkRooms(citem, item)">
										<u-icon
											:name="citem.checked ? 'http://yuanzhoulvwego.com/wp-content/uploads/static/home/employeeManagement/suo-bai.png' : 
											'http://yuanzhoulvwego.com/wp-content/uploads/static/home/employeeManagement/suo.png'"
											size="30"
											class="u-m-r-10"
											style="vertical-align: text-top;"
										></u-icon>{{ citem.name }}
									</view>
								</view>
							</view>
						</view>
					</u-checkbox-group>
				</view>
			</view>
			<!-- 门禁权限 -->
		</view>
		<!-- 弹窗 -->
		<u-modal
			v-model="modeShow"
			:title="'添加卡号'"
			:title-style="titleStyle"
			:content-style="contentStyle"
			cancel-color="#333333"
			:show-cancel-button="true"
			confirm-text="确定"
			@confirm="confirm"
			@cancel="cancel">
			<view class="slot-content">
				<u-input v-model="cardNo" type="text" :border="true" placeholder="请输入卡号" :clearable="false" style="margin-top: 29upx;" />
			</view>
		</u-modal>
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
				// 卡列表
				cardList: [],
				// 显示删除键
				isShow: -1,
				// 弹窗显示
				modeShow: false,
				// 弹窗标题样式
				titleStyle: {
					fontSize: '36upx',
					fontWeight: 'bold',
					color: '#333333'
				},
				// 弹窗内容样式
				contentStyle: {
					textAlign: 'center',
					margin: '30upx'
				},
				// 卡号
				cardNo: '',
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
				// 选择的房间ids列表
				checkList: [],
				// 门禁选择列表
				list: []
			}
		},
		onLoad() {
			if (this.$Route.query.hasOwnProperty( "cardList" )) {
				this.cardList = this.$Route.query.cardList
				this.checkList = this.$Route.query.checkList
			}
			this.getRoomListByEnterpriseId()
		},
		methods: {
			// 获取门禁的列表
			getRoomListByEnterpriseId() {
				let params = {
					enterpriseId: this.enterpriseId,
					zoneId: this.zoneId
				}
				this.$api('employeeManagement.getRoomListByEnterpriseId', params, false).then(res => {
					if (res.code == 200) {
						this.list = res.data
						this.list.forEach(item => {
							item.hidden = false
							item.children.forEach(citem => {
								if (this.checkList.some(ccitem => ccitem === citem.id)) citem.checked = true
								else citem.checked = false
							})
							if (item.children.filter(ccitem => ccitem.checked === false).length > 0) {
								item.checked = false
							} else item.checked = true
						})
					}
				})
			},
			// 保存
			save(){
				uni.$emit('updateData', this.cardList, this.checkList)
				uni.navigateBack({ delta: 1 })
			},
			// 打开弹窗
			addCardNo() {
				this.modeShow = true
			},
			// 弹窗确认
			confirm() {
				if (this.cardNo.length > 0) {
					this.cardList.push(this.cardNo)
					this.cardNo = ''
				} else console.log('无')
			},
			// 弹窗取消
			cancel() {
				this.modeShow = false
				this.cardNo = ''
			},
			// 点击卡号，出现删除
			operations(index) {
				let that = this
				if(index === that.isShow){
					that.isShow = -1;
					return false;
				}
				that.isShow = index;
			},
			// 隐藏删除
			hideIsShow() {
				this.isShow = -1;
			},
			// 卡号删除
			delCard(index) {
				let that = this;
				let cardNo = that.cardList[index];
				uni.showModal({
					title: `确认删除${cardNo}`,
					content: '删除后无法恢复，请谨慎操作',
					success: function (res) {
						if (res.confirm) {
							that.cardList.splice(index,1)
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				})
			},
			// 展示隐藏选择房间
			showOrHide(item) {
				item.hidden = !item.hidden
				this.$forceUpdate()
			},
			// 选中某个复选框时，由checkbox时触发
			checkboxChange(e) {
				let arr = this.list.filter(item => item.buildIngName === e.name)[0].children
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
				this.$forceUpdate()
			},
			// 选择房间
			checkRooms(citem, item) {
				if (citem.checked) {
					citem.checked = false
					this.checkList.splice(this.checkList.indexOf(citem.id), 1)
				} else {
					citem.checked = true
					if (!this.checkList.some(ritem => ritem === item.id)) this.checkList.push(citem.id)
				}
				if (item.children.filter(ccitem => ccitem.checked === false).length > 0) item.checked = false
				else item.checked = true
				this.$forceUpdate()
			}
		}
	}
</script>

<style scoped lang="scss">
	.card-permiss {
		.add-btn{
			color: #3E76F4;
			background-color: #F3F5FD;
		}
		.card-permiss-center {
			border-bottom: 2upx solid #F1F2F3;
			.card-permiss-center-view {
				width: 348upx;
				height: 138upx;
				line-height: 138upx;
				color: #FFFFFF;
				font-size: 32upx;
				padding-right: 22upx;
				margin-bottom: 10upx;
				background-image: url('http://yuanzhoulvwego.com/wp-content/uploads/static/home/employeeManagement/ka.png');
				background-size: 100% 100%;
				background-repeat: no-repeat;
				position: relative;
				.card-permiss-center-view-clear {
					position: absolute;
					right: -8upx;
					top: -12upx;
				}
			}
		}
	}
	.hide {
		visibility: hidden;
	}
	.displayNone {
		display: none;
	}
</style>
