require('../../common/vendor.js');(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package2/pages/dev-manage/card-management"],{924:function(e,t,d){"use strict";(function(e,t){var a=d(4);d(26),d(27);a(d(25));var i=a(d(925));e.__webpack_require_UNI_MP_PLUGIN__=d,t(i.default)}).call(this,d(1)["default"],d(2)["createPage"])},925:function(e,t,d){"use strict";d.r(t);var a=d(926),i=d(928);for(var n in i)["default"].indexOf(n)<0&&function(e){d.d(t,e,(function(){return i[e]}))}(n);d(930);var s,r=d(39),c=Object(r["default"])(i["default"],a["render"],a["staticRenderFns"],!1,null,null,null,!1,a["components"],s);c.options.__file="sub-package2/pages/dev-manage/card-management.vue",t["default"]=c.exports},926:function(e,t,d){"use strict";d.r(t);var a=d(927);d.d(t,"render",(function(){return a["render"]})),d.d(t,"staticRenderFns",(function(){return a["staticRenderFns"]})),d.d(t,"recyclableRender",(function(){return a["recyclableRender"]})),d.d(t,"components",(function(){return a["components"]}))},927:function(e,t,d){"use strict";var a;d.r(t),d.d(t,"render",(function(){return i})),d.d(t,"staticRenderFns",(function(){return s})),d.d(t,"recyclableRender",(function(){return n})),d.d(t,"components",(function(){return a}));try{a={uniBasePage:function(){return d.e("components/uni-base-page/uni-base-page").then(d.bind(null,979))}}}catch(r){if(-1===r.message.indexOf("Cannot find module")||-1===r.message.indexOf(".vue"))throw r;console.error(r.message),console.error("1. 排查组件名称拼写是否正确"),console.error("2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"),console.error("3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件")}var i=function(){var e=this,t=e.$createElement;e._self._c},n=!1,s=[];i._withStripped=!0},928:function(e,t,d){"use strict";d.r(t);var a=d(929),i=d.n(a);for(var n in a)["default"].indexOf(n)<0&&function(e){d.d(t,e,(function(){return a[e]}))}(n);t["default"]=i.a},929:function(e,t,d){"use strict";(function(e){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var d={data:function(){return{devObj:{},deleteCardList:[],addCardList:[],cardNo:[],cardNum:"",exitBthShow1:!1,exitBthShow2:!1,timer:null,swipe_card_add:"",swipe_card_add_tips:"",swipe_card_delete:"",swipe_card_delete_tips:"",input_card_add:"",input_card_add_tips:"",input_card_delete:"",input_card_delete_tips:""}},computed:{manage:function(){return this.$t("manage")},sdk:function(){return this.$t("sdk")},mine:function(){return this.$t("mine")}},onLoad:function(e){this.$setTitle(this.manage["card-manage"]||"卡管理"),e.devObj&&(this.devObj=JSON.parse(e.devObj),1===this.devObj.isBtCardAddBlacklist?(this.swipe_card_add=this.manage["swipe-card-add-blacklist"]||"刷卡添加黑名单",this.swipe_card_add_tips=this.manage["swipe-card-add-tips-blacklist"]||"刷卡进行读取卡号添加黑名单",this.swipe_card_delete=this.manage["swipe-card-delete-blacklist"]||"刷卡删除黑名单",this.swipe_card_delete_tips=this.manage["swipe-card-delete-tips-blacklist"]||"刷卡进行读取卡号删除黑名单",this.input_card_add=this.manage["input-card-add-blacklist"]||"输入卡号加入黑名单",this.input_card_add_tips=this.manage["input-card-add-tips-blacklist"]||"手动输入卡号添加黑名单",this.input_card_delete=this.manage["input-card-delete-blacklist"]||"输入卡号移除黑名单",this.input_card_delete_tips=this.manage["input-card-delete-tips-blacklist"]||"手动输入卡号删除黑名单"):(this.swipe_card_add=this.manage["swipe-card-add"]||"刷卡添加卡号",this.swipe_card_add_tips=this.manage["swipe-card-add-tips"]||"刷卡进行读取卡号添加卡",this.swipe_card_delete=this.manage["swipe-card-delete"]||"刷卡删除卡号",this.swipe_card_delete_tips=this.manage["swipe-card-delete-tips"]||"刷卡进行读取卡号删除卡",this.input_card_add=this.manage["input-card-add"]||"输入卡号添卡",this.input_card_add_tips=this.manage["input-card-add-tips"]||"手动输入卡号添加卡",this.input_card_delete=this.manage["input-card-delete"]||"输入卡号删卡",this.input_card_delete_tips=this.manage["input-card-delete-tips"]||"手动输入卡号删除卡"))},methods:{syncServerCardData:function(){var e=this;e.$showToast(),Promise.all([e.getDeleteCard(),e.getAddCard()]).then((function(t){for(var d in t)"deleteCardData"in t[d]&&t[d]["deleteCardData"].length>0&&(e.deleteCardList=t[d]["deleteCardData"].map((function(e){return e.cardNo}))),"addCardData"in t[d]&&t[d]["addCardData"].length>0&&(e.addCardList=t[d]["addCardData"].map((function(e){return e.cardNo})));var a=e.addCardList.length,i=e.deleteCardList.length,n=e.deleteCardList.join(",");0==i&&0==a?e.$showToast(e.manage["no-update-data"]||"无更新数据"):0==i&&a>0?e.$sdkUtil.writeCard(e.devObj,e.addCardList,!0,(function(t){e.postCardList(e.addCardList,e.devObj.devSn)})):i>0&&0==a?e.$sdkUtil.deleteCard(e.devObj,n,(function(t){e.postCardList(e.deleteCardList,e.devObj.devSn)})):i>0&&a>0&&e.$sdkUtil.deleteCard(e.devObj,n,(function(t){e.$showToast(),setTimeout((function(){e.$sdkUtil.writeCard(e.devObj,e.addCardList,!0,(function(t){var d=e.addCardList.concat(e.deleteCardList);e.postCardList(d,e.devObj.devSn)}))}),3e3)}))}))},postCardList:function(e,t){var d=this;this.$req.request({url:"/persOfflineCard/app/operationComplete",data:{cardNos:e,devSn:t,isShowLoad:!1},success:function(e){0==e.code?d.$showToast(d.manage["sync-card-success"]||"同步服务器卡数据成功"):d.$showToast(e.mag)}})},getDeleteCard:function(){var e=this;return new Promise((function(t,d){e.$req.request({url:"/persOfflineCard/app/getNeedDelOfflineCardByDevSn",data:{devSn:e.devObj.devSn},success:function(e){t({deleteCardData:e.data})}})}))},getAddCard:function(){var e=this;return new Promise((function(t,d){e.$req.request({url:"/persOfflineCard/app/getNeedAddOfflineCardByDevSn",data:{devSn:e.devObj.devSn},success:function(e){t({addCardData:e.data})}})}))},swipeCardAdd:function(){var e=this;1==this.devObj.btCardAddType?this.$sdkUtil.swipeAddCardModel(this.devObj,(function(t){0==t.errorCode&&(e.$showToast(e.sdk["swipe-add-card-model"]||"已进入刷卡添卡模式，请刷卡"),e.exitBthShow1=!0)})):2==this.devObj.btCardAddType&&this.$sdkUtil.getSwipeAddCardno(this.devObj,(function(t){var d=t.data.cardNo,a=d.split(",");e.$sdkUtil.writeCard(e.devObj,a,!0)}))},swipeCardDelete:function(){var e=this;1==this.devObj.btCardAddType?this.$sdkUtil.swipeCardDeleteModel(this.devObj,(function(t){e.$showToast(e.sdk["swipe-delete-card-model"]||"已进入刷卡删卡模式，请刷卡"),e.exitBthShow2=!0})):2==this.devObj.btCardAddType&&(this.$showLog("新方法"),this.$sdkUtil.getSwipeAddCardno(this.devObj,(function(t){var d=t.data.cardNo;e.$sdkUtil.deleteCard(e.devObj,d)})))},exitCardAdd:function(){var e=this;this.$sdkUtil.existSwipeCardAddModel(this.devObj,(function(t){0==t.errorCode&&(e.$showToast(e.sdk["exit-swipe-add-card-model"]||"已退出刷卡添卡模式"),e.exitBthShow1=!1)}))},exitCardDelete:function(){var e=this;this.$sdkUtil.existSwipeCardDeleteModel(this.devObj,(function(t){0==t.errorCode&&(e.$showToast(e.sdk["exit-swipe-delete-card-model"]||"已退出刷卡删卡模式"),e.exitBthShow2=!1)}))},goToInputCard:function(t){e.navigateTo({url:"input-card?devObj="+JSON.stringify(this.devObj)+"&type="+t})},getReadCardList:function(){var t=this;this.$sdkUtil.getCardNumbersFromDevice(this.devObj,(function(d){var a=d.data.cardNo,i=d.data.cardNum;0==i?t.$showToast(t.sdk["no-card"]||"暂无卡数据"):e.navigateTo({url:"../../sub-package/pages/dev-manage/card-list?cardNum="+i+"&cardNo="+JSON.stringify(a)})}))},cleanFingerprint:function(){var e=this;this.$sdkUtil.cleanFingerprints(this.devObj,(function(t){e.$showToast("清空所有指纹数据成功")}))},cleanCard:function(){this.$sdkUtil.cleanCard(this.devObj)}}};t.default=d}).call(this,d(2)["default"])},930:function(e,t,d){"use strict";d.r(t);var a=d(931),i=d.n(a);for(var n in a)["default"].indexOf(n)<0&&function(e){d.d(t,e,(function(){return a[e]}))}(n);t["default"]=i.a},931:function(e,t,d){}},[[924,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/sub-package2/pages/dev-manage/card-management.js.map