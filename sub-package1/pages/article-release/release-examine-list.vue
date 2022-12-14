<template>
	<div class="articleRelease-main">

		<!-- 标题栏 -->
		<view class="tabs">
			<u-tabs-swiper ref="uTabs" :list="list" :current="current" @change="tabsChange" :is-scroll="false"
				swiperWidth="750"></u-tabs-swiper>
		</view>
		<!-- 标题栏  end-->

		<swiper style="height: 95%;" :current="swiperCurrent" @transition="transition"
			@animationfinish="animationfinish">
			<swiper-item style="height: 95%;" class="swiper-item" v-for="(item, index) in lists" :key="index">

				<scroll-view scroll-y style="width: 100%;height: 95%" @scrolltolower="onreachBottom">
					<view class="list">
						<ul>
							<!-- <u-back-top :scroll-top="scrollTop" top="10"></u-back-top> -->
							<!--没有列表数据的话展示-->
							<u-empty :text="articleRelease['NodDataAvailable']||'暂无数据'" mode="list"
								v-if="item.releaseList.length==0" style="padding: 30% 0;">
							</u-empty>
							<!--没有列表数据的话展示end-->

							<li v-for="(j, i) in item.releaseList" :key="i">

								<view class="centerBox">
									<view class="text">
										<p class="fontWitch" style="font-size: 32upx;">
											{{articleRelease['Deliverydate']||'搬运日期'}}：{{j.deliveryDate}}
										</p>
										<p style="color: #a3a3a3;">房间号：{{j.roomName}}</p>
										<p style="color: #a3a3a3;">APP账号：{{j.phone}}</p>
										<p v-for="(k,l) in j.goodsList" :key="l">
											{{l+1+'.'}}{{articleRelease['goods']||'物品'}}：{{k.name}}<span
												style="margin-left: 40upx;">{{articleRelease['number']||'数量'}}：{{k.number}}</span>
										</p>
									</view>
									<view class="stateBox">
										<view>
											<image v-if="j.reviewStatus==1" src="../../static/img/add.png" mode=""
											<image v-if="j.reviewStatus==1" src="../../static/img/pass.png" mode=""
												class="icon">
											</image>
											<p v-if="j.reviewStatus==1"> {{articleRelease['Approved']||'已通过审批'}}</p>

											<image v-if="j.reviewStatus==0" src="../../static/img/dd.png" mode=""
												class="icon">
											</image>
											<p v-if="j.reviewStatus==0">{{articleRelease['Pendingapproval']||'待审批'}}</p>

											<image v-if="j.reviewStatus==2" src="../../static/img/nopass.png" mode=""
												class="icon">
											</image>
											<p v-if="j.reviewStatus==2">{{articleRelease['Notapproved']||'未通过审批'}}</p>

											<p class="time">{{j.createTime.substring(0,10)}}</p>
										</view>
									</view>
								</view>
								<view class="picture" v-if="j.goodsPicture">
									<image :src="imgitem" v-for="(imgitem, imgindex) in j.goodsPicture.split(',')"
										:key="imgindex" @click="ViewImage(index,j.goodsPicture.split(','))" />
								</view>
								<p class="butBox" v-if="j.reviewStatus==0">
									<u-button size="medium" class="custom-style" type="primary" @click="yes(j.id)">
										{{articleRelease['adopt']||'通过'}}
									</u-button>
									<u-button size="medium" class="custom-style" @click="no(j.id)">
										{{articleRelease['No']||'不通过'}}</u-button>
								</p>
								<p v-if="j.reviewStatus==2" style="color: #dd524d;margin-top: 10upx;">
									{{articleRelease['Reasonsforfailure']||'不通过原因:'}}:{{j.reviewResult}}</p>
							</li>

						</ul>

					</view>

				</scroll-view>

			</swiper-item>
		</swiper>

		<!--不同意后弹出 驳回输入框-->
		<u-modal v-model="show" :title="articleRelease['Reasonsforfailure']||'不通过原因'" :show-cancel-button="true"
			:title-style="{padding: '20upx 0'}" @confirm="confirm">
			<u-input v-model="reviewResult" trim type="textarea" :border="true" height="100" :auto-height="true"
				:placeholder="articleRelease['Reasonsforrejection']||'请输入驳回原因'" style="width: 80%;margin: auto;" />
		</u-modal>


	</div>
</template>

