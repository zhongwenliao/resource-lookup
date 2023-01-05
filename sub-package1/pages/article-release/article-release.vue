<template>
	<!--物品页面-->
	<view class="article_main">
		<!--自定义导航栏-->
		<uni-nav-bar background-color="#fff" color="#000" :status-bar="status_bar"
			:title="articleRelease['Articlerelease']||'物品放行'" @clickLeft="clickNavLeft()" @clickRight="clickNavRight()">
			<!-- 导航栏左侧插槽 -->
			<view slot="left">
				<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/left.png" mode="" style="width: 15px;height: 15px;"></image>
			</view>
			<!-- 右侧插槽 -->
			<view slot="right" class="right">{{articleRelease['record']||'记录'}}</view>
		</uni-nav-bar>
		<!--自定义导航栏end-->

		<p class="hold15"></p>

		<!--房间号-->
		<view class="input_item">
			<view class="input_text"><span>{{articleRelease['roomNumber']||'房间号'}}</span></view>
			<!--  -->
			<picker @change="roomChange" :range="repairType" range-key="name" :value="repairType.id">
				<view class="roomtext">{{ roomName }}</view>
			</picker>
		</view>
		<!--房间号 end-->

		<p class="hold15"></p>

		<!--输入搬运日期-->
		<view class="input_item">
			<view class="input_text"><span>{{articleRelease['Deliverydate']||'搬运日期'}}</span></view>
			<picker mode="date" :value="date" :start="startDate" :end="endDate" @change="bindDateChange"
				style="width: 70%;">
				<view class="datetime-box">
					<view class="uni-input">{{date}}</view>
					<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/data.png" mode="" style="width: 20px;height: 20px;padding: 14upx 0;">
					</image>
				</view>
			</picker>
		</view>
		<!--输入搬运日期 end-->

		<p class="hold15"></p>

		<!--物品明细-->
		<view class="input_item" style="flex-direction: column;padding: 0;">
			<p style="padding:20upx;border-bottom: 1px solid #d1d1d1;">{{articleRelease['Itemdetails']||'物品明细'}}</p>
			<view class="goods-box input_text" v-for="(item, i) in goods" style="padding: 4upx 20upx;">
				<u-input v-model="item.name" :placeholder="articleRelease['Itemname']||'请输入物品名称'" />
				<span class="goods-border"></span>
				<u-input v-model="item.number" :placeholder="articleRelease['Numberofitems']||'请输入物品数量'"
					type="number" />
				<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/add.png" mode="" style="width: 20px;height: 20px;margin: auto;" v-if="i==0"
					@click="addGoods">
					<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/del.png" mode="" style="width: 20px;height: 20px;margin: auto;"
						v-if="i!=0" @click="delGoods(item,i)">
			</view>
		</view>
		<!--物品明细end-->

		<!--上传图片-->
		<view class="uni-form-item input_item" style="flex-flow: column;">
			<p class="img_box">
				<view class="picture" v-for="(item,index) in imageList" :key="index">
					<view class="tu">
						<!--删除图片-->
						<u-icon class="del" name="close-circle-fill" color="#000000" size="45"
							@click="DelImg(index,imageList)">
						</u-icon>
						<!--删除图片end-->

						<image :src="item" @click="ViewImage(index,imageList)"></image>
					</view>
				</view>
				<view @click="photo" class="photo" v-if="imageList.length<6">
					<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/adds.png"></image>
				</view>
			</p>
		</view>
		<!--上传图片end-->


		<!--提交按钮-->
		<button @click="changes">{{articleRelease['submit']||'提交'}}</button>
		<!--提交按钮 end-->
	</view>
</template>

