<template>
	<view class="pad20" style="position: relative;width: 750upx;">
		<view class="nuter">
			<view v-for=" (item, i) in getAllCategoryList " :key="i" :class="target==i?'active':''" @click="setIndex" :data-index="i">
				<text>{{item.name}}</text>
			</view>
		</view>
		<swiper
		:style="{height: windowHeight + 'px'}"
		:duration="500"
		:current="thisindex"
		:data-index='thisindex'
		@change="toggle"
		>
			<swiper-item v-for="(item, i) in getAllCategoryList">
				<!-- 按顺序对应第一个的内容 -->
				<scroll-view  @scrolltolower ="onRestore" lower-threshold="400" scroll-y style="height: 100%;width: 100%;" >
					<!-- 我的爆料A -->
					<view v-if="i === 0" class="my-repotr-box pad20 borderBottom1 marTop20">
						<image class="my-repotr-box-left" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/house/take-photo.jpg" mode=""></image>
						<view class="my-repotr-box-right">
							<view class="my-repotr-box-right-content">北欧惭怍小户型北欧惭怍小户型北欧惭怍小户型北欧惭怍小户型北欧惭怍小户型北欧惭怍小户型</view>
							<view class="my-repotr-box-right-num">108.00元包邮</view>
							<view class="rightTheLeft">
								<text class="fontSize28">京东商城</text>
								<view class="fontSize28 rightTheLeft">
									<view class="marRight20">
										<u-icon class="" name="chat"></u-icon>
										<text>1233</text>
									</view>
									<view class="">
										<u-icon class="" name="eye-fill"></u-icon>
										<text>1233</text>
									</view>
								</view>
							</view>
						</view>
					</view>
					<view v-else v-for=" item in 2 " class="pad20 borderBottom1">
						<view class="rightTheLeft">
							<text class="fontSize32">好物推荐描述:</text>
							<text class="fontSize28">03-03 13:22</text>
						</view>
						<view class="fontSize28">
							超级便宜超级便宜超级便宜超级便宜超级便宜超级便宜超级便宜超级便宜超级便宜超级便宜超级便宜
						</view>
						<view class="">
							<text class="fontSize32">好物链接:</text>
						</view>
						<view class="">
							<text class="fontSize28">www.baidu.com</text>
						</view>
						<view v-if=" i === 1 " @click="delBtn(item)" style="text-align: right;" class="fontSize28">
							<text>删除</text>
						</view>
					</view>
					<!-- <uni-empty-page v-else></uni-empty-page> -->
					<view class="height100"></view>
				</scroll-view>
			</swiper-item>
		</swiper>
		
		<drag-button
			:isDock="true"
			:existTabBar="true"
			@btnClick="btnClick"
			/>
		</view>
	</view>
</template>

<script>
	let currPage = 1;
	import dragButton from "@/components/drag-button/drag-button.vue";
	export default {
		components: {
			dragButton
		},
		data() {
			return {
				getAllCategoryList: [{name:'已发布'},{name:'待审核'},{name:'未通过'}],
				// 当前item位置
				thisindex:0,
				// 当前样式
				target:0,
				windowHeight: 500,
			};
		},
		onLoad() {
			uni.getSystemInfo({
				success: (res) => {
					// console.log('手机屏幕高度',res.windowHeight)
					let windowHeight = res.windowHeight;
					this.windowHeight = windowHeight - 138;
					uni.setStorageSync('windowHeight',windowHeight)
				}
			})
		},
		methods: {
			delBtn(item) {
				console.log('删除',item)
				uni.showModal({
				    title: '提示',
				    content: '删除不可恢复，确定要删除吗？',
				    success: function (res) {
				        if (res.confirm) {
				            console.log('用户点击确定');
				        } else if (res.cancel) {
				            console.log('用户点击取消');
				        }
				    }
				});
			},
			// 点击nav控制下面的展示
			setIndex(e){
				let index = e.currentTarget.dataset.index;;
				this.thisindex = index*1;
				this.target = index*1;
				// console.log('1zax',this.thisindex)
			},
			// 切换触发的事件
			toggle(e){
				currPage = 1;
				let index = e.detail.current;
				this.target = index*1;
				console.log(this.target)
				// if( this.target === 0 ) {
				// 	this.cid = ''
				// }else {
				// 	this.cid = this.getAllCategoryList[this.target].id
				// }
				// this.getPorductList(this.searchVal)
			},
			btnClick() {
				console.log('点击2')
				uni.navigateTo({
					url: './add-report/add-report'
				})
			}
		}
	}
</script>

<style lang="scss">
.my-repotr-box {
	width: 670upx;
	display: flex;
	.my-repotr-box-left {
		width: 200upx;
		height: 200upx;
	}
	.my-repotr-box-right {
		width: 430upx;
		padding: 0 20upx;
		.my-repotr-box-right-content {
			height: 100upx;
			width: 98%;
			font-size: 28upx;
			font-family: PingFangSC-regular;
			color: #101010;
			overflow: hidden;
			-webkit-line-clamp: 2;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-box-orient: vertical;
		}
		.my-repotr-box-right-num {
			font-size: 32upx;
			color: #FF1744;
		}
	}
}
.nuter{
	display: flex;
	justify-content: space-around;
	font-size: 35rpx;
}
.nuter view{
	padding: 20upx 0;
	flex: 1;
	font-size: 30rpx;
	text-align: center;
	transition: all 0.5s ease .1s;
	background-color: #FFFFFF;
	border-bottom: 6rpx solid #F4F5F7;
	color: $uni-text-color-grey;
	text {
		display: block;
		font-size: $uni-font-size-sm;
	}
}
.active{
	box-sizing: border-box;
	color: $uni-color-primary !important;
	border-bottom: 4rpx solid $uni-color-primary !important;
	background-color: #f3ffff;
	// border-radius: 10rpx;
	box-shadow: 3px 3px 5px #888888;
}
swiper-item{
	width: 100%;
	overflow: hidden;
	// text-align: center;
	// line-height: 300rpx;
	/* background-color: red; */
}
.swiper-item{
	overflow-y: scroll;
	width: 99.5%;
	height: 99%;
	/* background-color: white; */
	/* height: 99%; */
	box-sizing: border-box;
	padding: 1rpx;
}	
</style>
