<template>
  <div id="app">
    <GlobalHeader v-if="!isLoading"></GlobalHeader>
    <div v-if="!isLoading" class="container" :style="{ left: folding ? '-201px' : '0px' }">
      <GlobalSlide @handMenuToggle="onClickMenuToggle"></GlobalSlide>
      <div class="main">
        <div class="manage-area">
          <MainHead :title="routerInfo.meta.title" className="manage-area-title"></MainHead>
          <div class="manage-area-main">
            <router-view />
          </div>
        </div>
      </div>
    </div>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script>
// 导入公共头部组件
import GlobalHeader from './common/components/GlobalHeader'
// 导入公共侧边栏组件
import GlobalSlide from './common/components/GlobalSlide'
import MainHead from './common/components/MainHead'

export default {
  name: 'App',
  components: {
    GlobalHeader,
    GlobalSlide,
    MainHead
  },
  data() {
    return {
      folding: false
    }
  },
  computed: {
    // 判断是否是登录页面
    isLoading() {
      return this.$route.name === 'Login'
    },
    routerInfo() {
      return this.$route
    }
  },
  methods: {
    // 折叠
    onClickMenuToggle(data) {
      // 这个值是通过子级的改变的
      this.folding = data
    }
  }
}
</script>

<style>
#app {
  height: 100%;
}
</style>
