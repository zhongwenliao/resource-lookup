<template>
	<view class="content">
		<view class="nuter">
			<view :class="target==0?'active':''" @click="setIndex" data-index="0">
			 	{{identityAuthentication['identity-verification']}}
			</view>
			<view :class="target==1?'active':''" @click="setIndex" data-index="1">
					{{identityAuthentication['approved-memo']}}
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
						<input type="text" confirm-type="search" @confirm="onSearch" class="search" v-model="searchVal" :placeholder="identityAuthentication['placeholder']" />
						<image v-show="searchVal" @tap="clearSearch" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/search-del.png" style="width: 30upx;height: 30upx;" mode=""></image>
					</view>
				</view>
				<!-- 按顺序对应第一个的内容 -->
				<scroll-view  @scrolltolower ="onRestore" lower-threshold="100" scroll-y style="height: 100%;width: 100%;">
				<view v-if="dataPersIdentityAuthList.length > 0" class="swiper_item_1 swiper-item-content">
					<view v-for=" item in dataPersIdentityAuthList" class="swiper_item_1_item">
						<view class="room_name">
							{{item.buildingName}}
						</view>
						<view class="pad_20">
							<view class="clear">
								<view class="width150 fl">{{myhouse['name']}}：</view>
								<view class="fl">{{item.realName}}</view>
							</view>
							<view class="clear">
								<view class="width150 fl">{{myhouse['identity']}}：</view>
								<view class="fl" v-if="item.identityType === 1">{{identity['owner']}}</view>
								<view class="fl" v-else-if="item.identityType === 2">{{identity['family']}}</view>
								<view class="fl" v-else-if="item.identityType === 3">{{identity['tenant']}}</view>
								<view class="fl" v-else-if="item.identityType === 4">{{identity['tenant']}}{{identity['family']}}</view>
							</view>
							<view class="clear">
								<view class="width150 fl">{{myhouse['face-img']}}：</view>
								<!-- <text class="width100">{{myhouse['face-img']}}：</text> -->
								<view class="fl">
									<image v-if="item.faceImage" style="height: 180upx; width: 180upx;" :src="item.faceImage" mode="" @click.stop="previewImage(item.faceImage)"></image>
								</view>
							</view>
							<view class="clear">
								<view class="width150 fl">{{myhouse['cert-num']}}：</view>
								<view class="fl">{{item.certNo}}</view>
							</view>
							<view class="clear">
								<view class="width150 fl">{{logout['phone']}}：</view>
								<view class="fl">{{item.phone}}</view>
							</view>
							<view class="clear">
								<view class="width150 fl">{{myhouse['cardNo']}}：</view>
								<view class="fl">{{item.cardNo}}</view>
							</view>
							<view class="clear">
								<view class="width150 fl">{{myhouse['create-time']}}：</view>
								<view class="fl">{{item.createTime}}</view>
							</view>
						</view>
						<view v-if=" item.reviewStatus === 0 " class="swiper_item_1_item_button">
							<button size="mini" plain="true" type="default" @click="turnBtn(item)">{{myhouse['review-rejected']}}</button>
							<button size="mini" type="primary" @click="passBtn(item)">{{articleRelease['adopt']}}</button>
						</view>
					</view>
				</view>
				<uni-empty-page v-else></uni-empty-page>
				<view class="height100"></view>
				<view class="height100"></view>
				</scroll-view>
			</swiper-item>
			<swiper-item>
				<!-- 按顺序对应第二个的内容 -->
				<view class="rightTheLeft" style="width: calc( 100% - 40upx ) ; background-color: #FFFFFF;margin: 10upx 0;box-shadow: 0px 7px 7px -7px #5E5E5E; padding: 20upx 20upx;">
					<view style="width: 92%;" class="search-box" @tap.stop>
						<u-icon name="search"></u-icon>
						<input type="text" confirm-type="search" @confirm="onSearch" class="search" v-model="searchVal" :placeholder="identityAuthentication['placeholder']" />
						<image v-show="searchVal" @tap="clearSearch" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/search-del.png" style="width: 30upx;height: 30upx;" mode=""></image>
					</view>
					<picker mode="multiSelector" :value="multiIndex" :range="multiArray" @change="dataBindPickerChange" @columnchange="bindColumnChange" id='0'>
						<view class="" style="display: flex; align-items: center;">
							<!-- <text style="margin-right: 10upx;">{{ startDate }}</text> -->
							<image style="width: 30upx; height: 35upx;" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/rili.png" mode=""></image>
						</view>
					</picker>
				</view>
				<scroll-view  @scrolltolower ="onRestore" lower-threshold="100" scroll-y style="height: 100%;width: 100%;" >
				<view v-if="dataPersIdentityAuthList.length > 0" class="swiper_item_1 swiper-item-content">
					<view v-for=" item in dataPersIdentityAuthList" class="swiper_item_1_item">
						<view class="room_name">
							{{item.buildingName}}
							<text :style="{color:item.reviewStatus == 1? '#FFFFFF' : '','color':item.reviewStatus == 1? '#169BD5' : '',padding: '2upx 16upx'}" class="borderRadius12">
								{{item.reviewStatus == 1? myhouse['apply-status'][2] : myhouse['apply-status'][3]}}
							</text>
						</view>
						<view class="pad_20">
							<view class="clear">
								<view class="width150 fl">{{myhouse['name']}}：</view>
								<view class="fl">{{item.realName}}</view>
							</view>
							<view class="clear">
								<view class="width150 fl">{{myhouse['identity']}}：</view>
								<view class="fl" v-if="item.identityType === 1">{{identity['owner']}}</view>
								<view class="fl" v-else-if="item.identityType === 2">{{identity['family']}}</view>
								<view class="fl" v-else-if="item.identityType === 3">{{identity['tenant']}}</view>
								<view class="fl" v-else-if="item.identityType === 4">{{identity['tenant']}}{{identity['family']}}</view>
							</view>
							<view class="clear">
								<view class="width150 fl">{{myhouse['face-img']}}：</view>
								<!-- <text class="width100">{{myhouse['face-img']}}：</text> -->
								<view class="fl">
									<image v-if="item.faceImage" style="height: 180upx; width: 180upx;" :src="item.faceImage" mode="" @click.stop="previewImage(item.faceImage)"></image>
								</view>
							</view>
							<view class="clear">
								<view class="width150 fl">{{myhouse['cert-num']}}：</view>
								<view class="fl">{{item.certNo}}</view>
							</view>
							<view class="clear">
								<view class="width150 fl">{{logout['phone']}}：</view>
								<view class="fl">{{item.phone}}</view>
							</view>
							<view class="clear">
								<view class="width150 fl">{{myhouse['cardNo']}}：</view>
								<view class="fl">{{item.cardNo}}</view>
							</view>
							<view class="clear">
								<view class="width150 fl">{{myhouse['create-time']}}：</view>
								<view class="fl">{{item.createTime}}</view>
							</view>
							<view class="clear">
								<view class="width150 fl">{{myhouse['review-time']}}：</view>
								<view class="fl">{{item.reviewTime}}</view>
							</view>
							<view class="clear" v-if="item.reviewResult">
								<view class="width150 fl">{{myhouse['reject-reason']}}：</view>
								<view class="fl">{{item.reviewResult}}</view>
							</view>
						</view>
					</view>
				</view>
				<uni-empty-page v-else></uni-empty-page>
				<view class="height100"></view>
				<view class="height100"></view>
				</scroll-view>
			</swiper-item>
		</swiper>
		<!-- 驳回弹窗 -->
		<pop ref="pop" direction="center" :is_close="true" :is_mask="true" :width="86">
			<h3 style="text-align: center;"> {{identityAuthentication['identity-verification']}} </h3>
			<textarea class="textarea mar_bottom_20" v-model="txt" placeholder-style="color:#9A9A9A" :placeholder="myhouse['reject-reason']"/>
			<view class="" style="text-align: center;">
				<button class="mar_right_40" @click="popCancelBtn" size="mini" plain type="default">{{common['cancel']}}</button>
				<button @click="submitBtn" size="mini" type="primary">{{common['confirm']}}</button>
			</view>
		</pop>
	</view>
