<template>
  <header class="g-header">
    <div class="header-left">
      <img class="logo" src="/img/logo.png" alt="logo">
      <span class="title">前端技术沉淀</span>
      <span class="subtitle">Frontend Playground</span>
    </div>
    <div class="header-right">
      <span v-for="tag in stackTags" :key="tag" class="stack-tag">{{ tag }}</span>
    </div>
  </header>
</template>

<script>
export default {
  name: 'GlobalHeader',
  data () {
    return {
      // 技术栈标签：与 package.json 依赖保持一致
      stackTags: ['Vue 2', 'Vue Router 3', 'Vuex 3', 'Element UI', 'Ant Design Vue', 'Less', 'webpack 3']
    };
  }
};
</script>

<style lang="less">
.g-header {
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #001529;
  color: #fff;

  .header-left {
    display: flex;
    align-items: center;

    .logo {
      height: 28px;
      margin-right: 12px;
    }

    .title {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 1px;
    }

    .subtitle {
      margin-left: 12px;
      padding-left: 12px;
      border-left: 1px solid rgba(255, 255, 255, 0.25);
      font-size: 12px;
      color: rgba(255, 255, 255, 0.55);
    }
  }

  .header-right {
    display: flex;
    align-items: center;

    .stack-tag {
      margin-left: 8px;
      padding: 2px 10px;
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 10px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.75);
      white-space: nowrap;
    }
  }
}
</style>
