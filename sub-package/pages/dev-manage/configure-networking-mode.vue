<template>
	<uni-base-page class="content configure-networking-mode-page">
		<form class="form configure-networking-mode-form" @submit="formSubmit">
			<view class="form-view">
				<ul class="list-view">
					<li>
						<text class="require-text">*</text>
						<text>{{ "联网模式" }}</text>：
						<radio-group name="mode" style="display: inline-block; width: 70%;">
							<label class="radio"><radio value="0" checked="true" />触摸唤醒</label>
							<label class="radio"><radio value="1" />密码唤醒</label>
						</radio-group>
					</li>
					<li style="display: flex; justify-content: flex-start; align-items: center;">
						<text class="require-text">*</text>
						<text>{{ "自动联网间隔" }}</text>：
						<input style="width: 90upx; font-size: 28upx;" v-model="hbiValue" maxlength="5" type="number" :placeholder="'请输入'" name="hbi" /> 
						<text>{{ "小时" }}</text>
					</li>
				</ul>
				<view class="btn-row">
					<button type="primary" class="button primary" :disabled="!hbiValue" formType="submit">{{ "提交" }}</button>
				</view>
			</view>
		</form>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				btnDisabled: true,
				hbiValue: 12,
				devObj: {}
			}
		},
		
		computed: {
			manage() {
				return this.$t("manage");
			}
		},
		
		methods: {
			// 表单提交
			formSubmit(e) {
				// 获取表单数据
				let formData = e.detail.value;
				formData["mode"] = parseInt(formData["mode"]);
				formData["hbi"] = parseInt(formData["hbi"]);
				formData = {
					...formData,
					"retryCount": 3,
					"tcni": 6
				};
				// console.log("formData: ", formData);
				// console.log("devObj: ", this.devObj);
				// 配置智能门锁的联网模式
				this.$sdkUtil.setNBNetworkSetting(this.devObj, formData, () => {
					// 配置成功回调
					
				});
			}
		},
		
		onLoad(options) {
			if(options.devObj) {
				this.devObj = JSON.parse(options.devObj);
			}
			this.$setTitle("配置联网模式");
		}
		
	}
</script>

<style lang="scss">
	.configure-networking-mode-page {
		.list-container {
			width: 100%;
			font-size: 28upx;
		}
		
		.list-view {
			background-color: #FFFFFF;
			list-style: none;
			padding: 0;
			
			.radio {
				margin: 0 10upx 0;
			}
		}
		
		.list-view li {
			width: 96%;
			padding: 20upx 2%;
			overflow: hidden;
			border-bottom: 1upx solid #F5F5F5;
			position: relative;
			
			input {
				// display: inline-block; 
				// position: absolute; 
				// top: 20upx;
			}
		}
		
		.list-left {
			width: 80%;
			float: left;
		}
		
		.list-right-btn {
			width: 20%;
			float: left;
		}
		
		.list-right-btn button {
			font-size: 24upx;
			padding: 0;
			color: #FFFFFF;
			background-color: #00aa00;
		}
	}
</style>

