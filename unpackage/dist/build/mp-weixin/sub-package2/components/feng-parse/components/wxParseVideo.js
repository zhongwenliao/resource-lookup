require('../../../common/vendor.js');(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package2/components/feng-parse/components/wxParseVideo"],{"10b9":function(t,n,e){"use strict";e.d(n,"b",(function(){return a})),e.d(n,"c",(function(){return o})),e.d(n,"a",(function(){}));var a=function(){var t=this.$createElement;this._self._c},o=[]},5211:function(t,n,e){"use strict";e.r(n);var a=e("10b9"),o=e("62c9");for(var u in o)["default"].indexOf(u)<0&&function(t){e.d(n,t,(function(){return o[t]}))}(u);e("9a72");var c=e("f0c5"),i=Object(c["a"])(o["default"],a["b"],a["c"],!1,null,null,null,!1,a["a"],void 0);n["default"]=i.exports},"62c9":function(t,n,e){"use strict";e.r(n);var a=e("e9fe"),o=e.n(a);for(var u in a)["default"].indexOf(u)<0&&function(t){e.d(n,t,(function(){return a[t]}))}(u);n["default"]=o.a},"6c8a":function(t,n,e){},"9a72":function(t,n,e){"use strict";var a=e("6c8a"),o=e.n(a);o.a},e9fe:function(t,n,e){"use strict";(function(t){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var e={name:"wxParseVideo",props:{node:{}},data:function(){return{playState:!0,videoStyle:"width: 100%;"}},methods:{play:function(){console.log("点击了video 播放"),this.playState=!this.playState}},mounted:function(){var n=this;t.$on("slideMenuShow",(function(t){console.log("捕获事件："+t),"show"==t&&n.playState&&(n.playState=!1)}))}};n.default=e}).call(this,e("543d")["default"])}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'sub-package2/components/feng-parse/components/wxParseVideo-create-component',
    {
        'sub-package2/components/feng-parse/components/wxParseVideo-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('543d')['createComponent'](__webpack_require__("5211"))
        })
    },
    [['sub-package2/components/feng-parse/components/wxParseVideo-create-component']]
]);
