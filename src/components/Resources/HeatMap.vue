<template>
  <div>
    <div id="map"></div>
    <div
      id="heatmap_mark"
      style="color: rgba(0, 0, 0, 0.8); background: none 0% 0% / auto repeat scroll padding-box border-box rgba(73, 73, 72, 0.6); width: 428px; height: 81.2188px; font-size: 14px; line-height: 18.62px; margin: 0px; padding: 14px; float: none; inset: 679.781px 0px 0px 596px; display: block; border: 0px none rgba(0, 0, 0, 0.8); cursor: auto; overflow: visible; box-sizing: border-box; border-radius: 10px; text-decoration: none solid rgba(0, 0, 0, 0.8); list-style: outside none disc; text-align: left;"
    >
      <div
        style="color: rgba(0, 0, 0, 0.8); background: none 0% 0% / auto repeat scroll padding-box border-box rgba(0, 0, 0, 0); width: 400px; height: 19.6094px; font-size: 14px; line-height: 18.62px; margin: 0px; padding: 0px; position: static; float: none; inset: auto; display: block; border: 0px none rgba(0, 0, 0, 0.8); cursor: auto; overflow: visible; box-sizing: border-box; border-radius: 0px; text-decoration: none solid rgba(0, 0, 0, 0.8); list-style: outside none disc; text-align: left;"
      >
        <span
          class="heatmap_mark_title"
          style="color: rgb(255, 255, 255); background: none 0% 0% / auto repeat scroll padding-box border-box rgba(0, 0, 0, 0); width: auto; height: auto; font-size: 16px; line-height: 18.62px; margin: 0px; padding: 0px; position: static; float: none; inset: auto; display: inline; border: 0px none rgb(255, 255, 255); cursor: auto; overflow: visible; box-sizing: border-box; border-radius: 0px; text-decoration: none solid rgb(255, 255, 255); list-style: outside none disc; text-align: left;"
          >颜色对应温度</span
        >
        <span style="display: inline-block;float: right;font-size: 16px;"> 温度最近采集实况: {{ gettime }} </span>
      </div>
      <div
        class="linear_color"
        style="color: rgba(0, 0, 0, 0.8); background: -webkit-linear-gradient(left, rgba(0, 0, 0, 0.1), rgb(0, 0, 255), rgb(0, 255, 0), rgb(255, 255, 0), rgb(255, 0, 0), rgb(255, 0, 0)) 0% 0% / auto repeat scroll padding-box border-box rgba(0, 0, 0, 0); width: 400px; height: 5px; font-size: 14px; line-height: 18.62px; margin: 10px 0px 0px; padding: 0px; position: static; float: none; inset: auto; display: block; border: 0px none rgba(0, 0, 0, 0.8); cursor: auto; overflow: visible; box-sizing: border-box; border-radius: 2px; text-decoration: none solid rgba(0, 0, 0, 0.8); list-style: outside none disc; text-align: left;"
      ></div>
      <span
        class="heatmap_blue heatmap_mark_text heatmap_color_span"
        style="color: rgb(223, 223, 223); background: none 0% 0% / auto repeat scroll padding-box border-box rgba(0, 0, 0, 0); width: 70px; height: 18.6094px; font-size: 14px; line-height: 18.62px; margin: 0px; padding: 0px; position: static; float: none; inset: auto; display: inline-block; border: 0px none rgb(223, 223, 223); cursor: auto; overflow: visible; box-sizing: border-box; border-radius: 0px; text-decoration: none solid rgb(223, 223, 223); list-style: outside none disc; text-align: center;"
        >0-10°C</span
      >
      <span
        class="heatmap_green heatmap_mark_text heatmap_color_span"
        style="color: rgb(223, 223, 223); background: none 0% 0% / auto repeat scroll padding-box border-box rgba(0, 0, 0, 0); width: 70px; height: 18.6094px; font-size: 14px; line-height: 18.62px; margin: 0px; padding: 0px; position: static; float: none; inset: auto; display: inline-block; border: 0px none rgb(223, 223, 223); cursor: auto; overflow: visible; box-sizing: border-box; border-radius: 0px; text-decoration: none solid rgb(223, 223, 223); list-style: outside none disc; text-align: center;"
        >10-20°C</span
      >
      <span
        class="heatmap_yellow heatmap_mark_text heatmap_color_span"
        style="color: rgb(223, 223, 223); background: none 0% 0% / auto repeat scroll padding-box border-box rgba(0, 0, 0, 0); width: 70px; height: 18.6094px; font-size: 14px; line-height: 18.62px; margin: 0px; padding: 0px; position: static; float: none; inset: auto; display: inline-block; border: 0px none rgb(223, 223, 223); cursor: auto; overflow: visible; box-sizing: border-box; border-radius: 0px; text-decoration: none solid rgb(223, 223, 223); list-style: outside none disc; text-align: center;"
        >20-30°C</span
      >
      <span
        class="heatmap_red heatmap_mark_text heatmap_color_span"
        style="color: rgb(223, 223, 223); background: none 0% 0% / auto repeat scroll padding-box border-box rgba(0, 0, 0, 0); width: 70px; height: 18.6094px; font-size: 14px; line-height: 18.62px; margin: 0px; padding: 0px; position: static; float: none; inset: auto; display: inline-block; border: 0px none rgb(223, 223, 223); cursor: auto; overflow: visible; box-sizing: border-box; border-radius: 0px; text-decoration: none solid rgb(223, 223, 223); list-style: outside none disc; text-align: center;"
        >30-35°C</span
      >
      <span
        class="heatmap_result_red heatmap_mark_text heatmap_color_span"
        style="color: rgb(223, 223, 223); background: none 0% 0% / auto repeat scroll padding-box border-box rgba(0, 0, 0, 0); width: 70px; height: 18.6094px; font-size: 14px; line-height: 18.62px; margin: 0px; padding: 0px; position: static; float: none; inset: auto; display: inline-block; border: 0px none rgb(223, 223, 223); cursor: auto; overflow: visible; box-sizing: border-box; border-radius: 0px; text-decoration: none solid rgb(223, 223, 223); list-style: outside none disc; text-align: center;"
        >>40°C</span
      >
    </div>
    <div>
      <input type="button" @click="openHeatmap" value="显示热力图" />
      <input type="button" @click="closeHeatmap" value="关闭热力图" />
      <input type="button" @click="changeHeatmap" value="停止获取最新数据" />
    </div>
  </div>
