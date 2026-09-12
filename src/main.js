// Vue 完整版构建（支持 template 选项）的别名配置见 vite.config.js 的 resolve.alias
import Vue from 'vue';
import App from './App.vue';
import generateRouter from './router/index.js';
import store from './store/index.js';
// 技术点：双组件库共存（Element UI 2.x + Ant Design Vue 1.x），用于同场景对比沉淀
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

Vue.config.productionTip = false;
Vue.config.silent = false;

// 全量注册两个组件库（演示项目不做按需加载，保证所有示例开箱即用；
// 按需加载方案见 /engineering 演示页说明）
Vue.use(ElementUI);
Vue.use(Antd);

generateRouter((router) => {
  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    store,
    template: '<App/>',
    components: { App }
  });
});
