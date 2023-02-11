require('../../../common/vendor.js');(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package2/pages/home/employeeManagement/newStaff"],{412:function(e,t,n){"use strict";(function(e,t){var r=n(4);n(26),n(27);r(n(25));var o=r(n(413));e.__webpack_require_UNI_MP_PLUGIN__=n,t(o.default)}).call(this,n(1)["default"],n(2)["createPage"])},413:function(e,t,n){"use strict";n.r(t);var r=n(414),o=n(416);for(var i in o)["default"].indexOf(i)<0&&function(e){n.d(t,e,(function(){return o[e]}))}(i);n(418);var u,a=n(39),c=Object(a["default"])(o["default"],r["render"],r["staticRenderFns"],!1,null,"488df99e",null,!1,r["components"],u);c.options.__file="sub-package2/pages/home/employeeManagement/newStaff.vue",t["default"]=c.exports},414:function(e,t,n){"use strict";n.r(t);var r=n(415);n.d(t,"render",(function(){return r["render"]})),n.d(t,"staticRenderFns",(function(){return r["staticRenderFns"]})),n.d(t,"recyclableRender",(function(){return r["recyclableRender"]})),n.d(t,"components",(function(){return r["components"]}))},415:function(e,t,n){"use strict";var r;n.r(t),n.d(t,"render",(function(){return o})),n.d(t,"staticRenderFns",(function(){return u})),n.d(t,"recyclableRender",(function(){return i})),n.d(t,"components",(function(){return r}));try{r={uNavbar:function(){return n.e("uview-ui/components/u-navbar/u-navbar").then(n.bind(null,974))},uGap:function(){return n.e("uview-ui/components/u-gap/u-gap").then(n.bind(null,1037))},uForm:function(){return n.e("uview-ui/components/u-form/u-form").then(n.bind(null,1094))},uFormItem:function(){return Promise.all([n.e("common/vendor"),n.e("uview-ui/components/u-form-item/u-form-item")]).then(n.bind(null,1101))},uInput:function(){return Promise.all([n.e("common/vendor"),n.e("uview-ui/components/u-input/u-input")]).then(n.bind(null,1079))},uIcon:function(){return n.e("uview-ui/components/u-icon/u-icon").then(n.bind(null,981))},uButton:function(){return n.e("uview-ui/components/u-button/u-button").then(n.bind(null,1087))},uSelect:function(){return n.e("uview-ui/components/u-select/u-select").then(n.bind(null,1182))},uPicker:function(){return Promise.all([n.e("common/vendor"),n.e("uview-ui/components/u-picker/u-picker")]).then(n.bind(null,1172))},uModal:function(){return n.e("uview-ui/components/u-modal/u-modal").then(n.bind(null,1132))},uImage:function(){return n.e("uview-ui/components/u-image/u-image").then(n.bind(null,1044))},uLoading:function(){return n.e("uview-ui/components/u-loading/u-loading").then(n.bind(null,1196))},uToast:function(){return n.e("uview-ui/components/u-toast/u-toast").then(n.bind(null,1189))}}}catch(a){if(-1===a.message.indexOf("Cannot find module")||-1===a.message.indexOf(".vue"))throw a;console.error(a.message),console.error("1. 排查组件名称拼写是否正确"),console.error("2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"),console.error("3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件")}var o=function(){var e=this,t=e.$createElement;e._self._c;e._isMounted||(e.e0=function(t){e.genderSelect=!0},e.e1=function(t){e.departmentSelect=!0})},i=!1,u=[];o._withStripped=!0},416:function(e,t,n){"use strict";n.r(t);var r=n(417),o=n.n(r);for(var i in r)["default"].indexOf(i)<0&&function(e){n.d(t,e,(function(){return r[e]}))}(i);t["default"]=o.a},417:function(e,t,n){"use strict";(function(e){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var r=function(){n.e("sub-package2/components/my-textarea/my-textarea").then(function(){return resolve(n(1271))}.bind(null,n)).catch(n.oe)},o={components:{myTextarea:r},data:function(){var t=this;return{enterpriseId:e.getStorageSync("userInfo").enterpriseId,form:{personnelAccess:""},cardList:[],checkList:[],id:0,genderSelect:!1,departmentSelect:!1,timePicker:!1,showModel:!1,timeType:0,genderSelectList:[{value:1,label:"男"},{value:2,label:"女"}],departmentSelectList:[],timeParams:{year:!0,month:!0,day:!0,hour:!0,minute:!0,second:!0},rules:{userName:[{required:!0,message:"请输入个人姓名",trigger:["blur"]}],phone:[{validator:function(e,n,r){if(t.$u.test.isEmpty(n))r(new Error("请输入手机号码"));else{if(t.$u.test.mobile(n))return!0;r(new Error("请输入正确的手机号码"))}},trigger:["blur"]}],genderName:[{required:!0,message:"请选择性别",trigger:["change"]}],roleName:[{required:!0,message:"请选择所属部门",trigger:["change"]}],personnelAccess:[{required:!0,message:"请选择权限",trigger:["change"]}],accStartDateTime:[{required:!0,message:"请选择开始时间",trigger:["change"]},{validator:function(e,n,r){return!t.form.accEndDateTime||t.$tools.compareDateTime(n,t.form.accEndDateTime)},message:"开始时间不能大于结束",trigger:["change","blur"]}],accEndDateTime:[{required:!0,message:"请选择结束时间",trigger:["change"]},{validator:function(e,n,r){return!t.form.accStartDateTime||t.$tools.compareDateTime(t.form.accStartDateTime,n)},message:"开始时间不能大于结束",trigger:["change","blur"]}]}}},onReady:function(){this.$refs.uForm.setRules(this.rules)},onLoad:function(){this.$Route.query.hasOwnProperty("id")&&(this.form=this.$Route.query,this.form.genderName=1===this.form.gender?"男":"女",this.form.roleName="租户员工"===this.form.roleName?"租户员工":this.form.roleName,this.cardList=this.form.cardNumber.split(","),this.form.rooms.length>0&&(this.checkList=this.form.rooms.map((function(e){return e.id}))),this.id=this.$Route.query.id),this.getDepartmentAll()},onShow:function(){var t=this;e.$on("updateData",(function(e,n){t.cardList=e,t.checkList=n,e.length>0||n.length>0?t.form.personnelAccess="已选权限":t.form.personnelAccess=""}))},methods:{getDepartmentAll:function(){var e=this;this.$api("employeeManagement.getDepartmentAll",{enterpriseId:this.enterpriseId}).then((function(t){200==t.code&&(e.departmentSelectList=t.data)}))},onSubmit:function(){var e=this;this.$refs.uForm.validate((function(t){if(t){var n={enterpriseId:e.enterpriseId,personType:1,userName:e.form.userName,phone:e.form.phone,gender:e.form.gender,roleId:e.form.roleId,accStartDateTime:e.form.accStartDateTime,accEndDateTime:e.form.accEndDateTime,remark:e.form.remark};n.roomIds=e.checkList,e.cardList.length>0&&(n.card=e.cardList),e.id>0?(n.id=e.id,e.$api("employeeManagement.updateEnterpriseUser",n,!1).then((function(t){200===t.code?e.showModel=!0:e.$refs.uToast.show({title:t.msg,type:"error"})}))):e.$api("employeeManagement.addEnterpriseUser",n,!1).then((function(t){0===t.code?e.showModel=!0:e.$refs.uToast.show({title:t.msg,type:"error"})}))}else console.log("验证失败")}))},openTimePicker:function(e){this.timePicker=!0,this.timeType="start"===e?0:1},toPersonnelAccess:function(){this.$Router.push({path:"/sub-package2/pages/home/employeeManagement/selectPermissions",query:{cardList:this.cardList,checkList:this.checkList}})},confirm:function(e){if(this.genderSelect&&(this.form.gender=e[0].value,this.form.genderName=e[0].label),this.departmentSelect&&(this.form.roleId=e[0].value,this.form.roleName=e[0].label),this.timePicker){var t=e.year+"-"+e.month+"-"+e.day+" "+e.hour+":"+e.minute+":"+e.second;this.timeType?this.form.accEndDateTime=t:this.form.accStartDateTime=t}},knowConfirm:function(){this.form={personnelAccess:""},e.navigateBack()}}};t.default=o}).call(this,n(2)["default"])},418:function(e,t,n){"use strict";n.r(t);var r=n(419),o=n.n(r);for(var i in r)["default"].indexOf(i)<0&&function(e){n.d(t,e,(function(){return r[e]}))}(i);t["default"]=o.a},419:function(e,t,n){}},[[412,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/sub-package2/pages/home/employeeManagement/newStaff.js.map