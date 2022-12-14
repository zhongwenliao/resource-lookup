<template>
	<uni-base-page class="epidemic-prevention-search-page">
		<view class="search uni-flex" style="align-items: center;margin-bottom:20upx;padding:20upx;background-color:#0A98D5;">
			<view class="uni-flex  bg-white" style="flex: 1;padding: 10upx 30upx;border-radius: 80upx;align-items: center;">
				<picker :range="searchType" @change="change">
					<view style="display: flex;align-items: center;">{{searchType[index]}}<text class="uni-icon uni-icon-arrowdown"
						 style="font-size: 16px;height: 16px;padding-left: 10upx;"></text></view>
				</picker>
				<input type="text" v-model="keywordSearch" :placeholder="'请输入搜索的'+searchType[index]" style="flex:1" @confirm="search" v-if="index<2"/>
				<view style="display: flex;align-items: center;flex: 1;" v-if="index==2">
					<input type="text" disabled="true" v-model="startDate" placeholder="开始日期" style="border-bottom: 1px solid #d1d1d1;padding-left: 10upx;" id="startDate" @click="openCalendar('1')"/>
					<text style="padding: 0 10px;">至</text>
					<input type="text" disabled="true" v-model="endDate" placeholder="结束日期" style="border-bottom: 1px solid #d1d1d1;padding-left: 10upx;" id="endDate" @click="openCalendar('2')"/>
				</view>
				<text class="uni-icon uni-icon-search" style="color: #999999;font-size: 24px;" @tap="search"></text>
			</view>

		</view>
		<uni-list>
			<uni-list-item v-for="(item,index) in members" :key="index" @click="openDetail(item)" :title="item.name" :note="item.address"></uni-list-item>
		</uni-list>
		<view class="uni-flex" style="justify-content: center;padding: 10upx;">
			{{contentText[loadingType]}}
		</view>
		<uni-calendar ref="calendar" :date="info.date" :insert="info.insert" :lunar="info.lunar" :startDate="info.startDate" :endDate="info.endDate" :range="info.range" @confirm="confirm" />
	</uni-base-page>
</template>

<script>
	var _this;
	import uniCalendar from "../../components/uni-calendar/uni-calendar.vue";
	import uniListItem from "../../components/uni-list-item/uni-list-item.vue";
	export default {
		components: {
			uniCalendar,
			uniListItem
		},
		data() {
			return {
				keywordSearch: '',
				members: [],
				currPage: 1,
				exportList: [],
				loadingType: 0,
				index: 0,
				searchType: ['姓名', '手机', '日期'],
				showCalendar: false,
				selectedDate: '1',
				startDate: '',
				endDate: '',
				info: {
					startDate: '2019-12-01',
					endDate: '2025-10-15',
					lunar: true,
					range: true,
					insert: false,
					selected: []
				},
				contentText: ["上拉显示更多", "正在加载...", "没有更多数据了"]
			}
		},
		onLoad() {
			_this = this;
		},
		onShow() {
			this.reload();
		},
		onReachBottom() {
			this.currPage++;
			if(this.loadingType !== 0) {
				return;
			}
			this.loadingType = 1;
			this.load();
		},
		methods: {
			change: function(e) {
				this.index = e.detail.value;
				// if (this.index == 2) {
				// 	this.openCalendar();
				// }
			},
			openCalendar: function(type) {
				this.selectedDate = type;
				this.$refs.calendar.open();
			},
			confirm: function(res) {
				console.log("res", res.fulldate);
				if(this.selectedDate === '1') {
					this.startDate = res.fulldate;
				}else {
					this.endDate = res.fulldate;
				}
				// this.search();
			},
			search: function() {
				uni.debugLog("关键字", this.keywordSearch);
				_this.reload();
			},
			load: function() {
				var _this = this;
				var index = this.index;
				var param = {};
				if(index == 0) {
					param["name"] = this.keywordSearch;
				}else if(index == 1) {
					param["phone"] = this.keywordSearch;
				}else {
					param["startDate"] = this.startDate || this.info.startDate;
					param["endDate"] = this.endDate || this.info.endDate;
				}
				this.$req.request({
					url: "/persDiseaseRegiste/app/list",
					method: "GET",
					data: {
						"currPage": this.currPage,
						...param
					},
					header: {
						"content-type": "application/x-www-form-urlencoded"
					},
					success(res) {
						uni.stopPullDownRefresh();
						_this.members = res.data.list;
					}
				});
			},
			openDetail: function(item) {
				uni.navigateTo({
					url: `./member-detail?item=${encodeURIComponent(JSON.stringify(item))}`
				});
			},
			reload: function() {
				_this.currPage = 1;
				_this.loadingType = 0;
				_this.members = [];
				_this.load();
			}
		}
	}
</script>

<style lang="scss">
	.epidemic-prevention-search-page {
		width: 100%;
		background-color: #EEEEEE;
	}
	.fixed {
		position: fixed;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: space-between;
		flex-direction: column;
	}

	.flex-sub {
		flex: 1;
	}

	.bg-white {
		background-color: white;
	}
</style>
