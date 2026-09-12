/* vuex, 各模块 store 聚合后在此注册 */
import Vue from 'vue';
import Vuex from 'vuex';

// 读取各个模块的文件（import.meta.glob 构建期展开，等价 webpack 的 require.context）
const files = import.meta.glob('./*.js', { eager: true });
const storeModules = {};
Object.keys(files).forEach(key => {
  if (key === './index.js') {
    return;
  }
  storeModules[key.replace(/(\.\/|\.js)/g, '')] = files[key].default;
});

// 调用vuex
Vue.use(Vuex); // 根模块 store

// 将对象合并并默认导出
export default new Vuex.Store(Object.assign({}, {
  modules: storeModules
}));
