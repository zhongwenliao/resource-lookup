<template>
	<view class="appointment">
		<view class="vis-info">
			<ul>
				<li class="clear">
					<view class="left-icon">
						<text class="require-text">*</text> 姓名
					</view>
					<view class="middle">
						<input style="font-size: 28upx;" placeholder='请输入姓名' v-model="name"></input>
					</view>
				</li>
				<li class="clear">
					<view class="left-icon">
						<text class="require-text">*</text> 手机号
					</view>
					<view class="middle" style="width: 40%;">
						<input style="font-size: 28upx;" placeholder='请输入手机号' v-model="phone"></input>
					</view>
					<!-- #ifdef MP-WEIXIN -->
					<view class="right" style="width: 22%;">
						<button type="primary" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
							一键获取
						</button>
					</view>
					<!-- #endif -->
				</li>
				<li class="clear">
					<view class="left-icon">
						性别
					</view>
					<view class="middle">
						<picker @change="sexChange" name="gender" :range="genderList">
							<view>{{ gender > -1 ? genderList[gender] : "请选择性别"}}</view>
						</picker>
					</view>
					<view class="right">
						<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/more.png"></image>
					</view>
				</li>
				<li class="clear">
					<view class="left-icon">
						<text class="require-text">*</text> 身份证号
					</view>
					<view class="middle">
						<input style="font-size: 28upx;" placeholder='请输入身份证号' v-model="certNo"></input>
					</view>
				</li>
				<li class="clear" @click="chooseCommunity">
					<view class="left-icon">
						<text class="require-text">*</text> 选择小区
					</view>
					<view class="middle">
						{{communityName}}
					</view>
					<view class="right">
						<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/more.png"></image>
					</view>
				</li>
				<li class="clear">
					<view class="left-icon">
						<text class="require-text">*</text> 被访人
					</view>
					<view class="middle">
						<input style="font-size: 28upx;" placeholder='请输入被访人正确姓名' v-model="visitedEmp" @input="getInputValue"></input>
					</view>
				</li>
				<li class="clear">
					<view class="left-icon">
						<text class="require-text">*</text> 选择房间
					</view>
					<view class="middle">
						<picker @change="roomChange" :range="roomList">
							<view>{{ roomName > -1 ? roomList[roomName] : "请选择房间"}}</view>
						</picker>
					</view>
					<view class="right">
						<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/more.png"></image>
					</view>
				</li>
			</ul>
		</view>
		<view class="vis-title">
			办事信息
		</view>
		<view class="vis-info" style="margin-top: 0;">
			<ul>
				<li class="clear">
					<view class="left-icon">
						办理事项
					</view>
					<view class="middle">
						<input style="font-size: 28upx;" placeholder='请输入办理事项' v-model="visitReason"></input>
					</view>
				</li>
				<li>
					<view class="left-icon">
						<text class="require-text">*</text> 开始时间
					</view>
					<view class="middle">
						<text v-if="communityId == 39000">{{ accStartdatetime }}</text>
						<picker v-else mode="multiSelector" :value="multiIndex" :range="multiArray" @change="bindPickerChange" @columnchange="bindColumnChange" id='0'>
							<text>{{ accStartdatetime }}</text>
						</picker>
					</view>
					<view class="right" v-if="communityId != 39000">
						<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/more.png"></image>
					</view>
				</li>
				<li>
					<view class="left-icon">
						<text class="require-text">*</text> 结束时间
					</view>
					<view class="middle">
						<text v-if="communityId == 39000">{{ specificEnddatetime }}</text>
						<picker v-else mode="multiSelector" :value="multiIndex" :range="multiArray" @change="bindPickerChange" @columnchange="bindColumnChange" id='1'>
							<text>{{ accEnddatetime }}</text>
						</picker>
					</view>
					<view class="right" v-if="communityId != 39000">
						<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/more.png"></image>
					</view>
				</li>
			</ul>
		</view>
		<view class="btn-box">
			<button @click="appointment">确认预约</button>
		</view>
	</view>
</template>

