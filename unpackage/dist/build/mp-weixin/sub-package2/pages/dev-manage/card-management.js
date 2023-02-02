require('../../common/vendor.js');(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package2/pages/dev-manage/card-management"],{2970:function(e,t,d){"use strict";var a=d("7eb8"),i=d.n(a);i.a},"544b":function(e,t,d){"use strict";d.r(t);var a=d("9af3"),i=d("ba29");for(var s in i)["default"].indexOf(s)<0&&function(e){d.d(t,e,(function(){return i[e]}))}(s);d("2970");var n=d("f0c5"),r=Object(n["a"])(i["default"],a["b"],a["c"],!1,null,null,null,!1,a["a"],void 0);t["default"]=r.exports},"7eb8":function(e,t,d){},"88b1":function(e,t,d){"use strict";(function(e,t){var a=d("4ea4");d("0fcb"),d("5c17");a(d("66fd"));var i=a(d("544b"));e.__webpack_require_UNI_MP_PLUGIN__=d,t(i.default)}).call(this,d("bc2e")["default"],d("543d")["createPage"])},"9af3":function(e,t,d){"use strict";d.d(t,"b",(function(){return i})),d.d(t,"c",(function(){return s})),d.d(t,"a",(function(){return a}));var a={uniBasePage:function(){return d.e("components/uni-base-page/uni-base-page").then(d.bind(null,"10e9"))}},i=function(){var e=this.$createElement;this._self._c},s=[]},ba29:function(e,t,d){"use strict";d.r(t);var a=d("e39f"),i=d.n(a);for(var s in a)["default"].indexOf(s)<0&&function(e){d.d(t,e,(function(){return a[e]}))}(s);t["default"]=i.a},e39f:function(e,t,d){"use strict";(function(e){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var d={data:function(){return{devObj:{},deleteCardList:[],addCardList:[],cardNo:[],cardNum:"",exitBthShow1:!1,exitBthShow2:!1,timer:null,swipe_card_add:"",swipe_card_add_tips:"",swipe_card_delete:"",swipe_card_delete_tips:"",input_card_add:"",input_card_add_tips:"",input_card_delete:"",input_card_delete_tips:""}},computed:{manage:function(){return this.$t("manage")},sdk:function(){return this.$t("sdk")},mine:function(){return this.$t("mine")}},onLoad:function(e){this.$setTitle(this.manage["card-manage"]||"卡管理"),e.devObj&&(this.devObj=JSON.parse(e.devObj),1===this.devObj.isBtCardAddBlacklist?(this.swipe_card_add=this.manage["swipe-card-add-blacklist"]||"刷卡添加黑名单",this.swipe_card_add_tips=this.manage["swipe-card-add-tips-blacklist"]||"刷卡进行读取卡号添加黑名单",this.swipe_card_delete=this.manage["swipe-card-delete-blacklist"]||"刷卡删除黑名单",this.swipe_card_delete_tips=this.manage["swipe-card-delete-tips-blacklist"]||"刷卡进行读取卡号删除黑名单",this.input_card_add=this.manage["input-card-add-blacklist"]||"输入卡号加入黑名单",this.input_card_add_tips=this.manage["input-card-add-tips-blacklist"]||"手动输入卡号添加黑名单",this.input_card_delete=this.manage["input-card-delete-blacklist"]||"输入卡号移除黑名单",this.input_card_delete_tips=this.manage["input-card-delete-tips-blacklist"]||"手动输入卡号删除黑名单"):(this.swipe_card_add=this.manage["swipe-card-add"]||"刷卡添加卡号",this.swipe_card_add_tips=this.manage["swipe-card-add-tips"]||"刷卡进行读取卡号添加卡",this.swipe_card_delete=this.manage["swipe-card-delete"]||"刷卡删除卡号",this.swipe_card_delete_tips=this.manage["swipe-card-delete-tips"]||"刷卡进行读取卡号删除卡",this.input_card_add=this.manage["input-card-add"]||"输入卡号添卡",this.input_card_add_tips=this.manage["input-card-add-tips"]||"手动输入卡号添加卡",this.input_card_delete=this.manage["input-card-delete"]||"输入卡号删卡",this.input_card_delete_tips=this.manage["input-card-delete-tips"]||"手动输入卡号删除卡"))},methods:{syncServerCardData:function(){var e=this;e.$showToast(),Promise.all([e.getDeleteCard(),e.getAddCard()]).then((function(t){for(var d in t)"deleteCardData"in t[d]&&t[d]["deleteCardData"].length>0&&(e.deleteCardList=t[d]["deleteCardData"].map((function(e){return e.cardNo}))),"addCardData"in t[d]&&t[d]["addCardData"].length>0&&(e.addCardList=t[d]["addCardData"].map((function(e){return e.cardNo})));var a=e.addCardList.length,i=e.deleteCardList.length,s=e.deleteCardList.join(",");0==i&&0==a?e.$showToast(e.manage["no-update-data"]||"无更新数据"):0==i&&a>0?e.$sdkUtil.writeCard(e.devObj,e.addCardList,!0,(function(t){e.postCardList(e.addCardList,e.devObj.devSn)})):i>0&&0==a?e.$sdkUtil.deleteCard(e.devObj,s,(function(t){e.postCardList(e.deleteCardList,e.devObj.devSn)})):i>0&&a>0&&e.$sdkUtil.deleteCard(e.devObj,s,(function(t){e.$showToast(),setTimeout((function(){e.$sdkUtil.writeCard(e.devObj,e.addCardList,!0,(function(t){var d=e.addCardList.concat(e.deleteCardList);e.postCardList(d,e.devObj.devSn)}))}),3e3)}))}))},postCardList:function(e,t){var d=this;this.$req.request({url:"/persOfflineCard/app/operationComplete",data:{cardNos:e,devSn:t,isShowLoad:!1},success:function(e){0==e.code?d.$showToast(d.manage["sync-card-success"]||"同步服务器卡数据成功"):d.$showToast(e.mag)}})},getDeleteCard:function(){var e=this;return new Promise((function(t,d){e.$req.request({url:"/persOfflineCard/app/getNeedDelOfflineCardByDevSn",data:{devSn:e.devObj.devSn},success:function(e){t({deleteCardData:e.data})}})}))},getAddCard:function(){var e=this;return new Promise((function(t,d){e.$req.request({url:"/persOfflineCard/app/getNeedAddOfflineCardByDevSn",data:{devSn:e.devObj.devSn},success:function(e){t({addCardData:e.data})}})}))},swipeCardAdd:function(){var e=this;1==this.devObj.btCardAddType?this.$sdkUtil.swipeAddCardModel(this.devObj,(function(t){0==t.errorCode&&(e.$showToast(e.sdk["swipe-add-card-model"]||"已进入刷卡添卡模式，请刷卡"),e.exitBthShow1=!0)})):2==this.devObj.btCardAddType&&this.$sdkUtil.getSwipeAddCardno(this.devObj,(function(t){var d=t.data.cardNo,a=d.split(",");e.$sdkUtil.writeCard(e.devObj,a,!0)}))},swipeCardDelete:function(){var e=this;1==this.devObj.btCardAddType?this.$sdkUtil.swipeCardDeleteModel(this.devObj,(function(t){e.$showToast(e.sdk["swipe-delete-card-model"]||"已进入刷卡删卡模式，请刷卡"),e.exitBthShow2=!0})):2==this.devObj.btCardAddType&&(this.$showLog("新方法"),this.$sdkUtil.getSwipeAddCardno(this.devObj,(function(t){var d=t.data.cardNo;e.$sdkUtil.deleteCard(e.devObj,d)})))},exitCardAdd:function(){var e=this;this.$sdkUtil.existSwipeCardAddModel(this.devObj,(function(t){0==t.errorCode&&(e.$showToast(e.sdk["exit-swipe-add-card-model"]||"已退出刷卡添卡模式"),e.exitBthShow1=!1)}))},exitCardDelete:function(){var e=this;this.$sdkUtil.existSwipeCardDeleteModel(this.devObj,(function(t){0==t.errorCode&&(e.$showToast(e.sdk["exit-swipe-delete-card-model"]||"已退出刷卡删卡模式"),e.exitBthShow2=!1)}))},goToInputCard:function(t){e.navigateTo({url:"input-card?devObj="+JSON.stringify(this.devObj)+"&type="+t})},getReadCardList:function(){var t=this;this.$sdkUtil.getCardNumbersFromDevice(this.devObj,(function(d){var a=d.data.cardNo,i=d.data.cardNum;0==i?t.$showToast(t.sdk["no-card"]||"暂无卡数据"):e.navigateTo({url:"../../sub-package/pages/dev-manage/card-list?cardNum="+i+"&cardNo="+JSON.stringify(a)})}))},cleanFingerprint:function(){var e=this;this.$sdkUtil.cleanFingerprints(this.devObj,(function(t){e.$showToast("清空所有指纹数据成功")}))},cleanCard:function(){this.$sdkUtil.cleanCard(this.devObj)}}};t.default=d}).call(this,d("543d")["default"])}},[["88b1","common/runtime","common/vendor"]]]);