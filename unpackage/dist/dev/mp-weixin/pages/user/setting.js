(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/user/setting"],{212:function(n,e,t){"use strict";(function(n,e){var o=t(4);t(26),t(27);o(t(25));var u=o(t(213));n.__webpack_require_UNI_MP_PLUGIN__=t,e(u.default)}).call(this,t(1)["default"],t(2)["createPage"])},213:function(n,e,t){"use strict";t.r(e);var o=t(214),u=t(216);for(var r in u)["default"].indexOf(r)<0&&function(n){t.d(e,n,(function(){return u[n]}))}(r);t(218),t(220);var i,c=t(39),l=Object(c["default"])(u["default"],o["render"],o["staticRenderFns"],!1,null,"52e26b05",null,!1,o["components"],i);l.options.__file="pages/user/setting.vue",e["default"]=l.exports},214:function(n,e,t){"use strict";t.r(e);var o=t(215);t.d(e,"render",(function(){return o["render"]})),t.d(e,"staticRenderFns",(function(){return o["staticRenderFns"]})),t.d(e,"recyclableRender",(function(){return o["recyclableRender"]})),t.d(e,"components",(function(){return o["components"]}))},215:function(n,e,t){"use strict";var o;t.r(e),t.d(e,"render",(function(){return u})),t.d(e,"staticRenderFns",(function(){return i})),t.d(e,"recyclableRender",(function(){return r})),t.d(e,"components",(function(){return o}));try{o={uNavbar:function(){return t.e("uview-ui/components/u-navbar/u-navbar").then(t.bind(null,980))},uModal:function(){return t.e("uview-ui/components/u-modal/u-modal").then(t.bind(null,1138))},uCellGroup:function(){return t.e("uview-ui/components/u-cell-group/u-cell-group").then(t.bind(null,1029))},uCellItem:function(){return t.e("uview-ui/components/u-cell-item/u-cell-item").then(t.bind(null,1036))},uGap:function(){return t.e("uview-ui/components/u-gap/u-gap").then(t.bind(null,1043))}}}catch(c){if(-1===c.message.indexOf("Cannot find module")||-1===c.message.indexOf(".vue"))throw c;console.error(c.message),console.error("1. 排查组件名称拼写是否正确"),console.error("2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"),console.error("3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件")}var u=function(){var n=this,e=n.$createElement;n._self._c;n._isMounted||(n.e0=function(e){n.show=!0},n.e1=function(e){n.showExitLogin=!0})},r=!1,i=[];u._withStripped=!0},216:function(n,e,t){"use strict";t.r(e);var o=t(217),u=t.n(o);for(var r in o)["default"].indexOf(r)<0&&function(n){t.d(e,n,(function(){return o[n]}))}(r);e["default"]=u.a},217:function(n,e,t){"use strict";(function(n){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var t={data:function(){return{show:!1,page:0,showExitLogin:!1,exitLoginStyle:{width:"100%"},cellTitle:{fontSize:"30upx",letterSpacing:"2upx"}}},methods:{logOut:function(){var e=this;n.showModal({title:"账号注销",content:"账号注销后将对您的账号停止服务",cancelText:"取消",confirmText:"确定",success:function(n){if(n.confirm){console.log("用户点击确定");var t={type:1};e.$api("user.destroy",t).then((function(n){200==n.code&&e.$Router.push({path:"/pages/login/login"})}))}else n.cancel&&console.log("用户点击取消")}})},clearStorage:function(){n.clearStorageSync(),console.log("用户点击确定"),this.show=!1,this.$Router.replaceAll({path:"/pages/login/login"})},exitLogin:function(){var e=this;n.removeStorageSync("fromLogin"),this.$api("user.logout").then((function(n){console.log(n,"注销登录"),e.$store.commit("OUT_LOGIN"),e.$Router.replaceAll({path:"/pages/login/login"})})).catch((function(n){console.log(n)}))},goAccount:function(){this.$Router.push({path:"/pages/user/account"})}}};e.default=t}).call(this,t(2)["default"])},218:function(n,e,t){"use strict";t.r(e);var o=t(219),u=t.n(o);for(var r in o)["default"].indexOf(r)<0&&function(n){t.d(e,n,(function(){return o[n]}))}(r);e["default"]=u.a},219:function(n,e,t){},220:function(n,e,t){"use strict";t.r(e);var o=t(221),u=t.n(o);for(var r in o)["default"].indexOf(r)<0&&function(n){t.d(e,n,(function(){return o[n]}))}(r);e["default"]=u.a},221:function(n,e,t){}},[[212,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/setting.js.map