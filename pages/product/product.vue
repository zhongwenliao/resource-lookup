<template>
	<view class="container">
		<view class="carousel">
			<swiper indicator-dots circular=true duration="400" autoplay="true">
				<swiper-item class="swiper-item" v-for="(item,index) in imgList" :key="index">
					<view class="image-wrapper">
						<image :src="item.url" class="loaded" mode=""></image>
					</view>
				</swiper-item>
			</swiper>
		</view>

		<view class="introduce-section">
			<text class="title">{{spName}}</text>
			<text class="spsm" style="display: flex;font-size: 26rpx;">{{spsm}}</text>
			<view class="price-box">
				<text class="price-tip">¥</text>
				<text class="price">{{price}}</text>
				<text class="m-price">¥{{price}}</text> 
			</view>
		</view>

		<view class="detail-desc">
			<view class="d-header">
				<text>标准餐详情</text>
			</view>
			<div v-for="(item,index) in spxqimg" :key="index">
				<image style="width:100%;"mode="widthFix" v-bind:src="item.url"></image>				
			</div>
		</view>

		<!-- 底部操作菜单 -->
		<view class="page_bottom_page">
			<navigator url="/pages/index/index" open-type="switchTab" class="p-b-btn">
				<text class="yticon icon-xiatubiao--copy"></text>
				<text>首页</text>
			</navigator>
			<uni-badge class="uni-badge-left-margin" :text="value" absolute="rightTop" :offset="[5, 5]" size="small" type="primary">
				<view class="p-b-btn" @click="navsetTo">
					<text class="yticon icon-gouwuche"></text>
					<text>购物车</text>
				</view>
			</uni-badge>
			<view class="bottom_view">
				<view class="bottom_group1 bottom_b" @click="submits">
					<view class="group_view">
						<text>￥</text>
						<text>{{price}}</text>
					</view>
					<view class="">加入购物车</view>
				</view>
				<!-- <view class="bottom_alone bottom_b" @click="submits">
					<view class="alone_view">
						<text>￥</text>
						<text>{{price}}</text>
					</view>
					<view class="">直接购买</view>
				</view>
				<view class="bottom_group bottom_b" @click="navaddressTo(priceHySpId)">
					<view class="group_view">
						<text>￥</text>
						<text>{{priceHy}}</text>
					</view>
					<view class="">拼团购买</view>
				</view> -->
			</view>
		</view>
			
