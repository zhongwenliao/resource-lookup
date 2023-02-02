<template>
	<page>
		<u-navbar :title="'详情'" :background="{background: '#5083F5'}" title-color="#fff" back-icon-color="#fff"></u-navbar>
		<view class="appoint-center u-m-l-20 u-m-r-20 u-m-b-30 u-p-b-30">
			<view class="wenben">
				<u-image width="74upx" height="74upx" class="wenben-image"
				:src="ruleForm.approvalStatus === 0 ? 'https://file.yuanzhoulvwego.com/prod/uploadFiles/home/meetingRoom/daishenpi.png' :
					ruleForm.approvalStatus === 1 ? 'https://file.yuanzhoulvwego.com/prod/uploadFiles/home/meetingRoom/shenpitongguo.png' : 'https://file.yuanzhoulvwego.com/prod/uploadFiles/home/meetingRoom/yibohui.png'"></u-image>
				<view class="u-m-l-90 u-m-r-20">
					<text class="u-font-42">
						{{ ruleForm.approvalStatus === 0 ? '预约申请待待审批...' : ruleForm.approvalStatus === 1 ? '审批通过' : '预约申请待已驳回' }}
					</text>
					<view class="u-font-28" v-if="ruleForm.approvalStatus === 1">您本次会议室预约申请已通过，请在申请时间内使用门禁开门</view>
				</view>
			</view>
			<view class="appoint-boxs">
				<view class="appoint-boxs-view">
					<text>会议地址：</text>
					<text>{{ ruleForm.room.ownedBuilding + '/' + ruleForm.room.name }}</text>
				</view>
				<view class="appoint-boxs-view">
					<view class="appoint-boxs-title">会议时间：</view>
					<view class="appoint-boxs-content appoint-boxs-text-top">
						<view v-for="fitem in ruleForm.fwYuyueRoomReservationForms" :key="fitem.id">
							{{ fitem.appointmentDate }}  {{ fitem.appointmentTime }}
						</view>
					</view>
				</view>
			</view>
			<view class="appoint-boxs" v-if="ruleForm.approvalStatus === 1">
				<text style="font-weight: bold;">会议室门禁二维码/密码</text>
				<view class="banner">
					<swiper :interval="2000" :duration="500" circular="true" indicator-active-color="#fff"
						easing-function="true" >
						<swiper-item v-for="(item, index) in ruleForm.fwYuyueRoomReservationForms" :key="index" >
							<view class="banner-time">有效时间：
								{{ item.appointmentDate }}  {{ item.appointmentTime }}
							</view>	
							<view class="banner-boxs">
							<view v-if="item.tempCode"  class="img-box">
								<uqrcode  ref="uQRCode" :mode="mode" :text="item.tempCode" :size="size" style="margin: 0 auto;" 
									:background-color="backgroundColor" :foreground-color="foregroundColor"
									:error-correct-level="errorCorrectLevel" :type-number="typeNumber" :file-type="fileType"></uqrcode>
							</view>
								<view v-else class="u-text-center u-type-error banner-boxs-eorror">
									{{errorMsg}}!
								</view>
								<view style="font-size: 60upx;" class="banner-boxs-pwd">*{{ item.tempPwd || '暂无' }}#</view>
							</view>
						</swiper-item>
					</swiper>
				</view>
			</view>
			<view class="appoint-boxs" v-if="ruleForm.approvalStatus === 1">
				<text style="font-weight: bold;">密码分享</text>
				<view class='share-btn'>
					<view class='btn' hover-class="btn-hover" @click="shareSystem('WXSceneSession')">
						<button>
							<u-image width="76upx" height="76upx" mode="aspectFill" src='https://file.yuanzhoulvwego.com/prod/uploadFiles/home/meetingRoom/zhuangfa.png'></u-image>
						</button>
						<text class="u-font-28">转发</text>
					</view>
					<u-line color="#DDDDDD" direction="col" margin="0 140upx 0 140upx" length="0s" />
					<view class='btn' hover-class="btn-hover" @click="copy()">
						<button>
							<u-image width="76upx" height="76upx" mode="aspectFill" src='https://file.yuanzhoulvwego.com/prod/uploadFiles/home/meetingRoom/fuzhi.png'></u-image>
						</button>
						<text class="u-font-28">复制</text>
					</view>
				</view>
				<!-- <view style="padding: 30upx 20upx 40upx 20upx;">
					<u-row gutter="16">
						<u-col span="6" style="position: relative;" >
							<view @click="Share('WXSceneSession')">
								<u-image style="position: absolute;left: 40%;" width="76upx" height="76upx" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/home/meetingRoom/zhuangfa.png" ></u-image>
								<text style="position: absolute;left: 44%; top: 90upx; font-size: 26upx;">转发</text>
							</view>
						</u-col>
						<u-col span="6" style="position: relative;">
							<u-image  style="position: absolute;left: 40%;" width="76upx" height="76upx" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/home/meetingRoom/fuzhi.png"></u-image>
							<text style="position: absolute;left: 44%; top: 90upx;font-size: 26upx;">复制</text>
						</u-col>
					</u-row>
				</view> -->
			</view>
		</view>
	</page>
</template>

