(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/dev-manage/addEquipment"],{"3c9a":function(e,n,t){"use strict";(function(e){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var t={data:function(){return{labelStyle:{fontSize:"34upx",fontWeight:"bold",color:"#333333"},positionTypeSelect:!1,form:{},positionTypeList:[{value:0,label:"园区"},{value:1,label:"楼栋"},{value:2,label:"房间"}],rules:{name:[{required:!0,message:"请输入设备名称",trigger:["blur"]}],deviceInstallAddress:[{required:!0,message:"请输入设备地址",trigger:"blur"}],devSn:[{required:!0,message:"请输入设备序列号",trigger:"blur"}],positionTypeName:[{required:!0,message:"请选择安装位置",trigger:["change"]}]}}},onReady:function(){this.$refs.uForm.setRules(this.rules)},methods:{goToScanList:function(){e.navigateTo({url:"/pages/dev-manage/scan-dev-list"})},onSubmit:function(){var n=this;this.$refs.uForm.validate((function(t){if(t){var o={devSn:n.form.devSn,name:n.form.name,deviceInstallAddress:n.form.deviceInstallAddress,positionType:n.form.positionType};n.$api("equipment.setDevDevice",o).then((function(n){e.showToast({title:n.msg||"请求出错,稍后重试",icon:"none",duration:500,mask:!0})})),console.log("验证通过")}else console.log("验证失败")}))},confirm:function(e){this.positionTypeSelect&&(this.form.positionTypeName=e[0].label,this.form.positionType=e[0].value)}},onLoad:function(){},onShow:function(){}};n.default=t}).call(this,t("543d")["default"])},"3f5d":function(e,n,t){"use strict";t.r(n);var o=t("3c9a"),u=t.n(o);for(var i in o)["default"].indexOf(i)<0&&function(e){t.d(n,e,(function(){return o[e]}))}(i);n["default"]=u.a},"54fc":function(e,n,t){"use strict";t.r(n);var o=t("81a9"),u=t("3f5d");for(var i in u)["default"].indexOf(i)<0&&function(e){t.d(n,e,(function(){return u[e]}))}(i);t("9291");var r=t("f0c5"),a=Object(r["a"])(u["default"],o["b"],o["c"],!1,null,"32f5d908",null,!1,o["a"],void 0);n["default"]=a.exports},"64eb":function(e,n,t){"use strict";(function(e){var n=t("4ea4");t("0fcb"),t("5c17");n(t("66fd"));var o=n(t("54fc"));wx.__webpack_require_UNI_MP_PLUGIN__=t,e(o.default)}).call(this,t("543d")["createPage"])},"81a9":function(e,n,t){"use strict";t.d(n,"b",(function(){return u})),t.d(n,"c",(function(){return i})),t.d(n,"a",(function(){return o}));var o={uNavbar:function(){return t.e("uview-ui/components/u-navbar/u-navbar").then(t.bind(null,"4a31"))},uForm:function(){return t.e("uview-ui/components/u-form/u-form").then(t.bind(null,"6e49"))},uFormItem:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-form-item/u-form-item")]).then(t.bind(null,"df5a"))},uInput:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-input/u-input")]).then(t.bind(null,"8151"))},uSelect:function(){return t.e("uview-ui/components/u-select/u-select").then(t.bind(null,"f9c3"))},uButton:function(){return t.e("uview-ui/components/u-button/u-button").then(t.bind(null,"cfbe"))}},u=function(){var e=this,n=e.$createElement;e._self._c;e._isMounted||(e.e0=function(n){e.positionTypeSelect=!0})},i=[]},"8cfd":function(e,n,t){},9291:function(e,n,t){"use strict";var o=t("8cfd"),u=t.n(o);u.a}},[["64eb","common/runtime","common/vendor"]]]);