(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/home/employeeManagement/personnelList"],{314:function(e,t,n){"use strict";(function(e){var t=n(3);n(25),n(26);t(n(24));var o=t(n(315));wx.__webpack_require_UNI_MP_PLUGIN__=n,e(o.default)}).call(this,n(1)["createPage"])},315:function(e,t,n){"use strict";n.r(t);var o=n(316),i=n(318);for(var u in i)["default"].indexOf(u)<0&&function(e){n.d(t,e,(function(){return i[e]}))}(u);n(320);var r,a=n(38),c=Object(a["default"])(i["default"],o["render"],o["staticRenderFns"],!1,null,"7f360167",null,!1,o["components"],r);c.options.__file="pages/home/employeeManagement/personnelList.vue",t["default"]=c.exports},316:function(e,t,n){"use strict";n.r(t);var o=n(317);n.d(t,"render",(function(){return o["render"]})),n.d(t,"staticRenderFns",(function(){return o["staticRenderFns"]})),n.d(t,"recyclableRender",(function(){return o["recyclableRender"]})),n.d(t,"components",(function(){return o["components"]}))},317:function(e,t,n){"use strict";var o;n.r(t),n.d(t,"render",(function(){return i})),n.d(t,"staticRenderFns",(function(){return r})),n.d(t,"recyclableRender",(function(){return u})),n.d(t,"components",(function(){return o}));try{o={zPaging:function(){return Promise.all([n.e("common/vendor"),n.e("uni_modules/z-paging/components/z-paging/z-paging")]).then(n.bind(null,1144))},uNavbar:function(){return n.e("uview-ui/components/u-navbar/u-navbar").then(n.bind(null,979))},uIcon:function(){return n.e("uview-ui/components/u-icon/u-icon").then(n.bind(null,986))},uGap:function(){return n.e("uview-ui/components/u-gap/u-gap").then(n.bind(null,1042))},uCellGroup:function(){return n.e("uview-ui/components/u-cell-group/u-cell-group").then(n.bind(null,1028))},uCheckbox:function(){return n.e("uview-ui/components/u-checkbox/u-checkbox").then(n.bind(null,1222))},uCellItem:function(){return n.e("uview-ui/components/u-cell-item/u-cell-item").then(n.bind(null,1035))},uButton:function(){return n.e("uview-ui/components/u-button/u-button").then(n.bind(null,1092))},uPopup:function(){return n.e("uview-ui/components/u-popup/u-popup").then(n.bind(null,1229))},uModal:function(){return n.e("uview-ui/components/u-modal/u-modal").then(n.bind(null,1137))},uSelect:function(){return n.e("uview-ui/components/u-select/u-select").then(n.bind(null,1187))},uToast:function(){return n.e("uview-ui/components/u-toast/u-toast").then(n.bind(null,1194))}}}catch(a){if(-1===a.message.indexOf("Cannot find module")||-1===a.message.indexOf(".vue"))throw a;console.error(a.message),console.error("1. 排查组件名称拼写是否正确"),console.error("2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"),console.error("3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件")}var i=function(){var e=this,t=e.$createElement;e._self._c;e._isMounted||(e.e0=function(t){e.operationSelect=!0})},u=!1,r=[];i._withStripped=!0},318:function(e,t,n){"use strict";n.r(t);var o=n(319),i=n.n(o);for(var u in o)["default"].indexOf(u)<0&&function(e){n.d(t,e,(function(){return o[e]}))}(u);t["default"]=i.a},319:function(e,t,n){"use strict";(function(e){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n={data:function(){return{zoneId:e.getStorageSync("zoneInfo").zoneId,enterpriseId:e.getStorageSync("userInfo").enterpriseId,departmentInfo:{},title:"",tacitly:!1,operationSelect:!1,modeShow:!1,showChecked:!1,checkedAll:!1,departmentSelect:!1,dataList:[],departmentSelectList:[],operationList:[{value:1,label:"编辑部门"},{value:2,label:"删除部门"}]}},onLoad:function(){var e=this;"租户"!==e.$Route.query.roleName&&"租户员工"!==e.$Route.query.roleName?(e.tacitly=!1,e.getDepartmentInfo(e.$Route.query.id)):(e.tacitly=!0,e.departmentInfo.roleName=e.$Route.query.roleName,e.getInfo(1,10)),e.getDepartmentAll()},onShow:function(){var e=this;"租户"!==e.$Route.query.roleName&&"租户员工"!==e.$Route.query.roleName?(e.tacitly=!1,e.$nextTick((function(){e.$refs.paging.reload()}))):(e.tacitly=!0,e.departmentInfo.roleName=e.$Route.query.roleName)},methods:{getDepartmentInfo:function(e){var t=this;this.$api("employeeManagement.departmentInfo",{id:e}).then((function(e){200==e.code&&(t.departmentInfo=e.data)}))},getDepartmentAll:function(){var e=this;this.$api("employeeManagement.getDepartmentAll",{enterpriseId:this.enterpriseId}).then((function(t){200==t.code&&(e.departmentSelectList=t.data)}))},getInfo:function(e,t){var n=this,o={currPage:e,pageSize:t,enterpriseId:n.enterpriseId,zoneId:n.zoneId,roleId:n.$Route.query.id};n.$api("employeeManagement.departmentPersonnelList",o).then((function(e){200==e.code?(e.data.list.forEach((function(e){e.checked=!1})),n.$refs.paging.complete(e.data.list),0===e.data.list.length&&(n.showChecked=!1,n.checkedAll=!1)):n.$refs.paging.complete(!1)})).catch((function(e){n.$refs.paging.complete(!1)}))},toStaffDetails:function(e){this.$Router.push({path:"/pages/home/employeeManagement/staffDetails",query:{id:e.id}})},onSubmit:function(){this.$Router.push({path:"/pages/home/employeeManagement/newStaff"})},confirm:function(e){1!==e.value?(this.modeShow=!0,this.operationSelect=!1):(this.$Router.push({path:"/pages/home/employeeManagement/departmentDetails",query:this.$Route.query}),this.operationSelect=!1)},closeOperation:function(){this.operationSelect=!1},modelConfirm:function(){var t=this;0===t.dataList.length?t.$api("employeeManagement.delDepartment",{ids:t.departmentInfo.id}).then((function(n){200==n.code?(e.showToast({title:n.msg,icon:"none",duration:500,mask:!0}),t.$Router.push({path:"/pages/home/employeeManagement/index"})):e.showToast({title:n.msg||"请求出错,稍后重试",icon:"none",duration:500,mask:!0})})):this.showChecked=!0},checkboxAll:function(e){this.dataList.forEach((function(t){t.checked=e.value}))},checkbox:function(e){this.dataList[e].checked=!!this.dataList[e].checked;var t=this.dataList.filter((function(e){return 1==e.checked}));this.checkedAll=t.length==this.dataList.length,this.$forceUpdate()},departmentConfirm:function(e){var t=this,n=this.dataList.filter((function(e){return 1==e.checked})).map((function(e){return e.id})),o={roleId:e[0].value,userIds:n.join()};this.$api("employeeManagement.getByEnterpriseId",o).then((function(e){200==e.code&&t.getInfo(1,10)}))},moveSubmit:function(){var e=this.dataList.filter((function(e){return 1==e.checked}));e.length>0?this.departmentSelect=!0:this.$refs.uToast.show({title:"请至少选择一项",type:"warning"})},delSubmit:function(){var e=this,t=this.dataList.filter((function(e){return 1==e.checked})).map((function(e){return e.id}));if(t.length>0){var n={ids:t.join()};this.$api("employeeManagement.delByIdsEnterpriseUser",n).then((function(t){200==t.code&&(e.$refs.uToast.show({title:t.msg,type:"success"}),e.$nextTick((function(){e.$refs.paging.reload()})))}))}else this.$refs.uToast.show({title:"请至少选择一项",type:"warning"})}}};t.default=n}).call(this,n(1)["default"])},320:function(e,t,n){"use strict";n.r(t);var o=n(321),i=n.n(o);for(var u in o)["default"].indexOf(u)<0&&function(e){n.d(t,e,(function(){return o[e]}))}(u);t["default"]=i.a},321:function(e,t,n){}},[[314,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/home/employeeManagement/personnelList.js.map