<!-- 		<view class="page-bottom">
			<navigator url="/pages/index/index" open-type="switchTab" class="p-b-btn mr">
				<text class="yticon icon-xiatubiao--copy"></text>
				<text>首页</text>
			</navigator>
			<uni-badge class="uni-badge-left-margin" :text="value" absolute="rightTop" :offset="[5, 5]" size="small" type="primary">
				<navigator url="/pages/cart/cart" open-type="switchTab" class="p-b-btn">
					<text class="yticon icon-gouwuche"></text>
					<text>购物车</text>
				</navigator>
			</uni-badge>
			
			<view class="action-btn-group">			
				<button type="primary" class=" action-btn no-border add-cart-btn"@click="submits">加入购物车</button>
			</view>
		</view> -->

		<!-- 规格-模态层弹窗 -->
		<!-- <view class="popup spec" :class="specClass" @touchmove.stop.prevent="stopPrevent" @click="toggleSpec"> -->
			<!-- 遮罩层 -->
			<!-- <view class="mask"></view>
			<view class="layer attr-content" @click.stop="stopPrevent">
				<view class="a-t">
					<image v-bind:src="ggimg"></image>
					<view class="right">
						<text class="price">¥{{splsj/100}}</text>
						<text class="stock">库存：{{spkc}}</text>
						<view class="selected">
							已选：
							<text class="selected-text" v-for="(sItem, sIndex) in specSelected" :key="sIndex">
								{{sItem.mxmc}}
							</text>
						</view>
					</view>
				</view>
				<view v-for="(item,index) in specList" :key="index" class="attr-list">
					<text>{{item.ggmc}}</text>
					<view class="item-list">
						<text 
							v-for="(childItem, childIndex) in result" 
							v-if="childItem.ggid === item.id"
							:key="childIndex" class="tit"
							:class="{selected: childItem.selected}"
							@click="selectSpec(childIndex, childItem.ggid)"
						>
							{{childItem.mxmc}}
						</text>
					</view>
				</view>
				<button class="btn" @click="toggleSpecfinish">完成</button>
			</view>
		</view> -->
		<!-- 分享 -->
		<!-- <share ref="share" :contentHeight="580" :shareList="shareList"></share> -->
		
		<!-- 优惠券面板 -->
		<!-- <view class="mask" :class="maskState===0 ? 'none' : maskState===1 ? 'show' : ''" @click="toggleMask"> -->
			<!-- <view class="mask-content" > -->
				<!-- 优惠券页面，仿mt -->
				<!-- <view class="coupon-item" v-for="(item,index) in yhjlist" :key="index">
					<view class="con"@click.stop.prevent="stopPrevent">
						<view class="left">
							<text class="title">{{item.yhqmc}}</text>
							<text class="time">有效期至{{item.yxq}}</text>
						</view>
						<view class="right">
							<text class="price">{{item.je/100}}</text>
							<text>{{item.yhjxz}}</text>
							
						</view>
						
						<view class="circle l"></view>
						<view class="circle r"></view>
					</view>
					<text class="tips">{{item.ztmc}}</text>
					<button class="tipsbutton"@click="yhjlq(item.yhqid,item.yxq)">立即领取</button>
				</view> -->
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			maskState: 0, //优惠券面板显示状态	
			yhjlist:"",
			result:[],
			spid:'',
			spxqimg:'',
			spsm:'',
			ggimg: '',
			spName: '',
			splsj: '',
			spkc: '',
			json: {},
			userid: uni.getStorageSync("userid"),
			specClass: 'none',
			specSelected: [],
			favorite: true,
			shareList: [],
			imgList: [],									
			specList: [],
			specChildList: [],
			price:0,
			priceHy: 0,
			priceHySpId: 0,
			value:0,
			token: ''
		};
	},
	onLoad(options) {
		let id = options.spid;
		this.spid=options.spid;
		this.sptTopimg(id);
		this.get_num();
		
		if(uni.getStorageSync('token')){
			this.token = uni.getStorageSync('token')
		}
	},
	methods: {
		navsetTo(){
			if(uni.getStorageSync("token")){
				uni.switchTab({
					url: '/pages/cart/cart'
				})
			} else {
				uni.showModal({
				    content: '请先登录',
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
		},
		//获取商品顶部图
		sptTopimg(id) {
			this.$http("shangPinInfo",
			JSON.stringify({
				spID: id,
				token: ""
				}),).then(res=>{
				if (res.data.code != 0) {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					});
				} else {
					this.json = res.data.shangPinInfo;
					// console.log(this.json);
					this.imgList = this.json.imgList.viewList;
					this.spxqimg=this.json.imgList.detailList;
					this.spName = this.json.spName;
					this.price = this.json.price;
					this.priceHy = this.json.priceHy
					this.priceHySpId = this.json.spID
					this.spkc = this.json.kcsl;
					this.ggimg = this.json.icon_url;
					this.spsm=this.json.remark;
					
					// this.specList.forEach(item=>{
					// 	for(let cItem of this.result){
					// 		if(cItem.ggid === item.id){
					// 			this.$set(cItem, 'selected', true);
					// 			this.specSelected.push(cItem);
					// 			console.log(this.specSelected);
					// 			break; 
					// 		}
					// 	}
					// })
				}					
			}).catch(err=>{
				console.log(err);
			})
		},
		navaddressTo(id){
			if(uni.getStorageSync("token")){
				uni.navigateTo({
					url: '/pages/user/myGroup?spid='+id
				});
			} else {
				uni.showModal({
				    content: '请先登录',
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
		},
		submits(){
			if(uni.getStorageSync("token")){
				this.$http("gwcAdd", JSON.stringify({
					spID: this.spid,
					token: this.token,
					num:1,
				}),).then(res=>{
					if(res.data.code == 0){
						this.value = this.value+1
						uni.setStorage({
							key: "cat_num",
							data: this.value
						})
						uni.setTabBarBadge({
						  index: 2,
						  text: String(this.value)
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
						uni.showToast({
							title:res.data.msg,
							icon:"none"
						})
					}
				}).catch(err=>{
					console.log(err);
				})	
			} else {
				uni.showModal({
				    content: '请先登录',
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
		},
		
		//获取购物车里菜品数量
		get_num(){
			if (uni.getStorageSync('cat_num')) {
				this.value = uni.getStorageSync('cat_num')
			}
		},
		
		//显示优惠券面板
		// toggleMask(type){
		// 	console.log(1111);
		// 	let timer = type === 'show' ? 10 : 300;
		// 	let	state = type === 'show' ? 1 : 0;
		// 	this.maskState = 2;
		// 	setTimeout(()=>{
		// 		this.maskState = state;
		// 	}, timer)
		// },
		// //优惠券领取
		// yhjlq(yhqid,yxq){
		// 	uni.request({
		// 		url: BASE_URL.BASE_URL+'yhqToUser',
		// 		data: JSON.stringify({
		// 			yhqid: yhqid,
		// 			userid: this.userid,
		// 			yxq:yxq
					
		// 		}),
		// 		header: {
		// 			'content-type': 'application/x-www-form-urlencoded' //自定义请求头信息
		// 		},
		// 		method: 'POST',
		// 		//dataType:'json',
		// 		success: (res) => {
		// 			uni.showToast({
		// 				title:res.data.msg,
		// 				icon:"success"
		// 			})
		// 		}
		// 	});				
		// },
		
		// //规格弹窗开关
		// toggleSpec() {					
		// },
		
		// //添加规格完成事件
		// toggleSpecfinish() {
		// 	this.$http("gwcAdd",
		// 	JSON.stringify({
		// 		spid: this.spid,
		// 		userid: this.userid,
		// 		num:1
		// 	}),).then(res=>{	
		// 		uni.showToast({
		// 				title:res.data.msg,
		// 				icon:"success"
		// 			})
		// 		if(this.specClass === 'show'){
		// 			this.specClass = 'hide';
		// 			setTimeout(() => {
		// 				this.specClass = 'none';
		// 			}, 250);
		// 		}else if(this.specClass === 'none'){
		// 			this.specClass = 'show';
		// 		}	
		// 	}).catch(err=>{
		// 		console.log(err);
		// 	})

		// },
		// //分享
		// share() {
		// 	this.$refs.share.toggleMask();
		// },
		// //收藏
		// toFavorite() {
		// 	this.favorite = !this.favorite;
		// },
		// buy() {
		// 	uni.navigateTo({
		// 		url: `/pages/order/createOrder`
		// 	})
		// },
		// car() {
		// 	uni.navigateTo({
		// 		url: `/pages/order/createOrder`
		// 	})
		// },
		// stopPrevent() {},
		
		// //获取会员等级价格
		// get_price(){
		// 	this.$http("bzcPriceUser",
		// 	JSON.stringify({
		// 		userid: this.userid,
		// 		bzcid: this.spid					
		// 	}),).then(res=>{	
		// 		if (res.data.status != 0) {
		// 			uni.showToast({
		// 				title: res.data.msg,
		// 				icon: 'none'
		// 			});
		// 		} else {
		// 			this.splsj = res.data.data_gl
		// 		}
		// 	}).catch(err=>{
		// 		console.log(err);
		// 	}) 
		// }
	},
}
</script>

<style scoped lang='scss'>
page {
	background: $page-color-base;
	padding-bottom: 160upx;
}

.icon-you {
	font-size: $font-base + 2upx;
	color: #888;
}

.carousel {
	height: 422upx;
	position: relative;

	swiper {
		height: 100%;
	}

	.image-wrapper {
		width: 100%;
		height: 100%;
	}

	.swiper-item {
		display: flex;
		justify-content: center;
		align-content: center;
		height: 750upx;
		overflow: hidden;

		image {
			width: 100%;
			height: 100%;
		}
	}
}

/* 标题简介 */
.introduce-section {
	background: #fff;
	padding: 20upx 20upx 0;

	.title {
		font-size: 32upx;
		color: $font-color-dark;
		height: 50upx;
		line-height: 50upx;
	}

	.price-box {
		display: flex;
		align-items: baseline;
		height: 64upx;
		padding: 10upx 0;
		font-size: 26upx;
		color: $uni-color-primary;
	}

	.price {
		font-size: $font-lg + 2upx;
	}

	.m-price {
		margin: 0 12upx;
		color: $font-color-light;
		text-decoration: line-through;
	}

	.coupon-tip {
		align-items: center;
		padding: 4upx 10upx;
		background: $uni-color-primary;
		font-size: $font-sm;
		color: #fff;
		border-radius: 6upx;
		line-height: 1;
		transform: translateY(-4upx);
	}
}

/* 分享 */
.share-section {
	display: flex;
	align-items: center;
	color: $font-color-base;
	background: linear-gradient(left, #fdf5f6, #fbebf6);
	padding: 12upx 30upx;

	.share-icon {
		display: flex;
		align-items: center;
		width: 70upx;
		height: 30upx;
		line-height: 1;
		border: 1px solid $uni-color-primary;
		border-radius: 4upx;
		position: relative;
		overflow: hidden;
		font-size: 22upx;
		color: $uni-color-primary;

		&:after {
			content: '';
			width: 50upx;
			height: 50upx;
			border-radius: 50%;
			left: -20upx;
			top: -12upx;
			position: absolute;
			background: $uni-color-primary;
		}
	}

	.icon-xingxing {
		position: relative;
		z-index: 1;
		font-size: 24upx;
		margin-left: 2upx;
		margin-right: 10upx;
		color: #fff;
		line-height: 1;
	}

	.tit {
		font-size: $font-base;
		margin-left: 10upx;
	}

	.icon-bangzhu1 {
		padding: 10upx;
		font-size: 30upx;
		line-height: 1;
	}

	.share-btn {
		flex: 1;
		text-align: right;
		font-size: $font-sm;
		color: $uni-color-primary;
	}

	.icon-you {
		font-size: $font-sm;
		margin-left: 4upx;
		color: $uni-color-primary;
	}
}

.c-list {
	font-size: $font-sm + 2upx;
	color: $font-color-base;
	background: #fff;

	.c-row {
		display: flex;
		align-items: center;
		padding: 20upx 30upx;
		position: relative;
	}

	.tit {
		width: 140upx;
	}

	.con {
		flex: 1;
		color: $font-color-dark;

		.selected-text {
			margin-right: 10upx;
		}
	}

	.bz-list {
		height: 40upx;
		font-size: $font-sm+2upx;
		color: $font-color-dark;

		text {
			display: inline-block;
			margin-right: 30upx;
		}
	}

	.con-list {
		flex: 1;
		display: flex;
		flex-direction: column;
		color: $font-color-dark;
		line-height: 40upx;
	}

	.red {
		color: $uni-color-primary;
	}
}

/* 评价 */
.eva-section {
	display: flex;
	flex-direction: column;
	padding: 20upx 30upx;
	background: #fff;
	margin-top: 16upx;

	.e-header {
		display: flex;
		align-items: center;
		height: 70upx;
		font-size: $font-sm + 2upx;
		color: $font-color-light;

		.tit {
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			margin-right: 4upx;
		}

		.tip {
			flex: 1;
			text-align: right;
		}

		.icon-you {
			margin-left: 10upx;
		}
	}
}

.eva-box {
	display: flex;
	padding: 20upx 0;

	.portrait {
		flex-shrink: 0;
		width: 80upx;
		height: 80upx;
		border-radius: 100px;
	}

	.right {
		flex: 1;
		display: flex;
		flex-direction: column;
		font-size: $font-base;
		color: $font-color-base;
		padding-left: 26upx;

		.con {
			font-size: $font-base;
			color: $font-color-dark;
			padding: 20upx 0;
		}

		.bot {
			display: flex;
			justify-content: space-between;
			font-size: $font-sm;
			color: $font-color-light;
		}
	}
}

/*  详情 */
.detail-desc {
	background: #fff;
	padding: 0 20rpx;

	.d-header {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 80upx;
		font-size: $font-base + 2upx;
		color: $font-color-dark;
		position: relative;

		text {
			padding: 0 20upx;
			background: #fff;
			position: relative;
			z-index: 1;
		}

		&:after {
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translateX(-50%);
			width: 300upx;
			height: 0;
			content: '';
			border-bottom: 1px solid #ccc;
		}
	}
}

/* 规格选择弹窗 */
.attr-content {
	padding: 10upx 30upx;

	.a-t {
		display: flex;

		image {
			width: 170upx;
			height: 170upx;
			flex-shrink: 0;
			margin-top: -40upx;
			border-radius: 8upx;
			;
		}

		.right {
			display: flex;
			flex-direction: column;
			padding-left: 24upx;
			font-size: $font-sm + 2upx;
			color: $font-color-base;
			line-height: 42upx;

			.price {
				font-size: $font-lg;
				color: $uni-color-primary;
				margin-bottom: 10upx;
			}

			.selected-text {
				margin-right: 10upx;
			}
		}
	}

	.attr-list {
		display: flex;
		flex-direction: column;
		font-size: $font-base + 2upx;
		color: $font-color-base;
		padding-top: 30upx;
		padding-left: 10upx;
	}

	.item-list {
		padding: 20upx 0 0;
		display: flex;
		flex-wrap: wrap;

		text {
			display: flex;
			align-items: center;
			justify-content: center;
			background: #eee;
			margin-right: 20upx;
			margin-bottom: 20upx;
			border-radius: 100upx;
			min-width: 60upx;
			height: 60upx;
			padding: 0 20upx;
			font-size: $font-base;
			color: $font-color-dark;
		}

		.selected {
			background: #fbebee;
			color: $uni-color-primary;
		}
	}
}

/*  弹出层 */
.popup {
	position: fixed;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	z-index: 99;

	&.show {
		display: block;

		.mask {
			animation: showPopup 0.2s linear both;
		}

		.layer {
			animation: showLayer 0.2s linear both;
		}
	}

	&.hide {
		.mask {
			animation: hidePopup 0.2s linear both;
		}

		.layer {
			animation: hideLayer 0.2s linear both;
		}
	}

	&.none {
		display: none;
	}

	.mask {
		position: fixed;
		top: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
		background-color: rgba(0, 0, 0, 0.4);
	}

	.layer {
		position: fixed;
		z-index: 99;
		bottom: 0;
		width: 100%;
		min-height: 40vh;
		border-radius: 10upx 10upx 0 0;
		background-color: #fff;

		.btn {
			height: 66upx;
			line-height: 66upx;
			border-radius: 100upx;
			background: $uni-color-primary;
			font-size: $font-base + 2upx;
			color: #fff;
			margin: 30upx auto 20upx;
		}
	}

	@keyframes showPopup {
		0% {
			opacity: 0;
		}

		100% {
			opacity: 1;
		}
	}

	@keyframes hidePopup {
		0% {
			opacity: 1;
		}

		100% {
			opacity: 0;
		}
	}

	@keyframes showLayer {
		0% {
			transform: translateY(120%);
		}

		100% {
			transform: translateY(0%);
		}
	}

	@keyframes hideLayer {
		0% {
			transform: translateY(0);
		}

		100% {
			transform: translateY(120%);
		}
	}
}

.mr{margin-left: 60rpx;}

/* 底部操作菜单 */
/* .page-bottom {
	position: fixed;
	left: 30upx;
	bottom: 30upx;
	z-index: 95;
	display: flex;
	align-items: center;
	width: 690upx;
	height: 100upx;
	background: rgba(255, 255, 255, .9);
	box-shadow: 0 0 20upx 0 rgba(0, 0, 0, .5);
	border-radius: 16upx;

	.p-b-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		font-size: $font-sm;
		color: $font-color-base;
		width: 96upx;
		height: 80upx;

		.yticon {
			font-size: 40upx;
			line-height: 48upx;
			color: $font-color-light;
		}

		&.active,
		&.active .yticon {
			color: $uni-color-primary;
		}

		.icon-fenxiang2 {
			font-size: 42upx;
			transform: translateY(-2upx);
		}

		.icon-shoucang {
			font-size: 46upx;
		}
	}

	.action-btn-group {
		display: flex;
		height: 76upx;
		border-radius: 100px;
		overflow: hidden;
		box-shadow: 0 20upx 40upx -16upx #fa436a;
		background: linear-gradient(to right, #ffac30, #fa436a, #F56C6C);
		margin-left: 200upx;
		position: relative;

		&:after {
			content: '';
			position: absolute;
			top: 50%;
			right: 50%;
			transform: translateY(-50%);
			height: 28upx;
			width: 0;
			border-right: 1px solid rgba(255, 255, 255, .5);
		}

		.action-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 180upx;
			height: 100%;
			font-size: $font-base;
			padding: 0;
			border-radius: 0;
			background: transparent;
		}
	}
	
} */

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

/* 优惠券列表 */
.coupon-item{
	display: flex;
	flex-direction: column;
	margin: 20upx 24upx;
	background: #fff;
	.con{
		display: flex;
		align-items: center;
		position: relative;
		height: 120upx;
		padding: 0 30upx;
		&:after{
			position: absolute;
			left: 0;
			bottom: 0;
			content: '';
			width: 100%;
			height: 0;
			border-bottom: 1px dashed #f3f3f3;
			transform: scaleY(50%);
		}
	}
	.left{
		display: flex;
		flex-direction: column;
		justify-content: center;
		flex: 1;
		overflow: hidden;
		height: 100upx;
	}
	.title{
		font-size: 32upx;
		color: $font-color-dark;
		margin-bottom: 10upx;
	}
	.time{
		font-size: 24upx;
		color: $font-color-light;
	}
	.right{
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		font-size: 26upx;
		color: $font-color-base;
		height: 100upx;
	}
	.price{
		font-size: 44upx;
		color: $base-color;
		&:before{
			content: '￥';
			font-size: 34upx;
		}
	}
	.tips{
		font-size: 24upx;
		color: $font-color-light;
		line-height: 60upx;
		padding-left: 30upx;
	}
	.tipsbutton{
		font-size: 24upx;
		color: #55C47D;
		line-height: 72upx;
		padding-left: 30upx;
		margin-left: 270px;
		margin-top: -30px;
		
	}
	.circle{
		position: absolute;
		left: -6upx;
		bottom: -10upx;
		z-index: 10;
		width: 20upx;
		height: 20upx;
		background: #f3f3f3;
		border-radius: 100px;
		&.r{
			left: auto;
			right: -6upx;
		}
	}
}

/* 底部操作菜单 */
.page_bottom_page{
	position: fixed;
	bottom: 0;
	z-index: 95;
	display: flex;
	align-items: center;
	width: 100%;
	height: 130upx;
	background: #FFFFFF;
	
	.p-b-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		font-size: $font-sm;
		color: $font-color-base;
		width: 96upx;
		height: 80upx;
	}
	
	.bottom_view{
		height: 100%;
		width: 60%;
		right: 0;
		position: absolute;
		display: flex;
		
		.bottom_b{
			flex-direction: column;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #FFFFFF;
		}
		.bottom_alone{
			background: #1c10cf;
			width: 86%;
		}
		.bottom_group{
			background: #f80202;
			width: 100%;
		}
		.bottom_group1{
			background: #ff007f;
			width: 100%;
		}
	}
}
.page_bottom_page ::v-deep .uni-badge--primary {
	background-color: #f80202;
}
</style>
