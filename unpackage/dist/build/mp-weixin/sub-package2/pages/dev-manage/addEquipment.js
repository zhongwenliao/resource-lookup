require('../../common/vendor.js');(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package2/pages/dev-manage/addEquipment"],{"243f":function(e,n,t){"use strict";(function(e,n){var u=t("4ea4");t("27b1"),t("5c17");u(t("66fd"));var o=u(t("ad36"));e.__webpack_require_UNI_MP_PLUGIN__=t,n(o.default)}).call(this,t("bc2e")["default"],t("543d")["createPage"])},ad36:function(e,n,t){"use strict";t.r(n);var u=t("e6cc"),o=t("b1d2");for(var i in o)["default"].indexOf(i)<0&&function(e){t.d(n,e,(function(){return o[e]}))}(i);t("e993");var r=t("f0c5"),a=Object(r["a"])(o["default"],u["b"],u["c"],!1,null,"0f90784e",null,!1,u["a"],void 0);n["default"]=a.exports},b1d2:function(e,n,t){"use strict";t.r(n);var u=t("decf"),o=t.n(u);for(var i in u)["default"].indexOf(i)<0&&function(e){t.d(n,e,(function(){return u[e]}))}(i);n["default"]=o.a},cf91:function(e,n,t){},decf:function(e,n,t){"use strict";(function(e){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var t={data:function(){return{labelStyle:{fontSize:"34upx",fontWeight:"bold",color:"#333333"},positionTypeSelect:!1,form:{},positionTypeList:[{value:0,label:"园区"},{value:1,label:"楼栋"},{value:2,label:"房间"}],rules:{name:[{required:!0,message:"请输入设备名称",trigger:["blur"]}],deviceInstallAddress:[{required:!0,message:"请输入设备地址",trigger:"blur"}],devSn:[{required:!0,message:"请输入设备序列号",trigger:"blur"}],positionTypeName:[{required:!0,message:"请选择安装位置",trigger:["change"]}]}}},onReady:function(){this.$refs.uForm.setRules(this.rules)},methods:{goToScanList:function(){e.navigateTo({url:"/sub-package2/pages/dev-manage/scan-dev-list"})},onSubmit:function(){var n=this;this.$refs.uForm.validate((function(t){if(t){var u={devSn:n.form.devSn,name:n.form.name,deviceInstallAddress:n.form.deviceInstallAddress,positionType:n.form.positionType};n.$api("equipment.setDevDevice",u).then((function(n){e.showToast({title:n.msg||"请求出错,稍后重试",icon:"none",duration:500,mask:!0})})),console.log("验证通过")}else console.log("验证失败")}))},confirm:function(e){this.positionTypeSelect&&(this.form.positionTypeName=e[0].label,this.form.positionType=e[0].value)}},onLoad:function(){},onShow:function(){}};n.default=t}).call(this,t("543d")["default"])},e6cc:function(e,n,t){"use strict";t.d(n,"b",(function(){return o})),t.d(n,"c",(function(){return i})),t.d(n,"a",(function(){return u}));var u={uNavbar:function(){return t.e("uview-ui/components/u-navbar/u-navbar").then(t.bind(null,"55c8"))},uForm:function(){return t.e("uview-ui/components/u-form/u-form").then(t.bind(null,"c32f"))},uFormItem:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-form-item/u-form-item")]).then(t.bind(null,"2126"))},uInput:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-input/u-input")]).then(t.bind(null,"baf8"))},uSelect:function(){return t.e("uview-ui/components/u-select/u-select").then(t.bind(null,"a029"))},uButton:function(){return t.e("uview-ui/components/u-button/u-button").then(t.bind(null,"a3f3"))}},o=function(){var e=this,n=e.$createElement;e._self._c;e._isMounted||(e.e0=function(n){e.positionTypeSelect=!0})},i=[]},e993:function(e,n,t){"use strict";var u=t("cf91"),o=t.n(u);o.a}},[["243f","common/runtime","common/vendor"]]]);