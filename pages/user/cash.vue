<template>
	<view class="content">
		<view class="row b-b">
			<text class="tit">提现金额</text><br>
			<input class="input" type="number" v-model="mentMoney" placeholder="提现金额" placeholder-class="placeholder" />
		</view>
		<view class="row b-b">
			<text class="tit">可提现金额</text>
			<text>￥{{balance}}元</text>			
		</view>
		<view class="statement">{{txt}}</view>

		<button class="add-btn ymcode_ml" @click="confirm">提交申请</button>
		<m-input :mentMoney="mentMoney" :payType="payType"  :show="show" @close="show = false"></m-input>
	</view>
	
</template>

<script>
	export default {
		data() {
			return {
				userid:uni.getStorageSync("userid"),
				balance:0,
				payType:6,
				show:false,
				mentMoney:0,
				moneys: '100元',
				txt: ''
			}
		},
		onLoad(option){
			  if (uni.getStorageSync('userid')) {
				console.log("存在userid");
				this.wxnickname=uni.getStorageSync("nickanme")
				this.showinfo();
				this.setxts();
			  }
		},
		methods: {
			  showinfo(){
				  this.$http("groupMy",JSON.stringify({
						userid: this.userid
					})).then(res=>{
						if(res.data.code==0){
							this.balance = Number(res.data.para.dqye)/100; //余额
						 }else{
							 uni.showToast({
							 	icon: 'none',
							 	title: res.data.msg
							 })
						 }
					}).catch(err=>{
						console.log(err);
					})
				
			  },

			//提交
			confirm(){
				let mentMoney = this.mentMoney * 100;
				if(mentMoney < 10000){
				  uni.showToast({
					title: "提现金额需大于100元",
					icon: "none"
				  });
				  return false;
				}
				
				if(mentMoney > this.balance*100){
					uni.showToast({
						title: "提现金额超支",
						icon: "none"
					});
					return false;
				}
				
				if(this.isNumberBy100(mentMoney)==false){
					uni.showToast({
						title: "提现金额需为100元的整数倍",
						icon: "none"
					});
					return false;
				}
				this.show=true

			},
			
			
			isNumberBy100(ssn) {
				var re = /^[0-9]*[0-9]$/i; //校验是否为数字
				 if(re.test(ssn) && ssn%10000===0) {
					return true;
				 }else {
					return false;
				 }
			 },		 
		
			//获取文本注释
			setxts(){
				 this.$http("txtGet",JSON.stringify({
						txtid: "FWZXZJTQ",
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
	
	.statement{
		display: flex;
		align-items: center;
		position: relative;
		padding:30rpx 20rpx;
		background: #fff;
	}
</style>
