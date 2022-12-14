<template>
	<view class="identity-view">
		<!-- #ifndef MP-WEIXIN -->
		<view class="authentication-top-view">
			<avatar fileType="jpg" :isPhotoAlbum="isPhotoAlbum" ref="child" quality="0.5" selWidth="300px"
				selHeight="600upx" @upload="myUpload" :avatarSrc="url"
				avatarStyle="width: 200upx; height: 200upx; border-radius: 100%;">
			</avatar>
			<view @click="changeAvatar" class="img-help-tip">{{house["register-face"] || "点击上图登记人脸"}}</view>
		</view>
		<!-- #endif -->
		<!-- #ifdef MP-WEIXIN -->
		<view class="authentication-top-view" v-if="isOpenWxminiUploadPhoto">
			<avatar fileType="jpg" quality="0.5" selWidth="300px" selHeight="600upx" @upload="myUpload" :avatarSrc="url"
				avatarStyle="width: 200upx; height: 200upx; border-radius: 100%;">
			</avatar>
			<view @click="changeAvatar" class="img-help-tip">{{house["register-face"] || "点击上图登记人脸"}}</view>
		</view>
		<!-- #endif -->
		<form @submit="authentication">
			<!-- 身份类型 -->
			<view class="uni-list-cell" hover-class="uni-list-cell-hover">
				<view class="uni-list-cell-navigate uni-navigate-right">
					<text class="uni-list-cell-text"><text
							class="require-text">*</text>{{ house["identity"] || "身份类型" }}</text>
					<picker style="width: 70%;float: left;" @change="identityTypeChange" name="identityType"
						:range="identityTypeList">
						<view :class="['input-view', identityTypeIndex > -1 ? '' : 'input-placeholder-view']">
							{{ identityTypeIndex > -1 ? identityTypeList[identityTypeIndex] : house["identity-placeholder"] }}
						</view>
					</picker>
				</view>
			</view>
			<!-- 真实姓名 -->
			<view class="uni-list-cell" hover-class="uni-list-cell-hover"
				:style="inputDisabled? 'background-color: #DDDDDD;': ''">
				<view class="uni-list-cell-navigate">
					<text class="uni-list-cell-text"><text
							class="require-text">*</text>{{ house["name"] || "真实姓名" }}</text>
					<input style="width: 70%;font-size: 34upx;" maxlength="200" type="text" name="realName"
						:value="realName" :disabled="inputDisabled"
						:placeholder="`${house['name-placeholder']}` || '请输入姓名' " />
				</view>
			</view>
			<!-- 性别 -->
			<view class="uni-list-cell" hover-class="uni-list-cell-hover"
				:style="inputDisabled? 'background-color: #DDDDDD;': ''">
				<view class="uni-list-cell-navigate uni-navigate-right">
					<text class="uni-list-cell-text"><text
							class="require-text">*</text>{{ house["gender"] || "性别" }}</text>
					<picker style="width: 70%;float: left;" @change="sexChange" name="gender" :range="genderList"
						:disabled="inputDisabled">
						<view :class="['input-view', genderIndex > -1 ? '' : 'input-placeholder-view']">
							{{ genderIndex > -1 ? genderList[genderIndex] : house["gender-placeholder"] }}
						</view>
					</picker>
				</view>
			</view>
			<!-- 证件类型 -->
			<view class="uni-list-cell" hover-class="uni-list-cell-hover"
				:style="inputDisabled? 'background-color: #DDDDDD;': ''">
				<view class="uni-list-cell-navigate uni-navigate-right">
					<!-- industryType为3 表示为出租屋场景，身份证为必填 -->
					<text class="uni-list-cell-text"><text class="require-text"
							v-if="ifNeedID || industryType === 3 ">*</text>{{ house["cert-type"] || "证件类型" }}</text>
					<picker style="width: 70%;float: left;" @change="certTypeChange" name="certType" :range="certTypeList"
						:disabled="inputDisabled">
						<view :class="['input-view', certTypeIndex > -1 ? '' : 'input-placeholder-view']">
							{{ certTypeIndex > -1 ? certTypeList[certTypeIndex] : house["cert-placeholder"] }}
						</view>
					</picker>
				</view>
			</view>
			<!-- 证件号 -->
			<view class="uni-list-cell" hover-class="uni-list-cell-hover"
				:style="inputDisabled? 'background-color: #DDDDDD;': ''">
				<view class="uni-list-cell-navigate">
					<text class="uni-list-cell-text"><text class="require-text"
							v-if="ifNeedID || industryType === 3 ">*</text>{{ house["cert-num"] || "证件号" }}</text>
					<input style="width: 70%;font-size: 34upx; color: #AAAAAA;" maxlength="20" type="text" name="certNo"
						:placeholder="`${house['cert-num-placeholder']}` || '请输入证件号'" :value="certNo"
						:disabled="inputDisabled" />
				</view>
			</view>
			<!-- 入住时间 -->
			<view class="uni-list-cell" hover-class="uni-list-cell-hover"
				v-if="(industryType !== 3 && identityTypeIndex == 2) || (industryType === 3 && identityTypeIndex == 1) ">
				<view class="uni-list-cell-navigate uni-navigate-right">
					<text class="uni-list-cell-text"><text class="require-text"
							v-if="industryType === 3">*</text>{{ house['checkin-time'] || "入住时间" }}</text>
					<uni-time-selector @change="checkInTimeChange" style="width: 70%; font-size: 34upx;"
						name="rentStartTime">
						<view :class="['input-view', rentStartTime !== null ? '' : 'input-placeholder-view']">
							{{ rentStartTime !== null ? rentStartTime : house["set-time"] }}
						</view>
					</uni-time-selector>
				</view>
			</view>
			<!-- 到期时间 -->
			<view class="uni-list-cell" hover-class="uni-list-cell-hover"
				v-if="(industryType !== 3 && identityTypeIndex == 2) || (industryType === 3 && identityTypeIndex == 1) ">
				<view class="uni-list-cell-navigate uni-navigate-right">
					<text class="uni-list-cell-text"><text class="require-text"
							v-if="industryType === 3">*</text>{{ house['end-time'] || "到期时间" }}</text>
					<uni-time-selector @change="expireEndTimeChange" style="width: 70%; font-size: 34upx;"
						name="rentEndTime">
						<view :class="['input-view', rentEndTime !== null ? '' : 'input-placeholder-view']">
							{{ rentEndTime !== null ? rentEndTime : house["set-time"] }}
						</view>
					</uni-time-selector>
				</view>
			</view>
			<view style="padding: 10upx 26upx 0; color: red;">
				<text class="red-help-text" v-if="industryType === 3">{{ "租客入住需等待业主审批，请前往申请记录中查看审核状态" }}</text>
				<text class="red-help-text" v-else>{{ house["tips"] || "添加房屋需进行物业审核，可前往申请记录中查看审核状态" }}</text>
			</view>
			<view class="app-privacy">
				<view>
					<checkbox @click="checkboxChange" value="cb" :checked="checked" />
					我已阅读并同意
					<text class="color-E1" @click="goToPrivacyPage">《{{ i18n['privacy-policy'] || '隐私政策' }}》</text>
				</view>
			</view>
			<view class="submit-btn">
				<button form-type="submit" type="primary" class="button primary">{{ house["submit"] || "提交" }}</button>
			</view>
		</form>
	</view>
