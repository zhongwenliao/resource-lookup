<template>
  <view class="content">
    <view class="bg-box">
      <view class="bg">
        <u-navbar
          :is-back="false"
          :immersive="false"
          back-icon-color="#fff"
          title-color="#fff"
          :background="{ backgroundImage }"
          title=" "
          :border-bottom="false"
        >
          <view class="navbar-content u-m-l-38">
            <view @click="selectZone" class="u-flex u-font-lg2 u-text-color-fff">
              <u-icon
                class="u-m-r-18"
                color="#fff"
                name="https://file.yuanzhoulvwego.com/prod/uploadFiles/dingwei.png"
                size="30"
              >
              </u-icon>
              <text>
                {{ zoneName ? zoneName : "暂未绑定园区" }}
              </text>
            </view>
          </view>
          <view slot="right" @click="ScanCode">
            <u-icon color="#fff" name="scan" size="44"> </u-icon>
          </view>
        </u-navbar>
      </view>
      <view style="margin-top: -240upx">
        <view class="userImage">
          <u-swiper
            bg-color="linear-gradient(#709BFB, #7CA3FB)"
            border-radius="20"
            height="360"
            :list="bannerList"
            :name="'imagePath'"
          >
          </u-swiper>
        </view>
      </view>
    </view>
    <view class="grid u-m-t-30">
      <u-grid class="grid-box" :col="5" :border="false">
        <u-grid-item
          v-if="$permission([item.permission]) || !item.permission"
          @click="goPage(item)"
          v-for="(item, index) of gridList"
          :key="index"
        >
          <u-badge :count="item.count" :offset="[20, 30]"></u-badge>
          <view style="height: 60upx; display: flex; align-items: center" class="">
            <u-icon :width="item.width" :height="item.height" :name="item.imgUrl"></u-icon>
          </view>
          <view class="grid-text">{{ item.title }}</view>
        </u-grid-item>
        <u-grid-item v-if="moreStates">
          <view
            @click="goPage({ url: '/sub-package2/pages/home/operationList/index' })"
            style="height: 60upx; display: flex; align-items: center; font-size: 16px; color: #666666"
          >
            更多<u-icon name="arrow-right"></u-icon>
          </view>
        </u-grid-item>
      </u-grid>
    </view>
    <!-- 通知 -->
    <view v-if="zoneName" class="notice">
      <u-card :foot-border-top="false" :head-border-bottom="false" :border="true">
        <u-cell-group class="head_group" :border="false" slot="head">
          <u-cell-item
            @click="goPage({ url: '/sub-package2/pages/home/notice/index' })"
            hover-class="none"
            :border-bottom="false"
            icon="volume-fill"
            title="园区通知"
            value="更多"
          >
          </u-cell-item>
        </u-cell-group>
        <u-cell-group class="content-notice" :border="false" slot="body">
          <block v-if="noticeList.length > 0">
            <u-cell-item
              :title-style="{ fontSize: '32upx' }"
              v-for="(item, index) in noticeList"
              :key="index"
              @click="goNoticeList(item.id)"
              :border-bottom="false"
              :title="item.title"
              value=""
            >
              <view slot="icon" :style="{ backgroundColor: noticeColor(index) }" class="yuan"> </view>
            </u-cell-item>
          </block>
          <view v-else class="u-text-center u-p-b-30" style=""> 暂无通知信息 </view>
        </u-cell-group>
      </u-card>
    </view>

    <!-- 招商信息 -->
    <view class="notice">
      <u-card :foot-border-top="false" :head-border-bottom="false" :border="true">
        <u-cell-group class="head_group" :border="false" slot="head">
          <u-cell-item
            @click="goPage({ url: '/sub-package2/pages/home/merchants/index' })"
            hover-class="none"
            :border-bottom="false"
            title="招商信息"
            value="更多"
          >
            <u-icon
              margin-left="10"
              label="  "
              size="30"
              slot="icon"
              name="https://file.yuanzhoulvwego.com/prod/uploadFiles/zhaoshangxinxi.png"
            >
            </u-icon>
          </u-cell-item>
          <u-gap height="1" class="u-m-l-20 u-m-r-20 u-m-b-20" bg-color="#F1F2F3"></u-gap>
        </u-cell-group>

        <view class="u-p-10 u-p-b-30" slot="body">
          <block v-if="merchantsList.length > 0">
            <view v-for="(item, index) in merchantsList" :key="index" @click="goMerchantsDetails(item)">
              <view class="card-box" style="display: flex">
                <view class="card-box-left">
                  <u-image width="250" height="210" :src="item.images[0]"></u-image>
                </view>
                <view class="card-box-right u-m-l-14" style="width: 100%">
                  <view class="u-font-lg u-main-color u-line-2 u-m-b-15" style="width: 100%">
                    {{ item.investmentTitle }}
                  </view>
                  <view class="unitPrice u-flex u-m-b-15 u-font-xs2">
                    <view class="u-flex-1 u-line-1"> 管理费:{{ item.propertyCosts || 0 }}元/月 </view>
                    <view class="u-flex-1 u-line-1"> 月租金:{{ item.rentMonth || 0 }}元 </view>
                  </view>
                  <view class="type u-flex u-m-b-10">
                    <text class=""> 类型： </text>
                    <u-tag
                      v-for="(data, subIndex) in typeList"
                      class="u-m-l-4"
                      shape="circle"
                      :key="subIndex"
                      :color="item.roomType == data.value ? '#e35d5d' : '#999999'"
                      bg-color="#ffffff"
                      :border-color="item.roomType == data.value ? '#e35d5d' : '#999999'"
                      size="mini"
                      :text="data.label"
                      type="info"
                    />
                  </view>
                  <view class="u-type-price u-font-lg2 u-text-bold">
                    总价：{{ item.propertyCosts + item.rentMonth }} 元
                  </view>
                  <!-- 招商信息：当面积未0或者月租为0时，显示0
									<view v-if="item.area==0 || item.rentMonth==0" class="u-type-price u-font-lg2 u-text-bold">
										0元/m<sup>2</sup>
									</view>
									<view v-else class="u-type-price u-font-lg2 u-text-bold">
										{{ Math.round((item.rentMonth / item.area) * 100) / 100 || 0}}元/m<sup>2</sup>
									</view>-->
                </view>
              </view>
              <u-gap
                v-if="merchantsList.length != index + 1"
                height="1"
                class="u-m-l-20 u-m-r-20 u-m-t-30 u-m-b-30"
                bg-color="#F1F2F3"
              ></u-gap>
            </view>
          </block>

          <view v-else class="u-text-center" style=""> 暂无招商信息 </view>
        </view>
      </u-card>
    </view>

    <u-tabbar :list="tabbar.list" hide-tab-bar></u-tabbar>
  </view>
