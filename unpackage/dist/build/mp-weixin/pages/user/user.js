(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/user/user"],{"0dda":function(n,e,t){"use strict";var u=t("d66a"),o=t.n(u);o.a},"4eef":function(n,e,t){"use strict";var u=t("b7f0"),o=t.n(u);o.a},6135:function(n,e,t){"use strict";t.r(e);var u=t("a23e"),o=t.n(u);for(var r in u)["default"].indexOf(r)<0&&function(n){t.d(e,n,(function(){return u[n]}))}(r);e["default"]=o.a},"7a16":function(n,e,t){"use strict";(function(n){var e=t("4ea4");t("0fcb"),t("5c17");e(t("66fd"));var u=e(t("fc21"));wx.__webpack_require_UNI_MP_PLUGIN__=t,n(u.default)}).call(this,t("543d")["createPage"])},a23e:function(n,e,t){"use strict";(function(n){var u=t("4ea4");Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var o=u(t("2630")),r={data:function(){return{type:1,tabbar:o.default,userInfo:n.getStorageSync("userInfo")?n.getStorageSync("userInfo"):{},userName:n.getStorageSync("userInfo").userName,src:n.getStorageSync("userInfo")?n.getStorageSync("userInfo").avatar:"http://yuanzhoulvwego.com/wp-content/uploads/static/user/pic4.png",cellTitle:{color:"#333333",fontSize:"32upx",fontWeight:"bold",letterSpacing:"2upx"},count:0,gridList:[]}},onLoad:function(){},onShow:function(){this.userInfo.enterpriseId>0&&this.userInformationList(),this.src=n.getStorageSync("userInfo").avatar},methods:{goPage:function(n){this.$tools.routerTo(n.url,n,n.isTabBar)},userInformationList:function(){var n=this;this.$api("user.userInformationList",{currPage:1,pageSize:10}).then((function(e){200==e.code&&(n.count=e.data.totalCount,console.log("dddddd",e))})).catch((function(n){}))},goAboutUs:function(){this.$Router.push({path:"/pages/user/aboutUs"})},goMyInformation:function(){this.$Router.push({path:"/pages/user/myInformation"})},goSetting:function(){console.log(this.pageScrollTop),this.$Router.push({path:"/pages/user/setting"})},goUserInfo:function(){this.$Router.push({path:"/pages/user/userInfo"})}}};e.default=r}).call(this,t("543d")["default"])},b7f0:function(n,e,t){},bb55:function(n,e,t){"use strict";t.d(e,"b",(function(){return o})),t.d(e,"c",(function(){return r})),t.d(e,"a",(function(){return u}));var u={uNavbar:function(){return t.e("uview-ui/components/u-navbar/u-navbar").then(t.bind(null,"4a31"))},uIcon:function(){return t.e("uview-ui/components/u-icon/u-icon").then(t.bind(null,"fefa"))},uAvatar:function(){return t.e("uview-ui/components/u-avatar/u-avatar").then(t.bind(null,"8426"))},uGrid:function(){return t.e("uview-ui/components/u-grid/u-grid").then(t.bind(null,"b80a"))},uGridItem:function(){return t.e("uview-ui/components/u-grid-item/u-grid-item").then(t.bind(null,"b071"))},uBadge:function(){return t.e("uview-ui/components/u-badge/u-badge").then(t.bind(null,"0526"))},uLine:function(){return t.e("uview-ui/components/u-line/u-line").then(t.bind(null,"9ab0"))},uCellGroup:function(){return t.e("uview-ui/components/u-cell-group/u-cell-group").then(t.bind(null,"cae0"))},uCellItem:function(){return t.e("uview-ui/components/u-cell-item/u-cell-item").then(t.bind(null,"caac"))},uTabbar:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-tabbar/u-tabbar")]).then(t.bind(null,"e210"))}},o=function(){var n=this,e=n.$createElement,t=(n._self._c,n.userInfo.enterpriseId?n.__map(n.gridList,(function(e,t){var u=n.__get_orig(e),o=n.$permission([e.permission])||!e.permission;return{$orig:u,m0:o}})):null);n.$mp.data=Object.assign({},{$root:{l0:t}})},r=[]},d66a:function(n,e,t){},fc21:function(n,e,t){"use strict";t.r(e);var u=t("bb55"),o=t("6135");for(var r in o)["default"].indexOf(r)<0&&function(n){t.d(e,n,(function(){return o[n]}))}(r);t("4eef"),t("0dda");var i=t("f0c5"),a=Object(i["a"])(o["default"],u["b"],u["c"],!1,null,"e949295e",null,!1,u["a"],void 0);e["default"]=a.exports}},[["7a16","common/runtime","common/vendor"]]]);