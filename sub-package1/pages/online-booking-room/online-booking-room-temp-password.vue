<template>
	<view class="content">
		<view class="auth-id-tip">
			<text style="width: 100%;">提示：下方的临时密码或者二维码可用于门锁开门</text>
		</view>
		<view class='password-area'>
			<text>{{ password }}</text><br/><br/>
			<!-- <image :src="qrcodeImage" style="width: 300upx;height: 300upx;"/> -->
			<canvas canvas-id="qrcode" style="width: 350upx;height: 350upx; margin: 0 auto;"></canvas>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				password: "",
				qrcode: "",
				qrcodeImage: ""
			}
		},

		onLoad(options) {
			let sendData = {
				"dev_sn": options.devSn,
				"phone": options.phone,
				"start_date": options.accEnddatetime,
				"end_date": options.accEnddatetime
			};
			this.$showLog("sendData", sendData);
			this.$showLoading("正在生成二维码中");
			uni.request({
				url: "https://www.doormaster.me:15566/doormaster/lock_temppwd",
				method: "POST",
				header: {
					"content-type": "application/json"
				},
				data: JSON.stringify(sendData),
				success: (res) => {
					this.$hideLoading();
					let data = res.data;
					if (data.ret === 0) {
						this.password = data.temp_pwd;
						this.qrcodeImage = this.$getQrCodeImage({"qrcodeText": this.password});
					} else {
						this.$showToast(data.msg);
					}
					this.$showLog("ret", data.ret);
				},
				fail: (err) => {
					this.$hideLoading();
					this.$showToast("生成临时二维码失败");
				}
 			});
			
			// this.password = options.pwd || "123456789";
			// var qrcode = options.qrcode || "123456789";
			// if (qrcode !== "") {
			// 	this.qrcodeImage = this.$getQrCodeImage(qrcode);
			// 	console.log("qrcode不为空时打印图片---",this.qrcodeImage);
			// }
		}
	}
</script>

<style>
	.auth-id-tip {
		display: flex;
		flex-direction: row;
		align-items: center;
		color: #EDA329;
		padding: 10upx 3%;
		background: #FDFAE9;
	}
	
	.password-area {
		/* position: absolute; */
		width: 100%;
		height: 500upx;
		text-align: center;
		vertical-align: center;
		margin: 0 auto;
		padding: 50upx 0;
		font-size: 40upx;
	}
/* 
	.er_code {
		width: 360upx;
		height: 360upx;
		margin: 0 auto;
	} */

	.share-btn {
		width: 100%;
		top: 600upx;
		padding: 10upx;
	}

	.share-text {
		padding: 10upx 20upx 20upx 20upx;
		text-align: left;
	}

	.btn-hover {
		background: #B4AEB5;
	}
	
	/* #ifdef MP-WEIXIN || MP-ALIPAY */
	.btn {
		float: left;
		width: 50%;
		text-align: center
	}

	/* #endif */

	/* #ifdef APP-PLUS || H5 */
	.btn {
		float: left;
		width: 25%;
		text-align: center;
	}

	/* #endif */

	.btn image {
		width: 100upx;
		height: 100upx;
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
</style>
