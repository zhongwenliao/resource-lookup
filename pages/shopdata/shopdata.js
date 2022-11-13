var o = getApp();

Page({
    data: {
        data: []
    },
    onLoad: function(n) {
        console.log(o.globalData.shop), this.setData({
            data: o.globalData.shop
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