<template>
    <view>
        <view :style="'position:fixed;z-index:9999;background:#ff0000;width:2px;height:2px;left:' + zx + 'px;top:' + zy + 'px;'"></view>
        <view class="head">
            <image src="/static/img/phone.png"></image>
            <view style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 45%">机型：{{ phonetype.name }}</view>
            <view class="ge"></view>
            <view @tap="eidttype" class="edit">换机型》</view>
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
            <image
                :src="tk[0].url"
                :style="
                    'width: ' +
                    tk[0].picw +
                    'px; height: ' +
                    tk[0].pich +
                    'px;top:' +
                    tk[0].y +
                    'px;left:' +
                    tk[0].x +
                    'px;z-index:1;position: absolute;transform: translate(0, 0) scale(' +
                    tk[0].scale +
                    ') rotate(' +
                    tk[0].rotate +
                    'deg);transform-origin: center center;'
                "
            ></image>
            <image
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
                    item.zindex +
                    ' '
                "
                v-for="(item, index) in pics"
                :key="index"
            ></image>
            <image
                class="mbimg"
                v-if="!(mb[0].url ? false : true)"
                :src="mb[0].url"
                :style="
                    'width:' +
                    mb[0].picw +
                    'px;height: ' +
                    mb[0].pich +
                    'px;top:' +
                    mb[0].y +
                    'px;left:' +
                    mb[0].x +
                    'px;transform: translate(0, 0) scale(' +
                    mb[0].scale +
                    ') rotate(' +
                    mb[0].rotate +
                    'deg);transform-origin: center center;'
                "
            ></image>
            <image
                @tap="bindqie"
                :data-idx="index"
                data-types="tt"
                v-if="!(item.url ? false : true)"
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
                    item.zindex +
                    ' '
                "
                v-for="(item, index) in tt"
                :key="index"
            ></image>
            <image
                @tap="bindqie"
                :data-idx="index"
                data-types="textimgs"
                v-if="!(item.url ? false : true)"
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
                    item.zindex +
                    ' '
                "
                v-for="(item, index) in textimgs"
                :key="index"
            ></image>
            <image @tap="addimg" class="addimg" v-if="!addimgshow" src="../../img/img.png " :style="'bottom:' + addimgtop"></image>
        </view>
        <view @tap="leftbtn" class="pm-right"></view>
        <view @tap="leftbtn" class="pm-bottom"></view>
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
                <view @tap.stop.prevent="selcttext" class="li" :data-ind="index" data-types="tk" v-if="tk != ''">
                    <view @tap="deltk" class="close">X</view>
                    <image class="imgcl" mode="aspectFit" :src="tk[0].url"></image>
                    <image @tap="tkclock" class="clock" :src="tk[0].clock"></image>
                </view>
                <view @tap.stop.prevent="selcttext" class="li" :data-ind="index" data-types="pics" v-if="!'pics.url?false:true'" v-for="(item, index) in pics" :key="index">
                    <view @tap="delpic" class="close" :data-idx="index">X</view>

                    <image class="imgcl" mode="aspectFit" :src="item.url"></image>
                </view>
                <view @tap.stop.prevent="selcttext" class="li" :data-ind="index" data-types="mb" v-if="mb != ''">
                    <view @tap="delmb" class="close">X</view>
                    <image class="imgcl" mode="aspectFit" :src="mb[0].url"></image>
                    <image @tap="mbclock" class="clock" :src="mb[0].clock"></image>
                </view>
                <view @tap.stop.prevent="selcttext" class="li" :data-ind="index" data-types="tt" v-if="!'tt.url?false:true'" v-for="(item, index) in tt" :key="index">
                    <view @tap="deltt" class="close" :data-idx="index">X</view>

                    <image class="imgcl" mode="aspectFit" :src="item.url"></image>
                </view>
                <view
                    @tap.stop.prevent="selcttext"
                    class="li"
                    :data-ind="index"
                    data-types="textimgs"
                    v-if="!'textimgs.url?false:true'"
                    v-for="(item, index) in textimgs"
                    :key="index"
                >
                    <view @tap="deltextimgs" class="close" :data-idx="index">X</view>

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
                        :data-idx="index"
                        mode="widthFix"
                        :src="item.val"
                        style="width: 20%"
                        v-for="(item, index) in falimys"
                        :key="index"
                    ></image>
                </scroll-view>
                <scroll-view scrollX class="scroll-view_H" style="width: 100%">
                    <view @tap.stop.prevent="selectcolor" :class="'colorbox ' + item.active" :data-idx="index" v-for="(item, index) in colors" :key="index">
                        <view class="colorli" :style="'background-color:' + item.val"></view>
                    </view>
                </scroll-view>
                <input
                    @input="inputvalFun"
                    @tap.stop.prevent="inptch"
                    id="textval"
                    maxlength="12"
                    placeholder="最多输入12个字符"
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
            @touchend="bindtouchend"
            @touchmove="bindtouchmove"
            @touchstart="bindtouchstart"
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
            <image @tap="delpkpic" class="del" :data-idx="pk.index" :data-types="pk.types" mode="widthFix" src="/static/img/del.png"></image>
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
        <view class="footer">
            <view class="foot-btn active">
                <image src="/static/img/h2.png"></image>
                <view>设计</view>
            </view>
            <navigator url="/pages/img/img?act=index">
                <view class="foot-btn">
                    <image src="/static/img/t1.png"></image>
                    <view>图库</view>
                </view>
            </navigator>
            <navigator openType="redirect" url="/pages/my/my">
                <view class="foot-btn">
                    <image src="/static/img/m1.png"></image>
                    <view>我的</view>
                </view>
            </navigator>
        </view>
        <canvas canvasId="textcanvas" :style="'width:' + textwidth + 'px;height:' + textheight + 'px; '"></canvas>
        <canvas canvasId="mycanvas" :disableScroll="true" :style="'width: ' + imgw + 'px; height: ' + imgh + 'px; '"></canvas>
    </view>
</template>

