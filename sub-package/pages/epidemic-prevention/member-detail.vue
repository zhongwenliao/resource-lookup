<template>
	<uni-base-page class="epidemic-prevention-member-detail-page">
		<view v-if="showxg==0">参数传递错误</view>
		<view class="member-detail" v-if="showxq != 0">
			<view class="member-detail-list">
				<view class="items">最后更新：{{ryinfo.create_time|formatTime}}</view>
			</view>
			<view class="member-detail-title">人员信息</view>
			<view class="member-detail-list">
				<view class="items">姓名：{{ryinfo['name']}}</view>
				<view class="items">性别：{{ryinfo.sex|sex}}</view>
				<view class="items">是否本地户籍：{{ryinfo.is_native | boolean}}</view>
				<view class="items">年龄：{{ryinfo.age|age}}</view>
				<view class="items">证件类型：{{ryinfo.id_type|idType}}</view>
				<view class="items">证件号码：{{ryinfo.id_card||'未知'}}</view>
				<view class="items">联系电话：{{ryinfo.phone}}</view>
			</view>
			<view class="member-detail-title">到访信息</view>
			<view class="member-detail-list">
				<view class="items">本单位联系人：{{ryinfo.access.name||'无'}}</view>
				<view class="items">联系人电话：{{ryinfo.access.phone||'无'}}</view>
				<view class="items">到访事由：{{ryinfo.access.comment||'无'}}</view>
			</view>
			<view class="member-detail-title">来源地信息</view>
			<view class="member-detail-list">
				<view class="items">是否来自武汉：{{ryinfo.from_wh|boolean}}</view>
				<view class="items">是否来自湖北：{{ryinfo.from_hb|boolean}}</view>
				<view class="items">出行方式：{{ryinfo.traffic.type|trafficType}}</view>
				<view class="items">车牌或列车号：{{ryinfo.traffic.car_plate||'未知'}}</view>
				<view class="items">来源：{{ryinfo.from_address|addres}}</view>
				<view class="items">现居：{{ryinfo.check_in_address|addres}}</view>
			</view>
			<view class="member-detail-title">健康状况</view>
			<view class="member-detail-list">
				<view class="items">体温：{{ryinfo.temperature}}</view>
			</view>
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				ryinfo: {
					body_status: {},
					traffic: {},
					contact_virus: {},
					contact_like_virus: {},
					contact_like_virus_region: {},
					access: {}
				},
				showxg: 1,
				showxq: 1
			}
		},
		filters: {
			age(val) {
				return val ? `${val}岁` : '未知'
			},
			idType(val) {
				return (['身份证', '护照'])[val] || '未知'
			},
			boolean(val) {
				return (['否', '是'])[val] || '未知'
			},
			trafficType(val) {
				return (['火车', '自驾', '汽车', '飞机'])[val] || '未知'
			},
			bodyStatus(val) {
				return (['普通', '居家隔离', '发烧', '疑似', '确诊', '死亡'])[val] || '未知'
			},
			addres(val) {
				return (typeof val === 'object' ? val.street : val) || '未知'
			},
			formatTime(val) {
				if (!val) {
					return '无'
				}
				const date = new Date(val)
				return `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日 ${date.getHours()}时${date.getMinutes()}分${date.getSeconds()}秒`
			},
			sex(val) {
				return (['女', '男'])[val] || '未知'
			}
		},
		onLoad({item} = {}) {
			const ryinfo = Object.assign(this.ryinfo, JSON.parse(decodeURIComponent(item)));
		},
		methods: {
			
		}
	}
</script>

<style lang="scss">
	.epidemic-prevention-member-detail-page {
		width: 100%;
		background: #f0f0f0;
		.member-detail {
			display: flex;
			width: 750upx;
			height: 100%;
			background: #ffffff;
			margin-top: 0upx;
			flex-direction: column;
			overflow: auto;
			.member-detail-title {
				padding: 20upx;
				border-bottom: #cccccc 2upx solid;
				font-size: 36upx;
			}
			.member-detail-list {
				flex-direction: row;
				font-size: 30upx;
				line-height: 60upx;
				flex-wrap: wrap;
				margin-top: 20upx;
				height: auto;
				margin-bottom: 20upx;
				.items {
					float: left;
					overflow: hidden;
					background: #efefef;
					height: 50upx;
					line-height: 50upx;
					margin: 20upx 20upx 0upx 20upx;
					padding: 5upx 15upx 5upx 15upx;
					border-radius: 20upx;
				}
			}
		}
	}
</style>
