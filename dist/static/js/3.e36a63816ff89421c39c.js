webpackJsonp([3],{bkOa:function(t,e,o){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n={components:{},name:"Panorama",data:function(){return{xmlDomData:'<krpano version="1.20.7" onstart="loadscene(scene_hongqi);">\n<scene name="scene_hongqi">\n<preview url="http://124.71.75.230/hongqi/icon/01.jpg" type="SPHERE"/>\n<view hlookat="0" vlookat="0" hlookatmin="-180" hlookatmax="180" vlookatmin="-90" vlookatmax="90" fovtype="MFOV" fovmin="60" fovmax="150" fov="90"/>\n<hotspot name="spot_scene" url="http://124.71.75.230/hongqi/icon/new_spotd1_gif.png" ath="0" atv="0" scale="0.6" zoom="true" device_type="" device_title="" target_scene="scene_hongqi_1" onloaded="hotspot_do_animation();hotspot_show_title();" onclick="hotspot_click();"/>\n<hotspot name="spot_device" url="http://124.71.75.230/hongqi/icon/new_spotd12_gif.png" ath="90" atv="0" scale="0.6" zoom="true" device_type="dahua" device_title="大华设备" target_scene="" onloaded="hotspot_do_animation();hotspot_show_title();" onclick="hotspot_click();"/>\n</scene>\n<scene name="scene_hongqi_1">\n<preview url="http://124.71.75.230/hongqi/icon/01.jpg" type="SPHERE"/>\n<view hlookat="0" vlookat="0" hlookatmin="-180" hlookatmax="180" vlookatmin="-90" vlookatmax="90" fovtype="MFOV" fovmin="60" fovmax="150" fov="90"/>\n</scene>\n\x3c!--  热点增加动画  --\x3e\n<action name="hotspot_do_animation" scope="local"> calc(local.xframes, (caller.imagewidth /128) BOR 0); calc(local.frames, xframes * ((caller.imageheight / 128) BOR 0)); def(local.frame, integer, 0); calc(caller.crop, \'0|0|\' + 128 + \'|\' + 128); setinterval(calc(\'crop_anim_\' + caller.name), 0.03, if(caller.loaded, inc(frame); if(frame GE frames, if(caller.onlastframe !== null, callwith(caller, onlastframe() ) ); set(frame,0); ); mod(xpos, frame, xframes); div(ypos, frame, xframes); Math.floor(ypos); mul(xpos, 128); mul(ypos, 128); calc(caller.crop, xpos + \'|\' + ypos + \'|\' + 128 + \'|\' + 128); , clearinterval(calc(\'crop_anim_\' + caller.name)); ); ,10); </action>\n\x3c!--  热点切换场景  --\x3e\n<action name="hotspot_jump_scene" scope="local" args="jump_scene"> loadscene(get(jump_scene),null,MERGE,ZOOMBLEND(2.0, 2.0, easeInOutSine)); </action>\n\x3c!--  热点显示标题，device_title 字段  --\x3e\n<action name="hotspot_show_title"> txtadd(tooltipname, \'tooltip_\', get(name)); addplugin(get(tooltipname)); txtadd(plugin[get(tooltipname)].parent, \'hotspot[\',get(name),\']\'); set(plugin[get(tooltipname)].url,\'%SWFPATH%/plugins/textfield.swf\'); set(plugin[get(tooltipname)].align,top); set(plugin[get(tooltipname)].edge,bottom); set(plugin[get(tooltipname)].x,0); set(plugin[get(tooltipname)].y,0); set(plugin[get(tooltipname)].autowidth,true); set(plugin[get(tooltipname)].autoheight,true); set(plugin[get(tooltipname)].background,false); set(plugin[get(tooltipname)].border,false); set(plugin[get(tooltipname)].css,\'text-align:center; color:#FFFFFF; font-family: PingFangSC-Medium,PingFang SC; font-weight:bold; font-size:16px;\'); set(plugin[get(tooltipname)].textshadow,1); set(plugin[get(tooltipname)].textshadowrange,6.0); set(plugin[get(tooltipname)].textshadowangle,90); copy(plugin[get(tooltipname)].html,hotspot[get(name)].device_title); set(plugin[get(tooltipname)].enabled,false); </action>\n\x3c!--  调用外部的js方法  --\x3e\n<action name="hotspot_click"> js(handleClickHotSpots(get(device_type),get(target_scene))); </action>\n</krpano>',krpanoDom:null}},beforeCreate:function(){},created:function(){this.init()},beforeMount:function(){window.initKrpanoReady=this.initKrpanoReady,window.handleClickHotSpots=this.handleClickHotSpots},mounted:function(){window.embedpano({xml:0,target:"pano",html5:"only",mobilescale:1,passQueryParameters:"startscene,startlookat",onready:window.initKrpanoReady})},methods:{init:function(){this.handleXMLElementDom(this.xmlDomData,"scene_hongqi","hotspot",[{name:"10086",title:"设备传感器"}])},handleXMLElementDom:function(t,e,o,n){try{var a=this.loadXMLString(t+")"),i=a.createElement(o);n.map(function(t){for(var e in t)if(Object.hasOwnProperty.call(t,e)){var o=t[e];i.setAttribute(e,o)}});var l=a.getElementsByTagName("scene");for(var c in l)if(Object.hasOwnProperty.call(l,c)){var s=l[c];s.attributes.name.nodeValue===e&&s.appendChild(i)}console.log(a)}catch(t){console.log(t)}},loadXMLString:function(t){var e=void 0;window.DOMParser?e=(new DOMParser).parseFromString(t,"text/xml"):((e=new ActiveXObject("Microsoft.XMLDOM")).async=!1,e.loadXML(t));return e},initKrpanoReady:function(){this.krpanoDom=document.getElementById("krpanoSWFObject"),this.krpanoDom.call("loadxml("+this.xmlDomData+")")},handleClickHotSpots:function(t,e){t?console.log("这里做弹框操作"):this.krpanoDom.call("hotspot_jump_scene("+e+")")}}},a={render:function(){var t=this.$createElement;return(this._self._c||t)("div",{attrs:{id:"pano"}})},staticRenderFns:[]};var i=o("VU/8")(n,a,!1,function(t){o("urSz")},"data-v-57a73bb0",null);e.default=i.exports},urSz:function(t,e){}});
//# sourceMappingURL=3.e36a63816ff89421c39c.js.map