<template>
	<view>
		<view class="parking_mian">
			<view class="title">停车缴费</view>
			<!--主体部分-->
			<view class="parkingCenter">
				<!-- 车牌输入框 -->
				<ul class="LicensePlate">
					<li v-for="(item, i) in inpuiList" :key="i">
						<input
							readonly
							class="border-input"
							v-model="item.name"
							input-align="center"
							maxlength="1"
							:ref="item.ref"
							@keyup="nextFocus($event, i)"
							:placeholder="item.placeholder"
							@focus="inputFocus(item, i)"
							@keydown="changeValue(i)"
						/>
					</li>
				</ul>
				<!-- 车牌输入框 end-->

				<p class="oldplateBox">
					历史缴费车辆：
					<span v-text="old_plate" @click="oldText"></span>
				</p>
				<button :color="plate.length <= 6 ? '#848484' : '#59A694'" :disabled="plateDisabled" @click="searchParkingInfo">查询缴费</button>
				<!-- <p class="bill" v-if="isInvoice" @click="goToBill">我要发票</p> -->
			</view>
			<!--主体 end -->

			<view class="parkingBottom">
				<p>温馨提示:</p>
				<p>1.若因特殊原因无法查询车辆信息,请至人工收费处进行处理；</p>
				<p>2.查询缴费前请仔细核对停车场、车牌号;</p>
				<p>3.若无法加载页面,请检查网络是否畅通或耐心等待、重新加载页面。</p>
			</view>
		</view>
		<!--车牌软键盘组件-->
		<keyword :isShow="keyState" @exit="exit" @inputchange="getKey" @ok="confirm" :rjpNumber="rjpNumber" />
		<!--车牌软键盘组件 end-->
	</view>
</template>

<script>
// window.onload = function() {
// 	document.addEventListener('touchstart', function(event) {
// 		if (event.touches.length > 1) {
// 			event.preventDefault();
// 		}
// 	});
// 	document.addEventListener('gesturestart', function(event) {
// 		event.preventDefault();
// 	});
// };
import keyword from './components/keyword'; //引入软键盘组件

