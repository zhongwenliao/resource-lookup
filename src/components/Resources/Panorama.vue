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

    };
  },
  created () {
    this.init();
  },
  mounted () {
    // eslint-disable-next-line standard/object-curly-even-spacing
    window.embedpano({ xml: 'http://124.71.75.230/hongqi/main.xml', target: 'pano', html5: 'only', mobilescale: 1.0, passQueryParameters: 'startscene,startlookat'});
  },
  methods: {
    init () {
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
