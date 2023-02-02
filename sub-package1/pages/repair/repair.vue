<template>
	<view class="content">
		<view class="swiper-tab">
			<view @click="tabSwitch(0)" :class="0 == currentIndex? 'titleSel' : 'titleUnsel'">
				<text>{{ repair["repair"] || "我要报修"}}</text>
				<hr :class="0 == currentIndex? 'headerLineSel' : 'headerLineUnsel'" />
			</view>
			<view :class="1 == currentIndex? 'titleSel' : 'titleUnsel' " @click="tabSwitch(1)">
				<text>{{ repair["repair-list"] || "报修列表" }}</text>
				<hr :class=" 1 == currentIndex? 'headerLineSel' : 'headerLineUnsel' " />
			</view>
		</view>
		<!-- 内容布局 -->
		<swiper class='swiper' :current='currentIndex' @change="swiperChange">
			<!-- 报修 -->
			<swiper-item class="repair">
				<view style="color: rgb(136, 136, 136); letter-spacing: 0px; text-align: left; padding: 4px; background: rgb(238, 238, 238);"></view>
				<scroll-view scroll-y class='repair-scroll'>
					<!-- 如果有维修联系电话，则显示维修联系电话模块 start -->
					<view class="repair-phone-tip" v-if="repairPhone">
						<image src="/sub-package1/static/img/msg.png" mode="aspectFit" class="repair-phone-tip_image" alt="" />
						<text class="repair-phone-tip_yellow_text">门锁报修联系电话: </text>
						<text class="repair-phone-tip_blue_text" @click="callPhone(repairPhone)">{{ repairPhone }}</text>
					</view>
					<!-- 如果有维修联系电话，则显示维修联系电话模块 end -->
					
					<!-- 联系电话 start -->
					<view class="person-info">
						<ul>
							<li style="border-bottom: 0upx solid #eeeeee;">
								<view class='left-name'>
									{{ repair["phone"] || "联系电话" }}
								</view>
								<view class='right-value'>
									<input :placeholder="`${repair['input-phone']}` || '请输入手机号'" type='number' @input='getPhoneNumber' :value="phone"/>
								</view>
							</li>

						</ul>
					</view>
					<!-- 联系电话 end -->
					
					<view style="color: rgb(136, 136, 136); letter-spacing: 0px; text-align: left; padding: 4px; background: rgb(238, 238, 238);"></view>
					<view class='repair-content'>
						<ul>
							<li>
								<view class='left-name'>
									{{ repair["repair-type"] || "报修类型" }}
								</view>
								<!-- 报修类型 -->
								<view class="right-value">
									<view>
										<picker @change="bindTypeChange" :value="index" :range="repairType">
											<view>{{ repairTypeName }}</view>
										</picker>
									</view>
								</view>
							</li>
							<li>
								<view class='left-name'>
									{{ repair["repair-address"] || "报修地址" }}
								</view>
								<!-- 报修地址 -->
								<view class="right-value">
									<view>
										<picker @change="bindAddressChange" :value="index" :range="roomList">
											<view>{{ room }}</view>
										</picker>
									</view>
								</view>
								<!-- <view class='right-value' @click='getRoomList'>
									<text>{{ room }}</text>
								</view> -->
							</li>
							<li style="border-bottom: 0upx solid #eeeeee;">
								<view class='left-name'>
									{{ repair["time"] || "预约时间" }}
								</view>
								<view class='right-value'>
									<picker mode="multiSelector" :value="multiIndex" :range="multiArray" @change="bindPickerChange" @columnchange="bindColumnChange">
										<text>{{ reserveDate }}</text>
									</picker>
								</view>
							</li>
						</ul>
					</view>
					<view style="color: rgb(136, 136, 136); letter-spacing: 0px; text-align: left; padding: 4px; background: rgb(238, 238, 238);"></view>
					<view class="test">
						<view class='text-area' v-if='!isShow'>
							<textarea :placeholder='`${repair["repair-content"] || "请输入报修内容：（限400字）"}`' maxlength="400" @input='getContent'></textarea>
						</view>
						<view style="color: rgb(136, 136, 136); letter-spacing: 0px; text-align: left; padding: 4px; background: rgb(238, 238, 238);"></view>
						<view class='text-area' v-if='isShow'>{{ textareaValue }}</view>
					</view>
					<view class="test">
						<view class='upload-photo' v-if='itemPicture'>
							<text>{{ repair["upload"] || "上传照片" }}</text>
							<image :src='itemPicture' class='item-picture'>
								<button class='delete-btn' @click='deletePhoto'>
									<image src='https://file.yuanzhoulvwego.com/prod/uploadFiles/img/delete.png'></image>
								</button>
							</image>
						</view>
						<view class='upload-photo' v-else>
							<text>{{ repair["upload"] || "上传照片" }}</text>
							<button @click='takePhoto' class="take-photo-btn">
								<image src='https://file.yuanzhoulvwego.com/prod/uploadFiles/img/camera.png'></image>
							</button>
						</view>
					</view>
				</scroll-view>
				<view class='submit-btn'>
					<button class="primary button" @click='submit'>{{ repair["submit"] || "提交" }}</button>
				</view>
			</swiper-item>
			<!-- 记录 -->
			<swiper-item class="records-list">
				<view class="no-record" v-show="!ifHaveRecords">{{ repair["no-list"] || "暂无报修列表" }}</view>
				<scroll-view scroll-y class='list-scroll' v-show="ifHaveRecords">
					<view>
						<ul>
							<li v-for="(item, index) in repairList" class="record" :key="index">
								<view class='first-line'>
									<view class='left-text'>{{ repair["order-id"] || "报修单号" }} {{ item.orderId }}</view>
									<view class='right-text'>{{ acceptStatus[item.acceptStatus].status }}</view>
								</view>
								<view class='second-line'  @click='getRepairDetail' :id='item.id' :data-status="item.acceptStatus">
									<view class="repair-item">
										<view class="repair-left">{{ repair["repair-type"] || "报修类型" }}</view>
										<view class="repair-right">{{ repairType[item.repairType] }}</view>
									</view>
									<view class="repair-item">
										<view class="repair-left">{{ repair["repair-address"] || "报修地址" }}</view>
										<view class="repair-right">{{ item.roomFullName }}</view>
									</view>
								</view>
								<view class='third-line'>
									<view class="order-time">{{ repair["create-time"] || "下单时间" }} {{ item.createTime }}</view>
									<view class="op-btn"><button :data-status="`${item.acceptStatus}`" @click="clickBtn" :data-item="item.id">{{ item.btnName }}</button></view>
								</view>
							</li>
						</ul>
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	import neilModal from '../../../components/uni-neil-modal/uni-neil-modal.vue';
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
			neilModal
		},
		data() {
			return {
				currentIndex: 0,
				type: "",
				idx: null,
				typeIdx: null,
				index: 0,
				repairType: [],
				repairTypeName: "",
				roomIdList:[],
				room: "",
				roomList: [],
				roomInfo: "",
				roomId: "",
				phone: "",
				contactName: "",
				content: "",
				itemPicture: "",
				img: "",
				reserveDate: "",
				reserveTime: "",
				repairList: [],
				multiArray: [years, months, days, hours, minutes],
				multiIndex: [0, new Date().getMonth(), new Date().getDate() - 1, new Date().getHours(), new Date().getMinutes()],
				chooseYear: "",
				ifHaveRecords: false,
				data: {},
				acceptStatus: [],
				isShow: null,
				textareaValue: "",
				btnName: [],
				repairPhone: this.$getUserInfo().currentCommunity.repairPhone || ""
			}
		},
		onReady() {
			this.$setTitle(this.title["repair"]);
		},
		onLoad: function(options) {
			if(options.currentIndex == 1) {
				this.currentIndex = 1
			}
			this.getRoomList();
			// this.getRepairList();
			this.chooseYear = this.multiArray[0][0];
			var user = this.$getUserInfo();
			this.phone = user.phone.indexOf("@") > -1 ? "" : user.phone;
			this.type = this.repair["select"] || "请选择";
			this.repairType = this.common["repair-type"] || ["水电煤气","家电家具","公共设施","物业设备","门窗","门禁","电梯", "其他"];
			this.repairTypeName = this.repair["select-repair"] || "请选择报修类型";
			this.room = this.repair["select-address"] || "请选择报修地址";
			this.reserveDate = this.repair["select-time"] || "请选择预约时间";
			this.acceptStatus = [{
						index: 0,
						status: this.repair["wait"] || "待处理"
					},
					{
						index: 1,
						status: this.repair["handling"] || "处理中"
					},
					{
						index: 2,
						status: this.repair["wait-comment"] || "已完成待评价"
					},
					{
						index: 3,
						status: this.repair["finished"] || "已完成"
					},
					{
						index: 4,
						status: this.repair["revoked"] || "已撤销"
					}
				];
			this.btnName = [
					{
						index: 0,
						name: this.repair["undo"] || "撤销"
					},
					{
						index: 1,
						name: this.repair["detail"] || "查看详情"
					},
					{
						index: 2,
						name: this.repair["comment"] || "评价"
					},
					{
						index: 3,
						name: this.repair["detail"] || "查看详情"
					},
					{
						index: 4,
						name: this.repair["detail"] || "查看详情"
					}
						
				];
			this.textareaValue = this.repair["repair-content"] || "请输入报修内容：（限400字）";
		},
		
		onShow() {
			this.getRepairList()
		},
		
		computed: {
			common() {
				return this.$t("common")
			},
			repair() {
				return this.$t("repair")
			},
			title() {
				return this.$t("title")
			}
		},

		methods: {
			//获取联系人姓名
			getContactName(e) {
				this.contactName = e.detail.value;
			},

			//获取联系电话
			getPhoneNumber(e) {
				this.phone = e.detail.value;
			},

			//选择报修类型
			bindTypeChange(e) {
				let index = e.detail.value;
				this.repairTypeName = this.repairType[index];
				this.typeIdx = index;
			},

			//关闭弹窗
			closeModal() {
				this.ifRepairModal = false;
				this.roomModalShow = false;
			},

			//获取房间列表
			getRoomList() {
				var currentCommunity = this.$getUserInfo().currentCommunity;
				if(currentCommunity !== "" && currentCommunity !== undefined) {
					// /persEmpHousehold/app/getTenementRoomList
					
					// uni.request({
					//     url: "https://app-api.thinmoo.com/persEmpHousehold/app/getTenementRoomList",
					// 	method: "GET",
					// 	header: {
					// 		"content-type": "application/x-www-form-urlencoded",
					// 		"deviceImei": "",
					// 		"deviceMac": "",
					// 		"language": "zh_CN",
					// 		"terminalApplyType": 1,
					// 		"terminalAppVersion": "4.4.143",
					// 		"terminalDeviceBrand": "",
					// 		"terminalDeviceImei": "",
					// 		"terminalDeviceImsi": "",
					// 		"terminalDeviceModel": "iPhone",
					// 		"terminalDeviceVersion": "ios iOS 13.2.3",
					// 		"terminalOsType": 2,
					// 		"timeZone": "Asia/Shanghai"
					// 	},
					// 	data: {
					// 		communityId: 38896,
					// 		isForceLogin: true,
					// 		accessToken: "app:759108:0c9ebdf9f5cae6ca716ffdc081d2839f",
					// 		appId: "54a4210c2e2b4116b3b67d9b72d8660e"
					// 	},
					//     success: (res) => {
					//         this.$showLog("查询报修房间列表结果333", res);
					//     }
					// });
					
					
					this.$req.request({
						url: `/persEmpHousehold/app/getTenementRoomList?communityId=${currentCommunity.id}`,
						success: res => {
							// 接口状态码为0，返回成功
							if (res.code == 0) {
								this.addressList = res.data.list;
								// 暂无绑定房间
								if (this.addressList.length === 0) {
									this.$showToast(this.repair["no-room"] || "暂无绑定房间");
								}
								// 有绑定房间
								else {
									this.addressList.map((item) => {
										this.roomList.push(item.buildingName + item.name);
									});
								}
							}
						}
					});
				}
			},

			//选择房间值改变
			bindAddressChange(e) {
				var index = e.detail.value;
				this.room = this.roomList[index];
				this.roomId = this.addressList[index].id;
			},

			//获取输入框内容
			getContent(e) {
				this.content = e.detail.value;
			},

			//调用拍照或从相册选取
			takePhoto() {
				var _this = this;
				this.$chooseImage({
					sizeType: ['compressed'],
					success: function(res) {
						// console.log(JSON.stringify(res.tempFiles));
						_this.itemPicture = res.imagePath;
						_this.img = res.imageBase64;
					}
				});
				// uni.chooseImage({
				// 	count: 1,
				// 	sizeType: ['original', 'compressed'],
				// 	sourceType: ['album', 'camera'],
				// 	success: function(res) {
				// 		_this.itemPicture = res.tempFilePaths[0];
				// 		_this.$getImageBase64(res.tempFilePaths[0], (imageBase64) => {
				// 			_this.img = imageBase64;
				// 		});
				// 	},
				// })
			},

			//删除照片
			deletePhoto() {
				this.itemPicture = "";
				this.img = "";
			},

			//时间选择器值改变
			bindPickerChange(e) {
				this.multiIndex = e.detail.value;
				const index = this.multiIndex;
				const year = this.multiArray[0][index[0]];
				const month = this.multiArray[1][index[1]];
				const day = this.multiArray[2][index[2]];
				const hour = this.multiArray[3][index[3]];
				const minute = this.multiArray[4][index[4]];
				this.reserveDate = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
					this.reserveTime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':00';
			},

			//提交
			submit() {
				var _this = this;
				if (this.phone === "") {
					//请输入联系电话
					_this.$showToast(_this.repair["input-phone"])
				} else if (this.repairTypeName === _this.repair["select-repair"]) {
					//"请选择报修类型"
					_this.$showToast(_this.repair["select-repair"]);
				} else if (this.roomId === "") {
					//"请选择报修地址"
					_this.$showToast(_this.repair["select-address"]);
				} else if (this.content === "") {
					//"请输入报修内容"
					_this.$showToast(_this.repair["content-toast"]);
				} else if (this.reserveTime === "") {
					//"请选择预约时间"
					_this.$showToast(_this.repair["select-time"]);
				} else {
					var communityId = this.$getUserInfo().currentCommunity.id;
					_this.$req.request({
						url: "/wyRepairs/app/addRepairs",
						method: "POST",
						data: {
							communityId: communityId,
							contacts: this.contactName,
							contactsNumber: this.phone,
							roomId: this.roomId,
							repairType: this.typeIdx,
							content: this.content,
							base64Image: this.img,
							reserveStartTime: this.reserveTime
						},
						success: res => {
							if (res.code == 0) {
								uni.showToast({
									title: _this.repair["submit-success"] || "提交成功",
									icon: "none"
								})
								this.currentIndex = 1;
								this.getRepairList();
								this.initInput();
							}
						}
					})
				}
			},
			
			//置空所填数据
			initInput() {
				this.repairTypeName = this.repair["select-repair"] || "请选择报修类型";
				this.typeIdx = null;
				this.room = this.repair["select-address"] || "请选择报修地址";
				this.roomId = null;
				this.reserveDate = this.repair["select-time"] || "请选择预约时间";
				this.reserveTime = "";
				this.itemPicture = "";
				this.img = ";"
				this.content = "";
				this.isShow = null;
				this.textareaValue = this.repair["repair-content"] || "请输入报修内容：（限400字）";
				var user = this.$getUserInfo();
				this.phone = user.phone.indexOf("@") > -1 ? "" : user.phone;
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

			//tab切换
			tabSwitch(index) {
				this.currentIndex = index;
				if (this.currentIndex === 1) {
					this.getRepairList();
				}
			},

			// swiperChange
			swiperChange(e) {
				this.currentIndex = e.detail.current;
				if (this.currentIndex === 1) {
					this.getRepairList();
				}
			},
			
			//获取报修记录列表
			getRepairList() {
				var communityId = this.$getUserInfo().currentCommunity.id;
				this.$req.request({
					url: '/wyRepairs/app/getList',
					data: {
						communityId: communityId
					},
					success: res => {
						if(res.data.length == 0) {
							this.ifHaveRecords = false;
						}else {
							this.ifHaveRecords = true;
							this.repairList = res.data;
							for(let i in this.repairList) {
								for(let j in this.btnName) {
									if(this.repairList[i].acceptStatus == this.btnName[j].index) {
										this.repairList[i].btnName = this.btnName[j].name;
									}
								}
							}
						}
						uni.stopPullDownRefresh();
					}
				})
			},
			
			//获取记录详情
			getRepairDetail(e) {
				uni.navigateTo({
					url:"detail?itemId=" + e.currentTarget.id + "&status=" + e.currentTarget.dataset.status,
				})
			},
			
			//点击下方按钮
			clickBtn(e) {
				var that = this;
				var status = e.currentTarget.dataset.status;
				var itemId = e.currentTarget.dataset.item;
				if(status == 0) {
					uni.showModal({
						title: that.repair["undo-tips"] || "撤销提示",
						content: that.repair["undo-confirm"] || "是否确定撤销报修申请？",
						confirmText: that.common["confirm"] || "确认",
						cancelText: that.common["cancel"] || "取消",
						success:function(res){
							if(res.confirm) {
								//执行撤销
								uni.debugLog("用户点击确定");
								that.cancelRecord(itemId);
							} else if(res.cancel) {
								uni.debugLog("用户点击取消");
							}
						}
					})
				}else if (status == 2) {
					//点击评价
					uni.navigateTo({
						url: "rate?itemId=" + itemId
					})
					
				}else {
					//查看详情
					uni.navigateTo({
						url:"detail?itemId=" + itemId + "&status=" + status,
					})
				}
				
			},
			//撤销报修记录
			cancelRecord(id) {
				this.$req.request({
					url:"/wyRepairs/app/backOutById",
					data: {
						id: id
					},
					success: res => {
						if(res.code == 0) {
							this.$showToast(this.repair["undo-success"] || "撤销成功");
							setTimeout(()=> {
								this.currentIndex = 1;
								this.getRepairList();
							}, 500);
						}
					}
				})
			},
			
			// 拨打门锁报修联系电话
			callPhone(phoneNum) {
				uni.makePhoneCall({
				    phoneNumber: phoneNum
				});
			}
		},
		
		onPullDownRefresh() {
			this.getRepairList()
		}
	}
