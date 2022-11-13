var t = getApp();

Page({
    data: {
        printtype: "1",
        printff: "1",
        data: "",
        w: 0,
        h: 0,
        array: [ "请选择打印机" ],
        index: 0,
        array2: [ "请选择纸张大小" ],
        index2: 0,
        switch1Checked: !0,
        ifName: !0,
        setw: 0,
        seth: 0,
        printdata: "",
        muban: "",
        dyjshow: !1,
        btntext: "打印",
        canw: 2339,
        canh: 1654
    },
    fuwei: function() {
        wx.showLoading({
            title: "复位设置中",
            mask: !0
        }), wx.request({
            url: t.globalData.host + "/api/Adminindex/clearprint",
            data: {
                admin_id: t.globalData.admin.id
            },
            success: function(t) {
                1 == t.data.code ? wx.showToast({
                    title: t.data.msg,
                    icon: "success",
                    mask: !0,
                    duration: 2e3
                }) : wx.showToast({
                    title: t.data.msg,
                    icon: "loading",
                    mask: !0,
                    duration: 2e3
                });
            }
        });
    },
    onLoad: function(a) {
        var i = this, e = 0, n = 0;
        wx.getStorage({
            key: "phonetype",
            success: function(a) {
                console.log("数据", a.data);
                var s = a.data;
                wx.request({
                    url: t.globalData.host + "/api/index/getjxwh",
                    data: {
                        shop_id: t.globalData.shop_id,
                        model_id: s.id,
                        models: s.name,
                        types: t.globalData.types
                    },
                    success: function(a) {
                        console.log(a), s.h = a.data.data.h, s.w = a.data.data.w, s.h > s.w ? (n = 30, e = 30 * s.h / s.w) : (e = 30, 
                        n = 30 * s.w / s.h), wx.request({
                            url: t.globalData.host + "/api/index/getSpec",
                            data: {
                                shop_id: t.globalData.shop_id,
                                model_id: s.id,
                                models: s.name,
                                types: t.globalData.types
                            },
                            success: function(t) {
                                1 == t.data.code ? i.setData({
                                    phonetype: s,
                                    gg: t.data.data,
                                    price: t.data.msg,
                                    data: {
                                        w: n,
                                        h: e
                                    },
                                    w: s.w,
                                    h: s.h
                                }) : i.setData({
                                    phonetype: s,
                                    data: {
                                        w: n,
                                        h: e
                                    },
                                    w: s.w,
                                    h: s.h
                                });
                            }
                        });
                    }
                });
            }
        }), this.setData({
            imgurl: t.globalData.imgurl
        }), this.setlogin(), this.printtype2(1);
    },
    setlogin: function() {
        var a = this;
        wx.request({
            url: t.globalData.host + "/printll/Index/setprintlogin",
            data: {
                uid: t.globalData.admin.id
            },
            success: function(t) {}
        }), setTimeout(function() {
            a.setlogin();
        }, 18e3);
    },
    printtype: function(a) {
        var i = this;
        1 == a.target.dataset.ind ? wx.request({
            url: t.globalData.host + "/api/Adminindex/getpringtlist",
            data: {
                admin_id: t.globalData.admin.id
            },
            success: function(t) {
                if (1 == t.data.code) {
                    for (var e = [], n = JSON.parse(t.data.data), s = 0; s < n.length; s++) e.push(n[s].text);
                    i.setData({
                        array: e,
                        printdata: n,
                        printtype: a.target.dataset.ind,
                        dyjshow: !1,
                        btntext: "打印",
                        array2: [ "请选择纸张大小" ],
                        index2: 0
                    });
                } else wx.showToast({
                    title: t.data.msg,
                    icon: "loading",
                    mask: !0,
                    duration: 2e3
                });
            }
        }) : i.setData({
            dyjshow: !0,
            btntext: "保存",
            array2: [ "A4" ],
            index2: 0,
            printtype: a.target.dataset.ind
        });
    },
    printtype2: function(a) {
        var i = this;
        wx.request({
            url: t.globalData.host + "/api/Adminindex/getpringtlist",
            data: {
                admin_id: t.globalData.admin.id
            },
            success: function(t) {
                if (1 == t.data.code) {
                    for (var e = [], n = [], s = JSON.parse(t.data.data), d = 0; d < s.length; d++) e.push(s[d].text);
                    for (var o = n.concat(s[0].printt), r = 0, d = 0; d < o.length; d++) if (-1 != o[d].indexOf("A4")) {
                        r = d;
                        break;
                    }
                    i.setData({
                        array: e,
                        printdata: s,
                        printtype: a,
                        array2: o,
                        index2: r
                    }), i.selectmuban();
                } else wx.showToast({
                    title: t.data.msg,
                    icon: "loading",
                    mask: !0,
                    duration: 1e3
                }), i.setData({
                    dyjshow: !0,
                    btntext: "保存",
                    array2: [ "A4" ],
                    index2: 0,
                    printtype: 2
                });
                wx.stopPullDownRefresh();
            }
        });
    },
    closemuban: function() {
        this.setData({
            muban: ""
        });
    },
    mubanbat: function() {
        for (var t = this.data.muban, a = this.data.printdata, i = this.data.index, e = this.data.index2, n = this.data.array2, s = 0; s < a.length; s++) if (a[s].text == t[0].dyj) {
            i = s;
            for (var d = 0; d < a[s].printt.length; d++) if (a[s].printt[d] == t[0].zzdx) {
                e = d, n = a[s].printt;
                break;
            }
        }
        1 == t[0].printff ? this.setData({
            canw: 2339,
            canh: 1654
        }) : this.setData({
            canw: 1654,
            canh: 2339
        }), this.setData({
            printff: t[0].printff,
            index: i,
            index2: e,
            array2: n,
            muban: ""
        });
    },
    selectmuban: function() {
        var a = this;
        wx.request({
            url: t.globalData.host + "/api/Adminindex/getpringtmuban",
            data: {
                admin_id: t.globalData.admin.id
            },
            success: function(t) {
                1 == t.data.code && (a.setData({
                    muban: t.data.data
                }), a.mubanbat());
            }
        });
    },
    bindPickerChange1: function(t) {
        var a = parseInt(t.detail.value), i = this.data.printdata, e = [].concat(i[a].printt);
        this.setData({
            index: a,
            array2: e,
            index2: 0
        });
    },
    bindPickerChange2: function(t) {
        var a = parseInt(t.detail.value);
        this.setData({
            index2: a
        });
    },
    switch1Change: function(t) {
        this.setData({
            switch1Checked: t.detail.value
        });
    },
    printff: function(t) {
        1 == t.target.dataset.ind ? this.setData({
            printff: t.target.dataset.ind,
            canw: 2339,
            canh: 1654
        }) : this.setData({
            printff: t.target.dataset.ind,
            canw: 1654,
            canh: 2339
        });
    },
    editcc: function() {
        this.setData({
            ifName: !1
        });
    },
    setw: function(t) {
        this.setData({
            setw: t.detail.value
        });
    },
    seth: function(t) {
        this.setData({
            seth: t.detail.value
        });
    },
    cancel: function() {
        this.setData({
            seth: 0,
            setw: 0,
            ifName: !0
        });
    },
    confirm: function() {
        0 != this.data.seth && 0 != this.data.setw ? this.setData({
            h: this.data.seth,
            w: this.data.setw,
            ifName: !0
        }) : wx.showToast({
            title: "输入尺寸!",
            icon: "loading",
            mask: !0,
            duration: 2e3
        });
    },
    submitadta: function() {
        var a = this.data.printtype, i = this.data.printff, e = this, n = this.data.w, s = this.data.h, d = (this.data.data, 
        this.data.array[this.data.index]), o = this.data.array2[this.data.index2], r = this.data.switch1Checked;
        if ("" != a) if ("" != i) if ("打印" == this.data.btntext) wx.showLoading({
            title: "打印上传中",
            mask: !0
        }), wx.uploadFile({
            url: t.globalData.host + "/api/Common/upload",
            filePath: e.data.imgurl,
            name: "file",
            formData: {
                types: "order"
            },
            success: function(l) {
                var h = JSON.parse(l.data);
                1 == h.code ? (h.zimage = h.data.url, wx.request({
                    url: t.globalData.host + "/api/Adminindex/addprint",
                    data: {
                        printtype: a,
                        printff: i,
                        w: n,
                        h: s,
                        data: JSON.stringify(h),
                        dyj: d,
                        zzdx: o,
                        switch1Checked: r,
                        admin_id: t.globalData.admin.id,
                        op_val: e.data.index2,
                        printname_val: e.data.index,
                        title: e.data.phonetype.name
                    },
                    success: function(t) {
                        1 == t.data.code ? wx.showToast({
                            title: t.data.msg,
                            icon: "success",
                            mask: !0,
                            duration: 2e3
                        }) : wx.showToast({
                            title: t.data.msg,
                            icon: "loading",
                            mask: !0,
                            duration: 2e3
                        });
                    }
                })) : wx.showToast({
                    title: "图片上传失败!",
                    icon: "loading",
                    mask: !0,
                    duration: 2e3
                });
            }
        }); else {
            wx.showLoading({
                title: "保存中...",
                mask: !0
            });
            var l = wx.createCanvasContext("canvas");
            l.fillStyle = "#fff", l.fillRect(0, 0, e.data.canw, e.data.canh), wx.getImageInfo({
                src: e.data.imgurl,
                success: function(t) {
                    var a = t.path, i = t.width, n = t.height, s = 80.71875 * e.data.w, d = 80.71875 * e.data.h;
                    l.drawImage(a, 0, 0, i, n, 24, 24, s, d), l.strokeRect(24, 24, s, d), l.setTextAlign("center"), 
                    l.setFillStyle("blue"), l.setFontSize(20), l.fillText(e.data.phonetype.name, .5 * s + 24, d + 24 + 40), 
                    l.draw(!1, function(t) {
                        "drawCanvas:ok" == t.errMsg && setTimeout(function() {
                            wx.canvasToTempFilePath({
                                canvasId: "canvas",
                                success: function(t) {
                                    wx.saveImageToPhotosAlbum({
                                        filePath: t.tempFilePath,
                                        success: function(t) {
                                            wx.showToast({
                                                title: "保存成功!",
                                                icon: "success",
                                                mask: !0,
                                                duration: 2e3
                                            });
                                        }
                                    });
                                },
                                fail: function(t) {
                                    console.log("保存失败", t);
                                }
                            });
                        }, 1e3);
                    });
                }
            });
        } else wx.showToast({
            title: "打印方向未选!",
            icon: "loading",
            mask: !0,
            duration: 2e3
        }); else wx.showToast({
            title: "打印方式未选!",
            icon: "loading",
            mask: !0,
            duration: 2e3
        });
    },
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {
        this.setData({
            printtype: "1",
            printff: "1",
            data: "",
            w: 0,
            h: 0,
            array: [ "请选择打印机" ],
            index: 0,
            array2: [ "请选择纸张大小" ],
            index2: 0,
            switch1Checked: !0,
            ifName: !0,
            setw: 0,
            seth: 0,
            printdata: "",
            muban: ""
        }), this.onLoad();
    },
    onReachBottom: function() {}
});