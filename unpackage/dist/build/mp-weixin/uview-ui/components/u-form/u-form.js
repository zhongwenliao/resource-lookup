(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["uview-ui/components/u-form/u-form"],{"0372":function(e,t,n){},"08e0":function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var u={name:"u-form",props:{model:{type:Object,default:function(){return{}}},errorType:{type:Array,default:function(){return["message","toast"]}},borderBottom:{type:Boolean,default:!0},labelPosition:{type:String,default:"left"},labelWidth:{type:[String,Number],default:90},labelAlign:{type:String,default:"left"},labelStyle:{type:Object,default:function(){return{}}}},provide:function(){return{uForm:this}},data:function(){return{rules:{}}},created:function(){this.fields=[]},methods:{setRules:function(e){this.rules=e},resetFields:function(){this.fields.map((function(e){e.resetField()}))},validate:function(e){var t=this;return new Promise((function(n){var u=!0,r=0,i=[];t.fields.map((function(o){o.validation("",(function(o){o&&(u=!1,i.push(o)),++r===t.fields.length&&(n(u),-1===t.errorType.indexOf("none")&&t.errorType.indexOf("toast")>=0&&i.length&&t.$u.toast(i[0]),"function"==typeof e&&e(u))}))}))}))}}};t.default=u},"1be6":function(e,t,n){"use strict";var u=n("0372"),r=n.n(u);r.a},"5e87":function(e,t,n){"use strict";n.r(t);var u=n("08e0"),r=n.n(u);for(var i in u)["default"].indexOf(i)<0&&function(e){n.d(t,e,(function(){return u[e]}))}(i);t["default"]=r.a},"6e49":function(e,t,n){"use strict";n.r(t);var u=n("98ef"),r=n("5e87");for(var i in r)["default"].indexOf(i)<0&&function(e){n.d(t,e,(function(){return r[e]}))}(i);n("1be6");var o=n("f0c5"),f=Object(o["a"])(r["default"],u["b"],u["c"],!1,null,"63833a15",null,!1,u["a"],void 0);t["default"]=f.exports},"98ef":function(e,t,n){"use strict";n.d(t,"b",(function(){return u})),n.d(t,"c",(function(){return r})),n.d(t,"a",(function(){}));var u=function(){var e=this.$createElement;this._self._c},r=[]}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'uview-ui/components/u-form/u-form-create-component',
    {
        'uview-ui/components/u-form/u-form-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('543d')['createComponent'](__webpack_require__("6e49"))
        })
    },
    [['uview-ui/components/u-form/u-form-create-component']]
]);
