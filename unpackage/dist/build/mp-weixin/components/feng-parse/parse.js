(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["components/feng-parse/parse"],{4042:function(t,e,n){"use strict";(function(t){var i=n("4ea4");Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var a=i(n("4659")),o={name:"wxParse",props:{userSelect:{type:String,default:"text"},imgOptions:{type:[Object,Boolean],default:function(){return{loop:!1,indicator:"number",longPressActions:!1}}},loading:{type:Boolean,default:!1},className:{type:String,default:""},content:{type:String,default:""},noData:{type:String,default:""},startHandler:{type:Function,default:function(){return function(t){t.attr.class=null,t.attr.style=null}}},endHandler:{type:Function,default:function(){return function(t){t=t}}},charsHandler:{type:Function,default:function(){return function(t){t=t}}},imageProp:{type:Object,default:function(){return{mode:"aspectFit",padding:0,lazyLoad:!1,domain:""}}}},components:{wxParseTemplate:function(){n.e("components/feng-parse/components/wxParseTemplate0").then(function(){return resolve(n("ef30"))}.bind(null,n)).catch(n.oe)}},data:function(){return{nodes:{},imageUrls:[],wxParseWidth:{value:0}}},computed:{},mounted:function(){},methods:{setHtml:function(){var t=this;this.getWidth().then((function(e){t.wxParseWidth.value=e}));var e=this.content,n=this.noData,i=this.imageProp,o=this.startHandler,r=this.endHandler,s=this.charsHandler,u=e||n,c={start:o,end:r,chars:s},l=(0,a.default)(u,c,i,this);this.imageUrls=l.imageUrls,this.nodes=[],l.nodes.forEach((function(e){setTimeout((function(){e.node&&t.nodes.push(e)}),0)}))},getWidth:function(){var e=this;return new Promise((function(n,i){t.createSelectorQuery().in(e).select(".wxParse").fields({size:!0,scrollOffset:!0},(function(t){n(t.width)})).exec()}))},navigate:function(t,e,n){this.$emit("navigate",t,e)},preview:function(e,n){this.imageUrls.length&&"boolean"!==typeof this.imgOptions&&t.previewImage({current:e,urls:this.imageUrls,loop:this.imgOptions.loop,indicator:this.imgOptions.indicator,longPressActions:this.imgOptions.longPressActions}),this.$emit("preview",e,n)},removeImageUrl:function(t){var e=this.imageUrls;e.splice(e.indexOf(t),1)}},provide:function(){return{parseWidth:this.wxParseWidth,parseSelect:this.userSelect}},watch:{content:function(t){this.setHtml()}}};e.default=o}).call(this,n("543d")["default"])},9651:function(t,e,n){"use strict";n.d(e,"b",(function(){return i})),n.d(e,"c",(function(){return a})),n.d(e,"a",(function(){}));var i=function(){var t=this.$createElement;this._self._c},a=[]},a584:function(t,e,n){"use strict";n.r(e);var i=n("9651"),a=n("c14f");for(var o in a)["default"].indexOf(o)<0&&function(t){n.d(e,t,(function(){return a[t]}))}(o);var r=n("f0c5"),s=Object(r["a"])(a["default"],i["b"],i["c"],!1,null,null,null,!1,i["a"],void 0);e["default"]=s.exports},c14f:function(t,e,n){"use strict";n.r(e);var i=n("4042"),a=n.n(i);for(var o in i)["default"].indexOf(o)<0&&function(t){n.d(e,t,(function(){return i[t]}))}(o);e["default"]=a.a}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'components/feng-parse/parse-create-component',
    {
        'components/feng-parse/parse-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('543d')['createComponent'](__webpack_require__("a584"))
        })
    },
    [['components/feng-parse/parse-create-component']]
]);
