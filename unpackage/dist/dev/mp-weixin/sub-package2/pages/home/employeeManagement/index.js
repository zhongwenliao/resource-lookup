require('../../../common/vendor.js');(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package2/pages/home/employeeManagement/index"],{395:function(e,n,t){"use strict";(function(e,n){var o=t(4);t(26),t(27);o(t(25));var a=o(t(396));e.__webpack_require_UNI_MP_PLUGIN__=t,n(a.default)}).call(this,t(1)["default"],t(2)["createPage"])},396:function(e,n,t){"use strict";t.r(n);var o=t(397),a=t(399);for(var r in a)["default"].indexOf(r)<0&&function(e){t.d(n,e,(function(){return a[e]}))}(r);t(401);var u,i=t(39),c=Object(i["default"])(a["default"],o["render"],o["staticRenderFns"],!1,null,"46dac991",null,!1,o["components"],u);c.options.__file="sub-package2/pages/home/employeeManagement/index.vue",n["default"]=c.exports},397:function(e,n,t){"use strict";t.r(n);var o=t(398);t.d(n,"render",(function(){return o["render"]})),t.d(n,"staticRenderFns",(function(){return o["staticRenderFns"]})),t.d(n,"recyclableRender",(function(){return o["recyclableRender"]})),t.d(n,"components",(function(){return o["components"]}))},398:function(e,n,t){"use strict";var o;t.r(n),t.d(n,"render",(function(){return a})),t.d(n,"staticRenderFns",(function(){return u})),t.d(n,"recyclableRender",(function(){return r})),t.d(n,"components",(function(){return o}));try{o={zPaging:function(){return Promise.all([t.e("common/vendor"),t.e("uni_modules/z-paging/components/z-paging/z-paging")]).then(t.bind(null,1138))},uNavbar:function(){return t.e("uview-ui/components/u-navbar/u-navbar").then(t.bind(null,973))},uImage:function(){return t.e("uview-ui/components/u-image/u-image").then(t.bind(null,1043))},uLoading:function(){return t.e("uview-ui/components/u-loading/u-loading").then(t.bind(null,1195))},uCellGroup:function(){return t.e("uview-ui/components/u-cell-group/u-cell-group").then(t.bind(null,1022))},uCellItem:function(){return t.e("uview-ui/components/u-cell-item/u-cell-item").then(t.bind(null,1029))}}}catch(i){if(-1===i.message.indexOf("Cannot find module")||-1===i.message.indexOf(".vue"))throw i;console.error(i.message),console.error("1. 排查组件名称拼写是否正确"),console.error("2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"),console.error("3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件")}var a=function(){var e=this,n=e.$createElement;e._self._c},r=!1,u=[];a._withStripped=!0},399:function(e,n,t){"use strict";t.r(n);var o=t(400),a=t.n(o);for(var r in o)["default"].indexOf(r)<0&&function(e){t.d(n,e,(function(){return o[e]}))}(r);n["default"]=a.a},400:function(e,n,t){"use strict";(function(e){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var t={data:function(){return{zoneId:e.getStorageSync("zoneInfo").zoneId,bannerImage:e.getStorageSync("zoneInfo").logo,enterpriseId:e.getStorageSync("userInfo").enterpriseId,companyName:e.getStorageSync("userInfo").companyName,corporateLogo:"",topBackground:{backgroundImage:"url(https://file.yuanzhoulvwego.com/prod/uploadFiles/home/employeeManagement/beijintu.png)",backgroundSize:"100% 100%",backgroundRepeat:"no-repeat"},navbarBackground:{backgroundColor:""},dataList:[],titleStyle:{fontSize:"36upx",fontWeight:"bold",color:"#333333"},contentStyle:{textAlign:"center",margin:"30upx"},departName:""}},onShow:function(){var e=this;this.$nextTick((function(){e.$refs.paging.reload()}))},onLoad:function(){this.getContractInfo()},methods:{getContractInfo:function(){var e=this,n=this,t={enterpriseId:n.enterpriseId};n.$api("contract.getAllContractList",t).then((function(n){200==n.code&&(n.data.length>0?e.corporateLogo=n.data[0].enterpriseInfo.corporateLogo:e.corporateLogo="")})).catch((function(e){}))},getInfo:function(e,n){var t=this,o={ascs:"id",currPage:e,pageSize:n,enterpriseId:t.enterpriseId,zoneId:t.zoneId};t.$api("employeeManagement.departmentList",o).then((function(n){200==n.code?(1==e&&n.data.list.length>0&&(n.data.list[0].avaer="https://file.yuanzhoulvwego.com/prod/uploadFiles/home/employeeManagement/woren.png",n.data.list[1].avaer="https://file.yuanzhoulvwego.com/prod/uploadFiles/home/employeeManagement/woren.png"),t.$refs.paging.complete(n.data.list)):t.$refs.paging.complete(!1)})).catch((function(e){t.$refs.paging.complete(!1)}))},toStaffList:function(e){this.$Router.push({path:"/sub-package2/pages/home/employeeManagement/personnelList",query:e})},addDepartment:function(){this.$Router.push({path:"/sub-package2/pages/home/employeeManagement/departmentDetails"})},addStaff:function(){this.$Router.push({path:"/sub-package2/pages/home/employeeManagement/newStaff"})}}};n.default=t}).call(this,t(2)["default"])},401:function(e,n,t){"use strict";t.r(n);var o=t(402),a=t.n(o);for(var r in o)["default"].indexOf(r)<0&&function(e){t.d(n,e,(function(){return o[e]}))}(r);n["default"]=a.a},402:function(e,n,t){}},[[395,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/sub-package2/pages/home/employeeManagement/index.js.map