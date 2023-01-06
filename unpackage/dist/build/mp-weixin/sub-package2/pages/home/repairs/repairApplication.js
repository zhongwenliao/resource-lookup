require('../../../common/vendor.js');(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package2/pages/home/repairs/repairApplication","sub-package2/components/my-textarea/my-textarea"],{"01c7":function(e,t,n){"use strict";n.r(t);var i=n("66f7"),o=n("5a2d");for(var r in o)["default"].indexOf(r)<0&&function(e){n.d(t,e,(function(){return o[e]}))}(r);n("29b6");var u=n("f0c5"),a=Object(u["a"])(o["default"],i["b"],i["c"],!1,null,null,null,!1,i["a"],void 0);t["default"]=a.exports},"03e0":function(e,t,n){"use strict";n.r(t);var i=n("181a"),o=n.n(i);for(var r in i)["default"].indexOf(r)<0&&function(e){n.d(t,e,(function(){return i[e]}))}(r);t["default"]=o.a},"03f0":function(e,t,n){"use strict";var i=n("b4c2"),o=n.n(i);o.a},"0b51":function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i={computed:{contentLength:function(){return this.content.length}},props:{value:{type:String,default:""},placeholder:{type:String,default:"请输入备注信息"},showLength:{type:Boolean,default:!0},maxlength:{type:Number,default:50}},data:function(){return{content:this.value}},watch:{value:function(e,t){this.content=e},content:function(e,t){this.$emit("update:value",e)}}};t.default=i},"181a":function(e,t,n){"use strict";(function(e){var i=n("4ea4");Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;i(n("01c7"));var o={data:function(){var t=this;return{zoneId:e.getStorageSync("zoneInfo").zoneId,enterpriseId:e.getStorageSync("userInfo").enterpriseId,userId:e.getStorageSync("userInfo").id,roomIdSelect:!1,repairTypeSelect:!1,showModel:!1,form:{},roomIdSelectList:[],repairTypeSelectList:[],labelStyle:{fontSize:"34upx",fontWeight:"bold",color:"#333333"},action:"/image/web/add",rules:{roomName:[{required:!0,message:"请选择房间号",trigger:["change"]}],repairer:[{required:!0,message:"请输入联系人",trigger:["blur"]}],phone:[{validator:function(e,n,i){if(t.$u.test.isEmpty(n))i(new Error("请输入手机号码"));else{if(t.$u.test.mobile(n))return!0;i(new Error("请输入正确的手机号码"))}},trigger:["blur"]}],classificationName:[{required:!0,message:"请选择报修类型",trigger:["change"]}]}}},onReady:function(){this.$refs.uForm.setRules(this.rules)},onLoad:function(){this.getRoomListByEnterpriseId(),this.getAllMaintainClassifyList()},methods:{getRoomListByEnterpriseId:function(){var e=this,t={enterpriseId:this.enterpriseId,zoneId:this.zoneId};this.$api("employeeManagement.getRoomListBySelf",t,!1).then((function(t){if(200==t.code){var n=t.data.filter((function(e){if(e.children.length>0&&(e.children=e.children.filter((function(e){if(e.children.length>0)return e})),e.children.length>0))return e}));e.roomIdSelectList=n}}))},getAllMaintainClassifyList:function(){var e=this,t={zoneId:this.zoneId};this.$api("repairs.getAllMaintainClassifyList",t,!1).then((function(t){200==t.code&&(e.repairTypeSelectList=t.data)}))},confirm:function(e){this.roomIdSelect&&(this.form.roomName=e[0].label+"/"+e[1].label+"/"+e[2].label,this.form.roomId=e[2].value),this.repairTypeSelect&&(this.form.classificationName=e[0].label,this.form.classificationId=e[0].value)},listChange:function(e,t){this.form.livePhoto=e},uploadSuccess:function(e,t,n,i){200==e.code&&(this.form.livePhoto=n)},onSubmit:function(){var e=this;this.$refs.uForm.validate((function(t){if(t)if(e.form.remark){var n=e.$u.deepClone(e.form);if(n.livePhoto&&n.livePhoto.length>0){var i=n.livePhoto.map((function(t){return e.$u.test.isEmpty(t.response)?t.url:t.response.data}));n.livePhoto=i.join(",")}n.enterpriseId=e.enterpriseId,n.userId=e.userId,e.$api("repairs.addMaintenanceInfo",n,!1).then((function(t){200===t.code?e.showModel=!0:e.$refs.uToast.show({title:t.msg,type:"error"})}))}else e.$refs.uToast.show({title:"请填写报修问题",type:"error"})}))},knowConfirm:function(){this.form={},this.showModel=!1,e.navigateBack()}}};t.default=o}).call(this,n("543d")["default"])},1939:function(e,t,n){"use strict";n.r(t);var i=n("6ec1"),o=n("03e0");for(var r in o)["default"].indexOf(r)<0&&function(e){n.d(t,e,(function(){return o[e]}))}(r);n("fd64"),n("03f0");var u=n("f0c5"),a=Object(u["a"])(o["default"],i["b"],i["c"],!1,null,"6711513a",null,!1,i["a"],void 0);t["default"]=a.exports},"29b6":function(e,t,n){"use strict";var i=n("6476"),o=n.n(i);o.a},"5a2d":function(e,t,n){"use strict";n.r(t);var i=n("0b51"),o=n.n(i);for(var r in i)["default"].indexOf(r)<0&&function(e){n.d(t,e,(function(){return i[e]}))}(r);t["default"]=o.a},6476:function(e,t,n){},"66f7":function(e,t,n){"use strict";n.d(t,"b",(function(){return i})),n.d(t,"c",(function(){return o})),n.d(t,"a",(function(){}));var i=function(){var e=this.$createElement;this._self._c},o=[]},"6ec1":function(e,t,n){"use strict";n.d(t,"b",(function(){return o})),n.d(t,"c",(function(){return r})),n.d(t,"a",(function(){return i}));var i={uNavbar:function(){return n.e("uview-ui/components/u-navbar/u-navbar").then(n.bind(null,"4a31"))},uForm:function(){return n.e("uview-ui/components/u-form/u-form").then(n.bind(null,"6e49"))},uFormItem:function(){return Promise.all([n.e("common/vendor"),n.e("uview-ui/components/u-form-item/u-form-item")]).then(n.bind(null,"df5a"))},uInput:function(){return Promise.all([n.e("common/vendor"),n.e("uview-ui/components/u-input/u-input")]).then(n.bind(null,"8151"))},uUpload:function(){return Promise.all([n.e("common/vendor"),n.e("uview-ui/components/u-upload/u-upload")]).then(n.bind(null,"7a80"))},uImage:function(){return n.e("uview-ui/components/u-image/u-image").then(n.bind(null,"b3a8"))},uButton:function(){return n.e("uview-ui/components/u-button/u-button").then(n.bind(null,"cfbe"))},uSelect:function(){return n.e("uview-ui/components/u-select/u-select").then(n.bind(null,"f9c3"))},uModal:function(){return n.e("uview-ui/components/u-modal/u-modal").then(n.bind(null,"ebfb"))},uLoading:function(){return n.e("uview-ui/components/u-loading/u-loading").then(n.bind(null,"d194"))},uToast:function(){return n.e("uview-ui/components/u-toast/u-toast").then(n.bind(null,"4663"))}},o=function(){var e=this,t=e.$createElement;e._self._c;e._isMounted||(e.e0=function(t){e.roomIdSelect=!0},e.e1=function(t){e.repairTypeSelect=!0})},r=[]},a57a:function(e,t,n){"use strict";(function(e){var t=n("4ea4");n("0fcb"),n("5c17");t(n("66fd"));var i=t(n("1939"));wx.__webpack_require_UNI_MP_PLUGIN__=n,e(i.default)}).call(this,n("543d")["createPage"])},b4c2:function(e,t,n){},cdfd:function(e,t,n){},fd64:function(e,t,n){"use strict";var i=n("cdfd"),o=n.n(i);o.a}},[["a57a","common/runtime","common/vendor"]]]);