<script>
	import uniTimeSelector from "../../components/uni-time-selector/uni-time-selector.vue";
	let jsCode = "";
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
	export default{
		components: {
			uniTimeSelector
		},
		data(){
			return {
				defaultName: "",
				communityId: "",
				name: "",
				phone: "",
				certNo: "",
				visitedEmp: "",
				visitReason: "",
				genderList: ['男','女'],
				gender: -1,
				bornDate: null,
				visDate: null,
				communityName: null,
				multiArray: [years, months, days, hours, minutes],
				multiIndex: [0, new Date().getMonth(), new Date().getDate() - 1, new Date().getHours(), new Date().getMinutes()],
				accStartdatetime: "", 
				accEnddatetime: "", 
				specificEnddatetime: "",
				startTime: "",
				endTime: "",
				chooseYear: "",
				startstr3: 0,
				endstr3: 0,
				roomList: [],
				roomListId: [],
				interViewList: [],
				inter: -1,
				roomId: "",
				roomName: -1,
				empList: [],
				visitedPhone: "",
				aesCommunityId: ""
			}
		},
		computed: {
			common() {
				return this.$t("common");
			}
		},
		methods:{
			// 获取默认小区
			getCommunityList(aesCommunityId){
				this.$req.request({
					url: "/visEmpVisitor/h5/getCommunityByAesId",
					data: {
						aesCommunityId: aesCommunityId
					},
					isShowLoading: false,
					success: res => {
						if(res.code == 0) {
							this.defaultName = res.data.name;
							this.communityName = this.defaultName;
							this.communityId = res.data.id;
						}
					}
				});
			},
			// 测试用
			// getCommunityList(){
			// 	this.$req.request({
			// 		url: "/visEmpVisitor/h5/getCommunityByAesId",
			// 		data: {
			// 			aesCommunityId: "nLmpRv2NHiODHkhAmt0fKw=="
			// 		},
			// 		isShowLoading: false,
			// 		success: res => {
			// 			if(res.code == 0) {
			// 				this.defaultName = res.data.name;
			// 				this.communityName = this.defaultName;
			// 				this.communityId = res.data.id;
			// 			}
			// 		}
			// 	});
			// },
			// 微信登录获取用户手机号
			getPhoneNumber(e) {
				let detail = e.detail || {};
				if (detail.errMsg == "getPhoneNumber:fail user deny") {
					this.$showToast("授权失败");
				} else {
					this.$showLog("获取手机号相关信息", e.detail);
					this.$showLoading("正在获取手机号");
					let sendData = {
						jsCode: jsCode,
						iv: detail.iv,
						encryptedData: detail.encryptedData,
						wxMiniAppId: this.$getConfigParam().wxMiniAppId,
						appId: this.$getConfigParam().appId
					};
					this.$showLog("sendData", sendData);
					uni.request({
						url: "https://app-api.thinmoo.com/appUser/app/wxMiniGetPhone",
						method: "POST",
						header: {
							"content-type": "application/x-www-form-urlencoded"
						},
						data: sendData,
						success: (res) => {
							this.$hideLoading();
							let result = res.data;
							if (result.code === 0) {
								this.$showToast("手机号获取成功");
								this.$showLog("data", result);
								this.phone = result.data;
							} else {
								this.$hideLoading();
								this.$showToast(result.msg);
							}
						}
					});
				}
			},
			// 性别onchange事件
			sexChange(e) {
				this.gender = e.target.value;
			},
			enterChange(e) {
				this.enter = e.target.value;
			},
			roomChange(e) {
				let index = e.target.value;
				this.roomName = e.target.value;
				this.roomId = this.roomListId[index];
			},
			bornDateChange(e) {
				this.bornDate = e;
			},
			visDateChange(e) {
				this.visDate = e;
			},
			getInputValue(e){
				let empName = e.detail.value;
				this.getEmpListByEmpName(empName)
				console.log("inputDev",empName)
			},
			chooseCommunity(){
				if(this.name){
					uni.setStorageSync("visName",this.name);
				}
				if(this.phone){
					uni.setStorageSync("visPhone",this.phone);
				}
				if(this.gender){
					uni.setStorageSync("visGender",this.gender);
				}
				if(this.certNo){
					uni.setStorageSync("visCertNo",this.certNo);
				}
				uni.navigateTo({
					url: "/sub-package/pages/area-select/area-select?type=3"
				})
			},
			// 通过输入被访人姓名获取人员Id
			getEmpListByEmpName(empName){
				this.$req.request({
					url: "/visEmpVisitor/h5/getEmpListByEmpName",
					data: {
						communityId: this.communityId,
						empName: empName,
					},
					isShowLoading: false,
					success: res => {
						if(res.code == 0) {
							this.empList = res.data;
							if(this.empList.length == 0){
								this.$showToast("被访人暂无手机号码");
							}
							if(this.empList.length == 1){
								this.empId = this.empList[0].id;
								this.visitedPhone = this.empList[0].phone
								this.getRoomList(this.empId)
							}
						} 
					}
				});
			},
			// 获取房间列表
			getRoomList(empId){
				this.$req.request({
					url: "/visEmpVisitor/h5/getRoomListByEmpId",
					data: {
						empId: empId,
					},
					isShowLoading: false,
					success: res => {
						if(res.code == 0) {
							this.roomList = res.data.map(item =>{
								return item.name;
							});
							this.roomListId = res.data.map(item =>{
								return item.id;
							});
						} 
					}
				});
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
					this.accStartdatetime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute,
					this.startTime = `${year}${month}${day}${hour}${minute}00`;
					// 将年月日时分秒转为时间戳
				} else if (e.currentTarget.id == 1) {
					// this.validTimeIndex = e.target.value;
					// this.tempPwdUsageTime = this.tempPwdUsageTimeList[this.validTimeIndex];
					
					this.accEnddatetime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute,
					this.endTime = `${year}${month}${day}${hour}${minute}00`;
					this.startstr3 = this.timestamp(this.accStartdatetime);
					this.endstr3 = this.timestamp(this.accEnddatetime);
					//比较时间差，若结束时间小于开始时间，则提示
					var accStartdatetime = this.accStartdatetime;
					var accEnddatetime = this.accEnddatetime;
					if (this.startTime > this.endTime) {
						this.$showToast(this.vis["end-time-toast"] ||"结束时间不能小于开始时间");
						this.accStartdatetime = this.getSystemTime(new Date())[0];
						this.accEnddatetime = this.getSystemTime(new Date(new Date().getTime() + 2 * 3600 * 1000))[0];
						this.startTime = "";
						this.endTime = "";
					}else if( this.tempPwdUsageTimeList[0].key*1 !== 0 ) {
						if( this.endstr3 - this.startstr3 > this.tempPwdUsageTimeList[0].key*1 ) {
							this.$showToast(this.vis["exceed-time-toast"] ||"超出最大可选时长");
							this.accStartdatetime = this.getSystemTime(new Date())[0];
							this.accEnddatetime = this.getSystemTime(new Date(new Date().getTime() + 2 * 3600 * 1000))[0];
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
				var jsDate = curyear + '-' + curmonth + '-' + curday + ' ' + '23' + ':' + '59';
				var formedDate = curyear + curmonth + curday + curhour + curminute + "00";
				var dateArr = [currentDate, formedDate,jsDate];
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
			// 预约
			appointment(){
				var accStartdatetime = this.accStartdatetime + ":00";
				// 恒大中心小区
				if(this.communityId == 39000){
					var accEnddatetime = this.specificEnddatetime + ":00";
				}else{
					var accEnddatetime = this.accEnddatetime + ":00";
				}
				if (!this.name) {
					this.$showToast("请输入姓名");
					return;
				} 
				else if (!this.phone) {
					this.$showToast("请输入手机号码");
					return;
				} 
				else if (this.$getLanguageLowerCase().indexOf("cn") > -1 && !this.$checkPhoneNumber(this.phone)) {
					this.$showToast( this.common["correct-phone"] || "请输入正确手机号");
					return;
				} 
				else if (!this.certNo) {
					this.$showToast("请输入身份证号");
					return;
				}
				else if (!this.$checkIDNumber(this.certNo)) {
					this.$showToast(this.common["correct-id"] || "请输入正确的身份证号");
					return;
				}
				else if (!this.visitedEmp) {
					this.$showToast("请输入被访人姓名");
					return;
				}
				else if (this.startTime > this.endTime) {
					this.$showToast(this.vis["end-time-toast"] || "结束时间不能小于开始时间");
					this.accStartdatetime = this.getSystemTime(new Date())[0];
					this.accEnddatetime = this.getSystemTime(new Date(new Date().getTime() + 2 * 3600 * 1000))[0];
					this.startTime = "";
					this.endTime = "";
					return;
				} else {
					let params = {};
					params = {
						communityId: this.communityId,
						name: this.name,
						phone: this.phone,
						gender: this.gender,
						certNo: this.certNo,
						visitedEmp: this.visitedEmp,
						roomId: this.roomId,
						visitedPhone: this.visitedPhone,
						visitReason: this.visitReason,
						accStartdatetime: accStartdatetime,
						accEnddatetime: accEnddatetime,
						wxMiniAppId: this.$getConfigParam().wxMiniAppId,
						jsCode: jsCode
					}
					// 预约订阅消息
					// #ifdef MP-WEIXIN
					wx.requestSubscribeMessage({
						tmplIds: this.$getConfigParam().visSuccessTemplateId,
						success: (res) => {
							console.log("订阅消息模板",JSON.stringify(res))
							if(JSON.stringify(res).split("accept").length == 3){
								this.$req.request({
									url: "/visEmpVisitor/h5/register",
									data: params,
									success: res => {
										if(res.code == 0) {
											this.$showToast(res.msg);
											setTimeout(() =>{
												uni.reLaunch({
													url: "/sub-package1/pages/audit-success/audit-success"
												})
											})
										} else {
											this.$showToast(res.msg)
										}
									}
								});
							}else{
								this.$showToast("请点击允许接收消息");
							}
						},
						fail: (err) => {
							this.$showLog("微信小程序调用订阅消息模板失败", err, "登录界面");
						}
					});
					// #endif
				}
			}
		},
		onLoad(options) {
			// 扫码拿到的参数
			this.aesCommunityId = options.scene ? decodeURIComponent(options.scene) : undefined;
			if (this.aesCommunityId) {
				this.getCommunityList(this.aesCommunityId);
			} else if (options.type == '3') {
				this.communityName = options.cityName + options.communityName;
				this.communityId = options.communityId;
				this.name = options.visName;
				this.phone = options.visPhone;
				this.gender = options.visGender;
				this.certNo = options.visCertNo;
			}else {
				this.communityName = "请选择小区"
			}
			
			// 测试用
			// if(options.type == '3'){
			// 	this.communityName = options.cityName + options.communityName;
			// 	this.communityId = options.communityId;
			// 	this.name = options.visName;
			// 	this.phone = options.visPhone;
			// 	this.gender = options.visGender;
			// 	this.certNo = options.visCertNo;
			// }else{
			// 	this.getCommunityList();
			// }
			
			this.chooseYear = this.multiArray[0][0];
			//获取当前时间
			var accStartdatetime = new Date();
			var start = this.getSystemTime(accStartdatetime)[0];
			this.accStartdatetime = start;
			this.startstr3 = this.timestamp(this.accStartdatetime);
			//获取默认的结束时间
			var accEnddatetime = new Date(new Date().getTime() + 2 * 3600 * 1000);
			var end = this.getSystemTime(accEnddatetime)[0];
			this.accEnddatetime = end;
			this.endstr3 = this.timestamp(this.accEnddatetime);
			// 恒大中心小区的结束时间
			var specificEnddatetime = new Date();
			var endTime = this.getSystemTime(specificEnddatetime)[2];
			this.specificEnddatetime = endTime;
			console.log("结束",this.specificEnddatetime)
		},
		onShow() {
			// #ifdef MP-WEIXIN
			// 微信授权登录
			uni.login({
				provider: "weixin",
				success: (res) => {
					this.$showLog("微信授权登录成功", res, "登录界面");
					jsCode = res.code;
					console.log("jsCode",jsCode)
				},
				fail: (err) => {
					this.$showErrorLog("微信授权登录失败", err, "登录界面");
				}
			});
			// #endif
		}
	}
</script>

<style>
	.appointment{
		width: 100%;
		border-top: 1px solid #eee;
		background: #F2F2F2;
	}
	.vis-info {
		background-color: #FFFFFF;
		padding: 0;
		width: 95%;
		margin: 0 auto;
		margin-top: 20upx;
	}
	.vis-info ul{
		padding-left: 0;
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
		border-bottom: 2upx solid #EEEEEE;
		position: relative;
	}
	.empName{
		width: 60upx;
		position: absolute;
		top: 30upx;
		right: -12upx;
		opacity: 0;
	}
	.vis-info .left-icon {
		width: 30%;
		float: left;
		text-align: left;
		margin-top: 4%;
	}
	
	.vis-info .left-icon image {
		display: inline-block;
		vertical-align: middle;
		margin-bottom: 2upx;
		margin-right: 8upx;
	}
	.vis-info .middle {
		width: 51%;
		display: inline-block;
		margin-top: 4%;
		margin-left: 3%;
		padding-right: 30upx;
		overflow: auto;
		clear: both;
	}
	.vis-info .middle text {
		color: #666666;
	}
	.vis-info .right {
		width: 10%;
		display: inline-block;
		height: 80upx;
		line-height: 110upx;
		vertical-align: middle;
		text-align: right;
	}
	.vis-info .right button{
		width: 100%;
		padding: 0;
		background: #1e90ff;
		font-size: 24upx;
		margin-top: 16upx;
	}
	.vis-info .right image {
		width: 32upx;
		height: 32upx;
		display: inline-block;
		vertical-align: middle;
	}
	.vis-title{
		color: gray;
		padding: 20upx;
	}
	.btn-box{
		margin: 40upx;
	}
	.btn-box button {
		color: #ffffff;
		background: #1e90ff;
		border-style: none;
		padding: 10upx 0;
		font-size: 30upx;
		width: 100%;
	}
</style>
