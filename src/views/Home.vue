<template>
  <demo-page
    title="前端技术沉淀"
    description="这不是业务项目，而是一个可运行的前端技术练习场：每个技术点一个可交互示例，边看边玩。所有示例基于本项目的真实工程配置（webpack 3 + Vue 2 全家桶）。">
    <demo-block
      :index="1"
      title="技术栈"
      description="与 package.json 依赖一致：">
      <div class="stack-tags">
        <span v-for="tag in stackTags" :key="tag" class="stack-tag">{{ tag }}</span>
      </div>
    </demo-block>

    <demo-block
      :index="2"
      title="沉淀模块导航"
      description="点击卡片直达对应演示页（左侧菜单由路由配置自动生成）：">
      <div class="module-cards">
        <router-link
          v-for="mod in modules"
          :key="mod.path"
          :to="mod.path"
          class="module-card">
          <h4>{{ mod.title }}</h4>
          <p>{{ mod.desc }}</p>
        </router-link>
      </div>
    </demo-block>

    <demo-block
      :index="3"
      title="快速开始"
      description="本地运行与构建：">
      <pre class="quick-start"><code># 安装依赖
npm install

# 本地开发（webpack-dev-server 热更新）
npm run dev

# 生产构建
npm run build

# ESLint 检查并自动修复
npm run lint</code></pre>
    </demo-block>

    <demo-block
      :index="4"
      title="如何新增一个演示页"
      description="三步接入，菜单自动出现（受益于「路由配置即菜单」）：">
      <pre class="quick-start"><code>1. 在 src/views/ 下新建 .vue 演示页
2. 在 src/router/index.js 的 routeConfig 中注册一条路由
   （meta.name 菜单文案 / meta.group 分组名）
3. 完成 —— 侧边栏与页面标题自动生成</code></pre>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

export default {
  name: 'Home',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      stackTags: ['Vue 2.7', 'Vue Router 3', 'Vuex 3', 'Element UI 2.x', 'Ant Design Vue 1.x', 'Less 3', 'Vite 5', 'ESLint + Prettier'],
      modules: [{
        path: '/vue/communication',
        title: 'Vue 特性',
        desc: '组件通信八式、插槽、自定义指令、Mixin 合并策略'
      }, {
        path: '/ui/compare',
        title: '组件库对比',
        desc: 'Element UI vs Ant Design Vue：表单、表格同场景实现'
      }, {
        path: '/router/params/42',
        title: '路由方案',
        desc: '动态参数、编程式导航、导航守卫与执行顺序'
      }, {
        path: '/vuex/counter',
        title: 'Vuex',
        desc: '单向数据流、mapXxx 辅助函数、异步 action'
      }, {
        path: '/style/less',
        title: '样式方案',
        desc: 'Less 变量与 mixin、scoped 穿透、px2rem 适配'
      }, {
        path: '/engineering/auto-register',
        title: '工程化',
        desc: 'import.meta.glob 自动注册、Vite 配置要点'
      }]
    };
  }
};
</script>

<style lang="less" scoped>
.stack-tags {
  .stack-tag {
    display: inline-block;
    margin: 0 8px 8px 0;
    padding: 4px 12px;
    background: #e6f7ff;
    border: 1px solid #91d5ff;
    border-radius: 3px;
    font-size: 13px;
    color: #1890ff;
  }
}

.module-cards {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -6px;

  .module-card {
    display: block;
    box-sizing: border-box;
    width: calc(33.33% - 12px);
    margin: 6px;
    padding: 16px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    text-decoration: none;
    transition: box-shadow 0.2s, border-color 0.2s;

    &:hover {
      border-color: #1890ff;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);

      h4 {
        color: #1890ff;
      }
    }

    h4 {
      margin: 0 0 8px;
      font-size: 15px;
      color: #262626;
      transition: color 0.2s;
    }

    p {
      margin: 0;
      font-size: 12px;
      line-height: 1.7;
      color: #888;
    }
  }
}

.quick-start {
  margin: 0;
  padding: 14px 16px;
  background: #fafafa;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.9;
  color: #595959;
  overflow-x: auto;
}
</style>