</script>

<style lang="scss">
	.content {
		width: auto;
		padding: 0;
		background-color: #f5f5f5;
	}

	.swiper-tab {
		width: 100%;
		height: 88upx;
		display: flex;
		align-items: center;
		position: absolute;
		background-color: #ffffff;
	}

	.titleSel {
		color: $theme-fg-color;
		font-size: 32upx;
		width: 50%;
		display: block;
		text-align: center;
		align-items: center;
	}

	.titleUnsel {
		color: #666666;
		font-size: 32upx;
		width: 50%;
		display: block;
		text-align: center;
		align-items: center;
	}

	.headerLineSel {
		background: $theme-fg-color;
		height: 3upx;
		width: 30%;
		display: block;
		align-items: center;
		margin-left: 10%;
		position: absolute;
		margin-top: 20upx;
	}

	.headerLineUnsel {
		background: #666666;
		height: 3upx;
		width: 30%;
		display: block;
		align-items: center;
		margin-left: 10%;
		position: absolute;
		margin-top: 20upx;
	}

	.swiper {
		width: 100%;
		padding: 0;
		position: absolute;
		top: 100upx;
		height: 90%;
		margin: 0 auto;
		background-color: #ffffff;
	}

	.repair-scroll {
		height: 85%;
	}

	.swiper ul {
		padding: 0;
		list-style: none;
	}

	.repair ul li {
		width: 94%;
		min-height: 100upx;
		background-color: #FFFFFF;
		height: auto;
		display: inline-flex;
		margin-left: 3%;
		margin-right: 3%;
		margin-bottom: 4upx;
		padding: 0;
		border-bottom: 1upx solid #eeeeee;
	}
	
	.repair {
		// 我要报修tabbar顶部门锁报修联系电话信息
		.repair-phone-tip {
			width: 100%; 
			height: 80upx; 
			background: rgb(252, 226, 190); 
			display: flex; 
			align-items: center;
			// 我要报修tabbar顶部门锁报修联系电话信息的图片
			.repair-phone-tip_image {
				width: 60upx; 
				height: 60upx; 
				margin: 0 16upx 0 3%;
			}
			// 我要报修tabbar顶部门锁报修联系电话信息左边文字描述
			.repair-phone-tip_yellow_text {
				color: rgb(246, 163, 56); 
				margin-right: 8upx;
			}
			// 我要报修tabbar顶部门锁报修联系电话信息右边电话号码
			.repair-phone-tip_blue_text {
				color: rgb(22, 171, 236); 
				font-weight: bold;
			}
		}
	}
	.repair-content ul li::after {
		content: " ";
		display: inline-block;
		transform: rotate(45deg);
		height: 6px;
		width: 6px;
		border-width: 2px 2px 0 0;
		border-color: #c8c8cd;
		border-style: solid;
		position: relative;
		top: 20px;
		margin-left: .3em;
	}

	.test {
		background-color: #FFFFFF;
	}

	.left-name {
		width: 27%;
		text-align: left;
		display: inline-block;
		margin-top: 3%;
	}

	.right-value {
		display: inline-block;
		text-align: left;
		width: 65%;
		margin-top: 3%;
		margin-left: 5%;
		padding-right: 60upx;
	}

	.right-value input {
		font-size: 28upx;
	}

	.text-area {
		width: 94%;
		margin-top: 3%;
		margin-left: 3%;
		margin-right: 3%;
		margin-bottom: 4upx;
		background-color: #ffffff;
		min-height: 200upx;
		box-sizing: border-box;
	}

	.text-area textarea {
		width: 100%;
		height: 200upx;
		font-size: 28upx;
	}

	.upload-photo {
		width: 94%;
		margin-top: 3%;
		margin-left: 3%;
		margin-right: 3%;
		margin-bottom: 3%;
		background-color: #ffffff;
	}

	.take-photo-btn {
		display: block;
		width: 200upx;
		height: 200upx;
		/* border: 1upx solid #d2d2d2; */
		border-radius: 0;
	}

	.take-photo-btn image {
		display: inline-block;
		width: 40upx;
		height: 40upx;
		vertical-align: middle;
		margin-top: 50%;
	}

	.item-picture {
		display: block;
		width: 250upx;
		height: 300upx;
		margin: 0 auto;
	}

	.delete-btn {
		position: absolute;
		border-width: 0upx !important;
		border-style: none;
		padding: 0;
		margin-left: 445upx;
		margin-top: -325upx;
		background: transparent;
	}

	.upload-photo button::after {
		border: none;
	}

	.delete-btn image {
		width: 32upx;
		height: 32upx;
	}

	.submit-btn {
		width: 95%;
		position: absolute;
		bottom: 0;
		display: block;
		background-color: #f5f5f5;
		padding: 20upx;
	}

	.submit-btn button {
		font-size: 30upx;
		margin-top: 30upx;
		background-color: $theme-bg-color;
		color: #ffffff;
	}

	.submit-btn button:after {
		border-style: none;
	}

	.main-content {
		height: 400upx;
	}

	.radio-group label {
		display: block;
		padding: 8upx 20upx;
	}
	
	.records-list {
		background-color: #f5f5f5;
		
	}
	
	.list-scroll {
		height: 100%;
	}
	
	.records-list ul li {
		width: 90%;
		background-color: #FFFFFF;
		height: auto;
		/* display: inline-flex; */
		margin: 3%;
		padding: 15upx 15upx 0;
		border-radius: 5upx;
		/* border-bottom: 1upx solid #eeeeee; */
	}
	
	.first-line {
		display: block;
		padding: 5upx 5upx 15upx;
		border-bottom: 1upx solid #f5f5f5;
	}
	
	.left-text {
		display: inline-block;
		width: 70%;
		text-align: left;
		color: gray;
	}
	
	.right-text {
		display: inline-block;
		width: 30%;
		text-align: right;
	}
	
	.second-line {
		display: block;
		padding: 10upx 5upx;
		border-bottom: 1upx solid #f5f5f5;
	}
	
	.repair-item {
		height: auto;
		display: inline-flex;
		width: 100%; 
	}
	
	.repair-left {
		display: inline-block;
		margin-top: 3%;
		width: 20%;
		color: gray;
	}
	
	.repair-right {
		display: inline-block;
		width: 60%;
		padding-left: 18upx;
		margin-top: 3%;
		width: 65%;
	}
	
	.third-line {
		display: block;
	}
	
	.order-time {
		display: inline-block;
		width: 75%;
		color: gray;
		vertical-align: top;
		margin-top: 20upx;
	}
	
	.op-btn {
		display: inline-block;
		width: 25%;
		text-align: right;
	}
	
	.op-btn button {
		width: 100%;
		font-size: 24upx;
		margin-left: 0;
		margin-right: 0;
		margin-top: 10upx;
	}
	
	.no-record {
		text-align: center;
		font-size: 40upx;
		margin-top: 50%;
	}
</style>
