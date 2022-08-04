<template>
  <div>
    <div id="map"></div>
    <div>
      <input type="button" @click="openHeatmap" value="显示热力图" />
      <input type="button" @click="closeHeatmap" value="关闭热力图" />
    </div>
  </div>
</template>
<script>
import request from '@/common/utils/request'

export default {
  data() {
    return {
      hotMap: [],
      map: null,
      heatmapOverlay: null,
      marker: null
    }
  },
  computed: {},
  created() {
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
          this.onLoad(
            data.map(i => ({
              count: Math.floor(Math.random() * 50) + 1,
              lng: i.gpsLng,
              lat: i.gpsLat
            }))
          )
        })
      })
    },
    onLoad(hotMapData) {
      // 创建地图实例
      this.map = new T.Map('map')
      // 地图初始化，第一个参数是经纬度坐标，第二个参数是地图级别
      this.map.centerAndZoom(new T.LngLat(114.06667, 22.61667), 12)

      // 热力图初始化
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
        max: 50
      })

      // 创建标注
      for (var i = 0; i < hotMapData.length; i++) {
        var label = new T.Label({
          text: String(hotMapData[i].count),
          position: new T.LngLat(hotMapData[i].lng, hotMapData[i].lat)
        })
        this.map.addOverLay(label)
      }
    },
    openHeatmap() {
      console.log('显示热力图')
      this.heatmapOverlay.show()
    },
    closeHeatmap() {
      console.log('关闭热力图')
      this.heatmapOverlay.hide()
    }
  }
}
</script>

<style lang="less">
#map {
  width: 100%;
  height: 82vh;
  background-color: antiquewhite;
}
</style>
