(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/user/propertyPass"],{"03a1":function(e,n,t){"use strict";var o=t("b2e3"),u=t.n(o);u.a},"0e1e":function(e,n,t){"use strict";(function(e){var o=t("4ea4");Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var u=o(t("9523")),i={data:function(){var n;return n={id:1,params:{year:!0,month:!0,day:!0,hour:!1,minute:!1,second:!1},show:!1,zoneId:e.getStorageSync("zoneInfo").zoneId,enterpriseId:e.getStorageSync("userInfo").enterpriseId},(0,u.default)(n,"id",e.getStorageSync("userInfo").id),(0,u.default)(n,"roomIdSelect",!1),(0,u.default)(n,"repairTypeSelect",!1),(0,u.default)(n,"showModel",!1),(0,u.default)(n,"form",{livePhoto:[],fwItemReleaseDetails:[{name:"",count:""}]}),(0,u.default)(n,"roomIdSelectList",[]),(0,u.default)(n,"repairTypeSelectList",[]),(0,u.default)(n,"labelStyle",{fontSize:"34upx",fontWeight:"bold",color:"#333333"}),(0,u.default)(n,"action","/image/web/add"),(0,u.default)(n,"rules",{phone:[{required:!0,message:"请输入号码",trigger:["change","blur"]}],roomName:[{required:!0,message:"请选择房间号",trigger:["change","blur"]}],movingDate:[{required:!0,message:"请选择搬运日期",trigger:["change","blur"]}],name:[{required:!0,message:"请输入物品名称",trigger:["blur"]}],count:[{required:!0,message:"请输入物品数量",trigger:["blur"]}]}),n},onReady:function(){this.$refs.uForm.setRules(this.rules)},onLoad:function(){this.getRoomListByEnterpriseId()},methods:{record:function(){this.$Router.push({path:"/pages/user/releaseRecord"})},addItem:function(){this.form.fwItemReleaseDetails.push({name:"",count:""})},delItem:function(e){this.form.fwItemReleaseDetails=this.form.fwItemReleaseDetails.filter((function(n){return n!=e}))},change:function(e){console.log(e),this.form.movingDate=e.year+"-"+e.month+"-"+e.day},getRoomListByEnterpriseId:function(){var e=this,n={enterpriseId:this.enterpriseId,zoneId:this.zoneId};this.$api("employeeManagement.getRoomListByEnterpriseId",n,!1).then((function(n){if(200==n.code){var t=n.data;t.forEach((function(e){e.name=e.buildIngName})),e.roomIdSelectList=t,e.form.roomName=t[0].buildIngName+"/"+t[0].children[0].name,e.form.roomId=t[0].children[0].id}}))},confirm:function(e){this.roomIdSelect&&(this.form.roomName=e[0].label+"/"+e[1].label,this.form.roomId=e[1].value),this.repairTypeSelect&&(this.form.classificationName=e[0].label,this.form.classificationId=e[0].value)},listChange:function(e,n){this.form.livePhoto=e},uploadSuccess:function(e,n,t,o){200==e.code&&(this.form.livePhoto=t)},onSubmit:function(){var e=this;this.$refs.uForm.validate((function(n){if(n){console.log("lplp");var t={userId:e.id,phone:e.form.phone,roomId:e.form.roomId,movingDate:e.form.movingDate,fwItemReleaseDetails:[]};if(e.form.fwItemReleaseDetails.forEach((function(e){t.fwItemReleaseDetails.push({count:+e.count,name:e.name})})),console.log("123321"),!(e.form.livePhoto&&e.form.livePhoto.length>0))return e.$refs.uToast.show({title:"请上传照片！",type:"error"}),!1;var o=e.form.livePhoto.map((function(n){return e.$u.test.isEmpty(n.response)?{imagePath:n.url}:{imagePath:n.response.data}}));t.fwItemReleaseImages=o,e.$api("user.reLease",t,!1).then((function(n){console.log("123123123"),200===n.code?e.showModel=!0:e.$refs.uToast.show({title:n.msg,type:"error"})}))}}))},knowConfirm:function(){this.form={},this.showModel=!1,e.navigateBack()}}};n.default=i}).call(this,t("543d")["default"])},"314e":function(e,n,t){},3547:function(e,n,t){"use strict";t.r(n);var o=t("befd"),u=t("936c");for(var i in u)["default"].indexOf(i)<0&&function(e){t.d(n,e,(function(){return u[e]}))}(i);t("03a1"),t("4353");var r=t("f0c5"),a=Object(r["a"])(u["default"],o["b"],o["c"],!1,null,"8f804954",null,!1,o["a"],void 0);n["default"]=a.exports},4353:function(e,n,t){"use strict";var o=t("314e"),u=t.n(o);u.a},"936c":function(e,n,t){"use strict";t.r(n);var o=t("0e1e"),u=t.n(o);for(var i in o)["default"].indexOf(i)<0&&function(e){t.d(n,e,(function(){return o[e]}))}(i);n["default"]=u.a},aab8:function(e,n,t){"use strict";(function(e){var n=t("4ea4");t("0fcb"),t("5c17");n(t("66fd"));var o=n(t("3547"));wx.__webpack_require_UNI_MP_PLUGIN__=t,e(o.default)}).call(this,t("543d")["createPage"])},b2e3:function(e,n,t){},befd:function(e,n,t){"use strict";t.d(n,"b",(function(){return u})),t.d(n,"c",(function(){return i})),t.d(n,"a",(function(){return o}));var o={uNavbar:function(){return t.e("uview-ui/components/u-navbar/u-navbar").then(t.bind(null,"4a31"))},uForm:function(){return t.e("uview-ui/components/u-form/u-form").then(t.bind(null,"6e49"))},uFormItem:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-form-item/u-form-item")]).then(t.bind(null,"df5a"))},uInput:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-input/u-input")]).then(t.bind(null,"8151"))},uIcon:function(){return t.e("uview-ui/components/u-icon/u-icon").then(t.bind(null,"fefa"))},uUpload:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-upload/u-upload")]).then(t.bind(null,"7a80"))},uImage:function(){return t.e("uview-ui/components/u-image/u-image").then(t.bind(null,"b3a8"))},uButton:function(){return t.e("uview-ui/components/u-button/u-button").then(t.bind(null,"cfbe"))},uPicker:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-picker/u-picker")]).then(t.bind(null,"2a88"))},uSelect:function(){return t.e("uview-ui/components/u-select/u-select").then(t.bind(null,"f9c3"))},uModal:function(){return t.e("uview-ui/components/u-modal/u-modal").then(t.bind(null,"ebfb"))},uToast:function(){return t.e("uview-ui/components/u-toast/u-toast").then(t.bind(null,"4663"))}},u=function(){var e=this,n=e.$createElement;e._self._c;e._isMounted||(e.e0=function(n){e.roomIdSelect=!0},e.e1=function(n){e.show=!0})},i=[]}},[["aab8","common/runtime","common/vendor"]]]);