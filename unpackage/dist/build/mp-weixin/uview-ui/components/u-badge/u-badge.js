(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["uview-ui/components/u-badge/u-badge"],{"0b500":function(t,e,o){"use strict";var n=o("fee1"),r=o.n(n);r.a},1610:function(t,e,o){"use strict";o.r(e);var n=o("654e"),r=o.n(n);for(var u in n)["default"].indexOf(u)<0&&function(t){o.d(e,t,(function(){return n[t]}))}(u);e["default"]=r.a},"35a0":function(t,e,o){"use strict";o.r(e);var n=o("40e1"),r=o("1610");for(var u in r)["default"].indexOf(u)<0&&function(t){o.d(e,t,(function(){return r[t]}))}(u);o("0b500");var a=o("f0c5"),f=Object(a["a"])(r["default"],n["b"],n["c"],!1,null,"a4d28fac",null,!1,n["a"],void 0);e["default"]=f.exports},"40e1":function(t,e,o){"use strict";o.d(e,"b",(function(){return n})),o.d(e,"c",(function(){return r})),o.d(e,"a",(function(){}));var n=function(){var t=this,e=t.$createElement,o=(t._self._c,t.show?t.__get_style([{top:t.offset[0]+"rpx",right:t.offset[1]+"rpx",fontSize:t.fontSize+"rpx",position:t.absolute?"absolute":"static",color:t.color,backgroundColor:t.bgColor},t.boxStyle]):null);t.$mp.data=Object.assign({},{$root:{s0:o}})},r=[]},"654e":function(t,e,o){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var n={name:"u-badge",props:{type:{type:String,default:"error"},size:{type:String,default:"default"},isDot:{type:Boolean,default:!1},count:{type:[Number,String]},overflowCount:{type:Number,default:99},showZero:{type:Boolean,default:!1},offset:{type:Array,default:function(){return[20,20]}},absolute:{type:Boolean,default:!0},fontSize:{type:[String,Number],default:"24"},color:{type:String,default:"#ffffff"},bgColor:{type:String,default:""},isCenter:{type:Boolean,default:!1}},computed:{boxStyle:function(){var t={};return this.isCenter?(t.top=0,t.right=0,t.transform="translateY(-50%) translateX(50%)"):(t.top=this.offset[0]+"rpx",t.right=this.offset[1]+"rpx",t.transform="translateY(0) translateX(0)"),"mini"==this.size&&(t.transform=t.transform+" scale(0.8)"),t},showText:function(){return this.isDot?"":this.count>this.overflowCount?"".concat(this.overflowCount,"+"):this.count},show:function(){return 0!=this.count||0!=this.showZero}}};e.default=n},fee1:function(t,e,o){}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'uview-ui/components/u-badge/u-badge-create-component',
    {
        'uview-ui/components/u-badge/u-badge-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('543d')['createComponent'](__webpack_require__("35a0"))
        })
    },
    [['uview-ui/components/u-badge/u-badge-create-component']]
]);
