<template>
	<uni-base-page class="auth-id-page content">
		<!-- 设备选择列表弹窗 start -->
		<!-- <aui-poster ref="poster" :maskTapClose="false" :showCloseImage="true">
			<view class="aui-poster-view" style="background-color: #FFFFFF;" slot="content">
				<view class='aui-poster-title'>{{ "设备列表" }}</view>
			</view>
		</aui-poster> -->
		<!-- 设备选择列表弹窗 end -->
		<view class="auth-id-tip">
			<text style="width: 100%;">提示：身份核验目前仅用于出租房认证</text>
			<view class="change-button" style="font-size: 28upx; float: right;" @click="onModeChange" v-if="verifyStatus !== 1 && $platformObj.isAndroid()">{{  isSupportReadReqID ? "切换为普通认证" : "切换为EID认证" }}</view>
		</view>
		<!-- <view style="margin: 16upx 3%;" v-if="$getUserInfo().verifyStatus !== 1 && $platformObj.isAndroid()">
			<button type="primary" class="auth-button primary" style="font-size: 30upx; float: left;" @click="onModeChange">{{  isSupportReadReqID ? "切换为普通认证" : "切换为EID认证" }}</button>
		</view> -->
		<form @submit="formSubmit" class="form-view" v-if="verifyStatus !== 1">
			<view style="background: #FFFFFF;">
				<view v-if="!isSupportReadReqID">
					<view class="fill-area">
						<view class="left-name"><text class="require-text">*</text>{{ "真实姓名" }}</view>
						<view class="right-input">
							<input type="text" placeholder="请输入真实姓名" name="realName"/>
						</view>
					</view>
					<view class="fill-area">
						<view class="left-name"><text class="require-text">*</text>{{ "性别" }}</view>
						<view class="right-input">
							<picker style="width: 70%" @change="genderChange" name="sex" :range="genderList">
								<view style="color: #A0A0A0;">{{ genderIndex > -1 ? genderList[genderIndex] : "请选择性别" }}</view>
							</picker>
						</view>
					</view>
					<view class="fill-area">
						<view class="left-name"><text class="require-text">*</text>{{ "民族" }}</view>
						<view class="right-input">
							<picker style="width: 70%" @change="nationChange" name="nation" :range="nationList">
								<view style="color: #A0A0A0;">{{ nationIndex > -1 ? nationList[nationIndex] : "请选择民族" }}</view>
							</picker>
						</view>
					</view>
					<view class="fill-area">
						<view class="left-name"><text class="require-text">*</text>{{ "身份证号码" }}</view>
						<view class="right-input">
							<input type="text" placeholder="请输入身份证号码" name="idCard"/>
						</view>
					</view>
				</view>
				<view v-if="isSupportReadReqID" class="step-style">第一步：</view>
				<!-- #ifdef MP-WEIXIN || MP-ALIPAY -->
				<view class="fill-area" v-if="$getUserInfo().isOpenWxminiUploadPhoto">
					<view class="upload-photo">
						<text class="require-text">*</text> <text>{{ "上传人脸照片" }}</text>
						<view style="margin: 30upx 0;display: flex;justify-content: center;">
							<avatar
								fileType="jpg"
								quality="0.5"
								isPhotoAlbum="1"
								selWidth="300px" selHeight="600upx" ref="child" @upload="myUpload" :avatarSrc="faceCaptureImagePath"
								avatarStyle="width: 240upx; height: 240upx;border-radius: 18upx;">
							</avatar>
						</view>
					</view>
				</view>
				<!-- #endif -->
				<!-- #ifndef MP-WEIXIN || MP-ALIPAY -->
				<view class="fill-area">
					<view class="upload-photo">
						<text class="require-text">*</text> <text>{{ "上传人脸照片" }}</text>
						<view style="margin: 30upx 0;display: flex;justify-content: center;">
							<avatar
								fileType="jpg"
								quality="0.5"
								isPhotoAlbum="1"
								selWidth="300px" selHeight="600upx" ref="child" @upload="myUpload" :avatarSrc="faceCaptureImagePath"
								avatarStyle="width: 240upx; height: 240upx;border-radius: 18upx;">
							</avatar>
						</view>
					</view>
				</view>
				<!-- #endif -->
				<view v-if="isSupportReadReqID" class="step-style">第二步：</view>
				<view class="fill-area" v-if="isSupportReadReqID && doorList && doorList.length > 0" style="position: relative;">
					<view class="left-name"><text class="require-text">*</text>{{ "已选设备" }}</view>
					<view class="right-input right-arrow">
						<picker mode="selector" :range="doorList" range-key="name" @change="onDoorListChange" class="middle-set">
							<view>{{ doorList[doorSelectedIndex]["name"] }}</view>
						</picker>
					</view>
				</view>
				<view  v-if="isSupportReadReqID"  class="step-style">第三步： <text style="color: #EDA329;">请将身份证一直放在门锁刷卡处进行读取</text></view>
				<view class="text-tips" style="margin: 3%;" v-if="isSupportReadReqID && doorList && doorList.length > 0 && reqID">
					<text style="display: block;">{{ "读取成功: " + reqID }}</text>
				</view>
				<view class="text-tips" style="margin: 3%;" v-if="isSupportReadReqID && doorList && doorList.length > 0">
					<button type="primary" class="button primary" style="font-size: 30upx;" @click="onReadClick">{{ isFirstClick ? "开始读取" : "重新读取" }}</button>
				</view>
				<view class="fill-area" v-else-if="isSupportReadReqID && doorList && doorList.length === 0" style="margin-top: 10upx; min-height: auto;">
					<view>{{ "附近暂无安装在房间的设备" }}</view>
				</view>
				<view class="text-tips" style="margin: 3%;" v-if="isSupportReadReqID && doorList && doorList.length === 0">
					<button type="primary" class="button primary" style="font-size: 30upx;" @click="onScanNearDevClick">{{ "重新扫描附近设备" }}</button>
				</view>
				<!-- <view class="fill-area">
					<view class="upload-photo">
						<text class="require-text">*</text> <text>{{ "上传人脸照片" }}</text>
						<view v-if="faceCaptureImagePath" style="margin: 30upx 0;">
							<image :src="faceCaptureImagePath" class="item-picture">
								<button class="delete-btn" @click="deletePhoto">
									<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/delete.png"/>
								</button>
							</image>
						</view>
						<view v-else style="margin: 30upx 0;">
							<button @click="takePhoto" class="take-photo-btn">
								<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/camera.png"/>
							</button>
						</view>
					</view>
				</view> -->
				<view class="text-tips" style="margin: 3%;">
					<text style="display: block;">注意：</text>
					<text style="display: block;">1、一个APP账号进行真实身份核验一天最多只能提交5次</text>
					<text style="display: block;">2、该APP账号如果进行真实身份核验过了，就无需再核验，请确定好填写信息与当前APP账号绑定用户的信息一致后再提交</text>
					<text style="display: block;" v-if="isSupportReadReqID && $platformObj.isAndroid()">3、请先上传人脸图片，再读取身份证信息，读取过程中，请确保身份证一直放置在设备上</text>
				</view>
				<view class="app-privacy">
					<view>
						<checkbox @click="checkboxChange" value="cb" :checked="checked" />
						我已阅读并同意
						<text class="color-E1" @click="goToPrivacyPage">《{{ i18n['privacy-policy'] || '隐私政策' }}》</text>
					</view>
				</view>
				<view class="submit-btn">
					<button type="primary" class="button primary" formType="submit">{{ repair['submit'] || '提交' }}</button>
				</view>
			</view>
			
		</form>
		<view class="form-view-box" v-else>
			<view class="info-box">
				<view class="fill-area">
					<view class="left-name">{{ "真实姓名" }}</view>
					<view class="right-input">
						{{ infoObj.realName }}
					</view>
				</view>
				<view class="fill-area">
					<view class="left-name">{{ "性别" }}</view>
					<view class="right-input">
						{{ genderList[infoObj.sex - 1] }}
					</view>
				</view>
				<view class="fill-area">
					<view class="left-name">{{ "民族" }}</view>
					<view class="right-input">
						{{ infoObj.nation }}
					</view>
				</view>
				<view class="fill-area">
					<view class="left-name">{{ "身份证号码" }}</view>
					<view class="right-input">
						{{ infoObj.idCard }}
					</view>
				</view>
			</view>
		</view>
	</uni-base-page>
