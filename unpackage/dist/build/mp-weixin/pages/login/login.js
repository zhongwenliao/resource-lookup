(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/login/login"],{"147b":function(e,n,t){"use strict";t.d(n,"b",(function(){return u})),t.d(n,"c",(function(){return i})),t.d(n,"a",(function(){return o}));var o={uImage:function(){return t.e("uview-ui/components/u-image/u-image").then(t.bind(null,"b3a8"))},uRow:function(){return t.e("uview-ui/components/u-row/u-row").then(t.bind(null,"a869"))},uCol:function(){return t.e("uview-ui/components/u-col/u-col").then(t.bind(null,"5563"))},uInput:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-input/u-input")]).then(t.bind(null,"8151"))},uButton:function(){return t.e("uview-ui/components/u-button/u-button").then(t.bind(null,"cfbe"))}},u=function(){var e=this.$createElement;this._self._c},i=[]},2677:function(e,n,t){"use strict";t.r(n);var o=t("c096"),u=t.n(o);for(var i in o)["default"].indexOf(i)<0&&function(e){t.d(n,e,(function(){return o[e]}))}(i);n["default"]=u.a},2843:function(e,n,t){},"7dcf":function(e,n,t){"use strict";t.r(n);var o=t("147b"),u=t("2677");for(var i in u)["default"].indexOf(i)<0&&function(e){t.d(n,e,(function(){return u[e]}))}(i);t("b79c");var r=t("f0c5"),s=Object(r["a"])(u["default"],o["b"],o["c"],!1,null,"079dd1a4",null,!1,o["a"],void 0);n["default"]=s.exports},b79c:function(e,n,t){"use strict";var o=t("2843"),u=t.n(o);u.a},c096:function(e,n,t){"use strict";(function(e){var o=t("4ea4");Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var u,i=o(t("9523")),r=t("26cb");function s(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);n&&(o=o.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,o)}return t}function c(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?s(Object(t),!0).forEach((function(n){(0,i.default)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):s(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}var a={data:function(){return{flag:!1,customStyle:{fontSize:"32upx"},customStyle2:{fontSize:"32upx",color:"#3E76F4"},type:2e3,code:"",username:"",password:"",codeText:"获取验证码",readonly:!1,isIos:!0}},onLoad:function(e){},onShow:function(){},mounted:function(){var n=e.getStorageSync("username"),t=e.getStorageSync("password");n&&t?(this.username=n,this.password=t):(this.loginname="",this.password="")},methods:c(c({},(0,r.mapActions)(["setTokenAndBack"])),{},{onPageJump:function(e){console.log(e),this.$Router.push({path:e})},getCodeState:function(){u&&clearInterval(u);var e=this;this.readonly=!0,this.codeText="60S后重新获取";var n=60;u=setInterval((function(){n--,e.codeText=n+"S后重新获取",n<=0&&(clearInterval(u),e.codeText="获取验证码",e.readonly=!1)}),1e3)},onSetCode:function(){var n=this;this.username?this.$base.usernameRegular.test(this.username)?this.$http.post("api/common/v1/send_sms",{username:this.username,type:2e3}).then((function(e){n.getCodeState()})):e.showToast({title:"手机号格式不正确",icon:"none"}):e.showToast({title:"请输入手机号",icon:"none"})},onSubmit:function(){var n=this;e.showLoading({title:"加载中"});var t={grant_type:"password",client_id:"client_user",client_secret:"secret",username:this.username,password:this.password};this.$api("user.login",t).then((function(t){200==t.code?(e.setStorageSync("username",n.username),e.setStorageSync("password",n.password),n.setTokenAndBack({data:t,username:n.username})):e.showToast({title:t.message||"请求出错,稍后重试",icon:"none",duration:1e3,mask:!0})})).catch((function(n){e.hideLoading()}))},onWxAppLogin:function(){var n=this;e.login({provider:"weixin",success:function(t){t.authResult.openid&&t.authResult.unionid?n.$http.post("api/open/v1/login",{wxAppOpenId:t.authResult.openid,unionid:t.authResult.unionid}).then((function(o){n.setUserInfo(c({openId:t.authResult.openid,unionid:t.authResult.unionid},o)),o.thirdLoginSuccess?(socket.init(),e.showToast({title:"登录成功",duration:2e3}),setTimeout((function(){e.navigateBack()}),2e3)):e.showModal({title:"提示",content:"您还未绑定手机号，请先绑定~",confirmText:"去绑定",cancelText:"再逛会",success:function(n){n.confirm&&e.redirectTo({url:"/pages/user/bindusername"})}})})):e.showToast({title:"数据缺失，请重新点击",icon:"none"})}})}}),onHide:function(){},onUnload:function(){},onPullDownRefresh:function(){},onReachBottom:function(){},onShareAppMessage:function(e){return this.wxShare()}};n.default=a}).call(this,t("543d")["default"])},cdaf:function(e,n,t){"use strict";(function(e,n){var o=t("4ea4");t("0fcb"),t("5c17");o(t("66fd"));var u=o(t("7dcf"));e.__webpack_require_UNI_MP_PLUGIN__=t,n(u.default)}).call(this,t("bc2e")["default"],t("543d")["createPage"])}},[["cdaf","common/runtime","common/vendor"]]]);