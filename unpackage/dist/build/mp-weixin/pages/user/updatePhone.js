(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/user/updatePhone"],{"0269":function(n,e,t){},"22af":function(n,e,t){"use strict";t.r(e);var u=t("c293"),o=t.n(u);for(var r in u)"default"!==r&&function(n){t.d(e,n,(function(){return u[n]}))}(r);e["default"]=o.a},"90c1":function(n,e,t){"use strict";t.d(e,"b",(function(){return o})),t.d(e,"c",(function(){return r})),t.d(e,"a",(function(){return u}));var u={uNavbar:function(){return t.e("uview-ui/components/u-navbar/u-navbar").then(t.bind(null,"4a31"))},uForm:function(){return t.e("uview-ui/components/u-form/u-form").then(t.bind(null,"6e49"))},uFormItem:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-form-item/u-form-item")]).then(t.bind(null,"df5a"))},uInput:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-input/u-input")]).then(t.bind(null,"8151"))},uGap:function(){return t.e("uview-ui/components/u-gap/u-gap").then(t.bind(null,"4c8c"))},uVerificationCode:function(){return t.e("uview-ui/components/u-verification-code/u-verification-code").then(t.bind(null,"94d5"))},uButton:function(){return t.e("uview-ui/components/u-button/u-button").then(t.bind(null,"cfbe"))}},o=function(){var n=this,e=n.$createElement;n._self._c},r=[]},9210:function(n,e,t){"use strict";var u=t("0269"),o=t.n(u);o.a},aaef:function(n,e,t){},c293:function(n,e,t){"use strict";(function(n){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var t={data:function(){var e=this;return{codeTips:"",cellTitle:{fontSize:"30upx",letterSpacing:"2upx",color:"#333333"},form:{id:n.getStorageSync("userInfo").id,password:"",passwordTwo:""},rules:{password:[{required:!0,message:"请输入手机号",trigger:["blur"]},{validator:function(n,e,t){if(console.log(e),console.log(),/^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*).{6,20}$/.test(e))return!0;t(new Error("必须包含大写字母，小写字母和数字并长度在6-20"))},trigger:["blur"]}],passwordTwo:[{required:!0,message:"请输入验证码",trigger:["blur"]},{validator:function(n,t,u){if(/^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*).{6,20}$/.test(t)){if(t===e.form.password)return!0;u(new Error("密码不一致,请重新输入"))}else u(new Error("必须包含大写字母，小写字母和数字并长度在6-20"))},trigger:["blur"]}]}}},onReady:function(){this.$refs.uForm.setRules(this.rules)},methods:{codeChange:function(n){this.codeTips=n},getCode:function(){var e=this;this.$refs.uCode.canGetCode?(n.showLoading({title:"正在获取验证码",mask:!0}),setTimeout((function(){n.hideLoading(),e.$u.toast("验证码已发送"),e.$refs.uCode.start()}),2e3)):this.$u.toast("倒计时结束后再发送")},onSubmit:function(){this.$refs.uForm.validate((function(e){e&&n.showToast({title:res.msg||"修改成功",icon:"none",duration:1e3,mask:!0})}))}}};e.default=t}).call(this,t("543d")["default"])},cb67:function(n,e,t){"use strict";(function(n){t("0fcb"),t("5c17");u(t("66fd"));var e=u(t("d9dd"));function u(n){return n&&n.__esModule?n:{default:n}}wx.__webpack_require_UNI_MP_PLUGIN__=t,n(e.default)}).call(this,t("543d")["createPage"])},d513:function(n,e,t){"use strict";var u=t("aaef"),o=t.n(u);o.a},d9dd:function(n,e,t){"use strict";t.r(e);var u=t("90c1"),o=t("22af");for(var r in o)"default"!==r&&function(n){t.d(e,n,(function(){return o[n]}))}(r);t("9210"),t("d513");var i,a=t("f0c5"),c=Object(a["a"])(o["default"],u["b"],u["c"],!1,null,"0be168a8",null,!1,u["a"],i);e["default"]=c.exports}},[["cb67","common/runtime","common/vendor"]]]);