<script>
	let userInfo = ''
	let token = ''
	export default {
		data() {
			return {
				show: false,
				id: '', //点击信息的id
				reviewResult: '', //驳回原因
				scrollTop: 0,
				list: [{
					name: '全部'
				}, {
					name: '待审核'
				}, {
					name: '通过'
				}, {
					name: '未通过'
				}],
				lists: [{
					releaseList: []
				}, {
					releaseList: []
				}, {
					releaseList: []
				}, {
					releaseList: []
				}],
				// 因为内部的滑动机制限制，请将tabs组件和swiper组件的current用不同变量赋值
				current: 0, // tabs组件的current值，表示当前活动的tab选项
				swiperCurrent: 0, // swiper组件的current值，表示当前那个swiper-item是活动的
			};
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
		onShow() {
			this.list=[{
					name: this.articleRelease['whole']
				}, {
					name: this.articleRelease['reviewed']
				}, {
					name: this.articleRelease['adopt']
				}, {
					name: this.articleRelease['Failed']
				}],
			userInfo = uni.getStorageSync("userInfo")
			token = uni.getStorageSync("token")
			this.listByWyEmp(-1)
		},
		computed: {
			articleRelease() {
				return this.$t("article-release") //返回出国际化的语言数据
			},
		},

		methods: {
			/**
			 * tab切换与接口交互主要逻辑为 接口返回所有数据(列表)
			 * 根据每条数据的状态去判断分为哪类 按照类别下标放入数组下标位置去循环
			 * 
			 * **
			 **/
			//用户所看到的列表
			listByWyEmp(status) {
				this.$req.request({
					url: "/appGoodsRelease/app/listByWyEmp",
					method: "POST",
					data: {
						accessToken: token,
						communityId: userInfo.currentCommunity.id,
						status: status
					},
					success: res => {
						if (res.code == 0) {

							if (status == -1) {
								this.lists[0].releaseList = res.data
							} else if (status == 0) {
								this.lists[1].releaseList = res.data
							} else if (status == 1) {
								this.lists[2].releaseList = res.data
							} else if (status == 2) {
								this.lists[3].releaseList = res.data
							}

						} else {
							this.$showToast(res.msg);
						}

					}
				});
			},
			//预览图片
			ViewImage(i, imgList) {
				let imgurl = []
				console.log(imgList)
				imgList.forEach(item => imgurl.push(item))
				uni.previewImage({
					urls: imgurl,
					current: imgList[i],
					 loop:true
				});
			},
			//审核接口
			updateById(reviewStatus, reviewResult) {
				this.$req.request({
					url: "/appGoodsRelease/app/updateById",
					method: "POST",
					data: {
						accessToken: token,
						id: this.id,
						reviewStatus: reviewStatus,
						reviewResult: reviewResult,
					},
					success: res => {
						if (res.code == 0) {
							this.$showToast(res.msg);
							this.listByWyEmp(this.swiperCurrent - 1)
						} else {
							this.$showToast(res.msg);
						}

					}
				});
			},
			//点击通过
			yes(id) {
				this.id = id
				this.updateById(1, this.reviewResult)
			},
			//点击不通过按钮执行
			no(id) {
				this.show = true
				this.id = id
				this.reviewResult = ''
			},
			//审核不通过
			confirm() {
				if (this.reviewResult != '') {
					this.updateById(2, this.reviewResult)
				} else {
					this.$showToast(articleRelease['reason'] || '原因不能为空！');
				}
			},


			// tabs通知swiper切换
			tabsChange(index) {
				this.swiperCurrent = index;
				this.listByWyEmp(index - 1)
			},
			// swiper-item左右移动，通知tabs的滑块跟随移动
			transition(e) {
				let dx = e.detail.dx;
				this.$refs.uTabs.setDx(dx);
			},
			// 由于swiper的内部机制问题，快速切换swiper不会触发dx的连续变化，需要在结束时重置状态
			// swiper滑动结束，分别设置tabs和swiper的状态
			animationfinish(e) {
				let current = e.detail.current;
				this.$refs.uTabs.setFinishCurrent(current);
				this.swiperCurrent = current;
				this.current = current;
			},
			// scroll-view到底部加载更多
			onreachBottom() {

			}
		}
	};
</script>

<style scoped>
	page {
		background: #eeeeee !important;
		height: 100%;
	}

	.articleRelease-main {
		width: 100%;
		/* height: 93.6%; */
	}


	ul,
	li {
		padding: 0px;
		margin: 0px;
		list-style: none;
	}

	/* 	uni-swiper,
	uni-scroll-view {
		height: 100% !important;
	} */

	.list {
		width: 100%;
		height: 100%;
		margin-bottom: 10upx;
	}


	.list li {
		padding: 16px 8px;
		background: #FFFFFF;
		border-bottom: 1px solid #e5e5e5;
		margin: 16px 8px;
		border-radius: 10px;
		box-shadow: 2px 2px 5px 2px rgba(134, 134, 134, 0.3);
	}

	.list li .text {
		width: 75%;
		overflow: hidden;

		text-overflow: ellipsis;

		white-space: nowrap;
	}

	.list li .time {
		color: #a3a3a3;
	}

	.centerBox {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}

	.stateBox {
		display: flex;
		flex-direction: column;
		text-align: center;
		margin: auto;
	}

	.stateBox>view {
		line-height: 1.2;
	}

	.stateBox image {
		margin: auto 0;
	}

	.picture {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.picture:after {
		content: "";
		height: 0;
		width: 30%;
	}

	.picture image {
		margin: 10upx 0;
		width: 30%;
		height: 200upx;
		border: 1px solid #ccc;
	}

	.butBox {
		margin-top: 20upx;
	}

	.tabs {

		/* 	margin: 0 8px;
	margin-top: 10upx; */
	}

	.u-tabs-item {
		background-color: #0081ff;
	}

	.custom-style {
		width: 200upx;
		padding: 0 5upx;
		margin-right: 20upx;
		height: 60upx;
	}
</style>
