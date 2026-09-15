<template>
  <div id="app">
    <license-gate>
      <!-- 顶部导航条：两个功能页并列切换 -->
      <nav class="top-nav">
        <router-link to="/" exact class="nav-link">标签生成</router-link>
        <router-link to="/lookup" class="nav-link">溯源查询</router-link>
      </nav>
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

/* ==================== 顶部导航条 ==================== */
.top-nav {
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.06);
}

.nav-link {
  margin-right: 4px;
  padding: 12px 16px;
  font-size: 14px;
  color: #595959;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;

  &:hover {
    color: #409eff;
  }

  &.router-link-active {
    font-weight: 600;
    color: #409eff;
    border-bottom-color: #409eff;
  }
}
</style>
