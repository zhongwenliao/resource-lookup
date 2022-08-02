<template>
  <!-- <div id="heatmap" style=" width:700px; height: 400px;">
    <img
      src="https://antai2021.obs.cn-north-1.myhuaweicloud.com/antai/uploadImg/1635996199896asz4.png"
      style="width:100%; height: 100%"
    />
  </div> -->
  <div>
    <div id="map"></div>
    <div>
      <input type="button" @click="openHeatmap" value="显示热力图" />
      <input type="button" @click="closeHeatmap" value="关闭热力图" />
    </div>
  </div>
</template>
<script>
import Heatmap from 'heatmap.js'
import request from '@/common/utils/request'

export default {
  data() {
    return {
      hotMap: [],
      map: null,
      heatmapOverlay: null
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
              count: i+1,
              lat: i.gpsLat,
              lng: i.gpsLng
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
        // 纬度字段名称。
        latField: 'lat',
        // 经度字段名称。
        lngField: 'lng',
        // 权重字段名称。
        valueField: 'count',
        // 缓冲半径。
        radius: 30,
        // 颜色梯度变化
        gradient: { 0.25: '#A8B8E2', 0.55: 'rgb(0,255,0)', 0.85: 'yellow', 1.0: 'rgb(255,0,0)' },
        // 透明度
        opacity: 0.6,
        maxOpacity: 1,
        minOpacity: 0,
        renderer: 'canvas2d'
      })
      this.map.addOverLay(this.heatmapOverlay)
      console.log(hotMapData);
      this.heatmapOverlay.setDataSet({
        data: hotMapData,
        max: 300
      })
    },
    openHeatmap() {
      console.log('显示热力图')
      this.heatmapOverlay.show()
    },
    closeHeatmap() {
      console.log('关闭热力图')
      this.heatmapOverlay.hide()
    },

    // 这个写法是直接展示热力图
    initHotMap() {
      // 创建一个heatmap实例对象
      // 这里直接指定热点图渲染的div了.heatmap支持自定义的样式方案,具体可看官网api
      var heatmapInstance = Heatmap.create({
        container: document.getElementById('heatmap')
      })
      // 构建一些随机数据点,这里替换成你的业务数据
      var points = []
      var max = 0
      var width = 600
      var height = 400
      var len = 50
      while (len--) {
        var val = Math.floor(Math.random() * 100)
        max = Math.max(max, val)
        var point = {
          x: Math.floor(Math.random() * width),
          y: Math.floor(Math.random() * height),
          value: val
        }
        points.push(point)
      }
      console.log(points)
      var data = {
        max: max,
        data: points
      }
      // 因为data是一组数据,所以直接setData
      heatmapInstance.setData(data)
    }
  }
}
</script>

<style lang="less">
#map {
  width: 100%;
  height: 80vh;
  background-color: antiquewhite;
}
</style>
