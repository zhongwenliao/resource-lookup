<template>
	<view class="adoption">
		<view class="uni-padding-wrap">
			<uni-segmented-control activeColor="#00aa7f" :current="current" :values="items" :style-type="styleType" :active-color="activeColor" @clickItem="onClickItem" />
		</view>
		<view class="content" :class="current === 2 ? 'contItem' : ''">
			<view class="adoptionList" v-if="current === 0">
				<AdoptionList :pages="pages" :statusLoadMore="statusLoadMore" :contentText="contentText" 
				@adoptionInfo="adoptionInfo" @adoptionIndex="adoptionListIndex" />
			</view>
			<view class="myHens" v-if="current === 1">
				<MyHens :pages="pages" :statusLoadMore="statusLoadMore" :contentText="contentText"
				@myHensInfo="myHensInfo" @myHensIndex="myHensIndex" />
			</view>
			<view class="eggToOrder" v-if="current === 2">
				<EggToOrder :aid="aid" :addressData="addressData" :address="address" @eggToOrderIndex="eggToOrderIndex" />
			</view>
			<view class="myEggDetails" v-if="current === 3">
				<MyEggDetails :pages="pages" :statusLoadMore="statusLoadMore" :contentText="contentText" @eggDetailInfo="eggDetailInfo" />
			</view>
			<view class="eggMarket" v-if="current === 4">
				<EggMarket :pages="pages" @updatePages="updatePages" :statusLoadMore="statusLoadMore" :contentText="contentText" @eggMarketInfo="eggMarketInfo"/>
			</view>
		</view>
	</view>
</template>

<script>
import AdoptionList from '@/components/common/adoptionList/adoptionList.vue'
import MyHens from '@/components/common/myHens/myHens.vue'
import EggToOrder from '@/components/common/eggToOrder/eggToOrder.vue'
import MyEggDetails from '@/components/common/myEggDetails/myEggDetails.vue'
import EggMarket from '@/components/common/eggMarket/eggMarket.vue'

