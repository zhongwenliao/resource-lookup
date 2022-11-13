var t = function(t) {
    return t && t.__esModule ? t : {
        default: t
    };
}(require("../../utils/util.js")), a = getApp(), e = wx.createCanvasContext("mycanvas"), i = "", s = "", c = "SimHei", o = "rgb(0,0,0)", d = "", n = !1;

Page({
    data: {
        types: "",
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
        admin: !0,
        imageSize: ""
    },
    movedata: function(t) {
        if (console.log(t), "tt" == t.getDataset.types) {
            var a = this.data.tt, e = this.data.pk;
            a[t.getDataset.idx].x = t.getDataset.x, a[t.getDataset.idx].y = t.getDataset.y, 
            a[t.getDataset.idx].picw = t.getDataset.w, a[t.getDataset.idx].pich = t.getDataset.h, 
            a[t.getDataset.idx].scale = t.getDataset.scale, a[t.getDataset.idx].rotate = t.getDataset.rotate, 
            e.x = t.picslistdata.x, e.y = t.picslistdata.y, e.w = t.picslistdata.w, e.h = t.picslistdata.h, 
            e.rotate = t.picslistdata.rotate, this.setData({
                tt: a,
                pk: e
            });
        }
        if ("pics" == t.getDataset.types) {
            var i = this.data.pics, e = this.data.pk;
            i[t.getDataset.idx].x = t.getDataset.x, i[t.getDataset.idx].y = t.getDataset.y, 
            i[t.getDataset.idx].picw = t.getDataset.w, i[t.getDataset.idx].pich = t.getDataset.h, 
            i[t.getDataset.idx].scale = t.getDataset.scale, i[t.getDataset.idx].rotate = t.getDataset.rotate, 
            e.x = t.picslistdata.x, e.y = t.picslistdata.y, e.w = t.picslistdata.w, e.h = t.picslistdata.h, 
            e.rotate = t.picslistdata.rotate, this.setData({
                pics: i,
                pk: e
            });
        }
        if ("textimgs" == t.getDataset.types) {
            var s = this.data.textimgs, e = this.data.pk;
            s[t.getDataset.idx].x = t.getDataset.x, s[t.getDataset.idx].y = t.getDataset.y, 
            s[t.getDataset.idx].picw = t.getDataset.w, s[t.getDataset.idx].pich = t.getDataset.h, 
            s[t.getDataset.idx].scale = t.getDataset.scale, s[t.getDataset.idx].rotate = t.getDataset.rotate, 
            e.x = t.picslistdata.x, e.y = t.picslistdata.y, e.w = t.picslistdata.w, e.h = t.picslistdata.h, 
            e.rotate = t.picslistdata.rotate, this.setData({
                textimgs: s,
                pk: e
            });
        }
        if ("tk" == t.getDataset.types) {
            var c = this.data.tk, e = this.data.pk;
            c[0].x = t.getDataset.x, c[0].y = t.getDataset.y, c[0].picw = t.getDataset.w, c[0].pich = t.getDataset.h, 
            c[0].scale = t.getDataset.scale, c[0].rotate = t.getDataset.rotate, e.x = t.picslistdata.x, 
            e.y = t.picslistdata.y, e.w = t.picslistdata.w, e.h = t.picslistdata.h, e.rotate = t.picslistdata.rotate, 
            this.setData({
                tk: c,
                pk: e
            });
        }
        if ("mb" == t.getDataset.types) {
            var o = this.data.mb, e = this.data.pk;
            o[0].x = t.getDataset.x, o[0].y = t.getDataset.y, o[0].picw = t.getDataset.w, o[0].pich = t.getDataset.h, 
            o[0].scale = t.getDataset.scale, o[0].rotate = t.getDataset.rotate, e.x = t.picslistdata.x, 
            e.y = t.picslistdata.y, e.w = t.picslistdata.w, e.h = t.picslistdata.h, e.rotate = t.picslistdata.rotate, 
            this.setData({
                mb: o,
                pk: e
            });
        }
    },
    onLoad: function(t) {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        }), a.globalData.types = t.types, this.setData({
            types: t.types,
            admin: !a.globalData.admin
        }), wx.setNavigationBarTitle({
            title: a.globalData.shop.nickname
        });
        var e = this;
        wx.getSystemInfo({
            success: function(t) {
                t.model.indexOf("iPhone") > -1 && (t.model = t.model.split("<")[0]);
                var a = t.windowWidth, i = t.windowHeight;
                e.setData({
                    phonetype: {
                        name: t.model
                    }
                }), e.getShopMobile(t.model, i, a);
            }
        });
    },
    getShopMobile: function(t, e, i) {
        var s = this, c = 0, o = 0;
        wx.showLoading({
            title: "加载中...",
            mask: !0
        }), "" != a.globalData.shop_id ? wx.request({
            url: a.globalData.host + "/api/Index/searchMmobile",
            data: {
                model: t,
                shop_id: a.globalData.shop_id,
                types: a.globalData.types
            },
            success: function(t) {
                if (0 == t.data.code) a.globalData.onloadss = !0, wx.navigateTo({
                    url: "/pages/selecttypes/selecttypes"
                }), wx.hideLoading(); else {
                    var d = t.data.data;
                    wx.removeStorageSync("ppselcs"), wx.setStorageSync("ppselcs", d.bgimage), wx.getImageInfo({
                        src: d.bgimage,
                        success: function(t) {
                            if (c = t.width, o = t.height, c < o) if ((r = c / o * (p = .72 * (g = e - 100))) > .66 * i) var a = (.66 * i - (r = .66 * i)) / 2, n = .8 * e - (p = o / c * r) - 10, h = 10, l = "15%"; else var a = (.66 * i - r) / 2, n = .8 * e - p - 10, h = 10, l = "15%"; else {
                                var g = .66 * i, r = g, p = o / c * r;
                                if (r > .66 * i) var a = (.66 * i - (r = .66 * i)) / 2, n = .8 * e - (p = o / c * r) - 10, h = 10, l = "15%"; else var a = (.66 * i - r) / 2, h = n = (.8 * e - p) / 2, l = 0;
                            }
                            s.setData({
                                windowWidth: i,
                                windowHeight: e,
                                phonetype: d,
                                bg: d.bgimage,
                                cheight: g,
                                mheight: p,
                                mwidth: r,
                                cshow: !1,
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
                    }), wx.hideLoading();
                }
            }
        }) : setTimeout(function() {
            s.getShopMobile(t, e, i);
        }, 1e3);
    },
    onShow: function(t) {
        var e = this;
        a.globalData.onloadss && (this.setData({
            kshow: !0
        }), wx.getStorage({
            key: "ppselc",
            success: function(t) {
                a.globalData.onloadss = !1;
                var i = 0, s = 0, c = t.data.bgimage, o = t.data;
                wx.showLoading({
                    title: "加载中...",
                    mask: !0
                }), wx.removeStorageSync("ppselcs"), wx.setStorageSync("ppselcs", t.data.bgimage), 
                wx.getImageInfo({
                    src: c,
                    success: function(t) {
                        i = t.width, s = t.height, wx.getSystemInfo({
                            success: function(t) {
                                if (i < s) {
                                    var a = t.windowHeight - 100;
                                    if ((g = i / s * (r = .72 * a)) > .66 * t.windowWidth) {
                                        g = .66 * t.windowWidth, r = s / i * g;
                                        var d = (.66 * t.windowWidth - g) / 2, n = .8 * t.windowHeight - r - 10, h = 10, l = "15%";
                                    } else var d = (.66 * t.windowWidth - g) / 2, n = .8 * t.windowHeight - r - 10, h = 10, l = "15%";
                                } else {
                                    var g = a = .66 * t.windowWidth, r = s / i * g;
                                    if (g > .66 * t.windowWidth) {
                                        g = .66 * t.windowWidth, r = s / i * g;
                                        var d = (.66 * t.windowWidth - g) / 2, n = .8 * t.windowHeight - r - 10, h = 10, l = "15%";
                                    } else var d = (.66 * t.windowWidth - g) / 2, h = n = (.8 * t.windowHeight - r) / 2, l = 0;
                                }
                                e.setData({
                                    windowWidth: t.windowWidth,
                                    windowHeight: t.windowHeight,
                                    phonetype: o,
                                    bg: c,
                                    cheight: a,
                                    mheight: r,
                                    mwidth: g,
                                    cshow: !1,
                                    left: d,
                                    imgw: i,
                                    imgh: s,
                                    xc: d,
                                    yc: h,
                                    fillw: d,
                                    fillh: n,
                                    masktop: h,
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
        })), wx.getStorage({
            key: "mb",
            success: function(t) {
                e.setData({
                    kshow: !0
                }), wx.showLoading({
                    title: "加载中...",
                    mask: !0
                }), wx.getImageInfo({
                    src: t.data.url,
                    success: function(t) {
                        var a = [ {
                            url: t.path,
                            picw: e.data.mwidth,
                            pich: e.data.mheight,
                            x: e.data.left,
                            y: e.data.masktop,
                            scale: 1,
                            rotate: 0,
                            active: "active",
                            zindex: 1,
                            clock: "../../img/clock1.png"
                        } ];
                        e.setData({
                            mb: a,
                            addimgshow: !0
                        }), wx.removeStorageSync("mb"), wx.hideLoading();
                    },
                    fail: function(t) {}
                });
            }
        }), wx.getStorage({
            key: "tk",
            success: function(t) {
                e.setData({
                    kshow: !0
                }), wx.showLoading({
                    title: "加载中...",
                    mask: !0
                }), wx.getImageInfo({
                    src: t.data.url,
                    success: function(t) {
                        var a = [ {
                            url: t.path,
                            picw: e.data.mwidth,
                            pich: e.data.mheight,
                            x: e.data.left,
                            y: e.data.masktop,
                            scale: 1,
                            rotate: 0,
                            active: "active",
                            zindex: 1,
                            clock: "../../img/clock1.png"
                        } ];
                        e.setData({
                            tk: a,
                            addimgshow: !0
                        }), wx.removeStorageSync("tk"), wx.hideLoading();
                    },
                    fail: function(t) {}
                });
            }
        }), wx.getStorage({
            key: "tt",
            success: function(t) {
                e.setData({
                    kshow: !0
                }), wx.showLoading({
                    title: "加载中...",
                    mask: !0
                }), wx.getImageInfo({
                    src: t.data[0].url,
                    success: function(t) {
                        var a = t.path, i = t.width, s = t.height;
                        i == s ? (i = 90, s = 90) : (i = 90, s = t.height / t.width * 90);
                        var c = e.data.fillw + (e.data.mwidth - i) / 2, o = e.data.tt, d = {
                            url: a,
                            picw: i,
                            pich: s,
                            x: c,
                            y: e.data.masktop + (e.data.mheight - s) / 2,
                            scale: 1,
                            rotate: 0,
                            zindex: 6
                        }, n = {
                            w: i,
                            h: s,
                            x: c + .17 * e.data.windowWidth,
                            y: .1 * e.data.windowHeight + e.data.masktop + (e.data.mheight - s) / 2,
                            rotate: 0,
                            types: "tt",
                            index: o.length
                        };
                        if (o.length > 0) for (var h = 0; h < o.length; h++) void 0 != o[h] && (o[h].zindex = 5);
                        o.push(d), e.setData({
                            tt: o,
                            addimgshow: !0,
                            pk: n,
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
                } ], o = {
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
                    pk: o,
                    kshow: !1
                });
            }
        }) : (a[0].clock = "../../img/clock1.png", t.setData({
            mb: a,
            kshow: !0
        }));
    },
    tkclock: function(t) {
        var a = this, e = this.data.tk;
        "../../img/clock1.png" == e[0].clock ? wx.getImageInfo({
            src: e[0].url,
            success: function(t) {
                var i = t.width;
                i = i / t.height * a.data.mheight;
                var s = (.66 * a.data.windowWidth - i) / 2, c = [ {
                    url: e[0].url,
                    picw: i,
                    pich: a.data.mheight,
                    x: s,
                    y: a.data.masktop,
                    scale: 1,
                    rotate: 0,
                    active: "active",
                    zindex: 1,
                    clock: "../../img/clock2.png"
                } ], o = {
                    w: i,
                    h: a.data.mheight,
                    x: s + .17 * a.data.windowWidth,
                    y: .1 * a.data.windowHeight + a.data.masktop,
                    rotate: 0,
                    types: "tk",
                    index: 0
                };
                a.setData({
                    tk: c,
                    pk: o,
                    kshow: !1
                });
            }
        }) : (e[0].clock = "../../img/clock1.png", a.setData({
            tk: e,
            kshow: !0
        }));
    },
    eidttype: function() {
        a.globalData.onloadss = !0, wx.navigateTo({
            url: "/pages/selecttypes/selecttypes"
        });
    },
    getCanvasImg: function(a, e, i, s) {
        var c = this;
        wx.getImageInfo({
            src: i[0],
            success: function(o) {
                var d = t.default.imageUtil(o);
                if (c.setData({
                    imageSize: d
                }), a < i.length) {
                    var n = wx.createCanvasContext("attendCanvasId");
                    n.drawImage(i[a], 0, 0, d.imageWidth, d.imageHeight), n.draw(!1, function() {
                        a += 1, console.log(d), wx.canvasToTempFilePath({
                            x: 0,
                            y: 0,
                            width: d.imageWidth,
                            height: d.imageHeight,
                            destWidth: d.imageWidth,
                            destHeight: d.imageHeight,
                            canvasId: "attendCanvasId",
                            fileType: "jpg",
                            quality: 1,
                            success: function(t) {
                                console.log(t), c.uploadCanvasImg(t.tempFilePath, s[0]);
                            },
                            fail: function(t) {
                                e += 1, c.getCanvasImg(inedx, e, i, s);
                            }
                        });
                    });
                }
            },
            fail: function() {},
            complete: function() {}
        });
    },
    uploadCanvasImg: function(t, e) {
        var i = this.data.pics, s = this, c = t;
        wx.uploadFile({
            url: a.globalData.host + "/api/Checkfile/Checkfile",
            filePath: c,
            name: "file",
            success: function(t) {
                wx.hideLoading(), 1 == JSON.parse(t.data).code ? wx.getImageInfo({
                    src: e,
                    success: function(t) {
                        var a = t.width;
                        a = a / t.height * s.data.mheight;
                        var c = (.66 * s.data.windowWidth - a) / 2, o = {
                            url: e,
                            picw: a,
                            pich: s.data.mheight,
                            x: c,
                            y: s.data.masktop,
                            scale: 1,
                            rotate: 0,
                            active: "active",
                            zindex: 4
                        }, d = {
                            w: a,
                            h: s.data.mheight,
                            x: c + .17 * s.data.windowWidth,
                            y: .1 * s.data.windowHeight + s.data.masktop,
                            rotate: 0,
                            types: "pics",
                            index: i.length
                        };
                        if (i.length > 0) for (h = 0; h < i.length; h++) void 0 != i[h] && (i[h].zindex = 3);
                        var n = s.data.tt;
                        if (n.length > 0) for (var h = 0; h < n.length; h++) void 0 != n[h] && (n[h].zindex = 5);
                        i.push(o), s.setData({
                            pics: i,
                            tt: n,
                            addimgshow: !0,
                            pk: d,
                            kshow: !1
                        }), console.log(s.data.kshow);
                    }
                }) : wx.showToast({
                    title: "图片不安全",
                    icon: "loading",
                    duration: 2e3
                });
            }
        });
    },
    addimg: function() {
        var t = this;
        this.setData({
            kshow: !0
        }), wx.chooseImage({
            count: 1,
            sizeType: [ "original" ],
            sourceType: [ "album", "camera" ],
            success: function(a) {
                var e = a.tempFilePaths;
                t.getCanvasImg(0, 0, e, e), wx.showLoading({
                    title: "图片验证中",
                    mask: !0
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
        e.splice(a.index, 1), console.log(e), "pics" == a.types ? this.setData({
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
        delete a[t.target.dataset.idx], this.setData({
            textimgs: a,
            kshow: !0
        });
    },
    printoo: function() {
        this.submitdata(1);
    },
    bindGetUserInfo: function(t) {
        wx.showLoading({
            title: "提交数据...",
            mask: !0,
            duration: 1e3
        });
        var e = this, i = t.detail.userInfo.avatarUrl, s = t.detail.userInfo.nickName;
        wx.showLoading({
            title: s,
            mask: !0
        }), wx.request({
            url: a.globalData.host + "/api/Index/edituseravater",
            data: {
                shop_id: a.globalData.shop_id,
                openid: a.globalData.openid,
                avatar: i,
                nickname: s
            },
            method: "GET",
            dataType: "json",
            success: function(t) {
                1 == t.data.code && (a.globalData.userInfo = t.data.data, e.setData({
                    canIUse: !1
                }), e.submitdata());
            },
            fail: function(t) {
                wx.showLoading({
                    title: JSON.stringify(t),
                    mask: !0,
                    duration: 50
                });
            },
            complete: function(t) {}
        });
    },
    submitdata: function() {
        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
        if ("" != this.data.tk || 0 != this.data.pics.length || "" != this.data.mb || 0 != this.data.tt.length || 0 != this.data.textimgs.length) {
            wx.showLoading({
                title: "图片生成中...",
                mask: !0,
                duration: 200
            });
            var a = this;
            e.clearRect(0, 0, a.data.imgw, a.data.imgh), e.fillStyle = "#ffffff", e.fillRect(0, 0, a.data.imgw, a.data.imgh), 
            e.save();
            var i = this.data.tk, s = a.data.imgw / a.data.mwidth, c = a.data.imgh / a.data.mheight;
            if (i.length > 0) {
                for (var o = 0; o < i.length; o++) if (void 0 != i[o]) {
                    var d = i[o], n = d.x - a.data.xc - d.picw * (d.scale - 1) / 2, h = d.y - a.data.yc - d.pich * (d.scale - 1) / 2, l = n + d.picw * d.scale / 2, g = h + d.pich * d.scale / 2;
                    e.save(), e.translate(l * s, g * c), e.rotate(d.rotate * Math.PI / 180), e.translate(-l * s, -g * c), 
                    e.drawImage(d.url, n * s, h * c, d.picw * d.scale * s, d.pich * d.scale * c), e.restore();
                }
                this.drawpic(t);
            } else this.drawpic(t);
        } else wx.showToast({
            title: "未选中任何图片！",
            icon: "loading",
            duration: 2e3
        });
    },
    drawpic: function() {
        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "", a = this, i = a.data.imgw / a.data.mwidth, s = a.data.imgh / a.data.mheight, c = this.data.pics;
        if (c.length > 0) for (var o = 0; o < c.length; o++) {
            if (void 0 != c[o]) {
                var d = c[o], n = d.x - a.data.xc - d.picw * (d.scale - 1) / 2, h = d.y - a.data.yc - d.pich * (d.scale - 1) / 2, l = n + d.picw * d.scale / 2, g = h + d.pich * d.scale / 2;
                e.save(), e.translate(l * i, g * s), e.rotate(d.rotate * Math.PI / 180), e.translate(-l * i, -g * s), 
                e.drawImage(d.url, n * i, h * s, d.picw * d.scale * i, d.pich * d.scale * s), e.restore();
            }
            o == c.length - 1 && this.drawmb(t);
        } else this.drawmb(t);
    },
    drawmb: function() {
        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "", a = this, i = this.data.mb, s = a.data.imgw / a.data.mwidth, c = a.data.imgh / a.data.mheight;
        if (i.length > 0) {
            for (var o = 0; o < i.length; o++) if (void 0 != i[o]) {
                var d = i[o], n = d.x - a.data.xc - d.picw * (d.scale - 1) / 2, h = d.y - a.data.yc - d.pich * (d.scale - 1) / 2, l = n + d.picw * d.scale / 2, g = h + d.pich * d.scale / 2;
                e.save(), e.translate(l * s, g * c), e.rotate(d.rotate * Math.PI / 180), e.translate(-l * s, -g * c), 
                e.drawImage(d.url, n * s, h * c, d.picw * d.scale * s, d.pich * d.scale * c), e.restore();
            }
            this.drawtt(t);
        } else this.drawtt(t);
    },
    drawtt: function() {
        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "", a = this, i = a.data.imgw / a.data.mwidth, s = a.data.imgh / a.data.mheight, c = this.data.tt;
        if (c.length > 0) for (var o = 0; o < c.length; o++) {
            if (void 0 != c[o]) {
                var d = c[o], n = d.x - a.data.xc - d.picw * (d.scale - 1) / 2, h = d.y - a.data.yc - d.pich * (d.scale - 1) / 2, l = n + d.picw * d.scale / 2, g = h + d.pich * d.scale / 2;
                e.save(), e.translate(l * i, g * s), e.rotate(d.rotate * Math.PI / 180), e.translate(-l * i, -g * s), 
                e.drawImage(d.url, n * i, h * s, d.picw * d.scale * i, d.pich * d.scale * s), e.restore();
            }
            o == c.length - 1 && this.drawtext(t);
        } else this.drawtext(t);
    },
    drawtext: function() {
        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "", i = this, s = i.data.imgw / i.data.mwidth, c = i.data.imgh / i.data.mheight, o = this.data.textimgs;
        if (o.length > 0) for (var d = 0; d < o.length; d++) if (void 0 != o[d]) {
            var n = o[d], h = n.x - i.data.xc - n.picw * (n.scale - 1) / 2, l = n.y - i.data.yc - n.pich * (n.scale - 1) / 2, g = h + n.picw * n.scale / 2, r = l + n.pich * n.scale / 2;
            e.save(), e.translate(g * s, r * c), e.rotate(n.rotate * Math.PI / 180), e.translate(-g * s, -r * c), 
            e.drawImage(n.url, h * s, l * c, n.picw * n.scale * s, n.pich * n.scale * c), e.restore();
        }
        e.draw(!1, function() {
            wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width: i.data.imgw,
                height: i.data.imgh,
                destWidth: i.data.imgw,
                destHeight: i.data.imgh,
                canvasId: "mycanvas",
                fileType: "jpg",
                quality: 1,
                success: function(e) {
                    a.globalData.imgurl = e.tempFilePath, wx.setStorage({
                        key: "phonetype",
                        data: i.data.phonetype
                    }), 1 == t ? wx.navigateTo({
                        url: "/pages/printt/printt"
                    }) : wx.navigateTo({
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
        this.setData({
            kshow: !0
        }), s = t.target.dataset.idx, i = t.target.dataset.types;
        var a = this.data.pics, e = this.data.tt, c = this.data.textimgs;
        if (this.setData({
            tt: [],
            pics: [],
            textimgs: []
        }), "pics" == i) {
            for (var o = [], d = 0; d < a.length; d++) d != s && (a[d].zindex = 3, o.push(a[d]));
            a[s].zindex = 4, o.push(a[s]);
            l = {
                w: a[s].picw * a[s].scale,
                h: a[s].pich * a[s].scale,
                x: .17 * this.data.windowWidth + a[s].x + (a[s].picw - a[s].picw * a[s].scale) / 2,
                y: .1 * this.data.windowHeight + a[s].y + (a[s].pich - a[s].pich * a[s].scale) / 2,
                rotate: a[s].rotate,
                types: "pics",
                index: o.length - 1
            };
            console.log(o), this.setData({
                pics: o,
                tt: e,
                textimgs: c,
                pk: l,
                kshow: !1
            });
        } else if ("tt" == i) {
            for (var n = [], d = 0; d < e.length; d++) d != s && (e[d].zindex = 5, n.push(e[d]));
            e[s].zindex = 6, n.push(e[s]);
            l = {
                w: e[s].picw * e[s].scale,
                h: e[s].pich * e[s].scale,
                x: .17 * this.data.windowWidth + e[s].x + (e[s].picw - e[s].picw * e[s].scale) / 2,
                y: .1 * this.data.windowHeight + e[s].y + (e[s].pich - e[s].pich * e[s].scale) / 2,
                rotate: e[s].rotate,
                types: "tt",
                index: n.length - 1
            };
            this.setData({
                pics: a,
                tt: n,
                textimgs: c,
                pk: l,
                kshow: !1
            });
        } else if ("textimgs" == i) {
            for (var h = [], d = 0; d < c.length; d++) d != s && (c[d].zindex = 5, h.push(c[d]));
            c[s].zindex = 6, h.push(c[s]);
            var l = {
                w: c[s].picw * c[s].scale,
                h: c[s].pich * c[s].scale,
                x: .17 * this.data.windowWidth + c[s].x + (c[s].picw - c[s].picw * c[s].scale) / 2,
                y: .1 * this.data.windowHeight + c[s].y + (c[s].pich - c[s].pich * c[s].scale) / 2,
                rotate: c[s].rotate,
                types: "textimgs",
                index: h.length - 1
            };
            this.setData({
                pics: a,
                tt: e,
                textimgs: h,
                pk: l,
                kshow: !1
            });
        }
    },
    wenzibtn: function() {
        this.data.addshow ? this.setData({
            addshow: !1
        }) : this.setData({
            addshow: !0
        }), n = !1;
    },
    selectfamily: function(t) {
        console.log(t);
        for (var a = this.data.falimys, e = 0; e < a.length; e++) a[e].active = "";
        a[t.target.dataset.idx].active = "active", this.setData({
            falimys: a
        }), c = a[t.target.dataset.idx].val;
    },
    selectcolor: function(t) {
        for (var a = this.data.colors, e = 0; e < a.length; e++) a[e].active = "";
        a[t.currentTarget.dataset.idx].active = "active", this.setData({
            colors: a
        }), o = a[t.currentTarget.dataset.idx].val;
    },
    fxbtn: function(t) {
        var a = this.data.fx;
        if (a[0].active = "", a[1].active = "", a[t.target.dataset.idx].active = "active", 
        "active" == a[0].active) if ("" == d) this.setData({
            textwidth: 600,
            textheight: 80,
            fx: a
        }); else {
            var e = wx.createCanvasContext("textcanvas");
            e.font = "50px " + c;
            var i = e.measureText(d);
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
        d = t.detail.value, this.setData({
            inputval: d
        });
    },
    surebtn: function() {
        this.setData({
            kshow: !0
        });
        var t = this.data.inputval;
        if ("" != t) {
            for (var e = this.data.textimgs, i = this.data.colors, s = this.data.falimys, o = this.data.fx, d = "", h = 0; h < i.length; h++) "active" == i[h].active && (d = i[h].name);
            for (h = 0; h < s.length; h++) "active" == s[h].active && (c = s[h].name);
            for (h = 0; h < o.length; h++) "active" == o[h].active && (o = o[h].name);
            if (n) {
                var l = this.data.pk;
                e.splice(l.index, 1), n = !1;
            }
            var g = this;
            wx.request({
                url: a.globalData.host + "/api/Checkfile/checkfile",
                data: {
                    types: 1,
                    content: t
                },
                success: function(i) {
                    1 == i.data.code ? wx.request({
                        url: a.globalData.host + "/api/index/textToImage",
                        data: {
                            shop_id: 1,
                            selectcolor: d,
                            selectfamily: c,
                            fx: o,
                            val: t
                        },
                        success: function(t) {
                            var a = t.data.data;
                            wx.getImageInfo({
                                src: a,
                                success: function(t) {
                                    var a = t.path, i = .3 * t.width, s = .3 * t.height, c = (.6 * g.data.windowWidth - i) / 2, o = g.data.masktop + (g.data.mheight - s) / 2, d = {
                                        url: a,
                                        picw: i,
                                        pich: s,
                                        x: c,
                                        y: o,
                                        scale: 1,
                                        rotate: 0,
                                        active: "active",
                                        zindex: 6,
                                        falimys: g.data.falimys,
                                        fx: g.data.fx,
                                        colors: g.data.colors,
                                        text: g.data.inputval
                                    };
                                    if (e.length > 0) for (var n = 0; n < e.length; n++) void 0 != e[n] && (e[n].zindex = 5);
                                    var h = {
                                        w: i,
                                        h: s,
                                        x: c + .17 * g.data.windowWidth,
                                        y: .1 * g.data.windowHeight + o,
                                        rotate: 0,
                                        types: "textimgs",
                                        index: e.length
                                    };
                                    e.push(d), g.setData({
                                        textimgs: e,
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
                    }) : wx.showToast({
                        title: "文字不安全!",
                        icon: "loading",
                        mask: !0,
                        duration: 2e3
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
        n = !1, this.setData({
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
        n = !1, this.setData({
            kshow: !0
        });
    },
    selcttext: function(t) {
        this.setData({
            kshow: !0
        });
        p = this.data.pk;
        if (i = t.currentTarget.dataset.types, s = t.currentTarget.dataset.ind, 1 == n && "textimgs" == i && p.index == s) {
            c = this.data.textimgs;
            this.setData({
                addshow: !0,
                falimys: c[s].falimys,
                fx: c[s].fx,
                colors: c[s].colors,
                inputval: c[s].text
            });
        } else {
            var a = this.data.pics, e = this.data.tt, c = this.data.textimgs, o = this.data.tk, d = this.data.mb, h = [], l = [], g = [];
            if ("pics" == i) {
                n = !1;
                for (r = 0; r < a.length; r++) void 0 != a[r] && r != s && (a[r].zindex = 3, h.push(a[r]));
                for (r = 0; r < e.length; r++) void 0 != e[r] && (e[r].zindex = 5, l.push(e[r]));
                for (r = 0; r < c.length; r++) void 0 != c[r] && (c[r].zindex = 5, g.push(c[r]));
                a[s].zindex = 4, h.push(a[s]);
                p = {
                    w: a[s].picw * a[s].scale,
                    h: a[s].pich * a[s].scale,
                    x: .17 * this.data.windowWidth + a[s].x + (a[s].picw - a[s].picw * a[s].scale) / 2,
                    y: .1 * this.data.windowHeight + a[s].y + (a[s].pich - a[s].pich * a[s].scale) / 2,
                    rotate: a[s].rotate,
                    types: "pics",
                    index: h.length - 1
                };
            } else if ("tt" == i) {
                n = !1;
                for (r = 0; r < a.length; r++) void 0 != a[r] && (a[r].zindex = 3, h.push(a[r]));
                for (r = 0; r < e.length; r++) void 0 != e[r] && r != s && (e[r].zindex = 5, l.push(e[r]));
                for (r = 0; r < c.length; r++) void 0 != c[r] && (c[r].zindex = 5, g.push(c[r]));
                e[s].zindex = 6, l.push(e[s]);
                p = {
                    w: e[s].picw * e[s].scale,
                    h: e[s].pich * e[s].scale,
                    x: .17 * this.data.windowWidth + e[s].x + (e[s].picw - e[s].picw * e[s].scale) / 2,
                    y: .1 * this.data.windowHeight + e[s].y + (e[s].pich - e[s].pich * e[s].scale) / 2,
                    rotate: e[s].rotate,
                    types: "tt",
                    index: l.length - 1
                };
            } else if ("textimgs" == i) {
                for (r = 0; r < a.length; r++) void 0 != a[r] && (a[r].zindex = 3, h.push(a[r]));
                for (r = 0; r < e.length; r++) void 0 != e[r] && (e[r].zindex = 5, l.push(e[r]));
                for (var r = 0; r < c.length; r++) void 0 != c[r] && r != s && (c[r].zindex = 5, 
                g.push(c[r]));
                c[s].zindex = 6, g.push(c[s]);
                p = {
                    w: c[s].picw * c[s].scale,
                    h: c[s].pich * c[s].scale,
                    x: .17 * this.data.windowWidth + c[s].x + (c[s].picw - c[s].picw * c[s].scale) / 2,
                    y: .1 * this.data.windowHeight + c[s].y + (c[s].pich - c[s].pich * c[s].scale) / 2,
                    rotate: c[s].rotate,
                    types: "textimgs",
                    index: g.length - 1
                };
                n = !0;
            } else if ("tk" == i) {
                if (h = a, l = e, g = c, s = 0, o) if ("../../img/clock2.png" == o[0].clock) p = {
                    w: o[s].picw * o[s].scale,
                    h: o[s].pich * o[s].scale,
                    x: .17 * this.data.windowWidth + o[s].x + (o[s].picw - o[s].picw * o[s].scale) / 2,
                    y: .1 * this.data.windowHeight + o[s].y + (o[s].pich - o[s].pich * o[s].scale) / 2,
                    rotate: o[s].rotate,
                    types: "tk",
                    index: s
                }; else p = "";
                n = !0;
            } else if ("mb" == i) {
                if (h = a, l = e, g = c, s = 0, "../../img/clock2.png" == d[0].clock) p = {
                    w: d[s].picw * d[s].scale,
                    h: d[s].pich * d[s].scale,
                    x: .17 * this.data.windowWidth + d[s].x + (d[s].picw - d[s].picw * d[s].scale) / 2,
                    y: .1 * this.data.windowHeight + d[s].y + (d[s].pich - d[s].pich * d[s].scale) / 2,
                    rotate: d[s].rotate,
                    types: "mb",
                    index: s
                }; else var p = "";
                n = !0;
            }
            this.setData({
                pics: h,
                tt: l,
                textimgs: g,
                pk: p,
                tk: o,
                mb: d,
                kshow: !1
            });
        }
    },
    onShareAppMessage: function() {
        return {
            title: a.globalData.shop.nickname,
            path: "/pages/index/index?scene=" + a.globalData.shop_id + "," + a.globalData.userInfo.id
        };
    }
});