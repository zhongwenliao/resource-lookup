(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["uview-ui/components/u-tabbar/u-tabbar"],{"2f04":function(t,e,n){"use strict";n.r(e);var i=n("b1e3"),o=n.n(i);for(var a in i)["default"].indexOf(a)<0&&function(t){n.d(e,t,(function(){return i[t]}))}(a);e["default"]=o.a},"3bf4":function(t,e,n){"use strict";var i=n("4113"),o=n.n(i);o.a},4113:function(t,e,n){},"4bcb":function(t,e,n){"use strict";n.d(e,"b",(function(){return o})),n.d(e,"c",(function(){return a})),n.d(e,"a",(function(){return i}));var i={uIcon:function(){return n.e("uview-ui/components/u-icon/u-icon").then(n.bind(null,"b0f5"))},uBadge:function(){return n.e("uview-ui/components/u-badge/u-badge").then(n.bind(null,"35a0"))},uModal:function(){return n.e("uview-ui/components/u-modal/u-modal").then(n.bind(null,"514b"))},uRow:function(){return n.e("uview-ui/components/u-row/u-row").then(n.bind(null,"eaa1"))},uCol:function(){return n.e("uview-ui/components/u-col/u-col").then(n.bind(null,"2d74"))},uImage:function(){return n.e("uview-ui/components/u-image/u-image").then(n.bind(null,"c6f0"))}},o=function(){var t=this,e=t.$createElement,n=(t._self._c,t.show?t.$u.addUnit(t.height):null),i=t.show?t.__map(t.list,(function(e,n){var i=t.__get_orig(e),o=t.elIconPath(n),a=t.elColor(n),r=e.count||e.isDot?t.getOffsetRight(e.count,e.isDot):null,u=t.elColor(n);return{$orig:i,m0:o,m1:a,m2:r,m3:u}})):null,o=t.show?t.$u.addUnit(t.height):null;t._isMounted||(t.e0=function(t){t.stopPropagation(),t.preventDefault()}),t.$mp.data=Object.assign({},{$root:{g0:n,l0:i,g1:o}})},a=[]},"9c48":function(t,e,n){"use strict";n.r(e);var i=n("4bcb"),o=n("2f04");for(var a in o)["default"].indexOf(a)<0&&function(t){n.d(e,t,(function(){return o[t]}))}(a);n("3bf4");var r=n("f0c5"),u=Object(r["a"])(o["default"],i["b"],i["c"],!1,null,"3f9972e1",null,!1,i["a"],void 0);e["default"]=u.exports},b1e3:function(t,e,n){"use strict";(function(t){var i=n("4ea4");Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var o=i(n("2eee")),a=i(n("c973"));function r(t,e){var n="undefined"!==typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(!n){if(Array.isArray(t)||(n=function(t,e){if(!t)return;if("string"===typeof t)return u(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);"Object"===n&&t.constructor&&(n=t.constructor.name);if("Map"===n||"Set"===n)return Array.from(t);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return u(t,e)}(t))||e&&t&&"number"===typeof t.length){n&&(t=n);var i=0,o=function(){};return{s:o,n:function(){return i>=t.length?{done:!0}:{done:!1,value:t[i++]}},e:function(t){throw t},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,r=!0,s=!1;return{s:function(){n=n.call(t)},n:function(){var t=n.next();return r=t.done,t},e:function(t){s=!0,a=t},f:function(){try{r||null==n.return||n.return()}finally{if(s)throw a}}}}function u(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,i=new Array(e);n<e;n++)i[n]=t[n];return i}var s={props:{show:{type:Boolean,default:!0},value:{type:[String,Number],default:0},bgColor:{type:String,default:"#ffffff"},height:{type:[String,Number],default:"55px"},iconSize:{type:[String,Number],default:40},midButtonSize:{type:[String,Number],default:110},activeColor:{type:String,default:"#1677ff"},inactiveColor:{type:String,default:"#999999"},midButton:{type:Boolean,default:!0},list:{type:Array,default:function(){return[]}},beforeSwitch:{type:Function,default:null},borderTop:{type:Boolean,default:!0},hideTabBar:{type:Boolean,default:!0}},data:function(){return{midButtonLeft:"50%",pageUrl:"",motalStatus:!1,apartmentShow:!1,content:"请选择需要开门的门禁",permissionDeviceListData:[],scanDeviceListData:[],apartmentList:[],bluetoothList:[]}},created:function(){this.hideTabBar&&t.hideTabBar();var e=getCurrentPages();this.pageUrl=e[e.length-1].route},computed:{elIconPath:function(){var t=this;return function(e){var n=t.list[e].pagePath;return n?n==t.pageUrl||n=="/"+t.pageUrl?t.list[e].selectedIconPath:t.list[e].iconPath:e==t.value?t.list[e].selectedIconPath:t.list[e].iconPath}},elColor:function(){var t=this;return function(e){var n=t.list[e].pagePath;return n?n==t.pageUrl||n=="/"+t.pageUrl?t.activeColor:t.inactiveColor:e==t.value?t.activeColor:t.inactiveColor}}},mounted:function(){this.midButton&&this.getMidButtonLeft()},methods:{clickHandler:function(t){var e=this;return(0,a.default)(o.default.mark((function n(){var i;return o.default.wrap((function(n){while(1)switch(n.prev=n.next){case 0:if(!e.beforeSwitch||"function"!==typeof e.beforeSwitch){n.next=10;break}if(i=e.beforeSwitch.bind(e.$u.$parent.call(e))(t),!i||"function"!==typeof i.then){n.next=7;break}return n.next=5,i.then((function(n){e.switchTab(t)})).catch((function(t){}));case 5:n.next=8;break;case 7:!0===i&&e.switchTab(t);case 8:n.next=11;break;case 10:e.switchTab(t);case 11:case"end":return n.stop()}}),n)})))()},bluetoothOneKeyOpenDoor:function(e){var n=this;console.log(1111111111111),t.showLoading({title:"开门中"}),this.permissionDeviceListData=e,this.bluetoothList=[],this.apartmentList=[],console.log(this.permissionDeviceListData),this.permissionDeviceListData.forEach((function(t){"bluetooth"===t.type?n.bluetoothList.push(t):n.apartmentList.push(t)})),1===this.permissionDeviceListData.length?"remote"==this.permissionDeviceListData[0].type?this.appRemoteDoor():this.$api("equipment.remoteDoor",{id:this.permissionDeviceListData[0].id,devSn:this.permissionDeviceListData[0].devSn}).then((function(e){200===e.code&&t.showToast({title:"远程开门成功",duration:1e3,mask:!0})})):this.bluetoothList.length>1&&0==this.apartmentList.length?this.cancelFun():0==this.bluetoothList.length&&this.apartmentList.length>1?this.apartmentShow=!0:this.bluetoothList.length>1&&this.apartmentList.length>1?(console.log(this.permissionDeviceListData),this.motalStatus=!0):t.showToast({title:"当前用户暂未绑定设备",icon:"none"})},cancelFun:function(){var t=this;this.blueToothScanDevice((function(e){t.scanDeviceListData=e}));var e,n={},i=this.scanDeviceListData,o=this.permissionDeviceListData,a=r(i);try{t:for(a.s();!(e=a.n()).done;){var u=e.value;console.log("scanDeviceInfo",u);var s,c=r(o);try{for(c.s();!(s=c.n()).done;){var l=s.value;if(u.devSn===l.devSn){console.log("deviceInfo1",l),n=l;break t}console.log("deviceInfo2",l)}}catch(f){c.e(f)}finally{c.f()}}}catch(f){a.e(f)}finally{a.f()}this.blueToothOpenDoor(n)},appRemoteDoor:function(){1===this.apartmentList.length?this.remoteDoorOpen(this.apartmentList[0]):this.apartmentShow=!0},remoteDoorOpen:function(e){var n=this;this.$api("equipment.appRemoteDoor",{roomNum:e.roomNum}).then((function(e){0===e.code?(n.apartmentShow=!1,t.showToast({title:"开门成功",icon:"none"})):(n.apartmentShow=!1,t.showToast({title:"开门失败,".concat(e.errmsg),icon:"none"}))}))},switchTab:function(e){var n=this;if(this.$emit("change",e),"true"==this.list[e].midButton){var i=t.getStorageSync("zoneInfo");if(i&&i.id){var o=t.getStorageSync("deviceList");if(o){if(o="string"===typeof o?JSON.parse(o):o,!(o.length>0))return this.motalStatus=!0;this.bluetoothOneKeyOpenDoor(o)}else this.$api("equipment.equipmentList",{currPage:1},!1).then((function(e){if(200==e.code)if(0!==e.data.length){var i=e.data;console.log("权限门禁设备列表",i),t.setStorageSync("deviceList",i),n.bluetoothOneKeyOpenDoor(i)}else t.showToast({title:"当前园区下暂未绑定设备",icon:"none"})}))}else t.showToast({title:"当前暂未绑定园区",icon:"none"})}this.list[e].pagePath?t.switchTab({url:this.list[e].pagePath}):this.$emit("input",e)},getOffsetRight:function(t,e){return e?-20:t>9?-40:-30},getMidButtonLeft:function(){}}};e.default=s}).call(this,n("543d")["default"])}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'uview-ui/components/u-tabbar/u-tabbar-create-component',
    {
        'uview-ui/components/u-tabbar/u-tabbar-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('543d')['createComponent'](__webpack_require__("9c48"))
        })
    },
    [['uview-ui/components/u-tabbar/u-tabbar-create-component']]
]);