<script>
	import uQRCode from '@/uni_modules/Sansnn-uQRCode/js_sdk/u-qrcode'
	export default {
		data() {
			return {
				newData: [],
				
				mode: 'canvas',
				text: null,
				size: 128,
				margin: 10,
				backgroundColor: '#FFFFFF',
				foregroundColor: '#000000',
				errorCorrectLevel: uQRCode.errorCorrectLevel.H,
				typeNumber: -1,
				fileType: 'png',
				
				ruleForm: { room: {} },
				keyword: '',
				show: false,
				errorMsg:'',
				qrPath: '',
				qrCode: '',
				isAndroid: uni.getSystemInfoSync().platform === "android",
			}
		},
		onLoad() {
			let that = this
			that.getById(that.$Route.query)		
		},
		methods: {
			getById(query) {
				let params = {
					id: query.id ,
					zoneId : query.zoneId
				}
				this.$api('meetingRoom.getById', params).then(res => {
					if (res.code == 200) {
						this.ruleForm = res.data
						
						
					}
				})
			},
			shareSystem() {
				
				// if (!plus.share.sendWithSystem) {
					this.$showToast("该平台不支持系统分享!");
				// } else {
					// 分享内容及链接
					// var msg = {
					// 	"content": '213456231',
					// 	"href": this.link
					// };
					
					// if (!this.isAndroid) { //iOS平台添加链接地址
					// 	msg.href = this.link;
					// }
					// plus.share.sendWithSystem(msg, () => {
					// 	// this.$showToast("分享成功");
					// }, (e) => {
					// 	this.$showToast(("分享失败:") + JSON.stringify(e.code));
					// });
					
					// 分享二维码
					// this.$getQrCodeImage({"canvasId": "shareImageCanvas", "qrcodeText": this.qrcode, "text": this.password}).then((qrcodeImagePath) => {
					// 	let msg = {
					// 		"pictures": [qrcodeImagePath]
					// 	};
					// 	plus.share.sendWithSystem(msg, () => {
					// 		// this.$showToast("分享成功");
					// 	}, (e) => {
					// 		this.$showToast((this.vis["share-fail"] || "分享失败:") + JSON.stringify(e.code));
					// 	});
					// });
				// }
			},
			copy() {
				let obj = {}
				this.ruleForm.fwYuyueRoomReservationForms.forEach(item =>{
					obj[item.id] = item.tempPwd
				})
				console.log(obj)
				let grrk = ''
				grrk = JSON.stringify(obj)
				console.log(grrk)
				uni.showModal({
					content: '*********', 
					confirmText: '确定',
					success: () => {
						uni.setClipboardData({
							data: '*487532#', 
							success: () => {
								uni.showToast({
									title: '复制成功'
								})
							}
						})
					}
				})
			}
		}
	}
</script>

<style>
	page {
		background: linear-gradient(0deg, #5586F5, #5083F5);
	}
</style>
<style lang="scss" scoped>
	/deep/ .u-border-bottom:after {
	    border-bottom-width: 0px;
	}
	.banner swiper {
		height: 400upx;
		padding-top: 20rpx;
	}
	.banner image {
		width: 250upx;
		height: 250upx;
		text-align: center;
	}
	.banner {
		.banner-time {
			text-align: center;
			color: #5A8AF6;
			font-weight: bold;
		}
		.banner-boxs {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			.banner-boxs-eorror {
				width: 256upx;
				height: 256upx;
				line-height: 256upx;
				margin: 0 auto;
			}
			.banner-boxs-pwd {
				text-align: center;
				font-weight: bold;
			}
		}
	}
	.appoint-center {
		.wenben {
			color: #FFFFFF;
			margin-top: 40upx;
			padding-left: 30upx;
			padding-right: 30upx;
			margin-bottom: 30upx;
			position: relative;
			.wenben-image {
				position: absolute;
				top: 50%;
				transform: translateY(-50%);
			}
		}
		.appoint-boxs {
			background: #FFFFFF;
			margin-bottom: 20rpx;
			border-radius: 22rpx;
			padding: 30rpx 20rpx 40rpx 20rpx;
			.appoint-boxs-view {
				padding-top: 20rpx;
				.appoint-boxs-title {
					display: inline-block;
					width: 150upx;
				}
						
				.appoint-boxs-content {
					display: inline-block;
					color: $uni-text-color-prompt;
				}
				.appoint-boxs-text-top {
					vertical-align: text-top;
				}
			}
			.share-btn {
				width: 100%;
				background-color: #FFFFFF;
				display: flex;
				justify-content: center;
				padding-top: 40rpx;
				padding-left: 70rpx;
				padding-right: 70rpx;
			}
			
			.btn-hover {
				background: #FFFFFF;
			}
			.btn {
				float: left;
				width: 25%;
				text-align: center;
			}
			
			.btn .u-image {
				left: 50%;
				transform: translateX(-50%);
			}
			
			.btn button {
				font-size: 32upx;
				background-color: transparent;
				border: none;
				border-style: none;
				width: 100upx;
				height: 100upx;
				padding: 0;
				border-width: 0upx;
			}
			
			.btn button:after {
				border: none;
			}
		}
	}
</style>
