<template>
	<uni-base-page class="uni-base-page">
		<aui-poster ref="poster" :maskTapClose="false" @callback="auiPosterCallback">
			<!-- 身份核验弹窗 start -->
			<view class="aui-poster-view" style="background-color: #FFFFFF; height: 180upx;" slot="content">
				<view style="font-size: 32upx; color: #057D7F; text-align: center; padding: 10upx 0; font-weight: bold;">
					{{ main["identity-popup"] || "此功能需要完成身份核验才能使用哦" }}~
				</view>
				<button style="color: #FFFFFF; width: 60%; margin-top: 30upx; background: #057D7F; font-size: 34upx;" @click="goToAuthIDPage">{{ main["go-to"]||"立即前往" }}</button>
			</view>
			<!-- 身份核验弹窗 end -->
		</aui-poster>
		<view class="choose-room-view form-view">
			<view class="choose-title">{{house["select-community"] || "所有小区"}}</view>
			<navigator url="/sub-package/pages/area-select/area-select?type=2">
				<view class="uni-list-cell" hover-class="uni-list-cell-hover">
					<view class="uni-list-cell-navigate uni-navigate-right">
						<text class="uni-list-cell-text"><text class="require-text">*</text> {{house["city"] || "城市"}}</text>
						<input style="width: 65%; font-size: 34upx;" maxlength="200" type="text" disabled :placeholder="`${house['select-city']}` || '请选择城市'" name="city" v-model="cityName"/>
					</view>
				</view>
			</navigator>
			<!-- 小区 -->
			<view class="uni-list-cell" hover-class="uni-list-cell-hover" @click="chooseCommunity">
				<view class="uni-list-cell-navigate uni-navigate-right">
					<text class="uni-list-cell-text"><text class="require-text">*</text> {{house["community"] || "小区"}}</text>
					<input style="width: 65%; font-size: 34upx;" maxlength="200" type="text" disabled :placeholder="`${house['community-placeholder']}` || '请选择小区'" name="community"
					 v-model="communityName"/>
				</view>
			</view>
			<!-- 单元 -->
			<view v-if=" mineAuthentication != 1 " class="uni-list-cell" hover-class="uni-list-cell-hover">
				<view class="uni-list-cell-navigate uni-navigate-right">
					<text class="uni-list-cell-text"><text class="require-text">*</text> {{house["building"] || "单元"}}</text>
					<picker style="width: 65%;float: left;" v-if="communityId > -1" @change="buildingChange" :range-key="'name'" name="buildingId"
					 :range="buildingList">
						<view :class="['input-view', buildingIndex > -1 ? '' : 'input-placeholder-view']">{{buildingIndex > -1 ? buildingList[buildingIndex]["name"] : house['select-building'] || '请选择单元'}}</view>
					</picker>
					<view style="width: 65%" class="input-placeholder-view input-view" v-else @click="chooseArea(2)">{{house["select-building"] || "请选择单元"}}</view>
				</view>
			</view>
			<!-- 房间 -->
			<view v-if=" mineAuthentication != 1 " class="uni-list-cell" hover-class="uni-list-cell-hover">
				<view class="uni-list-cell-navigate uni-navigate-right">
					<text class="uni-list-cell-text"><text class="require-text">*</text> {{house["room"] || "房间"}}</text>
					<picker style="width: 65%;float: left;" @change="roomChange" :range-key="'name'" v-if="buildingIndex > -1" name="roomId" :range="roomList">
						<view :class="['input-view', roomIndex > -1 ? '' : 'input-placeholder-view']">{{roomIndex > -1 ? roomList[roomIndex]["name"] : house["select-room"] || '请选择房间'}}</view>
					</picker>
					<view style="width: 65%" class="input-placeholder-view input-view" v-else @click="chooseArea(3)">{{house["select-room"] || "请选择房间"}}</view>
				</view>
			</view>
			<view class="next-step-btn"><button type="primary" @click="nextStep" class="" :disabled="roomIndex === -1">{{house["nextstep"] || "下一步"}}</button></view>
			<view v-if=" mineAuthentication != 1 " class="next-step-btn"><button type="default" @click="goToSearch">{{ house["quick-search"] || "出租屋房间快速查找" }}</button></view>
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				cityCode: "",
				cityName: "",
				communityName: "",
				communityId: -1,
				buildingList: [],
				buildingIndex: -1,
				buildingId: "",
				roomList: [],
				roomId: "",
				roomIndex: -1,
				industryType: 1,
				mineAuthentication: 0, //0 我的房屋验证身份  1是 我的=>真实身份验证
				isAppApplyInCompulsorySelfie: 0 // APP申请入住是否强制自拍
			}
		},
		
		computed: {
			house() {
				return this.$t("house")
			},
			title() {
				return this.$t("title")
			},
			main() {
				return this.$t("main")
			}
		},
		onReady() {
			this.$setTitle(this.title["identity"])
			this.$getCurrentCityObj().then((cityObj) => {
				if (cityObj.cityCode) {
					this.cityCode = cityObj.cityCode;
					this.cityName = cityObj.cityName;
				}
			});
		},
		
		onShow() {
			// #ifdef H5
			var data = this.$getCurrentPageData();
			if(this.communityId !== -1) {
				this.getBuildingList(this.communityId);
			}
			// #endif
			let isAppEnableIdentityVerify = this.$getUserInfo().isAppEnableIdentityVerify
			console.log("身份状态",uni.getStorageSync("verifyStatus"))
			var _this = this;
			// 绑定事件，当名为EventAreaChange的事件发生的时
			this.$onfire.on('EventAreaChange', e => {
				_this.cityCode = e.cityCode;
				_this.cityName = e.cityName;
			});
			// 绑定事件，当名为EventCommunityChange的事件发生的时
			this.$onfire.on('EventCommunityChange', e => {
				_this.communityId = e.communityId;
				_this.communityName = e.communityName;
				_this.industryType = e.industryType || 1;
				_this.getBuildingList(e.communityId);
				_this.isAppApplyInCompulsorySelfie = e.isAppApplyInCompulsorySelfie;
				console.log("所选小区场景值： ", _this.industryType,e);
				
				// 判断是否是出租屋场景、isAppEnableIdentityVerify的值是否是1
				if(_this.industryType === 3 && isAppEnableIdentityVerify === 1) {
					// 出租屋场景，则需要检测是否有身份核验，未核验则显示弹窗
					// _this.$checkAppAccountAuthIDVerifyStatus()
						// _this.$refs.poster.show();
					if( uni.getStorageSync("verifyStatus") !==1 ) {
						_this.$refs.poster.show();
					}
				}
			});
		},
		onLoad(options) {
			this.mineAuthentication = options.index;
		},
		
		onUnload() {
			// 取消事件绑定
			this.$onfire.un("EventAreaChange");
			this.$onfire.un("EventCommunityChange");
		},

		methods: {
			chooseCommunity() {
				if (this.cityCode !== "") {
					uni.navigateTo({
						url: "choose-community?city=" + this.cityCode + "&mineAuthentication=" + this.mineAuthentication,
					})
				} else {
					this.$showToast(this.house["city-toast"] || "请先选择城市");
				}

			},

			//获取单元楼栋列表
			getBuildingList(communityId) {
				this.$req.request({
					url: "/sqBuilding/app/getBuildingByCommunityId",
					data: {
						communityId: communityId
					},
					success: res => {
						this.buildingList = res.data;
					}
				});
			},
			
			auiPosterCallback() {
				
			},
			
			//选择单元onchange事件
			buildingChange(e) {
				this.buildingIndex = e.target.value;
				var buildingId = this.buildingList[this.buildingIndex]["id"];
				this.buildingId = buildingId;
				this.$req.request({
					url: "/sqRoom/app/getRoomByBuildingIdAndCommunityId",
					data: {
						communityId: this.communityId,
						buildingId: buildingId
					},
					success: res => {
						this.roomList = res.data;
					}
				});
			},

			//选择房间onchange
			roomChange(e) {
				this.roomIndex = e.target.value;
				this.roomId = this.roomList[this.roomIndex]["id"];
			},

			chooseArea(type) {
				var obj = {
					2: this.house["community-toast"] || "请先选择小区",
					3: this.house["building-toast"] || "请先选择单元",
				};
				this.$showToast(obj[type]);
			},

			//身份认证下一步
			nextStep() {
				let houseObj = {
					communityId: this.communityId,
					buildingId: this.buildingId,
					roomId: this.roomId,
					industryType: this.industryType || 1,
					isAppApplyInCompulsorySelfie: this.isAppApplyInCompulsorySelfie || 0
				};
				let url = "identity?houseObj=" + JSON.stringify(houseObj);
				if (this.industryType === 3) {
					if (this.$checkAppAccountAuthIDVerifyStatus()) {
						this.$navigateTo(url);
					}
				} else {
					this.$navigateTo(url);
				}
				// uni.navigateTo({
				// 	url: "identity?houseObj=" + JSON.stringify(houseObj)
				// });
			},
			
			// 跳转到快速查找页面
			goToSearch() {
				let url = "/sub-package/pages/household-list/owner-phone-search";
				if (this.industryType === 3) {
					if (this.$checkAppAccountAuthIDVerifyStatus()) {
						this.$navigateTo(url);
					}
				} else {
					this.$navigateTo(url);
				}
			},
			
			// 跳转到核验界面
			goToAuthIDPage() {
				uni.navigateTo({ ///pages/mine/auth-id-verify
					url: "../../../sub-package/pages/mine/auth-id-verify?mineAuthentication=" + this.mineAuthentication
				});
				this.$refs.poster.hide();
			}

		}
	}
</script>

<style lang="scss" scoped>
	.choose-room-view {
		width: 96%;
		margin: 0 auto;
		/* padding: 20upx; */
		padding-top: 20upx;
	}

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

	.input-view {
		font-size: 34upx;
		color: #808080;
	}

	.next-step-btn {
		margin-top: 40upx;
	}

	.next-step-btn button {
		width: 70%;
		font-size: 34upx;
		padding: 10upx;
		margin: auto;
	}
	.aui-poster-view {
		width: 90%;
		height: 50vh;
		border: 10upx solid #057D7F;
		border-radius: 20upx;
		pointer-events: auto;
		position: static;
		/* z-index: 9; */
		padding: 30upx 20upx;
	}
</style>
