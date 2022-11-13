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
        order_id: "",
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
        var i = a.order_id;
        this.setData({
            order_id: i
        });
        var e = this;
        wx.request({
            url: t.globalData.host + "/api/Adminindex/printt",
            data: {
                id: i
            },
            success: function(t) {
                if (1 == t.data.code) {
                    e.setData({
                        w: t.data.data.w,
                        h: t.data.data.h
                    });
                    var a = t.data.data, i = 0, n = 0;
                    a.h > a.w ? (i = 30, n = 30 * a.h / a.w) : (n = 30, i = 30 * a.w / a.h), a.w = i, 
                    a.h = n, e.setData({
                        data: a
                    });
                }
            }
        }), this.setlogin(), this.printtype2(1);
    },
    setlogin: function() {
        var a = this;
        wx.request({
            url: t.globalData.host + "/printll/Index/setprintlogin",
            data: {
                uid: t.globalData.admin.id
            },
            success: function(t) {
                console.log(t);
            }
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
        }) : this.setData({
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
                if (wx.stopPullDownRefresh(), 1 == t.data.code) {
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
            canw: 2339,
            canh: 1654,
            printff: t.target.dataset.ind
        }) : this.setData({
            canw: 1654,
            canh: 2339,
            printff: t.target.dataset.ind
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
        var a = this.data.printtype, i = this.data.printff, e = this, n = this.data.w, s = this.data.h, d = this.data.data, o = this.data.array[this.data.index], r = this.data.array2[this.data.index2], h = this.data.switch1Checked;
        if ("" != a) if ("" != i) if ("打印" == this.data.btntext) wx.showLoading({
            title: "打印上传中",
            mask: !0
        }), wx.request({
            url: t.globalData.host + "/api/Adminindex/addprint",
            data: {
                printtype: a,
                printff: i,
                w: n,
                h: s,
                data: JSON.stringify(d),
                dyj: o,
                zzdx: r,
                switch1Checked: h,
                admin_id: t.globalData.admin.id,
                order_id: this.data.order_id,
                op_val: this.data.index2,
                printname_val: this.data.index
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
        }); else {
            wx.showLoading({
                title: "保存中...",
                mask: !0
            });
            var c = wx.createCanvasContext("canvas");
            c.fillStyle = "#fff", c.fillRect(0, 0, e.data.canw, e.data.canh), wx.downloadFile({
                url: e.data.data.zimage,
                success: function(t) {
                    200 === t.statusCode && wx.getImageInfo({
                        src: t.tempFilePath,
                        success: function(t) {
                            var a = t.path, i = t.width, n = t.height, s = 80.71875 * e.data.w, d = 80.71875 * e.data.h;
                            c.drawImage(a, 0, 0, i, n, 24, 24, s, d), c.strokeRect(24, 24, s, d), c.setTextAlign("center"), 
                            c.setFillStyle("blue"), c.setFontSize(50), c.fillText(e.data.data.models, .5 * s + 24, d + 24 + 40 + 10), 
                            c.draw(!1, function() {
                                setTimeout(function() {
                                    wx.canvasToTempFilePath({
                                        x: 0,
                                        y: 0,
                                        width: e.data.canw,
                                        height: e.data.canh,
                                        destWidth: e.data.canw,
                                        destHeight: e.data.canh,
                                        canvasId: "canvas",
                                        fileType: "jpg",
                                        success: function(t) {
                                            e.setData({
                                                shareimage: t.tempFilePath
                                            }), wx.saveImageToPhotosAlbum({
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
                                        }
                                    });
                                }, 1e3);
                            });
                        }
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
        var t = {
            order_id: this.data.order_id
        };
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
            order_id: "",
            muban: ""
        }), this.onLoad(t);
    },
    onReachBottom: function() {},
    onShareAppMessage: function() {}
});