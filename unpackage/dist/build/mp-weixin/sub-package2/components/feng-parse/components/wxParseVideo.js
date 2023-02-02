require('../../../common/vendor.js');(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package2/components/feng-parse/components/wxParseVideo"],{"3b5f":function(t,n,e){"use strict";(function(t){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var e={name:"wxParseVideo",props:{node:{}},data:function(){return{playState:!0,videoStyle:"width: 100%;"}},methods:{play:function(){console.log("点击了video 播放"),this.playState=!this.playState}},mounted:function(){var n=this;t.$on("slideMenuShow",(function(t){console.log("捕获事件："+t),"show"==t&&n.playState&&(n.playState=!1)}))}};n.default=e}).call(this,e("543d")["default"])},4147:function(t,n,e){"use strict";e.d(n,"b",(function(){return a})),e.d(n,"c",(function(){return o})),e.d(n,"a",(function(){}));var a=function(){var t=this.$createElement;this._self._c},o=[]},"65bf":function(t,n,e){"use strict";e.r(n);var a=e("3b5f"),o=e.n(a);for(var u in a)["default"].indexOf(u)<0&&function(t){e.d(n,t,(function(){return a[t]}))}(u);n["default"]=o.a},"6bba0":function(t,n,e){},e1c0:function(t,n,e){"use strict";e.r(n);var a=e("4147"),o=e("65bf");for(var u in o)["default"].indexOf(u)<0&&function(t){e.d(n,t,(function(){return o[t]}))}(u);e("f10b");var i=e("f0c5"),f=Object(i["a"])(o["default"],a["b"],a["c"],!1,null,null,null,!1,a["a"],void 0);n["default"]=f.exports},f10b:function(t,n,e){"use strict";var a=e("6bba0"),o=e.n(a);o.a}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'sub-package2/components/feng-parse/components/wxParseVideo-create-component',
    {
        'sub-package2/components/feng-parse/components/wxParseVideo-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('543d')['createComponent'](__webpack_require__("e1c0"))
        })
    },
    [['sub-package2/components/feng-parse/components/wxParseVideo-create-component']]
]);
