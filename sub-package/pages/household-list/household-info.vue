<template>
	<uni-base-page style="background-color: #F5F5F5;">
		<view class="info-list">
			<view class="info-list-with-img">
				<view class="image-view">
					<image class="uni-list-cell-img" mode="aspectFit"
						:src="getInfo.faceImage !== undefined ? getInfo.faceImage : 'http://www.thinmoo.com/wp-content/uploads/2020/10/static-img.png'">
					</image>
				</view>
				<view class="info-list-name">{{ getInfo.name }}
					<image
						:src="getInfo.gender === 1?'../../static/img/house/female.png':'../../static/img/house/male.png'">
					</image>
				</view>
			</view>
			<view class="dividing-line"></view>
			<view class="info-list-cell border-bottom" v-if="getInfo.phone">
				<view class="list-title">{{ house["phone"]||"手机" }}</view>
				<view class="list-content" style="color: #00557f;" @click="callPhone(getInfo.phone)">
					{{ getInfo.phone }}
				</view>
			</view>
			<view class="info-list-cell border-bottom" v-if="getInfo.certNo">
				<view class="list-title">{{ house["cert-num"]||"证件号" }}</view>
				<view class="list-content">{{ getInfo.certNo }}</view>
			</view>
			<view v-if="isAppAddMemberCanAddCard" class="info-list-cell border-bottom">
				<view class="list-title">{{ house["cardNo"]||"卡号" }}</view>
				<ul style="display: flex; flex-wrap: wrap;" v-if="getInfo.cardNos">
					<li v-for="(item, i ) in getInfo.cardNos.split(',')" @click="delcardNo(item,i)"
						style="display: flex; align-items: center; padding: 10upx;">
						<view
							style="background-color: #169BD5; color: #FFFFFF;font-size: 24upx;padding: 0 20upx; border-radius: 40upx;">
							{{ item }}
						</view>
						<image style="width: 26upx; height: 26upx;margin-left: 6upx;"
							src="../../../sub-package1/static/img/cha.png" mode="" v-if="getInfo.isBindDoorLock!=1">
						</image>
					</li>
				</ul>

			</view>
			<view v-if="getInfo.isBindDoorLock" class="info-list-cell border-bottom">
				<view class="list-title">{{ house["fingerprint"] || "指纹" }}</view>
				<ul style="display: flex; flex-wrap: wrap;">
					<li v-for=" ( item, i ) in getInfo.persBioFingerprintList " @click="deleFingerprintBtn(item,i)"
						style="display: flex; align-items: center; padding: 10upx;">
						<view
							style="background-color: #169BD5; color: #FFFFFF;font-size: 24upx;padding: 0 20upx; border-radius: 40upx;">
							{{ house["fingerprint"] || "指纹" }}{{i+1}}
						</view>
						<image style="width: 26upx; height: 26upx;margin-left: 6upx;"
							src="../../../sub-package1/static/img/cha.png" mode=""></image>
					</li>
				</ul>
			</view>
			<!-- v-if="memberObj.identityType !== 1"只有不是业主身份时才可以续租 -->
			<view class="info-list-cell border-bottom" v-if="getInfo.identityType !== 1 && tenant != 1">
				<view class="list-title">{{ house["rent-date"] || "租期" }}</view>
				<view class="list-content">{{ getInfo.chenkInTime }} - {{ getInfo.expireEndTime }}</view>
				<view style="float: right; color: #00aa7f;" @click="editRentDate">{{ house["edit-rental"] || "续租" }}
				</view>
			</view>
			<view class="dividing-line"></view>

			<!-- 开卡功能部分 -->
			<view class="operation-box" v-if="isAppAddMemberCanAddCard == 1">
				<view class="info-list-cell">
					<button class="green-bg" @click="writecardShow=true">{{ house["write-card"] || "开卡" }}</button>
				</view>
				<view class="tips">
					{{ house["write-card-tips"] || "提示： 18-60岁区间仅限开通身份证开卡" }}
				</view>
			</view>

			<!-- 业主身份不能自己删除自己 -->
			<view class="info-list-cell" v-if="getInfo.identityType !== 1" style="background: #F5F5F5;">
				<button class="normal-bg" @click="clickDelete">{{ common["delete"] || "删除" }}</button>
			</view>

			<view v-if="getInfo.isBindDoorLock && getInfo.sqCommunityParam.fingerprintSyncMode === 1"
				style="background: #F5F5F5;">
				<view class="info-list-cell">
					<button class="green-bg"
						@click="addFingerprintBtn">{{ house["add_fingerprint"] || "添加指纹" }}</button>
				</view>
			</view>

		</view>

		<!--底部弹框 开卡选择-->
		<u-action-sheet :list="writecardList" v-model="writecardShow" :cancel-btn="true" @click="clickWriteCard">
		</u-action-sheet>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				memberObj: {},
				devObj: {},
				tenant: '',
				persBioFingerprintList: [],
				devInfo: {},
				getInfo: {}, //详情信息
				isAppAddMemberCanAddCard: false,
				isSupportOpenCard: false,
				writecardShow: false, //开卡操作菜单
				writecardList: [{
						text: '门锁开卡',
						color: '#333333',
						fontSize: 30
					},
					{
						text: '门禁开卡',
						color: '#333333',
						fontSize: 30
					}
				]
			}
		},

		computed: {
			title() {
				return this.$t("title")
			},
			common() {
				return this.$t("common")
			},
			house() {
				return this.$t("house")
			},
			manage() {
				return this.$t("manage")
			}
		},
		onReady() {
			this.$setTitle(this.title["household-info"] || "住户信息");
		},
		onLoad(options) {
			console.log(JSON.parse(options.memberObj))
			//不是业主 的情况下，在我的房屋页面点击指纹录入进入到页面的。就不显示租期列表。
			if (options.tenant) {
				this.tenant = options.tenant;
			}
			if (options.memberObj) {
				let memberObj = JSON.parse(options.memberObj);
				if (memberObj.faceImage !== undefined && memberObj.faceImage !== "") {
					memberObj.faceImage = memberObj.faceImage.split(",")[0];
				}
				if (memberObj.chenkInTime) {
					memberObj.checkInDate = memberObj.chenkInTime.split(" ")[0];
					memberObj.expireEndDate = memberObj.expireEndTime.split(" ")[0];
				}
				this.memberObj = memberObj;
				if (options.devObj) {
					this.devObj = JSON.parse(options.devObj);
					// console.log('this.devObj--',this.devObj)
					this.isAppAddMemberCanAddCard = this.memberObj.isAppAddMemberCanAddCard;
					console.log("开卡",this.isAppAddMemberCanAddCard)
					this.isSupportOpenCard = this.memberObj.isSupportOpenCard;
					this.devInfo = this.devObj;
					// console.log('111####123',this.isAppAddMemberCanAddCard,'--',this.isSupportOpenCard)
					// 当没有穿 设备信息过来时，需要请求设备信息
				} else {
					this.devInfo = this.memberObj;
				}
				// this.getByRoomEmpRelId()
				this.getByRoomId()
			}
			if (this.memberObj.persBioFingerprintList === undefined) {
				this.getFingerprintList()
			}
		},
		onShow() {
			this.getByRoomEmpRelId()
		},

		methods: {
			//获取页面详情接口
			getByRoomEmpRelId() {
				let id = this.tenant == 1 ? this.memberObj.roomEmpRelId : this.memberObj.id;
				this.$req.request({
					url: "/persEmpHousehold/app/getByRoomEmpRelId",
					data: {
						roomEmpRelId: id
					},
					success: res => {
						this.getInfo = res.data;
						console.log('this.getInfo', this.getInfo);
					}
				})
			},


			// 获取已登记的指纹
			getFingerprintList() {
				this.$req.request({
					url: "/persBioFingerprint/app/getList",
					data: {
						empId: this.memberObj.empId, //删除多个逗号相隔
						roomId: this.memberObj.id
					},
					success: res => {
						this.memberObj.persBioFingerprintList = res.data;
						//强制刷新
						this.$forceUpdate()
					}
				})
			},
			//获取设备信息
			getByRoomId() {
				// 判断是否有设备信息
				if (this.devObj.appEkey) {
					this.devInfo = this.devObj
				} else {
					//获取设备信息
					this.$req.request({
						url: "/devDevice/app/getByRoomId",
						data: {
							roomId: this.devInfo.id,
						},
						success: res => {
							this.devInfo = res.data
						}
					})
					console.log(this.devInfo, 6666)
				}
			},
			//删除卡号
			delcardNo(item, i) {
				console.log(item)
				let that = this;
				uni.showModal({
					title: '提示',
					content: (this.house["areyousureto_delete"] || '确定删除吗'),
					success: function(res) {
						if (res.confirm) {
							that.delcardnoApi(item)

						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			//删除卡号api
			delcardnoApi(id) {
				this.$req.request({
					url: "/persCard/app/deleteByCardNo",
					data: {
						communityId: this.memberObj.communityId, //删除多个逗号相隔
						cardNo: id
					},
					success: res => {
						if (res.code === 0) {
							this.$showToast(this.house["del_confirm"] || '删除成功');
							this.getByRoomEmpRelId()
						} else {
							this.$showToast(res.msg);
						}
					}
				})

			},
			//删除指纹
			deleFingerprintBtn(item, i) {
				console.log(item)
				let that = this;
				uni.showModal({
					title: '提示',
					content: (this.house["confirm_del_fingerprint"] || '确定要删除指纹') + (i + 1) + '吗？',
					success: function(res) {
						if (res.confirm) {
							let arr = [];
							let ids = '' + item.id;
							arr.push('' + item.id);
							console.log("是否支持联网：", that.devInfo.isSupportNetwork)
							//判断设备是否支持联网 如果不支持联网的话先调取蓝牙删除指纹在调取服务器 如支持的话 只调取服务器删除
							if (that.devInfo.isSupportNetwork == 0) {
								that.$showToast("请确保设备在附近")
								setTimeout(() => {
									that.$sdkUtil.deleteFingerprints(that.devInfo, arr, (res) => {
										if (res.errorCode === 0) {
											console.log("蓝牙删除成功", res.errorCode)
											//删除成功，上传服务器
											that.deleteByIds(ids)
										} else {
											that.$showToast(res.msg);
										}
									})
								}, 2000)
							} else {
								that.deleteByIds(ids)
							}
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			// 删除指纹上传服务器  type参数代表是什么状态 1为删除住户时候调取的
			deleteByIds(ids, type) {
				this.$req.request({
					url: "/persBioFingerprint/app/deleteByIds",
					data: {
						ids: ids, //删除多个逗号相隔
					},
					success: res => {
						if (res.code === 0) {
							this.$showToast(this.house["del_confirm"] || '删除指纹成功');
							setTimeout(() => {
								uni.navigateBack()
							}, 2000)
						} else {
							this.$showToast(res.msg);
						}
					}
				})
			},

			//添加指纹
			addFingerprintBtn() {
				let that = this;
				uni.showModal({
					title: that.common['hint'] || '提示',
					confirmText: that.common['confirm'] || '确定',
					cancelText: that.common['cancel'] || '取消',
					content: that.house["Input_fingerprint_prompt"] || '请根据设备提示，蓝灯亮起按下手指，绿灯亮起抬起手指，连续按压三次即可录入成功。',
					success: function(res) {
						if (res.confirm) {
							that.preRegistration(that.devInfo)
						}
					}
				});

			},
			// 获取指纹id 连接设备登记指纹
			preRegistration(devInfo) {
				// 获取要登记的指纹id所需的数据
				let preRegistrationData = {
					"empId": this.memberObj.empId || this.getInfo.empId,
					"communityId": this.memberObj.communityId || this.getInfo.communityId,
					"roomId": this.memberObj.roomId || this.getInfo.roomId
				};
				this.$showLog("获取要登记的指纹id所需的数据", preRegistrationData);

				// 调用预登记接口获取需要登记的指纹id
				this.$req.request({
					url: "/persBioFingerprint/app/preRegistration",
					data: preRegistrationData,
					success: res => {
						if (res.code === 0) {
							let param = {
								id: "" + res.data.id
							};
							this.$showLog("指纹id", param.id);
							this.$sdkUtil.deviceRegistFingerprint(devInfo, param, (res) => {
								if (res.errorCode === 0) {
									//添加成功，上传服务器
									this.register(param)
								} else {
									that.$showToast(res.msg);
								}
							})
						} else {
							this.$showToast(res.msg);
						}
					}
				})
			},
			//APP登记指纹
			register(param) {
				this.$showLog("上传到服务器的指纹参数", param);
				this.$req.request({
					url: "/persBioFingerprint/app/register",
					data: param,
					success: res => {
						if (res.code === 0) {
							//登记成功
							this.$showToast(this.house["registration_successful"] || "录入成功");
							setTimeout(() => {
								uni.navigateBack()
							}, 2000)
						} else {
							this.$showToast(res.msg);
						}
					}
				})
			},
			//拨打电话
			callPhone(tel) {
				// #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY
				uni.makePhoneCall({
					phoneNumber: tel //仅为示例
				});
				// #endif
			},

			// 点击开卡
			clickWriteCard(index) {
				var that = this;
				if (index == 0) {
					//门锁开门
					uni.showModal({
						content: that.house["card-modal-content"] || "是否确定给该用户开卡？",
						confirmText: that.common["confirm"] || "确定",
						cancelText: that.common["cancel"] || "取消",
						success: res => {
							if (res.confirm) {
								// 先读卡
								// this.writeCardRequest(memberObj);
								this.$sdkUtil.getSwipeAddCardno(that.devInfo, (result) => {
									let cardNo = result.data.cardNo;
									console.log("读取到的卡号： ", cardNo);
									let cardType = result.data.cardType;
									// 请求服务器是否可以写卡
									this.writeCardRequest(cardNo, cardType);
								})
							}
						}
					})
				} else {
					//门禁开门
					uni.navigateTo({
						//多个参数用&拼接:url: '../comment/comment?id='+id+'&name='+name
						url: '/sub-package/pages/household-list/door-opening?memberObj=' + JSON.stringify(this
							.memberObj)
					});
				}


			},

			// 开卡前请求，用于判断该用户是否可以开卡
			writeCardRequest(cardNo, cardType) {
				let that = this;
				this.$req.request({
					url: "/persCard/app/checkEmpIsMadeCard",
					data: {
						empId: this.memberObj.empId,
						cardNo: cardNo,
						cardType: cardType
					},
					success: res => {
						if (res.code === 0) {
							// 进行写卡操作
							let cardArray = cardNo.split(",");
							// console.log("devObj---",this.devObj);
							this.$sdkUtil.writeCard(that.devInfo, cardArray, true, () => {
								// 有回调说明写卡成功,通知服务器，且说明开卡类型
								this.informWriteCard(cardNo, cardType);
							})

						} else {
							this.$showToast(res.msg);
						}
					}
				})
			},

			// 通知服务器开卡成功
			informWriteCard(cardNo, cardType) {
				//cardType：0无，1为IC卡，2为身份证
				this.$req.request({
					url: "/persCard/app/add",
					data: {
						"empId": this.memberObj.empId,
						"cardNo": cardNo,
						"roomId": this.memberObj.roomId,
						"type": parseInt(cardType),
						"isShowLoad": false
					},
					success: res => {
						if (res.code == 0) {
							this.$showToast(this.manage["write-card-success"] || "开卡成功");
						} else {
							this.$showToast(res.msg);
						}
					}
				})
			},

			// 删除住户
			clickDelete() {
				var _this = this;
				uni.showModal({
					content: this.common["delete-tips"] || "确定要删除该成员吗？",
					cancelText: this.common["cancel"] || "取消",
					confirm: this.common["confirm"] || "确定",
					success(res) {
						if (res.confirm) {
							if (!this.getInfo || !this.getInfo.isBindDoorLock) {
								_this.deleteMember()
								return
							}
							//删除指纹 判断设备是否支持联网 如果不支持联网的话先调取蓝牙删除指纹在调取服务器 如支持的话 只调取服务器删除
							if (_this.devInfo.isSupportNetwork == 0) {
								//判断是否支持指纹 如果不支持指纹就直接删除
								if (_this.getInfo && _this.getInfo.sqCommunityParam && _this.getInfo
									.sqCommunityParam.fingerprintSyncMode == 1) {
									_this.deleteMember()
									return
								}
								let fingerprintsIds = _this.getInfo.persBioFingerprintList.map(item => item.id +
									'')
								_this.$showToast("请确保设备在附近")
								setTimeout(() => {
									_this.$sdkUtil.deleteFingerprints(_this.devInfo, fingerprintsIds, (
										res) => {
										if (res.errorCode === 0) {
											_this.deleteMember()
										} else {
											console.log(res)
											_this.$showToast(res.msg);
										}
									})
								}, 2000)
							} else {
								_this.deleteMember()
							}
						}
					}
				})
			},

			//删除住户
			deleteMember() {
				this.$req.request({
					url: "/sqRoomEmpRel/app/deleteById",
					data: {
						id: this.memberObj.id
					},
					success: res => {
						if (res.code == 0) {
							console.log("删除住户成功")
							this.$showToast(this.house["delete-success"] || "删除成功");
							setTimeout(() => {
								uni.navigateBack();
							}, 1000)
						}
					}
				})
			},

			// 点击续租
			editRentDate() {
				uni.navigateTo({
					url: "edit-lease-date?tenantObj=" + JSON.stringify(this.memberObj)
				})
			}
		}


	}
</script>

<style lang="scss">
	.info-list {
		margin: 0;
		width: 100%;
		border: none;
		display: flex;
		flex-direction: column;
	}

	.info-list-with-img {
		width: 94%;
		margin: 20upx 3%;
		display: flex;
		align-items: center;
	}

	.info-list-name {
		margin-left: 40upx;
		font-size: 36upx;
		font-weight: bold;
	}

	.info-list-name image {
		margin-left: 16upx;
		width: 36upx;
		height: 36upx;
	}

	.info-list-cell {
		width: 92%;
		padding: 20upx 4%;
		display: flex;
		align-items: center;

		ul {
			padding: 0;

			li {
				list-style-type: none; //去掉标签默认的左边符号
				text-align: center;
			}
		}
	}

	.border-bottom {
		border-bottom: 1upx solid #EEEEEE;
	}

	.image-view {
		height: 160upx;
		width: 160upx;
		background-color: #c3c3c3;
		border-radius: 20upx;
	}

	.uni-list-cell-img {
		max-width: 160upx;
		max-height: 160upx;
		float: left;
	}

	.list-title {
		font-size: 30upx;
		width: 25%;
		font-weight: 600;
	}

	.list-content {
		font-size: 30upx;
		width: 67%;
	}

	.info-list-cell button {
		width: 85%;
		border-radius: 0;
	}

	.operation-box {
		background-color: #F5F5F5;
		padding-top: 40upx;
	}

	.green-bg {
		background-color: #00aa7f;
		color: #FFFFFF;
	}

	.normal-bg {
		background-color: #EEEEEE;
		color: #000000;
	}

	.tips {
		color: #AAAAAA;
		text-align: center;
	}
</style>
