import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
const loadingLazy = view => () => import(/* webpackChunkName: "view-[request]" */ `@/components/${view}.vue`)

const routeConfig = [
  {
    path: '/',
    name: 'YouMayAlsoLike',
    component: loadingLazy('Other/YouMayAlsoLike'),
    meta: {
      name: '猜你喜欢',
      title: '猜你喜欢',
      module: 'youMayAlsoLike',
      hideAslide: false
    }
  },
  {
    path: '/resourceVideo',
    name: 'ResourceVideo',
    component: loadingLazy('Resources/Index'),
    meta: {
      name: '视频资源',
      title: '视频资源',
      module: 'resourceVideo',
      hideAslide: false
    },
    children: [
      {
        path: 'movie',
        name: 'Movie',
        component: loadingLazy('Resources/Index'),
        meta: {
          name: '电影解析',
          title: '电影解析',
          module: 'resourceVideo',
          hideAslide: false
        }
      },
      {
        path: 'variety',
        name: 'Variety',
        component: loadingLazy('Resources/Index'),
        meta: {
          name: '在线综艺',
          title: '在线综艺',
          module: 'resourceVideo',
          hideAslide: false
        }
      },
      {
        path: 'panorama',
        name: 'Panorama',
        component: loadingLazy('Resources/Panorama'),
        meta: {
          name: '360全景图',
          title: '360全景图',
          module: 'resourceVideo',
          hideAslide: false
        }
      },
      {
        path: 'heatMap',
        name: 'HeatMap',
        component: loadingLazy('Resources/HeatMap'),
        meta: {
          name: '热力图',
          title: '热力图-深圳市温度变化实况',
          module: 'resourceVideo',
          hideAslide: false
        }
      },
      {
        path: 'goldMap',
        name: 'GoldMap',
        component: loadingLazy('Resources/GoldMap'),
        meta: {
          name: '高德地图',
          title: '高德测试',
          module: 'resourceVideo',
          hideAslide: false
        }
      },
      {
        path: 'testMap',
        name: 'TestMap',
        component: loadingLazy('Resources/TestMap'),
        meta: {
          name: '高德测试',
          title: '最基本的启动测试',
          module: 'resourceVideo',
          hideAslide: false
        }
      },
      {
        path: 'QrCode',
        name: 'QRCode',
        component: loadingLazy('Resources/QRCode'),
        meta: {
          name: '生成二维码测试',
          title: '二维码测试',
          module: 'resourceVideo',
          hideAslide: false
        }
      }
    ]
  },
  {
    path: '/resourceMusic',
    name: 'ResourceMusic',
    component: loadingLazy('Resources/Index'),
    meta: {
      name: '音乐资源',
      title: '音乐资源',
      module: 'resourceMusic',
      hideAslide: false
    },
    children: [
      {
        path: 'songName',
        name: 'SongName',
        component: loadingLazy('Resources/Index'),
        meta: {
          name: '歌名',
          title: '歌名',
          module: 'resourceMusic',
          hideAslide: false
        }
      },
      {
        path: 'songWord',
        name: 'SongWord',
        component: loadingLazy('Resources/Index'),
        meta: {
          name: '歌词',
          title: '歌词',
          module: 'resourceMusic',
          hideAslide: true
        }
      }
    ]
  }
]

/**
 * 方案1: 递归取值法
 * 获取侧边栏数据
 * config 路由注册数据
 * configAslide 侧边栏数据
 */
const getAsideConfigTree = (i = []) => {
  const config = []
  const configAslide = []
  i.forEach(v => {
    if (!v.meta.hideAslide) {
      const tempConfigAslide = { ...v }
      if (v.children) {
        tempConfigAslide.children = []
        const { configAslide } = getAsideConfigTree(v.children)
        tempConfigAslide.children.push(configAslide)
      }
      configAslide.push(tempConfigAslide)
    }
    config.push(v)
  })
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
  const config = []
  const configAslide = []
  routeConfig.forEach(v => {
    if (!v.meta.hideAslide) {
      const tempConfigAslide = { ...v }
      if (v.children) {
        tempConfigAslide.children = []
        v.children.forEach(sub => {
          if (!sub.meta.hideAslide) {
            tempConfigAslide.children.push(sub)
          }
        })
      }
      configAslide.push(tempConfigAslide)
    }
    config.push(v)
  })
  return {
    config,
    configAslide
  }
}

export default function generateRouter(store, callback) {
  const callRouter = config => {
    const router = new Router({
      routes: config
    })
    callback(router)
    // 这里做路由守卫，既权限控制
    router.beforeEach((to, from, next) => {
      next()
    })
  }
  const { config } = getAsideConfig()
  callRouter(config)
}
