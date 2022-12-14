<template>
	<uni-base-page class="content bt-version-upgrade-page">
		<view class="list-container">
			<!-- 设备信息 -->
			<view>
				<ul class="list-view">
					<li>{{ manage["dev-name"] || "设备名称" }}： {{ devObj.fullName || devObj.devName}}</li>
					<li>{{ manage["dev-sn"] || "设备序列号" }}：{{ devObj.devSn }}</li>
					<li>{{ manage["dev-modal"] || "设备型号" }}： {{ devObj.modelName }}</li>
				<!-- 	<li>{{ manage["version-of-the-full-name"] || "版本全称" }}：{{ devObj.devSn }}</li>
					<li>{{ manage["updated-instructions"] || "更新说明" }}： {{ devObj.modelName }}</li> -->
					<li>{{ manage["firmware-version"] || "当前版本" }}： {{ firmwareVersion }}</li>
					<li>{{ manage["Bluetooth_model_value"] || "当前蓝牙型号值" }}： {{ modelValue }}</li>
				</ul>
			</view>
			<!-- 设备信息 -->
			
			<!-- 分隔线 -->
			<view class="dividing-line"></view>
			<!-- 分隔线 -->
			
			<!-- 固件列表展示区域 -->
			<ul v-if="firmwareList.length > 0" class="list-view">
				<li v-for="firmware in firmwareList">
					<view class="list-left">
						<view class="">{{ manage["firmware-version"] || "版本号" }}：{{ firmware.versionNum }}</view>
						<view class="">{{ manage["version-of-the-full-name"] || "版本名称" }}：<text style="color: #8a8d93;">{{ firmware.name }}</text></view>
						<view class="" style="width: 730upx; ">{{ manage["updated-instructions"] || "更新内容" }}：<text style="color: #8a8d93;">{{ firmware.updateContent }}</text></view>
					</view>
					<view class="list-right-btn"><button v-if="firmwareVersion != firmware.versionNum" @click="clickUpgrade(firmware.packagePath, firmware.versionNum, firmware.id)">{{ manage["upgrade"] || "升级" }}</button></view>
				</li>
			</ul>
			<!-- 固件列表展示区域 -->
			
			<!-- 暂无数据展示区域 -->
			<view v-else style="text-align: center; padding: 20upx;">{{ manage["no-firmware"] || "暂无固件版本数据" }}</view>
			<!-- 暂无数据展示区域 -->
			
		</view>
		
		<!-- 固件升级进度条弹窗 -->
		<aui-poster ref="poster" :maskTapClose="false" :showCloseImage="false">
			<view class="firmware-progress-modal-content" style="" slot="content">
				<view class="title" style="">{{ upgradeTitle }}</view>
				<view class="progress-view">
					<progress :percent="upgardeProgress" activeColor="#00aa00" backgroundColor="#BEBEBE" 
							border-radius="100" show-info="true" stroke-width="10" />
				</view>
				<view>{{ printMsg }}</view>
			</view>
		</aui-poster>
		<!-- 固件升级进度条弹窗 -->
	</uni-base-page>
</template>

