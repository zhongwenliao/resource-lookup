<template>
	<uni-base-page class="uni-base-page">
		<view>
			<view class='password-area'>
				<text>{{ pwdObj.userQrCode.tempPwd }}</text><br /><br />
				<view class="uQRCode">
					<uqrcode ref="uQRCode" :mode="mode" :text="qrcode" :size="size" :margin="margin"
						:background-color="backgroundColor" :foreground-color="foregroundColor"
						:error-correct-level="errorCorrectLevel" :type-number="typeNumber" :file-type="fileType">
					</uqrcode>
				</view>

				<!-- <canvas canvas-id="qrcode" style="width: 350upx;height: 350upx; margin: 0 auto;" ></canvas> -->
			</view>
			<view class="uni-list-cell" hover-class="uni-list-cell-hover">
				<view class="uni-list-cell-navigate">
					<text class="uni-list-cell-text">{{ vis["vis-add"]||"访问地址" }}</text>
					<view style="width: 70%; font-size: 34upx;">
						<view>{{ pwdObj.deviceInstallAddress }}</view>
					</view>
				</view>
			</view>
			<view class="uni-list-cell" hover-class="uni-list-cell-hover">
				<view class="uni-list-cell-navigate">
					<text class="uni-list-cell-text">{{ vis["visitor-phone"]||"访客手机" }}</text>
					<view style="width: 70%; font-size: 34upx;">
						<view>{{ pwdObj.phone }}</view>
					</view>
				</view>
			</view>
			<view class="uni-list-cell" hover-class="uni-list-cell-hover">
				<view class="uni-list-cell-navigate">
					<text class="uni-list-cell-text">{{ vis["relationship"] || "访客关系" }}</text>
					<view style="width: 70%; font-size: 34upx;">
						<view>{{ pwdObj.remark }}</view>
					</view>
				</view>
			</view>
			<view class="uni-list-cell" hover-class="uni-list-cell-hover">
				<view class="uni-list-cell-navigate uni-navigate-right">
					<text class="uni-list-cell-text">{{ vis["start-date"] || "开始时间" }}</text>
					<uni-time-selector @change="startTimeChange" style="width: 70%; font-size: 34upx;">
						<view>{{ startTime }}</view>
					</uni-time-selector>
				</view>
			</view>
			<view class="uni-list-cell" hover-class="uni-list-cell-hover">
				<view class="uni-list-cell-navigate uni-navigate-right">
					<text class="uni-list-cell-text">{{ vis["end-date"] || "结束时间" }}</text>
					<uni-time-selector @change="endTimeChange" style="width: 70%; font-size: 34upx;">
						<view>{{ endTime }}</view>
					</uni-time-selector>
				</view>
			</view>
			<button type="primary" class="submit-btn" @click="submitEdit">{{ vis["submit-edit"] || "提交修改" }}</button>
		</view>
	</uni-base-page>
</template>

<script>
	import uQRCode from '@/uni_modules/Sansnn-uQRCode/components/uqrcode/common/uqrcode'
	import uniTimeSelector from "../../components/uni-time-selector/uni-time-selector.vue";
	export default {
		components: {
			uniTimeSelector
		},
		data() {
			return {
				mode: 'canvas',
				qrcode: null,
				size: 175,
				margin: 10,
				backgroundColor: '#FFFFFF',
				foregroundColor: '#000000',
				errorCorrectLevel: uQRCode.errorCorrectLevel.H,
				typeNumber: -1,
				fileType: 'png',

				pwdObj: {},
				startTime: null,
				endTime: null,
				qrcodeImage: ""
			}
		},

		computed: {
			vis() {
				return this.$t("vis");
			},
			title() {
				return this.$t("title")
			}
		},
		onReady() {
			this.$setTitle(this.title["modify-vis-pwd-validity-period"] || "修改访客密码有效期");
		},
		onLoad(options) {
			if (options.pwdObj) {
				this.pwdObj = JSON.parse(options.pwdObj);
				console.log(this.pwdObj);
				this.startTime = this.pwdObj.accStartDateTime;
				this.endTime = this.pwdObj.accEndDateTime;
				let qrcode = this.pwdObj.userQrCode.tempPwd;
				if (qrcode !== "") {
					this.qrcode = qrcode
					// this.qrcodeImage = this.$getQrCodeImage({"qrcodeText": qrcode});
					console.log("qrcode不为空时打印图片---", this.qrcodeImage);
				}
			}
		},

		methods: {
			startTimeChange(e) {
				this.startTime = e + ":00";
			},

			endTimeChange(e) {
				this.endTime = e + ":00";
			},

			//提交修改访客密码有效期
			submitEdit() {
				this.$api('equipment.updateVisitorQrCode', {
					id: this.pwdObj.id,
					accStartDateTime: this.startTime,
					accEndDateTime: this.endTime
				}).then(res => {
					this.$showToast(this.vis["edit-success"] || "更改成功");
					setTimeout(() => {
						uni.navigateBack(1);
					}, 800)
				})
				// this.$req.request ({
				// 	url: "/accVisitorAppointment/app/updateById",
				// 	data: {
				// 		id: this.pwdObj.id,
				// 		startDate: this.startTime,
				// 		endDate: this.endTime
				// 	},
				// 	success: res => {
				// 		this.$showToast(this.vis["edit-success"] || "更改成功");
				// 		setTimeout( ()=> {
				// 			uni.navigateBack();
				// 		}, 800)
				// 	}
				// })
			}

		}
	}
