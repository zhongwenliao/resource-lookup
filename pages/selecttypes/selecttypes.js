var t = getApp();

Page({
    data: {
        h: 0,
        pp: [],
        searchtxt: "",
        list: [],
        searshow: !0
    },
    onLoad: function(a) {
        2 == t.globalData.types && wx.setNavigationBarTitle({
            title: "礼品定制"
        });
        var e = this;
        wx.getSystemInfo({
            success: function(t) {
                e.setData({
                    h: t.windowHeight - 57
                });
            }
        }), wx.request({
            url: t.globalData.host + "/api/index/getbrandlist",
            data: {
                shop_id: t.globalData.shop_id,
                types: t.globalData.types
            },
            success: function(t) {
                1 == t.data.code && e.setData({
                    pp: t.data.data
                });
            }
        });
    },
    searchtxt: function(t) {
        this.setData({
            searchtxt: t.detail.value
        });
    },
    searchbtn: function() {
        var a = this;
        "" != this.data.searchtxt ? wx.request({
            url: t.globalData.host + "/api/index/searchtxt",
            data: {
                shop_id: t.globalData.shop_id,
                val: this.data.searchtxt,
                types: t.globalData.types
            },
            success: function(t) {
                console.log(t), a.setData({
                    list: t.data.data,
                    searshow: !1
                });
            }
        }) : wx.showToast({
            title: "请输入搜索内容!",
            icon: "loading",
            mask: !0,
            duration: 2e3
        });
    },
    closesear: function() {
        this.setData({
            searshow: !0,
            list: []
        });
    },
    selectleft: function(t) {
        for (var a = this.data.pp, e = this, s = 0; s < a.length; s++) a[s].active = "";
        a[t.target.dataset.ind].active = "active", e.setData({
            pp: a
        });
    },
    selectright: function(t) {
        for (var a = this.data.pp, e = 0; e < a.length; e++) "active" == a[e].active && wx.setStorage({
            key: "ppselc",
            data: a[e].children[t.target.dataset.xlidx].children[t.target.dataset.icidx]
        });
        wx.navigateBack();
    },
    selectser: function(t) {
        var a = this.data.list;
        wx.setStorage({
            key: "ppselc",
            data: a[t.target.dataset.ind]
        }), wx.navigateBack();
    },
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {
        return {
            title: t.globalData.shop.nickname,
            path: "/pages/index/index?scene=" + t.globalData.shop_id
        };
    }
});