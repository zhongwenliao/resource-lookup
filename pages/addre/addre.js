function e(e, t, a) {
    return t in e ? Object.defineProperty(e, t, {
        value: a,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = a, e;
}

var t, a = getApp(), i = require("../../@babel/runtime/helpers/interopRequireDefault"), n = i(require("../../@babel/runtime/helpers/defineProperty")), o = (i(require("../../@babel/runtime/helpers/typeof")), 
i(require("../../utils/address-parse"))), s = (require("../../utils/core"), require("../../utils/foxui"), 
require("../../utils/jquery"));

Page({
    data: (t = {
        region: [ "广东省", "广州市", "海珠区" ],
        customItem: "全部",
        data: "",
        ids: 0,
        height: 0,
        intelShow: !1,
        runAM: !1,
        intellshow: !1
    }, e(t, "height", 0), e(t, "textRemark", ""), e(t, "showText", !0), e(t, "onFacus", !1), 
    e(t, "isnew", !1), e(t, "color", "#f55"), t),
    getIndex: function(e, t) {
        if ("" == s.trim(e) || !s.isArray(t)) return [ 0, 0, 0 ];
        var a = e.split(" "), i = [ 0, 0, 0 ];
        for (var n in t) if (t[n].name == a[0]) {
            for (var o in i[0] = Number(n), t[n].city) if (t[n].city[o].name == a[1]) {
                for (var r in i[1] = Number(o), t[n].city[o].area) if (t[n].city[o].area[r].name == a[2]) {
                    i[2] = Number(r);
                    break;
                }
                break;
            }
            break;
        }
        return i;
    },
    intelligenceSubmit: function() {
        var e;
        "" == this.data.textRemark && wx.showToast({
            title: "内容不能为空"
        });
        var t = this.data.textRemark, a = (0, o.default)(t, {
            type: 0,
            textFilter: [ "电話", "電話", "聯系人", "手机号" ]
        });
        console.log(a, "智能结果。。。。。。。。。。。。"), this.setData((e = {}, (0, n.default)(e, "data.name", a.name), 
        (0, n.default)(e, "data.mobile", a.phone), (0, n.default)(e, "data.address", a.detail), 
        (0, n.default)(e, "region[0]", a.province), (0, n.default)(e, "region[1]", a.city), 
        (0, n.default)(e, "region[2]", a.area), e));
    },
    bindCopy: function() {
        var e = this;
        wx.getClipboardData({
            success: function(t) {
                console.log(t.data), e.setData({
                    textRemark: t.data
                });
            }
        });
    },
    showTextarea: function() {
        this.setData({
            showText: !1,
            onFacus: !0
        });
    },
    bindtextarea: function(e) {
        this.setData({
            textRemark: e.detail.value
        });
    },
    onShowText: function(e) {
        var t = e.detail.value;
        this.setData({
            textRemark: t,
            showText: !0,
            onFacus: !1
        });
    },
    chooseInpt: function() {
        var e = this;
        if (this.data.intelShow) {
            if (240 == e.data.height) {
                var t = 240;
                setInterval(function() {
                    (t -= 20) >= 0 && e.setData({
                        height: t
                    });
                }, 10);
            }
            e.setData({
                intelShow: !1,
                color: "#f55"
            });
        } else 0 == e.data.height && (t = 0, setInterval(function() {
            (t += 20) <= 240 && e.setData({
                height: t
            });
        }, 10)), e.setData({
            intelShow: !0,
            color: "#f55"
        });
    },
    onLoad: function(e) {
        var t = this;
        void 0 != e.ids && wx.request({
            url: a.globalData.host + "/api/User/getaddnews",
            data: {
                ids: e.ids
            },
            success: function(a) {
                1 == a.data.code && t.setData({
                    data: a.data.data,
                    region: a.data.data.regions,
                    ids: e.ids
                });
            }
        });
    },
    bindRegionChange: function(e) {
        this.setData({
            region: e.detail.value
        });
    },
    formSubmit: function(e) {
        console.log(e.detail.value);
        var t = e.detail.value.address, i = e.detail.value.mobile, n = e.detail.value.realname, o = this.data.region[0] + " " + this.data.region[1] + " " + this.data.region[2];
        "" != n ? "" != i ? "" != t ? (wx.showLoading({
            title: "保存中...",
            mask: !0
        }), wx.request({
            url: a.globalData.host + "/api/User/saveaddress",
            data: {
                openid: a.globalData.openid,
                address: o + " " + t,
                mobile: i,
                realname: n,
                ids: this.data.ids
            },
            success: function(e) {
                1 == e.data.code ? (wx.showToast({
                    title: "保存成功!",
                    icon: "success",
                    mask: !0,
                    duration: 2e3
                }), setTimeout(function() {
                    wx.navigateBack();
                }, 1e3)) : wx.showToast({
                    title: "保存失败!",
                    icon: "loading",
                    mask: !0,
                    duration: 2e3
                });
            }
        })) : wx.showToast({
            title: "填写详细地址!",
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
    onReachBottom: function() {},
    onShareAppMessage: function() {
        return {
            title: a.globalData.shop.nickname,
            path: "/pages/index/index?scene=" + a.globalData.shop_id
        };
    }
});