<script>
var app = getApp();
var a = uni.createCanvasContext('mycanvas');
var e = false;
var i = false;
var s = '';
var c = '';
var h = 'SimHei';
var n = 'rgb(0,0,0)';
var o = '';
var d = false;
var l = 0;
var g = true;
var p = {
    x: 0,
    y: 0
};
var w = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0
};
var r = {
    x: 0,
    y: 0
};
var m = {
    x: 0,
    y: 0
};
export default {
    data() {
        return {
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
                w: '',
                h: ''
            },

            bscale: 1,
            kshow: true,
            zx: 0,
            zy: 0,
            windowWidth: '',
            windowHeight: '',
            url: '',
            picw: '',
            pich: '',
            y: '',
            x: '',
            scale: '',
            rotate: '',
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
        var that = this;
        if (t.scene) {
            var e = decodeURIComponent(t.scene);
            that.getShopNews(e);
        } else {
            that.getShopNews('undefined');
        }
        uni.getSystemInfo({
            success: function (t) {
                if (t.model.indexOf('iPhone') > -1) {
                    t.model = t.model.split('<')[0];
                }
                var e = t.windowWidth;
                var i = t.windowHeight;
                that.setData({
                    phonetype: {
                        name: t.model
                    }
                });
                that.getShopMobile(t.model, i, e);
            }
        });
    },
    onShow: function (t) {
        uni.showLoading({
            title: '加载中...',
            mask: true
        });
        var that = this;
        uni.getStorage({
            key: 'ppselc',
            success: function (t) {
                var e = 0;
                var i = 0;
                var s = t.data.bgimage;
                var c = t.data;
                uni.getImageInfo({
                    src: s,
                    success: function (t) {
                        e = t.width;
                        i = t.height;
                        uni.getSystemInfo({
                            success: function (t) {
                                if (e < i) {
                                    var h = t.windowHeight - 100;
                                    if ((g = (e / i) * (p = 0.72 * h)) > 0.66 * t.windowWidth) {
                                        g = 0.66 * t.windowWidth;
                                        p = (i / e) * g;
                                        var n = (0.66 * t.windowWidth - g) / 2;
                                        var o = 0.8 * t.windowHeight - p - 10;
                                        var d = 10;
                                        var l = '15%';
                                    } else {
                                        var n = (0.66 * t.windowWidth - g) / 2;
                                        var o = 0.8 * t.windowHeight - p - 10;
                                        var d = 10;
                                        var l = '15%';
                                    }
                                } else {
                                    var g = (h = 0.66 * t.windowWidth);
                                    var p = (i / e) * g;
                                    if (g > 0.66 * t.windowWidth) {
                                        g = 0.66 * t.windowWidth;
                                        p = (i / e) * g;
                                        var n = (0.66 * t.windowWidth - g) / 2;
                                        var o = 0.8 * t.windowHeight - p - 10;
                                        var d = 10;
                                        var l = '15%';
                                    } else {
                                        var n = (0.66 * t.windowWidth - g) / 2;
                                        var d = (o = (0.8 * t.windowHeight - p) / 2);
                                        var l = 0;
                                    }
                                }
                                that.setData({
                                    windowWidth: t.windowWidth,
                                    windowHeight: t.windowHeight,
                                    phonetype: c,
                                    bg: s,
                                    cheight: h,
                                    mheight: p,
                                    mwidth: g,
                                    cshow: false,
                                    left: n,
                                    imgw: e,
                                    imgh: i,
                                    xc: n,
                                    yc: d,
                                    fillw: n,
                                    fillh: o,
                                    masktop: d,
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
                    },
                    fail: function (t) {}
                });
            },
            fail: function () {
                uni.hideLoading();
            }
        });
        uni.getStorage({
            key: 'mb',
            success: function (t) {
                uni.getImageInfo({
                    src: t.data.url,
                    success: function (t) {
                        var e = [
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
                            mb: e,
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
                uni.getImageInfo({
                    src: t.data.url,
                    success: function (t) {
                        var e = [
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
                            tk: e,
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
                uni.getImageInfo({
                    src: t.data[0].url,
                    success: function (t) {
                        var e = t.path;
                        console.log(t);
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
                        var h = that.tt;
                        var n = {
                            url: e,
                            picw: i,
                            pich: s,
                            x: c,
                            y: that.masktop + (that.mheight - s) / 2,
                            scale: 1,
                            rotate: 0,
                            active: 'active',
                            zindex: 6
                        };
                        var o = {
                            w: i,
                            h: s,
                            x: c + 0.17 * that.windowWidth,
                            y: 0.1 * that.windowHeight + that.masktop + (that.mheight - s) / 2,
                            rotate: 0,
                            types: 'tt',
                            index: h.length
                        };
                        if (h.length > 0) {
                            for (var d = 0; d < h.length; d++) {
                                h[d].zindex = 5;
                            }
                        }
                        h.push(n);
                        that.setData({
                            tt: h,
                            addimgshow: true,
                            pk: o,
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
            path: '/pages/index/index?scene=' + app.globalData.shop_id
        };
    },
    methods: {
        getShopMobile: function (a, e, i) {
            var that = this;
            var c = 0;
            var h = 0;
            uni.showLoading({
                title: '加载中...',
                mask: true
            });
            if ('' != app.globalData.shop_id) {
                uni.request({
                    url: app.globalData.host + '/api/Index/searchMmobile',
                    data: {
                        model: a,
                        shop_id: app.globalData.shop_id
                    },
                    success: function (t) {
                        if (0 == t.data.code) {
                            uni.navigateTo({
                                url: '/pages/selecttypes/selecttypes'
                            });
                        } else {
                            var a = t.data.data;
                            uni.getImageInfo({
                                src: a.bgimage,
                                success: function (t) {
                                    c = t.width;
                                    h = t.height;
                                    if (c < h) {
                                        var n = (0.66 * i - (p = (c / h) * (w = 0.72 * (g = e - 100)))) / 2;
                                        var o = 0.8 * e - w - 10;
                                        var d = 10;
                                        var l = '15%';
                                    } else {
                                        var g = 0.66 * i;
                                        var p = g;
                                        var w = (h / c) * p;
                                        var n = (0.66 * i - p) / 2;
                                        var d = (o = (0.8 * e - w) / 2);
                                        var l = 0;
                                    }
                                    that.setData({
                                        windowWidth: i,
                                        windowHeight: e,
                                        phonetype: a,
                                        bg: a.bgimage,
                                        cheight: g,
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
                    that.getShopMobile(a, e, i);
                }, 1000);
            }
        },

        getShopNews: function (a) {
            var that = this;
            uni.showLoading({
                title: '加载中...',
                mask: true
            });
            if ('' != app.globalData.openid) {
                uni.request({
                    url: app.globalData.host + '/api/User/getShopnews',
                    data: {
                        shop_id: a,
                        openid: app.globalData.openid
                    },
                    success: function (a) {
                        if (1 == a.data.code) {
                            app.globalData.shop_id = a.data.data.id;
                            app.globalData.shop = a.data.data;
                            uni.setNavigationBarTitle({
                                title: a.data.data.nickname
                            });
                            uni.setStorage({
                                key: 'shop_id',
                                data: app.globalData.shop_id
                            });
                            uni.hideLoading();
                        }
                    }
                });
            } else {
                setTimeout(function () {
                    that.getShopNews(a);
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
                        var h = {
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
                            pk: h,
                            kshow: false
                        });
                    }
                });
            } else {
                a[0].clock = '/static/img/clock1.png';
                that.setData({
                    mb: a
                });
            }
        },

        tkclock: function () {
            var that = this;
            var a = this.tk;
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
                        var h = {
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
                            pk: h,
                            kshow: false
                        });
                    }
                });
            } else {
                a[0].clock = '/static/img/clock1.png';
                that.setData({
                    tk: a
                });
            }
        },

        eidttype: function () {
            uni.navigateTo({
                url: '/pages/selecttypes/selecttypes'
            });
        },

        addimg: function () {
            var t = this.pics;
            var that = this;
            uni.chooseImage({
                count: 1,
                sizeType: ['original'],
                sourceType: ['album', 'camera'],
                success: function (e) {
                    var i = e.tempFilePaths[0];
                    uni.getImageInfo({
                        src: i,
                        success: function (e) {
                            var s = e.width;
                            s = (s / e.height) * that.mheight;
                            var c = (0.66 * that.windowWidth - s) / 2;
                            var h = {
                                url: i,
                                picw: s,
                                pich: that.mheight,
                                x: c,
                                y: that.masktop,
                                scale: 1,
                                rotate: 0,
                                active: 'active',
                                zindex: 4
                            };
                            var n = {
                                w: s,
                                h: that.mheight,
                                x: c + 0.17 * that.windowWidth,
                                y: 0.1 * that.windowHeight + that.masktop,
                                rotate: 0,
                                types: 'pics',
                                index: t.length
                            };
                            if (t.length > 0) {
                                for (d = 0; d < t.length; d++) {
                                    t[d].zindex = 3;
                                    t[d].active = '';
                                }
                            }
                            var o = that.tt;
                            if (o.length > 0) {
                                for (var d = 0; d < o.length; d++) {
                                    o[d].zindex = 5;
                                    o[d].active = '';
                                }
                            }
                            t.push(h);
                            that.setData({
                                pics: t,
                                tt: o,
                                addimgshow: true,
                                pk: n,
                                kshow: false
                            });
                        }
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

        delpkpic: function (t) {
            var a = this.pk;
            var e = this[a.types];
            e.splice(a.index, 1);
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
            a.splice(t.target.dataset.idx, 1);
            this.setData({
                textimgs: a,
                kshow: true
            });
        },

        bindGetUserInfo: function (a) {
            uni.showLoading({
                title: '提交数据...',
                mask: true
            });
            var that = this;
            var i = a.detail.userInfo.avatarUrl;
            var s = a.detail.userInfo.nickName;
            uni.showLoading({
                title: s,
                mask: true
            });
            wx;
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
                success: function (a) {
                    if (1 == a.data.code) {
                        app.globalData.userInfo = a.data.data;
                        that.setData({
                            canIUse: false
                        });
                        that.submitdata();
                    }
                },
                fail: function (t) {
                    uni.showLoading({
                        title: JSON.stringify(t),
                        mask: true
                    });
                },
                complete: function (t) {}
            });
        },

        submitdata: function () {
            if ('' != this.tk || 0 != this.pics.length || '' != this.mb || 0 != this.tt.length || 0 != this.textimgs.length) {
                uni.showLoading({
                    title: '图片生成中...',
                    mask: true
                });
                var that = this;
                a.clearRect(0, 0, that.imgw, that.imgh);
                a.fillStyle = '#ffffff';
                a.fillRect(0, 0, that.imgw, that.imgh);
                a.save();
                var e = this.tk;
                var i = that.imgw / that.mwidth;
                var s = that.imgh / that.mheight;
                if (e.length > 0) {
                    for (var c = 0; c < e.length; c++) {
                        var h = e[c];
                        var n = h.x - that.xc - (h.picw * (h.scale - 1)) / 2;
                        var o = h.y - that.yc - (h.pich * (h.scale - 1)) / 2;
                        var d = n + (h.picw * h.scale) / 2;
                        var l = o + (h.pich * h.scale) / 2;
                        a.save();
                        a.translate(d * i, l * s);
                        a.rotate((h.rotate * Math.PI) / 180);
                        a.translate(-d * i, -l * s);
                        a.drawImage(h.url, n * i, o * s, h.picw * h.scale * i, h.pich * h.scale * s);
                        a.restore();
                    }
                    this.drawpic();
                } else {
                    this.drawpic();
                }
            } else {
                uni.showToast({
                    title: '未选中任何图片！',
                    icon: 'loading',
                    duration: 1000
                });
            }
        },

        drawpic: function () {
            var that = this;
            var e = that.imgw / that.mwidth;
            var i = that.imgh / that.mheight;
            var s = this.pics;
            if (s.length > 0) {
                for (var c = 0; c < s.length; c++) {
                    var h = s[c];
                    var n = h.x - that.xc - (h.picw * (h.scale - 1)) / 2;
                    var o = h.y - that.yc - (h.pich * (h.scale - 1)) / 2;
                    var d = n + (h.picw * h.scale) / 2;
                    var l = o + (h.pich * h.scale) / 2;
                    a.save();
                    a.translate(d * e, l * i);
                    a.rotate((h.rotate * Math.PI) / 180);
                    a.translate(-d * e, -l * i);
                    a.drawImage(h.url, n * e, o * i, h.picw * h.scale * e, h.pich * h.scale * i);
                    a.restore();
                    if (c == s.length - 1) {
                        this.drawmb();
                    }
                }
            } else {
                this.drawmb();
            }
        },

        drawmb: function () {
            var that = this;
            var e = this.mb;
            var i = that.imgw / that.mwidth;
            var s = that.imgh / that.mheight;
            if (e.length > 0) {
                for (var c = 0; c < e.length; c++) {
                    var h = e[c];
                    var n = h.x - that.xc - (h.picw * (h.scale - 1)) / 2;
                    var o = h.y - that.yc - (h.pich * (h.scale - 1)) / 2;
                    var d = n + (h.picw * h.scale) / 2;
                    var l = o + (h.pich * h.scale) / 2;
                    a.save();
                    a.translate(d * i, l * s);
                    a.rotate((h.rotate * Math.PI) / 180);
                    a.translate(-d * i, -l * s);
                    a.drawImage(h.url, n * i, o * s, h.picw * h.scale * i, h.pich * h.scale * s);
                    a.restore();
                }
                this.drawtt();
            } else {
                this.drawtt();
            }
        },

        drawtt: function () {
            var that = this;
            var e = that.imgw / that.mwidth;
            var i = that.imgh / that.mheight;
            var s = this.tt;
            if (s.length > 0) {
                for (var c = 0; c < s.length; c++) {
                    var h = s[c];
                    var n = h.x - that.xc - (h.picw * (h.scale - 1)) / 2;
                    var o = h.y - that.yc - (h.pich * (h.scale - 1)) / 2;
                    var d = n + (h.picw * h.scale) / 2;
                    var l = o + (h.pich * h.scale) / 2;
                    a.save();
                    a.translate(d * e, l * i);
                    a.rotate((h.rotate * Math.PI) / 180);
                    a.translate(-d * e, -l * i);
                    a.drawImage(h.url, n * e, o * i, h.picw * h.scale * e, h.pich * h.scale * i);
                    a.restore();
                    if (c == s.length - 1) {
                        this.drawtext();
                    }
                }
            } else {
                this.drawtext();
            }
        },

        drawtext: function () {
            var that = this;
            var i = that.imgw / that.mwidth;
            var s = that.imgh / that.mheight;
            var c = this.textimgs;
            if (c.length > 0) {
                for (var h = 0; h < c.length; h++) {
                    var n = c[h];
                    var o = n.x - that.xc - (n.picw * (n.scale - 1)) / 2;
                    var d = n.y - that.yc - (n.pich * (n.scale - 1)) / 2;
                    var l = o + (n.picw * n.scale) / 2;
                    var g = d + (n.pich * n.scale) / 2;
                    a.save();
                    a.translate(l * i, g * s);
                    a.rotate((n.rotate * Math.PI) / 180);
                    a.translate(-l * i, -g * s);
                    a.drawImage(n.url, o * i, d * s, n.picw * n.scale * i, n.pich * n.scale * s);
                    a.restore();
                }
            }
            a.draw(false, function () {
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
                    success: function (a) {
                        app.globalData.imgurl = a.tempFilePath;
                        uni.setStorage({
                            key: 'phonetype',
                            data: that.phonetype
                        });
                        uni.navigateTo({
                            url: '/pages/ordersure/ordersure'
                        });
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
            c = t.target.dataset.idx;
            s = t.target.dataset.types;
            var a = this.pics;
            var i = this.tt;
            var h = this.textimgs;
            var n = [];
            var o = [];
            var d = [];
            if ('pics' == s) {
                for (l = 0; l < a.length; l++) {
                    if (l != c) {
                        a[l].zindex = 3;
                        n.push(a[l]);
                    }
                }
                a[c].zindex = 4;
                n.push(a[c]);
                g = {
                    w: a[c].picw * a[c].scale,
                    h: a[c].pich * a[c].scale,
                    x: 0.17 * this.windowWidth + a[c].x + (a[c].picw - a[c].picw * a[c].scale) / 2,
                    y: 0.1 * this.windowHeight + a[c].y + (a[c].pich - a[c].pich * a[c].scale) / 2,
                    rotate: a[c].rotate,
                    types: 'pics',
                    index: n.length - 1
                };
                this.setData({
                    pics: n,
                    tt: i,
                    textimgs: h,
                    pk: g,
                    kshow: false
                });
            } else if ('tt' == s) {
                for (l = 0; l < i.length; l++) {
                    if (l != c) {
                        i[l].zindex = 5;
                        o.push(i[l]);
                    }
                }
                i[c].zindex = 6;
                o.push(i[c]);
                g = {
                    w: i[c].picw * i[c].scale,
                    h: i[c].pich * i[c].scale,
                    x: 0.17 * this.windowWidth + i[c].x + (i[c].picw - i[c].picw * i[c].scale) / 2,
                    y: 0.1 * this.windowHeight + i[c].y + (i[c].pich - i[c].pich * i[c].scale) / 2,
                    rotate: i[c].rotate,
                    types: 'tt',
                    index: o.length - 1
                };
                this.setData({
                    pics: a,
                    tt: o,
                    textimgs: h,
                    pk: g,
                    kshow: false
                });
            } else if ('textimgs' == s) {
                for (var l = 0; l < h.length; l++) {
                    if (l != c) {
                        h[l].zindex = 5;
                        d.push(h[l]);
                    }
                }
                h[c].zindex = 6;
                d.push(h[c]);
                var g = {
                    w: h[c].picw * h[c].scale,
                    h: h[c].pich * h[c].scale,
                    x: 0.17 * this.windowWidth + h[c].x + (h[c].picw - h[c].picw * h[c].scale) / 2,
                    y: 0.1 * this.windowHeight + h[c].y + (h[c].pich - h[c].pich * h[c].scale) / 2,
                    rotate: h[c].rotate,
                    types: 'textimgs',
                    index: d.length - 1
                };
                this.setData({
                    pics: a,
                    tt: i,
                    textimgs: d,
                    pk: g,
                    kshow: false
                });
            }
            if (t.touches.length < 2) {
                e = true;
                p.x = t.touches[0].pageX;
                p.y = t.touches[0].pageY;
            } else {
                w.x1 = t.touches[0].pageX;
                w.y1 = t.touches[0].pageY;
                w.x2 = t.touches[1].pageX;
                w.y2 = t.touches[1].pageY;
            }
        },

        bindtouchstart: function (t) {
            s = this.pk.types;
            c = this.pk.index;
            var a = this.pics;
            var i = this.tt;
            var h = this.textimgs;
            var n = this.mb;
            var o = this.tk;
            if ('pics' == s) {
                if (a.length > 0) {
                    for (d = 0; d < a.length; d++) {
                        a[d].zindex = 3;
                    }
                }
                a[c].zindex = 4;
                l = {
                    w: a[c].picw * a[c].scale,
                    h: a[c].pich * a[c].scale,
                    x: 0.17 * this.windowWidth + a[c].x + (a[c].picw - a[c].picw * a[c].scale) / 2,
                    y: 0.1 * this.windowHeight + a[c].y + (a[c].pich - a[c].pich * a[c].scale) / 2,
                    rotate: a[c].rotate,
                    types: 'pics',
                    index: c
                };
                this.setData({
                    pics: a,
                    tt: i,
                    textimgs: h,
                    mb: n,
                    tk: o,
                    pk: l
                });
            } else if ('tt' == s) {
                if (h.length > 0) {
                    for (d = 0; d < i.length; d++) {
                        i[d].zindex = 5;
                    }
                }
                i[c].zindex = 6;
                l = {
                    w: i[c].picw * i[c].scale,
                    h: i[c].pich * i[c].scale,
                    x: 0.17 * this.windowWidth + i[c].x + (i[c].picw - i[c].picw * i[c].scale) / 2,
                    y: 0.1 * this.windowHeight + i[c].y + (i[c].pich - i[c].pich * i[c].scale) / 2,
                    rotate: i[c].rotate,
                    types: 'tt',
                    index: c
                };
                this.setData({
                    pics: a,
                    tt: i,
                    textimgs: h,
                    mb: n,
                    tk: o,
                    pk: l
                });
            } else if ('textimgs' == s) {
                if (h.length > 0) {
                    for (var d = 0; d < h.length; d++) {
                        h[d].zindex = 5;
                    }
                }
                h[c].zindex = 6;
                l = {
                    w: h[c].picw * h[c].scale,
                    h: h[c].pich * h[c].scale,
                    x: 0.17 * this.windowWidth + h[c].x + (h[c].picw - h[c].picw * h[c].scale) / 2,
                    y: 0.1 * this.windowHeight + h[c].y + (h[c].pich - h[c].pich * h[c].scale) / 2,
                    rotate: h[c].rotate,
                    types: 'textimgs',
                    index: c
                };
                this.setData({
                    pics: a,
                    tt: i,
                    textimgs: h,
                    mb: n,
                    tk: o,
                    pk: l
                });
            } else if ('mb' == s) {
                n[c].zindex = 6;
                l = {
                    w: n[c].picw * n[c].scale,
                    h: n[c].pich * n[c].scale,
                    x: 0.17 * this.windowWidth + n[c].x + (n[c].picw - n[c].picw * n[c].scale) / 2,
                    y: 0.1 * this.windowHeight + n[c].y + (n[c].pich - n[c].pich * n[c].scale) / 2,
                    rotate: n[c].rotate,
                    types: 'mb',
                    index: c
                };
                this.setData({
                    pics: a,
                    tt: i,
                    textimgs: h,
                    mb: n,
                    tk: o,
                    pk: l
                });
            } else if ('tk' == s) {
                o[c].zindex = 6;
                var l = {
                    w: o[c].picw * o[c].scale,
                    h: o[c].pich * o[c].scale,
                    x: 0.17 * this.windowWidth + o[c].x + (o[c].picw - o[c].picw * o[c].scale) / 2,
                    y: 0.1 * this.windowHeight + o[c].y + (o[c].pich - o[c].pich * o[c].scale) / 2,
                    rotate: o[c].rotate,
                    types: 'tk',
                    index: c
                };
                this.setData({
                    pics: a,
                    tt: i,
                    textimgs: h,
                    mb: n,
                    tk: o,
                    pk: l
                });
            }
            if (t.touches.length < 2) {
                e = true;
                p.x = t.touches[0].pageX;
                p.y = t.touches[0].pageY;
            } else {
                w.x1 = t.touches[0].pageX;
                w.y1 = t.touches[0].pageY;
                w.x2 = t.touches[1].pageX;
                w.y2 = t.touches[1].pageY;
            }
        },

        bindtouchmove: function (t) {
            var that = this;
            var i = this[s];
            var h = this.pk;
            if (t.touches.length < 2 && e) {
                var n = t.touches[0].pageX - p.x;
                var o = t.touches[0].pageY - p.y;
                i[c].x = i[c].x + n;
                h.x = 0.17 * this.windowWidth + i[c].x + (i[c].picw - i[c].picw * i[c].scale) / 2;
                i[c].y = i[c].y + o;
                h.y = 0.1 * this.windowHeight + i[c].y + (i[c].pich - i[c].pich * i[c].scale) / 2;
                if ('pics' == s) {
                    that.setData({
                        pics: i,
                        pk: h
                    });
                } else {
                    if ('tt' == s) {
                        that.setData({
                            tt: i,
                            pk: h
                        });
                    } else {
                        if ('textimgs' == s) {
                            that.setData({
                                textimgs: i,
                                pk: h
                            });
                        } else {
                            if ('mb' == s) {
                                that.setData({
                                    mb: i,
                                    pk: h
                                });
                            } else {
                                if ('tk' == s) {
                                    that.setData({
                                        tk: i,
                                        pk: h
                                    });
                                }
                            }
                        }
                    }
                }
                p.x = t.touches[0].pageX;
                p.y = t.touches[0].pageY;
            } else if (t.touches.length > 1) {
                var d = JSON.parse(JSON.stringify(w));
                w.x1 = t.touches[0].pageX;
                w.y1 = t.touches[0].pageY;
                w.x2 = t.touches[1].pageX;
                w.y2 = t.touches[1].pageY;
                var l = (360 * Math.atan((d.y1 - d.y2) / (d.x1 - d.x2))) / Math.PI;
                var g = (360 * Math.atan((w.y1 - w.y2) / (w.x1 - w.x2))) / Math.PI;
                if (Math.abs(l - g) > 1) {
                    return;
                }
                var r = Math.sqrt(Math.pow(d.x1 - d.x2, 2) + Math.pow(d.y1 - d.y2, 2));
                var m = Math.sqrt(Math.pow(w.x1 - w.x2, 2) + Math.pow(w.y1 - w.y2, 2));
                i[c].scale = i[c].scale + 0.005 * (m - r);
                if (i[c].scale > 0.08) {
                    var x = m - r;
                    var v = x / i[c].picw;
                    i[c].picw += x;
                    i[c].pich += i[c].pich * v;
                    i[c].x -= x / 2;
                    i[c].y -= x / 2;
                    i[c].scale = 1;
                    h.x = h.x + (h.w - i[c].picw * i[c].scale) / 2;
                    h.y = h.y - x / 2;
                    h.w = i[c].picw * i[c].scale;
                    h.h = i[c].pich * i[c].scale;
                    var f = 1 + Math.pow(1 - i[c].scale, 2);
                    if ('pics' == s) {
                        that.setData({
                            pics: i,
                            pk: h,
                            bscale: f
                        });
                    } else {
                        if ('tt' == s) {
                            that.setData({
                                tt: i,
                                pk: h,
                                bscale: f
                            });
                        } else {
                            if ('textimgs' == s) {
                                that.setData({
                                    textimgs: i,
                                    pk: h,
                                    bscale: f
                                });
                            } else {
                                if ('mb' == s) {
                                    that.setData({
                                        mb: i,
                                        pk: h,
                                        bscale: f
                                    });
                                } else {
                                    if ('tk' == s) {
                                        that.setData({
                                            tk: i,
                                            pk: h,
                                            bscale: f
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        bindtouchend: function (t) {
            e = false;
        },

        kdtouchstart: function (t) {
            i = true;
            p.x = t.touches[0].pageX;
            p.y = t.touches[0].pageY;
            if ('xz' == t.target.dataset.kn) {
                r.x = t.touches[0].pageX;
                r.y = t.touches[0].pageY;
                g = true;
            }
        },

        kdtouchmove: function (t) {
            if (i) {
                var that = this;
                var e = this[t.target.dataset.types];
                var h = this.pk;
                c = t.target.dataset.idx;
                s = t.target.dataset.types;
                if ('kd' == t.target.dataset.kn) {
                    var n = e[c].x + e[c].picw / 2 + 0.17 * that.windowWidth;
                    var o = e[c].y + e[c].pich / 2 + 0.1 * that.windowHeight;
                    var d = Math.sqrt(Math.pow(n - p.x, 2) + Math.pow(o - p.y, 2));
                    var l = Math.sqrt(Math.pow(n - t.touches[0].pageX, 2) + Math.pow(o - t.touches[0].pageY, 2));
                    e[c].scale = e[c].scale + 0.005 * (l - d);
                    h.x = h.x + (h.w - e[c].picw * e[c].scale) / 2;
                    h.y = h.y + (h.h - e[c].pich * e[c].scale) / 2;
                    h.w = e[c].picw * e[c].scale;
                    h.h = e[c].pich * e[c].scale;
                    var g = 1 - e[c].scale + 1;
                    if ('pics' == s) {
                        that.setData({
                            pics: e,
                            pk: h,
                            bscale: g
                        });
                    } else {
                        if ('tt' == s) {
                            that.setData({
                                tt: e,
                                pk: h,
                                bscale: g
                            });
                        } else {
                            if ('textimgs' == s) {
                                that.setData({
                                    textimgs: e,
                                    pk: h,
                                    bscale: g
                                });
                            } else {
                                if ('mb' == s) {
                                    that.setData({
                                        mb: e,
                                        pk: h,
                                        bscale: g
                                    });
                                } else {
                                    if ('tk' == s) {
                                        that.setData({
                                            tk: e,
                                            pk: h,
                                            bscale: g
                                        });
                                    }
                                }
                            }
                        }
                    }
                } else if ('xz' == t.target.dataset.kn) {
                    var n = e[c].x + e[c].picw / 2 + 0.17 * that.windowWidth;
                    var o = e[c].y + e[c].pich / 2 + 0.1 * that.windowHeight;
                    that.setData({
                        zx: n,
                        zy: o
                    });
                    console.log(e[c].rotate);
                    var w = Math.atan((p.y - o) / (p.x - n));
                    var r = Math.atan((t.touches[0].pageY - o) / (t.touches[0].pageX - n));
                    console.log('perAngle', w);
                    console.log('curAngle', r);
                    e[c].rotate = e[c].rotate + r - w;
                    h.rotate = e[c].rotate;
                    if ('pics' == s) {
                        that.setData({
                            pics: e,
                            pk: h
                        });
                    } else {
                        if ('tt' == s) {
                            that.setData({
                                tt: e,
                                pk: h
                            });
                        } else {
                            if ('textimgs' == s) {
                                that.setData({
                                    textimgs: e,
                                    pk: h
                                });
                            } else {
                                if ('mb' == s) {
                                    that.setData({
                                        mb: e,
                                        pk: h
                                    });
                                } else {
                                    if ('tk' == s) {
                                        that.setData({
                                            tk: e,
                                            pk: h
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                p.x = t.touches[0].pageX;
                p.y = t.touches[0].pageY;
            }
        },

        kdtouchend: function (t) {
            i = false;
            m.x = 0;
            m.y = 0;
            r.x = 0;
            r.y = 0;
            g = true;
            l = 0;
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
            d = false;
        },

        selectfamily: function (t) {
            for (var a = this.falimys, e = 0; e < a.length; e++) {
                a[e].active = '';
            }
            a[t.target.dataset.idx].active = 'active';
            this.setData({
                falimys: a
            });
            h = a[t.target.dataset.idx].val;
        },

        selectcolor: function (t) {
            for (var a = this.colors, e = 0; e < a.length; e++) {
                a[e].active = '';
            }
            a[t.currentTarget.dataset.idx].active = 'active';
            this.setData({
                colors: a
            });
            n = a[t.currentTarget.dataset.idx].val;
        },

        fxbtn: function (t) {
            var a = this.fx;
            a[0].active = '';
            a[1].active = '';
            a[t.target.dataset.idx].active = 'active';
            if ('active' == a[0].active) {
                if ('' == o) {
                    this.setData({
                        textwidth: 600,
                        textheight: 80,
                        fx: a
                    });
                } else {
                    var e = uni.createCanvasContext('textcanvas');
                    e.font = '50px ' + h;
                    var i = e.measureText(o);
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
            o = t.detail.value;
            this.setData({
                inputval: o
            });
        },

        surebtn: function () {
            var a = this.inputval;
            if ('' != a) {
                for (var e = this.textimgs, i = this.colors, s = this.falimys, c = this.fx, n = '', o = 0; o < i.length; o++) {
                    if ('active' == i[o].active) {
                        n = i[o].name;
                    }
                }
                for (o = 0; o < s.length; o++) {
                    if ('active' == s[o].active) {
                        h = s[o].name;
                    }
                }
                for (o = 0; o < c.length; o++) {
                    if ('active' == c[o].active) {
                        c = c[o].name;
                    }
                }
                if (d) {
                    var l = this.pk;
                    e.splice(l.index, 1);
                    d = false;
                }
                var that = this;
                uni.request({
                    url: app.globalData.host + '/api/index/textToImage',
                    data: {
                        shop_id: 1,
                        selectcolor: n,
                        selectfamily: h,
                        fx: c,
                        val: a
                    },
                    success: function (t) {
                        var a = t.data.data;
                        uni.getImageInfo({
                            src: a,
                            success: function (t) {
                                var a = t.path;
                                var i = 0.5 * t.width;
                                var s = 0.5 * t.height;
                                var c = (0.6 * that.windowWidth - i) / 2;
                                var h = that.masktop + (that.mheight - s) / 2;
                                var n = {
                                    url: a,
                                    picw: i,
                                    pich: s,
                                    x: c,
                                    y: h,
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
                                    for (var o = 0; o < e.length; o++) {
                                        e[o].zindex = 5;
                                        e[o].active = '';
                                    }
                                }
                                var d = {
                                    w: i,
                                    h: s,
                                    x: c + 0.17 * that.windowWidth,
                                    y: 0.1 * that.windowHeight + h,
                                    rotate: 0,
                                    types: 'textimgs',
                                    index: e.length
                                };
                                e.push(n);
                                that.setData({
                                    textimgs: e,
                                    addimgshow: true,
                                    addshow: false,
                                    kshow: false,
                                    pk: d,
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
                    title: '请输入文字',
                    mask: true,
                    icon: 'loading',
                    duration: 2000
                });
            }
        },

        catchtxt: function () {
            d = false;
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
            d = false;
            this.setData({
                kshow: true
            });
        },

        selcttext: function (t) {
            w = this.pk;
            s = t.currentTarget.dataset.types;
            c = t.currentTarget.dataset.ind;
            if (1 == d && 'textimgs' == s && w.index == c) {
                i = this.textimgs;
                this.setData({
                    addshow: true,
                    falimys: i[c].falimys,
                    fx: i[c].fx,
                    colors: i[c].colors,
                    inputval: i[c].text
                });
            } else {
                for (var a = this.pics, e = this.tt, i = this.textimgs, h = this.tk, n = this.mb, o = [], l = [], g = [], p = 0; p < a.length; p++) {
                    if (p != c) {
                        a[p].zindex = 3;
                        o.push(a[p]);
                    }
                }
                for (p = 0; p < e.length; p++) {
                    if (p != c) {
                        e[p].zindex = 5;
                        l.push(e[p]);
                    }
                }
                for (p = 0; p < i.length; p++) {
                    if (p != c) {
                        i[p].zindex = 5;
                        g.push(i[p]);
                    }
                }
                if ('pics' == s) {
                    d = false;
                    a[c].zindex = 4;
                    o.push(a[c]);
                    w = {
                        w: a[c].picw * a[c].scale,
                        h: a[c].pich * a[c].scale,
                        x: 0.17 * this.windowWidth + a[c].x + (a[c].picw - a[c].picw * a[c].scale) / 2,
                        y: 0.1 * this.windowHeight + a[c].y + (a[c].pich - a[c].pich * a[c].scale) / 2,
                        rotate: a[c].rotate,
                        types: 'pics',
                        index: o.length - 1
                    };
                    this.setData({
                        pics: o,
                        tt: e,
                        textimgs: i,
                        pk: w,
                        tk: h,
                        mb: n,
                        kshow: false
                    });
                } else if ('tt' == s) {
                    d = false;
                    e[c].zindex = 6;
                    l.push(e[c]);
                    w = {
                        w: e[c].picw * e[c].scale,
                        h: e[c].pich * e[c].scale,
                        x: 0.17 * this.windowWidth + e[c].x + (e[c].picw - e[c].picw * e[c].scale) / 2,
                        y: 0.1 * this.windowHeight + e[c].y + (e[c].pich - e[c].pich * e[c].scale) / 2,
                        rotate: e[c].rotate,
                        types: 'tt',
                        index: l.length - 1
                    };
                    this.setData({
                        pics: a,
                        tt: l,
                        textimgs: i,
                        pk: w,
                        tk: h,
                        mb: n,
                        kshow: false
                    });
                } else if ('textimgs' == s) {
                    i[c].zindex = 6;
                    g.push(i[c]);
                    w = {
                        w: i[c].picw * i[c].scale,
                        h: i[c].pich * i[c].scale,
                        x: 0.17 * this.windowWidth + i[c].x + (i[c].picw - i[c].picw * i[c].scale) / 2,
                        y: 0.1 * this.windowHeight + i[c].y + (i[c].pich - i[c].pich * i[c].scale) / 2,
                        rotate: i[c].rotate,
                        types: 'textimgs',
                        index: g.length - 1
                    };
                    d = true;
                    this.setData({
                        pics: a,
                        tt: e,
                        textimgs: g,
                        pk: w,
                        tk: h,
                        mb: n,
                        kshow: false
                    });
                } else if ('tk' == s) {
                    w = {
                        w: h[(c = 0)].picw * h[c].scale,
                        h: h[c].pich * h[c].scale,
                        x: 0.17 * this.windowWidth + h[c].x + (h[c].picw - h[c].picw * h[c].scale) / 2,
                        y: 0.1 * this.windowHeight + h[c].y + (h[c].pich - h[c].pich * h[c].scale) / 2,
                        rotate: h[c].rotate,
                        types: 'tk',
                        index: c
                    };
                    d = true;
                    this.setData({
                        pics: a,
                        tt: e,
                        textimgs: i,
                        pk: w,
                        tk: h,
                        mb: n,
                        kshow: false
                    });
                } else if ('mb' == s) {
                    var w = {
                        w: n[(c = 0)].picw * n[c].scale,
                        h: n[c].pich * n[c].scale,
                        x: 0.17 * this.windowWidth + n[c].x + (n[c].picw - n[c].picw * n[c].scale) / 2,
                        y: 0.1 * this.windowHeight + n[c].y + (n[c].pich - n[c].pich * n[c].scale) / 2,
                        rotate: n[c].rotate,
                        types: 'mb',
                        index: c
                    };
                    d = true;
                    this.setData({
                        pics: a,
                        tt: e,
                        textimgs: i,
                        pk: w,
                        tk: h,
                        mb: n,
                        kshow: false
                    });
                }
            }
        }
    }
};
</script>
<style>
page {
    background: #ebebeb;
    overflow: hidden;
    font-size: 0.8rem;
    width: 100%;
    height: 100%;
}

.head {
    display: flex;
    padding: 2%;
    font-size: 1rem;
    background: #fff;
    justify-content: space-between;
    line-height: 30px;
    position: absolute;
    z-index: 1900;
    width: 96%;
}

.head image {
    width: 20px;
    height: 20px;
    margin-top: 5px;
}

.head button {
    height: 30px;
    background: #f8441f;
    color: #fff;
    line-height: 30px;
    font-size: 0.75rem;
    margin-right: 0;
}

.head .ge {
    width: 2px;
    height: 17px;
    background: #ebebeb;
    margin: 5px 10px;
}

.head .edit {
    color: #4e9ef9;
}

.pm-top {
    opacity: 0.9;
    position: relative;
    z-index: 13;
    background: #fff;
    width: 100%;
    height: 10%;
    overflow: hidden;
}

.pm-left {
    float: left;
}

.pm-left,
.pm-right {
    position: relative;
    z-index: 13;
    opacity: 0.9;
    width: 17%;
    height: 80%;
    background: #fff;
}

.pm-right {
    float: right;
}

.pm-bottom {
    z-index: 13;
    filter: alpha(opacity=90);
    opacity: 0.9;
    height: 10%;
    clear: both;
    text-align: center;
    overflow: hidden;
    color: #666;
}

.content,
.pm-bottom {
    position: relative;
    background: #fff;
}

.content {
    z-index: 12;
    width: 66%;
    height: 80%;
    float: left;
}

.fill-top {
    width: 100%;
    top: 0;
    height: 10px;
}

.fill-l,
.fill-top {
    pointer-events: none;
    opacity: 0.9;
    z-index: 1998;
    position: absolute;
    left: 0;
    background: #fff;
}

.fill-l {
    top: 10px;
}

.fill-r {
    right: 0;
    top: 10px;
}

.fill-b,
.fill-r {
    pointer-events: none;
    opacity: 0.9;
    z-index: 1998;
    position: absolute;
    background: #fff;
}

.fill-b {
    left: 0;
    bottom: 0;
    width: 100%;
}

.mask {
    z-index: 1999;
}

.mask,
.mbimg {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background-size: 100% 100%;
    pointer-events: none;
}

.mbimg {
    z-index: 4;
}

.addimg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    z-index: 32;
    width: 40px;
    height: 40px;
    background: #f8441f;
    padding: 10px;
    border-radius: 100%;
}

.left {
    top: 20%;
    left: 10%;
}

.left,
.right {
    position: absolute;
    z-index: 32;
    padding: 10px;
    font-size: 0.75rem;
    margin: 0 auto;
    width: 20px;
    line-height: 18px;
}

.right {
    top: 15%;
    left: 78%;
}

.wenzi {
    position: absolute;
    top: 65%;
    left: 0;
    z-index: 32;
    padding: 5px;
    font-size: 0.75rem;
    color: #f8441f;
    text-align: center;
}

.wenzi image {
    width: 15px;
    height: 15px;
    background: #f8441f;
    padding: 10px;
    border-radius: 100%;
}

.add {
    position: absolute;
    top: 77%;
    left: 0;
    z-index: 32;
    padding: 5px;
    font-size: 0.75rem;
    color: #f8441f;
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
}

.addimgbtn {
    width: 40px;
    height: 40px;
    border-radius: 100%;
    margin-left: 2px;
}

.add .list {
    margin-left: 10px;
    display: flex;
    flex-wrap: wrap;
}

.add .li {
    border: 1px solid #f8441f;
    border-radius: 5px;
    position: relative;
    margin-left: 10px;
    display: inline-block;
    height: 60px;
    margin-top: 8px;
}

.add .li .imgcl {
    width: 60px;
    height: 60px;
    margin-top: 0;
}

.add .li .close {
    color: #f8441f;
    border: 1px solid #f8441f;
    width: 16px;
    height: 16px;
    line-height: 16px;
    text-align: center;
    position: absolute;
    right: -8px;
    top: -8px;
    border-radius: 16px;
    background: #fff;
}

.clock {
    width: 25px;
    height: 25px;
    bottom: 0;
}

.clock,
.types {
    position: absolute;
    left: 0;
}

.types {
    text-align: center;
    font-size: 0.75rem;
    top: 5%;
    width: 100%;
}

.types text {
    color: #f8441f;
}

.section {
    line-height: 82rpx;
    border-top: 2rpx solid #f2f3f5;
    border-bottom: 2rpx solid #f2f3f5;
    display: flex;
    justify-content: space-between;
    box-sizing: content-box;
    position: relative;
}

.sel {
    padding: 0 60rpx 0 30rpx;
    font-size: 32rpx;
    color: #3f4552;
}

.picker {
    position: relative;
}

.triangle {
    display: block;
    width: 20rpx;
    height: 12rpx;
    position: absolute;
    top: 46%;
    right: -30rpx;
    transition: transform 0.2s ease-in;
    transition: transform 0.2s ease-in, -webkit-transform 0.2s ease-in;
}

.triangle::before {
    right: 0;
    border-left: 10rpx solid transparent;
    border-top: 10rpx solid #9fa8b7;
    border-right: 10rpx solid transparent;
}

.triangle::before,
.triangle:after {
    content: '';
    position: absolute;
    top: 0;
    width: 0;
    height: 0;
}

.triangle:after {
    right: 2rpx;
    border-left: 8rpx solid transparent;
    border-top: 8rpx solid #fff;
    border-right: 8rpx solid transparent;
}

.picker.active {
    color: #3a78ff;
}

.picker.active .triangle {
    transform: rotate(180deg);
}

.picker.active .triangle::before {
    border-top: 10rpx solid #3a78ff;
}

.rank-active {
    width: 100%;
    position: absolute;
    top: 80rpx;
    background: #fff;
    display: none;
    transition: all 0.2s;
}

.rank-active.active {
    display: block;
}

.rank-active .scroll-list {
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    border-top: 2rpx solid #f2f3f5;
    border-bottom: 2rpx solid #f2f3f5;
}

.rank-active .scroll-list scroll-view {
    height: 371rpx;
    padding: 0 30rpx;
}

.rank-active .scroll-list scroll-view:nth-child(2) {
    background: #f9f9f9;
}

.rank-active .scroll-list scroll-view view {
    line-height: 90rpx;
    color: #3f4552;
    font-size: 30rpx;
    border-bottom: 2rpx solid #efefef;
}

.rank-active .scroll-list scroll-view view.active {
    color: #3a78ff;
}

.rank-active .scroll-list scroll-view view:last-child {
    border-bottom: none;
}

.button {
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 0 30rpx;
    line-height: 98rpx;
    font-size: 32rpx;
    color: #9fa8b7;
}

.button view:last-child {
    color: #3a78ff;
}

.rank-active-bg {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: none;
}

.rank-active-bg.active {
    display: block;
}

.picslist {
    position: absolute;
}

.picslist.active {
    border: 1px dashed #f8441f;
}

.picslist .del {
    background: #f8441f;
    border-radius: 20px;
    width: 15px;
    height: 15px;
    position: absolute;
    left: -12.5px;
    top: -12.5px;
    padding: 5px;
    z-index: 10;
}

.picslist .kd {
    bottom: -12.5px;
    background: #047b00;
}

.picslist .kd,
.picslist .xz {
    border-radius: 25px;
    width: 15px;
    height: 15px;
    position: absolute;
    right: -12.5px;
    padding: 5px;
    z-index: 10;
}

.picslist .xz {
    top: -12.5px;
    background: #d3941e;
}

.textedit {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    position: absolute;
    bottom: 9%;
    padding-bottom: 5px;
    z-index: 40;
}

.familylist {
    width: 100%;
    overflow-x: auto;
}

.scroll-view_H {
    white-space: nowrap;
}

.familyli {
    padding: 10px;
    display: inline-block;
    font-size: 14px;
    text-align: center;
    margin-bottom: 2px;
}

.familyli.active {
    border-bottom: 2px solid #f8441f;
}

.colorbox {
    display: inline-block;
}

.colorli {
    width: 20px;
    height: 20px;
    border-radius: 20px;
    margin: 10px;
    border: 1px solid #9fa8b7;
}

.colorbox.active {
    border-bottom: 2px solid #f8441f;
}

.textbtns {
    display: flex;
    justify-content: space-around;
    font-size: 14px;
}

.fx {
    padding: 5px 10px;
}

.fx.active,
.surebtn {
    background: #f8441f;
    color: #fff;
    padding: 5px 10px;
    border-radius: 5px;
}

input {
    width: 80%;
    margin-left: 5%;
    border: 1px solid #9fa8b7;
    padding: 0 5%;
    margin-bottom: 5px;
    height: 2.8rem;
    border-radius: 10px;
}
</style>
