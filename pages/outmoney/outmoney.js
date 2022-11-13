var o = getApp();

Page({
    data: {
        money: 0,
        list: []
    },
    onLoad: function(a) {
        this.setData({
            money: a.money
        });
        var t = this;
        wx.request({
            url: o.globalData.host + "/api/User/getoutmong",
            data: {
                shop_id: o.globalData.shop_id,
                user_id: o.globalData.userInfo.id
            },
            success: function(o) {
                t.setData({
                    list: o.data.data
                }), wx.hideLoading();
            }
        });
    },
    formSubmit: function(a) {
        var t = a.detail.value.score;
        "" != t ? t < .3 ? wx.showToast({
            title: "最低金额0.3元!",
            icon: "loading",
            mask: !0,
            duration: 2e3
        }) : t >= 5e3 ? wx.showToast({
            title: "不能超过5000元!",
            icon: "loading",
            mask: !0,
            duration: 2e3
        }) : (wx.showLoading({
            title: "申请中...",
            mask: !0
        }), wx.request({
            url: o.globalData.host + "/api/User/sendout",
            data: {
                openid: o.globalData.openid,
                score: t,
                user_id: o.globalData.userInfo.id,
                shop_id: o.globalData.shop_id
            },
            success: function(o) {
                1 == o.data.code ? (wx.showToast({
                    title: "申请成功!",
                    icon: "success",
                    mask: !0,
                    duration: 2e3
                }), setTimeout(function() {
                    wx.navigateBack();
                }, 1e3)) : wx.showToast({
                    title: o.data.msg,
                    icon: "loading",
                    mask: !0,
                    duration: 2e3
                });
            }
        })) : wx.showToast({
            title: "填写提现金额!",
            icon: "loading",
            mask: !0,
            duration: 2e3
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