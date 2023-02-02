<template>
	<uni-base-page class="list-view house-list-view">
		<!-- 后期可能会加 -->
		<!-- <view class="search-view">
			<form class="search-form">
				<view class="filter-view">
					<picker class="filter-picker" mode="selector" @change="communityChange" :range="communityList">
						<text class="input-text">{{ communityList.length > 0 ? communityList[index] : "" }}</text>
						<image class="filter-view-down-image" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/common/down.png"></image>
					</picker>
				</view>
			</form>
		</view> -->
		<view class="my-house-view-list" v-if="communityList.length > 0">
			<view class="my-house-view-list-item" v-for="(community, index) in communityList" :key="index">	
				<view class="list-item-building-house-info">
					<text class="list-item-building-house-name-text">
						{{ community.communityName }}
					</text>
					<view class="list-item-building-house-people-text" style="color:#32A6F0">
						<view v-if="community.faceImage" style="color: #09BB07;" @click="goToFaceList(community)">{{ myhouse["face-registered"] || "人脸已登记" }}</view>
						<text v-else style="color:#0081ff;" @click="goToPicture(community)" >{{ myhouse["face-register"] || "登记人脸" }}</text>
						
					</view>
				</view>
				<view class="list-item-community-location">
					<text class="list-item-community-location-text">
						{{ community.cityName }}
					</text>
				</view>
				<view class="list-item-tenant-operation">
					<view class="left"><span style="color: #AAAAAA;">{{ myhouse["department"] || "所属部门" }}：</span>{{ community.deptName }}</view>	
					<!-- <view class="list-item-look-over-tenant-view">
						<navigator :url="'../look-over-tenant/look-over-tenant?house=' + JSON.stringify(community)" v-if="house.identityType === 1">
							<button class="list-item-button list-item-look-over-button" hover-class="list-item-hover-button">
								<image class="list-item-img list-item-look-over-tenant-img" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/my-house/check-household.png"></image>
								<text class="list-item-text list-item-look-over-tenant-text">
									{{ myhouse["household"] || "查看住户" }}
								</text>
							</button>
						</navigator>
					</view> -->
				</view>
			</view>
		</view>
		<view v-else class="no-data-view">
			{{ myhouse["no-community"] || "暂无小区数据" }}
		</view>
		<!-- 后期可能会加 -->
		<!-- <view class="bottom-btn-view add-house-view">
			<button type="primary" class="left primary btn" @click="addHouse">{{ myhouse["add-house"] || "添加房屋" }}</button>
			<button type="primary" class="right primary btn" @click="checkRecords">{{ myhouse["apply-record"] || "申请记录" }}</button>
		</view> -->
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				communityList: []
			}
		},
		computed: {
			myhouse() {
				return this.$t("house")
			},
			title() {
				return this.$t("title");
			}
		},
		methods: {
			//获取物业小区列表
			getPropertyList() {
				this.$req.request({
					url: "/wyEmpProperty/app/getPropertyList",
					success: res => {
						this.communityList = res.data;
					}
				})
			},
			
			//跳转到人脸图片列表
			goToFaceList(community) {
				uni.navigateTo({
					url: "picture-list?community=" + JSON.stringify(community)
				});
			},
			
			//跳转到人脸登记列表
			goToPicture(community) {
				uni.navigateTo({
					url: "upload-picture?community=" + JSON.stringify(community)
				});
			}
		},
		onReady() {
			this.$setTitle(this.title["my-community"])
		},
		onShow() {
			this.getPropertyList();
		}
	}
</script>

<style lang="scss"> 
	.house-list-view {
		width: 100%;
		.nav-bar {
			width: 100%;
		}
		.my-house-view-list {
			width: 100%;
			// margin-top: 40upx;
			position: absolute;
			overflow: auto;
			background: #EEEEEE;
			.my-house-view-list-item {
				background: #FFFFFF;
				padding: 30upx;
				margin: 20upx 10upx;
				border-radius: 10upx;
				.list-item-community-location {
					.list-item-community-location-text {
						color: #AAAAAA;
					}
				}
		
				.list-item-building-house-info {
					overflow: hidden;
					// margin-bottom: 10upx;
		
					.list-item-building-house-name-text {
						float: left;
						width: 75%;
					}
		
					.list-item-building-house-people-text {
						float: right;
					}
				}
		
				.list-item-tenant-operation {
					overflow: hidden;
					align-items: center;
					justify-content: space-between;
					display: flex;
		
					// border-bottom: 1px solid #cccccc;
					.list-item-add-tenant-view,
					.list-item-look-over-tenant-view {
						.list-item-button {
							border: none;
							line-hieght: 1;
							font-size: 28upx;
							border-radius: 0;
							background: #ffffff;
							padding-right: 0upx;
		
							&:after {
								border: none;
								border-radius: 0;
							}
		
							&.list-item-hover-button {
								background: #cccccc;
							}
		
							.list-item-img {
								width: 26upx;
								height: 26upx;
							}
		
							.list-item-text {
								margin-left: 10upx;
								color: #AAAAAA;
							}
						}
					}
		
					.list-item-add-tenant-view {
						float: left;
					}
		
					.list-item-look-over-tenant-view {
						float: right;
		
						.list-item-look-over-tenant-img {
							width: 26upx;
							height: 20upx;
						}
					}
				}
			}
			
			.loading {
				margin-bottom: 80upx;
			}
		}
		
		.no-data-view {
			height: calc(100% - 100upx);
		}
		
		.add-house-view {
			
			.btn {
				width: 50%;
			}
		}
	}
</style>
