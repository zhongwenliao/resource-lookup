(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/home/employeeManagement/index"],{290:function(e,n,t){"use strict";(function(e){var n=t(3);t(25),t(26);n(t(24));var o=n(t(291));wx.__webpack_require_UNI_MP_PLUGIN__=t,e(o.default)}).call(this,t(1)["createPage"])},291:function(e,n,t){"use strict";t.r(n);var o=t(292),r=t(294);for(var a in r)["default"].indexOf(a)<0&&function(e){t.d(n,e,(function(){return r[e]}))}(a);t(296);var i,u=t(38),c=Object(u["default"])(r["default"],o["render"],o["staticRenderFns"],!1,null,"32ceab4a",null,!1,o["components"],i);c.options.__file="pages/home/employeeManagement/index.vue",n["default"]=c.exports},292:function(e,n,t){"use strict";t.r(n);var o=t(293);t.d(n,"render",(function(){return o["render"]})),t.d(n,"staticRenderFns",(function(){return o["staticRenderFns"]})),t.d(n,"recyclableRender",(function(){return o["recyclableRender"]})),t.d(n,"components",(function(){return o["components"]}))},293:function(e,n,t){"use strict";var o;t.r(n),t.d(n,"render",(function(){return r})),t.d(n,"staticRenderFns",(function(){return i})),t.d(n,"recyclableRender",(function(){return a})),t.d(n,"components",(function(){return o}));try{o={zPaging:function(){return Promise.all([t.e("common/vendor"),t.e("uni_modules/z-paging/components/z-paging/z-paging")]).then(t.bind(null,1144))},uNavbar:function(){return t.e("uview-ui/components/u-navbar/u-navbar").then(t.bind(null,979))},uImage:function(){return t.e("uview-ui/components/u-image/u-image").then(t.bind(null,1049))},uLoading:function(){return t.e("uview-ui/components/u-loading/u-loading").then(t.bind(null,1201))},uCellGroup:function(){return t.e("uview-ui/components/u-cell-group/u-cell-group").then(t.bind(null,1028))},uCellItem:function(){return t.e("uview-ui/components/u-cell-item/u-cell-item").then(t.bind(null,1035))}}}catch(u){if(-1===u.message.indexOf("Cannot find module")||-1===u.message.indexOf(".vue"))throw u;console.error(u.message),console.error("1. 排查组件名称拼写是否正确"),console.error("2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"),console.error("3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件")}var r=function(){var e=this,n=e.$createElement;e._self._c},a=!1,i=[];r._withStripped=!0},294:function(e,n,t){"use strict";t.r(n);var o=t(295),r=t.n(o);for(var a in o)["default"].indexOf(a)<0&&function(e){t.d(n,e,(function(){return o[e]}))}(a);n["default"]=r.a},295:function(e,n,t){"use strict";(function(e){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var t={data:function(){return{zoneId:e.getStorageSync("zoneInfo").zoneId,bannerImage:e.getStorageSync("zoneInfo").logo,enterpriseId:e.getStorageSync("userInfo").enterpriseId,companyName:e.getStorageSync("userInfo").companyName,corporateLogo:"",topBackground:{backgroundImage:"url(../../../static/home/employeeManagement/beijintu.png)",backgroundSize:"100% 100%",backgroundRepeat:"no-repeat"},navbarBackground:{backgroundColor:""},dataList:[],titleStyle:{fontSize:"36upx",fontWeight:"bold",color:"#333333"},contentStyle:{textAlign:"center",margin:"30upx"},departName:""}},onShow:function(){var e=this;this.$nextTick((function(){e.$refs.paging.reload()}))},onLoad:function(){this.getContractInfo()},methods:{getContractInfo:function(){var e=this,n=this,t={enterpriseId:n.enterpriseId};n.$api("contract.getAllContractList",t).then((function(n){200==n.code&&(n.data.length>0?e.corporateLogo=n.data[0].enterpriseInfo.corporateLogo:e.corporateLogo="")})).catch((function(e){}))},getInfo:function(e,n){var t=this,o={ascs:"id",currPage:e,pageSize:n,enterpriseId:t.enterpriseId,zoneId:t.zoneId};t.$api("employeeManagement.departmentList",o).then((function(n){200==n.code?(1==e&&n.data.list.length>0&&(n.data.list[0].avaer="../../../static/home/employeeManagement/woren.png",n.data.list[1].avaer="../../../static/home/employeeManagement/woren.png"),t.$refs.paging.complete(n.data.list)):t.$refs.paging.complete(!1)})).catch((function(e){t.$refs.paging.complete(!1)}))},toStaffList:function(e){this.$Router.push({path:"/pages/home/employeeManagement/personnelList",query:e})},addDepartment:function(){this.$Router.push({path:"/pages/home/employeeManagement/departmentDetails"})},addStaff:function(){this.$Router.push({path:"/pages/home/employeeManagement/newStaff"})}}};n.default=t}).call(this,t(1)["default"])},296:function(e,n,t){"use strict";t.r(n);var o=t(297),r=t.n(o);for(var a in o)["default"].indexOf(a)<0&&function(e){t.d(n,e,(function(){return o[e]}))}(a);n["default"]=r.a},297:function(e,n,t){}},[[290,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/home/employeeManagement/index.js.map