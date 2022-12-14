<template>
	<page>
		<z-paging ref="paging" v-model="dataList" @query="getMerchants">
			<view slot="top" class="">
				<u-navbar class="navbar" back-icon-color="#fff" title-color="#fff"
					:background="{background: '#3E76F4' }" title="招商信息" :border-bottom="false">
					<view class="u-flex " v-if="investmentIsOpen" slot="right" @click="showAddress=true">
						<view class="u-font-lg u-text-color-fff">
							{{location.city}}
						</view>
						<u-icon class="u-m-l-14" name="/static/xialaxuanzeanniu.png" size="18">
						</u-icon>
					</view>

				</u-navbar>
				<!-- 头部搜索 -->
				<view class="search">
					<u-search @search="search" placeholder="请输入招商标题或房间名" :show-action="false"
						v-model="form.keywordSearch">
					</u-search>
				</view>
				<!-- 下拉菜单 -->
				<u-dropdown @close="close" @open="open" :selectData="selectData" ref="floorDropdown"
					:border-bottom="true" active-color="#3E76F4" menu-icon="xialasanjiao" menu-icon-size="20">
					<u-dropdown-item v-if="investmentIsOpen" :title="selectData[0] ?selectData[0].name:'区域'">
						<view class="u-menu-wrap">
							<scroll-view scroll-y scroll-with-animation class="u-tab-view menu-scroll-view"
								:scroll-top="scrollTop">
								<view v-for="(item,index) in addressList" :key="index" class="u-tab-item"
									:class="[addressCurrent==index ? 'u-tab-item-active' : '']" :data-current="index"
									@tap.stop="swichMenu(index)">
									<text class="u-line-1">{{item.district}}</text>
								</view>
							</scroll-view>
							<block v-for="(item,index) in addressList" :key="index">
								<scroll-view scroll-y class="right-box" v-if="addressCurrent==index">
									<view class="class-item">
										<view class="zoneItem" v-for="(item1, index1) in item.children" :key="index1"
											:class="[(dropdownActive[1]===index1 &&dropdownActive[0]===index) ? 'zoneItem-active' : '']"
											@tap.stop="clickZone(item1,index1,index)">
											<view class="item-title">
												<text>{{item1.name}}</text>
											</view>
										</view>
									</view>
								</scroll-view>
							</block>
						</view>
					</u-dropdown-item>
					<u-dropdown-item :title="selectData[2] ?selectData[2].label:'楼栋'" :disabled="selectData[0] ? false : true">
						<scroll-view scroll-y scroll-with-animation class="u-tab-view menu-scroll-view">
							<view v-for="(item,index) in buildingList" :key="index" class="u-tab-item"
								:class="[item.active ? 'u-tab-item-active' : '']" :data-current="index"
								@click.stop="floorScroll(item,buildingList,2)">
								<text class="u-line-1">{{item.label}}</text>
							</view>
						</scroll-view>
					</u-dropdown-item>
					<u-dropdown-item :title="selectData[3]?selectData[3].label:'楼层'" :disabled="selectData[0] ? false : true">
						<scroll-view scroll-y scroll-with-animation class="u-tab-view menu-scroll-view">
							<view v-for="(item,index) in floorList" :key="index" class="u-tab-item"
								:class="[item.active ? 'u-tab-item-active' : '']" :data-current="index"
								@click.stop="floorScroll(item,floorList,3)">
								<text class="u-line-1">{{item.label}}</text>
							</view>
						</scroll-view>
					</u-dropdown-item>
					<u-dropdown-item :title="selectData[1] ?selectData[1].label:'类型'">
						<scroll-view scroll-y scroll-with-animation class="u-tab-view menu-scroll-view">
							<view v-for="(item,index) in typeList" :key="index" class="u-tab-item"
								:class="[(dropdownActive[2]===index) ? 'u-tab-item-active' : '']" :data-current="index"
								@click.stop="dropdownScroll(item,index,1)">
								<text class="u-line-1">{{item.label}}</text>
							</view>
						</scroll-view>
					</u-dropdown-item>
					<u-dropdown-item title="更多">
						<scroll-view scroll-y scroll-with-animation style="height: 700upx;"
							class="u-tab-view menu-scroll-view">
							<view class="content-box">
								<view class="slot-content" style="background-color: #FFFFFF;">
									<view class="">
										<view class="dropdown_title">
											租金区间
											<text style="color: #999999;">(元)</text>
										</view>
										<view class="dropdown_price">
											<view class="label">自定义</view>
											<u-field type="number" :clearable="false" class="input"
												v-model="formDropdown.rentMonthSearch.rentMonthL" label-width="0"
												placeholder="最小价格" />
											<view class="jianhao">-</view>
											<u-field type="number" :clearable="false" class="input"
												v-model="formDropdown.rentMonthSearch.rentMonthH" label-width="0"
												placeholder="最大价格" />
										</view>
								
										<view class="dropdown_radio">
											<axb-check-box :key="checkBox" itemBackground="#F1F2F3" background="#EBF1FE"
												color="#3E76F4" itemColor="#999999" ref="radio1"
												@change="rentMonthSearchRadioChange" :list="rentMonthSearchList">
											</axb-check-box>
										</view>
									</view>
								</view>
								<view class="slot-content" style="background-color: #FFFFFF;">
									<view class="">
										<view class="dropdown_title">
											面积区间
											<text style="color: #999999;">(m²)</text>
										</view>
										<view class="dropdown_price">
											<view class="label">自定义</view>
											<u-field type="number" :clearable="false" class="input"
												v-model="formDropdown.areaSearch.areaL" label-width="0"
												placeholder="最小面积" />
											<view class="jianhao">-</view>
											<u-field type="number" :clearable="false" class="input"
												v-model="formDropdown.areaSearch.areaH" label-width="0"
												placeholder="最大面积" />
										</view>
										<view class="dropdown_radio">
											<axb-check-box :key="checkBox" itemBackground="#F1F2F3" background="#EBF1FE"
												color="#3E76F4" itemColor="#999999" ref="radio1"
												@change="areaSearchRadioChange" :list="areaSearchList">
											</axb-check-box>
										</view>
									</view>
								</view>
								<view class="slot-content">
									<view class="">
										<view class="dropdown_title">
											装修类型
										</view>
										<view class="dropdown_radio">
											<axb-check-box :key="decorationStatus" itemBackground="#F1F2F3"
												background="#EBF1FE" color="#3E76F4" itemColor="#999999" ref="radio1"
												@change="dropdownRadioChange" :list="decorationList">
											</axb-check-box>
										</view>
									</view>
								</view>
								<view class="foot_but">
									<u-row gutter="20">
										<u-col span="3">
											<u-button class="foot_but_left but" @click="resetDropdown(3)">重置</u-button>
										</u-col>
										<u-col span="9">
											<u-button class="foot_but_right but" hover-class="none"
												@click="confirmDropdown">确定</u-button>
										</u-col>
									</u-row>
								</view>
							</view>
						</scroll-view>
					</u-dropdown-item>
				</u-dropdown>
			</view>
			<view class="u-p-t-20">
				<view class="u-m-b-20" v-for="(item,index) in dataList" :key="index" @click="goDetails(item)">
					<view class="card-box" style="display: flex;background: #fff;border-radius: 15upx;">
						<view class="">
							<u-image width="250" height="210" :src="item.images[0]"></u-image>
						</view>
						<view class="u-m-l-20" style="width: 100%;">
							<view class="u-font-lg u-main-color u-line-2 u-m-b-15" style="width: 100%;">
								{{item.investmentTitle}}
							</view>
							<view class="u-flex u-m-b-15 u-font-xs2">
								<view class="u-flex-1 u-line-1">
									管理费:{{item.propertyCosts || 0}}元/月
								</view>
								<view class="u-flex-1 u-line-1">
									<!-- 月租金:{{item.rentMonth || 0}}元 -->
									面积:{{item.area || 0}}m²
								</view>
								
							</view>
							<view class="type u-flex u-m-b-10">
								<text class="">
									类型：
								</text>
								<u-tag v-for="(data,subIndex) in typeList" class="u-m-l-4" shape="circle" :key="subIndex"
									:color="item.roomType==data.value?'#e35d5d':'#999999'" bg-color="#ffffff"
									:border-color="item.roomType==data.value?'#e35d5d':'#999999'" size="mini"
									:text="data.label" type="info" />
							</view>
							<view class="u-type-price u-font-lg2 u-text-bold">
								月租金：{{item.rentMonth || 0}}元
							</view>
						</view>
					</view>
				</view>
			</view>
			<view slot="bottom" class="bottoms">
				<view class="bottoms-button" @click="applyRecord(1)">我的收藏</view>
				<view class="bottoms-text"></view>
				<view class="bottoms-button" @click="applyRecord(0)">申请记录</view>
			</view>
		</z-paging>
		<u-select v-model="showAddress" mode="mutil-column-auto" :list="addressCityList" @confirm="confirmAddress">
		</u-select>
	</page>
