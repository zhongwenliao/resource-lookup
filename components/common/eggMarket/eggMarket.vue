<template>
	<view class="eggMarket">
		<view class="uni-padding-wrap">
			<uni-segmented-control activeColor="#00aa7f" :current="current" :values="items" :style-type="styleType" :active-color="activeColor" @clickItem="onClickItem" />
		</view>
		<view class="content" :class="current === 3 ? 'marketAdd' : ''">
			<view class="item0" v-if="current === 0">
				<eggMarketList :pages="pages" :statusLoadMore="statusLoadMore" :contentText="contentText" :marketType="2" 
				@eggClientInfo="eggClientInfo" @marketListIndex="marketListIndex" />
			</view>
			<view class="item1" v-if="current === 1">
				<eggMarketList  :pages="pages" :statusLoadMore="statusLoadMore" :contentText="contentText" :marketType="1" 
				@eggClientInfo="eggClientInfo" @marketListIndex="marketListIndex" />
			</view>
			<view class="eggMarketUser item2" v-if="current === 2">
				<eggMarketUser :pages="pages" :statusLoadMore="statusLoadMore" :contentText="contentText" :current="current" 
				@marketUserInfo="marketUserInfo" @marketUserIndex="marketUserIndex"/>
			</view>
			<view class="eggMarketUAdd item3" v-if="current === 3">
				<eggMarketUAdd :current="current"  @marketAddIndex="marketAddIndex"/>
			</view>
		</view>
	</view>
</template>

<script>
import eggMarketList from '@/components/common/eggMarketList/eggMarketList.vue'
import eggMarketUser from '@/components/common/eggMarketUser/eggMarketUser.vue'
import eggMarketUAdd from '@/components/common/eggMarketUAdd/eggMarketUAdd.vue'

export default {
	data() {
		return {
			items: ['我要买入', '我要卖出', '我的挂单', '我要挂单'],
			current: 0,
			styleType: 'button',
			activeColor: '#007aff',
		}
	},
	components: {
		eggMarketList,
		eggMarketUser,
		eggMarketUAdd
	},
	props: {
		pages: {
			type: Number,
			default: 0
		},
		statusLoadMore: {
			type: String,
			default: 'more'
		},
		contentText: Object
	},
	methods: {
		onClickItem(e) {
			if (this.current !== e.currentIndex) {
				this.current = e.currentIndex
				this.$emit('updatePages', 0);
			}
		},
		eggClientInfo(item){
			this.$emit("eggMarketInfo", item)
		},
		marketUserInfo(item){
			this.$emit("eggMarketInfo", item)
		},
		marketListIndex(index){
			this.current = index
		},
		marketUserIndex(index){
			this.current = index
		},
		marketAddIndex(index){
			this.current = index
		}
	}
}
</script>

<style scoped lang="scss">
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

.marketAdd{
	height: 100vh;
}

.eggMarketUAdd{
	background-color: #FFFFFF;
	padding: 10rpx 0 60rpx;
	border-radius: 10rpx;
	margin-top: 10rpx;
}
</style>
