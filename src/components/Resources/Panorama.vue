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
    this.init();
  },
  mounted () {
    // eslint-disable-next-line standard/object-curly-even-spacing
    window.embedpano({ xml: 0, target: 'pano', html5: 'only', mobilescale: 1.0, passQueryParameters: 'startscene,startlookat'});
    var krpano = document.getElementById('krpanoSWFObject');
    krpano.call(`loadxml('<krpano><preview url="http://124.71.75.230/hongqi/icon/05.jpg" type="SPHERE" /></krpano>');`);
    console.log(this.xmlDomData);
  },
  methods: {
    init () {
      let xmlDom = document.implementation.createDocument('', 'root', null);
      // 创建一个子节点
      let child = xmlDom.createElement('child');
      xmlDom.documentElement.appendChild(child);
      console.log(xmlDom);
      this.xmlDomData = xmlDom;
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
