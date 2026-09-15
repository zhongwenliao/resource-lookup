import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

// 单页应用：质检二维码标签生成器 + 二维码溯源查询（hash 模式，兼容 Electron file:// 协议）
export default new Router({
  routes: [{
    path: '/',
    name: 'QcLabel',
    component: () => import(/* webpackChunkName: "qclabel" */ '@/views/QcLabel.vue'),
    meta: { name: '质检二维码标签生成器' }
  }, {
    path: '/lookup',
    name: 'QrLookup',
    component: () => import(/* webpackChunkName: "qrlookup" */ '@/views/QrLookup.vue'),
    meta: { name: '二维码溯源查询' }
  }]
});
