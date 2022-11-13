var a = getApp();

Page({
    data: {
        basedata: [],
        types2: "",
        admin: ""
    },
    onLoad: function(t) {
        this.setData({
            admin: a.globalData.admin
        });
        var e = this;
        wx.request({
            url: a.globalData.host + "/api/User/getbasedata",
            data: {
                shop_id: a.globalData.shop_id
            },
            success: function(t) {
                1 == t.data.code && e.setData({
                    basedata: t.data.data,
                    types2: a.globalData.types
                });
            }
        }), wx.setNavigationBarTitle({
            title: a.globalData.shop.nickname
        });
    },
    editaddress: function() {
        wx.navigateTo({
            url: "/pages/address/address"
        });
    },
    fenxiao: function() {
        wx.request({
            url: a.globalData.host + "/api/User/getbasedatas",
            data: {
                openid: a.globalData.openid,
                shop_id: a.globalData.shop_id
            },
            success: function(a) {
                1 == a.data.code ? 0 == a.data.data ? wx.navigateTo({
                    url: "/pages/fenxiaosend/fenxiaosend"
                }) : wx.navigateTo({
                    url: "/pages/fenxiao/fenxiao"
                }) : wx.showToast({
                    title: a.data.msg,
                    icon: "loading",
                    mask: !0,
                    duration: 2e3
                });
            }
        });
    },
    bohao: function() {
        wx.makePhoneCall({
            phoneNumber: this.data.basedata.tel
        });
    },
    copylink: function() {
        wx.setClipboardData({
            data: this.data.basedata.wechat,
            success: function(a) {
                wx.showToast({
                    title: "客户微信已复制",
                    mask: !0,
                    icon: "success",
                    duration: 2e3
                });
            }
        });
    },
    orderlist: function() {
        wx.navigateTo({
            url: "/pages/orderlist/orderlist"
        });
    },
    shopcar: function() {
        wx.navigateTo({
            url: "/pages/shopcar/shopcar"
        });
    },
    guamnli: function() {
        wx.requestSubscribeMessage({
            tmplIds: [ "gHDUcnfIKIzd7prlH2ZjfgDGrJ8Fdh6XcA_zXdp0kx4" ],
            complete: function(t) {
                wx.getStorage({
                    key: "admin",
                    success: function(t) {
                        console.log(t), wx.request({
                            url: a.globalData.host + "/api/Adminindex/checkadmin",
                            data: {
                                id: t.data.id
                            },
                            success: function(a) {
                                1 == a.data.code ? wx.navigateTo({
                                    url: "/pages/adminindex/adminindex"
                                }) : (wx.showToast({
                                    title: a.data.msg,
                                    mask: !0,
                                    icon: "loading",
                                    duration: 2e3
                                }), setTimeout(function() {
                                    wx.removeStorage({
                                        key: "admin",
                                        success: function(a) {
                                            wx.navigateTo({
                                                url: "/pages/adminlogin/adminlogin"
                                            });
                                        }
                                    });
                                }, 2e3));
                            }
                        });
                    },
                    fail: function(a) {
                        wx.navigateTo({
                            url: "/pages/adminlogin/adminlogin"
                        });
                    }
                });
            }
        });
    },
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {}
});