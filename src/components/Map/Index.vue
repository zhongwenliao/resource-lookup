<template>
  <div id="lsGlobe" class="fullSize"></div>
</template>

<script>

export default {
  components: {

  },
  data() {
    return {
      modalTitle: '素材调整',
    }
  },
  created() {
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      var viewer = new LSGlobe.Viewer('lsGlobe', {
        baseLayerPicker: false,
        sceneModePicker: false,
        fullscreenButton: false,
        guid: '1903883411',
        //许可码
        licenseUrl: "http://139.159.139.174:9999/wish3dearth/api/access/v1.0.0" // 许可服务地址
      });
    }
  },
  beforeDestroy() {

  },
}
</script>

<style lang="less" scoped>
#lsGlobe {
  width: 80vw;
  height: 80vh;
}
</style>
