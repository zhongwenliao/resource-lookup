<template>
	<!-- #ifndef MP-ALIPAY -->
	<uni-base-page class="content">
	<!-- #endif -->
	<!-- #ifdef MP-ALIPAY -->
	<view class="content">
	<!-- #endif -->
	<u-navbar class="navbar" title="访客授权" :border-bottom="false">
		<view slot="right">
			<view @click="goToVisHistory">{{ vis["vis-history"] || "历史记录" }}</view>
		</view>
	</u-navbar>
	<!-- 访客授权   预约审核-->
	<!-- <view class="vis-tab">
		<view style="display: inline-block;width: 50%;" @click="tabSwitch(0)">
			<text :class="0 == visIndex ? 'tabactive' : 'taberr'">{{ appointment["vis-authorization"] || "访客授权" }}</text>
		</view>
		<view style="display: inline-block;width: 50%;" @click="tabSwitch(1)">
			<text :class="1 == visIndex ? 'tabactive' : 'taberr'">{{ appointment["appoint-review"] || "预约审核" }}</text>
		</view>
	</view> -->
	<!-- 访客授权 -->
	<!-- v-show="visAuth" -->
	<view class="vis-auth" v-show="visAuth">
	<!-- #ifndef MP-ALIPAY -->
		<!-- <view class="vis-history-btn"><view class="btn-text" @click="goToVisHistory">{{ vis["vis-history"] || "历史记录" }}</view></view> -->
	<!-- #endif -->
		<view class="vis-info">
			<ul>
				<li @click="goToAddress">
					<view class="left-icon">
						<text class="require-text" style="margin-right: 10rpx;">*</text>{{ vis["vis-add"] || "访问地址" }}
					</view>
					<view class="middle">
						<text>{{ authorizedName }}</text>
					</view>
					<view class="right">
						<u-icon name="arrow-right" color="#999999" size="28"></u-icon>
					</view>
				</li>
				<li>
					<view class="left-icon">
						<text class="require-text" style="margin-right: 10rpx;"></text>{{ vis["phone"] || "电话" }}
					</view>
					<view class="middle">
						<input style="font-size: 28upx;" :placeholder='`${vis["input-phone"]}` || "请输入访客手机号码"' type='number' @input="getPhoneNum" maxlength="11"></input>
					</view>
					<view class="right"></view>
				</li>
				<li>
					<view class="left-icon">
						<text class="require-text" style="margin-right: 10rpx;"></text>{{ vis["relationship"] || "关系" }}
					</view>
					<view class="middle">
						<input style="font-size: 28upx;" :placeholder='`${ vis["vis-memo"] }` || "请对访客进行备注"' @input="getRelationship"></input>
					</view>
					<view class="right"></view>
				</li>
			</ul>
		</view>
		<view class="vis-times">
			<ul>
				<li>
					<picker :range="visitTimesArr" @change="visitTimeChange" :value="index">
					<view class="left-icon">
						<text class="require-text" style="margin-right: 10rpx;">*</text>{{ vis["limited-times"] || "限制次数" }}
					</view>
					<view class="middle">
						
							<text>{{ visitTimesArr[index] }}</text>
					</view>
					<view class="right">
						<u-icon name="arrow-right" color="#999999" size="28"></u-icon>
					</view>
					</picker>
				</li>
				<li>
					<picker mode="multiSelector" :value="multiIndex" :range="multiArray" @change="bindPickerChange" @columnchange="bindColumnChange" id='0'>
					<view class="left-icon">
						<text class="require-text" style="margin-right: 10rpx;">*</text> {{ "到访时间" }}
					</view>
					<view class="middle">
							<text>{{ startDate }}</text>
					</view>
					<view class="right">
						<u-icon name="arrow-right" color="#999999" size="28"></u-icon>
					</view>
					</picker>
				</li>
				<li>
					<picker mode="multiSelector" :value="multiIndex" :range="multiArray" @change="bindPickerChange" @columnchange="bindColumnChange" id='1'>
					<view class="left-icon">
						<text class="require-text" style="margin-right: 10rpx;">*</text> {{ vis["end-date"] || "结束时间" }}
					</view>
					<view class="middle">
							<text>{{ endDate }}</text>
					</view>
					<view class="right">
						<u-icon name="arrow-right" color="#999999" size="28"></u-icon>
					</view>
					</picker>
				</li>
			</ul>
			<view class="default-times">
				<text>{{ "提示：有效期（默认时长为2小时，最大可选时长" }}（{{validTimeList[0] || '不限'}}）</text>
			</view>
		</view>
		<view class='create-password'>
			<button class="button" @click='createPwd'>创建二维码/密码</button>
		</view>
	</view>
	<!-- 访客审核 -->
	<view class="vis-audit" v-show="visAudit">
		<!-- #ifndef MP-ALIPAY -->
			<view class="vis-history-btn"><view class="btn-text" @click="goToAuditHistory">{{ vis["vis-history"] || "历史记录" }}</view></view>
		<!-- #endif -->
		<view class="list-view-container" style="padding-top: 20upx;">
			<ul class='list-ul-container'>
				<li class="list-item-container" v-for= "(item,index) in visAuditList" :key="index" style="background-color: #FFFFFF;" @click="goToAudit(item,item.id)">
					<view class="list-item top-title-item">
						<view class="top-title">{{ item.visitedPlace }}</view>
						<view class="status-tab" style="background: #1E90FF;color: #fff;" v-if="item.reviewStatus == 0">{{ appointment["to-audit"] || "待审核" }}</view>
						<view class="status-tab" style="background: #1E90FF;color: #fff;" v-else-if="item.reviewStatus == 1">{{ appointment["passed"] || "已通过" }}</view>
						<view class="status-tab" v-else="item.reviewStatus == 2">{{ appointment["rejected"] || "已驳回" }}</view>
					</view>
					<view class="list-item">
						<view class="left-name">{{ appointment["vis-authorization"] || "访客姓名" }}:</view>
						<view class="right-info">{{ item.name }}</view>
					</view>
					<view class="list-item">
						<view class="left-name">{{ vis["vis-name"] || "访客手机" }}:</view>
						<view class="right-info">{{ item.phone }}</view>
					</view>
					<view class="list-item">
						<view class="left-name">{{ appointment["appoint-start-time"] || "预约开始时间" }}:</view>
						<view class="right-info">{{ item.accStartdatetime }}</view>
					</view>
					<view class="list-item">
						<view class="left-name">{{ appointment["appoint-end-time"] || "预约结束时间" }}:</view>
						<view class="right-info">{{ item.accEnddatetime }}</view>
					</view>
				</li>
			</ul>
			<view class="" style="text-align: center;padding-top: 50%;" v-if="visAuditList.length == 0">
				{{ common["no-data"] || "暂无数据" }}
			</view>
		</view>
	</view>
		
	<!-- #ifndef MP-ALIPAY -->
	</uni-base-page>
	<!-- #endif -->
	<!-- #ifdef MP-ALIPAY -->
	</view>
	<!-- #endif -->
