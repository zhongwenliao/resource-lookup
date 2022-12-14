<template>
	<uni-base-page class="epidemic-prevention-register-page">
		<form class="content form-view">
			<view class="content-list">
				<view class="list-title">人员信息</view>
				<view class="list-item">
					<text class="require-text">*</text><text>姓名：</text>
					<input v-model="name" value="" placeholder="请输入人员姓名" />
				</view>
				<view class="list-item">
					<text class="require-text">*</text><text>联系电话： </text>
					<input v-model="phone" value="" placeholder="请输入联系电话" />
				</view>
				<view class="list-item">
					<text>证件类型：</text>
					<picker mode="selector" range-key="label" :range="idTypeList" @change="idTypeChange">
						<view class="xiala">
							<text>{{idTypeList[id_type].label}}</text>
							<image src="../../static/img/xiala.png"></image>
						</view>
					</picker>
				</view>
				<view class="list-item">
					<text class="require-text">*</text><text>证件号码：</text>
					<input :style="{backgroundColor: isCn ? '#EE6A50' : ''}" v-model="id_card" placeholder="请输入证件号码" type="text" />
				</view>
				<view class="list-item">
					<text>年龄：</text>
					<slider :value="age" min="0" step="1" max="120" show-value @change="ageChange" />
				</view>
				<view class="list-item">
					<text>性别： </text>
					<radio-group @change="sexChange">
						<label>
							<radio value="1" :checked="sex=='1'" /><text>男</text>
							<radio value="0" :checked="sex=='0'" /><text>女</text>
						</label>
					</radio-group>
				</view>
				<view class="list-item">
					<text>是否本地户籍： </text>
					<radio-group @change="nativeChange">
						<label>
							<radio value="1" /><text>是</text>
							<radio value="0" /><text>否</text>
						</label>
					</radio-group>
				</view>
			</view>
			<view class="content-list">
				<view class="list-title">到访信息</view>
				<view class="list-item">
					<text>本单位联系人：</text>
					<input v-model="access.name" placeholder="请输入联系人姓名" />
				</view>
				<view class="list-item">
					<text>联系人电话： </text>
					<input v-model="access.phone" placeholder="请输入联系电话" />
				</view>
				<view class="list-item">
					<text>到访事由：</text>
					<input v-model="access.comment" placeholder="请输入到访事由" />
				</view>
			</view>
			<view class="content-list">
				<view class="list-title">来源地信息</view>
				<view class="list-item">
					<text>是否来自湖北： </text>
					<radio-group @change="fromHbChange">
						<label>
							<radio value="1" /><text>是</text>
							<radio value="0" /><text>否</text>
						</label>
					</radio-group>
				</view>
				<view class="list-item">
					<text>是否来自武汉： </text>
					<radio-group @change="fromWhChange">
						<label>
							<radio value="1" /><text>是</text>
							<radio value="0" /><text>否</text>
						</label>
					</radio-group>
				</view>
				<view class="list-item">
					<text>来源地区：</text>
					<input @click="showCityPicker('from_address')" disabled="disabled" placeholder="请输入地址" :value="from_address.addressStr" />
				</view>
				<view class="list-item">
					<text>来源地详细地址： </text>
					<input v-model="from_address.street" placeholder="请输入地址" />
				</view>
				<view class="list-item">
					<text>出行方式：</text>
					<radio-group @change="trafficTypeChange">
						<label>
							<radio value="0" /><text>火车</text>
						</label>
						<label>
							<radio value="1" /><text>自驾</text>
						</label>
						<label>
							<radio value="2" /><text>汽车</text>
						</label>
						<label>
							<radio value="3" /><text>飞机</text>
						</label>
					</radio-group>
				</view>
				<view class="list-item" v-if="traffic.type>-1">
					<text>交通工具信息： </text>
					<input v-model="traffic.car_plate" placeholder="请务必输入正确的信息" />
				</view>
				<view class="list-item">
					<text>到访地区：</text>
					<input @click="showCityPicker('check_in_address')" disabled="disabled" placeholder="请输入地址" :value="check_in_address.addressStr" />
				</view>
				<view class="list-item">
					<text>到访地详细地址： </text>
					<input v-model="check_in_address.street" placeholder="请输入地址" />
				</view>
				<view class="list-item">
					<text>到达日期： </text>
					<uni-time-selector @change="timeOfArrivalChange">
						<button size="mini">{{check_in_time || '请选择日期'}}</button>
					</uni-time-selector>
					
				</view>
			</view>
			<view class="content-list">
				<view class="list-title">健康状况</view>
				<view class="list-item">
					<text>身体状况：</text>
					<radio-group @change="bodyStatusChange">
						<label>
							<radio value="0" /><text>正常</text>
						</label>
						<label>
							<radio value="1" /><text>居家隔离</text>
						</label>
						<label>
							<radio value="2" /><text>发烧</text>
						</label>
						<label>
							<radio value="3" /><text>疑似</text>
						</label>
						<label>
							<radio value="4" /><text>确诊</text>
						</label>
						<label>
							<radio value="5" /><text>死亡</text>
						</label>
					</radio-group>
				</view>
				<view class="list-item">其它症状： <checkbox-group @change="otherStatusChange" style="display: flex;flex-direction: row;flex-wrap:wrap">
						<label class="uni-list-cell uni-list-cell-pd" style="display: flex;flex-direction: row;margin-top:20upx;" v-for="item in items"
						 :key="item.value">
							<view style="margin-left:20upx;height:50upx;line-height: 50upx;">
								<checkbox :value="item.value" :checked="item.checked" />
							</view>
							<view style="display: flex;height:50upx;line-height: 50upx;">{{item.name}}</view>
						</label>
					</checkbox-group>
				</view>
				<view class="list-item">
					<text>记录时间：</text>
					<uni-time-selector @change="recordTimeChange">
						<button size="mini">{{bodyStatusDate||'请选择日期'}}</button>
					</uni-time-selector>
				</view>
				<view class="divider"></view>
				<view class="list-item">
					<text>体温：</text>
					<slider value="36.5" @change="temperatureChange" min="35" step="0.1" max="40" show-value />
				</view>
				<button @click="submit">提交信息</button>
			</view>
			<uni-city-picker ref="mpvueCityPicker" :pickerValueDefault="cityPickerValueDefault" @onConfirm="onCityConfirm"></uni-city-picker>
		</form>
	</uni-base-page>
