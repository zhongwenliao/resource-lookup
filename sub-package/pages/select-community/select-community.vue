<template>
	<uni-base-page class="content">
		<view class="select-community-view">
			<!-- 中文时显示 -->
			<view v-if="lang" class="search-box">
				<view class="city-area" @click="selectCity">
					{{ cityName }}
					<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/xiala.png"></image>
				</view>
				<view class="searh-area"><input type="text" :placeholder="`${common['input']}` || '请输入'" @input="filterCommunity" /></view>
			</view>
			<scroll-view scroll-y="true" class="community-list" v-if="communityList">
				<ul v-if="communityList.length > 0">
					<li
						:key="index"
						v-for="(community, index) in communityList"
						@click="selectCommunity(community)"
						:id="community.id"
						:data-name="community.name"
						:data-city="community.cityName"
					>
						<view class="li-view" hover-class="common-btn-hover">
							<view class="community-image-view">
								<image :src="community.industryType === 3 ? 'https://wxmini-1258758873.cos.ap-guangzhou.myqcloud.com/community-rent.png' : 'https://wxmini-1258758873.cos.ap-guangzhou.myqcloud.com/community-normal.png'" />
							</view>
							<view class="community-name-view">
								<text>{{ community.cityName || common['not-city-information'] }}</text>
								<br />
								<text>{{ community.name }}</text>
							</view>
						</view>
					</li>
				</ul>
				<view v-else class="no-data">{{ common["no-data"] || "暂无数据" }}</view>
			</scroll-view>
		</view>
	</uni-base-page>
</template>

<script>
export default {
	data() {
		return {
			communityList: null,
			cityName: '',
			cityCode: '',
			copyCommunityList: [],
			lang: ''
		};
	},
	computed: {
		title() {
			return this.$t('title');
		},
		common() {
			return this.$t('common');
		}
	},
	methods: {
		getCommunityList() {
			this.$req.request({
				url: '/appUser/app/getCommunityList',
				data: {
					cityCode: this.cityCode
				},
				success: res => {
					if (res.code === 0) {
						let communityList = res.data;
						this.communityList = communityList;
						this.copyCommunityList = communityList;
					}
				}
			});
		},

		selectCommunity(communityObj) {
			this.$editUserInfo('currentCommunity', communityObj);
			uni.$emit('selectCommunityEvent', communityObj);
			uni.navigateBack();
		},

		// 选择城市
		selectCity() {
			uni.navigateTo({
				url: '../area-select/area-select?isShowAll=true&type=2'
			});
		},

		filterCommunity(e) {
			let input = e.detail.value;
			this.communityList = [];
			for (var i in this.copyCommunityList) {
				if (this.copyCommunityList[i].name.indexOf(input) > -1) {
					this.communityList.push(this.copyCommunityList[i]);
				}
			}
		}
	},
	
	onReady() {
		this.$setTitle(this.title['choose-community']);
	},
	onLoad() {
		this.lang = this.$platformObj.isCN();
		this.getCommunityList();
		this.cityName = this.common['all'];
		// 绑定事件，当名为EventAreaChange的事件发生的时
		this.$onfire.on('EventAreaChange', e => {
			this.cityCode = e.cityCode;
			this.cityName = e.cityName;
			this.$showLog('cityCode', this.cityCode);
			this.communityList = [];
			if (this.cityCode == 0) {
				this.communityList = this.copyCommunityList;
			} else {
				for (let i in this.copyCommunityList) {
					if (this.copyCommunityList[i].cityCode && this.copyCommunityList[i].cityCode.indexOf(e.cityCode) > -1) {
						this.communityList.push(this.copyCommunityList[i]);
					}
				}
			}
		});
	}
};
</script>

<style lang="scss" scoped>
	.select-community-view {
		padding: 0 20upx 20upx;}
		.search-box {
			width: 98%;
			margin: 20upx auto 30upx;
			height: 60upx;
			padding: 10upx 0;
			border: 1upx solid #eeeeee;
			background-color: #ffffff;
			display: flex;
			flex-direction: row;
			align-items: center;}
			.city-area {
				width: 22%;
				text-align: center;
				border-right: 6upx solid #eeeeee;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;}
				.city-area image {
					width: 20upx;
					height: 20upx;
					margin-left: 8upx;
				}
			.searh-area {
				width: 76%;
				padding: 0 18upx;
				font-size: 28upx;
				}
				.searh-area input {
					font-size: 28upx;
				}
		.no-data {
			width: 100%;
			text-align: center;
		}
		.community-list {
			width: 100%;
			// height: 90%;
			padding: 1% 0;
}
			.community-list ul {
				width: 100%;
				padding: 0;
}
				.community-list ul li {
					height: 60px;
					border: 1px solid #00aa00;
					background-color: #ffffff;
					border-radius: 10upx;
					margin-bottom: 20upx;
					padding: 10upx;}
					.li-view {
						height: 100%;
						width: 100%;
						display: inline-block;
						border-radius: 10upx;
						overflow: hidden;
}
						.community-image-view {
							float: left;
							width: calc(20% - 20upx);
							height: 40px;
							margin-left: 20upx;
							margin-top: 20upx;
}
							.community-image-view image {
								width: 40px;
								height: 40px;
							}

						.community-name-view {
							float: left;
							width: 80%;
							height: 50px;
							margin-top: 15upx;
						}
</style>
