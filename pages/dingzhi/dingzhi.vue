<template>
  <view class="custom">
      <view @touchend="index.touchend" @touchmove="index.touchmove" @touchstart="index.touchstart" style="width: 100%; height: 100%; position: relative">
          <view class="head">
              <image src="/static/img/phone.png" v-if="types != 2"></image>
              <view style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 43%" v-if="types != 2">
                  {{ types == 0 ? '手机壳' : '彩膜' }}：{{ phonetype.name }}
              </view>
              <view style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 45%" v-else>礼品：{{ phonetype.name }}</view>
              <view class="ge"></view>
              <view @tap="eidttype" class="edit">{{ types == 2 ? '换品种' : '换机型' }}》</view>
              <button @getuserinfo="bindGetUserInfo" openType="getUserInfo" v-if="canIUse">下一步</button>
              <button @tap="submitdata" v-else>下一步</button>
          </view>
          <view @tap="leftbtn" class="pm-top"></view>
          <view @tap="leftbtn" class="pm-left"></view>
          <view class="content" v-if="!cshow">
              <view class="fill-top" :style="'height:' + masktop + 'px'"></view>
              <view class="fill-l" :style="'height: ' + mheight + 'px;width:' + fillw + 'px'"></view>
              <view class="fill-r" :style="'height: ' + mheight + 'px;width:' + fillw + 'px'"></view>
              <view class="fill-b" :style="'height:' + fillh + 'px'">
                  <view class="types" v-if="!addshow">可用单指拖动 双指缩放</view>
              </view>
              <view class="mask" :style="'background-image:url(' + bg + ');width:' + mwidth + 'px;height: ' + mheight + 'px;top:' + masktop + 'px'"></view>
              <template v-for="(item, idx) in tk">
                <image
                  v-if="item.url"
                  :key="idx"
                  :class="'tk' + idx"
                  :data-h="item.pich"
                  :data-idx="idx"
                  :data-rotate="item.rotate"
                  :data-scale="item.scale"
                  data-types="tk"
                  :data-w="item.picw"
                  :data-windowheight="windowHeight"
                  :data-windowwidth="windowWidth"
                  :data-x="item.x"
                  :data-y="item.y"
                  :src="item.url"
                  :style="
                    'width: ' +
                    item.picw +
                    'px; height: ' +
                    item.pich +
                    'px;top:' +
                    item.y +
                    'px;left:' +
                    item.x +
                    'px;position: absolute;transform: translate(0, 0) scale(' +
                    item.scale +
                    ') rotate(' +
                    item.rotate +
                    'deg);transform-origin: center center;'
                  "
                ></image>
              </template>
              
              <template v-for="(item, idx) in pics">
                <image
                  v-if="item.url"
                  :key="idx"
                  @tap.stop.prevent="bindqie"
                  :class="'pics' + idx"
                  :data-h="item.pich"
                  :data-idx="idx"
                  :data-rotate="item.rotate"
                  :data-scale="item.scale"
                  data-types="pics"
                  :data-w="item.picw"
                  :data-windowheight="windowHeight"
                  :data-windowwidth="windowWidth"
                  :data-x="item.x"
                  :data-y="item.y"
                  :src="item.url"
                  :style="
                    'position:absolute;width: ' +
                    item.picw +
                    'px; height: ' +
                    item.pich +
                    'px;left: ' +
                    item.x +
                    'px; top: ' +
                    item.y +
                    'px; transform: translate(0, 0) scale(' +
                    item.scale +
                    ') rotate(' +
                    item.rotate +
                    'deg);transform-origin: center center;z-index:' +
                    item.zindex
                  "
              ></image>
              </template>
              <!-- 模板 -->
              <template v-for="(item, idx) in mb">
                <image
                  v-if="item.url"
                  :key="idx"
                  :class="'mb' + idx + ' mbimg'"
                  :data-h="item.pich"
                  :data-idx="idx"
                  :data-rotate="item.rotate"
                  :data-scale="item.scale"
                  data-types="mb"
                  :data-w="item.picw"
                  :data-windowheight="windowHeight"
                  :data-windowwidth="windowWidth"
                  :data-x="item.x"
                  :data-y="item.y"
                  :src="item.url"
                  :style="
                    'width: ' +
                    item.picw +
                    'px; height: ' +
                    item.pich +
                    'px;top:' +
                    item.y +
                    'px;left:' +
                    item.x +
                    'px;transform: translate(0, 0) scale(' +
                    item.scale +
                    ') rotate(' +
                    item.rotate +
                    'deg);transform-origin: center center;'
                  "
              ></image>
              </template>
              
              <!-- 图库 -->
              <template v-for="(item, idx) in tt">
                <image
                  v-if="item.url"
                  :key="idx"
                  @tap.stop.prevent="bindqie"
                  :class="'tt' + idx"
                  :data-h="item.pich"
                  :data-idx="idx"
                  :data-rotate="item.rotate"
                  :data-scale="item.scale"
                  data-types="tt"
                  :data-w="item.picw"
                  :data-windowheight="windowHeight"
                  :data-windowwidth="windowWidth"
                  :data-x="item.x"
                  :data-y="item.y"
                  :src="item.url"
                  :style="
                    'position:absolute;width: ' +
                    item.picw +
                    'px; height: ' +
                    item.pich +
                    'px;left: ' +
                    item.x +
                    'px; top: ' +
                    item.y +
                    'px; transform: translate(0, 0) scale(' +
                    item.scale +
                    ') rotate(' +
                    item.rotate +
                    'deg);transform-origin: center center;z-index:' +
                    item.zindex 
                  "
              ></image>
              </template>
              
              <!-- 文字绘制的图片 -->
              <template v-for="(item, idx) in textimgs">
                <image
                  v-if="item.url"
                  :key="idx"
                  @tap.stop.prevent="bindqie"
                  :class="'textimgs' + idx"
                  :data-h="item.pich"
                  :data-idx="idx"
                  :data-rotate="item.rotate"
                  :data-scale="item.scale"
                  data-types="textimgs"
                  :data-w="item.picw"
                  :data-windowheight="windowHeight"
                  :data-windowwidth="windowWidth"
                  :data-x="item.x"
                  :data-y="item.y"
                  :src="item.url"
                  :style="
                    'position:absolute;width: ' +
                    item.picw +
                    'px; height: ' +
                    item.pich +
                    'px;left: ' +
                    item.x +
                    'px; top: ' +
                    item.y +
                    'px; transform: translate(0, 0) scale(' +
                    item.scale +
                    ') rotate(' +
                    item.rotate +
                    'deg);transform-origin: center center;z-index:' +
                    item.zindex 
                  "
              ></image>
              </template>
              <!-- 添加图片按钮 -->
              <image @tap="addimg" class="addimg" v-if="!addimgshow" src="/static/img/img.png" :style="'bottom:' + addimgtop"></image>
          </view>
          <view @tap="leftbtn" class="pm-right"></view>
          <view @tap="leftbtn" class="pm-bottom"></view>
          <view @tap="printoo" class="print" v-if="!admin">
              <image src="/static/img/p.png"></image>
              <view>直接打印</view>
          </view>
          <view @tap="wenzibtn" class="wenzi">
              <image src="/static/img/text.png"></image>
              <view>文字输入</view>
          </view>
          <view class="add" v-if="!addshow">
              <view @tap="addimg" style="text-align: center">
                  <image class="addimgbtn" src="/static/img/add.png"></image>
                  <view>添加照片</view>
              </view>
              <scroll-view scrollX class="scroll-view_H" style="width: 80%">
                  <view @tap.stop.prevent="selcttext" class="li" :data-ind="idx" data-types="tk" v-if="item != undefind" v-for="(item, idx) in tk" :key="idx">
                      <view @tap="deltk" class="close">X</view>

                      <image class="imgcl" mode="aspectFit" :src="tk[idx].url"></image>

                      <image @tap="tkclock" class="clock" :data-ind="idx" :src="tk[idx].clock"></image>
                  </view>
                  <view @tap.stop.prevent="selcttext" class="li" :data-ind="idx" data-types="pics" v-if="item != undefind" v-for="(item, idx) in pics" :key="idx">
                      <view @tap="delpic" class="close" :data-idx="idx">X</view>

                      <image class="imgcl" mode="aspectFit" :src="item.url"></image>
                  </view>
                  <view @tap.stop.prevent="selcttext" class="li" :data-ind="idx" data-types="mb" v-if="item != undefind" v-for="(item, idx) in mb" :key="idx">
                      <view @tap="delmb" class="close">X</view>

                      <image class="imgcl" mode="aspectFit" :src="mb[idx].url"></image>

                      <image @tap="mbclock" class="clock" :data-ind="idx" :src="mb[idx].clock"></image>
                  </view>
                  <view @tap.stop.prevent="selcttext" class="li" :data-ind="idx" data-types="tt" v-if="item != undefind" v-for="(item, idx) in tt" :key="idx">
                      <view @tap.stop.prevent="deltt" class="close" :data-idx="idx">X</view>

                      <image class="imgcl" mode="aspectFit" :src="item.url"></image>
                  </view>
                  <view @tap.stop.prevent="selcttext" class="li" :data-ind="idx" data-types="textimgs" v-if="item != undefind" v-for="(item, idx) in textimgs" :key="idx">
                      <view @tap="deltextimgs" class="close" :data-idx="idx">X</view>

                      <image class="imgcl" mode="aspectFit" :src="item.url"></image>
                  </view>
              </scroll-view>
          </view>
          <view @tap="catchtxt" class="textedit" v-if="addshow">
              <view style="background: #fff; position: absolute; bottom: 0; width: 100%">
                  <scroll-view scrollX class="scroll-view_H" style="width: 100%">
                      <image
                          @tap.stop.prevent="selectfamily"
                          :class="'familyli ' + item.active"
                          :data-idx="idx"
                          mode="widthFix"
                          :src="item.val"
                          style="width: 20%"
                          v-for="(item, idx) in falimys"
                          :key="idx"
                      ></image>
                  </scroll-view>
                  <scroll-view scrollX class="scroll-view_H" style="width: 100%">
                      <view @tap.stop.prevent="selectcolor" :class="'colorbox ' + item.active" :data-idx="idx" v-for="(item, idx) in colors" :key="idx">
                          <view class="colorli" :style="'background-color:' + item.val"></view>
                      </view>
                  </scroll-view>
                  <input
                      @input="inputvalFun"
                      @tap.stop.prevent="inptch"
                      id="textval"
                      maxlength="12"
                      placeholder="请输入文字"
                      placeholderStyle="font-size:14px;"
                      style="font-size: 14px"
                      :value="inputval"
                  />
                  <view class="textbtns">
                      <view style="line-height: 30px">文字方向：</view>
                      <view @tap.stop.prevent="fxbtn" :class="'fx ' + fx[0].active" data-idx="0">{{ fx[0].name }}</view>
                      <view @tap.stop.prevent="fxbtn" :class="'fx ' + fx[1].active" data-idx="1">{{ fx[1].name }}</view>
                      <view @tap.stop.prevent="surebtn" class="surebtn">确认添加</view>
                  </view>
              </view>
          </view>
          <view
              class="picslist"
              :data-h="pk.h"
              :data-index="pk.index"
              :data-rotate="pk.rotate"
              :data-types="pk.types"
              :data-w="pk.w"
              :data-x="pk.x"
              :data-y="pk.y"
              :style="
                'width:' +
                pk.w +
                'px;height:' +
                pk.h +
                'px;left: ' +
                pk.x +
                'px; top: ' +
                pk.y +
                'px; transform: translate(0, 0) rotate(' +
                pk.rotate +
                'deg);transform-origin: center center;z-index:13;border:1px dashed #ff0000;'
              "
              v-if="!kshow"
          >
              <image @tap="delpkpic" class="del" :data-idx="pk.index" :data-types="pk.types" mode="widthFix" src="/static/img/del.png"></image>
              <image
                  @touchend.stop.prevent="index.kdtouchend"
                  @touchmove.stop.prevent="index.kdtouchmove"
                  @touchstart.stop.prevent="index.kdtouchstart"
                  class="kd1"
                  :data-idx="pk.index"
                  data-kn="kd1"
                  :data-types="pk.types"
                  mode="widthFix"
                  src="/static/img/r.png"
              ></image>
              <image
                  @touchend.stop.prevent="index.kdtouchend"
                  @touchmove.stop.prevent="index.kdtouchmove"
                  @touchstart.stop.prevent="index.kdtouchstart"
                  class="kd2"
                  :data-idx="pk.index"
                  data-kn="kd2"
                  :data-types="pk.types"
                  mode="widthFix"
                  src="/static/img/r.png"
              ></image>
              <image
                  @touchend.stop.prevent="index.kdtouchend"
                  @touchmove.stop.prevent="index.kdtouchmove"
                  @touchstart.stop.prevent="index.kdtouchstart"
                  class="xz"
                  :data-idx="pk.index"
                  data-kn="xz"
                  :data-types="pk.types"
                  mode="widthFix"
                  src="/static/img/xz.png"
              ></image>
              <image
                  @touchend.stop.prevent="index.kdtouchend"
                  @touchmove.stop.prevent="index.kdtouchmove"
                  @touchstart.stop.prevent="index.kdtouchstart"
                  class="kd"
                  :data-idx="pk.index"
                  data-kn="kd"
                  :data-types="pk.types"
                  mode="widthFix"
                  src="/static/img/kd.png"
              ></image>
          </view>
          <view style="height: 50px; width: 100%"></view>
      </view>
      <view class="footer">
          <navigator style="width: 33.33%" url="/pages/img/img?act=mb">
              <view class="foot-btn">
                  <image src="/static/img/t1.png"></image>
                  <view>蒙版</view>
              </view>
          </navigator>
          <navigator style="width: 33.33%" url="/pages/img/img?act=tk">
              <view class="foot-btn">
                  <image src="/static/img/tk1.png"></image>
                  <view>图库</view>
              </view>
          </navigator>
          <navigator style="width: 33.33%" url="/pages/img/img?act=tt">
              <view class="foot-btn">
                  <image src="/static/img/mb1.png"></image>
                  <view>贴图</view>
              </view>
          </navigator>
      </view>
      <canvas canvasId="textcanvas" :style="'width:' + textwidth + 'px;height:' + textheight + 'px; '"></canvas>
      <canvas canvasId="mycanvas" :disableScroll="true" :style="'width: ' + imgw + 'px; height: ' + imgh + 'px; '"></canvas>
      <canvas canvasId="attendCanvasId" :style="'width:' + imageSize.imageWidth + 'px; height:' + imageSize.imageHeight + 'px;'"></canvas>
  </view>
