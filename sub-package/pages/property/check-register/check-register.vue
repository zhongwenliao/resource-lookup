<template>
  <view class="content check-register-content">
    <!-- 顶部标签栏 start -->
    <view class="top-tabbar">
      <view
        :class="['top-tabbar-item', index === 0 ? 'top-tabbar-item-selected' : 'top-barbar-item-no-selected']"
        @click="
          () => {
            index = 0
          }
        "
        >全部</view
      >
      <view
        :class="['top-tabbar-item', index === 1 ? 'top-tabbar-item-selected' : 'top-barbar-item-no-selected']"
        @click="
          () => {
            index = 1
          }
        "
        >未处理</view
      >
      <view
        :class="['top-tabbar-item', index === 2 ? 'top-tabbar-item-selected' : 'top-barbar-item-no-selected']"
        @click="
          () => {
            index = 2
          }
        "
        >已处理</view
      >
    </view>
    <!-- 顶部标签栏 end -->

    <swiper
      :style="[{ height: windowHeight + 'px', paddTop: '10upx' }]"
      :duration="500"
      :current="index"
      :data-index="index"
      @change="toggle"
    >
      <swiper-item>
        <!-- 按顺序对应第一个的内容 -->
        <scroll-view lower-threshold="100" scroll-y style="height: 100%; width: 100%">
          <ul style="margin-left: 0; padding-left: 0; padding-top: 15upx">
            <li
              style="
                width: 100%;
                height: 110upx;
                line-height: 40upx;
                position: relative;
                text-align: left;
                background: #ffffff;
                border-bottom: 2upx solid rgb(215, 215, 215);
                border-radius: 20upx 20upx 0 0;
                padding-top: 20upx;
              "
              @click="jumpToCheckDetailPage(0)"
            >
              <!-- <image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/u11.png"> -->
              <image
                src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/wait-check.png"
                mode="aspectFit"
                style="width: 80upx; height: 80upx; margin-left: 50upx"
              />
              <view style="display: inline-block; margin-left: 30upx">
                <text>丽水小区</text><br />
                <text>11栋2单元</text>
              </view>
              <view style="display: inline-block; margin-left: 50upx"><text>上报时间: 2021/04/13 12:25</text></view>
              <view
                style="
                  position: absolute;
                  top: 20upx;
                  right: 50upx;
                  width: 100upx;
                  height: 50upx;
                  background: rgb(196, 203, 213);
                  color: #ffffff;
                  line-height: 50upx;
                  text-align: center;
                  border-radius: 20upx;
                "
                >去处理</view
              >
            </li>

            <li
              style="
                width: 100%;
                height: 110upx;
                line-height: 40upx;
                position: relative;
                text-align: left;
                background: #ffffff;
                padding-top: 20upx;
              "
              @click="jumpToCheckDetailPage(1)"
            >
              <!-- <image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/u11.png"> -->
              <image
                src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/check.png"
                mode="aspectFit"
                style="width: 80upx; height: 80upx; margin-left: 50upx"
              />
              <view style="display: inline-block; margin-left: 30upx">
                <text>丽水小区</text><br />
                <text>11栋2单元</text>
              </view>
              <view style="display: inline-block; margin-left: 50upx"><text>上报时间: 2021/05/13 12:25</text></view>
              <view
                style="
                  position: absolute;
                  top: 20upx;
                  right: 50upx;
                  width: 100upx;
                  height: 50upx;
                  background: rgb(75, 121, 2);
                  color: #ffffff;
                  line-height: 50upx;
                  text-align: center;
                  border-radius: 20upx;
                "
                >已处理</view
              >
            </li>
          </ul>
        </scroll-view>
      </swiper-item>
      <swiper-item>
        <scroll-view lower-threshold="100" scroll-y style="height: 100%; width: 100%">
          <ul style="margin-left: 0; padding-left: 0; padding-top: 15upx">
            <li
              style="
                width: 100%;
                height: 110upx;
                line-height: 40upx;
                position: relative;
                text-align: left;
                background: #ffffff;
                border-bottom: 2upx solid rgb(215, 215, 215);
                border-radius: 20upx 20upx 0 0;
                padding-top: 20upx;
              "
              @click="jumpToCheckDetailPage(0)"
            >
              <!-- <image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/u11.png"> -->
              <image
                src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/wait-check.png"
                mode="aspectFit"
                style="width: 80upx; height: 80upx; margin-left: 50upx"
              />
              <view style="display: inline-block; margin-left: 30upx">
                <text>丽水小区</text><br />
                <text>11栋2单元</text>
              </view>
              <view style="display: inline-block; margin-left: 50upx"><text>上报时间: 2021/04/13 12:25</text></view>
              <view
                style="
                  position: absolute;
                  top: 20upx;
                  right: 50upx;
                  width: 100upx;
                  height: 50upx;
                  background: rgb(196, 203, 213);
                  color: #ffffff;
                  line-height: 50upx;
                  text-align: center;
                  border-radius: 20upx;
                "
                >去处理</view
              >
            </li>
          </ul>
        </scroll-view>
      </swiper-item>

      <swiper-item>
        <scroll-view lower-threshold="100" scroll-y style="height: 100%; width: 100%">
          <ul style="margin-left: 0; padding-left: 0; padding-top: 15upx">
            <li
              style="
                width: 100%;
                height: 110upx;
                line-height: 40upx;
                position: relative;
                text-align: left;
                background: #ffffff;
                padding-top: 20upx;
              "
              @click="jumpToCheckDetailPage(1)"
            >
              <!-- <image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/u11.png"> -->
              <image
                src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/check.png"
                mode="aspectFit"
                style="width: 80upx; height: 80upx; margin-left: 50upx"
              />
              <view style="display: inline-block; margin-left: 30upx">
                <text>丽水小区</text><br />
                <text>11栋2单元</text>
              </view>
              <view style="display: inline-block; margin-left: 50upx"><text>上报时间: 2021/05/13 12:25</text></view>
              <view
                style="
                  position: absolute;
                  top: 20upx;
                  right: 50upx;
                  width: 100upx;
                  height: 50upx;
                  background: rgb(75, 121, 2);
                  color: #ffffff;
                  line-height: 50upx;
                  text-align: center;
                  border-radius: 20upx;
                "
                >已处理</view
              >
            </li>
          </ul>
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
export default {
  // 只要上面的选项跟下面的swiper-item个数相同，直接加上面的个数，下面的会自动对应显示，很简便，拿来就能用
  data() {
    return {
      // 当前item位置
      index: 0,
    }
  },

  onLoad() {
    uni.getSystemInfo({
      success: (res) => {
        // console.log('手机屏幕高度',res.windowHeight)
        let windowHeight = res.windowHeight
        this.windowHeight = windowHeight - 40
      },
    })
  },

  methods: {
    // 切换触发的事件
    toggle(e) {
      this.index = e.detail.current
      console.log("index", this.index)
    },

    // 跳转到核查详情
    jumpToCheckDetailPage(status) {
      uni.navigateTo({
        url: "../check-detail/check-detail?status=" + status,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.check-register-content {
  width: 100%;
  padding-top: 10upx;

  .top-tabbar {
    width: 100%;
    over-flow: hidden;
    margin-left: 8upx;
    .top-tabbar-item {
      width: 25%;
      height: 80upx;
      display: inline-block;
      text-align: center;
      line-height: 80upx;
      margin-right: 20upx;
      border-radius: 20upx;
      color: #ffffff;
    }

    .top-tabbar-item-selected {
      background: rgb(22, 155, 213);
    }

    .top-barbar-item-no-selected {
      background: rgb(215, 215, 215);
    }
  }
}

swiper-item {
  width: 100%;
  overflow: hidden;
  text-align: center;
  line-height: 300rpx;
  /* background-color: red; */
}
.swiper-item {
  overflow-y: scroll;
  width: 99.5%;
  height: 99%;
  /* background-color: white; */
  /* height: 99%; */
  box-sizing: border-box;
  padding: 1rpx;
}
.search-box {
  width: 100%;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(245, 245, 245, 1);
  border-radius: 30rpx;
  .search {
    width: 88%;
    text-align: center;
    font-size: 28rpx;
  }

  .cuIcon-roundclosefill {
    color: #d5a65a;
    padding: 0 10rpx;
  }
}
</style>
