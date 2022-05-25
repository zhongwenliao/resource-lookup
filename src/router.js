import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);
const loadingLazy = (view) => () => import(/* webpackChunkName: "view-[request]" */ `@/components/${view}.vue`);

const routeConfig = [{
  path: '/',
  name: 'YouMayAlsoLike',
  component: loadingLazy('Other/YouMayAlsoLike'),
  meta: {
    name: '猜你喜欢',
    module: 'youMayAlsoLike',
    hideAslide: false
  }
}, {
  path: '/resourceVideo',
  name: 'ResourceVideo',
  component: loadingLazy('Resources/Index'),
  meta: {
    name: '视频资源',
    module: 'resourceVideo',
    hideAslide: false
  },
  children: [{
    path: 'movie',
    name: 'Movie',
    component: loadingLazy('Resources/Index'),
    meta: {
      name: '电影解析',
      module: 'resourceVideo',
      hideAslide: false
    }
  }, {
    path: 'variety',
    name: 'Variety',
    component: loadingLazy('Resources/Index'),
    meta: {
      name: '在线综艺',
      module: 'resourceVideo',
      hideAslide: false
    }
  }]
}, {
  path: '/resourceMusic',
  name: 'ResourceMusic',
  component: loadingLazy('Resources/Index'),
  meta: {
    name: '音乐资源',
    module: 'resourceMusic',
    hideAslide: false
  },
  children: [{
    path: 'movie',
    name: 'Movie',
    component: loadingLazy('Resources/Index'),
    meta: {
      name: '歌名',
      module: 'resourceMusic',
      hideAslide: false
    }
  }, {
    path: 'variety',
    name: 'Variety',
    component: loadingLazy('Resources/Index'),
    meta: {
      name: '歌词',
      module: 'resourceMusic',
      hideAslide: true
    }
  }]
}];

/**
 * 方案1: 递归取值法
 * 获取侧边栏数据
 * config 路由注册数据
 * configAslide 侧边栏数据
 */
const getAsideConfigTree = (i = []) => {
  const config = [];
  const configAslide = [];
  i.forEach(v => {
    if (!v.meta.hideAslide) {
      const tempConfigAslide = { ...v };
      if (v.children) {
        tempConfigAslide.children = [];
        const { configAslide } = getAsideConfigTree(v.children);
        tempConfigAslide.children.push(configAslide);
      }
      configAslide.push(tempConfigAslide);
    }
    config.push(v);
  });
  return {
    config,
    configAslide
  }
}

/**
 * 方案2：普通取值法
 * 获取侧边栏数据
 * config 路由注册数据
 * configAslide 侧边栏数据
 */
export const getAsideConfig = () => {
  const config = [];
  const configAslide = [];
  routeConfig.forEach(v => {
    if (!v.meta.hideAslide) {
      const tempConfigAslide = { ...v };
      if (v.children) {
        tempConfigAslide.children = [];
        v.children.forEach(sub => {
          if (!sub.meta.hideAslide) {
            tempConfigAslide.children.push(sub);
          }
        });
      }
      configAslide.push(tempConfigAslide);
    }
    config.push(v);
  });
  return {
    config,
    configAslide
  }
}

export default function generateRouter (store, callback) {
  const callRouter = (config) => {
    const router = new Router({
      routes: config
    });
    callback(router);
    router.beforeEach((to, from, next) => {
      next();
    });
  };
  const { config } = getAsideConfig();
  callRouter(config);
}
