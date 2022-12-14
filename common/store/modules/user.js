// 用户数据模块
import api from '@/common/request/index'
import store from '@/common/store'
import router from '@/common/router.js'
import tools from '@/common/utils/tools'
import {
	USER_INFO,
	TOKEN_INFO,
	OUT_LOGIN,
} from '../types.js'

function empty(value) {
	switch (typeof value) {
		case 'undefined':
			return true;
		case 'string':
			if (value.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length == 0) return true;
			break;
		case 'boolean':
			if (!value) return true;
			break;
		case 'number':
			if (0 === value || isNaN(value)) return true;
			break;
		case 'object':
			if (null === value || value.length === 0) return true;
			for (var i in value) {
				return false;
			}
			return true;
	}
	return false;
}
const state = {
	userInfo: uni.getStorageSync('userInfo') ? uni.getStorageSync('userInfo') : {},
	tokenInfo: uni.getStorageSync('tokenInfo') ? uni.getStorageSync('tokenInfo') : {},
	refreshToken: uni.getStorageSync('refreshToken') ? uni.getStorageSync('refreshToken') : '',
	showLoginTip: false,

}

const actions = {
	//设置token 获取个人信息 并返回上次页面
	setTokenAndBack({
		commit,
		state
	}, {
		data,
		username
	}) {
		uni.setStorageSync('tokenInfo', data.access_token);
		uni.setStorageSync('refreshToken', data.refresh_token);
		commit('TOKEN_INFO', data.access_token);
		store.dispatch('getUserInfo').then(() => {
			router.replaceAll('/pages/index/index')
		}).catch(e => {
			commit('OUT_LOGIN');
			uni.hideLoading();
			// reject(e)
		});
	},

	// 获取用户信息
	getUserInfo({
		commit
	}, username) {
		return new Promise((resolve, reject) => {
			api('user.userInfo').then(res => {
				if (res.code != 200) {
					reject(res)
				} else {
					commit('USER_INFO', res.data);
					uni.setStorageSync('userInfo', res.data);
					if(res.data.zoneId!=0){
						uni.setStorageSync('zoneInfo', res.data.zone);
					}
					uni.hideLoading();
					resolve(res)
				}
			}).catch(e => {
				commit('OUT_LOGIN');
				reject(e)
			})
		})
	},

}

const mutations = {

	[USER_INFO](state, data) {
		state.userInfo = data
	},
	[TOKEN_INFO](state, data) {
		state.tokenInfo = data
	},
	[OUT_LOGIN](state, data) {
		uni.removeStorageSync('tokenInfo');
		uni.removeStorageSync('refreshToken');
		uni.removeStorageSync('userInfo');
		uni.removeStorageSync('zoneInfo');
		store.commit('USER_INFO', {});
		store.commit('TOKEN_INFO', {});
	},

}

const getters = {
	loginFlag: state => {
		return !empty(state.tokenInfo)
	},
}

export default {
	state,
	mutations,
	actions,
	getters
}
