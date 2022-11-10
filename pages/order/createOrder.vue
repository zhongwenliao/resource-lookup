<template>
	<view class="container">
		<view class="goods-section">			
			<!-- 商品列表 -->
			<view class="g-item"v-for="(good,index) in gwclist" :key="index">				
				<image :src="good.iconUrl" />
				<view class="right">
					<text class="title clamp">{{good.spName}}</text>					
					<view class="price-box">
						<text class="price">{{good.price}}元</text>
						<text class="number">x {{good.num}}</text>
					</view>
				</view>
			</view>
			
		</view>
		
		<view class="entrance">
			<view class="item">
				<view class="content">
					<view v-show="current === 0">
						<navigator url="/pages/address/address?source=1" class="address-section">
							<view class="order-content">
								<text class="yticon icon-shouhuodizhi"></text>
								<view class="cen">
									<view class="top">
										<text class="name">{{addressData.sjr}}</text>
										<text class="mobile" v-show="address">{{addressData.sjrdh}}</text>
									</view>
									<text class="address" v-if="addressData.sjr!='请选择地址'"> {{address}} </text>
								</view>
								<text class="yticon icon-you"></text>
							</view>
						</navigator>
					</view>
				</view>
			</view>
		</view>

		<!-- 金额明细 -->
		<view class="yt-list">
			<view class="yt-list-cell b-b">
				<text class="cell-tit clamp">订单金额</text>
				<text class="cell-tip">{{total}}元</text>
			</view>
			<view class="yt-list-cell desc-cell">
				<text class="cell-tit clamp">备注</text>
				<input class="desc" type="text" v-model="desc" placeholder="请填写备注信息" placeholder-class="placeholder" maxlength="20" />
			</view>
		</view>
		
		<!-- 底部 -->
		<view class="footer">
			<view class="price-content">
				<text>实付款</text>
				<text class="price-tip">￥</text>
				<text class="price">{{total}}</text>
			</view>
			<text class="add-btn ymcode_ml" @click="submit">去结算</text>
		</view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				code:"",
				iswx:false,
				yhqid:"",
				total:0,
				userid:uni.getStorageSync('userid'),
				maskState: 0, //优惠券面板显示状态				
				openid:"ojn2D4pCj-BMabUZRSkU6ox4GKmA",
				aid:0,
				desc: '', //备注
				payType: 1, //1微信
				gwclist:"",
				yhjlist:"",							
				addressData: {
					sjr: '请选择地址',
				},
				address: '',
				psfsItems: [],
				psfsid:0,
				psfsIndex:0,
				current: 0,
				name:'',
				timerange: [],
				op: 0,
				choose: '',
			}
		},
		onLoad(option){
			this.aid= option.aid;
		},
		onShow(){
			this.addressget();
			this.getcatlist();
		},
		methods: {
			//用户收货地址获取
			addressget(){
				if(this.aid == undefined){
					this.aid = 0
				}

				this.$http("addressGet",
				JSON.stringify({
					token: uni.getStorageSync('token'),
					aid:this.aid
				}),).then(res=>{	
					if(res.data.code==0){
						if(res.data.address.sheng != ''){
							this.addressData = res.data.address;
							this.aid = res.data.address.aid;
							this.address = this.addressData.sheng + this.addressData.shi + this.addressData.qu + this.addressData.xxdz
						} else {
							this.addressData.sjr = '请选择地址'
							this.aid = 0
							this.address = ''
						}
					} else if(res.data.code == 99){
						uni.showModal({
						    content: "请先登录",
						    success: (e)=>{
						    	if(e.confirm){
									uni.clearStorage();				    		
						    		setTimeout(()=>{
						    			uni.redirectTo({
						    				url:"../public/login"
						    			})
						    		}, 200)
						    	}
						    }
						});
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			
			//购物车列表
			getcatlist(){
				this.$http("gwcListUser",
				JSON.stringify({
					token: uni.getStorageSync('token'),
				}),).then(res=>{
					if(res.data.code==0){
						this.gwclist= res.data.gwcList;
					    let list=res.data.gwcList;
						let total = 0;				
						list.forEach(item => {
							total += Number(item.money);	
						})						  
						this.total = total;					
					}
					else if(res.data.code == 99){
						uni.showModal({
						    content: "请先登录",
						    success: (e)=>{
						    	if(e.confirm){
									uni.clearStorage();				    		
						    		setTimeout(()=>{
						    			uni.redirectTo({
						    				url:"../public/login"
						    			})
						    		}, 200)
						    	}
						    }
						});
					}
					else{
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
					}

				}).catch(err=>{
					console.log(err);
				})	
			},
			numberChange(data) {
				this.number = data.number;
			},
			changePayType(type){
				this.payType = type;
			},
			
			submit(){
				this.$http("shangPinOrderAdd", JSON.stringify({
					aid:this.aid,
					yqpsTime:this.choose,
					psfsID:''+this.psfsid,
					remark:this.desc,
					token:uni.getStorageSync("token")
				}),).then(res=>{	
					if(res.data.code==0){
						//清除数字角标
						this.set_tabBar();
						
						uni.redirectTo({
							url:'./orderjs?ddid='+res.data.data
						})						
						
					}else if(res.data.code == 99){
						uni.showModal({
						    content: "请先登录",
						    success: (e)=>{
						    	if(e.confirm){
									uni.clearStorage();				    		
						    		setTimeout(()=>{
						    			uni.redirectTo({
						    				url:"../public/login"
						    			})
						    		}, 200)
						    	}
						    }
						});
					}else{
						if(this.addressData.sjr=="请选择地址"){
							uni.showToast({
								title: "请选择收货地址",
								icon: 'none'
							});
						} else {
							uni.showToast({
								title: res.data.msg,
								icon: 'none'
							});
						}
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			//设置购物车数字角标
			set_tabBar(){
				if (uni.getStorageSync('cat_num')) {
					uni.setStorage({
						key: "cat_num",
						data: 0
					})			
				}
			}
		}
	}
</script>

<style lang="scss">
	page {
		background: $page-color-base;
		padding-bottom: 100upx;
	}
	
	.container{
		padding: 0 20upx;
	}

	.address-section {
		background: #fff;
		position: relative;

		.order-content {
			display: flex;
			align-items: center;
		}

		.icon-shouhuodizhi {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			width: 60rpx;
			color: #888;
			font-size: 44rpx;
		}

		.cen {
			display: flex;
			flex-direction: column;
			flex: 1;
			font-size: 28upx;
			color: $font-color-dark;
		}

		.name {
			font-size: 34upx;
			margin-right: 24upx;
		}

		.address {
			margin-top: 16upx;
			color: $font-color-light;
		}

		.icon-you {
			font-size: 32upx;
			color: $font-color-light;
		}

		.a-bg {
			position: absolute;
			left: 0;
			bottom: 0;
			display: block;
			width: 100%;
			height: 5upx;
		}
		
	}

	.goods-section {
		clear: both;
		background: #fff;
		padding: 10rpx;
		border-right: 10rpx;

		.g-header {
			display: flex;
			align-items: center;
			height: 84upx;
			padding: 0 30upx;
			position: relative;
		}

		.logo {
			display: block;
			width: 50upx;
			height: 50upx;
			border-radius: 100px;
		}

		.name {
			font-size: 30upx;
			color: $font-color-base;
			margin-left: 24upx;
		}

		.g-item {
			display: flex;
			margin: 20upx 30upx;

			image {
				flex-shrink: 0;
				display: block;
				width: 160upx;
				height: 160upx;
				border-radius: 10upx;
			}

			.right {
				flex: 1;
				padding-left: 24upx;
				overflow: hidden;
			}

			.title {
				font-size: 30upx;
				color: $font-color-dark;
			}

			.spec {
				font-size: 26upx;
				color: $font-color-light;
			}

			.price-box {
				display: flex;
				align-items: center;
				font-size: 32upx;
				color: $font-color-dark;
				padding-top: 10upx;

				.price {
					margin-bottom: 4upx;
				}
				.number{
					font-size: 26upx;
					color: $font-color-base;
					margin-left: 20upx;
				}
			}

			.step-box {
				position: relative;
			}
		}
	}
	.yt-list {
		margin-top: 16upx;
		background: #fff;
	}

	.yt-list-cell {
		display: flex;
		align-items: center;
		padding: 10upx 30upx 10upx 40upx;
		line-height: 70upx;
		position: relative;

		&.cell-hover {
			background: #fafafa;
		}

		&.b-b:after {
			left: 30upx;
		}

		.cell-icon {
			height: 32upx;
			width: 32upx;
			font-size: 22upx;
			color: #fff;
			text-align: center;
			line-height: 32upx;
			background: #f85e52;
			border-radius: 4upx;
			margin-right: 12upx;

			&.hb {
				background: #ffaa0e;
			}

			&.lpk {
				background: #3ab54a;
			}

		}

		.cell-more {
			align-self: center;
			font-size: 24upx;
			color: $font-color-light;
			margin-left: 8upx;
			margin-right: -10upx;
		}

		.cell-tit {
			flex: 1;
			font-size: 26upx;
			color: $font-color-light;
			margin-right: 10upx;
		}

		.cell-tip {
			font-size: 26upx;
			color: $font-color-dark;

			&.disabled {
				color: $font-color-light;
			}

			&.active {
				color: $base-color;
			}
			&.red{
				color: $base-color;
			}
		}

		&.desc-cell {
			.cell-tit {
				max-width: 90upx;
			}
		}

		.desc {
			flex: 1;
			font-size: $font-base;
			color: $font-color-dark;
		}
	}
	
	/* 支付列表 */
	.pay-list{
		padding-left: 40upx;
		margin-top: 16upx;
		background: #fff;
		.pay-item{
			display: flex;
			align-items: center;
			padding-right: 20upx;
			line-height: 1;
			height: 110upx;	
			position: relative;
		}
		.icon-weixinzhifu{
			width: 80upx;
			font-size: 40upx;
			color: #6BCC03;
		}
		.icon-alipay{
			width: 80upx;
			font-size: 40upx;
			color: #06B4FD;
		}
		.icon-xuanzhong2{
			display: flex;
			align-items: center;
			justify-content: center;
			width: 60upx;
			height: 60upx;
			font-size: 40upx;
			color: $base-color;
		}
		.tit{
			font-size: 32upx;
			color: $font-color-dark;
			flex: 1;
		}
	}
	
	.footer{
		position: fixed;
		left: 0;
		bottom: 0;
		z-index: 995;
		display: flex;
		align-items: center;
		width: 100%;
		height: 90upx;
		justify-content: space-between;
		font-size: 30upx;
		background-color: #fff;
		z-index: 998;
		color: $font-color-base;
		box-shadow: 0 -1px 5px rgba(0,0,0,.1);
		.price-content{
			padding-left: 30upx;
		}
		.price-tip{
			color: $base-color;
			margin-left: 8upx;
		}
		.price{
			font-size: 36upx;
			color: $base-color;
		}
		.add-btn{
			display:flex;
			align-items:center;
			justify-content: center;
			width: 280upx;
			height: 100%;
			color: #fff;
			font-size: 32upx;
		}
	}
	
	/* 优惠券面板 */
	.mask{
		display: flex;
		align-items: flex-end;
		position: fixed;
		left: 0;
		top: var(--window-top);
		bottom: 0;
		width: 100%;
		background: rgba(0,0,0,0);
		z-index: 9995;
		transition: .3s;
		
		.mask-content{
			width: 100%;
			min-height: 30vh;
			max-height: 70vh;
			background: #f3f3f3;
			transform: translateY(100%);
			transition: .3s;
			overflow-y:scroll;
		}
		&.none{
			display: none;
		}
		&.show{
			background: rgba(0,0,0,.4);
			
			.mask-content{
				transform: translateY(0);
			}
		}
	}

	.content {
		padding: 0 30rpx;
		width: 100%;
	}
	
	.entrance {
		position: relative;
		margin-bottom: 10rpx;
		border-radius: 10rpx;
		background-color: #ffffff;
		box-shadow: $box-shadow;
		margin-top: 10upx;
		// padding: 30rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 140rpx;
		border-right: 10rpx;
		
		.item {
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
		}
	}
</style>
