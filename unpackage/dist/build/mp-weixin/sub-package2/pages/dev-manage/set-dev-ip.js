require('../../common/vendor.js');(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package2/pages/dev-manage/set-dev-ip"],{"395c":function(e,t,n){"use strict";n.r(t);var a=n("a833"),i=n("3efa");for(var s in i)["default"].indexOf(s)<0&&function(e){n.d(t,e,(function(){return i[e]}))}(s);n("6264");var c=n("f0c5"),u=Object(c["a"])(i["default"],a["b"],a["c"],!1,null,null,null,!1,a["a"],void 0);t["default"]=u.exports},"3deb":function(e,t,n){},"3efa":function(e,t,n){"use strict";n.r(t);var a=n("e7e7"),i=n.n(a);for(var s in a)["default"].indexOf(s)<0&&function(e){n.d(t,e,(function(){return a[e]}))}(s);t["default"]=i.a},6264:function(e,t,n){"use strict";var a=n("3deb"),i=n.n(a);i.a},a833:function(e,t,n){"use strict";n.d(t,"b",(function(){return i})),n.d(t,"c",(function(){return s})),n.d(t,"a",(function(){return a}));var a={uniBasePage:function(){return n.e("components/uni-base-page/uni-base-page").then(n.bind(null,"10e9"))}},i=function(){var e=this.$createElement;this._self._c},s=[]},d26b:function(e,t,n){"use strict";(function(e){var t=n("4ea4");n("0fcb"),n("5c17");t(n("66fd"));var a=t(n("395c"));wx.__webpack_require_UNI_MP_PLUGIN__=n,e(a.default)}).call(this,n("543d")["createPage"])},e7e7:function(e,t,n){"use strict";(function(e){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n={},a={data:function(){return{configParam:{staticIP:"",subnetMask:"",gateway:"",dnsServer:""},currentType:0,static:1,dynamic:2,dhcpEnable:1}},computed:{manage:function(){return this.$t("manage")},common:function(){return this.$t("common")},title:function(){return this.$t("title")}},onReady:function(){e.setNavigationBarTitle({title:this.title["set-dev-ip"]})},onLoad:function(e){var t=e.devObj;void 0!==t&&""!==t&&(n=JSON.parse(t))},methods:{changeType:function(e){0==e?(this.currentType=0,this.static=1,this.dynamic=2,this.dhcpEnable=1):1==e&&(this.currentType=1,this.dynamic=1,this.static=2,this.dhcpEnable=0)},settingDevIP:function(e){var t=this.$sdkUtil,a=this.configParam,i=[];0!==this.dhcpEnable&&(i=[{name:"staticIP",rules:[{required:!0,message:this.manage["no-ip"]||"IP地址不能为空"}]},{name:"subnetMask",rules:[{required:!0,message:this.manage["no-subnet-mask"]||"子网掩码不能为空"}]},{name:"gateway",rules:[{required:!0,message:this.manage["no-gateway"]||"网关不能为空"}]},{name:"dnsServer",rules:[{required:!0,message:this.manage["no-dns"]||"DNS服务器地址不能为空"}]}],a=e.detail.value),a.dhcpEnable=this.dhcpEnable,this.$formSubmitCheck({formData:a,checkList:i,success:function(){t.setDeviceStaticIP(n,a)}})}}};t.default=a}).call(this,n("543d")["default"])}},[["d26b","common/runtime","common/vendor"]]]);