(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/index/index"],{"008e":function(e,t,n){"use strict";n.d(t,"b",(function(){return o})),n.d(t,"c",(function(){return a})),n.d(t,"a",(function(){return i}));var i={uNavbar:function(){return n.e("uview-ui/components/u-navbar/u-navbar").then(n.bind(null,"4a31"))},uIcon:function(){return n.e("uview-ui/components/u-icon/u-icon").then(n.bind(null,"fefa"))},uSwiper:function(){return n.e("uview-ui/components/u-swiper/u-swiper").then(n.bind(null,"0081"))},uGrid:function(){return n.e("uview-ui/components/u-grid/u-grid").then(n.bind(null,"b80a"))},uGridItem:function(){return n.e("uview-ui/components/u-grid-item/u-grid-item").then(n.bind(null,"b071"))},uBadge:function(){return n.e("uview-ui/components/u-badge/u-badge").then(n.bind(null,"0526"))},uCard:function(){return n.e("uview-ui/components/u-card/u-card").then(n.bind(null,"4705"))},uCellGroup:function(){return n.e("uview-ui/components/u-cell-group/u-cell-group").then(n.bind(null,"cae0"))},uCellItem:function(){return n.e("uview-ui/components/u-cell-item/u-cell-item").then(n.bind(null,"caac"))},uGap:function(){return n.e("uview-ui/components/u-gap/u-gap").then(n.bind(null,"4c8c"))},uImage:function(){return n.e("uview-ui/components/u-image/u-image").then(n.bind(null,"b3a8"))},uTag:function(){return n.e("uview-ui/components/u-tag/u-tag").then(n.bind(null,"7370"))},uTabbar:function(){return Promise.all([n.e("common/vendor"),n.e("uview-ui/components/u-tabbar/u-tabbar")]).then(n.bind(null,"e210"))}},o=function(){var e=this,t=e.$createElement,n=(e._self._c,e.__map(e.gridList,(function(t,n){var i=e.__get_orig(t),o=e.$permission([t.permission])||!t.permission;return{$orig:i,m0:o}}))),i=e.zoneName&&e.noticeList.length>0?e.__map(e.noticeList,(function(t,n){var i=e.__get_orig(t),o=e.noticeColor(n);return{$orig:i,m1:o}})):null;e.$mp.data=Object.assign({},{$root:{l0:n,l1:i}})},a=[]},"02d0":function(e,t,n){},"28c0":function(e,t,n){"use strict";var i=n("02d0"),o=n.n(i);o.a},3323:function(e,t,n){"use strict";(function(e){var t=n("4ea4");n("0fcb"),n("5c17");t(n("66fd"));var i=t(n("b33a"));wx.__webpack_require_UNI_MP_PLUGIN__=n,e(i.default)}).call(this,n("543d")["createPage"])},"71bf":function(e,t,n){"use strict";(function(e){var i=n("4ea4");Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var o=i(n("2630")),a={data:function(){return{tabbar:o.default,zoneId:e.getStorageSync("userInfo").zoneId,zoneName:"",backgroundImage:"",title:"Hello",list:[{imagePath:"http://yuanzhoulvwego.com/wp-content/uploads/static/banner1.png"}],bannerList:[],typeList:[],noticeList:[],merchantsList:[],moreStates:!1,gridList:[{id:1,title:"招商信息",imgUrl:"http://yuanzhoulvwego.com/wp-content/uploads/static/home-grid/zhaoshang.png",width:68,height:64,permission:"",url:"/sub-package2/pages/home/merchants/index",count:0},{id:14,title:"停车缴费",imgUrl:"http://yuanzhoulvwego.com/wp-content/uploads/static/home/payParking/tingchefufei.png",url:"/sub-package2/pages/home/payParking/index",permission:"",width:64,height:66,count:0},{id:3,title:"我的合同",imgUrl:"http://yuanzhoulvwego.com/wp-content/uploads/static/home-grid/hetong.png",width:66,height:65,permission:"contractManagement:selectContractManagement",url:"/sub-package2/pages/home/contract/index",count:0},{id:4,title:"账单缴费",imgUrl:"http://yuanzhoulvwego.com/wp-content/uploads/static/home-grid/zhandan.png",width:58,height:66,permission:"billPay:selectBillPay",url:"/sub-package2/pages/home/billPay/index",count:0},{id:5,title:"人员登记",imgUrl:"http://yuanzhoulvwego.com/wp-content/uploads/static/home-grid/yuangongguanli.png",width:58,height:65,permission:"employeeManagement:selectEmployee",url:"/sub-package2/pages/home/employeeManagement/index",count:0},{id:6,title:"申请报修",imgUrl:"http://yuanzhoulvwego.com/wp-content/uploads/static/home-grid/baoxiu.png",width:68,height:65,permission:"zoneRepair:selectZoneRepair",url:"/sub-package2/pages/home/repairs/index",count:0},{id:7,title:"会议室预约",imgUrl:"http://yuanzhoulvwego.com/wp-content/uploads/static/home-grid/huiyishiyuyue.png",width:68,height:60,permission:"meetingRoomReservation",url:"/sub-package2/pages/home/meetingRoom/index",count:0},{id:8,title:"手机开门",imgUrl:"http://yuanzhoulvwego.com/wp-content/uploads/static/home-grid/menjin.png",width:61,height:65,permission:"accessControl:selectAccessControl",url:"/sub-package2/pages/home/entranceGuard/index",count:0},{id:10,title:"投诉建议",imgUrl:"http://yuanzhoulvwego.com/wp-content/uploads/static/userComplaints/lianxiwuye.png",width:64,height:66,permission:"zoneComplaint:selectZoneComplaint",url:"/sub-package2/pages/home/userComplaints/index",count:0},{id:11,title:"联系物业",imgUrl:"http://yuanzhoulvwego.com/wp-content/uploads/static/userComplaints/yonghutousu.png",width:64,height:66,permission:"",url:"/sub-package2/pages/home/contactProperty/index",count:0},{id:12,title:"访客授权",imgUrl:"http://yuanzhoulvwego.com/wp-content/uploads/static/home-grid/fangkeshouquan3.png",width:64,height:66,url:"/sub-package1/pages/vis/vis",permission:"visitorAuthorization:selectVisitor",count:0},{id:13,title:"物品放行",imgUrl:"http://yuanzhoulvwego.com/wp-content/uploads/static/user-grid/wupingfangxing3.png",url:"/pages/user/propertyPass",permission:"itemManagement:selectItemManagement",width:64,height:66,count:0}]}},computed:{noticeColor:function(){return function(e){return 0==e?"#DC6060":1==e?"#609ddc":2==e?"#dca660":void 0}}},onLoad:function(){this.queryData(),this.gridListFind(),this.cidAddOrUpdateCid()},onShow:function(){this.zoneName=e.getStorageSync("zoneInfo").name||"",this.zoneName&&this.getNotice()},onPullDownRefresh:function(){this.queryData(),this.cidAddOrUpdateCid(),e.stopPullDownRefresh()},onPageScroll:function(e){this.pageScrollTop=Math.floor(e.scrollTop),this.pageScrollTop>0?this.backgroundImage="linear-gradient(-25deg, #e0e6fd 0%, #ffffff 0%, #7EA4FB  0%, #709BFB 100%) !important":this.backgroundImage=" "},methods:{gridListFind:function(){var e=this,t=[];this.gridList.forEach((function(n){!e.$permission([n.permission])&&n.permission||t.push(n)})),this.gridList=t.length>=9?t.slice(0,9):t,this.moreStates=this.gridList.length>=9},cidAddOrUpdateCid:function(){var t=this;console.log(12344);var n=null,i=e.getSystemInfoSync().platform;console.log(i),e.getPushClientId({success:function(o){console.log(o),n=o.cid;var a={cid:n,systemType:"android"===i?2:1};t.$api("user.addOrUpdateCid",a).then((function(e){console.log(e),200==e.code&&console.log("cid")})).catch((function(t){e.hideLoading()})),console.log("客户端推送标识:",n)},fail:function(e){console.log(e)}})},queryData:function(){var t=this;this.typeList=this.$enum.roomType.filter((function(e){return 2!=e.value&&3!=e.value&&6!=e.value&&7!=e.value})),e.getStorageSync("zoneInfo").id?(console.log("拥有园区"),this.getBanner(),this.getDeviceList(),this.getNotice()):this.bannerList=this.list,this.getMerchants(),e.$on("refreshData",(function(){t.getBanner(),t.getDeviceList(),t.getNotice(),t.getMerchants()}))},ScanCode:function(){e.scanCode({success:function(e){console.log("条码类型："+e.scanType),console.log("条码内容："+e.result)}})},goMerchantsDetails:function(e){this.$Router.push({path:"/sub-package2/pages/home/merchants/detailsMerchants",query:e})},selectZone:function(){this.zoneId<1&&this.$Router.push({path:"/pages/index/selectZone"})},goPage:function(e){this.$tools.routerTo(e.url,{},e.isTabbar||null)},getBanner:function(){var e=this;this.$api("user.getBanner",{promotionScope:2}).then((function(t){if(200==t.code)if(t.data.length){var n=t.data.sort((function(e,t){return e.sort-t.sort}));e.bannerList=n}else e.bannerList=e.list}))},getMerchants:function(){var t=this,n={investmentStatus:1,currPage:1,pageSize:3};e.getStorageSync("zoneInfo").id&&(n.zoneId=e.getStorageSync("zoneInfo").id),this.$api("merchants.merchantsList",n,!1).then((function(e){200==e.code&&(t.merchantsList=e.data.list)}))},goNoticeList:function(e){this.$Router.push({path:"/sub-package2/pages/home/notice/noticeInfo",query:{id:e}})},getNotice:function(){var e=this;this.$api("notice.noticeList",{currPage:1,pageSize:3},!1).then((function(t){200==t.code?e.noticeList=t.data.list:console.log(t.error)}))},getDeviceList:function(){this.$api("equipment.equipmentList",{currPage:1},!1).then((function(t){200==t.code&&(console.log("权限门禁设备列表",t.data),e.setStorageSync("deviceList",t.data))}))}}};t.default=a}).call(this,n("543d")["default"])},"793a":function(e,t,n){},8595:function(e,t,n){"use strict";n.r(t);var i=n("71bf"),o=n.n(i);for(var a in i)["default"].indexOf(a)<0&&function(e){n.d(t,e,(function(){return i[e]}))}(a);t["default"]=o.a},"9b83":function(e,t,n){"use strict";var i=n("793a"),o=n.n(i);o.a},b33a:function(e,t,n){"use strict";n.r(t);var i=n("008e"),o=n("8595");for(var a in o)["default"].indexOf(a)<0&&function(e){n.d(t,e,(function(){return o[e]}))}(a);n("28c0"),n("9b83");var u=n("f0c5"),s=Object(u["a"])(o["default"],i["b"],i["c"],!1,null,null,null,!1,i["a"],void 0);t["default"]=s.exports}},[["3323","common/runtime","common/vendor"]]]);