(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/user/updatePhone"],{182:function(n,e,t){"use strict";(function(n){var e=t(3);t(25),t(26);e(t(24));var r=e(t(183));wx.__webpack_require_UNI_MP_PLUGIN__=t,n(r.default)}).call(this,t(1)["createPage"])},183:function(n,e,t){"use strict";t.r(e);var r=t(184),o=t(186);for(var u in o)["default"].indexOf(u)<0&&function(n){t.d(e,n,(function(){return o[n]}))}(u);t(188),t(190);var i,c=t(38),s=Object(c["default"])(o["default"],r["render"],r["staticRenderFns"],!1,null,"6bd03dda",null,!1,r["components"],i);s.options.__file="pages/user/updatePhone.vue",e["default"]=s.exports},184:function(n,e,t){"use strict";t.r(e);var r=t(185);t.d(e,"render",(function(){return r["render"]})),t.d(e,"staticRenderFns",(function(){return r["staticRenderFns"]})),t.d(e,"recyclableRender",(function(){return r["recyclableRender"]})),t.d(e,"components",(function(){return r["components"]}))},185:function(n,e,t){"use strict";var r;t.r(e),t.d(e,"render",(function(){return o})),t.d(e,"staticRenderFns",(function(){return i})),t.d(e,"recyclableRender",(function(){return u})),t.d(e,"components",(function(){return r}));try{r={uNavbar:function(){return t.e("uview-ui/components/u-navbar/u-navbar").then(t.bind(null,979))},uForm:function(){return t.e("uview-ui/components/u-form/u-form").then(t.bind(null,1099))},uFormItem:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-form-item/u-form-item")]).then(t.bind(null,1106))},uInput:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-input/u-input")]).then(t.bind(null,1084))},uGap:function(){return t.e("uview-ui/components/u-gap/u-gap").then(t.bind(null,1042))},uVerificationCode:function(){return t.e("uview-ui/components/u-verification-code/u-verification-code").then(t.bind(null,1130))},uButton:function(){return t.e("uview-ui/components/u-button/u-button").then(t.bind(null,1092))}}}catch(c){if(-1===c.message.indexOf("Cannot find module")||-1===c.message.indexOf(".vue"))throw c;console.error(c.message),console.error("1. 排查组件名称拼写是否正确"),console.error("2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"),console.error("3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件")}var o=function(){var n=this,e=n.$createElement;n._self._c},u=!1,i=[];o._withStripped=!0},186:function(n,e,t){"use strict";t.r(e);var r=t(187),o=t.n(r);for(var u in r)["default"].indexOf(u)<0&&function(n){t.d(e,n,(function(){return r[n]}))}(u);e["default"]=o.a},187:function(n,e,t){"use strict";(function(n){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var t={data:function(){var e=this;return{codeTips:"",cellTitle:{fontSize:"30upx",letterSpacing:"2upx",color:"#333333"},form:{id:n.getStorageSync("userInfo").id,password:"",passwordTwo:""},rules:{password:[{required:!0,message:"请输入手机号",trigger:["blur"]},{validator:function(n,e,t){if(console.log(e),console.log(),/^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*).{6,20}$/.test(e))return!0;t(new Error("必须包含大写字母，小写字母和数字并长度在6-20"))},trigger:["blur"]}],passwordTwo:[{required:!0,message:"请输入验证码",trigger:["blur"]},{validator:function(n,t,r){if(/^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*).{6,20}$/.test(t)){if(t===e.form.password)return!0;r(new Error("密码不一致,请重新输入"))}else r(new Error("必须包含大写字母，小写字母和数字并长度在6-20"))},trigger:["blur"]}]}}},onReady:function(){this.$refs.uForm.setRules(this.rules)},methods:{codeChange:function(n){this.codeTips=n},getCode:function(){var e=this;this.$refs.uCode.canGetCode?(n.showLoading({title:"正在获取验证码",mask:!0}),setTimeout((function(){n.hideLoading(),e.$u.toast("验证码已发送"),e.$refs.uCode.start()}),2e3)):this.$u.toast("倒计时结束后再发送")},onSubmit:function(){this.$refs.uForm.validate((function(e){e&&n.showToast({title:res.msg||"修改成功",icon:"none",duration:1e3,mask:!0})}))}}};e.default=t}).call(this,t(1)["default"])},188:function(n,e,t){"use strict";t.r(e);var r=t(189),o=t.n(r);for(var u in r)["default"].indexOf(u)<0&&function(n){t.d(e,n,(function(){return r[n]}))}(u);e["default"]=o.a},189:function(n,e,t){},190:function(n,e,t){"use strict";t.r(e);var r=t(191),o=t.n(r);for(var u in r)["default"].indexOf(u)<0&&function(n){t.d(e,n,(function(){return r[n]}))}(u);e["default"]=o.a},191:function(n,e,t){}},[[182,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/updatePhone.js.map