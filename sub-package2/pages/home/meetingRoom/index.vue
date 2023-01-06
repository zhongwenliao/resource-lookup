<template>
	<!-- 会议室列表页面 -->
	<page>
		<z-paging ref="paging" v-model="dataList" @query="getInfo">
			<view slot="top" class="">
				<u-navbar :custom-back="customBack" class="navbar" back-icon-color="#fff" title-color="#fff"
					:background="{background: '#3E76F4' }" title="会议室预约" :border-bottom="false">
					<!-- 右边的城市选择 -->
					<view class="u-flex " v-if="investmentIsOpen && !this.enterpriseId" slot="right" @click="showAddress=true">
						<view class="u-font-lg u-text-color-fff">
							{{location.city}}
						</view>
						<u-icon class="u-m-l-14" name="http://yuanzhoulvwego.com/wp-content/uploads/static/xialaxuanzeanniu.png" size="18">
						</u-icon>
					</view>
				</u-navbar>
				<!-- 下拉菜单 -->
				<u-dropdown @open="dropdownOpen" @close="close" :selectData="selectData" ref="floorDropdown" :border-bottom="true"
					active-color="#3E76F4" menu-icon="xialasanjiao" menu-icon-size="20" class="u-m-b-20">
					<!-- 区域 start -->
					<u-dropdown-item v-if="investmentIsOpen && !this.enterpriseId" :title="selectData[0] ?selectData[0].name:'区域'">
						<view class="u-menu-wrap">
							<!-- 区域左边 -->
							<scroll-view scroll-y scroll-with-animation class="u-tab-view menu-scroll-view"
								:scroll-top="scrollTop">
								<view v-for="(item,index) in addressList" :key="index" class="u-tab-item"
									:class="[addressCurrent==index ? 'u-tab-item-active' : '']" :data-current="index"
									@tap.stop="swichMenu(index)">
									<text class="u-line-1">{{item.district}}</text>
								</view>
							</scroll-view>
							<!-- 区域右边 -->
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
					<!-- 区域 end -->
					<!-- 容纳人数 start -->
					<u-dropdown-item
						:title="galleryfulSearch.minimumOccupancy && galleryfulSearch.maximumCapacity ?
						 galleryfulSearch.minimumOccupancy + '-' + galleryfulSearch.maximumCapacity : '容纳人数'">
						<view class="content-box">
							<view class="slot-content" style="background-color: #FFFFFF;">
								<view class="">
									<view class="dropdown_title">
										容纳人数区间
									</view>
									<view class="dropdown_price">
										<view class="label">自定义</view>
										<u-field type="number" :clearable="false" class="input"
											v-model="formDropdown.galleryfulSearch.minimumOccupancy" label-width="0"
											placeholder="最少人数" />
										<view class="jianhao">-</view>
										<u-field type="number" :clearable="false" class="input"
											v-model="formDropdown.galleryfulSearch.maximumCapacity" label-width="0"
											placeholder="最多人数" />
									</view>
									<!-- 搜索过的容纳人数区间 -->
									<view class="dropdown_radio">
										<axb-check-box :key="galleryfulKey" itemBackground="#F1F2F3" background="#EBF1FE" color="#3E76F4"
											itemColor="#999999" ref="radio1" @change="galleryfulSearchRadioChange"
											:list="galleryfulSearchList">
										</axb-check-box>
									</view>
								</view>
							</view>
							<view class="foot_but">
								<u-row gutter="20">
									<u-col span="3">
										<u-button class="foot_but_left but" @click="resetDropdown(1)">重置</u-button>
									</u-col>
									<u-col span="9">
										<u-button class="foot_but_right but" hover-class="none"
											@click="confirmDropdown('galleryful')">确定</u-button>
									</u-col>
								</u-row>
							</view>
						</view>
					</u-dropdown-item>
					<!-- 容纳人数 end -->
					<!-- 价格 start -->
					<u-dropdown-item v-if="!this.enterpriseId" title="价格">
						<view class="content-box">
							<view class="slot-content" style="background-color: #FFFFFF;">
								<view class="">
									<view class="dropdown_title">
										<u-radio-group v-model="priceStatus">
											<u-radio :name="'1'" shape="square">按小时</u-radio>
											<u-radio :name="'2'" shape="square">按半天</u-radio>
											<u-radio :name="'3'" shape="square">按天</u-radio>
										</u-radio-group>
									</view>
									<view class="dropdown_price">
										<view class="label">自定义</view>
										<u-field type="number" :clearable="false" class="input"
											v-model="formDropdown.priceSearch.priceL" label-width="0"
											placeholder="最小价格" />
										<view class="jianhao">-</view>
										<u-field type="number" :clearable="false" class="input"
											v-model="formDropdown.priceSearch.priceH" label-width="0"
											placeholder="最大价格" />
									</view>
									<!-- 搜索过的价格区间 -->
									<view class="dropdown_radio">
										<axb-check-box :key="priceKey" itemBackground="#F1F2F3" background="#EBF1FE" color="#3E76F4"
											itemColor="#999999" ref="radio1" @change="priceSearchRadioChange"
											:list="priceSearchList">
										</axb-check-box>
									</view>
								</view>
							</view>
							<view class="foot_but">
								<u-row gutter="20">
									<u-col span="3">
										<u-button class="foot_but_left but" @click="resetDropdown(2)">重置</u-button>
									</u-col>
									<u-col span="9">
										<u-button class="foot_but_right but" hover-class="none"
											@click="confirmDropdown('price')">确定</u-button>
									</u-col>
								</u-row>
							</view>
						</view>
					</u-dropdown-item>
					<!-- 价格 end -->
				</u-dropdown>
			</view>
			<!-- 时间列表 -->
			<!-- <lx-calendar :value="value" @change="change"></lx-calendar> -->
			<!-- 会议室列表 -->
			<view class="card-box">
				<view class="card" v-for="(item, index) in dataList" :key="item.id" @click="goMeetingDetails(item)">
					<view class="card-left">
						<u-image style="margin-right: 20rpx;" :fade="false" width="180" height="160"
							:src="item.images[0]"></u-image>
					</view>
					<view class="card-center">
						<view class="card-center-title">
							{{ item.ownedBuilding + '/' + item.ownedFloor + '/' + item.name }}
						</view>
						<view class="card-center-content">
							可容纳：{{item.minimumOccupancy}}-{{item.maximumCapacity}}人
						</view>
					</view>
					<view class="card-right">
						<view class="card-right-box stateBut">预约</view>
					</view>
				</view>
			</view>
			<!-- 底部按钮 跳转页面 -->
			<view slot="bottom" class="meeting-bottom">
				<u-row style="height: 98upx;">
					<u-col span="6" v-for="(item, index) in meetingRoomTabbar" :key="index"
						style="text-align: center;" @click="goPaths(item)">
						<u-image width="42" height="42" :src="item.iconPath" class="meeting-bottom_image"></u-image>
						<span class="u-font-22" :class="item.text === '会议室预约' ? 'meeting-bottom-ctext': 'meeting-bottom-text'">
							{{ item.text }}
						</span>
					</u-col>
				</u-row>
			</view>
		</z-paging>
		<u-select v-model="showAddress" mode="mutil-column-auto" :list="addressCityList" @confirm="confirmAddress">
		</u-select>
	</page>
