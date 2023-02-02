<template>
	<view class="content">
		<view class="nuter">
			<view :class="target==0?'active':''" @click="setIndex" data-index="0">
			 	<!-- {{identityAuthentication['identity-verification']}} -->审核
			</view>
			<view :class="target==1?'active':''" @click="setIndex" data-index="1">
					<!-- {{identityAuthentication['approved-memo']}} -->审核记录
			</view>
		</view>
		<swiper 
		:style="[{height: windowHeight + 'px'}]"
		:duration="500" 
		:current="thisindex"  
		:data-index='thisindex' 
		@change="toggle"
		circular>
			<swiper-item>
				<view class="selector">
					<view class="search-box" @tap.stop>
						<u-icon name="search"></u-icon>
						<!-- :placeholder="identityAuthentication['placeholder']" -->
						<input type="text" confirm-type="search" @confirm="onSearch" class="search" v-model="searchVal" placeholder="请输入标题,内容" />
						<image v-show="searchVal" @tap="clearSearch" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/search-del.png" style="width: 30upx;height: 30upx;" mode=""></image>
					</view>
				</view>
				<!-- 按顺序对应第一个的内容 -->
				<scroll-view  @scrolltolower ="onRestore" lower-threshold="100" scroll-y style="height: 100%;width: 100%;">
				<view v-if="discountsAudit.length > 0" class="swiper_item_1 swiper-item-content">
					<view v-for=" item in discountsAudit" class="swiper_item_1_item">
						<view class="title">
							{{item.name}}
						</view>
						<view class="personInfo clear">
							<view class="appUserAvatar fl">
								<image v-if="item.appUserAvatar" :src="item.appUserAvatar"></image>
								<image v-else src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/user-avatar.png"></image>
							</view>
							<view class="fl">
								<view class="appUserName">
									{{item.appUserName}}
								</view>
								<view class="time">
									{{item.createTime}}
								</view>
							</view>
						</view>
						<view class="imgBox" v-if="item.imgSrcList">
							<view class="picture" v-for="(imgSrc, srcIndex) in item.imgSrcList" :key="srcIndex" v-if="imgSrc"
								:style="{'background-image':'url(' + imgSrc + ')'}">
							</view>
						</view>
						<view v-else class="dis-content" v-html="item.content"></view>
						<view class="dis-search" @click="searchDetails(item)">
							查看详情
						</view>
					</view>
				</view>
				<uni-empty-page v-else></uni-empty-page>
				<view style="height: 100upx;"></view>
				<view style="height: 100upx;"></view>
				</scroll-view>
			</swiper-item>
			<swiper-item>
				<!-- 按顺序对应第二个的内容 -->
				<view class="rightTheLeft" style="width: calc( 100% - 40upx ) ; background-color: #FFFFFF;margin: 10upx 0;padding: 20upx 20upx;">
					<view style="width: 92%;" class="search-box" @tap.stop>
						<u-icon name="search"></u-icon>
						<input type="text" confirm-type="search" @confirm="onSearch" class="search" v-model="searchVal" placeholder="请输入标题,内容" />
						<image v-show="searchVal" @tap="clearSearch" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/search-del.png" style="width: 30upx;height: 30upx;" mode=""></image>
					</view>
					<picker mode="multiSelector" :value="multiIndex" :range="multiArray" @change="dataBindPickerChange" @columnchange="bindColumnChange" id='0'>
						<view class="" style="display: flex; align-items: center;">
							<image style="width: 30upx; height: 35upx;" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/rili.png" mode=""></image>
						</view>
					</picker>
				</view>
				<scroll-view  @scrolltolower ="onRestore" lower-threshold="100" scroll-y style="height: 100%;width: 100%;" >
				<view v-if="discountsAudit.length > 0" class="swiper_item_1 swiper-item-content">
					<view v-for=" item in discountsAudit" class="swiper_item_1_item">
						<view class="title">
							{{item.name}}
							<text class="audit-status" v-if="item.status == 1">已通过</text>
							<text class="audit-status" v-if="item.status == 2">未通过</text>
						</view>
						<view class="personInfo clear">
							<view class="appUserAvatar fl">
								<image v-if="item.appUserAvatar" :src="item.appUserAvatar"></image>
								<image v-else src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/user-avatar.png"></image>
							</view>
							<view class="fl">
								<view class="appUserName">
									{{item.appUserName}}
								</view>
								<view class="time">
									{{item.createTime}}
								</view>
							</view>
						</view>
						<view class="imgBox" v-if="item.imgSrcList">
							<view class="picture" v-for="(imgSrc, srcIndex) in item.imgSrcList" :key="srcIndex" v-if="imgSrc"
								:style="{'background-image':'url(' + imgSrc + ')'}">
							</view>
						</view>
						<view v-else class="dis-content" v-html="item.content"></view>
					</view>
				</view>
				<uni-empty-page v-else></uni-empty-page>
				<view style="height: 100upx;"></view>
				<view style="height: 100upx;"></view>
				</scroll-view>
			</swiper-item>
		</swiper>
		
	</view>
