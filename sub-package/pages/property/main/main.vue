<template>
	<uni-base-page>
		<view class="hello">
			<view class="" style="width: 750upx; height: 350upx;">
				<sh-banner :swiperImgList="swiperImgList"></sh-banner>
			</view>
			<view class='menu-button-list'>
				<navigator url="../community-list/community-list">
					<image src='https://wxmini-1258758873.cos.ap-guangzhou.myqcloud.com/menu/my_house.png' class='menu-icon'></image><text>{{ myhouse["my-community"] || "我的小区"  }}</text>
				</navigator>
				
				<!-- <navigator url="../../../../sub-package1/pages/complaint-proposal/proposal-list?bool=1" v-if="homeInfo.wyDept.permAppComplaintAuthorize==1&&homeInfo.functionConfig.isComplaintMenu==1">
					<image src='../http://yuanzhoulvwego.com/wp-content/uploads/static/img/menu/tousu.png' class='menu-icon'></image><text>{{ complaintProposal["Suggestion"] || "投诉建议" }}</text>
				</navigator> -->
				<!-- <navigator url="../../../../sub-package1/pages/article-release/release-examine-list?bool=1" v-if="homeInfo.wyDept.permAppReleaseAuthorize==1&&homeInfo.functionConfig.isReleaseMenu==1">
					<image src='../http://yuanzhoulvwego.com/wp-content/uploads/static/img/menu/fangxing.png' class='menu-icon'></image><text>{{ articleRelease["Articlerelease"] || "物品放行" }}</text>
				</navigator> -->
				<navigator url="../../../../sub-package1/pages/complaint-proposal/proposal-list?bool=1" v-if="homeInfo.functionConfig.isComplaintMenu==1">
					<image src='https://wxmini-1258758873.cos.ap-guangzhou.myqcloud.com/menu/tousu.png' class='menu-icon'></image><text>{{ complaintProposal["Suggestion"] || "投诉建议" }}</text>
				</navigator>
				
				<navigator url="../../../../sub-package1/pages/article-release/release-examine-list?bool=1" v-if="homeInfo.functionConfig.isReleaseMenu==1">
					<image src='https://wxmini-1258758873.cos.ap-guangzhou.myqcloud.com/menu/fangxing.png' class='menu-icon'></image><text>{{ articleRelease["Articlerelease"] || "物品放行" }}</text>
				</navigator>
				
				<navigator url="../identity-authentication/identity-authentication">
					<image src='http://yuanzhoulvwego.com/wp-content/uploads/static/img/shengfenxinxi.png' class='menu-icon'></image><text>{{ title["identity"] || "身份认证"  }}</text>
				</navigator>
				<!-- 检查登记 start -->
				<!-- <navigator url="../check-register/check-register">
					<image src='http://yuanzhoulvwego.com/wp-content/uploads/static/img/check-register.png' class='menu-icon'></image><text>{{ "检查登记"  }}</text>
				</navigator> -->
				<!-- 检查登记 end -->
				<!-- <navigator url="../peripheral-discounts/peripheral-discounts" v-if="homeInfo.functionConfig.isCouponMenu">
					<image src='http://yuanzhoulvwego.com/wp-content/uploads/static/img/youhui.png' class='menu-icon'></image><text>{{ articleRelease["Discounts"] || "周边优惠"  }}</text>
				</navigator>
				<navigator url="../community-management/community-management">
					<image src='http://yuanzhoulvwego.com/wp-content/uploads/static/img/shequ.png' class='menu-icon'></image><text>社区管理</text>
				</navigator>
				<navigator url="../water-electricity/water-electricity">
					<image src='http://yuanzhoulvwego.com/wp-content/uploads/static/img/shuidian.png' class='menu-icon'></image><text>水电查抄</text>
				</navigator> -->
			</view>
		</view>
	</uni-base-page>
</template>

<script>
	// sh-banner.vue
	import shBanner from '../../../../pages/main/components/sh-banner.vue';
	export default {
		components: {
			shBanner
		},
		data() {
			return {
				swiperImgList: this.$getConfigParam().swiperImgList ,
				homeInfo:''//首页信息
			}
		},
		onShow(){
			this.homeInfo = uni.getStorageSync("homeInfo")
		},
		computed: {
			myhouse() {
				return this.$t("house");
			},
			title() {
				return this.$t("title");
			},
			complaintProposal() {
				return this.$t("complaint-proposal")
			},
			articleRelease() {
				return this.$t("article-release");
			}
		},
		methods: {
			
		},
		onReady() {
			this.$setTitle(this.title["property-member"])
		}
	}
</script>

<style>
	.hello {
		display: flex;
		flex: 1;
		flex-direction: column;
	}
	
	.menu-button-list {
		position: relative;
		-webkit-box-sizing: border-box;
		-moz-box-sizing: border-box;
		box-sizing: border-box;
		padding: 10px 0;
		margin: 0;
	}
	
	.menu-button-list navigator,
	.menu-button-list .menu-button {
		display: inline-block;
		width: 25%;
		text-align: center;
		padding: 5px 0;
		font-size: 12px;
	}
	
	.menu-icon {
		width: 30px;
		height: 30px;
	}
	
	.menu-button:active {
		background: #DEDEE3;
	}
	
	.menu-button-list text {
		display: block;
	}
</style>
