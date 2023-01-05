<template>
	<uni-base-page style="background: rgb(239,239,244);width: 100%;">
		<view class="dis-template">
			<ul>
				<li class="clear" v-for="(item,index) in discountList" :key="index">
					<view class="dis-left fl">
						<view class="money" v-if="item.disType == 1">￥{{item.disAmont}}</view>
						<view class="money" v-else-if="item.disType == 2">{{item.disRate}}折</view>
						<view class="money" v-else-if="item.disType == 3">{{item.disTimeSec/60/60}}{{ coupon["hours"] || "小时" }}</view>
						<!-- <view class="money" v-else="item.disType == 4">￥{{item.disAmontLimit}}</view> -->
						<view class="money" v-else><image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/free.png"></image></view>
						<view class="all">{{ coupon["residue"] || "剩余" }}/{{ coupon["total-number"] || "总次数" }}</view>
						<view class="num">{{item.grantCount}}/{{item.totalGrantCount}}</view>
					</view>
					<view class="dis-right fl">
						<view class="park" v-if="item.disType == 1">{{ coupon["money"] || "金额代金券" }}</view>
						<view class="park" v-else-if="item.disType == 2">{{ coupon["discount"] || "折扣代金券" }}</view>
						<view class="park" v-else-if="item.disType == 3">{{ coupon["time"] || "时间代金券" }}</view>
						<view class="park" v-else>{{ coupon["full"] || "全额代金券" }}</view>
						<view class="address">{{item.ownName}}</view>
						<view class="time" v-if="item.couponInvalidType == 1">{{ coupon["validity"] || "有效期" }}：{{item.invaildTime}}</view>
						<view class="time" v-else-if="item.couponInvalidType == 2">{{ coupon["validity"] || "有效期" }}：{{item.invaildTimeSec}}{{ coupon["hours-validity"] || "小时内有效" }}</view>
						<view class="time" v-else>{{ coupon["validity"] || "有效期" }}：{{ coupon["perpetual"] || "永久" }}</view>
					</view>
					<view class="code" @click="goToCode(item.id)">{{ coupon["qr-code"] || "二维码" }}</view>
				</li>
			</ul>
		</view>
	</uni-base-page>
</template>

<script>
	let currPage = 1;
	export default{
		data(){
			return {
				discountList:[],
			}
		},
		computed:{
			coupon() {
				return this.$t("coupon")
			}
		},
			
		// },
		// onReady() {
		// 	this.$setTitle(this.title["details"])
		// },
		onShow() {
			currPage = 1;
			this.discountList = [];
			this.getDiscountList();
		},
		methods:{
			// 获取优惠券模板列表
			getDiscountList(){
				this.$req.request({
					url: "/prefCouponTemplate/app/list",
					method: "POST",
					data: {
						pageSize: 10,
						currPage: currPage,
						communityId: this.$getUserInfo().currentCommunity.id,
					},
					isShowLoading: false, // 值为false时，不显示uni.showLoading
					success: (res) => {
						if (res.code === 0) {
							currPage++;
							this.discountList = this.discountList.concat(res.data.list);
							this.discountList.forEach(item =>{
								item.invaildTimeSec = (item.invaildTimeSec) / 60 / 60;
								if(item.disRate > 0){
									item.disRate = item.disRate*10
								}else if(item.disRate == 1){
									item.disRate = 10
								}
								
							})
						}
					},
				});
			},
			// 跳转到二维码页面
			goToCode(id){
				uni.navigateTo({
					url: "/sub-package1/pages/discount-code/discount-code?id=" + id
				})
			},
		},
		// 监听触底加载更多
		onReachBottom() {
			this.getDiscountList();
		},
	}
</script>

<style lang="scss" scoped>
	.dis-template{
		padding: 40upx 20upx;
		ul{
			padding-left: 0;
			li{
				background: rgb(228,228,228);
				border-radius: 20upx;
				margin-bottom: 30upx;
				padding: 20upx 0;
				position: relative;
				.dis-left{
					width: 35%;
					text-align: center;
					.money{
						font-size: 45upx;
						color: rgb(89, 166, 148);
						font-weight: bolder;
						line-height: 70upx;
						image{
							width: 90upx;
							height: 90upx;
							margin-top: -12upx;
							margin-bottom: -20upx;
							opacity: 0.6;
						}
					}
					.all,.num{
						font-size: 24upx;
						color: #aaa;
						line-height: 20upx;
					}
				}
				.dis-right{
					width: 60%;
					.park{
						font-size: 30upx;
						color: #088b68;
					}
					.address,.time{
						font-size: 28upx;
						color: #aaa;
						line-height: 40upx;
					}
				}
				.code{
					font-size: 24upx;
					color: rgb(89, 166, 148);
					padding: 0 20upx;
					background: #fff;
					border: 1px solid rgb(89, 166, 148);
					position: absolute;
					right: 80upx;
					top: 60upx;
					border-radius: 14upx;
				}
			}
		}
	}
</style>
