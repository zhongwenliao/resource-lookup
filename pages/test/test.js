var t = getApp();

Page({
    data: {
        types: "",
        canIUse: wx.canIUse("button.open-type.getUserInfo"),
        editimgs: [],
        mb: "",
        tk: "",
        tt: [],
        pics: [],
        addimgshow: !1,
        pk: "",
        kshow: !0
    },
    movedata: function(t) {
        if (console.log(t), "tt" == t.data.types) {
            var e = this.data.tt;
            e[t.data.index].x = t.data.x, e[t.data.index].y = t.data.y, e[t.data.index].w = t.data.w, 
            e[t.data.index].h = t.data.h, e[t.data.index].scale = t.data.scale, e[t.data.index].rotate = t.data.rotate, 
            this.setData({
                tt: e
            });
        }
    },
    onLoad: function(e) {
        t.globalData.types = e.types, this.setData({
            types: e.types,
            admin: !t.globalData.admin
        }), wx.setNavigationBarTitle({
            title: t.globalData.shop.nickname
        });
        var a = this, i = wx.createSelectorQuery();
        i.select(".content").boundingClientRect(), i.selectViewport().scrollOffset(), i.exec(function(t) {
            a.setData({
                headerheight: t[0].top
            });
        }), wx.getSystemInfo({
            success: function(t) {
                t.model.indexOf("iPhone") > -1 && (t.model = t.model.split("<")[0]);
                var e = t.windowWidth, i = t.windowHeight;
                a.setData({
                    phonetype: {
                        name: t.model
                    },
                    windowWidth: e,
                    windowHeight: i
                }), a.getShopMobile(t.model, i, e);
            }
        });
    },
    getShopMobile: function(e, a, i) {
        var o = this, n = 0, d = 0;
        "" != t.globalData.shop_id ? wx.request({
            url: t.globalData.host + "/api/Index/searchMmobile",
            data: {
                model: e,
                shop_id: t.globalData.shop_id,
                types: t.globalData.types
            },
            success: function(e) {
                if (0 == e.data.code) t.globalData.onloadss = !0, wx.navigateTo({
                    url: "/pages/selecttypes/selecttypes"
                }), wx.hideLoading(); else {
                    var s = e.data.data;
                    wx.getImageInfo({
                        src: s.bgimage,
                        success: function(t) {
                            if (n = t.width, d = t.height, n < d) {
                                var e = o.editconHeight;
                                if ((g = n / d * e) > o.editconWidth) {
                                    g = o.editconWidth, e = d / n * g;
                                    var c = (o.editconWidth - g) / 2, h = o.editconHeight - e, l = 0;
                                } else var c = (o.editconWidth - g) / 2, h = o.editconHeight - e, l = 0;
                            } else var g = .66 * i, c = (.66 * i - g) / 2, l = h = (.8 * a - (e = d / n * g)) / 2;
                            o.setData({
                                windowWidth: i,
                                windowHeight: a,
                                phonetype: s,
                                bg: s.bgimage,
                                mheight: e,
                                mwidth: g,
                                cshow: !1,
                                fillw: c,
                                fillh: h,
                                masktop: l
                            });
                        }
                    }), wx.hideLoading();
                }
            }
        }) : setTimeout(function() {
            o.getShopMobile(e, a, i);
        }, 1e3);
    },
    onReady: function() {
        var t = this, e = wx.createSelectorQuery();
        e.select(".editcon").boundingClientRect(), e.selectViewport().scrollOffset(), e.exec(function(e) {
            t.editconWidth = e[0].width, t.editconHeight = e[0].height;
        });
    },
    onShow: function() {
        var e = this;
        t.globalData.onloadss && wx.getStorage({
            key: "ppselc",
            success: function(a) {
                t.globalData.onloadss = !1;
                var i = 0, o = 0, n = a.data.bgimage, d = a.data;
                wx.showLoading({
                    title: "加载中...",
                    mask: !0
                }), wx.getImageInfo({
                    src: n,
                    success: function(t) {
                        i = t.width, o = t.height, wx.getSystemInfo({
                            success: function(t) {
                                if (i < o) {
                                    l = e.editconHeight;
                                    if ((h = i / o * l) > e.editconWidth) {
                                        h = e.editconWidth, l = o / i * h;
                                        var a = (e.editconWidth - h) / 2, s = e.editconHeight - l, c = 0;
                                    } else var a = (e.editconWidth - h) / 2, s = e.editconHeight - l, c = 0;
                                } else {
                                    var h = .6 * t.windowWidth, l = o / i * h;
                                    if (h > .6 * t.windowWidth) {
                                        h = .6 * t.windowWidth, l = o / i * h;
                                        var a = (.6 * t.windowWidth - h) / 2, s = .8 * t.windowHeight - l - 10, c = 0;
                                    } else var a = (.6 * t.windowWidth - h) / 2, c = s = (.8 * t.windowHeight - l) / 2;
                                }
                                e.setData({
                                    phonetype: d,
                                    bg: n,
                                    mheight: l,
                                    mwidth: h,
                                    left: a,
                                    imgw: i,
                                    imgh: o,
                                    xc: a,
                                    yc: c,
                                    fillw: a,
                                    fillh: s,
                                    masktop: c
                                }), wx.removeStorageSync("ppselc"), wx.hideLoading();
                            },
                            fail: function() {
                                wx.showToast({
                                    title: "获取失败!",
                                    icon: "loading",
                                    mask: !0,
                                    duration: 2e3
                                });
                            }
                        });
                    }
                });
            },
            fail: function(t) {
                "" == e.data.bg && (wx.showToast({
                    title: "请选机型!",
                    icon: "loading",
                    mask: !0,
                    duration: 3e3
                }), setTimeout(function() {
                    wx.navigateTo({
                        url: "/pages/selecttypes/selecttypes"
                    });
                }, 2e3));
            }
        }), wx.getStorage({
            key: "tt",
            success: function(t) {
                wx.showLoading({
                    title: "加载中...",
                    mask: !0
                }), wx.getImageInfo({
                    src: t.data[0].url,
                    success: function(t) {
                        var a = t.path, i = t.width, o = t.height;
                        i == o ? (i = 90, o = 90) : (i = 90, o = t.height / t.width * 90);
                        var n = e.data.fillw + (e.data.mwidth - i) / 2, d = e.data.tt, s = {
                            url: a,
                            x: n,
                            y: e.data.masktop + (e.data.mheight - o) / 2,
                            w: i,
                            h: o,
                            scale: 1,
                            rotate: 0,
                            zindex: 6,
                            active: "active",
                            show: !0
                        }, c = {
                            w: i,
                            h: o,
                            x: n + .2 * e.data.windowWidth,
                            y: (e.data.mheight - o) / 2 + e.data.headerheight + e.data.masktop,
                            rotate: 0,
                            types: "tt",
                            index: d.length
                        };
                        if (d.length > 0) for (var h = 0; h < d.length; h++) d[h].zindex = 5, d[h].active = "";
                        d.push(s), e.setData({
                            tt: d,
                            addimgshow: !0,
                            pk: c,
                            kshow: !1
                        }), wx.removeStorageSync("tt"), wx.hideLoading();
                    },
                    fail: function(t) {}
                });
            }
        });
    },
    eidttype: function() {
        t.globalData.onloadss = !0, wx.navigateTo({
            url: "/pages/selecttypes/selecttypes"
        });
    },
    qiehuan: function(t) {
        if ("tt" == t.currentTarget.dataset.types) {
            var e = this.data.tt;
            if ("active" == e[t.currentTarget.dataset.index].active) for (a = 0; a < e.length; a++) e[a].active = "", 
            e[a].zindex = 5; else {
                for (var a = 0; a < e.length; a++) e[a].active = "", e[a].zindex = 5;
                e[t.currentTarget.dataset.index].active = "active", e[t.currentTarget.dataset.index].zindex = 6;
            }
            this.setData({
                tt: e
            });
        }
    },
    deltimgs: function(t) {
        if ("tt" == t.currentTarget.dataset.types) {
            var e = this.data.tt;
            e[t.currentTarget.dataset.index].show = !1, this.setData({
                tt: e,
                kshow: !0
            });
        }
    },
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {}
});