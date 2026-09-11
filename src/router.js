import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

// 单页应用：质检二维码标签生成器（hash 模式，兼容 Electron file:// 协议）
export default new Router({
  routes: [{
    path: '/',
    name: 'QcLabel',
    component: () => import(/* webpackChunkName: "qclabel" */ '@/components/QcLabel.vue'),
    meta: { name: '质检二维码标签生成器' }
  }]
});
