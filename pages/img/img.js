var t = "", a = getApp(), i = 1;

Page({
    data: {
        bottom: [ {
            id: 1,
            name: "蒙版",
            img: "../../img/t1.png",
            active: ""
        }, {
            id: 2,
            name: "图库",
            img: "../../img/tk1.png",
            active: ""
        }, {
            id: 3,
            name: "贴图",
            img: "../../img/mb1.png",
            active: ""
        } ],
        h: 0,
        lpp: [],
        pp: [],
        tuku: [],
        mb: [],
        tt: [],
        scrollToplo: 0,
        scrollTopro: 0,
        scrollTopl: 0,
        scrollTopr: 0,
        host: a.globalData.host,
        pages: 1,
        bg: "",
        act: "",
        width: "80%"
    },
    onLoad: function(i) {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        }), t = i.act;
        var e = this;
        wx.getSystemInfo({
            success: function(t) {
                e.setData({
                    h: t.windowHeight - 50
                });
            }
        }), e.setData({
            act: t
        }), wx.getStorage({
            key: "secimgs",
            success: function(i) {
                var o = i.data.lpp, d = i.data.pp, s = i.data.bottom, c = i.data.scrollTopl, g = i.data.scrollTopr;
                "active" == s[0].active && "mb" != t ? (s[0].active = "", s[0].img = "../../img/t1.png", 
                c = 0, g = 0, "tk" == t ? (d = i.data.tuku[0].children, o = i.data.tuku, s[1].active = "active", 
                s[1].img = "../../img/tk2.png") : "tt" == t && (d = i.data.tt[0].children, o = i.data.tt, 
                s[2].active = "active", s[2].img = "../../img/mb2.png")) : "active" == s[1].active && "tk" != t ? (s[1].active = "", 
                s[1].img = "../../img/tk1.png", c = 0, g = 0, "mb" == t ? (d = i.data.mb[0].children, 
                o = i.data.mb, s[0].active = "active", s[0].img = "../../img/t2.png") : "tt" == t && (d = i.data.tt[0].children, 
                o = i.data.tt, s[2].active = "active", s[2].img = "../../img/mb2.png")) : "active" == s[2].active && "tt" != t && (s[2].active = "", 
                s[2].img = "../../img/mb1.png", c = 0, g = 0, "mb" == t ? (d = i.data.mb[0].children, 
                o = i.data.mb, s[0].active = "active", s[0].img = "../../img/t2.png") : "tk" == t && (d = i.data.tuku[0].children, 
                o = i.data.tuku, s[1].active = "active", s[1].img = "../../img/tk2.png")), console.log(s), 
                e.setData({
                    bottom: s,
                    mb: i.data.mb,
                    pp: d,
                    lpp: o,
                    tt: i.data.tt,
                    tuku: i.data.tuku,
                    pages: i.data.pages,
                    scrollToplo: c,
                    scrollTopro: g
                }), wx.request({
                    url: a.globalData.host + "/api/Index/getTkList",
                    data: {
                        shop_id: a.globalData.shop_id
                    },
                    success: function(t) {
                        1 == t.data.code && e.setData({
                            tuku: t.data.data.tk,
                            mb: t.data.data.mb,
                            tt: t.data.data.tt
                        }), wx.hideLoading();
                    }
                });
            },
            fail: function(i) {
                wx.getSystemInfo({
                    success: function(t) {
                        e.setData({
                            h: t.windowHeight - 50
                        });
                    }
                }), wx.request({
                    url: a.globalData.host + "/api/Index/getTkList",
                    data: {
                        shop_id: a.globalData.shop_id
                    },
                    success: function(a) {
                        if (1 == a.data.code) {
                            var i = "", o = "", d = e.data.bottom;
                            "mb" == t ? (o = a.data.data.mb[0].children, i = a.data.data.mb, d[0].active = "active", 
                            d[0].img = "../../img/t2.png") : "tk" == t ? (o = a.data.data.tk[0].children, i = a.data.data.tk, 
                            d[1].active = "active", d[1].img = "../../img/tk2.png") : "tt" == t && (o = a.data.data.tt[0].children, 
                            i = a.data.data.tt, d[2].active = "active", d[2].img = "../../img/mb2.png"), e.setData({
                                tuku: a.data.data.tk,
                                mb: a.data.data.mb,
                                tt: a.data.data.tt,
                                pp: o,
                                lpp: i,
                                bottom: d
                            });
                        }
                    }
                });
            }
        });
        var o = wx.getStorageSync("ppselcs");
        o && e.setData({
            bg: o
        });
    },
    getdata: function() {
        if (1 == i) {
            wx.showLoading({
                title: "加载中",
                mask: !0
            });
            for (var t = this, e = 0, o = this.data.lpp, d = this.data.pp, s = 0; s < o.length; s++) "active" == o[s].active && (e = o[s].id);
            wx.request({
                url: a.globalData.host + "/api/Index/getTkListmore",
                data: {
                    shop_id: a.globalData.shop_id,
                    pages: t.data.pages,
                    cate_id: e
                },
                success: function(a) {
                    1 == a.data.code ? (Array.prototype.push.apply(d, a.data.data), t.setData({
                        pp: d,
                        pages: t.data.pages + 1
                    })) : (wx.showToast({
                        title: "暂无更多",
                        mask: !0,
                        image: "../../img/err.png"
                    }), i = 0);
                }
            });
        }
    },
    bindload: function(t) {
        console.log(t);
        var a = 150 / t.detail.height * t.detail.width;
        this.setData({
            width: a
        }), wx.hideLoading();
    },
    bindscrolltolower: function(t) {
        this.getdata();
    },
    scrolll: function(t) {
        this.setData({
            scrollTopl: t.detail.scrollTop
        });
    },
    scrollr: function(t) {
        this.setData({
            scrollTopr: t.detail.scrollTop
        });
    },
    selectleft: function(t) {
        for (var a = this.data.lpp, e = this, o = 0; o < a.length; o++) a[o].active = "";
        a[t.target.dataset.ind].active = "active", i = 1, e.setData({
            lpp: a,
            scrollTopro: 0,
            pages: 1,
            pp: []
        }), e.getdata();
    },
    selectright: function(a) {
        console.log(a);
        var i = this.data.pp, e = this.data.bottom;
        console.log(i), console.log(e);
        for (var o = 0; o < e.length; o++) if ("active" == e[o].active) if ("蒙版" == e[o].name) wx.setStorage({
            key: "mb",
            data: i[a.currentTarget.dataset.xlidx]
        }); else if ("图库" == e[o].name) wx.setStorage({
            key: "tk",
            data: i[a.currentTarget.dataset.xlidx]
        }); else if ("贴图" == e[o].name) {
            var d = wx.getStorageSync("tt");
            "" == d && (d = []), d.push(i[a.currentTarget.dataset.xlidx]), wx.setStorage({
                key: "tt",
                data: d
            });
        }
        "index" == t ? wx.navigateBack() : wx.navigateBack({
            url: "/pages/sheji/index"
        });
    },
    btnbottom: function(t) {
        for (var a = this.data.bottom, i = this, e = 0; e < a.length; e++) a[e].active = "";
        a[t.currentTarget.dataset.idx].active = "active";
        var o, d;
        0 == t.currentTarget.dataset.idx ? (i.setData({
            act: "mb"
        }), a[0].img = "../../img/t2.png", a[1].img = "../../img/tk1.png", a[2].img = "../../img/mb1.png", 
        o = this.data.mb, d = this.data.mb[0].children) : 1 == t.currentTarget.dataset.idx ? (a[0].img = "../../img/t1.png", 
        a[1].img = "../../img/tk2.png", a[2].img = "../../img/mb1.png", o = this.data.tuku, 
        d = this.data.tuku[0].children, i.setData({
            act: "tk"
        })) : 2 == t.currentTarget.dataset.idx && (a[0].img = "../../img/t1.png", a[1].img = "../../img/tk1.png", 
        a[2].img = "../../img/mb2.png", o = this.data.tt, d = this.data.tt[0].children, 
        i.setData({
            act: "tt"
        })), this.setData({
            bottom: a,
            pp: d,
            lpp: o,
            scrollTopro: 0,
            scrollToplo: 0
        });
    },
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {
        wx.setStorage({
            key: "secimgs",
            data: this.data
        });
    },
    onPullDownRefresh: function() {
        wx.showNavigationBarLoading();
        var t = this;
        wx.request({
            url: a.globalData.host + "/api/Index/getTkList",
            data: {
                shop_id: a.globalData.shop_id
            },
            success: function(a) {
                if (1 == a.data.code) {
                    console.log(t.data.pp[0]);
                    var i, e;
                    "active" == t.data.bottom[0].active ? (i = a.data.data.mb[0].children, e = a.data.data.mb) : "active" == t.data.bottom[1].active ? (i = a.data.data.tk[0].children, 
                    e = a.data.data.tk) : "active" == t.data.bottom[2].active && (i = a.data.data.tt[0].children, 
                    e = a.data.data.tt), t.setData({
                        tuku: a.data.data.tk,
                        mb: a.data.data.mb,
                        tt: a.data.data.tt,
                        pp: i,
                        lpp: e,
                        scrollTopro: 0,
                        scrollToplo: 0
                    });
                }
                wx.hideLoading(), wx.hideNavigationBarLoading(), wx.stopPullDownRefresh();
            }
        });
    },
    onReachBottom: function() {}
});