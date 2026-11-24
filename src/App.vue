<template>
  <div id="app">
    <license-gate>
      <!-- 顶部导航条：品牌名 + 五个功能页并列切换 -->
      <nav class="top-nav">
        <span class="brand"><i class="el-icon-place"></i> 华源湘条码追溯系统</span>
        <router-link to="/" exact class="nav-link">标签生成</router-link>
        <router-link to="/bind" class="nav-link">扫码绑定</router-link>
        <router-link to="/pair" class="nav-link">码对绑定</router-link>
        <router-link to="/agg" class="nav-link">聚合码</router-link>
        <router-link to="/ship" class="nav-link">出货绑定</router-link>
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

/* 品牌名：与导航链接视觉区分（右侧留白隔开） */
.brand {
  margin-right: 20px;
  padding-right: 20px;
  font-size: 15px;
  font-weight: 700;
  color: #1a3a6b;
  border-right: 1px solid #e8e8e8;

  i {
    margin-right: 4px;
    color: #409eff;
  }
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
