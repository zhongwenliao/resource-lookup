// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import generateRouter from './router.js'
import store from './store'
import ElementUI from 'element-ui'
import VueAMap from 'vue-amap'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false
Vue.config.silent = false

// 使用ElementUI组件
Vue.use(ElementUI)
// 使用高德地图
Vue.use(VueAMap)
generateRouter(store, router => {
  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    store,
    template: '<App/>',
    components: { App }
  })
})
// 初始化vue-amap
VueAMap.initAMapApiLoader({
  // 高德的key
  key: '01e9f6ae41473fc0512fda315db5571f',
  // 插件集合
  plugin: [
    'AMap.Autocomplete',
    'AMap.PlaceSearch',
    'AMap.Scale',
    'AMap.OverView',
    'AMap.ToolBar',
    'AMap.MapType',
    'AMap.PolyEditor',
    'AMap.CircleEditor',
    'AMap.DistrictSearch',
    'AMap.Object3DLayer'
  ],
  // 高德 sdk 版本，默认为 1.4.4
  v: '2.0'
})
