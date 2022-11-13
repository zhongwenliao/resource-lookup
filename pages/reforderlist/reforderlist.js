var o = getApp();

Page({
    data: {
        list: [],
        host: o.globalData.host
    },
    onLoad: function(a) {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        }), console.log(o.globalData), console.log(o.globalData.shop.id), console.log(o.globalData.userInfo.id);
        var t = this;
        wx.request({
            url: o.globalData.host + "/api/User/getreforder",
            data: {
                shop_id: o.globalData.shop.id,
                user_id: o.globalData.userInfo.id
            },
            success: function(o) {
                console.log(o), t.setData({
                    list: o.data.data
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