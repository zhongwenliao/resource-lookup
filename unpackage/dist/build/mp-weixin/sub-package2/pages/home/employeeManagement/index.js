require('../../../common/vendor.js');(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package2/pages/home/employeeManagement/index"],{5776:function(e,n,t){"use strict";(function(e,n){var o=t("4ea4");t("0fcb"),t("5c17");o(t("66fd"));var a=o(t("f454"));e.__webpack_require_UNI_MP_PLUGIN__=t,n(a.default)}).call(this,t("bc2e")["default"],t("543d")["createPage"])},6090:function(e,n,t){"use strict";(function(e){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var t={data:function(){return{zoneId:e.getStorageSync("zoneInfo").zoneId,bannerImage:e.getStorageSync("zoneInfo").logo,enterpriseId:e.getStorageSync("userInfo").enterpriseId,companyName:e.getStorageSync("userInfo").companyName,corporateLogo:"",topBackground:{backgroundImage:"url(https://file.yuanzhoulvwego.com/prod/uploadFiles/home/employeeManagement/beijintu.png)",backgroundSize:"100% 100%",backgroundRepeat:"no-repeat"},navbarBackground:{backgroundColor:""},dataList:[],titleStyle:{fontSize:"36upx",fontWeight:"bold",color:"#333333"},contentStyle:{textAlign:"center",margin:"30upx"},departName:""}},onShow:function(){var e=this;this.$nextTick((function(){e.$refs.paging.reload()}))},onLoad:function(){this.getContractInfo()},methods:{getContractInfo:function(){var e=this,n={enterpriseId:this.enterpriseId};this.$api("contract.getAllContractList",n).then((function(n){200==n.code&&(n.data.length>0?e.corporateLogo=n.data[0].enterpriseInfo.corporateLogo:e.corporateLogo="")})).catch((function(e){}))},getInfo:function(e,n){var t=this,o={ascs:"id",currPage:e,pageSize:n,enterpriseId:t.enterpriseId,zoneId:t.zoneId};t.$api("employeeManagement.departmentList",o).then((function(n){200==n.code?(1==e&&n.data.list.length>0&&(n.data.list[0].avaer="https://file.yuanzhoulvwego.com/prod/uploadFiles/home/employeeManagement/woren.png",n.data.list[1].avaer="https://file.yuanzhoulvwego.com/prod/uploadFiles/home/employeeManagement/woren.png"),t.$refs.paging.complete(n.data.list)):t.$refs.paging.complete(!1)})).catch((function(e){t.$refs.paging.complete(!1)}))},toStaffList:function(e){this.$Router.push({path:"/sub-package2/pages/home/employeeManagement/personnelList",query:e})},addDepartment:function(){this.$Router.push({path:"/sub-package2/pages/home/employeeManagement/departmentDetails"})},addStaff:function(){this.$Router.push({path:"/sub-package2/pages/home/employeeManagement/newStaff"})}}};n.default=t}).call(this,t("543d")["default"])},b564:function(e,n,t){},dbd3:function(e,n,t){"use strict";var o=t("b564"),a=t.n(o);a.a},e055:function(e,n,t){"use strict";t.d(n,"b",(function(){return a})),t.d(n,"c",(function(){return u})),t.d(n,"a",(function(){return o}));var o={zPaging:function(){return Promise.all([t.e("common/vendor"),t.e("uni_modules/z-paging/components/z-paging/z-paging")]).then(t.bind(null,"7ef8"))},uNavbar:function(){return t.e("uview-ui/components/u-navbar/u-navbar").then(t.bind(null,"4a31"))},uImage:function(){return t.e("uview-ui/components/u-image/u-image").then(t.bind(null,"b3a8"))},uLoading:function(){return t.e("uview-ui/components/u-loading/u-loading").then(t.bind(null,"d194"))},uCellGroup:function(){return t.e("uview-ui/components/u-cell-group/u-cell-group").then(t.bind(null,"cae0"))},uCellItem:function(){return t.e("uview-ui/components/u-cell-item/u-cell-item").then(t.bind(null,"caac"))}},a=function(){var e=this.$createElement;this._self._c},u=[]},ec9f:function(e,n,t){"use strict";t.r(n);var o=t("6090"),a=t.n(o);for(var u in o)["default"].indexOf(u)<0&&function(e){t.d(n,e,(function(){return o[e]}))}(u);n["default"]=a.a},f454:function(e,n,t){"use strict";t.r(n);var o=t("e055"),a=t("ec9f");for(var u in a)["default"].indexOf(u)<0&&function(e){t.d(n,e,(function(){return a[e]}))}(u);t("dbd3");var i=t("f0c5"),r=Object(i["a"])(a["default"],o["b"],o["c"],!1,null,"6a74054e",null,!1,o["a"],void 0);n["default"]=r.exports}},[["5776","common/runtime","common/vendor"]]]);