</template>

<script>
	import axbCheckBox from '@/components/axb-checkbox/axb-checkbox.vue'
	export default {
		components: {
			axbCheckBox
		},
		data() {
			return {
				scrollTop: 0, //tab标题的滚动条位置
				menuHeight: 0, // 左边菜单的高度
				menuItemHeight: 0, // 左边菜单item的高度
				buildingList: [], // 楼栋列表
				// 楼层列表
				floorList: [{
					label: '全部',
					value: 0,
					active: false
				}],
				params: {
					province: true,
					city: true,
					area: false
				},
				city: '',
				addressCityList: [],
				investmentIsOpen: uni.getStorageSync('userInfo').investmentIsOpen,
				location: {},
				showAddress: false,
				rentMonthSearchList: [],
				areaSearchList: [],
				cityZone: [],
				decorationList: [],
				selectData: [],//下拉选中后的集合
				dataList: [],
				typeList: [],
				dropdownActive: [0, '', ''],
				addressCurrent: 0, // 预设当前项的值
				addressList: [],
				formDropdown: {
					rentMonthSearch: {},
					areaSearch: {}
				},
				decorationStatus: '', //用于强制刷新单选按钮并赋值
				openDrop: false, //检测用户是否是点击了确定才触发的下拉菜单关闭
				checkBox: '', //用于强制刷新单选按钮
				form: {
					rentMonthSearch: {},
					areaSearch: {},
					keywordSearch: '',
					investmentStatus: 1,
				}
			};
		},
		onLoad() {
			this.$enum.addressEnum('', (res) => {
				for (let i = 0; i < res.length; i++) {
					this.addressCityList.push({
						value: res[i].code,
						label: res[i].name,
						children: []
					})
					this.$enum.addressEnum({
						pid: res[i].code
					}, (res2) => {
						this.addressCityList[i].children = res2.map(res3 => {
							return {
								value: res3.code,
								label: res3.name,
							}
						})

					})
				}
			})
			// 游客选择园区后，进入可看到选择的园区招商信息
			if (uni.getStorageSync('zoneInfo') && uni.getStorageSync('userInfo').enterpriseId === 0) {
				this.$set(this.selectData, 0, uni.getStorageSync('zoneInfo'))
				this.location = { province: uni.getStorageSync('zoneInfo').province, city: uni.getStorageSync('zoneInfo').city }
				uni.setStorageSync('location', this.location);
			} else {
				this.$set(this.selectData, 0, uni.getStorageSync('zoneInfo'))
				this.location = uni.getStorageSync('location')
			}
			if (uni.getStorageSync('zoneInfo').id) {
				this.buildfloorEnum(uni.getStorageSync('zoneInfo').id)
			}
			this.typeList = this.$enum.roomType.filter(item => {
				return (item.value != 2 && item.value != 3 && item.value != 6 && item.value != 7)
			})
			this.areaSearchList = uni.getStorageSync('areaSearchList') || []
			this.rentMonthSearchList = uni.getStorageSync('rentMonthSearchList') || []
			this.$enum.getByCity((res) => {
				this.addressList = res
			})
			this.decorationList = this.$enum.decorationStatus.map((item) => {
				item.checked = false
				return item
			})
		},
		methods: {
			// 楼栋楼层的加载
			buildfloorEnum(id) {
				let params = {
					zoneId: id ? id : uni.getStorageSync('zoneInfo').id
				}
				this.$enum.buildfloorEnum(params, (res) => {
					this.buildingList = res.map(item => {
						return {
							value: item.id,
							label: item.name,
							children: item.children
						}
					})
					this.buildingList.push({
						value: '',
						label: '全部',
						children: []
					})
					if (id) {
						this.floorList = [{
							label: '全部',
							value: 0,
							active: false
						}]
					}
				})
			},
			// 楼栋楼层选择后的筛选
			floorScroll(res, arr, indexSelect) {
				if (indexSelect === 2) {
					this.$set(this.selectData, 3, '')
					this.floorList = res.children.map(item => {
						return {
							value: item.id,
							label: item.name,
						}
					})
					this.floorList.push({
						value: '',
						label: '全部'
					})
				}
				if (res.label == '全部') {
					arr.forEach((item) => {
						if (res.value === item.value) {
							item.active = true
						} else {
							item.active = false
						}
			
					})
					this.$set(this.selectData, indexSelect, '')
				} else {
					arr.forEach((item) => {
						if (res.value === item.value) {
							item.active = true
						} else {
							item.active = false
						}
					})
					this.$set(this.selectData, indexSelect, res)
				}
				this.$refs.paging.reload(false);
				this.$refs.floorDropdown.close();
			},
			confirmAddress(data) {
				this.location = {
					province: data[0].label,
					city: data[1].label
				}
				uni.setStorageSync('location', this.location);
				this.$enum.getByCity((res) => {
					this.addressList = res
				})
			},
			applyRecord(type) {
				this.$Router.push({
					path: "/pages/home/merchants/applyRecord",
					query: {
						pageType: type
					}
				});
			},
			// 去往详情页
			goDetails(res) {
				this.$Router.push({
					path: "/pages/home/merchants/detailsMerchants",
					query: res
				});
			},
			rentMonthSearchRadioChange(value, index) {
				// 解决切换下拉的时候单选组件视图效果缺失的bug，如果下拉菜单为非联动状态应该不会有该bug
				this.rentMonthSearchList.forEach((item, index2) => {
					if (index2 == index) item.checked = true
					else item.checked = false
				})
				//深度克隆value的原因为防止value和输入框绑定导致同步更新单选数组的值
				this.formDropdown.rentMonthSearch = this.$u.deepClone(value) || {}
			},
			areaSearchRadioChange(value, index) {
				// 解决切换下拉的时候单选组件视图效果缺失的bug，如果下拉菜单为非联动状态应该不会有该bug
				this.areaSearchList.forEach((item, index2) => {
					if (index2 == index) item.checked = true
					else item.checked = false
				})
				//深度克隆value的原因为防止value和输入框绑定导致同步更新单选数组的值
				this.formDropdown.areaSearch = this.$u.deepClone(value) || {}
			},
			dropdownRadioChange(value, index) {
				// 解决切换下拉的时候单选组件视图效果缺失的bug，如果下拉菜单为非联动状态应该不会有该bug
				this.decorationList.forEach((item, index2) => {
					if (index2 == index) item.checked = true
					else item.checked = false
				})
				//深度克隆value的原因为防止value和输入框绑定导致同步更新单选数组的值
				this.decorationStatus = this.$u.deepClone(value) != null ? this.$u.deepClone(value) : ''
			},
			// 更多下拉框的确认
			confirmDropdown(type) {
				this.formDropdown.decorationStatus = this.decorationStatus
				let formDropdown = this.$u.deepClone(this.formDropdown);
				let form = this.$u.deepClone(this.form);
				if (Object.keys(formDropdown.areaSearch).length !== 0 && !(!formDropdown.areaSearch.areaL && !
						formDropdown.areaSearch.areaH)) {
					if (!formDropdown.areaSearch.areaL && formDropdown.areaSearch.areaH) {
						uni.showToast({
							title: '请输入最小面积',
							icon: 'none'
						})
						return
					}
					if (!formDropdown.areaSearch.areaH && formDropdown.areaSearch.areaL) {
						uni.showToast({
							title: '请输入最大面积',
							icon: 'none'
						})
						return
					}
					if (+formDropdown.areaSearch.areaH < +formDropdown.areaSearch.areaL) {
						uni.showToast({
							title: '最大面积不能小与最小面积',
							icon: 'none'
						})
						return
					}
					const areaSearchObj = {
						value: formDropdown.areaSearch,
						label: formDropdown.areaSearch.areaL + '-' + formDropdown.areaSearch.areaH,
						checked: false
					};
					// 检测单选数组中是否已存在确认后输入框中输入的值，如果存在则删除
					this.areaSearchList.forEach((item, index) => {
						if (Object.entries(areaSearchObj.value).toString() === Object.entries(item
								.value).toString() && areaSearchObj.label == item.label) {
							this.areaSearchList.splice(index, 1)
						} else {
							item.checked = false
						}
					})
					// 检测单选数组中长度是否大于5，如果大于5则删除最后一个数据
					if (this.areaSearchList.length > 5) {
						this.$delete(this.areaSearchList, this.areaSearchList.length - 1)
					}
					this.areaSearchList.unshift(areaSearchObj)
					uni.setStorageSync('areaSearchList', this.areaSearchList)
					this.$set(this.areaSearchList[0], 'checked', true)
				}
				if (Object.keys(formDropdown.rentMonthSearch).length !== 0 && !(!formDropdown.rentMonthSearch.rentMonthL &&
						!formDropdown.rentMonthSearch.rentMonthH)) {

					if (!formDropdown.rentMonthSearch.rentMonthL && formDropdown.rentMonthSearch.rentMonthH) {
						uni.showToast({
							title: '请输入最小价格',
							icon: 'none'
						})
						return
					}
					if (!formDropdown.rentMonthSearch.rentMonthH && formDropdown.rentMonthSearch.rentMonthL) {
						uni.showToast({
							title: '请输入最大价格',
							icon: 'none'
						})
						return
					}
					if (+formDropdown.rentMonthSearch.rentMonthH < +formDropdown.rentMonthSearch.rentMonthL) {
						uni.showToast({
							title: '最大价格不能小与最小价格',
							icon: 'none'
						})
						return
					}
					let rentMonthSearchObj = {
						value: formDropdown.rentMonthSearch,
						label: formDropdown.rentMonthSearch.rentMonthL + '-' + formDropdown.rentMonthSearch
							.rentMonthH,
						checked: false
					};
					this.rentMonthSearchList.forEach((item, index) => {
						if (Object.entries(rentMonthSearchObj.value).toString() === Object.entries(item.value)
							.toString() && rentMonthSearchObj.label == item.label) {

							this.rentMonthSearchList.splice(index, 1)
						} else {
							item.checked = false
						}
					})
					if (this.rentMonthSearchList.length > 5) {
						this.$delete(this.rentMonthSearchList, this.rentMonthSearchList.length - 1)
					}
					this.rentMonthSearchList.unshift(rentMonthSearchObj)
					uni.setStorageSync('rentMonthSearchList', this.rentMonthSearchList)
					this.$set(this.rentMonthSearchList[0], 'checked', true)
				}
				this.form = this.$u.deepMerge(form, formDropdown);
				this.openDrop = true
				this.$refs.paging.reload();
				this.$refs.floorDropdown.close();
			},
			// 更多下拉框的重置
			resetDropdown(type) {
				this.formDropdown.rentMonthSearch = {}
				this.formDropdown.areaSearch = {}
				this.form.rentMonthSearch = {}
				this.form.areaSearch = {}
				this.decorationStatus = ''
				this.rentMonthSearchList = this.rentMonthSearchList.map((item) => {
					item.checked = false
					return item
				})
				
				this.areaSearchList = this.areaSearchList.map((item) => {
					item.checked = false
					return item
				})
				
				this.decorationList = this.$enum.decorationStatus.map((item) => {
					item.checked = false
					return item
				})
				// switch (type) {
				// 	case 1:
				// 		this.formDropdown.rentMonthSearch = {}
				// 		this.form.rentMonthSearch = {}
				// 		// 解决单选组件视图不更新的bug
				// 		this.rentMonthSearchList = this.rentMonthSearchList.map((item) => {
				// 			item.checked = false
				// 			return item
				// 		})
				// 		break;
				// 	case 2:
				// 		this.formDropdown.areaSearch = {}
				// 		this.form.areaSearch = {}
				// 		this.areaSearchList = this.areaSearchList.map((item) => {
				// 			item.checked = false
				// 			return item
				// 		})
				// 		break;
				// 	case 3:
				// 		this.decorationList = this.$enum.decorationStatus.map((item) => {
				// 			item.checked = false
				// 			return item
				// 		})
				// 		this.decorationStatus = ''
				// 		break;
				// 	default:
				// 		break;
				// }

			},
			dropdownScroll(res, index, indexSelect) {
				switch (indexSelect) {
					case 1:
						if (index === this.dropdownActive[2]) {
							this.$set(this.dropdownActive, 2, '')
							this.$set(this.selectData, 1, '')
						} else {
							this.$set(this.dropdownActive, 2, index)
							this.$set(this.selectData, 1, res)
						}
						break;
					default:
						break;
				}
				this.$refs.paging.reload(false);
				this.$refs.floorDropdown.close();
			},
			open() {
				this.openDrop = false
				this.checkBox = ''
				this.fallbackData() //解除下拉菜单联动效果就不要注释这一行
			},
			fallbackData() {
				// 回退下拉菜单的数据
				let formDropdown = this.$u.deepClone(this.form);
				this.formDropdown.rentMonthSearch = formDropdown.rentMonthSearch
				this.formDropdown.areaSearch = formDropdown.areaSearch
				this.rentMonthSearchList.forEach((item, index) => {
					if (Object.entries(formDropdown.rentMonthSearch).toString() === Object.entries(item
							.value).toString()) {
						item.checked = true
					} else {
						item.checked = false
					}
				})
				this.areaSearchList.forEach((item, index) => {
					if (Object.entries(formDropdown.areaSearch).toString() === Object.entries(item
							.value).toString()) {
						item.checked = true
					} else {
						item.checked = false
					}
				})
				this.decorationList = this.$enum.decorationStatus.map((item) => {
					if (item.value == this.formDropdown.decorationStatus) {
						item.checked = true
					} else {
						item.checked = false
					}
					return item
				})
				this.decorationStatus = this.formDropdown.decorationStatus
			},
			close() {
				this.checkBox = 1
				if (!this.openDrop) {
					this.fallbackData()
				}
				this.$refs.paging.updatePageScrollTopHeight()
			},
			search() {
				this.$refs.paging.reload();
			},
			getMerchants(pageNo, pageSize) {
				this.form.currPage = pageNo
				this.form.pageSize = pageSize
				this.selectData.forEach((item, index) => {
					switch (index) {
						case 0:
							this.form.zoneId = this.selectData[0].id
							break;
						case 1:
							this.form.roomType = this.selectData[1].value
							break;
						case 2:
							this.form.buildingId = this.selectData[2].value
							break;
						case 3:
							this.form.floorId = this.selectData[3].value
							break;
					}
				})
				let params = this.$u.deepClone(this.form);
				if (!this.form.areaSearch.areaL && !this.form.areaSearch.areaH) {
					this.form.areaSearch = {}
				}
				if (!this.form.rentMonthSearch.rentMonthL && !this.form.rentMonthSearch.rentMonthH) {
					this.form.rentMonthSearch = {}
				}
				// 适配后端不支持传空的价格和面积
				params = this.$u.deepMerge(params, this.form.rentMonthSearch);
				params = this.$u.deepMerge(params, this.form.areaSearch);
				if (!this.investmentIsOpen) {
					params.zoneId = uni.getStorageSync('userInfo').zoneId
				}
				this.$api('merchants.merchantsList', params).then(res => {
					if (res.code == 200) {
						this.$refs.paging.complete(res.data.list);
					} else {
						this.$refs.paging.complete(false);
					}

				}).catch((e) => {
					this.$refs.paging.complete(false);
				});
			},
			// 选择园区后
			clickZone(item, index1, index) {
				this.$set(this.selectData, 2, '')
				this.$set(this.selectData, 3, '')
				if (index1 === this.dropdownActive[1] && index === this.dropdownActive[0]) {
					this.$set(this.dropdownActive, 0, 0)
					this.$set(this.dropdownActive, 1, '')
					this.$set(this.selectData, 0, '')
					this.$nextTick(() => {
						this.$refs.paging.reload();
						this.$refs.floorDropdown.close();
					})
					return
				}
				this.$set(this.dropdownActive, 0, index)
				this.$set(this.dropdownActive, 1, index1)
				this.$set(this.selectData, 0, item)
				this.buildfloorEnum(this.selectData[0].id)
				this.$nextTick(() => {
					this.$refs.paging.reload();
					this.$refs.floorDropdown.close();
				})
			},
			// 点击左边的栏目切换
			async swichMenu(index) {
				if (index == this.addressCurrent) return;
				this.addressCurrent = index;
				this.seachTime = this.$u.timeFormat(new Date(), 'yyyy年mm月')
				// 如果为0，意味着尚未初始化
				if (this.menuHeight == 0 || this.menuItemHeight == 0) {
					await this.getElRect('menu-scroll-view', 'menuHeight');
					await this.getElRect('u-tab-item', 'menuItemHeight');
				}
				// 将菜单菜单活动item垂直居中
				this.scrollTop = index * this.menuItemHeight + this.menuItemHeight / 2 - this.menuHeight /
					2;
			},
			// 获取一个目标元素的高度
			getElRect(elClass, dataVal) {
				new Promise((resolve, reject) => {
					const query = uni.createSelectorQuery().in(this);
					query.select('.' + elClass).fields({
						size: true
					}, res => {
						// 如果节点尚未生成，res值为null，循环调用执行
						if (!res) {
							setTimeout(() => {
								this.getElRect(elClass);
							}, 10);
							return;
						}
						this[dataVal] = res.height;
					}).exec();
				})
			}
		}
	}
