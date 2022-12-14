<template>
	<view class="identity-view">
		<view class="tips">
			{{ manage["input-owner-phone"] || "请输入要绑定业主的手机号码"}}：
		</view>
		<!-- 手机号 -->
		<view class="uni-list-cell" hover-class="uni-list-cell-hover">
			<view class="uni-list-cell-navigate">
				<text class="uni-list-cell-text"><text class="require-text">*</text>{{ house["phone"] || "手机号" }}</text>
				<input style="width: 70%;font-size: 34upx;" type="number"  @input="getPhone" :placeholder="`${house['phone-placeholder']}` || '请输入手机号' "/>
			</view>
		</view>
		<view class="uni-list-cell" hover-class="uni-list-cell-hover" v-if="userName">
			<view class="uni-list-cell-navigate">
				<text class="uni-list-cell-text">{{ "业主姓名" }}</text>
				<text style="width: 70%;font-size: 34upx;">{{ userName }}</text>
			</view>
		</view>
	
		<view class="submit-btn" v-if="!userName">
			<button type="primary" class="button primary" :disabled="disableBtn" @click="submitPhone">{{ "查询" }}</button>
		</view>
		
		<view class="submit-btn" v-if="userName">
			<button type="primary" class="button primary" :disabled="disableBtn" @click="bindOwner">{{ manage["bind-owner"] || "绑定业主" }}</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				phone: "",
				imageUrl: "http://www.thinmoo.com/wp-content/uploads/2020/10/capture-default.png",
				devObj: {},
				disableBtn: true,
				userName: ""
			}
		},
		onLoad(options) {
			// console.log("options====",options);
			if(options.devObj) {
				this.devObj = JSON.parse(options.devObj);
			}
			this.$setTitle(this.manage["bind-owner"] || "绑定业主");
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
			},
			mine() {
				return this.$t("mine")
			}
			
		},
		methods: {
			//获取手机号
			getPhone(e) {
				this.phone = e.target.value;
				if(this.phone.length > 8) {
					this.disableBtn = false;
				}else {
					this.disableBtn = true;
				}
			},
			
			// 手机号查找
			submitPhone() {
				uni.showLoading()
				this.$req.request({
					url: "/appUser/app/verifyAppUserByPhone",
					data: {
						phone: this.phone
					},
					success: res => {
						uni.hideLoading()
						if(res.code === 0) {
							this.userName = res.data.realName;
						}
					}
				})
			},
			
			
			//绑定业主
			bindOwner() {
				this.$req.request({
					url: "/devDevice/app/bindOwner",
					data: {
						roomId: this.devObj.roomId,
						phone: this.phone
					},
					success: res => {
						console.log("绑定业主返回： ", res.data);
						if(res.code == 0) {
							this.$showToast(this.mine["bind-success"] || "绑定成功");
							setTimeout(() => {
								uni.navigateTo({
									url: "../install/submit-install?devObj=" + JSON.stringify(this.devObj)
								})
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

