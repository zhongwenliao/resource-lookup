<template>
	<uni-base-page class="select-area-view">
		<!-- <view class="select-area-view"> -->
		<!-- 地区搜索 -->
		<!-- <view class="area-search-view">
			<view class="search-input-view">
				<uni-icons type="search" size="30" class="search-icon" />
				<input type="text" v-model="searchAreaData" class="search-input" placeholder="请输入" />
			</view>
		</view> -->
		<uni-search @input="onInput" />
		<!-- 显示选中的字母 -->
		<view v-if="isShowLetter" id="show-letter" class="show-letter">
			<span>{{ letter }}</span>
		</view>
		<!-- 地区索引查询 -->
		<view class="shortcut shortcut-hook" @touchstart="clickLetter" v-if="searchAreaData.length === 0">
			<view class="letter-view">
				<view v-for="(area, index) in areaList" :data-anchor="`${area.name.substr(0, 1)}-${index}`" :key="index" class="letter-item">{{ area.name.substr(0, 1) }}</view>
			</view>
		</view>
		<!-- 地区列表 -->
		<view class="area-container-view">
			<view class="area-list list-view">
				<template v-if="searchAreaData.length === 0">
					<view class="area-list-view" v-if="isShowAll">
						<view class="hot-area-view">
							<view class="hot-area-list-view" @click="chooseArea({ name: '所有', value: '0' })">{{ '所有' }}</view>
						</view>
					</view>
					<view class="area-list-view">
						<text class="area-letter-text" id="text-0">热门</text>
						<view class="hot-area-view">
							<view class="hot-area-list-view" v-for="(area, index) in areaList[0]['areas']" @click="chooseArea(area)" :key="index">
								{{ currentLanguage === 'zh-CN' ? area.name : area.en || area.pinyin }}
							</view>
						</view>
					</view>
					<view class="area-list-view" v-for="(area, index) in areaList" :key="index" v-if="index !== 0">
						<text class="area-letter-text" :id="`text-${index}`">{{ area.name }}</text>
						<view class="area-name-view" v-for="(d, i) in area.areas" @click="chooseArea(d)" :key="i">
							{{ currentLanguage === 'zh-CN' ? d.name : d.en || d.pinyin }}
						</view>
					</view>
				</template>
				<template v-else-if="searchAreaList.length > 0">
					<view class="area-list-view">
						<view class="area-name-view" v-for="(area, index) in searchAreaList" @click="chooseArea(area)" :key="index">
							{{ currentLanguage === 'zh-CN' ? area.name : area.en || area.pinyin }}
						</view>
					</view>
				</template>
				<view v-else class="no-data-view"><text>没有找到结果，换个关键词试试?</text></view>
			</view>
		</view>
	</uni-base-page>
</template>

