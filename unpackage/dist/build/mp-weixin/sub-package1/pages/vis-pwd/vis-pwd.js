(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package1/pages/vis-pwd/vis-pwd"],{"22ed":function(e,t,n){},"26c44":function(e,t,n){"use strict";n.d(t,"b",(function(){return s})),n.d(t,"c",(function(){return i})),n.d(t,"a",(function(){return o}));var o={uqrcode:function(){return Promise.all([n.e("common/vendor"),n.e("uni_modules/Sansnn-uQRCode/components/uqrcode/uqrcode")]).then(n.bind(null,"2614"))}},s=function(){var e=this.$createElement;this._self._c},i=[]},3752:function(e,t,n){"use strict";var o=n("22ed"),s=n.n(o);s.a},4099:function(e,t,n){"use strict";(function(e){var o=n("4ea4");Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var s=o(n("9ca0")),i=null,r=null,c={data:function(){return{mode:"canvas",text:null,size:200,margin:10,backgroundColor:"#FFFFFF",foregroundColor:"#000000",errorCorrectLevel:s.default.errorCorrectLevel.H,typeNumber:-1,fileType:"png",password:"",qrcode:"",qrcodeImage:"",link:"",content:"",isAndroid:"android"===e.getSystemInfoSync().platform,isSupportShare:""!==this.$getConfigParam().wxAppId,address:"",data:{},currentBrightness:.5}},computed:{vis:function(){return this.$t("vis")},common:function(){return this.$t("common")}},onLoad:function(t){var n=JSON.parse(t.index);this.data=n,this.$setTitle(this.vis["title"]),this.password=n.pwd,this.qrcode=n.qrcode,this.content=n.content,this.address=n.room;var o=e.getStorageInfoSync("zoneInfo").name,s="&qrcode="+n.qrcode+"&startDate="+n.startDate+"&endDate="+n.endDate+"&authorizedName="+n.authorizedName+"&usableCount="+n.usableCount+"&memo="+n.memo+"&phone="+n.phone+"&address="+o;this.text=n.shareUrl,s=encodeURI(s),this.link=n.shareUrl,e.getScreenBrightness({success:function(e){this.currentBrightness=e.value}}),e.setScreenBrightness({value:1,success:function(){console.log("设置亮度成功")}})},onShow:function(){},onUnload:function(){e.setScreenBrightness({value:this.currentBrightness,success:function(){console.log("设置亮度成功")}})},onReady:function(e){},canvasIdErrorCallback:function(e){console.error(e.detail.errMsg)},methods:{updateSerivces:function(){var e=this;plus.share.getServices((function(t){for(var n in i={},this.$showToast("微信111"),t){var o=t[n];i[o.id]=o}r=i["weixin"],e.$showToast("微信"+JSON.stringify(r),void 0,1e4)}),(function(t){e.$showToast("获取分享服务列表失败："+t.message)}))},copy:function(){var t=this,n=decodeURIComponent(this.content)+this.link;console.log(this.link),console.log("share content",n),e.setClipboardData({data:n,success:function(n){e.hideToast(),t.$showToast(t.vis["copy-success"]||"复制成功")}})},shareSystem:function(){var e=this;if(plus.share.sendWithSystem){var t={content:decodeURIComponent(this.content),href:this.link};this.isAndroid||(t.href=this.link),plus.share.sendWithSystem(t,(function(){}),(function(t){e.$showToast((e.vis["share-fail"]||"分享失败:")+JSON.stringify(t.code))}))}else this.$showToast(this.vis["not-support-share-system"]||"该平台不支持系统分享!")},toWechat:function(){var e=decodeURIComponent(this.content),t={type:"text",content:e,extra:{scene:"WXSceneSession"}};this.$showToast("正在分享微信!");var n=this;r?r.authenticated?r.send(t,(function(){n.$showToast('分享到"'+r.description+'"成功！')}),(function(e){n.$showToast('分享到"'+r.description+'"失败: '+JSON.stringify(e))})):r.authorize((function(){r.send(t,(function(){n.$showToast('分享到"'+r.description+'"成功！')}),(function(e){n.$showToast('分享到"'+r.description+'"失败: '+JSON.stringify(e))}))}),(function(e){n.$showToast("认证授权失败："+JSON.stringify(e))})):this.$showToast("无效的分享服务!")},toQQ:function(){var t=decodeURIComponent(this.content);e.share({provider:"qq",scene:"qq",title:"访客密码",type:1,summary:t,success:function(e){console.log("success:"+JSON.stringify(e))},fail:function(e){console.log("fail:"+JSON.stringify(e))}})},toMessage:function(){var e=plus.messaging.createMessage(plus.messaging.TYPE_SMS);e.body=decodeURIComponent(this.content),plus.messaging.sendMessage(e)}}};t.default=c}).call(this,n("543d")["default"])},6987:function(e,t,n){},"6ffd":function(e,t,n){"use strict";n.r(t);var o=n("4099"),s=n.n(o);for(var i in o)["default"].indexOf(i)<0&&function(e){n.d(t,e,(function(){return o[e]}))}(i);t["default"]=s.a},c8d5:function(e,t,n){"use strict";(function(e,t){var o=n("4ea4");n("27b1"),n("5c17");o(n("66fd"));var s=o(n("eccf"));e.__webpack_require_UNI_MP_PLUGIN__=n,t(s.default)}).call(this,n("bc2e")["default"],n("543d")["createPage"])},eccf:function(e,t,n){"use strict";n.r(t);var o=n("26c44"),s=n("6ffd");for(var i in s)["default"].indexOf(i)<0&&function(e){n.d(t,e,(function(){return s[e]}))}(i);n("3752"),n("fa29");var r=n("f0c5"),c=Object(r["a"])(s["default"],o["b"],o["c"],!1,null,null,null,!1,o["a"],void 0);t["default"]=c.exports},fa29:function(e,t,n){"use strict";var o=n("6987"),s=n.n(o);s.a}},[["c8d5","common/runtime","common/vendor"]]]);