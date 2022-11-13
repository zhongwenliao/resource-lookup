var a = getApp();

Page({
    data: {
        data: []
    },
    onLoad: function(a) {},
    qingkong: function() {
        var o = this;
        wx.showModal({
            title: "清空地址",
            content: "清空全部收货地址",
            showCancel: !0,
            cancelText: "取消",
            confirmText: "确认",
            success: function(e) {
                e.confirm && wx.request({
                    url: a.globalData.host + "/api/User/qingkongaddress",
                    data: {
                        openid: a.globalData.openid
                    },
                    success: function(a) {
                        1 == a.data.code ? (wx.showToast({
                            title: "操作成功!",
                            icon: "success",
                            mask: !0,
                            duration: 2e3
                        }), o.onShow()) : (wx.showToast({
                            title: "操作失败!",
                            icon: "loading",
                            mask: !0,
                            duration: 2e3
                        }), o.onShow());
                    }
                });
            }
        });
    },
    addresforwx: function() {
        var o = this;
        wx.chooseAddress({
            success: function(e) {
                console.log(e.userName), console.log(e.provinceName), console.log(e.cityName), console.log(e.countyName), 
                console.log(e.detailInfo), console.log(e.telNumber), wx.showLoading({
                    title: "保存中...",
                    mask: !0
                }), wx.request({
                    url: a.globalData.host + "/api/User/saveaddress",
                    data: {
                        openid: a.globalData.openid,
                        address: e.provinceName + " " + e.cityName + " " + e.countyName + " " + e.detailInfo,
                        mobile: e.telNumber,
                        realname: e.userName,
                        ids: 0
                    },
                    success: function(a) {
                        1 == a.data.code ? (wx.showToast({
                            title: "保存成功!",
                            icon: "success",
                            mask: !0,
                            duration: 2e3
                        }), o.onShow()) : (wx.showToast({
                            title: "保存失败!",
                            icon: "loading",
                            mask: !0,
                            duration: 2e3
                        }), o.onShow());
                    }
                });
            }
        });
    },
    addresformy: function() {
        wx.navigateTo({
            url: "/pages/addre/addre"
        });
    },
    onReady: function() {},
    onShow: function() {
        var o = this;
        wx.request({
            url: a.globalData.host + "/api/User/getuseraddress",
            data: {
                openid: a.globalData.openid
            },
            success: function(a) {
                console.log(a), 1 == a.data.code && o.setData({
                    data: a.data.data
                });
            }
        });
    },
    moren: function(o) {
        var e = this;
        wx.request({
            url: a.globalData.host + "/api/User/setaddmo",
            data: {
                ids: o.target.dataset.idx,
                openid: a.globalData.openid
            },
            success: function(a) {
                1 == a.data.code ? e.setData({
                    data: a.data.data
                }) : wx.showToast({
                    title: "设置失败!",
                    icon: "loading",
                    mask: !0,
                    duration: 2e3
                });
            }
        });
    },
    editadd: function(a) {
        console.log(a.target.dataset.idx), wx.navigateTo({
            url: "/pages/addre/addre?ids=" + a.target.dataset.idx
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