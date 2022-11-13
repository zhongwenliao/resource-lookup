var a = getApp();

Page({
    data: {
        selectval: [],
        list: []
    },
    checkboxChange: function(a) {
        console.log("checkbox发生change事件，携带value值为：", a.detail.value), this.setData({
            selectval: a.detail.value
        });
    },
    joincar: function() {
        var a = this.data.selectval;
        if (0 != a.length) {
            var t = "", e = !0, o = !1, n = void 0;
            try {
                for (var i, l = a[Symbol.iterator](); !(e = (i = l.next()).done); e = !0) t += i.value + ",";
            } catch (a) {
                o = !0, n = a;
            } finally {
                try {
                    !e && l.return && l.return();
                } finally {
                    if (o) throw n;
                }
            }
            wx.navigateTo({
                url: "/pages/paycar/paycar?ids=" + t
            });
        } else wx.showToast({
            title: "请选择信息!",
            icon: "loading",
            mask: !0,
            duration: 2e3
        });
    },
    buyorder: function() {
        var t = this.data.selectval;
        if (0 != t.length) {
            var e = "", o = !0, n = !1, i = void 0;
            try {
                for (var l, s = t[Symbol.iterator](); !(o = (l = s.next()).done); o = !0) e += l.value + ",";
            } catch (a) {
                n = !0, i = a;
            } finally {
                try {
                    !o && s.return && s.return();
                } finally {
                    if (n) throw i;
                }
            }
            var r = this;
            wx.showLoading({
                title: "数据提交中...",
                mask: !0
            }), wx.request({
                url: a.globalData.host + "/api/User/clearusershopcar",
                data: {
                    ids: e,
                    openid: a.globalData.openid
                },
                success: function(a) {
                    wx.showToast({
                        title: "操作成功!",
                        icon: "success",
                        mask: !0,
                        duration: 2e3
                    }), 1 == a.data.code ? r.setData({
                        list: a.data.data
                    }) : wx.showToast({
                        title: "操作失败!",
                        icon: "loading",
                        mask: !0,
                        duration: 2e3
                    });
                }
            });
        } else wx.showToast({
            title: "请选择信息!",
            icon: "loading",
            mask: !0,
            duration: 2e3
        });
    },
    onLoad: function(t) {
        var e = this;
        wx.request({
            url: a.globalData.host + "/api/User/getusershopcar",
            data: {
                openid: a.globalData.openid
            },
            success: function(a) {
                console.log(a), 1 == a.data.code && e.setData({
                    list: a.data.data
                });
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