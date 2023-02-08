<template>
  <view class="body">
    <u-navbar :title="'报修申请'"></u-navbar>
    <view class="content">
      <u-form :border-bottom="false" label-width="150upx" :model="form" ref="uForm">
        <!-- 报修信息 start -->
        <view class="form-item_box">
          <view class="form-item_box_head">
            <span class="form-item_box_head_text">报修信息</span>
          </view>
          <view class="form-item_box_body">
            <u-form-item required class="form-item" prop="roomName" :border-bottom="false" label="房间号">
              <u-input type="select" @click="roomIdSelect = true" placeholder="请选择房间号" v-model="form.roomName" />
            </u-form-item>
            <u-form-item required class="form-item" prop="repairer" :border-bottom="false" label="联系人">
              <u-input placeholder="请输入联系人" v-model="form.repairer" />
            </u-form-item>
            <u-form-item required class="form-item" prop="phone" :border-bottom="false" label="联系电话">
              <u-input placeholder="请输入联系电话" v-model="form.phone" />
            </u-form-item>
            <u-form-item required class="form-item" prop="classificationName" :border-bottom="false" label="报修类型">
              <u-input
                type="select"
                @click="repairTypeSelect = true"
                placeholder="请选择报修类型"
                v-model="form.classificationName"
              />
            </u-form-item>
          </view>
        </view>
        <!-- 报修信息 end -->
        <!-- 报修问题 start -->
        <view class="form-item_box">
          <view class="form-item_box_head">
            <span class="form-item_box_head_text">报修问题</span>
          </view>
          <view class="form-item_box_body">
            <u-form-item label-position="top" :border-bottom="false" label=" ">
              <my-textarea :value.sync="form.remark" :maxlength="100" :placeholder="'请输入报修问题'"></my-textarea>
            </u-form-item>
          </view>
        </view>
        <!-- 报修问题 end -->
        <!-- 现场照片 start -->
        <view class="form-item_box">
          <view class="form-item_box_head">
            <span class="form-item_box_head_text">现场照片</span>
          </view>
          <view class="form-item_box_body">
            <u-form-item label-position="top" prop="" :label-style="labelStyle" :border-bottom="false" label=" ">
              <u-upload
                width="181"
                height="181"
                :max-size="1 * 1024 * 1024"
                class="upload"
                max-count="3"
                :custom-btn="true"
                :file-list="form.livePhoto"
                upload-text=""
                ref="uUpload"
                :action="action"
                @on-list-change="listChange"
                @on-success="uploadSuccess"
                :auto-upload="true"
              >
                <view slot="addBtn">
                  <u-image
                    src="https://file.yuanzhoulvwego.com/prod/uploadFiles/home/repairs/shangchuangtupian.png"
                    width="181"
                    height="181"
                  ></u-image>
                </view>
              </u-upload>
            </u-form-item>
          </view>
        </view>
        <!-- 现场照片 end -->
      </u-form>
    </view>
    <view class="btn_box">
      <u-button class="btn_box_button" @click="onSubmit" type="primary" shape="circle"> 提交 </u-button>
    </view>
    <!-- 房间号选择 -->
    <u-select
      @confirm="confirm"
      value-name="id"
      label-name="name"
      mode="mutil-column-auto"
      v-model="roomIdSelect"
      :list="roomIdSelectList"
    >
    </u-select>
    <!-- 报修类型选择 -->
    <u-select
      @confirm="confirm"
      value-name="id"
      label-name="name"
      v-model="repairTypeSelect"
      :list="repairTypeSelectList"
    >
    </u-select>
    <!-- 成功框 -->
    <u-modal
      v-model="showModel"
      title=""
      confirm-text="我知道了"
      :content-style="{ textAlign: 'center' }"
      @confirm="knowConfirm"
    >
      <view class="slot-content">
        <u-image
          class="model-image"
          width="125upx"
          height="125upx"
          shape="circle"
          :src="'https://file.yuanzhoulvwego.com/prod/uploadFiles/home/employeeManagement/tijiao.png'"
        >
          <u-loading slot="loading"></u-loading>
          <view slot="error" style="font-size: 24upx">加载失败</view>
        </u-image>
        <view style="font-size: 34upx; margin: 22upx 0 42upx">信息提交成功</view>
      </view>
    </u-modal>
    <u-toast ref="uToast" />
  </view>
</template>