export default {
	data() {
		return {
			items: ['认养列表', '我的鸡群', '鸡蛋提取', '鸡蛋明细', '鸡蛋市场'],
			current: 0,
			styleType: 'button',
			activeColor: '#007aff',
			
			addressData: {
				sjr: '请选择地址ַ',
			},
			aid: 0,
			address: '',
			
			pages: 0,
			
			statusLoadMore: "more",
			contentText: {
				contentdown: '',
				contentrefresh: '加载中',
				// contentnomore: '没有更多数据了'
			},
			
			pagesInfo: {
				per_num: 0,
				total_num: 0
			},
			
			titleIndex: ''
		}
	},
	components: {
		AdoptionList,
		MyHens,
		EggMarket,
		EggToOrder,
		MyEggDetails
	},
	onLoad(option) {
		if(uni.getStorageSync('current')){
			this.current = uni.getStorageSync('current')
			uni.removeStorageSync('current')
			
			uni.setNavigationBarTitle({
				title: '鸡蛋明细'
			});
		} else {
			// 标题
			uni.setNavigationBarTitle({
				title: '认养列表'
			});
		}
	},
	onShow() {
		if(this.current === 2){
			this.addressget()
		}
	},
	onReachBottom() {
		if(this.pagesInfo.total_num > this.pagesInfo.per_num){
			this.statusLoadMore = "loading"
			this.pages ++
			
			var that = this
			setTimeout(function() {	
				// 显示没有更多数据了
				that.statusLoadMore = "nomore"
			}, 2000)
		}
	},
	methods: {
		updatePages (pages) {
			this.pages = pages;
		},
		onClickItem(e) {
			if (this.current !== e.currentIndex) {
				this.current = e.currentIndex
				// 标题
				uni.setNavigationBarTitle({
					title: this.items[e.currentIndex]
				});
			} else if(this.current === e){
				this.current = e.currentIndex
				// 标题
				uni.setNavigationBarTitle({
					title: this.items[e.currentIndex]
				});
			}
			
			if(this.current === 0 || this.current === 1 || this.current === 3) {
				this.pages = 0
				
				uni.pageScrollTo({
					scrollTop: 0
				});
			}
		},
		addressget(){
			this.$http("addressGet", JSON.stringify({
				token: uni.getStorageSync('token'),
				aid: this.aid
			})).then(res=>{	
				if(res.data.code == 0){
					if(res.data.address.sheng != ''){
						this.addressData=res.data.address;
						this.aid = res.data.address.aid;
						this.address = this.addressData.sheng + this.addressData.shi + this.addressData.qu + this.addressData.xxdz
					} else {
						this.addressData.sjr = '请选择地址ַ'
						this.aid = 0
						this.address = ''
					}
				} else if (res.data.code == 99) {
					uni.showModal({
						content: "请先登录",
					 success: (e) => {
						if (e.confirm) {
								uni.clearStorage();
								setTimeout(() => {
									uni.redirectTo({
										url: "../public/login"
									})
								}, 200)
							}
						}
					});
				} else {
					uni.showToast({ title: res.data.msg, icon: 'none'});
				}
			}).catch(err=>{
				console.log(err);
			})
		},
		// 认养列表
		adoptionInfo(item){
			this.pagesInfo = item
			
			if(item.total_num == 0){
				this.contentText.contentdown = '暂无数据'
			} else if(parseFloat(item.total_num) < parseFloat(item.per_num)){
				this.contentText.contentdown = '没有更多数据了'
			} else {
				this.contentText.contentdown = '查看更多'
			}
		},
		// 认养列表
		adoptionListIndex(index){
			this.current = index
		},
		// 我的鸡群
		myHensInfo(item){
			this.pagesInfo = item

			if(item.total_num == 0){
				this.contentText.contentdown = '暂无数据'
			} else if(parseFloat(item.total_num) < parseFloat(item.per_num)){
				this.contentText.contentdown = '没有更多数据了'
			} else {
				this.contentText.contentdown = '查看更多'
			}
		},
		// 我的鸡群
		myHensIndex(index){
			this.current = index
		},
		// 鸡蛋提取
		eggToOrderIndex(index){
			this.current = index
			this.pages = 0
		},
		eggDetailInfo(item){
			this.pagesInfo = item
			
			if(item.total_num == 0){
				this.contentText.contentdown = '暂无数据'
			} else if(parseFloat(item.total_num) < parseFloat(item.per_num)){
				this.contentText.contentdown = '没有更多数据了'
			} else {
				this.contentText.contentdown = '查看更多'
			}
		},
		eggMarketInfo(item){
			this.pagesInfo = item

			if(item.total_num == 0){
				this.contentText.contentdown = '暂无数据'
			} else if(parseFloat(item.total_num) < parseFloat(item.per_num)){
				this.contentText.contentdown = '没有更多数据了'
			} else {
				
				this.contentText.contentdown = '查看更多'
			}
		}
	}
}
</script>

<style scoped lang="scss">
.content {
	padding: 90rpx 20rpx 20rpx;
	background-color: #F5F5F5;
}

.content ::v-deep .segmented-control{
	height: 80rpx;
	.segmented-control__item--button--first {
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}
	
	.segmented-control__item--button--last {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}
	.segmented-control__text{
		font-size: 30rpx;
	}
}

.content ::v-deep .uni-countdown{
	height: 100%;
	
}

.uni-padding-wrap{
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	z-index: 95;
	display: flex;
	align-items: center;
	width: 100%;
	background: #FFFFFF;
	height: 90rpx;
	border-bottom: 1rpx solid #E5E5E5;
	
	uni-segmented-control{
		width: 100%;
	}
}

.uni-padding-wrap ::v-deep .segmented-control{
	height: 80rpx;
	.segmented-control__item--button--first {
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}
	
	.segmented-control__item--button--last {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}
	.segmented-control__text{
		font-size: 30rpx;
	}
}

.contItem{
	height: 100vh;
}

.adoptionList{
	font-size: 30rpx;
	background-color: #FFFFFF;
	border-radius: 10rpx;
	margin-top: 10rpx;
}

