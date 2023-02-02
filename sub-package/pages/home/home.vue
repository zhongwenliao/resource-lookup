<template>
  <view style="width: 100%">
    <uni-tab
      :tab-list="tabList"
      :tabCur.sync="tabCur"
      tab-class="opening-record-view-tab"
      textFlex
      @change="tabChange"
    ></uni-tab>
    <swiper
      :current="tabCur"
      class="swiper custom-swiper"
      @change="swiperChange"
      duration="300"
      :circular="true"
      indicator-color="rgba(255,255,255,0)"
      indicator-active-color="rgba(255,255,255,0)"
    >
      <!-- 智能 -->
      <swiper-item>
        <scroll-view scroll-y="true">
          <view class="img-view">
            <image src="http://www.thinmoo.com/wp-content/uploads/2019/12/home1.png" alt="" />
          </view>
          <view class="img-view">
            <image src="http://www.thinmoo.com/wp-content/uploads/2019/12/home2.png" alt="" />
          </view>
        </scroll-view>
      </swiper-item>
      <!-- 设备 -->
      <swiper-item>
        <scroll-view scroll-y="true">
          <view @click="goToScenario" class="dev-view">
            <view class="left-title">
              <view style="font-size: 34upx">{{ home["scenario"] || "应用场景" }}</view>
              <view>{{ home["applience"] || "AI智能设备，感受品质智能生活" }}</view>
            </view>
            <view class="right-icon">
              <image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/home-life/apply.png" alt=""
            /></view>
          </view>
        </scroll-view>
      </swiper-item>
      <!-- 我的 -->
      <swiper-item>
        <scroll-view scroll-y="true">
          <view class="no-data">
            <image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/home-life/no-smart.png" /><br />
            {{ home["no-smart-home"] || "未创建智能家居" }}
          </view>
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
export default {
  data() {
    return {
      tabCur: 0,
      eventList: null,
      tabList: [],
    }
  },
  computed: {
    home() {
      return this.$t("home")
    },
  },
  onLoad(options) {
    this.initData()
    this.tabList = [
      {
        name: this.home["smart"] || "智能",
      },
      {
        name: this.home["device"] || "设备",
      },
      {
        name: this.home["mine"] || "我的",
      },
    ]
  },
  onShow() {
    this.$showMallView()
  },
  methods: {
    //跳转到应用场景页面
    goToScenario() {
      uni.navigateTo({
        url: "apply-scenario",
      })
    },

    initData() {
      this.tabCur = 0
    },

    swiperChange(e) {
      console.log(e.detail.current)
      this.tabCur = e.detail.current
    },

    tabChange(index) {
      this.tabCur = index
    },
  },
  onHide() {
    this.$hideMallView()
  },
}
</script>

<style>
.custom-swiper {
  height: calc(100% - 50px);
  overflow: auto;
  width: 100%;
}

.content {
  padding: 0;
}

.opening-record-view-tab {
  background: #ffffff;
}

.home-view {
  /* #ifdef APP-PLUS || H5 */
  padding-top: 40upx;
  /* #endif */
}

.img-view {
  /* width: 100%; */
  /* height: 450upx; */
  padding: 20upx;
}

.img-view image {
  width: 100%;
  height: 400upx;
}

.dev-view {
  background: #ffffff;
  width: 92%;
  height: auto;
  margin: 20upx auto;
  border-radius: 10upx;
  padding: 40upx 16upx;
}

.left-title {
  display: inline-block;
  width: 70%;
  vertical-align: middle;
}

.right-icon {
  display: inline-block;
  width: 30%;
  text-align: center;
  vertical-align: middle;
}

.right-icon image {
  width: 80upx;
  height: 80upx;
}

.no-data {
  width: 100%;
  height: 400upx;
  text-align: center;
  margin-top: 50%;
}

.no-data image {
  width: 180upx;
  height: 140upx;
}
</style>
