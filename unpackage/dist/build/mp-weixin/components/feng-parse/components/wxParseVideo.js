(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["components/feng-parse/components/wxParseVideo"],{"032a":function(t,n,e){"use strict";e.r(n);var o=e("66b4"),a=e("4eae");for(var u in a)["default"].indexOf(u)<0&&function(t){e.d(n,t,(function(){return a[t]}))}(u);e("c01e");var i=e("f0c5"),c=Object(i["a"])(a["default"],o["b"],o["c"],!1,null,null,null,!1,o["a"],void 0);n["default"]=c.exports},"4eae":function(t,n,e){"use strict";e.r(n);var o=e("7f9c"),a=e.n(o);for(var u in o)["default"].indexOf(u)<0&&function(t){e.d(n,t,(function(){return o[t]}))}(u);n["default"]=a.a},"66b4":function(t,n,e){"use strict";e.d(n,"b",(function(){return o})),e.d(n,"c",(function(){return a})),e.d(n,"a",(function(){}));var o=function(){var t=this.$createElement;this._self._c},a=[]},"7f9c":function(t,n,e){"use strict";(function(t){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var e={name:"wxParseVideo",props:{node:{}},data:function(){return{playState:!0,videoStyle:"width: 100%;"}},methods:{play:function(){console.log("点击了video 播放"),this.playState=!this.playState}},mounted:function(){var n=this;t.$on("slideMenuShow",(function(t){console.log("捕获事件："+t),"show"==t&&n.playState&&(n.playState=!1)}))}};n.default=e}).call(this,e("543d")["default"])},c01e:function(t,n,e){"use strict";var o=e("db59"),a=e.n(o);a.a},db59:function(t,n,e){}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'components/feng-parse/components/wxParseVideo-create-component',
    {
        'components/feng-parse/components/wxParseVideo-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('543d')['createComponent'](__webpack_require__("032a"))
        })
    },
    [['components/feng-parse/components/wxParseVideo-create-component']]
]);
