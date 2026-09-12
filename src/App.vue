<template>
  <div id="app">
    <GlobalHeader></GlobalHeader>
    <div class="app-body">
      <GlobalSlide :folded="folding" @handMenuToggle="onClickMenuToggle"></GlobalSlide>
      <div class="main">
        <router-view/>
      </div>
    </div>
  </div>
</template>

<script>
// 导入公共头部组件
import GlobalHeader from './components/GlobalHeader';
// 导入公共侧边栏组件
import GlobalSlide from './components/GlobalSlide';

export default {
  name: 'App',
  components: {
    GlobalHeader,
    GlobalSlide
  },
  data () {
    return {
      // 侧边栏折叠状态（由 GlobalSlide 内部按钮触发，经事件上抛同步）
      folding: false
    }
  },
  methods: {
    onClickMenuToggle (val) {
      this.folding = val;
    }
  }
};
</script>

<style lang="less">
// 全局基础重置（原遗留 global.css 已移除，样式收敛到组件内）
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.main {
  flex: 1;
  overflow-y: auto;
  background: #f0f2f5;
}
</style>
