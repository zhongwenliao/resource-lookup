(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/user/propertyPass"],{272:function(e,n,t){"use strict";(function(e,n){var o=t(4);t(26),t(27);o(t(25));var r=o(t(273));e.__webpack_require_UNI_MP_PLUGIN__=t,n(r.default)}).call(this,t(1)["default"],t(2)["createPage"])},273:function(e,n,t){"use strict";t.r(n);var o=t(274),r=t(276);for(var u in r)["default"].indexOf(u)<0&&function(e){t.d(n,e,(function(){return r[e]}))}(u);t(278),t(280);var i,a=t(39),s=Object(a["default"])(r["default"],o["render"],o["staticRenderFns"],!1,null,"2ef7bb21",null,!1,o["components"],i);s.options.__file="pages/user/propertyPass.vue",n["default"]=s.exports},274:function(e,n,t){"use strict";t.r(n);var o=t(275);t.d(n,"render",(function(){return o["render"]})),t.d(n,"staticRenderFns",(function(){return o["staticRenderFns"]})),t.d(n,"recyclableRender",(function(){return o["recyclableRender"]})),t.d(n,"components",(function(){return o["components"]}))},275:function(e,n,t){"use strict";var o;t.r(n),t.d(n,"render",(function(){return r})),t.d(n,"staticRenderFns",(function(){return i})),t.d(n,"recyclableRender",(function(){return u})),t.d(n,"components",(function(){return o}));try{o={uNavbar:function(){return t.e("uview-ui/components/u-navbar/u-navbar").then(t.bind(null,980))},uForm:function(){return t.e("uview-ui/components/u-form/u-form").then(t.bind(null,1100))},uFormItem:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-form-item/u-form-item")]).then(t.bind(null,1107))},uInput:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-input/u-input")]).then(t.bind(null,1085))},uIcon:function(){return t.e("uview-ui/components/u-icon/u-icon").then(t.bind(null,987))},uUpload:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-upload/u-upload")]).then(t.bind(null,1171))},uImage:function(){return t.e("uview-ui/components/u-image/u-image").then(t.bind(null,1050))},uButton:function(){return t.e("uview-ui/components/u-button/u-button").then(t.bind(null,1093))},uPicker:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-picker/u-picker")]).then(t.bind(null,1178))},uSelect:function(){return t.e("uview-ui/components/u-select/u-select").then(t.bind(null,1188))},uModal:function(){return t.e("uview-ui/components/u-modal/u-modal").then(t.bind(null,1138))},uToast:function(){return t.e("uview-ui/components/u-toast/u-toast").then(t.bind(null,1195))}}}catch(a){if(-1===a.message.indexOf("Cannot find module")||-1===a.message.indexOf(".vue"))throw a;console.error(a.message),console.error("1. 排查组件名称拼写是否正确"),console.error("2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"),console.error("3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件")}var r=function(){var e=this,n=e.$createElement;e._self._c;e._isMounted||(e.e0=function(n){e.roomIdSelect=!0},e.e1=function(n){e.show=!0})},u=!1,i=[];r._withStripped=!0},276:function(e,n,t){"use strict";t.r(n);var o=t(277),r=t.n(o);for(var u in o)["default"].indexOf(u)<0&&function(e){t.d(n,e,(function(){return o[e]}))}(u);n["default"]=r.a},277:function(e,n,t){"use strict";(function(e){var o=t(4);Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r=o(t(11)),u={data:function(){var n;return n={id:1,params:{year:!0,month:!0,day:!0,hour:!1,minute:!1,second:!1},show:!1,zoneId:e.getStorageSync("zoneInfo").zoneId,enterpriseId:e.getStorageSync("userInfo").enterpriseId},(0,r.default)(n,"id",e.getStorageSync("userInfo").id),(0,r.default)(n,"roomIdSelect",!1),(0,r.default)(n,"repairTypeSelect",!1),(0,r.default)(n,"showModel",!1),(0,r.default)(n,"form",{livePhoto:[],fwItemReleaseDetails:[{name:"",count:""}]}),(0,r.default)(n,"roomIdSelectList",[]),(0,r.default)(n,"repairTypeSelectList",[]),(0,r.default)(n,"labelStyle",{fontSize:"34upx",fontWeight:"bold",color:"#333333"}),(0,r.default)(n,"action","/image/web/add"),(0,r.default)(n,"rules",{phone:[{required:!0,message:"请输入号码",trigger:["change","blur"]}],roomName:[{required:!0,message:"请选择房间号",trigger:["change","blur"]}],movingDate:[{required:!0,message:"请选择搬运日期",trigger:["change","blur"]}],name:[{required:!0,message:"请输入物品名称",trigger:["blur"]}],count:[{required:!0,message:"请输入物品数量",trigger:["blur"]}]}),n},onReady:function(){this.$refs.uForm.setRules(this.rules)},onLoad:function(){this.getRoomListByEnterpriseId()},methods:{record:function(){this.$Router.push({path:"/pages/user/releaseRecord"})},addItem:function(){this.form.fwItemReleaseDetails.push({name:"",count:""})},delItem:function(e){this.form.fwItemReleaseDetails=this.form.fwItemReleaseDetails.filter((function(n){return n!=e}))},change:function(e){console.log(e),this.form.movingDate=e.year+"-"+e.month+"-"+e.day},getRoomListByEnterpriseId:function(){var e=this,n={enterpriseId:this.enterpriseId,zoneId:this.zoneId};this.$api("employeeManagement.getRoomListByEnterpriseId",n,!1).then((function(n){if(200==n.code){var t=n.data;t.forEach((function(e){e.name=e.buildIngName})),e.roomIdSelectList=t,e.form.roomName=t[0].buildIngName+"/"+t[0].children[0].name,e.form.roomId=t[0].children[0].id}}))},confirm:function(e){this.roomIdSelect&&(this.form.roomName=e[0].label+"/"+e[1].label,this.form.roomId=e[1].value),this.repairTypeSelect&&(this.form.classificationName=e[0].label,this.form.classificationId=e[0].value)},listChange:function(e,n){this.form.livePhoto=e},uploadSuccess:function(e,n,t,o){200==e.code&&(this.form.livePhoto=t)},onSubmit:function(){var e=this;this.$refs.uForm.validate((function(n){if(n){console.log("lplp");var t={userId:e.id,phone:e.form.phone,roomId:e.form.roomId,movingDate:e.form.movingDate,fwItemReleaseDetails:[]};if(e.form.fwItemReleaseDetails.forEach((function(e){t.fwItemReleaseDetails.push({count:+e.count,name:e.name})})),console.log("123321"),!(e.form.livePhoto&&e.form.livePhoto.length>0))return e.$refs.uToast.show({title:"请上传照片！",type:"error"}),!1;var o=e.form.livePhoto.map((function(n){return e.$u.test.isEmpty(n.response)?{imagePath:n.url}:{imagePath:n.response.data}}));t.fwItemReleaseImages=o,e.$api("user.reLease",t,!1).then((function(n){console.log("123123123"),200===n.code?e.showModel=!0:e.$refs.uToast.show({title:n.msg,type:"error"})}))}}))},knowConfirm:function(){this.form={},this.showModel=!1,e.navigateBack()}}};n.default=u}).call(this,t(2)["default"])},278:function(e,n,t){"use strict";t.r(n);var o=t(279),r=t.n(o);for(var u in o)["default"].indexOf(u)<0&&function(e){t.d(n,e,(function(){return o[e]}))}(u);n["default"]=r.a},279:function(e,n,t){},280:function(e,n,t){"use strict";t.r(n);var o=t(281),r=t.n(o);for(var u in o)["default"].indexOf(u)<0&&function(e){t.d(n,e,(function(){return o[e]}))}(u);n["default"]=r.a},281:function(e,n,t){}},[[272,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/propertyPass.js.map