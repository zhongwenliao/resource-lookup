<template>
  <div class="tech-card">
    <h4>路由懒加载</h4>
    <p>() => import() 按页面拆 chunk，配合 webpackChunkName 命名，首屏只加载必要代码。</p>
    <pre>() => import(/* webpackChunkName: "view-[request]" */ `@/components/${view}.vue`)</pre>
  </div>
</template>

<script>
export default {
  name: 'CardRouterLazy'
};
</script>

<style lang="less" scoped>
.tech-card {
  box-sizing: border-box;
  padding: 14px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #fff;

  h4 {
    margin: 0 0 8px;
    font-size: 14px;
    color: #262626;
  }

  p {
    margin: 0 0 8px;
    font-size: 12px;
    line-height: 1.7;
    color: #888;
  }

  pre {
    margin: 0;
    padding: 8px 10px;
    background: #fafafa;
    border-radius: 3px;
    font-size: 11px;
    color: #595959;
    overflow-x: auto;
  }
}
</style>
