require('../../../common/vendor.js');(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package2/pages/home/entranceGuard/bluetoothOpenDoor"],{576:function(e,t,n){"use strict";(function(e,t){var o=n(4);n(26),n(27);o(n(25));var i=o(n(577));e.__webpack_require_UNI_MP_PLUGIN__=n,t(i.default)}).call(this,n(1)["default"],n(2)["createPage"])},577:function(e,t,n){"use strict";n.r(t);var o=n(578),i=n(580);for(var r in i)["default"].indexOf(r)<0&&function(e){n.d(t,e,(function(){return i[e]}))}(r);n(582),n(584);var a,u=n(39),c=Object(u["default"])(i["default"],o["render"],o["staticRenderFns"],!1,null,"a38df18e",null,!1,o["components"],a);c.options.__file="sub-package2/pages/home/entranceGuard/bluetoothOpenDoor.vue",t["default"]=c.exports},578:function(e,t,n){"use strict";n.r(t);var o=n(579);n.d(t,"render",(function(){return o["render"]})),n.d(t,"staticRenderFns",(function(){return o["staticRenderFns"]})),n.d(t,"recyclableRender",(function(){return o["recyclableRender"]})),n.d(t,"components",(function(){return o["components"]}))},579:function(e,t,n){"use strict";var o;n.r(t),n.d(t,"render",(function(){return i})),n.d(t,"staticRenderFns",(function(){return a})),n.d(t,"recyclableRender",(function(){return r})),n.d(t,"components",(function(){return o}));try{o={zPaging:function(){return Promise.all([n.e("common/vendor"),n.e("uni_modules/z-paging/components/z-paging/z-paging")]).then(n.bind(null,1138))},uNavbar:function(){return n.e("uview-ui/components/u-navbar/u-navbar").then(n.bind(null,973))},uSearch:function(){return n.e("uview-ui/components/u-search/u-search").then(n.bind(null,1209))},uIcon:function(){return n.e("uview-ui/components/u-icon/u-icon").then(n.bind(null,980))}}}catch(u){if(-1===u.message.indexOf("Cannot find module")||-1===u.message.indexOf(".vue"))throw u;console.error(u.message),console.error("1. 排查组件名称拼写是否正确"),console.error("2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"),console.error("3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件")}var i=function(){var e=this,t=e.$createElement;e._self._c},r=!1,a=[];i._withStripped=!0},580:function(e,t,n){"use strict";n.r(t);var o=n(581),i=n.n(o);for(var r in o)["default"].indexOf(r)<0&&function(e){n.d(t,e,(function(){return o[e]}))}(r);t["default"]=i.a},581:function(e,t,n){"use strict";(function(e){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n={data:function(){return{tabCur:this.$Route.query.tabCur,selectData:[],buildingList:[],floorList:[{label:"全部",value:0,active:!1}],dataList:[],form:{keywordSearch:"",currPage:1,pageSize:10}}},onLoad:function(){var e=this;this.$enum.buildfloorEnum((function(t){e.buildingList=t.map((function(e){return{value:e.id,label:e.name,children:e.children}})),e.buildingList.push({value:"",label:"全部",children:[]})})),this.roomStatus=this.$u.deepClone(this.$enum.roomStatus),this.roomStatus.push({value:"",label:"全部"}),this.roomStatus=this.roomStatus.map((function(e){return e.active=!1,e})),this.selectType=this.$enum.roomType.map((function(e){return e.checked=0,e}))},computed:{opendoor:function(){return this.$t("open-door")},common:function(){return this.$t("common")},title:function(){return this.$t("title")}},methods:{close:function(){this.$refs.paging.updatePageScrollTopHeight()},search:function(){this.$refs.paging.reload()},clickKey:function(t,n){var o=this;e.showLoading({title:o.common["open-door"],mask:!0}),console.log(this.tabCur),0==this.tabCur?this.bluetoothOpenDoor(t):1==this.tabCur&&this.remoteOpenDoor(t)},remoteOpenDoor:function(t){var n=this;console.log("远程开门");var o=this.opendoor["remote-failed"]||"远程开门失败， ";this.$api("equipment.remoteDoor",{relayIndex:t.relayIndex,devSn:t.devSn}).then((function(i){200===i.code?e.showToast({title:"远程开门成功",duration:1e3,mask:!0}):n.ifNeedBluetoothOpen(o,t)})).catch((function(e){n.ifNeedBluetoothOpen(o,t)}))},bluetoothOpenDoor:function(t){var n=this,o=this.$sdkUtil;o.bluetoothOpenDoor(t,(function(o){t.doorName,n.$refs;var i=Date.parse(new Date),r=e.getStorageSync("openDoor").timestamp;setTimeout((function(){if(1==t.isSupportGetOpenDoorRecord)if(n.$sdkUtil.getRecentOpenDoorRecordFromDevice(t),r){var o=216e5;i-r>o&&(e.setStorageSync("openDoor",{timestamp:i}),setTimeout((function(){n.dumpEnergy_firmwareVersion(t)}),6e3))}else e.setStorageSync("openDoor",{timestamp:i}),setTimeout((function(){n.dumpEnergy_firmwareVersion(t)}),6e3);else n.dumpEnergy_firmwareVersion(t)}),4e3)}))},uploadServer:function(e,t){this.$req.request({url:"/devDevice/app/configSimNumber",method:"POST",data:{devSn:t.devSn,modelName:e.model_name,simId:e.model_sn,modelStatus:e.model_status,simNumber:e.iccid,baseStationId:e.lac_idlac},success:function(e){0==e.code?console.log("sim卡 上传成功"):console.log("sim卡 上传失败")}})},dumpEnergy_firmwareVersion:function(e){var t=this;(e.isNeedUploadRemainingBattery||e.isNeedUploadFirmVersion)&&t.$sdkUtil.getDeviceConfig(e,(function(e){if(0===e.errorCode){e.data;console.log("上传设备剩余电量"),console.log("上传设备固件版本")}}))},ifNeedBluetoothOpen:function(t,n){var o=this,i=this;e.showModal({title:i.opendoor["bluetooth-tips"]||"蓝牙开门提示",content:t+i.opendoor["if-need-bluetooth"]||"是否需要进行蓝牙开门",confirmText:i.common["confirm"]||"确认",cancelText:i.common["cancel"]||"取消",success:function(t){t.confirm?o.bluetoothOpenDoor(n):e.hideLoading()}})},getInfo:function(e,t){var n=this;this.form.currPage=e,this.form.pageSize=t,this.selectData.forEach((function(e,t){switch(t){case 0:n.form.buildingId=n.selectData[0].value||"";break;case 1:n.form.floorId=n.selectData[1].value||"";break}}));var o=this.$u.deepMerge(this.form,this.formDropdown);o.isSupportNetwork=this.$Route.query.tabCur?1:"",this.$api("equipment.getAppDevAuthorize",o).then((function(e){n.$refs.paging.complete(e.data.list)})).catch((function(e){console.log(e),n.$refs.paging.complete(!1)}))},floorScroll:function(e,t,n){0===n&&(this.$set(this.selectData,1,""),this.floorList=e.children.map((function(e){return{value:e.id,label:e.name}})),this.floorList.push({value:"",label:"全部"})),"全部"==e.label?(t.forEach((function(t){e.value===t.value?t.active=!0:t.active=!1})),this.$set(this.selectData,n,"")):(t.forEach((function(t){e.value===t.value?t.active=!0:t.active=!1})),this.$set(this.selectData,n,e)),this.$refs.paging.reload(!1),this.$refs.floorDropdown.close()}}};t.default=n}).call(this,n(2)["default"])},582:function(e,t,n){"use strict";n.r(t);var o=n(583),i=n.n(o);for(var r in o)["default"].indexOf(r)<0&&function(e){n.d(t,e,(function(){return o[e]}))}(r);t["default"]=i.a},583:function(e,t,n){},584:function(e,t,n){"use strict";n.r(t);var o=n(585),i=n.n(o);for(var r in o)["default"].indexOf(r)<0&&function(e){n.d(t,e,(function(){return o[e]}))}(r);t["default"]=i.a},585:function(e,t,n){}},[[576,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/sub-package2/pages/home/entranceGuard/bluetoothOpenDoor.js.map