(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["uview-ui/components/u-avatar-cropper/u-avatar-cropper"],{"310c":function(t,e,i){"use strict";var r=i("c891"),o=i.n(r);o.a},5153:function(t,e,i){"use strict";i.d(e,"b",(function(){return r})),i.d(e,"c",(function(){return o})),i.d(e,"a",(function(){}));var r=function(){var t=this.$createElement;this._self._c},o=[]},"5a76":function(t,e,i){"use strict";(function(t){var e=i("4ea4");i("0fcb"),i("5c17");e(i("66fd"));var r=e(i("b6ad"));wx.__webpack_require_UNI_MP_PLUGIN__=i,t(r.default)}).call(this,i("543d")["createPage"])},"63f2":function(t,e,i){"use strict";i.r(e);var r=i("8304"),o=i.n(r);for(var n in r)["default"].indexOf(n)<0&&function(t){i.d(e,t,(function(){return r[t]}))}(n);e["default"]=o.a},8304:function(t,e,i){"use strict";(function(t){var r=i("4ea4");Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var o=r(i("c394")),n={props:{boundStyle:{type:Object,default:function(){return{lineWidth:4,borderColor:"rgb(245, 245, 245)",mask:"rgba(0, 0, 0, 0.35)"}}}},data:function(){return{bottomNavHeight:50,originWidth:200,width:0,height:0,cropperOpt:{id:"cropper",targetId:"targetCropper",pixelRatio:1,width:0,height:0,scale:2.5,zoom:8,cut:{x:(this.width-this.originWidth)/2,y:(this.height-this.originWidth)/2,width:this.originWidth,height:this.originWidth},boundStyle:{lineWidth:t.upx2px(this.boundStyle.lineWidth),mask:this.boundStyle.mask,color:this.boundStyle.borderColor}},destWidth:200,rectWidth:200,fileType:"jpg",src:""}},onLoad:function(){var e=this,i=this.$Route.query,r=t.getSystemInfoSync();if(this.width=r.windowWidth,this.height=r.windowHeight-this.bottomNavHeight,this.cropperOpt.width=this.width,this.cropperOpt.height=this.height,this.cropperOpt.pixelRatio=r.pixelRatio,i.destWidth&&(this.destWidth=i.destWidth),i.rectWidth){var n=Number(i.rectWidth);this.cropperOpt.cut={x:(this.width-n)/2,y:(this.height-n)/2,width:n,height:n}}this.rectWidth=i.rectWidth,i.fileType&&(this.fileType=i.fileType),this.cropper=new o.default(this.cropperOpt).on("ready",(function(t){})).on("beforeImageLoad",(function(t){})).on("imageLoad",(function(t){})).on("beforeDraw",(function(t,e){})),t.setNavigationBarColor({frontColor:"#ffffff",backgroundColor:"#000000"}),t.chooseImage({count:1,sizeType:["compressed"],sourceType:["album","camera"],success:function(t){e.src=t.tempFilePaths[0],e.cropper.pushOrign(e.src)}})},methods:{touchStart:function(t){this.cropper.touchStart(t)},touchMove:function(t){this.cropper.touchMove(t)},touchEnd:function(t){this.cropper.touchEnd(t)},getCropperImage:function(){var e=this,i=arguments.length>0&&void 0!==arguments[0]&&arguments[0];if(!this.src)return this.$u.toast("请先选择图片再裁剪");var r={destHeight:Number(this.destWidth),destWidth:Number(this.destWidth),fileType:this.fileType};this.cropper.getCropperImage(r,(function(r,o){o?t.showModal({title:"温馨提示",content:o.message}):i?t.previewImage({current:"",urls:[r]}):(t.$emit("uAvatarCropper",r),e.$Router.back(1))}))},uploadTap:function(){var e=this,i=this;t.chooseImage({count:1,sizeType:["original","compressed"],sourceType:["album","camera"],success:function(t){i.src=t.tempFilePaths[0],i.cropper.pushOrign(e.src)}})}}};e.default=n}).call(this,i("543d")["default"])},b6ad:function(t,e,i){"use strict";i.r(e);var r=i("5153"),o=i("63f2");for(var n in o)["default"].indexOf(n)<0&&function(t){i.d(e,t,(function(){return o[t]}))}(n);i("310c");var c=i("f0c5"),h=Object(c["a"])(o["default"],r["b"],r["c"],!1,null,"4523aad4",null,!1,r["a"],void 0);e["default"]=h.exports},c891:function(t,e,i){}},[["5a76","common/runtime","common/vendor"]]]);