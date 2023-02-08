require('../../../common/vendor.js');(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package2/pages/home/employeeManagement/departmentDetails"],{403:function(e,n,t){"use strict";(function(e,n){var i=t(4);t(26),t(27);i(t(25));var o=i(t(404));e.__webpack_require_UNI_MP_PLUGIN__=t,n(o.default)}).call(this,t(1)["default"],t(2)["createPage"])},404:function(e,n,t){"use strict";t.r(n);var i=t(405),o=t(407);for(var c in o)["default"].indexOf(c)<0&&function(e){t.d(n,e,(function(){return o[e]}))}(c);t(409);var u,r=t(39),s=Object(r["default"])(o["default"],i["render"],i["staticRenderFns"],!1,null,"42d455cf",null,!1,i["components"],u);s.options.__file="sub-package2/pages/home/employeeManagement/departmentDetails.vue",n["default"]=s.exports},405:function(e,n,t){"use strict";t.r(n);var i=t(406);t.d(n,"render",(function(){return i["render"]})),t.d(n,"staticRenderFns",(function(){return i["staticRenderFns"]})),t.d(n,"recyclableRender",(function(){return i["recyclableRender"]})),t.d(n,"components",(function(){return i["components"]}))},406:function(e,n,t){"use strict";var i;t.r(n),t.d(n,"render",(function(){return o})),t.d(n,"staticRenderFns",(function(){return u})),t.d(n,"recyclableRender",(function(){return c})),t.d(n,"components",(function(){return i}));try{i={uNavbar:function(){return t.e("uview-ui/components/u-navbar/u-navbar").then(t.bind(null,973))},uGap:function(){return t.e("uview-ui/components/u-gap/u-gap").then(t.bind(null,1036))},uForm:function(){return t.e("uview-ui/components/u-form/u-form").then(t.bind(null,1093))},uFormItem:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-form-item/u-form-item")]).then(t.bind(null,1100))},uInput:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-input/u-input")]).then(t.bind(null,1078))},uCheckbox:function(){return t.e("uview-ui/components/u-checkbox/u-checkbox").then(t.bind(null,1256))},uCheckboxGroup:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-checkbox-group/u-checkbox-group")]).then(t.bind(null,1263))},uIcon:function(){return t.e("uview-ui/components/u-icon/u-icon").then(t.bind(null,980))},uButton:function(){return t.e("uview-ui/components/u-button/u-button").then(t.bind(null,1086))},uToast:function(){return t.e("uview-ui/components/u-toast/u-toast").then(t.bind(null,1188))}}}catch(r){if(-1===r.message.indexOf("Cannot find module")||-1===r.message.indexOf(".vue"))throw r;console.error(r.message),console.error("1. 排查组件名称拼写是否正确"),console.error("2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"),console.error("3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件")}var o=function(){var e=this,n=e.$createElement,t=(e._self._c,e.__map(e.list,(function(n,t){var i=e.__get_orig(n),o=n.childMenu.filter((function(e){return 1==e.checked})).length,c=n.childMenu.length;return{$orig:i,g0:o,g1:c}})));e.$mp.data=Object.assign({},{$root:{l0:t}})},c=!1,u=[];o._withStripped=!0},407:function(e,n,t){"use strict";t.r(n);var i=t(408),o=t.n(i);for(var c in i)["default"].indexOf(c)<0&&function(e){t.d(n,e,(function(){return i[e]}))}(c);n["default"]=o.a},408:function(e,n,t){"use strict";(function(e){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var t={data:function(){return{id:0,zoneId:0,form:{roleName:""},noCheckStyle:{backgroundColor:" #F1F2F3",color:"#666666"},checkStyle:{backgroundColor:"#3E76F4",color:"white"},list:[],checkList:[],checkedAll:!1,num:0,rules:{roleName:[{required:!0,message:"请输入部门名称",trigger:["blur"]}]}}},onLoad:function(){this.zoneId=e.getStorageSync("zoneInfo").zoneId,this.roleMenuList(),this.id=this.$Route.query.id,this.id>0&&this.getDepartmentInfo(this.id)},onReady:function(){this.$refs.uForm.setRules(this.rules)},methods:{roleMenuList:function(){var e=this;this.zoneId;this.$api("employeeManagement.roleMenuList",{menuType:2,zoneId:this.zoneId}).then((function(n){200==n.code?(e.list=n.data.filter((function(e){return e.childMenu.length>0})),e.list.forEach((function(e){e.checked=!1,e.hidden=!1,e.childMenu.length>0&&e.childMenu.forEach((function(e){e.checked=!1}))}))):e.$refs.uToast.show({title:n.msg,type:"error"})})).catch((function(n){e.$refs.uToast.show({title:"获取失败",type:"error"})}))},getDepartmentInfo:function(e){var n=this;this.$api("employeeManagement.departmentInfo",{id:e}).then((function(e){200==e.code&&(n.form=e.data,n.checkList=n.form.menuId,n.list.forEach((function(e){e.childMenu.forEach((function(e){n.checkList.some((function(n){return n==e.id}))&&(e.checked=!0),n.num=n.num+1})),0===e.childMenu.filter((function(e){return!0===e.checked})).length?e.checked=!1:e.childMenu.length>0&&(e.checked=!0)})),n.checkedAll=n.num===n.checkList.length)}))},checkboxAll:function(e){var n=this;this.list.forEach((function(t){t.checked=e.value,t.childMenu.forEach((function(t){t.checked=e.value,e.value&&!n.checkList.some((function(e){return e===t.id}))&&n.checkList.push(t.id)}))})),e.value||(this.checkList=[]),this.$forceUpdate()},showOrHide:function(e){!0===e.hidden?e.hidden=!1:e.hidden=!0,this.$forceUpdate()},checkboxChange:function(e){var n=this,t=this.list.filter((function(n){return n.name===e.name}))[0].childMenu;e.value?t.forEach((function(e){e.checked=!0,n.checkList.some((function(n){return n===e.id}))||n.checkList.push(e.id)})):t.forEach((function(e){e.checked=!1,n.checkList.splice(n.checkList.indexOf(e.id),1)}));var i=this.list.filter((function(e){return 1==e.checked}));this.checkedAll=i.length==this.list.length,this.$forceUpdate()},checkJurisdiction:function(e,n){e.checked?(e.checked=!1,this.checkList.splice(this.checkList.indexOf(e.id),1)):(e.checked=!0,this.checkList.some((function(e){return e===n.id}))||this.checkList.push(e.id)),0===n.childMenu.filter((function(e){return!0===e.checked})).length?n.checked=!1:n.checked=!0,this.checkedAll=this.num===this.checkList.length,this.$forceUpdate()},onSubmit:function(){var e=this;e.$refs.uForm.validate((function(n){if(n)if(e.checkList.length>0){var t={ids:e.checkList.join(),roleName:e.form.roleName,roleDescription:"无",roleType:4,zoneId:e.zoneId};e.id>0?(t.id=e.id,e.$api("employeeManagement.updateDepartment",t,!1).then((function(n){200==n.code&&e.$refs.uToast.show({title:n.msg})}))):e.$api("employeeManagement.addDepartment",t,!1).then((function(n){200==n.code&&(e.$refs.uToast.show({title:n.msg}),e.$Router.push({path:"/sub-package2/pages/home/employeeManagement/index"}))})).catch((function(n){e.$refs.uToast.show({title:"添加失败",type:"error"})}))}else e.$refs.uToast.show({title:"请选择权限",type:"error"});else console.log("验证失败")}))}}};n.default=t}).call(this,t(2)["default"])},409:function(e,n,t){"use strict";t.r(n);var i=t(410),o=t.n(i);for(var c in i)["default"].indexOf(c)<0&&function(e){t.d(n,e,(function(){return i[e]}))}(c);n["default"]=o.a},410:function(e,n,t){}},[[403,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/sub-package2/pages/home/employeeManagement/departmentDetails.js.map