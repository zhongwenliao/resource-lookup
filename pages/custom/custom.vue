<template>
  <view class="custom">
    <view
      :style="'position:fixed;z-index:9999;background:#ff0000;width:2px;height:2px;left:' + zx + 'px;top:' + zy + 'px;'"
    ></view>
    <view class="head">
      <image src="/static/img/phone.png"></image>
      <view class="slippers">拖鞋：{{ phonetype.name }}</view>
      <view class="ge"></view>
      <view @tap="handleChangeType" class="edit">更换》</view>
      <button @tap="handleSubmitData">下一步</button>
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
      <!-- 背景图 -->
      <view
        class="mask"
        :style="
          'background-image:url(' + bg + ');width:' + mwidth + 'px;height: ' + mheight + 'px;top:' + masktop + 'px'
        "
      ></view>

      <!-- 图片列 -->
      <template v-for="(item, index) in pics">
        <image
          v-if="item.url"
          :key="`picImg${index}`"
          @tap="bindqie"
          :data-idx="index"
          data-types="pics"
          :id="'pics' + index"
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

      <!-- 文字图片列 -->
      <template v-for="(item, index) in textimgs">
        <image
          v-if="item.url"
          :key="`txtImg${index}`"
          @tap="bindqie"
          :data-idx="index"
          data-types="textimgs"
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
      <!-- 上传按钮 -->
      <image
        @tap="handleUploadImg"
        class="addimg"
        v-if="!addimgshow"
        src="/static/img/img.png"
        :style="'bottom:' + addimgtop"
      ></image>
    </view>
    <view @tap="leftbtn" class="pm-right"></view>
    <view @tap="leftbtn" class="pm-bottom"></view>
    <view @tap="wenzibtn" class="wenzi">
      <image src="/static/img/text.png"></image>
      <view>文字输入</view>
    </view>
    <view class="add" v-if="!addshow">
      <view @tap="handleUploadImg" style="text-align: center">
        <image class="addimgbtn" src="/static/img/add.png"></image>
        <view>添加照片</view>
      </view>
      <!-- 已添加图片列表 -->
      <scroll-view scrollX class="scroll-view_H" style="width: 80%">
        <view
          @tap.stop.prevent="selcttext('pics', index)"
          class="li"
          v-if="pics.length"
          v-for="(item, index) in pics"
          :key="`addPicImg${index}`"
        >
          <view @tap="handleDelPicImg(index)" class="close">X</view>
          <image class="imgcl" :src="item.url"></image>
        </view>
        <view
          @tap.stop.prevent="selcttext('textimgs', index)"
          class="li"
          v-if="textimgs.length"
          v-for="(item, index) in textimgs"
          :key="`addTxtImg${index}`"
        >
          <view @tap="handleDelTextImg(index)" class="close">X</view>
          <image class="imgcl" :src="item.url"></image>
        </view>
      </scroll-view>
    </view>
    <!-- 文字输入弹框 -->
    <view @tap="catchtxt" class="textedit" v-if="addshow">
      <view class="textdiv">
        <scroll-view scrollX class="scroll-view_H">
          <image
            @tap.stop.prevent="selectfamily"
            :class="'familyli ' + item.active"
            :data-idx="index"
            mode="widthFix"
            :src="item.val"
            style="width: 20%"
            v-for="(item, index) in falimys"
            :key="index"
          ></image>
        </scroll-view>
        <scroll-view scrollX class="scroll-view_H">
          <view
            @tap.stop.prevent="selectcolor"
            :class="'colorbox ' + item.active"
            :data-idx="index"
            v-for="(item, index) in colors"
            :key="index"
          >
            <view class="colorli" :style="'background-color:' + item.val"></view>
          </view>
        </scroll-view>
        <input
          @tap.stop.prevent="inptch"
          maxlength="12"
          placeholder="最多输入12个字符"
          placeholderStyle="font-size:14px;"
          style="font-size: 14px"
          v-model="inputval"
        />
        <view class="textbtns">
          <view style="line-height: 30px">文字方向：</view>
          <view @tap.stop.prevent="fxbtn" :class="'fx ' + fx[0].active" data-idx="0">{{ fx[0].name }}</view>
          <view @tap.stop.prevent="fxbtn" :class="'fx ' + fx[1].active" data-idx="1">{{ fx[1].name }}</view>
          <view @tap.stop.prevent="surebtn" class="surebtn">确认添加</view>
        </view>
      </view>
    </view>
    <!-- 整个页面拖放 -->
    <view
      @touchstart="bindtouchstart"
      @touchmove="bindtouchmove"
      @touchend="bindtouchend"
      class="picslist"
      v-if="!kshow"
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
    >
      <!-- 删除 -->
      <image @tap="handleDelImg(pk.types, pk.index)" class="del" src="/static/img/del.png"></image>
      <!-- 缩放 -->
      <image
        @touchend.stop.prevent="kdtouchend"
        @touchmove.stop.prevent="kdtouchmove"
        @touchstart.stop.prevent="kdtouchstart"
        class="kd"
        :data-idx="pk.index"
        data-kn="kd"
        :data-types="pk.types"
        mode="widthFix"
        src="/static/img/kd.png"
      ></image>
      <!-- 旋转 -->
      <image
        @touchend.stop.prevent="kdtouchend"
        @touchmove.stop.prevent="kdtouchmove"
        @touchstart.stop.prevent="kdtouchstart"
        class="xz"
        :data-idx="pk.index"
        data-kn="xz"
        :data-types="pk.types"
        mode="widthFix"
        src="/static/img/xz.png"
      ></image>
    </view>
    <view style="height: 50px; width: 100%"></view>
    <canvas canvasId="textcanvas" :style="'width:' + textwidth + 'px;height:' + textheight + 'px; '"></canvas>
    <canvas
      canvasId="mycanvas"
      :disableScroll="true"
      :style="'width: ' + imgw + 'px; height: ' + imgh + 'px; '"
    ></canvas>
  </view>
