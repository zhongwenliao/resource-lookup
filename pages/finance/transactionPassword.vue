<template>
	<view>
		<view class="row b-b">
			<text class="tit">登入账号</text>
			<input class="input" type="number" v-model="form.name" disabled="disabled" placeholder-class="placeholder" maxlength="11" />			
		</view>
		
		<view class="row b-b">
			<text class="tit">登入密码</text>
			<input class="input" type="text" v-model="form.pwd" placeholder="请输入登入密码" 
				placeholder-class="placeholder" maxlength="11" :password="!showPassword" />			
		</view>
		
		<view class="row b-b">
			<text class="tit">设置交易密码</text>
			<input class="input" type="number" v-model="form.pwd_jy" placeholder="请设置交易密码" 
				placeholder-class="placeholder" maxlength="6" :password="!showPassword" />			
		</view>
		
		<button class="add-btn ymcode_ml" @click="pwdConfirm">确定提交</button>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userid: uni.getStorageSync('userid'),
			form: {
				name: '',
				pwd: '',
				pwd_jy: ''
			},
			password: 'password',
			passwordIcon: true,
			border: true
		}
	},
	onLoad() {
		this.form.name=this.userid
	},
	methods: {
		pwdConfirm(){
			  var patrn = /^\d{6}$/;
			if (!patrn.test(this.form.pwd_jy)) {
				uni.showToast({
					title: `请输入6位的数字密码`,
					icon: 'none'
				})
			} else{
				this.$http("userPwdMoneyReset",JSON.stringify({
						token:uni.getStorageSync("token"),
						pwdLogin: this.form.pwd,
						pwdMoney:this.form.pwd_jy,
					})).then(res=>{
				    if (res.data.code=="0") {
						uni.showToast({title: res.data.msg, icon: 'none'})
						setTimeout(()=>{
							uni.switchTab({
							   url: '/pages/user/user',
							})
						}, 500)
				    } else{
				      uni.showToast({
				      	title: res.data.msg,
				      	icon: 'none'
				      })
				    }
					}).catch(err=>{
						console.log(err);
					})
			}
		}
	}
}
</script>

<style lang="scss" scoped>
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
		border-radius: 10upx;
	}
</style>
