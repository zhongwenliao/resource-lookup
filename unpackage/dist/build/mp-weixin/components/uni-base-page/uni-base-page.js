(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["components/uni-base-page/uni-base-page"],{"036d":function(t,n,e){"use strict";e.d(n,"b",(function(){return c})),e.d(n,"c",(function(){return i})),e.d(n,"a",(function(){return a}));var a={uniBaseToast:function(){return e.e("components/uni-base-toast/uni-base-toast").then(e.bind(null,"a41a"))}},c=function(){var t=this.$createElement;this._self._c},i=[]},"10e9":function(t,n,e){"use strict";e.r(n);var a=e("036d"),c=e("2067");for(var i in c)["default"].indexOf(i)<0&&function(t){e.d(n,t,(function(){return c[t]}))}(i);e("89bc");var o=e("f0c5"),u=Object(o["a"])(c["default"],a["b"],a["c"],!1,null,null,null,!1,a["a"],void 0);n["default"]=u.exports},2067:function(t,n,e){"use strict";e.r(n);var a=e("f917"),c=e.n(a);for(var i in a)["default"].indexOf(i)<0&&function(t){e.d(n,t,(function(){return a[t]}))}(i);n["default"]=c.a},6851:function(t,n,e){},"89bc":function(t,n,e){"use strict";var a=e("6851"),c=e.n(a);c.a},f917:function(t,n,e){"use strict";(function(t){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var e={name:"UniBasePage",data:function(){return{startData:{}}},methods:{start:function(t){this.startData.clientX=t.changedTouches[0].clientX,this.startData.clientY=t.changedTouches[0].clientY},end:function(n){if(this.$platformObj.isAndroid()){var e=n.changedTouches[0].clientX-this.startData.clientX,a=n.changedTouches[0].clientY-this.startData.clientY;a>50||a<-50?console.log("上下滑"):e>50?(console.log("右滑"),this.startData.clientX<=10&&t.navigateBack({})):e<-50?console.log("左滑"):console.log("无效")}}}};n.default=e}).call(this,e("543d")["default"])}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'components/uni-base-page/uni-base-page-create-component',
    {
        'components/uni-base-page/uni-base-page-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('543d')['createComponent'](__webpack_require__("10e9"))
        })
    },
    [['components/uni-base-page/uni-base-page-create-component']]
]);