</template>

<script>
	let day = new Date();
	let oldPrice = '1'
	import axbCheckBox from '@/sub-package2/components/axb-checkbox/axb-checkbox.vue'
	export default {
		components: {
			axbCheckBox
		},
		data() {
			return {
				zoneId: uni.getStorageSync("zoneInfo").id,
				// 当前租户id
				enterpriseId: uni.getStorageSync("userInfo").enterpriseId,
				// 底部按钮
				meetingRoomTabbar: [
					{
						pagePath: "/sub-package2/pages/home/meetingRoom/index",
						iconPath: "http://yuanzhoulvwego.com/wp-content/uploads/static/home/meetingRoom/huiyishiyuyue.png",
						text: "会议室预约",
					},
					{
						pagePath: "/sub-package2/pages/home/meetingRoom/record",
						iconPath: "http://yuanzhoulvwego.com/wp-content/uploads/static/home/meetingRoom/yuyuejilu2.png",
						text: "预约记录",
					}
				],
				investmentIsOpen: uni.getStorageSync('userInfo').investmentIsOpen,
				// 打开城市选择框
				showAddress: false,
				// 选中的城市
				location: {},
				// 城市列表
				addressCityList: [],
				// 区域列表
				addressList: [],
				// 会议室列表
				dataList: [],
				// tab标题的滚动条位置
				scrollTop: 0,
				// 区域 左边菜单的高度
				menuHeight: 0,
				// 区域 左边菜单item的高度
				menuItemHeight: 0,
				// 预设当前区域项的值
				addressCurrent: 0,
				dropdownActive: [0, '', ''],
				formDropdown: {
					// 容纳人数区间
					galleryfulSearch: {},
					// 价格区间
					priceSearch: {}
				},
				// 容纳人数是否按确认
				galleryfulFlag: false,
				// 容纳人数的key值
				galleryfulKey: '',
				// 容纳人数区间(用于展示在栏上)
				galleryfulSearch: {},
				// 搜索过的容纳人数列表
				galleryfulSearchList: [],
				// 价格是否按确认
				priceFlag: false,
				// 价格的key值
				priceKey: '',
				// 价格区间(用于点击其他地方关闭下拉框，还是原来数据)
				priceSearch: {},
				// 价格选择（按小时、按天）
				priceStatus: '1',
				// 搜索过的价格列表
				priceSearchList: [],
				// 下拉菜单 选择的数据
				selectData: [],
				// 选中的日期
				value: this.$u.timeFormat(day,"yyyy-mm-dd")
			}
		},
		onLoad() {
			if(uni.getStorageSync('userInfo').enterpriseId === 0) {
				// 加载出城市列表
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
				// 赋值城市列表
				this.$enum.getByCity((res) => {
					this.addressList = res
				})
			}
			// 游客选择园区后，进入可看到选择的园区会议室信息
			if (uni.getStorageSync('zoneInfo') && uni.getStorageSync('userInfo').enterpriseId === 0) {
				this.$set(this.selectData, 0, uni.getStorageSync('zoneInfo'))
				this.location = { province: uni.getStorageSync('zoneInfo').province, city: uni.getStorageSync('zoneInfo').city }
				uni.setStorageSync('location', this.location);
			} else {
				this.location = uni.getStorageSync('location')
			}
			// 看看是否本地存在搜索过的容纳人数
			this.galleryfulSearchList = uni.getStorageSync('galleryfulSearchList') || []
			// 看看是否本地存在搜索过的价格
			this.priceSearchList = uni.getStorageSync('priceSearchList') || []
		},
		onShow() {
			this.$nextTick(() => {
				this.$refs.paging.reload();
			})
		},
		methods: {
			// 选择当前的城市
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
			// 加载会议室列表，并赋值
			getInfo(pageNo, pageSize) {
				let params = {
					currPage: pageNo,
					pageSize: pageSize
				}
				if(this.zoneId > 0) params.zoneId = this.zoneId
				// 游客 有选择园区，才赋值
				if (this.selectData.length) params.zoneId = this.selectData[0].id
				// 有最少最多人数，才能赋值
				if (this.formDropdown.galleryfulSearch.minimumOccupancy && this.formDropdown.galleryfulSearch.maximumCapacity) {
					params = this.$u.deepMerge(params, this.formDropdown.galleryfulSearch)
				}
				// 有最小最大价格，才能赋值
				if (this.formDropdown.priceSearch.priceL && this.formDropdown.priceSearch.priceH) {
					params.priceStatus = this.priceStatus
					params = this.$u.deepMerge(params, this.formDropdown.priceSearch)
				}
				this.$api('meetingRoom.getMeetingRoomList', params, false).then(res => {
					if (res.code == 200) {
						this.$refs.paging.complete(res.data.list);
					} else {
						this.$refs.paging.complete(false);
					}
			
				}).catch((e) => {
					this.$refs.paging.complete(false);
				});
			},
			// 返回到首页
			customBack() {
				uni.switchTab({ url: '/pages/index/index'})
			},
			// 点击左边的栏目切换
			async swichMenu(index) {
				if (index == this.addressCurrent) return;
				this.addressCurrent = index;
				// 如果为0，意味着尚未初始化
				if (this.menuHeight == 0 || this.menuItemHeight == 0) {
					// 获取区域左边元素的高度
					await this.getElRect('menu-scroll-view', 'menuHeight');
					// 获取区域右边元素的高度
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
			},
			// 选择园区
			clickZone(item, index1, index) {
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
				this.$nextTick(() => {
					this.$refs.paging.reload();
					this.$refs.floorDropdown.close();
				})
			},
			// 点击曾经的容纳人数区间
			galleryfulSearchRadioChange(value, index) {
				this.formDropdown.galleryfulSearch = this.$u.deepClone(value) || {}
			},
			// 点击曾经的价格区间
			priceSearchRadioChange(value, index) {
				this.formDropdown.priceSearch = this.$u.deepClone(value) || {}
			},
			// 重置
			resetDropdown(type) {
				switch (type) {
					case 1:
						this.formDropdown.galleryfulSearch = {}
						this.galleryfulSearchList = this.galleryfulSearchList.map((item) => {
							item.checked = false
							return item
						})
						this.galleryfulSearch = {}
						break;
					case 2:
						this.formDropdown.priceSearch = {}
						this.priceSearchList = this.priceSearchList.map((item) => {
							item.checked = false
							return item
						})
						this.priceSearch = {}
						break;
					default:
						break;
				}
			
			},
			// 容纳人数/价格 确定
			confirmDropdown(type) {
				// 深拷贝
				let formDropdown = this.$u.deepClone(this.formDropdown);
				switch (type) {
					case 'galleryful':
						if (Object.keys(formDropdown.galleryfulSearch).length === 0 || (!formDropdown.galleryfulSearch
								.minimumOccupancy && !formDropdown.galleryfulSearch.maximumCapacityc)) {
							break
						}
						if (!formDropdown.galleryfulSearch.minimumOccupancy && formDropdown.galleryfulSearch.maximumCapacity) {
							uni.showToast({
								title: '请输入最少人数',
								icon: 'none'
							})
							return
						}
						if (!formDropdown.galleryfulSearch.maximumCapacity && formDropdown.galleryfulSearch.minimumOccupancy) {
							uni.showToast({
								title: '请输入最多人数',
								icon: 'none'
							})
							return
						}
						if (+formDropdown.galleryfulSearch.maximumCapacity < +formDropdown.galleryfulSearch.minimumOccupancy) {
							uni.showToast({
								title: '最多人数不能小与最少人数',
								icon: 'none'
							})
							return
						}
						let galleryfulSearchObj = {
							value: formDropdown.galleryfulSearch,
							label: formDropdown.galleryfulSearch.minimumOccupancy + '-' + formDropdown
								.galleryfulSearch.maximumCapacity,
							checked: false
						};
						// 检测单选数组中是否已存在确认后输入框中输入的值，如果存在则删除
						this.galleryfulSearchList.forEach((item, index) => {
							if (Object.entries(galleryfulSearchObj.value).toString() === Object.entries(
									item.value).toString() && galleryfulSearchObj.label == item.label) {
			
								this.galleryfulSearchList.splice(index, 1)
							} else {
								item.checked = false
							}
						})
						// 检测单选数组中长度是否大于5，如果大于5则删除最后一个数据
						if(this.galleryfulSearchList.length>5){
							this.$delete(this.galleryfulSearchList,this.galleryfulSearchList.length-1)
						}
						this.galleryfulSearch = this.formDropdown.galleryfulSearch
						this.galleryfulSearchList.unshift(galleryfulSearchObj)
						uni.setStorageSync('galleryfulSearchList', this.galleryfulSearchList)
						this.$set(this.galleryfulSearchList[0], 'checked', true)
						// 确认标识
						this.galleryfulFlag = true
						break;
					case 'price':
						if (Object.keys(formDropdown.priceSearch).length === 0 || (!formDropdown.priceSearch.priceL &&
							!formDropdown.priceSearch.priceH)) {
							break
						}
						if (!formDropdown.priceSearch.priceL && formDropdown.priceSearch.priceH) {
							uni.showToast({
								title: '请输入最小价格',
								icon: 'none'
							})
							return
						}
						if (!formDropdown.priceSearch.priceH && formDropdown.priceSearch.priceL) {
							uni.showToast({
								title: '请输入最大价格',
								icon: 'none'
							})
							return
						}
						if (+formDropdown.priceSearch.priceH < +formDropdown.priceSearch.priceL) {
							uni.showToast({
								title: '最大价格不能小与最小价格',
								icon: 'none'
							})
							return
						}
						let priceSearchObj = {
							value: formDropdown.priceSearch,
							label: formDropdown.priceSearch.priceL + '-' + formDropdown.priceSearch.priceH,
							checked: false
						};
						this.priceSearchList.forEach((item, index) => {
							if (Object.entries(priceSearchObj.value).toString() === Object.entries(
								item.value).toString() && priceSearchObj.label == item.label) {
								this.priceSearchList.splice(index, 1)
							} else {
								item.checked = false
							}
						})
						if(this.priceSearchList.length>5){
							this.$delete(this.priceSearchList,this.priceSearchList.length-1)
						}
						this.priceSearchList.unshift(priceSearchObj)
						uni.setStorageSync('priceSearchList', this.priceSearchList)
						this.$set(this.priceSearchList[0], 'checked', true)
						// 确认标识
						this.priceFlag = true
						// 赋值于选择（小时、半天、一天）
						oldPrice = this.priceStatus
						break;
					default:
						break;
				}
				this.$refs.paging.reload();
				this.$refs.floorDropdown.close();
			},
			// 容纳区间 赋值之前的数据
			galleryfulSearchMetch() {
				// 容纳区间有值 赋值之前的数据
				if (this.galleryfulSearch.minimumOccupancy && this.galleryfulSearch.maximumCapacity) {
					this.formDropdown.galleryfulSearch = this.galleryfulSearch
					this.$set(this.galleryfulSearchList[0], 'checked', true)
				} else {
					this.formDropdown.galleryfulSearch = {}
					this.galleryfulSearchList.forEach(item => item.checked = false)
				}
				// 要有随机的key，才能刷新值
				this.galleryfulKey = Math.floor(Math.random()*10 + 1)
			},
			// 价格 赋值之前的数据
			priceSearchMetch() {
				// 价格有值 赋值之前的数据
				if (this.priceSearch.priceH && this.priceSearch.priceL) {
					this.formDropdown.priceSearch = this.priceSearch
					this.$set(this.priceSearchList[0], 'checked', true)
				} else {
					this.formDropdown.priceSearch = {}
					this.priceSearchList.forEach(item => item.checked = false)
				}
				// 要有随机的key，才能刷新值
				this.priceKey = Math.floor(Math.random()*10 + 1)
			},
			// 打开下拉框
			dropdownOpen(index) {
				// 游客
				if (!this.enterpriseId) {
					// 0区域 1容纳人数 2价格
					if (index === 0) {
						// 赋值价格之前的值
						this.priceSearchMetch()
						// 赋值容纳人数之前的值
						this.galleryfulSearchMetch()
					} else if (index == 1) {
						// 容纳人数
						this.galleryfulSearch = this.$u.deepMerge(this.galleryfulSearch, this.formDropdown.galleryfulSearch)
						// 赋值价格之前的值
						this.priceSearchMetch()
					} else if (index == 2) {
						// 赋值容纳人数之前的值
						this.galleryfulSearchMetch()
						// 价格计算（小时、半天、一天）
						this.priceStatus = oldPrice
						// 价格
						this.priceSearch = this.$u.deepMerge(this.priceSearch, this.formDropdown.priceSearch)
					}
				} else {
					// 租户
					// 容纳人数
					this.galleryfulSearch = this.$u.deepMerge(this.galleryfulSearch, this.formDropdown.galleryfulSearch)
				}
			},
			// 关闭下拉框
			close(index) {
				// 游客
				if (!this.enterpriseId) {
					// 0区域 1容纳人数 2价格
					if (index == 0) {
						// 赋值容纳人数之前的值
						this.galleryfulSearchMetch()
						// 赋值价格之前的值
						this.priceSearchMetch()
					} else if (index == 1) {
						// 容纳人数 没有按确认
						if (!this.galleryfulFlag) {
							// 赋值容纳人数之前的值
							this.galleryfulSearchMetch()
						}
					} else if (index == 2) {
						// 价格 没有按确认
						if (!this.priceFlag) {
							// 赋值价格之前的值
							this.priceSearchMetch()
						}
					}
				} else {
					// 租户
					// 容纳人数 没有按确认
					if (!this.galleryfulFlag) {
						// 赋值容纳人数之前的值
						this.galleryfulSearchMetch()
					}
				}
				// 容纳人数的确认标识关闭
				this.galleryfulFlag = false
				this.priceFlag = false
				this.$refs.paging.updatePageScrollTopHeight()
			},
			// 改变选择的日期
			change(e) {
				this.value = e.fulldate
				this.$refs.paging.reload();
			},
			// 跳转到会议室详情
			goMeetingDetails(item) {
				this.$Router.push({
					path: '/pages/home/meetingRoom/meetingDetails',
					query: { dataTime: this.value, ...item }
				})
			},
			// 跳转到预约记录页面
			goPaths(item) {
				if (item.text === '预约记录') {
					this.$Router.push({
						path: item.pagePath
					})
				}
			}
		}
	}
</script>
<style>
	page {
		background: #F1F2F3;
	}
</style>
<style scoped lang="scss">
	.card-box {
		padding: 0upx 20upx 0upx 20upx;
	
		.card {
			background: #fff;
			border-radius: 15upx;
			margin-bottom: 20upx;
			padding: 28upx 20upx 22upx 26upx;
			display: flex;
			justify-content: space-between;
	
			.card-left {}
	
			.card-center {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: space-around;
	
				.card-center-title {
					font-weight: bold;
					font-size: 30upx;
				}
	
				.card-center-content {
					color: $uni-text-color-prompt;
				}
			}
	
			.card-right {
				display: flex;
				align-items: center;
				.card-right-box {
					width: 120upx;
					height: 60upx;
					line-height: 60upx;
					color: #ffffff;
					border-radius: 6upx;
					text-align: center;
				}
				.stateBut {
					background: #3E76F4;
				}

				.fullBut {
					background: #CCCCCC;
				}
			}
		}
	}
	.content-box {
		background: #fff;
		height: 500upx;
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
	.meeting-bottom {
		height: 98upx;
		background: #FFFFFF;
		.meeting-bottom_image {
			position: relative;
			left: 50%;
			transform: translateX(-50%);
		}
		.meeting-bottom-text {
			color: #666666;
		}
		.meeting-bottom-ctext {
			color: #3E76F4
		}
	}
</style>