</script>

<style>
	.uQRCode {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 350upx;
		padding-bottom: 70upx;
	}

	.password-area {
		width: 100%;
		height: 500upx;
		text-align: center;
		vertical-align: center;
		margin: 0 auto;
		padding: 20upx 0;
		font-size: 40upx;
	}

	/* 列表 */
	.uni-list {
		background-color: #FFFFFF;
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	.uni-list:after {
		position: absolute;
		z-index: 10;
		right: 0;
		bottom: 0;
		left: 0;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc;
	}

	.uni-list::before {
		position: absolute;
		z-index: 10;
		right: 0;
		top: 0;
		left: 0;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc;
	}

	.uni-list-cell {
		position: relative;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

	.uni-list-cell-hover {
		background-color: #eee;
	}

	.uni-list-cell-pd {
		padding: 22upx 30upx;
	}

	.uni-list-cell-left {
		font-size: 28upx;
		padding: 0 30upx;
	}

	.uni-list-cell-db,
	.uni-list-cell-right {
		flex: 1;
	}

	.uni-list-cell::after {
		position: absolute;
		z-index: 3;
		right: 0;
		bottom: 0;
		left: 30upx;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc;
	}

	.uni-list .uni-list-cell:last-child::after {
		height: 0upx;
	}

	.uni-list-cell-last.uni-list-cell::after {
		height: 0upx;
	}

	.uni-list-cell-divider {
		position: relative;
		display: flex;
		color: #999;
		background-color: #f7f7f7;
		padding: 15upx 20upx;
	}

	.uni-list-cell-divider::before {
		position: absolute;
		right: 0;
		top: 0;
		left: 0;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc;
	}

	.uni-list-cell-divider::after {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0upx;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc;
	}

	.uni-list-cell-navigate {
		font-size: 30upx;
		padding: 22upx 30upx;
		line-height: 48upx;
		position: relative;
		display: flex;
		box-sizing: border-box;
		width: 100%;
		flex: 1;
		justify-content: space-between;
		align-items: center;
	}

	.uni-list-cell-navigate {
		padding-right: 36upx;
	}

	.uni-navigate-badge {
		padding-right: 50upx;
	}

	.uni-list-cell-navigate.uni-navigate-right:after {
		font-family: uniicons;
		content: '\e583';
		position: absolute;
		right: 24upx;
		top: 50%;
		color: #bbb;
		-webkit-transform: translateY(-50%);
		transform: translateY(-50%);
	}

	.uni-list-cell-navigate.uni-navigate-bottom:after {
		font-family: uniicons;
		content: '\e581';
		position: absolute;
		right: 24upx;
		top: 50%;
		color: #bbb;
		-webkit-transform: translateY(-50%);
		transform: translateY(-50%);
	}

	.uni-list-cell-navigate.uni-navigate-bottom.uni-active::after {
		font-family: uniicons;
		content: '\e580';
		position: absolute;
		right: 24upx;
		top: 50%;
		color: #bbb;
		-webkit-transform: translateY(-50%);
		transform: translateY(-50%);
	}

	.uni-collapse.uni-list-cell {
		flex-direction: column;
	}

	.uni-list-cell-navigate.uni-active {
		background: #eee;
	}

	.uni-list.uni-collapse {
		box-sizing: border-box;
		height: 0;
		overflow: hidden;
	}

	.uni-collapse .uni-list-cell {
		padding-left: 20upx;
	}

	.uni-collapse .uni-list-cell::after {
		left: 52upx;
	}

	.uni-list.uni-active {
		height: auto;
	}

	.submit-btn {
		width: 60%;
		margin-top: 10%;
		border-radius: 20upx;
	}
</style>
