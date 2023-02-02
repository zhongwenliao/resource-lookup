<template>
	<page>
		<u-navbar title="临停缴费"></u-navbar>
		<!--显示停车二维码-->
		<!-- <view class="box-erweima">
			<view class="box-erweimaimage">
				<u-image width="273px" height="403px" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/home/payParking/tingchejiaofei.jpg"></u-image> 
				<text>请扫车场二维码</text>
			</view>
		</view> -->
		<div id="imgBox">
			<u-image id="image" @click="previewImage" width="273px" height="403px" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/home/payParking/tingchejiaofei.jpg"></u-image>
			<p>点击放大，长按可保存</p>
		</div>
		<!-- <view class="box-sao" @click="paymentCar">
			<view class="box-bobo">
				<u-image class="image-box" width="84upx" height="85upx" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/home/payParking/saoyisao.png"></u-image>
				<text class="text-box">请扫车场二维码</text>
			</view>
		</view> -->
	</page>
</template>

<script>
	import uQRCode from '@/uni_modules/Sansnn-uQRCode/components/uqrcode/common/uqrcode'
	export default {
			data() {
				return {
					timeOutEvent:0, //记录触摸时长
				}
			},
			methods:{
				paymentCar() {
					// 允许从相机和相册扫码
					uni.scanCode({
						scanType: ['qrCode'], //条形码
						success: function(res) {
							uni.$u.toast(res.result)
							console.log(111, res)
	
							// 微信小程序
							if (res.errMsg == "scanCode:ok") {
								// 扫描到的信息
								void plus.runtime.openWeb(res.result,function(){
									uni.$u.toast('未识别到二维码，请重新尝试！')
								});

								/* let {
									type,
									code,
									id
								} = JSON.parse(res.result)
								// uni.showToast({
								// 	title: res.result,
								// 	duration: 2000
								// }); */
	
							} else {
								console.log("未识别到二维码，请重新尝试！")
								uni.$u.toast('未识别到二维码，请重新尝试！')
							}
	
						}
					});
				},
				previewImage(e) {
						uni.previewImage({
							// 需要预览的图片链接列表
							urls: ['https://file.yuanzhoulvwego.com/prod/uploadFiles/home/payParking/tingchejiaofei.jpg'],
							// 为当前显示图片的链接/索引值
							current: 'https://file.yuanzhoulvwego.com/prod/uploadFiles/home/payParking/tingchejiaofei.jpg',
							// 图片指示器样式	
							indicator:'default',
							// 是否可循环预览
							loop:false,
							// 长按图片显示操作菜单，如不填默认为保存相册
							/* longPressActions:{
								itemList:[this.l('发送给朋友'),this.l]
							 }, */
							success: res => {
								console.log('previewImage res', res.path)
								if (res.errMsg=="previewImage:ok") {
									// 扫描到的信息
									let {
										type,
										code,
										id
									} = JSON.parse(res.result)
									// uni.showToast({
									// 	title: res.result,
									// 	duration: 2000
									// });
									
								} /* else {
									console.log("未识别到二维码，请重新尝试！")
									uni.$u.toast('未识别到二维码，请重新尝试！')
								} */
							}, 
							fail: err => {
								console.log('previewImage err', err);
							}
						});
				}
				
			}
		}
</script>

<style>
	.box-bobo{
		position: relative;
		left: 25%;
		top: 50%;
		transform: translateY(-50%);
	}
	/* .image-box{
		
	} */
	.text-box{
		position: fixed;
		margin-left: 100upx;
		margin-top: -65upx;
		font-size: 40upx;
		font-family: PingFang SC;
		font-weight: 400;
		color: #FFFFFF;
	}
	.box-sao{
		width: 100%;
		position: fixed;
		bottom: 0;
		height: 209upx;
		background-color: #3E76F4;
	}
	#imgBox {
		width: 100%;
		height: 100%;
	}
	#imgBox p {
		font-size:20px;
		line-height:30px;
		color:#aaa;
		top: 10px;
		font-family: PingFang SC;
		text-align:center;
		margin-bottom:15px;
	}
	#image {
		width: 80%;
		display: block;
		margin:0 auto;
		box-shadow: 0 0 30px rgba(0,0,0,.2);
	}
</style>
