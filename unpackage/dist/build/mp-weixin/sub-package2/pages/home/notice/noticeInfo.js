require('../../../common/vendor.js');(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package2/pages/home/notice/noticeInfo"],{"045e":function(n,e,t){"use strict";var o=t("e8fd"),u=t.n(o);u.a},"5edd":function(n,e,t){"use strict";(function(n){var e=t("4ea4");t("0fcb"),t("5c17");e(t("66fd"));var o=e(t("f2bd"));wx.__webpack_require_UNI_MP_PLUGIN__=t,n(o.default)}).call(this,t("543d")["createPage"])},6495:function(n,e,t){"use strict";t.r(e);var o=t("84df"),u=t.n(o);for(var a in o)["default"].indexOf(a)<0&&function(n){t.d(e,n,(function(){return o[n]}))}(a);e["default"]=u.a},"84df":function(n,e,t){"use strict";(function(n){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var o={components:{uParse:function(){Promise.all([t.e("sub-package2/common/vendor"),t.e("sub-package2/components/feng-parse/parse")]).then(function(){return resolve(t("e015"))}.bind(null,t)).catch(t.oe)}},data:function(){return{info:{}}},onLoad:function(){this.getInfo()},methods:{getInfo:function(){var e=this;this.$api("notice.noticeInfo",{id:this.$Route.query.id}).then((function(t){console.log("获取通知详情"),200==t.code?e.info=t.data:n.showToast({title:t.msg||"请求出错,稍后重试",icon:"none",duration:500,mask:!0})}))}}};e.default=o}).call(this,t("543d")["default"])},"9ae0":function(n,e,t){"use strict";t.d(e,"b",(function(){return u})),t.d(e,"c",(function(){return a})),t.d(e,"a",(function(){return o}));var o={uNavbar:function(){return t.e("uview-ui/components/u-navbar/u-navbar").then(t.bind(null,"4a31"))},uParse:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-parse/u-parse")]).then(t.bind(null,"b904"))}},u=function(){var n=this.$createElement;this._self._c},a=[]},e8fd:function(n,e,t){},f2bd:function(n,e,t){"use strict";t.r(e);var o=t("9ae0"),u=t("6495");for(var a in u)["default"].indexOf(a)<0&&function(n){t.d(e,n,(function(){return u[n]}))}(a);t("045e");var i=t("f0c5"),c=Object(i["a"])(u["default"],o["b"],o["c"],!1,null,"5de8f03e",null,!1,o["a"],void 0);e["default"]=c.exports}},[["5edd","common/runtime","common/vendor"]]]);