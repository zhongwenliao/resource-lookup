(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/index/index"],{"02d0":function(e,n,t){},"28c0":function(e,n,t){"use strict";var i=t("02d0"),o=t.n(i);o.a},"30f2":function(e,n,t){"use strict";t.d(n,"b",(function(){return o})),t.d(n,"c",(function(){return u})),t.d(n,"a",(function(){return i}));var i={uNavbar:function(){return t.e("uview-ui/components/u-navbar/u-navbar").then(t.bind(null,"4a31"))},uIcon:function(){return t.e("uview-ui/components/u-icon/u-icon").then(t.bind(null,"fefa"))},uSwiper:function(){return t.e("uview-ui/components/u-swiper/u-swiper").then(t.bind(null,"0081"))},uGrid:function(){return t.e("uview-ui/components/u-grid/u-grid").then(t.bind(null,"b80a"))},uGridItem:function(){return t.e("uview-ui/components/u-grid-item/u-grid-item").then(t.bind(null,"b071"))},uBadge:function(){return t.e("uview-ui/components/u-badge/u-badge").then(t.bind(null,"0526"))},uCard:function(){return t.e("uview-ui/components/u-card/u-card").then(t.bind(null,"4705"))},uCellGroup:function(){return t.e("uview-ui/components/u-cell-group/u-cell-group").then(t.bind(null,"cae0"))},uCellItem:function(){return t.e("uview-ui/components/u-cell-item/u-cell-item").then(t.bind(null,"caac"))},uGap:function(){return t.e("uview-ui/components/u-gap/u-gap").then(t.bind(null,"4c8c"))},uImage:function(){return t.e("uview-ui/components/u-image/u-image").then(t.bind(null,"b3a8"))},uTag:function(){return t.e("uview-ui/components/u-tag/u-tag").then(t.bind(null,"7370"))},uTabbar:function(){return Promise.all([t.e("common/vendor"),t.e("uview-ui/components/u-tabbar/u-tabbar")]).then(t.bind(null,"e210"))}},o=function(){var e=this,n=e.$createElement,t=(e._self._c,e.__map(e.gridList,(function(n,t){var i=e.__get_orig(n),o=e.$permission([n.permission])||!n.permission;return{$orig:i,m0:o}}))),i=e.zoneName?e.noticeList.length:null,o=e.zoneName&&i>0?e.__map(e.noticeList,(function(n,t){var i=e.__get_orig(n),o=e.noticeColor(t);return{$orig:i,m1:o}})):null,u=e.merchantsList.length,a=u>0?e.__map(e.merchantsList,(function(n,t){var i=e.__get_orig(n),o=e.merchantsList.length;return{$orig:i,g2:o}})):null;e.$mp.data=Object.assign({},{$root:{l0:t,g0:i,l1:o,g1:u,l2:a}})},u=[]},3323:function(e,n,t){"use strict";(function(e,n){var i=t("4ea4");t("0fcb"),t("5c17");i(t("66fd"));var o=i(t("b33a"));e.__webpack_require_UNI_MP_PLUGIN__=t,n(o.default)}).call(this,t("bc2e")["default"],t("543d")["createPage"])},"71bf":function(e,n,t){"use strict";(function(e){var i=t("4ea4");Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var o=i(t("2630")),u={data:function(){return{tabbar:o.default,zoneId:e.getStorageSync("userInfo").zoneId,zoneName:"",backgroundImage:"",title:"Hello",list:[{imagePath:"https://file.yuanzhoulvwego.com/prod/uploadFiles/banner1.png"}],bannerList:[],typeList:[],noticeList:[],merchantsList:[],moreStates:!1,gridList:[{id:1,title:"招商信息",imgUrl:"https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/zhaoshang.png",width:68,height:64,permission:"",url:"/sub-package2/pages/home/merchants/index",count:0},{id:3,title:"我的合同",imgUrl:"https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/hetong.png",width:66,height:65,permission:"contractManagement:selectContractManagement",url:"/sub-package2/pages/home/contract/index",count:0},{id:4,title:"账单缴费",imgUrl:"https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/zhandan.png",width:58,height:66,permission:"billPay:selectBillPay",url:"/sub-package2/pages/home/billPay/index",count:0},{id:5,title:"人员登记",imgUrl:"https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/yuangongguanli.png",width:58,height:65,permission:"employeeManagement:selectEmployee",url:"/sub-package2/pages/home/employeeManagement/index",count:0},{id:6,title:"申请报修",imgUrl:"https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/baoxiu.png",width:68,height:65,permission:"zoneRepair:selectZoneRepair",url:"/sub-package2/pages/home/repairs/index",count:0},{id:7,title:"会议室预约",imgUrl:"https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/huiyishiyuyue.png",width:68,height:60,permission:"meetingRoomReservation",url:"/sub-package2/pages/home/meetingRoom/index",count:0},{id:10,title:"投诉建议",imgUrl:"https://file.yuanzhoulvwego.com/prod/uploadFiles/userComplaints/lianxiwuye.png",width:64,height:66,permission:"zoneComplaint:selectZoneComplaint",url:"/sub-package2/pages/home/userComplaints/index",count:0},{id:11,title:"联系物业",imgUrl:"https://file.yuanzhoulvwego.com/prod/uploadFiles/userComplaints/yonghutousu.png",width:64,height:66,permission:"",url:"/sub-package2/pages/home/contactProperty/index",count:0},{id:13,title:"物品放行",imgUrl:"https://file.yuanzhoulvwego.com/prod/uploadFiles/user-grid/wupingfangxing3.png",url:"/pages/user/propertyPass",permission:"itemManagement:selectItemManagement",width:64,height:66,count:0}]}},computed:{noticeColor:function(){return function(e){return 0==e?"#DC6060":1==e?"#609ddc":2==e?"#dca660":void 0}}},onLoad:function(){this.queryData(),this.gridListFind(),this.cidAddOrUpdateCid()},onShow:function(){this.zoneName=e.getStorageSync("zoneInfo").name||"",this.zoneName&&this.getNotice()},onPullDownRefresh:function(){this.queryData(),this.cidAddOrUpdateCid(),e.stopPullDownRefresh()},onPageScroll:function(e){this.pageScrollTop=Math.floor(e.scrollTop),this.pageScrollTop>0?this.backgroundImage="linear-gradient(-25deg, #e0e6fd 0%, #ffffff 0%, #7EA4FB  0%, #709BFB 100%) !important":this.backgroundImage=" "},methods:{gridListFind:function(){var e=this,n=[];this.gridList.forEach((function(t){!e.$permission([t.permission])&&t.permission||n.push(t)})),this.gridList=n.length>=9?n.slice(0,9):n,this.moreStates=this.gridList.length>=9},cidAddOrUpdateCid:function(){var n=this;console.log(12344);var t=null,i=e.getSystemInfoSync().platform;console.log(i),e.getPushClientId({success:function(o){console.log(o),t=o.cid;var u={cid:t,systemType:"android"===i?2:1};n.$api("user.addOrUpdateCid",u).then((function(e){console.log(e),200==e.code&&console.log("cid")})).catch((function(n){e.hideLoading()})),console.log("客户端推送标识:",t)},fail:function(e){console.log(e)}})},queryData:function(){var n=this;this.typeList=this.$enum.roomType.filter((function(e){return 2!=e.value&&3!=e.value&&6!=e.value&&7!=e.value})),e.getStorageSync("zoneInfo").id?(console.log("拥有园区"),this.getBanner(),this.getDeviceList(),this.getNotice()):this.bannerList=this.list,this.getMerchants(),e.$on("refreshData",(function(){n.getBanner(),n.getDeviceList(),n.getNotice(),n.getMerchants()}))},ScanCode:function(){e.scanCode({success:function(e){console.log("条码类型："+e.scanType),console.log("条码内容："+e.result)}})},goMerchantsDetails:function(e){this.$Router.push({path:"/sub-package2/pages/home/merchants/detailsMerchants",query:e})},selectZone:function(){this.zoneId<1&&this.$Router.push({path:"/pages/index/selectZone"})},goPage:function(e){this.$tools.routerTo(e.url,{},e.isTabbar||null)},getBanner:function(){var e=this;this.$api("user.getBanner",{promotionScope:2}).then((function(n){if(200==n.code)if(n.data.length){var t=n.data.sort((function(e,n){return e.sort-n.sort}));e.bannerList=t}else e.bannerList=e.list}))},getMerchants:function(){var n=this,t={investmentStatus:1,currPage:1,pageSize:3};e.getStorageSync("zoneInfo").id&&(t.zoneId=e.getStorageSync("zoneInfo").id),this.$api("merchants.merchantsList",t,!1).then((function(e){200==e.code&&(n.merchantsList=e.data.list)}))},goNoticeList:function(e){this.$Router.push({path:"/sub-package2/pages/home/notice/noticeInfo",query:{id:e}})},getNotice:function(){var e=this;this.$api("notice.noticeList",{currPage:1,pageSize:3},!1).then((function(n){200==n.code?e.noticeList=n.data.list:console.log(n.error)}))},getDeviceList:function(){this.$api("equipment.equipmentList",{currPage:1},!1).then((function(n){200==n.code&&(console.log("权限门禁设备列表",n.data),e.setStorageSync("deviceList",n.data))}))}}};n.default=u}).call(this,t("543d")["default"])},"793a":function(e,n,t){},8595:function(e,n,t){"use strict";t.r(n);var i=t("71bf"),o=t.n(i);for(var u in i)["default"].indexOf(u)<0&&function(e){t.d(n,e,(function(){return i[e]}))}(u);n["default"]=o.a},"9b83":function(e,n,t){"use strict";var i=t("793a"),o=t.n(i);o.a},b33a:function(e,n,t){"use strict";t.r(n);var i=t("30f2"),o=t("8595");for(var u in o)["default"].indexOf(u)<0&&function(e){t.d(n,e,(function(){return o[e]}))}(u);t("28c0"),t("9b83");var a=t("f0c5"),r=Object(a["a"])(o["default"],i["b"],i["c"],!1,null,null,null,!1,i["a"],void 0);n["default"]=r.exports}},[["3323","common/runtime","common/vendor"]]]);