<script>
import { cityList, countryAreaList } from '@/common/js/common-data.js';
import uniSearch from '../../components/uni-search/uni-search.vue';
var pageType = 0;
export default {
	name: 'SelectCountryArea',
	components: {
		uniSearch
	},
	data() {
		return {
			searchAreaData: '',
			flag: 0,
			areaList: [],
			letterPosition: [],
			query: null,
			letter: 'A',
			isShowLetter: false,
			currentLanguage: 'zh-CN',
			isShowAll: false
		};
	},
	computed: {
		searchAreaList() {
			var searchAreaData = this.searchAreaData;
			if (searchAreaData === '') {
				return this.areaList;
			} else {
				var searchAreaList = [];
				// console.log(this.searchCityData);
				this.areaList.filter(item => {
					if (item.name.indexOf('★') === -1) {
						var areas = item.areas;
						areas.filter(area => {
							if (area.name.indexOf(searchAreaData) > -1 || area.pinyin.toLowerCase().indexOf(searchAreaData) > -1) {
								searchAreaList.push(area);
							}
						});
					}
				});
				return searchAreaList;
			}
		},
		title() {
			return this.$t('title');
		}
	},
	methods: {
		clickLetter(e) {
			var _this = this;
			var list = e.target.dataset.anchor.split('-');
			var index = parseInt(list[1]);
			this.letter = list[0];
			this.isShowLetter = true;
			setTimeout(() => {
				_this.isShowLetter = false;
			}, 300);
			this.navigatePosition(index);
			// console.log(e.target.dataset);
			// navigatePosition
		},
		navigatePosition(index) {
			var _this = this;
			uni.pageScrollTo({
				duration: 300,
				scrollTop: _this.letterPosition[index]
			});
		},
		onInput(value) {
			uni.log('当前搜索框的值', value);
			this.searchAreaData = value;
		},
		chooseArea(area) {
			var param = {};
			if (pageType == '1') {
				// 国家
				param = {
					phoneTypeNum: area.tel
				};
			} else {
				// 城市
				param = {
					cityName: area.name,
					cityCode: area.value
				};
				uni.setStorageSync('cityInfo', param);
				console.log("城市",uni.getStorageSync('cityInfo'))
			}
			this.$onfire.fire('EventAreaChange', param);
			if(pageType == '3'){
				uni.navigateTo({
					url: "/sub-package1/pages/authentication/choose-community?city=" + area.value  + '&cityName=' + area.name + '&type=3'
				})
			}else{
				uni.navigateBack();
			}
			// this.$navigateBackPrevPage(param);
		}
	},
	onReady() {
		var _this = this;
		var firstPosition = 0;
		this.letterPosition = [];
		this.areaList.map((area, index) => {
			const query = uni.createSelectorQuery().in(this);
			query
				.select('#text-' + index)
				.boundingClientRect(data => {
					// console.log("letter:", letter, "节点离页面顶部的距离为" + data.top);
					var offsetTop = 0;
					if (index == 0) {
						firstPosition = data.top;
					} else {
						offsetTop = data.top - firstPosition;
					}
					// var offsetTop = data.top;
					_this.letterPosition.push(offsetTop);
				})
				.exec();
		});
		// console.log("letterPosition", this.letterPosition);
		// this.letterPosition[0] = 0;
	},
	onLoad(options) {
		pageType = options.type;
		if (options.isShowAll && JSON.parse(options.isShowAll)) {
			this.isShowAll = true;
		}
		this.currentLanguage = this.$getAppInfo().language;
		var title = '';
		if (pageType == '1') {
			// 国家选择页面
			this.areaList = countryAreaList;
			title = this.title['country-select'];
		} else {
			// 城市选择页面
			this.areaList = cityList;
			title = this.title['city-select'];
		}
		this.$setTitle(title);
		// uni.setNavigationBarTitle({
		// 	title: title
		// });
	}
};
</script>

<style>
.select-area-view {
	width: 100%;
	height: 100%;
	background: #ffffff;
}
/*显示点击是哪个字母*/
.select-area-view .show-letter {
	position: fixed;
	color: #105eae;
	width: 50px;
	height: 50px;
	top: 45%;
	left: 45%;
	border-radius: 50%;
	border: #105eae 1px solid;
	text-align: center;
	display: block;
}
.show-letter span {
	width: 50px;
	height: 50px;
	line-height: 50px;
	font-size: 30px;
}

.shortcut-hook {
	position: fixed;
	right: 20upx;
}

.letter-view {
	width: auto;
	top: 0;
	padding: 80upx 0 0;
}
.letter-view .letter-item {
	height: 36upx;
	padding-top: 6upx;
	padding-left: 24upx;
	text-align: center;
	font-size: 30upx;
	color: #1e90ff;
}

.letter-ul-view {
	list-style-type: none;
}
.letter-li-view {
	color: #105eae;
	font-size: inherit;
}
.letter-li-view .right-letter {
	display: inline-block;
	padding: 10upx;
}
.area-container-view {
	padding-top: 90upx;
	background-color: #ffffff;
	width: 100%;
	height: 100%;
	overflow: hidden;
}
.area-list {
	width: 90%;
	padding: 0upx 20upx 20upx 20upx;
	height: 100%;
	overflow: auto;
	background: #ffffff;
}
.hot-area-view {
	overflow: hidden;
}
.hot-area-list-view {
	display: block;
	width: 29%;
	height: 40px;
	float: left;
	text-align: center;
	line-height: 40px;
	color: #afafaf;
	margin-top: 10px;
	margin-right: 3%;
	border: 1px solid #eee;
	border-radius: 5px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
	.hot-area-list-view::active {
		background: #f0f0f0;
	}

.area-list-view {
	width: 100%;
}
.area-letter-text {
	font-size: 20px;
	display: inline-block;
	padding-top: 15px;
	padding-bottom: 5px;
	border-bottom: 1px solid #e8ecf1;
	width: 100%;
}

.area-name-view {
	color: #afafaf;
	width: 95%;
	min-height: 50px;
	line-height: 50px;
	border-bottom: 1px solid #e8ecf1;
	cursor: pointer;
	}
	.area-name-view::active {
		background: #f0f0f0;
	}

.no-data-view {
	margin-top: 50%;
}
</style>
