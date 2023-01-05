<template>
<view class="pay">
	<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/yes.png" mode=""></image>
	<view class="status">{{ appointment["appoint-success"] || "预约成功" }}</view>
	<view class="tip" style="color: #666;font-size: 15px;margin-top: 20px;">
		{{ appointment["service-notifications"] || "请留意微信里的服务通知！" }}
	</view>
</view>
</template>

<script>

export default {
  name: "logout",
  data() {
    return {
      
    };
  },
  computed: {
  	appointment() {
  		return this.$t("appointment");
  	}
  },
};
</script>


<style lang="scss" scoped>
.pay{
  width: 100%;
  text-align: center;
  border-top: 1px solid #eee;
}
.pay .wen{
	font-size: 36upx;
	color: #000;
	font-weight: bold;
	margin-top: 200upx;
}
.pay .money{
	font-size: 50upx;
	color: #D9001B;
	margin-top: 40upx;
}
.pay image{
	width: 200upx;
	height: 200upx;
	margin-top: 200upx;
}
.pay .status{
	font-size: 36upx;
	color: #000;
	margin-bottom: 20upx;
}
.pay .paybtn{
	width: 80%;
	height: 88upx;
	line-height: 88upx;
	background: linear-gradient(118deg, #01dca3 0%, #088b68 100%);
	box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
	border-radius: 50upx 50upx 50upx 50upx;
	color: #ffffff;
	margin-top: 100upx;
}
</style>
	
