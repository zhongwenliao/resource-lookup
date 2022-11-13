var a = getApp();

Page({
    data: {
        list: []
    },
    onLoad: function(t) {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        });
        var o = this;
        wx.request({
            url: a.globalData.host + "/api/User/getrefscorelog",
            method: "POST",
            data: {
                shop_id: a.globalData.shop_id,
                user_id: a.globalData.userInfo.id
            },
            success: function(a) {
                0 == a.data.data.length ? o.setData({
                    list: !1
                }) : o.setData({
                    list: a.data.data
                }), wx.hideLoading();
            }
        });
    },
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {}
});