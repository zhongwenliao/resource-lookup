(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package/pages/vis/vis-history"],{913:function(n,e,t){"use strict";(function(n){var e=t(3);t(25),t(26);e(t(24));var i=e(t(914));wx.__webpack_require_UNI_MP_PLUGIN__=t,n(i.default)}).call(this,t(1)["createPage"])},914:function(n,e,t){"use strict";t.r(e);var i=t(915),r=t(917);for(var o in r)["default"].indexOf(o)<0&&function(n){t.d(e,n,(function(){return r[n]}))}(o);t(919),t(921);var u,c=t(38),s=Object(c["default"])(r["default"],i["render"],i["staticRenderFns"],!1,null,null,null,!1,i["components"],u);s.options.__file="sub-package/pages/vis/vis-history.vue",e["default"]=s.exports},915:function(n,e,t){"use strict";t.r(e);var i=t(916);t.d(e,"render",(function(){return i["render"]})),t.d(e,"staticRenderFns",(function(){return i["staticRenderFns"]})),t.d(e,"recyclableRender",(function(){return i["recyclableRender"]})),t.d(e,"components",(function(){return i["components"]}))},916:function(n,e,t){"use strict";var i;t.r(e),t.d(e,"render",(function(){return r})),t.d(e,"staticRenderFns",(function(){return u})),t.d(e,"recyclableRender",(function(){return o})),t.d(e,"components",(function(){return i}));try{i={uniBasePage:function(){return t.e("components/uni-base-page/uni-base-page").then(t.bind(null,972))},uniEmptyPage:function(){return t.e("components/uni-empty-page/uni-empty-page").then(t.bind(null,1352))}}}catch(c){if(-1===c.message.indexOf("Cannot find module")||-1===c.message.indexOf(".vue"))throw c;console.error(c.message),console.error("1. 排查组件名称拼写是否正确"),console.error("2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"),console.error("3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件")}var r=function(){var n=this,e=n.$createElement;n._self._c},o=!1,u=[];r._withStripped=!0},917:function(n,e,t){"use strict";t.r(e);var i=t(918),r=t.n(i);for(var o in i)["default"].indexOf(o)<0&&function(n){t.d(e,n,(function(){return i[n]}))}(o);e["default"]=r.a},918:function(n,e,t){"use strict";(function(n){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var t=1,i={data:function(){return{visRecordList:[]}},computed:{vis:function(){return this.$t("vis")},title:function(){return this.$t("title")}},methods:{getVisRecord:function(){var e=this;console.log("current page---",t),this.$api("equipment.getVisitorHistory",{currPage:t,pageSize:10}).then((function(t){n.stopPullDownRefresh();t.data.list;e.visRecordList=e.visRecordList.concat(t.data.list)}))},editPwdPeriod:function(e){n.navigateTo({url:"edit-pwd-period?pwdObj="+JSON.stringify(e)})}},onShow:function(){t=1,this.visRecordList=[],this.getVisRecord()},onPullDownRefresh:function(){t=1,this.visRecordList=[],this.getVisRecord()},onReachBottom:function(){t++,this.getVisRecord()},onReady:function(){this.$setTitle(this.title["vis-pwd-history"])}};e.default=i}).call(this,t(1)["default"])},919:function(n,e,t){"use strict";t.r(e);var i=t(920),r=t.n(i);for(var o in i)["default"].indexOf(o)<0&&function(n){t.d(e,n,(function(){return i[n]}))}(o);e["default"]=r.a},920:function(n,e,t){},921:function(n,e,t){"use strict";t.r(e);var i=t(922),r=t.n(i);for(var o in i)["default"].indexOf(o)<0&&function(n){t.d(e,n,(function(){return i[n]}))}(o);e["default"]=r.a},922:function(n,e,t){}},[[913,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/sub-package/pages/vis/vis-history.js.map