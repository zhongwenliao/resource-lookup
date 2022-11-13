var t = getApp(), a = wx.createCanvasContext("mycanvas"), e = !1, i = !1, s = "", c = "", h = "SimHei", n = "rgb(0,0,0)", o = "", d = !1, l = 0, g = !0, p = {
    x: 0,
    y: 0
}, w = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0
}, r = {
    x: 0,
    y: 0
}, m = {
    x: 0,
    y: 0
};

Page({
    data: {
        canIUse: wx.canIUse("button.open-type.getUserInfo"),
        fillw: 0,
        fillh: 0,
        masktop: 10,
        addimgtop: "15%",
        phonetype: "",
        cheight: "",
        mheight: "",
        mwidth: "",
        left: 0,
        cshow: !0,
        bg: "",
        mb: "",
        tk: "",
        tt: [],
        pics: [],
        words: [],
        inputval: "",
        addimgshow: !1,
        imgh: 0,
        imgw: 0,
        addshow: !1,
        fx: [ {
            name: "横向",
            active: "active"
        }, {
            name: "纵向",
            active: ""
        } ],
        falimys: [ {
            val: "../../img/font1.jpg",
            name: "1",
            active: "active"
        }, {
            val: "../../img/font2.jpg",
            name: "2",
            active: ""
        }, {
            val: "../../img/font3.jpg",
            name: "3",
            active: ""
        }, {
            val: "../../img/font4.jpg",
            name: "4",
            active: ""
        }, {
            val: "../../img/font5.jpg",
            name: "5",
            active: ""
        }, {
            val: "../../img/font6.jpg",
            name: "6",
            active: ""
        } ],
        colors: [ {
            val: "rgb(0,0,0)",
            name: "0,0,0",
            active: "active"
        }, {
            val: "rgb(51,51,51)",
            name: "51,51,51",
            active: ""
        }, {
            val: "rgb(102,102,102)",
            name: "102,102,102",
            active: ""
        }, {
            val: "rgb(255,255,255)",
            name: "255,255,255",
            active: ""
        }, {
            val: "rgb(19,67,104)",
            name: "19,67,104",
            active: ""
        }, {
            val: "rgb(32,141,220)",
            name: "32,141,220",
            active: ""
        }, {
            val: "rgb(67,182,195)",
            name: "67,182,195",
            active: ""
        }, {
            val: "rgb(3,94,41)",
            name: "3,94,41",
            active: ""
        }, {
            val: "rgb(152,202,74)",
            name: "152,202,74",
            active: ""
        }, {
            val: "rgb(145,0,114)",
            name: "145,0,114",
            active: ""
        }, {
            val: "rgb(191,35,27)",
            name: "191,35,27",
            active: ""
        }, {
            val: "rgb(251,24,61)",
            name: "251,24,61",
            active: ""
        }, {
            val: "rgb(239,41,94)",
            name: "239,41,94",
            active: ""
        }, {
            val: "rgb(239,105,14)",
            name: "239,105,14",
            active: ""
        }, {
            val: "rgb(241,153,33)",
            name: "241,153,33",
            active: ""
        } ],
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
            types: ""
        },
        bscale: 1,
        kshow: !0,
        zx: 0,
        zy: 0
    },
    onLoad: function(t) {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        });
        var a = this;
        if (t.scene) {
            var e = decodeURIComponent(t.scene);
            a.getShopNews(e);
        } else a.getShopNews("undefined");
        wx.getSystemInfo({
            success: function(t) {
                t.model.indexOf("iPhone") > -1 && (t.model = t.model.split("<")[0]);
                var e = t.windowWidth, i = t.windowHeight;
                a.setData({
                    phonetype: {
                        name: t.model
                    }
                }), a.getShopMobile(t.model, i, e);
            }
        });
    },
    getShopMobile: function(a, e, i) {
        var s = this, c = 0, h = 0;
        wx.showLoading({
            title: "加载中...",
            mask: !0
        }), "" != t.globalData.shop_id ? wx.request({
            url: t.globalData.host + "/api/Index/searchMmobile",
            data: {
                model: a,
                shop_id: t.globalData.shop_id
            },
            success: function(t) {
                if (0 == t.data.code) wx.navigateTo({
                    url: "/pages/selecttypes/selecttypes"
                }); else {
                    var a = t.data.data;
                    wx.getImageInfo({
                        src: a.bgimage,
                        success: function(t) {
                            if (c = t.width, h = t.height, c < h) var n = (.66 * i - (p = c / h * (w = .72 * (g = e - 100)))) / 2, o = .8 * e - w - 10, d = 10, l = "15%"; else var g = .66 * i, p = g, w = h / c * p, n = (.66 * i - p) / 2, d = o = (.8 * e - w) / 2, l = 0;
                            s.setData({
                                windowWidth: i,
                                windowHeight: e,
                                phonetype: a,
                                bg: a.bgimage,
                                cheight: g,
                                mheight: w,
                                mwidth: p,
                                cshow: !1,
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
                    }), wx.hideLoading();
                }
            }
        }) : setTimeout(function() {
            s.getShopMobile(a, e, i);
        }, 1e3);
    },
    getShopNews: function(a) {
        var e = this;
        wx.showLoading({
            title: "加载中...",
            mask: !0
        }), "" != t.globalData.openid ? wx.request({
            url: t.globalData.host + "/api/User/getShopnews",
            data: {
                shop_id: a,
                openid: t.globalData.openid
            },
            success: function(a) {
                1 == a.data.code && (t.globalData.shop_id = a.data.data.id, t.globalData.shop = a.data.data, 
                wx.setNavigationBarTitle({
                    title: a.data.data.nickname
                }), wx.setStorage({
                    key: "shop_id",
                    data: t.globalData.shop_id
                }), wx.hideLoading());
            }
        }) : setTimeout(function() {
            e.getShopNews(a);
        }, 1e3);
    },
    onShow: function(t) {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        });
        var a = this;
        wx.getStorage({
            key: "ppselc",
            success: function(t) {
                var e = 0, i = 0, s = t.data.bgimage, c = t.data;
                wx.getImageInfo({
                    src: s,
                    success: function(t) {
                        e = t.width, i = t.height, wx.getSystemInfo({
                            success: function(t) {
                                if (e < i) {
                                    var h = t.windowHeight - 100;
                                    if ((g = e / i * (p = .72 * h)) > .66 * t.windowWidth) {
                                        g = .66 * t.windowWidth, p = i / e * g;
                                        var n = (.66 * t.windowWidth - g) / 2, o = .8 * t.windowHeight - p - 10, d = 10, l = "15%";
                                    } else var n = (.66 * t.windowWidth - g) / 2, o = .8 * t.windowHeight - p - 10, d = 10, l = "15%";
                                } else {
                                    var g = h = .66 * t.windowWidth, p = i / e * g;
                                    if (g > .66 * t.windowWidth) {
                                        g = .66 * t.windowWidth, p = i / e * g;
                                        var n = (.66 * t.windowWidth - g) / 2, o = .8 * t.windowHeight - p - 10, d = 10, l = "15%";
                                    } else var n = (.66 * t.windowWidth - g) / 2, d = o = (.8 * t.windowHeight - p) / 2, l = 0;
                                }
                                a.setData({
                                    windowWidth: t.windowWidth,
                                    windowHeight: t.windowHeight,
                                    phonetype: c,
                                    bg: s,
                                    cheight: h,
                                    mheight: p,
                                    mwidth: g,
                                    cshow: !1,
                                    left: n,
                                    imgw: e,
                                    imgh: i,
                                    xc: n,
                                    yc: d,
                                    fillw: n,
                                    fillh: o,
                                    masktop: d,
                                    addimgtop: l
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
                    },
                    fail: function(t) {}
                });
            },
            fail: function() {
                wx.hideLoading();
            }
        }), wx.getStorage({
            key: "mb",
            success: function(t) {
                wx.getImageInfo({
                    src: t.data.url,
                    success: function(t) {
                        var e = [ {
                            url: t.path,
                            picw: a.data.mwidth,
                            pich: a.data.mheight,
                            x: a.data.left,
                            y: a.data.masktop,
                            scale: 1,
                            rotate: 0,
                            active: "active",
                            zindex: 1,
                            clock: "../../img/clock1.png"
                        } ];
                        a.setData({
                            mb: e,
                            addimgshow: !0
                        }), wx.removeStorageSync("mb"), wx.hideLoading();
                    },
                    fail: function(t) {}
                });
            }
        }), wx.getStorage({
            key: "tk",
            success: function(t) {
                wx.getImageInfo({
                    src: t.data.url,
                    success: function(t) {
                        var e = [ {
                            url: t.path,
                            picw: a.data.mwidth,
                            pich: a.data.mheight,
                            x: a.data.left,
                            y: a.data.masktop,
                            scale: 1,
                            rotate: 0,
                            active: "active",
                            zindex: 1,
                            clock: "../../img/clock1.png"
                        } ];
                        a.setData({
                            tk: e,
                            addimgshow: !0
                        }), wx.removeStorageSync("tk"), wx.hideLoading();
                    },
                    fail: function(t) {}
                });
            }
        }), wx.getStorage({
            key: "tt",
            success: function(t) {
                wx.getImageInfo({
                    src: t.data[0].url,
                    success: function(t) {
                        var e = t.path;
                        console.log(t);
                        var i = t.width, s = t.height;
                        i == s ? (i = 90, s = 90) : (i = 90, s = t.height / t.width * 90);
                        var c = a.data.fillw + (a.data.mwidth - i) / 2, h = a.data.tt, n = {
                            url: e,
                            picw: i,
                            pich: s,
                            x: c,
                            y: a.data.masktop + (a.data.mheight - s) / 2,
                            scale: 1,
                            rotate: 0,
                            active: "active",
                            zindex: 6
                        }, o = {
                            w: i,
                            h: s,
                            x: c + .17 * a.data.windowWidth,
                            y: .1 * a.data.windowHeight + a.data.masktop + (a.data.mheight - s) / 2,
                            rotate: 0,
                            types: "tt",
                            index: h.length
                        };
                        if (h.length > 0) for (var d = 0; d < h.length; d++) h[d].zindex = 5;
                        h.push(n), a.setData({
                            tt: h,
                            addimgshow: !0,
                            pk: o,
                            kshow: !1
                        }), wx.removeStorageSync("tt"), wx.hideLoading();
                    },
                    fail: function(t) {}
                });
            }
        });
    },
    mbclock: function() {
        var t = this, a = this.data.mb;
        "../../img/clock1.png" == a[0].clock ? wx.getImageInfo({
            src: a[0].url,
            success: function(e) {
                var i = e.width;
                i = i / e.height * t.data.mheight;
                var s = (.66 * t.data.windowWidth - i) / 2, c = [ {
                    url: a[0].url,
                    picw: i,
                    pich: t.data.mheight,
                    x: s,
                    y: t.data.masktop,
                    scale: 1,
                    rotate: 0,
                    active: "active",
                    zindex: 1,
                    clock: "../../img/clock2.png"
                } ], h = {
                    w: i,
                    h: t.data.mheight,
                    x: s + .17 * t.data.windowWidth,
                    y: .1 * t.data.windowHeight + t.data.masktop,
                    rotate: 0,
                    types: "mb",
                    index: 0
                };
                t.setData({
                    mb: c,
                    pk: h,
                    kshow: !1
                });
            }
        }) : (a[0].clock = "../../img/clock1.png", t.setData({
            mb: a
        }));
    },
    tkclock: function() {
        var t = this, a = this.data.tk;
        "../../img/clock1.png" == a[0].clock ? wx.getImageInfo({
            src: a[0].url,
            success: function(e) {
                var i = e.width;
                i = i / e.height * t.data.mheight;
                var s = (.66 * t.data.windowWidth - i) / 2, c = [ {
                    url: a[0].url,
                    picw: i,
                    pich: t.data.mheight,
                    x: s,
                    y: t.data.masktop,
                    scale: 1,
                    rotate: 0,
                    active: "active",
                    zindex: 1,
                    clock: "../../img/clock2.png"
                } ], h = {
                    w: i,
                    h: t.data.mheight,
                    x: s + .17 * t.data.windowWidth,
                    y: .1 * t.data.windowHeight + t.data.masktop,
                    rotate: 0,
                    types: "tk",
                    index: 0
                };
                t.setData({
                    tk: c,
                    pk: h,
                    kshow: !1
                });
            }
        }) : (a[0].clock = "../../img/clock1.png", t.setData({
            tk: a
        }));
    },
    eidttype: function() {
        wx.navigateTo({
            url: "/pages/selecttypes/selecttypes"
        });
    },
    addimg: function() {
        var t = this.data.pics, a = this;
        wx.chooseImage({
            count: 1,
            sizeType: [ "original" ],
            sourceType: [ "album", "camera" ],
            success: function(e) {
                var i = e.tempFilePaths[0];
                wx.getImageInfo({
                    src: i,
                    success: function(e) {
                        var s = e.width;
                        s = s / e.height * a.data.mheight;
                        var c = (.66 * a.data.windowWidth - s) / 2, h = {
                            url: i,
                            picw: s,
                            pich: a.data.mheight,
                            x: c,
                            y: a.data.masktop,
                            scale: 1,
                            rotate: 0,
                            active: "active",
                            zindex: 4
                        }, n = {
                            w: s,
                            h: a.data.mheight,
                            x: c + .17 * a.data.windowWidth,
                            y: .1 * a.data.windowHeight + a.data.masktop,
                            rotate: 0,
                            types: "pics",
                            index: t.length
                        };
                        if (t.length > 0) for (d = 0; d < t.length; d++) t[d].zindex = 3, t[d].active = "";
                        var o = a.data.tt;
                        if (o.length > 0) for (var d = 0; d < o.length; d++) o[d].zindex = 5, o[d].active = "";
                        t.push(h), a.setData({
                            pics: t,
                            tt: o,
                            addimgshow: !0,
                            pk: n,
                            kshow: !1
                        });
                    }
                });
            }
        });
    },
    delpic: function(t) {
        var a = this.data.pics;
        a.splice(t.target.dataset.idx, 1), this.setData({
            pics: a,
            kshow: !0
        });
    },
    delpkpic: function(t) {
        var a = this.data.pk, e = this.data[a.types];
        e.splice(a.index, 1), "pics" == a.types ? this.setData({
            pics: e,
            pk: {
                x: 0,
                y: 0,
                scale: 0,
                rotate: 0,
                index: 0,
                types: ""
            },
            kshow: !0
        }) : "tt" == a.types ? this.setData({
            tt: e,
            pk: {
                x: 0,
                y: 0,
                scale: 0,
                rotate: 0,
                index: 0,
                types: ""
            },
            kshow: !0
        }) : "textimgs" == a.types ? this.setData({
            textimgs: e,
            pk: {
                x: 0,
                y: 0,
                scale: 0,
                rotate: 0,
                index: 0,
                types: ""
            },
            kshow: !0
        }) : "tk" == a.types ? this.setData({
            tk: "",
            pk: {
                x: 0,
                y: 0,
                scale: 0,
                rotate: 0,
                index: 0,
                types: ""
            },
            kshow: !0
        }) : "mb" == a.types && this.setData({
            mb: "",
            pk: {
                x: 0,
                y: 0,
                scale: 0,
                rotate: 0,
                index: 0,
                types: ""
            },
            kshow: !0
        });
    },
    deltk: function() {
        this.setData({
            tk: "",
            kshow: !0
        });
    },
    delmb: function() {
        this.setData({
            mb: "",
            kshow: !0
        });
    },
    deltt: function(t) {
        var a = this.data.tt;
        a.splice(t.target.dataset.idx, 1), this.setData({
            tt: a,
            kshow: !0
        });
    },
    deltextimgs: function(t) {
        var a = this.data.textimgs;
        a.splice(t.target.dataset.idx, 1), this.setData({
            textimgs: a,
            kshow: !0
        });
    },
    bindGetUserInfo: function(a) {
        wx.showLoading({
            title: "提交数据...",
            mask: !0
        });
        var e = this, i = a.detail.userInfo.avatarUrl, s = a.detail.userInfo.nickName;
        wx.showLoading({
            title: s,
            mask: !0
        }), wx, wx.request({
            url: t.globalData.host + "/api/Index/edituseravater",
            data: {
                shop_id: t.globalData.shop_id,
                openid: t.globalData.openid,
                avatar: i,
                nickname: s
            },
            method: "GET",
            dataType: "json",
            success: function(a) {
                1 == a.data.code && (t.globalData.userInfo = a.data.data, e.setData({
                    canIUse: !1
                }), e.submitdata());
            },
            fail: function(t) {
                wx.showLoading({
                    title: JSON.stringify(t),
                    mask: !0
                });
            },
            complete: function(t) {}
        });
    },
    submitdata: function() {
        if ("" != this.data.tk || 0 != this.data.pics.length || "" != this.data.mb || 0 != this.data.tt.length || 0 != this.data.textimgs.length) {
            wx.showLoading({
                title: "图片生成中...",
                mask: !0
            });
            var t = this;
            a.clearRect(0, 0, t.data.imgw, t.data.imgh), a.fillStyle = "#ffffff", a.fillRect(0, 0, t.data.imgw, t.data.imgh), 
            a.save();
            var e = this.data.tk, i = t.data.imgw / t.data.mwidth, s = t.data.imgh / t.data.mheight;
            if (e.length > 0) {
                for (var c = 0; c < e.length; c++) {
                    var h = e[c], n = h.x - t.data.xc - h.picw * (h.scale - 1) / 2, o = h.y - t.data.yc - h.pich * (h.scale - 1) / 2, d = n + h.picw * h.scale / 2, l = o + h.pich * h.scale / 2;
                    a.save(), a.translate(d * i, l * s), a.rotate(h.rotate * Math.PI / 180), a.translate(-d * i, -l * s), 
                    a.drawImage(h.url, n * i, o * s, h.picw * h.scale * i, h.pich * h.scale * s), a.restore();
                }
                this.drawpic();
            } else this.drawpic();
        } else wx.showToast({
            title: "未选中任何图片！",
            icon: "loading",
            duration: 1e3
        });
    },
    drawpic: function() {
        var t = this, e = t.data.imgw / t.data.mwidth, i = t.data.imgh / t.data.mheight, s = this.data.pics;
        if (s.length > 0) for (var c = 0; c < s.length; c++) {
            var h = s[c], n = h.x - t.data.xc - h.picw * (h.scale - 1) / 2, o = h.y - t.data.yc - h.pich * (h.scale - 1) / 2, d = n + h.picw * h.scale / 2, l = o + h.pich * h.scale / 2;
            a.save(), a.translate(d * e, l * i), a.rotate(h.rotate * Math.PI / 180), a.translate(-d * e, -l * i), 
            a.drawImage(h.url, n * e, o * i, h.picw * h.scale * e, h.pich * h.scale * i), a.restore(), 
            c == s.length - 1 && this.drawmb();
        } else this.drawmb();
    },
    drawmb: function() {
        var t = this, e = this.data.mb, i = t.data.imgw / t.data.mwidth, s = t.data.imgh / t.data.mheight;
        if (e.length > 0) {
            for (var c = 0; c < e.length; c++) {
                var h = e[c], n = h.x - t.data.xc - h.picw * (h.scale - 1) / 2, o = h.y - t.data.yc - h.pich * (h.scale - 1) / 2, d = n + h.picw * h.scale / 2, l = o + h.pich * h.scale / 2;
                a.save(), a.translate(d * i, l * s), a.rotate(h.rotate * Math.PI / 180), a.translate(-d * i, -l * s), 
                a.drawImage(h.url, n * i, o * s, h.picw * h.scale * i, h.pich * h.scale * s), a.restore();
            }
            this.drawtt();
        } else this.drawtt();
    },
    drawtt: function() {
        var t = this, e = t.data.imgw / t.data.mwidth, i = t.data.imgh / t.data.mheight, s = this.data.tt;
        if (s.length > 0) for (var c = 0; c < s.length; c++) {
            var h = s[c], n = h.x - t.data.xc - h.picw * (h.scale - 1) / 2, o = h.y - t.data.yc - h.pich * (h.scale - 1) / 2, d = n + h.picw * h.scale / 2, l = o + h.pich * h.scale / 2;
            a.save(), a.translate(d * e, l * i), a.rotate(h.rotate * Math.PI / 180), a.translate(-d * e, -l * i), 
            a.drawImage(h.url, n * e, o * i, h.picw * h.scale * e, h.pich * h.scale * i), a.restore(), 
            c == s.length - 1 && this.drawtext();
        } else this.drawtext();
    },
    drawtext: function() {
        var e = this, i = e.data.imgw / e.data.mwidth, s = e.data.imgh / e.data.mheight, c = this.data.textimgs;
        if (c.length > 0) for (var h = 0; h < c.length; h++) {
            var n = c[h], o = n.x - e.data.xc - n.picw * (n.scale - 1) / 2, d = n.y - e.data.yc - n.pich * (n.scale - 1) / 2, l = o + n.picw * n.scale / 2, g = d + n.pich * n.scale / 2;
            a.save(), a.translate(l * i, g * s), a.rotate(n.rotate * Math.PI / 180), a.translate(-l * i, -g * s), 
            a.drawImage(n.url, o * i, d * s, n.picw * n.scale * i, n.pich * n.scale * s), a.restore();
        }
        a.draw(!1, function() {
            wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width: e.data.imgw,
                height: e.data.imgh,
                destWidth: e.data.imgw,
                destHeight: e.data.imgh,
                canvasId: "mycanvas",
                fileType: "jpg",
                quality: 1,
                success: function(a) {
                    t.globalData.imgurl = a.tempFilePath, wx.setStorage({
                        key: "phonetype",
                        data: e.data.phonetype
                    }), wx.navigateTo({
                        url: "/pages/ordersure/ordersure"
                    }), wx.hideLoading();
                }
            });
        });
    },
    bindload: function(t) {
        t.detail.width, t.detail.height;
    },
    bindqie: function(t) {
        c = t.target.dataset.idx, s = t.target.dataset.types;
        var a = this.data.pics, i = this.data.tt, h = this.data.textimgs, n = [], o = [], d = [];
        if ("pics" == s) {
            for (l = 0; l < a.length; l++) l != c && (a[l].zindex = 3, n.push(a[l]));
            a[c].zindex = 4, n.push(a[c]);
            g = {
                w: a[c].picw * a[c].scale,
                h: a[c].pich * a[c].scale,
                x: .17 * this.data.windowWidth + a[c].x + (a[c].picw - a[c].picw * a[c].scale) / 2,
                y: .1 * this.data.windowHeight + a[c].y + (a[c].pich - a[c].pich * a[c].scale) / 2,
                rotate: a[c].rotate,
                types: "pics",
                index: n.length - 1
            };
            this.setData({
                pics: n,
                tt: i,
                textimgs: h,
                pk: g,
                kshow: !1
            });
        } else if ("tt" == s) {
            for (l = 0; l < i.length; l++) l != c && (i[l].zindex = 5, o.push(i[l]));
            i[c].zindex = 6, o.push(i[c]);
            g = {
                w: i[c].picw * i[c].scale,
                h: i[c].pich * i[c].scale,
                x: .17 * this.data.windowWidth + i[c].x + (i[c].picw - i[c].picw * i[c].scale) / 2,
                y: .1 * this.data.windowHeight + i[c].y + (i[c].pich - i[c].pich * i[c].scale) / 2,
                rotate: i[c].rotate,
                types: "tt",
                index: o.length - 1
            };
            this.setData({
                pics: a,
                tt: o,
                textimgs: h,
                pk: g,
                kshow: !1
            });
        } else if ("textimgs" == s) {
            for (var l = 0; l < h.length; l++) l != c && (h[l].zindex = 5, d.push(h[l]));
            h[c].zindex = 6, d.push(h[c]);
            var g = {
                w: h[c].picw * h[c].scale,
                h: h[c].pich * h[c].scale,
                x: .17 * this.data.windowWidth + h[c].x + (h[c].picw - h[c].picw * h[c].scale) / 2,
                y: .1 * this.data.windowHeight + h[c].y + (h[c].pich - h[c].pich * h[c].scale) / 2,
                rotate: h[c].rotate,
                types: "textimgs",
                index: d.length - 1
            };
            this.setData({
                pics: a,
                tt: i,
                textimgs: d,
                pk: g,
                kshow: !1
            });
        }
        t.touches.length < 2 ? (e = !0, p.x = t.touches[0].pageX, p.y = t.touches[0].pageY) : (w.x1 = t.touches[0].pageX, 
        w.y1 = t.touches[0].pageY, w.x2 = t.touches[1].pageX, w.y2 = t.touches[1].pageY);
    },
    bindtouchstart: function(t) {
        s = this.data.pk.types, c = this.data.pk.index;
        var a = this.data.pics, i = this.data.tt, h = this.data.textimgs, n = this.data.mb, o = this.data.tk;
        if ("pics" == s) {
            if (a.length > 0) for (d = 0; d < a.length; d++) a[d].zindex = 3;
            a[c].zindex = 4;
            l = {
                w: a[c].picw * a[c].scale,
                h: a[c].pich * a[c].scale,
                x: .17 * this.data.windowWidth + a[c].x + (a[c].picw - a[c].picw * a[c].scale) / 2,
                y: .1 * this.data.windowHeight + a[c].y + (a[c].pich - a[c].pich * a[c].scale) / 2,
                rotate: a[c].rotate,
                types: "pics",
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
        } else if ("tt" == s) {
            if (h.length > 0) for (d = 0; d < i.length; d++) i[d].zindex = 5;
            i[c].zindex = 6;
            l = {
                w: i[c].picw * i[c].scale,
                h: i[c].pich * i[c].scale,
                x: .17 * this.data.windowWidth + i[c].x + (i[c].picw - i[c].picw * i[c].scale) / 2,
                y: .1 * this.data.windowHeight + i[c].y + (i[c].pich - i[c].pich * i[c].scale) / 2,
                rotate: i[c].rotate,
                types: "tt",
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
        } else if ("textimgs" == s) {
            if (h.length > 0) for (var d = 0; d < h.length; d++) h[d].zindex = 5;
            h[c].zindex = 6;
            l = {
                w: h[c].picw * h[c].scale,
                h: h[c].pich * h[c].scale,
                x: .17 * this.data.windowWidth + h[c].x + (h[c].picw - h[c].picw * h[c].scale) / 2,
                y: .1 * this.data.windowHeight + h[c].y + (h[c].pich - h[c].pich * h[c].scale) / 2,
                rotate: h[c].rotate,
                types: "textimgs",
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
        } else if ("mb" == s) {
            n[c].zindex = 6;
            l = {
                w: n[c].picw * n[c].scale,
                h: n[c].pich * n[c].scale,
                x: .17 * this.data.windowWidth + n[c].x + (n[c].picw - n[c].picw * n[c].scale) / 2,
                y: .1 * this.data.windowHeight + n[c].y + (n[c].pich - n[c].pich * n[c].scale) / 2,
                rotate: n[c].rotate,
                types: "mb",
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
        } else if ("tk" == s) {
            o[c].zindex = 6;
            var l = {
                w: o[c].picw * o[c].scale,
                h: o[c].pich * o[c].scale,
                x: .17 * this.data.windowWidth + o[c].x + (o[c].picw - o[c].picw * o[c].scale) / 2,
                y: .1 * this.data.windowHeight + o[c].y + (o[c].pich - o[c].pich * o[c].scale) / 2,
                rotate: o[c].rotate,
                types: "tk",
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
        t.touches.length < 2 ? (e = !0, p.x = t.touches[0].pageX, p.y = t.touches[0].pageY) : (w.x1 = t.touches[0].pageX, 
        w.y1 = t.touches[0].pageY, w.x2 = t.touches[1].pageX, w.y2 = t.touches[1].pageY);
    },
    bindtouchmove: function(t) {
        var a = this, i = this.data[s], h = this.data.pk;
        if (t.touches.length < 2 && e) {
            var n = t.touches[0].pageX - p.x, o = t.touches[0].pageY - p.y;
            i[c].x = i[c].x + n, h.x = .17 * this.data.windowWidth + i[c].x + (i[c].picw - i[c].picw * i[c].scale) / 2, 
            i[c].y = i[c].y + o, h.y = .1 * this.data.windowHeight + i[c].y + (i[c].pich - i[c].pich * i[c].scale) / 2, 
            "pics" == s ? a.setData({
                pics: i,
                pk: h
            }) : "tt" == s ? a.setData({
                tt: i,
                pk: h
            }) : "textimgs" == s ? a.setData({
                textimgs: i,
                pk: h
            }) : "mb" == s ? a.setData({
                mb: i,
                pk: h
            }) : "tk" == s && a.setData({
                tk: i,
                pk: h
            }), p.x = t.touches[0].pageX, p.y = t.touches[0].pageY;
        } else if (t.touches.length > 1) {
            var d = JSON.parse(JSON.stringify(w));
            w.x1 = t.touches[0].pageX, w.y1 = t.touches[0].pageY, w.x2 = t.touches[1].pageX, 
            w.y2 = t.touches[1].pageY;
            var l = 360 * Math.atan((d.y1 - d.y2) / (d.x1 - d.x2)) / Math.PI, g = 360 * Math.atan((w.y1 - w.y2) / (w.x1 - w.x2)) / Math.PI;
            if (Math.abs(l - g) > 1) return;
            var r = Math.sqrt(Math.pow(d.x1 - d.x2, 2) + Math.pow(d.y1 - d.y2, 2)), m = Math.sqrt(Math.pow(w.x1 - w.x2, 2) + Math.pow(w.y1 - w.y2, 2));
            if (i[c].scale = i[c].scale + .005 * (m - r), i[c].scale > .08) {
                var x = m - r, v = x / i[c].picw;
                i[c].picw += x, i[c].pich += i[c].pich * v, i[c].x -= x / 2, i[c].y -= x / 2, i[c].scale = 1, 
                h.x = h.x + (h.w - i[c].picw * i[c].scale) / 2, h.y = h.y - x / 2, h.w = i[c].picw * i[c].scale, 
                h.h = i[c].pich * i[c].scale;
                var f = 1 + Math.pow(1 - i[c].scale, 2);
                "pics" == s ? a.setData({
                    pics: i,
                    pk: h,
                    bscale: f
                }) : "tt" == s ? a.setData({
                    tt: i,
                    pk: h,
                    bscale: f
                }) : "textimgs" == s ? a.setData({
                    textimgs: i,
                    pk: h,
                    bscale: f
                }) : "mb" == s ? a.setData({
                    mb: i,
                    pk: h,
                    bscale: f
                }) : "tk" == s && a.setData({
                    tk: i,
                    pk: h,
                    bscale: f
                });
            }
        }
    },
    bindtouchend: function(t) {
        e = !1;
    },
    kdtouchstart: function(t) {
        i = !0, p.x = t.touches[0].pageX, p.y = t.touches[0].pageY, "xz" == t.target.dataset.kn && (r.x = t.touches[0].pageX, 
        r.y = t.touches[0].pageY, g = !0);
    },
    kdtouchmove: function(t) {
        if (i) {
            var a = this, e = this.data[t.target.dataset.types], h = this.data.pk;
            if (c = t.target.dataset.idx, s = t.target.dataset.types, "kd" == t.target.dataset.kn) {
                var n = e[c].x + e[c].picw / 2 + .17 * a.data.windowWidth, o = e[c].y + e[c].pich / 2 + .1 * a.data.windowHeight, d = Math.sqrt(Math.pow(n - p.x, 2) + Math.pow(o - p.y, 2)), l = Math.sqrt(Math.pow(n - t.touches[0].pageX, 2) + Math.pow(o - t.touches[0].pageY, 2));
                e[c].scale = e[c].scale + .005 * (l - d), h.x = h.x + (h.w - e[c].picw * e[c].scale) / 2, 
                h.y = h.y + (h.h - e[c].pich * e[c].scale) / 2, h.w = e[c].picw * e[c].scale, h.h = e[c].pich * e[c].scale;
                var g = 1 - e[c].scale + 1;
                "pics" == s ? a.setData({
                    pics: e,
                    pk: h,
                    bscale: g
                }) : "tt" == s ? a.setData({
                    tt: e,
                    pk: h,
                    bscale: g
                }) : "textimgs" == s ? a.setData({
                    textimgs: e,
                    pk: h,
                    bscale: g
                }) : "mb" == s ? a.setData({
                    mb: e,
                    pk: h,
                    bscale: g
                }) : "tk" == s && a.setData({
                    tk: e,
                    pk: h,
                    bscale: g
                });
            } else if ("xz" == t.target.dataset.kn) {
                var n = e[c].x + e[c].picw / 2 + .17 * a.data.windowWidth, o = e[c].y + e[c].pich / 2 + .1 * a.data.windowHeight;
                a.setData({
                    zx: n,
                    zy: o
                }), console.log(e[c].rotate);
                var w = Math.atan((p.y - o) / (p.x - n)), r = Math.atan((t.touches[0].pageY - o) / (t.touches[0].pageX - n));
                console.log("perAngle", w), console.log("curAngle", r), e[c].rotate = e[c].rotate + r - w, 
                h.rotate = e[c].rotate, "pics" == s ? a.setData({
                    pics: e,
                    pk: h
                }) : "tt" == s ? a.setData({
                    tt: e,
                    pk: h
                }) : "textimgs" == s ? a.setData({
                    textimgs: e,
                    pk: h
                }) : "mb" == s ? a.setData({
                    mb: e,
                    pk: h
                }) : "tk" == s && a.setData({
                    tk: e,
                    pk: h
                });
            }
            p.x = t.touches[0].pageX, p.y = t.touches[0].pageY;
        }
    },
    kdtouchend: function(t) {
        i = !1, m.x = 0, m.y = 0, r.x = 0, r.y = 0, g = !0, l = 0;
    },
    wenzibtn: function() {
        this.data.addshow ? this.setData({
            addshow: !1
        }) : this.setData({
            addshow: !0
        }), d = !1;
    },
    selectfamily: function(t) {
        for (var a = this.data.falimys, e = 0; e < a.length; e++) a[e].active = "";
        a[t.target.dataset.idx].active = "active", this.setData({
            falimys: a
        }), h = a[t.target.dataset.idx].val;
    },
    selectcolor: function(t) {
        for (var a = this.data.colors, e = 0; e < a.length; e++) a[e].active = "";
        a[t.currentTarget.dataset.idx].active = "active", this.setData({
            colors: a
        }), n = a[t.currentTarget.dataset.idx].val;
    },
    fxbtn: function(t) {
        var a = this.data.fx;
        if (a[0].active = "", a[1].active = "", a[t.target.dataset.idx].active = "active", 
        "active" == a[0].active) if ("" == o) this.setData({
            textwidth: 600,
            textheight: 80,
            fx: a
        }); else {
            var e = wx.createCanvasContext("textcanvas");
            e.font = "50px " + h;
            var i = e.measureText(o);
            this.setData({
                textwidth: i.width,
                textheight: 80,
                fx: a
            });
        } else this.setData({
            textwidth: 80,
            textheight: 600,
            fx: a
        });
    },
    inputval: function(t) {
        o = t.detail.value, this.setData({
            inputval: o
        });
    },
    surebtn: function() {
        var a = this.data.inputval;
        if ("" != a) {
            for (var e = this.data.textimgs, i = this.data.colors, s = this.data.falimys, c = this.data.fx, n = "", o = 0; o < i.length; o++) "active" == i[o].active && (n = i[o].name);
            for (o = 0; o < s.length; o++) "active" == s[o].active && (h = s[o].name);
            for (o = 0; o < c.length; o++) "active" == c[o].active && (c = c[o].name);
            if (d) {
                var l = this.data.pk;
                e.splice(l.index, 1), d = !1;
            }
            var g = this;
            wx.request({
                url: t.globalData.host + "/api/index/textToImage",
                data: {
                    shop_id: 1,
                    selectcolor: n,
                    selectfamily: h,
                    fx: c,
                    val: a
                },
                success: function(t) {
                    var a = t.data.data;
                    wx.getImageInfo({
                        src: a,
                        success: function(t) {
                            var a = t.path, i = .5 * t.width, s = .5 * t.height, c = (.6 * g.data.windowWidth - i) / 2, h = g.data.masktop + (g.data.mheight - s) / 2, n = {
                                url: a,
                                picw: i,
                                pich: s,
                                x: c,
                                y: h,
                                scale: 1,
                                rotate: 0,
                                active: "active",
                                zindex: 6,
                                falimys: g.data.falimys,
                                fx: g.data.fx,
                                colors: g.data.colors,
                                text: g.data.inputval
                            };
                            if (e.length > 0) for (var o = 0; o < e.length; o++) e[o].zindex = 5, e[o].active = "";
                            var d = {
                                w: i,
                                h: s,
                                x: c + .17 * g.data.windowWidth,
                                y: .1 * g.data.windowHeight + h,
                                rotate: 0,
                                types: "textimgs",
                                index: e.length
                            };
                            e.push(n), g.setData({
                                textimgs: e,
                                addimgshow: !0,
                                addshow: !1,
                                kshow: !1,
                                pk: d,
                                inputval: "",
                                fx: [ {
                                    name: "横向",
                                    active: "active"
                                }, {
                                    name: "纵向",
                                    active: ""
                                } ],
                                falimys: [ {
                                    val: "../../img/font1.jpg",
                                    name: "1",
                                    active: "active"
                                }, {
                                    val: "../../img/font2.jpg",
                                    name: "2",
                                    active: ""
                                }, {
                                    val: "../../img/font3.jpg",
                                    name: "3",
                                    active: ""
                                }, {
                                    val: "../../img/font4.jpg",
                                    name: "4",
                                    active: ""
                                }, {
                                    val: "../../img/font5.jpg",
                                    name: "5",
                                    active: ""
                                }, {
                                    val: "../../img/font6.jpg",
                                    name: "6",
                                    active: ""
                                } ],
                                colors: [ {
                                    val: "rgb(0,0,0)",
                                    name: "0,0,0",
                                    active: "active"
                                }, {
                                    val: "rgb(51,51,51)",
                                    name: "51,51,51",
                                    active: ""
                                }, {
                                    val: "rgb(102,102,102)",
                                    name: "102,102,102",
                                    active: ""
                                }, {
                                    val: "rgb(255,255,255)",
                                    name: "255,255,255",
                                    active: ""
                                }, {
                                    val: "rgb(19,67,104)",
                                    name: "19,67,104",
                                    active: ""
                                }, {
                                    val: "rgb(32,141,220)",
                                    name: "32,141,220",
                                    active: ""
                                }, {
                                    val: "rgb(67,182,195)",
                                    name: "67,182,195",
                                    active: ""
                                }, {
                                    val: "rgb(3,94,41)",
                                    name: "3,94,41",
                                    active: ""
                                }, {
                                    val: "rgb(152,202,74)",
                                    name: "152,202,74",
                                    active: ""
                                }, {
                                    val: "rgb(145,0,114)",
                                    name: "145,0,114",
                                    active: ""
                                }, {
                                    val: "rgb(191,35,27)",
                                    name: "191,35,27",
                                    active: ""
                                }, {
                                    val: "rgb(251,24,61)",
                                    name: "251,24,61",
                                    active: ""
                                }, {
                                    val: "rgb(239,41,94)",
                                    name: "239,41,94",
                                    active: ""
                                }, {
                                    val: "rgb(239,105,14)",
                                    name: "239,105,14",
                                    active: ""
                                }, {
                                    val: "rgb(241,153,33)",
                                    name: "241,153,33",
                                    active: ""
                                } ]
                            });
                        }
                    });
                }
            });
        } else wx.showToast({
            title: "请输入文字",
            mask: !0,
            icon: "loading",
            duration: 2e3
        });
    },
    catchtxt: function() {
        d = !1, this.setData({
            addshow: !1,
            textwidth: 0,
            textheight: 0,
            inputval: "",
            fx: [ {
                name: "横向",
                active: "active"
            }, {
                name: "纵向",
                active: ""
            } ],
            falimys: [ {
                val: "../../img/font1.jpg",
                name: "1",
                active: "active"
            }, {
                val: "../../img/font2.jpg",
                name: "2",
                active: ""
            }, {
                val: "../../img/font3.jpg",
                name: "3",
                active: ""
            }, {
                val: "../../img/font4.jpg",
                name: "4",
                active: ""
            }, {
                val: "../../img/font5.jpg",
                name: "5",
                active: ""
            }, {
                val: "../../img/font6.jpg",
                name: "6",
                active: ""
            } ],
            colors: [ {
                val: "rgb(0,0,0)",
                name: "0,0,0",
                active: "active"
            }, {
                val: "rgb(51,51,51)",
                name: "51,51,51",
                active: ""
            }, {
                val: "rgb(102,102,102)",
                name: "102,102,102",
                active: ""
            }, {
                val: "rgb(255,255,255)",
                name: "255,255,255",
                active: ""
            }, {
                val: "rgb(19,67,104)",
                name: "19,67,104",
                active: ""
            }, {
                val: "rgb(32,141,220)",
                name: "32,141,220",
                active: ""
            }, {
                val: "rgb(67,182,195)",
                name: "67,182,195",
                active: ""
            }, {
                val: "rgb(3,94,41)",
                name: "3,94,41",
                active: ""
            }, {
                val: "rgb(152,202,74)",
                name: "152,202,74",
                active: ""
            }, {
                val: "rgb(145,0,114)",
                name: "145,0,114",
                active: ""
            }, {
                val: "rgb(191,35,27)",
                name: "191,35,27",
                active: ""
            }, {
                val: "rgb(251,24,61)",
                name: "251,24,61",
                active: ""
            }, {
                val: "rgb(239,41,94)",
                name: "239,41,94",
                active: ""
            }, {
                val: "rgb(239,105,14)",
                name: "239,105,14",
                active: ""
            }, {
                val: "rgb(241,153,33)",
                name: "241,153,33",
                active: ""
            } ]
        });
    },
    inptch: function() {
        console.log(333);
    },
    leftbtn: function() {
        d = !1, this.setData({
            kshow: !0
        });
    },
    selcttext: function(t) {
        w = this.data.pk;
        if (s = t.currentTarget.dataset.types, c = t.currentTarget.dataset.ind, 1 == d && "textimgs" == s && w.index == c) {
            i = this.data.textimgs;
            this.setData({
                addshow: !0,
                falimys: i[c].falimys,
                fx: i[c].fx,
                colors: i[c].colors,
                inputval: i[c].text
            });
        } else {
            for (var a = this.data.pics, e = this.data.tt, i = this.data.textimgs, h = this.data.tk, n = this.data.mb, o = [], l = [], g = [], p = 0; p < a.length; p++) p != c && (a[p].zindex = 3, 
            o.push(a[p]));
            for (p = 0; p < e.length; p++) p != c && (e[p].zindex = 5, l.push(e[p]));
            for (p = 0; p < i.length; p++) p != c && (i[p].zindex = 5, g.push(i[p]));
            if ("pics" == s) {
                d = !1, a[c].zindex = 4, o.push(a[c]);
                w = {
                    w: a[c].picw * a[c].scale,
                    h: a[c].pich * a[c].scale,
                    x: .17 * this.data.windowWidth + a[c].x + (a[c].picw - a[c].picw * a[c].scale) / 2,
                    y: .1 * this.data.windowHeight + a[c].y + (a[c].pich - a[c].pich * a[c].scale) / 2,
                    rotate: a[c].rotate,
                    types: "pics",
                    index: o.length - 1
                };
                this.setData({
                    pics: o,
                    tt: e,
                    textimgs: i,
                    pk: w,
                    tk: h,
                    mb: n,
                    kshow: !1
                });
            } else if ("tt" == s) {
                d = !1, e[c].zindex = 6, l.push(e[c]);
                w = {
                    w: e[c].picw * e[c].scale,
                    h: e[c].pich * e[c].scale,
                    x: .17 * this.data.windowWidth + e[c].x + (e[c].picw - e[c].picw * e[c].scale) / 2,
                    y: .1 * this.data.windowHeight + e[c].y + (e[c].pich - e[c].pich * e[c].scale) / 2,
                    rotate: e[c].rotate,
                    types: "tt",
                    index: l.length - 1
                };
                this.setData({
                    pics: a,
                    tt: l,
                    textimgs: i,
                    pk: w,
                    tk: h,
                    mb: n,
                    kshow: !1
                });
            } else if ("textimgs" == s) {
                i[c].zindex = 6, g.push(i[c]);
                w = {
                    w: i[c].picw * i[c].scale,
                    h: i[c].pich * i[c].scale,
                    x: .17 * this.data.windowWidth + i[c].x + (i[c].picw - i[c].picw * i[c].scale) / 2,
                    y: .1 * this.data.windowHeight + i[c].y + (i[c].pich - i[c].pich * i[c].scale) / 2,
                    rotate: i[c].rotate,
                    types: "textimgs",
                    index: g.length - 1
                };
                d = !0, this.setData({
                    pics: a,
                    tt: e,
                    textimgs: g,
                    pk: w,
                    tk: h,
                    mb: n,
                    kshow: !1
                });
            } else if ("tk" == s) {
                w = {
                    w: h[c = 0].picw * h[c].scale,
                    h: h[c].pich * h[c].scale,
                    x: .17 * this.data.windowWidth + h[c].x + (h[c].picw - h[c].picw * h[c].scale) / 2,
                    y: .1 * this.data.windowHeight + h[c].y + (h[c].pich - h[c].pich * h[c].scale) / 2,
                    rotate: h[c].rotate,
                    types: "tk",
                    index: c
                };
                d = !0, this.setData({
                    pics: a,
                    tt: e,
                    textimgs: i,
                    pk: w,
                    tk: h,
                    mb: n,
                    kshow: !1
                });
            } else if ("mb" == s) {
                var w = {
                    w: n[c = 0].picw * n[c].scale,
                    h: n[c].pich * n[c].scale,
                    x: .17 * this.data.windowWidth + n[c].x + (n[c].picw - n[c].picw * n[c].scale) / 2,
                    y: .1 * this.data.windowHeight + n[c].y + (n[c].pich - n[c].pich * n[c].scale) / 2,
                    rotate: n[c].rotate,
                    types: "mb",
                    index: c
                };
                d = !0, this.setData({
                    pics: a,
                    tt: e,
                    textimgs: i,
                    pk: w,
                    tk: h,
                    mb: n,
                    kshow: !1
                });
            }
        }
    },
    onShareAppMessage: function() {
        return {
            title: t.globalData.shop.nickname,
            path: "/pages/index/index?scene=" + t.globalData.shop_id
        };
    }
});