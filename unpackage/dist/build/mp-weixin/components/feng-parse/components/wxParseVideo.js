(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["components/feng-parse/components/wxParseVideo"],{"032a":function(t,n,e){"use strict";e.r(n);var a=e("66b4"),o=e("4eae");for(var u in o)"default"!==u&&function(t){e.d(n,t,(function(){return o[t]}))}(u);e("c01e");var c,r=e("f0c5"),i=Object(r["a"])(o["default"],a["b"],a["c"],!1,null,null,null,!1,a["a"],c);n["default"]=i.exports},"4eae":function(t,n,e){"use strict";e.r(n);var a=e("7f9c"),o=e.n(a);for(var u in a)"default"!==u&&function(t){e.d(n,t,(function(){return a[t]}))}(u);n["default"]=o.a},"66b4":function(t,n,e){"use strict";var a;e.d(n,"b",(function(){return o})),e.d(n,"c",(function(){return u})),e.d(n,"a",(function(){return a}));var o=function(){var t=this,n=t.$createElement;t._self._c},u=[]},"7f9c":function(t,n,e){"use strict";(function(t){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var e={name:"wxParseVideo",props:{node:{}},data:function(){return{playState:!0,videoStyle:"width: 100%;"}},methods:{play:function(){console.log("点击了video 播放"),this.playState=!this.playState}},mounted:function(){var n=this;t.$on("slideMenuShow",(function(t){console.log("捕获事件："+t),"show"==t&&n.playState&&(n.playState=!1)}))}};n.default=e}).call(this,e("543d")["default"])},c01e:function(t,n,e){"use strict";var a=e("db59"),o=e.n(a);o.a},db59:function(t,n,e){}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'components/feng-parse/components/wxParseVideo-create-component',
    {
        'components/feng-parse/components/wxParseVideo-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('543d')['createComponent'](__webpack_require__("032a"))
        })
    },
    [['components/feng-parse/components/wxParseVideo-create-component']]
]);
