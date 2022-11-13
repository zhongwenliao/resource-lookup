var a = getApp();

Page({
    data: {
        data: [],
        num: "",
        kuaidi: ""
    },
    copylink: function() {
        wx.setClipboardData({
            data: this.data.num,
            success: function(a) {
                wx.showToast({
                    title: "单号已复制",
                    mask: !0,
                    icon: "success",
                    duration: 2e3
                });
            }
        });
    },
    onLoad: function(t) {
        var n = this;
        wx.showLoading({
            title: "查询中"
        }), wx.request({
            url: a.globalData.host + "/api/User/lookkd",
            data: {
                logistics: t.logistics,
                logisticsnum: t.num
            },
            success: function(a) {
                n.setData({
                    kuaidi: a.data.data.ShipperCode,
                    num: t.num
                }), a.data.data.Success ? (n.setData({
                    data: a.data.data
                }), setTimeout(function() {
                    wx.hideLoading();
                }, 2e3)) : (wx.showToast({
                    title: "暂无物流信息!",
                    icon: "loading",
                    mask: !0,
                    duration: 1e3
                }), wx.hideLoading());
            }
        });
    },
    onReady: function() {},
    onShow: function() {},
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