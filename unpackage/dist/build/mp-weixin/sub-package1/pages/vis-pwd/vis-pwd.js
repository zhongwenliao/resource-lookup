(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package1/pages/vis-pwd/vis-pwd"],{2439:function(t,e,n){"use strict";var o=n("3cfa"),s=n.n(o);s.a},"3cfa":function(t,e,n){},7106:function(t,e,n){"use strict";n.d(e,"b",(function(){return s})),n.d(e,"c",(function(){return i})),n.d(e,"a",(function(){return o}));var o={uqrcode:function(){return Promise.all([n.e("common/vendor"),n.e("uni_modules/Sansnn-uQRCode/components/uqrcode/uqrcode")]).then(n.bind(null,"d2d7"))}},s=function(){var t=this,e=t.$createElement;t._self._c},i=[]},"8d2b":function(t,e,n){"use strict";var o=n("9654"),s=n.n(o);s.a},"8df3":function(t,e,n){"use strict";(function(t){n("0fcb"),n("5c17");o(n("66fd"));var e=o(n("d80b"));function o(t){return t&&t.__esModule?t:{default:t}}wx.__webpack_require_UNI_MP_PLUGIN__=n,t(e.default)}).call(this,n("543d")["createPage"])},9654:function(t,e,n){},a88b:function(t,e,n){"use strict";(function(t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var o=s(n("ca65"));function s(t){return t&&t.__esModule?t:{default:t}}var i=null,r=null,c={data:function(){return{mode:"canvas",text:null,size:200,margin:10,backgroundColor:"#FFFFFF",foregroundColor:"#000000",errorCorrectLevel:o.default.errorCorrectLevel.H,typeNumber:-1,fileType:"png",password:"",qrcode:"",qrcodeImage:"",link:"",content:"",isAndroid:"android"===t.getSystemInfoSync().platform,isSupportShare:""!==this.$getConfigParam().wxAppId,address:"",data:{},currentBrightness:.5}},computed:{vis:function(){return this.$t("vis")},common:function(){return this.$t("common")}},onLoad:function(e){var n=JSON.parse(e.index);this.data=n,this.$setTitle(this.vis["title"]),this.password=n.pwd,this.qrcode=n.qrcode,this.content=n.content,this.address=n.room;var o=t.getStorageInfoSync("zoneInfo").name,s="&qrcode="+n.qrcode+"&startDate="+n.startDate+"&endDate="+n.endDate+"&authorizedName="+n.authorizedName+"&usableCount="+n.usableCount+"&memo="+n.memo+"&phone="+n.phone+"&address="+o;this.text=n.shareUrl,s=encodeURI(s),this.link=n.shareUrl,t.getScreenBrightness({success:function(t){this.currentBrightness=t.value}}),t.setScreenBrightness({value:1,success:function(){console.log("设置亮度成功")}})},onShow:function(){},onUnload:function(){t.setScreenBrightness({value:this.currentBrightness,success:function(){console.log("设置亮度成功")}})},onReady:function(t){},canvasIdErrorCallback:function(t){console.error(t.detail.errMsg)},methods:{updateSerivces:function(){var t=this;plus.share.getServices((function(e){for(var n in i={},this.$showToast("微信111"),e){var o=e[n];i[o.id]=o}r=i["weixin"],t.$showToast("微信"+JSON.stringify(r),void 0,1e4)}),(function(e){t.$showToast("获取分享服务列表失败："+e.message)}))},copy:function(){var e=this,n=decodeURIComponent(this.content)+this.link;console.log(this.link),console.log("share content",n),t.setClipboardData({data:n,success:function(n){t.hideToast(),e.$showToast(e.vis["copy-success"]||"复制成功")}})},shareSystem:function(){var t=this;if(plus.share.sendWithSystem){var e={content:decodeURIComponent(this.content),href:this.link};this.isAndroid||(e.href=this.link),plus.share.sendWithSystem(e,(function(){}),(function(e){t.$showToast((t.vis["share-fail"]||"分享失败:")+JSON.stringify(e.code))}))}else this.$showToast(this.vis["not-support-share-system"]||"该平台不支持系统分享!")},toWechat:function(){var t=decodeURIComponent(this.content),e={type:"text",content:t,extra:{scene:"WXSceneSession"}};this.$showToast("正在分享微信!");var n=this;r?r.authenticated?r.send(e,(function(){n.$showToast('分享到"'+r.description+'"成功！')}),(function(t){n.$showToast('分享到"'+r.description+'"失败: '+JSON.stringify(t))})):r.authorize((function(){r.send(e,(function(){n.$showToast('分享到"'+r.description+'"成功！')}),(function(t){n.$showToast('分享到"'+r.description+'"失败: '+JSON.stringify(t))}))}),(function(t){n.$showToast("认证授权失败："+JSON.stringify(t))})):this.$showToast("无效的分享服务!")},toQQ:function(){var e=decodeURIComponent(this.content);t.share({provider:"qq",scene:"qq",title:"访客密码",type:1,summary:e,success:function(t){console.log("success:"+JSON.stringify(t))},fail:function(t){console.log("fail:"+JSON.stringify(t))}})},toMessage:function(){var t=plus.messaging.createMessage(plus.messaging.TYPE_SMS);t.body=decodeURIComponent(this.content),plus.messaging.sendMessage(t)}}};e.default=c}).call(this,n("543d")["default"])},ac8d:function(t,e,n){"use strict";n.r(e);var o=n("a88b"),s=n.n(o);for(var i in o)"default"!==i&&function(t){n.d(e,t,(function(){return o[t]}))}(i);e["default"]=s.a},d80b:function(t,e,n){"use strict";n.r(e);var o=n("7106"),s=n("ac8d");for(var i in s)"default"!==i&&function(t){n.d(e,t,(function(){return s[t]}))}(i);n("8d2b"),n("2439");var r,c=n("f0c5"),a=Object(c["a"])(s["default"],o["b"],o["c"],!1,null,null,null,!1,o["a"],r);e["default"]=a.exports}},[["8df3","common/runtime","common/vendor"]]]);