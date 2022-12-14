<template>
<view class="message">
	<view class="btn-box">
		<button @click="subscribe">订阅通知</button>
	</view>
	<view class="tip">
		<view class="">温馨提示</view>
		<view class="">1、点击订阅通知按钮</view>
		<view class="">2、勾选相应选项，确认订阅</view>
		<view class="">3、业主审核后将为您发送业主审核结果</view>
	</view>
	<view class="ad-box">
		<ad :adpid="adpid" unit-id="adunit-bfedf0a5b8c2943b"></ad>
	</view>
	
</view>
</template>

<script>
let jsCode = "";
export default {
  name: "",
  data() {
    return {
        adpid: this.$getConfigParam().openDoorAdpid,
    };
  },
  methods:{
	  subscribe(visId){
		  // 预约订阅消息
		  // #ifdef MP-WEIXIN
		  wx.requestSubscribeMessage({
		  	tmplIds: this.$getConfigParam().visSuccessTemplateId,
		  	success: (res) => {
		  		console.log("订阅消息模板",JSON.stringify(res))
		  		if(JSON.stringify(res).split("accept").length == 3){
		  			this.$req.request({
		  				url: "/visEmpVisitor/h5/updateOpenIdById",
		  				data: {
							visId: visId,
							wxMiniAppId: this.$getConfigParam().wxMiniAppId,
							jsCode: jsCode,
						},
		  				success: res => {
		  					if(res.code == 0) {
		  						this.$showToast(res.msg);
		  						setTimeout(() =>{
		  							uni.reLaunch({
		  								url: "/sub-package1/pages/audit-success/audit-success"
		  							})
		  						})
		  					} else {
		  						this.$showToast(res.msg)
		  					}
		  				}
		  			});
		  		}else{
		  			this.$showToast("请点击允许接收消息");
		  		}
		  	},
		  	fail: (err) => {
		  		this.$showLog("微信小程序调用订阅消息模板失败", err, "登录界面");
		  	}
		  });
		  // #endif
	  }
  },
  onLoad(options) {
  	// 扫码拿到的参数
  	this.visId = decodeURIComponent(options.scene);
	this.subscribe(this.visId)
  },
  onShow() {
  	// #ifdef MP-WEIXIN
  	// 微信授权登录
  	uni.login({
  		provider: "weixin",
  		success: (res) => {
  			this.$showLog("微信授权登录成功", res, "登录界面");
  			jsCode = res.code;
  			console.log("jsCode",jsCode)
  		},
  		fail: (err) => {
  			this.$showErrorLog("微信授权登录失败", err, "登录界面");
  		}
  	});
  	// #endif
  }
};
</script>


<style lang="scss" scoped>
.message{
	width: 100%;
	border-top: 1px solid #eee;
	background: #F5F5F5;
}
.btn-box button {
	color: #ffffff;
	background: #1e90ff;
	border-style: none;
	padding: 10upx 0;
	font-size: 30upx;
	width: 70%;
	margin: auto;
	margin-top: 35%;
}
.tip{
	width: 70%;
	margin: auto;
	margin-top: 60upx;
	color: #666;
}
.message .ad-box{
	width: 100%;
	/* #ifndef MP-WEIXIN */
	height: 450upx;
	/* #endif */
	position: fixed;
	left: 0;
	bottom: 0;
	right: 0;
	text-align: center;
	color: #aaa;
}
</style>
	
