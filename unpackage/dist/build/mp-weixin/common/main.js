(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["common/main"],{"18f3":function(e,t,n){"use strict";n.r(t);var o=n("1eb4"),r=n.n(o);for(var u in o)["default"].indexOf(u)<0&&function(e){n.d(t,e,(function(){return o[e]}))}(u);t["default"]=r.a},"1eb4":function(e,t,n){"use strict";(function(e){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n={onLaunch:function(){e.getStorageSync("location")||e.setStorageSync("location",{city:"深圳市",province:"广东省"}),console.log("App Launch")},onShow:function(){console.log("App Show")},onHide:function(){console.log("App Hide")}};t.default=n}).call(this,n("543d")["default"])},"3e1b":function(e,t,n){"use strict";var o=n("468b"),r=n.n(o);r.a},"468b":function(e,t,n){},"4cee":function(e,t,n){"use strict";(function(e,t){var o=n("4ea4"),r=o(n("9523")),u=o(n("7037"));n("0fcb"),n("5c17");var a=o(n("66fd")),c=o(n("502f")),i=(o(n("0a80")),o(n("c3cd"))),f=o(n("7f13")),l=o(n("d3b2")),p=o(n("57a1")),d=(o(n("a68e")),o(n("fe6e"))),s=(n("059a"),o(n("f025"))),b=n("97a0");function v(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}wx.__webpack_require_UNI_MP_PLUGIN__=n;a.default.component("uni-base-page",(function(){n.e("components/uni-base-page/uni-base-page").then(function(){return resolve(n("10e9"))}.bind(null,n)).catch(n.oe)})),a.default.component("page",(function(){n.e("components/page").then(function(){return resolve(n("0dc4"))}.bind(null,n)).catch(n.oe)})),a.default.prototype.$store=i.default,a.default.prototype.$api=s.default,a.default.prototype.$enum=p.default,a.default.prototype.$tools=f.default,a.default.prototype._i18n=d.default,a.default.prototype.blueToothOpenDoor=b.blueToothOpenDoor,a.default.prototype.blueToothScanDevice=b.blueToothScanDevice,a.default.config.productionTip=!1,c.default.mpType="app",a.default.use(l.default);a.default.prototype.enumFilter=function(e,t,n){var o;if(void 0===t||null===t||""===t)return"";if("object"===(0,u.default)(e[0])&&e[0].hasOwnProperty("value")&&e[0].hasOwnProperty("label"))return o=e.filter((function(e){return n?n(e):e.value==t})),o[0];throw"非enum数据不可使用该原型方法"},a.default.prototype.$permission=function(t){var n=e.getStorageSync("userInfo").authority||["admin"];if(t&&t.length>0){var o=t,r=n.some((function(e){return o.includes(e)}));return r}throw new Error("need roles! Like v-if=\"$permission(['admin','ceshi'])\"")},a.default.prototype.preAvatar=function(e){wx.previewImage({current:"",urls:[e]})};var y=new a.default(function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?v(Object(n),!0).forEach((function(t){(0,r.default)(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):v(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}({store:i.default},c.default));t(y).$mount()}).call(this,n("543d")["default"],n("543d")["createApp"])},"502f":function(e,t,n){"use strict";n.r(t);var o=n("18f3");for(var r in o)["default"].indexOf(r)<0&&function(e){n.d(t,e,(function(){return o[e]}))}(r);n("3e1b");var u=n("f0c5"),a=Object(u["a"])(o["default"],void 0,void 0,!1,null,null,null,!1,void 0,void 0);t["default"]=a.exports}},[["4cee","common/runtime","common/vendor"]]]);