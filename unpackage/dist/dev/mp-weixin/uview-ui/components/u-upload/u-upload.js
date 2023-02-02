(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["uview-ui/components/u-upload/u-upload"],{1171:function(e,t,n){"use strict";n.r(t);var r=n(1172),o=n(1174);for(var i in o)["default"].indexOf(i)<0&&function(e){n.d(t,e,(function(){return o[e]}))}(i);n(1176);var s,a=n(39),u=Object(a["default"])(o["default"],r["render"],r["staticRenderFns"],!1,null,"0d33af60",null,!1,r["components"],s);u.options.__file="uview-ui/components/u-upload/u-upload.vue",t["default"]=u.exports},1172:function(e,t,n){"use strict";n.r(t);var r=n(1173);n.d(t,"render",(function(){return r["render"]})),n.d(t,"staticRenderFns",(function(){return r["staticRenderFns"]})),n.d(t,"recyclableRender",(function(){return r["recyclableRender"]})),n.d(t,"components",(function(){return r["components"]}))},1173:function(e,t,n){"use strict";var r;n.r(t),n.d(t,"render",(function(){return o})),n.d(t,"staticRenderFns",(function(){return s})),n.d(t,"recyclableRender",(function(){return i})),n.d(t,"components",(function(){return r}));try{r={uIcon:function(){return n.e("uview-ui/components/u-icon/u-icon").then(n.bind(null,987))},uLineProgress:function(){return n.e("uview-ui/components/u-line-progress/u-line-progress").then(n.bind(null,1407))}}}catch(a){if(-1===a.message.indexOf("Cannot find module")||-1===a.message.indexOf(".vue"))throw a;console.error(a.message),console.error("1. 排查组件名称拼写是否正确"),console.error("2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"),console.error("3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件")}var o=function(){var e=this,t=e.$createElement,n=(e._self._c,e.disabled?null:e.__map(e.lists,(function(t,n){var r=e.__get_orig(t),o=e.showUploadList?e.$u.addUnit(e.width):null,i=e.showUploadList?e.$u.addUnit(e.height):null;return{$orig:r,g0:o,g1:i}}))),r=e.disabled?null:e.lists.length,o=!e.disabled&&e.maxCount>r&&!e.customBtn?e.$u.addUnit(e.width):null,i=!e.disabled&&e.maxCount>r&&!e.customBtn?e.$u.addUnit(e.height):null;e.$mp.data=Object.assign({},{$root:{l0:n,g2:r,g3:o,g4:i}}),"augmented"===e.$scope.data.scopedSlotsCompiler&&e.$setScopedSlotsParams("file",{file:e.lists})},i=!1,s=[];o._withStripped=!0},1174:function(e,t,n){"use strict";n.r(t);var r=n(1175),o=n.n(r);for(var i in r)["default"].indexOf(i)<0&&function(e){n.d(t,e,(function(){return r[e]}))}(i);t["default"]=o.a},1175:function(e,t,n){"use strict";(function(e){var r=n(4);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var o=r(n(48)),i=r(n(50)),s=n(82),a={name:"u-upload",props:{showUploadList:{type:Boolean,default:!0},action:{type:String,default:"/image/web/add"},maxCount:{type:[String,Number],default:52},showProgress:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1},imageMode:{type:String,default:"aspectFill"},header:{type:Object,default:function(){return{Authorization:"Bearer ".concat(e.getStorageSync("tokenInfo")?e.getStorageSync("tokenInfo"):"")}}},formData:{type:Object,default:function(){return{}}},name:{type:String,default:"file"},sizeType:{type:Array,default:function(){return["original","compressed"]}},sourceType:{type:Array,default:function(){return["album","camera"]}},previewFullImage:{type:Boolean,default:!0},multiple:{type:Boolean,default:!0},deletable:{type:Boolean,default:!0},maxSize:{type:[String,Number],default:Number.MAX_VALUE},fileList:{type:Array,default:function(){return[]}},uploadText:{type:String,default:"选择图片"},autoUpload:{type:Boolean,default:!0},showTips:{type:Boolean,default:!0},customBtn:{type:Boolean,default:!1},width:{type:[String,Number],default:200},height:{type:[String,Number],default:200},delBgColor:{type:String,default:"#ffffff"},delColor:{type:String,default:"#666666"},delIcon:{type:String,default:"/static/quxiao.png"},toJson:{type:Boolean,default:!0},beforeUpload:{type:Function,default:null},beforeRemove:{type:Function,default:null},limitType:{type:Array,default:function(){return["png","jpg","jpeg","webp","gif","image"]}},index:{type:[Number,String],default:""}},mounted:function(){},data:function(){return{lists:[],isInCount:!0,uploading:!1}},watch:{formData:function(e){console.log(e),this.formData=e},fileList:{immediate:!0,handler:function(e){var t=this;console.log(e),e.map((function(e){if(""!=e.imageUrl){var n=t.lists.some((function(t){return t.imageUrl==e.imageUrl}));!n&&t.lists.push({url:e.imageUrl,error:!1,progress:100,data:e})}}))}},lists:function(e){this.$emit("on-list-change",e,this.index)}},methods:{clear:function(){this.lists=[]},reUpload:function(){this.uploadFile()},selectFile:function(){var t=this;if(!this.disabled){this.name;var n=this.maxCount,r=this.multiple,o=this.maxSize,i=this.sizeType,s=this.lists,a=(this.camera,this.compressed,this.maxDuration,this.sourceType),u=null,l=n-s.length;u=new Promise((function(t,n){e.chooseImage({count:r?l>9?9:l:1,sourceType:a,sizeType:i,success:t,fail:n})})),u.then((function(e){t.lists.length;e.tempFiles.map((function(e,n){t.checkFileExt(e)&&(!r&&n>=1||(console.log(e.size),console.log(o)))}))})).catch((function(e){t.$emit("on-choose-fail",e)}))}},showToast:function(t){var n=arguments.length>1&&void 0!==arguments[1]&&arguments[1];(this.showTips||n)&&e.showToast({title:t,icon:"none"})},upload:function(){this.uploadFile()},retry:function(t){this.lists[t].progress=0,this.lists[t].error=!1,this.lists[t].response=null,e.showLoading({title:"重新上传"}),this.uploadFile(t)},doRequest:function(){var t=this;return(0,i.default)(o.default.mark((function n(){var r;return o.default.wrap((function(n){while(1)switch(n.prev=n.next){case 0:return n.prev=0,n.next=3,t.getNewToken();case 3:if(r=n.sent,200!=r[1].data.code){n.next=13;break}return e.setStorageSync("tokenInfo",r[1].data.access_token),e.setStorageSync("refreshToken",r[1].data.refresh_token),t.header.Authorization="Bearer "+r[1].data.access_token,n.next=10,t.uploadFile();case 10:n.sent,n.next=14;break;case 13:throw"暂未登录,已阻止此次API请求~";case 14:n.next=19;break;case 16:n.prev=16,n.t0=n["catch"](0),e.showToast({title:"登录会话已过期，请重新登录",icon:"none",duration:1e3,mask:!0});case 19:case"end":return n.stop()}}),n,null,[[0,16]])})))()},getNewToken:function(){return(0,i.default)(o.default.mark((function t(){var n;return o.default.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return n=e.getStorageSync("refreshToken"),t.next=3,e.request({method:"post",header:{"content-type":"application/x-www-form-urlencoded"},data:{client_id:"c2",client_secret:"secret",grant_type:"refresh_token",refresh_token:n},url:s.API_URL+"/auth/oauth/token"});case 3:return t.abrupt("return",t.sent);case 4:case"end":return t.stop()}}),t)})))()},uploadFile:function(){var t=arguments,n=this;return(0,i.default)(o.default.mark((function r(){var i,a,u;return o.default.wrap((function(r){while(1)switch(r.prev=r.next){case 0:if(i=t.length>0&&void 0!==t[0]?t[0]:0,!n.disabled){r.next=3;break}return r.abrupt("return");case 3:if(!n.uploading){r.next=5;break}return r.abrupt("return");case 5:if(!(i>=n.lists.length)){r.next=8;break}return n.$emit("on-uploaded",n.lists,n.index),r.abrupt("return");case 8:if(100!=n.lists[i].progress){r.next=11;break}return 0==n.autoUpload&&n.uploadFile(i+1),r.abrupt("return");case 11:if(!n.beforeUpload||"function"!==typeof n.beforeUpload){r.next=22;break}if(a=n.beforeUpload.bind(n.$u.$parent.call(n))(i,n.lists,n.fileList),!a||"function"!==typeof a.then){r.next=18;break}return r.next=16,a.then((function(e){})).catch((function(e){return n.uploadFile(i+1)}));case 16:r.next=22;break;case 18:if(!1!==a){r.next=22;break}return r.abrupt("return",n.uploadFile(i+1));case 22:if(n.action){r.next=25;break}return n.showToast("请配置上传地址",!0),r.abrupt("return");case 25:n.lists[i].error=!1,n.uploading=!0,e.showLoading({mask:!0}),u=e.uploadFile({url:s.IMG_URL+n.action,filePath:n.lists[i].url,name:n.name,formData:n.formData,header:n.header,success:function(t){e.hideLoading(),console.log(t);var r=n.$u.test.jsonString(t.data)?JSON.parse(t.data):t.data;[200,201,204].includes(t.statusCode)?401==r.code?(n.lists[i].progress=0,n.lists[i].error=!0,n.lists[i].response=null,n.doRequest()):200!=r.code?n.uploadError(i,r):(n.lists[i].response=r,n.lists[i].progress=100,n.lists[i].error=!1,n.$emit("on-success",r,i,n.lists,n.index)):n.uploadError(i,r)},fail:function(e){n.uploadError(i,e)},complete:function(t){e.hideLoading(),n.uploading=!1,n.uploadFile(i+1),n.$emit("on-change",t,i,n.lists,n.index)}}),u.onProgressUpdate((function(e){e.progress>0&&n.$emit("on-progress",e,i,n.lists,n.index)}));case 30:case"end":return r.stop()}}),r)})))()},uploadError:function(e,t){this.lists[e].progress=0,this.lists[e].error=!0,this.lists[e].response=null,this.$emit("on-error",t,e,this.lists,this.index),this.showToast("上传失败，请重试")},deleteItem:function(t){var n=this;e.showModal({title:"提示",content:"您确定要删除此项吗？",success:function(){var e=(0,i.default)(o.default.mark((function e(r){var i;return o.default.wrap((function(e){while(1)switch(e.prev=e.next){case 0:if(!r.confirm){e.next=12;break}if(!n.beforeRemove||"function"!==typeof n.beforeRemove){e.next=11;break}if(i=n.beforeRemove.bind(n.$u.$parent.call(n))(t,n.lists),!i||"function"!==typeof i.then){e.next=8;break}return e.next=6,i.then((function(e){n.handlerDeleteItem(t)})).catch((function(e){n.showToast("已终止移除")}));case 6:e.next=9;break;case 8:!1===i?n.showToast("已终止移除"):n.handlerDeleteItem(t);case 9:e.next=12;break;case 11:n.handlerDeleteItem(t);case 12:case"end":return e.stop()}}),e)})));function r(t){return e.apply(this,arguments)}return r}()})},handlerDeleteItem:function(e){this.lists[e].process<100&&this.lists[e].process>0&&"undefined"!=typeof this.lists[e].uploadTask&&this.lists[e].uploadTask.abort(),this.lists.splice(e,1),this.$forceUpdate(),this.$emit("on-remove",e,this.lists,this.fileList,this.index),this.showToast("移除成功")},remove:function(e){e>=0&&e<this.lists.length&&(this.lists.splice(e,1),this.$emit("on-list-change",this.lists,this.index))},doPreviewImage:function(t,n){var r=this;if(this.previewFullImage){var o=this.lists.map((function(e){return e.url||e.path}));e.previewImage({urls:o,current:t,success:function(){r.$emit("on-preview",t,r.lists,r.index)},fail:function(){e.showToast({title:"预览图片失败",icon:"none"})}})}},checkFileExt:function(e){var t=!1,n="",r=/.+\./;return n=e.path.replace(r,"").toLowerCase(),t=this.limitType.some((function(e){return e.toLowerCase()===n})),t||this.showToast("不允许选择".concat(n,"格式的文件")),t}}};t.default=a}).call(this,n(2)["default"])},1176:function(e,t,n){"use strict";n.r(t);var r=n(1177),o=n.n(r);for(var i in r)["default"].indexOf(i)<0&&function(e){n.d(t,e,(function(){return r[e]}))}(i);t["default"]=o.a},1177:function(e,t,n){}}]);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/uview-ui/components/u-upload/u-upload.js.map
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'uview-ui/components/u-upload/u-upload-create-component',
    {
        'uview-ui/components/u-upload/u-upload-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('2')['createComponent'](__webpack_require__(1171))
        })
    },
    [['uview-ui/components/u-upload/u-upload-create-component']]
]);
