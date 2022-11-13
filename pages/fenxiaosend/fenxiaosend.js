var a = getApp();

Page({
    data: {
        data: "",
        ids: 0
    },
    onLoad: function(a) {},
    formSubmit: function(o) {
        var t = o.detail.value.address, n = o.detail.value.mobile, e = o.detail.value.realname;
        "" != e ? "" != n ? "" != t ? (wx.showLoading({
            title: "保存中...",
            mask: !0
        }), wx.request({
            url: a.globalData.host + "/api/User/savebasedata",
            data: {
                openid: a.globalData.openid,
                address: t,
                mobile: n,
                realname: e,
                shop_id: a.globalData.shop_id
            },
            success: function(a) {
                1 == a.data.code ? (wx.showToast({
                    title: "申请成功!",
                    icon: "success",
                    mask: !0,
                    duration: 2e3
                }), setTimeout(function() {
                    wx.navigateBack();
                }, 1e3)) : wx.showToast({
                    title: a.data.msg,
                    icon: "loading",
                    mask: !0,
                    duration: 2e3
                });
            }
        })) : wx.showToast({
            title: "填写微信号!",
            icon: "loading",
            mask: !0,
            duration: 2e3
        }) : wx.showToast({
            title: "填写电话!",
            icon: "loading",
            mask: !0,
            duration: 2e3
        }) : wx.showToast({
            title: "填写姓名!",
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
    onReachBottom: function() {}
});