var t = getApp();

Page({
    data: {
        list: [],
        actives: [ {
            name: "全部订单",
            active: "active",
            status: "all"
        }, {
            name: "待付款",
            active: "",
            status: 0
        }, {
            name: "待发货",
            active: "",
            status: 1
        }, {
            name: "待收货",
            active: "",
            status: 2
        }, {
            name: "完成",
            active: "",
            status: 3
        } ],
        pages: 1,
        size: 5,
        status: "all"
    },
    onLoad: function(t) {
        this.getdata(this.data.pages, this.data.size, this.data.status);
    },
    getdata: function(a, s, e) {
        var i = this;
        wx.request({
            url: t.globalData.host + "/api/User/getuserorder",
            data: {
                openid: t.globalData.openid,
                status: e,
                p: a,
                z: s
            },
            success: function(t) {
                if (console.log(t), 1 == t.data.code) {
                    var s = i.data.list.concat(t.data.data);
                    i.setData({
                        list: s,
                        pages: a + 1
                    });
                }
            }
        });
    },
    yueyue: function() {
        wx.reLaunch({
            url: "/pages/index/index"
        });
    },
    showmore: function(t) {
        var a = this.data.list;
        a[t.currentTarget.dataset.ind].moreshow = !a[t.currentTarget.dataset.ind].moreshow, 
        this.setData({
            list: a
        });
    },
    seletab: function(t) {
        for (var a = this.data.actives, s = 0; s < a.length; s++) a[s].active = "";
        a[t.target.dataset.ind].active = "active", this.setData({
            actives: a,
            list: [],
            pages: 1,
            status: t.target.dataset.status
        }), this.getdata(1, this.data.size, t.target.dataset.status);
    },
    sureshou: function(a) {
        var s = this, e = this.data.list;
        wx.showModal({
            title: "提示",
            content: "确认已经收货？",
            success: function(i) {
                i.confirm ? (wx.showLoading({
                    title: "订单确认中...",
                    mask: !0
                }), e[a.target.dataset.ind].status = 3, wx.request({
                    url: t.globalData.host + "/api/User/sureshou",
                    data: {
                        ids: a.target.dataset.ids
                    },
                    success: function(t) {
                        1 == t.data.code ? (wx.showToast({
                            title: "操作成功!",
                            icon: "success",
                            mask: !0,
                            duration: 2e3
                        }), s.setData({
                            list: e
                        })) : wx.showToast({
                            title: "操作失败!",
                            icon: "loading",
                            mask: !0,
                            duration: 2e3
                        });
                    }
                })) : i.cancel && console.log("用户点击取消");
            }
        });
    },
    surepay: function(a) {
        console.log(a.target.dataset.number), wx.showLoading({
            title: "链接中...",
            mask: !0
        }), wx.request({
            url: t.globalData.host + "/api/User/surepay",
            method: "POST",
            data: {
                order: a.target.dataset.number
            },
            success: function(t) {
                1 == t.data.code ? wx.requestPayment({
                    timeStamp: t.data.data.timeStamp,
                    nonceStr: t.data.data.nonceStr,
                    package: "prepay_id=" + t.data.data.prepay_id,
                    signType: "MD5",
                    paySign: t.data.data.paySign,
                    success: function(t) {
                        wx.navigateBack({});
                    },
                    fail: function(t) {
                        wx.showToast({
                            title: "付款失败!",
                            icon: "loading",
                            mask: !0,
                            duration: 2e3
                        });
                    }
                }) : wx.showToast({
                    title: "付款失败!",
                    icon: "loading",
                    mask: !0,
                    duration: 2e3
                });
            }
        });
    },
    delorder: function(a) {
        var s = this;
        wx.showLoading({
            title: "链接中...",
            mask: !0
        }), wx.request({
            url: t.globalData.host + "/api/User/delorder",
            method: "POST",
            data: {
                order: a.target.dataset.number
            },
            success: function(t) {
                1 == t.data.code ? (wx.showToast({
                    title: "删除成功!",
                    icon: "success",
                    mask: !0,
                    duration: 2e3
                }), setTimeout(function() {
                    s.setData({
                        actives: [ {
                            name: "全部订单",
                            active: "active",
                            status: "all"
                        }, {
                            name: "待付款",
                            active: "",
                            status: 0
                        }, {
                            name: "待发货",
                            active: "",
                            status: 1
                        }, {
                            name: "待收货",
                            active: "",
                            status: 2
                        }, {
                            name: "完成",
                            active: "",
                            status: 3
                        } ]
                    }), s.onLoad();
                }, 2e3)) : wx.showToast({
                    title: "删除失败!",
                    icon: "loading",
                    mask: !0,
                    duration: 2e3
                });
            }
        });
    },
    lookkd: function(t) {
        wx.navigateTo({
            url: "/pages/lookkd/lookkd?logistics=" + t.target.dataset.logistics + "&num=" + t.target.dataset.num
        });
    },
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {
        this.getdata(this.data.pages, this.data.size, this.data.status);
    },
    onShareAppMessage: function() {
        return {
            title: t.globalData.shop.nickname,
            path: "/pages/index/index?scene=" + t.globalData.shop_id
        };
    }
});