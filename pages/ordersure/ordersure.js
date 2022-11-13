var a = getApp();

Page({
    data: {
        num: 1,
        gg: [],
        imgurl: "",
        price: 0,
        ggindex: 0,
        w: 0,
        bag: "https://30diy.cn/public/img/timg.jpg",
        h: 0
    },
    onLoad: function(t) {
        var e = this, i = 0, n = 0;
        wx.getStorage({
            key: "phonetype",
            success: function(t) {
                var o = t.data;
                console.log(o), o.h > o.w ? (n = 30, i = 30 * o.h / o.w) : (i = 30, n = 30 * o.w / o.h), 
                wx.request({
                    url: a.globalData.host + "/api/index/getSpec",
                    data: {
                        shop_id: a.globalData.shop_id,
                        model_id: o.id,
                        types: a.globalData.types
                    },
                    success: function(t) {
                        if (1 == t.data.code) {
                            var d = "https://30diy.cn/public/img/timg.jpg";
                            "" != t.data.data[0].image && void 0 != t.data.data[0].image && (d = a.globalData.host + t.data.data[0].image), 
                            e.setData({
                                phonetype: o,
                                gg: t.data.data,
                                price: t.data.msg,
                                w: n,
                                h: i,
                                bag: d
                            });
                        } else e.setData({
                            phonetype: o,
                            w: n,
                            h: i
                        });
                    }
                });
            }
        }), this.setData({
            imgurl: a.globalData.imgurl
        });
    },
    delnum: function() {
        var a = this.data.num, t = this.data.price / a;
        this.data.num > 1 && this.setData({
            num: a - 1,
            price: t * (a - 1)
        });
    },
    puhnum: function() {
        var a = this.data.num, t = this.data.price / a;
        this.setData({
            num: a + 1,
            price: t * (a + 1)
        });
    },
    celgg: function(t) {
        for (var e = this.data.gg, i = 0; i < e.length; i++) e[i].active = "";
        e[t.target.dataset.idx].active = "active";
        var n = "https://30diy.cn/public/img/timg.jpg";
        "" != e[t.target.dataset.idx].image && null != e[t.target.dataset.idx].image && (n = a.globalData.host + e[t.target.dataset.idx].image), 
        this.setData({
            gg: e,
            price: e[t.target.dataset.idx].price * this.data.num,
            ggindex: t.target.dataset.idx,
            bag: n
        });
    },
    joincar: function() {
        wx.showLoading({
            title: "收藏中...",
            mask: !0
        });
        var t = this, e = this.data.gg, i = this.data.ggindex;
        wx.uploadFile({
            url: a.globalData.host + "/api/Common/upload",
            filePath: this.data.imgurl,
            name: "file",
            formData: {
                types: "order"
            },
            success: function(n) {
                var o = JSON.parse(n.data);
                1 == o.code ? wx.request({
                    url: a.globalData.host + "/api/Index/shopCar",
                    data: {
                        image: o.data.url,
                        openid: a.globalData.openid,
                        shop_id: a.globalData.shop_id,
                        models_id: t.data.phonetype.id,
                        spec_id: e[i].id,
                        spec: e[i].name,
                        num: t.data.num,
                        price: e[i].price
                    },
                    success: function(a) {
                        1 == a.data.code ? wx.showToast({
                            title: "操作成功!",
                            icon: "success",
                            mask: !0,
                            duration: 2e3
                        }) : wx.showToast({
                            title: "操作失败!",
                            icon: "loading",
                            mask: !0,
                            duration: 2e3
                        });
                    }
                }) : wx.showToast({
                    title: "图片上传失败!",
                    icon: "loading",
                    mask: !0,
                    duration: 2e3
                });
            }
        });
    },
    buyorder: function() {
        var t = this;
        if ("1" == a.globalData.shop.sendopen) wx.requestSubscribeMessage({
            tmplIds: [ "W2FqYaFVetvKX3a1HR9uBMqXNR9VPUxg3xf72IYPT3c" ],
            complete: function(a) {
                var e = t.data.gg, i = t.data.ggindex;
                if (0 == e.length) {
                    o = t.data.num;
                    wx.navigateTo({
                        url: "/pages/buyorder/buyorder?spec_id=0&num=" + o
                    });
                } else {
                    var n = e[i].id, o = t.data.num, d = e[i].price, s = e[i].name;
                    wx.navigateTo({
                        url: "/pages/buyorder/buyorder?spec_id=" + n + "&num=" + o + "&price=" + d + "&spec_name=" + s
                    });
                }
            }
        }); else {
            var e = t.data.gg, i = t.data.ggindex;
            if (0 == e.length) {
                o = t.data.num;
                wx.navigateTo({
                    url: "/pages/buyorder/buyorder?spec_id=0&num=" + o
                });
            } else {
                var n = e[i].id, o = t.data.num, d = e[i].price, s = e[i].name;
                wx.navigateTo({
                    url: "/pages/buyorder/buyorder?spec_id=" + n + "&num=" + o + "&price=" + d + "&spec_name=" + s
                });
            }
        }
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