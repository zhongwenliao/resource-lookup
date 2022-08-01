<template>
  <div id="pano"></div>
</template>

<script>
export default {
  components: {},
  name: 'Panorama',
  data() {
    return {
      xmlDomData: `<krpano version="1.20.7" onstart="loadscene(scene_hongqi);">
<scene name="scene_hongqi">
<preview url="http://124.71.75.230/hongqi/icon/01.jpg" type="SPHERE"/>
<view hlookat="0" vlookat="0" hlookatmin="-180" hlookatmax="180" vlookatmin="-90" vlookatmax="90" fovtype="MFOV" fovmin="60" fovmax="150" fov="90"/>
<hotspot name="spot_scene" url="http://124.71.75.230/hongqi/icon/new_spotd1_gif.png" ath="0" atv="0" scale="0.6" zoom="true" device_type="" device_title="" target_scene="scene_hongqi_1" onloaded="hotspot_do_animation();hotspot_show_title();" onclick="hotspot_click();"/>
<hotspot name="spot_device" url="http://124.71.75.230/hongqi/icon/new_spotd12_gif.png" ath="90" atv="0" scale="0.6" zoom="true" device_type="dahua" device_title="大华设备" target_scene="" onloaded="hotspot_do_animation();hotspot_show_title();" onclick="hotspot_click();"/>
</scene>
<scene name="scene_hongqi_1">
<preview url="http://124.71.75.230/hongqi/icon/01.jpg" type="SPHERE"/>
<view hlookat="0" vlookat="0" hlookatmin="-180" hlookatmax="180" vlookatmin="-90" vlookatmax="90" fovtype="MFOV" fovmin="60" fovmax="150" fov="90"/>
</scene>
<!--  热点增加动画  -->
<action name="hotspot_do_animation" scope="local"> calc(local.xframes, (caller.imagewidth /128) BOR 0); calc(local.frames, xframes * ((caller.imageheight / 128) BOR 0)); def(local.frame, integer, 0); calc(caller.crop, '0|0|' + 128 + '|' + 128); setinterval(calc('crop_anim_' + caller.name), 0.03, if(caller.loaded, inc(frame); if(frame GE frames, if(caller.onlastframe !== null, callwith(caller, onlastframe() ) ); set(frame,0); ); mod(xpos, frame, xframes); div(ypos, frame, xframes); Math.floor(ypos); mul(xpos, 128); mul(ypos, 128); calc(caller.crop, xpos + '|' + ypos + '|' + 128 + '|' + 128); , clearinterval(calc('crop_anim_' + caller.name)); ); ,10); </action>
<!--  热点切换场景  -->
<action name="hotspot_jump_scene" scope="local" args="jump_scene"> loadscene(get(jump_scene),null,MERGE,ZOOMBLEND(2.0, 2.0, easeInOutSine)); </action>
<!--  热点显示标题，device_title 字段  -->
<action name="hotspot_show_title"> txtadd(tooltipname, 'tooltip_', get(name)); addplugin(get(tooltipname)); txtadd(plugin[get(tooltipname)].parent, 'hotspot[',get(name),']'); set(plugin[get(tooltipname)].url,'%SWFPATH%/plugins/textfield.swf'); set(plugin[get(tooltipname)].align,top); set(plugin[get(tooltipname)].edge,bottom); set(plugin[get(tooltipname)].x,0); set(plugin[get(tooltipname)].y,0); set(plugin[get(tooltipname)].autowidth,true); set(plugin[get(tooltipname)].autoheight,true); set(plugin[get(tooltipname)].background,false); set(plugin[get(tooltipname)].border,false); set(plugin[get(tooltipname)].css,'text-align:center; color:#FFFFFF; font-family: PingFangSC-Medium,PingFang SC; font-weight:bold; font-size:16px;'); set(plugin[get(tooltipname)].textshadow,1); set(plugin[get(tooltipname)].textshadowrange,6.0); set(plugin[get(tooltipname)].textshadowangle,90); copy(plugin[get(tooltipname)].html,hotspot[get(name)].device_title); set(plugin[get(tooltipname)].enabled,false); </action>
<!--  调用外部的js方法  -->
<action name="hotspot_click"> js(handleClickHotSpots(get(device_type),get(target_scene))); </action>
</krpano>`,
      krpanoDom: null
    }
  },
  beforeCreate() {},
  created() {
    this.init()
  },
  beforeMount() {
    window['initKrpanoReady'] = this.initKrpanoReady
    window['handleClickHotSpots'] = this.handleClickHotSpots
  },
  mounted() {
    // eslint-disable-next-line standard/object-curly-even-spacing
    window.embedpano({
      xml: 0,
      target: 'pano',
      html5: 'only',
      mobilescale: 1.0,
      passQueryParameters: 'startscene,startlookat',
      onready: window.initKrpanoReady
    })
  },
  methods: {
    init() {
      this.handleXMLElementDom(this.xmlDomData, 'scene_hongqi', 'hotspot', [{ name: '10086', title: '设备传感器' }])
    },
    handleXMLElementDom(XMLdata, targetName, createLabel, labelAttribute) {
      try {
        let xmlDoc = this.loadXMLString(`${XMLdata})`)
        let createNode = xmlDoc.createElement(createLabel)
        labelAttribute.map(i => {
          for (const key in i) {
            if (Object.hasOwnProperty.call(i, key)) {
              const val = i[key]
              createNode.setAttribute(key, val)
            }
          }
        })
        let sceneList = xmlDoc.getElementsByTagName('scene')
        for (const key in sceneList) {
          if (Object.hasOwnProperty.call(sceneList, key)) {
            const element = sceneList[key]
            if (element.attributes.name.nodeValue === targetName) {
              element.appendChild(createNode)
            }
          }
        }
        console.log(xmlDoc)
      } catch (error) {
        console.log(error)
      }
    },
    // 操作xml
    loadXMLString(txt) {
      let xmlDoc
      if (window.DOMParser) {
        let parser = new DOMParser()
        xmlDoc = parser.parseFromString(txt, 'text/xml')
      } else {
        xmlDoc = new ActiveXObject('Microsoft.XMLDOM')
        xmlDoc.async = false
        xmlDoc.loadXML(txt)
      }
      return xmlDoc
    },
    // krpano对象初始化完成后调用
    initKrpanoReady() {
      this.krpanoDom = document.getElementById('krpanoSWFObject')
      this.krpanoDom.call(`loadxml(${this.xmlDomData})`)
    },
    handleClickHotSpots(deviceType, targetScene) {
      if (deviceType) {
        console.log('这里做弹框操作')
      } else {
        // 这里执行场景切换逻辑
        this.krpanoDom.call(`hotspot_jump_scene(${targetScene})`)
      }
    }
  }
}
</script>

<style stylt="less" scoped>
#pano {
  width: 100%;
  height: 85vh;
}
</style>
