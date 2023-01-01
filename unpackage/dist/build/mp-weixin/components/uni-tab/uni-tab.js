(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["components/uni-tab/uni-tab"],{"2c4a":function(t,n,e){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var u={name:"wuc-tab",data:function(){return{}},props:{tabList:{type:Array,default:function(){return[]}},tabCur:{type:Number,default:function(){return 0}},tabClass:{type:String,default:function(){return""}},tabStyle:{type:String,default:function(){return""}},textFlex:{type:Boolean,default:function(){return!1}},selectClass:{type:String,default:function(){return"text-blue"}}},methods:{tabSelect:function(t,n){if(this.currentTab===t)return!1;this.$emit("update:tabCur",t),this.$emit("change",t)}},computed:{scrollLeft:function(){return 60*(this.tabCur-1)}}};n.default=u},"39ea":function(t,n,e){"use strict";e.r(n);var u=e("2c4a"),r=e.n(u);for(var a in u)["default"].indexOf(a)<0&&function(t){e.d(n,t,(function(){return u[t]}))}(a);n["default"]=r.a},5005:function(t,n,e){"use strict";var u=e("d421"),r=e.n(u);r.a},8073:function(t,n,e){"use strict";e.d(n,"b",(function(){return u})),e.d(n,"c",(function(){return r})),e.d(n,"a",(function(){}));var u=function(){var t=this.$createElement;this._self._c},r=[]},b80b:function(t,n,e){"use strict";e.r(n);var u=e("8073"),r=e("39ea");for(var a in r)["default"].indexOf(a)<0&&function(t){e.d(n,t,(function(){return r[t]}))}(a);e("5005");var i=e("f0c5"),c=Object(i["a"])(r["default"],u["b"],u["c"],!1,null,null,null,!1,u["a"],void 0);n["default"]=c.exports},d421:function(t,n,e){}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'components/uni-tab/uni-tab-create-component',
    {
        'components/uni-tab/uni-tab-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('543d')['createComponent'](__webpack_require__("b80b"))
        })
    },
    [['components/uni-tab/uni-tab-create-component']]
]);
