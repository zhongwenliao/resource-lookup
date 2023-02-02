<template>
	<uni-base-page class="content">
		<view class="search-input">
			<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/search.png" alt=""/>
			<input type="text" :placeholder="`${video['door-search']}` || '请输入门名称'" :value="doorName" @input="filterDevice">
		</view>
		<scroll-view class="door-list" v-if="videoDoorList !== null && videoDoorList.length > 0">
			<ul>
				<li v-for="doorObj in videoDoorList" :key="doorObj.doorId">
					<!-- 设备名称展示区 start -->
					<view class="door-name">{{ doorObj.doorName }}</view>
					<!-- 设备名称展示区 end -->
					
					<!-- 按钮操作展示区 start -->
					<view class="btn">
						<!-- 呼叫设备展示区 start -->
						<button @click="videoCall(doorObj)">
							<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/video/video.png" />
						</button>
						<!-- 呼叫设备展示区 end -->
						
						<!-- 微信小程序端呼叫设备展示区 start -->
						<!-- #ifdef MP-WEIXIN -->
							<!-- <button @click="enterRoom()">
								<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/video/video.png"></image>
							</button> -->
						<!-- #endif -->
						<!-- 微信小程序端呼叫设备展示区 end -->
						
						<!-- 远程开门展示区 start -->
						<button @click="openDoor(doorObj)">
							<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/video/door.png" />
						</button>
						<!-- 远程开门展示区 end -->
						
						<!-- 查看设备详情展示区 start -->
						<button @click="checkInfo(doorObj)">
							<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/video/info.png" />
						</button>
						<!-- 查看设备详情展示区 end -->
						
					</view>
					<!-- 按钮操作展示区 end -->
				</li>
			</ul>
		</scroll-view>
		<view v-else class="no-video-door">{{ video["no-video-door"] || "暂无门口视频设备" }}</view>
	</uni-base-page>
</template>

