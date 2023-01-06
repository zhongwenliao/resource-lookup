<template>
	<uni-base-page class="content uni-base-page">
		<view class="form-view">
			<view class="set-type-bar">
				<span :class="'status-' + static" @click="changeType(0)">{{ manage["static-ip"]||"静态IP" }}</span>
				<span :class="'status-' + dynamic" @click="changeType(1)">DHCP</span>
			</view>
			<form @submit="settingDevIP" class="form">
				<view class="wifi-setting">
					<ul v-if="currentType == 0">
						<li>
							<view class="info-title">{{ manage["ip-address"] || "IP地址"}}</view>
							<view class="info-name">
								<input type="text" :placeholder="`${manage['input-ip-address']}` || '请输入IP地址'" name="staticIP" />
							</view>
						</li>
						<li>
							<view class="info-title">{{ manage["subnet-mask"]||"子网掩码" }}</view>
							<view class="info-name">
								<input type="text" :placeholder="`${manage['subnet-input']}` || '请输入子网掩码'" name="subnetMask"/>
							</view>
						</li>
						<li>
							<view class="info-title">{{ manage["gateway"] || "网关" }}</view>
							<view class="info-name">
								<input type="text" :placeholder="`${manage['gateway-input']}` || '请输入网关'" name="gateway"/>
							</view>
						</li>
						<li>
							<view class="info-title">{{ manage["dns-server"]||"DNS服务器地址" }}</view>
							<view class="info-name">
								<input type="text" :placeholder="`${manage['dns-input']}` || '请输入DNS服务器地址'" name="dnsServer"/>
							</view>
						</li>
					</ul>
					<view v-else class="dynamic-setting">{{ manage["auto-get-ip"]||"自动获取IP地址" }}</view>
					<view class="setting-button">
						<button type="primary" class="button primary" formType="submit">{{ manage["save-set"] || "保存配置" }}</button>
					</view>
				</view>
			</form>
		</view>
	</uni-base-page>
</template>

<script>
	let devObj = {};
	export default {
		data() {
			return {
				configParam: {
					staticIP: "",
					subnetMask: "",
					gateway: "",
					dnsServer: ""
				},
				currentType: 0,
				static: 1,
				dynamic: 2,
				dhcpEnable: 1,//0为开启了DHCP
			}
		},
		computed: {
			manage() {
				return this.$t("manage");
			},
			common() {
				return this.$t("common");
			},
			title() {
				return this.$t("title");
			}
		},
		onReady() {
			uni.setNavigationBarTitle({
				title: this.title["set-dev-ip"]
			})
		},
		onLoad(options) {
			let devObjStr = options.devObj;
			let _this = this;
			if(devObjStr !== undefined && devObjStr !== "") {
				devObj = JSON.parse(devObjStr);
			}
		},
		
		methods: {
			//切换配置IP
			changeType(type){
				if(type == 0) {
					//点击静态IP
					this.currentType = 0;
					this.static = 1;
					this.dynamic = 2;
					this.dhcpEnable = 1;
				}else if(type == 1) {
					//点击了DHCP
					this.currentType = 1;
					this.dynamic = 1;
					this.static = 2;
					this.dhcpEnable = 0;
				}
			},
			
			// 提交保存参数
			settingDevIP(e) {
				let _this = this;
				let sdkUtil = this.$sdkUtil;
				let formData = this.configParam;
				let checkList = [];
				if(this.dhcpEnable !== 0) {
					checkList = [{
						name: "staticIP",
						rules: [{
							required: true,
							message: this.manage["no-ip"] || "IP地址不能为空"
						}]
					}, {
						name: "subnetMask",
						rules: [{
							required: true,
							message: this.manage["no-subnet-mask"] || "子网掩码不能为空"
						}]
					}, {
						name: "gateway",
						rules: [{
							required: true,
							message: this.manage["no-gateway"] || "网关不能为空"
						}]
					}, {
						name: "dnsServer",
						rules: [{
							required: true,
							message: this.manage["no-dns"] || "DNS服务器地址不能为空"
						}]
					}];
					formData = e.detail.value;
				}
				formData.dhcpEnable = this.dhcpEnable;
				// 进行表单检查
				this.$formSubmitCheck({
					formData: formData,
					checkList: checkList,
					success: () => {
						sdkUtil.setDeviceStaticIP(devObj, formData);
					}
				});
			}
		}
	}
</script>

<style>
	.set-type-bar {
		text-align: center;
		padding: 20upx 0 40upx;
	}
	
	.set-type-bar span {
		padding: 0 20upx;
		border: 1upx solid #007AFF;
	}
	
	/* 选中状态 */
	.status-1 {
		color: #FFFFFF;
		background-color: #007AFF;
	}
	
	/* 未选中状态 */
	.status-2 {
		color: #007AFF;
		background-color: #FFFFFF;
	}
	
	.wifi-setting ul {
		padding: 0 
	}
	.dynamic-setting {
		width: 100%;
		height: 300upx;
		line-height: 300upx;
		text-align: center;
	}
	
	.wifi-setting ul li {
		background: #ffffff;
		min-height: 80upx;
		height: auto;
		display: inline-flex;
		line-height: 80upx;
		width: 96%;
		padding: 0 2%;
		border-bottom: 2upx solid #eee;
	}
	
	.wifi-setting .manual-mode-btn {
		padding: 10upx 23upx;
		color: #1E90FF;
		margin: 8upx 0;
		text-align: right;
	}
	
	.wifi-setting .manual-mode-btn-hover {
		background-color: #D3D3D3;
	}
	
	.info-title {
		width: 30%;
		display: inline-block;
		padding: 10upx;
		line-height: 80upx;
	}
	
	.info-name {
		width: 70%;
		display: inline-block;
		text-align: right;
		padding: 10upx;
		line-height: 80upx;
		color: grey;
	}
	
	.info-name input {
		font-size: 28upx;
		height: 80upx;
		line-heigth: 80upx;
	}
	
	.set-more {
		width: 96%;
		margin: 10upx 2%;
		padding: 0 10upx;
	}
	
	.icon-more {
		display: inline-block;
		vertical-align: middle;
		margin-left: 10upx;
		width: 0;
		height: 0;
		border: 10upx solid transparent;
		border-bottom-color: #000;
		transform: rotate(180deg);
		transition: .2s ease-in;
	}
	
	.setting-button {
		width: 100%;
	}
	
	.setting-button button {
		width: 80%;
		margin: 40upx auto;
	}
</style>
