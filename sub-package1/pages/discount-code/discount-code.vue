<template>
	<uni-base-page style="background: rgb(239,239,244);width: 100%;">
		<view class="code">
			<view >
				<image :src="codeObj.qrCodeBase64" mode="aspectFit" />
			</view>	
			<text>{{ coupon["scan"] || "请扫描二维码领取优惠券" }}</text>
			<button @click="refresh">{{ coupon["refresh"] || "刷新" }}</button>
		</view>
	</uni-base-page>
</template>

<script>
	var cleartime =null
	export default{
		data(){
				return {
					id: "",	
					codeObj: {
						
					},
					qrcodeInvaildTimeSec: "",
				}
		},
		computed:{
			coupon() {
				return this.$t("coupon")
			}
		},
				
		// },
		// onReady() {
		//         this.$setTitle(this.title["details"])
		// },
		onLoad(options) {
			this.id = options.id;
			this.getQRCode().then((time) => {
				this.qrcodeInvaildTimeSec = time;
				cleartime = setInterval(() =>{
					this.getQRCode();
				}, this.qrcodeInvaildTimeSec);
			});
		},
		onUnload() {
		    clearInterval(cleartime)
		},
		methods:{
			// 获取二维码
			getQRCode(){
				return new Promise((resolve, reject) => {
					this.$req.request({
						url: "/prefCouponTemplate/app/generateQrCode",
						method: "POST",
						data: {
							id: this.id,
						},
						success: (res) => {
							if (res.code === 0) {
								this.codeObj = res.data;
								resolve(res.data.qrcodeInvaildTimeSec * 1000);
							}
						},
						fail: (err) => {
							reject(err);
						}
					});
				});
			},
			// 刷新
			refresh(){
				this.getQRCode()
			}
		},	
	}
</script>

<style lang="scss" scoped>
    .code{
		text-align: center;
		padding: 200upx 100upx 0 100upx;
		image{
			width: 100%;
			display: block;
		}
		text{
			font-size: 32upx;
			color: rgb(255,102,51);
			text-align: center;
			display: block;
			margin-top: 60upx;
		}
		button{
			width: 300upx;
			height: 70upx;
			line-height: 70upx;
			background: linear-gradient(118deg, #01dca3 0%, #088b68 100%);
			color: #fff;
			margin: auto;
			margin-top: 60upx;
		}
	}
</style>