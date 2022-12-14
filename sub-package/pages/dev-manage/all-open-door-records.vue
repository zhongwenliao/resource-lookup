<template>
	<uni-base-page class="uni-base-page">
		<view class="list-view-container" v-if="allRecords.length > 0">
			<ul class="list-ul-container">
				<li class="li-border-bottom">
					<view class="list-item clear">
						<view class="left-name fl">{{ "所有记录" }} : {{ allRecords.length }}</view>
						<view class="save-record fr" style="color: #088b68;" v-if="allRecords.length > 0" @click="saveRecords">上传开门记录</view>
					</view>
				</li>
				<li class="li-border-bottom" v-for="record in allRecords">
					<text>{{ record.eventName }}</text>
					<text>{{ record.number }}</text>
					<text>{{ record.eventTime }}</text>
					<text>{{ record.eventResult }}</text>
				</li>
			</ul>
		</view>
		<uni-empty-page v-else></uni-empty-page>
	</uni-base-page>
</template>

<script>
let openDoorEvent = {}, 
	devObj = {},
	// 上传到服务器的开门记录的事件类型（key: eventType + "-" + result，value: eventTypeValue）
	uploadOpenDoorRecordsEvent = {
		"1-0": 19,       // 手机蓝牙开门成功
		"1-1": 79,       // 手机蓝牙开门失败
		"2-0": 0,       // 刷卡开门成功
		"2-1": 47,     	// 刷卡开门失败
		"3-0": 20,		// 临时密码开门成功
		"3-1": 77,		// 临时密码开门失败
		"4-0": 8,		// 远程开门开门成功
		"5-0": 122,		// 触摸开门成功
		"6-0": 24,		// 指纹开门成功
		"6-1": 65,		// 指纹开门失败
		"7-0": 23,		// 二维码开门成功
		"7-1": 74,		// 二维码开门失败
		"8-0": 4,		// 固定密码开门成功
		"8-1": 50		// 固定密码开门失败
	};
