(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/login/forget"],{"0ca2":function(n,e,t){"use strict";t.r(e);var o=t("2554"),r=t("8d92");for(var u in r)["default"].indexOf(u)<0&&function(n){t.d(e,n,(function(){return r[n]}))}(u);t("17b0");var i=t("f0c5"),a=Object(i["a"])(r["default"],o["b"],o["c"],!1,null,"24f3b5c1",null,!1,o["a"],void 0);e["default"]=a.exports},"17b0":function(n,e,t){"use strict";var o=t("87d9"),r=t.n(o);r.a},2554:function(n,e,t){"use strict";t.d(e,"b",(function(){return r})),t.d(e,"c",(function(){return u})),t.d(e,"a",(function(){return o}));var o={uNavbar:function(){return t.e("uview-ui/components/u-navbar/u-navbar").then(t.bind(null,"4a31"))},uGap:function(){return t.e("uview-ui/components/u-gap/u-gap").then(t.bind(null,"4c8c"))},uForm:function(){return t.e("uview-ui/components/u-form/u-form").then(t.bind(null,"6e49"))},uFormItem:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-form-item/u-form-item")]).then(t.bind(null,"df5a"))},uInput:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-input/u-input")]).then(t.bind(null,"8151"))},uButton:function(){return t.e("uview-ui/components/u-button/u-button").then(t.bind(null,"cfbe"))}},r=function(){var n=this.$createElement;this._self._c},u=[]},"6acb":function(n,e,t){"use strict";(function(n,e){var o=t("4ea4");t("0fcb"),t("5c17");o(t("66fd"));var r=o(t("0ca2"));n.__webpack_require_UNI_MP_PLUGIN__=t,e(r.default)}).call(this,t("bc2e")["default"],t("543d")["createPage"])},"87d9":function(n,e,t){},"8d92":function(n,e,t){"use strict";t.r(e);var o=t("f68d"),r=t.n(o);for(var u in o)["default"].indexOf(u)<0&&function(n){t.d(e,n,(function(){return o[n]}))}(u);e["default"]=r.a},f68d:function(n,e,t){"use strict";(function(n){var t;Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var o={data:function(){var n=this;return{fieldStyle:{padding:0,fontSize:"30upx"},form:{phone:"",password:"",code:"",confirmPassword:""},rules:{phone:[{required:!0,message:"请输入手机号",trigger:["change","blur"]},{validator:function(e,t,o){return n.$u.test.mobile(t)},message:"手机号码不正确",trigger:["change","blur"]}],code:[{required:!0,message:"请输入验证码",trigger:["blur"]}],password:[{required:!0,message:"请输入密码",trigger:["blur"]},{validator:function(n,e,t){if(console.log(e),console.log(),/^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*).{6,20}$/.test(e))return!0;t(new Error("必须包含大写字母，小写字母和数字并长度在6-20"))},trigger:["blur"]}],confirmPassword:[{required:!0,message:"请再次输入新密码",trigger:["blur"]},{validator:function(e,t,o){if(/^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*).{6,20}$/.test(t)){if(t===n.form.password)return!0;o(new Error("密码不一致,请重新输入"))}else o(new Error("必须包含大写字母，小写字母和数字并长度在6-20"))},trigger:["blur"]}]},codeText:"获取验证码",readonly:!1}},onReady:function(){this.$refs.uForm.setRules(this.rules)},onLoad:function(n){},onShow:function(){},methods:{getCode:function(){var e=this;if(this.readonly)n.showToast({title:"验证码已发送",icon:"none"});else if(this.form.phone){var t={phone:this.form.phone};this.$api("user.verificationCode",t).then((function(t){200==t.code?e.getCodeState():n.showToast({title:t.msg||"请求出错,稍后重试",icon:"none",duration:1e3,mask:!0})})).catch((function(e){n.hideLoading()}))}else n.showToast({title:"请输入手机号",icon:"none"})},getCodeState:function(){var n=this;this.readonly=!0,this.codeText="60S后重新获取";var e=60;t=setInterval((function(){e--,n.codeText=e+"S后重新获取",e<=0&&(clearInterval(t),n.codeText="获取验证码",n.readonly=!1)}),1e3)},onSubmit:function(){var e=this;this.$refs.uForm.validate((function(t){t&&e.$api("user.forgotPassword",e.form).then((function(t){n.showToast({title:t.msg||"修改成功",icon:"none",duration:1e3,mask:!0}),200==t.code&&setTimeout((function(){e.$Router.push({path:"/pages/login/login"})}),1e3)})).catch((function(n){console.log(n)}))}))}},onHide:function(){},onUnload:function(){},onPullDownRefresh:function(){},onReachBottom:function(){},onShareAppMessage:function(n){return this.wxShare()}};e.default=o}).call(this,t("543d")["default"])}},[["6acb","common/runtime","common/vendor"]]]);