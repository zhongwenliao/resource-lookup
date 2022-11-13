var a, t = getApp();

Page({
    data: {
        imgurl: "",
        array: [],
        index: 0,
        songtype: [],
        shopnews: !0,
        linkman: "",
        songindex: 0,
        info: "",
        linkmaninp: "",
        mobileinp: "",
        yprice: 0,
        emailtype: 1,
        showy: !0,
        allprice: 0,
        ifName: !0,
        zimage: "",
        shareshow: !0,
        shareimage: "",
        bgimage: "",
        avatar: ""
    },
    onLoad: function(e) {
        a = e;
        var i = this;
        this.setData({
            imgurl: t.globalData.imgurl
        }), wx.downloadFile({
            url: t.globalData.userInfo.avatar,
            success: function(a) {
                200 === a.statusCode && i.setData({
                    avatar: a.tempFilePath
                });
            },
            fail: function(a) {}
        }), wx.getStorage({
            key: "phonetype",
            success: function(a) {
                i.setData({
                    phonetype: a.data
                }), wx.downloadFile({
                    url: i.data.phonetype.bgimage,
                    success: function(a) {
                        if (200 === a.statusCode) {
                            var e = a.tempFilePath;
                            i.setData({
                                bgimage: e
                            }), wx.getImageInfo({
                                src: t.globalData.imgurl,
                                success: function(a) {
                                    console.log("图片", a);
                                    var t = a.path, n = a.width, s = a.height, o = wx.createCanvasContext("canvas");
                                    i.setData({
                                        imgW: n / 3,
                                        imgH: s / 3
                                    });
                                    var l = 300 * n / s;
                                    o.setFillStyle("#fff"), o.fillRect(0, 0, 500, 400), o.drawImage(t, 0, 0, n, s, (500 - l) / 2, 50, l, 300), 
                                    o.drawImage(e, 0, 0, n, s, (500 - l) / 2, 50, l, 300), o.draw(!1, function() {
                                        setTimeout(function() {
                                            wx.canvasToTempFilePath({
                                                x: 0,
                                                y: 0,
                                                width: 500,
                                                height: 400,
                                                destWidth: 500,
                                                destHeight: 400,
                                                canvasId: "canvas",
                                                success: function(a) {
                                                    i.setData({
                                                        shareimage: a.tempFilePath
                                                    }), wx.hideLoading();
                                                },
                                                fail: function(a) {
                                                    console.log("err", a);
                                                }
                                            });
                                        }, 1e3);
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });
    },
    bindPickerChange: function(a) {
        console.log(a), this.setData({
            index: a.detail.value
        });
    },
    address: function() {
        wx.navigateTo({
            url: "/pages/address/address"
        });
    },
    songtype: function(a) {
        var t = this.data.songtype;
        if (1 != t.length) {
            for (var e = 0; e < t.length; e++) t[e].active = "";
            t[a.target.dataset.idx].active = "active", this.setData({
                songtype: t,
                songindex: a.target.dataset.idx
            }), console.log(t[a.target.dataset.idx].name), "到店自取" == t[a.target.dataset.idx].name ? this.setData({
                shopnews: !1
            }) : this.setData({
                shopnews: !0
            }), "快递配送" == t[a.target.dataset.idx].name && 2 == this.data.emailtype ? this.setData({
                showy: !1,
                allprice: this.data.price * this.data.num + this.data.yprice
            }) : this.setData({
                showy: !0,
                allprice: this.data.price * this.data.num
            });
        }
    },
    onReady: function() {},
    onShow: function() {
        var e = this;
        wx.request({
            url: t.globalData.host + "/api/Index/getshopnews",
            data: {
                shop_id: t.globalData.shop_id,
                openid: t.globalData.openid
            },
            success: function(t) {
                if (1 == t.data.code) {
                    var i = !0, n = a.num * a.price;
                    e.setData({
                        shop: t.data.data.shop,
                        linkman: t.data.data.address,
                        yprice: t.data.data.shop.yprice,
                        emailtype: t.data.data.shop.emailtype
                    });
                    var s = t.data.data.shop;
                    1 == s.paytype ? e.setData({
                        array: [ "微信支付" ]
                    }) : 2 == s.paytype ? e.setData({
                        array: [ "线下支付" ]
                    }) : 3 == s.paytype ? e.setData({
                        array: [ "微信支付", "线下支付" ]
                    }) : 4 == s.paytype && e.setData({
                        array: [ "线下支付", "微信支付" ]
                    }), 1 == s.sendtype ? (2 == s.emailtype && (i = !1, n += s.yprice), e.setData({
                        songtype: [ {
                            id: 1,
                            name: "快递配送",
                            active: "active"
                        } ],
                        showy: i,
                        allprice: n
                    })) : 2 == s.sendtype ? e.setData({
                        songtype: [ {
                            id: 2,
                            name: "到店自取",
                            active: "active"
                        } ],
                        shopnews: !1,
                        yprice: 0,
                        emailtype: 1,
                        allprice: n
                    }) : 3 == s.sendtype ? (2 == s.emailtype && (i = !1, n += s.yprice), e.setData({
                        songtype: [ {
                            id: 1,
                            name: "快递配送",
                            active: "active"
                        }, {
                            id: 2,
                            name: "到店自取",
                            active: ""
                        } ],
                        showy: i,
                        allprice: n
                    })) : 4 == s.sendtype && e.setData({
                        songtype: [ {
                            id: 1,
                            name: "到店自取",
                            active: "active"
                        }, {
                            id: 2,
                            name: "快递配送",
                            active: ""
                        } ],
                        shopnews: !1,
                        allprice: n
                    }), 0 == a.spec_id ? e.setData({
                        spec_id: 0,
                        price: 0,
                        num: a.num,
                        spec_name: "",
                        array: [ "线下支付" ]
                    }) : e.setData({
                        spec_id: a.spec_id,
                        price: a.price,
                        num: a.num,
                        spec_name: a.spec_name
                    });
                }
            }
        });
    },
    textinfo: function(a) {
        this.setData({
            info: a.detail.value
        });
    },
    linkmaninp: function(a) {
        this.setData({
            linkmaninp: a.detail.value
        });
    },
    mobileinp: function(a) {
        this.setData({
            mobileinp: a.detail.value
        });
    },
    paybuy: function() {
        var a = this;
        if (1 == t.globalData.shop.sendtype) {
            if (null == a.data.linkman) return void wx.showToast({
                title: "请添加联系信息!",
                icon: "loading",
                mask: !0,
                duration: 2e3
            });
            var e = a.data.linkman.name, i = a.data.linkman.mobile, n = a.data.linkman.address;
        } else if (2 == t.globalData.shop.sendtype) if ("" != a.data.linkmaninp && "" != a.data.mobileinp || null == a.data.linkman) var e = a.data.linkmaninp, i = a.data.mobileinp, n = ""; else var e = a.data.linkman.name, i = a.data.linkman.mobile, n = a.data.linkman.address; else if ("快递配送" == a.data.songtype[a.data.songindex].name) {
            if (null == a.data.linkman) return void wx.showToast({
                title: "请添加联系信息!",
                icon: "loading",
                mask: !0,
                duration: 2e3
            });
            var e = a.data.linkman.name, i = a.data.linkman.mobile, n = a.data.linkman.address;
        } else if ("" != a.data.linkmaninp && "" != a.data.mobileinp || null == a.data.linkman) var e = a.data.linkmaninp, i = a.data.mobileinp, n = ""; else var e = a.data.linkman.name, i = a.data.linkman.mobile, n = a.data.linkman.address;
        var s = wx.uploadFile({
            url: t.globalData.host + "/api/Common/upload",
            filePath: a.data.imgurl,
            name: "file",
            formData: {
                types: "order"
            },
            success: function(s) {
                var o = JSON.parse(s.data);
                1 == o.code && (a.setData({
                    zimage: o.data.url
                }), wx.request({
                    url: t.globalData.host + "/api/User/sureorder",
                    data: {
                        openid: t.globalData.openid,
                        user_id: t.globalData.shop_id,
                        paytype: a.data.array[a.data.index],
                        peitype: a.data.songtype[a.data.songindex].name,
                        zimage: o.data.url,
                        mimage: a.data.phonetype.bgimage,
                        models: a.data.phonetype.name,
                        spec: a.data.spec_name,
                        num: a.data.num,
                        price: a.data.price,
                        info: a.data.info,
                        realname: e,
                        mobile: i,
                        address: n,
                        types: t.globalData.types,
                        refid: t.globalData.refid
                    },
                    success: function(e) {
                        1 == e.data.code ? (wx.showToast({
                            title: "下单成功!",
                            icon: "success",
                            mask: !0,
                            duration: 2e3
                        }), "1" == t.globalData.shop.fenxiao ? a.setData({
                            ifName: !1
                        }) : setTimeout(function() {
                            wx.reLaunch({
                                url: "/pages/index/index"
                            });
                        }, 1e3)) : 2 == e.data.code ? (wx.requestPayment({
                            timeStamp: e.data.data.timeStamp,
                            nonceStr: e.data.data.nonceStr,
                            package: "prepay_id=" + e.data.data.prepay_id,
                            signType: "MD5",
                            paySign: e.data.data.paySign,
                            complete: function(e) {
                                wx.hideLoading(), "1" == t.globalData.shop.fenxiao ? a.setData({
                                    ifName: !1
                                }) : wx.reLaunch({
                                    url: "/pages/index/index"
                                });
                            }
                        }), wx.request({
                            url: t.globalData.host + "/api/User/checksure",
                            method: "POST",
                            data: {
                                ordernumber: e.data.data.ordernumber
                            },
                            success: function(e) {
                                1 == e.data.code && (wx.hideLoading(), "1" == t.globalData.shop.fenxiao ? a.setData({
                                    ifName: !1
                                }) : wx.reLaunch({
                                    url: "/pages/index/index"
                                }));
                            }
                        })) : wx.showToast({
                            title: "下单失败!",
                            icon: "loading",
                            mask: !0,
                            duration: 2e3
                        });
                    }
                }));
            }
        }), o = 10, l = setInterval(function() {
            -1 == o ? clearInterval(l) : --o;
        }, 1e3);
        s.onProgressUpdate(function(a) {
            wx.showLoading({
                title: "上传" + a.progress + "%",
                mask: !0
            }), o <= 1 && a.progress < 100 && (s.abort(), wx.showToast({
                title: "网络延迟，请重试!",
                icon: "loading",
                mask: !0,
                duration: 2e3
            }));
        });
    },
    confirm: function() {
        this.setData({
            ifName: !1
        });
    },
    copimage: function() {
        wx.showLoading({
            title: "制作海报中",
            mask: !0
        });
        var a = this, e = "";
        wx.request({
            url: t.globalData.host + "/api/User/getuserdata",
            data: {
                shop_id: t.globalData.shop_id,
                user_id: t.globalData.userInfo.id
            },
            success: function(i) {
                e = "" != i.data.data && null != i.data.data ? t.globalData.host + i.data.data : t.globalData.host + t.globalData.shop.qurecode, 
                wx.showLoading({
                    title: "下载二维码",
                    mask: !0
                }), wx.downloadFile({
                    url: e,
                    success: function(i) {
                        200 === i.statusCode ? (e = i.tempFilePath, wx.showLoading({
                            title: "获取图片信息",
                            mask: !0
                        }), wx.getImageInfo({
                            src: t.globalData.imgurl,
                            success: function(t) {
                                wx.showLoading({
                                    title: "开始制图",
                                    mask: !0
                                });
                                var i = t.path, n = t.width, s = t.height, o = a.data.imgW, l = a.data.imgH, d = wx.createCanvasContext("shareCanvas");
                                d.drawImage(i, 0, 0, n, s, 0, 0, o, l), wx.showLoading({
                                    title: "开始制图1",
                                    mask: !0
                                }), d.setFillStyle("#fff"), d.fillRect(0, .8 * l, o, .2 * l), d.drawImage(e, 4, l - .3 * o - 10, .3 * o, .3 * o), 
                                wx.showLoading({
                                    title: "开始制图2",
                                    mask: !0
                                }), "" != a.data.avatar && d.drawImage(a.data.avatar, .1 * o + 4, l - .2 * o - 10, .1 * o, .1 * o), 
                                wx.showLoading({
                                    title: "开始制图3",
                                    mask: !0
                                }), d.drawImage(a.data.bgimage, 0, 0, n, s, 0, 0, o, l), wx.showLoading({
                                    title: "开始制图4",
                                    mask: !0
                                }), d.setFillStyle("red"), d.fillRect(.325 * o, .85 * l, .4 * o, .05 * l), d.setTextAlign("center"), 
                                d.setFillStyle("#fff"), d.setFontSize(20), d.fillText("私 人 订 制", .525 * o, .89 * l), 
                                d.setTextAlign("center"), d.setFillStyle("blue"), d.setFontSize(18), d.fillText("长按二维码", .5 * o, .93 * l), 
                                d.setTextAlign("center"), d.setFillStyle("blue"), d.setFontSize(18), d.fillText("开启手机壳订制", .51 * o, .97 * l), 
                                d.setFillStyle("orange");
                                var r = .7 * o + .3 * o / 2, c = .8 * l + .05 * l / 2;
                                d.translate(r, c), d.rotate(-45 * Math.PI / 180), d.translate(-r, -c), d.fillRect(.45 * o, .88 * l, .5 * o, .05 * l), 
                                d.setTextAlign("center"), d.setFillStyle("#fff"), d.setFontSize(20), d.fillText("与 众 不 同", .72 * o, .91 * l), 
                                d.translate(r, c), d.rotate(-45 * Math.PI / 180), d.translate(-r, -c), wx.showLoading({
                                    title: "开始制作",
                                    mask: !0
                                }), d.draw(!1, function() {
                                    setTimeout(function() {
                                        wx.canvasToTempFilePath({
                                            canvasId: "shareCanvas",
                                            fileType: "jpg",
                                            success: function(t) {
                                                a.setData({
                                                    share2image: t.tempFilePath
                                                }), wx.hideLoading(), a.setData({
                                                    shareshow: !1,
                                                    ifName: !0
                                                });
                                            },
                                            fail: function(a) {
                                                console.log("好饱错误", a), wx.showToast({
                                                    title: "制作失败",
                                                    icon: "loading",
                                                    mask: !0,
                                                    duration: 2e3
                                                });
                                            }
                                        });
                                    }, 1e3);
                                });
                            },
                            fail: function() {
                                wx.showToast({
                                    title: "制作失败",
                                    icon: "loading",
                                    mask: !0,
                                    duration: 2e3
                                });
                            }
                        })) : wx.showToast({
                            title: "制作失败",
                            icon: "loading",
                            mask: !0,
                            duration: 2e3
                        });
                    },
                    fail: function() {
                        wx.showToast({
                            title: "制作失败",
                            icon: "loading",
                            mask: !0,
                            duration: 2e3
                        });
                    }
                });
            },
            fail: function() {
                wx.showToast({
                    title: "制作失败",
                    icon: "loading",
                    mask: !0,
                    duration: 2e3
                });
            }
        });
    },
    capybd: function() {
        var a = this;
        wx.saveImageToPhotosAlbum({
            filePath: a.data.share2image,
            success: function(t) {
                a.setData({
                    shareshow: !0
                }), wx.showToast({
                    title: "保存成功!",
                    icon: "success",
                    mask: !0,
                    duration: 2e3
                });
            }
        });
    },
    returindex: function() {
        wx.reLaunch({
            url: "/pages/index/index"
        });
    },
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {
        var a = this;
        return console.log(a.data.shareimage), "" == a.data.shareimage ? {
            title: t.globalData.shop.nickname,
            path: "/pages/index/index?scene=" + t.globalData.shop_id + "," + t.globalData.userInfo.id
        } : {
            title: t.globalData.shop.nickname,
            path: "/pages/index/index?scene=" + t.globalData.shop_id + "," + t.globalData.userInfo.id,
            imageUrl: a.data.shareimage
        };
    }
});