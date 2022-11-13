var o = getApp();

Page({
    data: {
        img: "",
        host: ""
    },
    onLoad: function(a) {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        });
        var t = this;
        console.log(o.globalData), console.log(o.globalData.shop.id), console.log(o.globalData.userInfo.id), 
        wx.request({
            url: o.globalData.host + "/api/User/getuserdata",
            data: {
                shop_id: o.globalData.shop.id,
                user_id: o.globalData.userInfo.id
            },
            success: function(a) {
                console.log(a), t.setData({
                    img: a.data.data,
                    host: o.globalData.host
                }), wx.hideLoading();
            }
        });
    },
    lookimg: function() {
        var o = this.data.host + this.data.img;
        wx.previewImage({
            current: o,
            urls: [ o ]
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