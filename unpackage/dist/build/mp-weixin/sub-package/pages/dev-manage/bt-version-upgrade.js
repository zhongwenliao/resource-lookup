(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["sub-package/pages/dev-manage/bt-version-upgrade"],{2439:function(e,r,i){"use strict";var n=i("81a6"),t=i.n(n);t.a},"472e":function(e,r,i){"use strict";i.d(r,"b",(function(){return t})),i.d(r,"c",(function(){return a})),i.d(r,"a",(function(){return n}));var n={uniBasePage:function(){return i.e("components/uni-base-page/uni-base-page").then(i.bind(null,"3c64"))}},t=function(){var e=this.$createElement,r=(this._self._c,this.firmwareList.length);this.$mp.data=Object.assign({},{$root:{g0:r}})},a=[]},"5dbb":function(e,r,i){"use strict";i.r(r);var n=i("f6c8"),t=i.n(n);for(var a in n)["default"].indexOf(a)<0&&function(e){i.d(r,e,(function(){return n[e]}))}(a);r["default"]=t.a},"60f8":function(e,r,i){"use strict";i.r(r);var n=i("472e"),t=i("5dbb");for(var a in t)["default"].indexOf(a)<0&&function(e){i.d(r,e,(function(){return t[e]}))}(a);i("2439");var o=i("f0c5"),s=Object(o["a"])(t["default"],n["b"],n["c"],!1,null,null,null,!1,n["a"],void 0);r["default"]=s.exports},"81a6":function(e,r,i){},cd67:function(e,r,i){"use strict";(function(e,r){var n=i("4ea4");i("27b1"),i("5c17");n(i("66fd"));var t=n(i("60f8"));e.__webpack_require_UNI_MP_PLUGIN__=i,r(t.default)}).call(this,i("bc2e")["default"],i("543d")["createPage"])},f6c8:function(e,r,i){"use strict";(function(e){Object.defineProperty(r,"__esModule",{value:!0}),r.default=void 0;var i="",n=!0,t={data:function(){return{firmwareList:[],savedFilePath:"",upgardeProgress:0,firmwareVersion:"正在获取中...",printMsg:"",preUpgradeVersion:"",upgradeTitle:"",modelValue:"",source:null}},computed:{manage:function(){return this.$t("manage")},sdk1:function(){return this.$t("sdk")},common:function(){return this.$t("common")}},methods:{getDevSystemVersion:function(r){var i=this;this.$sdkUtil.getDeviceConfig(this.devObj,(function(n){if(0===n.errorCode){var t=n.data;if(r)r.preUpgradeVersion==t.systemVersion?e.showModal({title:i.common["hint"]||"提示",content:i.sdk1["firmware-upgrade-succeed"]||"设备蓝牙固件升级成功",confirmText:i.common["confirm"]||"确定",showCancel:!1,isShowLoading:!1,success:function(r){e.navigateBack({delta:2})}}):e.showModal({title:i.common["hint"]||"提示",content:i.sdk1["abnormal-reboot-device"]||"升级重启异常，请断电重启设备",confirmText:i.common["confirm"]||"确定",showCancel:!1,success:function(r){e.navigateBack({delta:2})}});else{i.firmwareVersion=t.systemVersion;i.devObj.devSn,i.firmwareVersion,t.devType;i.modelValue=t.devType,i.getFirmwareVersion(i.devObj.devSn,i.firmwareVersion,i.modelValue)}}}))},getFirmwareVersion:function(e,r,i){var n=this;this.$req.request({url:"/platDevFirmware/app/listByDevSn",data:{devSn:e,versionNum:r,isShowLoad:!1,modelValue:i,source:this.source},success:function(e){n.firmwareList=e.data}})},clickUpgrade:function(r,i,n){var t=this;this.preUpgradeVersion=i,e.showModal({content:this.manage["if-upgrade"]+"【"+i+"】"+this.manage["version"]+"?",success:function(e){e.confirm&&t.searchLocalFirmware(r,n)}})},downLoadFirmware:function(e,r){var n=this;this.$showLoading(this.manage["downloading"]||"正在下载...");var t=plus.downloader.createDownload(e,{},(function(e,t){if(200==t){console.log("Download success: "+e.filename),i=e.filename;var a=plus.io.convertLocalFileSystemURL(i);n.$hideLoading(),n.upgradeFirmWare(a,r)}else console.log("Download failed: "+t)}));t.start()},upgradeFirmWare:function(e,r){var i=this.$refs.poster;i.show(),this.upgrade(e,r)},upgrade:function(e,r){var i=this,t=1,a=this.$refs.poster;this.$sdkUtil.upgradeDevice(this.devObj,e,(function(o){var s=o.errorCode;if(3===s){if(o.msg){var d=o.msg;i.printMsg=d}}else if(2===s){var c=o.data.progress;i.upgardeProgress=c,100==c&&(a.hide(),i.upgardeProgress=0,i.uploadFirmwareVersion(r),i.firmwareVersion=i.preUpgradeVersion,n=!0,1===t&&(t++,setTimeout((function(){i.getDevSystemVersion({preUpgradeVersion:i.preUpgradeVersion})}),5e3)))}else-2===s&&i.upgardeProgress<99&&!0===n?(n=!1,i.upgradeTitle="正在尝试重新升级...",setTimeout((function(){i.upgrade(e,r)}),2e3)):a.hide()}))},searchLocalFirmware:function(r,i){var n=this;if(r.indexOf("/")>-1){var t="_downloads/"+r.substring(r.lastIndexOf("/")+1);e.getSavedFileInfo({filePath:t,success:function(e){t=plus.io.convertLocalFileSystemURL(t),n.upgradeFirmWare(t,i)},fail:function(e){console.log("没有找到文件---",e),n.downLoadFirmware(r,i)}})}else this.$showToast(this.manage["download-path-error"]||"下载路径解析格式错误")},uploadFirmwareVersion:function(e){this.$req.request({url:"/devDevice/app/upgradeDev",data:{devId:this.devObj.deviceId,firmwareId:e,isShowLoad:!1},success:function(e){0==e.code&&(console,log("上传蓝牙固见版本成功"))}})}},onLoad:function(e){n=!0,this.upgradeTitle=this.manage["upgrading"]||"正在升级中...",this.firmwareVersion=this.manage["getting"]||"正在获取中...",e.source&&(this.source=e.source),e.devObj&&(this.devObj=JSON.parse(e.devObj),this.getDevSystemVersion()),this.$setTitle(this.manage["upgrade-bluetooth-firmware"]||"升级蓝牙固件")}};r.default=t}).call(this,i("543d")["default"])}},[["cd67","common/runtime","common/vendor"]]]);