<script>
	let imageBase64List = [];
	export default {
		data() {
			const currentDate = this.getDate({
				format: true
			})
			return {
				phone: '', //用户手机号(接口获取)
				repairType: [], //所有房间的列表
				imageList: [], //展示出来的图片列表(自己上传的)
				userList: '', //
				imgSrc: "http://yuanzhoulvwego.com/wp-content/uploads/static/img/house/take-photo.jpg",
				status_bar: true,
				roomName: '', //房间号
				roomid: '', //房间id
				date: currentDate, //搬运时间
				goods: [{ //物品的名称以及数量
					name: '',
					number: ''
				}]
			}
		},
		computed: {
			articleRelease() {
				return this.$t("article-release") //返回出国际化的语言数据
			},
			startDate() {
				return this.getDate('start');
			},
			endDate() {
				return this.getDate('end');
			},
			common() {
				return this.$t("common") //返回出国际化的语言数据
			},
		},
		onLoad(options) {
			console.log(this.$t("article-release"))
			this.token = uni.getStorageSync("token")
			this.userInfo = uni.getStorageSync("userInfo")
			this.getAllRooms() //调取房间号接口 获取信息
		},
		onShow() {
			imageBase64List = []
			this.repairType = [] //所有房间的列表
		},
		methods: {
			// 点击导航栏左侧
			clickNavLeft() {
				uni.switchTab({
					url: '/pages/main/main'
				});
			},

			// 点击导航栏右侧 
			clickNavRight() {
				uni.navigateTo({
					url: "/sub-package1/pages/article-release/release-list"
				});
			},

			//获取房间信息
			getAllRooms() {
				if (this.userInfo.currentCommunity) { //判断是否选择了小区 
					this.$req.request({
						url: "/sqRoom/app/getAllRooms",
						method: "POST",
						data: {
							accessToken: this.token,
							communityId: this.userInfo.currentCommunity.id,
						},
						success: res => {
							if (res.code == 0) {
								console.log(res)
								if (res.data.length != 0) {
									for (var i = 0; i < res.data.length; i++) {
										this.repairType.push({
											name: res.data[i].buildingName + res.data[i].name,
											id: res.data[i].id
										})
									}
									this.roomName = this.repairType[0].name
									this.roomid = this.repairType[0].id
								} else {
									this.roomName = '暂无数据'
								}
							} else {
								this.roomName = '暂无数据'
							}
						}
					});
				} else {
					this.$showToast('请在社区页面选择小区！');
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/main/main'
						});
					}, 1000);
				}

			},
			//选择房间号
			roomChange(e) {
				this.roomName = this.repairType[e.detail.value].name
				this.roomid = this.repairType[e.detail.value].id
			},
			usernameInof() {
				this.$req.request({
					url: "/appUser/app/getVerifyStatusErrorByPhone",
					method: "POST",
					header: {
						"content-type": "application/x-www-form-urlencoded"
					},
					data: {
						phone: this.phone,
						accessToken: ''

					},
					success: res => {
						this.userList = res.data
					}
				});
			},

			//调用拍照或从相册选取 上传图片
			photo() {
				uni.chooseImage({
					count: 6 - this.imageList.length, // 允许上传的照片数量
					sizeType: ['compressed'],
					success: (result) => {
						this.imageList = this.imageList.concat(result.tempFilePaths); //数组拼接
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
					loop: true
				});
			},

			//删除图片
			DelImg(i, imgList) {
				uni.showModal({
					title: this.common['hint'] || '提示',
					content: this.articleRelease['delphoto'] || '确定要删除照片吗？',
					cancelText: this.common['cancel'] || '取消',
					confirmText: this.common['confirm'] || '确定',
					success: res => {
						if (res.confirm) {
							imgList.splice(i, 1)
						}
						console.log(this.imageList)
					}
				})
			},

			//提交
			changes() {
				if (this.goods[0].name && this.goods[0].number !== '') { //判断是否填写了物品
					imageBase64List = [] //提交时候先初始化

					//处理base转型图片数据
					for (var i = 0; i < this.imageList.length; i++) {
						this.$getImageBase64(this.imageList[i], (imageBase64) => {
							imageBase64List.push(imageBase64);
						});
					}
					//避免还未执行完上面的就执行接口 做个延时处理
					setTimeout(() => {
						this.$req.request({
							url: "/appGoodsRelease/app/add",
							method: "POST",
							data: {
								accessToken: this.token,
								roomId: this.roomid,
								roomName: this.roomName,
								deliveryDate: this.date,
								goods: JSON.stringify(this.goods),
								goodsPictureBase64: imageBase64List.join("||")
							},
							success: res => {
								if (res.code == 0) {
									this.$showToast(res.msg);
									setTimeout(() => {
										uni.navigateTo({
											url: "/sub-package1/pages/article-release/article-release-submit"
										});
									}, 500);
								} else {
									this.$showToast(res.msg);
								}
							}
						});
					}, 1000);
				} else {
					this.$showToast(this.articleRelease['Please'] || '请填写物品明细');
				}

			},
			bindDateChange(e) {
				this.date = e.target.value
			},
			getDate(type) {
				const date = new Date();
				let year = date.getFullYear();
				let month = date.getMonth() + 1;
				let day = date.getDate();

				if (type === 'start') {
					year = year - 60;
				} else if (type === 'end') {
					year = year + 2;
				}
				month = month > 9 ? month : '0' + month;;
				day = day > 9 ? day : '0' + day;
				return `${year}-${month}-${day}`;
			},
			//点击加号新增物品信息
			addGoods() {
				this.goods.push({
					"name": '',
					"number": ''
				});
			},
			//点击减号减少物品信息
			delGoods(item, i) {
				this.goods.splice(i, 1);
			}
		},
	}
