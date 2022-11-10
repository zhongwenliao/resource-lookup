<template>
	<view class="content">
		<view class="row b-b">
			<text class="tit">充值金额</text><br>
			<input class="input" type="number" v-model="moneys" placeholder="充值金额" placeholder-class="placeholder" />
		</view>   

		<button class="add-btn ymcode_ml" @click="confirm">确定提交</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userid:uni.getStorageSync("userid"),
				moneys: '',
				yhqid: 0,
				ddid: '',
				code: '',
				openid: '',
				je:0,
			}
		},
		onLoad(option){
			  if (uni.getStorageSync('userid')){
					console.log("存在userid")			
			  }else{						
				uni.redirectTo({
					url:'/pages/public/login'
				})
			}
		},
		methods: {

			//提交
			confirm(){
				let n = parseInt(this.moneys.trim()) * 100;
				if(n < 10000){
				  uni.showToast({
					title: "充值金额需大于100元",
					icon: "none"
				  });
				  return false;
				}
				
				if(n > 10000000){
				  uni.showToast({
					title: "充值金额需不能大于100000元",
					icon: "none"
				  });
				  return false;
				}
				
				if(this.isNumberBy100(n)==false){
					uni.showToast({
						title: "充值金额需为100元的整数倍",
						icon: "none"
					});
					return false;
				}								
				
				uni.login({
					provider:"weixin",
					success:loginRes=>{
						this.code=loginRes.code
						console.log(loginRes.code,`code显示`)
						this.openIDfun()//调用openid接口
					}
				});
			},
						
		 
		 isNumberBy100(ssn) {
			var re = /^[0-9]*[0-9]$/i; //校验是否为数字
			 if(re.test(ssn) && ssn%10000===0) {
				return true;
			 }else {
				return false;
			 }
		 },
		 
		 //调用openid接口
		 openIDfun(){
		 	   this.$http("gzhOpenID",
		 	   JSON.stringify({
		 	   	userid: this.userid,
		 	   	code: this.code
		 	   }),).then(res=>{	
		 			console.log(res,`openid显示`)
		 			this.openid=res.data.msg
		 			this.getorderData()//调用支付订单接口
		 	   }).catch(err=>{
		 	   	console.log(err);
		 	   })
		 },
		 
		 // 订单参数
		 getorderData(){
		 	var that=this
		 	
		 	this.$http("zfddYhcz",
		 	JSON.stringify({
		 		userid: this.userid,
		 		ddje: parseInt(this.moneys.trim()) * 100,
		 	}),).then(res=>{	
		 		console.log("订单参数",res);
		 		that.getPayData(res)//调用获取支付参数
		 	}).catch(err=>{
		 		console.log(err);
		 	})
		 	
		 },
		 
		 // 支付参数接口调用
		 getPayData(res){
		 	uni.request({
		 		url: 'https://zsh.abillchen.top/payServ/wxgzhPay',
		 		data: JSON.stringify({
		 			je: res.data.para.ddje,
		 			ddid: res.data.para.zfddid,
		 			openID: this.openid
		 		}),
		 		header: {
		 			'content-type': 'application/x-www-form-urlencoded' //自定义请求头信息
		 		},
		 		method: 'POST',
		 		//dataType:'json',
		 		success: (res) => {
		 			this.payment(res.data.para)//调用支付接口
		 		}
		 	});
		 },
		 
		 //支付接口调用
		 payment(item){
		         uni.requestPayment({
		             provider: 'wxpay',
		             timeStamp: item.timestamp,//时间戳
		             nonceStr: item.nonce_str,//随机字符串
		             package: "prepay_id="+item.prepay_id,//统一下单接口返回的 prepay_id 参数值
		             signType: 'MD5',
		              paySign: item.sign,//签名内容
		              success: function (res) {
		                 console.log('success:',res);
		 						 setTimeout(() => {
		 						 	uni.switchTab({
		 						 		url: '/pages/finance/bill',
		 						 	})
		 						 }, 2000)
		              },
		              fail: function (err) {
		                 console.log('fail:',err);
						 uni.showToast({title:err});
		              }
		          });
		      
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
		border-radius: 10upx;
	}
</style>
