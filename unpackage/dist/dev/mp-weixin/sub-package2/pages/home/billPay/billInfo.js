require('../../../common/vendor.js');(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package2/pages/home/billPay/billInfo"],{619:function(n,e,t){"use strict";(function(n,e){var o=t(4);t(26),t(27);o(t(25));var i=o(t(620));n.__webpack_require_UNI_MP_PLUGIN__=t,e(i.default)}).call(this,t(1)["default"],t(2)["createPage"])},620:function(n,e,t){"use strict";t.r(e);var o=t(621),i=t(623);for(var r in i)["default"].indexOf(r)<0&&function(n){t.d(e,n,(function(){return i[n]}))}(r);t(625),t(627);var l,a=t(39),c=Object(a["default"])(i["default"],o["render"],o["staticRenderFns"],!1,null,"30258cc0",null,!1,o["components"],l);c.options.__file="sub-package2/pages/home/billPay/billInfo.vue",e["default"]=c.exports},621:function(n,e,t){"use strict";t.r(e);var o=t(622);t.d(e,"render",(function(){return o["render"]})),t.d(e,"staticRenderFns",(function(){return o["staticRenderFns"]})),t.d(e,"recyclableRender",(function(){return o["recyclableRender"]})),t.d(e,"components",(function(){return o["components"]}))},622:function(n,e,t){"use strict";var o;t.r(e),t.d(e,"render",(function(){return i})),t.d(e,"staticRenderFns",(function(){return l})),t.d(e,"recyclableRender",(function(){return r})),t.d(e,"components",(function(){return o}));try{o={uNavbar:function(){return t.e("uview-ui/components/u-navbar/u-navbar").then(t.bind(null,980))},uIcon:function(){return t.e("uview-ui/components/u-icon/u-icon").then(t.bind(null,987))}}}catch(a){if(-1===a.message.indexOf("Cannot find module")||-1===a.message.indexOf(".vue"))throw a;console.error(a.message),console.error("1. 排查组件名称拼写是否正确"),console.error("2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"),console.error("3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件")}var i=function(){var n=this,e=n.$createElement,t=(n._self._c,void 0!=n.billInfo.remark&&n.billInfo.remark.length>0);n.$mp.data=Object.assign({},{$root:{g0:t}})},r=!1,l=[];i._withStripped=!0},623:function(n,e,t){"use strict";t.r(e);var o=t(624),i=t.n(o);for(var r in o)["default"].indexOf(r)<0&&function(n){t.d(e,n,(function(){return o[n]}))}(r);e["default"]=i.a},624:function(n,e,t){"use strict";(function(n){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var t={data:function(){return{billInfo:{}}},onLoad:function(){this.getInfo()},methods:{goDetails:function(){this.$Router.push({path:"/sub-package2/pages/home/billPay/billDetails",query:this.billInfo})},getInfo:function(){var e=this;this.$api("billPay.billPreview",{id:this.$Route.query.id}).then((function(t){200==t.code&&(t.data.month=e.$Route.query.month,e.billInfo=t.data,e.billInfo.monthlyWaterBill=e.billInfo.hydropowerDetails.reduce((function(n,e){return n+e.detailsList1.reduce((function(n,e){return n+(e.readNow-e.readBefore)*e.magnification}),0)}),0),e.billInfo.basicWaterFeeAll=Math.round(e.billInfo.fwHtContractInfo.basicWaterFee*e.billInfo.monthlyWaterBill*100)/100,e.billInfo.comprehensiveWaterFeeAll=Math.round(e.billInfo.fwHtContractInfo.comprehensiveWaterFee*e.billInfo.monthlyWaterBill*100)/100,e.billInfo.monthlyElectricityBill=e.billInfo.hydropowerDetails.reduce((function(n,e){return n+e.detailsList0.reduce((function(n,e){return n+(e.readNow-e.readBefore)*e.magnification}),0)}),0),e.billInfo.basicElectricityPriceAll=Math.round(e.billInfo.fwHtContractInfo.basicElectricityPrice*e.billInfo.monthlyElectricityBill*100)/100,e.billInfo.comprehensiveElectricityPriceAll=Math.round(e.billInfo.fwHtContractInfo.comprehensiveElectricityPrice*e.billInfo.monthlyElectricityBill*100)/100,n.showToast({title:t.msg||"请求出错,稍后重试",icon:"none",duration:500,mask:!0}))}))},goPay:function(){this.$Router.push({path:"/sub-package2/pages/home/billPay/pay"})}}};e.default=t}).call(this,t(2)["default"])},625:function(n,e,t){"use strict";t.r(e);var o=t(626),i=t.n(o);for(var r in o)["default"].indexOf(r)<0&&function(n){t.d(e,n,(function(){return o[n]}))}(r);e["default"]=i.a},626:function(n,e,t){},627:function(n,e,t){"use strict";t.r(e);var o=t(628),i=t.n(o);for(var r in o)["default"].indexOf(r)<0&&function(n){t.d(e,n,(function(){return o[n]}))}(r);e["default"]=i.a},628:function(n,e,t){}},[[619,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/sub-package2/pages/home/billPay/billInfo.js.map