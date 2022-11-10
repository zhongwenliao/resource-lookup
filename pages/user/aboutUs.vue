<template>
	<view class="aboutUs">
		<view class="aboutUs_hose" v-if="phone || aboutData.length > 0">
			<view class="hose_view" v-if="phone">小农固定电话
				<view class="hose_phose" @click="aboutClick(phone)">
					<text >{{ phone }}</text>
					<uni-icons type="right" size="18"></uni-icons>
				</view>
			</view>
			<block v-for="(item, index) in aboutData" :key="index">
				<view class="hose_view" v-if="item.infoMobile">{{ item.infoName }}
					<view class="hose_phose" @click="aboutClick(item.infoMobile)">
						<text >{{ item.infoMobile }}</text>
						<uni-icons type="right" size="18"></uni-icons>
					</view>
				</view>
				<view class="hose_view" v-if="item.infoUrl">{{ item.infoName }}
					<view class="hose_phose" @click="aboutUrlClick(item.infoUrl)">
						<uni-icons type="right" size="18"></uni-icons>
					</view>
				</view>
			</block>
		</view>
	</view>
</template>

<script>
	export default{
		data(){
			return {
				page: 0,
				phone: '',
				aboutData: []
			}
		},
		onLoad() {
			this.fixedPhone()
			this.infoListClient()
		},
		methods:{
			fixedPhone(){
				this.$http("systemCfgInfoClient",JSON.stringify({
					token: uni.getStorageSync("token"),
					cfgKey:'fixedPhone'
				})).then(res=>{
					this.phone = res.data.systemCfgInfo.cfgValue;
				}).catch(err=>{
					console.log(err);
				})	
			},
			infoListClient(){
				this.$http("infoListClient",JSON.stringify({
					token: uni.getStorageSync("token") || 'token',
					pg: this.page
				})).then(res=>{
					this.aboutData = res.data.infoList;
				}).catch(err=>{
					console.log(err);
				})
			},
			aboutClick(infoMobile){
				uni.makePhoneCall({
					phoneNumber: infoMobile.replace(/\D/g,'').replace(/^/,'$& ').replace(/....(?!$)/g,'$& ')
				});
			},
			aboutUrlClick(infoUrl){
				let array = [];
				array.push(infoUrl);
				
				uni.previewImage({
					urls: array,
					current: array[0],
					longPressActions: {  //长按保存图片到相册
						itemList: ['保存图片'],
						success: (data)=> {
							uni.saveImageToPhotosAlbum({ //保存图片到相册
								filePath: payUrl,
								success: function () {
									uni.showToast({icon:'success',title:'保存成功'})
								},
								fail: (err) => {
									uni.showToast({icon:'none',title:'保存失败，请重新尝试'})
								}
							});
						},
						fail: (err)=> {
							console.log(err.errMsg);
						}
					}
				});
			}
		}
	}
</script>

<style scoped lang="scss">
.aboutUs{
	padding: 10rpx 20rpx 0;
	background: #E5E5E5;
	height: 100vh;
}
.aboutUs_hose{
	background: #FFFFFF;
	padding: 20rpx;
	font-size: 30rpx;
	border-radius: 10rpx;
}
.hose_view{
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.hose_view:nth-child(n+1){
	padding: 20rpx 0;
}
.hose_view:nth-child(n+2){
	border-top: 1rpx solid #E5E5E5;
}
.hose_phose{
	display: flex;
	align-items: center;
}
</style>