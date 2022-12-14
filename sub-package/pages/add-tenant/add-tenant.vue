<template>
	<uni-base-page class="add-tenant-view">
		<!-- 添加住户 -->
		<!-- #ifndef MP-WEIXIN || MP-ALIPAY -->
			<view class="authentication-top-view">
				<!-- <image class="authentication-top-img" :src="imageUrl" @click="selectImg" name="faceFileBase64"></image> -->
				<view class="avatar">
					<avatar
						fileType="jpg"
						quality="0.5"
						selWidth="300px" selHeight="600upx" ref="child" @upload="myUpload" :avatarSrc="imageUrl"
						avatarStyle="width: 150upx; height: 150upx; border-radius: 100%;">
					</avatar>
				</view>
				<view class="img-help-tip">{{house["register-face"] || "点击上图登记人脸"}}</view>
			</view>
		<!-- #endif -->
		<!-- #ifdef MP-WEIXIN || MP-ALIPAY -->
			<view class="authentication-top-view" v-if="isOpenWxminiUploadPhoto">
				<image class="authentication-top-img" :src="imageUrl" @click="selectImg" name="faceFileBase64"></image>
				<view class="img-help-tip">{{house["register-face"] || "点击上图登记人脸"}}</view>
			</view>
		<!-- #endif -->
		<view class="add-tenant-form-view">
			<form @submit="addTenant">
				<view  class="form-view">
					<!-- 身份类型 -->
						<view class="uni-list-cell" hover-class="uni-list-cell-hover" v-if="houseObj.identityType === 1">
							<view class="uni-list-cell-navigate uni-navigate-right">
								<text class="uni-list-cell-text"><text class="require-text">*</text>{{ house["identity"] || "身份类型" }}</text>
								<picker style="width: 70%; font-size: 34upx;" mode="selector" @change="identityTypeChange" name="identityType" :range="identityTypeList">
									<view :class="['input-view', identityTypeIndex > -1 ? '' : 'input-placeholder-view']">{{ identityTypeIndex > -1 ? identityTypeList[identityTypeIndex] : house["identity-placeholder"] }}</view>
								</picker>
							</view>
						</view>
					<!-- 姓名 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate">
							<text class="uni-list-cell-text"><text class="require-text">*</text>{{ house["name"] || "姓名" }}</text>
							<input maxlength="50" type="text" :placeholder="`${house['name-placeholder']}` || '请输入姓名' " name="name" style="width: 70%; font-size: 34upx;" />
						</view>
					</view>
					<!-- 性别 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate uni-navigate-right">
							<text class="uni-list-cell-text"><text class="require-text">*</text>{{ house["gender"] || "性别" }}</text>
							<picker style="width: 70%; font-size: 34upx;" @change="sexChange" name="gender" :range="genderList">
								<view :class="['input-view', genderIndex > -1 ? '' : 'input-placeholder-view']">{{ genderIndex > -1 ? genderList[genderIndex] : house["gender-placeholder"] }}</view>
							</picker>
						</view>
					</view>
					<!-- 手机号 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover" v-if="houseObj.identityType === 1">
						<view v-if="isCN" class="uni-list-cell-navigate">
							<text class="uni-list-cell-text">{{ house["phone"] || "手机号" }}</text>
							<input maxlength="11" type="text" :placeholder="`${house['phone-placeholder']}` || '请输入手机号'" name="phone" style="width: 70%; font-size: 34upx;" />
						</view>
						<view v-else class="uni-list-cell-navigate">
							<text class="uni-list-cell-text">{{ mine["email"] || "邮箱" }}</text>
							<input type="text" :placeholder="`${email['email-account']}` || '请输入邮箱号'" name="phone" style="width: 70%; font-size: 34upx;" />
						</view>
					</view>
					<!-- 卡号 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover" v-if="houseObj.isAppAddMemberCanAddCard === 1">
						<view class="uni-list-cell-navigate">
							<text class="uni-list-cell-text">{{ house["cardNo"] || "卡号" }}</text>
							<input maxlength="11" type="text" :placeholder="`${manage['input-card']}` || '请输入卡号'" name="cardNo" style="width: 70%; font-size: 34upx;" />
						</view>
					</view>
					<!-- 证件类型 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate uni-navigate-right">
							<text class="uni-list-cell-text"><text class="require-text" v-if="ifNeedID || houseObj.industryType === 3">*</text>{{ house["cert-type"] || "证件类型" }}</text>
							<picker style="width: 70%; font-size: 34upx;" @change="certTypeChange" name="certType" :range="certTypeList">
								<view :class="['input-view', certTypeIndex > -1 ? '' : 'input-placeholder-view']">{{ certTypeIndex > -1 ? certTypeList[certTypeIndex] : house["cert-placeholder"] }}</view>
							</picker>
						</view>
					</view>
					<!-- 证件号 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover" :style="{'background': certNoDisabled ? '#EEEEEE' : '#FFFFFF'}">
						<view class="uni-list-cell-navigate">
							<text class="uni-list-cell-text"><text class="require-text" v-if="ifNeedID || houseObj.industryType === 3">*</text>{{ house["cert-num"] || "证件号" }}</text>
							<input maxlength="20" type="text" :placeholder="`${house['cert-num-placeholder']}` || '请输入证件号'" name="certNo" :disabled="certNoDisabled"
							 style="width: 70%; font-size: 34upx;" />
						</view>
					</view>
					<!-- 入住时间 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover" v-if="houseObj.identityType === 1 && identityTypeIndex == 2">
						<view class="uni-list-cell-navigate">
							<text class="uni-list-cell-text">{{ house['checkin-time'] || "入住时间" }}</text>
							<text style="font-size: 34upx;color: #808080;width: 70%;">{{ rentStartTime !== null ? rentStartTime : house["set-time"] }}</text>
						</view>
					</view>
					<!-- 到期时间 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover"  v-if="houseObj.identityType === 1 && identityTypeIndex == 2" @click="onExpireEndTimeVisibleChange">
						<view class="uni-list-cell-navigate uni-navigate-right">
							<text class="uni-list-cell-text" style="width: 30%;">{{ house['end-time'] || "到期时间" }}</text>
							
							<text style="font-size: 34upx;color: #808080;width: 70%;">
								{{ rentEndTime ? rentEndTime : house["set-time"] }}
							</text>
							
							<w-picker
								mode="date" 
								fields="minute"
								:visible.sync="expireEndTimeVisible"
								:startYear="currentDate.getFullYear()" 
								:endYear="currentDate.getFullYear() + 10"
								:current="true"
								:disabled-after="false"
								@confirm="onExpireEndTimeConfirm"
							/>
						</view>
					</view>
				</view>
				<view style="padding: 10upx 26upx 0; color: red;" v-if="houseObj.industryType !== 3">
					<text class="red-help-text" v-if="textShow">{{ house["add-householder-tips"]||"该小区暂未开启自动审核，提交后请等待物业审核" }}</text>
				</view>
				<view class="btn-row">
					<button type="primary" class="primary" formType="submit">{{ house["submit"] || "提交" }}</button>
				</view>
			</form>
		</view>
	</uni-base-page>
