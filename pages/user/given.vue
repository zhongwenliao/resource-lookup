<template>
	<view class="content">
		<view class="row b-b">
			<text class="tit">优惠券名称</text>
			<text>{{name}}</text>			
		</view>
		<view class="row b-b">
			<text class="tit">转给用户</text><br>
			<input class="input" type="number" v-model="gid" placeholder="接受用户id" placeholder-class="placeholder" maxlength="11" />
		</view>   

		<button class="add-btn ymcode_ml" @click="confirm">确定提交</button>
		<m-input  :yhqid="yhqid" :payType="payType" :phoneno="gid"  :show="show" @close="show = false"></m-input>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userid:uni.getStorageSync("userid"),
				yhqid:0,
				name:'',
				gid:'',
				show:false,
				payType:8
			}
		},
		onLoad(option){
			  if (uni.getStorageSync('userid')){
					console.log("存在userid")
					this.yhqid = option.yhqid
					this.name = option.name
			  }else{						
				uni.navigateTo({
					url:'/pages/public/login'
				})
			}
		},
		methods: {

			//提交
			confirm(){
				 this.show = false
				 this.$http("yhqToOther",JSON.stringify({
						userid: this.gid,
						yhqID:this.yhqid,
						token:uni.getStorageSync("token")
					})).then(res=>{
						if(res.data.code==0){
							uni.showToast({
								title: res.data.msg,
								icon: "none"
							})
							uni.navigateTo({
								url: '/pages/user/yhq'
							})
						}else{
							uni.showToast({
								title: res.data.msg,
								icon: "none"
							})
						}
					}).catch(err=>{
						console.log(err);
					}) /**/
			},		
			 
		}
	}
</script>

<style lang="scss">
	page{
		background: $page-color-base;
		padding-top: 16upx;
	}

	.row{
		display: flex;
		align-items: center;
		position: relative;
		padding:0 30upx;
		height: 110upx;
		background: #fff;

		.tit{
			flex-shrink: 0;
			width: 250upx;
			font-size: 30upx;
			color: $font-color-dark;
		}
		.input{
			flex: 1;
			font-size: 30upx;
			color: $font-color-dark;
		}
		.icon-shouhuodizhi{
			font-size: 36upx;
			color: $font-color-light;
		}
	}

	.add-btn{
		display: flex;
		align-items: center;
		justify-content: center;
		width: 690upx;
		height: 80upx;
		margin: 60upx auto;
		font-size: $font-lg;
		color: #fff;
		background-color: $base-color;
		border-radius: 10upx;
	}
</style>