</template>
<script>
import request from '@/common/utils/request'
let tempHotmap = null
export default {
  data() {
    return {
      hotMap: [],
      map: null,
      heatmapOverlay: null,
      marker: null,
      gettime: ''
    }
  },
  computed: {},
  created() {
    // this.currentTime();
    this.init()
  },
  methods: {
    init() {
      request({
        url: '/monitorManagement/monitorPointManagement/list-by-common-parameter',
        method: 'GET'
      }).then(data => {
        this.hotMap = data
        this.$nextTick(() => {
          this.onLoad()
          tempHotmap = setInterval(() => {
            this.getTime()
            this.initMapInfo(
              this.hotMap.map(i => ({
                count: parseInt(Math.floor(Math.random() * 40) + 10),
                lng: i.gpsLng,
                lat: i.gpsLat
              }))
            )
          }, 3000)
        })
      })
    },
    onLoad() {
      // 创建地图实例
      this.map = new T.Map('map')
      // 地图初始化，第一个参数是经纬度坐标，第二个参数是地图级别
      this.map.centerAndZoom(new T.LngLat(114.06667, 22.61667), 12)
    },
    openHeatmap() {
      console.log('显示热力图')
      this.heatmapOverlay.show()
    },
    closeHeatmap() {
      console.log('关闭热力图')
      this.heatmapOverlay.hide()
    },
    initMapInfo(hotMapData) {
      this.map.clearOverLays()
      this.$nextTick(() => {
        this.heatmapOverlay = new T.HeatmapOverlay({
          backgroundColor: '',
          // 纬度字段名称。
          latField: 'lat',
          // 经度字段名称。
          lngField: 'lng',
          // 权重字段名称。
          valueField: 'count',
          // 缓冲半径。
          radius: 30,
          // 颜色梯度变化
          gradient: { 0: 'black', 0.25: 'rgb(0,0,255)', 0.55: 'rgb(0,255,0)', 0.85: 'yellow', 1.0: 'rgb(255,0,0)' },
          // 整个热图的全局不透明度
          // opacity: 0.4,
          maxOpacity: 1,
          minOpacity: 0,
          renderer: 'canvas2d',
          // 模糊因子越高，渐变越平滑
          blur: 0.85
        })
        this.map.addOverLay(this.heatmapOverlay)
        this.heatmapOverlay.setDataSet({
          data: hotMapData,
          max: 40
        })
      })
      // 热力图初始化
    },
    changeHeatmap() {
      clearInterval(tempHotmap)
    },
    getTime() {
      var _this = this
      let yy = new Date().getFullYear()
      var mm = new Date().getMonth() < 10 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1
      var dd = new Date().getDate() < 10 ? '0' + new Date().getDate() : new Date().getDate()
      let hh = new Date().getHours()
      let mf = new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes()
      let ss = new Date().getSeconds() < 10 ? '0' + new Date().getSeconds() : new Date().getSeconds()
      _this.gettime = yy + '-' + mm + '-' + dd + ' ' + hh + ':' + mf + ':' + ss
    },
    currentTime() {
      setInterval(this.getTime, 3000)
    }
  }
}
</script>

<style lang="less">
#map {
  width: 100%;
  height: 72vh;
  background-color: antiquewhite;
}
</style>
