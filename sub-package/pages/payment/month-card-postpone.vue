<template>
	<view class="article_main">
		<!--姓名-->
		<view class="input_item">
			<view class="input_text"><span>{{'姓名'}}</span></view>
			<view class="" style="line-height: 64upx;">
				{{cardInfo.person}}
			</view>
		</view>
		<!--姓名 end-->

		<!--联系电话-->
		<view class="input_item">
			<view class="input_text"><span>{{'联系电话'}}</span></view>
			<view class="" style="line-height: 64upx;">
				{{cardInfo.phone}}
			</view>
		</view>
		<!--联系电话 end-->
		<!--车牌号码-->
		<view class="input_item">
			<view class="input_text">{{'车牌号码'}}</view>
			<view class="" style="line-height: 64upx;">
				{{carNoArray}}
			</view>
		</view>
		<!--车牌号码end-->
		<p class="hold15"></p>
		<!--办理时长-->
		<view class="input_item">
			<view class="input_text"><span>{{'办理时长'}}</span></view>
			<picker @change="bindPickerChange" :range="timeArray" class="selectStyle">
				<view class="select_item_style">
					<view class="uni-input" style="height: 50upx;line-height: 50upx;">{{applyTime}}</view>
					<u-icon name="arrow-down" size="20" class="arrow-down"></u-icon>
				</view>
			</picker>
		</view>
		<!--办理时长 end-->
		
		<!-- 开始时间 -->
		<view class="input_item">
			<view class="input_text"><span>开始时间</span></view>
			<view class="" style="line-height: 64upx;">
				{{cardInfo.startTime}}
			</view>
		</view>
		<!-- 开始时间 end-->
		
		<!-- 结束时间 -->
		<view class="input_item">
			<view class="input_text"><span>结束时间</span></view>
			<view class="" style="line-height: 64upx;">
				{{cardInfo.endTime}}
			</view>
		</view>
		<!-- 结束时间 end-->
		<p class="hold15"></p>
		<!--备注-->
		<view class="input_item">
			<view class="input_text"><span>{{'备注'}}</span></view>
			<u-input style="border: 1px solid #E3E3E3;width: 75%;" type="textarea" v-model="remark" height="150" maxlength="50"/>
		</view>
		<!--备注 end-->

		<!--提交按钮-->
		<button @click="changes">{{articleRelease['submit']||'提交'}}</button>
		<!--提交按钮 end-->
	</view>
</template>

<script>
	export default {
		data() {
			return {
				phone: '', //用户手机号(接口获取)
				userList: '', //
				imgSrc: "http://yuanzhoulvwego.com/wp-content/uploads/static/img/house/take-photo.jpg",
				status_bar: true,
				goods: [],
				cardInfo: {},
				remark: "",
				timeArray: ['1月', '2月', '3月', '4月','5月', '6月', '7月', '8月','9月', '10月', '11月', '12月'],
				applyTime: "请选择时长",
				carNoArray: {}
			}
		},
		computed: {
			articleRelease() {
				return this.$t("article-release") //返回出国际化的语言数据
			},
			common() {
				return this.$t("common") //返回出国际化的语言数据
			},
		},
		methods: {
			bindPickerChange(e) {
				let index = e.target.value;
				this.timeNum = parseInt(index) + 1;
				this.applyTime = this.timeNum + "月"
			},
			//提交
			changes() {
				var currentCommunity = this.$getUserInfo().currentCommunity;
				if (currentCommunity !== undefined) {
					var communityId = currentCommunity.id;
					if(this.goods.length != ""){
						let carNo = this.goods.map(item =>{
							return item;
						})
						this.carNoObj = carNo.join(",")
					}
					if(!this.cardInfo.person){
						this.$showToast("请输入姓名");
						return;
					}
					if(!this.cardInfo.phone){
						this.$showToast("请输入电话号码");
						return;
					}
					if(this.goods.length == ""){
						this.$showToast("请输入车牌号码");
						return;
					}
					if(this.applyTime === "请选择时长"){
						this.$showToast("请选择时长");
						return;
					}
					
					if(!this.remark){
						this.$showToast("请输入备注");
						return;
					}
					this.$req.request({
						url: "/parkCard/app/delay",
						method: "POST",
						data: {
							cardId: this.cardInfo.id,
							person: this.cardInfo.person,
							phone: this.cardInfo.phone,
							remark: this.remark,
							communityId: communityId,
							carNo: this.carNoObj,
							timeNum: this.timeNum,
						},
						isShowLoading: false,
						success: res => {
							if(res.code == 0){
								this.$showToast(res.msg);
								setTimeout(()=>{
									uni.navigateTo({
										url: "month-card-history"
									})
								},1000)
							}
						}
					});
				}
			},
			//点击加号新增车牌号
			addGoods() {
				this.goods.push("");
			},
			//点击减号减少车牌号
			delGoods(item, i) {
				this.goods.splice(i, 1);
			}
		},
		onLoad(option) {
			this.cardInfo = JSON.parse(option.item);
			this.carNoArray = this.cardInfo.carNoArray.join(",");
			this.goods = this.cardInfo.carNoArray;
		},
	}
</script>

<style scoped>
	.article_main {
		width: 100%;
		font-size: 30upx;
		background-color: #F8F9FB;
		overflow-x: hidden;
	}

	.uni-form-item {
		padding: 10px 0px;
	}

	.roomtext {
		line-height: 33px;
		height: 32px;
	}

	.uni-input {
		height: 65upx;
		font-size: 30upx;
		padding: 0px;
		line-height: 65upx;
	}

	.arrow-down{
		position: absolute;
		right:4%;
		top: 25%;
		/* #ifdef MP-WEIXIN || MP-ALIPAY */
		top: 5%;
		/* #endif */
	}
	.input_item {
		display: flex;
		background: #FFFFFF;
		padding: 20upx 24upx;
		margin-bottom: 1px;
	}

	.input_text {
		width: 130upx;
		margin-right: 20upx;
		height: 65upx;
		line-height: 65upx;
		text-align: right;
	}

	.input_text::before {
		content: "*";
		color: #ff0000;
		font-size: 20upx;
		position: relative;
		top: -8upx;
		right: 5upx;
	}


	.del {
		position: absolute;
		right: 0;
	}

	.img_box>view {
		margin: 10upx;
	}

	button {
		position: fixed;
		width: 90%;
		left: 5%;
		bottom: 24upx;
		background: linear-gradient(118deg, #01DCA3 0%, #088B68 100%);
		box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
		border-radius: 50upx 50upx 50upx 50upx;
		color: #FFFFFF;
	}



	.input_item .goods-box {
		width: 90%;
		display: flex;
		border-bottom: 1px solid #d1d1d1;
		padding: 4upx 20upx;
	}

	.goods-box .u-input {
		width: 43%;
	}

	.goods-border {
		background: #d1d1d1;
		display: inline-block;
		width: 1px;
		margin: 10upx 20upx;
	}

	.selectStyle {
		display: flex;
		margin: auto 0;
	}

	.select_item_style {
		border: 2upx solid #d1d1d1;
		padding: 0px 10upx;
		border-radius: 4upx;
		width: 200upx;
		display: inline-block;
		height: 50upx;
		line-height: 45upx;
		margin: auto 0;
		vertical-align: middle;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		position: relative;
	}
</style>
