var a = getApp();

Page({
    data: {
        shop: [],
        imgUrls: [],
        indicatorDots: !1,
        image: "",
        autoplay: !0,
        interval: 5e3,
        duration: 1e3,
        admin: ""
    },
    onLoad: function(t) {
        this.setData({
            admin: a.globalData.admin
        });
        var e = this;
        if (t.scene) {
            var o = decodeURIComponent(t.scene);
            wx.showLoading({
                title: "加载中...",
                mask: !0,
                duration: 1e3
            }), -1 != o.indexOf(",") ? (o = o.split(","), a.globalData.refid = o[1], e.setrefid(o), 
            e.getShopNews(o[0])) : e.getShopNews(o);
        } else e.getShopNews("undefined");
    },
    setrefid: function(t) {
        var e = this;
        "" != a.globalData.openid ? wx.request({
            url: a.globalData.host + "/api/Index/setrefid",
            data: {
                openid: a.globalData.userInfo.openid,
                refid: t[1],
                shop_id: t[0]
            },
            success: function(a) {
                console.log(a);
            }
        }) : setTimeout(function() {
            e.setrefid(t);
        }, 1e3);
    },
    getShopNews: function(t) {
        var e = this;
        console.log(a.globalData), console.log(t), "" != a.globalData.openid ? wx.request({
            url: a.globalData.host + "/api/User/getShopnews",
            data: {
                shop_id: t,
                openid: a.globalData.openid
            },
            success: function(t) {
                if (console.log(t), 1 == t.data.code) {
                    e.getswi(), a.globalData.shop_id = t.data.data.id, a.globalData.shop = t.data.data, 
                    wx.setNavigationBarTitle({
                        title: t.data.data.nickname
                    }), wx.setStorage({
                        key: "shop_id",
                        data: a.globalData.shop_id
                    });
                    var o = 0, i = "";
                    1 == t.data.data.sjk && (o += 1, i = 0), 1 == t.data.data.caimo && (o += 1, i = 1), 
                    1 == t.data.data.lipin && (o += 1, i = 2), 1 == o && wx.navigateTo({
                        url: "/pages/sheji/index?types=" + i
                    }), wx.hideLoading(), e.setData({
                        shop: t.data.data
                    }), 1 == t.data.data.ftypes && wx.showModal({
                        title: "提示",
                        content: "该商家未开通定制系统",
                        success: function(a) {
                            a.confirm ? console.log("用户点击确定") : a.cancel && console.log("用户点击取消");
                        }
                    });
                } else wx.showToast({
                    title: t.data.msg,
                    icon: "loading",
                    mask: !0,
                    duration: 2e3
                });
            }
        }) : setTimeout(function() {
            e.getShopNews(t);
        }, 1e3);
    },
    getswi: function() {
        var t = this;
        wx.request({
            url: a.globalData.host + "/api/User/getSwiper",
            data: {
                shop_id: 38,
                openid: a.globalData.openid
            },
            success: function(a) {
                1 == a.data.code ? (t.showmg(a.data.data, 0), t.setData({
                    imgUrls: a.data.data
                })) : wx.showToast({
                    title: a.data.msg,
                    icon: "loading",
                    mask: !0,
                    duration: 2e3
                });
            }
        });
    },
    showmg: function(a, t) {
        var e = this;
        t == a.length && (t = 0), this.setData({
            image: a[t].image
        });
        var o = a[t].jtime, i = setInterval(function() {
            0 == o ? (clearInterval(i), e.showmg(a, t + 1)) : --o;
        }, 1e3);
    },
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {
        return {
            title: a.globalData.shop.nickname,
            path: "/pages/index/index?scene=" + encodeURIComponent(a.globalData.shop.id + "," + a.globalData.userInfo.id)
        };
    }
});