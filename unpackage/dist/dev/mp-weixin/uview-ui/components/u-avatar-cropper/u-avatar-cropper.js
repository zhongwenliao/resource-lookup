(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["uview-ui/components/u-avatar-cropper/u-avatar-cropper"],{163:function(t,e,i){"use strict";(function(t,e){var r=i(4);i(26),i(27);r(i(25));var n=r(i(164));t.__webpack_require_UNI_MP_PLUGIN__=i,e(n.default)}).call(this,i(1)["default"],i(2)["createPage"])},164:function(t,e,i){"use strict";i.r(e);var r=i(165),n=i(167);for(var o in n)["default"].indexOf(o)<0&&function(t){i.d(e,t,(function(){return n[t]}))}(o);i(170);var c,u=i(39),s=Object(u["default"])(n["default"],r["render"],r["staticRenderFns"],!1,null,"90d78b40",null,!1,r["components"],c);s.options.__file="uview-ui/components/u-avatar-cropper/u-avatar-cropper.vue",e["default"]=s.exports},165:function(t,e,i){"use strict";i.r(e);var r=i(166);i.d(e,"render",(function(){return r["render"]})),i.d(e,"staticRenderFns",(function(){return r["staticRenderFns"]})),i.d(e,"recyclableRender",(function(){return r["recyclableRender"]})),i.d(e,"components",(function(){return r["components"]}))},166:function(t,e,i){"use strict";var r;i.r(e),i.d(e,"render",(function(){return n})),i.d(e,"staticRenderFns",(function(){return c})),i.d(e,"recyclableRender",(function(){return o})),i.d(e,"components",(function(){return r}));var n=function(){var t=this,e=t.$createElement;t._self._c},o=!1,c=[];n._withStripped=!0},167:function(t,e,i){"use strict";i.r(e);var r=i(168),n=i.n(r);for(var o in r)["default"].indexOf(o)<0&&function(t){i.d(e,t,(function(){return r[t]}))}(o);e["default"]=n.a},168:function(t,e,i){"use strict";(function(t){var r=i(4);Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var n=r(i(169)),o={props:{boundStyle:{type:Object,default:function(){return{lineWidth:4,borderColor:"rgb(245, 245, 245)",mask:"rgba(0, 0, 0, 0.35)"}}}},data:function(){return{bottomNavHeight:50,originWidth:200,width:0,height:0,cropperOpt:{id:"cropper",targetId:"targetCropper",pixelRatio:1,width:0,height:0,scale:2.5,zoom:8,cut:{x:(this.width-this.originWidth)/2,y:(this.height-this.originWidth)/2,width:this.originWidth,height:this.originWidth},boundStyle:{lineWidth:t.upx2px(this.boundStyle.lineWidth),mask:this.boundStyle.mask,color:this.boundStyle.borderColor}},destWidth:200,rectWidth:200,fileType:"jpg",src:""}},onLoad:function(){var e=this,i=this.$Route.query,r=t.getSystemInfoSync();if(this.width=r.windowWidth,this.height=r.windowHeight-this.bottomNavHeight,this.cropperOpt.width=this.width,this.cropperOpt.height=this.height,this.cropperOpt.pixelRatio=r.pixelRatio,i.destWidth&&(this.destWidth=i.destWidth),i.rectWidth){var o=Number(i.rectWidth);this.cropperOpt.cut={x:(this.width-o)/2,y:(this.height-o)/2,width:o,height:o}}this.rectWidth=i.rectWidth,i.fileType&&(this.fileType=i.fileType),this.cropper=new n.default(this.cropperOpt).on("ready",(function(t){})).on("beforeImageLoad",(function(t){})).on("imageLoad",(function(t){})).on("beforeDraw",(function(t,e){})),t.setNavigationBarColor({frontColor:"#ffffff",backgroundColor:"#000000"}),t.chooseImage({count:1,sizeType:["compressed"],sourceType:["album","camera"],success:function(t){e.src=t.tempFilePaths[0],e.cropper.pushOrign(e.src)}})},methods:{touchStart:function(t){this.cropper.touchStart(t)},touchMove:function(t){this.cropper.touchMove(t)},touchEnd:function(t){this.cropper.touchEnd(t)},getCropperImage:function(){var e=this,i=arguments.length>0&&void 0!==arguments[0]&&arguments[0];if(!this.src)return this.$u.toast("请先选择图片再裁剪");var r={destHeight:Number(this.destWidth),destWidth:Number(this.destWidth),fileType:this.fileType};this.cropper.getCropperImage(r,(function(r,n){n?t.showModal({title:"温馨提示",content:n.message}):i?t.previewImage({current:"",urls:[r]}):(t.$emit("uAvatarCropper",r),e.$Router.back(1))}))},uploadTap:function(){var e=this,i=this;t.chooseImage({count:1,sizeType:["original","compressed"],sourceType:["album","camera"],success:function(t){i.src=t.tempFilePaths[0],i.cropper.pushOrign(e.src)}})}}};e.default=o}).call(this,i(2)["default"])},170:function(t,e,i){"use strict";i.r(e);var r=i(171),n=i.n(r);for(var o in r)["default"].indexOf(o)<0&&function(t){i.d(e,t,(function(){return r[t]}))}(o);e["default"]=n.a},171:function(t,e,i){}},[[163,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/uview-ui/components/u-avatar-cropper/u-avatar-cropper.js.map