</template>

<script>
	import avatar from "../../../components/yq-avatar/yq-avatar.vue";
	import { encrypted, decrypted } from "../../../sub-package1/common/js/utils/encryption-decryption/crypto.js";
	// 身份核验需要传的数据格式
	let testDevObj = {
		"appEkey": "66d6f40a9da2ff21b752406c51c1203b000000000000000000000000000000001000",
		"btCardAddType": 2,
		"buildingId": 198320,
		"category": 9,
		"communityId": 23220,
		"communityName": "雅园居小区",
		"connectionStatus": 0,
		"devKey": "66d6f40a9da2ff21b752406c51c1203b",
		"devMac": "e3:60:58:d2:ad:0a",
		"devName": "1490201866",
		"devSn": "1490201866",
		"deviceId": 167392,
		"deviceModelValue": 46,
		"doorId": 274788,
		"doorName": "543",
		"fullName": "1栋2单元/543",
		"hardwarePlatform": 1,
		"isBindOwner": 0,
		"isNeedUploadOpenDoorRecord": 1,
		"isSupportBluetooth": 1,
		"isSupportGetNetSignal": 1,
		"isSupportGetOpenDoorRecord": 1,
		"isSupportNetwork": 1,
		"isSupportOfflineBluetoothSendCard": 1,
		"isSupportOfflineWriteCard": 0,
		"isSupportSipVideo": 0,
		"miniEkey": "AC01050af4d66621ffa29d6c4052b73b20c151",
		"modelName": "BL860-NF",
		"platformId": 1,
		"relayIndex": 1,
		"supportNetworkType": "4,5",
		"wiegandValue": 34
	};
	let faceCaptureImageBase64 = "";   // 存放图片的base64
	// 表单提交校验规则
	let checkList;
	const MAX_CLICK_COUNT = 3;
	let clickCount = 0; // 读取身份证信息按钮当前点击次数，当超过一定的次数时，切换到手动输入身份信息模式
	export default {
		components: {
			avatar
		},
		data() {
			return {
				faceCaptureImagePath: "http://yuanzhoulvwego.com/wp-content/uploads/static/img/camera.png",
				genderList: ["男","女"],
				genderIndex: -1,
				nationIndex: -1,
				nation: "",
				infoObj: {},
				nationList:["汉族", "壮族", "满族", "回族", "苗族", "维吾尔族", "土家族", "彝族", "蒙古族", "藏族", "布依族", "侗族", "瑶族", "朝鲜族", "白族", "哈尼族",
					"哈萨克族", "黎族", "傣族", "畲族", "傈僳族", "仡佬族", "东乡族", "高山族", "拉祜族", "水族", "佤族", "纳西族", "羌族", "土族", "仫佬族", "锡伯族",
					"柯尔克孜族", "达斡尔族", "景颇族", "毛南族", "撒拉族", "布朗族", "塔吉克族", "阿昌族", "普米族", "鄂温克族", "怒族", "京族", "基诺族", "德昂族", "保安族",
					"俄罗斯族", "裕固族", "乌孜别克族", "门巴族", "鄂伦春族", "独龙族", "塔塔尔族", "赫哲族", "珞巴族",
				],
				// 如果reqID为空，表明还没读取身份证信息，如果不为空那么表明读取完毕，将拍的照片（本人照片）和读取身份证（本人身份证）信息结果（reqID）提交服务器，由服务器解析校验，我认为服务器通过reqID解析出当前身份证信息，包括身份证头像，再将前端拍的照片和身份证头像进行比对，将比对结果返回
				reqID: "",
				doorList: null,
				doorSelectedIndex: 0,
				// isSupportReadReqID: this.$platformObj.isApp() // 是否支持通过蓝牙读取放在设备上的身份证的reqID，该reqID提交给后台服务器可解析出身份证信息，如果不支持，则只能手动输入身份信息，提交到后端服务器进行身份核验，可以点击3次读取身份证信息按钮，3次后如果还是没法获取到reqID，包括超时，那么要切换到手动输入身份信息模式
				isSupportReadReqID: false, // 是否支持通过蓝牙读取放在设备上的身份证的reqID，该reqID提交给后台服务器可解析出身份证信息，如果不支持，则只能手动输入身份信息，提交到后端服务器进行身份核验，可以点击3次读取身份证信息按钮，3次后如果还是没法获取到reqID，包括超时，那么要切换到手动输入身份信息模式
				mineAuthentication: 0, //0 我的房屋验证身份  1是 我的=>真实身份验证
				verifyStatus: "",
				checked: this.$getLanguageLowerCase().indexOf('cn') > -1 ? (uni.getStorageSync("authIdAgreePrivacyPolicy") || false) : true
			}
		},
		computed: {
			i18n() {
				return this.$t("login");
			},
			mine() {
				return this.$t("mine")
			},
			repair() {
				return this.$t("repair")
			}
		},
		onLoad(options) {
			this.verifyStatus = uni.getStorageSync("verifyStatus");
			this.mineAuthentication = options.mineAuthentication;
			console.log("mineAuthentication",this.mineAuthentication)
			if (this.verifyStatus === 1) {
				this.getPersonalInfo();
			}
			faceCaptureImageBase64 = "";
			checkList = [];
		},
		methods: {
			// 跳转到隐私政策页面
			goToPrivacyPage() {
				uni.navigateTo({
					url: "../privacy/privacy?index=1"
				});
			},
			checkboxChange(){
				this.checked = !this.checked;
				uni.setStorageSync("authIdAgreePrivacyPolicy", this.checked);
			},
			// 选择照片
			changeAvatar() {
				this.$refs.child.fSelect()
			},
			getDoorList() {
				//配置扫描 时间
				let scanTime = 1500;
				this.$sdkUtil.bluetoothScanNearDevice((res) => {
					this.$showLog("res", res);
					if (res.length > 0) {
						let devSnListStr = res.map((item) => {
							return item.devSn
						}).join(",");
						this.$showLog("devSnListStr", devSnListStr);
						this.$req.request({
							url: "/devDevice/app/getRoomInfo",
							data: {
								devSns: devSnListStr
							},
							success: (res) => {
								this.$showLog("res", res);
								if (res.code === 0) {
									this.doorList = res.data.map((doorObj, index) => {
										doorObj.devMac = decrypted(doorObj.devMac);
										doorObj.appEkey = decrypted(doorObj.appEkey);
										return doorObj;
									});
								} else {
									this.$showToast("获取门锁绑定的房屋信息失败");
								}
							}
						});
					}
				},scanTime);
			},
			
			onModeChange() {
				this.isSupportReadReqID = !this.isSupportReadReqID;
				if (this.isSupportReadReqID) {
					this.doorList = null;
					this.doorSelectedIndex = 0;
					this.hasReadResult = false;
					this.isFirstClick = true;
					// this.$refs.poster.show();
					this.getDoorList();
				}
			},
			
			onDoorListChange(e) {
				this.doorSelectedIndex = e.detail.value;
			},
			
			onReadClick() {
				this.isFirstClick = false;
				this.authIDVerify(this.doorList[this.doorSelectedIndex]);
			},
			
			onScanNearDevClick() {
				this.getDoorList();
			},
			/**
			 * @param {Object} e
			 * 
			 * 【步骤说明】
			 * 
			 *  1 将身份证放在设备上
			 *  2 调用原生蓝牙接口获取reqID（如果能获取到，就可以不用在界面上手动身份信息提交到服务器，服务器自己会根据这个reqID解析出对应的身份信息）
			 *  3 如果返回失败，包括超时，则走手动输入身份信息
			 */
			authIDVerify(devObj) {
				if (this.$editCheckAuthIDVerifyCount()) {
					if (this.isSupportReadReqID) {
						// 当前操作是读取身份证信息
						this.$showToast("请在5s内将身份证放在设备上");
						setTimeout(() => {
							// 读取身份证信息
							this.$sdkUtil.readEID(devObj, (result) => {
								if (result.errorCode === 0) {
									// 成功获取reqID，说明当前能支持获取reqID
									this.reqID = result.data.reqID;
									// this.isSupportReadReqID = true;
									// clickCount = 0;
									this.hasReadResult = true;
								} else {
									// 没有获取到reqID，包括超时，就自增读取身份证信息按钮当前点击次数
									// clickCount++;
									// if (clickCount >= MAX_CLICK_COUNT) {
									// 	this.$showToast("当前设备暂时不能获取身份证信息，请手动输入");
									// 	this.isSupportReadReqID = false;
									// 	clickCount = 0;
									// }
									this.hasReadResult = false;
								}
							});
						}, 5000);
					}
				} else {
					this.$showToast("当前APP账号当天已提交5次身份核验");
				}
			},
			
			// 表单提交
			formSubmit(e) {
				let formData = {};
				checkList = [];
				if (this.isSupportReadReqID) {
					formData = {
						"faceCaptureImage": faceCaptureImageBase64,
						"reqID": this.reqID
					};
					checkList = [{
						name: "reqID",
						rules: [{
							required: true,
							message: "没有通过设备读取到用户身份证信息"
						}]
					}, {
						name: "faceCaptureImage",
						rules: [{
							required: true,
							message: "请上传人脸图片"
						}]
					}];
				} else {
					formData = e.detail.value;
					formData["faceCaptureImage"] = faceCaptureImageBase64;
					formData["sex"] = parseInt(this.genderIndex) + 1;
					formData["nation"] = this.nation;
					checkList = [{
						name: "realName",
						rules: [
							{
								required: true,
								message: "真实姓名不能为空"
							},
							{
								reg: this.$regExp.realNameRegExp,
								message: "真实姓名填写有误(2~4个汉字)"
							}
						]
					}, {
						name: "gender",
						rules: [
							{
								required: true,
								message: "请选择性别"
							}
						]
					}, {
						name: "nation",
						rules: [
							{
								required: true,
								message: "请输入民族"
							}
						]
					}, {
						name: "idCard",
						rules: [
							{
								required: true,
								message: "身份证号码不能为空"
							},
							{
								reg: this.$regExp.idNumberRegExp,
								message: "身份证号填写有误"
							}
						]
					}, {
						name: "faceCaptureImage",
						rules: [
							{
								required: true,
								message: "请上传人脸图片"
							}
						]
					}];
					if (!this.checked) {
						this.$showToast(this.i18n["agree-privacy-policy"] || "请先勾选同意后再登录");
						return;
					}
				}
				this.$formSubmitCheck({
					formData: formData,
					checkList: checkList,
					success: () => {
						this.$req.request({
							url: "/appUser/app/updateInfoById",
							method: "POST",
							data: formData,
							success: (res) => {
								if(res.code === 0){
									this.$showToast("身份核验成功");
									this.$editUserInfo("verifyStatus", 1);
									this.$editUserInfo("sex",formData["sex"])
									setTimeout(() => {
										if( this.mineAuthentication == 1 ) {
											console.log(2222)
											uni.navigateBack({
												delta: 2
											})
											let isAppEnableIdentityVerify = 1;
											this.$editUserInfo("isAppEnableIdentityVerify", isAppEnableIdentityVerify);
										}else {
											uni.navigateBack();
										}
									}, 1000);
								}else{
									this.$showToast(res.msg);
								}
							}
						});
					}
				});
			},
			myUpload(rsp) {
				console.log(111)
				let faceImageBase64;
				let quality = 50, imagePath = rsp.path;
				this.$compressImage(imagePath, quality, () => {
					this.$getImageBase64(imagePath, (imageBase64) => {
						if (imageBase64.indexOf("base64,") > -1) {
							imageBase64 = imageBase64.split("base64,")[1];
						}
						faceCaptureImageBase64 = imageBase64;
						this.faceCaptureImagePath = imagePath;
					});
				});
			},
			// 调用拍照
			async takePhoto() {
				this.$chooseImage({
					imageSize: 40,
					sourceType: ["camera"],
					success: (res) => {
						// console.log("调用公共方法,", res);
						faceCaptureImageBase64 = res.imageBase64;
						this.faceCaptureImagePath = res.imagePath;
					}
				});
			},
			
			// 删除照片
			deletePhoto() {
				this.faceCaptureImagePath = "";
				faceCaptureImageBase64 = "";
			},
			
			// 性别onchange事件
			genderChange(e) {
				this.genderIndex = e.target.value;
				console.log("gender----",this.genderIndex);
			},
			
			// 民族onchange事件
			nationChange(e) {
				this.nationIndex = e.target.value;
				this.nation = this.nationList[this.nationIndex];
				console.log("nation-----",this.nation);
			},
			
			// 检测抓拍图片是否有头像
			checkFaceImage() {
				return new Promise((resolve, reject) => {
					this.$req.request({
						method: "POST",
						url: "http://www.doormaster.me:12021/dmface/server/check_face",
						header: {
							"content-type": "application/json"
						},
						data: {
							"operation": "CHECK", 
							"data": {
								"image": faceCaptureImageBase64,
							},
							hasCallback: true
						},
						success: res => {
							resolve(res);
						},
						fail: err => {
							reject(err);
						}
					});
				});
			},
			
			//获取认证后个人信息
			getPersonalInfo() {
				this.$req.request({
					url: "/appUser/app/getAppInfo",
					success: res => {
						this.infoObj = res.data;
						var idCardString = res.data.idCard; 
						// console.log("res: ",res.data);
						this.infoObj.idCard = idCardString.substring(0, 3)+"***********"+idCardString.substr(idCardString.length-4);
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.auth-id-tip {
		display: flex;
		flex-direction: row;
		align-items: center;
		color: #EDA329;
		padding: 10upx 3%;
		background: #FDFAE9;
	}
	
	.content {
		background-color: #FFFFFF;
	}
	.color-E1 {
		color: #2892e1;
	}
	.app-privacy{
		padding: 0 30upx;
		padding-bottom: 20upx;
	}
	.fill-area {
		background: #FFFFFF;
		min-height: 100upx;
		height: auto;
		display: inline-flex;
		width: 94%;
		margin-left: 3%;
		margin-right: 3%;
		margin-bottom: 4upx;
		border-bottom: 2upx solid #EEEEEE;
	}

	.left-name {
		width: 27%;
		margin-top: 3%;
		text-align: left;
		display: inline-block;
		overflow: auto;
	}

	.right-input {
		width: 65%;
		margin-left: 5%;
		padding-right: 50upx;
		margin-top: 3%;
		overflow: auto;
		text-align: left;
		display: inline-block;
	}

	.right-input input {
		font-size: 28upx;
		padding: 6upx;
	}

	.middle-input {
		width: 40%;
		margin-left: 5%;
		margin-top: 3%;
		overflow: auto;
		text-align: left;
		display: inline-block;
	}

	.middle-input input {
		font-size: 28upx;
		padding: 6upx;
	}

	.right-btn {
		width: 25%;
		margin-top: 3%;
		margin-left: 2%;
		overflow: auto;
		display: inline-block;
	}

	.verify-code-button {
		background: #ffffff;
		color: #1E90FF;
		border: 1upx solid #1E90FF;
		font-size: 24upx;
		padding: 0;
	}


	.submit-btn {
		width: 95%;
		margin: 40upx auto;
	}

	.btn {
		background: #1E90FF;
		color: #FFFFFF;
		font-size: 28upx;
	}
	
	.step-style {
		width: 96%;
		margin: 10upx 2%;
		font-size: 32upx;
		font-weight: 700;
	}
	
	.upload-photo {
		width: 94%;
		margin: 3% 0;
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
	
	.change-button {
		border-radius: 25upx;
		color: #FDFAE9;
		text-align: center;
		background-color: #EDA329;
		width: 35%;
		padding: 0;
	}
	
	.delete-btn {
		position: absolute;
		border-width: 0upx !important;
		border-style: none;
		padding: 0;
		margin-left: 424upx;
		margin-top: -328upx;
		background: transparent;
	}
	
	.upload-photo button::after {
		border: none;
	}
	
	.delete-btn image {
		width: 32upx;
		height: 32upx;
	}
	
	.info-box {
		border-radius: 20upx;
		margin-top: 5%;
	}
	
	.form-view-box {
		width: 96%;
		margin: 0 auto;
	}
	
	.right-arrow:after {
		font-family: uniicons;
		content: '\e583';
		position: absolute;
		right: 24upx;
		top: 50%;
		color: #bbb;
		-webkit-transform: translateY(-50%);
		transform: translateY(-50%);
	}
	
	.auth-id-page {
		.aui-poster-main .aui-poster-view {
			width: 90%;
			height: 50vh;
			border: 10upx solid #057D7F;
			border-radius: 20upx;
			pointer-events: auto;
			position: static;
			/* z-index: 9; */
			padding: 30upx 20upx;
		}
		
		.aui-poster-top {
			height: 120upx;
			line-height: 120upx;
			color: #057D7F;
			padding: 10upx;
			/* margin-bottom: 40upx; */
		}
		
		.aui-poster-top image{
			width: 120upx;
			height: 120upx;
			display: inline-block;
		}
		
		/* .annouce-tips {
			display: inline-block;
			height: 120upx;
			vertical-align: middle;
		} */
		
		.aui-poster-title {
			font-size: 32upx;
			font-weight: bold;
			text-align: center;
		}
	}
</style>