export default {
	name: 'logout',
	//注册软键盘组件
	components: {
		keyword
	},
	data() {
		return {
			//车牌输入框数组对象
			inpuiList: [
				{
					name: '',
					id: 1,
					val: '',
					ref: 'a',
					focus: true,
					placeholder: ''
				},
				{
					name: '',
					id: 2,
					val: '',
					ref: 'b',
					focus: false,
					placeholder: ''
				},
				{
					name: '',
					id: 3,
					val: '',
					focus: false,
					ref: 'c',
					placeholder: ''
				},
				{
					name: '',
					id: 4,
					val: '',
					ref: 'd',
					focus: false,
					placeholder: ''
				},
				{
					name: '',
					id: 5,
					val: '',
					focus: false,
					ref: 'e',
					placeholder: ''
				},
				{
					name: '',
					id: 6,
					val: '',
					focus: false,
					ref: 'f',
					placeholder: ''
				},
				{
					name: '',
					id: 7,
					val: '',
					ref: 'g',
					focus: false,
					placeholder: ''
				},
				{
					name: '',
					id: 8,
					val: '',
					ref: 'h',
					focus: false,
					placeholder: '新'
				}
			],
			valueArr: [],
			focusIndex: null,
			loadingText:'正在跳转中...',
			plate: '', //拼接后的车牌
			old_plate: '', //历史缴费车辆
			plateDisabled: true, //缴费按钮 控制是否禁用 当车牌输入后变更为false
			keyState: false, //软键盘是否打开
			str: '',
			old_id: '', //当前点击的输入框的id值
			communityId: '', //小区id
			onLine: navigator.onLine, //当前网络是否在线
			//获取微信授权
			appid: '',
			redirect_url: '', //重定向路径
			old_inpuiList: '',
			rjpNumber: '', //软键盘接受判断转中英
			parkset: "",
			// isInvoice: false,
		};
	},
	//创建前
	created() {
		// this.parkset = JSON.parse(sessionStorage.getItem("parkset")); //停车场设置
		// if (this.parkset.isInvoice != null && this.parkset.isInvoice != undefined) {
		// 	this.isInvoice = this.parkset.isInvoice
		// }
		// this.old_plate = sessionStorage.getItem('old_plate'); //历史输入车牌
		// this.urlData = JSON.parse(sessionStorage.getItem('urlData'));
		// this.communityId = this.urlData.communityId;
		// 停车缴费H5页面
		let url = process.env.VUE_APP_H5_WEB_HOST + '/#/park/payByParkInfo';
		this.redirect_url = encodeURIComponent(url); //重定向路径
		// scene是2为设备码  scene是1为场内码
		// if(this.urlData.scene == 2) {
		// 	this.searchParkingInfoByDeviceId();
		// }
	},
	mounted() {
		window.addEventListener('offline', this.updateOnlineStatus); //监听当前网络事件
	},
	beforeDestroy() {
		window.removeEventListener('offline', this.updateOnlineStatus); //销毁当前网络事件
	},
	methods: {
		oldText() {
			console.log(this.old_inpuiList, this.inpuiList);
			if (this.old_plate !== '') {
				this.plate = this.old_plate;
			}
			this.old_inpuiList = JSON.parse(sessionStorage.getItem('old_inpuiList'));
			if (this.old_inpuiList !== null) {
				this.inpuiList = this.old_inpuiList;
			}
		},
		//判断网络是否在线
		updateOnlineStatus(e) {
			const { type } = e;
			this.onLine = type === 'online';
			this.$router.push('/park/networkError');
		},
		exit() {
			this.keyState = false; //关闭软键盘
		},
		getKey(val, type) {

			this.valueArr = this.valueArr || [];
			if (val == 'delete') {
				// 要删除的角标
				let index = null;
				// 要聚焦的角标
				let focusIndex = null;
				if (this.inpuiList[this.focusIndex].name) {
					console.log('删除当前的');
					if (this.focusIndex !== 0) {
						focusIndex = this.focusIndex - 2;
					} else {
						// this.nextFocus({}, this.focusIndex);
						focusIndex = 0;
					}
					index = this.focusIndex;
				} else if (this.focusIndex === 1) {
					focusIndex = -1;
					index = 0;
				} else {
					// console.log('删除上一个');
					focusIndex = this.focusIndex - 2;
					index = this.focusIndex - 1;
				}
				// console.log(index)
				if (index >= 0) {
					this.inpuiList[index].name = '';
					this.inpuiList.splice(index, 1, this.inpuiList[index]);
					this.nextFocus({}, focusIndex);
				} else {
					this.nextFocus({}, -1);
				}
			} else {
				// this.valueArr.push(val);
				// console.log(this.str);
				this.inpuiList[this.focusIndex].name = val;
				this.nextFocus({}, this.focusIndex);
				//根据点击输入框的id值赋值}
			}
			//拼接车牌
			this.plate =
				this.inpuiList[0].name +
				this.inpuiList[1].name +
				this.inpuiList[2].name +
				this.inpuiList[3].name +
				this.inpuiList[4].name +
				this.inpuiList[5].name +
				this.inpuiList[6].name +
				this.inpuiList[7].name;
		},
		//软键盘 点击确定
		confirm(e) {
			var _this = this; //定义this指向

			if (_this.plate.length >= 7) {
				_this.keyState = false;
				_this.searchParkingInfo();
			} else {
				_this.keyState = false;
			}
		},
		//点击输入框时弹出软键盘 获取焦点
		inputFocus(item, i) {
			this.focusIndex = i; // 点击输入框赋值 的角标
			this.old_id = item.id; //获取到当前位置的id 根据id赋值
			this.keyState = true; //点击输入框后 打开车牌软键盘
		},
		//输入框输入完了自动聚焦到下一个输入框  键盘事件
		nextFocus(el, index) {
			console.log(111,el,index)
			/*这里的keyCode 根据不同的平台或许不同,安卓就是不是8*/
			if (el.keyCode !== 8) {
				if (index === -1) {
					this.$refs[this.inpuiList[index + 1].ref][0].focus();
					return;
				}
				if (index < this.inpuiList.length - 1) {
					this.$refs[this.inpuiList[index].ref][0].blur();
					this.$refs[this.inpuiList[index + 1].ref][0].focus();
				} else {
					this.$refs[this.inpuiList[index].ref][0].blur();
				}
			} else {
				if (index !== 0) {
					this.$refs[this.inpuiList[index - 1].ref][0].focus();
					// lastInput.focus();
				} else {
				}
			}
		},
		//输入框重新输入覆盖之前的输入数据
		changeValue(index) {
			this.inpuiList[index].name = '';
		},
		//根据车牌查询缴费
		// searchParkingInfoByDeviceId(){
		// 	var _this = this;
		// 	post('/parkInfo/h5/getCarOutParkInfoByDeviceId', {
		// 				accessToken: '', //访问令牌
		// 				accessCommunityId: '', //访问小区ID
		// 				communityId: this.communityId, //	小区Id
		// 				deviceId: this.urlData.deviceId //设备号
		// 			})
		// 			.then(res => {
		// 				if (res.data.code == 0) {
		// 					_this.handleCarOutParkInfo(res.data.data);
		// 					sessionStorage.setItem('old_inpuiList', JSON.stringify(_this.inpuiList));
		// 					sessionStorage.setItem('old_plate', _this.plate);
		// 				}
		// 			});
		// },
		// searchParkingInfo() {
		// 	var _this = this;
		// 	//调用停车信息接口 获取停车信息
		// 	this.$http
		// 		.post('/parkInfo/h5/getCarOutParkInfoByCarNo', {
		// 			accessToken: '', //访问令牌
		// 			accessCommunityId: '', //访问小区ID
		// 			communityId: _this.communityId, //	小区Id
		// 			carNo: _this.plate, //车牌号
		// 			couponIds: ""
		// 		})
		// 		.then(res => {
		// 			if (res.data.code == 0) {
		// 				_this.handleCarOutParkInfo(res.data.data);
		// 				sessionStorage.setItem('old_inpuiList', JSON.stringify(_this.inpuiList));
		// 				sessionStorage.setItem('old_plate', _this.plate);
		// 			}
		// 		});
		// },
		handleCarOutParkInfo(parkInfo){
			sessionStorage.setItem('getCarOut', JSON.stringify(parkInfo));
			console.log(parkInfo);
			if (parkInfo.businessCode == 22001) {
				this.$router.push('/park/noCarInParkBusiness'); //无在场记录页面
			} else if (parkInfo.businessCode == 21003) {
				this.$router.push('/park/monthcardBusiness'); //月卡免费停车页面
			} else {
				//缴费详情页面
				sessionStorage.setItem('tokenToPageRouter', "/park/payByParkInfo");
				this.$router.push("/park/prePayByParkInfo");
			}
		},
		goToBill(){
			//我要发票页面
			sessionStorage.setItem('tokenToPageRouter', "/pay/wantBill");
			this.$router.push("/park/prePayByParkInfo");
		}
	},

	watch: {
		//监听车牌号是否输入完整
		plate: function(newVal, oldVal) {
			//判断第一个空是否有值, 为空的话转中文否则转英文
			if (this.inpuiList[0].name == '') {
				this.rjpNumber = 1;
			} else {
				this.rjpNumber = 2;
			}
			//车牌大于或者等于7为输入完整 关闭禁用
			if (newVal.length >= 7) {
				this.plateDisabled = false;
			} else {
				this.plateDisabled = true;
			}
		}
	}
};
</script>

