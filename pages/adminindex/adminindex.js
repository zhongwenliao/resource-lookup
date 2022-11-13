var t = getApp();

Page({
    data: {
        editaddres: !0,
        editaddresdata: [],
        list: [],
        actives: [ {
            name: "待发货",
            active: "active",
            status: 1
        }, {
            name: "全部订单",
            active: "",
            status: "all"
        }, {
            name: "待付款",
            active: "",
            status: 0
        }, {
            name: "待收货",
            active: "",
            status: 2
        }, {
            name: "完成",
            active: "",
            status: 3
        } ],
        pages: 1,
        size: 5,
        status: "1",
        selids: [],
        printtype: "1",
        printff: "1",
        data: "",
        w: 0,
        h: 0,
        array: [ "请选择打印机" ],
        index: 0,
        array2: [ "请选择纸张大小" ],
        index2: 0,
        switch1Checked: !0,
        ifName: !0,
        setw: 0,
        seth: 0,
        printdata: "",
        showprint: !0
    },
    copys: function(t) {
        var a = this.data.list[t.target.dataset.ind];
        wx.setClipboardData({
            data: a.realname + "," + a.mobile + "," + a.address + "," + a.info,
            success: function(t) {
                wx.getClipboardData({
                    success: function(t) {}
                });
            }
        });
    },
    editaddress: function(t) {
        var a = this.data.list[t.target.dataset.ind];
        this.setData({
            editaddres: !1,
            editaddresdata: a
        }), console.log(a);
    },
    inputrealname: function(t) {
        var a = this.data.editaddresdata;
        a.realname = t.detail.value, this.setData({
            editaddresdata: a
        });
    },
    inputaddress: function(t) {
        var a = this.data.editaddresdata;
        a.address = t.detail.value, this.setData({
            editaddresdata: a
        });
    },
    inputmobile: function(t) {
        var a = this.data.editaddresdata;
        a.mobile = t.detail.value, this.setData({
            editaddresdata: a
        });
    },
    inputinfo: function(t) {
        var a = this.data.editaddresdata;
        a.info = t.detail.value, this.setData({
            editaddresdata: a
        });
    },
    editno: function() {
        this.setData({
            editaddres: !0,
            editaddresdata: []
        });
    },
    editok: function() {
        var a = this.data.editaddresdata, e = this;
        wx.showLoading({
            title: "数据提交...",
            mask: !0
        }), wx.request({
            url: t.globalData.host + "/api/User/editaddress",
            data: {
                realname: a.realname,
                mobile: a.mobile,
                address: a.address,
                id: a.id,
                info: a.info
            },
            success: function(t) {
                1 == t.data.code ? (wx.showToast({
                    title: "操作成功!",
                    icon: "success",
                    mask: !0,
                    duration: 2e3
                }), e.setData({
                    editaddres: !0,
                    editaddresdata: [],
                    list: [],
                    actives: [ {
                        name: "待发货",
                        active: "active",
                        status: 1
                    }, {
                        name: "全部订单",
                        active: "",
                        status: "all"
                    }, {
                        name: "待付款",
                        active: "",
                        status: 0
                    }, {
                        name: "待收货",
                        active: "",
                        status: 2
                    }, {
                        name: "完成",
                        active: "",
                        status: 3
                    } ],
                    pages: 1,
                    size: 5,
                    status: "1"
                }), e.onLoad()) : wx.showToast({
                    title: "操作失败!",
                    icon: "loading",
                    mask: !0,
                    duration: 2e3
                });
            }
        });
    },
    onLoad: function(a) {
        this.getdata(this.data.pages, this.data.size, this.data.status), wx.request({
            url: t.globalData.host + "/printll/Index/setprintlogin",
            data: {
                uid: t.globalData.admin.id
            },
            success: function(t) {
                console.log(t);
            }
        }), this.setlogin();
    },
    bindPickerChange1: function(t) {
        var a = parseInt(t.detail.value), e = this.data.printdata, s = [].concat(e[a].printt);
        this.setData({
            index: a,
            array2: s,
            index2: 0
        });
    },
    bindPickerChange2: function(t) {
        var a = parseInt(t.detail.value);
        this.setData({
            index2: a
        });
    },
    setlogin: function() {
        var a = this;
        wx.request({
            url: t.globalData.host + "/printll/Index/setprintlogin2",
            data: {
                uid: t.globalData.admin.id
            },
            success: function(t) {
                console.log(t);
            }
        }), setTimeout(function() {
            a.setlogin();
        }, 18e3);
    },
    getdata: function(a, e, s) {
        var i = this;
        wx.request({
            url: t.globalData.host + "/api/Adminindex/getadminorder",
            data: {
                admin_id: t.globalData.admin.id,
                status: s,
                p: a,
                z: e
            },
            success: function(t) {
                if (1 == t.data.code) {
                    var e = i.data.list.concat(t.data.data);
                    i.setData({
                        list: e,
                        pages: a + 1
                    });
                }
                wx.stopPullDownRefresh();
            }
        });
    },
    printrorder: function(t) {
        wx.navigateTo({
            url: "/pages/printorder/printorder?order_id=" + t.target.dataset.order_id
        });
    },
    delrorder: function(a) {
        var e = this;
        wx.showModal({
            title: "提示",
            content: "确认需要删除订单？",
            success: function(s) {
                s.confirm ? wx.request({
                    url: t.globalData.host + "/api/Adminindex/delorder",
                    data: {
                        orderid: a.target.dataset.order_id
                    },
                    success: function(t) {
                        1 == t.data.code ? (wx.showToast({
                            title: "操作成功!",
                            icon: "success",
                            mask: !0,
                            duration: 2e3
                        }), e.setData({
                            list: [],
                            actives: [ {
                                name: "待发货",
                                active: "active",
                                status: 1
                            }, {
                                name: "全部订单",
                                active: "",
                                status: "all"
                            }, {
                                name: "待付款",
                                active: "",
                                status: 0
                            }, {
                                name: "待收货",
                                active: "",
                                status: 2
                            }, {
                                name: "完成",
                                active: "",
                                status: 3
                            } ],
                            pages: 1,
                            size: 5,
                            status: "1"
                        }), e.onLoad()) : wx.showToast({
                            title: "操作失败!",
                            icon: "loading",
                            mask: !0,
                            duration: 2e3
                        });
                    }
                }) : s.cancel && console.log("用户点击取消");
            }
        });
    },
    sendorder: function(a) {
        var e = this;
        wx.showModal({
            title: "提示",
            content: "确认已经发货？",
            success: function(s) {
                s.confirm && wx.request({
                    url: t.globalData.host + "/api/Adminindex/sendorder",
                    data: {
                        orderid: a.target.dataset.order_id
                    },
                    success: function(t) {
                        1 == t.data.code ? (wx.showToast({
                            title: "操作成功!",
                            icon: "success",
                            mask: !0,
                            duration: 2e3
                        }), e.setData({
                            list: [],
                            actives: [ {
                                name: "待发货",
                                active: "active",
                                status: 1
                            }, {
                                name: "全部订单",
                                active: "",
                                status: "all"
                            }, {
                                name: "待付款",
                                active: "",
                                status: 0
                            }, {
                                name: "待收货",
                                active: "",
                                status: 2
                            }, {
                                name: "完成",
                                active: "",
                                status: 3
                            } ],
                            pages: 1,
                            size: 5,
                            status: "1"
                        }), e.onLoad()) : wx.showToast({
                            title: "操作失败!",
                            icon: "loading",
                            mask: !0,
                            duration: 2e3
                        });
                    }
                });
            }
        });
    },
    yueyue: function() {
        wx.reLaunch({
            url: "/pages/index/index"
        });
    },
    showmore: function(t) {
        var a = this.data.list;
        a[t.currentTarget.dataset.ind].moreshow = !a[t.currentTarget.dataset.ind].moreshow, 
        this.setData({
            list: a
        });
    },
    seletab: function(t) {
        for (var a = this.data.actives, e = 0; e < a.length; e++) a[e].active = "";
        a[t.target.dataset.ind].active = "active", this.setData({
            actives: a,
            list: [],
            pages: 1,
            status: t.target.dataset.status
        }), this.getdata(1, this.data.size, t.target.dataset.status);
    },
    sureshou: function(a) {
        wx.showLoading({
            title: "订单确认中...",
            mask: !0
        });
        var e = this, s = this.data.list;
        s[a.target.dataset.ind].status = 3, wx.request({
            url: t.globalData.host + "/api/User/sureshou",
            data: {
                ids: a.target.dataset.ids
            },
            success: function(t) {
                1 == t.data.code ? (wx.showToast({
                    title: "操作成功!",
                    icon: "success",
                    mask: !0,
                    duration: 2e3
                }), e.setData({
                    list: s
                })) : wx.showToast({
                    title: "操作失败!",
                    icon: "loading",
                    mask: !0,
                    duration: 2e3
                });
            }
        });
    },
    surepay: function(a) {
        console.log(a.target.dataset.number), wx.showLoading({
            title: "链接中...",
            mask: !0
        }), wx.request({
            url: t.globalData.host + "/api/User/surepay",
            method: "POST",
            data: {
                order: a.target.dataset.number
            },
            success: function(t) {
                1 == t.data.code ? wx.requestPayment({
                    timeStamp: t.data.data.timeStamp,
                    nonceStr: t.data.data.nonceStr,
                    package: "prepay_id=" + t.data.data.prepay_id,
                    signType: "MD5",
                    paySign: t.data.data.paySign,
                    success: function(t) {
                        wx.navigateBack({});
                    },
                    fail: function(t) {
                        wx.showToast({
                            title: "付款失败!",
                            icon: "loading",
                            mask: !0,
                            duration: 2e3
                        });
                    }
                }) : wx.showToast({
                    title: "付款失败!",
                    icon: "loading",
                    mask: !0,
                    duration: 2e3
                });
            }
        });
    },
    delorder: function(a) {
        var e = this;
        wx.showLoading({
            title: "链接中...",
            mask: !0
        }), wx.request({
            url: t.globalData.host + "/api/User/delorder",
            method: "POST",
            data: {
                order: a.target.dataset.number
            },
            success: function(t) {
                1 == t.data.code ? (wx.showToast({
                    title: "删除成功!",
                    icon: "success",
                    mask: !0,
                    duration: 2e3
                }), setTimeout(function() {
                    e.setData({
                        actives: [ {
                            name: "全部订单",
                            active: "active",
                            status: "all"
                        }, {
                            name: "待付款",
                            active: "",
                            status: 0
                        }, {
                            name: "待发货",
                            active: "",
                            status: 1
                        }, {
                            name: "待收货",
                            active: "",
                            status: 2
                        }, {
                            name: "完成",
                            active: "",
                            status: 3
                        } ]
                    }), e.onLoad();
                }, 2e3)) : wx.showToast({
                    title: "删除失败!",
                    icon: "loading",
                    mask: !0,
                    duration: 2e3
                });
            }
        });
    },
    previmg: function(t) {
        wx.previewImage({
            current: t.currentTarget.dataset.img,
            urls: [ t.currentTarget.dataset.img ]
        });
    },
    checkboxChange: function(t) {
        this.setData({
            selids: t.detail.value
        });
    },
    sendall: function() {
        var a = this.data.selids, e = this;
        if (0 != a.length) {
            for (var s = "", i = 0; i < a.length; i++) s += a[i] + ",";
            wx.showModal({
                title: "提示",
                content: "确定批量发货？",
                success: function(a) {
                    a.confirm ? wx.request({
                        url: t.globalData.host + "/api/Adminindex/sendall",
                        data: {
                            ids: s
                        },
                        success: function(t) {
                            1 == t.data.code ? (wx.showToast({
                                title: "操作成功!",
                                icon: "success",
                                mask: !0,
                                duration: 2e3
                            }), e.setData({
                                list: [],
                                actives: [ {
                                    name: "待发货",
                                    active: "active",
                                    status: 1
                                }, {
                                    name: "全部订单",
                                    active: "",
                                    status: "all"
                                }, {
                                    name: "待付款",
                                    active: "",
                                    status: 0
                                }, {
                                    name: "待收货",
                                    active: "",
                                    status: 2
                                }, {
                                    name: "完成",
                                    active: "",
                                    status: 3
                                } ],
                                pages: 1,
                                size: 5,
                                status: "1"
                            }), e.onLoad()) : wx.showToast({
                                title: "操作失败!",
                                icon: "loading",
                                mask: !0,
                                duration: 2e3
                            });
                        }
                    }) : a.cancel && console.log("用户点击取消");
                }
            });
        } else wx.showToast({
            title: "请选择操作数据!",
            icon: "loading",
            mask: !0,
            duration: 2e3
        });
    },
    delall: function() {
        var a = this.data.selids, e = this;
        if (0 != a.length) {
            for (var s = "", i = 0; i < a.length; i++) s += a[i] + ",";
            wx.showModal({
                title: "提示",
                content: "确定批量删除？",
                success: function(a) {
                    a.confirm ? wx.request({
                        url: t.globalData.host + "/api/Adminindex/delall",
                        data: {
                            ids: s
                        },
                        success: function(t) {
                            1 == t.data.code ? (wx.showToast({
                                title: "操作成功!",
                                icon: "success",
                                mask: !0,
                                duration: 2e3
                            }), e.setData({
                                list: [],
                                actives: [ {
                                    name: "待发货",
                                    active: "active",
                                    status: 1
                                }, {
                                    name: "全部订单",
                                    active: "",
                                    status: "all"
                                }, {
                                    name: "待付款",
                                    active: "",
                                    status: 0
                                }, {
                                    name: "待收货",
                                    active: "",
                                    status: 2
                                }, {
                                    name: "完成",
                                    active: "",
                                    status: 3
                                } ],
                                pages: 1,
                                size: 5,
                                status: "1"
                            }), e.onLoad()) : wx.showToast({
                                title: "操作失败!",
                                icon: "loading",
                                mask: !0,
                                duration: 2e3
                            });
                        }
                    }) : a.cancel && console.log("用户点击取消");
                }
            });
        } else wx.showToast({
            title: "请选择操作数据!",
            icon: "loading",
            mask: !0,
            duration: 2e3
        });
    },
    sureprint: function() {
        var a = this.data.selids, e = this;
        if (0 != a.length) {
            for (var s = "", i = 0; i < a.length; i++) s += a[i] + ",";
            wx.showLoading({
                title: "打印上传中",
                mask: !0
            }), wx.request({
                url: t.globalData.host + "/api/Adminindex/thrprint",
                data: {
                    ids: s,
                    uid: t.globalData.admin.id
                },
                success: function(a) {
                    if (console.log(a), a.data.code.length > 0) {
                        for (var s = [], i = 0; i < a.data.code.length; i++) {
                            var n = {
                                printtype: e.data.printtype,
                                printff: e.data.printff,
                                w: a.data.code[i].w,
                                h: a.data.code[i].h,
                                info: "0",
                                data: JSON.stringify({
                                    w: a.data.code[i].w,
                                    h: a.data.code[i].h,
                                    zimage: a.data.code[i].img,
                                    mimage: "",
                                    models: a.data.code[i].models
                                }),
                                dyj: e.data.array[e.data.index],
                                zzdx: e.data.array2[e.data.index2],
                                admin_id: t.globalData.admin.id,
                                order_id: a.data.code[i].order_id,
                                op_val: e.data.index2,
                                printname_val: e.data.index,
                                title: a.data.code[i].models + " " + a.data.code[i].spec
                            };
                            s.push(n);
                        }
                        wx.request({
                            url: t.globalData.host + "/api/Adminindex/addallprint",
                            method: "POST",
                            data: {
                                list: JSON.stringify(s)
                            },
                            success: function(t) {
                                1 == t.data.code ? (wx.showToast({
                                    title: t.data.msg,
                                    icon: "success",
                                    mask: !0,
                                    duration: 2e3
                                }), e.setData({
                                    list: [],
                                    actives: [ {
                                        name: "待发货",
                                        active: "active",
                                        status: 1
                                    }, {
                                        name: "全部订单",
                                        active: "",
                                        status: "all"
                                    }, {
                                        name: "待付款",
                                        active: "",
                                        status: 0
                                    }, {
                                        name: "待收货",
                                        active: "",
                                        status: 2
                                    }, {
                                        name: "完成",
                                        active: "",
                                        status: 3
                                    } ],
                                    pages: 1,
                                    size: 5,
                                    status: "1",
                                    showprint: !0
                                }), e.onLoad()) : wx.showToast({
                                    title: t.data.msg,
                                    icon: "loading",
                                    mask: !0,
                                    duration: 2e3
                                });
                            }
                        });
                    } else wx.showToast({
                        title: "上传失败",
                        icon: "loading",
                        mask: !0,
                        duration: 2e3
                    });
                }
            });
        } else wx.showToast({
            title: "请选择操作数据!",
            icon: "loading",
            mask: !0,
            duration: 2e3
        });
    },
    notprint: function() {
        this.setData({
            showprint: !0
        });
    },
    printall: function() {
        if (0 != this.data.selids.length) {
            var a = this;
            wx.request({
                url: t.globalData.host + "/api/Adminindex/getpringtlist2",
                data: {
                    admin_id: t.globalData.admin.id
                },
                success: function(t) {
                    if (0 != t.data.code) {
                        for (var e = [], s = [], i = JSON.parse(t.data.data), n = 0; n < i.length; n++) e.push(i[n].text);
                        var d = s.concat(i[t.data.code.dyj].printt);
                        a.setData({
                            array: e,
                            printdata: i,
                            printtype: "1",
                            array2: d,
                            index: t.data.code.dyj,
                            index2: t.data.code.zzdx,
                            printff: t.data.code.printff,
                            showprint: !1
                        });
                    } else wx.showToast({
                        title: t.data.msg,
                        icon: "loading",
                        mask: !0,
                        duration: 2e3
                    });
                }
            });
        } else wx.showToast({
            title: "请选择操作数据!",
            icon: "loading",
            mask: !0,
            duration: 2e3
        });
    },
    printff: function(t) {
        t.target.dataset.ind, this.setData({
            printff: t.target.dataset.ind
        });
    },
    lookkd: function(t) {
        wx.navigateTo({
            url: "/pages/lookkd/lookkd?logistics=" + t.target.dataset.logistics + "&num=" + t.target.dataset.num
        });
    },
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {
        this.setData({
            list: [],
            actives: [ {
                name: "待发货",
                active: "active",
                status: 1
            }, {
                name: "全部订单",
                active: "",
                status: "all"
            }, {
                name: "待付款",
                active: "",
                status: 0
            }, {
                name: "待收货",
                active: "",
                status: 2
            }, {
                name: "完成",
                active: "",
                status: 3
            } ],
            pages: 1,
            size: 5,
            status: "1"
        }), this.onLoad();
    },
    onReachBottom: function() {
        this.getdata(this.data.pages, this.data.size, this.data.status);
    }
});