<template>
  <page class="body">
    <z-paging :auto="false" ref="paging" v-model="dataList" @query="getInfo">
      <view slot="top" class="tops">
        <view class="top-top" :style="topBackground">
          <u-navbar title=" " :border-bottom="false" back-icon-color="#ffffff" :background="navbarBackground">
          </u-navbar>
          <view class="top-top-title">{{ companyName }}</view>
          <view class="top-profile-photo">
            <u-image width="143upx" height="143upx" shape="circle" :src="corporateLogo ? corporateLogo : bannerImage">
              <u-loading slot="loading"></u-loading>
              <view slot="error" style="font-size: 24upx">加载失败</view>
            </u-image>
          </view>
        </view>
      </view>
      <view class="content">
        <u-cell-group :border="false">
          <view v-for="(item, index) in dataList" :key="index">
            <u-cell-item :arrow="true" @click="toStaffList(item)">
              <u-image
                slot="icon"
                width="88upx"
                height="88upx"
                shape="circle"
                :src="
                  item.avaer
                    ? item.avaer
                    : 'https://file.yuanzhoulvwego.com/prod/uploadFiles/home/employeeManagement/bumen.png'
                "
              >
                <u-loading slot="loading"></u-loading>
                <view slot="error" style="font-size: 24upx">加载失败</view>
              </u-image>
              <text slot="title" class="content-title">{{ item.roleName + " " + ` (${item.count})` }}</text>
            </u-cell-item>
          </view>
        </u-cell-group>
      </view>
      <view slot="bottom" class="bottoms">
        <view class="bottoms-button" @click="addDepartment">添加部门</view>
        <!-- </u-col> -->
        <view class="bottoms-text"></view>
        <view class="bottoms-button" @click="addStaff">添加人员</view>
        <!-- </u-row> -->
      </view>
    </z-paging>
  </page>
</template>

<script>
export default {
  data() {
    return {
      // 当前园区id
      zoneId: uni.getStorageSync("zoneInfo").zoneId,
      // 当前园区主图
      bannerImage: uni.getStorageSync("zoneInfo").logo,
      // 当前租户id
      enterpriseId: uni.getStorageSync("userInfo").enterpriseId,
      // 公司名
      companyName: uni.getStorageSync("userInfo").companyName,
      // 公司logo
      corporateLogo: "",
      // 导航栏的背景图
      topBackground: {
        backgroundImage:
          "url(" + "https://file.yuanzhoulvwego.com/prod/uploadFiles/home/employeeManagement/beijintu.png" + ")",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      },
      // 导航栏的背景颜色不赋予颜色
      navbarBackground: {
        backgroundColor: "",
      },
      // 列表
      dataList: [],
      // 弹窗标题样式
      titleStyle: {
        fontSize: "36upx",
        fontWeight: "bold",
        color: "#333333",
      },
      // 弹窗内容样式
      contentStyle: {
        textAlign: "center",
        margin: "30upx",
      },
      // 部门名称
      departName: "",
    }
  },
  onShow() {
    this.$nextTick(() => {
      this.$refs.paging.reload()
    })
  },
  onLoad() {
    this.getContractInfo()
  },
  methods: {
    getContractInfo() {
      let that = this
      const params = {
        enterpriseId: that.enterpriseId,
      }
      that
        .$api("contract.getAllContractList", params)
        .then((res) => {
          if (res.code == 200) {
            if (res.data.length > 0) this.corporateLogo = res.data[0].enterpriseInfo.corporateLogo
            else this.corporateLogo = ""
          }
        })
        .catch((e) => {})
    },
    getInfo(pageNo, pageSize) {
      let that = this
      const params = {
        ascs: "id",
        currPage: pageNo,
        pageSize: pageSize,
        enterpriseId: that.enterpriseId,
        zoneId: that.zoneId,
      }
      that
        .$api("employeeManagement.departmentList", params)
        .then((res) => {
          if (res.code == 200) {
            if (pageNo == 1 && res.data.list.length > 0) {
              res.data.list[0].avaer =
                "https://file.yuanzhoulvwego.com/prod/uploadFiles/home/employeeManagement/woren.png"
              res.data.list[1].avaer =
                "https://file.yuanzhoulvwego.com/prod/uploadFiles/home/employeeManagement/woren.png"
            }
            // res.data.list.unshift({ avaer: 'https://file.yuanzhoulvwego.com/prod/uploadFiles/home/employeeManagement/woren.png', roleName: '默认' })
            that.$refs.paging.complete(res.data.list)
          } else {
            that.$refs.paging.complete(false)
          }
        })
        .catch((e) => {
          that.$refs.paging.complete(false)
        })
    },
    // 跳转到人员列表
    toStaffList(item) {
      this.$Router.push({
        path: "/sub-package2/pages/home/employeeManagement/personnelList",
        query: item,
      })
    },
    // 添加部门
    addDepartment() {
      this.$Router.push({
        path: "/sub-package2/pages/home/employeeManagement/departmentDetails",
      })
    },
    // 添加人员
    addStaff() {
      this.$Router.push({
        path: "/sub-package2/pages/home/employeeManagement/newStaff",
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.body {
  .tops {
    height: 330upx;

    .top-top {
      height: 230upx;
      position: relative;
      background-image: url("https://file.yuanzhoulvwego.com/prod/uploadFiles/home/employeeManagement/beijintu.png");
      background-size: 100% 100%;
      background-repeat: no-repeat;
      .top-top-title {
        text-align: center;
        color: #ffffff;
        font-size: 40upx;
        position: absolute;
        top: 80upx;
        left: 50%;
        transform: translateX(-50%);
      }
      .top-profile-photo {
        width: 146upx;
        height: 146upx;
        border-radius: 50%;
        border: 2upx solid #ffffff;
        position: absolute;
        top: 158upx;
        left: 50%;
        transform: translateX(-50%);
        background-image: url("https://file.yuanzhoulvwego.com/prod/uploadFiles/images/2023-01-28/1674893658286_199412.png");
        background-size: 100% 100%;
        background-repeat: no-repeat;
      }
    }
  }

  .content {
    padding-left: 20upx;
    padding-right: 20upx;

    .content-title {
      margin-left: 21upx;
      font-size: 32upx;
      font-weight: bold;
      color: #333333;
    }
  }

  .bottoms {
    height: 98upx;
    background: #3e76f4;
    font-weight: bold;

    .bottoms-button {
      width: 49%;
      height: 98upx;
      line-height: 98upx;
      float: left;
      color: #fff;
      text-align: center;
      cursor: pointer;
    }

    .bottoms-text {
      width: 2upx;
      height: 56upx;
      margin-top: 20upx;
      float: left;
      background-color: #fff;
    }
  }
}
</style>
