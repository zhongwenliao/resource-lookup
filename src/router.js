import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

// 单页应用：华源湘条码追溯系统 —— 标签生成 + 扫码绑定 + 码对绑定 + 聚合二维码 + 出货绑定 + 溯源查询
// （hash 模式，兼容 Electron file:// 协议）
export default new Router({
  routes: [{
    path: '/',
    name: 'QcLabel',
    component: () => import(/* webpackChunkName: "qclabel" */ '@/views/QcLabel.vue'),
    meta: { name: '质检二维码标签生成器' }
  }, {
    path: '/bind',
    name: 'CodeBind',
    component: () => import(/* webpackChunkName: "codebind" */ '@/views/CodeBind.vue'),
    meta: { name: '扫码绑定' }
  }, {
    path: '/pair',
    name: 'PairBind',
    component: () => import(/* webpackChunkName: "pairbind" */ '@/views/PairBind.vue'),
    meta: { name: '码对绑定' }
  }, {
    path: '/agg',
    name: 'AggCode',
    component: () => import(/* webpackChunkName: "aggcode" */ '@/views/AggCode.vue'),
    meta: { name: '聚合二维码' }
  }, {
    path: '/ship',
    name: 'ShipBind',
    component: () => import(/* webpackChunkName: "shipbind" */ '@/views/ShipBind.vue'),
    meta: { name: '出货绑定' }
  }, {
    path: '/lookup',
    name: 'QrLookup',
    component: () => import(/* webpackChunkName: "qrlookup" */ '@/views/QrLookup.vue'),
    meta: { name: '二维码溯源查询' }
  }]
});
