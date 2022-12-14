import Request from './request'
import apiList from './api'
import store from '@/common/store/index.js'
import {
	API_URL
} from '@/env'
async function doRequest(error) {
	try {
		const data = await getNewToken();
		if (data[1].data.code == 200) {
			store.commit('TOKEN_INFO', data[1].data.access_token);
			uni.setStorageSync('tokenInfo', data[1].data.access_token);
			uni.setStorageSync('refreshToken', data[1].data.refresh_token);
			error.config.url = Request.posUrl(error.config.url) ? error.config.url : (error.config.baseUrl + error
				.config.url)
			error.config.header.Authorization = 'Bearer ' + data[1].data.access_token;
			delete error.config.complete
			const res = await uni.request(error.config)
			if (res[1]) {
				return res[1];
			} else {
				throw ('暂未登录,已阻止此次API请求~');
			}

		} else {
			throw ('暂未登录,已阻止此次API请求~');
		}

	} catch (err) {
		uni.removeStorageSync('tokenInfo');
		uni.showToast({
			title: '登录会话已过期，请重新登录',
			icon: 'none',
			duration: 1000,
			mask: true,
		});
		setTimeout(function() {
			uni.redirectTo({
				url: "/pages/login/login"
			})
		}, 1000);


	}
}

async function getNewToken() {
	var refreshToken = uni.getStorageSync('refreshToken')
	return await uni.request({
		method: 'post',
		header: {
			'content-type': 'application/x-www-form-urlencoded'
		},
		data: {
			client_id: 'client_user',
			client_secret: 'secret',
			grant_type: 'refresh_token',
			refresh_token: refreshToken
		},
		url: API_URL + '/auth/oauth/token',
	})
}
// 第一个参数为api名称以点分割，第二个参数为需要携带给后端的参数，第三个参数为接口返回code不为200时是否需要报错提示
export default function api(url, data = {}, showToast) {
	const request = new Request();
	let api = getApiObj(url);
	request.interceptor.request((config, cancel) => {
		/* 请求之前拦截器 */
		// uni.showLoading({
		// 	title: '加载中'
		// });
		let tokenFlag = !empty(uni.getStorageSync('tokenInfo'));
		if (!api.auth && !tokenFlag) {
			store.commit('OUT_LOGIN');
			console.log('暂未登录,已阻止此次API请求~');
			throw ('暂未登录,已阻止此次API请求~');
		}
		if (!api.noZoneId) {
			data.zoneId = uni.getStorageSync('zoneInfo').id
		}
		if (api.header) {
			config.header = api.header
		}
		if (!api.auth) {
			config.header.Authorization = 'Bearer ' + store.state.user.tokenInfo;
		}
		return config
	});

	request.interceptor.response(async (response) => {
		// console.log(response);
		/* 请求之后拦截器 */
		uni.hideLoading();
		if (response.data.code === 401) { // 服务端返回的状态码不等于200，则reject()
			//401代表token失效
			let data = await doRequest(response)
			return data
		} else if (response.data.code === 200) {
			
			return response
		} else {
			if (response.data.msg ) {
				if(showToast!=undefined){
					if(showToast===true){
						uni.showToast({
							title: response.data.msg || '请求出错,稍后重试',
							icon: 'none',
							duration: 1500,
							mask: true
						});
					}
				}else{
					uni.showToast({
						title: response.data.msg || '请求出错,稍后重试',
						icon: 'none',
						duration: 1500,
						mask: true
					});
				}
				
			}
			return response

		}



	}, (response) => { // 预留可以日志上报
		uni.hideLoading();
		uni.showToast({
			title: response.data.msg || '请求出错,稍后重试',
			icon: 'none',
			duration: 500,
			mask: true
		});
		return response
	})
	return request.request({
		url: api.url,
		data,
		method: api.method
	})

}

function getApiObj(url) {
	let apiArray = url.split(".");
	let api = apiList;
	apiArray.forEach(v => {
		api = api[v];
	});
	return api;
}

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
