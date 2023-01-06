<template>
	<uni-base-page>
		<view class="door-lock-page form-view">
			<!-- 安装位置 -->
			<view class="uni-list-cell" style="margin: 30upx 0;" hover-class="uni-list-cell-hover">
				<view class="uni-list-cell-navigate uni-navigate-right">
					<text class="uni-list-cell-text"><text class="require-text">*</text> {{ manage["install-position"] || "安装位置" }}</text>
					 <picker @change="bindInstallPositionChange" style="width: 70%; font-size: 34upx;" class="uni-list-cell-input" :range="positionList">
					    <view class="uni-input" style="font-size: 34upx;">{{ positionList[positionIndex] }}</view>
					 </picker>
				</view>
			</view>
			<!-- 楼栋 -->
			<view class="uni-list-cell" style="margin: 30upx 0;" hover-class="uni-list-cell-hover" v-if="positionIndex !== 0" @click="chooseBuilding">
				<view class="uni-list-cell-navigate uni-navigate-right">
					<text class="uni-list-cell-text"><text class="require-text">*</text> {{ manage["building"] || "楼栋"}}</text>
					<input style="width: 70%; font-size: 34upx;" maxlength="20" class="uni-list-cell-input" type="text" disabled :placeholder="`${common['select']||'请选择'}`"
					 v-model="buildingName"/>
				</view>
			</view>
			<!-- 房间 -->
			<view class="uni-list-cell" style="margin: 30upx 0;" hover-class="uni-list-cell-hover" v-if="positionIndex == 2" @click="chooseRoom">
				<view class="uni-list-cell-navigate uni-navigate-right">
					<text class="uni-list-cell-text"><text class="require-text">*</text> {{ manage["room"] || "房间"}}</text>
					<input style="width: 70%; font-size: 34upx;" maxlength="20" class="uni-list-cell-input" type="text" disabled :placeholder="`${common['select']||'请选择'}`"
					 v-model="roomName"/>
				</view>
			</view>
			<!-- 设备名称 -->
			<view class="uni-list-cell" style="margin: 30upx 0;" v-if="positionIndex !== 2">
				<view class="uni-list-cell-navigate">
					<text class="uni-list-cell-text"><text class="require-text">*</text> {{ manage["dev-name"] || "设备名称" }}</text>
					<input style="width: 70%; font-size: 34upx;" maxlength="20" class="uni-list-cell-input" type="text" :placeholder="`${common['input']||'请输入'}`"
					 v-model="devName"/>
				</view>
			</view>
			<!-- 设备序列号 -->
			
			<view class="uni-list-cell" style="margin: 30upx 0;">
				<view class="uni-list-cell-navigate">
					<text class="uni-list-cell-text"><text class="require-text">*</text> {{ manage["dev-sn"] || "设备序列号" }}</text>
					<input style="width: 50%; font-size: 34upx;" maxlength="20" class="uni-list-cell-input" type="number" :placeholder="`${common['input']||'请输入'}`"
					 v-model="devSn"/>
					 <text style="color: #007AFF;" @click="scanNearDev">{{ manage["scan"] || "扫描" }}</text>
				</view>
			</view>
			<view class="next-step-btn" style="margin-top: 200upx;">
				<button :disabled="btnDisabled" type="primary" @click="clickBindDevice" class="button primary">
					{{ manage["bind-device"] || "绑定设备" }}
				</button>
			</view>
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				buildingName: "",
				buildingId: "",
				devSn: "",
				roomId: "",
				roomName: "",
				installPostion: "",
				positionList: [],
				installPostion: "请选择安装位置",
				positionIndex: 0,
				devName: "",
				communityId: this.$getUserInfo().currentCommunity.id || ""
			}
		},
		computed: {
			btnDisabled() {
				return (this.devSn === "" ? true : false);
			},
			manage() {
				return this.$t("manage");
			},
			common() {
				return this.$t("common");
			},
			house() {
				return this.$t("house");
			}
		},
		methods: {
			// 选择楼栋
			chooseBuilding() {
				if( this.communityId == undefined || this.communityId === "") {
					this.$showToast(this.common["no-community"]||"暂未绑定小区");
				} else {
					uni.navigateTo({
						url: "building-list"
					})
				}
			},
			
			// 选择房间
			chooseRoom() {
				if (this.buildingId === "") {
					this.$showToast(this.manage["select-building-first"] || "请先选择楼栋");
				} else {
					let buildingObj = {
						name: this.buildingName,
						id: this.buildingId
					}
					console.log("buildingObj: ", buildingObj);
					uni.navigateTo({
						url: "room-list?buildingObj=" + JSON.stringify(buildingObj)
					})
				}
			},
			
			// 扫描周边设备
			scanNearDev() {
				uni.navigateTo({
					url: "/sub-package/pages/dev-manage/scan-dev-list"
				})
			},
			
			// 点击绑定设备
			clickBindDevice() {
				if(this.positionIndex == 2) {
					this.devName = this.buildingName + "/" + this.roomName + this.manage["room-door"];
				}
				this.$req.request({
					url: "/devDevice/app/add",
					data: {
						doorType: this.positionIndex,
						communityId: this.communityId,
						buildingId: this.buildingId,
						roomId: this.roomId,
						devSn: this.devSn,
						doorName: this.devName
					},
					success: res => {
						console.log("res: ",res.data);
						if(res.code == 0) {
							this.$showToast(this.house["add-success"] || "添加成功");
							setTimeout(() => {
								uni.navigateTo({
									url: "/sub-package2/pages/dev-manage/dev-manage"
								})
							}, 1000)
						}
					}
				})
				
			},
			
			// 选择安装位置
			bindInstallPositionChange(e) {
				this.positionIndex = isNaN(e.target.value)? 0:e.target.value;
			},
			
			// 选择安装位置，positionIndex,0为小区门，1为单元门
			// goToInstallPostionList(positionIndex) {
			// 	uni.navigateTo({
			// 		url: "install-position-list?positionIndex=" + positionIndex
			// 	})
			// }
			
		},
		
		onLoad(options) {
			uni.setNavigationBarTitle({
				title: this.manage["add-device"] || "添加设备"
			})
			var _this = this;
			this.positionList= [this.manage["community-gate"],this.manage["building-gate"],this.manage["room-door"]];
			this.installPostion= this.common["select"]||"请选择安装位置";
			// 绑定事件，当名为EventBuildingChange的事件发生的时
			this.$onfire.on('EventBuildingChange', e => {
				_this.buildingId = e.buildingId;
				console.log('add-device--1',_this.buildingId)
				_this.buildingName = e.buildingName;
			});
			// 绑定事件，当名为EventRoomChange的事件发生的时
			this.$onfire.on('EventRoomChange', e => {
				_this.roomId = e.roomId;
				console.log('_this.roomId--1',_this.roomId)
				_this.roomName = e.roomName;
			});
			
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
			button {
				margin-top: 200upx;
				font-size: 34upx;
				padding: 10upx;
			}
		}
	}
</style>
