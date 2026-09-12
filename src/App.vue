<template>
  <div id="app">
    <license-gate>
      <router-view/>
    </license-gate>
  </div>
</template>

<script>
import LicenseGate from '@/components/LicenseGate';

export default {
  name: 'App',
  components: { LicenseGate }
};
</script>

<style lang="less">
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  background: #f0f2f5;
}

#app {
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
</style>
