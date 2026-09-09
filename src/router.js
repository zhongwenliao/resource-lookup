import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

// 技术点：路由懒加载 —— 按页面拆分 chunk，首屏只加载必要代码
const loadingLazy = (view) => () => import(/* webpackChunkName: "view-[request]" */ `@/components/${view}.vue`);

/**
 * 路由配置即菜单（单一数据源）：
 * - meta.name       菜单文案 + 浏览器标签标题（beforeEach 中同步）
 * - meta.group      侧边栏分组名（getAsideConfig 按此聚合）
 * - meta.link       可选，菜单实际跳转地址（动态路由用，默认取 path）
 * - meta.hideAslide 是否在侧边栏隐藏
 */
const routeConfig = [{
  path: '/',
  redirect: '/home'
}, {
  path: '/home',
  name: 'Home',
  component: loadingLazy('demos/Home'),
  meta: { name: '项目总览', group: '开始' }
},

// ---------- Vue 特性 ----------
{
  path: '/vue/communication',
  name: 'VueCommunication',
  component: loadingLazy('demos/vue/Communication'),
  meta: { name: '组件通信八式', group: 'Vue 特性' }
}, {
  path: '/vue/slots',
  name: 'VueSlots',
  component: loadingLazy('demos/vue/Slots'),
  meta: { name: '插槽三种用法', group: 'Vue 特性' }
}, {
  path: '/vue/directive',
  name: 'VueDirective',
  component: loadingLazy('demos/vue/Directive'),
  meta: { name: '自定义指令', group: 'Vue 特性' }
}, {
  path: '/vue/mixin',
  name: 'VueMixin',
  component: loadingLazy('demos/vue/Mixin'),
  meta: { name: 'Mixin 混入', group: 'Vue 特性' }
},

// ---------- 组件库对比 ----------
{
  path: '/ui/compare',
  name: 'UiCompare',
  component: loadingLazy('demos/ui/Compare'),
  meta: { name: '双库总览对比', group: '组件库对比' }
}, {
  path: '/ui/element-form',
  name: 'ElementForm',
  component: loadingLazy('demos/ui/ElementForm'),
  meta: { name: 'Element 表单', group: '组件库对比' }
}, {
  path: '/ui/element-table',
  name: 'ElementTable',
  component: loadingLazy('demos/ui/ElementTable'),
  meta: { name: 'Element 表格', group: '组件库对比' }
}, {
  path: '/ui/antd-form',
  name: 'AntdForm',
  component: loadingLazy('demos/ui/AntdForm'),
  meta: { name: 'Antd 表单', group: '组件库对比' }
}, {
  path: '/ui/antd-table',
  name: 'AntdTable',
  component: loadingLazy('demos/ui/AntdTable'),
  meta: { name: 'Antd 表格', group: '组件库对比' }
},

// ---------- 路由方案 ----------
{
  // 动态路由参数：:id 为可选参数，菜单跳转走 meta.link 指向示例值
  path: '/router/params/:id?',
  name: 'RouterParams',
  component: loadingLazy('demos/router/Params'),
  meta: { name: '动态路由参数', group: '路由方案', link: '/router/params/42' }
}, {
  path: '/router/guard',
  name: 'RouterGuard',
  component: loadingLazy('demos/router/Guard'),
  meta: { name: '导航守卫', group: '路由方案' }
},

// ---------- Vuex ----------
{
  path: '/vuex/counter',
  name: 'VuexCounter',
  component: loadingLazy('demos/vuex/Counter'),
  meta: { name: 'Vuex 单向数据流', group: 'Vuex 状态管理' }
},

// ---------- 样式方案 ----------
{
  path: '/style/less',
  name: 'StyleLess',
  component: loadingLazy('demos/style/Less'),
  meta: { name: 'Less 与 scoped', group: '样式方案' }
},

// ---------- 工程化 ----------
{
  path: '/engineering/auto-register',
  name: 'AutoRegister',
  component: loadingLazy('demos/engineering/AutoRegister'),
  meta: { name: 'require.context 自动注册', group: '工程化' }
},

// ---------- 网络通信 ----------
{
  path: '/websocket/basic',
  name: 'WebsocketBasic',
  component: loadingLazy('demos/websocket/Websocket'),
  meta: { name: 'WebSocket 基础', group: '网络通信' }
}, {
  path: '/websocket/heartbeat',
  name: 'WebsocketHeartbeat',
  component: loadingLazy('demos/websocket/Heartbeat'),
  meta: { name: '心跳与断线重连', group: '网络通信' }
}, {
  path: '/upload/big-file',
  name: 'BigFileUpload',
  component: loadingLazy('demos/upload/BigFile'),
  meta: { name: '大文件上传', group: '网络通信' }
},

// ---------- PWA ----------
{
  path: '/pwa/service-worker',
  name: 'PwaServiceWorker',
  component: loadingLazy('demos/pwa/Pwa'),
  meta: { name: 'Service Worker 与离线缓存', group: 'PWA' }
}];

/**
 * 技术点：路由配置驱动侧边栏
 * 按 meta.group 聚合生成侧边栏分组数据，菜单与路由共用一份数据源，
 * 新增页面只需在 routeConfig 里加一条记录，菜单自动出现。
 */
export const getAsideConfig = () => {
  const groups = [];
  routeConfig.forEach((route) => {
    const meta = route.meta || {};
    if (meta.hideAslide) {
      return;
    }
    const groupName = meta.group || '其他';
    let target = groups.find(g => g.group === groupName);
    if (!target) {
      target = { group: groupName, items: [] };
      groups.push(target);
    }
    target.items.push({
      path: meta.link || route.path,
      name: route.name,
      meta
    });
  });
  return { config: routeConfig, groups };
};

export default function generateRouter (callback) {
  const router = new Router({
    routes: routeConfig
  });
  callback(router);
  // 技术点：全局前置守卫 —— 根据 meta.name 同步浏览器标签页标题
  router.beforeEach((to, from, next) => {
    if (to.meta && to.meta.name) {
      document.title = `${to.meta.name} · 前端技术沉淀`;
    }
    next();
  });
}
