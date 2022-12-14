<template>
	<uni-base-page class="articleRelease-main">

		<!-- 标题栏 -->
		<view class="tabs">
			<u-tabs-swiper ref="uTabs" :list="list" :current="current" @change="tabsChange" :is-scroll="false"
				swiperWidth="750"></u-tabs-swiper>
		</view>
		<!-- 标题栏  end-->

		<swiper :current="swiperCurrent" @transition="transition" @animationfinish="animationfinish">
			<swiper-item class="swiper-item" v-for="(item, index) in lists" :key="index">
				<scroll-view scroll-y style="width: 100%;" @scrolltolower="onreachBottom">
					<view class="list">
						<ul>
							<!-- <u-back-top :scroll-top="scrollTop" top="10"></u-back-top> -->
							<!--没有列表数据的话展示-->
							<u-empty :text="articleRelease['NodDataAvailable']||'暂无数据'" mode="list"
								v-if="item.releaseList.length==0" style="padding: 30% 0;">
							</u-empty>
							<!--没有列表数据的话展示end-->

							<li v-for="(j, i) in item.releaseList" :key="i" @click="disdetail(j.id)">
								<p class="font" v-if="j.status!=1">{{j.createTime}}</p>
								<view class="listItems">
									<p>{{j.name}}</p>
								</view>
								<view class="imgBox" >
									<view class="picture" v-for="(Src, srcIndex) in j.imgSrcList"  v-if="srcIndex<3 && Src"
										:style="{'background-image':'url('+Src+')'}">
									</view>
								</view>
								<p class="del" v-if="j.status!=1" @click.stop="open(j.id,j.status)">{{ manypage['delete'] || '删除' }}</p>
							</li>
						</ul>
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>
		<u-modal v-model="show" :content="content" @confirm="confirm" :show-cancel-button="true"></u-modal>
	</uni-base-page>
</template>

<script>
	let userInfo = ''
	let token = ''

	export default {
		data() {
			return {
				show: false,
				id: '', //点击信息的id
				scrollTop: 0,
				imgList: [],
				imgSrcList: [],
				show: false,
				content: '确定要删除吗？',
				list: [
					{
						name: this.$t("manypage")["released"] || "已发布",
					}, 
					{
						name: this.$t("manypage")["examine"] || "审核中",
					}, 
					{
						name: this.$t("manypage")["no-pass"] || "未通过",
					}
				],
				lists: [
					{
						releaseList: []
					}, 
					{
						releaseList: []
					}, 
					{
						releaseList: []
					}
				],
				// 因为内部的滑动机制限制，请将tabs组件和swiper组件的current用不同变量赋值
				current: 0, // tabs组件的current值，表示当前活动的tab选项
				swiperCurrent: 0, // swiper组件的current值，表示当前那个swiper-item是活动的
			};
		},
		computed: {
			articleRelease() {
				return this.$t("article-release") //返回出国际化的语言数据
			},
			manypage() {
				return this.$t('manypage');
			},
			title() {
				return this.$t("title")
			}
		},
		onReady() {
			this.$setTitle(this.title["my-dis"])
		},
		onLoad() {
			userInfo = uni.getStorageSync("userInfo")
			token = uni.getStorageSync("token")
			this.listByWyEmp(1)
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
					url: "/omCoupon/app/getCurrentAppUserCoupon",
					method: "POST",
					data: {
						status: status
					},
					success: res => {
						let num;   // 用于区分当前的模块 比如 已发布 审核中 未通过
						if (res.code == 0) {
							let data = res.data;
							if (status == 1) {
								// 已发布
								this.lists[0].releaseList = data;
								num = 0;
							} else if (status == 0) {
								// 审核中
								this.lists[1].releaseList = data;
								num = 1;
							} else if (status == 2) {
								// 未通过
								this.lists[2].releaseList = data;
								num = 2;
							}
							
							for (var i = 0; i < this.lists[num].releaseList.length; i++) {
								this.imgList.push(this.getObjectKeys(this.lists[num].releaseList[i].content.match(this.$regExp.imgRegExp)));
								this.lists[num].releaseList[i].imgSrcList=this.imgList[i].join(",").replace(/src=/g, "").replace(/"/g, "").split(",");
							}
						} else {
							this.$showToast(res.msg);
						}

					}
				});
			},
			//处理富文本框回来的数据
			getObjectKeys(object) {
				var values = [];
				for (var property in object) {
					values.push(object[property]);
				}	
				return values;
			},
			open(id,status) {
				this.id = id
				this.status=status//当前点击的状态 
				this.show = true;

			},
			confirm() {
				this.delItem()//调取删除接口
			},
			//审核中以及未通过的列表删除
			delItem() {
				this.$req.request({
					url: "/omCoupon/app/delByIds",
					method: "POST",
					data: {
						ids: this.id
					},
					success: res => {
						if (res.code == 0) {
							this.$showToast(res.msg);
							this.listByWyEmp(this.status)
						} else {
							this.$showToast(res.msg);
						}
					}
				});
			},
			disdetail(id){
				console.log("udsuihfi",id)
				uni.navigateTo({
					url: "../../../pages/nearby-discount/nearby-discount-detail?id=" + id
				});
			},
			// tabs通知swiper切换
			tabsChange(index) {
				this.swiperCurrent = index;
				this.imgList = []//将带有src的数组清空
				this.imgSrcList=[]//将url数组清空
				
				//通过当前页面下标确定需要什么状态的列表
				if (index == 1) {
					this.listByWyEmp(0)
				} else if (index == 0) {
					this.listByWyEmp(1)
				} else if (index == 2) {
					this.listByWyEmp(2)
				}

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

<style lang="scss" scoped>
	page {
		background: #eeeeee !important;
		height: 100%;
	}

	.articleRelease-main {
		width: 100%;
		height: 93.6%;
	}

	ul,
	li {
		padding: 0px;
		margin: 0px;
		list-style: none;
	}

	uni-swiper,
	uni-scroll-view {
		height: 100% !important;
	}

	.list {
		width: 100%;
		height: 100%;
		margin-bottom: 10upx;
	}

	.tabs {
		margin: 10upx 0;
	}

	.list li {
		padding: 30px 8px;
		background: #FFFFFF;
		border-bottom: 1px solid #e5e5e5;
		position: relative;
		.del{
			position: absolute;
			font-size: 26upx;
			color: #888;
			right: 20upx;
			bottom: 0;
		}
	}

	.listItems {
		margin: 0 10upx;
	}

	.listItems p {
		font-size: 17px;
		font-weight: 500;
	}

	.imgBox {
		display: flex;
	}

	.font {
		text-align: right;
		line-height: 0;
		font-size: 13px;
		color: #888;
	}

	.picture {
		margin: 0upx 18upx;
		width: 200upx;
		height: 200upx;
		border: 1px solid #ccc;
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
	}
</style>