</template>

<script>
	import uniEmptyPage from '../../../../components/uni-empty-page/uni-empty-page.vue'
	const date = new Date();
	const years = [];
	const months = [];
	const days = [];
	const hours = [];
	const minutes = [];
	//获取年
	for (let i = date.getFullYear(); i <= date.getFullYear() + 20; i++) {
		years.push("" + i);
	}
	//获取月份
	for (let i = 1; i <= 12; i++) {
		if (i < 10) {
			i = "0" + i;
		}
		months.push("" + i);
	}
	//获取日期
	for (let i = 1; i <= 31; i++) {
		if (i < 10) {
			i = "0" + i;
		}
		days.push("" + i);
	}
	//获取小时
	for (let i = 0; i < 24; i++) {
		if (i < 10) {
			i = "0" + i;
		}
		hours.push("" + i);
	}
	//获取分钟
	for (let i = 0; i < 60; i++) {
		if (i < 10) {
			i = "0" + i;
		}
		minutes.push("" + i);
	}
	let currPage = 1;
	export default {
		components: {
			uniEmptyPage
		},
		// 只要上面的选项跟下面的swiper-item个数相同，直接加上面的个数，下面的会自动对应显示，很简便，拿来就能用
		data() {
			const currentDate = this.getDate({
				format: true
			})
			return {
				// 当前样式
				target:0,
				// 当前item位置
				thisindex:0,
				index: 0,
				heighta:'',
				txt:"",
				date: currentDate,
				startDate: '',
				multiArray: [years, months, days],
				multiIndex: [0, new Date().getMonth(), new Date().getDate() - 1, new Date().getHours(), new Date().getMinutes()],
				windowHeight: 500,
				communityIdL: '',
				discountsAudit: [],
				status: 0,
				dataItem: {},
				searchVal: '',
				createDate:'',
				url: "",
				imgList:[],
				imgSrcList:[],
			}
		},
		computed: {
			myhouse() {
				return this.$t("house");
			},
			articleRelease() {
				return this.$t("article-release");
			},
			logout() {
				return this.$t("logout");
			},
			common() {
				return this.$t("common")
			}
		},
		onLoad() {
			this.url = 'https://oss.thinmoo.com';
			uni.getSystemInfo({
				success: (res) => {
					let windowHeight = res.windowHeight;
					this.windowHeight = windowHeight -40;
				}
			})
			this.communityId = uni.getStorageSync('userInfo').currentCommunity.id;
			currPage = 1;
			this.discountsAuditList()
			
		},
		onReady() {
			var startDate = new Date();
			var start = this.getSystemTime(startDate)[0];
		},
		watch: {
			txt(txt) {
				if( txt.indexOf('\n') != -1 ){ //敲了回车键了
				   uni.hideKeyboard() //收起软键盘
				}
			}
		},
		methods: {
			// 查看详情
			searchDetails(item){
				uni.setStorageSync("auditDetails", item);
				uni.navigateTo({
					url: "/sub-package/pages/property/audit-details/audit-details"
				})
			},
			// 预览图片
			previewImage(src) {
				let imageList = src.split(',');
				uni.previewImage({
					urls: imageList,
					current: src,
					loop: true
				});
			},
			// 键盘搜索
			onSearch() {
				this.discountsAudit = [];
				currPage = 1;
				this.discountsAuditList()
				// 收起键盘
				uni.hideKeyboard()
			},
			// 清除搜索框
			clearSearch() {
				currPage = 1;
				this.searchVal = '';
				this.discountsAudit = [];
				this.discountsAuditList()
			},
			discountsAuditList() {
				let pageSize = 5;
				let params = {
					currPage: currPage, //当前页数
					pageSize: pageSize,//每页记录数
					status: this.status, //审核状态【0：待审核；1：审核通过；2：驳回】
					communityId: this.communityId, //小区id
					keywordSearch: this.searchVal,//搜索【姓名、手机号、身份证、楼栋名称、房间名称】
					createDate: this.createDate
				}
				this.$req.request({
					url: "/omCoupon/app/listByWyEmp",
					data: params,
					isShowLoading: false,
					success: res => {
						if(res.code == 0) {
							if( res.data.list.length > 0 ) {
								currPage++;
								this.discountsAudit = this.discountsAudit.concat(res.data.list);
								for (var i = 0; i < this.discountsAudit.length; i++) {
									if(this.discountsAudit[i].appUserAvatar){
										this.discountsAudit[i].appUserAvatar = this.url + this.discountsAudit[i].appUserAvatar;
									}
									if(this.discountsAudit[i].content.match(this.$regExp.imgRegExp) !=null){
										this.imgList.push(this.getObjectKeys(this.discountsAudit[i].content.match(this.$regExp.imgRegExp)));
										this.discountsAudit[i].imgSrcList = this.imgList[i].join(",").replace(/src=/g, "").replace(/"/g, "").split(",");
									}
									// console.log("文本框",this.discountsAudit[i].content.match(this.$regExp.imgRegExp));
								}
							}
						}
					}
				});
			},
			//处理富文本框回来的数据
			getObjectKeys(object) {
				let values = [];
				for (let property in object) {
					values.push(object[property]);
				}
				return values;
			},
			//上拉加载
			onRestore() {
				this.discountsAuditList()
			},
			unreviewedBindPickerChange(e) {
				// console.log('picker发送选择改变，携带值为', e.target.value)
				this.index = e.target.value;
				currPage = 1;
				this.discountsAudit = []
				this.discountsAuditList()
			},
			//日期选择器
			bindDateChange(e) {
				this.date = e.target.value
			},
			getDate(type) {
				const date = new Date();
				let year = date.getFullYear();
				let month = date.getMonth() + 1;
				let day = date.getDate();
	
				if (type === 'start') {
					year = year - 60;
				} else if (type === 'end') {
					year = year + 2;
				}
				month = month > 9 ? month : '0' + month;;
				day = day > 9 ? day : '0' + day;
				return `${year}-${month}-${day}`;
			},
			// 切换触发的事件
			toggle(e){
				let index = e.detail.current
				this.target = index
				this.thisindex = index
				if( this.thisindex === 0 ) {
					this.createDate = ''
					this.status = 0
				}else {
					this.status = -1;
				}
				currPage = 1;
				this.discountsAudit = []
				this.discountsAuditList()
			},
			// 点击nav控制下面的展示
			setIndex(e){
				let index = e.currentTarget.dataset.index
				this.thisindex = index
			},
			//监听picker的滚动事件
			bindColumnChange(e) {
				//获取年份
				if (e.detail.column == 0) {
					this.chooseYear = this.multiArray[e.detail.column][e.detail.value];
					if (e.detail.column == 1) {
						let num = parseInt(this.data.multiArray[e.detail.column][e.detail.value]);
						let temp = [];
						if (num == 1 || num == 3 || num == 5 || num == 7 || num == 8 || num == 10 || num == 12) { //判断31天的月份
							for (let i = 1; i <= 31; i++) {
								if (i < 10) {
									i = "0" + i;
								}
								temp.push("" + i);
							};
							this.multiArray[2] = temp;
						} else if (num == 4 || num == 6 || num == 9 || num == 11) { //判断30天的月份
							for (let i = 1; i <= 30; i++) {
								if (i < 10) {
									i = "0" + i;
								}
								temp.push("" + i);
							};
							this.multiArray[2] = temp;
						} else if (num == 2) { //判断2月份天数
							let year = parseInt(this.chooseYear);
							if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) {
								for (let i = 1; i <= 29; i++) {
									if (i < 10) {
										i = "0" + i;
									}
									temp.push("" + i);
								}
								this.multiArray[2] = temp;
							} else {
								for (let i = 1; i <= 28; i++) {
									if (i < 10) {
										i = "0" + i;
									}
									temp.push("" + i);
								}
								this.multiArray[2] = temp;
							}
						}
					}
					var data = {
						multiArray: this.multiArray,
						multiIndex: this.multiIndex
					};
					data.multiIndex[e.detail.column] = e.detail.value;
					this.data = data;
				}
			
			},
			dataBindPickerChange(e) {
				this.multiIndex = e.detail.value;
				const index = this.multiIndex;
				const year = this.multiArray[0][index[0]];
				const month = this.multiArray[1][index[1]];
				const day = this.multiArray[2][index[2]];
				if (e.currentTarget.id == 0) {
					this.startDate = year + '-' + month + '-' + day,
					// console.log(this.startDate)
					currPage = 1;
					this.createDate = this.startDate;
					this.discountsAudit = [];
					this.discountsAuditList()
				} 
			},
			//获取系统时间
			getSystemTime(visitTime) {
				var curyear = visitTime.getFullYear();
				var curmonth = visitTime.getMonth() + 1;
				var curday = visitTime.getDate();
				if (curmonth >= 1 && curmonth <= 9) {
					curmonth = "0" + curmonth;
				};
				if (curday >= 1 && curday <= 9) {
					curday = "0" + curday;
				};
				var curhour = visitTime.getHours();
				if (curhour >= 0 && curhour <= 9) {
					curhour = "0" + curhour;
				};
				var curminute = visitTime.getMinutes();
				if (curminute >= 0 && curminute <= 9) {
					curminute = "0" + curminute;
				};
				var currentDate = curyear + '-' + curmonth + '-' + curday;
				var formedDate = curyear + curmonth + curday + curhour + curminute + "00";
				var dateArr = [currentDate, formedDate];
				return dateArr;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.content{
		width: 100%;
		padding-top: 10upx;
	}
	.textarea{
	    border: solid 1px #9A9A9A;
		border-radius: 10upx;
		padding: 20upx;
		width: calc( 100% - 40upx );
		height: 140upx;
	}
	.swiper_item_1_item{
		border-radius: 20upx;
		margin: 0 10upx;
		padding-bottom: 20upx;
	}
	.title{
		border-bottom: 1px solid #eee;
		text-align: left;
		padding: 10upx 20upx;
		font-size: 30upx;
		position: relative;
	}
	.audit-status{
		position: absolute;
		top: 10upx;
		right: 20upx;
		font-size: 28upx;
		color: rgb(22,155,213);
	}
	.personInfo{
		padding: 20upx;
		.fl{
			text-align: left;
		}
	}
	.appUserName{
		color: #088b68;
		font-size: 26upx;
		margin-left: 20upx;
		margin-top: -8upx;
	}
	.time{
		color: #C0C0C0;
		font-size: 24upx;
		margin-left: 20upx;
		margin-top: -5upx;
	}
	.appUserAvatar{
		width: 60upx;
		height: 60upx;
	}
	.appUserAvatar image{
		width: 100%;
		height: 100%;
		display: block;
		border-radius: 50%;
	}
	.dis-content{
		text-align: left;
		padding-left: 20upx;
		// img{
		// 	display: inline-block;
		// 	width: 33%;
		// }
	}
	.imgBox {
		display: flex;
		.picture {
			margin: 0upx 16upx;
			width: 200upx;
			height: 200upx;
			border: 1px solid #eee;
			background-position: center center;
			background-size: cover;
			background-repeat: no-repeat;
		}
	}
	.dis-search{
		text-align: right;
		padding: 20upx 20upx 0 0;
		color: rgb(22,155,213);
	}
	.swiper_item_2 {
		&_filter_column {
			&_left {
				display: flex;
				justify-content: space-between;
			}
			&_right {
				display: flex;
			}
		}
	}
	.swiper_item_1 {
		width: 100%;
		&_item {
			background-color: #FFFFFF;
			margin-bottom: 20upx;
			&_button {
				text-align: right;
				padding: 0 30upx;
			}
			button:first-child {
				margin-right: 20upx;
			}
		}
	}
	.selector {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: calc(100% - 40upx);
		margin: 10upx auto;
		padding: 20upx 20upx;
		background: #FFFFFF;
		// box-shadow: 0px 7px 7px -7px #5E5E5E; 
	}
	.nuter{
		width: 100%;
		height: 80upx;
		display: flex;
		justify-content: space-around;
		font-size: 35upx;
	}
	.nuter view{
		height: 80upx;
		line-height: 80upx;
		flex: 1;
		font-size: 30upx;
		text-align: center;
		transition: all 0.5s ease .1s;
		background-color: #FFFFFF;
	}
	.active{
		box-sizing: border-box;
		color: #09BB07;
		border-bottom: 5rpx solid #09BB07;
		background-color: #f3ffff;
		box-shadow: 3px 3px 5px #888888;
	}
	swiper-item{
		width: 100%;
		overflow: hidden;
		text-align: center;
		line-height: 300rpx;
	}
	.swiper-item{
		overflow-y: scroll;
		width: 99.5%;
		height: 99%;
		box-sizing: border-box;
		padding: 1rpx;
	}
	.search-box {
		width: 100%;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(245, 245, 245, 1);
		border-radius: 30rpx;
		.search {
			width: 88%;
			text-align: center;
			font-size: 28rpx;
		}
	}
</style>
