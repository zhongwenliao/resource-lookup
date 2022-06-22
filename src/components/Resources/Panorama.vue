<template>
  <div id="pano">
  </div>
</template>

<script>

export default {
  components: {
  },
  name: 'Panorama',
  data () {
    return {
      xmlDomData: ``
    };
  },
  created () {
    // this.init();
  },
  mounted () {
    // eslint-disable-next-line standard/object-curly-even-spacing
    window.embedpano({ xml: 'http://127.0.0.1:5500/template.xml', target: 'pano', html5: 'only', mobilescale: 1.0, passQueryParameters: 'startscene,startlookat'});
    window['handleClickHotSpots'] = this.handleClickHotSpots;
  },
  methods: {
    init () {
      let xmlDom = document.implementation.createDocument('', 'root', null);
      // 创建一个子节点
      let child = xmlDom.createElement('child');
      xmlDom.documentElement.appendChild(child);
      console.log(xmlDom);
      this.xmlDomData = xmlDom;
    },
    handleClickHotSpots (deviceType, targetScene) {
      console.log(deviceType, targetScene);
    }
  }
};
</script>

<style stylt="less" scoped>
#pano {
  width: 100%;
  height: 85vh;
}
</style>
