(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package/pages/dev-manage/all-open-door-records"],{"0611":function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var o={},r={},c={"1-0":19,"1-1":79,"2-0":0,"2-1":47,"3-0":20,"3-1":77,"4-0":8,"5-0":122,"6-0":24,"6-1":65,"7-0":23,"7-1":74,"8-0":4,"8-1":50},a={data:function(){return{allRecords:[],eventType:null}},methods:{readAllRecords:function(e){var n=this;this.allRecords=[],this.$sdkUtil.getOpenDoorRecordFromDevice(e,(function(t){var r=t.data;n.$showLog("通过蓝牙本地插件获取当前设备的开门记录",r),r.map((function(t){var r={1:"",2:t.cardno,3:t.password,4:"",5:"",6:t.cardno,7:"",8:t.password},a=t.date,s=t.type,i=t.result,u={eventName:o[s],eventTime:n.$formatTime(a),eventResult:0==i?n.common["open-success"]||"开门成功":n.common["open-fail"]||"开门失败",number:r[s],devSn:e.devSn,eventType:c["".concat(s,"-").concat(i)]};n.allRecords.push(u)})),n.allRecords.sort((function(e,n){return n.eventTime>e.eventTime?1:-1}))}))},saveRecords:function(){var e=this;console.log(this.allRecords),this.$api("equipment.addDevOpenRecord",{data:this.allRecords}).then((function(n){200===n.code&&e.$showToast("添加开门记录成功")}))}},computed:{common:function(){return this.$t("common")},records:function(){return this.$t("records")}},onLoad:function(e){this.$setTitle(this.records["title"]||"开门记录"),r=JSON.parse(e.devObj),o={1:this.records["bluetooth_key"]||"蓝牙开门",2:this.records["slot_card_key"]||"刷卡开门",3:this.records["password_key"]||"密码开门",4:this.records["long_distance_key"]||"远程开门",5:this.records["touch_key"]||"触摸开门",6:this.records["fingerprint_key"]||"指纹开门",7:this.records["code_key"]||"二维码开门",8:this.records["fixed_password_key"]||"固定密码开门"},this.readAllRecords(r)},onShow:function(){}};n.default=a},"16c4":function(e,n,t){},3533:function(e,n,t){"use strict";(function(e){t("0fcb"),t("5c17");o(t("66fd"));var n=o(t("a78a"));function o(e){return e&&e.__esModule?e:{default:e}}wx.__webpack_require_UNI_MP_PLUGIN__=t,e(n.default)}).call(this,t("543d")["createPage"])},"4d35":function(e,n,t){"use strict";t.r(n);var o=t("0611"),r=t.n(o);for(var c in o)"default"!==c&&function(e){t.d(n,e,(function(){return o[e]}))}(c);n["default"]=r.a},a78a:function(e,n,t){"use strict";t.r(n);var o=t("e8ca"),r=t("4d35");for(var c in r)"default"!==c&&function(e){t.d(n,e,(function(){return r[e]}))}(c);t("f31a7");var a,s=t("f0c5"),i=Object(s["a"])(r["default"],o["b"],o["c"],!1,null,null,null,!1,o["a"],a);n["default"]=i.exports},e8ca:function(e,n,t){"use strict";t.d(n,"b",(function(){return r})),t.d(n,"c",(function(){return c})),t.d(n,"a",(function(){return o}));var o={uniBasePage:function(){return t.e("components/uni-base-page/uni-base-page").then(t.bind(null,"10e9"))},uniEmptyPage:function(){return t.e("components/uni-empty-page/uni-empty-page").then(t.bind(null,"4815"))}},r=function(){var e=this,n=e.$createElement;e._self._c},c=[]},f31a7:function(e,n,t){"use strict";var o=t("16c4"),r=t.n(o);r.a}},[["3533","common/runtime","common/vendor"]]]);