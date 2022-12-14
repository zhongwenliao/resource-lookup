<template>
	<uni-base-page class="building-list-box">
		<!-- 楼栋列表所属省市区 -->
		<!-- <template v-if="buildingInfoObj.id !== undefined">
			<view class="building-info-view">
				<text>{{ buildingInfoObj.name }}</text>
			</view>
		</template> -->
		<view class="building-list-view uni-list" v-for="(building, index) in buildingList" :key="building.id" v-if="buildingList.length !== 0">
			<!-- 若需添加右侧小箭头 直接加class名 uni-navigate-right -->
				<view class="building-list-item-view uni-list-cell" @click="selectBuilding(building)">
					<view class="uni-list-cell-navigate uni-navigate-right" style="padding: 16upx;">
						<text class="uni-list-cell-text name">{{ building.name }}</text>
						<!-- <text class="uni-list-cell-text identityType">{{ building.doorNo }}</text> -->
					</view>
				</view>
		</view>
		<view v-else>{{ manage["click-create-building"] || "当前社区暂无楼栋信息，点击创建楼栋" }}</view>
		<view class="bottom-btn-view add-tenant-view">
			<button type="primary" class="primary btn" @click="addBuilding">{{ manage["add-building"]||"添加楼栋" }}</button>
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				buildingList: [],
				communityId: this.$getUserInfo().currentCommunity.id
			}
		},
		computed:{
			title() {
				return this.$t("title")
			},
			manage() {
				return this.$t("manage")
			}
		},
		methods: {
			// 根据社区id获取楼栋列表
			getBuildingList() {
				this.$req.request({
					url: "/sqBuilding/app/getBuildingByCommunityId",
					data: {
						"communityId": this.communityId
					},
					success: res => {
						this.buildingList = res.data;
					}
				});
			},
			
			// 点击选择楼栋
			selectBuilding(buildingObj) {
				this.$onfire.fire("EventBuildingChange", {"buildingName": buildingObj.name, "buildingId": buildingObj.id});
				uni.navigateBack();
			},
			
			// 点击添加楼栋
			addBuilding() {
				let bindInfoObj = {
					communityId: this.communityId,
					bindType: 1,
					communityName: this.$getUserInfo().currentCommunity.name
				}
				uni.navigateTo({
					url: "add-building-or-room?bindInfoObj=" + JSON.stringify(bindInfoObj)
				})
			}
			
		},
		
		onShow() {
			this.getBuildingList()
		},
		
		onLoad(options) {
			
		}
	}
</script>

<style lang="scss">
	.building-list-box {
		width: 100%;
		background: #eeeeee;
		padding: 10upx 0 0 0;
		margin-bottom: 100upx;
		.building-info-view {
			padding: 0 30upx 6upx;
		}
		
		.building-list-view {
			
			.building-list-item-view {
				.uni-list-cell-navigate {
					display: flex;
					justify-content: flex-start;
					// padding: 10px 15px 3px;
					.image-view {
						height: 100upx;
						width: 100upx;
						.uni-list-cell-img {
							max-width: 100upx;
							max-height: 100upx;
							float: left;
						}
					}
					.uni-list-cell-text {
						display: block;
						text-align: left;
						padding: 6upx 20upx;
						
						&.name {
							width: 40%;
						}
						
						&.identityType {
							width: 55%;
							padding: 0 40upx;
							text-align: right;
						}
					} 
				}
			}
		}
		
	}
</style>