<script>
import myTextarea from "@/sub-package2/components/my-textarea/my-textarea.vue"
export default {
  components: {
    myTextarea,
  },
  data() {
    return {
      // 当前园区id
      zoneId: uni.getStorageSync("zoneInfo").zoneId,
      // 当前租户id
      enterpriseId: uni.getStorageSync("userInfo").enterpriseId,
      // 当前用户id
      userId: uni.getStorageSync("userInfo").id,
      // 选择房间
      roomIdSelect: false,
      // 选择报修类型
      repairTypeSelect: false,
      // 显示成功提示
      showModel: false,
      // 表单
      form: {},
      // 房间列表
      roomIdSelectList: [],
      // 报修类型列表
      repairTypeSelectList: [],
      // 图片上传的标题样式
      labelStyle: {
        fontSize: "34upx",
        fontWeight: "bold",
        color: "#333333",
      },
      // 图片上传接口
      action: "/image/web/add",
      // 规则
      rules: {
        roomName: [{ required: true, message: "请选择房间号", trigger: ["change"] }],
        repairer: [{ required: true, message: "请输入联系人", trigger: ["blur"] }],
        phone: [
          {
            // 自定义验证函数
            validator: (rule, value, callback) => {
              //返回true表示校验通过，返回false表示不通过
              if (this.$u.test.isEmpty(value)) {
                callback(new Error("请输入手机号码"))
              } else if (!this.$u.test.mobile(value)) {
                callback(new Error("请输入正确的手机号码"))
              } else {
                return true
              }
            },
            // 触发器可以同时用blur和change
            trigger: ["blur"],
          },
        ],
        classificationName: [{ required: true, message: "请选择报修类型", trigger: ["change"] }],
      },
    }
  },
  onReady() {
    this.$refs.uForm.setRules(this.rules)
  },
  onLoad() {
    this.getRoomListByEnterpriseId()
    this.getAllMaintainClassifyList()
  },
  methods: {
    // 获取企业下的房间， 用于选择房间号
    getRoomListByEnterpriseId() {
      let params = {
        enterpriseId: this.enterpriseId,
        zoneId: this.zoneId,
      }
      this.$api("employeeManagement.getRoomListBySelf", params, false).then((res) => {
        if (res.code == 200) {
          let arr = res.data.filter((val) => {
            if (val.children.length > 0) {
              val.children = val.children.filter((vals) => {
                if (vals.children.length > 0) {
                  return vals
                }
              })
              if (val.children.length > 0) {
                return val
              }
            }
          })
          this.roomIdSelectList = arr
        }
      })
    },
    // 获取维修分类列表
    getAllMaintainClassifyList() {
      let params = { zoneId: this.zoneId }
      this.$api("repairs.getAllMaintainClassifyList", params, false).then((res) => {
        if (res.code == 200) {
          this.repairTypeSelectList = res.data
        }
      })
    },
    // 下拉框选择之后，数据赋值
    confirm(e) {
      // 选择的是房间
      if (this.roomIdSelect) {
        this.form.roomName = e[0].label + "/" + e[1].label + "/" + e[2].label
        this.form.roomId = e[2].value
      }
      // 选择的是报修类型
      if (this.repairTypeSelect) {
        this.form.classificationName = e[0].label
        this.form.classificationId = e[0].value
      }
    },
    // 图片列表改变
    listChange(lists, name) {
      this.form.livePhoto = lists
    },
    // 图片上传成功
    uploadSuccess(data, index, lists, name) {
      if (data.code == 200) {
        this.form.livePhoto = lists
      }
    },
    // 提交按钮
    onSubmit() {
      this.$refs.uForm.validate((valid) => {
        if (valid) {
          if (this.form.remark) {
            let params = this.$u.deepClone(this.form)
            if (params.livePhoto && params.livePhoto.length > 0) {
              let images = params.livePhoto.map((item) => {
                if (!this.$u.test.isEmpty(item.response)) {
                  return item.response.data
                } else {
                  return item.url
                }
              })
              params.livePhoto = images.join(",")
            }
            params.enterpriseId = this.enterpriseId
            params.userId = this.userId
            this.$api("repairs.addMaintenanceInfo", params, false).then((res) => {
              if (res.code === 200) {
                this.showModel = true
              } else {
                this.$refs.uToast.show({
                  title: res.msg,
                  type: "error",
                })
              }
            })
          } else {
            this.$refs.uToast.show({
              title: "请填写报修问题",
              type: "error",
            })
          }
        }
      })
    },
    // 提交后的弹窗 确认按钮 新增，表单重置
    knowConfirm() {
      this.form = {}
      this.showModel = false
      uni.navigateBack()
    },
  },
}
</script>

<style>
page {
  background: #f9f9f9;
}
</style>
<style lang="scss" scoped>
.body {
  .content {
    padding-bottom: 118upx;
    .form-item_box {
      margin-top: 20upx;
      padding: 40upx 36upx 20upx 30upx;
      background-color: #ffffff;
      border-radius: 15upx;
      .form-item_box_head {
        height: 34upx;
        border-left: 10upx solid #3e76f4;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .form-item_box_head_text {
          font-size: 34upx;
          margin-left: 6upx;
        }
      }
      .form-item_box_body {
        margin-left: 16upx;
        .form-item {
          position: relative;

          &:before {
            content: "";
            position: absolute;
            bottom: 0;
            right: 40upx;
            height: 2upx;
            width: calc(100% - 180upx);
            background-color: #dddddd;
          }
        }
      }
    }
    .upload {
      padding: 15upx 0upx 15upx 15upx;
    }
  }
  .btn_box {
    height: 98upx;
    position: fixed;
    width: 100%;
    bottom: 0px;
    background-color: white;
    padding: 0 64upx;
    z-index: 99;
    .btn_box_button {
      position: relative;
      top: 50%;
      transform: translateY(-50%);
    }
  }
  .model-image {
    position: relative;
    left: 50%;
    transform: translate(-50%, 0px);
  }
}
</style>
