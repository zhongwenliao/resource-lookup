<template>
  <div>
      <el-input  v-model="input" placeholder="请输入你需要查找的视频名称">
          <el-button slot="append" @click="handleSearch" icon="el-icon-search">搜索</el-button>
      </el-input>
      <video id="videoElement"></video>
  </div>
</template>

<script>

import flvjs from 'flv.js';

export default {
  components: {
  },
  name: 'YouMayAlsoLike',
  data () {
    return {
      input: ''
    };
  },
  created () {
    try {
      if (flvjs.isSupported()) {
        let videoElement = document.getElementById('videoElement');
        let flvPlayer = flvjs.createPlayer({
          type: 'flv',
          url: 'http://49.234.78.75:32302/proxy/b2701dce8c3892d5b84dc398dd22938d.flv'
        });
        flvPlayer.attachMediaElement(videoElement);
        flvPlayer.load();
        flvPlayer.play();
      }
    } catch (error) {
      console.log(error);
    }
  },
  methods: {
    handleSearch () {
      console.log('点击搜索');
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
