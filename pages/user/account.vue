<template>
  <!-- 账号与安全 -->
  <view>
    <u-navbar title="帐号与安全"></u-navbar>
    <u-cell-group class="cell-group" :border="false">
      <u-cell-item
        @click="goUpdatePhone"
        :title-style="cellTitle"
        :value-style="cellTitle"
        title="手机号"
        :value="phone"></u-cell-item>
      <u-cell-item @click="goUpdatePassword" :title-style="cellTitle" title="修改密码"></u-cell-item>
    </u-cell-group>
  </view>
</template>

<script>
export default {
  data() {
    return {
      phone: uni.getStorageSync("userInfo").loginAccount,
      cellTitle: {
        fontSize: "30upx",
        letterSpacing: "2upx",
        color: "#333333"
      }
    };
  },
  methods: {
    goUpdatePassword() {
      this.$Router.push({
        path: "/pages/user/updatePassword"
      });
    },
    goUpdatePhone() {
      this.$Router.push({
        path: "/pages/user/updatePhone"
      });
    }
  }
};
</script>
<style>
page {
  background: #f1f2f3;
}
</style>
<style scoped lang="scss">
.cell-group {
  margin-top: 20upx;
}
</style>