</template>

<script>
	import uniTimeSelector from "../../components/uni-time-selector/uni-time-selector.vue";
	export default {
		components: {
			uniTimeSelector
		},
		data() {
			return {
				cityPickerValueDefault: [0, 0, 0],
				name: '',
				idTypeList: [{
					label: '身份证',
					value: 0
				}, {
					label: '护照',
					value: 1
				}],
				id_type: 0,
				id_card: '',
				isCn: false,
				age: 0,
				sex: 2,
				is_native: 2,
				phone: '',
				from_hb: 0,
				from_wh: 0,
				check_in_time: "",
				from_address: {
					addressStr: '',
					street: ''
				},
				otherStatus: [],
				items: [{
						value: "0",
						name: '咳嗽'
					},
					{
						value: "1",
						name: '头痛',
					},
					{
						value: "2",
						name: '乏力',
					},
					{
						value: "3",
						name: '呕吐',
					},
					{
						value: "4",
						name: '腹泄',
					},
					{
						value: "5",
						name: '昏迷',
					}
				],
				traffic: {
					type: -1
				},
				check_in_address: {
					addressStr: '',
					street: ''
				},
				checkInTimeStr: '',
				body_status: {
					status: 0,
					time: Date.now()
				},
				bodyStatusDate: '',
				bodyStatusTime: '',
				temperature: 36.5,
				contact_virus: {
					status: '',
					name: '',
					contact: ''
				},
				contact_like_virus: {
					status: '',
					name: '',
					contact: ''
				},
				contact_like_virus_region: {
					status: '',
					name: '',
					contact: ''
				},
				comment: '',
				operator_username: '',
				access: {
					name: '',
					phone: '',
					comment: ''
				}
			}
		},
		watch: {
			bodyStatusDate() {
				this.getBodyStatusTimeStamp()
			},
			bodyStatusTime() {
				this.getBodyStatusTimeStamp()
			},
			id_type() {
				this.parseIdCard()
			},
			id_card() {
				this.parseIdCard()
			},
		},
		onLoad(e) {
			this.operator_username = e.id
			if (this.operator_username) {
				uni.hideTabBar({
					animation: false
				})
			}
		},
		methods: {
			parseIdCard() {
				if (this.id_type == 0) {
					this.isCn = /[^\w\.\/]/.test(this.id_card)
					if (this.id_card.length == 18) {
						let year = parseInt(this.id_card.substr(6, 4));
						let mark = parseInt(this.id_card.substr(16, 1));
						if (!isNaN(year)) {
							this.age = new Date().getFullYear() - year;
						}
						if (!isNaN(mark)) {
							this.sex = mark
						}
						console.log(this.sex);
					}
				}
			},
			idTypeChange(e) {
				this.id_type = e.detail.value
			},
			ageChange(e) {
				this.age = e.detail.value
			},
			sexChange(e) {
				this.sex = e.detail.value
			},
			nativeChange(e) {
				this.is_native = e.detail.value;
			},
			fromHbChange(e) {
				this.from_hb = e.detail.value
			},
			fromWhChange(e) {
				this.from_wh = e.detail.value
			},
			trafficTypeChange(e) {
				this.traffic.type = e.detail.value
			},
			showCityPicker(segment) {
				this.tempPickerSegment = segment
				this.$refs.mpvueCityPicker.show();
			},
			onCityConfirm(e) {
				let addressParam = this[this.tempPickerSegment]
				addressParam.province = e.value[0]
				addressParam.city = e.value[1]
				addressParam.district = e.value[2]
				addressParam.addressStr = e.label
			},
			checkInTimeChange(e) {
				this.checkInTimeStr = e.detail.value;
			},
			timeOfArrivalChange(value) {
				this.check_in_time = value;
			},
			bodyStatusChange(e) {
				this.body_status.status = e.detail.value
			},
			bodyStatusDateChange(e) {
				this.bodyStatusDate = e.detail.value
			},
			bodyStatusTimeChange(e) {
				this.bodyStatusTime = e.detail.value
			},
			getBodyStatusTimeStamp() {
				if (this.bodyStatusDate && this.bodyStatusTime) {
					this.body_status.time = new Date(this.bodyStatusDate + ' ' + this.bodyStatusTime).getTime()
				} else {
					this.body_status.time = 0
				}
			},
			temperatureChange(e) {
				this.temperature = e.detail.value
			},
			contactVirusChange(e) {
				this.contact_virus.status = e.detail.value
			},
			contactLikeChange(e) {
				this.contact_like_virus.status = e.detail.value
			},
			otherStatusChange(e) {
				// console.log("e", e);
				this.otherStatus = e.detail.value;
			},
			recordTimeChange(value) {
				console.log(value);
				this.bodyStatusDate = value;
			},
			contactVirusRegionChange(e) {
				this.contact_like_virus_region.status = e.detail.value
			},
			submit() {
				var otherStatusStr = "";
				var _this = this;
				if (!this.name) {
					this.$showToast("请填写人员姓名");
					return false;
				}
				if (!this.phone) {
					this.$showToast("请填写人员手机号");
					return false;
				}
				if(!this.id_card) {
					this.$showToast("请填写人员证件号码");
					return false;
				}
				if(!this.$getPhoneReg().test(this.phone)) {
					this.$showToast("请填写正确的手机号");
					return false;
				}
				if(this.id_type == 0) {
					if(!this.$getIdentityNoReg().test(this.id_card)) {
						this.$showToast("请填写正确的证件号码");
						return false;
					}
				}
				var currentCommunity = this.$getUserInfo().currentCommunity;
				var communityId = currentCommunity !== undefined ? currentCommunity.id : 0;
				const {
					id_type,
					id_card,
					name,
					phone,
					age,
					sex,
					is_native,
					from_address,
					from_hb,
					from_wh,
					traffic,
					temperature,
					check_in_address,
					check_in_time,
					body_status,
					contact_virus,
					contact_like_virus,
					contact_like_virus_region,
					comment,
					operator_username,
					access
				} = this
				
				var is_danger = false;
				var accessToken = this.$getUserInfo().accessToken;
				this.$req.request({
					url: '/persDiseaseRegiste/app/add?token=' + accessToken,
					method: "POST",
					header: {
						"content-type": "application/json"
					},
					data: {
						is_danger,
						id_type,
						id_card,
						name,
						phone,
						age,
						sex,
						is_native,
						from_address,
						from_hb,
						from_wh,
						traffic,
						temperature,
						check_in_address,
						check_in_time,
						body_status,
						contact_virus,
						contact_like_virus,
						contact_like_virus_region,
						comment,
						"otherStatus": _this.otherStatus.join(","),
						communityId,
						operator_username,
						access
					},
					success: (res) => {
						_this.$showToast("信息上传完成，请勿重复提交");
					}
				});
			}
		}
	}