<script>
	import { setData } from "../../../sub-package1/common/js/trtc/GenerateTestUserSig";
	// #ifdef APP-PLUS
	let trtcPlugin = uni.requireNativePlugin("DoorMaster-Trtc-Plugin") || {};
	// #endif
	
	export default {
		data() {
			return {
				videoDoorList:[],
				allVideoDoor: [],
				doorName: ""
			}
		},
		methods: {
			// 获取视频设备列表
			getVideoDoorList(communityId) {
				var _this = this;
				this.$req.request({
					url: "/sqDoor/app/getVideoDeviceList",
					data: {
						communityId: communityId
					},
					show_loading: true,
					success: res => {
						let allVideoDoorList = res.data.map(door => {
							door.callable = true;
							return door;
						});
						this.allVideoDoor = allVideoDoorList;
						this.videoDoorList = allVideoDoorList;
						this.$nextTick(() => {
							// 获取设备黑名单列表
							this.getBlackList();
						});
					}
				});
			},
			
			// 远程开门
			openDoor(doorObj) {
				this.$req.request({
					url: "/sqDoor/app/openDoor",
					data: {
						devSn: doorObj.devSn,
						relayIndex: doorObj.relayIndex
					},
					success: res => {
						if(res.code == 0) {
							setTimeout(() => {
								this.$showToast(this.common["open-success"]);
							}, 1000);
						}
					}
				});
			},
			
			// 视频呼叫
			videoCall(doorObj) {
				// 获取当前设备的对讲模式，如果没有这个参数，即默认为0，也就是默认用dmvphone插件来对讲
				let intercomMode = doorObj.intercomMode || 0;
				
				// 获取当前呼叫设备的设备序列号以及设备名称
				let devSn = doorObj.devSn, doorName = doorObj.doorName;
				
				// 如果当前设备对讲模式为0，则走我们自己搭建的音视频对讲服务器，用dmvphone插件来对讲
				if (intercomMode === 0) {
					this.$sdkUtil.callAccount(devSn, 2, this.$getUserInfo().phone, doorName);
				} 
				
				// 如果当前设备对讲模式为1，则走腾讯那边的，用腾讯音视频对讲插件来对讲
				else if (intercomMode === 1) {
					// #ifdef APP-PLUS
					trtcPlugin.answerEnterRoom({
						"usersig": doorObj.userSig,  // 用户签名
						"appid": decrypted(doorObj.appId),  // 对当前的设备信息中的腾讯TRTC的appId进行解密，得到腾讯TRTC的appId
						"rooid": doorObj.roomId, // 呼叫的房间id
						"userid": this.$getUserInfo().id, // APP登录用户id
						"devsn": devSn, // 呼叫的设备序列号
						"callerid": devName, // 显示在被呼叫方的界面上面的设备名称
						"callerpic": doorObj.captureImage // 显示在被呼叫方的界面上面的抓拍图片
					}, (code) => {
						if (code == 1) {
							// 当前用户对讲界面点击开门按钮，调用设备远程开门接口，进行远程开门
							console.log("当前用户对讲界面点击开门按钮，设备远程开门");
							trtcPlugin.showWaiting("Opening door...");
							this.$req.request({
								url: "/sqDoor/app/openDoor",
								data: {
									relayIndex: 1,
									devSn: devSn
								},
								success: (res) => {
									this.$showLog("开门结果", res);
									let toastMsg = res.code == 0 ? "The door is open" : res.msg;
									trtcPlugin.showToast(toastMsg);
								},
								complete: () => {
									trtcPlugin.closeWaiting();
								}
							});
						}
					});
					// #endif
				}
			},
			
			// 获取黑名单列表，设置设备呼叫
			getBlackList() {
				this.$sdkUtil.getBlackList(result => {
					let blackList = result.data;
					for(let i = 0; i < blackList.length; i++) {
						for(let j = 0; j < this.videoDoorList.length; j++) {
							if(this.videoDoorList[j]["devSn"] == blackList[i]) {
								this.videoDoorList[j]["callable"] = false;
								break;
							}
						}
					}
				});
			},
			
			// 进入房间（用于小程序音视频对讲）
			enterRoom() {
				var roomID = 2742328;
				var relayIndex = 1;
				var devSn = "2358358273";
				var template = "1v1";
				var debugMode = false;
				var cloudenv = "PRO";
				const url = `../room/room?roomID=${roomID}&template=${template}&debugMode=${debugMode}&cloudenv=${cloudenv}&devSn=${devSn}&relayIndex=${relayIndex}`;
				wx.navigateTo({
				  url: url
				});
			},
			// 查看设备信息
			checkInfo(doorObj) {
				uni.navigateTo({
					url:"dev-info?dev=" + JSON.stringify(doorObj)
				});
			},
			
			// 搜索过滤
			filterDevice(e) {
				var searchName = e.detail.value;
				this.videoDoorList = [];
				for(var i in this.allVideoDoor) {
					if(this.allVideoDoor[i].doorName.indexOf(searchName) > -1) {
						this.videoDoorList.push(this.allVideoDoor[i]);
					}
				}
				// this.$showToast(JSON.stringify(this.videoDoorList));
				console.log("this.videoDoorList：", JSON.stringify(this.videoDoorList));
			}
			
		},
		onReady() {
			this.$setTitle(this.title["video"]);
		},
		onLoad() {
			var _this = this;
			var communityId = this.$getUserInfo().currentCommunity.id;
			this.getVideoDoorList(communityId);
			this.$onfire.on("EventDevInfoChange", e => {
				var newDevInfo = e["newDevInfo"];
				for(var i = 0; i < _this.videoDoorList.length; i++) {
					if(_this.videoDoorList[i]["doorId"] == newDevInfo["doorId"]) {
						_this.videoDoorList[i]["callable"] = newDevInfo["doorId"]["callable"];
						break;
					}
				}
			})
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.allVideoDoor = [];
			this.videoDoorList = [];
			var communityId = this.$getUserInfo().currentCommunity.id;
			this.getVideoDoorList(communityId);
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 500)
		},
		onUnload() {
			this.$onfire.un("EventDevInfoChange");
		},
		
		computed: {
			common() {
				return this.$t("common");
			},
			video() {
				return this.$t("video");
			},
			title() {
				return this.$t("title");
			}
			
		}
	}
</script>

<style>
	.content {
		padding-top: 0;
	}
	
	.door-list {
		height: 98%;
	}
	.door-list ul {
		padding: 0;
	}
	
	.door-list ul li {
		background: #ffffff;
		min-height: 100upx;
		height: auto;
		display: inline-flex;
		width: 98%;
		margin-left: 1%;
		margin-right: 1%;
		margin-bottom: 4upx;
		border-bottom: 2upx solid #eee;
	}
	
	.door-name {
		text-align: left;
		width: 50%;
		margin-top: 3%;
		display: inline-block;
		padding-left: 16upx;
	}
	
	.btn {
		display: inline-block;
		width: 50%;
		margin-top: 3%;
		text-align: right;
		padding-right: 16upx;
	}
	
	.btn button {
		border: none;
		background: transparent;
		display: inline-block;
		padding: 0;
		width: 66upx;
		height: 66upx;
		margin-left: 5upx;
	}
	
	.btn button:after {
		border: none;
		padding: 0;
		width: 66upx;
		height: 66upx;
	}
	
	.btn button image {
		width: 66upx;
		height: 66upx;
	}
	
	.no-video-door {
		width: 100%;
		height: 200upx;
		text-align: center;
		line-height: 200upx;
		margin-top: 50%;
	}
	
	.search-input {
		margin: 10upx 10%;
		padding: 10upx;
		border: 1upx solid #EEEEEE;
		border-radius: 10upx;
		line-height: 40upx;
		background: #FFFFFF;
	}
	
	.search-input image {
		width: 40upx;
		height: 40upx;
		display: inline-block;
		padding-right: 20upx;
	}
	
	.search-input input {
		width: 80%;
		display: inline-block;
		font-size: 32upx;
	}
</style>