<style lang="scss">
.van-loading {
	margin: auto;
}
.head {
	/* display: flex; */
	height: 80%;
}
.parking_mian {
	padding: 0px 30upx;
	margin-top: 30upx;
}

.parking_mian .van-password-input {
	margin: 0px;
}

.parkingCenter {
	margin-bottom: 8%;
}

.parking_mian .head {
	padding: 10% 0px;
	display: flex;
}
.parking_mian .head img {
	margin: auto;
}
.parking_mian .title{
	font-size: 32upx;
	font-weight: bold;
	margin-bottom: 20upx;
}
.LicensePlate li {
	border: 1px solid #898989;
	width: 10%;
}

.LicensePlate input {
	padding: 10upx 16upx;
	font-size: 40upx;
}

.LicensePlate {
	display: flex;
	justify-content: space-between;
	padding-left: 0;
}

/*历史缴费车辆*/
.oldplateBox {
	color: #898989;
	font-size: 30upx;
	text-align: left;
}

.oldplateBox span {
	color: #90c2b6;
	font-size: 34upx;
}

/*缴费按钮*/
.parkingCenter button {
	width: 80%;
	font-size: 36upx;
	border-radius: 5px;
	margin-top: 15%;
}
// .bill{
// 	color: #59A694;
// 	font-size: 18px;
// }
/*底部*/
.parkingBottom p {
	text-align: left;
	font-size: 30upx;
	color: #898989;
	margin: 0px;
	line-height: 50upx;
}
</style>