</script>

<style scoped>
	.article_main {
		width: 100%;
		font-size: 30upx;
		background-color: #F5F5F5;
		overflow-x: hidden;
	}

	.uni-form-item {
		padding: 10px 0px;
	}

	.roomtext {
		line-height: 33px;
		height: 32px;
	}

	.uni-input {
		height: 65upx;
		font-size: 30upx;
		padding: 0px;
		line-height: 65upx;
	}

	uni-textarea {
		font-size: 30upx;
		width: 95%;
	}

	.input_item {
		display: flex;
		background: #FFFFFF;
		padding: 20upx 20upx;
		/* margin-top: 15upx; */
	}


	.input_text {
		margin-right: 20upx;
		height: 65upx;
		line-height: 65upx;
	}

	.tu {
		position: relative;
	}

	.tu>.u-icon {
		position: absolute;
		right: 0;
		z-index: 2;
	}

	.img_box {
		width: 95%;
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.img_box:after {
		content: "";
		height: 0;
		width: 30%;
	}

	.img_box>uni-view {
		display: flex;
	}

	.picture {
		width: 30%;
		height: 200upx;
		position: relative;
	}

	.del {
		position: absolute;
		right: 0;
	}

	.tu,
	.picture image {
		width: 100%;
		height: 100%;
	}

	.photo {
		width: 30%;
		height: 200upx;
		display: flex;
		border: 1px solid #f1f1f1cc;
		background: #f1f1f1cc;
	}

	.photo image {
		margin: auto;
		width: 35%;
		height: 35%;
	}

	.img_box>view {
		margin: 10upx;
	}

	button {
		margin: 0px 10%;
		margin-top: 10%;
		background: linear-gradient(118deg, #01DCA3 0%, #088B68 100%);
		box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
		border-radius: 50upx 50upx 50upx 50upx;
		color: #FFFFFF;
	}

	.datetime-box {
		display: flex;
		justify-content: space-between;
	}

	.input_item .goods-box {
		width: 95.5%;
		display: flex;

		border-bottom: 1px solid #d1d1d1;
		padding: 0 20upx;
	}

	.goods-box .u-input {
		width: 43%;
		/* height: 70upx;
		font-size: 28upx; */
	}

	.goods-border {
		background: #d1d1d1;
		display: inline-block;
		width: 1px;
		margin: 10upx 20upx;
	}
</style>
