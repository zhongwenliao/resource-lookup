<template>
	<view class="content">
		<view class="row b-b">
			<text class="tit">受赠者ID</text><br>
			<input class="input" v-model="phoneno" type="number" placeholder="受赠者ID" maxlength="11" placeholder-class="placeholder" />
		</view>
		<view class="row b-b">
			<text class="tit">赠送金额</text>
			<input class="input" v-model="mentMoney" type="number" placeholder="赠送金额" placeholder-class="placeholder" />			
		</view>
		<view class="row b-b">
		  <text>{{txt}}</text>
		</view>


		<button class="add-btn ymcode_ml" @click="confirm">提交</button>
		<m-input  :phoneno="phoneno" :mentMoney="mentMoney" :payType="payType"  :show="show" @close="show = false"></m-input>
	</view>
</template>

<script>
	import mInput from '../../components/mInput.vue'
	export default {
		components: {
			mInput
		},
		data() {
			return {
				userid:uni.getStorageSync("userid"),
				phoneno:'',
				balance:0,
				payType:3,//转赠
				mentMoney:"",//金额
				show: false,//弹框隐藏
				txt:''
			}
		},
		onLoad(){
			  if (uni.getStorageSync('userid')) {
					console.log("存在userid");
					this.person();
					this.setxts();
			  }else {						
					uni.redirectTo({
						url:'/pages/public/login'
					})					
			  }
		},
		methods: {
				person(){
					this.$http("userInfo",
					JSON.stringify({
						userid: this.userid,
					}),).then(res=>{	
						this.balance = Number(res.data.para.dqye)/100; //余额
					}).catch(err=>{
						console.log(err);
					})	
				},
			
				//提交
				confirm(){
					if(this.phoneno==""){
						uni.showToast({
						    icon: 'none',
						    title: '受送者ID不能为空'
						});
						return
					}
					
					if(this.mentMoney==""){
						uni.showToast({
						    icon: 'none',
						    title: '赠送金额不能为空'
						});
						return
					}
					
					if(this.mentMoney > this.balance){
						uni.showToast({
							title: "赠送金额超支",
							icon: "none"
						});
						return false;
					}
					
					this.show=true		
				},
				
				//获取文本注释
				setxts(){
							 
					 this.$http("txtGet",JSON.stringify({
							txtid: "YEZZSM",
							userid: this.userid,
						})).then(res=>{
							this.txt = res.data.para.txt
						}).catch(err=>{
							console.log(err);
						})
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
	.default-row{
		margin-top: 16upx;
		.tit{
			flex: 1;
		}
		switch{
			transform: translateX(16upx) scale(.9);
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
		border-radius: 10upx;
	}
</style>
