(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/home/employeeManagement/staffDetails"],{3279:function(e,n,t){"use strict";t.d(n,"b",(function(){return u})),t.d(n,"c",(function(){return i})),t.d(n,"a",(function(){return o}));var o={uNavbar:function(){return t.e("uview-ui/components/u-navbar/u-navbar").then(t.bind(null,"55c8"))},uIcon:function(){return t.e("uview-ui/components/u-icon/u-icon").then(t.bind(null,"b0f5"))},uGap:function(){return t.e("uview-ui/components/u-gap/u-gap").then(t.bind(null,"b43b"))},uPopup:function(){return t.e("uview-ui/components/u-popup/u-popup").then(t.bind(null,"d418"))},uCellGroup:function(){return t.e("uview-ui/components/u-cell-group/u-cell-group").then(t.bind(null,"4a90"))},uCellItem:function(){return t.e("uview-ui/components/u-cell-item/u-cell-item").then(t.bind(null,"7d4d"))},uModal:function(){return t.e("uview-ui/components/u-modal/u-modal").then(t.bind(null,"514b"))}},u=function(){var e=this.$createElement;this._self._c},i=[]},"3b1a":function(e,n,t){"use strict";(function(e){var n=t("4ea4");t("27b1"),t("5c17");n(t("66fd"));var o=n(t("7bbfa"));wx.__webpack_require_UNI_MP_PLUGIN__=t,e(o.default)}).call(this,t("543d")["createPage"])},"7bbfa":function(e,n,t){"use strict";t.r(n);var o=t("3279"),u=t("b8cf");for(var i in u)["default"].indexOf(i)<0&&function(e){t.d(n,e,(function(){return u[e]}))}(i);t("81f8");var r=t("f0c5"),a=Object(r["a"])(u["default"],o["b"],o["c"],!1,null,"6e2eb256",null,!1,o["a"],void 0);n["default"]=a.exports},"81f8":function(e,n,t){"use strict";var o=t("b10f"),u=t.n(o);u.a},b10f:function(e,n,t){},b8cf:function(e,n,t){"use strict";t.r(n);var o=t("baf5"),u=t.n(o);for(var i in o)["default"].indexOf(i)<0&&function(e){t.d(n,e,(function(){return o[e]}))}(i);n["default"]=u.a},baf5:function(e,n,t){"use strict";(function(e){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var t={data:function(){return{forms:{},operationSelect:!1,showModel:!1,modelId:0,operationList:[{value:1,label:"编辑人员"},{value:2,label:"删除人员"}]}},onLoad:function(){this.getByIdEnterpriseUser(this.$Route.query.id)},methods:{getByIdEnterpriseUser:function(e){var n=this,t={id:e};this.$api("employeeManagement.getByIdEnterpriseUser",t).then((function(e){200==e.code&&(n.forms=e.data,n.forms.rooms.length>0||n.forms.cardNumber.length>0?n.forms.personnelAccess="已选权限":n.forms.personnelAccess="暂无选择")}))},openOperation:function(){this.operationSelect=!0},closeOperation:function(){this.operationSelect=!1},confirm:function(e){1===e.value?this.$Router.push({path:"/pages/home/employeeManagement/newStaff",query:this.forms}):(this.showModel=!0,this.modelId=e.value),this.closeOperation()},knowConfirm:function(){if(2===this.modelId){var n={ids:this.forms.id};this.$api("employeeManagement.delByIdsEnterpriseUser",n).then((function(n){200==n.code&&e.navigateBack()}))}else this.$Router.push({path:"/pages/home/employeeManagement/personnelList"})}}};n.default=t}).call(this,t("543d")["default"])}},[["3b1a","common/runtime","common/vendor"]]]);