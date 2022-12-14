<template>
	<uni-base-page class="content">
		<scroll-view scroll-y>
			<view style="background: #FFFFFF;">
				<view class="info-list">
					<view class="left-cnt">{{ repair["order-id"] || "报修单号" }}</view>
					<view class="right-cnt">{{ orderId }}</view>
				</view>
				<view class="info-list">
					<view class="left-cnt">{{ repair["repair-type"] || "报修类型" }}</view>
					<view class="right-cnt">{{ repairType }}</view>
				</view>
				<view class="info-list">
					<view class="left-cnt">{{ repair["repair-address"] || "报修地址" }}</view>
					<view class="right-cnt">{{ address }}</view>
				</view>
				<view class="info-list">
					<view class="left-cnt">{{ repair["time"] || "创建时间" }}</view>
					<view class="right-cnt">{{ date }}</view>
				</view>
				<view class="info-list">
					<view class="left-cnt">{{ repair["content"] || "报修内容" }}</view>
					<view class="right-cnt">{{ description }}</view>
				</view>
				<view class="info-list" v-if="imgSrc">
					<view class="left-cnt">{{ repair["img"] || "图片" }}</view>
					<view class="right-cnt">
						<image :src="imgSrc" mode="aspectFit"></image>
					</view>
				</view>
				<view class="info-list">
					<view class="left-cnt">{{ repair["repair-status"] || "报修状态" }}</view>
					<view class="right-cnt">{{ repairStatusName }}</view>
				</view>
				<view class="info-list" v-if="score">
					<view class="left-cnt">{{ repair["service"] || "维修服务" }}</view>
					<view class="right-cnt">
						<uni-rate disabled="true" :value="score"></uni-rate>
					</view>
				</view>
				<view class="info-list" v-if="evaluation">
					<view class="left-cnt">{{ repair["service-rate"] || "服务评价" }}</view>
					<view class="right-cnt">{{ evaluation }}</view>
				</view>
			</view>
		</scroll-view>
		<view class="float-btn" v-if="ifBtnShow">
			<button @click="operate" :data-id="itemId">{{ operationName }}</button>
		</view>
	</uni-base-page>
</template>

