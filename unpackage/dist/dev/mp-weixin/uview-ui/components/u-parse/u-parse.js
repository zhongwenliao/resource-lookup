(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["uview-ui/components/u-parse/u-parse"],{1353:function(t,e,n){"use strict";n.r(e);var i=n(1354),r=n(1356);for(var o in r)["default"].indexOf(o)<0&&function(t){n.d(e,t,(function(){return r[t]}))}(o);n(1361);var s,a=n(39),c=Object(a["default"])(r["default"],i["render"],i["staticRenderFns"],!1,null,null,null,!1,i["components"],s);c.options.__file="uview-ui/components/u-parse/u-parse.vue",e["default"]=c.exports},1354:function(t,e,n){"use strict";n.r(e);var i=n(1355);n.d(e,"render",(function(){return i["render"]})),n.d(e,"staticRenderFns",(function(){return i["staticRenderFns"]})),n.d(e,"recyclableRender",(function(){return i["recyclableRender"]})),n.d(e,"components",(function(){return i["components"]}))},1355:function(t,e,n){"use strict";var i;n.r(e),n.d(e,"render",(function(){return r})),n.d(e,"staticRenderFns",(function(){return s})),n.d(e,"recyclableRender",(function(){return o})),n.d(e,"components",(function(){return i}));var r=function(){var t=this,e=t.$createElement,n=(t._self._c,t.nodes.length);t.$mp.data=Object.assign({},{$root:{g0:n}})},o=!1,s=[];r._withStripped=!0},1356:function(t,e,n){"use strict";n.r(e);var i=n(1357),r=n.n(i);for(var o in i)["default"].indexOf(o)<0&&function(t){n.d(e,t,(function(){return i[t]}))}(o);e["default"]=r.a},1357:function(t,e,n){"use strict";(function(t,i){var r;Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var o,s=function(){n.e("uview-ui/components/u-parse/libs/trees").then(function(){return resolve(n(1448))}.bind(null,n)).catch(n.oe)},a={},c=t.getFileSystemManager?t.getFileSystemManager():null,l=n(1358);function u(t){for(var e=t.length,n=5381;e--;)n+=(n<<5)+t.charCodeAt(e);return n}var h={name:"parser",data:function(){return{showAm:"",nodes:[]}},components:{trees:s},props:{html:String,autopause:{type:Boolean,default:!0},autoscroll:Boolean,autosetTitle:{type:Boolean,default:!0},compress:Number,loadingImg:String,useCache:Boolean,domain:String,lazyLoad:Boolean,selectable:Boolean,tagStyle:Object,showWithAnimation:Boolean,useAnchor:Boolean},watch:{html:function(t){this.setContent(t)}},created:function(){this.imgList=[],this.imgList.each=function(t){for(var e=0,n=this.length;e<n;e++)this.setItem(e,t(this[e],e,this))},this.imgList.setItem=function(t,e){var n=this;if(void 0!=t&&e){if(0==e.indexOf("http")&&this.includes(e)){for(var r,o=e.split("://")[0],s=o.length;r=e[s];s++){if("/"==r&&"/"!=e[s-1]&&"/"!=e[s+1])break;o+=Math.random()>.5?r.toUpperCase():r}return o+=e.substr(s),this[t]=o}if(this[t]=e,e.includes("data:image")){var a,l=e.match(/data:image\/(\S+?);(\S+?),(.+)/);if(!l)return;a="".concat(i.env.USER_DATA_PATH,"/").concat(Date.now(),".").concat(l[1]),c&&c.writeFile({filePath:a,data:l[3],encoding:l[2],success:function(){return n[t]=a}})}}}},mounted:function(){var t=this;o&&(this.document=new o(this)),r&&(this.search=function(e){return r(t,e)}),this.html&&this.setContent(this.html)},beforeDestroy:function(){this.imgList.each((function(e){e&&e.includes(t.env.USER_DATA_PATH)&&c&&c.unlink({filePath:e})})),clearInterval(this._timer)},methods:{setContent:function(e,n){var i,r=this;if(!e)return this.nodes=[];var o,s=new l(e,this);if(this.useCache){var c=u(e);a[c]?i=a[c]:(i=s.parse(),a[c]=i)}else i=s.parse();this.$emit("parse",i),this.nodes=n?this.nodes.concat(i):i,i.length&&i.title&&this.autosetTitle&&t.setNavigationBarTitle({title:i.title}),this.imgList&&(this.imgList.length=0),this.videoContexts=[],this.$nextTick((function(){(function t(e){for(var n=e.length;n--;)e[n].top&&(e[n].controls=[],e[n].init(),t(e[n].$children))})(r.$children),r.$emit("load")})),clearInterval(this._timer),this._timer=setInterval((function(){t.createSelectorQuery().in(r).select("#_top").boundingClientRect().exec((function(t){t&&(r.rect=t[0],r.rect.height==o&&(r.$emit("ready",r.rect),clearInterval(r._timer)),o=r.rect.height)}))}),350),this.showWithAnimation&&!n&&(this.showAm="animation:_show .5s")},getText:function(){for(var t,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.nodes,n="",i=0;t=e[i++];)if("text"==t.type)n+=t.text.replace(/&nbsp;/g," ").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");else if("br"==t.type)n+="\n";else{var r="p"==t.name||"div"==t.name||"tr"==t.name||"li"==t.name||"h"==t.name[0]&&t.name[1]>"0"&&t.name[1]<"7";r&&n&&"\n"!=n[n.length-1]&&(n+="\n"),t.children&&(n+=this.getText(t.children)),r&&"\n"!=n[n.length-1]?n+="\n":"td"!=t.name&&"th"!=t.name||(n+="\t")}return n},in:function(t){t.page&&t.selector&&t.scrollTop&&(this._in=t)},navigateTo:function(e){var n=this;if(!this.useAnchor)return e.fail&&e.fail("Anchor is disabled");var i=" ";i=">>>";var r=t.createSelectorQuery().in(this._in?this._in.page:this).select((this._in?this._in.selector:"#_top")+(e.id?"".concat(i,"#").concat(e.id,",").concat(this._in?this._in.selector:"#_top").concat(i,".").concat(e.id):"")).boundingClientRect();this._in?r.select(this._in.selector).scrollOffset().select(this._in.selector).boundingClientRect():r.selectViewport().scrollOffset(),r.exec((function(i){if(!i[0])return e.fail&&e.fail("Label not found");var r=i[1].scrollTop+i[0].top-(i[2]?i[2].top:0)+(e.offset||0);n._in?n._in.page[n._in.scrollTop]=r:t.pageScrollTo({scrollTop:r,duration:300}),e.success&&e.success()}))},getVideoContext:function(t){if(!t)return this.videoContexts;for(var e=this.videoContexts.length;e--;)if(this.videoContexts[e].id==t)return this.videoContexts[e]}}};e.default=h}).call(this,n(2)["default"],n(1)["default"])},1361:function(t,e,n){"use strict";n.r(e);var i=n(1362),r=n.n(i);for(var o in i)["default"].indexOf(o)<0&&function(t){n.d(e,t,(function(){return i[t]}))}(o);e["default"]=r.a},1362:function(t,e,n){}}]);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/uview-ui/components/u-parse/u-parse.js.map
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'uview-ui/components/u-parse/u-parse-create-component',
    {
        'uview-ui/components/u-parse/u-parse-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('2')['createComponent'](__webpack_require__(1353))
        })
    },
    [['uview-ui/components/u-parse/u-parse-create-component']]
]);
