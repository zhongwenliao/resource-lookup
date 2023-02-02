<template>
	<view class="list-view house-list-view">
		<view class="search-view">
			<form action="" class="search-form">
				<view class="filter-view">
					<picker class="filter-picker" mode="selector" @change="communityChange" :range="communityList">
						<text class="input-text" v-if="firmwareCommunityId">{{ communityName }}</text>
						<text class="input-text" v-else>{{ communityList.length > 0 ? communityList[index] : '' }}</text>
						<image class="filter-view-down-image" src="http://www.thinmoo.com/wp-content/uploads/2020/10/down.png"></image>
					</picker>
				</view>
				<view class="search-warp">
					<view class="search-box" @tap.stop>
						<input
							type="text"
							confirm-type="search"
							@confirm="onSearchHouse"
							class="search"
							v-model="keywordSearch"
							:placeholder="`${manypage['search-placeholder']}` || '搜索'"
						/>
						<image v-show="keywordSearch" @tap="clearSearch" src="/static/img/search-del.png" mode=""></image>
					</view>
				</view>
			</form>
		</view>
		<view v-if="isLoad"></view>
		<view class="my-house-view-list" v-else-if="houseList.length > 0">
			<view class="my-house-view-list-item" v-for="(house, index) in houseList" :key="index">
				<view class="list-item-building-house-info">
					<text class="list-item-building-house-name-text">{{ house.communityName }}/{{ house.buildingName }}/{{ house.name }}</text>
					<!-- #ifdef MP-WEIXIN || MP-ALIPAY -->
					<view class="list-item-building-house-people-text" :data-communityId="house.communityId" v-if="isOpenWxminiUploadPhoto">
						<view class="green-fg-color" v-if="house.faceImage" @click="goToFaceList(house)">{{ myhouse['face-registered'] || '人脸已登记' }}</view>
						<text v-else class="primary" @click="goToPicture(house)">{{ myhouse['face-register'] || '登记人脸' }}</text>
					</view>
					<!-- #endif -->
					<!-- #ifndef MP-WEIXIN || MP-ALIPAY -->
					<view class="list-item-building-house-people-text" :data-communityId="house.communityId">
						<view v-if="house.faceImage" class="green-fg-color" @click="goToFaceList(house)">{{ myhouse['face-registered'] || '人脸已登记' }}</view>
						<text v-else class="primary" @click="goToPicture(house)">{{ myhouse['face-register'] || '登记人脸' }}</text>
					</view>
					<!-- #endif -->
				</view>
				<view class="list-item-community-location">
					<text class="list-item-community-location-text">{{ house.cityName }}</text>
				</view>
				<!-- #ifdef MP-WEIXIN || MP-ALIPAY -->
				<view class="list-item-tenant-operation" v-if="isOpenWxminiUploadPhoto">
					<view class="left">
						<span style="color: #AAAAAA;">{{ myhouse['identity'] || '身份类型' }}：</span>
						<span class="identity-tab">{{ identity[identityType[house.identityType == undefined ? 0 : house.identityType]] }}</span>
					</view>
					<view class="list-item-look-over-tenant-view">
						<navigator
							:url="'/pages/look-over-tenant/look-over-tenant?house=' + JSON.stringify(house)"
							v-if="house.identityType === 1 || (house.industryType === 3 && house.identityType === 3)"
						>
							<button class="list-item-button list-item-look-over-button" hover-class="list-item-hover-button">
								<image class="list-item-img list-item-look-over-tenant-img" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/my-house/check-household.png"></image>
								<text class="list-item-text list-item-look-over-tenant-text green-fg-color">{{ myhouse['household'] || '房屋成员' }}</text>
							</button>
						</navigator>
					</view>
				</view>
				<!-- #endif -->
				<!-- #ifndef MP-WEIXIN || MP-ALIPAY -->
				<view class="list-item-tenant-operation">
					<view class="left">
						<span style="color: #AAAAAA;">{{ myhouse['identity'] || '身份类型' }}：</span>
						<span class="identity-tab">{{ identity[identityType[house.identityType == undefined ? 0 : house.identityType]] }}</span>
					</view>
					<view class="list-item-look-over-tenant-view">
						<navigator
							:url="'/pages/look-over-tenant/look-over-tenant?house=' + JSON.stringify(house)"
							v-if="house.identityType === 1 || (house.industryType === 3 && house.identityType === 3)"
						>
							<button class="list-item-button list-item-look-over-button" hover-class="list-item-hover-button">
								<image class="list-item-img list-item-look-over-tenant-img" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/my-house/check-household.png"></image>
								<text class="list-item-text list-item-look-over-tenant-text green-fg-color">{{ myhouse['household'] || '房屋成员' }}</text>
							</button>
						</navigator>
					</view>
				</view>
				<!-- #endif -->
				<view class="list-item-tenant-operation" style="border-top: 1upx dashed #EEEEEE;" v-if="house.industryType !== 3">
					<view class="left" style="color: #AAAAAA;">{{ i18nLookOverTenant['answer-call'] || '接听呼叫' }}</view>
					<view class="list-item-look-over-tenant-view">
						<text>{{ i18nLookOverTenant['close'] || '关' }}</text>
						<switch 
							style="transform:scale(0.6)"
							:color="variables.primaryBgColor"
							:checked="house.isSipCallAnswer == 1" 
							@change="answerSwitchChange($event, house.roomEmpRelId)" 
						/>
						<text>{{ i18nLookOverTenant['open'] || '开' }}</text>
					</view>
				</view>
				<view class="list-item-tenant-operation" style="border-top: 1upx dashed #EEEEEE;" v-else>
					<view class="left" style="color: #AAAAAA;">{{ i18nLookOverTenant['rest-battery'] || '剩余电量' }}</view>
					<view class="list-item-look-over-tenant-view">
						<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/static/img/battery/battery-green.png" v-if="house.lockRemainingBattery > 50"></image>
						<image
							src="https://file.yuanzhoulvwego.com/prod/uploadFiles/static/img/battery/battery-yellow.png"
							v-else-if="house.lockRemainingBattery > 20 && house.lockRemainingBattery <= 50"
						></image>
						<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/static/img/battery/battery-red.png" v-else-if="house.lockRemainingBattery <= 20"></image>
						{{ house.lockRemainingBattery === undefined ? i18nLookOverTenant['unknown'] || '未知' : house.lockRemainingBattery + '%' }}
					</view>
				</view>
				<!-- #ifdef APP-PLUS || H5 -->
				<view class="list-item-tenant-operation" style="border-top: 1upx dashed #EEEEEE; padding-top: 16upx;" v-if="house.category == 9">
					<view class="left list-item-look-over-tenant-view">
						<view v-if="house.isSupportFingerprint" class="">
							<view class="operation-btn" @click="clickSyncFingerprint(house)" v-if="house.fingerprintSyncMode === 0 && isAndroid">
								{{ myhouse['sync-fingerprint'] || '同步指纹到设备' }}
							</view>
							<view class="operation-btn" @click="addFingerprint(house)" v-else-if="house.fingerprintSyncMode === 1">
								{{ myhouse['add_fingerprint'] || '添加指纹' }}
							</view>
						</view>
						<view class="operation-btn" @click="clickSyncCard(house)" v-if="house.isSupportCard">{{ myhouse['sync-cardNo'] || '同步卡号到设备' }}</view>
						<!-- <view class="operation-btn updates"  @click="clickUpEquipment(house)"  v-if="house.isBindDoorLock ">{{myhouse["up-equipment"]||"升级设备"}}</view> -->
						<view :class="['operation-btn', house.devSn === devSn ? updates : '']" @click="clickUpEquipment(house)" v-if="house.isBindDoorLock">
							{{ myhouse['up-equipment'] || '升级设备' }}
						</view>
					</view>
				</view>
				<!-- #endif -->

				<!-- #ifdef APP-PLUS || H5 -->
				<view class="list-item-tenant-operation" style="border-top: 1upx dashed #EEEEEE; padding-top: 16upx;" v-if="house.category == 9">
					<view class="left list-item-look-over-tenant-view">
						<view class="operation-btn" @click="synchroTime(house)">{{ manage['sync-time'] || '同步时间' }}</view>
					</view>
				</view>
				<!-- #endif -->
			</view>
			<view class="loading">{{ loadingText }}</view>
		</view>
		<view v-else class="no-data-view">{{ myhouse['no-house-data'] || '暂无房屋数据' }}</view>

		<view class="bottom-btn-view add-house-view" v-if="currentLanguage.indexOf('cn') > -1 || currentLanguage.indexOf('tw') > -1">
			<button type="primary" class="left primary btn" @click="addHouse">{{ myhouse['add-house'] || '添加房屋' }}</button>
			<button type="primary" class="right primary btn" @click="checkRecords">{{ myhouse['apply-record'] || '申请记录' }}</button>
		</view>
	</view>
