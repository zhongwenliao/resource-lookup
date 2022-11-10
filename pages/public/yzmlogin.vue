<template>
	<view class="container">
		<view class="left-bottom-sign"></view>
		<view class="back-btn yticon icon-zuojiantou-up" @click="navBack"></view>
		<view class="right-top-sign"></view>
		<!-- 设置白色背景防止软键盘把下部绝对定位元素顶上来盖住输入框等 -->
		<view class="wrapper">
			<view class="left-top-sign">LOGIN</view>
			<view class="welcome">
				欢迎登陆华歌行！
			</view>
			<view class="input-content">
				<view class="input-item">
					<text class="tit">手机号码</text>
					<input class="biaoti" v-model="phoneno" type="number" maxlength="11" placeholder="请输入手机号" />
				</view>
				<view class="input-item">
					<text class="tit">验证码</text>
					<input class="biaoti" v-model="code" type="number" maxlength="7" placeholder="请输入动态验证码" />
					<!-- <view class="yzm" :class="{ yzms: second>0 }" @tap="getcode">{{yanzhengma}}</view> -->
					<view class="yzm" :class="{ yzms: second>0 }" @click="getcode">{{yanzhengma}}</view>
				</view>
			</view>
			<button class="confirm-btn" @click="bindLogin">登录</button>							
		</view>		
	</view>
</template>

<script>
	var tha,js;
	import {  
        mapMutations  
    } from 'vuex';
	
	export default{
		onLoad(){
			tha = this;
			
		},
		onUnload(){
			clearInterval(js)
			this.second = 0;
		},
		data(){
			return {
				username:'',
				phoneno:'',
				password:'',
				code:'',
				invitation:'',
				xieyi:true,
				showPassword:false,
				second:0
			}
		},
		computed:{
			yanzhengma(){
				if(this.second==0){
					return '获取验证码';
				}else{
					if(this.second<10){
						return '重新获取0'+this.second;
					}else{
						return '重新获取'+this.second;
					}
				}
			}
		},
		methods: {
			display() {
			    this.showPassword = !this.showPassword
			},
			xieyitong(){
				this.xieyi = !this.xieyi;
			},
			getcode(){
				
				if(this.second>0){
					return;
				}				
				if(this.phoneno==""){
					uni.showToast({
					    icon: 'none',
					    title: '手机号不能为空'
					});
					return
				}
				this.second = 60;		
				
				this.$http("valicodeForLogin",JSON.stringify({
						mobile: this.phoneno
					})).then(res=>{
						if(res.data.code!=0){
							this.second =0;
							uni.showToast({title:res.data.msg,icon:'none'});
						}else{							
							uni.showToast({title:res.data.msg});
							js = setInterval(function(){
								tha.second--;
								if(tha.second==0){
									clearInterval(js)
								}
							},3000)												
						}
					}).catch(err=>{
						console.log(err);
					})
												
			},
		    bindLogin() {								
				if (this.phoneno.length =="") {
				    uni.showToast({
				        icon: 'none',
				        title: '手机号不能为空'
				    });
				    return;
				}
				if (this.code == "") {
				    uni.showToast({
				        icon: 'none',
				        title: '验证码不能为空'
				    });
				    return;
				}
																								
				
				this.$http("userLoginBySms",JSON.stringify({
						pwd:"",
						userid: this.phoneno,						
						valicode:this.code
					})).then(res=>{
						if(res.data.code!=0){
							uni.showToast({title:res.data.msg,icon:'none'});							
						}else{
							uni.showToast({title:res.data.msg});
							uni.setStorage({
								key:"userid",
								data:this.phoneno
							})
							uni.setStorage({
								key: 'token',
								data: res.data.data
							})
							setTimeout(()=>{
								uni.switchTab({
									url: '/pages/index/index',
								})
							}, 3000)
							
							
						}
					}).catch(err=>{
						console.log(err);
					})
				
		    },
			navBack(){
				uni.navigateBack();
			}
		}

	}
</script>

<style lang='scss'>
	page{
		background: #fff;
	}
	.container{
		padding-top: 115px;
		position:relative;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background: #fff;
	}
	.yzm {
		margin-left: 424rpx;
		margin-top: -75rpx;
		z-index: 2;
		color: #FF7D13;
		font-size: 24upx;
		line-height: 64upx;
		padding-left: 10upx;
		padding-right: 10upx;
		width:auto;
		height:64upx;
		border:1upx solid #FFA800;
		border-radius: 50upx;
	}
	.yzms {
		color: #999999 !important;
		border:1upx solid #999999;
	}
	
	.wrapper{
		position:relative;
		z-index: 90;
		background: #fff;
		padding-bottom: 40upx;
	}
	.back-btn{
		position:absolute;
		left: 40upx;
		z-index: 9999;
		padding-top: var(--status-bar-height);
		top: 40upx;
		font-size: 40upx;
		color: $font-color-dark;
	}
	.left-top-sign{
		font-size: 120upx;
		color: $page-color-base;
		position:relative;
		left: -16upx;
	}
	.right-top-sign{
		position:absolute;
		top: 80upx;
		right: -30upx;
		z-index: 95;
		&:before, &:after{
			display:block;
			content:"";
			width: 400upx;
			height: 80upx;
			background: #b4f3e2;
		}
		&:before{
			transform: rotate(50deg);
			border-radius: 0 50px 0 0;
		}
		&:after{
			position: absolute;
			right: -198upx;
			top: 0;
			transform: rotate(-50deg);
			border-radius: 50px 0 0 0;
			/* background: pink; */
		}
	}
	.left-bottom-sign{
		position:absolute;
		left: -270upx;
		bottom: -320upx;
		border: 100upx solid #d0d1fd;
		border-radius: 50%;
		padding: 180upx;
	}
	.welcome{
		position:relative;
		left: 50upx;
		top: -90upx;
		font-size: 46upx;
		color: #555;
		text-shadow: 1px 0px 1px rgba(0,0,0,.3);
	}
	.input-content{
		padding: 0 60upx;
	}
	.input-item{
		display:flex;
		flex-direction: column;
		align-items:flex-start;
		justify-content: center;
		padding: 0 30upx;
		background:$page-color-light;
		height: 120upx;
		border-radius: 4px;
		margin-bottom: 50upx;
		&:last-child{
			margin-bottom: 0;
		}
		.tit{
			height: 50upx;
			line-height: 56upx;
			font-size: $font-sm+2upx;
			color: $font-color-base;
		}
		input{
			height: 60upx;
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			width: 100%;
		}	
	}

	.confirm-btn{
		width: 630upx;
		height: 76upx;
		line-height: 76upx;
		border-radius: 50px;
		margin-top: 70upx;
		background: $uni-color-primary;
		color: #fff;
		font-size: $font-lg;
		&:after{
			border-radius: 100px;
		}
	}
	.forget-section{
		font-size: $font-sm+2upx;
		color: $font-color-spec;
		text-align: center;
		margin-top: 40upx;
	}
	.register-section{
		position:absolute;
		left: 0;
		bottom: 50upx;
		width: 100%;
		font-size: $font-sm+2upx;
		color: $font-color-base;
		text-align: center;
		text{
			color: $font-color-spec;
			margin-left: 10upx;
		}
	}
</style>
