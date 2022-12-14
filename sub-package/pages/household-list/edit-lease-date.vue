<template>
	<uni-base-page class="add-tenant-view">
		<view class="add-tenant-form-view">
			<form @submit="editRentDate">
				<view class="form-view">
					<!-- 姓名 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate">
							<text class="uni-list-cell-text name">{{ house["name"] || "姓名" }}</text>
							<text class="fill-part">{{ tenantObj.name }}</text>
						</view>
					</view>
					<!-- 性别 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate">
							<text class="uni-list-cell-text name">{{ house["gender"] || "性别" }}</text>
							<text class="fill-part">{{ genderList[tenantObj.gender] }}</text>
						</view>
					</view>
					<!-- 手机号 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate">
							<text class="uni-list-cell-text name">{{ house["phone"] || "手机号" }}</text>
							<text class="fill-part">{{ tenantObj.phone }}</text>
						</view>
					</view>
					<!-- 证件号 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover" v-if="tenantObj.certNo">
						<view class="uni-list-cell-navigate">
							<text class="uni-list-cell-text name">{{ house["cert-num"] || "证件号" }}</text>
							<text class="fill-part">{{ tenantObj.certNo }}</text>
						</view>
					</view>
					<!-- 入住时间 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate uni-navigate-right">
							<text class="uni-list-cell-text name">{{ house['checkin-time'] || "入住时间" }}</text>
							<uni-time-selector @change="chenkInTimeChange" style="width: 70%; font-size: 34upx;">
								<view :class="['input-view', chenkInTime !== null ? '' : 'input-placeholder-view']">{{ chenkInTime !== undefined ? chenkInTime : house["set-time"] }}</view>
							</uni-time-selector>
						</view>
					</view>
					<!-- 到期时间 -->
					<view class="uni-list-cell" hover-class="uni-list-cell-hover">
						<view class="uni-list-cell-navigate uni-navigate-right">
							<text class="uni-list-cell-text name">{{ house['end-time'] || "到期时间" }}</text>
							<uni-time-selector @change="expireEndTimeChange" style="width: 70%; font-size: 34upx;">
								<view :class="['input-view', expireEndTime !== null ? '' : 'input-placeholder-view']">{{ expireEndTime !== undefined ? expireEndTime : house["set-time"] }}</view>
							</uni-time-selector>
						</view>
					</view>
				</view>
				<view class="btn-row">
					<button type="primary" class="primary" formType="submit">{{ house["submit"] || "提交" }}</button>
				</view>
			</form>
		</view>
	</uni-base-page>
</template>

<script>
	import uniTimeSelector from "../../components/uni-time-selector/uni-time-selector.vue";
	export default {
		components: {
			uniTimeSelector
		},
		data() {
			return {
				tenantObj: {},
				chenkInTime: "",
				expireEndTime: ""
			}
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
			identity() {
				return this.$t("identity")
			}
		},
		onLoad(options) {
			if (options.tenantObj !== undefined) {
				this.tenantObj = JSON.parse(options.tenantObj);
				this.chenkInTime = this.tenantObj.chenkInTime;
				this.expireEndTime = this.tenantObj.expireEndTime;
			}
			this.genderList = this.common["gender-list"] || ["男", "女"];
		},
		methods: {
			// 入住时间onchange事件
			chenkInTimeChange(e) {
				this.chenkInTime = e;
				console.log("e-----",e);
			},
			
			// 到期时间onchange事件
			expireEndTimeChange(e) {
				this.expireEndTime = e;
			},
			//修改续租时间
			editRentDate() {
				if(this.chenkInTime === "" || this.expireEndTime === "") {
					this.$showToast("请选择续租有效期");
				}else {
					let tenant = this.tenantObj;
					this.$req.request({
						url: "/sqRoomEmpRel/app/updateById",
						data: {
							empId: tenant.empId,
							roomId: tenant.roomId,
							chenkInTime: this.chenkInTime + ":00",
							expireEndTime: this.expireEndTime + ":00"
						},
						success: res => {
							if(res.code == 0) {
								this.$showToast("修改成功");
								setTimeout( ()=> {
									uni.navigateBack({ delta: 2 });
								}, 1000)
							}
						}
					})
				}
				
			}
		}
	}
</script>

<style lang="scss">
	.add-tenant-view {
		background: #FFFFFF;
		width: 100%;
		padding: 20upx;
	}

	.authentication-top-view {
		width: 100%;
		background: #FFFFFF;
		text-align: center;
		padding: 10upx 0 0;
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
	
	.name {
		width: 30%;
	}
	
	.fill-part {
		width: 70%;
		text-align: left;
	}

	.input-view {
		font-size: 34upx;
		color: #808080;
	}

	.btn-row {
		padding: 10upx;
		font-size: 34upx;
		width: 80%;
		margin: 20upx auto 0;
	}

	.require-text {
		color: red;
	}
</style>
