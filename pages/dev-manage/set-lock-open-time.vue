<template>
	<view class="uni-base-page set-lock-open-time-page">
		<view class="set-lock-open-time-page-container">
			<view style="margin-bottom: 10upx;">
				<text>{{  devControlType[0] || '电锁控制' }}:</text>
			</view>
			<!-- 控制方式 start -->
			<view class="set-lock-open-time-control-way">
				<!-- 电锁控制 start -->
				<view class="uni-list-cell" hover-class="uni-list-cell-hover" @click="switchToEleLock">
					<view class="uni-list-cell-navigate">
						<text class="bottom-view-uni-list-cell-text">{{  devControlType[0] }}</text>
						<image v-if="configParam.controlWay === 0" src="https://wxmini-1258758873.cos.ap-guangzhou.myqcloud.com/success.png" />
					</view>
				</view>
				<!-- 电锁控制 end -->
				
				<!-- 手动控制 start -->
				<view class="uni-list-cell" hover-class="uni-list-cell-hover" @click="switchToManual">
					<view class="uni-list-cell-navigate">
						<text class="bottom-view-uni-list-cell-text">{{  devControlType[1] }}</text>
						<image v-if="configParam.controlWay === 1" src="https://wxmini-1258758873.cos.ap-guangzhou.myqcloud.com/success.png" />
					</view>
				</view>
				<!-- 手动控制 end -->
			</view>
			<!-- 控制方式 end -->
			<view v-if="configParam.controlWay === 0" class="set-lock-open-time">
				<view class="uni-list-cell" hover-class="uni-list-cell-hover">
					<view class="uni-list-cell-navigate" >
						<text class="bottom-view-uni-list-cell-text">{{  (manage["unlock-time"] || "开锁时长") + "(1-254s)" }}</text>
						<input v-model="configParam.openDelay" type="number" maxlength="3" />
					</view>
				</view>
			</view>
			<view v-if="devObj.isSupportWigan"  class="set-lock-open-time">
				<view class="uni-list-cell" hover-class="uni-list-cell-hover">
					<view class="uni-list-cell-navigate" >
						<text class="bottom-view-uni-list-cell-text">{{ manage["weigen-set"] || "配置韦根" }}</text>
						 <picker @change="bindPickerChange" :value="index" :range="array">
							<view class="" style="display: flex; align-items: center;">
								<text>{{array[index]}}</text>
								<text class="right"></text>
							</view>
						</picker>
					</view>
				</view>
			</view>
			<view class="save-set">
				<button type="primary" @click="submit" class="button primary" :disabled="configParam.controlWay === 0 && !configParam.openDelay">
					<text>{{ manage["save-set"] || "保存配置" }}</text>
				</button>
			</view>
			
		</view>
	</view>
</template>

<script>
	export default {
		data () {
			return {
				controlWayList: ["电锁控制", "电气控制"],
				devObj: {},
				array: ['34', '26'],
				index: 0,
				configParam: {
					controlWay: 0,   // 电锁控制
					openDelay: 5     ,// 开门时长
					wiegandValue: ''
				}
			}
		},
		
		computed: {
			manage() {
				return this.$t("manage");
			},
			devControlType() {
				return this.$t("dev-control-type");
			}	
		},
		
		onLoad(options) {
			this.$setTitle(this.manage["set-unlock-time"] || "配置蓝牙开锁时长");
			if (options.devObj) {
				this.devObj = JSON.parse(options.devObj);
				if(this.devObj.accKeepOpenTs) {
					this.openDelay = this.devObj.accKeepOpenTs;
				}
				console.log("devObj---",this.devObj)
				this.configParam.wiegandValue = this.devObj.wiegandValue;
			}
		},
		
		methods: {
			bindPickerChange: function(e) {
				console.log('picker发送选择改变，携带值为', e.target.value)
				this.index = e.target.value
			},
			// 点击切换到电锁控制
			switchToEleLock() {
				this.configParam.controlWay = 0;
				this.configParam.openDelay = 5;
			},
			
			// 点击切换到手动控制
			switchToManual() {
				this.configParam.controlWay = 1;
			},
			
			// 保存配置
			submit() {
				let configParam = this.configParam;
				if( configParam.wiegandValue ) {
					configParam.wiegandValue = this.array[this.index];
				}
				if (configParam.controlWay === 1) {
					// 手动控制
					configParam.openDelay = 5;
				}
				this.$sdkUtil.setDeviceConfig(this.devObj, configParam, (errCode) => {
					if (errCode === 0) {
						// 配置开锁时长成功，将开锁时长保存到服务器
						console.log("errCode:", errCode);
						this.$api('equipment.modifyParameters',{
							devSn: this.devObj.devSn,
							accLockDriverDelay: configParam.openDelay,
						}).then(res => {
							console.log(res);
						})
						// this.$req.request({
						// 	url: "/devDevice/app/updateAccLockDriverDelay",
						// 	data: {
						// 		id: this.devObj.id,
						// 		devSn: this.devObj.devSn,
						// 		accLockDriverDelay: configParam.openDelay,
						// 		isShowLoad: false
						// 	},
						// 	success: (res) => {
								
						// 	}
						// });
					}
				});
			}
		}
	}
</script>

<style lang="scss">
	.right {
		margin-top: -8upx;
		display: inline-block;
		width: 7px;
		height: 7px;
		border-top: 2px solid #C0C0C0;
		border-right: 2px solid #C0C0C0;
		transform: rotate(45deg);
	}
	.set-lock-open-time-page {
		padding-top: 30upx;
		background-color: #EFEFF4;
		.set-lock-open-time-page-container {
			.set-lock-open-time-control-way, .set-lock-open-time {
				background-color: #FFFFFF;
				margin-bottom: 20upx;
				.uni-list-cell {
					border-bottom: 2upx solid #C8C7CC;	
					&::after {
						background-color: #FFFFFF;
					}
					.uni-list-cell-navigate {
						image {
							width: 30upx;
							height: 30upx;
						}
						input {
							display: inline-block; 
							width: 50%; 
							text-align: right;
						}
					}
				}
			}
			.save-set {
				width: 90%;
				margin: 60upx auto;
			}
			.fill-part-instruction {
				color: #AAAAAA;
				padding: 0 30upx;
			}
		}
	}
</style>