</template>
<!-- <script src="./index.js"></script> -->
<script module="index" lang="wxs" src="./index.wxs"></script>

<script>
var t = (function (t) {
  return t && t.__esModule ? t : { default: t};
})(require('../../utils/util.js'));
// var app = getApp();
var app = {
  globalData: {
    shop: {
      nickname: "随意写的用户名",
    },
    shop_id: 1,
    host: "https://30diy.cn",
    types: '0',
    openid: "0932wF100b3gTO1N8J000iCaOS32wF1Y",
    imgurl: "",
    userInfo: "",
  },
}
var e;
var i = '';
var s = '';
var c = 'SimHei';
var o = 'rgb(0,0,0)';
var d = '';
var n = false;
// import  { touchmove, touchend, touchstart, kdtouchstart, kdtouchmove, kdtouchend } from './index'

export default {
  data() {
      return {
        // 原小程序哪里是
          types: '1',
          canIUse: uni.canIUse('button.open-type.getUserInfo'),
          fillw: 0,
          fillh: 0,
          masktop: 10,
          addimgtop: '15%',

          phonetype: {
            name: ''
          },

          cheight: '',
          mheight: '',
          mwidth: '',
          left: 0,
          cshow: true,
          bg: '',
          mb: '',
          tk: '',
          tt: [],
          pics: [],
          words: [],
          inputval: '',
          addimgshow: false,
          imgh: 0,
          imgw: 0,
          addshow: false,

          fx: [{
            name: '横向',
            active: 'active'
          },{
            name: '纵向',
            active: ''
          }],

          falimys: [
              {
                  val: '/static/img/font1.jpg',
                  name: '1',
                  active: 'active'
              },
              {
                  val: '/static/img/font2.jpg',
                  name: '2',
                  active: ''
              },
              {
                  val: '/static/img/font3.jpg',
                  name: '3',
                  active: ''
              },
              {
                  val: '/static/img/font4.jpg',
                  name: '4',
                  active: ''
              },
              {
                  val: '/static/img/font5.jpg',
                  name: '5',
                  active: ''
              },
              {
                  val: '/static/img/font6.jpg',
                  name: '6',
                  active: ''
              }
          ],

          colors: [
              {
                  val: 'rgb(0,0,0)',
                  name: '0,0,0',
                  active: 'active'
              },
              {
                  val: 'rgb(51,51,51)',
                  name: '51,51,51',
                  active: ''
              },
              {
                  val: 'rgb(102,102,102)',
                  name: '102,102,102',
                  active: ''
              },
              {
                  val: 'rgb(255,255,255)',
                  name: '255,255,255',
                  active: ''
              },
              {
                  val: 'rgb(19,67,104)',
                  name: '19,67,104',
                  active: ''
              },
              {
                  val: 'rgb(32,141,220)',
                  name: '32,141,220',
                  active: ''
              },
              {
                  val: 'rgb(67,182,195)',
                  name: '67,182,195',
                  active: ''
              },
              {
                  val: 'rgb(3,94,41)',
                  name: '3,94,41',
                  active: ''
              },
              {
                  val: 'rgb(152,202,74)',
                  name: '152,202,74',
                  active: ''
              },
              {
                  val: 'rgb(145,0,114)',
                  name: '145,0,114',
                  active: ''
              },
              {
                  val: 'rgb(191,35,27)',
                  name: '191,35,27',
                  active: ''
              },
              {
                  val: 'rgb(251,24,61)',
                  name: '251,24,61',
                  active: ''
              },
              {
                  val: 'rgb(239,41,94)',
                  name: '239,41,94',
                  active: ''
              },
              {
                  val: 'rgb(239,105,14)',
                  name: '239,105,14',
                  active: ''
              },
              {
                  val: 'rgb(241,153,33)',
                  name: '241,153,33',
                  active: ''
              }
          ],

          textwidth: 0,
          textheight: 0,
          textimgs: [],
          xc: 0,
          yc: 0,

          pk: {
            x: 0,
            y: 0,
            rotate: 0,
            index: 0,
            types: '',
            h: '',
            w: ''
          },

          bscale: 1,
          kshow: true,
          admin: true,

          imageSize: {
            imageWidth: '',
            imageHeight: ''
          },

          windowWidth: '',
          windowHeight: '',
          undefind: '',
          url: '',
          clock: '',
          active: '',
          name: ''
      };
  },
  onLoad: function (t) {
      uni.showLoading({
        title: '加载中...',
        mask: true
      });
      // 这个是接收全局的对象，生成图标的时候用得上
      e = uni.createCanvasContext("mycanvas");
      this.setData({
          types: '0',
          admin: true
      });
      // 中间哪里显示啥
      uni.setNavigationBarTitle({
          title: '我是中间显示的标题'
      });
      var that = this;
      uni.getSystemInfo({
          success: function (t) {
            if (t.model.indexOf('iPhone') > -1) {
              t.model = t.model.split('<')[0];
            }
            var a = t.windowWidth;
            var i = t.windowHeight;
            that.setData({
                phonetype: {
                  name: t.model
                }
            });
            that.getShopMobile( i, a);
          }
      });
  },
  onShow: function (t) {
      var that = this;
      if (app.globalData.onloadss) {
          this.setData({
            kshow: true
          });
          uni.getStorage({
              key: 'ppselc',
              success: function (t) {
                  app.globalData.onloadss = false;
                  var i = 0;
                  var s = 0;
                  var c = t.data.bgimage;
                  var o = t.data;
                  uni.showLoading({
                      title: '加载中...',
                      mask: true
                  });
                  uni.removeStorageSync('ppselcs');
                  uni.setStorageSync('ppselcs', t.data.bgimage);
                  uni.getImageInfo({
                      src: c,
                      success: function (t) {
                          i = t.width;
                          s = t.height;
                          uni.getSystemInfo({
                              success: function (t) {
                                  if (i < s) {
                                      var a = t.windowHeight - 100;
                                      if ((g = (i / s) * (r = 0.72 * a)) > 0.66 * t.windowWidth) {
                                          g = 0.66 * t.windowWidth;
                                          r = (s / i) * g;
                                          var d = (0.66 * t.windowWidth - g) / 2;
                                          var n = 0.8 * t.windowHeight - r - 10;
                                          var h = 10;
                                          var l = '15%';
                                      } else {
                                          var d = (0.66 * t.windowWidth - g) / 2;
                                          var n = 0.8 * t.windowHeight - r - 10;
                                          var h = 10;
                                          var l = '15%';
                                      }
                                  } else {
                                      var g = (a = 0.66 * t.windowWidth);
                                      var r = (s / i) * g;
                                      if (g > 0.66 * t.windowWidth) {
                                          g = 0.66 * t.windowWidth;
                                          r = (s / i) * g;
                                          var d = (0.66 * t.windowWidth - g) / 2;
                                          var n = 0.8 * t.windowHeight - r - 10;
                                          var h = 10;
                                          var l = '15%';
                                      } else {
                                          var d = (0.66 * t.windowWidth - g) / 2;
                                          var h = (n = (0.8 * t.windowHeight - r) / 2);
                                          var l = 0;
                                      }
                                  }
                                  that.setData({
                                      windowWidth: t.windowWidth,
                                      windowHeight: t.windowHeight,
                                      phonetype: o,
                                      bg: c,
                                      cheight: a,
                                      mheight: r,
                                      mwidth: g,
                                      cshow: false,
                                      left: d,
                                      imgw: i,
                                      imgh: s,
                                      xc: d,
                                      yc: h,
                                      fillw: d,
                                      fillh: n,
                                      masktop: h,
                                      addimgtop: l
                                  });
                                  uni.removeStorageSync('ppselc');
                                  uni.hideLoading();
                              },
                              fail: function () {
                                  uni.showToast({
                                      title: '获取失败!',
                                      icon: 'loading',
                                      mask: true,
                                      duration: 2000
                                  });
                              }
                          });
                      }
                  });
              },
              fail: function (t) {
                  if ('' == that.bg) {
                      uni.showToast({
                          title: '请选机型!',
                          icon: 'loading',
                          mask: true,
                          duration: 3000
                      });
                      setTimeout(function () {
                          uni.navigateTo({
                              url: '/pages/selecttypes/selecttypes'
                          });
                      }, 2000);
                  }
              }
          });
      }
      uni.getStorage({
          key: 'mb',
          success: function (t) {
              that.setData({
                  kshow: true
              });
              uni.showLoading({
                  title: '加载中...',
                  mask: true
              });
              uni.getImageInfo({
                  src: t.data.url,
                  success: function (t) {
                      var a = [
                          {
                              url: t.path,
                              picw: that.mwidth,
                              pich: that.mheight,
                              x: that.left,
                              y: that.masktop,
                              scale: 1,
                              rotate: 0,
                              active: 'active',
                              zindex: 1,
                              clock: '/static/img/clock1.png'
                          }
                      ];
                      that.setData({
                          mb: a,
                          addimgshow: true
                      });
                      uni.removeStorageSync('mb');
                      uni.hideLoading();
                  },
                  fail: function (t) {}
              });
          }
      });
      uni.getStorage({
          key: 'tk',
          success: function (t) {
              that.setData({
                  kshow: true
              });
              uni.showLoading({
                  title: '加载中...',
                  mask: true
              });
              uni.getImageInfo({
                  src: t.data.url,
                  success: function (t) {
                      var a = [
                          {
                              url: t.path,
                              picw: that.mwidth,
                              pich: that.mheight,
                              x: that.left,
                              y: that.masktop,
                              scale: 1,
                              rotate: 0,
                              active: 'active',
                              zindex: 1,
                              clock: '/static/img/clock1.png'
                          }
                      ];
                      that.setData({
                          tk: a,
                          addimgshow: true
                      });
                      uni.removeStorageSync('tk');
                      uni.hideLoading();
                  },
                  fail: function (t) {}
              });
          }
      });
      uni.getStorage({
          key: 'tt',
          success: function (t) {
              that.setData({
                  kshow: true
              });
              uni.showLoading({
                  title: '加载中...',
                  mask: true
              });
              uni.getImageInfo({
                  src: t.data[0].url,
                  success: function (t) {
                      var a = t.path;
                      var i = t.width;
                      var s = t.height;
                      if (i == s) {
                          i = 90;
                          s = 90;
                      } else {
                          i = 90;
                          s = (t.height / t.width) * 90;
                      }
                      var c = that.fillw + (that.mwidth - i) / 2;
                      var o = that.tt;
                      var d = {
                          url: a,
                          picw: i,
                          pich: s,
                          x: c,
                          y: that.masktop + (that.mheight - s) / 2,
                          scale: 1,
                          rotate: 0,
                          zindex: 6
                      };
                      var n = {
                          w: i,
                          h: s,
                          x: c + 0.17 * that.windowWidth,
                          y: 0.1 * that.windowHeight + that.masktop + (that.mheight - s) / 2,
                          rotate: 0,
                          types: 'tt',
                          index: o.length
                      };
                      if (o.length > 0) {
                          for (var h = 0; h < o.length; h++) {
                              if (void 0 != o[h]) {
                                  o[h].zindex = 5;
                              }
                          }
                      }
                      o.push(d);
                      that.setData({
                          tt: o,
                          addimgshow: true,
                          pk: n,
                          kshow: false
                      });
                      uni.removeStorageSync('tt');
                      uni.hideLoading();
                  },
                  fail: function (t) {}
              });
          }
      });
  },
  onShareAppMessage: function () {
      return {
          title: app.globalData.shop.nickname,
          path: '/pages/index/index?scene=' + app.globalData.shop_id + ',' + app.globalData.userInfo.id
      };
  },
  methods: {
      movedata: function (t) {
          console.log(t);
          if ('tt' == t.getDataset.types) {
              var a = this.tt;
              var e = this.pk;
              a[t.getDataset.idx].x = t.getDataset.x;
              a[t.getDataset.idx].y = t.getDataset.y;
              a[t.getDataset.idx].picw = t.getDataset.w;
              a[t.getDataset.idx].pich = t.getDataset.h;
              a[t.getDataset.idx].scale = t.getDataset.scale;
              a[t.getDataset.idx].rotate = t.getDataset.rotate;
              e.x = t.picslistdata.x;
              e.y = t.picslistdata.y;
              e.w = t.picslistdata.w;
              e.h = t.picslistdata.h;
              e.rotate = t.picslistdata.rotate;
              this.setData({
                  tt: a,
                  pk: e
              });
          }
          if ('pics' == t.getDataset.types) {
              var i = this.pics;
              var e = this.pk;
              i[t.getDataset.idx].x = t.getDataset.x;
              i[t.getDataset.idx].y = t.getDataset.y;
              i[t.getDataset.idx].picw = t.getDataset.w;
              i[t.getDataset.idx].pich = t.getDataset.h;
              i[t.getDataset.idx].scale = t.getDataset.scale;
              i[t.getDataset.idx].rotate = t.getDataset.rotate;
              e.x = t.picslistdata.x;
              e.y = t.picslistdata.y;
              e.w = t.picslistdata.w;
              e.h = t.picslistdata.h;
              e.rotate = t.picslistdata.rotate;
              this.setData({
                  pics: i,
                  pk: e
              });
          }
          if ('textimgs' == t.getDataset.types) {
              var s = this.textimgs;
              var e = this.pk;
              s[t.getDataset.idx].x = t.getDataset.x;
              s[t.getDataset.idx].y = t.getDataset.y;
              s[t.getDataset.idx].picw = t.getDataset.w;
              s[t.getDataset.idx].pich = t.getDataset.h;
              s[t.getDataset.idx].scale = t.getDataset.scale;
              s[t.getDataset.idx].rotate = t.getDataset.rotate;
              e.x = t.picslistdata.x;
              e.y = t.picslistdata.y;
              e.w = t.picslistdata.w;
              e.h = t.picslistdata.h;
              e.rotate = t.picslistdata.rotate;
              this.setData({
                  textimgs: s,
                  pk: e
              });
          }
          if ('tk' == t.getDataset.types) {
              var c = this.tk;
              var e = this.pk;
              c[0].x = t.getDataset.x;
              c[0].y = t.getDataset.y;
              c[0].picw = t.getDataset.w;
              c[0].pich = t.getDataset.h;
              c[0].scale = t.getDataset.scale;
              c[0].rotate = t.getDataset.rotate;
              e.x = t.picslistdata.x;
              e.y = t.picslistdata.y;
              e.w = t.picslistdata.w;
              e.h = t.picslistdata.h;
              e.rotate = t.picslistdata.rotate;
              this.setData({
                  tk: c,
                  pk: e
              });
          }
          if ('mb' == t.getDataset.types) {
              var o = this.mb;
              var e = this.pk;
              o[0].x = t.getDataset.x;
              o[0].y = t.getDataset.y;
              o[0].picw = t.getDataset.w;
              o[0].pich = t.getDataset.h;
              o[0].scale = t.getDataset.scale;
              o[0].rotate = t.getDataset.rotate;
              e.x = t.picslistdata.x;
              e.y = t.picslistdata.y;
              e.w = t.picslistdata.w;
              e.h = t.picslistdata.h;
              e.rotate = t.picslistdata.rotate;
              this.setData({
                  mb: o,
                  pk: e
              });
          }
      },

      getShopMobile: function ( e, i) {
          var that = this;
          var c = 0;
          var o = 0;
          uni.showLoading({
              title: '加载中...',
              mask: true
          });
          if ('' != app.globalData.shop_id) {
              uni.request({
                  url: app.globalData.host + '/api/Index/searchMmobile',
                  data: {
                      model: 'microsoft',
                      shop_id: app.globalData.shop_id,
                      types: app.globalData.types
                  },
                  success: function (t) {
                      if (0 == t.data.code) {
                          app.globalData.onloadss = true;
                          uni.navigateTo({
                              url: '/pages/selecttypes/selecttypes'
                          });
                          uni.hideLoading();
                      } else {
                          var d = t.data.data;
                          uni.removeStorageSync('ppselcs');
                          uni.setStorageSync('ppselcs', d.bgimage);
                          uni.getImageInfo({
                              src: d.bgimage,
                              success: function (t) {
                                  c = t.width;
                                  o = t.height;
                                  if (c < o) {
                                      if ((r = (c / o) * (p = 0.72 * (g = e - 100))) > 0.66 * i) {
                                          var a = (0.66 * i - (r = 0.66 * i)) / 2;
                                          var n = 0.8 * e - (p = (o / c) * r) - 10;
                                          var h = 10;
                                          var l = '15%';
                                      } else {
                                          var a = (0.66 * i - r) / 2;
                                          var n = 0.8 * e - p - 10;
                                          var h = 10;
                                          var l = '15%';
                                      }
                                  } else {
                                      var g = 0.66 * i;
                                      var r = g;
                                      var p = (o / c) * r;
                                      if (r > 0.66 * i) {
                                          var a = (0.66 * i - (r = 0.66 * i)) / 2;
                                          var n = 0.8 * e - (p = (o / c) * r) - 10;
                                          var h = 10;
                                          var l = '15%';
                                      } else {
                                          var a = (0.66 * i - r) / 2;
                                          var h = (n = (0.8 * e - p) / 2);
                                          var l = 0;
                                      }
                                  }
                                  that.setData({
                                      windowWidth: i,
                                      windowHeight: e,
                                      phonetype: d,
                                      bg: d.bgimage,
                                      cheight: g,
                                      mheight: p,
                                      mwidth: r,
                                      cshow: false,
                                      left: a,
                                      imgw: c,
                                      imgh: o,
                                      xc: a,
                                      yc: 10,
                                      fillw: a,
                                      fillh: n,
                                      masktop: h,
                                      addimgtop: l
                                  });
                              }
                          });
                          uni.hideLoading();
                      }
                  }
              });
          } else {
              setTimeout(function () {
                  that.getShopMobile( e, i);
              }, 1000);
          }
      },

      mbclock: function () {
          var that = this;
          var a = this.mb;
          if ('/static/img/clock1.png' == a[0].clock) {
              uni.getImageInfo({
                  src: a[0].url,
                  success: function (e) {
                      var i = e.width;
                      i = (i / e.height) * that.mheight;
                      var s = (0.66 * that.windowWidth - i) / 2;
                      var c = [
                          {
                              url: a[0].url,
                              picw: i,
                              pich: that.mheight,
                              x: s,
                              y: that.masktop,
                              scale: 1,
                              rotate: 0,
                              active: 'active',
                              zindex: 1,
                              clock: '/static/img/clock2.png'
                          }
                      ];
                      var o = {
                          w: i,
                          h: that.mheight,
                          x: s + 0.17 * that.windowWidth,
                          y: 0.1 * that.windowHeight + that.masktop,
                          rotate: 0,
                          types: 'mb',
                          index: 0
                      };
                      that.setData({
                          mb: c,
                          pk: o,
                          kshow: false
                      });
                  }
              });
          } else {
              a[0].clock = '/static/img/clock1.png';
              that.setData({
                  mb: a,
                  kshow: true
              });
          }
      },

      tkclock: function (t) {
          var that = this;
          var e = this.tk;
          if ('/static/img/clock1.png' == e[0].clock) {
              uni.getImageInfo({
                  src: e[0].url,
                  success: function (t) {
                      var i = t.width;
                      i = (i / t.height) * that.mheight;
                      var s = (0.66 * that.windowWidth - i) / 2;
                      var c = [
                          {
                              url: e[0].url,
                              picw: i,
                              pich: that.mheight,
                              x: s,
                              y: that.masktop,
                              scale: 1,
                              rotate: 0,
                              active: 'active',
                              zindex: 1,
                              clock: '/static/img/clock2.png'
                          }
                      ];
                      var o = {
                          w: i,
                          h: that.mheight,
                          x: s + 0.17 * that.windowWidth,
                          y: 0.1 * that.windowHeight + that.masktop,
                          rotate: 0,
                          types: 'tk',
                          index: 0
                      };
                      that.setData({
                          tk: c,
                          pk: o,
                          kshow: false
                      });
                  }
              });
          } else {
              e[0].clock = '/static/img/clock1.png';
              that.setData({
                  tk: e,
                  kshow: true
              });
          }
      },

      eidttype: function () {
          app.globalData.onloadss = true;
          uni.navigateTo({
              url: '/pages/selecttypes/selecttypes'
          });
      },

      getCanvasImg: function (a, e, i, s) {
          var that = this;
          uni.getImageInfo({
              src: i[0],
              success: function (o) {
                  var d = t.default.imageUtil(o);
                  that.setData({
                      imageSize: d
                  });
                  if (a < i.length) {
                      var n = uni.createCanvasContext('attendCanvasId');
                      n.drawImage(i[a], 0, 0, d.imageWidth, d.imageHeight);
                      n.draw(false, function () {
                          a += 1;
                          console.log(d);
                          uni.canvasToTempFilePath({
                              x: 0,
                              y: 0,
                              width: d.imageWidth,
                              height: d.imageHeight,
                              destWidth: d.imageWidth,
                              destHeight: d.imageHeight,
                              canvasId: 'attendCanvasId',
                              fileType: 'jpg',
                              quality: 1,
                              success: function (t) {
                                  console.log(t);
                                  that.uploadCanvasImg(t.tempFilePath, s[0]);
                              },
                              fail: function (t) {
                                  e += 1;
                                  that.getCanvasImg(inedx, e, i, s);
                              }
                          });
                      });
                  }
              },
              fail: function () {},
              complete: function () {}
          });
      },

      uploadCanvasImg: function (t, e) {
          var i = this.pics;
          var that = this;
          var c = t;
          uni.uploadFile({
              url: app.globalData.host + '/api/Checkfile/Checkfile',
              filePath: c,
              name: 'file',
              success: function (t) {
                  uni.hideLoading();
                  if (1 == JSON.parse(t.data).code) {
                      uni.getImageInfo({
                          src: e,
                          success: function (t) {
                              var a = t.width;
                              a = (a / t.height) * that.mheight;
                              var c = (0.66 * that.windowWidth - a) / 2;
                              var o = {
                                  url: e,
                                  picw: a,
                                  pich: that.mheight,
                                  x: c,
                                  y: that.masktop,
                                  scale: 1,
                                  rotate: 0,
                                  active: 'active',
                                  zindex: 4
                              };
                              var d = {
                                  w: a,
                                  h: that.mheight,
                                  x: c + 0.17 * that.windowWidth,
                                  y: 0.1 * that.windowHeight + that.masktop,
                                  rotate: 0,
                                  types: 'pics',
                                  index: i.length
                              };
                              if (i.length > 0) {
                                  for (h = 0; h < i.length; h++) {
                                      if (void 0 != i[h]) {
                                          i[h].zindex = 3;
                                      }
                                  }
                              }
                              var n = that.tt;
                              if (n.length > 0) {
                                  for (var h = 0; h < n.length; h++) {
                                      if (void 0 != n[h]) {
                                          n[h].zindex = 5;
                                      }
                                  }
                              }
                              i.push(o);
                              that.setData({
                                  pics: i,
                                  tt: n,
                                  addimgshow: true,
                                  pk: d,
                                  kshow: false
                              });
                              console.log(that.kshow);
                          }
                      });
                  } else {
                      uni.showToast({
                          title: '图片不安全',
                          icon: 'loading',
                          duration: 2000
                      });
                  }
              }
          });
      },

      addimg: function () {
          var that = this;
          this.setData({
              kshow: true
          });
          uni.chooseImage({
              count: 1,
              sizeType: ['original'],
              sourceType: ['album', 'camera'],
              success: function (a) {
                  var e = a.tempFilePaths;
                  that.getCanvasImg(0, 0, e, e);
                  uni.showLoading({
                      title: '图片验证中',
                      mask: true
                  });
              }
          });
      },

      delpic: function (t) {
          var a = this.pics;
          a.splice(t.target.dataset.idx, 1);
          this.setData({
              pics: a,
              kshow: true
          });
      },

      // 删除
      delpkpic: function (t) {
          var a = this.pk;
          var e = this[a.types];
          e.splice(a.index, 1);
          console.log(e);
          if ('pics' == a.types) {
              this.setData({
                  pics: e,
                  pk: {
                      x: 0,
                      y: 0,
                      scale: 0,
                      rotate: 0,
                      index: 0,
                      types: ''
                  },
                  kshow: true
              });
          } else {
              if ('tt' == a.types) {
                  this.setData({
                      tt: e,
                      pk: {
                          x: 0,
                          y: 0,
                          scale: 0,
                          rotate: 0,
                          index: 0,
                          types: ''
                      },
                      kshow: true
                  });
              } else {
                  if ('textimgs' == a.types) {
                      this.setData({
                          textimgs: e,
                          pk: {
                              x: 0,
                              y: 0,
                              scale: 0,
                              rotate: 0,
                              index: 0,
                              types: ''
                          },
                          kshow: true
                      });
                  } else {
                      if ('tk' == a.types) {
                          this.setData({
                              tk: '',
                              pk: {
                                  x: 0,
                                  y: 0,
                                  scale: 0,
                                  rotate: 0,
                                  index: 0,
                                  types: ''
                              },
                              kshow: true
                          });
                      } else {
                          if ('mb' == a.types) {
                              this.setData({
                                  mb: '',
                                  pk: {
                                      x: 0,
                                      y: 0,
                                      scale: 0,
                                      rotate: 0,
                                      index: 0,
                                      types: ''
                                  },
                                  kshow: true
                              });
                          }
                      }
                  }
              }
          }
      },

      deltk: function () {
          this.setData({
              tk: '',
              kshow: true
          });
      },

      delmb: function () {
          this.setData({
              mb: '',
              kshow: true
          });
      },

      deltt: function (t) {
          var a = this.tt;
          a.splice(t.target.dataset.idx, 1);
          this.setData({
              tt: a,
              kshow: true
          });
      },

      deltextimgs: function (t) {
          var a = this.textimgs;
          delete a[t.target.dataset.idx];
          this.setData({
              textimgs: a,
              kshow: true
          });
      },

      printoo: function () {
          this.submitdata(1);
      },

      bindGetUserInfo: function (t) {
          uni.showLoading({
              title: '提交数据...',
              mask: true,
              duration: 1000
          });
          var that = this;
          var i = t.detail.userInfo.avatarUrl;
          var s = t.detail.userInfo.nickName;
          uni.showLoading({
              title: s,
              mask: true
          });
          uni.request({
              url: app.globalData.host + '/api/Index/edituseravater',
              data: {
                  shop_id: app.globalData.shop_id,
                  openid: app.globalData.openid,
                  avatar: i,
                  nickname: s
              },
              method: 'GET',
              dataType: 'json',
              success: function (t) {
                  if (1 == t.data.code) {
                      app.globalData.userInfo = t.data.data;
                      that.setData({
                          canIUse: false
                      });
                      that.submitdata();
                  }
              },
              fail: function (t) {
                  uni.showLoading({
                      title: JSON.stringify(t),
                      mask: true,
                      duration: 50
                  });
              },
              complete: function (t) {}
          });
      },

      submitdata: function () {
          var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : '';
          if ('' != this.tk || 0 != this.pics.length || '' != this.mb || 0 != this.tt.length || 0 != this.textimgs.length) {
              uni.showLoading({
                  title: '图片生成中...',
                  mask: true,
                  duration: 200
              });
              var that = this;
              e.clearRect(0, 0, that.imgw, that.imgh);
              e.fillStyle = '#ffffff';
              e.fillRect(0, 0, that.imgw, that.imgh);
              e.save();
              var i = this.tk;
              var s = that.imgw / that.mwidth;
              var c = that.imgh / that.mheight;
              if (i.length > 0) {
                  for (var o = 0; o < i.length; o++) {
                      if (void 0 != i[o]) {
                          var d = i[o];
                          var n = d.x - that.xc - (d.picw * (d.scale - 1)) / 2;
                          var h = d.y - that.yc - (d.pich * (d.scale - 1)) / 2;
                          var l = n + (d.picw * d.scale) / 2;
                          var g = h + (d.pich * d.scale) / 2;
                          e.save();
                          e.translate(l * s, g * c);
                          e.rotate((d.rotate * Math.PI) / 180);
                          e.translate(-l * s, -g * c);
                          e.drawImage(d.url, n * s, h * c, d.picw * d.scale * s, d.pich * d.scale * c);
                          e.restore();
                      }
                  }
                  this.drawpic(t);
              } else {
                  this.drawpic(t);
              }
          } else {
              uni.showToast({
                  title: '未选中任何图片！',
                  icon: 'loading',
                  duration: 2000
              });
          }
      },

      drawpic: function () {
          var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : '';
          var that = this;
          var i = that.imgw / that.mwidth;
          var s = that.imgh / that.mheight;
          var c = this.pics;
          if (c.length > 0) {
              for (var o = 0; o < c.length; o++) {
                  if (void 0 != c[o]) {
                      var d = c[o];
                      var n = d.x - that.xc - (d.picw * (d.scale - 1)) / 2;
                      var h = d.y - that.yc - (d.pich * (d.scale - 1)) / 2;
                      var l = n + (d.picw * d.scale) / 2;
                      var g = h + (d.pich * d.scale) / 2;
                      e.save();
                      e.translate(l * i, g * s);
                      e.rotate((d.rotate * Math.PI) / 180);
                      e.translate(-l * i, -g * s);
                      e.drawImage(d.url, n * i, h * s, d.picw * d.scale * i, d.pich * d.scale * s);
                      e.restore();
                  }
                  if (o == c.length - 1) {
                      this.drawmb(t);
                  }
              }
          } else {
              this.drawmb(t);
          }
      },

      drawmb: function () {
          var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : '';
          var that = this;
          var i = this.mb;
          var s = that.imgw / that.mwidth;
          var c = that.imgh / that.mheight;
          if (i.length > 0) {
              for (var o = 0; o < i.length; o++) {
                  if (void 0 != i[o]) {
                      var d = i[o];
                      var n = d.x - that.xc - (d.picw * (d.scale - 1)) / 2;
                      var h = d.y - that.yc - (d.pich * (d.scale - 1)) / 2;
                      var l = n + (d.picw * d.scale) / 2;
                      var g = h + (d.pich * d.scale) / 2;
                      e.save();
                      e.translate(l * s, g * c);
                      e.rotate((d.rotate * Math.PI) / 180);
                      e.translate(-l * s, -g * c);
                      e.drawImage(d.url, n * s, h * c, d.picw * d.scale * s, d.pich * d.scale * c);
                      e.restore();
                  }
              }
              this.drawtt(t);
          } else {
              this.drawtt(t);
          }
      },

      drawtt: function () {
          var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : '';
          var that = this;
          var i = that.imgw / that.mwidth;
          var s = that.imgh / that.mheight;
          var c = this.tt;
          if (c.length > 0) {
              for (var o = 0; o < c.length; o++) {
                  if (void 0 != c[o]) {
                      var d = c[o];
                      var n = d.x - that.xc - (d.picw * (d.scale - 1)) / 2;
                      var h = d.y - that.yc - (d.pich * (d.scale - 1)) / 2;
                      var l = n + (d.picw * d.scale) / 2;
                      var g = h + (d.pich * d.scale) / 2;
                      e.save();
                      e.translate(l * i, g * s);
                      e.rotate((d.rotate * Math.PI) / 180);
                      e.translate(-l * i, -g * s);
                      e.drawImage(d.url, n * i, h * s, d.picw * d.scale * i, d.pich * d.scale * s);
                      e.restore();
                  }
                  if (o == c.length - 1) {
                      this.drawtext(t);
                  }
              }
          } else {
              this.drawtext(t);
          }
      },

      drawtext: function () {
          var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : '';
          var that = this;
          var s = that.imgw / that.mwidth;
          var c = that.imgh / that.mheight;
          var o = this.textimgs;
          if (o.length > 0) {
              for (var d = 0; d < o.length; d++) {
                  if (void 0 != o[d]) {
                      var n = o[d];
                      var h = n.x - that.xc - (n.picw * (n.scale - 1)) / 2;
                      var l = n.y - that.yc - (n.pich * (n.scale - 1)) / 2;
                      var g = h + (n.picw * n.scale) / 2;
                      var r = l + (n.pich * n.scale) / 2;
                      e.save();
                      e.translate(g * s, r * c);
                      e.rotate((n.rotate * Math.PI) / 180);
                      e.translate(-g * s, -r * c);
                      e.drawImage(n.url, h * s, l * c, n.picw * n.scale * s, n.pich * n.scale * c);
                      e.restore();
                  }
              }
          }
          e.draw(false, function () {
              uni.canvasToTempFilePath({
                  x: 0,
                  y: 0,
                  width: that.imgw,
                  height: that.imgh,
                  destWidth: that.imgw,
                  destHeight: that.imgh,
                  canvasId: 'mycanvas',
                  fileType: 'jpg',
                  quality: 1,
                  success: function (e) {
                      app.globalData.imgurl = e.tempFilePath;
                      uni.setStorage({
                          key: 'phonetype',
                          data: that.phonetype
                      });
                      if (1 == t) {
                          uni.navigateTo({
                              url: '/pages/printt/printt'
                          });
                      } else {
                          uni.navigateTo({
                              url: '/pages/ordersure/ordersure'
                          });
                      }
                      uni.hideLoading();
                  }
              });
          });
      },

      bindload: function (t) {
          t.detail.width;
          t.detail.height;
      },

      bindqie: function (t) {
          this.setData({
              kshow: true
          });
          s = t.target.dataset.idx;
          i = t.target.dataset.types;
          var a = this.pics;
          var e = this.tt;
          var c = this.textimgs;
          this.setData({
              tt: [],
              pics: [],
              textimgs: []
          });
          if ('pics' == i) {
              for (var o = [], d = 0; d < a.length; d++) {
                  if (d != s) {
                      a[d].zindex = 3;
                      o.push(a[d]);
                  }
              }
              a[s].zindex = 4;
              o.push(a[s]);
              l = {
                  w: a[s].picw * a[s].scale,
                  h: a[s].pich * a[s].scale,
                  x: 0.17 * this.windowWidth + a[s].x + (a[s].picw - a[s].picw * a[s].scale) / 2,
                  y: 0.1 * this.windowHeight + a[s].y + (a[s].pich - a[s].pich * a[s].scale) / 2,
                  rotate: a[s].rotate,
                  types: 'pics',
                  index: o.length - 1
              };
              console.log(o);
              this.setData({
                  pics: o,
                  tt: e,
                  textimgs: c,
                  pk: l,
                  kshow: false
              });
          } else if ('tt' == i) {
              for (var n = [], d = 0; d < e.length; d++) {
                  if (d != s) {
                      e[d].zindex = 5;
                      n.push(e[d]);
                  }
              }
              e[s].zindex = 6;
              n.push(e[s]);
              l = {
                  w: e[s].picw * e[s].scale,
                  h: e[s].pich * e[s].scale,
                  x: 0.17 * this.windowWidth + e[s].x + (e[s].picw - e[s].picw * e[s].scale) / 2,
                  y: 0.1 * this.windowHeight + e[s].y + (e[s].pich - e[s].pich * e[s].scale) / 2,
                  rotate: e[s].rotate,
                  types: 'tt',
                  index: n.length - 1
              };
              this.setData({
                  pics: a,
                  tt: n,
                  textimgs: c,
                  pk: l,
                  kshow: false
              });
          } else if ('textimgs' == i) {
              for (var h = [], d = 0; d < c.length; d++) {
                  if (d != s) {
                      c[d].zindex = 5;
                      h.push(c[d]);
                  }
              }
              c[s].zindex = 6;
              h.push(c[s]);
              var l = {
                  w: c[s].picw * c[s].scale,
                  h: c[s].pich * c[s].scale,
                  x: 0.17 * this.windowWidth + c[s].x + (c[s].picw - c[s].picw * c[s].scale) / 2,
                  y: 0.1 * this.windowHeight + c[s].y + (c[s].pich - c[s].pich * c[s].scale) / 2,
                  rotate: c[s].rotate,
                  types: 'textimgs',
                  index: h.length - 1
              };
              this.setData({
                  pics: a,
                  tt: e,
                  textimgs: h,
                  pk: l,
                  kshow: false
              });
          }
      },

      wenzibtn: function () {
          if (this.addshow) {
              this.setData({
                  addshow: false
              });
          } else {
              this.setData({
                  addshow: true
              });
          }
          n = false;
      },

      selectfamily: function (t) {
          console.log(t);
          for (var a = this.falimys, e = 0; e < a.length; e++) {
              a[e].active = '';
          }
          a[t.target.dataset.idx].active = 'active';
          this.setData({
              falimys: a
          });
          c = a[t.target.dataset.idx].val;
      },

      selectcolor: function (t) {
          for (var a = this.colors, e = 0; e < a.length; e++) {
              a[e].active = '';
          }
          a[t.currentTarget.dataset.idx].active = 'active';
          this.setData({
              colors: a
          });
          o = a[t.currentTarget.dataset.idx].val;
      },

      fxbtn: function (t) {
          var a = this.fx;
          a[0].active = '';
          a[1].active = '';
          a[t.target.dataset.idx].active = 'active';
          if ('active' == a[0].active) {
              if ('' == d) {
                  this.setData({
                      textwidth: 600,
                      textheight: 80,
                      fx: a
                  });
              } else {
                  var e = uni.createCanvasContext('textcanvas');
                  e.font = '50px ' + c;
                  var i = e.measureText(d);
                  this.setData({
                      textwidth: i.width,
                      textheight: 80,
                      fx: a
                  });
              }
          } else {
              this.setData({
                  textwidth: 80,
                  textheight: 600,
                  fx: a
              });
          }
      },

      inputvalFun: function (t) {
          d = t.detail.value;
          this.setData({
              inputval: d
          });
      },

      surebtn: function () {
          this.setData({
              kshow: true
          });
          var t = this.inputval;
          if ('' != t) {
              for (var e = this.textimgs, i = this.colors, s = this.falimys, o = this.fx, d = '', h = 0; h < i.length; h++) {
                  if ('active' == i[h].active) {
                      d = i[h].name;
                  }
              }
              for (h = 0; h < s.length; h++) {
                  if ('active' == s[h].active) {
                      c = s[h].name;
                  }
              }
              for (h = 0; h < o.length; h++) {
                  if ('active' == o[h].active) {
                      o = o[h].name;
                  }
              }
              if (n) {
                  var l = this.pk;
                  e.splice(l.index, 1);
                  n = false;
              }
              var that = this;
              uni.request({
                  url: app.globalData.host + '/api/Checkfile/checkfile',
                  data: {
                      types: 1,
                      content: t
                  },
                  success: function (i) {
                      if (1 == i.data.code) {
                          uni.request({
                              url: app.globalData.host + '/api/index/textToImage',
                              data: {
                                  shop_id: 1,
                                  selectcolor: d,
                                  selectfamily: c,
                                  fx: o,
                                  val: t
                              },
                              success: function (t) {
                                  var a = t.data.data;
                                  uni.getImageInfo({
                                      src: a,
                                      success: function (t) {
                                          var a = t.path;
                                          var i = 0.3 * t.width;
                                          var s = 0.3 * t.height;
                                          var c = (0.6 * that.windowWidth - i) / 2;
                                          var o = that.masktop + (that.mheight - s) / 2;
                                          var d = {
                                              url: a,
                                              picw: i,
                                              pich: s,
                                              x: c,
                                              y: o,
                                              scale: 1,
                                              rotate: 0,
                                              active: 'active',
                                              zindex: 6,
                                              falimys: that.falimys,
                                              fx: that.fx,
                                              colors: that.colors,
                                              text: that.inputval
                                          };
                                          if (e.length > 0) {
                                              for (var n = 0; n < e.length; n++) {
                                                  if (void 0 != e[n]) {
                                                      e[n].zindex = 5;
                                                  }
                                              }
                                          }
                                          var h = {
                                              w: i,
                                              h: s,
                                              x: c + 0.17 * that.windowWidth,
                                              y: 0.1 * that.windowHeight + o,
                                              rotate: 0,
                                              types: 'textimgs',
                                              index: e.length
                                          };
                                          e.push(d);
                                          that.setData({
                                              textimgs: e,
                                              addimgshow: true,
                                              addshow: false,
                                              kshow: false,
                                              pk: h,
                                              inputval: '',
                                              fx: [
                                                  {
                                                      name: '横向',
                                                      active: 'active'
                                                  },
                                                  {
                                                      name: '纵向',
                                                      active: ''
                                                  }
                                              ],
                                              falimys: [
                                                  {
                                                      val: '/static/img/font1.jpg',
                                                      name: '1',
                                                      active: 'active'
                                                  },
                                                  {
                                                      val: '/static/img/font2.jpg',
                                                      name: '2',
                                                      active: ''
                                                  },
                                                  {
                                                      val: '/static/img/font3.jpg',
                                                      name: '3',
                                                      active: ''
                                                  },
                                                  {
                                                      val: '/static/img/font4.jpg',
                                                      name: '4',
                                                      active: ''
                                                  },
                                                  {
                                                      val: '/static/img/font5.jpg',
                                                      name: '5',
                                                      active: ''
                                                  },
                                                  {
                                                      val: '/static/img/font6.jpg',
                                                      name: '6',
                                                      active: ''
                                                  }
                                              ],
                                              colors: [
                                                  {
                                                      val: 'rgb(0,0,0)',
                                                      name: '0,0,0',
                                                      active: 'active'
                                                  },
                                                  {
                                                      val: 'rgb(51,51,51)',
                                                      name: '51,51,51',
                                                      active: ''
                                                  },
                                                  {
                                                      val: 'rgb(102,102,102)',
                                                      name: '102,102,102',
                                                      active: ''
                                                  },
                                                  {
                                                      val: 'rgb(255,255,255)',
                                                      name: '255,255,255',
                                                      active: ''
                                                  },
                                                  {
                                                      val: 'rgb(19,67,104)',
                                                      name: '19,67,104',
                                                      active: ''
                                                  },
                                                  {
                                                      val: 'rgb(32,141,220)',
                                                      name: '32,141,220',
                                                      active: ''
                                                  },
                                                  {
                                                      val: 'rgb(67,182,195)',
                                                      name: '67,182,195',
                                                      active: ''
                                                  },
                                                  {
                                                      val: 'rgb(3,94,41)',
                                                      name: '3,94,41',
                                                      active: ''
                                                  },
                                                  {
                                                      val: 'rgb(152,202,74)',
                                                      name: '152,202,74',
                                                      active: ''
                                                  },
                                                  {
                                                      val: 'rgb(145,0,114)',
                                                      name: '145,0,114',
                                                      active: ''
                                                  },
                                                  {
                                                      val: 'rgb(191,35,27)',
                                                      name: '191,35,27',
                                                      active: ''
                                                  },
                                                  {
                                                      val: 'rgb(251,24,61)',
                                                      name: '251,24,61',
                                                      active: ''
                                                  },
                                                  {
                                                      val: 'rgb(239,41,94)',
                                                      name: '239,41,94',
                                                      active: ''
                                                  },
                                                  {
                                                      val: 'rgb(239,105,14)',
                                                      name: '239,105,14',
                                                      active: ''
                                                  },
                                                  {
                                                      val: 'rgb(241,153,33)',
                                                      name: '241,153,33',
                                                      active: ''
                                                  }
                                              ]
                                          });
                                      }
                                  });
                              }
                          });
                      } else {
                          uni.showToast({
                              title: '文字不安全!',
                              icon: 'loading',
                              mask: true,
                              duration: 2000
                          });
                      }
                  }
              });
          } else {
              uni.showToast({
                  title: '请输入文字',
                  mask: true,
                  icon: 'loading',
                  duration: 2000
              });
          }
      },

      catchtxt: function () {
          n = false;
          this.setData({
              addshow: false,
              textwidth: 0,
              textheight: 0,
              inputval: '',
              fx: [
                  {
                      name: '横向',
                      active: 'active'
                  },
                  {
                      name: '纵向',
                      active: ''
                  }
              ],
              falimys: [
                  {
                      val: '/static/img/font1.jpg',
                      name: '1',
                      active: 'active'
                  },
                  {
                      val: '/static/img/font2.jpg',
                      name: '2',
                      active: ''
                  },
                  {
                      val: '/static/img/font3.jpg',
                      name: '3',
                      active: ''
                  },
                  {
                      val: '/static/img/font4.jpg',
                      name: '4',
                      active: ''
                  },
                  {
                      val: '/static/img/font5.jpg',
                      name: '5',
                      active: ''
                  },
                  {
                      val: '/static/img/font6.jpg',
                      name: '6',
                      active: ''
                  }
              ],
              colors: [
                  {
                      val: 'rgb(0,0,0)',
                      name: '0,0,0',
                      active: 'active'
                  },
                  {
                      val: 'rgb(51,51,51)',
                      name: '51,51,51',
                      active: ''
                  },
                  {
                      val: 'rgb(102,102,102)',
                      name: '102,102,102',
                      active: ''
                  },
                  {
                      val: 'rgb(255,255,255)',
                      name: '255,255,255',
                      active: ''
                  },
                  {
                      val: 'rgb(19,67,104)',
                      name: '19,67,104',
                      active: ''
                  },
                  {
                      val: 'rgb(32,141,220)',
                      name: '32,141,220',
                      active: ''
                  },
                  {
                      val: 'rgb(67,182,195)',
                      name: '67,182,195',
                      active: ''
                  },
                  {
                      val: 'rgb(3,94,41)',
                      name: '3,94,41',
                      active: ''
                  },
                  {
                      val: 'rgb(152,202,74)',
                      name: '152,202,74',
                      active: ''
                  },
                  {
                      val: 'rgb(145,0,114)',
                      name: '145,0,114',
                      active: ''
                  },
                  {
                      val: 'rgb(191,35,27)',
                      name: '191,35,27',
                      active: ''
                  },
                  {
                      val: 'rgb(251,24,61)',
                      name: '251,24,61',
                      active: ''
                  },
                  {
                      val: 'rgb(239,41,94)',
                      name: '239,41,94',
                      active: ''
                  },
                  {
                      val: 'rgb(239,105,14)',
                      name: '239,105,14',
                      active: ''
                  },
                  {
                      val: 'rgb(241,153,33)',
                      name: '241,153,33',
                      active: ''
                  }
              ]
          });
      },

      inptch: function () {
          console.log(333);
      },

      leftbtn: function () {
          n = false;
          this.setData({
              kshow: true
          });
      },

      selcttext: function (t) {
          this.setData({
              kshow: true
          });
          p = this.pk;
          i = t.currentTarget.dataset.types;
          s = t.currentTarget.dataset.ind;
          if (1 == n && 'textimgs' == i && p.index == s) {
              c = this.textimgs;
              this.setData({
                  addshow: true,
                  falimys: c[s].falimys,
                  fx: c[s].fx,
                  colors: c[s].colors,
                  inputval: c[s].text
              });
          } else {
              var a = this.pics;
              var e = this.tt;
              var c = this.textimgs;
              var o = this.tk;
              var d = this.mb;
              var h = [];
              var l = [];
              var g = [];
              if ('pics' == i) {
                  n = false;
                  for (r = 0; r < a.length; r++) {
                      if (void 0 != a[r] && r != s) {
                          a[r].zindex = 3;
                          h.push(a[r]);
                      }
                  }
                  for (r = 0; r < e.length; r++) {
                      if (void 0 != e[r]) {
                          e[r].zindex = 5;
                          l.push(e[r]);
                      }
                  }
                  for (r = 0; r < c.length; r++) {
                      if (void 0 != c[r]) {
                          c[r].zindex = 5;
                          g.push(c[r]);
                      }
                  }
                  a[s].zindex = 4;
                  h.push(a[s]);
                  p = {
                      w: a[s].picw * a[s].scale,
                      h: a[s].pich * a[s].scale,
                      x: 0.17 * this.windowWidth + a[s].x + (a[s].picw - a[s].picw * a[s].scale) / 2,
                      y: 0.1 * this.windowHeight + a[s].y + (a[s].pich - a[s].pich * a[s].scale) / 2,
                      rotate: a[s].rotate,
                      types: 'pics',
                      index: h.length - 1
                  };
              } else if ('tt' == i) {
                  n = false;
                  for (r = 0; r < a.length; r++) {
                      if (void 0 != a[r]) {
                          a[r].zindex = 3;
                          h.push(a[r]);
                      }
                  }
                  for (r = 0; r < e.length; r++) {
                      if (void 0 != e[r] && r != s) {
                          e[r].zindex = 5;
                          l.push(e[r]);
                      }
                  }
                  for (r = 0; r < c.length; r++) {
                      if (void 0 != c[r]) {
                          c[r].zindex = 5;
                          g.push(c[r]);
                      }
                  }
                  e[s].zindex = 6;
                  l.push(e[s]);
                  p = {
                      w: e[s].picw * e[s].scale,
                      h: e[s].pich * e[s].scale,
                      x: 0.17 * this.windowWidth + e[s].x + (e[s].picw - e[s].picw * e[s].scale) / 2,
                      y: 0.1 * this.windowHeight + e[s].y + (e[s].pich - e[s].pich * e[s].scale) / 2,
                      rotate: e[s].rotate,
                      types: 'tt',
                      index: l.length - 1
                  };
              } else if ('textimgs' == i) {
                  for (r = 0; r < a.length; r++) {
                      if (void 0 != a[r]) {
                          a[r].zindex = 3;
                          h.push(a[r]);
                      }
                  }
                  for (r = 0; r < e.length; r++) {
                      if (void 0 != e[r]) {
                          e[r].zindex = 5;
                          l.push(e[r]);
                      }
                  }
                  for (var r = 0; r < c.length; r++) {
                      if (void 0 != c[r] && r != s) {
                          c[r].zindex = 5;
                          g.push(c[r]);
                      }
                  }
                  c[s].zindex = 6;
                  g.push(c[s]);
                  p = {
                      w: c[s].picw * c[s].scale,
                      h: c[s].pich * c[s].scale,
                      x: 0.17 * this.windowWidth + c[s].x + (c[s].picw - c[s].picw * c[s].scale) / 2,
                      y: 0.1 * this.windowHeight + c[s].y + (c[s].pich - c[s].pich * c[s].scale) / 2,
                      rotate: c[s].rotate,
                      types: 'textimgs',
                      index: g.length - 1
                  };
                  n = true;
              } else if ('tk' == i) {
                  if ({}) {
                      if ('/static/img/clock2.png' == o[0].clock) {
                          p = {
                              w: o[s].picw * o[s].scale,
                              h: o[s].pich * o[s].scale,
                              x: 0.17 * this.windowWidth + o[s].x + (o[s].picw - o[s].picw * o[s].scale) / 2,
                              y: 0.1 * this.windowHeight + o[s].y + (o[s].pich - o[s].pich * o[s].scale) / 2,
                              rotate: o[s].rotate,
                              types: 'tk',
                              index: s
                          };
                      } else {
                          p = '';
                      }
                  }
                  n = true;
              } else if ('mb' == i) {
                  h = a;
                  l = e;
                  g = c;
                  s = 0;
                  if ('/static/img/clock2.png' == d[0].clock) {
                      p = {
                          w: d[s].picw * d[s].scale,
                          h: d[s].pich * d[s].scale,
                          x: 0.17 * this.windowWidth + d[s].x + (d[s].picw - d[s].picw * d[s].scale) / 2,
                          y: 0.1 * this.windowHeight + d[s].y + (d[s].pich - d[s].pich * d[s].scale) / 2,
                          rotate: d[s].rotate,
                          types: 'mb',
                          index: s
                      };
                  } else {
                      var p = '';
                  }
                  n = true;
              }
              this.setData({
                  pics: h,
                  tt: l,
                  textimgs: g,
                  pk: p,
                  tk: o,
                  mb: d,
                  kshow: false
              });
          }
      }
  }
};
</script>
<style>
@import './index.css';
</style>
