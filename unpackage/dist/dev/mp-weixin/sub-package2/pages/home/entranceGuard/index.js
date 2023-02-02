require('../../../common/vendor.js');(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package2/pages/home/entranceGuard/index"],{559:function(e,o,t){"use strict";(function(e,o){var n=t(4);t(26),t(27);n(t(25));var r=n(t(560));e.__webpack_require_UNI_MP_PLUGIN__=t,o(r.default)}).call(this,t(1)["default"],t(2)["createPage"])},560:function(e,o,t){"use strict";t.r(o);var n=t(561),r=t(563);for(var i in r)["default"].indexOf(i)<0&&function(e){t.d(o,e,(function(){return r[e]}))}(i);t(565),t(567);var a,c=t(39),u=Object(c["default"])(r["default"],n["render"],n["staticRenderFns"],!1,null,"7ec238a5",null,!1,n["components"],a);u.options.__file="sub-package2/pages/home/entranceGuard/index.vue",o["default"]=u.exports},561:function(e,o,t){"use strict";t.r(o);var n=t(562);t.d(o,"render",(function(){return n["render"]})),t.d(o,"staticRenderFns",(function(){return n["staticRenderFns"]})),t.d(o,"recyclableRender",(function(){return n["recyclableRender"]})),t.d(o,"components",(function(){return n["components"]}))},562:function(e,o,t){"use strict";var n;t.r(o),t.d(o,"render",(function(){return r})),t.d(o,"staticRenderFns",(function(){return a})),t.d(o,"recyclableRender",(function(){return i})),t.d(o,"components",(function(){return n}));try{n={uNavbar:function(){return t.e("uview-ui/components/u-navbar/u-navbar").then(t.bind(null,980))},uImage:function(){return t.e("uview-ui/components/u-image/u-image").then(t.bind(null,1050))},uToast:function(){return t.e("uview-ui/components/u-toast/u-toast").then(t.bind(null,1195))},uSearch:function(){return t.e("uview-ui/components/u-search/u-search").then(t.bind(null,1216))},uRow:function(){return t.e("uview-ui/components/u-row/u-row").then(t.bind(null,1071))},uCol:function(){return t.e("uview-ui/components/u-col/u-col").then(t.bind(null,1078))}}}catch(c){if(-1===c.message.indexOf("Cannot find module")||-1===c.message.indexOf(".vue"))throw c;console.error(c.message),console.error("1. 排查组件名称拼写是否正确"),console.error("2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"),console.error("3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件")}var r=function(){var e=this,o=e.$createElement;e._self._c},i=!1,a=[];r._withStripped=!0},563:function(e,o,t){"use strict";t.r(o);var n=t(564),r=t.n(n);for(var i in n)["default"].indexOf(i)<0&&function(e){t.d(o,e,(function(){return n[e]}))}(i);o["default"]=r.a},564:function(e,o,t){"use strict";(function(e){var n=t(4);Object.defineProperty(o,"__esModule",{value:!0}),o.default=void 0;var r=n(t(288)),i={data:function(){return{ContactProperty:[],screenData:[],listDataArr:[],listDataNew:[],keyword:"",show:!1,errorMsg:"",qrPath:"",mode:"canvas",qrCode:"",size:200,margin:10,backgroundColor:"#FFFFFF",foregroundColor:"#000000",errorCorrectLevel:r.default.errorCorrectLevel.H,typeNumber:-1,fileType:"png",title:e.getStorageSync("zoneInfo").name,isOpenBluetooth:!1}},onShow:function(){this.getDeviceList()},onLoad:function(){var o=this;this.openBluetoothAdapter().then((function(){o.getBluetoothAdapterState()})).finally((function(){console.log("蓝牙模块初始化完成"),e.onBluetoothAdapterStateChange((function(e){o.isOpenBluetooth=e.available,console.log("adapterState changed, now is",e)}))}))},methods:{bluebox:function(e){1!=e&&this.openBluetoothAdapter()},remoteOpenDoor:function(o){var t=this;if(console.log("远程开门"),"bluetooth"===o.type){var n=this.opendoor["remote-failed"]||"远程开门失败， ";this.$api("equipment.remoteDoor",{id:o.id,devSn:o.devSn}).then((function(r){200===r.code?e.showToast({title:"远程开门成功",duration:1e3,mask:!0}):"bluetooth"==o.type&&t.ifNeedBluetoothOpen(n,o)})).catch((function(e){"bluetooth"==o.type&&t.ifNeedBluetoothOpen(n,o)}))}else this.$api("equipment.appRemoteDoor",{roomNum:o.roomNum}).then((function(o){0===o.code?e.showToast({title:"开门成功",icon:"none"}):e.showToast({title:"开门失败,".concat(o.errmsg),icon:"none"})}))},ifNeedBluetoothOpen:function(o,t){var n=this,r=this;e.showModal({title:r.opendoor["bluetooth-tips"]||"蓝牙开门提示",content:o+r.opendoor["if-need-bluetooth"]||"是否需要进行蓝牙开门",confirmText:r.common["confirm"]||"确认",cancelText:r.common["cancel"]||"取消",success:function(o){o.confirm?n.bluetoothOpenDoor(t):e.hideLoading()}})},bluetoothOpenDoor:function(o){var t=this;e.showLoading({title:"开门中"}),setTimeout((function(){e.hideLoading()}),3e3);var n=this.$sdkUtil,r=e.getStorageSync("homeInfo"),i=o;console.log(111,o,r,r.isUploadSimByOpenDoor),n.bluetoothOpenDoor(o,(function(a){o.doorName,t.$refs;e.showToast({title:"开门成功",icon:"none"}),t.openDoorDeviceDoorName=o.doorName,e.navigateTo({url:"../../pages/open-door-success/open-door-success?doorName="+t.openDoorDeviceDoorName});var c=Date.parse(new Date),u=e.getStorageSync("openDoor").timestamp;setTimeout((function(){if(1==o.isSupportGetOpenDoorRecord)if(t.$sdkUtil.getRecentOpenDoorRecordFromDevice(o),u){var n=216e5;c-u>n&&(e.setStorageSync("openDoor",{timestamp:c}),setTimeout((function(){t.dumpEnergy_firmwareVersion(o)}),6e3))}else e.setStorageSync("openDoor",{timestamp:c}),setTimeout((function(){t.dumpEnergy_firmwareVersion(o)}),6e3);else t.dumpEnergy_firmwareVersion(o)}),4e3),setTimeout((function(){1==r.isUploadSimByOpenDoor&&(i.controlWay=1,i.eKey=o.appEkey,i.devType=o.deviceModelValue,console.log("获取sim卡信息"),n.getSimstatus(i,(function(e){if(0===e.errorCode){var n=e.data;t.uploadServer(n,o)}})))}),4e3)}))},temporaryPassword:function(o){e.navigateTo({url:"/sub-package1/pages/vis/vis?name=".concat(o.name,"&roomId=").concat(o.roomId,"&devSn=").concat(o.devSn)})},openBluetoothAdapter:function(){var o=this;return new Promise((function(t,n){e.openBluetoothAdapter({success:function(e){console.log("初始化蓝牙成功:"+e.errMsg),console.log(JSON.stringify(e)),t()},fail:function(t){console.log(t),console.log("初始化蓝牙失败，错误码："+(t.errCode||t.errMsg)),e.showModal({title:"提示！",content:"初始化蓝牙失败，请到设置里打开本机蓝牙！",showCancel:!1,confirmText:"确定",success:function(e){e.confirm}}),t.errCode,o.isOpenBluetooth=!1,n()}})}))},getBluetoothAdapterState:function(){var o=this;e.getBluetoothAdapterState({success:function(e){console.log(JSON.stringify(e)),o.isOpenBluetooth=!0},fail:function(e){o.isOpenBluetooth=!1,console.log("获取本机蓝牙适配器状态失败，错误码："+e.errCode),e.errCode}})},fuzzySearch:function(e){this.contactProperty=this.screenData,""!==e?(this.listDataNew=this.contactProperty.filter((function(o){var t=!1;for(var n in o)if(o.name&&o.name.toString().includes(e)){t=!0;break}if(t)return o})),this.contactProperty=this.listDataNew):this.contactProperty=this.listDataArr},getDeviceList:function(){var o=this,t={currPage:1};this.$api("equipment.equipmentList",t,!1).then((function(t){if(200==t.code){e.setStorageSync("deviceList",t.data),o.ContactProperty=t.data,o.screenData=JSON.parse(JSON.stringify(t.data)),o.listDataArr=JSON.parse(JSON.stringify(t.data));JSON.parse(JSON.stringify(o.ContactProperty));t.data===[]&&o.showToast()}}))},showToast:function(){this.$refs.uToast.show({title:"没有绑定设备"})},goPage:function(e){this.$Router.push({path:e.url,query:e})},DoorRecord:function(){this.$Router.push({path:"/pages/user/openDoorRecord"})},save:function(o){console.log("点击"),e.showLoading({mask:!0,title:"请稍后..."}),this.$refs[o].save({success:function(o){console.log(o),e.hideLoading(),e.showToast({icon:"none",title:o.msg})},fail:function(o){e.hideLoading(),e.showToast({icon:"none",title:JSON.stringify(o)})}})}}};o.default=i}).call(this,t(2)["default"])},565:function(e,o,t){"use strict";t.r(o);var n=t(566),r=t.n(n);for(var i in n)["default"].indexOf(i)<0&&function(e){t.d(o,e,(function(){return n[e]}))}(i);o["default"]=r.a},566:function(e,o,t){},567:function(e,o,t){"use strict";t.r(o);var n=t(568),r=t.n(n);for(var i in n)["default"].indexOf(i)<0&&function(e){t.d(o,e,(function(){return n[e]}))}(i);o["default"]=r.a},568:function(e,o,t){}},[[559,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/sub-package2/pages/home/entranceGuard/index.js.map