<script>
	import uniRate from "../../../components/uni-rate/uni-rate.vue";
	export default {
		components: {
			uniRate
		},
		data() {
			return {
				orderId: "",
				repairType: "",
				address: "",
				description: "",
				comments: "",
				date: "",
				imgSrc: "",
				statusCode: null,
				itemId: "",
				operationName: "",
				ifBtnShow: null,
				score: null,
				evaluation: "",
				acceptStatus: [],
				repairStatusName: ""
			}
		},
		computed: {
			repair() {
				return this.$t("repair")
			},
			title() {
				return this.$t("title")
			},
			common() {
				return this.$t("common")
			}
		},
		onReady() {
			this.$setTitle(this.title["detail"]);
		},
		onLoad: function(options) {
			var itemId = options.itemId;
			var status = options.status;
			if (status == 0) {
				this.ifBtnShow = true;
				this.operationName = this.repair["undo"] || "撤销";
			} else if (status == 2) {
				this.ifBtnShow = true;
				this.operationName = this.repair["comment"] || "评价";
			} else if (status == 3 || status == 4) {
				//已完成或已撤销
				this.ifBtnShow = true;
				this.operationName = this.common["delete"] || "删除";
			} else {
				this.ifBtnShow = false;

			}
			this.getDetail(itemId);
			this.acceptStatus = [{
					index: 0,
					status: this.repair["wait"] || "待处理"
				},
				{
					index: 1,
					status: this.repair["handling"] || "处理中"
				},
				{
					index: 2,
					status: this.repair["wait-comment"] || "已完成待评价"
				},
				{
					index: 3,
					status: this.repair["finished"] || "已完成"
				},
				{
					index: 4,
					status: this.repair["revoked"] || "已撤销"
				}
			];

		},


		methods: {
			getDetail(itemId) {
				this.$req.request({
					url: "/wyRepairs/app/getById",
					method: "GET",
					data: {
						id: itemId
					},
					success: res => {
						this.orderId = res.data.orderId;
						var repairType = res.data.repairType;
						this.repairType = this.common["repair-type"][repairType];
						this.address = res.data.roomFullName;
						this.date = res.data.reserveStartTime;
						this.description = res.data.content;
						var repairStatus = res.data.acceptStatus;
						this.repairStatusName = this.acceptStatus[repairStatus].status;
						this.imgSrc = res.data.repairImage;
						this.itemId = res.data.id;
						this.score = res.data.score;
						this.evaluation = res.data.evaluation;
						console.log("repair type====", this.repairType);
						console.log("repair status===", this.repairStatusName);
					}
				})
			},
			// 点击下方按钮
			operate(e) {
				var common = this.common;
				var id = e.currentTarget.dataset.id;
				if (this.operationName === this.repair["comment"]) {
					uni.navigateTo({
						url: "rate?itemId=" + id
					})
				} else if (this.operationName === this.repair["undo"]) {
					var that = this;
					uni.showModal({
						confirmText: that.common["confirm"] || "确定",
						cancelText: that.common["cancel"] || "取消",
						title: that.repair["undo-tips"] || "撤销提示",
						content: that.repair["undo-confirm"] || "是否确定撤销该报修申请？",
						success: function(res) {
							if (res.confirm) {
								that.$req.request({
									url: "/wyRepairs/app/backOutById",
									data: {
										id: id
									},
									success: res => {
										if (res.code == 0) {
											uni.showToast({
												title: that.repair["undo-success"] || "撤销成功",
												icon: "none",
												duration: 1000
											});
											uni.navigateTo({
												url: "repair?currentIndex=1"
											})
										}
									}
								})
							}
						}
					})
				} else if (this.operationName === this.common["delete"]) {
					//执行删除操作
					var that = this;
					uni.showModal({
						confirmText: common["confirm"] || "确定",
						cancelText: common["cancel"] || "取消",
						title: common["delete-tips"] || "删除提示",
						content: common["if-delete"] || "是否确定删除？",
						success:function(res){
							if(res.confirm) {
								that.deleteRecord(id);
							}
						}
					})
				}


			},
			//删除报修记录
			deleteRecord(id) {
				this.$req.request({
					url: "/wyRepairs/app/deleteById",
					data: {
						ids: id
					},
					success: res => {
						if (res.code == 0) {
							uni.showToast({
								title: "删除成功" || "abc",
								icon: "none",
								duration: 1000
							});
							uni.navigateTo({
								url: "repair?currentIndex=1"
							})
						}
					}
				})
			}
			
		}
	}
</script>

<style>
	scroll-view {
		position: absolute;
		height: 92%;
	}

	.info-list {
		background: #ffffff;
		min-height: 100upx;
		height: auto;
		width: 94%;
		display: inline-flex;
		margin-left: 3%;
		margin-right: 3%;
		margin-bottom: 4upx;
		border-bottom: 2upx solid #eeeeee;
	}

	.left-cnt {
		width: 30%;
		text-align: left;
		display: inline-block;
		margin-top: 3%;
		color: gray;
	}

	.right-cnt {
		width: 62%;
		padding-left: 18upx;
		text-align: left;
		display: inline-block;
		margin-top: 3%;
	}

	.right-cnt image {
		width: 100%;
	}

	.float-btn {
		width: 100%;
		/* height: 5%; */
		height: 70upx;
		display: block;
		align-items: middle;
		background: #FFFFFF;
		position: absolute;
		bottom: 0;
		padding: 10upx 0;
		border-top: 1upx solid #eeeeee;
	}

	.float-btn button {
		width: 20%;
		font-size: 26upx;
		border: 1upx solid #1E90FF;
		color: #1E90FF;
		background: transparent;
	}
</style>
