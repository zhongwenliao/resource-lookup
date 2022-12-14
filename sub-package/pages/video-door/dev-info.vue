<template>
	<uni-base-page class="content">
		<view class="dev-info">
			<ul>
				<li>
					<view class="info-title">{{ video["place"] || "安装位置" }}</view>
					<view class="info-value">
						{{devInfo. doorName}}
					</view>
				</li>
				<li>
					<view class="info-title">{{ video["sn"] || "序列号" }}</view>
					<view class="info-value">{{ devInfo.devSn }}</view>
				</li>
				<li>
					<view class="info-title">{{ video["dev-name"] || "设备名称" }}</view>
					<view class="info-value">{{ devInfo.devName }}</view>
				</li>
				<!--  #ifdef APP-PLUS -->
				<!-- <li>
					<view class="info-title">{{ video["block"]||"阻止此设备呼叫" }}<br><span style="color: #BEBEBE;">{{ video["blockTips"]||"仅对当前APP账号有效" }}</span></view>
					<view class="info-value">
						<switch @change="switchChange" style="transform:scale(0.9)" :checked="!devInfo.callable" />
					</view>
				</li> -->
				<!-- #endif -->


				<!-- <text style="margin-left: 1%, padding-left: 16upx;"></text> -->
				<!-- <li>
					<view class="info-title">设备有效期</view>
					<view class="info-value"></view>
				</li> -->
			</ul>
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				devInfo: {}
			}
		},
		methods: {
			switchChange(e) {
				var sdkUtil = this.$sdkUtil;
				var devSn = this.devInfo.devSn;
				var _this = this;
				var ifBlock = e.target.value;
				if (ifBlock) {
					// 当前设备没有被移入黑名单，此时点击就是将设备移入黑名单
					sdkUtil.addAccountToBlackList(devSn, 2, result => {
						_this.devInfo.callable = false;
						// _this.$setPrevPageData({newDevInfo: _this.devInfo});
						_this.$onfire.fire("EventDevInfoChange", {newDevInfo: _this.devInfo});
						// uni.navigateBack();
					});
				} else {
					// 当前设备已被移入黑名单，此时点击就是将设备移出黑名单
					sdkUtil.removeAccountFromBlackList(devSn, result => {
						_this.devInfo.callable = true;
						// _this.$setPrevPageData({newDevInfo: _this.devInfo});
						_this.$onfire.fire("EventDevInfoChange", {newDevInfo: _this.devInfo});
						// uni.navigateBack();
					});
				}
			}
		},
		computed: {
			video() {
				return this.$t("video");
			},
			title() {
				return this.$t("title");
			}
		},
		onReady() {
			this.$setTitle(this.title["dev-info"]);
		},
		onLoad(options) {
			this.devInfo = JSON.parse(options.dev);
		}
	}
</script>

<style>
	.dev-info ul {
		padding: 0;
	}

	.dev-info ul li {
		background: #ffffff;
		min-height: 100upx;
		height: auto;
		display: inline-flex;
		width: 98%;
		margin-left: 1%;
		margin-right: 1%;
		margin-bottom: 4upx;
		border-bottom: 2upx solid #eee;
	}

	.info-title {
		text-align: left;
		width: 55%;
		margin-top: 3%;
		display: inline-block;
		padding-left: 16upx;
	}

	.info-value {
		display: inline-block;
		width: 45%;
		margin-top: 3%;
		text-align: right;
		padding-right: 16upx;
	}
</style>