</template>

<script>
	// 引入scss文件
	import variables from "@/common/css/variables.scss";
var param = {};
var currPage = 1;
var communityIsChange = false;
export default {
	data() {
		return {
			identityType: this.$getIdentityTypeObj(),
			houseList: [],
			permAppTenementAuthorize: 0,
			communityId: '',
			keywordSearch: '',
			communityList: [],
			loadingText: '',
			isLoad: true,
			communityIndex: 0,
			title: '',
			allHouseList: [],
			communityIdList: [],
			index: 0,
			isOpenWxminiUploadPhoto: this.$getUserInfo().isOpenWxminiUploadPhoto || false,
			isAndroid: uni.getSystemInfoSync().platform === 'android',
			currentLanguage: this.$getLanguageLowerCase(),
			copyHouseList: [], // 用于保存过滤小区，当前小区获取的总房屋列表
			// searchHouseVal: "",
			pageid: '',
			devSn: '',
			communityName: '',
			firmwareCommunityId: '',
			variables
		};
	},
	components: {
		// uniNavBar,
		// uniIcons
	},
	computed: {
		manypage() {
			return this.$t('manypage');
		},
		identity() {
			return this.$t('identity');
		},
		myhouse() {
			return this.$t('house');
		},
		i18nLookOverTenant() {
			return this.$t('look-over-tenant');
		},
		manage() {
			return this.$t('manage');
		},
		common() {
			return this.$t('common');
		}
	},
	// 监听触底
	onReachBottom() {
		this.getHouseList(this.permAppTenementAuthorize);
	},

	onLoad(options) {
		this.initDataObj = options;
		this.pageid = options.pageid;
		if (options.firmwareCommunityId) {
			this.communityId = options.firmwareCommunityId;
			this.firmwareCommunityId = options.firmwareCommunityId;
			this.devSn = options.devSn;
			// console.log("下个页面",options.firmwareCommunityId,options.devSn)
		}
	},

	onUnload() {
		this.$showLog('我的房屋页面被卸载');
	},
	onShow() {
		this.getCommunityList();
		currPage = 1;
		this.index = 0;
		this.houseList = [];
		this.loadingText = this.myhouse['loading'] || '加载中...';
		this.initData(this.initDataObj);
		this.getHouseList(this.permAppTenementAuthorize);
		// 只有固件需要升级时才会调用这个方法
		if (this.pageid === 'update') {
			setTimeout(() => {
				this.jump();
			}, 1000);
		}
	},
	methods: {
		jump() {
			uni.createSelectorQuery()
				.select('.updates')
				.boundingClientRect(data => {
					// 需要跳转到的节点
					uni.createSelectorQuery()
						.select('.house-list-view')
						.boundingClientRect(res => {
							// 当前页面最外层节点
							console.log(data, res);
							// 可以输出data、res 查看信息
							uni.pageScrollTo({
								scrollTop: data.top - res.top,
								duration: 0
							});
						})
						.exec();
				})
				.exec();
		},
		// 房屋查询
		onSearchHouse() {
			currPage = 1;
			this.houseList = [];
			this.getHouseList(this.permAppTenementAuthorize);
			// if (this.searchHouseVal) {
			// 	this.houseList = this.houseList.filter((houseObj) => {
			// 		let houseName = `${houseObj.communityName}/${houseObj.buildingName}/${houseObj.name}`;
			// 		console.log("houseName", houseName);
			// 		console.log("houseName", houseName);
			// 		if (this.searchHouseVal) {
			// 			if (houseName.indexOf(this.searchHouseVal) > -1) {
			// 				return houseObj;
			// 			}
			// 		} else {
			// 			return houseObj;
			// 		}
			// 	});
			// } else {
			// 	this.houseList = this.copyHouseList;
			// }
		},

		// 清空房屋搜索
		clearSearch() {
			this.keywordSearch = '';
			this.onSearchHouse();
		},
		addFingerprint(house) {
			uni.navigateTo({
				url: '../../../sub-package/pages/household-list/household-info?memberObj=' + JSON.stringify(house) + '&tenant=1'
			});
		},
		// 获取房屋列表
		getHouseList(empType, formData) {
			var url = '/persEmpHousehold/app/getTenementRoomList';
			if (empType == 1) {
				url = '/persEmpHousehold/app/getOwnerRoomList';
			}
			var data = {
				communityId: this.communityId, //小区id
				currPage: currPage,
				isShowLoad: true,
				pageSize: 10,
				keywordSearch: this.keywordSearch
			};
			this.$req.request({
				url: url,
				data: data,
				isShowLoading: true,
				success: res => {
					currPage++;
					if (this.isLoad) this.isLoad = false;
					var list = res.data.list;
					if (this.firmwareCommunityId) {
						this.communityName = list[0].communityName;
					}
					this.allHouseList = res.data.list;
					if (communityIsChange) {
						this.houseList = [];
						communityIsChange = false;
					}
					this.houseList = this.houseList.concat(list);
					this.copyHouseList = this.houseList;
					// this.onSearchHouse();
					// if(list.length < 100) {
					// 	this.loadingText = this.myhouse["no-more"] || "没有更多数据了";
					// 	return;
					// }
					if (list.length < 10) {
						this.loadingText = this.myhouse['no-more'] || '没有更多数据了';
						return;
					}
				}
			});
		},

		// 初始化数据
		initData(options) {
			param = {};
			currPage = 1;
			communityIsChange = false;
			this.permAppTenementAuthorize = options.type;
			// var title = options.type == 1 ? "房屋管理" : "我的房屋";
			uni.setNavigationBarTitle({
				title: this.myhouse['my-house'] || '我的房屋'
			});
		},

		// 添加房屋
		addHouse() {
			uni.navigateTo({
				url: '../authentication/choose-room'
			});
		},

		//查看申请记录
		checkRecords() {
			uni.navigateTo({
				url: 'application-records'
			});
		},

		// 返回，该方法用于自定义导航栏
		goBack() {
			uni.navigateBack();
		},

		// 切换小区onchange
		communityChange(e) {
			let index = e.target.value;
			let communityIsChange = true;
			let communityId = this.communityIdList[index];
			// this.keywordSearch = this.communityList[index];
			this.communityId = communityId;
			this.index = index;
			let allHouseList = this.allHouseList;
			this.houseList = [];
			// this.searchHouseVal = "";
			currPage = 1;
			this.getHouseList(this.permAppTenementAuthorize);
		},

		// 获取小区列表
		getCommunityList() {
			let _this = this;
			this.$req.request({
				url: '/appUser/app/getCommunityList',
				data: {
					isShowLoad: false
				},
				success: res => {
					let data = res.data;
					if (data.length > 1) {
						data.unshift({
							id: 0,
							name: _this.myhouse['select-community'] || '所有小区',
							cityName: ''
						});
					} else if (data.length === 0) {
						data.push({
							id: '',
							name: _this.myhouse['no-community'] || '暂无绑定小区',
							cityName: ''
						});
					}

					_this.communityList = data.map(item => {
						return item.name;
					});
					_this.communityIdList = data.map(item => {
						return item.id;
					});
				}
			});
		},

		//跳转到添加照片页面
		goToPicture(house) {
			// console.print("当前房屋信息", house);
			// var communityId = e.currentTarget.dataset.communityid;
			uni.navigateTo({
				url: 'personal-picture?house=' + JSON.stringify(house)
			});
		},

		//跳转到人脸照片列表页面
		goToFaceList(house) {
			uni.navigateTo({
				url: 'face-list?house=' + JSON.stringify(house)
			});
		},

		//跳转到升级设备
		clickUpEquipment(house) {
			uni.navigateTo({
				url: '/sub-package/pages/dev-manage/bt-version-upgrade?devObj=' + JSON.stringify(house) + '&source=' + '1'
			});
		},

		//接听呼叫开关值改变,id为房间关联id
		answerSwitchChange(e, id) {
			let changeValue = e.target.value;
			this.$req.request({
				url: '/sqRoomEmpRel/app/updateSipCallAnswer',
				data: {
					id: id,
					status: Number(changeValue)
				},
				success: res => {
					console.log('接听呼叫开关是否开启值---', changeValue);
				}
			});
		},

		// 点击同步卡数据
		clickSyncCard(house) {
			uni.showModal({
				content: this.myhouse['if-sync-card'] || '是否同步卡数据到设备？',
				confirm: this.myhouse['yes'] || '是',
				cancel: this.myhouse['no'] || '否',
				success: res => {
					if (res.confirm) {
						this.getNeedAddCard(house);
					}
				}
			});
		},

		//从服务器获取卡数据
		getNeedAddCard(houseObj) {
			this.$req.request({
				url: '/persEmpHousehold/app/getSyncCardDataList',
				data: {
					roomId: houseObj.id
				},
				success: res => {
					if (res.code == 0) {
						let cardDataStr = res.data;
						console.log('---获取要添加的卡数据---', cardDataStr);
						this.$sdkUtil.writeCard(houseObj, cardDataStr, false, result => {
							this.$showToast(this.myhouse['sync-card-success'] || '同步卡数据到设备成功');
						});
					}
				}
			});
		},

		// 点击同步指纹数据到设备
		clickSyncFingerprint(house) {
			uni.showModal({
				content: this.myhouse['if-sync-fingerprint'] || '是否同步指纹数据到设备？',
				confirm: this.myhouse['yes'] || '是',
				cancel: this.myhouse['yes'] || '否',
				success: res => {
					if (res.confirm) {
						this.$showLoading();
						this.getNeedAddFingerprint(house);
					}
				}
			});
		},
		// 同步设备时间
		synchroTime(houseObj) {
			console.log(houseObj);
			var _this = this;
			let timeStr = new Date().pattern('yyyy-MM-dd HH:mm:ss');
			timeStr = timeStr.replace(/:|-| /g, '');
			let curDay = new Date().getDay();
			timeStr += curDay == 0 ? '07' : '0' + curDay;
			uni.showModal({
				title: _this.manage['sync-time'],
				content: _this.manage['ensure-time'] || '请确保您的手机时间准确',
				confirmText: _this.manage['sync'] || '同步',
				cancelText: _this.common['cancel'] || '取消',
				success: function(res) {
					if (res.confirm) {
						_this.$sdkUtil.syncDeviceTime(houseObj, timeStr);
					}
				}
			});
		},
		//从服务器请求需要添加的指纹
		getNeedAddFingerprint(houseObj) {
			this.$req.request({
				url: '/persEmpHousehold/app/getSyncFingerprintDataList',
				data: {
					roomId: houseObj.id
				},
				success: res => {
					if (res.code == 0) {
						//先执行清空所有指纹数据，再添加指纹
						let fingerprintsList = res.data;
						this.$showLoading(this.myhouse['synching'] || '正在同步...', false);
						for (let i in fingerprintsList) {
							fingerprintsList[i].identity = JSON.stringify(fingerprintsList[i].identity);
						}
						console.log('---需要同步的指纹数据---', JSON.stringify(fingerprintsList));
						this.$sdkUtil.syncFingerPrintToDevice(houseObj, fingerprintsList, false, result => {
							this.$hideLoading();
							this.$showToast(this.myhouse['sync-fingerprint-success'] || '同步指纹数据到设备成功');
						});
					}
				}
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.house-list-view {
	width: 100%;
}
.house-list-view .search-view {
	height: 180upx;
}
.search-view .filter-view {
	height: 60upx;
}
.search-view .search-warp {
	padding: 30upx 0 0;
}
.filter-view-down-image{
	width: 40upx;
	height: 30upx;
	position: absolute;
	right: 40upx;
	top: 35upx;
}
.search-warp .search-box {
	width: 100%;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #ffffff;
	border-radius: 30rpx;
}
.search-box .search {
	width: 88%;
	text-align: center;
	font-size: 28rpx;
}

.search-box image{
	width: 30upx;
	height: 30upx;
	/* #ifdef MP-ALIPAY */
	display: none;
	/* #endif */
	
}

.my-house-view-list {
	width: 100%;
	padding-top: 180upx;
	background: #eeeeee;
}
.my-house-view-list-item {
	background: #ffffff;
	padding: 30upx;
	padding-bottom: 25upx;
	margin: 20upx 10upx;
	border-radius: 10upx;
}
.list-item-community-location-text {
	color: #aaaaaa;
}

.list-item-building-house-info {
	overflow: hidden;
}
.list-item-building-house-name-text {
	float: left;
	width: 70%;
}

.list-item-building-house-people-text {
	float: right;
	width: 30%;
	text-align: right;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.list-item-tenant-operation {
	overflow: hidden;
	align-items: center;
	justify-content: space-between;
	display: flex;
}
.identity-tab {
	color: #ffffff;
	background-color: $theme-bg-color;
	padding: 4upx 10upx;
	border-radius: 50upx;
	font-size: 24upx;
}
.list-item-add-tenant-view,
.list-item-look-over-tenant-view {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
}
.operation-btn {
	padding: 0px 12px;
	margin-bottom: 5upx;
	margin-right: 16upx;
	color: rgb(30, 144, 255);
	float: left;
	border-radius: 50px;
	font-size: 12px;
	border: 1px solid #1e90ff;
}
.list-item-button {
	border: none;
	line-hieght: 1;
	font-size: 28upx;
	border-radius: 0;
	background: #ffffff;
	padding-right: 0upx;
	}
	.list-item-button .list-item-hover-button {
		background: #cccccc;
	}
.list-item-button::after{
	border: none;
	border-radius: 0;
}
.list-item-button .list-item-img {
	width: 26upx;
	height: 26upx;
}

.list-item-button .list-item-text {
	margin-left: 10upx;
	color: #aaaaaa;
}
.list-item-add-tenant-view image,
.list-item-look-over-tenant-view image {
	width: 40upx;
	height: 40upx;
	margin-right: 8upx;
}

.list-item-add-tenant-view {
	float: left;
}

.list-item-look-over-tenant-view {
	float: right;
	vertical-align: middle;
}
.list-item-look-over-tenant-img {
	width: 26upx;
	height: 20upx;
}

.loading {
	margin-bottom: 100upx;
	text-align: center;
}

.no-data-view {
	height: calc(100% - 100upx);
}

.add-house-view .btn {
	width: 50%;
}
</style>
