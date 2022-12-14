<template>
	<view class="opening-main">
		<ul>
			<li @click="devclick(item.devSn)" v-for="(item,index) in list">
				<image :src="`https://wxmini-1258758873.cos.ap-guangzhou.myqcloud.com/doorkey${index}.png`" v-if="index < 5" />
				<image :src="`https://wxmini-1258758873.cos.ap-guangzhou.myqcloud.com/doorkey${index%5}.png`" v-else />
				<view>
					<p>{{item.doorName}}</p>
					<p>序列号：<span>{{item.devSn}}</span></p>
				</view>
			</li>
		</ul>
		<u-back-top :scroll-top="scrollTop" top="50"></u-back-top>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userInfo: {},
				list: '',
				scrollTop: 0, //当前距离顶部的高度
				number: 7 //请求次数
			}
		},

		computed: {},
		onLoad(options) {
			console.log(JSON.parse(options.memberObj))
			if (options.memberObj) {
				this.memberObj = JSON.parse(options.memberObj)
			}
		},
		onShow() {
			this.userInfo = uni.getStorageSync("userInfo")
			if (this.userInfo != '') {
				this.getDoorRole()
			} else {
				this.$showToast('请选择小区');
			}
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
		methods: {
			//获取用户门权限
			getDoorRole() {
				this.$req.request({
					url: "/sqDoor/app/getDoorRole",
					data: {
						accessToken: this.userInfo.accessToken,
						communityId: this.userInfo.currentCommunity.id,
					},
					success: res => {
						if (res.code === 0) {
							//过滤掉不支持联网的设备
							this.list = res.data.filter((devObj, index) => {
								if (devObj.isSupportNetwork === 1) {
									return devObj;
								}
							});
							console.log(this.list)
						} else {
							this.$showToast(res.msg);
						}
					}
				})
			},
			devclick(devSn) {
				//进入开卡模式
				this.$req.request({
					url: "/persCard/app/enterOpenCardMode",
					data: {
						accessToken: this.userInfo.accessToken,
						devSn: devSn,
					},
					success: res => {
						if (res.code === 0) {
							uni.showLoading({
								title: '注意:请将卡放在设备上'
							});
							this.getOpenCardNo(devSn)
						} else {
							this.$showToast(res.msg);
						}
					}
				})
			},
			//获取卡号 轮循15秒
			getOpenCardNo(devSn) {
				var that = this;
				if (that.number > 1) {
					that.timer = setTimeout(function() {
						that.$req.request({
							url: "/persCard/app/getOpenCardNo",
							data: {
								devSn: devSn,
								accessToken: that.userInfo.accessToken,
							},
							isShowLoading: false,
							isHideLoading: false,
							success: result => {
								var data = result.data;

								if (data) {
									console.log('卡号:', data)
									uni.hideLoading();
									that.addcard(data)
									that.number = 7;
								} else if (that.number == 1) {
									uni.hideLoading();
									that.$showToast('开卡失败');
									that.number = 7;
								} else {
									that.getOpenCardNo(devSn);
								}
							},
							fail: () => {
								if (that.number == 1) {
									uni.hideLoading();
									that.$showToast(result.msg);
									that.number = 7;
								} else {
									that.getOpenCardNo(devSn);
								}
							},
							complete: () => {
								that.number--;
								console.log("请求设备状态倒数次数", that.number);
							}
						});
					}, 1000);
				}
			},
			//添加卡
			addcard(cardNo) {
				var that = this;
				that.$req.request({
					url: "/persCard/app/add",
					data: {
						accessToken: that.userInfo.accessToken,
						empId: that.memberObj.empId,
						cardNo: cardNo.replace(/\"/g, ""),
						roomId: that.memberObj.roomId,
						type: 1
					},
					success: res => {
						console.log("添加卡:", res, that.memberObj.empId, cardNo.replace(/\"/g, ""), that
							.memberObj.roomId)
						if (res.code === 0) {
							let title = "开卡成功，卡号为:" + cardNo.replace(/\"/g, "")
							console.log(title)
							uni.showToast({
								title: title,
								icon: 'none',
								duration: 2000
							});
							setTimeout(() => {
								uni.navigateBack()
							}, 2000)
						} else {
							that.$showToast(res.msg);
						}
					}
				})
			}
		}


	}
</script>

<style scoped>
	ul,
	li {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.opening-main {
		width: 100%;
	}

	.opening-main>ul {
		border-top: 2px solid #D4D3D3;
	}

	.opening-main>ul>li {
		display: flex;
		padding: 12upx 36upx;
		border-bottom: 1px solid #D4D3D3;
	}

	.opening-main li>image {
		margin: auto 0;
		width: 80upx;
		height: 80upx;
		margin-right: 40upx;
	}
</style>
