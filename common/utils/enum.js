import api from '@/common/request/index'
import store from '@/common/store/index.js'

const _enum = {
	// 获取行业信息
	industryEnum: async (callback) => {
		await api('industry').then(res => {
			callback(res.data)
		}).catch(e => {
			console.log(e);
		})
	},
	// 根据省市获取园区列表
	getByCity: (callback,data) => {
		let params;
		if(!data){
			params = {
				province: uni.getStorageSync('location').province || '广东省',
				city: uni.getStorageSync('location').city || '深圳市'
			}
		}else{
			params = data
		}

		api('getByCity', params).then(res => {
			callback(res.data)
		}).catch(e => {
			console.log(e);
		})
	},
	// 地址枚举
	addressEnum: (params, callback) => {
		api('address', params).then(res => {
			callback(res.data)
		}).catch(e => {
			console.log(e);
		})
	},
	// 获取楼栋楼层枚举
	buildfloorEnum: (data, callback) => {
		let params;
		if(data.zoneId){
			params = data
		}else{
			params = {
				zoneId: uni.getStorageSync('zoneInfo').id
			}
		}
		api('zoneInfo.buildfloorList', params).then(res => {
			callback(res.data)
		}).catch(e => {
			console.log(e);
		})
	},
	// 装修状态
	decorationStatus: [{
			value: 0,
			label: '毛坯'
		},
		{
			value: 1,
			label: '简单装修'
		},
		{
			value: 2,
			label: '精装修'
		},
		{
			value: 3,
			label: '豪华装修'
		}
	],
	// 是否含税
	isIncludeTax: [{
			value: 0,
			label: '不含税'
		},
		{
			value: 1,
			label: '含税'
		}
	],
	// 合同状态
	contractStatus: [{
			value: 0,
			label: '正常',
			bgColor: '#5182ef',
			color: '#5182ef'
		},
		{
			value: 1,
			label: '临期',
			bgColor: '#f66c19',
			color: '#f66c19'
		},
		{
			value: 2,
			label: '到期',
			bgColor: '#ea3f25',
			color: '#ea3f25'
		},
		{
			value: 3,
			label: '不再续签',
			bgColor: '#CCCCCC',
			color: '#666666'
		},
		{
			value: 4,
			label: '草稿',
			bgColor: '#ea3f25',
			color: '#666666'
		}
	],
	// 房间类型
	roomType: [{
			value: 0,
			label: '办公'
		},
		{
			value: 1,
			label: '商铺'
		},
		{
			value: 2,
			label: '会议室'
		},
		{
			value: 3,
			label: '其他'
		},
		{
			value: 4,
			label: '厂房'
		},
		{
			value: 5,
			label: '宿舍'
		},
		{
			value: 6,
			label: '公共区域'
		},
		{
			value: 7,
			label: '服务配套'
		}
	],
	// 会议室状态
	meetingStatus: [{
			value: 0,
			label: '已满'
		},
		{
			value: 1,
			label: '未满'
		}
	]
}

export default _enum