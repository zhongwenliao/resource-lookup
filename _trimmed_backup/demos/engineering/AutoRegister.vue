<template>
  <demo-page
    title="require.context 自动注册"
    description="webpack 的 require.context 可以扫描目录批量导入模块，消灭重复的 import。本项目的 Vuex 模块注册（store/index.js）和下方卡片都用了这个技术点。">
    <demo-block
      :index="1"
      title="本项目实例：Vuex 模块自动聚合"
      description="store 目录下每个 .js 文件自动成为一个 Vuex 模块，新增模块零配置。"
      code="// store/index.js
const files = require.context('.', false, /\.js$/);
const storeModules = {};
files.keys().forEach(key => {
  if (key === './index.js') return; // 跳过聚合入口自身
  storeModules[key.replace(/(\.\/|\.js)/g, '')] = files(key).default;
});

export default new Vuex.Store({ modules: storeModules });">
      <ul class="point-list">
        <li><b>require.context(dir, useSubdirs, regex)</b> —— 三个参数：目录、是否遍历子目录、文件正则</li>
        <li><b>files.keys()</b> —— 返回 './counter.js' 形式的相对路径数组</li>
        <li><b>files(key)</b> —— 拿到模块（配合 .default 取 ES Module 默认导出）</li>
        <li>构建期展开，没有运行时开销；代价是文件名即模块名，重命名要谨慎</li>
      </ul>
    </demo-block>

    <demo-block
      :index="2"
      title="页面内实战：扫描 modules 目录自动注册卡片"
      description="下方卡片来自 demos/engineering/modules/ 目录，由 require.context 扫描注册——往该目录加一个 .vue 文件，页面自动多一张卡片，本组件无需任何改动。"
      code="const files = require.context('./modules', false, /\.vue$/);
const cardComponents = {};
files.keys().forEach(key => {
  const name = key.replace(/(\.\/|\.vue)/g, '');
  cardComponents[name] = files(key).default;
});

// 动态组件渲染
<component :is=&quot;comp&quot; v-for=&quot;comp in cardList&quot; :key=&quot;comp.name&quot; />">
      <div class="auto-cards">
        <component :is="comp" v-for="comp in cardList" :key="comp.name"></component>
      </div>
      <p class="demo-tip">当前自动注册了 {{ cardList.length }} 个卡片组件：{{ cardNames.join('、') }}</p>
    </demo-block>

    <demo-block
      :index="3"
      title="webpack 配置要点"
      description="本项目（webpack 3 + vue-cli 2 模板）的关键配置位置：">
      <ul class="point-list">
        <li><b>build/webpack.base.conf.js</b> —— alias：'vue$' 指向完整版 vue.esm.js（支持 template 字符串）、'@' 指向 src、'@static' 指向 static</li>
        <li><b>build/webpack.dev.conf.js</b> —— devServer 代理配置位置（接口联调时改这里）</li>
        <li><b>build/webpack.prod.conf.js</b> —— 代码压缩、CSS 提取、chunk 拆分</li>
        <li><b>.postcssrc.js</b> —— autoprefixer + postcss-pxtorem</li>
        <li><b>.babelrc</b> —— preset-env + stage-2，路由懒加载依赖 syntax-dynamic-import 能力</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/common/components/DemoPage';
import DemoBlock from '@/common/components/DemoBlock';

// 技术点：require.context 扫描 modules 目录，自动注册卡片组件
const files = require.context('./modules', false, /\.vue$/);
const cardComponents = {};
files.keys().forEach(key => {
  const name = key.replace(/(\.\/|\.vue)/g, '');
  cardComponents[name] = files(key).default;
});

export default {
  name: 'AutoRegister',
  components: { DemoPage, DemoBlock, ...cardComponents },
  computed: {
    cardList () {
      return Object.keys(cardComponents).map(name => cardComponents[name]);
    },
    cardNames () {
      return Object.keys(cardComponents);
    }
  }
};
</script>

<style lang="less" scoped>
.auto-cards {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -6px;
}

.auto-cards > * {
  width: calc(33.33% - 12px);
  margin: 6px;
}

.demo-tip {
  margin: 10px 0 0;
  font-size: 13px;
  color: #999;
}

.point-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2.1;
  color: #555;
}
</style>
