(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["uview-ui/components/u-badge/u-badge"],{"0526":function(t,e,o){"use strict";o.r(e);var n=o("5ea7"),r=o("1a7d");for(var a in r)["default"].indexOf(a)<0&&function(t){o.d(e,t,(function(){return r[t]}))}(a);o("c7a4");var u=o("f0c5"),f=Object(u["a"])(r["default"],n["b"],n["c"],!1,null,"a4d28fac",null,!1,n["a"],void 0);e["default"]=f.exports},"1a7d":function(t,e,o){"use strict";o.r(e);var n=o("5b07"),r=o.n(n);for(var a in n)["default"].indexOf(a)<0&&function(t){o.d(e,t,(function(){return n[t]}))}(a);e["default"]=r.a},4618:function(t,e,o){},"5b07":function(t,e,o){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var n={name:"u-badge",props:{type:{type:String,default:"error"},size:{type:String,default:"default"},isDot:{type:Boolean,default:!1},count:{type:[Number,String]},overflowCount:{type:Number,default:99},showZero:{type:Boolean,default:!1},offset:{type:Array,default:function(){return[20,20]}},absolute:{type:Boolean,default:!0},fontSize:{type:[String,Number],default:"24"},color:{type:String,default:"#ffffff"},bgColor:{type:String,default:""},isCenter:{type:Boolean,default:!1}},computed:{boxStyle:function(){var t={};return this.isCenter?(t.top=0,t.right=0,t.transform="translateY(-50%) translateX(50%)"):(t.top=this.offset[0]+"rpx",t.right=this.offset[1]+"rpx",t.transform="translateY(0) translateX(0)"),"mini"==this.size&&(t.transform=t.transform+" scale(0.8)"),t},showText:function(){return this.isDot?"":this.count>this.overflowCount?"".concat(this.overflowCount,"+"):this.count},show:function(){return 0!=this.count||0!=this.showZero}}};e.default=n},"5ea7":function(t,e,o){"use strict";o.d(e,"b",(function(){return n})),o.d(e,"c",(function(){return r})),o.d(e,"a",(function(){}));var n=function(){var t=this,e=t.$createElement,o=(t._self._c,t.show?t.__get_style([{top:t.offset[0]+"rpx",right:t.offset[1]+"rpx",fontSize:t.fontSize+"rpx",position:t.absolute?"absolute":"static",color:t.color,backgroundColor:t.bgColor},t.boxStyle]):null);t.$mp.data=Object.assign({},{$root:{s0:o}})},r=[]},c7a4:function(t,e,o){"use strict";var n=o("4618"),r=o.n(n);r.a}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'uview-ui/components/u-badge/u-badge-create-component',
    {
        'uview-ui/components/u-badge/u-badge-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('543d')['createComponent'](__webpack_require__("0526"))
        })
    },
    [['uview-ui/components/u-badge/u-badge-create-component']]
]);
