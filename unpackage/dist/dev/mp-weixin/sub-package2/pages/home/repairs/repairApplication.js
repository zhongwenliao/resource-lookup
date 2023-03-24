require('../../../common/vendor.js');(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package2/pages/home/repairs/repairApplication"],{718:function(e,n,t){"use strict";(function(e,n){var o=t(4);t(26),t(27);o(t(25));var r=o(t(719));e.__webpack_require_UNI_MP_PLUGIN__=t,n(r.default)}).call(this,t(1)["default"],t(2)["createPage"])},719:function(e,n,t){"use strict";t.r(n);var o=t(720),r=t(722);for(var i in r)["default"].indexOf(i)<0&&function(e){t.d(n,e,(function(){return r[e]}))}(i);t(724),t(726);var u,a=t(39),s=Object(a["default"])(r["default"],o["render"],o["staticRenderFns"],!1,null,"ef583766",null,!1,o["components"],u);s.options.__file="sub-package2/pages/home/repairs/repairApplication.vue",n["default"]=s.exports},720:function(e,n,t){"use strict";t.r(n);var o=t(721);t.d(n,"render",(function(){return o["render"]})),t.d(n,"staticRenderFns",(function(){return o["staticRenderFns"]})),t.d(n,"recyclableRender",(function(){return o["recyclableRender"]})),t.d(n,"components",(function(){return o["components"]}))},721:function(e,n,t){"use strict";var o;t.r(n),t.d(n,"render",(function(){return r})),t.d(n,"staticRenderFns",(function(){return u})),t.d(n,"recyclableRender",(function(){return i})),t.d(n,"components",(function(){return o}));try{o={uNavbar:function(){return t.e("uview-ui/components/u-navbar/u-navbar").then(t.bind(null,986))},uForm:function(){return t.e("uview-ui/components/u-form/u-form").then(t.bind(null,1106))},uFormItem:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-form-item/u-form-item")]).then(t.bind(null,1113))},uInput:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-input/u-input")]).then(t.bind(null,1091))},uUpload:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-upload/u-upload")]).then(t.bind(null,1177))},uImage:function(){return t.e("uview-ui/components/u-image/u-image").then(t.bind(null,1056))},uButton:function(){return t.e("uview-ui/components/u-button/u-button").then(t.bind(null,1099))},uSelect:function(){return t.e("uview-ui/components/u-select/u-select").then(t.bind(null,1194))},uModal:function(){return t.e("uview-ui/components/u-modal/u-modal").then(t.bind(null,1144))},uLoading:function(){return t.e("uview-ui/components/u-loading/u-loading").then(t.bind(null,1208))},uToast:function(){return t.e("uview-ui/components/u-toast/u-toast").then(t.bind(null,1201))}}}catch(a){if(-1===a.message.indexOf("Cannot find module")||-1===a.message.indexOf(".vue"))throw a;console.error(a.message),console.error("1. 排查组件名称拼写是否正确"),console.error("2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"),console.error("3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件")}var r=function(){var e=this,n=e.$createElement;e._self._c;e._isMounted||(e.e0=function(n){e.roomIdSelect=!0},e.e1=function(n){e.repairTypeSelect=!0})},i=!1,u=[];r._withStripped=!0},722:function(e,n,t){"use strict";t.r(n);var o=t(723),r=t.n(o);for(var i in o)["default"].indexOf(i)<0&&function(e){t.d(n,e,(function(){return o[e]}))}(i);n["default"]=r.a},723:function(e,n,t){"use strict";(function(e){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var o=function(){t.e("sub-package2/components/my-textarea/my-textarea").then(function(){return resolve(t(1283))}.bind(null,t)).catch(t.oe)},r={components:{myTextarea:o},data:function(){var n=this;return{zoneId:e.getStorageSync("zoneInfo").zoneId,enterpriseId:e.getStorageSync("userInfo").enterpriseId,userId:e.getStorageSync("userInfo").id,roomIdSelect:!1,repairTypeSelect:!1,showModel:!1,form:{},roomIdSelectList:[],repairTypeSelectList:[],labelStyle:{fontSize:"34upx",fontWeight:"bold",color:"#333333"},action:"/image/web/add",rules:{roomName:[{required:!0,message:"请选择房间号",trigger:["change"]}],repairer:[{required:!0,message:"请输入联系人",trigger:["blur"]}],phone:[{validator:function(e,t,o){if(n.$u.test.isEmpty(t))o(new Error("请输入手机号码"));else{if(n.$u.test.mobile(t))return!0;o(new Error("请输入正确的手机号码"))}},trigger:["blur"]}],classificationName:[{required:!0,message:"请选择报修类型",trigger:["change"]}]}}},onReady:function(){this.$refs.uForm.setRules(this.rules)},onLoad:function(){this.getRoomListByEnterpriseId(),this.getAllMaintainClassifyList()},methods:{getRoomListByEnterpriseId:function(){var e=this,n={enterpriseId:this.enterpriseId,zoneId:this.zoneId};this.$api("employeeManagement.getRoomListBySelf",n,!1).then((function(n){if(200==n.code){var t=n.data.filter((function(e){if(e.children.length>0&&(e.children=e.children.filter((function(e){if(e.children.length>0)return e})),e.children.length>0))return e}));e.roomIdSelectList=t}}))},getAllMaintainClassifyList:function(){var e=this,n={zoneId:this.zoneId};this.$api("repairs.getAllMaintainClassifyList",n,!1).then((function(n){200==n.code&&(e.repairTypeSelectList=n.data)}))},confirm:function(e){this.roomIdSelect&&(this.form.roomName=e[0].label+"/"+e[1].label+"/"+e[2].label,this.form.roomId=e[2].value),this.repairTypeSelect&&(this.form.classificationName=e[0].label,this.form.classificationId=e[0].value)},listChange:function(e,n){this.form.livePhoto=e},uploadSuccess:function(e,n,t,o){200==e.code&&(this.form.livePhoto=t)},onSubmit:function(){var e=this;this.$refs.uForm.validate((function(n){if(n)if(e.form.remark){var t=e.$u.deepClone(e.form);if(t.livePhoto&&t.livePhoto.length>0){var o=t.livePhoto.map((function(n){return e.$u.test.isEmpty(n.response)?n.url:n.response.data}));t.livePhoto=o.join(",")}t.enterpriseId=e.enterpriseId,t.userId=e.userId,e.$api("repairs.addMaintenanceInfo",t,!1).then((function(n){200===n.code?e.showModel=!0:e.$refs.uToast.show({title:n.msg,type:"error"})}))}else e.$refs.uToast.show({title:"请填写报修问题",type:"error"})}))},knowConfirm:function(){this.form={},this.showModel=!1,e.navigateBack()}}};n.default=r}).call(this,t(2)["default"])},724:function(e,n,t){"use strict";t.r(n);var o=t(725),r=t.n(o);for(var i in o)["default"].indexOf(i)<0&&function(e){t.d(n,e,(function(){return o[e]}))}(i);n["default"]=r.a},725:function(e,n,t){},726:function(e,n,t){"use strict";t.r(n);var o=t(727),r=t.n(o);for(var i in o)["default"].indexOf(i)<0&&function(e){t.d(n,e,(function(){return o[e]}))}(i);n["default"]=r.a},727:function(e,n,t){}},[[718,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/sub-package2/pages/home/repairs/repairApplication.js.map