</template>

<script>
	import pop from '../../../components/ming-pop/ming-pop.vue';
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
			pop,
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
				dataPersIdentityAuthList: [],
				reviewStatus: 0,
				dataItem: {},
				searchVal: '',
				createDate:''
			}
		},
		computed: {
			myhouse() {
				return this.$t("house");
			},
			identity() {
				return this.$t("identity");
			},
			articleRelease() {
				return this.$t("article-release");
			},
			logout() {
				return this.$t("logout");
			},
			title() {
				return this.$t("title");
			},
			identityAuthentication() {
				return this.$t("identity-authentication")
			},
			common() {
				return this.$t("common")
			}
		},
		// filters: {
		// 	hideMiddle(val) {
		// 		return `${val.substring(0,3)}****${val.substring(val.length-3)}`
		// 	}
		// },
		onLoad() {
			uni.getSystemInfo({
				success: (res) => {
					// console.log('手机屏幕高度',res.windowHeight)
					let windowHeight = res.windowHeight;
					this.windowHeight = windowHeight -40;
				}
			})
			this.communityId = uni.getStorageSync('userInfo').currentCommunity.id;
			currPage = 1;
			this.persIdentityAuthList()
			
		},
		onReady() {
			this.$setTitle(this.title["identity"]);
			var startDate = new Date();
			var start = this.getSystemTime(startDate)[0];
			// this.startDate = start;
		},
		watch: {
			txt(txt) {
				if( txt.indexOf('\n') != -1 ){ //敲了回车键了
				   uni.hideKeyboard() //收起软键盘
				}
				// console.log(txt)
			}
		},
		methods: {
			// 预览图片
			previewImage(src) {
				console.log("src",src)
				let imageList = src.split(',');
				uni.previewImage({
					urls: imageList,
					current: src,
					loop: true
				});
			},
			// 键盘搜索
			onSearch() {
				console.log('键盘搜索')
				this.dataPersIdentityAuthList = [];
				currPage = 1;
				this.persIdentityAuthList()
				// 收起键盘
				uni.hideKeyboard()
			},
			// 清除搜索框
			clearSearch() {
				this.searchVal = '';
				this.dataPersIdentityAuthList = [];
				this.persIdentityAuthList()
			},
			persIdentityAuthList() {
				let pageSize = 5;
				let params = {
					currPage: currPage, //当前页数
					pageSize: pageSize,//每页记录数
					reviewStatus: this.reviewStatus, //审核状态【0：待审核；1：审核通过；2：驳回】
					communityId: this.communityId, //小区id
					keywordSearch: this.searchVal,//搜索【姓名、手机号、身份证、楼栋名称、房间名称】
					createDate: this.createDate
				}
				this.$req.request({
					url: "/persIdentityAuth/app/listByWyEmp",
					data: params,
					isShowLoading: false,
					success: res => {
						if(res.code == 0) {
							if( res.data.list.length > 0 ) {
								currPage++;
								this.dataPersIdentityAuthList = this.dataPersIdentityAuthList.concat(res.data.list);
							}
						}
					}
				});
			},
			//上拉加载
			onRestore() {
				console.log(111)
				this.persIdentityAuthList()
			},
			reviewTenement(id,reviewStatus,reviewResult) {
				let params = {
					communityId: this.communityId, //小区id
					id,
					reviewStatus, //1通过 2驳回
					reviewResult //驳回内容
				}
				this.$req.request({
					url: "/persIdentityAuth/app/reviewTenement",
					data: params,
					success: res => {
						// console.log('zsx1',res)
						if(res.code == 0) {
							this.$showToast(res.msg)
							currPage = 1;
							this.dataPersIdentityAuthList = [];
							this.persIdentityAuthList()
						}
					}
				});
			},
			//通过
			passBtn(item) {
				let that = this;
				uni.showModal({
					title: this.identityAuthentication['identity-verification'],
					content: this.identityAuthentication['whether-passes'] + item.realName + this.identityAuthentication['of'] + this.identityAuthentication['identity-verification'] +'？',
					confirmText: this.common['confirm'],
					cancelText: this.common['cancel'],
					success(res) {
						if (res.confirm) {
							that.reviewTenement(item.id,1)
							console.log('用户点击确定');
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				})
			},
			// 驳回
			turnBtn(item) {
				this.$refs.pop.show();
				this.dataItem = item
				console.log('驳回',this.dataItem.id)
			},
			submitBtn() {
				console.log('提交1')
				// this.txt = '';
				this.popCancelBtn();
				this.reviewTenement(this.dataItem.id,2,this.txt)
			},
			popCancelBtn() {
				this.$refs.pop.close();
			},
			
			unreviewedBindPickerChange(e) {
				console.log('picker发送选择改变，携带值为', e.target.value)
				this.index = e.target.value;
				currPage = 1;
				this.dataPersIdentityAuthList = []
				this.persIdentityAuthList()
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
				// console.log('zsx',this.thisindex)
				if( this.thisindex === 0 ) {
					this.createDate = ''
					this.reviewStatus = 0
				}else {
					this.reviewStatus = -1;
				}
				currPage = 1;
				this.dataPersIdentityAuthList = []
				this.persIdentityAuthList()
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
				// const hour = this.multiArray[3][index[3]];
				// const minute = this.multiArray[4][index[4]];
				if (e.currentTarget.id == 0) {
					this.startDate = year + '-' + month + '-' + day,
					// this.startTime = `${year}${month}${day}${hour}${minute}00`;
					console.log(this.startDate)
					currPage = 1;
					this.createDate = this.startDate;
					this.dataPersIdentityAuthList = [];
					this.persIdentityAuthList()
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
	.clear::before, .clear::after {
		content: "";
		display: block;
		clear: both;
	}
	.mar_bottom_20 {
		margin-bottom: 20upx;
	}
	.mar_right_40 {
		margin-right: 40upx;
	}
	.mar_left_40 {
		margin-left: 40upx;
	}
	.mar_right_20 {
		margin-right: 20upx;
	}
	.mar_left_20 {
		margin-left: 20upx;
	}
	.pad_20 {
		padding: 20upx;
	}
	.width150{
		display: inline-block;
		width: 300upx;
		text-align: right;
	}
	.textarea{
	    border: solid 1px #9A9A9A;
		border-radius: 10upx;
		padding: 20upx;
		width: calc( 100% - 40upx );
		height: 140upx;
	}
	.swiper_item_2 {
		&_filter_column {
			// padding: 20upx 30upx;
			// display: flex;
			// justify-content: space-between;
			&_left {
				// width:calc( 33% - 20upx );
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
	.room_name {
		text-align: left;
		padding: 20upx;
		border-bottom: 1px solid #CCCCCC;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.audit_result {
		background-color: #169BD5;
		padding: 0 20upx;
		border-radius: 20upx;
		color: #FFFFFF;
	}
	.arrow-down {
		margin-top: -12upx;
		border-left: 1px solid #000000;
		border-bottom: 1px solid #000000;
		height: 8px;
		width: 8px;
		transform: translate(1px, -1px) rotate(-45deg);
		-webkit-transform: translate(1px, -1px) rotate(-45deg);
		border-right: 1px solid transparent;
		border-top: 1px solid transparent;
		display: inline-block;
		-moz-transform: translate(1px, -1px) rotate(-45deg);
		-ms-transform: translate(1px, -1px) rotate(-45deg);
		-o-transform: translate(1px, -1px) rotate(-45deg);
	}
	.space_between {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.selector {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: calc(100% - 40upx);
		margin: 10upx auto;
		padding: 20upx 20upx;
		background: #FFFFFF;
		box-shadow: 0px 7px 7px -7px #5E5E5E; 
		
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
		// border-radius: 10rpx;
		box-shadow: 3px 3px 5px #888888;
	}
	swiper-item{
		width: 100%;
		overflow: hidden;
		text-align: center;
		line-height: 300rpx;
		/* background-color: red; */
	}
	.swiper-item{
		overflow-y: scroll;
		width: 99.5%;
		height: 99%;
		/* background-color: white; */
		/* height: 99%; */
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
	
		.cuIcon-roundclosefill {
			color: #d5a65a;
			padding: 0 10rpx;
		}
	}
</style>
