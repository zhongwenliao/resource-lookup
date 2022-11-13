App({
    onLaunch: function(a) {
        console.log(a);
        var t = wx.getUpdateManager();
        if (t.onCheckForUpdate(function(a) {
            console.log(a.hasUpdate);
        }), t.onUpdateReady(function() {
            wx.showModal({
                title: "更新提示",
                content: "新版本已经准备好，是否重启应用？",
                success: function(a) {
                    a.confirm && t.applyUpdate();
                }
            });
        }), t.onUpdateFailed(function() {
            wx.showModal({
                title: "更新提示",
                content: "新版本下载失败",
                showCancel: !1
            });
        }), void 0 != a.query.scene) {
            var o = decodeURIComponent(a.query.scene);
            -1 != o.indexOf(",") ? (o = o.split(","), this.globalData.shop_id = o[0]) : this.globalData.shop_id = o;
        }
        var e = this;
        wx.login({
            success: function(a) {
                wx.request({
                    url: e.globalData.host + "/api/User/login",
                    data: {
                        code: a.code
                    },
                    success: function(a) {
                        console.log(a), 1 == a.data.code ? (e.globalData.userInfo = a.data.data, e.globalData.openid = a.data.data.openid, 
                        e.globalData.refid = a.data.data.refid, 1 == a.data.data.types ? (wx.setStorage({
                            key: "admin",
                            data: a.data.data
                        }), e.globalData.admin = a.data.data) : wx.getStorage({
                            key: "admin",
                            success: function(a) {
                                e.globalData.admin = a.data;
                            }
                        })) : 2 == a.data.code ? e.globalData.openid = a.data.data : console.log("授权失败");
                    }
                });
            }
        });
    },
    requirejs: function(a) {
        return require("utils/" + a + ".js");
    },
    globalData: {
        onloadss: !1,
        admin: "",
        shop: [],
        shop_id: "",
        userInfo: "",
        openid: "",
        imgurl: "",
        types: "",
        refid: 0,
        host: "https://30diy.cn"
    }
});