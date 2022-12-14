<template>
	<uni-base-page class="choose-community-view">
		<uni-search @input="onInput"/>
		<view class="community-list">
			<ul v-if="buildingList !== null && buildingList.length > 0">
				<li v-for="(building,index) in buildingList" :key="index" :data-name="building.name" :data-id="building.id" @click="selectBuilding(building)">
				<text style="color: #AAAAAA;">{{ building.cityName }}</text><br>
				<text>{{ building.policeStationName }}/{{ building.communityName }}/{{ building.name }}</text>
				</li>
			</ul>
			<view v-else class="no-data">{{ common["no-data"] || "暂无数据" }}</view>
		</view>
	</uni-base-page>
</template>

<script>
	import uniSearch from '../../components/uni-search/uni-search.vue';
	export default {
		components: {
			uniSearch
		},
		data() {
			return {
				buildingList: [],
				allBuildingList: [],
				phone: ""
			}
		},
		methods:{
			// 根据城市id获取社区列表
			getBuildingListByPhone(phone) {
				this.$req.request ({
					url: "/sqBuilding/app/getBuildingListByPhone",
					data: {
						phone: phone
					},
					success: res => {
						console.log("房东拥有楼栋列表---",res.data);
						this.buildingList = res.data;
						this.allBuildingList = res.data;
					}
				})
			},
			
			//点击选择社区
			selectBuilding(buildingObj) {
				// this.$navigateBackPrevPage({"communityName": communityObj.name, "communityId": communityObj.id});
				// uni.navigateBack();
				let buildingInfo = {
					name: buildingObj.name,
					communityName: buildingObj.communityName,
					buildingId: buildingObj.id,
					phone: this.phone,
					communityId: buildingObj.communityId
				}
				this.$onfire.fire("EventBuildingChange", {"buildingName": buildingObj.name, "buildingName": buildingObj.id});
				console.log("building---",buildingInfo)
				uni.navigateTo({
					url: "choose-room-form?buildingObj=" + JSON.stringify(buildingInfo)
				})
			},
			
			// 获取输入值
			onInput(value) {
				this.buildingList = this.allBuildingList.filter(building => {
					uni.debugLog("building.name", building.name);
					if(building !== undefined && building.name.indexOf(value) > -1) {
						return building;
					}
				});
			}
		},
		computed: {
			title() {
				return this.$t("title");
			},
			house() {
				return this.$t("house");
			},
			common() {
				return this.$t("common");
			}
		},
		
		
		onLoad(options) {
			this.phone = options.phone;
			this.getBuildingListByPhone(options.phone);
			this.$setTitle(this.house["house-search"]);
		}
	}
</script>

<style lang="scss">
	.choose-community-view {

		width: 100%;
		font-size: 34upx;
		
		.community-list {
			padding-top: 90upx;
			background-color: #FFFFFF;
			width: 100%;
			height: 100%;
			overflow: hidden;
			ul {
				width: 100%;
				list-style: none;
				padding: 0;
				
				li {
					text-align: left;
					border-bottom: 1upx solid #EEEEEE;
					padding: 20upx;
					font-size: 28upx;
				}
			}
		}
		
		.no-data {
			width: 100%;
			margin-top: 50%;
			text-align: center;
		}
	}

</style>

