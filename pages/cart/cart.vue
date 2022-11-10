<template>
	<view class="container">
		<!-- 空白页 -->
		<view v-if="empty===true" class="empty">
			<image src="/static/nav/shopcat.png" mode="aspectFit"></image>
			<view v-if="empty===true" class="empty-tips">
				空空如也
				<navigator class="navigator" v-if="empty===true" url="../index/index" open-type="switchTab">随便逛逛>
				</navigator>
			</view>

		</view>
		<view v-else>
			<!-- 列表 -->
			<view class="cart-list">
				<block v-for="(item, index) in cartList" :key="index">
					<view class="cart-item">
						<view class="image-wrapper">
							<image :src="item.iconUrl" mode="aspectFill" ></image>
						</view>
						<view class="item-right">
							<text class="clamp title">{{item.spName}}</text>
							<text class="price">¥{{item.price}}</text>
							
							<uni-number-box class="uni-number-box" :min="1" :max="max" :value="parseInt(item.num)" :indexId="item.gwcID" @eventChange="numberChange" />
						</view>

						<text class="del-btn yticon icon-fork" @click="deleteCartItem(index, item.gwcID)"></text>
						
					</view>
				</block>
			</view>
			<!-- 底部菜单栏 -->
			<view class="action-section">				
				<view class="total-box">
					<text class="price">¥{{total}}</text>
				</view>
				<button type="primary" class="no-border confirm-btn ymcode_ml" @click="createOrder">去下单</button>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex';
	
	export default {
		data() {
			return {
				total: 0, //总价格
				allChecked: false, //全选状态  true|false
				empty: false, //空白页现实  true|false
				cartList: [],
				userid: '',
				login:false,
				max: 100 ,//设置最大值
				flag:false,
			};
		},

		onShow(){
			if (uni.getStorageSync('token')) {
				console.log("存在userid");
				this.empty = false;
				this.loadData();
			} else {
				this.login = true;
				uni.redirectTo({
					url:"/pages/public/login"
				})
			}			
		},
		watch: {
			//显示空白页
			cartList(e) {
				let empty = e.length === 0 ? true : false;
				if (this.empty !== empty) {
					this.empty = empty;
				}
			}
		},
		computed: {
			...mapState(['hasLogin'])
		},
		methods: {
			//请求数据
			 loadData() {
				this.$http("gwcListUser",
				JSON.stringify({
					token: uni.getStorageSync('token'),
				}),).then(res=>{
					if (res.data.code== 0) {
						this.cartList = res.data.gwcList;
						this.calcTotal(this.cartList); //计算总价
						this.calcNumber(this.cartList);//计算总数量
						this.set_tabBar();
					}
					else if(res.data.code==99){
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

			//监听image加载完成
			onImageLoad(key, index) {
				console.log(key);
				console.log(index);
				console.log("成功");
				this.$set(this[key][index], 'loaded', 'loaded');
				this.$set(this[key][index], 'showed', 'showed');
				
			},
			//监听image加载失败
			onImageError(key, index) {
				console.log("失败");
				this[key][index].image = '/static/errorImage.jpg';
			},
			navToLogin() {
				uni.navigateTo({
					url: '/pages/public/login'
				})
			},
			//选中状态处理
			check(type, index) {
				if (type === 'item') {
					this.cartList[index].checked = !this.cartList[index].checked;
				} else {
					const checked = !this.allChecked
					const list = this.cartList;
					list.forEach(item => {
						item.checked = checked;
					})
					this.allChecked = checked;
				}
				this.calcTotal(type);
			},
			//数量
			numberChange(item) {
				this.$http("gwcNumUpd", JSON.stringify({
					token: uni.getStorageSync('token'),
					gwcID: item.indexId,
					num: item.value
				}),).then(res=>{
					if (res.data.code == 0) {
						this.loadData();						
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
					} else {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
					}
				}).catch(err=>{
					console.log(err);
				})	
			},
			
			//删除
			deleteCartItem(index,gwcid) {				
				this.$http("gwcDel",
				JSON.stringify({
					token: uni.getStorageSync('token'),
					gwcID: gwcid	
				}),).then(res=>{
					if(res.data.code==0){
						this.loadData();
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
								
				this.max = 100
			},

			//清空
			clearCart() {
				uni.showModal({
					content: '清空购物车？',
					success: (e) => {
						if (e.confirm) {
							this.cartList = [];
						}
					}
				})
			},
			//计算总价
			calcTotal(list) {							
				let total = 0;				
				list.forEach(item => {
					total += Number(item.money);
					//console.log(item.je/100);
					
				})
			   //console.log(total);
				this.total = total;
			},
			//创建订单
			createOrder() {
				//判断是不是365活动，跳转对应的页面
				// if(this.cartList[0]['spid'] == 1){
				// 	uni.navigateTo({
				// 		url: `/pages/order/createOrder2`
				// 	})
				// }else{								
					uni.navigateTo({
						url: `/pages/order/createOrder`
					})
				// }
			},
				

			//计算总数量
			calcNumber(list) {							
				let total = 0;				
				list.forEach(item => {
					total += Number(item.num);
				})
				console.log('calcNumber=='+total);
				uni.setStorage({
					key: "cat_num",
					data: total
				})
				console.log('calcNumber22=='+uni.getStorageSync('cat_num'));
			},
			
			//设置购物车数字角标
			set_tabBar(){
				if (uni.getStorageSync('cat_num')) {
					let value = uni.getStorageSync('cat_num')
					// console.log('cat_num - '+value)
					
					if(value>0){
						uni.setTabBarBadge({
							index: 2,
							text: String(value),
							complete(e) {
								console.log(e);
							}
						});
					}else{
						//清除数字角标
						uni.hideTabBarRedDot({
							index: 2
						});
					}
				}else{
					console.log('cat_num - 不存在！')
					//清除数字角标
					uni.hideTabBarRedDot({
						index: 2
					});
				}
			}
		}
	}
</script>

<style lang='scss'>
	image {
	width: 320px;
	height: 240px;
	display: inline-block;
	overflow: hidden;
	
	}
	.image-wrapper image {
	width: 100%;
	height: 100%;
	-webkit-transition: .6s;
	transition: .6s;
	opacity: 2;
	
	}


	.container {
		padding-bottom: 134upx;

		/* 空白页 */
		.empty {
			position: fixed;
			left: 0;
			top: 0;
			width: 100%;
			height: 100vh;
			padding-bottom: 100upx;
			display: flex;
			justify-content: center;
			flex-direction: column;
			align-items: center;
			background: #fff;

			image {
				width: 600upx;
				height: 600upx;
				margin-bottom: 30upx;
			}

			.empty-tips {
				display: flex;
				font-size: $font-sm+2upx;
				color: $font-color-disabled;

				.navigator {
					color: $uni-color-primary;
					margin-left: 16upx;
				}
			}
		}
	}

	/* 购物车列表项 */
	.cart-item {
		display: flex;
		position: relative;
		padding: 20upx 20upx;

		.image-wrapper {
			width: 160upx;
			height: 160upx;
			flex-shrink: 0;
			position: relative;

			image {
				border-radius: 8upx;
			}
		}
		.image-wrapper1 {
			width: 230upx;
			height: 200upx;
			flex-shrink: 0;
			position: relative;
		
			image {
				border-radius: 8upx;
			}
		}

		.checkbox {
			position: absolute;
			left: -16upx;
			top: -16upx;
			z-index: 8;
			font-size: 44upx;
			line-height: 1;
			padding: 4upx;
			color: $font-color-disabled;
			background: #fff;
			border-radius: 50px;
		}

		.item-right {
			display: flex;
			flex-direction: column;
			flex: 1;
			overflow: hidden;
			position: relative;
			padding-left: 30upx;

			.title,
			.price {
				font-size: $font-base + 2upx;
				color: $font-color-dark;
				height: 40upx;
				line-height: 40upx;
			}

			.attr {
				font-size: 22rpx;
				color: $font-color-light;
				height: 50upx;
				line-height: 50upx;
			}

			.price {
				height: 50upx;
				line-height: 50upx;
			}
		}

		.del-btn {
			padding: 4upx 10upx;
			font-size: 34upx;
			height: 50upx;
			color: $font-color-light;
		}
	}

	/* 底部栏 */
	.action-section {
		/* #ifdef H5 */
		margin-bottom: 100upx;
		/* #endif */
		position: fixed;
		left: 30upx;
		bottom: 30upx;
		z-index: 95;
		display: flex;
		align-items: center;
		width: 690upx;
		height: 100upx;
		padding: 0 30upx;
		background: rgba(255, 255, 255, .9);
		box-shadow: 0 0 20upx 0 rgba(0, 0, 0, .5);
		border-radius: 16upx;

		.checkbox {
			height: 52upx;
			position: relative;

			image {
				width: 52upx;
				height: 100%;
				position: relative;
				z-index: 5;
			}
		}

		.clear-btn {
			position: absolute;
			left: 26upx;
			top: 0;
			z-index: 4;
			width: 0;
			height: 52upx;
			line-height: 52upx;
			padding-left: 38upx;
			font-size: $font-base;
			color: #fff;
			background: $font-color-disabled;
			border-radius: 0 50px 50px 0;
			opacity: 0;
			transition: .2s;

			&.show {
				opacity: 1;
				width: 120upx;
			}
		}

		.total-box {
			flex: 1;
			display: flex;
			flex-direction: column;
			text-align: left;
			padding-right: 40upx;

			.price {
				font-size: 40rpx;
				color: $font-color-dark;
				margin-left: 30rpx;
			}

			.coupon {
				font-size: $font-sm;
				color: $font-color-light;

				text {
					color: $font-color-dark;
				}
			}
		}

		.confirm-btn {
			padding: 0 38upx;
			margin: 0;
			border-radius: 100px;
			height: 76upx;
			line-height: 76upx;
			font-size: $font-base + 2upx;
			/* box-shadow: 1px 2px 5px rgba(217, 60, 93, 0.72) */
		}
	}

	/* 复选框选中状态 */
	.action-section .checkbox.checked,
	.cart-item .checkbox.checked {
		color: $uni-color-primary;
	}
	
</style>