</template>

<script>
	// import neilModal from '@/components/neil-modal/neil-modal.vue';
	var currPage = 1;
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
	export default {
		components: {
			// neilModal
		},
		data() {
			return {
				visIndex: 0,
				authorizedName: "",
				multiArray: [years, months, days, hours, minutes],
				multiIndex: [0, new Date().getMonth(), new Date().getDate() - 1, new Date().getHours(), new Date().getMinutes()],
				startDate: "", //显示数据
				endDate: "", //显示数据
				startTime: "",
				endTime: "",
				chooseYear: "",
				data: {},
				show: false,
				visitTimesArr: [],
				visitTimes: "",
				index: 0,
				usableCount: 1, //使用次数
				buildingList: [],
				doorList: [],
				currentIndex: null,
				roomId: "",
				devSn: "",
				optionId: "",
				phone: "",
				memo: "",
				// communityId: "",
				tempPwdUsageCountList: [], //有效次数
				tempPwdUsageTimeList: [], //有效时间
				validTimeIndex: 0,
				validTimeList: [],
				restrictNumber: [],
				startstr3: 0,
				endstr3: 0,
				visAuth: true,
				visAudit: false,
				visAuditList: []
			}
		},
		
		computed: {
			vis() {
				return this.$t("vis");
			},
			appointment() {
				return this.$t("appointment");
			},
			title() {
				return this.$t("title");
			},
			common() {
				return this.$t("common");
			}
		},
		onReady() {
			console.log("ces1");
			uni.setNavigationBarTitle({
				title: this.title["vis"]
			});
			this.validTimeList = [];
			this.restrictNumber = [];
			this.tempPwdUsageTimeList = [];
			let TimeList = this.$getUserInfo().tempPwdUsageTimeList || ["1", "2", "4", "8", "16", "32", this.vis["unlimited"] || "无限" ];
			TimeList.map( (item, i) => {
				this.validTimeList.push( item.value )
				this.tempPwdUsageTimeList.push( item )
			} )
			this.tempPwdUsageCountList = this.$getUserInfo().tempPwdUsageCountList || ["1", "2", "4", "8", "16", "32", this.vis["unlimited"] || "无限" ];
			this.tempPwdUsageCountList.map( item => {
				if( item !== "0" ) {
					this.visitTimesArr.push(item)
				}else {
					this.visitTimesArr.push( this.validTimeList[0] )
				}
			} )
			// this.visitTimesArr = ["1", "2", "4", "8", "16", "32", this.vis["unlimited"] || "无限" ];
		},
		onLoad: function(options) {
			// if(options.visIndex && options.visIndex == 1){
			// 	this.visIndex = 1;
			// }
			console.log("ces1", options);
			this.visitTimes = this.vis["select-times"] || "请选择限制次数";
			var _this = this;
			this.authorizedName = this.vis["select-authorize"] || "请选择授权楼栋/门禁";
			if (options.name === undefined) {
				this.authorizedName = this.vis["select-address"] || "请选择房屋地址/门禁";
			} else if (options.roomId) {
				this.currentIndex = 0;
				this.authorizedName = options.name;
				this.roomId = options.roomId;
				// this.communityId = parseInt(options.communityId);
			} else if (options.devSn) {
				this.currentIndex = 1;
				this.authorizedName = options.name;
				this.devSn = options.devSn;
				// this.communityId = parseInt(options.communityId);
			}
			var that = this;
			this.chooseYear = this.multiArray[0][0];
			//获取当前时间
			var startDate = new Date();
			var start = this.getSystemTime(startDate)[0];
			// var startTime = this.getSystemTime(startDate)[1];
			this.startDate = start;
			this.startstr3 = this.timestamp(this.startDate);
			// this.stratTime = startTime;
			//获取默认的结束时间
			var endDate = new Date(new Date().getTime() + 2 * 3600 * 1000);
			var end = this.getSystemTime(endDate)[0];
			// var endTime = this.getSystemTime(endDate)[1];
			this.endDate = end;
			this.endstr3 = this.timestamp(this.endDate);
			// this.endTime = endTime;
			// 绑定事件，当名为EventPhoneChange的事件发生的时
			this.$onfire.on('EventAddressChange', e => {
				console.log(e);
				_this.authorizedName = e.name;
				// uni.debugLog("communityId", e.communityId);
				// _this.communityId = parseInt(e.communityId);
				if(e.roomId !== undefined) {
					console.log(e,'roomCode');
					_this.roomId = e.roomId;
					_this.currentIndex = 0;
				}
				if(e.devSn !== undefined) {
					console.log(e,'devSn');
					_this.devSn = e.devSn;
					_this.currentIndex = 1;
				}
			});
		},
		onShow() {
			console.log("ces1");
			currPage = 1;
			this.visAuditList = [];
			// this.getVisAuditList();
		},
		
		onPullDownRefresh() {
			currPage = 1;
			this.visAuditList = [];
			// this.getVisAuditList();
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		
		onReachBottom() {
			currPage++;
			// this.getVisAuditList();
		},
		onUnload() {
			// 取消事件绑定
			this.$onfire.un("EventAddressChange");
		},
		methods: {
			// tab切换
			tabSwitch(index) {
				this.visIndex = index;
				if (this.visIndex === 0) {
					this.visAuth = true;
					this.visAudit = false;
				} else if (this.visIndex === 1) {
					this.visAudit = true;
					this.visAuth = false;
					currPage = 1;
					this.visAuditList = [];
					// console.log("小区Id",)
					// this.getVisAuditList();
				}
			},
			//获取访客手机号
			getPhoneNum(e) {
				this.phone = e.detail.value;
			},

			//获取访客关系
			getRelationship(e) {
				this.memo = e.detail.value;
			},
			// 将年月日时分秒转为时间戳
			timestamp(dade) {
				let str = dade;
				let str2 = Date.parse(new Date(str));
				return str2/ 1000;
			},
			bindPickerChange(e) {
				this.multiIndex = e.detail.value;
				const index = this.multiIndex;
				const year = this.multiArray[0][index[0]];
				const month = this.multiArray[1][index[1]];
				const day = this.multiArray[2][index[2]];
				const hour = this.multiArray[3][index[3]];
				const minute = this.multiArray[4][index[4]];
				
				if (e.currentTarget.id == 0) {
					this.startDate = year + '-' + month + '-' + day + ' ' + hour + ':' + minute,
					this.startTime = `${year}${month}${day}${hour}${minute}00`;
					// 将年月日时分秒转为时间戳
				} else if (e.currentTarget.id == 1) {
					// this.validTimeIndex = e.target.value;
					// this.tempPwdUsageTime = this.tempPwdUsageTimeList[this.validTimeIndex];
					
					this.endDate = year + '-' + month + '-' + day + ' ' + hour + ':' + minute,
					this.endTime = `${year}${month}${day}${hour}${minute}00`;
					this.startstr3 = this.timestamp(this.startDate);
					this.endstr3 = this.timestamp(this.endDate);
					//比较时间差，若结束时间小于开始时间，则提示
					var startDate = this.startDate;
					var endDate = this.endDate;
					if (this.startTime > this.endTime) {
						this.$showToast(this.vis["end-time-toast"] ||"结束时间不能小于开始时间");
						this.startDate = this.getSystemTime(new Date())[0];
						this.endDate = this.getSystemTime(new Date(new Date().getTime() + 2 * 3600 * 1000))[0];
						this.startTime = "";
						this.endTime = "";
					}else if( this.tempPwdUsageTimeList[0].key*1 !== 0 ) {
						if( this.endstr3 - this.startstr3 > this.tempPwdUsageTimeList[0].key*1 ) {
							this.$showToast(this.vis["exceed-time-toast"] ||"超出最大可选时长");
							this.startDate = this.getSystemTime(new Date())[0];
							this.endDate = this.getSystemTime(new Date(new Date().getTime() + 2 * 3600 * 1000))[0];
							this.startTime = "";
							this.endTime = "";
						}
					}
					
				};
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
				var currentDate = curyear + '-' + curmonth + '-' + curday + ' ' + curhour + ':' + curminute;
				var formedDate = curyear + curmonth + curday + curhour + curminute + "00";
				var dateArr = [currentDate, formedDate];
				return dateArr;
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

			//跳转到访问地址列表页面
			goToAddress() {
				uni.navigateTo({
					url: 'vis-address'
				});
			},

			//选择限次次数
			visitTimeChange(e) {
				var index = e.target.value;
				this.index = index;
				if (this.visitTimesArr[index] === this.vis["unlimited"]) {
					this.usableCount = 0;
				} else {
					this.usableCount = parseInt(this.visitTimesArr[index]);
				}
			},

			//swiper切换时会调用
			pagechange(e) {
				if ("touch" === e.detail.source) {
					let currentPageIndex = this.currentIndex
					currentPageIndex = (currentPageIndex + 1) % 2;
					this.currentIndex = currentPageIndex;
				}
			},

			//用户点击tab时调用
			titleClick(e) {
				//拿到当前索引并动态改变
				this.currentIndex = e.currentTarget.dataset.idx;
			},

			//创建访客密码
			createPwd() {
				console.log(this.roomId);
				console.log(this.devSn);
				var startDate = this.startDate + ":00";
				var endDate = this.endDate + ":00";
				if (this.roomId === "" && this.devSn === "") {
					uni.showToast({
						title: this.vis["authorize-toast"] || "请选择楼栋/门禁",
						icon: "none"
					});
					return;
				} 
				// else if (this.phone === "") {
				// 	uni.showToast({
				// 		title: this.vis["phone-toast"] || "请输入访客手机号码",
				// 		icon: "none"
				// 	});
				// 	return;
				// } 
				if (!this.$checkPhoneNumber(this.phone) && this.phone !== "") {
					this.$showToast( this.common["correct-phone"] || "请输入正确手机号");
					return;
				} 
				// else if (this.memo === "") {
				// 	this.$showToast(this.vis["relationship-toast"] || "请输入访客关系");
				// 	return;
				// }
				else if (this.startTime > this.endTime) {
					this.$showToast(this.vis["end-time-toast"] || "结束时间不能小于开始时间");
					this.startDate = this.getSystemTime(new Date())[0];
					this.endDate = this.getSystemTime(new Date(new Date().getTime() + 2 * 3600 * 1000))[0];
					this.startTime = "";
					this.endTime = "";
					return;
				} else {
					let params = {};
					if( !this.usableCount ) {
						this.usableCount = 0
					}
					if( this.currentIndex == 0 ) {
						params = {
							// communityId: this.communityId,
							roomIds: this.roomId,
							remark: this.memo,
							phone: this.phone,
							accStartDateTime: startDate,
							accEndDateTime: endDate,
							accessNum: this.usableCount,
						}
					}else {
						params = {
							// communityId: this.communityId,
							devSn: this.devSn,
							remark: this.memo,
							phone: this.phone,
							accStartDateTime: startDate,
							accEndDateTime: endDate,
							accessNum: this.usableCount,
						}
					}
					this.$api('equipment.getVisitorQrCode',params).then(res => {
						console.log(res);
						if(res.code == 200) {
							var password = res.data.tempPwd;
							var qrcode = res.data.tempCode;
							// var shareUrl = encodeURIComponent('data:image/png;base64'+res.data.qrCode);
							var shareUrl = res.data.tempPwd;
							var encodeAddress = encodeURIComponent(this.authorizedName);
							if( this.currentIndex == 0 ) {
								var content = this.vis["msg-content-one"] + this.authorizedName + this.vis["msg-content-two"] + password + this.vis["msg-content-three"] + this.endDate + this.vis["msg-content-four"]
							}else {
								var content = "";
								// #ifdef MP-WEIXIN || MP-ALIPAY
									content = "管理员已为您申请 " + this.authorizedName + " 临时开门密码，密码是 " + password + ", 请在有效时间 " + this.endDate + " 之前使用，切勿将密码泄露于他人。";
								// #endif
								// #ifdef APP-PLUS
									content = this.vis["msg-content-one"]||"管理员已为您申请 " + this.authorizedName + this.vis["msg-content-two"]||" 临时开门密码，密码是 " + password + this.vis["msg-content-three"]||", 请在有效时间 " + this.endDate +
									this.vis["msg-content-four"]||" 之前使用，切勿将密码泄露于他人。"
								// #endif
							}
							var encodeContent = encodeURIComponent(content);
							let navData = {
								pwd: password,
								qrcode: qrcode,
								shareUrl: shareUrl,
								content: encodeContent,
								room: encodeAddress,
								startDate: this.startDate,
								endDate: this.endDate,
								memo: this.memo,
								phone: this.phone,
								authorizedName: this.authorizedName,
								usableCount: this.usableCount,
								visitTime: this.visitTimesArr[this.index]
							};
							console.log(navData);
							uni.navigateTo({
								url: "../vis-pwd/vis-pwd?index=" + JSON.stringify(navData)
							})
						} else {
							this.$showToast(res.msg)
						}
					
					})
					// console.log(params)
					// this.$req.request({
					// 	url: "/accVisitorTempPwd/app/addVisitorTempPwd",
					// 	data: params,
					// 	success: res => {
					// 		if(res.code == 0) {
					// 			var password = res.data.numPwd;
					// 			var qrcode = res.data.qrcodePwd;
					// 			var shareUrl = encodeURIComponent(res.data.shareUrl);
					// 			var encodeAddress = encodeURIComponent(this.authorizedName);
					// 			if( this.currentIndex == 0 ) {
					// 				var content = this.vis["msg-content-one"] + this.authorizedName + this.vis["msg-content-two"] + password + this.vis["msg-content-three"] + this.endDate + this.vis["msg-content-four"]
					// 			}else {
					// 				var content = "";
					// 				// #ifdef MP-WEIXIN || MP-ALIPAY
					// 					content = "管理员已为您申请 " + this.authorizedName + " 临时开门密码，密码是 " + password + ", 请在有效时间 " + this.endDate + " 之前使用，切勿将密码泄露于他人。";
					// 				// #endif
					// 				// #ifdef APP-PLUS
					// 					content = this.vis["msg-content-one"]||"管理员已为您申请 " + this.authorizedName + this.vis["msg-content-two"]||" 临时开门密码，密码是 " + password + this.vis["msg-content-three"]||", 请在有效时间 " + this.endDate +
					// 					this.vis["msg-content-four"]||" 之前使用，切勿将密码泄露于他人。"
					// 				// #endif
					// 			}
					// 			var encodeContent = encodeURIComponent(content);
					// 			let navData = {
					// 				pwd: password,
					// 				qrcode: qrcode,
					// 				shareUrl: shareUrl,
					// 				content: encodeContent,
					// 				room: encodeAddress,
					// 				startDate: this.startDate,
					// 				endDate: this.endDate,
					// 				memo: this.memo,
					// 				phone: this.phone,
					// 				authorizedName: this.authorizedName,
					// 				usableCount: this.usableCount,
					// 				visitTime: this.visitTimesArr[this.index]
					// 			};
					// 			uni.navigateTo({
					// 				url: "../vis-pwd/vis-pwd?index=" + JSON.stringify(navData)
					// 			})
					// 		} else {
					// 			this.$showToast(res.msg)
					// 		}
					// 		// // #ifdef MP-WEIXIN
					// 		// var content = "管理员已为您申请 " + this.authorizedName + " 临时开门密码，密码是 " + password + ", 请在有效时间 " + this.endDate + " 之前使用，切勿将密码泄露于他人。";
					// 		// // #endif
					// 		// var content = this.vis["msg-content-one"]||"管理员已为您申请 " + this.authorizedName + this.vis["msg-content-two"]||" 临时开门密码，密码是 " + password + this.vis["msg-content-three"]||", 请在有效时间 " + this.endDate +
					// 		// 	this.vis["msg-content-four"]||" 之前使用，切勿将密码泄露于他人。";
							
					// 	}
					// });
				}
			},
			
			//跳转到访客密码历史记录页面
			goToVisHistory() {
				uni.navigateTo({
					url: "/sub-package/pages/vis/vis-history"
				})
			},
			//跳转到预约审核历史记录页面
			goToAuditHistory(){
				uni.navigateTo({
					url: "/sub-package1/pages/audit-history/audit-history"
				})
			},
			goToAudit(auditObj,id){
				uni.navigateTo({
					url: "/sub-package1/pages/appointment-audit/appointment-audit?auditId=" + id + '&auditObj=' + JSON.stringify(auditObj)
				})
			},
			//获取访客预约待审核列表
			// getVisAuditList() {
			// 	this.$req.request ({
			// 		url: "/visEmpVisitor/app/listByUnreviewed",
			// 		data: {
			// 			communityId: this.$getUserInfo().currentCommunity.id,
			// 			currPage: currPage,
			// 			pageSize: 10
			// 		},
			// 		success: res => {
			// 			// uni.stopPullDownRefresh();
			// 			let visAuditList = res.data.list;
			// 			this.visAuditList = this.visAuditList.concat(res.data.list);
			// 		}
			// 	})
			// },
		}
	}
</script>

<style>
	page {
		background: #f1f2f3;
	}
</style>

<style lang="scss">
	.content {
		padding: 0;
		background-color: #F2F2F2;
	}
	.vis-tab{
		background: #fff;
		padding-top: 20px;
	}
	.taberr {
		display: block;
		width: 230upx;
		height: 50upx;
		line-height: 50upx;
		text-align: center;
		color: #000;
		font-size: 32upx;
		margin: auto;
	}
	
	.tabactive {
		display: block;
		width: 230upx;
		height: 50upx;
		line-height: 50upx;
		text-align: center;
		color: $theme-bg-color;
		border-bottom: 5upx solid $theme-bg-color;
		font-size: 32upx;
		margin: auto;
	}
	.vis-history-btn {
		width: 95%;
		margin: 0 auto;
		padding: 10upx 0;
		font-size: 26upx;
		text-align: right;
	}
	
	.btn-text {
		float: right;
		color: $theme-bg-color;
		background: transparent;
		font-size: 26upx;
		width: 30%;
		border-width: 0upx;
		text-align: right;
	}

	.vis-info {
		background-color: #FFFFFF;
		padding: 20rpx 0;
		margin: 0 auto;
		margin-top: 20upx;
	}

	.vis-times {
		background-color: #ffffff;
		padding: 0;
		margin-top: 20rpx;
	}

	.content ul {
		padding: 0;
		list-style: none;
	}

	.vis-info ul li {
		background: #FFFFFF;
		word-break: break-all;
		min-height: 100upx;
		height: auto;
		width: 94%;
		margin-left: 3%;
		margin-right: 3%;
		margin-bottom: 4upx;
		position: relative;
		// border-bottom: 2upx solid #EEEEEE;
		&:before {
			content: '';
			position: absolute;
			bottom: 32rpx;
			right: 36rpx;
			height: 2rpx;
			width: calc(100% - 180upx);
			background-color: #dddddd;
		}
	}

	.content image {
		width: 32upx;
		height: 32upx;
	}

	.left-icon {
		width: 180rpx;
		float: left;
		text-align: left;
		margin-top: 3%;
	}

	.left-icon image {
		display: inline-block;
		vertical-align: middle;
		margin-bottom: 2upx;
		margin-right: 8upx;
	}

	.middle {
		// width: 48%;
		display: inline-block;
		margin-top: 3%;
		// margin-left: 3%;
		padding-right: 30upx;
		overflow: auto;
		clear: both;
	}

	.middle text {
		color: #666666;
	}

	.middle input {
		display: inline-block;
	}

	.right {
		width: 10%;
		display: inline-block;
		height: 80upx;
		line-height: 80upx;
		vertical-align: middle;
		text-align: right;
	}

	.right image {
		display: inline-block;
		vertical-align: middle;
	}
	/* .vis-left{
		width: 22%;
		text-align: left;
		margin-top: 4%;
	}
	.vis-right{
		width: 75%;
		display: inline-block;
		margin-top: 4%;
	}
	.vis-title{
		color: gray;
		padding: 20upx;
	}
	.remark{
		width: 95%;
		margin: auto;
		background: #fff;
		height: 200upx;
		padding-top: 10upx;
		margin-top: 20upx;
	}
	.remark textarea{
		width: 98%;
		height: 100%;
		margin-left: 2%;
		font-size: 30upx;
	}
	.btn-box{
		margin: 40upx;
	}
	.btn-box button {
		color: #ffffff;
		border-style: none;
		padding: 10upx 0;
		font-size: 30upx;
		width: 45%;
	}
	.btn-box button.pass{
		background: #1e90ff;
		float: left;
	}
	.btn-box button.reject{
		background: #ddd;
		float: right;
	} */
	.vis-times ul li {
		width: auto;
		display: block;
		height: 80upx;
		// line-height: 80upx;
		padding: 15upx;
		position: relative;
		// border-bottom: 2upx solid #EEEEEE;
		&:before {
			content: '';
			position: absolute;
			bottom: 26rpx;
			right: 36rpx;
			height: 2rpx;
			width: calc(100% - 208upx);
			background-color: #dddddd;
		}
	}

	.default-times {
		background-color: #f1f2f3;
		color: #999999;
		padding: 21upx 34upx;
		font-size: 24upx;
	}

	scroll-view {
		height: 300upx;
	}

	.radio-group label {
		display: block;
		padding: 8upx 20upx;
	}

	.title {
		width: 100%;
		height: 88upx;
		display: flex;
		align-items: center;
		justify-content: space-around;
	}

	.titleSel {
		color: $theme-fg-color;
		font-size: 32upx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.titleUnsel {
		color: #666666;
		font-size: 32rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.create-password {
		margin: 80rpx 0 30rpx 0;
	}

	.create-password button {
		background: #3E76F4;
		color: #ffffff;
		border-style: none;
		font-size: 30rpx;
		margin: 0rpx 76rpx;
		height: 88rpx;
		line-height: 88rpx;
	}
</style>
