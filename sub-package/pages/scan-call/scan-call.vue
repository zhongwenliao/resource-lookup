<template>
	<view class="call">
		<!-- 请选择楼栋 -->
		<view class="building" v-show="buildShow">
			<view class="call-title">
				请选择楼栋
			</view>
			<view class="call-info">
				<ul>
					<li class="clear" v-for="(item,index) in buildingList" :key="index" @click="goToRoom(item.id)">
						<view class="left-icon fl">
							{{item.name}}
						</view>
						<view class="right fr">
							<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/more.png"></image>
						</view>
					</li>
				</ul>
			</view>
		</view>
		<!-- 请选择房间 -->
		<view class="room" v-show="roomShow">
			<view class="search-view-1">
				<view class="search-input">
					<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/search.png"></image>
					<input type="text" placeholder="搜索" style="font-size: 30upx;" @input="getInputValue">
				</view>
			</view>
			<view class="call-title">
				{{buildingName}}
			</view>
			<view class="call-info">
				<ul>
					<li class="clear" v-for="(item,index) in roomList" :key="index" @click="trtc(item.id)">
						<view class="left-icon fl">
							{{item.name}}
						</view>
						<view class="right fr">
							<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/tel.png"></image>
						</view>
					</li>
				</ul>
			</view>
		</view>
	</view>
</template>

<script>
	let jsCode = "";
	export default{
		data(){
			return {
				buildShow: false,
				roomShow: false,
				buildingList: [],
				roomList: [],
				allRoomList: [],
				devDetails: {},
				buildingId: "",
				buildingName: "",
				devSn: ""
			}
		},
		methods:{
			// 获取设备详情
			getDevDetails(devSn){
				this.$req.request({
					url: "/devDevice/h5/getDevDetailByDevSn",
					method: "POST",
					data: {
						devSn: devSn,
					},
					// isShowLoading: true,
					success: res => {
						if(res.code == 0){
							this.devDetails = res.data;
							this.buildingName = this.devDetails.buildingName;
							this.buildingId = this.devDetails.buildingId;
							if(!this.devDetails.buildingId){
								this.buildShow = true;
								this.getBuildingList(this.devDetails.communityId);
							}else{
								this.roomShow = true;
								this.getRoomList(this.devDetails.buildingId);
							}
						}
					}
				});
			},
			// 获取楼栋列表
			getBuildingList(communityId){
				this.$req.request({
					url: "/sqBuilding/h5/getByCommunityId",
					method: "POST",
					data: {
						communityId: communityId,
					},
					isShowLoading: false,
					success: res => {
						if(res.code == 0){
							this.buildingList = res.data;
						}
					}
				});
			},
			goToRoom(buildingId){
				this.buildShow = false;
				this.roomShow = true;
				this.getRoomList(buildingId);
			},
			// 获取房间列表
			getRoomList(buildingId){
				this.$req.request({
					url: "/sqRoom/h5/getByBuildingId",
					method: "POST",
					data: {
						buildingId: buildingId,
					},
					isShowLoading: false,
					success: res => {
						if(res.code == 0){
							this.allRoomList = res.data;
							this.filterByRoom();
						}
					}
				});
			},
			//获取输入内容
			getInputValue(e) {
				let inputDev = e.detail.value;
				let allRoomList = this.allRoomList;
				let filterRoomList = [];
				for (let i in allRoomList) {
					if (allRoomList[i].name.indexOf(inputDev) > -1) {
						filterRoomList.push(allRoomList[i]);
					}
				}
				this.roomList = filterRoomList;
			},
			// 过滤
			filterByRoom() {
				let allRoomList = this.allRoomList;
				this.roomList = this.allRoomList;
			},
			// 对讲呼叫
			trtc(roomId){
				uni.navigateTo({
					url: "/sub-package/pages/room/scanTrtc?roomId=" + roomId + '&devSn=' + this.devSn + '&jsCode=' + jsCode + '&isOnlyDisplayMe=true'
				});
			}
		},
		onLoad(options) {
			// 扫码拿到的参数
			this.devSn = decodeURIComponent(options.scene);
			// this.devSn = options.scene;
			this.getDevDetails(this.devSn);
			this.filterByRoom();
		},
		onShow() {
			// #ifdef MP-WEIXIN
			// 微信授权登录
			uni.login({
				provider: "weixin",
				success: (res) => {
					this.$showLog("微信授权登录成功", res, "登录界面");
					jsCode = res.code;
				},
				fail: (err) => {
					this.$showErrorLog("微信授权登录失败", err, "登录界面");
				}
			});
			// #endif
		},
		// 下拉刷新
		onPullDownRefresh(){
			if(this.buildingId){
				this.getRoomList(this.buildingId);
			}
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000)
		}
	}
</script>

<style>
	.call{
		width: 100%;
		border-top: 1px solid #eee;
		background: #F2F2F2;
	}
	.building .call-title{
		font-size: 34upx;
		padding: 20upx;
	}
	.building .call-info ul{
		padding-left: 0;
	}
	.building .call-info ul li {
		background: #FFFFFF;
		padding: 0 20upx ;
		margin-bottom: 20upx;
	}
	.building .call-info .left-icon{
		height: 120upx;
		line-height: 120upx;
	}
	.building .call-info .right {
		width: 10%;
		display: inline-block;
		height: 120upx;
		line-height: 120upx;
		vertical-align: middle;
		text-align: right;
	}
	.building .call-info .right image {
		width: 32upx;
		height: 32upx;
		display: inline-block;
		vertical-align: middle;
	}
	
	
	
	.room .search-view-1 {
		background: #fff;
		padding: 20upx 0;
	}
	.room .search-input {
		width: 85%;
		/* #ifndef MP-ALIPAY */
		padding: 14upx 20upx;
		/* #endif */
		background: #f2f2f2;
		border-radius: 38upx;
		text-align: left;
		color: #BEBEBE;
		margin: auto;
	}
	
	.room .search-input image {
		width: 42upx;
		height: 42upx;
		/* #ifndef MP-ALIPAY */
		float: left;
		margin-right: 16upx;
		/* #endif */
	
		/* #ifdef MP-ALIPAY */
		margin-left: 16upx;
		/* #endif */
	}
	.room .call-title{
		font-size: 34upx;
		padding: 20upx;
	}
	.room .call-info ul{
		padding-left: 0;
	}
	.room .call-info ul li {
		background: #FFFFFF;
		padding: 0 20upx ;
		margin-bottom: 20upx;
	}
	.room .call-info .left-icon{
		height: 120upx;
		line-height: 120upx;
	}
	.room .call-info .right {
		width: 10%;
		display: inline-block;
		height: 120upx;
		line-height: 120upx;
		vertical-align: middle;
		text-align: right;
	}
	.room .call-info .right image {
		width: 52upx;
		height: 52upx;
		display: inline-block;
		vertical-align: middle;
	}
</style>