export default {
	data() {
		return {
			allRecords: [],
			eventType: null
		};
	},
	methods: {
		/**
		 * 通过蓝牙获取设备返回的开门记录类型：1:蓝牙开门, 2:刷卡开门, 3: 密码开门, 4:远程开门, 5:触摸开门,6:指纹开门, 7:二维码，8:固定密码
		 * 开门记录结果openDoorResult：0：成功，1：失败
		 */
		//读取所有开门记录
		readAllRecords(devObj) {
			// 初始化用于显示在界面和上传服务器的记录列表(this.allRecords)
			this.allRecords = [];
			
			// 1. 通过蓝牙本地插件(DoorMaster-Bluetooth-Plugin)获取当前设备的开门记录(该记录不包含手机蓝牙开门，因为当
			// 进行一次手机蓝牙开门操作后，蓝牙本地插件(DoorMaster-Bluetooth-Plugin)内部会自动上传该记录到服务器，前提是你有调用该插件内部提供的
			// 登录接口)
			// 2. 进一步加工后，从而赋值给用于显示在界面和上传服务器的记录列表(this.allRecords)
			this.$sdkUtil.getOpenDoorRecordFromDevice(devObj, (result) => {
				// 通过蓝牙本地插件(DoorMaster-Bluetooth-Plugin)获取当前设备的开门记录
				let deviceOpenDoorRecordsList = result.data;
				this.$showLog("通过蓝牙本地插件获取当前设备的开门记录", deviceOpenDoorRecordsList);
				
				// 遍历从蓝牙本地插件(DoorMaster-Bluetooth-Plugin)获取到的设备开门记录，从而组装成另一个记录列表(this.allRecords)，用来显示在界面和上传到服务器这两个方面
				deviceOpenDoorRecordsList.map((item) => {
					// 由于从蓝牙本地插件(DoorMaster-Bluetooth-Plugin)获取到的设备开门记录中的每一条记录都含有cardno字段和password字段，但实际上我们最多只使用其中一个，
					// 如蓝牙开门(eventReturnNumber的1属性)不需要cardno和password，所以它对应的值是空字符串。刷卡开门(eventReturnNumber的2属性)只需要用到cardno，
					// 所以它对应的值是cardno的值，密码开门(eventReturnNumber的3属性)只需要用到password，所以它对应的值是password的值，往后以此类推。eventReturnNumber的
					// 作用一个是当该条记录是刷卡开门时，界面上显示卡号，当该条记录是密码开门时，界面上显示密码等。另一个是上传到服务器的开门记录中包含number字段，该字段的取值是刷卡开门和
					// 指纹开门(指纹id的值放在cardno)的cardno字段以及密码开门和固定密码开门的password字段。
					let eventReturnNumber = {
						1: "",   // 蓝牙开门
						2: item.cardno,  // 刷卡开门
						3: item.password,  // 密码开门
						4: "",  // 远程开门
						5: "",  // 触摸开门
						6: item.cardno,  // 指纹开门
						7: "",  // 二维码开门
						8: item.password  // 固定密码开门
					};
					
					// 组装成另一个记录列表(this.allRecords)，用来显示在界面和上传到服务器这两个方面
					let recordTime = item.date, bluetoothEventType = item.type, bluetoothEventResult = item.result;
					let recordObj = {
						"eventName": openDoorEvent[bluetoothEventType],
						"eventTime": this.$formatTime(recordTime),
						"eventResult": bluetoothEventResult == 0 ? this.common["open-success"] || "开门成功" : this.common["open-fail"] || "开门失败",
						"number": eventReturnNumber[bluetoothEventType],
						"devSn": devObj.devSn,
						"eventType": uploadOpenDoorRecordsEvent[`${bluetoothEventType}-${bluetoothEventResult}`]
					};
					// console.log("结果",recordObj.eventResult)
					this.allRecords.push(recordObj);
				});
				
				// 给开门记录做排序
				this.allRecords.sort((a, b) => {
					return b.eventTime > a.eventTime ? 1 : -1;
				});
				
				// this.$showLog("蓝牙读取所有开门记录", this.allRecords);
			});
		},
		
		// 将从蓝牙本地插件(DoorMaster-Bluetooth-Plugin)获取到的存储在蓝牙门禁设备里的开门记录保存(上传)到服务器
		saveRecords() {
			console.log(this.allRecords);
			
			this.$api('equipment.addDevOpenRecord', {
				data: this.allRecords,
			}).then(res => {
				if (res.code === 200) {
					this.$showToast("添加开门记录成功");
				}
			})
			// this.$req.request({
			// 	url: "/accEventlog/app/add?accessToken=" + this.$getUserInfo().accessToken,
			// 	method: "POST",
			// 	header: {
			// 		"content-type": "application/json"
			// 	},
				
			// 	success: res => {
					
			// 	}
			// });
		}
	},
	computed: {
		common() {
			return this.$t("common");
		},
		records() {
			return this.$t("records");
		}
	},
	onLoad(options) {
		this.$setTitle(this.records["title"] || "开门记录");
		devObj = JSON.parse(options.devObj);
		openDoorEvent = {
			1: this.records["bluetooth_key"] || "蓝牙开门",
			2: this.records["slot_card_key"] || "刷卡开门",
			3: this.records["password_key"] || "密码开门",
			4: this.records["long_distance_key"] || "远程开门",
			5: this.records["touch_key"] || "触摸开门",
			6: this.records["fingerprint_key"] || "指纹开门",
			7: this.records["code_key"] || "二维码开门",
			8: this.records["fixed_password_key"] || "固定密码开门"
		};
		this.readAllRecords(devObj);
	},
	onShow() {}
};
</script>

<style>
.li-border-bottom {
	padding: 10upx;
	border-bottom: 1upx solid #d3d3d3;
}

.li-border-bottom text {
	padding: 0 10upx;
}
</style>
