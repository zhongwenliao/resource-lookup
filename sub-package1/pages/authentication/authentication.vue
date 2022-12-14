<template>
	<uni-base-page class="authentication-view">
		<!-- 身份认证 -->
		<view class="authentication-top-view">
			<image class="authentication-top-img" :src="imageUrl" @click="selectImg" name="faceFileBase64"></image>
		</view>
		<view class="authentication-form-view">
			<form @submit="authentication">
				<view class="form-view">
					<!-- 城市 -->
					<navigator url="/sub-package/pages/area-select/area-select?type=2">
						<view class="uni-list-cell" hover-class="uni-list-cell-hover">
							<view class="uni-list-cell-navigate uni-navigate-right">
								<text class="uni-list-cell-text">城市</text>
								<input style="width: 70%;font-size: 30upx;" maxlength="200" type="text" disabled
									placeholder="请选择城市" name="city" v-model="city" />
								<!-- <input type="hidden" name="cityCode" v-model="cityCode" style="display: none" /> -->
							</view>
						</view>
					</navigator>
					<!-- 小区 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate uni-navigate-right">
							<text class="uni-list-cell-text">小区</text>
							<picker style="width: 70%;" @change="communityChange" :range-key="'name'"
								v-if="cityCode !== ''" name="communityId" :range="communityList">
								<view :class="['input-view', communityIndex > -1 ? '' : 'input-placeholder-view']">
									{{ communityIndex > -1 ? communityList[communityIndex]["name"] : '请选择小区' }}</view>
							</picker>
							<view style="width: 70%;font-size: 30upx;" class="input-placeholder-view input-view" v-else
								@click="chooseArea(1)">请选择小区</view>
						</view>
					</view>
					<!-- 单元 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate uni-navigate-right">
							<text class="uni-list-cell-text">单元</text>
							<picker style="width: 70%" @change="buildingChange" :range-key="'name'"
								v-if="communityIndex > -1" name="buildingId" :range="buildingList">
								<view :class="['input-view', buildingIndex > -1 ? '' : 'input-placeholder-view']">
									{{ buildingIndex > -1 ? buildingList[buildingIndex]["name"] : '请选择单元' }}</view>
							</picker>
							<view style="width: 70%" class="input-placeholder-view input-view" v-else
								@click="chooseArea(2)">请选择单元</view>
						</view>
					</view>
					<!-- 房间 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate uni-navigate-right">
							<text class="uni-list-cell-text">房间</text>
							<picker style="width: 70%" @change="roomChange" :range-key="'name'"
								v-if="buildingIndex > -1" name="roomId" :range="roomList">
								<view :class="['input-view', roomIndex > -1 ? '' : 'input-placeholder-view']">
									{{ roomIndex > -1 ? roomList[roomIndex]["name"] : '请选择房间' }}</view>
							</picker>
							<view style="width: 70%" class="input-placeholder-view input-view" v-else
								@click="chooseArea(3)">请选择房间</view>
						</view>
					</view>
					<!-- 身份类型 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate uni-navigate-right">
							<text class="uni-list-cell-text">身份类型</text>
							<picker style="width: 70%" @change="identityTypeChange" name="identityType"
								:range="identityTypeList">
								<view :class="['input-view', identityTypeIndex > -1 ? '' : 'input-placeholder-view']">
									{{ identityTypeIndex > -1 ? identityTypeList[identityTypeIndex] : '请选择身份类型' }}
								</view>
							</picker>
						</view>
					</view>
					<!-- 真实姓名 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate">
							<text class="uni-list-cell-text">真实姓名</text>
							<input style="width: 70%;font-size: 30upx;" maxlength="200" type="text"
								placeholder="请输入真实姓名" name="realName" />
						</view>
					</view>
					<!-- 性别 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate uni-navigate-right">
							<text class="uni-list-cell-text">性别</text>
							<picker style="width: 70%" @change="sexChange" name="gender" :range="genderList">
								<view :class="['input-view', genderIndex > -1 ? '' : 'input-placeholder-view']">
									{{ genderIndex > -1 ? genderList[genderIndex] : '请选择性别' }}</view>
							</picker>
						</view>
					</view>
					<!-- 证件类型 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate uni-navigate-right">
							<text class="uni-list-cell-text">证件类型</text>
							<picker style="width: 70%" @change="certTypeChange" name="certType" :range="certTypeList">
								<view :class="['input-view', certTypeIndex > -1 ? '' : 'input-placeholder-view']">
									{{ certTypeIndex > -1 ? certTypeList[certTypeIndex] : '请选择证件类型' }}</view>
							</picker>
						</view>
					</view>
					<!-- 证件号 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate">
							<text class="uni-list-cell-text">证件号</text>
							<input style="width: 70%;font-size: 30upx;" maxlength="200" type="text" placeholder="请输入证件号"
								name="certNo" />
						</view>
					</view>
					<!-- APP账号 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate">
							<text class="uni-list-cell-text">APP账号</text>
							<input style="width: 70%;color:#808080;font-size: 30upx;" maxlength="200" type="number"
								placeholder="请输入APP账号" name="phone" :value="phone" />
							<!-- <text class="uni-text-gray">{{ phone }}</text> -->
						</view>
					</view>
					<!-- 成员关系 -->
					<!-- <view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate uni-navigate-right">
							<text class="uni-list-cell-text">成员关系</text>
							<picker style="width: 70%" @change="membershipChange" name="membership" :range="membershipList">
								<view :class="['input-view', membershipIndex > -1 ? '' : 'input-placeholder-view']">{{ membershipIndex > -1 ? membershipList[membershipIndex] : '请选择成员关系' }}</view>
							</picker>
						</view>
					</view> -->
					<!-- 入住时间 -->
					<!-- <view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate uni-navigate-right">
							<text class="uni-list-cell-text">入住时间</text>
							<picker style="width: 70%;" mode="date" name="rentStartTime" @change="chenkInTimeChange">
								<view :class="['uni-input', 'input-view', chenkInTime !== null ? '' : 'input-placeholder-view']">{{ chenkInTime !== null ? chenkInTime : '请设置时间' }}</view>
							</picker>
						</view>
					</view> -->
					<!-- 到期时间 -->
					<!-- <view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate uni-navigate-right">
							<text class="uni-list-cell-text">到期时间</text>
							<picker style="width: 70%;" mode="date" name="rentEndTime" @change="expireEndTimeChange">
								<view :class="['uni-input', 'input-view', expireEndTime !== null ? '' : 'input-placeholder-view']">{{ expireEndTime !== null ? expireEndTime : '请设置时间' }}</view>
							</picker>
						</view>
					</view> -->
				</view>
				<!-- 文字提示 -->
				<view style="padding: 10upx 26upx 0;">
					<text class="red-help-text">添加房屋需进行物业审核，可前往申请记录中查看审核状态</text>
				</view>
				<view class="btn-row">
					<button type="primary" class="primary" formType="submit">提交</button>
				</view>
			</form>
		</view>
	</uni-base-page>
