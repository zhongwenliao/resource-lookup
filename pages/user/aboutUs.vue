<template>
  <view>
    <u-navbar title="关于我们"></u-navbar>
    <view class="logo-box">
      <u-avatar
        class="avatar"
        size="180"
        mode="square"
        src="https://file.yuanzhoulvwego.com/prod/uploadFiles/logo.jpg"></u-avatar>
      <text class="version">园区π {{ version }}</text>
    </view>
    <u-cell-group class="cell-group" :border="false">
      <u-cell-item @click="fuwu" :title-style="cellTitle" title="服务协议"></u-cell-item>
      <u-cell-item @click="yinsi" :title-style="cellTitle" title="隐私政策"></u-cell-item>
    </u-cell-group>
  </view>
</template>

<script>
export default {
  data() {
    return {
      cellTitle: {
        fontSize: "30upx",
        letterSpacing: "2upx",
        color: "#333333"
      },
      version: "1.1.182"
    };
  },
  onLoad() {},
  onShow() {
    this.getAPPinfo();
  },
  methods: {
    getAPPinfo() {
      // let that = this;
      // plus.runtime.getProperty(plus.runtime.appid, (wgtinfo) => {
      //   that.version = wgtinfo.version;
      // });
      // // #ifndef APP-PLUS
      // console.log(123456)
      // 	let obj = {}
      // 	plus.runtime.getProperty(plus.runtime.appid, (inf) => {
      // 	 obj = JSON.parse(inf)
      // 	 console.log(obj)
      // 		this.version = obj.version
      // 		console.log(JSON.parse(inf)); //res
      // 		console.log(obj.version)
      // 	});
      // 	// #endif
    },
    goUpdatePassword() {
      this.$Router.push({
        path: "/pages/user/updatePassword"
      });
    },
    fuwu() {
      this.$Router.push({
        path: "/pages/user/protocol"
      });
      // plus.runtime.openURL("https://mobile.doormaster.me/#/protocol?appName=youzhoulv");
    },
    yinsi() {
      this.$Router.push({
        path: "/pages/user/privacy"
      });
      // plus.runtime.openURL("https://mobile.doormaster.me/#/privacy?appName=yuanzhoulv");
    }
  }
  // onLoad() {
  // 	this.version = plus.runtime.version
  // }
};
</script>
<style>
page {
  background: #f1f2f3;
}
</style>
<style scoped lang="scss">
.logo-box {
  padding: 44upx 0;
  background: #ffffff;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .avatar {
    margin: 22upx 0;
  }

  .version {
    font-size: 24upx;
    color: $uni-text-color-prompt;
  }
}

.cell-group {
  margin-top: 20upx;
}
</style>