<script>
	let fileName = "";
	let isReupgrade = true;//是否允许尝试重新升级
	export default {
		data() {
			return {
				firmwareList: [],
				savedFilePath: "",
				upgardeProgress: 0,
				firmwareVersion: "正在获取中...",
				printMsg: "",
				preUpgradeVersion: "",
				upgradeTitle: "",
				modelValue: '',
				source:null
			}
		},
		
		computed: {
			manage() {
				return this.$t("manage")
			},
			sdk1() {
				return this.$t("sdk")
			},
			common() {
				return this.$t("common")
			}
		},
		
		methods: {
			//获取当前设备固件版本
			getDevSystemVersion(e) {
				let num = 1;
				num++;
				this.$sdkUtil.getDeviceConfig(this.devObj, result => {
					if(result.errorCode === 0) {
						let data = result.data;
						
						// 固件版本上级完成后 会根据 preUpgradeVersion 判断执行操作
						if( e ) {
							if( e.preUpgradeVersion == data.systemVersion ) {
								uni.showModal({
									title: this.common['hint'] || '提示',
									content: this.sdk1['firmware-upgrade-succeed'] || '设备蓝牙固件升级成功',
									confirmText: this.common['confirm'] || '确定',
									showCancel: false,
									isShowLoading: false,
									success: (res) => {
										uni.navigateBack({
											delta: 2
										});
										// uni.navigateTo({
										// 	url: '../../../pages/dev-manage/dev-manage'
										// })
									},
								})
							}else {
								uni.showModal({
									title: this.common['hint'] || '提示',
									content: this.sdk1['abnormal-reboot-device'] || '升级重启异常，请断电重启设备',
									confirmText: this.common['confirm'] || '确定',
									showCancel: false,
									success: (res) => {
										uni.navigateBack({
											delta: 2
										});
										// uni.navigateTo({
										// 	url: '../../../pages/dev-manage/dev-manage'
										// })
									},
								})
							}
						}else {
							this.firmwareVersion = data.systemVersion;
							// 获取当前设备固件版本成功后获取可升级的固件版本
							let obj = {
								devSn: this.devObj.devSn,
								versionNum: this.firmwareVersion,
								isShowLoad: false,
								modelValue: data.devType
							}
							this.modelValue = data.devType
							this.getFirmwareVersion(this.devObj.devSn, this.firmwareVersion, this.modelValue);
						}
					}
				});
			},
			
			// 获取固件版本
			getFirmwareVersion(devSn, versionNum, modelValue) {
				this.$req.request({
					url: "/platDevFirmware/app/listByDevSn",
					data: {
						devSn: devSn,
						versionNum: versionNum,
						isShowLoad: false,
						modelValue: modelValue,
						source:this.source
					},
					success: res => {
						this.firmwareList = res.data;
					}
				});
			},
			
			// 点击升级按钮
			clickUpgrade(downloadPath, versionName, firmwareId) {
				this.preUpgradeVersion = versionName;
				uni.showModal({
					content: this.manage["if-upgrade"] + "【" + versionName + "】" + this.manage["version"] + "?",
					success: (res) => {
						if(res.confirm) {
							// 查询本地存储固件
							this.searchLocalFirmware(downloadPath, firmwareId);
						}
					}
				})
				
			},
			
			// 下载固件
			downLoadFirmware(downloadPath, firmwareId) {
				this.$showLoading(this.manage["downloading"] || "正在下载...");
				let dtask = plus.downloader.createDownload(downloadPath, {}, (d, status) => {
					// 下载完成
					if(status == 200){ 
						console.log("Download success: " + d.filename);
						fileName = d.filename;
						let firmwarePath = plus.io.convertLocalFileSystemURL(fileName);
						this.$hideLoading();
						this.upgradeFirmWare(firmwarePath, firmwareId);
					} else {
						console.log("Download failed: " + status); 
					}  
				});
				dtask.start();
			},
			
			// 升级固件
			upgradeFirmWare(firmwarePath, firmwareId) {
				// 固件升级进度条弹窗显示
				let poster = this.$refs.poster;
				poster.show();
				// 升级蓝牙固件
				this.upgrade(firmwarePath,firmwareId);
			},
			
			// 升级蓝牙固件
			upgrade(firmwarePath, firmwareId) {
				let num = 1;
				let poster = this.$refs.poster;
				this.$sdkUtil.upgradeDevice(this.devObj, firmwarePath, (result) => {
					let errorCode = result.errorCode;
					// console.log("升级回调过来的result: ",result);
					if(errorCode === 3) {
						if(result.msg) {
							let msg = result.msg;
							this.printMsg = msg;
							// console.log("升级日志---", msg);
						}
					} else if (errorCode === 2) {
						let progress = result.data.progress;
						// console.log("升级进度---", progress);
						this.upgardeProgress = progress;
						if (progress == 100) {
							poster.hide();
							this.upgardeProgress = 0;
							this.uploadFirmwareVersion(firmwareId);
							this.firmwareVersion = this.preUpgradeVersion;
							isReupgrade = true;
							//升级结束 检测是否升级成功
							if( num === 1 ) {
								// uni.showLoading();
								num++;
								setTimeout(()=> {
									this.getDevSystemVersion({ preUpgradeVersion: this.preUpgradeVersion })
								},5000)
							}
						}
					} else if(errorCode === -2 && this.upgardeProgress < 99 && isReupgrade === true) {
						isReupgrade = false;
						this.upgradeTitle = "正在尝试重新升级...";
						// -2表示与设备断连，如果进度小于99表明在升级过程中断连，需尝试一次重新升级
						setTimeout( ()=> {
							this.upgrade(firmwarePath,firmwareId);
						},2000)
					} else {
						poster.hide();
					}
				});
			},
			
			// 查询本地存储固件
			searchLocalFirmware(downloadPath, firmwareId) {
				if (downloadPath.indexOf("/") > -1) {
					let filePath = "_downloads/" + downloadPath.substring(downloadPath.lastIndexOf("/") + 1);
					// console.log("filePath: " + filePath);
					uni.getSavedFileInfo({
						filePath: filePath,
						success: res => {
							// 获取到该固件，不需要下载
							// console.log("res: ",  res);
							// 将本地URL路径转换成平台绝对路径
							filePath = plus.io.convertLocalFileSystemURL(filePath);
							// console.log("该固件绝对路径为：" + filePath);
							this.upgradeFirmWare(filePath, firmwareId);
						},
						fail: err => {
							// 本地文件列表为空，需要下载
							console.log("没有找到文件---",err);
							this.downLoadFirmware(downloadPath, firmwareId);
						}
					});
				} else {
					// TODO 需要国际化
					this.$showToast(this.manage["download-path-error"] || "下载路径解析格式错误");
				}
			},
						
			//上传固件版本到服务器
			uploadFirmwareVersion(firmwareId) {
				this.$req.request({
					url: "/devDevice/app/upgradeDev",
					data: {
						devId: this.devObj.deviceId,
						firmwareId: firmwareId,
						isShowLoad:false
					},
					success: res => {
						if(res.code == 0) {
							console,log("上传蓝牙固见版本成功");
						}
					}
				})
			}
		},
		
		onLoad(options) {
			isReupgrade = true;
			this.upgradeTitle = this.manage["upgrading"] || "正在升级中...";
			this.firmwareVersion = this.manage["getting"] || "正在获取中...";
			if(options.source) {
				this.source=options.source
			}
			if(options.devObj) {
				this.devObj = JSON.parse(options.devObj);
				// console.log('***',this.devObj)
				this.getDevSystemVersion();
			}
			
			this.$setTitle(this.manage["upgrade-bluetooth-firmware"] || "升级蓝牙固件");
		}
		
	}
</script>

<style lang="scss">
	.list-container {
		width: 100%;
		font-size: 28upx;
	}
	
	.list-view {
		background-color: #FFFFFF;
		list-style: none;
		padding: 0;
	}
	
	.list-view li {
		width: 96%;
		padding: 20upx 2%;
		overflow: hidden;
		border-bottom: 1upx solid #F5F5F5;
	}
	
	.list-left {
		width: 80%;
		float: left;
	}
	
	.list-right-btn {
		width: 20%;
		float: left;
	}
	
	.list-right-btn button {
		font-size: 24upx;
		padding: 0;
		color: #FFFFFF;
		background-color: #00aa00;
	}
	
	.bt-version-upgrade-page {
		.firmware-progress-modal-content {
			background-color: #FFFFFF; 
			padding: 30upx 20upx; 
			border-radius: 15upx;
			.title {
				text-align: center;
			}
			.progress-view {
				width: 98%; 
				padding: 0 1%;
			}
		}
	}
</style>
