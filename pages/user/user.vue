<template>
	<view style="height: 100%;display: flex;flex-direction: column;">
		<view class="head">
			<u-navbar :immersive="false" :is-back="false" title-color="#fff" :background="{backgroundColor: '' }"
				title="我的" :border-bottom="false">
				<view slot="right">
					<u-icon @click="goSetting" color="#fff" name="shezhi" custom-prefix="custom-icon" size="40">
					</u-icon>
				</view>
			</u-navbar>
			<view class="user-top u-flex">
				<view @click="goUserInfo" class="u-flex u-m-l-50" style="margin-top: -50rpx;">
					<u-avatar :src="src ? src : 'http://yuanzhoulvwego.com/wp-content/uploads/static/morentouxiang.png'" size="110"></u-avatar>
					<view class="u-m-l-10 u-flex-col u-row-around u-text-color-fff" style="height: 60px;">
						<view class="u-font-xl">
							{{ userName ? userName : userInfo.phone }}
						</view>
						<view class="u-font-md">
							所属公司：{{userInfo.enterpriseName}}
						</view>
						<view class="u-font-md">
							账号：{{userInfo.phone}}
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="grid" v-if="userInfo.enterpriseId">
			<u-grid :col="3" :border="false">
				<block v-for="(item,index) of gridList" :key="index">
					<u-grid-item v-if="$permission([item.permission])|| !item.permission" class="grid_item"
						@click="goPage(item)">

						<view class="left">
							<view style="height:60upx;display: flex;align-items: center;justify-content: center;"
								class="">
								<u-badge :count="item.count" :is-dot="true" :offset="[30, 90]"></u-badge>
								<u-icon :size="item.size" :name="item.imgUrl"></u-icon>
							</view>
							<view class="grid-text">{{item.title}}</view>
						</view>
						<view class="right">
							<u-line v-if="((index+1)%3 != 0) && (index+1) !=gridList.length" color="#dddddd"
								direction="col" length="110" />
						</view>
					</u-grid-item>
				</block>
			</u-grid>
		</view>
		<view class="user-bottom">
			<view class="user-bottom-box">
				<u-cell-group class="cell-group" :border="false">
					<u-cell-item @click="goMyInformation" :title-style="cellTitle" v-if="userInfo.enterpriseId">>
						<u-icon margin-left="10" label="  " size="30" slot="icon"
							name="http://yuanzhoulvwego.com/wp-content/uploads/static/user-grid/wodexiaoxi.png">
						</u-icon>
						<view slot="title" class="" style="position: relative;">
							我的消息
							<u-badge v-if="count > 0" :is-dot="true" :offset="[0,-20]" type="error" :count="count"></u-badge>
						</view>
					</u-cell-item>
					
					<u-cell-item @click="goAboutUs" :title-style="cellTitle">
						<u-icon margin-left="10" label="  " size="30" slot="icon"
							name="http://yuanzhoulvwego.com/wp-content/uploads/static/user-grid/guanyuwomen.png">
						</u-icon>
						<view slot="title" class="" style="position: relative;">
							关于我们
						</view>
					</u-cell-item>
				</u-cell-group>
				<!-- 				<u-cell-group class="cell-group" :border="false">
					<u-cell-item :title-style="cellTitle" title="通知管理"></u-cell-item>
				</u-cell-group> -->
			</view>
		</view>

		<u-tabbar :list="tabbar.list" hide-tab-bar></u-tabbar>
	</view>
</template>

<script>
	import tabbar from "@/config/tabBar"
	export default {
		data() {
			return {
				type: 1 ,
				tabbar,
				userInfo: uni.getStorageSync('userInfo') ? uni.getStorageSync('userInfo') : {},
				userName: uni.getStorageSync('userInfo').userName,
				src: uni.getStorageSync('userInfo') ? uni.getStorageSync('userInfo').avatar : 'http://yuanzhoulvwego.com/wp-content/uploads/static/user/pic4.png',
				cellTitle: {
					color: '#333333',
					fontSize: '32upx',
					fontWeight: 'bold',
					letterSpacing: '2upx'
				},
				// 我的消息数量
				count: 0,
				gridList: [
					
					// { 
					// 	id: 5,
					// 	title: "开门记录",
					// 	imgUrl: "http://yuanzhoulvwego.com/wp-content/uploads/static/user-grid/kaimenjilu.png",
					// 	url: "/pages/user/openDoorRecord",
					// 	permission: 'accessControl:selectOpenRecord',
					// 	size: 50,
					// 	type: 3,
					// 	count: 0
					// },
					
					
				],
			};
		},
		onLoad() {
			
		},
		onShow() {
			if (this.userInfo.enterpriseId > 0) this.userInformationList()
			this.src = uni.getStorageSync('userInfo').avatar
		},
		methods: {
			goPage(data) {
				this.$tools.routerTo(
					data.url,
					data,
					data.isTabBar
				);

			},
			userInformationList() {
				const params = {
					currPage: 1,
					pageSize: 10,
				}
				this.$api('user.userInformationList', params).then(res => {
					if (res.code == 200) {
						this.count = res.data.totalCount
						console.log('dddddd', res)
					}	
				}).catch((e) => {});
			},
			goAboutUs() {
				this.$Router.push({
					path: '/pages/user/aboutUs',
				});
			},
			goMyInformation() {
				this.$Router.push({
					path: '/pages/user/myInformation',
				});
			},
			goSetting() {
				console.log(this.pageScrollTop);
				this.$Router.push({
					path: '/pages/user/setting',
				});
			},
			goUserInfo() {
				this.$Router.push({
					path: '/pages/user/userInfo',
				});
			},
		}
	}
</script>
<style>
	page {
		width: 100%;
		height: 100%;
		background: #F9F9F9;
	}
</style>
<style lang="scss" scoped>
	/deep/ .u-cell {
		padding: 20upx 6upx 20upx 12upx;
	}

	.head {
		background: url('http://yuanzhoulvwego.com/wp-content/uploads/static/user-grid/beijin.png') no-repeat;
		background-size: 100% 100%;
	}

	.user-top {
		height: 360rpx;
	}

	.user-bottom {
		background: #FFFFFF;
		flex: 1;
		border-radius: 15upx;
		overflow: hidden;
		margin: 0 20upx;
		margin-top: 20upx;
	}

	.grid {
		margin: 0 20upx;
		margin-top: -11%;
		background: #FFFFFF;
		overflow: hidden;
		border-radius: 15upx;

		.grid_item {
			display: flex;
			position: relative;

			.left {
				text-align: center;

				.grid-text {
					font-size: 28upx;
					font-weight: PingFang-SC-Regular;
					color: #333333;
					
				}
			}

			.right {
				position: absolute;
				right: 0;
			}
		}
	}
</style>
