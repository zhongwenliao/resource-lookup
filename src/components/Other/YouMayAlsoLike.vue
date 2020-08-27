<template>
  <div>
      <el-input  v-model="input" placeholder="请输入你需要查找的视频名称">
          <el-button slot="append" @click="handleSearch" icon="el-icon-search">搜索</el-button>
      </el-input>
      <video id="videoElementRef"></video>
  </div>
</template>

<script>
import FlvJs from 'flv.js';

export default {
  components: {
  },
  name: 'YouMayAlsoLike',
  data () {
    return {
      input: '',
      // flv格式视频播放地址
      flvUrl: ''
    };
  },
  created () {
    this.initPlay();
  },
  methods: {
    handleSearch () {
      console.log('点击搜索');
    },
    initPlay () {
      try {
        if (FlvJs.isSupported()) {
          const videoElement = document.getElementById('videoElementRef');
          const flvPlayer = FlvJs.createPlayer({
            type: 'flv',
            url: this.flvUrl
          }, {
            
          });
          flvPlayer.attachMediaElement(videoElement);
          flvPlayer.load();
          flvPlayer.play();
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
