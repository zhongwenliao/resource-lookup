(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["uview-ui/components/u-image/u-image"],{1056:function(e,t,n){"use strict";n.r(t);var r=n(1057),i=n(1059);for(var o in i)["default"].indexOf(o)<0&&function(e){n.d(t,e,(function(){return i[e]}))}(o);n(1061);var a,u=n(39),d=Object(u["default"])(i["default"],r["render"],r["staticRenderFns"],!1,null,"32babe48",null,!1,r["components"],a);d.options.__file="uview-ui/components/u-image/u-image.vue",t["default"]=d.exports},1057:function(e,t,n){"use strict";n.r(t);var r=n(1058);n.d(t,"render",(function(){return r["render"]})),n.d(t,"staticRenderFns",(function(){return r["staticRenderFns"]})),n.d(t,"recyclableRender",(function(){return r["recyclableRender"]})),n.d(t,"components",(function(){return r["components"]}))},1058:function(e,t,n){"use strict";var r;n.r(t),n.d(t,"render",(function(){return i})),n.d(t,"staticRenderFns",(function(){return a})),n.d(t,"recyclableRender",(function(){return o})),n.d(t,"components",(function(){return r}));try{r={uIcon:function(){return n.e("uview-ui/components/u-icon/u-icon").then(n.bind(null,993))}}}catch(u){if(-1===u.message.indexOf("Cannot find module")||-1===u.message.indexOf(".vue"))throw u;console.error(u.message),console.error("1. 排查组件名称拼写是否正确"),console.error("2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"),console.error("3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件")}var i=function(){var e=this,t=e.$createElement,n=(e._self._c,e.__get_style([e.wrapStyle,e.backgroundStyle])),r=e.isError||"circle"==e.shape?null:e.$u.addUnit(e.borderRadius),i=e.showLoading&&e.loading&&"circle"!=e.shape?e.$u.addUnit(e.borderRadius):null,o=e.showError&&e.isError&&!e.loading&&"circle"!=e.shape?e.$u.addUnit(e.borderRadius):null;e.$mp.data=Object.assign({},{$root:{s0:n,g0:r,g1:i,g2:o}})},o=!1,a=[];i._withStripped=!0},1059:function(e,t,n){"use strict";n.r(t);var r=n(1060),i=n.n(r);for(var o in r)["default"].indexOf(o)<0&&function(e){n.d(t,e,(function(){return r[e]}))}(o);t["default"]=i.a},1060:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var r={name:"u-image",props:{src:{type:String,default:""},mode:{type:String,default:"aspectFill"},width:{type:[String,Number],default:"100%"},height:{type:[String,Number],default:"auto"},shape:{type:String,default:"square"},borderRadius:{type:[String,Number],default:0},lazyLoad:{type:Boolean,default:!0},showMenuByLongpress:{type:Boolean,default:!0},loadingIcon:{type:String,default:"photo"},errorIcon:{type:String,default:"error-circle"},showLoading:{type:Boolean,default:!0},showError:{type:Boolean,default:!0},fade:{type:Boolean,default:!0},webp:{type:Boolean,default:!1},duration:{type:[String,Number],default:500},bgColor:{type:String,default:"#f3f4f6"}},data:function(){return{isError:!1,loading:!0,opacity:1,durationTime:this.duration,backgroundStyle:{}}},watch:{src:{immediate:!0,handler:function(e){e?(this.isError=!1,this.loading=!0):(this.isError=!0,this.loading=!1)}}},computed:{wrapStyle:function(){var e={};return e.width=this.$u.addUnit(this.width),e.height=this.$u.addUnit(this.height),e.borderRadius="circle"==this.shape?"50%":this.$u.addUnit(this.borderRadius),e.overflow=this.borderRadius>0?"hidden":"visible",this.fade&&(e.opacity=this.opacity,e.transition="opacity ".concat(Number(this.durationTime)/1e3,"s ease-in-out")),e}},methods:{onClick:function(){this.$emit("click")},onErrorHandler:function(e){this.loading=!1,this.isError=!0,this.$emit("error",e)},onLoadHandler:function(){var e=this;if(this.loading=!1,this.isError=!1,this.$emit("load"),!this.fade)return this.removeBgColor();this.opacity=0,this.durationTime=0,setTimeout((function(){e.durationTime=e.duration,e.opacity=1,setTimeout((function(){e.removeBgColor()}),e.durationTime)}),50)},removeBgColor:function(){this.backgroundStyle={backgroundColor:"transparent"}}}};t.default=r},1061:function(e,t,n){"use strict";n.r(t);var r=n(1062),i=n.n(r);for(var o in r)["default"].indexOf(o)<0&&function(e){n.d(t,e,(function(){return r[e]}))}(o);t["default"]=i.a},1062:function(e,t,n){}}]);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/uview-ui/components/u-image/u-image.js.map
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'uview-ui/components/u-image/u-image-create-component',
    {
        'uview-ui/components/u-image/u-image-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('2')['createComponent'](__webpack_require__(1056))
        })
    },
    [['uview-ui/components/u-image/u-image-create-component']]
]);
