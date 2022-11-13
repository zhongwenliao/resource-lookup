var t = function() {
    function t(t, a) {
        var e = [], i = !0, s = !1, c = void 0;
        try {
            for (var h, n = t[Symbol.iterator](); !(i = (h = n.next()).done) && (e.push(h.value), 
            !a || e.length !== a); i = !0) ;
        } catch (t) {
            s = !0, c = t;
        } finally {
            try {
                !i && n.return && n.return();
            } finally {
                if (s) throw c;
            }
        }
        return e;
    }
    return function(a, e) {
        if (Array.isArray(a)) return a;
        if (Symbol.iterator in Object(a)) return t(a, e);
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
    };
}(), a = getApp(), e = wx.createCanvasContext("mycanvas"), i = !1, s = !1, c = "", h = "", n = "SimHei", d = "#000000", o = "", l = !1, r = {
    x: 0,
    y: 0
}, v = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0
}, g = [ [ 11904, 12271 ], [ 12352, 40959 ], [ 44032, 55295 ], [ 63744, 64255 ], [ 119552, 119647 ], [ 131072, 195103 ] ];

Page({
    data: {
        fillw: 0,
        fillh: 0,
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
            val: "SimHei",
            name: "黑体",
            active: "active"
        }, {
            val: "SimSun",
            name: "宋体",
            active: ""
        }, {
            val: "Microsoft Yahei",
            name: "微软雅黑",
            active: ""
        }, {
            val: "Microsoft JhengHei",
            name: "微软正黑体",
            active: ""
        }, {
            val: "KaiTi",
            name: "楷体",
            active: ""
        }, {
            val: "NSimSun",
            name: "新宋体",
            active: ""
        }, {
            val: "FangSong",
            name: "仿宋",
            active: ""
        } ],
        colors: [ {
            val: "#000000",
            name: "黑色",
            active: "active"
        }, {
            val: "#333333",
            name: "灰色",
            active: ""
        }, {
            val: "#666666",
            name: "浅灰",
            active: ""
        }, {
            val: "#ffffff",
            name: "白色",
            active: ""
        }, {
            val: "#134368",
            name: "深蓝",
            active: ""
        }, {
            val: "#208ddc",
            name: "蓝色",
            active: ""
        }, {
            val: "#43b6c3",
            name: "浅蓝",
            active: ""
        }, {
            val: "#035e29",
            name: "绿色",
            active: ""
        }, {
            val: "#98ca4a",
            name: "浅蓝",
            active: ""
        }, {
            val: "#910072",
            name: "深紫",
            active: ""
        }, {
            val: "#bf231b",
            name: "大红",
            active: ""
        }, {
            val: "#fb183d",
            name: "玫红",
            active: ""
        }, {
            val: "#ef295e",
            name: "粉红",
            active: ""
        }, {
            val: "#ef690e",
            name: "深黄",
            active: ""
        }, {
            val: "#f19921",
            name: "黄色",
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
        kshow: !0
    },
    onLoad: function(t) {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        });
        var a = this, e = decodeURIComponent(t.scene);
        "undefined" != e ? a.getShopNews(e) : wx.getStorage({
            key: "shop_id",
            success: function(t) {
                a.getShopNews(t.data);
            },
            fail: function() {
                a.getShopNews("undefined");
            }
        }), wx.getSystemInfo({
            success: function(t) {
                console.log(t), t.model.indexOf("iPhone") > -1 && (t.model = t.model.split("<")[0]);
                var e = t.windowWidth, i = t.windowHeight;
                console.log(t.model), a.setData({
                    phonetype: {
                        name: t.model
                    }
                }), a.getShopMobile(t.model, i, e);
            }
        });
    },
    getShopMobile: function(t, e, i) {
        var s = this, c = 0, h = 0;
        "" != a.globalData.shop_id ? wx.request({
            url: a.globalData.host + "/api/Index/searchMmobile",
            data: {
                model: t,
                shop_id: a.globalData.shop_id
            },
            success: function(t) {
                if (0 == t.data.code) wx.hideLoading(), wx.navigateTo({
                    url: "/pages/selecttypes/selecttypes"
                }); else {
                    var a = t.data.data;
                    wx.getImageInfo({
                        src: a.bgimage,
                        success: function(t) {
                            c = t.width, h = t.height;
                            var n = e - 100, d = .72 * n, o = c / h * n * .72;
                            console.log("w", o), console.log("h", d);
                            var l = (.6 * i - o) / 2, r = .8 * e - d - 10;
                            s.setData({
                                windowWidth: i,
                                windowHeight: e,
                                phonetype: a,
                                bg: a.bgimage,
                                cheight: n,
                                mheight: d,
                                mwidth: o,
                                cshow: !1,
                                left: l,
                                imgw: c,
                                imgh: h,
                                xc: l,
                                yc: 10,
                                fillw: l,
                                fillh: r
                            }), wx.hideLoading();
                        }
                    });
                }
            }
        }) : setTimeout(function() {
            s.getShopMobile(t, e, i);
        }, 1e3);
    },
    getShopNews: function(t) {
        var e = this;
        "" != a.globalData.openid ? wx.request({
            url: a.globalData.host + "/api/User/getShopnews",
            data: {
                shop_id: t,
                openid: a.globalData.openid
            },
            success: function(t) {
                1 == t.data.code && (a.globalData.shop_id = t.data.data.id, a.globalData.shop = t.data.data, 
                wx.setStorage({
                    key: "shop_id",
                    data: a.globalData.shop_id
                }));
            }
        }) : setTimeout(function() {
            e.getShopNews(t);
        }, 1e3);
    },
    onShow: function(t) {
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
                                var h = t.windowHeight - 100, n = .72 * h, d = e / i * h * .72, o = (.6 * t.windowWidth - d) / 2, l = .8 * t.windowHeight - n - 10;
                                a.setData({
                                    windowWidth: t.windowWidth,
                                    windowHeight: t.windowHeight,
                                    phonetype: c,
                                    bg: s,
                                    cheight: h,
                                    mheight: n,
                                    mwidth: d,
                                    cshow: !1,
                                    left: o,
                                    imgw: e,
                                    imgh: i,
                                    xc: o,
                                    yc: 10,
                                    fillw: o,
                                    fillh: l
                                });
                            }
                        });
                    }
                });
            }
        }), wx.getStorage({
            key: "mb",
            success: function(t) {
                a.setData({
                    mb: t.data,
                    addimgshow: !0
                }), wx.removeStorageSync("mb");
            }
        }), wx.getStorage({
            key: "tk",
            success: function(t) {
                a.setData({
                    tk: t.data,
                    addimgshow: !0
                }), wx.removeStorageSync("tk");
            }
        }), wx.getStorage({
            key: "tt",
            success: function(t) {
                var e = a.data.fillw + (a.data.mwidth - 90) / 2, i = a.data.tt, s = {
                    url: t.data[0].url,
                    picw: 90,
                    pich: 90,
                    x: e,
                    y: 10 + (a.data.mheight - 90) / 2,
                    scale: 1,
                    rotate: 0,
                    active: "active",
                    zindex: 6
                }, c = {
                    w: 90,
                    h: 90,
                    x: e + .2 * a.data.windowWidth,
                    y: .1 * a.data.windowHeight + 10 + (a.data.mheight - 90) / 2,
                    rotate: 0,
                    types: "tt",
                    index: i.length
                };
                if (i.length > 0) for (d = 0; d < i.length; d++) i[d].zindex = 5;
                i.push(s);
                var h = a.data.pics;
                if (h.length > 0) for (d = 0; d < h.length; d++) h[d].zindex = 3;
                var n = a.data.textimgs;
                if (n.length > 0) for (var d = 0; d < n.length; d++) n[d].zindex = 5;
                a.setData({
                    tt: i,
                    pics: h,
                    addimgshow: !0,
                    pk: c,
                    kshow: !1,
                    textimgs: n
                }), wx.removeStorageSync("tt");
            }
        });
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
                        var c = (.6 * a.data.windowWidth - s) / 2, h = {
                            url: i,
                            picw: s,
                            pich: a.data.mheight,
                            x: c,
                            y: 10,
                            scale: 1,
                            rotate: 0,
                            active: "active",
                            zindex: 4
                        }, n = {
                            w: s,
                            h: a.data.mheight,
                            x: c + .2 * a.data.windowWidth,
                            y: .1 * a.data.windowHeight + 10,
                            rotate: 0,
                            types: "pics",
                            index: t.length
                        };
                        if (t.length > 0) for (o = 0; o < t.length; o++) t[o].zindex = 3, t[o].active = "";
                        var d = a.data.tt;
                        if (d.length > 0) for (var o = 0; o < d.length; o++) d[o].zindex = 5, d[o].active = "";
                        t.push(h), a.setData({
                            pics: t,
                            tt: d,
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
        }) : "textimgs" == a.types && this.setData({
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
    submitdata: function() {
        if ("" != this.data.tk || 0 != this.data.pics.length || "" != this.data.mb || 0 != this.data.tt.length || 0 != this.data.textimgs.length) {
            wx.showLoading({
                title: "图片生成中...",
                mask: !0
            });
            var t = this;
            t.data.imgw, t.data.mwidth, t.data.imgh, t.data.mheight;
            e.clearRect(0, 0, t.data.imgw, t.data.imgh), e.save();
            var a = this.data.tk;
            "" != a ? (e.drawImage(a.url, 0, 0, t.data.imgw, t.data.imgh), this.drawpic()) : this.drawpic();
        } else wx.showToast({
            title: "未选中任何图片！",
            icon: "loading",
            duration: 1e3
        });
    },
    drawpic: function() {
        var t = this, a = t.data.imgw / t.data.mwidth, i = t.data.imgh / t.data.mheight, s = this.data.pics;
        if (s.length > 0) for (var c = 0; c < s.length; c++) {
            var h = s[c], n = h.x - t.data.xc - h.picw * (h.scale - 1) / 2, d = h.y - t.data.yc - h.pich * (h.scale - 1) / 2, o = n + h.picw * h.scale / 2, l = d + h.pich * h.scale / 2;
            e.save(), e.translate(o * a, l * i), e.rotate(h.rotate * Math.PI / 180), e.translate(-o * a, -l * i), 
            e.drawImage(h.url, n * a, d * i, h.picw * h.scale * a, h.pich * h.scale * i), e.restore(), 
            c == s.length - 1 && this.drawmb();
        } else this.drawmb();
    },
    drawmb: function() {
        var t = this, a = (t.data.imgw, t.data.mwidth, t.data.imgh, t.data.mheight, this.data.mb);
        "" != a ? (e.save(), e.drawImage(a.url, 0, 0, t.data.imgw, t.data.imgh), this.drawtt()) : this.drawtt();
    },
    drawtt: function() {
        var t = this, a = t.data.imgw / t.data.mwidth, i = t.data.imgh / t.data.mheight, s = this.data.tt;
        if (s.length > 0) for (var c = 0; c < s.length; c++) {
            var h = s[c], n = h.x - t.data.xc - h.picw * (h.scale - 1) / 2, d = h.y - t.data.yc - h.pich * (h.scale - 1) / 2, o = n + h.picw * h.scale / 2, l = d + h.pich * h.scale / 2;
            e.save(), e.translate(o * a, l * i), e.rotate(h.rotate * Math.PI / 180), e.translate(-o * a, -l * i), 
            e.drawImage(h.url, n * a, d * i, h.picw * h.scale * a, h.pich * h.scale * i), e.restore(), 
            c == s.length - 1 && this.drawtext();
        } else this.drawtext();
    },
    drawtext: function() {
        var t = this, i = t.data.imgw / t.data.mwidth, s = t.data.imgh / t.data.mheight, c = this.data.textimgs;
        if (c.length > 0) for (var h = 0; h < c.length; h++) {
            var n = c[h], d = n.x - t.data.xc - n.picw * (n.scale - 1) / 2, o = n.y - t.data.yc - n.pich * (n.scale - 1) / 2, l = d + n.picw * n.scale / 2, r = o + n.pich * n.scale / 2;
            e.save(), e.translate(l * i, r * s), e.rotate(n.rotate * Math.PI / 180), e.translate(-l * i, -r * s), 
            e.drawImage(n.url, d * i, o * s, n.picw * n.scale * i, n.pich * n.scale * s), e.restore();
        }
        e.draw(!1, function() {
            wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width: t.data.imgw,
                height: t.data.imgh,
                destWidth: t.data.imgw,
                destHeight: t.data.imgh,
                canvasId: "mycanvas",
                fileType: "jpg",
                quality: 1,
                success: function(e) {
                    a.globalData.imgurl = e.tempFilePath, wx.setStorage({
                        key: "phonetype",
                        data: t.data.phonetype
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
        h = t.target.dataset.idx, c = t.target.dataset.types;
        for (var a = this.data.pics, e = this.data.tt, s = this.data.textimgs, n = 0; n < a.length; n++) a[n].zindex = 3;
        for (n = 0; n < e.length; n++) e[n].zindex = 5;
        for (n = 0; n < s.length; n++) s[n].zindex = 5;
        if ("pics" == c) {
            a[h].zindex = 4;
            d = {
                w: a[h].picw * a[h].scale,
                h: a[h].pich * a[h].scale,
                x: .2 * this.data.windowWidth + a[h].x + (a[h].picw - a[h].picw * a[h].scale) / 2,
                y: .1 * this.data.windowHeight + a[h].y + (a[h].pich - a[h].pich * a[h].scale) / 2,
                rotate: a[h].rotate,
                types: "pics",
                index: h
            };
            this.setData({
                pics: a,
                tt: e,
                textimgs: s,
                pk: d,
                kshow: !1
            });
        } else if ("tt" == c) {
            e[h].zindex = 6;
            d = {
                w: e[h].picw * e[h].scale,
                h: e[h].pich * e[h].scale,
                x: .2 * this.data.windowWidth + e[h].x + (e[h].picw - e[h].picw * e[h].scale) / 2,
                y: .1 * this.data.windowHeight + e[h].y + (e[h].pich - e[h].pich * e[h].scale) / 2,
                rotate: e[h].rotate,
                types: "tt",
                index: h
            };
            this.setData({
                pics: a,
                tt: e,
                textimgs: s,
                pk: d,
                kshow: !1
            });
        } else if ("textimgs" == c) {
            s[h].zindex = 6;
            var d = {
                w: s[h].picw * s[h].scale,
                h: s[h].pich * s[h].scale,
                x: .2 * this.data.windowWidth + s[h].x + (s[h].picw - s[h].picw * s[h].scale) / 2,
                y: .1 * this.data.windowHeight + s[h].y + (s[h].pich - s[h].pich * s[h].scale) / 2,
                rotate: s[h].rotate,
                types: "textimgs",
                index: h
            };
            this.setData({
                pics: a,
                tt: e,
                textimgs: s,
                pk: d,
                kshow: !1
            });
        }
        t.touches.length < 2 ? (i = !0, r.x = t.touches[0].pageX, r.y = t.touches[0].pageY) : (v.x1 = t.touches[0].pageX, 
        v.y1 = t.touches[0].pageY, v.x2 = t.touches[1].pageX, v.y2 = t.touches[1].pageY);
    },
    bindtouchstart: function(t) {
        c = this.data.pk.types, h = this.data.pk.index;
        for (var a = this.data.pics, e = this.data.tt, s = this.data.textimgs, n = 0; n < a.length; n++) a[n].zindex = 3;
        for (n = 0; n < e.length; n++) e[n].zindex = 5;
        for (n = 0; n < s.length; n++) s[n].zindex = 5;
        if ("pics" == c) {
            a[h].zindex = 4;
            d = {
                w: a[h].picw * a[h].scale,
                h: a[h].pich * a[h].scale,
                x: .2 * this.data.windowWidth + a[h].x + (a[h].picw - a[h].picw * a[h].scale) / 2,
                y: .1 * this.data.windowHeight + a[h].y + (a[h].pich - a[h].pich * a[h].scale) / 2,
                rotate: a[h].rotate,
                types: "pics",
                index: h
            };
            this.setData({
                pics: a,
                tt: e,
                textimgs: s,
                pk: d
            });
        } else if ("tt" == c) {
            e[h].zindex = 6;
            d = {
                w: e[h].picw * e[h].scale,
                h: e[h].pich * e[h].scale,
                x: .2 * this.data.windowWidth + e[h].x + (e[h].picw - e[h].picw * e[h].scale) / 2,
                y: .1 * this.data.windowHeight + e[h].y + (e[h].pich - e[h].pich * e[h].scale) / 2,
                rotate: e[h].rotate,
                types: "tt",
                index: h
            };
            this.setData({
                pics: a,
                tt: e,
                textimgs: s,
                pk: d
            });
        } else if ("textimgs" == c) {
            s[h].zindex = 6;
            var d = {
                w: s[h].picw * s[h].scale,
                h: s[h].pich * s[h].scale,
                x: .2 * this.data.windowWidth + s[h].x + (s[h].picw - s[h].picw * s[h].scale) / 2,
                y: .1 * this.data.windowHeight + s[h].y + (s[h].pich - s[h].pich * s[h].scale) / 2,
                rotate: s[h].rotate,
                types: "textimgs",
                index: h
            };
            this.setData({
                pics: a,
                tt: e,
                textimgs: s,
                pk: d
            });
        }
        t.touches.length < 2 ? (i = !0, r.x = t.touches[0].pageX, r.y = t.touches[0].pageY) : (v.x1 = t.touches[0].pageX, 
        v.y1 = t.touches[0].pageY, v.x2 = t.touches[1].pageX, v.y2 = t.touches[1].pageY);
    },
    bindtouchmove: function(t) {
        var a = this, e = this.data[c], s = this.data.pk;
        if (t.touches.length < 2 && i) {
            var n = t.touches[0].pageX - r.x, d = t.touches[0].pageY - r.y;
            e[h].x = e[h].x + n, s.x = .2 * this.data.windowWidth + e[h].x + (e[h].picw - e[h].picw * e[h].scale) / 2, 
            e[h].y = e[h].y + d, s.y = .1 * this.data.windowHeight + e[h].y + (e[h].pich - e[h].pich * e[h].scale) / 2, 
            "pics" == c ? a.setData({
                pics: e,
                pk: s
            }) : "tt" == c ? a.setData({
                tt: e,
                pk: s
            }) : "textimgs" == c && a.setData({
                textimgs: e,
                pk: s
            }), r.x = t.touches[0].pageX, r.y = t.touches[0].pageY;
        } else if (t.touches.length > 1) {
            var o = JSON.parse(JSON.stringify(v));
            v.x1 = t.touches[0].pageX, v.y1 = t.touches[0].pageY, v.x2 = t.touches[1].pageX, 
            v.y2 = t.touches[1].pageY;
            var l = 360 * Math.atan((o.y1 - o.y2) / (o.x1 - o.x2)) / Math.PI, g = 360 * Math.atan((v.y1 - v.y2) / (v.x1 - v.x2)) / Math.PI;
            if (Math.abs(l - g) > 1) return;
            var w = Math.sqrt(Math.pow(o.x1 - o.x2, 2) + Math.pow(o.y1 - o.y2, 2)), p = Math.sqrt(Math.pow(v.x1 - v.x2, 2) + Math.pow(v.y1 - v.y2, 2));
            e[h].scale = e[h].scale + .005 * (p - w), s.x = s.x + (s.w - e[h].picw * e[h].scale) / 2, 
            s.y = s.y + (s.h - e[h].pich * e[h].scale) / 2, s.w = e[h].picw * e[h].scale, s.h = e[h].pich * e[h].scale;
            var x = 1 + Math.pow(1 - e[h].scale, 2);
            "pics" == c ? a.setData({
                pics: e,
                pk: s,
                bscale: x
            }) : "tt" == c ? a.setData({
                tt: e,
                pk: s,
                bscale: x
            }) : "textimgs" == c && a.setData({
                textimgs: e,
                pk: s,
                bscale: x
            });
        }
    },
    bindtouchend: function(t) {
        i = !1;
    },
    kdtouchstart: function(t) {
        s = !0, r.x = t.touches[0].pageX, r.y = t.touches[0].pageY;
    },
    kdtouchmove: function(t) {
        if (s) {
            var a = this, e = this.data[t.target.dataset.types], i = this.data.pk;
            if (h = t.target.dataset.idx, c = t.target.dataset.types, "kd" == t.target.dataset.kn) {
                var n = e[h].x + e[h].picw / 2 + .2 * a.data.windowWidth, d = e[h].y + e[h].pich / 2 + .1 * a.data.windowHeight, o = Math.sqrt(Math.pow(n - r.x, 2) + Math.pow(d - r.y, 2)), l = Math.sqrt(Math.pow(n - t.touches[0].pageX, 2) + Math.pow(d - t.touches[0].pageY, 2));
                e[h].scale = e[h].scale + .005 * (l - o), i.x = i.x + (i.w - e[h].picw * e[h].scale) / 2, 
                i.y = i.y + (i.h - e[h].pich * e[h].scale) / 2, i.w = e[h].picw * e[h].scale, i.h = e[h].pich * e[h].scale;
                var v = 1 - e[h].scale + 1;
                "pics" == c ? a.setData({
                    pics: e,
                    pk: i,
                    bscale: v
                }) : "tt" == c ? a.setData({
                    tt: e,
                    pk: i,
                    bscale: v
                }) : "textimgs" == c && a.setData({
                    textimgs: e,
                    pk: i,
                    bscale: v
                });
            } else if ("xz" == t.target.dataset.kn) {
                var n = e[h].x + e[h].picw / 2 + .2 * a.data.windowWidth, d = e[h].y + e[h].pich / 2 + .1 * a.data.windowHeight, g = 360 * Math.atan((d - r.y) / (n - r.x)) / Math.PI, w = 360 * Math.atan((d - t.touches[0].pageY) / (n - t.touches[0].pageX)) / Math.PI;
                Math.abs(g - w) > 1 && (e[h].rotate = e[h].rotate + w - g, i.rotate = e[h].rotate, 
                "pics" == c ? a.setData({
                    pics: e,
                    pk: i
                }) : "tt" == c ? a.setData({
                    tt: e,
                    pk: i
                }) : "textimgs" == c && a.setData({
                    textimgs: e,
                    pk: i
                }));
            }
            r.x = t.touches[0].pageX, r.y = t.touches[0].pageY;
        }
    },
    kdtouchend: function(t) {
        s = !1;
    },
    wenzibtn: function() {
        this.data.addshow ? this.setData({
            addshow: !1
        }) : this.setData({
            addshow: !0
        });
    },
    selectfamily: function(t) {
        for (var a = this.data.falimys, e = 0; e < a.length; e++) a[e].active = "";
        a[t.target.dataset.idx].active = "active", this.setData({
            falimys: a
        }), n = a[t.target.dataset.idx].val;
    },
    selectcolor: function(t) {
        for (var a = this.data.colors, e = 0; e < a.length; e++) a[e].active = "";
        a[t.currentTarget.dataset.idx].active = "active", this.setData({
            colors: a
        }), d = a[t.currentTarget.dataset.idx].val;
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
            e.setFillStyle(d), e.font = "50px " + n;
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
        o = t.detail.value;
        var a = wx.createCanvasContext("textcanvas");
        a.setFillStyle(d), a.font = "50px " + n;
        var e = a.measureText(o);
        this.setData({
            textwidth: e.width,
            textheight: 80,
            inputval: o
        });
    },
    surebtn: function() {
        for (var t = this.data.textimgs, a = this.data.colors, e = this.data.falimys, i = 0; i < a.length; i++) "active" == a[i].active && (d = a[i].val);
        for (i = 0; i < e.length; i++) "active" == e[i].active && (n = e[i].val);
        if (l) {
            var s = this.data.pk;
            if (t.splice(s.index, 1), 0 == this.data.textheight) {
                (o = wx.createCanvasContext("textcanvas")).setFillStyle(d), o.font = "50px " + n;
                var c = o.measureText(this.data.inputval);
                this.setData({
                    textwidth: c.width,
                    textheight: 80
                });
            }
            l = !1;
        }
        var h = this.data.fx;
        if ("" != this.data.inputval) {
            var o = wx.createCanvasContext("textcanvas"), r = this;
            "active" == h[0].active ? (o.translate(r.data.textwidth / 2, 0), o.setFillStyle(d), 
            o.font = "50px " + n, o.setTextAlign("center"), o.fillText(r.data.inputval, 0, 50), 
            o.setTransform(1, 0, 0, 1, 0, 0), o.draw(), wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                canvasId: "textcanvas",
                success: function(a) {
                    var e = (.6 * r.data.windowWidth - r.data.textwidth) / 2, i = (r.data.mheight - r.data.textheight) / 2, s = {
                        url: a.tempFilePath,
                        picw: r.data.textwidth,
                        pich: r.data.textheight,
                        x: e,
                        y: i,
                        scale: 1,
                        rotate: 0,
                        active: "active",
                        zindex: 6,
                        falimys: r.data.falimys,
                        fx: r.data.fx,
                        colors: r.data.colors,
                        text: r.data.inputval
                    };
                    if (t.length > 0) for (var c = 0; c < t.length; c++) t[c].zindex = 5, t[c].active = "";
                    var h = {
                        w: r.data.textwidth,
                        h: r.data.textheight,
                        x: e + .2 * r.data.windowWidth,
                        y: .1 * r.data.windowHeight + i,
                        rotate: 0,
                        types: "textimgs",
                        index: t.length
                    };
                    t.push(s), r.setData({
                        textimgs: t,
                        addimgshow: !0,
                        addshow: !1,
                        kshow: !1,
                        pk: h,
                        inputval: "",
                        fx: [ {
                            name: "横向",
                            active: "active"
                        }, {
                            name: "纵向",
                            active: ""
                        } ],
                        falimys: [ {
                            val: "SimHei",
                            name: "黑体",
                            active: "active"
                        }, {
                            val: "SimSun",
                            name: "宋体",
                            active: ""
                        }, {
                            val: "Microsoft Yahei",
                            name: "微软雅黑",
                            active: ""
                        }, {
                            val: "Microsoft JhengHei",
                            name: "微软正黑体",
                            active: ""
                        }, {
                            val: "KaiTi",
                            name: "楷体",
                            active: ""
                        }, {
                            val: "NSimSun",
                            name: "新宋体",
                            active: ""
                        }, {
                            val: "FangSong",
                            name: "仿宋",
                            active: ""
                        } ],
                        colors: [ {
                            val: "#000000",
                            name: "黑色",
                            active: "active"
                        }, {
                            val: "#333333",
                            name: "灰色",
                            active: ""
                        }, {
                            val: "#666666",
                            name: "浅灰",
                            active: ""
                        }, {
                            val: "#ffffff",
                            name: "白色",
                            active: ""
                        }, {
                            val: "#134368",
                            name: "深蓝",
                            active: ""
                        }, {
                            val: "#208ddc",
                            name: "蓝色",
                            active: ""
                        }, {
                            val: "#43b6c3",
                            name: "浅蓝",
                            active: ""
                        }, {
                            val: "#035e29",
                            name: "绿色",
                            active: ""
                        }, {
                            val: "#98ca4a",
                            name: "浅蓝",
                            active: ""
                        }, {
                            val: "#910072",
                            name: "深紫",
                            active: ""
                        }, {
                            val: "#bf231b",
                            name: "大红",
                            active: ""
                        }, {
                            val: "#fb183d",
                            name: "玫红",
                            active: ""
                        }, {
                            val: "#ef295e",
                            name: "粉红",
                            active: ""
                        }, {
                            val: "#ef690e",
                            name: "深黄",
                            active: ""
                        }, {
                            val: "#f19921",
                            name: "黄色",
                            active: ""
                        } ]
                    });
                }
            })) : this.drawTextVertical(o, this.data.inputval, 0, 0, 80, 600, !0, n, d);
        } else wx.showToast({
            title: "请输入文字",
            mask: !0,
            icon: "loading",
            duration: 2e3
        });
    },
    drawTextVertical: function(t, a, e, i, s, c) {
        arguments.length > 6 && void 0 !== arguments[6] && arguments[6];
        var h = arguments[7], n = arguments[8], d = t.measureText(a), o = [ t.textAlign, t.textBaseline ], l = o[0], r = o[1], v = [ "center", "middle" ];
        t.textAlign = v[0], t.textBaseline = v[1];
        var g = [], w = !0, p = !1, x = void 0;
        try {
            for (var m, f = a[Symbol.iterator](); !(w = (m = f.next()).done); w = !0) {
                var u = m.value, y = {
                    char: u,
                    needsRotation: this.needsRotation(u)
                };
                if (y.needsRotation) {
                    var k = [ 50, t.measureText(u).width ];
                    y.width = k[0], y.height = k[1];
                } else {
                    var b = [ t.measureText(u).width, 50 ];
                    y.width = b[0], y.height = b[1];
                }
                g.push(y);
            }
        } catch (t) {
            p = !0, x = t;
        } finally {
            try {
                !w && f.return && f.return();
            } finally {
                if (p) throw x;
            }
        }
        var S = [], D = [], M = 0, T = !0, z = !1, H = void 0;
        try {
            for (var I, W = g[Symbol.iterator](); !(T = (I = W.next()).done); T = !0) {
                var Y = I.value;
                "\n" === Y.char || M + Y.height > c ? (S.push({
                    charInfo: D,
                    height: M
                }), D = "\n" === Y.char ? [] : [ Y ], M = Y.height) : (D.push(Y), M += Y.height);
            }
        } catch (t) {
            z = !0, H = t;
        } finally {
            try {
                !T && W.return && W.return();
            } finally {
                if (z) throw H;
            }
        }
        S.push({
            charInfo: D,
            height: M
        });
        var P = e + (s + 50 * S.length) / 2 - 25, F = !0, X = !1, C = void 0;
        try {
            for (var N, q = S[Symbol.iterator](); !(F = (N = q.next()).done); F = !0) {
                var A = N.value, _ = void 0;
                _ = "center" === l ? i + (c - A.height) / 2 : "right" === l ? i + c - A.height : i;
                var J = !0, L = !1, R = void 0;
                try {
                    for (var K, O = A.charInfo[Symbol.iterator](); !(J = (K = O.next()).done); J = !0) {
                        var B = K.value;
                        t.setFillStyle(n), t.font = "50px " + h, t.translate(P, _ + B.height / 2), t.fillText(B.char, 0, 0), 
                        t.setTransform(1, 0, 0, 1, 0, 0), _ += B.height;
                    }
                } catch (t) {
                    L = !0, R = t;
                } finally {
                    try {
                        !J && O.return && O.return();
                    } finally {
                        if (L) throw R;
                    }
                }
                P -= 50;
            }
        } catch (t) {
            X = !0, C = t;
        } finally {
            try {
                !F && q.return && q.return();
            } finally {
                if (X) throw C;
            }
        }
        var j = [ l, r ];
        t.textAlign = j[0], t.textBaseline = j[1], t.draw();
        var U = this;
        wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: 80,
            height: d.width,
            canvasId: "textcanvas",
            success: function(t) {
                var e = (.6 * U.data.windowWidth - 80) / 2, i = (U.data.mheight - d.width) / 2, s = {
                    url: t.tempFilePath,
                    picw: 80,
                    pich: d.width,
                    x: e,
                    y: i,
                    scale: 1,
                    rotate: 0,
                    active: "active",
                    zindex: 6,
                    falimys: U.data.falimys,
                    fx: U.data.fx,
                    colors: U.data.colors,
                    text: a
                }, c = U.data.textimgs;
                if (c.length > 0) for (var h = 0; h < c.length; h++) c[h].zindex = 5, c[h].active = "";
                var n = {
                    w: 80,
                    h: d.width,
                    x: e + .2 * U.data.windowWidth,
                    y: .1 * U.data.windowHeight + i,
                    rotate: 0,
                    types: "textimgs",
                    index: c.length
                };
                c.push(s), U.setData({
                    textimgs: c,
                    addimgshow: !0,
                    addshow: !1,
                    kshow: !1,
                    pk: n,
                    inputval: "",
                    fx: [ {
                        name: "横向",
                        active: "active"
                    }, {
                        name: "纵向",
                        active: ""
                    } ],
                    falimys: [ {
                        val: "SimHei",
                        name: "黑体",
                        active: "active"
                    }, {
                        val: "SimSun",
                        name: "宋体",
                        active: ""
                    }, {
                        val: "Microsoft Yahei",
                        name: "微软雅黑",
                        active: ""
                    }, {
                        val: "Microsoft JhengHei",
                        name: "微软正黑体",
                        active: ""
                    }, {
                        val: "KaiTi",
                        name: "楷体",
                        active: ""
                    }, {
                        val: "NSimSun",
                        name: "新宋体",
                        active: ""
                    }, {
                        val: "FangSong",
                        name: "仿宋",
                        active: ""
                    } ],
                    colors: [ {
                        val: "#000000",
                        name: "黑色",
                        active: "active"
                    }, {
                        val: "#333333",
                        name: "灰色",
                        active: ""
                    }, {
                        val: "#666666",
                        name: "浅灰",
                        active: ""
                    }, {
                        val: "#ffffff",
                        name: "白色",
                        active: ""
                    }, {
                        val: "#134368",
                        name: "深蓝",
                        active: ""
                    }, {
                        val: "#208ddc",
                        name: "蓝色",
                        active: ""
                    }, {
                        val: "#43b6c3",
                        name: "浅蓝",
                        active: ""
                    }, {
                        val: "#035e29",
                        name: "绿色",
                        active: ""
                    }, {
                        val: "#98ca4a",
                        name: "浅蓝",
                        active: ""
                    }, {
                        val: "#910072",
                        name: "深紫",
                        active: ""
                    }, {
                        val: "#bf231b",
                        name: "大红",
                        active: ""
                    }, {
                        val: "#fb183d",
                        name: "玫红",
                        active: ""
                    }, {
                        val: "#ef295e",
                        name: "粉红",
                        active: ""
                    }, {
                        val: "#ef690e",
                        name: "深黄",
                        active: ""
                    }, {
                        val: "#f19921",
                        name: "黄色",
                        active: ""
                    } ]
                });
            }
        });
    },
    needsRotation: function(a) {
        var e = a.codePointAt(0), i = !0, s = !1, c = void 0;
        try {
            for (var h, n = g[Symbol.iterator](); !(i = (h = n.next()).done); i = !0) {
                var d = t(h.value, 2), o = d[0], l = d[1];
                if (o <= e && e <= l) return !1;
            }
        } catch (t) {
            s = !0, c = t;
        } finally {
            try {
                !i && n.return && n.return();
            } finally {
                if (s) throw c;
            }
        }
        return !0;
    },
    catchtxt: function() {
        this.setData({
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
                val: "SimHei",
                name: "黑体",
                active: "active"
            }, {
                val: "SimSun",
                name: "宋体",
                active: ""
            }, {
                val: "Microsoft Yahei",
                name: "微软雅黑",
                active: ""
            }, {
                val: "Microsoft JhengHei",
                name: "微软正黑体",
                active: ""
            }, {
                val: "KaiTi",
                name: "楷体",
                active: ""
            }, {
                val: "NSimSun",
                name: "新宋体",
                active: ""
            }, {
                val: "FangSong",
                name: "仿宋",
                active: ""
            } ],
            colors: [ {
                val: "#000000",
                name: "黑色",
                active: "active"
            }, {
                val: "#333333",
                name: "灰色",
                active: ""
            }, {
                val: "#666666",
                name: "浅灰",
                active: ""
            }, {
                val: "#ffffff",
                name: "白色",
                active: ""
            }, {
                val: "#134368",
                name: "深蓝",
                active: ""
            }, {
                val: "#208ddc",
                name: "蓝色",
                active: ""
            }, {
                val: "#43b6c3",
                name: "浅蓝",
                active: ""
            }, {
                val: "#035e29",
                name: "绿色",
                active: ""
            }, {
                val: "#98ca4a",
                name: "浅蓝",
                active: ""
            }, {
                val: "#910072",
                name: "深紫",
                active: ""
            }, {
                val: "#bf231b",
                name: "大红",
                active: ""
            }, {
                val: "#fb183d",
                name: "玫红",
                active: ""
            }, {
                val: "#ef295e",
                name: "粉红",
                active: ""
            }, {
                val: "#ef690e",
                name: "深黄",
                active: ""
            }, {
                val: "#f19921",
                name: "黄色",
                active: ""
            } ]
        });
    },
    inptch: function() {
        console.log(333);
    },
    leftbtn: function() {
        this.setData({
            kshow: !0
        });
    },
    selcttext: function(t) {
        n = this.data.pk;
        if (c = t.currentTarget.dataset.types, h = t.currentTarget.dataset.ind, "textimgs" == n.types && n.index == h) {
            i = this.data.textimgs;
            l = !0, this.setData({
                addshow: !0,
                falimys: i[h].falimys,
                fx: i[h].fx,
                colors: i[h].colors,
                inputval: i[h].text
            });
        } else {
            for (var a = this.data.pics, e = this.data.tt, i = this.data.textimgs, s = 0; s < a.length; s++) a[s].zindex = 3;
            for (s = 0; s < e.length; s++) e[s].zindex = 5;
            for (s = 0; s < i.length; s++) i[s].zindex = 5;
            if ("pics" == c) {
                a[h].zindex = 4;
                n = {
                    w: a[h].picw * a[h].scale,
                    h: a[h].pich * a[h].scale,
                    x: .2 * this.data.windowWidth + a[h].x + (a[h].picw - a[h].picw * a[h].scale) / 2,
                    y: .1 * this.data.windowHeight + a[h].y + (a[h].pich - a[h].pich * a[h].scale) / 2,
                    rotate: a[h].rotate,
                    types: "pics",
                    index: h
                };
                this.setData({
                    pics: a,
                    tt: e,
                    textimgs: i,
                    pk: n
                });
            } else if ("tt" == c) {
                e[h].zindex = 6;
                n = {
                    w: e[h].picw * e[h].scale,
                    h: e[h].pich * e[h].scale,
                    x: .2 * this.data.windowWidth + e[h].x + (e[h].picw - e[h].picw * e[h].scale) / 2,
                    y: .1 * this.data.windowHeight + e[h].y + (e[h].pich - e[h].pich * e[h].scale) / 2,
                    rotate: e[h].rotate,
                    types: "tt",
                    index: h
                };
                this.setData({
                    pics: a,
                    tt: e,
                    textimgs: i,
                    pk: n
                });
            } else if ("textimgs" == c) {
                i[h].zindex = 6;
                var n = {
                    w: i[h].picw * i[h].scale,
                    h: i[h].pich * i[h].scale,
                    x: .2 * this.data.windowWidth + i[h].x + (i[h].picw - i[h].picw * i[h].scale) / 2,
                    y: .1 * this.data.windowHeight + i[h].y + (i[h].pich - i[h].pich * i[h].scale) / 2,
                    rotate: i[h].rotate,
                    types: "textimgs",
                    index: h
                };
            }
            this.setData({
                pics: a,
                tt: e,
                textimgs: i,
                pk: n,
                kshow: !1
            });
        }
    }
});