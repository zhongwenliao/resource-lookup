<template>
	<view class="content-box">
		<view style="">
			<view class="address-area">{{ visData.address }}</view>
			<view class="pwdqr-box">
				<view class="password-area">{{ visData.tempPwd }}</view>
				<view class="" style="width: 100%; display: flex; justify-content: center;">
					<canvas style="width: 180px; height: 200px;" canvas-id="qrcode"></canvas>
				</view>
			</view>
			<view class="time-area">访问次数：{{ visData.usableCount == 0 ? '不限' : visData.usableCount }}</view>
			<view class="time-area">{{ visData.startDate }} / {{ visData.endDate }}</view>
		</view>
	</view>
</template>
<script>
	export default {
		name: "VisitorPassword",
		data() {
			
			return {
				visData: {
					password: "",
					tempCode: "",
					qrcodeImage: "",
					phone: "",
					startDate: "",
					endDate: "",
					usableCount: "",
					memo: "",
					address: ""
				}
			}
		},
		onLoad(options) {
			let aesId = options.aesId;
			this.$req.request({
				url: "/accVisitorAppointment/h5/get",
				data: {
					aesid: aesId,
				},
				isShowLoading: false,
				success: res => {
					if(res.code == 0) {
						this.visData = res.data;
						let tempCode = this.visData.tempCode;
						if (tempCode !== "") {
							this.qrcodeImage = this.$getQrCodeImage({"qrcodeText": tempCode});
						}
					}else{
						this.$showToast(res.msg)
					}
				}
			});
		}
	}
</script>

<style>
	.content-box {
		width: 100%;
		height: 100%;
		text-align: center;
		background-color: #F5F5F5;
		position: fixed;
	}
	
	.pwdqr-box {
		background-color: #FFFFFF; 
		margin: 40upx; 
		border-radius: 10upx; 
		border: 4upx solid #FFFFFF;
		border: 10upx dotted #F5F5F5;
		border-bottom: 10upx dotted #F5F5F5;
	}
	
	.password-area {
		font-size: 60upx;
		font-weight: bold;
		padding: 40upx;
	}
	
	.qrcode-area {
		padding: 40upx 0;
	}
	
	.address-area {
		font-size: 40upx;
		padding: 40upx;
	}
	
	.time-area {
		font-size: 28upx;
		padding: 40upx;
	}
	
	.share-btn {
		width: 100%;
		padding: 40upx 0;
		text-align: center;
	}
	
	.share-btn button {
		width: 25%;
		background-color: transparent;
		border: none;
	}
</style>
