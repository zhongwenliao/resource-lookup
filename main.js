import Vue from 'vue'
import App from './App'
import router from '@/common/router'
import store from '@/common/store'
import common from './common/dev-manage/index.js';
import tools from '@/common/utils/tools'
import uView from "uview-ui";
import $enum from '@/common/utils/enum'
import i18n from './lang/index.js';
// import dayjs from 'dayjs';
// import 'dayjs/locale/zh-cn'

import {
	RouterMount
} from 'uni-simple-router'
import api from '@/common/request/index'

import {
	blueToothOpenDoor,
	initPermission,
	blueToothScanDevice
} from '@/common/utils/sdk-util.js'
import Page from './components/page.vue';
import UniBasePage from '@/components/uni-base-page/uni-base-page.vue';

Vue.component("uni-base-page", UniBasePage);
Vue.component('page', Page)
Vue.prototype.$store = store;
Vue.prototype.$api = api;
Vue.prototype.$enum = $enum;
Vue.prototype.$tools = tools;
Vue.prototype._i18n = i18n;
// Vue.prototype.$dayjs = dayjs;
Vue.prototype.blueToothOpenDoor = blueToothOpenDoor;
Vue.prototype.blueToothScanDevice = blueToothScanDevice;

// dayjs.locale('zh-cn');




Vue.config.productionTip = false

App.mpType = 'app'

Vue.use(uView);

// 权限控制组件的显示，这里只做一个权限是否存在的判断返回true or false
const role = (value) => {
	// 从缓存中拿取后端返回的权限列表
	const roles = uni.getStorageSync('userInfo').authority || ['admin']
	if (value && value.length > 0) {
		const permissionRoles = value
		const hasPermission = roles.some(role => {
			return permissionRoles.includes(role)
		})
		return hasPermission
	} else {
		throw new Error(`need roles! Like v-if="$permission(['admin','ceshi'])"`)
	}
}

/**
 *  @fn  过滤器，用于枚举数据回显，挂载在Array的原型链上
 * 	@param {*} arr 需要查询的数组
 * 	@param {*} value 需要查询的数据
 * 	@param {*} callback 查询规则,非必传，主要用于扩展查询
 *  @return {obj} obj 返回查询出的对应的第一条数据
 */
Vue.prototype.enumFilter = function(arr, value, callback) {
	let data;
	if (value === undefined || value === null || value === '') {
		return ''
	}
	// 这里只做了对enum数组第一项的类型判断，还是会存在误判的情况
	if (typeof arr[0] === 'object' && arr[0].hasOwnProperty('value') && arr[0].hasOwnProperty('label')) {
		data = arr.filter((item) => {
			if (callback) {
				return callback(item)
			} else {
				return item.value == value
			}
		})
		return data[0];
	} else {
		throw ('非enum数据不可使用该原型方法')
	}

}

Vue.prototype.$permission = role;

Vue.prototype.preAvatar = function(img) {
	wx.previewImage({
		current: '', // 当前显示图片的 http 链接
		urls: [img] // 需要预览的图片 http 链接列表
	})
}

const app = new Vue({
    store,
    ...App
})

//v1.3.5起 H5端 你应该去除原有的app.$mount();使用路由自带的渲染方式
// #ifdef H5
	RouterMount(app,'#app');
// #endif

// #ifndef H5
	app.$mount(); //为了兼容小程序及app端必须这样写才有效果
// #endif