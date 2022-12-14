<template>
	<uni-base-page class="uni-base-page">
		<view class="door-lock-page form-view">
			<!-- 楼栋 -->
			<view class="uni-list-cell" hover-class="uni-list-cell-hover" @click="chooseBuilding">
				<view class="uni-list-cell-navigate uni-navigate-right">
					<text class="uni-list-cell-text"><text class="require-text">*</text> {{ manage["building"] || "楼栋" }}</text>
					<input style="width: 75%; font-size: 34upx;" maxlength="200" class="uni-list-cell-input" type="text" disabled placeholder="请选择楼栋" name="building"
					 v-model="buildingName"/>
				</view>
			</view>
			<view class="uni-list-cell" hover-class="uni-list-cell-hover">
				<view class="uni-list-cell-navigate uni-navigate-right">
					<text class="uni-list-cell-text"><text class="require-text">*</text> {{ house["room"] || "房间" }}</text>
					<picker style="width: 75%" @change="roomChange" :range-key="'name'" name="roomId" :range="roomList">
						<view :class="['input-view', roomIndex > -1 ? '' : 'input-placeholder-view']">{{roomIndex > -1 ? roomList[roomIndex]["name"] : house["select-room"] || '请选择房间'}}</view>
					</picker>
					<!-- <view style="width: 65%" class="input-placeholder-view input-view" v-else @click="chooseArea(3)">{{house["select-room"] || "请选择房间"}}</view> -->
				</view>
			</view>
			<view class="next-step-btn"><button type="primary" @click="nextStep" class="primary" >{{ title["identity"] || "身份认证" }}</button></view>
			
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				addressName: "",
				communityName: "",
				communityId: null,
				buildingName: "",
				buildingId: null,
				buildingObj: {},
				phone: "",
				roomList: [],
				roomIndex: -1
			}
		},
		computed: {
			house() {
				return this.$t("house")
			},
			title() {
				return this.$t("title")
			},
			common() {
				return this.$t("common")
			},
			manage() {
				return this.$t("manage")
			}
			
		},
		methods: {
			//选择房间
			roomChange(e){
				if(this.buildingName === "") {
					this.$showToast(this.manage["select-building-first"]||"请先选择楼栋");
				}else {
					// console.log("roomIndex---",e.target.value);
					this.roomIndex = e.target.value;
				}
			},
			
			//获取房间列表
			getRoomList() {
				this.$req.request ({
					url: "/sqRoom/app/getListByBuildingId",
					data:{
						buildingId: this.buildingObj.buildingId,
						phone: this.phone
					},
					success: res => {
						// console.log("room list ---",res.data);
						let roomList = res.data;
						this.roomList = roomList;
					}
				})
			},
			
			//选择楼栋
			chooseBuilding() {
				uni.navigateTo({
					url: "building-list-search?phone=" + this.phone
				})
				
			},
			
			//点击下一步，跳转到房屋列表页面
			nextStep() {
				let buildingObj = this.buildingObj;
				let roomObj = {
					roomId: this.roomList[this.roomIndex].id
				};
				Object.assign(buildingObj, {industryType:3}, roomObj);
				// console.log("buildingObj: ",buildingObj)
				uni.navigateTo({
					url: "/sub-package1/pages/authentication/identity?houseObj=" + JSON.stringify(buildingObj)
				});
			}
		},
		
		onLoad(options) {
			this.$setTitle(this.house["house-search"]);
			if(options.buildingObj) {
				let buildingObj = JSON.parse(options.buildingObj);
				this.buildingObj = buildingObj;
				this.phone = buildingObj.phone;
				this.buildingName = buildingObj.communityName + "/" + buildingObj.name;
				this.getRoomList();
			}
			// this.$setTitle(this.title["identity"])
			// var _this = this;
			// 绑定事件，当名为EventCommunityChange的事件发生的时
			// this.$onfire.on('EventBuildingChange', e => {
			// 	_this.buildingId = e.buildingId;
			// 	_this.buildingName = e.buildingName;
			// });
		},
		
		onUnload() {
			// 取消事件绑定
			this.$onfire.un("EventCommunityChange");
			this.$onfire.un("EventBuildingChange");
		},
	}
</script>

<style lang="scss">
	.door-lock-page {
		width: 96%;
		margin: 40upx auto;
		/* padding: 20upx; */
		padding-top: 20upx;
		
		.choose-title {
			font-size: 38upx;
			font-weight: bold;
			/* margin-top: 30upx;
			margin-bottom: 20upx; */
		}
		
		.uni-list-cell {
			margin-bottom: 10upx;
			padding: 10upx 0;
		}
		
		.uni-list-cell-text {
			font-size: 34upx;
		}
		
		.uni-list-cell-input {
			input {
				white-space: nowrap;
				width: 100%;
				text-overflow: ellipsis;
				word-break: break-all;
				overflow: hidden;
			}
		}
		
		.input-view {
			font-size: 34upx;
			color: #808080;
		}
		
		.next-step-btn {
			width: 70%;
			margin: 80upx auto 0;
			button {
				font-size: 34upx;
				padding: 10upx;
			}
		}
	}
</style>

