<template>
  <view>
    <u-navbar title="设置"></u-navbar>
    <u-modal
      v-model="show"
      @confirm="clearStorage"
      content="清除缓存!"
      :show-cancel-button="true"
      ref="uModal"
      :async-close="true"
    ></u-modal>
    <u-modal
      v-model="showExitLogin"
      @confirm="exitLogin"
      content="是否退出登录!"
      :show-cancel-button="true"
      ref="uModal"
      :async-close="true"
    ></u-modal>

    <view class="">
      <u-cell-group class="cell-group" :border="false">
        <u-cell-item @click="goAccount" :title-style="cellTitle" title="账号与安全"></u-cell-item>
        <u-gap height="20" bg-color="#F1F2F3"></u-gap>

        <u-cell-item @click="show = true" :title-style="cellTitle" :arrow="false" title="清除缓存"></u-cell-item>
      </u-cell-group>
      <u-cell-group class="cell-group" :border="false">
        <u-cell-item @click="logOut" :title-style="cellTitle">
          <view slot="title" class="" style="position: relative"> 账号注销 </view>
        </u-cell-item>
      </u-cell-group>
      <u-cell-group class="cell-group cell-group-exitLogin" :border="false">
        <u-cell-item bg-color="#3E76F4" @click="showExitLogin = true" :title-style="exitLoginStyle" :arrow="false">
          <view class="exitLogin" slot="title"> 退出登录 </view>
        </u-cell-item>
      </u-cell-group>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      page: 0,
      showExitLogin: false,
      exitLoginStyle: {
        width: "100%",
      },
      cellTitle: {
        fontSize: "30upx",
        letterSpacing: "2upx",
      },
    }
  },
  methods: {
    logOut() {
      let that = this
      uni.showModal({
        title: "账号注销",
        content: "账号注销后将对您的账号停止服务",
        cancelText: "取消",
        confirmText: "确定",
        success: function (res) {
          if (res.confirm) {
            console.log("用户点击确定")
            let params = {
              type: 1,
            }
            that.$api("user.destroy", params).then((res) => {
              if (res.code == 200) {
                that.$Router.push({
                  path: "/pages/login/login",
                })
              }
            })
          } else if (res.cancel) {
            console.log("用户点击取消")
          }
        },
      })
    },
    clearStorage() {
      uni.clearStorageSync()
      console.log("用户点击确定")
      this.show = false
      this.$Router.replaceAll({
        path: "/pages/login/login",
      })
    },
    exitLogin() {
      uni.removeStorageSync("fromLogin")
      this.$api("user.logout")
        .then((res) => {
          console.log(res, "注销登录")
          this.$store.commit("OUT_LOGIN")
          this.$Router.replaceAll({
            path: "/pages/login/login",
          })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    goAccount() {
      this.$Router.push({
        path: "/pages/user/account",
      })
    },
  },
}
</script>
<style>
page {
  background: #f1f2f3;
}
</style>
<style scoped lang="scss">
.exitLogin {
  font-size: 32upx;
  color: #ffffff;
  font-weight: bold;
  letter-spacing: 2upx;
  text-align: center;
  width: 100vw !important;
}

.cell-group-exitLogin {
  position: absolute;
  bottom: 0;
}

.cell-group {
  margin-top: 20upx;
}
</style>