</script>

<style lang="scss">
	.epidemic-prevention-register-page {
		width: 100%;
		background: #f0f0f0;
		.content {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			margin-bottom: 50upx;
			.content-list {
				display: flex;
				flex-direction: column;
				width: 680upx;
				margin: auto;
				margin-top: 20upx;
				background: #ffffff;
				border-radius: 20upx;
				padding-bottom: 20upx;
				.list-title {
					width: 580upx;
					padding: 20upx;
					display: flex;
					font-size: 40upx;
					font-weight: bold;
					border-bottom: #f0f0f0 1upx solid;
					margin: auto;
					margin-bottom: 20upx;
				
				}
				.list-item {
					width: 580upx;
					padding: 20upx;
					display: flex;
					margin: auto;
					font-size: 30upx;
					align-items: center;
					& >	text {
						white-space: nowrap;
					}
					input {
						background: #f0f0f0;
						border-radius: 10upx;
						padding-left: 20upx;
						padding-right: 20upx;
						width: 300upx;
						height: 60upx;
						color: #999999;
						font-size: 30upx;
					}
					slider {
						width: 300upx;
					}
					picker {
						margin-right: 10px;
						button {
							vertical-align: middle;
						}
					}
					label {
						display: inline-block;
						margin: 5px 0px;
						text {
							margin-right: 10px;
						}
					}
					textarea {
						border-radius: 5px;
						background-color: #F8F8F8;
						padding: 10px;
					}
					.xiala {
						display: flex;
						background: #f0f0f0;
						padding: 10rpx;
						border-radius: 10rpx;
						color: #999999;
						font-size: 30rpx;
						image {
							display: flex;
							padding-top: 5rpx;
							width: 30rpx;
							height: 30rpx;
							margin-left: 10rpx;
						
						}
					}
					.uni-list-cell::after {
						height: 0;
					}
				}
			}
		}
	}
</style>
