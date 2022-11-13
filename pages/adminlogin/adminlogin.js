var a = getApp();

Page({
    data: {},
    formSubmit: function(o) {
        var n = o.detail.value.username, t = o.detail.value.password;
        "" != n ? "" != t ? (wx.showLoading({
            title: "登录中...",
            mask: !0
        }), wx.request({
            url: a.globalData.host + "/api/Adminindex/adminlogin",
            method: "POST",
            data: {
                username: n,
                password: t,
                openid: a.globalData.openid
            },
            success: function(o) {
                1 == o.data.code ? (a.globalData.admin = o.data.data, wx.setStorage({
                    key: "admin",
                    data: o.data.data
                }), wx.redirectTo({
                    url: "/pages/adminindex/adminindex"
                })) : wx.showToast({
                    title: o.data.msg,
                    icon: "loading",
                    mask: !0,
                    duration: 2e3
                });
            }
        })) : wx.showToast({
            title: "请输入密码!",
            icon: "loading",
            mask: !0,
            duration: 2e3
        }) : wx.showToast({
            title: "请输入账号!",
            icon: "loading",
            mask: !0,
            duration: 2e3
        });
    },
    onLoad: function(a) {},
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {}
});