</template>

<script>
	var houseObj = {};
	var faceImageBase64 = "";
	import avatar from "../../../components/yq-avatar/yq-avatar.vue";
	export default {
		components: {
			avatar
		},
		data() {
			return {
				imageUrl: "http://www.thinmoo.com/wp-content/uploads/2020/10/capture-default.png",
				genderList: [],
				genderIndex: -1,
				certTypeList: [],
				certTypeIndex: -1,
				identityTypeList: [],
				identityTypeIndex: -1,
				membershipList: [],
				membershipIndex: -1,
				rentStartTime: null,
				rentEndTime: null,
				textShow: false,
				certNoDisabled: true,
				ifNeedID: uni.getStorageSync("appInfo").ifNeedID,
				isOpenWxminiUploadPhoto: this.$getUserInfo().isOpenWxminiUploadPhoto || false,
				houseObj: {},
				//当前语言是否中文
				isCN: this.$platformObj.isCN(),
				
				currentDate: new Date(),
				expireEndTimeVisible: false
			}
		},
		methods: {
			// 到期时间选择器可视状态改变
			onExpireEndTimeVisibleChange() {
				this.expireEndTimeVisible = !this.expireEndTimeVisible;
			},
			
			// 到期时间确认
			onExpireEndTimeConfirm(event) {
				this.$showLog("event", event);
				this.rentEndTime = event.result;
			},
			
			// 选择图片
			changeAvatar() {
				this.$refs.child.fSelect()
			},
			myUpload(rsp) {
				let quality = 50 , imagePath = rsp.path;
				// this.url = rsp.path; //更新头像方式一
				this.$getImageBase64(imagePath, (imageBase64) => {
					faceImageBase64 = imageBase64
					if (imageBase64.indexOf("base64,") > -1) {
						faceImageBase64 = imageBase64.split("base64,")[1];
					}
					this.imageUrl = rsp.path;
				});
			},
			
			initData() {
				this.houseObj = {};
				faceImageBase64 = "";
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
			},

			// 性别onchange事件
			sexChange(e) {
				this.genderIndex = e.target.value;
			},

			// 入住时间onchange事件
			// chenkInTimeChange(e) {
			// 	this.rentStartTime = e;
			// },

			// 到期时间onchange事件
			expireEndTimeChange(e) {
				this.rentEndTime = e;
			},

			// 身份类型onchange事件
			identityTypeChange(e) {
				// 0: 业主   1: 家属   2: 租客	
				// 只有租客类型才显示时间选择
				this.identityTypeIndex = e.target.value;
				if (this.identityTypeIndex == 2) {
					// 当身份类型为租客时，显示当前时间
					// this.rentStartTime = getDate();
					this.$showLog("this.$dateFormat", this.$dateFormat);
					this.rentStartTime = this.$dateFormat.format(new Date(), "yyyy-MM-dd hh:mm");
				}
				this.$showLog("identityTypeIndex", this.identityTypeIndex);
			},

			// 证件类型onchange事件
			certTypeChange(e) {
				this.certTypeIndex = e.target.value;
				if (this.certNoDisabled) {
					this.certNoDisabled = false;
				}
			},
			
			//检测是否自动审核
			checkAutoAuth(communityId) {
				this.$req.request({
					url: "/persIdentityAuth/app/isAutoAuth",
					data: {
						communityId: communityId
					},
					success: (res) => {
						if(res.data == 0){
							//不开放自动审核
							this.textShow = true;
						}else {
							this.textShow = false;
						}
					},
				})
			},

			// 添加住户
			addTenant(e) {
				var _this = this;
				var formData = e.detail.value;
				let requirementArray = [
					{
						"rule": this.identityTypeIndex === -1,
						"toast": this.house["identity-placeholder"] || "请选择身份类型"
					},
					{
						"rule": !formData["name"],
						"toast": this.house["name-placeholder"] || "请输入姓名"
					},
					{
						"rule": formData["phone"] && this.houseObj.industryType === 3 && !this.$getPhoneReg().test(formData["phone"]),
						"toast": this.common["correct-phone"] || "请输入正确手机号"
					},
					{
						"rule": this.genderIndex === -1,
						"toast": this.house["gender-placeholder"] || "请选择性别"
					},
					{
						"rule": this.certTypeIndex === -1 && (this.ifNeedID || this.houseObj.industryType === 3),
						"toast": this.house["cert-placeholder"] || "请选择证件类型"
					},
					{
						"rule": this.certTypeIndex == 0 && formData["certNo"] && !this.$checkIDNumber(formData["certNo"]),
						"toast": this.common["correct-id"] || "请输入正确身份证号"
					}
				]
				for(let i in requirementArray) {
					if(requirementArray[i].rule) {
						this.$showToast(requirementArray[i].toast);
						return;
					}
				}
				formData["gender"] = this.genderIndex;
				formData["certType"] = this.certTypeIndex === -1 ? 0 : this.certTypeIndex;
				formData["identityType"] = this.identityTypeIndex;
				if (formData["identityType"] != 2) {
					// 提交时判断身份类型为非租客则把时间置空在传递
					formData["rentStartTime"] = "";
					formData["rentEndTime"] = "";
				} else {
					formData["rentStartTime"] = this.rentStartTime;
					formData["rentEndTime"] = this.rentEndTime;
				}
				for (var field in formData) {
					if (field.endsWith("Time")) {
						console.log("field--",formData[field])
						if (formData[field] !== null && formData[field] !== "" && formData[field] != "0") {
							formData[field] += ":00";
						} else {
							// delete formData[field];
						}
					} else if (field === "identityType") {
						formData[field] = formData[field] !== "" ? parseInt(formData[field]) + 1 : formData[field];
					}
				}
				formData.roomIds = this.houseObj.id;
				if (faceImageBase64 !== "") {
					formData.faceFileBase64 = faceImageBase64;
				}
				var checkList = [{
					name: "name",
					rules: [{
						required: true,
						message: _this.house["name-placeholder"] || "请输入姓名"
					}]
				}, {
					name: "gender",
					rules: [{
						betweenD: [0, 1],
						message: _this.house["gender-placeholder"] || "请选择性别"
					}]
				}];
				
				//配置如果需要身份认证
				if(this.ifNeedID || this.houseObj.industryType === 3) {
					var idList = [
						{
							name: "certNo",
							rules: [{
								required: true,
								message: _this.house["cert-num-placeholder"] || "请输入证件号"
							}]
						}
					];
					checkList = checkList.concat(idList);
				}
				console.log('formData',formData)
				this.$formSubmitCheck({
					formData: formData,
					checkList: checkList,
					success: () => {
						this.$req.request({
							method: "POST",
							url: '/persIdentityAuth/app/add',
							data: formData,
							success: (res) => {
								if(res.code == 0) {
									this.$showToast(res.msg);
									setTimeout(() => {
										// uni.navigateBack({
										//     delta: 2
										// });
										uni.redirectTo({
											url: "/sub-package1/pages/house-list/application-records"
										});
									}, 600);
								}
							}
						});
					}
				});
			}
		},
		onReady() {
			this.$setTitle(this.title["add-household"]);
		},
		onLoad(options) {
			this.initData();
			if (options.house !== undefined) {
				this.houseObj = JSON.parse(options.house);
				this.$showLog("houseObj", this.houseObj);
				let communityId = this.houseObj.communityId;
				this.checkAutoAuth(communityId);
				let identityType = this.houseObj.identityType;
				if(identityType === 3) {
					//租户身份进行添加成员操作
					this.identityTypeIndex = 2;
					
				}
			}
			this.identityTypeList = this.common["identity-type-list"] || ["业主", "家属", "租客"];
			this.genderList = this.common["gender-list"] || ["男", "女"];
			this.certTypeList = this.common["cert-type-list"] || ["身份证", "居住证","香港身份证","澳门身份证","外国人居留证"];
			this.membershipList = this.common["membership-list"] || ["自己", "夫妻", "父母", "子女", "亲人", "朋友", "其他"];
		},
		computed: {
			house() {
				return this.$t("house");
			},
			email() {
				return this.$t("email");
			},
			common() {
				return this.$t("common");
			},
			title() {
				return this.$t("title");
			},
			identity() {
				return this.$t("identity");
			},
			mine() {
				return this.$t("mine");
			},
			manage() {
				return this.$t("manage");
			}
		},
	}
</script>

<style lang="scss">
	.add-tenant-view {
		background: #FFFFFF;
		width: 100%;
		padding: 20upx;
	}

	.authentication-top-view {
		width: 100%;
		background: #FFFFFF;
		text-align: center;
		padding: 10upx 0 0;
	}

	.authentication-top-img {
		width: 200upx;
		height: 200upx;
	}

	.img-help-tip {
		color: #CDC9C9;
		text-align: center;
	}

	.uni-list-cell {
		margin-bottom: 10upx;
		padding: 10upx 0;
	}

	.uni-list-cell-text {
		font-size: 34upx;
	}

	.input-view {
		font-size: 34upx;
		color: #808080;
	}

	.btn-row {
		padding: 10upx;
		font-size: 34upx;
		width: 80%;
		margin: 20upx auto 0;
	}

	.require-text {
		color: red;
	}
</style>
