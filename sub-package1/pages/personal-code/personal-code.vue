<template>
	<view class="personal">
		<image :src="perCode.qrCodeBase64" mode="aspectFit"></image>
		<!-- <view class="community-name">
			
		</view> -->
		<button @click="refresh">{{ coupon["refresh"] || "刷新" }}</button>
	</view>
</template>

<script>
	export default {
		data(){
			return{
				perCode: ""
			}
		},
		computed:{
			coupon() {
				return this.$t("coupon")
			}
		},
		onLoad() {
			this.codeInfo();
		},
		methods:{
			codeInfo(){
				this.$req.request({
					url: "/appUser/app/getPersonalPasscode",
					isShowLoading: false,
					success: res => {
						if(res.code == 0){
							this.perCode = res.data;
							console.log("码")
						}
					}
				})
			},
			refresh(){
				this.codeInfo();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.personal{
		width: 100%;
	}
	.personal image{
		display: block;
		margin: auto;
		margin-top: 20%;
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
</style>