</template>

<script>
// var app = getApp();
var app = {
  globalData: {
    host: "https://30diy.cn",
    types: "0",
    openid: "0932wF100b3gTO1N8J000iCaOS32wF1Y",
    imgurl: "",
    userInfo: "",
  },
}
var a
var e = false
var i = false
var s = ""
var c = ""
var h = "SimHei"
var n = "rgb(0,0,0)"
var o = ""
var d = false
var l = 0
var g = true
var p = {
  x: 0,
  y: 0,
}
var w = {
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
}
var r = {
  x: 0,
  y: 0,
}
var m = {
  x: 0,
  y: 0,
}
export default {
  data() {
    return {
      canIUse: uni.canIUse("button.open-type.getUserInfo"),
      fillw: 0,
      fillh: 0,
      masktop: 10,
      addimgtop: "15%",
      phonetype: {
        name: "华歌行1号",
      },
      mheight: "",
      mwidth: "",
      left: 0,
      cshow: true,
      // 默认图片
      bg: "https://7n.30diy.cn/FioJwgE2AQOxNuPTmt2gQ8wOFlAr",
      pics: [],
      inputval: "",
      addimgshow: false,
      imgh: 0,
      imgw: 0,
      addshow: false,
      fx: [
        {
          name: "横向",
          active: "active",
        },
        {
          name: "纵向",
          active: "",
        },
      ],

      falimys: [
        {
          val: "/static/img/font1.jpg",
          name: "1",
          active: "active",
        },
        {
          val: "/static/img/font2.jpg",
          name: "2",
          active: "",
        },
        {
          val: "/static/img/font3.jpg",
          name: "3",
          active: "",
        },
        {
          val: "/static/img/font4.jpg",
          name: "4",
          active: "",
        },
        {
          val: "/static/img/font5.jpg",
          name: "5",
          active: "",
        },
        {
          val: "/static/img/font6.jpg",
          name: "6",
          active: "",
        },
      ],

      colors: [
        {
          val: "rgb(0,0,0)",
          name: "0,0,0",
          active: "active",
        },
        {
          val: "rgb(51,51,51)",
          name: "51,51,51",
          active: "",
        },
        {
          val: "rgb(102,102,102)",
          name: "102,102,102",
          active: "",
        },
        {
          val: "rgb(255,255,255)",
          name: "255,255,255",
          active: "",
        },
        {
          val: "rgb(19,67,104)",
          name: "19,67,104",
          active: "",
        },
        {
          val: "rgb(32,141,220)",
          name: "32,141,220",
          active: "",
        },
        {
          val: "rgb(67,182,195)",
          name: "67,182,195",
          active: "",
        },
        {
          val: "rgb(3,94,41)",
          name: "3,94,41",
          active: "",
        },
        {
          val: "rgb(152,202,74)",
          name: "152,202,74",
          active: "",
        },
        {
          val: "rgb(145,0,114)",
          name: "145,0,114",
          active: "",
        },
        {
          val: "rgb(191,35,27)",
          name: "191,35,27",
          active: "",
        },
        {
          val: "rgb(251,24,61)",
          name: "251,24,61",
          active: "",
        },
        {
          val: "rgb(239,41,94)",
          name: "239,41,94",
          active: "",
        },
        {
          val: "rgb(239,105,14)",
          name: "239,105,14",
          active: "",
        },
        {
          val: "rgb(241,153,33)",
          name: "241,153,33",
          active: "",
        },
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
        types: "",
        w: "",
        h: "",
      },

      bscale: 1,
      kshow: true,
      zx: 0,
      zy: 0,
      windowWidth: "",
      windowHeight: "",
      url: "",
      picw: "",
      pich: "",
      y: "",
      x: "",
      scale: "",
      rotate: "",
      clock: "",
      active: "",
      name: "",
    }
  },
  onLoad: function (t) {
    uni.showLoading({
      title: "加载中...",
      mask: true,
    })
    a = uni.createCanvasContext("mycanvas")
    var that = this
    uni.getSystemInfo({
      success: function (t) {
        var e = t.windowWidth
        var i = t.windowHeight
        that.getShopMobile(i, e)
      },
    })
  },

  methods: {
    getShopMobile: function (e, i) {
      var that = this
      var c = 0
      var h = 0
      uni.showLoading({
        title: "加载中...",
        mask: true,
      })

      uni.getImageInfo({
        src: "https://7n.30diy.cn/FioJwgE2AQOxNuPTmt2gQ8wOFlAr",
        success: function (t) {
          c = t.width
          h = t.height
          if (c < h) {
            var n = (0.66 * i - (p = (c / h) * (w = 0.72 * (g = e - 100)))) / 2
            var o = 0.8 * e - w - 10
            var d = 10
            var l = "15%"
          } else {
            var g = 0.66 * i
            var p = g
            var w = (h / c) * p
            var n = (0.66 * i - p) / 2
            var d = (o = (0.8 * e - w) / 2)
            var l = 0
          }
          that.setData({
            windowWidth: i,
            windowHeight: e,
            mheight: w,
            mwidth: p,
            cshow: false,
            left: n,
            imgw: c,
            imgh: h,
            xc: n,
            yc: 10,
            fillw: n,
            fillh: o,
            masktop: d,
            addimgtop: l,
          })
        },
      })
      uni.hideLoading()
    },

    // 更换类型
    handleChangeType() {
      console.log("这里做更换类型的操作")
    },

    // 图片上传框
    handleUploadImg() {
      var t = this.pics
      var that = this
      uni.chooseImage({
        count: 1,
        sizeType: ["original"],
        sourceType: ["album", "camera"],
        success: function (e) {
          var i = e.tempFilePaths[0]
          uni.getImageInfo({
            src: i,
            success: function (e) {
              var s = e.width
              s = (s / e.height) * that.mheight
              var c = (0.66 * that.windowWidth - s) / 2
              var h = {
                url: i,
                picw: s,
                pich: that.mheight,
                x: c,
                y: that.masktop,
                scale: 1,
                rotate: 0,
                active: "active",
                zindex: 4,
              }
              var n = {
                w: s,
                h: that.mheight,
                x: c + 0.17 * that.windowWidth,
                y: 0.1 * that.windowHeight + that.masktop,
                rotate: 0,
                types: "pics",
                index: t.length,
              }
              if (t.length > 0) {
                for (d = 0; d < t.length; d++) {
                  t[d].zindex = 3
                  t[d].active = ""
                }
              }
              t.push(h)
              that.setData({
                pics: t,
                addimgshow: true,
                pk: n,
                kshow: false,
              })
            },
          })
        },
      })
    },

    // 删除我选中那个图片
    handleDelPicImg(t) {
      this.pics = this.pics.splice(t, 1)
      this.kshow = true
    },

    // 删除框中图片
    handleDelImg: function (types, index) {
      var a = this.pk
      var e = this[types]
      debugger
      e.splice(index, 1)
      if ("pics" == a.types) {
        this.setData({
          pics: e,
          pk: {
            x: 0,
            y: 0,
            scale: 0,
            rotate: 0,
            index: 0,
            types: "",
          },
          kshow: true,
        })
      } else {
        if ("textimgs" == a.types) {
          this.setData({
            textimgs: e,
            pk: {
              x: 0,
              y: 0,
              scale: 0,
              rotate: 0,
              index: 0,
              types: "",
            },
            kshow: true,
          })
        }
      }
    },

    // 删除已添加的文字图片
    handleDelTextImg: function (t) {
      this.textimgs = this.textimgs.splice(t, 1)
      this.kshow = true
    },

    // 都搞好了，可以提交了，下一步
    handleSubmitData() {
      if (this.pics.length != 0 || this.textimgs.length != 0) {
        uni.showLoading({
          title: "图片生成中...",
          mask: true,
        })
        a.clearRect(0, 0, this.imgw, this.imgh)
        a.fillStyle = "#ffffff"
        a.fillRect(0, 0, this.imgw, this.imgh)
        a.save()
        this.drawpic()
      } else {
        uni.showToast({
          title: "未选中任何图片！",
          icon: "loading",
          duration: 1000,
        })
      }
    },

    // 验证图片
    drawpic() {
      var that = this
      var e = that.imgw / that.mwidth
      var i = that.imgh / that.mheight
      var s = this.pics
      if (s.length > 0) {
        for (var c = 0; c < s.length; c++) {
          var h = s[c]
          var n = h.x - that.xc - (h.picw * (h.scale - 1)) / 2
          var o = h.y - that.yc - (h.pich * (h.scale - 1)) / 2
          var d = n + (h.picw * h.scale) / 2
          var l = o + (h.pich * h.scale) / 2
          a.save()
          a.translate(d * e, l * i)
          a.rotate((h.rotate * Math.PI) / 180)
          a.translate(-d * e, -l * i)
          a.drawImage(h.url, n * e, o * i, h.picw * h.scale * e, h.pich * h.scale * i)
          a.restore()
          if (c == s.length - 1) {
            this.drawtext()
          }
        }
      } else {
        this.drawtext()
      }
    },

    // 文字图片生成也就是最后一步
    drawtext: function () {
      var that = this
      var i = that.imgw / that.mwidth
      var s = that.imgh / that.mheight
      var c = this.textimgs
      if (c.length > 0) {
        for (var h = 0; h < c.length; h++) {
          var n = c[h]
          var o = n.x - that.xc - (n.picw * (n.scale - 1)) / 2
          var d = n.y - that.yc - (n.pich * (n.scale - 1)) / 2
          var l = o + (n.picw * n.scale) / 2
          var g = d + (n.pich * n.scale) / 2
          a.save()
          a.translate(l * i, g * s)
          a.rotate((n.rotate * Math.PI) / 180)
          a.translate(-l * i, -g * s)
          a.drawImage(n.url, o * i, d * s, n.picw * n.scale * i, n.pich * n.scale * s)
          a.restore()
        }
      }
      a.draw(false, function () {
        try {
          uni.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: that.imgw,
            height: that.imgh,
            destWidth: that.imgw,
            destHeight: that.imgh,
            canvasId: "mycanvas",
            fileType: "jpg",
            quality: 1,
            success: function (a) {
              console.log("完成，最后的图片数据，剩下我就不管了", a.tempFilePath)
              uni.hideLoading()
            },
          })
        } catch (error) {
          console.log("这里大概率会出错", error)
        }
      })
    },

    bindload: function (t) {
      t.detail.width
      t.detail.height
    },

    bindqie: function (t) {
      c = t.target.dataset.idx
      s = t.target.dataset.types
      var a = this.pics
      var h = this.textimgs
      var n = []
      var d = []
      if ("pics" == s) {
        for (l = 0; l < a.length; l++) {
          if (l != c) {
            a[l].zindex = 3
            n.push(a[l])
          }
        }
        a[c].zindex = 4
        n.push(a[c])
        g = {
          w: a[c].picw * a[c].scale,
          h: a[c].pich * a[c].scale,
          x: 0.17 * this.windowWidth + a[c].x + (a[c].picw - a[c].picw * a[c].scale) / 2,
          y: 0.1 * this.windowHeight + a[c].y + (a[c].pich - a[c].pich * a[c].scale) / 2,
          rotate: a[c].rotate,
          types: "pics",
          index: n.length - 1,
        }
        this.setData({
          pics: n,
          textimgs: h,
          pk: g,
          kshow: false,
        })
      } else if ("textimgs" == s) {
        for (var l = 0; l < h.length; l++) {
          if (l != c) {
            h[l].zindex = 5
            d.push(h[l])
          }
        }
        h[c].zindex = 6
        d.push(h[c])
        var g = {
          w: h[c].picw * h[c].scale,
          h: h[c].pich * h[c].scale,
          x: 0.17 * this.windowWidth + h[c].x + (h[c].picw - h[c].picw * h[c].scale) / 2,
          y: 0.1 * this.windowHeight + h[c].y + (h[c].pich - h[c].pich * h[c].scale) / 2,
          rotate: h[c].rotate,
          types: "textimgs",
          index: d.length - 1,
        }
        this.setData({
          pics: a,
          textimgs: d,
          pk: g,
          kshow: false,
        })
      }
      if (t.touches.length < 2) {
        e = true
        p.x = t.touches[0].pageX
        p.y = t.touches[0].pageY
      } else {
        w.x1 = t.touches[0].pageX
        w.y1 = t.touches[0].pageY
        w.x2 = t.touches[1].pageX
        w.y2 = t.touches[1].pageY
      }
    },

    bindtouchstart: function (t) {
      console.log("开始", t)
      s = this.pk.types
      c = this.pk.index
      var a = this.pics
      var h = this.textimgs
      if ("pics" == s) {
        if (a.length > 0) {
          for (d = 0; d < a.length; d++) {
            a[d].zindex = 3
          }
        }
        a[c].zindex = 4
        l = {
          w: a[c].picw * a[c].scale,
          h: a[c].pich * a[c].scale,
          x: 0.17 * this.windowWidth + a[c].x + (a[c].picw - a[c].picw * a[c].scale) / 2,
          y: 0.1 * this.windowHeight + a[c].y + (a[c].pich - a[c].pich * a[c].scale) / 2,
          rotate: a[c].rotate,
          types: "pics",
          index: c,
        }
        this.setData({
          pics: a,
          textimgs: h,
          pk: l,
        })
      } else if ("textimgs" == s) {
        if (h.length > 0) {
          for (var d = 0; d < h.length; d++) {
            h[d].zindex = 5
          }
        }
        h[c].zindex = 6
        l = {
          w: h[c].picw * h[c].scale,
          h: h[c].pich * h[c].scale,
          x: 0.17 * this.windowWidth + h[c].x + (h[c].picw - h[c].picw * h[c].scale) / 2,
          y: 0.1 * this.windowHeight + h[c].y + (h[c].pich - h[c].pich * h[c].scale) / 2,
          rotate: h[c].rotate,
          types: "textimgs",
          index: c,
        }
        this.setData({
          pics: a,
          textimgs: h,
          pk: l,
        })
      }
      if (t.touches.length < 2) {
        e = true
        p.x = t.touches[0].pageX
        p.y = t.touches[0].pageY
      } else {
        w.x1 = t.touches[0].pageX
        w.y1 = t.touches[0].pageY
        w.x2 = t.touches[1].pageX
        w.y2 = t.touches[1].pageY
      }
    },

    bindtouchmove: function (t) {
      var that = this
      var i = this[s]
      var h = this.pk
      if (t.touches.length < 2 && e) {
        var n = t.touches[0].pageX - p.x
        var o = t.touches[0].pageY - p.y
        i[c].x = i[c].x + n
        h.x = 0.17 * this.windowWidth + i[c].x + (i[c].picw - i[c].picw * i[c].scale) / 2
        i[c].y = i[c].y + o
        h.y = 0.1 * this.windowHeight + i[c].y + (i[c].pich - i[c].pich * i[c].scale) / 2
        if ("pics" == s) {
          that.setData({
            pics: i,
            pk: h,
          })
        } else {
          if ("textimgs" == s) {
            that.setData({
              textimgs: i,
              pk: h,
            })
          }
        }
        p.x = t.touches[0].pageX
        p.y = t.touches[0].pageY
      } else if (t.touches.length > 1) {
        var d = JSON.parse(JSON.stringify(w))
        w.x1 = t.touches[0].pageX
        w.y1 = t.touches[0].pageY
        w.x2 = t.touches[1].pageX
        w.y2 = t.touches[1].pageY
        var l = (360 * Math.atan((d.y1 - d.y2) / (d.x1 - d.x2))) / Math.PI
        var g = (360 * Math.atan((w.y1 - w.y2) / (w.x1 - w.x2))) / Math.PI
        if (Math.abs(l - g) > 1) {
          return
        }
        var r = Math.sqrt(Math.pow(d.x1 - d.x2, 2) + Math.pow(d.y1 - d.y2, 2))
        var m = Math.sqrt(Math.pow(w.x1 - w.x2, 2) + Math.pow(w.y1 - w.y2, 2))
        i[c].scale = i[c].scale + 0.005 * (m - r)
        if (i[c].scale > 0.08) {
          var x = m - r
          var v = x / i[c].picw
          i[c].picw += x
          i[c].pich += i[c].pich * v
          i[c].x -= x / 2
          i[c].y -= x / 2
          i[c].scale = 1
          h.x = h.x + (h.w - i[c].picw * i[c].scale) / 2
          h.y = h.y - x / 2
          h.w = i[c].picw * i[c].scale
          h.h = i[c].pich * i[c].scale
          var f = 1 + Math.pow(1 - i[c].scale, 2)
          if ("pics" == s) {
            that.setData({
              pics: i,
              pk: h,
              bscale: f,
            })
          } else {
            if ("textimgs" == s) {
              that.setData({
                textimgs: i,
                pk: h,
                bscale: f,
              })
            }
          }
        }
      }
    },

    bindtouchend: function (t) {
      e = false
    },
    // 开始缩放
    kdtouchstart: function (t) {
      console.log("开始缩放", t)
      t.preventDefault()
      i = true
      p.x = t.touches[0].pageX
      p.y = t.touches[0].pageY
      if ("xz" == t.target.dataset.kn) {
        r.x = t.touches[0].pageX
        r.y = t.touches[0].pageY
        g = true
      }
    },

    kdtouchmove: function (t) {
      if (i) {
        var that = this
        var e = this[t.target.dataset.types]
        var h = this.pk
        c = t.target.dataset.idx
        s = t.target.dataset.types
        if ("kd" == t.target.dataset.kn) {
          var n = e[c].x + e[c].picw / 2 + 0.17 * that.windowWidth
          var o = e[c].y + e[c].pich / 2 + 0.1 * that.windowHeight
          var d = Math.sqrt(Math.pow(n - p.x, 2) + Math.pow(o - p.y, 2))
          var l = Math.sqrt(Math.pow(n - t.touches[0].pageX, 2) + Math.pow(o - t.touches[0].pageY, 2))
          e[c].scale = e[c].scale + 0.005 * (l - d)
          h.x = h.x + (h.w - e[c].picw * e[c].scale) / 2
          h.y = h.y + (h.h - e[c].pich * e[c].scale) / 2
          h.w = e[c].picw * e[c].scale
          h.h = e[c].pich * e[c].scale
          var g = 1 - e[c].scale + 1
          if ("pics" == s) {
            that.setData({
              pics: e,
              pk: h,
              bscale: g,
            })
          } else {
            if ("textimgs" == s) {
              that.setData({
                textimgs: e,
                pk: h,
                bscale: g,
              })
            }
          }
        } else if ("xz" == t.target.dataset.kn) {
          var n = e[c].x + e[c].picw / 2 + 0.17 * that.windowWidth
          var o = e[c].y + e[c].pich / 2 + 0.1 * that.windowHeight
          that.setData({
            zx: n,
            zy: o,
          })
          console.log(e[c].rotate)
          var w = Math.atan((p.y - o) / (p.x - n))
          var r = Math.atan((t.touches[0].pageY - o) / (t.touches[0].pageX - n))
          console.log("perAngle", w)
          console.log("curAngle", r)
          e[c].rotate = e[c].rotate + r - w
          h.rotate = e[c].rotate
          if ("pics" == s) {
            that.setData({
              pics: e,
              pk: h,
            })
          } else {
            if ("textimgs" == s) {
              that.setData({
                textimgs: e,
                pk: h,
              })
            }
          }
        }
        p.x = t.touches[0].pageX
        p.y = t.touches[0].pageY
      }
    },

    kdtouchend: function (t) {
      i = false
      m.x = 0
      m.y = 0
      r.x = 0
      r.y = 0
      g = true
      l = 0
    },

    wenzibtn: function () {
      if (this.addshow) {
        this.setData({
          addshow: false,
        })
      } else {
        this.setData({
          addshow: true,
        })
      }
      d = false
    },

    selectfamily: function (t) {
      for (var a = this.falimys, e = 0; e < a.length; e++) {
        a[e].active = ""
      }
      a[t.target.dataset.idx].active = "active"
      this.setData({
        falimys: a,
      })
      h = a[t.target.dataset.idx].val
    },

    selectcolor: function (t) {
      for (var a = this.colors, e = 0; e < a.length; e++) {
        a[e].active = ""
      }
      a[t.currentTarget.dataset.idx].active = "active"
      this.setData({
        colors: a,
      })
      n = a[t.currentTarget.dataset.idx].val
    },

    fxbtn: function (t) {
      var a = this.fx
      a[0].active = ""
      a[1].active = ""
      a[t.target.dataset.idx].active = "active"
      if ("active" == a[0].active) {
        if ("" == o) {
          this.setData({
            textwidth: 600,
            textheight: 80,
            fx: a,
          })
        } else {
          var e = uni.createCanvasContext("textcanvas")
          e.font = "50px " + h
          var i = e.measureText(o)
          this.setData({
            textwidth: i.width,
            textheight: 80,
            fx: a,
          })
        }
      } else {
        this.setData({
          textwidth: 80,
          textheight: 600,
          fx: a,
        })
      }
    },

    surebtn: function () {
      var a = this.inputval
      if ("" != a) {
        for (var e = this.textimgs, i = this.colors, s = this.falimys, c = this.fx, n = "", o = 0; o < i.length; o++) {
          if ("active" == i[o].active) {
            n = i[o].name
          }
        }
        for (o = 0; o < s.length; o++) {
          if ("active" == s[o].active) {
            h = s[o].name
          }
        }
        for (o = 0; o < c.length; o++) {
          if ("active" == c[o].active) {
            c = c[o].name
          }
        }
        if (d) {
          var l = this.pk
          e.splice(l.index, 1)
          d = false
        }
        var that = this
        // 这个接口文字生成图片的，需后台生成
        uni.request({
          url: app.globalData.host + "/api/index/textToImage",
          data: {
            // 这个字段无视
            shop_id: 1,
            // 文字颜色
            selectcolor: n,
            // 字体类别
            selectfamily: h,
            // 横纵
            fx: c,
            // 文字
            val: a,
          },
          success: function (t) {
            var a = t.data.data
            uni.getImageInfo({
              src: a,
              success: function (t) {
                var a = t.path
                var i = 0.5 * t.width
                var s = 0.5 * t.height
                var c = (0.6 * that.windowWidth - i) / 2
                var h = that.masktop + (that.mheight - s) / 2
                var n = {
                  url: a,
                  picw: i,
                  pich: s,
                  x: c,
                  y: h,
                  scale: 1,
                  rotate: 0,
                  active: "active",
                  zindex: 6,
                  falimys: that.falimys,
                  fx: that.fx,
                  colors: that.colors,
                  text: that.inputval,
                }
                if (e.length > 0) {
                  for (var o = 0; o < e.length; o++) {
                    e[o].zindex = 5
                    e[o].active = ""
                  }
                }
                var d = {
                  w: i,
                  h: s,
                  x: c + 0.17 * that.windowWidth,
                  y: 0.1 * that.windowHeight + h,
                  rotate: 0,
                  types: "textimgs",
                  index: e.length,
                }
                e.push(n)
                that.setData({
                  textimgs: e,
                  addimgshow: true,
                  addshow: false,
                  kshow: false,
                  pk: d,
                  inputval: "",
                  fx: [
                    {
                      name: "横向",
                      active: "active",
                    },
                    {
                      name: "纵向",
                      active: "",
                    },
                  ],
                  falimys: [
                    {
                      val: "/static/img/font1.jpg",
                      name: "1",
                      active: "active",
                    },
                    {
                      val: "/static/img/font2.jpg",
                      name: "2",
                      active: "",
                    },
                    {
                      val: "/static/img/font3.jpg",
                      name: "3",
                      active: "",
                    },
                    {
                      val: "/static/img/font4.jpg",
                      name: "4",
                      active: "",
                    },
                    {
                      val: "/static/img/font5.jpg",
                      name: "5",
                      active: "",
                    },
                    {
                      val: "/static/img/font6.jpg",
                      name: "6",
                      active: "",
                    },
                  ],
                  colors: [
                    {
                      val: "rgb(0,0,0)",
                      name: "0,0,0",
                      active: "active",
                    },
                    {
                      val: "rgb(51,51,51)",
                      name: "51,51,51",
                      active: "",
                    },
                    {
                      val: "rgb(102,102,102)",
                      name: "102,102,102",
                      active: "",
                    },
                    {
                      val: "rgb(255,255,255)",
                      name: "255,255,255",
                      active: "",
                    },
                    {
                      val: "rgb(19,67,104)",
                      name: "19,67,104",
                      active: "",
                    },
                    {
                      val: "rgb(32,141,220)",
                      name: "32,141,220",
                      active: "",
                    },
                    {
                      val: "rgb(67,182,195)",
                      name: "67,182,195",
                      active: "",
                    },
                    {
                      val: "rgb(3,94,41)",
                      name: "3,94,41",
                      active: "",
                    },
                    {
                      val: "rgb(152,202,74)",
                      name: "152,202,74",
                      active: "",
                    },
                    {
                      val: "rgb(145,0,114)",
                      name: "145,0,114",
                      active: "",
                    },
                    {
                      val: "rgb(191,35,27)",
                      name: "191,35,27",
                      active: "",
                    },
                    {
                      val: "rgb(251,24,61)",
                      name: "251,24,61",
                      active: "",
                    },
                    {
                      val: "rgb(239,41,94)",
                      name: "239,41,94",
                      active: "",
                    },
                    {
                      val: "rgb(239,105,14)",
                      name: "239,105,14",
                      active: "",
                    },
                    {
                      val: "rgb(241,153,33)",
                      name: "241,153,33",
                      active: "",
                    },
                  ],
                })
              },
            })
          },
        })
      } else {
        uni.showToast({
          title: "请输入文字",
          mask: true,
          icon: "loading",
          duration: 2000,
        })
      }
    },

    catchtxt: function () {
      d = false
      this.setData({
        addshow: false,
        textwidth: 0,
        textheight: 0,
        inputval: "",
        fx: [
          {
            name: "横向",
            active: "active",
          },
          {
            name: "纵向",
            active: "",
          },
        ],
        falimys: [
          {
            val: "/static/img/font1.jpg",
            name: "1",
            active: "active",
          },
          {
            val: "/static/img/font2.jpg",
            name: "2",
            active: "",
          },
          {
            val: "/static/img/font3.jpg",
            name: "3",
            active: "",
          },
          {
            val: "/static/img/font4.jpg",
            name: "4",
            active: "",
          },
          {
            val: "/static/img/font5.jpg",
            name: "5",
            active: "",
          },
          {
            val: "/static/img/font6.jpg",
            name: "6",
            active: "",
          },
        ],
        colors: [
          {
            val: "rgb(0,0,0)",
            name: "0,0,0",
            active: "active",
          },
          {
            val: "rgb(51,51,51)",
            name: "51,51,51",
            active: "",
          },
          {
            val: "rgb(102,102,102)",
            name: "102,102,102",
            active: "",
          },
          {
            val: "rgb(255,255,255)",
            name: "255,255,255",
            active: "",
          },
          {
            val: "rgb(19,67,104)",
            name: "19,67,104",
            active: "",
          },
          {
            val: "rgb(32,141,220)",
            name: "32,141,220",
            active: "",
          },
          {
            val: "rgb(67,182,195)",
            name: "67,182,195",
            active: "",
          },
          {
            val: "rgb(3,94,41)",
            name: "3,94,41",
            active: "",
          },
          {
            val: "rgb(152,202,74)",
            name: "152,202,74",
            active: "",
          },
          {
            val: "rgb(145,0,114)",
            name: "145,0,114",
            active: "",
          },
          {
            val: "rgb(191,35,27)",
            name: "191,35,27",
            active: "",
          },
          {
            val: "rgb(251,24,61)",
            name: "251,24,61",
            active: "",
          },
          {
            val: "rgb(239,41,94)",
            name: "239,41,94",
            active: "",
          },
          {
            val: "rgb(239,105,14)",
            name: "239,105,14",
            active: "",
          },
          {
            val: "rgb(241,153,33)",
            name: "241,153,33",
            active: "",
          },
        ],
      })
    },

    inptch: function () {
      // 这里是为了取消默认事件
    },

    leftbtn: function () {
      d = false
      this.setData({
        kshow: true,
      })
    },

    selcttext: function (types, ind) {
      console.log(types, ind)
      w = this.pk
      s = types
      c = ind
      if (1 == d && "textimgs" == s && w.index == c) {
        i = this.textimgs
        this.setData({
          addshow: true,
          falimys: i[c].falimys,
          fx: i[c].fx,
          colors: i[c].colors,
          inputval: i[c].text,
        })
      } else {
        for (var a = this.pics, i = this.textimgs, o = [], l = [], g = [], p = 0; p < a.length; p++) {
          if (p != c) {
            a[p].zindex = 3
            o.push(a[p])
          }
        }
        for (p = 0; p < e.length; p++) {
          if (p != c) {
            e[p].zindex = 5
            l.push(e[p])
          }
        }
        for (p = 0; p < i.length; p++) {
          if (p != c) {
            i[p].zindex = 5
            g.push(i[p])
          }
        }
        if ("pics" == s) {
          d = false
          a[c].zindex = 4
          o.push(a[c])
          w = {
            w: a[c].picw * a[c].scale,
            h: a[c].pich * a[c].scale,
            x: 0.17 * this.windowWidth + a[c].x + (a[c].picw - a[c].picw * a[c].scale) / 2,
            y: 0.1 * this.windowHeight + a[c].y + (a[c].pich - a[c].pich * a[c].scale) / 2,
            rotate: a[c].rotate,
            types: "pics",
            index: o.length - 1,
          }
          this.setData({
            pics: o,
            textimgs: i,
            pk: w,
            kshow: false,
          })
        } else if ("textimgs" == s) {
          i[c].zindex = 6
          g.push(i[c])
          w = {
            w: i[c].picw * i[c].scale,
            h: i[c].pich * i[c].scale,
            x: 0.17 * this.windowWidth + i[c].x + (i[c].picw - i[c].picw * i[c].scale) / 2,
            y: 0.1 * this.windowHeight + i[c].y + (i[c].pich - i[c].pich * i[c].scale) / 2,
            rotate: i[c].rotate,
            types: "textimgs",
            index: g.length - 1,
          }
          d = true
          this.setData({
            pics: a,
            textimgs: g,
            pk: w,
            kshow: false,
          })
        }
      }
    },
  },
}
</script>
<style>
@import "./custom.css";
</style>