</script>
<style>
	page {
		height: 100%;
		background-color: #F9F9F9;
	}
</style>
<style scoped lang="scss">
	.content-box {
		background: #fff;
		// height: 500upx;
		padding-bottom: 90upx;
		position: relative;

		.foot_but {
			position: fixed;
			bottom: 0;
			width: 100%;
			padding: 10upx 40upx;
			box-shadow: 0px 0px 35upx 0px rgba(204, 204, 204, 0.3);

			.but {
				height: 80upx;
				line-height: 80upx;
				border: 1upx solid #dddddd;
				font-size: 30upx;
				border-radius: 5upx;

				&:after {
					border: 0;
					border-radius: 0;
				}
			}

			.foot_but_left {}

			.foot_but_right {
				background: #3E76F4;
				color: #FFFFFF;
			}
		}
	}


	.slot-content {
		padding: 20upx 30upx;

		.dropdown_title {
			padding: 10upx 0;
			font-size: 32upx;
			font-weight: bold;
			color: #333333;
		}

		.dropdown_price {
			display: flex;
			padding: 50upx 30upx;
			align-items: center;

			.label {
				margin-right: 30upx;
				font-size: 28upx;
				color: #333333;
			}

			.jianhao {
				padding: 0 30upx;
				font-size: 26upx;
				color: #999999;
			}

			.input {
				width: 180upx;
				height: 60upx;
				font-size: 26upx;
				border-radius: 5upx;
				padding: 0;
				text-align: center;

				/deep/ .fild-body {
					view {
						margin: 0 0 !important;
					}
				}

				&:after {
					width: 0;
					height: 0;
				}

				/deep/ input {
					width: 180upx;
					border: 2upx solid #dddddd;
					height: 60upx;
					text-align: center !important;
					font-size: 26upx;
				}
			}
		}

		.dropdown_radio {
			/deep/ .radio {
				background: #F1F2F3 !important;
				border-radius: 5upx;
				border: 0;
				width: 160upx;
				color: #999999;
				text-align: center;
				font-size: 24upx;
				height: 60upx;
				margin: 0 6upx 20upx 6upx;
				line-height: 60upx;
				padding: 0;
			}
		}
	}

	/deep/ .zp-scroll-view-super {
		z-index: 12;
	}

	.bottoms {
		height: 98upx;
		background: #3E76F4;

		.bottoms-button {
			width: 49%;
			height: 98upx;
			line-height: 98upx;
			font-size: 34upx;
			font-weight: bold;
			float: left;
			color: #fff;
			text-align: center;
		}

		.bottoms-text {
			width: 2upx;
			height: 56upx;
			margin-top: 20upx;
			float: left;
			background-color: #fff;
		}
	}

	/deep/ .u-dropdown {
		background: #fff !important;
	}

	/deep/ .u-dropdown__menu__item__text {
		overflow: hidden;
		word-break: break-all;
		text-overflow: ellipsis;
		display: -webkit-box; // 弹性伸缩盒
		-webkit-box-orient: vertical; // 设置伸缩盒子元素排列方式
		-webkit-line-clamp: 1;
	}

	.card-box {
		padding: 40upx 20upx;
	}

	.search {
		padding: 17upx 20upx;
		background: #FFFFFF;
	}

	.u-tab-item-active {
		color: #3E76F4 !important;
	}

	.u-tab-view {
		height: 500upx;
	}

	.u-tab-item {
		height: 100rpx;
		background: #FFFFFF;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		color: #333333;
		font-weight: 400;
		line-height: 1;
	}

	.u-menu-wrap {
		height: 500upx;
		flex: 1;
		display: flex;
		overflow: hidden;

		.u-tab-view {
			width: 200rpx;
			height: 100%;
			background: #f1f2f3;
		}

		.u-tab-item {
			height: 100upx;
			background: #f1f2f3;
			box-sizing: border-box;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 30rpx;
			color: #333333;
			font-weight: 400;
			line-height: 1;
		}

		.u-tab-item-active {
			position: relative;
			color: $u-main-color;
			font-size: 30rpx;
			background: #fff;
		}

		.u-tab-view {
			height: 100%;
		}

		.right-box {
			background-color: #FFF;
		}

		.class-item {

			margin-bottom: 30rpx;
			background-color: #fff;
			border-radius: 8rpx;
		}

		.zoneItem {
			height: 100upx;
			line-height: 100upx;
			color: $u-main-color;
		}

		.zoneItem-active {
			color: #3E76F4 !important;
			font-size: 30rpx;
			// background: #f1f2f3;
		}

		.item-title {
			font-size: 30upx;
			text-align: center;
		}
	}
</style>
