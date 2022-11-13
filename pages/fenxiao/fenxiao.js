var o = getApp();

Page({
    data: {
        list: []
    },
    reforderlist: function() {
        wx.navigateTo({
            url: "/pages/reforderlist/reforderlist"
        });
    },
    shopdata: function(o) {
        wx.navigateTo({
            url: "/pages/shopdata/shopdata"
        });
    },
    refcode: function() {
        wx.navigateTo({
            url: "/pages/refcode/refcode"
        });
    },
    monelog: function() {
        wx.navigateTo({
            url: "/pages/monelog/monelog"
        });
    },
    outmoney: function() {
        wx.navigateTo({
            url: "/pages/outmoney/outmoney?money=" + this.data.list.score
        });
    },
    onLoad: function(o) {},
    onReady: function() {},
    onShow: function() {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        });
        var a = this;
        wx.request({
            url: o.globalData.host + "/api/User/getrefdata",
            method: "POST",
            data: {
                shop_id: o.globalData.shop_id,
                user_id: o.globalData.userInfo.id
            },
            success: function(o) {
                a.setData({
                    list: o.data.data
                }), wx.hideLoading();
            }
        });
    },
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {}
});