</template>

<script>
import tabbar from "@/config/tabBar"
export default {
  data() {
    return {
      tabbar,
      zoneId: uni.getStorageSync("userInfo").zoneId,
      zoneName: "",
      backgroundImage: "",
      title: "Hello",
      list: [
        {
          imagePath: "https://file.yuanzhoulvwego.com/prod/uploadFiles/banner1.png",
        },
      ],
      bannerList: [],
      typeList: [],
      noticeList: [],
      merchantsList: [],
      moreStates: false,
      gridList: [
        {
          id: 1,
          title: "招商信息",
          imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/zhaoshang.png",
          width: 68,
          height: 64,
          permission: "", //investmentInfo:selectInvestmentInfo
          url: "/sub-package2/pages/home/merchants/index",
          count: 0,
        },
        {
          id: 14,
          title: "停车缴费",
          imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/home/payParking/tingchefufei.png",
          url: "/sub-package2/pages/home/payParking/index",
          permission: "",
          // itemManagement:selectItemManagement
          width: 64,
          height: 66,
          count: 0,
        },
        {
          id: 3,
          title: "我的合同",
          imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/hetong.png",
          width: 66,
          height: 65,
          permission: "contractManagement:selectContractManagement",
          url: "/sub-package2/pages/home/contract/index",
          count: 0,
        },
        {
          id: 4,
          title: "账单缴费",
          imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/zhandan.png",
          width: 58,
          height: 66,
          permission: "billPay:selectBillPay",
          url: "/sub-package2/pages/home/billPay/index",
          count: 0,
        },
        {
          id: 5,
          title: "人员登记",
          imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/yuangongguanli.png",
          width: 58,
          height: 65,
          permission: "employeeManagement:selectEmployee",
          url: "/sub-package2/pages/home/employeeManagement/index",
          count: 0,
        },
        {
          id: 6,
          title: "申请报修",
          imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/baoxiu.png",
          width: 68,
          height: 65,
          permission: "zoneRepair:selectZoneRepair",
          url: "/sub-package2/pages/home/repairs/index",
          count: 0,
        },
        {
          id: 7,
          title: "会议室预约",
          imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/huiyishiyuyue.png",
          width: 68,
          height: 60,
          permission: "meetingRoomReservation",
          url: "/sub-package2/pages/home/meetingRoom/index",
          count: 0,
        },
        {
          id: 8,
          title: "手机开门",
          imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/menjin.png",
          width: 61,
          height: 65,
          permission: "accessControl:selectAccessControl",
          url: "/sub-package2/pages/home/entranceGuard/index",
          count: 0,
        },
        {
          id: 10,
          title: "投诉建议",
          imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/userComplaints/lianxiwuye.png",
          width: 64,
          height: 66,
          permission: "zoneComplaint:selectZoneComplaint",
          url: "/sub-package2/pages/home/userComplaints/index",
          count: 0,
        },
        {
          id: 11,
          title: "联系物业",
          imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/userComplaints/yonghutousu.png",
          width: 64,
          height: 66,
          permission: "",
          url: "/sub-package2/pages/home/contactProperty/index",
          count: 0,
        },
        {
          id: 12,
          title: "访客授权",
          imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/fangkeshouquan3.png",
          width: 64,
          height: 66,
          url: "/sub-package1/pages/vis/vis",
          permission: "visitorAuthorization:selectVisitor",
          count: 0,
        },
        {
          id: 13,
          title: "物品放行",
          imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/user-grid/wupingfangxing3.png",
          url: "/pages/user/propertyPass",
          permission: "itemManagement:selectItemManagement",
          width: 64,
          height: 66,
          count: 0,
        },
      ],
    }
  },
  computed: {
    noticeColor: function () {
      return function (index) {
        if (index == 0) {
          return "#DC6060"
        }
        if (index == 1) {
          return "#609ddc"
        }
        if (index == 2) {
          return "#dca660"
        }
      }
    },
  },
  onLoad() {
    this.queryData()
    this.gridListFind()
    this.cidAddOrUpdateCid()
  },
  onShow() {
    // #ifdef APP-PLUS
    plus.runtime.setBadgeNumber(0)
    // #endif
    this.zoneName = uni.getStorageSync("zoneInfo").name || ""
    if (this.zoneName) this.getNotice()
  },
  /*下拉刷新*/
  onPullDownRefresh: function () {
    this.queryData()
    this.cidAddOrUpdateCid()
    uni.stopPullDownRefresh() //得到数据后停止下拉刷新
  },

  onPageScroll(e) {
    this.pageScrollTop = Math.floor(e.scrollTop)
    if (this.pageScrollTop > 0) {
      this.backgroundImage = "linear-gradient(-25deg, #e0e6fd 0%, #ffffff 0%, #7EA4FB  0%, #709BFB 100%) !important"
    } else {
      this.backgroundImage = " "
    }
  },
  methods: {
    gridListFind() {
      let arr = []
      this.gridList.forEach((item) => {
        if (this.$permission([item.permission]) || !item.permission) {
          arr.push(item)
        }
      })
      this.gridList = arr.length >= 9 ? arr.slice(0, 9) : arr
      this.moreStates = this.gridList.length >= 9 ? true : false
    },
    //上传cid
    cidAddOrUpdateCid() {
      console.log(12344)
      let push_clientid = null
      let platform = uni.getSystemInfoSync().platform
      console.log(platform)
      uni.getPushClientId({
        success: (res) => {
          console.log(res)
          push_clientid = res.cid
          let param = {
            cid: push_clientid,
            systemType: platform === "android" ? 2 : 1,
          }
          this.$api("user.addOrUpdateCid", param)
            .then((res) => {
              console.log(res)
              if (res.code == 200) {
                console.log("cid")
              }
            })
            .catch((e) => {
              uni.hideLoading()
            })
          console.log("客户端推送标识:", push_clientid)
        },
        fail(err) {
          console.log(err)
        },
      })
    },
    queryData() {
      this.typeList = this.$enum.roomType.filter((item) => {
        return item.value != 2 && item.value != 3 && item.value != 6 && item.value != 7
      })
      if (uni.getStorageSync("zoneInfo").id) {
        console.log("拥有园区")
        this.getBanner()
        this.getDeviceList()
        this.getNotice()
      } else {
        this.bannerList = this.list
      }
      this.getMerchants()
      uni.$on("refreshData", () => {
        this.getBanner()
        this.getDeviceList()
        this.getNotice()
        this.getMerchants()
      })
    },
    ScanCode() {
      // 允许从相机和相册扫码
      uni.scanCode({
        success: function (res) {
          console.log("条码类型：" + res.scanType)
          console.log("条码内容：" + res.result)
        },
      })
    },
    goMerchantsDetails(res) {
      this.$Router.push({
        path: "/sub-package2/pages/home/merchants/detailsMerchants",
        query: res,
      })
    },
    selectZone() {
      // 游客身份，做切换园区
      if (this.zoneId < 1) {
        this.$Router.push({
          path: "/pages/index/selectZone",
          // query: {msg:'我要登录！'}
        })
      }
    },
    // 点击了宫格，然后进行路由跳转
    goPage(data) {
      this.$tools.routerTo(data.url, {}, data.isTabbar || null)
    },
    getBanner() {
      const params = {
        promotionScope: 2,
      }
      this.$api("user.getBanner", params).then((res) => {
        if (res.code == 200) {
          if (res.data.length) {
            let arr = res.data.sort((a, b) => {
              return a.sort - b.sort
            })
            this.bannerList = arr
          } else {
            this.bannerList = this.list
          }
        }
      })
    },
    // 招商信息
    getMerchants() {
      let params = {
        investmentStatus: 1, //已发布
        currPage: 1,
        pageSize: 3,
      }
      if (uni.getStorageSync("zoneInfo").id) params.zoneId = uni.getStorageSync("zoneInfo").id
      this.$api("merchants.merchantsList", params, false).then((res) => {
        if (res.code == 200) {
          this.merchantsList = res.data.list
        }
      })
    },
    goNoticeList(id) {
      this.$Router.push({
        path: "/sub-package2/pages/home/notice/noticeInfo",
        query: {
          id,
        },
      })
    },
    getNotice() {
      const params = {
        currPage: 1,
        pageSize: 3,
      }
      this.$api("notice.noticeList", params, false).then((res) => {
        if (res.code == 200) {
          this.noticeList = res.data.list
        } else {
          console.log(res.error)
        }
      })
    },
    // 根据园区id获取权限门禁设备列表
    getDeviceList() {
      let params = {
        currPage: 1,
      }
      this.$api("equipment.equipmentList", params, false).then((res) => {
        if (res.code == 200) {
          console.log("权限门禁设备列表", res.data)
          uni.setStorageSync("deviceList", res.data)
        }
      })
    },
  },
}
</script>
<style>
page {
  width: 100%;
  height: 100%;
  background: #f9f9f9;
}
</style>
<style lang="scss">
.notice {
  width: 100%;
  padding: 0 20upx;
  margin-top: 30upx;

  .yuan {
    width: 20upx;
    height: 20upx;
    border-radius: 50%;
    margin-right: 12upx;
  }

  /deep/ .u-card {
    margin: 0 !important;
    // border: 1upx solid #dddddd;

    &:after {
      border: 0;
    }

    .content-notice {
      .u-cell {
        padding: 15upx 0upx 15upx 20upx !important;
      }
    }

    .head_group {
      .u-cell {
        padding: 20upx 0upx 20upx 12upx;
      }

      .u-cell__left-icon-wrap {
        color: #70a4fd;
      }

      .u-icon--right {
        // color: #70A4FD;
        size: 29upx;
      }

      .u-cell_title {
        font-size: 34upx;
        font-weight: bold;
        color: #333333;
      }

      .u-cell__value {
        font-size: 30upx;
        color: #666666;
      }
    }

    .u-card__head {
      padding: 0 !important;
    }

    .u-card__body {
      padding: 0 !important;

      .u-cell {
        padding: 20upx;

        .u-cell_title {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          word-break: break-all;
        }
      }
    }
  }
}

/deep/ .u-indicator-item-round {
  background-color: #ffffff;
}

.grid-box {
  border-radius: 20upx;
  font-size: 26upx;
  color: $u-main-color;
  overflow: hidden;
  background-color: #ffffff;
}

.grid {
  width: 100%;
  padding: 0 20upx;
}

.userImage {
  margin: 0 20upx;
  background: linear-gradient(#709bfb, #7ca3fb);
  box-shadow: 0px 10upx 20upx 0px rgba(83, 134, 248, 0.3);
  border-radius: 20px;
}

.bg-box {
  width: 100%;
  overflow: hidden;
  // height: 600upx;//490upx;
}

.bg {
  width: 104%;
  position: relative;
  left: -2%;
  height: 400upx;
  border-radius: 0 0 64% 64% / 20%;
  background: linear-gradient(#709bfb, #adc5fa) !important;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: $uni-bg-color-grey;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
