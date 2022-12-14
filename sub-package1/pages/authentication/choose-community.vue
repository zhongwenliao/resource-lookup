<template>
	<uni-base-page class="choose-community-view">
		<uni-search @input="onInput"/>
		<view class="community-list">
			<ul v-if="communityList !== null && communityList.length > 0">
				<li v-for="(community,index) in communityList" :key="index" :data-name="community.name" :data-id="community.id" @click="selectCommunity(community)">{{ community.name }}</li>
			</ul>
			<view v-else class="no-data">暂无小区数据</view>
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
				communityList: [],
				allCommunityList: [],
				mineAuthentication: 0,  //0 我的房屋验证身份  1是 我的=>真实身份验证
				pageType: "",
				cityName: "",
			}
		},
		
		methods:{
			// 根据城市id获取小区列表
			getCommunityByCityCode(cityCode) {
				let url = "";
				if(this.pageType == '3'){
					url = "/sqCommunity/h5/getByCityCode"
				}else{
					url = "/sqCommunity/app/getCommunityByCityCode"
				}
				this.$req.request({
					url: url,
					data: {
						"cityCode": cityCode
					},
					success: res => {
						this.communityList = res.data;
						this.allCommunityList = res.data;
						if (this.communityList.length === 0) {
							this.$showToast("该城市下暂无小区");
						}
						this.$showLog("communityList", this.communityList)
					}
				});
			},
			
			//点击选择小区
			selectCommunity(communityObj) {
				// this.$navigateBackPrevPage({"communityName": communityObj.name, "communityId": communityObj.id});  3
				if( this.mineAuthentication == 1 && communityObj.industryType != 3 ) {
					uni.showModal({
						title: '提示',
						content: '当前小区无需身份核验！',
						showCancel: false,
						success: function (res) {
							if (res.confirm) {
								console.log('用户点击确定');
								// uni.switchTab({
								// 	url: "../../../pages/mine/mine"
								// })
							} else if (res.cancel) {
								console.log('用户点击取消');
							}
						}
					});
				}else {
					if( this.mineAuthentication == 1 && uni.getStorageSync("verifyStatus") ===1) {
						uni.navigateTo({
							url: '../../../sub-package/pages/mine/auth-id-verify?mineAuthentication=' + this.mineAuthentication
						})
					}else if(this.pageType == '3'){
						let visName = uni.getStorageSync("visName"),
							visPhone = uni.getStorageSync("visPhone"),
							visCertNo = uni.getStorageSync("visCertNo"),
							visGender = uni.getStorageSync("visGender");
						uni.reLaunch({
							url: '/sub-package1/pages/appointment/appointment?cityName=' + this.cityName + '&communityName=' + communityObj.name + '&communityId=' + communityObj.id + '&type=3' + '&visName=' + visName + '&visPhone=' + visPhone + '&visCertNo=' + visCertNo + '&visGender=' + visGender
						})
					}else {
						this.$onfire.fire("EventCommunityChange", {"communityName": communityObj.name, "communityId": communityObj.id, 
							"isAppApplyInCompulsorySelfie": communityObj.isAppApplyInCompulsorySelfie, "industryType": communityObj.industryType || 1 });
						uni.navigateBack();
					}
				}
			},
			
			// 获取输入值
			onInput(value) {
				this.communityList = this.allCommunityList.filter(community => {
					uni.debugLog("community.name", community.name);
					if(community !== undefined && community.name.indexOf(value) > -1) {
						return community;
					}
				});
			}
		},
		computed: {
			title() {
				return this.$t("title");
			}
		},
		
		onReady() {
			this.$setTitle(this.title["choose-community"]);
		},
		onLoad(options) {
			this.mineAuthentication = options.mineAuthentication;
			this.pageType = options.type;
			this.cityName = options.cityName;
			this.getCommunityByCityCode(options.city);
		}
	}
</script>

<style>
	.choose-community-view {

		width: 100%;
		font-size: 34upx;
		}
		.community-list {
			padding-top: 90upx;
			background-color: #FFFFFF;
			width: 100%;
			height: 100%;
			overflow: hidden;
			}
			.community-list ul {
				width: 100%;
				list-style: none;
				padding: 0;
				}
				.community-list ul li {
					text-align: center;
					border-bottom: 1upx solid #EEEEEE;
					padding: 20upx;
					font-size: 34upx;
				}
		
		.no-data {
			width: 100%;
			margin-top: 50%;
			text-align: center;
		}

</style>
