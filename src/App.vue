<template>
  <div id="app">
    <!-- GlobalHeader头部公共组件 -->
    <GlobalHeader v-if="!isLoading"></GlobalHeader>
    <div v-if="!isLoading" class="container" :style="{ left: folding ? '-201px' : '0px'}">
      <!-- GlobalSlide侧边公共栏组件 -->
      <GlobalSlide @handMenuToggle="onClickMenuToggle"></GlobalSlide>
      <router-view/>
    </div>
    <template v-else>
      <router-view/>
    </template>
  </div>
</template>

<script>
// 导入公共头部组件
import GlobalHeader from './common/GlobalHeader';
// 导入公共侧边栏组件
import GlobalSlide from './common/GlobalSlide';

export default {
  name: 'App',
  components: {
    GlobalHeader,
    GlobalSlide
  },
  data () {
    return {
      folding: false
    }
  },
  computed: {
    // 判断是否是登录页面
    isLoading () {
      return this.$route.name === 'Login';
    }
  },
  methods: {
    // 折叠
    onClickMenuToggle (data) {
      // 这个值是通过子级的改变的
      this.folding = data;
    }
  }
};
</script>

<style>
#app{
  height: 100%;
}
</style>
