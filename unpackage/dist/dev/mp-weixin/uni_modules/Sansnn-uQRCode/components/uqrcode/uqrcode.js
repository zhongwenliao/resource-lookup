(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["uni_modules/Sansnn-uQRCode/components/uqrcode/uqrcode"],{1215:function(e,t,n){"use strict";n.r(t);var i=n(1216),r=n(1218);for(var o in r)["default"].indexOf(o)<0&&function(e){n.d(t,e,(function(){return r[e]}))}(o);n(1220);var s,u=n(39),c=Object(u["default"])(r["default"],i["render"],i["staticRenderFns"],!1,null,null,null,!1,i["components"],s);c.options.__file="uni_modules/Sansnn-uQRCode/components/uqrcode/uqrcode.vue",t["default"]=c.exports},1216:function(e,t,n){"use strict";n.r(t);var i=n(1217);n.d(t,"render",(function(){return i["render"]})),n.d(t,"staticRenderFns",(function(){return i["staticRenderFns"]})),n.d(t,"recyclableRender",(function(){return i["recyclableRender"]})),n.d(t,"components",(function(){return i["components"]}))},1217:function(e,t,n){"use strict";var i;n.r(t),n.d(t,"render",(function(){return r})),n.d(t,"staticRenderFns",(function(){return s})),n.d(t,"recyclableRender",(function(){return o})),n.d(t,"components",(function(){return i}));var r=function(){var e=this,t=e.$createElement;e._self._c},o=!1,s=[];r._withStripped=!0},1218:function(e,t,n){"use strict";n.r(t);var i=n(1219),r=n.n(i);for(var o in i)["default"].indexOf(o)<0&&function(e){n.d(t,e,(function(){return i[e]}))}(o);t["default"]=r.a},1219:function(e,t,n){"use strict";(function(e){var i=n(4);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var r=i(n(11)),o=i(n(301));function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function u(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){(0,r.default)(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var c={name:"uqrcode",props:{id:{type:String,default:a()},mode:{type:String,default:"canvas"},text:String,size:{type:Number,default:256},margin:{type:Number,default:0},backgroundColor:{type:String,default:"#FFFFFF"},foregroundColor:{type:String,default:"#000000"},errorCorrectLevel:{type:[String,Number],default:o.default.errorCorrectLevel.H},typeNumber:{type:Number,default:-1},fileType:{type:String,default:"png"}},data:function(){return{canvasContext:null,makeing:!1,delegate:null,delegateParams:null,tempFilePath:"",isH5Save:!1,isReload:!1}},computed:{modules:function(){var e=u({},this.$props);return"string"===typeof e.errorCorrectLevel&&(e.errorCorrectLevel=o.default.errorCorrectLevel[e.errorCorrectLevel]),o.default.getModules(e)},tileSize:function(){return(this.size-2*this.margin)/this.modules.length}},watch:{$props:{handler:function(){this.reload()},deep:!0},makeing:function(e){e||"function"===typeof this.delegate&&this.delegate(this.delegateParams)}},mounted:function(){var e=this;this.$nextTick((function(){e.make()}))},methods:{reload:function(){var e=this;this.isReloadMake=!0,this.isReload=!0,this.$nextTick((function(){e.isReload=!1,e.$nextTick((function(){setTimeout((function(){e.make()}),150)}))}))},make:function(){var t=this;if(!this.makeing)if(this.makeing=!0,"canvas"===this.mode){var n=null;n=e.createCanvasContext(this.id,this),this.canvasContext=n,n.draw(),n.setFillStyle(this.backgroundColor),n.fillRect(0,0,this.size,this.size);for(var i=0;i<this.modules.length;i++)for(var r=0;r<this.modules.length;r++){var o=r*this.tileSize+this.margin,s=i*this.tileSize+this.margin,u=this.tileSize,c=this.tileSize,a=this.modules[i][r]?this.foregroundColor:this.backgroundColor;n.setFillStyle(a),n.fillRect(o,s,u,c)}n.draw(!1,(function(){t.complete()}))}else"view"===this.mode&&this.complete()},complete:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t={id:this.id,text:this.text,mode:this.mode},n=u(u({},t),e);this.makeing=!1,this.$emit("complete",n)},toTempFilePath:function(){var t=this,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if("function"!=typeof n.success&&(n.success=function(){}),"function"!=typeof n.fail&&(n.fail=function(){}),"function"!=typeof n.complete&&(n.complete=function(){}),this.makeing)return this.delegate=this.toTempFilePath,void(this.delegateParams=n);this.delegate=null,this.delegateParams=null;e.canvasToTempFilePath({canvasId:this.id,fileType:this.fileType,width:this.size,height:this.size,success:function(e){t.tempFilePath=e.tempFilePath,n.success(e)},fail:function(e){n.fail(e)},complete:function(e){n.complete(e)}},this)},save:function(){var t=this,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};"function"!=typeof n.success&&(n.success=function(){}),"function"!=typeof n.fail&&(n.fail=function(){}),"function"!=typeof n.complete&&(n.complete=function(){}),this.toTempFilePath({success:function(i){e.saveImageToPhotosAlbum({filePath:t.tempFilePath,success:function(e){n.success({msg:"保存成功"})},fail:function(e){n.fail(e)},complete:function(e){n.complete(e)}})},fail:function(e){n.fail(e)}})}}};function a(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:32,t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,i="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),r=[];if(n=n||i.length,e)for(var o=0;o<e;o++)r[o]=i[0|Math.random()*n];else{var s;r[8]=r[13]=r[18]=r[23]="-",r[14]="4";for(var u=0;u<36;u++)r[u]||(s=0|16*Math.random(),r[u]=i[19==u?3&s|8:s])}return t?(r.shift(),"u"+r.join("")):r.join("")}t.default=c}).call(this,n(2)["default"])},1220:function(e,t,n){"use strict";n.r(t);var i=n(1221),r=n.n(i);for(var o in i)["default"].indexOf(o)<0&&function(e){n.d(t,e,(function(){return i[e]}))}(o);t["default"]=r.a},1221:function(e,t,n){}}]);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/Sansnn-uQRCode/components/uqrcode/uqrcode.js.map
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'uni_modules/Sansnn-uQRCode/components/uqrcode/uqrcode-create-component',
    {
        'uni_modules/Sansnn-uQRCode/components/uqrcode/uqrcode-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('2')['createComponent'](__webpack_require__(1215))
        })
    },
    [['uni_modules/Sansnn-uQRCode/components/uqrcode/uqrcode-create-component']]
]);
