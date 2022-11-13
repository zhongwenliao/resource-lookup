var a = getApp();

Page({
    data: {
        array: [],
        index: 0,
        songtype: [],
        shopnews: !0,
        linkman: "",
        songindex: 0,
        info: "",
        linkmaninp: "",
        mobileinp: "",
        list: [],
        price: 0,
        ids: ""
    },
    onLoad: function(t) {
        var e = this;
        wx.request({
            url: a.globalData.host + "/api/User/getcarlist",
            method: "POST",
            data: {
                ids: t.ids
            },
            success: function(a) {
                console.log(a), 1 == a.data.code && e.setData({
                    list: a.data.data,
                    price: a.data.msg,
                    ids: t.ids
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
            }), 0 == a.target.dataset.idx ? this.setData({
                shopnews: !0
            }) : this.setData({
                shopnews: !1
            });
        }
    },
    onReady: function() {},
    onShow: function() {
        var t = this;
        wx.request({
            url: a.globalData.host + "/api/Index/getshopnews",
            data: {
                shop_id: a.globalData.shop_id,
                openid: a.globalData.openid
            },
            success: function(a) {
                if (console.log(a), 1 == a.data.code) {
                    t.setData({
                        shop: a.data.data.shop,
                        linkman: a.data.data.address
                    });
                    var e = a.data.data.shop;
                    1 == e.paytype ? t.setData({
                        array: [ "微信支付" ]
                    }) : 2 == e.paytype ? t.setData({
                        array: [ "线下支付" ]
                    }) : 3 == e.paytype && t.setData({
                        array: [ "微信支付", "线下支付" ]
                    }), 1 == e.sendtype ? t.setData({
                        songtype: [ {
                            id: 1,
                            name: "快递配送",
                            active: "active"
                        } ]
                    }) : 2 == e.sendtype ? t.setData({
                        songtype: [ {
                            id: 2,
                            name: "到店自取",
                            active: "active"
                        } ],
                        shopnews: !1
                    }) : (e.sendtype, t.setData({
                        songtype: [ {
                            id: 1,
                            name: "快递配送",
                            active: "active"
                        }, {
                            id: 2,
                            name: "到店自取",
                            active: ""
                        } ]
                    }));
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
        var t = this;
        if (2 != a.globalData.shop.sendtype) if (0 == t.data.songindex) {
            if (null == t.data.linkman) return void wx.showToast({
                title: "请添加联系信息!",
                icon: "loading",
                mask: !0,
                duration: 2e3
            });
            var e = t.data.linkman.name, n = t.data.linkman.mobile, i = t.data.linkman.address;
        } else var e = t.data.linkmaninp, n = t.data.mobileinp, i = "";
        wx.showLoading({
            title: "下单中...",
            mask: !0
        }), wx.request({
            url: a.globalData.host + "/api/User/surecarorder",
            data: {
                ids: t.data.ids,
                openid: a.globalData.openid,
                user_id: a.globalData.shop_id,
                paytype: t.data.array[t.data.index],
                peitype: t.data.songtype[t.data.songindex].name,
                info: t.data.info,
                realname: e,
                mobile: n,
                address: i
            },
            success: function(t) {
                1 == t.data.code ? (wx.showToast({
                    title: "下单成功!",
                    icon: "success",
                    mask: !0,
                    duration: 2e3
                }), setTimeout(function() {
                    wx.reLaunch({
                        url: "/pages/index/index"
                    });
                }, 1e3)) : 2 == t.data.code ? (wx.requestPayment({
                    timeStamp: t.data.data.timeStamp,
                    nonceStr: t.data.data.nonceStr,
                    package: "prepay_id=" + t.data.data.prepay_id,
                    signType: "MD5",
                    paySign: t.data.data.paySign,
                    complete: function(a) {}
                }), wx.request({
                    url: a.globalData.host + "/api/User/checksure",
                    method: "POST",
                    data: {
                        ordernumber: t.data.data.ordernumber
                    },
                    success: function(a) {
                        1 == a.data.code && (wx.hideLoading(), wx.reLaunch({
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
        });
    },
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {
        return {
            title: a.globalData.shop.nickname,
            path: "/pages/index/index?scene=" + a.globalData.shop_id
        };
    }
});