.myHens{
	font-size: 30rpx;
	background-color: #FFFFFF;
	border-radius: 10rpx;
	margin-top: 10rpx;
}
.eggToMoney{
	font-size: 30rpx;
	background-color: #FFFFFF;
	padding: 10rpx 0 60rpx;
	border-radius: 10rpx;
	margin-top: 10rpx;
}
.eggToOrder{
	font-size: 30rpx;
	background-color: #FFFFFF;
	padding: 10rpx 0 60rpx;
	border-radius: 10rpx;
	margin-top: 10rpx;
}
.myEggDetails{
	font-size: 30rpx;
}

.eggMarket ::v-deep .uni-popup {
	.uni-popup__wrapper{
		border-radius: 10rpx;
		padding: 20rpx;
		
		.popup-content {
			padding-top: 30rpx;
			font-size: 32rpx;
			width: 630rpx;
		}
		
		.popup-title{
			padding: 0 40rpx 20rpx;
		}
		
		.popup_index{
			width: 80%;
			margin: 0 auto;
			display: flex;
			height: 70rpx;
			border: 1rpx solid #E5E5E5;
			padding-left: 20rpx;
			align-items: center;
			font-size: 30rpx;
		}
		
		.state_view{
			display: flex;
			height: 120rpx;
			justify-content: space-between;
			width: 80%;
			margin: 0 auto;
		}
		.cancel{
			display: flex;
			justify-content: center;
			align-items: center;
			border: 1rpx solid #E5E5E5;
			margin: 30rpx 0;
			border-radius: 10rpx;
			height: 70rpx;
			padding: 0 70rpx;
		}
		.confirm{
			display: flex;
			justify-content: center;
			align-items: center;
			border: 1rpx solid #E5E5E5;
			margin: 30rpx 0;
			border-radius: 10rpx;
			height: 70rpx;
			padding: 0 70rpx;
		}
		
		.popup-title1{
			padding-bottom: 10rpx;
		}
		.popup_index1{
			border: 1rpx solid #e5e5e5;
			padding: 10rpx;
			height: 230rpx;
			border-radius: 10rpx;
		}
		.state_view1{
			display: flex;
			justify-content: space-between;
			margin-top: 30rpx;
			
			.cancel1{
				display: flex;
				justify-content: center;
				align-items: center;
				border: 1rpx solid #E5E5E5;
				border-radius: 10rpx;
				height: 70rpx;
				padding: 0 90rpx;
			}
			.confirm1{
				display: flex;
				justify-content: center;
				align-items: center;
				border: 1rpx solid #E5E5E5;
				border-radius: 10rpx;
				height: 70rpx;
				padding: 0 90rpx;
			}
		}
	}
}

.adoptionList ::v-deep .uni-popup {
	z-index: 1400;
	
	.uni-popup__wrapper{
		border-radius: 10rpx;
	}
	
	.popup-content {
		padding: 30rpx 20rpx 0;
		height: 300rpx;
		font-size: 32rpx;
		width: 700rpx;
	}
	
	.popup-title{
		padding: 0 40rpx 20rpx;
	}
	
	.popup_index{
		width: 80%;
		margin: 0 auto;
		display: flex;
		height: 70rpx;
		border: 1rpx solid #E5E5E5;
		padding-left: 20rpx;
		align-items: center;
		font-size: 30rpx;
	}
	
	.state_view{
		display: flex;
		height: 120rpx;
		justify-content: space-between;
		width: 80%;
		margin: 0 auto;
	}
	.cancel{
		display: flex;
		justify-content: center;
		align-items: center;
		border: 1rpx solid #E5E5E5;
		margin: 30rpx 0;
		border-radius: 10rpx;
		height: 70rpx;
		padding: 0 70rpx;
	}
	.confirm{
		display: flex;
		justify-content: center;
		align-items: center;
		border: 1rpx solid #E5E5E5;
		margin: 30rpx 0;
		border-radius: 10rpx;
		height: 70rpx;
		padding: 0 70rpx;
	}
}
</style>