</template>

<script>
	var houseObj = {};
	var faceImageBase64 = "";
	export default {
		data() {
			return {
				phone: this.$getUserInfo().phone,
				imageUrl: "http://www.thinmoo.com/wp-content/uploads/2020/10/user.png",
				genderList: ["男", "女"],
				city: "",
				communityList: [],
				communityIndex: -1,
				buildingList: [],
				buildingIndex: -1,
				roomList: [],
				roomIndex: -1,
				genderIndex: -1,
				certTypeList: ["身份证", "居住证", "驾照", "护照", "军人证", "通行证", "其他"],
				certTypeIndex: -1,
				identityTypeList: ["业主", "家属", "租客"],
				identityTypeIndex: -1,
				membershipList: ["自己", "夫妻", "父母", "子女", "亲人", "朋友", "其他"],
				membershipIndex: -1,
				cityCode: "",
				chenkInTime: null,
				expireEndTime: null
			}
		},
		methods: {
			// 初始化小区、单元、房间数据
			initAreaData() {
				this.communityIndex = -1;
				this.buildingIndex = -1;
				this.roomIndex = -1;
				this.communityList = [];
				this.buildingList = [];
				this.roomList = [];
			},
			// 选择图片
			selectImg() {
				var _this = this;
				this.$chooseImage({
					sizeType: ['compressed'],
					success: function(res) {
						// console.log(JSON.stringify(res.tempFiles));
						_this.imageUrl = res.imagePath;
						faceImageBase64 = res.imageBase64;
					}
				});
				// uni.chooseImage({
				// 	count: 1, // 默认9
				// 	// sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
				// 	sizeType: ['compressed'],
				// 	// sourceType: ['album'], // 从相册选择
				// 	success: function(res) {
				// 		console.log(JSON.stringify(res.tempFiles));
				// 		_this.imageUrl = res.tempFiles[0]["path"];
				// 		_this.$getImageBase64(res.tempFilePaths[0], (imageBase64) => {
				// 			faceImageBase64 = imageBase64;
				// 			console.log("faceImageBase64:", imageBase64);
				// 		});
				// 	}
				// });
			},
			// 小区onchange事件
			communityChange(e) {
				this.communityIndex = e.target.value;
				var communityId = this.communityList[this.communityIndex]["id"];
				houseObj["communityId"] = communityId;
				this.$req.request({
					url: "/sqBuilding/app/getBuildingByCommunityId",
					data: {
						communityId: communityId
					},
					success: res => {
						this.buildingList = res.data;
					}
				});
			},
			// 通过城市code获取小区列表
			getCommunityByCityCode(cityCode) {
				this.$req.request({
					url: "/sqCommunity/app/getCommunityByCityCode",
					data: {
						"cityCode": cityCode
					},
					success: res => {
						console.log("res", res);
						this.communityList = res.data;
						if (this.communityList.length === 0) {
							this.$showToast("该城市下暂无小区");
							this.communityIndex = -1;
						}
					}
				});
			},

			chooseArea(type) {
				var obj = {
					1: "请先选择城市",
					2: "请先选择小区",
					3: "请先选择单元"
				};
				this.$showToast(obj[type]);
			},
			// 单元onchange事件
			buildingChange(e) {
				this.buildingIndex = e.target.value;
				var communityId = this.communityList[this.communityIndex]["id"];
				var buildingId = this.buildingList[this.buildingIndex]["id"];
				houseObj["buildingId"] = buildingId;
				this.$req.request({
					url: "/sqRoom/app/getRoomByBuildingIdAndCommunityId",
					data: {
						communityId: communityId,
						buildingId: buildingId
					},
					success: res => {
						this.roomList = res.data;
					}
				});
			},
			// 房间onchange事件
			roomChange(e) {
				this.roomIndex = e.target.value;
				houseObj["roomId"] = this.roomList[this.roomIndex]["id"];
			},
			// 性别onchange事件
			sexChange(e) {
				this.genderIndex = e.target.value;
			},

			// 入住时间onchange事件
			// chenkInTimeChange(e) {
			// 	this.chenkInTime = e.target.value;
			// },

			// 到期时间onchange事件
			// expireEndTimeChange(e) {
			// 	this.expireEndTime = e.target.value;
			// },

			// 证件类型onchange事件
			certTypeChange(e) {
				// console.log("证件类型----",e)
				this.certTypeIndex = e.target.value;
			},

			// 身份类型onchange事件
			identityTypeChange(e) {
				this.identityTypeIndex = e.target.value;
			},

			// 成员关系onchange事件
			membershipChange(e) {
				this.membershipIndex = e.target.value;
			},
			// 添加住户
			authentication(e) {
				var _this = this;
				var checkList = [{
					name: "faceFileBase64",
					rules: [{
						required: true,
						message: "请上传照片"
					}]
				}, {
					name: "city",
					rules: [{
						required: true,
						message: "请选择城市"
					}]
				}, {
					name: "communityId",
					rules: [{
						required: true,
						message: "请选择小区"
					}]
				}, {
					name: "buildingId",
					rules: [{
						required: true,
						message: "请选择单元"
					}]
				}, {
					name: "roomId",
					rules: [{
						required: true,
						message: "请选择房间"
					}]
				}, {
					name: "identityType",
					rules: [{
						required: true,
						message: "请选择身份类型"
					}]
				}, {
					name: "realName",
					rules: [{
						required: true,
						message: "请输入姓名"
					}]
				}, {
					name: "gender",
					rules: [{
						required: true,
						message: "请选择性别"
					}]
				}, {
					name: "certType",
					rules: [{
						required: true,
						message: "请选择身份类型"
					}]
				}, {
					name: "certNo",
					rules: [{
						required: true,
						message: "请输入证件号"
					}]
				}];
				//进行表单检查
				var formData = e.detail.value;
				formData = Object.assign(formData, houseObj);
				console.log("formData===%o", formData)
				for (var field in formData) {
					if (field.endsWith("Time")) {
						if (formData[field] !== "") {
							formData[field] += " 00:00:00";
						} else {
							delete formData[field];
						}
					} else if (field === "gender" || field === "identityType") {
						formData[field] = formData[field] !== "" ? parseInt(formData[field]) + 1 : formData[field];
					}
				}
				// formData.roomIds = houseObj.id;
				if (faceImageBase64 !== "") {
					formData.faceFileBase64 = faceImageBase64;
				}
				this.$formSubmitCheck({
					formData: formData,
					checkList: checkList,
					success: () => {
						this.$req.request({
							method: "POST",
							url: '/persIdentityAuth/app/houseAuth',
							data: formData,
							success: (res) => {
								uni.showToast({
									title: "添加成功",
									icon: "none"
								});
								setTimeout(function() {
									uni.navigateBack({
										delta: 1
									})
								}, 500);
							},
						});
					}
				});
			}
		},
		onShow(e) {
			var pages = getCurrentPages();
			var currPage = pages[pages.length - 1];
			var data = currPage.data;
			if (data !== undefined) {
				if (this.cityCode !== data.cityCode) {
					this.initAreaData();
					this.cityCode = data.cityCode;
					this.city = data.city;
					this.getCommunityByCityCode(this.cityCode);
				}

			}
		},
		onLoad(options) {
			houseObj = {};
			this.phone = this.$getUserInfo().phone;
			this.initAreaData();
			faceImageBase64 = "";
		}
	}
</script>

<style lang="scss">
	.authentication-view {
		background: #eeeeee;
		width: 100%;

		.authentication-top-view {
			width: 100%;
			background: #ffffff;
			display: flex;
			justify-content: center;
			padding: 30upx 0;

			.authentication-top-img {
				width: 200upx;
				height: 200upx;
			}
		}

		.authentication-form-view {
			.form-view {
				margin-top: 10upx;
				background: #ffffff;

				.uni-list-cell {
					&:after {
						left: 0;
					}

					.uni-list-cell-navigate {
						// justify-content: start;
						text-align: left;

						.uni-list-cell-text {
							width: 26%;
						}

						.uni-input {
							padding: 0;
							background: none;
						}

						.input-view {
							color: #000000;
						}

						.input-placeholder-view {
							color: #808080;
							font-size: 30upx;
						}
					}
				}

			}

			.btn-row {
				margin-top: 10upx;
			}
		}

	}
</style>
