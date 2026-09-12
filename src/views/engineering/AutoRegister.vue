<template>
  <demo-page
    title="import.meta.glob 自动注册"
    description="Vite 的 import.meta.glob 可以扫描目录批量导入模块，消灭重复的 import（webpack 时代 require.context 的等价物）。本项目的 Vuex 模块注册（store/index.js）和下方卡片都用了这个技术点。">
    <demo-block
      :index="1"
      title="本项目实例：Vuex 模块自动聚合"
      description="store 目录下每个 .js 文件自动成为一个 Vuex 模块，新增模块零配置。"
      code="// store/index.js
const files = import.meta.glob('./*.js', { eager: true });
const storeModules = {};
Object.keys(files).forEach(key => {
  if (key === './index.js') return; // 跳过聚合入口自身
  storeModules[key.replace(/(\.\/|\.js)/g, '')] = files[key].default;
});

export default new Vuex.Store({ modules: storeModules });">
      <ul class="point-list">
        <li><b>import.meta.glob(pattern, options)</b> —— pattern 支持 * / ** / [] 通配；构建期静态展开，没有运行时扫描开销</li>
        <li><b>默认懒加载</b> —— 每个匹配文件编译成动态 import（() => import(...)），key 是 './counter.js' 形式的匹配路径</li>
        <li><b>{ eager: true }</b> —— 直接拿到模块本体（等价 require.context 的同步行为），配合 .default 取 ES Module 默认导出</li>
        <li><b>import 子句</b> —— import.meta.glob('./*.js', { import: 'default', eager: true }) 可直接拿到默认导出</li>
        <li>代价是文件名即模块名，重命名要谨慎</li>
      </ul>
    </demo-block>

    <demo-block
      :index="2"
      title="页面内实战：扫描 modules 目录自动注册卡片"
      description="下方卡片来自 views/engineering/modules/ 目录，由 import.meta.glob 扫描注册——往该目录加一个 .vue 文件，页面自动多一张卡片，本组件无需任何改动。"
      code="const files = import.meta.glob('./modules/*.vue', { eager: true });
const cardComponents = {};
Object.keys(files).forEach(key => {
  const name = key.replace(/(\.\/|\.vue)/g, '');
  cardComponents[name] = files[key].default;
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
      title="Vite 配置要点"
      description="本项目（Vite 5 + Vue 2.7）的关键配置位置：">
      <ul class="point-list">
        <li><b>vite.config.js</b> —— alias：'vue' 指向完整版 vue.esm-bundler.js（支持 template 字符串）、'@' 指向 src；接口联调的 server.proxy 也在这里配</li>
        <li><b>index.html</b> —— Vite 以根目录 index.html 为工程入口，module script 直接指向 /src/main.js，dev 阶段按需编译、无需打包</li>
        <li><b>public/</b> —— 静态资源目录（webpack 时代的 static/），构建时原样复制到 dist，引用路径以 / 开头</li>
        <li><b>css.postcss</b> —— autoprefixer + postcss-pxtorem 内联在 vite.config.js（原 .postcssrc.js）</li>
        <li><b>热更新</b> —— Vue SFC 改动只替换组件本身、不整页刷新；vite.config.js 或依赖变更才触发整页 reload</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

// 技术点：import.meta.glob 扫描 modules 目录，自动注册卡片组件
const files = import.meta.glob('./modules/*.vue', { eager: true });
const cardComponents = {};
Object.keys(files).forEach(key => {
  const name = key.replace(/(\.\/|\.vue)/g, '');
  cardComponents[name] = files[key].default;
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
