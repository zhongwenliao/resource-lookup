<template>
	<uni-base-page class="content uni-base-page">
		<!-- 绑定地址 -->
		<view class="building-info-view">
			<text v-if="bindInfoObj.bindType == 1">{{ bindInfoObj.communityName }}</text>
			<text v-else>{{ bindInfoObj.communityName }} / {{ bindInfoObj.buildingName }}</text>
		</view>
		<view class="wifi-setting">
			<ul>
				<li>
					<view class="info-title"> {{ bindType===1? manage["building-name"]:manage["room-name"] }}</view>
					<view class="info-name">
						<input type="text" :placeholder="`${common['input']||'请输入'}`" name="bindName" v-model="bindName" />
					</view>
				</li>
			</ul>
			<view class="setting-button">
				<button type="primary" class="button primary" @click="clickAdd">{{ bindType===1? manage["add-building"]:manage["add-room"] }}</button>
			</view>
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				bindInfoObj: {},
				bindType: null,
				bindName: ""
			}
		},
		computed:{
			title() {
				return this.$t("title")
			},
			manage() {
				return this.$t("manage")
			},
			common() {
				return this.$t("common")
			}
			
		},
		methods: {
			// 点击添加
			clickAdd() {
				if(this.bindType == 1) {
					// 添加楼栋
					this.addBuilding();
				} else if(this.bindType == 2) {
					// 添加房间
					this.addRoom();
				}
			},
			
			// 添加楼栋
			addBuilding() {
				this.$req.request({
					url: "/sqBuilding/app/add",
					data: {
						communityId: this.bindInfoObj.communityId,
						name: this.bindName
					},
					success: res => {
						console.log("添加楼栋res: ", res.data);
						if(res.code == 0) {
							this.$showToast(this.manage["add-building-success"] || "添加楼栋成功"); 
							uni.navigateBack();
						}
					}
				})
			},
			
			// 添加房间
			addRoom() {
				this.$req.request({
					url: "/sqRoom/app/add",
					data: {
						communityId: this.bindInfoObj.communityId,
						buildingId: this.bindInfoObj.buildingId,
						name: this.bindName
					},
					success: res => {
						console.log("添加房间res: ", res.data);
						if(res.code == 0) {
							this.$showToast(this.manage["add-room-success"] || "添加房间成功"); 
							uni.navigateBack();
						}
					}
				})
			}
		},
		onShow() {
			
		},
		onLoad(options) {
			if(options.bindInfoObj) {
				let bindInfoObj = JSON.parse(options.bindInfoObj);
				this.bindInfoObj = bindInfoObj;
				this.bindType = bindInfoObj.bindType;
				console.log("绑定信息： ",this.bindInfoObj);
				if(bindInfoObj.bindType == 1) {
					// 添加楼栋
					this.$setTitle(this.manage["add-building"] ||"添加楼栋");
				} else if(bindInfoObj.bindType == 2) {
					// 添加房间
					this.$setTitle(this.manage["add-room"] ||"添加房间");
				}
			}
		}
	}
</script>

<style lang="scss">
	.building-info-view {
		padding: 0 20upx 6upx;
	}
	
	.content {
		width: 100%;
		height: 100%;
		position: absolute;
	}
	
	.tips {
		color: #AAAAAA;
		padding: 10upx 2%;
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
		/* float: right; */
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


