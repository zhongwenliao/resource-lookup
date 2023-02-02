<template>
	<view class="list-view visit-list">
		<u-navbar class="navbar" title="访客地址" :border-bottom="false"></u-navbar>
		<view class="search-input">
			<u-search @change="filterDevice" placeholder="搜索" :show-action="false"
				v-model="doorName">
			</u-search>
		</view>
		<uni-tab :tab-list="tabList" :tabCur.sync="tabCur" tab-class="opening-record-view-tab" textFlex @change="tabChange"></uni-tab>
		<swiper :current="tabCur" class="swiper custom-swiper" @change="swiperChange" duration="300" :circular="true"
		 indicator-color="rgba(255,255,255,0)" indicator-active-color="rgba(255,255,255,0)">
			<!-- 按房屋地址 -->
			<swiper-item>
				<!-- <view class="search-input">
					<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/search.png" alt=""> -->
					<!-- <input type="text" :placeholder="`${vis['dev-search']}` || '请输入设备名称'" :value="doorName" @input="filterDevice"> -->
					<!-- <input type="text" :placeholder="'请输入房间名称'" :value="doorName" @input="filterDevice">
				</view> -->
			
				
				
				<view v-if="doorList !== null && doorList.length > 0" class="scroll-view">
					<view class="event-list-view">
						<ul>
							<li v-for="(door, index) in doorList" :key="index" @click="selectDoor(door)">
								{{ door.deviceInstallAddress }}/{{ door.name }}
							</li>
						</ul>
					</view>
				</view>
				
				<view v-else class="no-data-view">
					{{ vis["no-dev"] }}
				</view>
			</swiper-item>
			<!-- 按门禁 -->
			<swiper-item>
				<!-- <view class="search-input">
					<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/search.png" alt=""> -->
					<!-- <input type="text" :placeholder="`${vis['dev-search']}` || '请输入设备名称'" :value="doorName" @input="filterDevice"> -->
					<!-- <input type="text" :placeholder="`${vis['door-search']}` || '请输入门名称'" :value="doorName" @input="filterDevice">
				</view> -->
				<!-- <scroll-view scroll-y="true" v-if="doorList !== null && doorList.length > 0" class="scroll-view">
					<view class="event-list-view">
						<ul>
							<li v-for="(door, index) in doorList" :key="index" @click="selectDoor(door)">
								{{ door.communityName }}/{{ door.doorName }}
							</li>
						</ul>
					</view>
				</scroll-view> -->
				<view v-if="roomList !== null && roomList.length > 0" class="scroll-view">
					<view class="event-list-view">
						<ul>
							<li v-for="(room,index) in roomList" :key="index" @click="selectRoom(room)">
									{{ room.zoneName }}/{{ room.buildingName }}/{{ room.name }}
							</li>
						</ul>
					</view>
				</view>
				<view v-else class="no-data-view">
					{{ vis["no-room"] }}
				</view>
			
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tabCur: 0,
				// roomList: null,
				// doorList: null,
				roomList: [],
				doorList: [],
				tabList: [],
				allDoorList: [],
				doorName: ""
			}
		},
		computed: {
			vis() {
				return this.$t("vis")
			},
			title() {
				return this.$t("title")
			}
		},
		onReady() {
			console.log("ces1");
			this.$setTitle(this.title["vis-address"]);
		},
		onLoad(options) {
			console.log("ces1");
			this.tabList = [{
				name: this.vis["dev"]
				}, {
					name: '按地址'
				}]
			this.initData();
			// this.getRoomList();
			this.getAllDoorList();
		},
		methods: {
			//获取所有房屋列表
			getRoomList() {
				this.$api('zoneInfo.getListByZoneIdForUser').then(res => {
					console.log(res);
					if (res.code == 200) {
						this.roomList = res.data;
						this.allDoorList = res.data;
					}
				
				})
				// this.$req.request({ jgRoomInfo/app/getListByZoneIdForUser
				// 	url: "/sqRoom/app/getAllRooms",
				// 	data: {
				// 		communityId: this.$getUserInfo().currentCommunity.id
				// 	},
				// 	success: (res) => {
				// 		this.roomList = res.data;
				// 	}
				// })
			},

			//获取所有有权限设备
			getAllDoorList() {
				this.$api('equipment.getAppDevAuthorizeList').then(res => {
					console.log(res);
					if (res.code == 200) {
						this.doorList = res.data;
						this.allDoorList = res.data;
					}
				
				})
				// this.$req.request({
				// 	url: "/sqDoor/app/getAllDoorRole",
				// 	data: {
				// 		communityId: this.$getUserInfo().currentCommunity.id
				// 	},
				// 	success: (res) => {
				// 		this.doorList = res.data;
				// 		this.allDoorList = res.data;
				// 	}
				// })
			},

			initData() {
				this.tabCur = 0;
			},
			swiperChange(e) {
				let page = e.detail.current;
				this.tabCur = page;
				if (page == 1) {
					this.getRoomList();
				} else if (page == 0) {
					this.getAllDoorList();
				}
			},
			tabChange(index) {
				this.tabCur = index;
			},
			//选择房间
			selectRoom(room) {
				uni.debugLog("roomInfo", room)
				var param = {
					"roomId": room.id,
					// "name": room.zoneName + "/" + room.buildingName + "/" + room.name,
					"name": room.buildingName + "/" + room.name,
					"communityId": room.communityId
				};
				this.$onfire.fire("EventAddressChange", param);
				uni.navigateBack(1);
			},

			//选择门禁
			selectDoor(door) {
				var param = {
					"devSn": door.devSn,
					"name": door.name,
					"communityId": door.communityId
				}; 
				this.$onfire.fire("EventAddressChange", param);
				uni.navigateBack(1);
			},
			
			//过滤设备
			filterDevice(e) {
				// var doorName = e.detail.value;
				this.doorList = [];
				this.roomList = [];
				for(var i in this.allDoorList) {
					if(this.allDoorList[i].name.indexOf(this.doorName) > -1) {
						if (this.tabCur == 0) {
							this.roomList.push(this.allDoorList[i]);
						} else if (this.tabCur == 1) {
							this.doorList.push(this.allDoorList[i]);
						}
						
					}
				}
				
			}
		}
	}
