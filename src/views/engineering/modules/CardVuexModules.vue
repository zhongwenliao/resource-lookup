<template>
  <div class="tech-card">
    <h4>Vuex 模块自动聚合</h4>
    <p>store 目录下每个 .js 即一个模块，import.meta.glob 扫描注册，新增模块零配置。</p>
    <pre>storeModules[key] = files[key].default</pre>
  </div>
</template>

<script>
export default {
  name: 'CardVuexModules'
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
