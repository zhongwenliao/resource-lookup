<template>
	<uni-base-page class="contact-property-view">
		<view class="contact-property-list-view" v-if="propertyList.length > 0 || manageDevList.length > 0">
			<view class="list-item-view" v-for="(propertyObj, index) in propertyList" :key="index">
				<button class="list-item-button" @click="callPhone(propertyObj.contactNumber)">
					<view class="tel-view left">
						<image class="tel-image" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/tel.png"></image>
					</view>
					<view class="tel-view left">{{ propertyObj.contactNumber }}<text style="margin-left: 12px;">{{ propertyObj.name }}</text></view>
					<view class="operation-view right">{{ property.call }}</view>
				</button>
			</view>
			<view class="list-item-view" v-for="(devObj, index) in manageDevList" :key="index">
				<button class="list-item-button" @click="callDevice(devObj.name,devObj.devSn)">
					<view class="tel-view left">
						<image class="tel-image" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/tel.png"></image>
					</view>
					<view class="tel-view left">{{ devObj.name }}<text style="margin-left: 12px;">{{ property["manage-dev"] || "管理机" }}</text></view>
					<view class="operation-view right">{{ property["call-dev"] || "呼叫" }}</view>
				</button>
			</view>
		</view>
		<view v-else class="no-data-view">{{ property["no-data"] }}</view>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				propertyList: [],
				manageDevList: []
			}
		},
		computed: {
			property() {
				return this.$t("property")
			},
			title() {
				return this.$t("title")
			}
		},
		onReady() {
			this.$setTitle(this.title["contact"]);
		},
		methods: {
			callPhone(tel) {
				// #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY
				uni.makePhoneCall({
				    phoneNumber: tel //仅为示例
				});
				// #endif
				
				
			},
			getPropertyList(communityId) {
				this.$req.request({
					url: "/wyContactNumber/app/getListByCommunityId",
					data: {
						communityId: communityId
					},
					success: res => {
						this.propertyList = res.data;
					}
				})
			},
			
			//获取管理机列表
			getManagementList(communityId) {
				this.$req.request({
					url: "/devDevice/app/getManagementMachineList",
					data: {
						communityId: communityId
					},
					success: res => {
						this.manageDevList = res.data;
					}
				})
			},
			
			//呼叫管理机
			callDevice(devName,devSn) {
				var account = this.$getUserInfo().phone;
				this.$sdkUtil.callAccount(devSn, 2, account, devName);
			}
		},
		onLoad() {
			var communityId = this.$getUserInfo().currentCommunity.id
			this.getPropertyList(communityId);
			this.getManagementList(communityId);
		}
	}
</script>

<style>
	.contact-property-view {
		width: 100%;
		}
		.contact-property-list-view {
			background: #fff;
			height: calc(100% - var(--status-bar-height));
			padding: 20upx 10upx;
			overflow: auto;
			}
			.contact-property-list-view .list-item-view {
				width: 100%;
				margin-bottom: 10upx;
				background: #ffffff;
				}
				.list-item-view .list-item-button {
					width: 100%;
					height: 100upx;
					border-radius: 0;
					padding: 25upx 15upx;
					}
					.list-item-view .list-item-button::after {
						border: none;
					}
					.list-item-view .list-item-button .tel-view {
						margin-right: 20upx;
						}
						.tel-view .tel-image {
							width: 50upx;
							height: 50upx;
						}
	.no-data-view {
		text-align: center;
		margin-top: 50%;
		font-size: 36upx;
	}
</style>