</template>

<script>
	var houseObj = {};
	var faceImageBase64 = "";
	import avatar from "../../../components/yq-avatar/yq-avatar.vue";
	import uniTimeSelector from "../../components/uni-time-selector/uni-time-selector.vue";
	export default {
		components: {
			avatar,
			uniTimeSelector
		},
		data() {
			return {
				url: "http://www.thinmoo.com/wp-content/uploads/2020/10/capture-default.png",
				phone: this.$getUserInfo().phone,
				imageUrl: "http://www.thinmoo.com/wp-content/uploads/2020/10/capture-default.png",
				genderList: [],
				genderIndex: -1,
				certTypeList: [],
				certTypeIndex: -1,
				identityTypeList: [],
				identityTypeIndex: -1,
				membershipList: [],
				membershipIndex: -1,
				ifNeedID: uni.getStorageSync("appInfo").ifNeedID,
				isOpenWxminiUploadPhoto: this.$getUserInfo().isOpenWxminiUploadPhoto || false,
				industryType: 1,
				rentStartTime: null,
				rentEndTime: null,
				inputDisabled: false,
				certNo: "",
				realName: "",
				checked: this.$getLanguageLowerCase().indexOf('cn') > -1 ? (uni.getStorageSync("identilyPrivacyPolicy") || false) : true
			}
		},
		onReady() {
			this.$setTitle(this.title["identity"]);
		},
		onLoad(options) {
			this.getDateStr();
			this.houseObj = JSON.parse(options.houseObj);
			if (JSON.toString(this.houseObj) != '{}') {
				console.log(this.common["gender-list"])
				this.industryType = this.houseObj.industryType;
				this.genderList = this.common["gender-list"] || ["男", "女"];
				this.certTypeList = this.common["cert-type-list"] || ["身份证", "居住证", "香港身份证", "澳门身份证", "外国人居留证"];
				this.identityTypeList = this.common["identity-type-list"] || ["业主", "家属", "租客"];
				this.membershipList = this.common["membership-list"] || ["自己", "夫妻", "父母", "子女", "亲人", "朋友", "其他"];
				if (this.industryType === 3) {
					// 为出租房场景，身份证信息默认为实名认证时的个人信息
					this.identityTypeList = ["家属", "租客"];
					this.identityTypeIndex = 1;
					// console.log("当前用户身份信息： ",this.$getUserInfo().idCard, this.certTypeIndex)
					if (this.$getUserInfo().idCard) {
						this.certTypeIndex = 0;
						this.realName = this.$getUserInfo().realName;
						console.log("gender : ", this.$getUserInfo().sex)
						this.genderIndex = this.$getUserInfo().sex - 1;
						this.certNo = this.$getUserInfo().idCard;
						console.log('**', this.$getUserInfo())
						this.inputDisabled = true;
					} else {
						this.inputDisabled = false;
					}
				}
				this.isPhotoAlbum = this.houseObj.isAppApplyInCompulsorySelfie ? true : false;
			}
		},
		computed: {
			i18n() {
				return this.$t("login");
			},
			house() {
				return this.$t("house")
			},
			common() {
				return this.$t("common")
			},
			title() {
				return this.$t("title")
			}
		},
		methods: {
			// 跳转到隐私政策页面
			goToPrivacyPage() {
				uni.navigateTo({
					url: "../../../sub-package/pages/privacy/privacy?index=1"
				});
			},
			checkboxChange(){
				this.checked = !this.checked;
				uni.setStorageSync("identilyPrivacyPolicy", this.checked);
			},
			// 选择照片
			changeAvatar() {
				console.log('fSelect!!!!!!!!!!!!!!!!!!!!')
				this.$refs.child.fSelect()
			},
			// 选择图片
			myUpload(rsp) {
				console.log('myUpload!!!!!!!!!!!!!!!!!!!!')
				let quality = 50,
					imagePath = rsp.path;
				this.url = rsp.path; //更新头像方式一
				this.$getImageBase64(imagePath, (imageBase64) => {
					faceImageBase64 = imageBase64
					if (imageBase64.indexOf("base64,") > -1) {
						faceImageBase64 = imageBase64.split("base64,")[1];
					}
				});
			},
			// 性别onchange事件
			sexChange(e) {
				this.genderIndex = e.target.value;
				console.log("gender---", this.genderIndex);
			},

			// 身份类型onchange事件
			identityTypeChange(e) {
				this.identityTypeIndex = e.target.value;
				console.log("identityTypeIndex: ", this.identityTypeIndex);
			},

			// 证件类型onchange事件
			certTypeChange(e) {
				this.certTypeIndex = e.target.value;
				console.log("certType: ", this.certTypeIndex);
			},
			// 入住时间显示当前时间
			getDateStr() {
			    var  dd =  new  Date();
			    var  y = dd.getFullYear(); 
			    var  m = (dd.getMonth()+1) < 10 ? "0" + (dd.getMonth()+1) : (dd.getMonth()+1); //获取当前月份的日期，不足10补0
			    var  d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate(); //获取当前几号，不足10补0
				var  h = dd.getHours() < 10 ? "0" + dd.getHours(): dd.getHours() //获取当前小时，不足10补0
				var  mm = dd.getMinutes() < 10 ? "0" + dd.getMinutes(): dd.getMinutes() //获取当前分钟，不足10补0
			    this.rentStartTime = y + "-" + m + "-" + d + " " + h + ":" + mm;
			},
			// 入住时间onchange事件
			checkInTimeChange(e) {
				this.rentStartTime = e;
			},

			// 到期时间onchange事件
			expireEndTimeChange(e) {
				this.rentEndTime = e;
				console.log("expire----", e);
			},

			// 添加住户
			authentication(e) {
				console.log("添加住户",e)
				console.log("gender index---", this.genderIndex);
				var _this = this;
				if (this.identityTypeIndex === -1) {
					this.$showToast(this.house["identity-placeholder"] || "请选择身份类型");
					return;
				}
				if (this.genderIndex === -1) {
					this.$showToast(this.house["gender-placeholder"] || "请选择性别");
					return;
				}
				if (this.certTypeIndex === -1 && (this.ifNeedID || this.industryType === 3)) {
					this.$showToast(this.house["cert-placeholder"] || "请选择证件类型");
					return;
				}

				//场景值为3（出租屋）且身份为租客时
				if (this.industryType === 3 && this.identityTypeIndex === 1) {
					if (this.rentStartTime == null) {
						this.$showToast(this.common["select"] + this.house["checkin-time"] || "请选择入住时间");
						return;
					}
					if (this.rentEndTime == null) {
						this.$showToast(this.common["select"] + this.house["end-time"] || "请选择到期时间");
						return;
					}
				}
				var checkList = [{
					name: "identityType",
					rules: [{
						required: true,
						message: _this.house["identity-placeholder"] || "请选择身份类型"
					}]
				}, {
					name: "realName",
					rules: [{
						required: true,
						message: _this.house["name-placeholder"] || "请输入姓名"
					}]
				}];
				if (this.ifNeedID || this.industryType === 3) {
					var idList = [{
						name: "certNo",
						rules: [{
							required: true,
							message: _this.house["cert-num-placeholder"] || "请输入证件号"
						}]
					}];
					checkList = checkList.concat(idList);
				}
				//进行表单检查
				var formData = e.detail.value;

				if (formData["certNo"]) {
					if (!this.$checkIDNumber(formData["certNo"])) {
						this.$showToast(this.common["correct-id"] || "请输入正确的身份证号");
						return;
					}
				}
				formData = Object.assign(formData, this.houseObj);
				formData["phone"] = this.$getUserInfo().phone;
				console.log("上传手机号： ", this.$getUserInfo().phone);
				if (this.industryType === 3) {
					formData["identityType"] = this.identityTypeIndex + 1;
				} else {
					formData["identityType"] = this.identityTypeIndex;
				}
				formData["gender"] = this.genderIndex;
				// formData["certType"] = this.certTypeIndex === -1 ? 0 : this.certTypeIndex;
				formData["certType"] = this.certTypeIndex;
				if (this.rentStartTime || this.rentEndTime) {
					formData["rentStartTime"] = this.rentStartTime;
					formData["rentEndTime"] = this.rentEndTime;
				}
				for (var field in formData) {
					if (field.endsWith("Time")) {
						console.log("时间：", formData[field]);
						if (formData[field] != null) {
							formData[field] += ":00";
						} else {
							delete formData[field];
						}
					} else if (field === "identityType") {
						formData[field] = formData[field] !== "" ? parseInt(formData[field]) + 1 : formData[field];
					}
				}
				// formData.roomIds = houseObj.id;
				if (faceImageBase64 !== "") {
					formData.faceFileBase64 = faceImageBase64;
				}
				if (!this.checked) {
					this.$showToast(this.i18n["agree-privacy-policy"] || "请先勾选同意后再登录");
					return;
				}
				console.log('formData', formData)
				this.$formSubmitCheck({
					formData: formData,
					checkList: checkList,
					success: () => {
						console.log("formData: ", formData);
						this.$req.request({
							method: "POST",
							url: '/persIdentityAuth/app/houseAuth',
							data: formData,
							success: (res) => {
								this.$showToast(res.msg);
								if (res.code == 0) {
									setTimeout(function() {
										uni.navigateBack({
											delta: 5
										})
									}, 1000);
								} 
								// else {
								// 	setTimeout(() => {
								// 		uni.navigateBack({
								// 			delta: 1
								// 		})
								// 	}, 500);
								// }
							},
						});
					}
				});
			}

		}
	}
</script>

<style>
	.identity-view {
		width: 100%;
		padding: 20upx;
	}
	.color-E1 {
		color: #2892e1;
	}
	.app-privacy{
		padding: 30upx;
	}
	.authentication-top-view {
		width: 100%;
		background: #FFFFFF;
		text-align: center;
		padding: 30upx 0 0;
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

	.submit-btn {
		padding: 10upx;
		font-size: 34upx;
		width: 80%;
		margin: 20upx auto 0;
	}

	.require-text {
		color: red;
	}
</style>
