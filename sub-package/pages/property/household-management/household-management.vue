<template>
	<view class="search-warp">
		<view class="search-box">
			<input type="text" confirm-type="search" class="search" v-model="keywordSearch" :placeholder="`${manypage['search-placeholder']}` || '搜索'"/>
			<image class="search-img" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/search.png"></image>
		</view>
		<view class="title clear">
			<view class="fl">我的住户</view>
			<view class="fr">新增</view>
		</view>
		<view class="househoid-list">
			<view class="househoid-mess clear" v-for="(item,index) in householdList" :key="index">
				<view class="profile fl">
					<image :src="url + item.faceImage" mode="aspectFill"></image>
				</view>
				<view class="fl">
					<view class="nickname">
						{{item.name}}
					</view>
					<view class="sex" v-if="item.gender == 0">
						男
					</view>
					<view class="sex" v-else-if="item.gender == 1">
						女
					</view>
					<view class="sex" v-if="item.gender == -1">
						未设置
					</view>
				</view>
				<view class="room fl">
					{{item.roomName}}
				</view>
				<view class="delete fr">
					删除
				</view>
			</view>
		</view>
	</view>
</template>

<script>
let currPage = 1;
export default {
	data() {
		return {
			keywordSearch: "",
			householdList: [],
		};
	},
	computed: {
		manypage() {
			return this.$t('manypage');
		}
	},
	onLoad() {
		this.url = 'https://oss.thinmoo.com';
		this.getHouseholdList();
		// uni.chooseLocation({
		//     success: function (res) {
		//         console.log('位置名称：' + res.name);
		//         console.log('详细地址：' + res.address);
		//         console.log('纬度：' + res.latitude);
		//         console.log('经度：' + res.longitude);
		//     }
		// });
	},
	methods: {
		getHouseholdList(){
			this.$req.request({
				url: "/persEmpHousehold/app/list",
				method: "POST",
				data: {
					pageSize: 10,
					currPage: currPage,
					communityId: this.$getUserInfo().currentCommunity.id,
				},
				isShowLoading: false, // 值为false时，不显示uni.showLoading
				success: (res) => {
					if (res.code === 0) {
						currPage++;
						this.householdList = this.householdList.concat(res.data.list);
						// this.discountList.forEach(item =>{
						// 	item.invaildTimeSec = (item.invaildTimeSec) / 60 / 60;
						// 	if(item.disRate > 0){
						// 		item.disRate = item.disRate*10
						// 	}else if(item.disRate == 1){
						// 		item.disRate = 10
						// 	}
							
						// })
					}
				},
			});
		},
	}
};
</script>

<style lang="scss" scoped>
	uni-page-body{
		background: #F5F5F5;
	}
	.search-warp {
		width: 100%;
	}
	.search-box {
		background: #d1d1d1;
		padding: 15upx 20upx;
	}
	.search {
		text-align: center;
		font-size: 30upx;
		width: 100%;
		height: 60upx;
		background: #FFFFFF;
		border-radius: 20upx;
		position: relative;
	}
	.search-img{
		position: absolute;
		width: 50upx;
		height: 50upx;
		top: 20upx;
		left: 30upx;
	}
	.title{
		padding: 15upx 20upx;
	}
	.title .fl{
		font-size: 32upx;
	}
	.title .fr{
		color: #088b68;
		line-height: 56upx;
	}
	.househoid-list{
		background: #fff;
	}
	.househoid-mess{
		padding: 20upx 30upx;
		border-bottom: 1px solid #eee;
	}
	.profile{
		width: 90upx;
		height: 90upx;
		margin-right: 20upx;
	}
	.profile image{
		width: 100%;
		height: 100%;
	}
	.nickname{
		width: 120upx;
		color: #088b68;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.sex{
		line-height: 30upx;
	}
	.room{
		line-height: 40upx;
		margin-top: 28upx;
		margin-left: 20upx;
	}
	.delete{
		line-height: 40upx;
		margin-top: 30upx;
	}
</style>
