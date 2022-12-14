<template>
	<view class="identity-view">
		<view class="tips">
			{{ manage["input-devsn"] || "请输入需要更换的设备序列号" }}：
		</view>
		<!-- 设备序列号 -->
		<view class="uni-list-cell" hover-class="uni-list-cell-hover">
			<view class="uni-list-cell-navigate">
				<text class="uni-list-cell-text"><text class="require-text">*</text>{{ manage["dev-sn"]||"设备序列号" }}</text>
				<input style="width: 70%;font-size: 34upx; text-align: center;" type="number"  @input="getDevSn" :placeholder="`${common['input']||'请输入'}`"/>
			</view>
		</view>
		<view class="submit-btn">
			<button type="primary" class="button primary" :disabled="disableBtn" @click="changeDev">{{ manage["confirm-change"]||"确认更换" }}</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				devSn: "",
				devObj: {},
				disableBtn: true,
				formData: {}
			}
		},
		onLoad(options) {
			// console.log("options====",options);
			if(options.devObj) {
				this.devObj = JSON.parse(options.devObj);
			}
			this.$setTitle(this.manage["change-device"]||"更换设备");
		},
		computed: {
			house() {
				return this.$t("house")
			},
			common() {
				return this.$t("common")
			},
			title() {
				return this.$t("title")
			},
			manage() {
				return this.$t("manage")
			}
		},
		methods: {
			//获取设备序列号
			getDevSn(e) {
				this.devSn = e.target.value;
				if(this.devSn.length > 5) {
					this.disableBtn = false;
				}else {
					this.disableBtn = true;
				}
			},
			
			
			// 更换设备
			changeDev() {
				this.$req.request({
					url: "/devDevice/app/replaceDev",
					data: {
						oldDevSn: this.devObj.devSn,
						newDevSn: this.devSn
					},
					success: res => {
						console.log("更换设备返回： ", res.data);
						if(res.code == 0) {
							this.$showToast(this.manage["change-success"]||"更换成功");
							setTimeout(()=>{
								uni.navigateBack();
							}, 1000)
						}
					}
				})
			}
			
		}
	}
</script>

<style>
	.tips {
		padding: 20upx;
		font-size: 32upx;
		color: #AAAAAA;
	}
	
	.identity-view {
		width: 100%;
		padding: 20upx;
		margin-top: 20%;
	}
	
	.authentication-top-view {
		width: 100%;
		background: #FFFFFF;
		text-align: center;
		padding: 30upx 0 0;
	}
	
	.authentication-top-img {
		width: 200upx;
		height: 200upx;
	}
	
	.img-help-tip {
		color: #CDC9C9;
		text-align: center;
	}
	.uni-list-cell {
		margin-bottom: 10upx;
		padding: 10upx 0;
	}
	
	.uni-list-cell-text {
		font-size: 34upx;
	}
	
	.input-view {
		font-size: 34upx;
		color: #808080;
	}
	
	.submit-btn {
		padding: 10upx;
		font-size: 34upx;
		width: 80%;
		margin: 40upx auto 0;
	}
	
	.require-text {
		color: red;
	}
	
</style>