</script>

<style lang="scss">
	page{
		display: flex;
		height: 100%;
	}
	.visit-list {
		border-top: 1px solid #DBDBDB;
		width: 100%;
		font-size: 30upx;
		background: #FFFFFF;
		.opening-record-view-tab {
			background: #FFFFFF;
			color: #333333;
			font-weight: bold;
			font-size: 34rpx;
		}

		.custom-swiper {
			height: calc(100% - 50px);
			// overflow: auto;
		}

		.opening-record-view-list {
			width: 100%;
		}

	}
	
	.search-input {
		padding: 0 40rpx 0 20rpx;
		// padding: 10upx 10%;
		// background: #eeeeee;
		// border: 1upx solid #EEEEEE;
		// border-radius: 10upx;
		// line-height: 40upx;
	}
	
	.search-input image {
		width: 40upx;
		height: 40upx;
		padding: 10upx;
		// background: #FFFFFF;
		display: inline-block;
		padding-right: 10upx;
	}
	
	.search-input input {
		width: 80%;
		padding: 10upx;
		background: #FFFFFF;
		display: inline-block;
		font-size: 32upx;
	}

	.event-list-view ul {
		padding: 0 20upx;
		list-style: none;
	}
	
	.scroll-view {
		height: calc(100% - 50px);
		overflow: auto;
	}

	.event-list-view ul li {
		background: #FFFFFF;
		word-break: break-all;
		min-height: 70upx;
		line-height: 70upx;
		width: 94%;
		padding-top: 20upx;
		padding-bottom: 20upx;
		margin-left: 3%;
		/* margin-right: 3%;
		margin-bottom: 4upx; */
		border-bottom: 2upx solid #EEEEEE;
		font-size: 30upx;
	}
</style>
