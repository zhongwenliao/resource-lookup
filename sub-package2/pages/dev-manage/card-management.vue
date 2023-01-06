<template>
	<uni-base-page class="uni-base-page">
		<view class="pages-container">
			<view class="card-box-view">
				<button class="card-view" @click="syncServerCardData">
					<text class="operation-title">{{ manage["sync-server-data"] || "同步服务器卡数据" }}</text>
				</button>
				<view class="operation-instruction">{{  manage["sync-card-data-tips"] || "从服务器获取卡号，进行批量删卡添卡操作，此过程可能耗时较长" }}</view>
			</view>
			<view class="card-box-view" v-if="devObj.btCardAddType !== 0">
				<button class="card-view" @click="swipeCardAdd">
					<text class="operation-title" v-if="devObj.deviceModelName === 'M160'">{{ manage["swipe-to-report-loss"] || "刷卡挂失" }}</text>
					<text class="operation-title" v-else>{{ swipe_card_add }}</text>
				</button>
				<button class="exit-btn" @click="exitCardAdd" v-if="exitBthShow1">
					<text class="operation-title">{{ mine["logout"] || "退出" }}</text>
				</button>
				<view class="operation-instruction">{{ swipe_card_add_tips }}</view>
			</view>
			<view class="card-box-view" v-if="devObj.btCardAddType !== 0">
				<button class="card-view" @click="swipeCardDelete">
					<text class="operation-title" v-if="devObj.deviceModelName === 'M160'">{{ manage["swipe-to-unlock"] || "刷卡解挂" }}</text>
					<text class="operation-title">{{ swipe_card_delete }}</text>
				</button>
				<button class="exit-btn" @click="exitCardDelete" v-if="exitBthShow2">
					<text class="operation-title">{{ mine["logout"] || "退出" }}</text>
				</button>
				<view class="operation-instruction">{{ swipe_card_delete_tips }}</view>
			</view>
			<view class="card-box-view">
				<button class="card-view" @click="goToInputCard(0)">
					<text class="operation-title">{{ input_card_add}}</text>
				</button>
				<view class="operation-instruction">{{ input_card_add_tips }}</view>
			</view>
			<view class="card-box-view">
				<button class="card-view" @click="goToInputCard(1)">
					<text class="operation-title">{{ input_card_delete }}</text>
				</button>
				<view class="operation-instruction">{{ input_card_delete_tips }}</view>
			</view>
			<view class="card-box-view">
				<button class="card-view" @click="cleanCard">
					<text class="operation-title">{{ manage["clean-card"] || "清空设备卡数据" }}</text>
				</button>
				<view class="operation-instruction">{{ manage["clean-card-tips"] || "删除设备所有卡号" }}</view>
			</view>
			<view v-if="devObj.isSupportFingerprint === 1" class="card-box-view">
				<button class="card-view" @click="cleanFingerprint">
					<text class="operation-title">{{ manage["clean-fingerprint"] || "清空设备指纹数据" }}</text>
				</button>
				<view class="operation-instruction">{{ manage["clean-fingerprint-tips"] || "删除设备所有指纹数据" }}</view>
			</view>
			
			<view class="card-box-view">
				<button class="card-view" @click="getReadCardList">
					<text class="operation-title">{{ manage["read-card-list"] || "读取设备卡列表" }}</text>
				</button>
				<view class="operation-instruction">{{ manage["read-card-list-tips"] || "读取设备上已有卡，此过程耗时较长" }}</view>
			</view>
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data () {
			return {
				devObj: {},
				deleteCardList: [],
				addCardList: [],
				cardNo: [],
				cardNum: "",
				exitBthShow1: false,
				exitBthShow2: false,
				timer: null,
				swipe_card_add: "",
				swipe_card_add_tips: "",
				swipe_card_delete: "",
				swipe_card_delete_tips: "",
				input_card_add: "",
				input_card_add_tips: "",
				input_card_delete: "",
				input_card_delete_tips: ""
			}
		},
		
		computed: {
			manage() {
				return this.$t("manage");
			},
			sdk() {
				return this.$t("sdk");
			},
			mine() {
				return this.$t("mine");
			}
		},
		
		onLoad(options) {
			this.$setTitle(this.manage["card-manage"] || "卡管理")
			if(options.devObj) {
				this.devObj = JSON.parse(options.devObj);
				if( this.devObj.isBtCardAddBlacklist === 1 ) {
					this.swipe_card_add = this.manage['swipe-card-add-blacklist'] || "刷卡添加黑名单";
					this.swipe_card_add_tips = this.manage['swipe-card-add-tips-blacklist'] || "刷卡进行读取卡号添加黑名单";
					this.swipe_card_delete = this.manage['swipe-card-delete-blacklist'] || "刷卡删除黑名单";
					this.swipe_card_delete_tips = this.manage['swipe-card-delete-tips-blacklist'] || "刷卡进行读取卡号删除黑名单";
					this.input_card_add = this.manage['input-card-add-blacklist'] || "输入卡号加入黑名单";
					this.input_card_add_tips = this.manage['input-card-add-tips-blacklist'] || "手动输入卡号添加黑名单";
					this.input_card_delete = this.manage['input-card-delete-blacklist'] || "输入卡号移除黑名单";
					this.input_card_delete_tips = this.manage['input-card-delete-tips-blacklist'] || "手动输入卡号删除黑名单";
				}else {
					this.swipe_card_add = this.manage['swipe-card-add'] || "刷卡添加卡号";
					this.swipe_card_add_tips = this.manage['swipe-card-add-tips'] || "刷卡进行读取卡号添加卡";
					this.swipe_card_delete = this.manage['swipe-card-delete'] || "刷卡删除卡号";
					this.swipe_card_delete_tips = this.manage['swipe-card-delete-tips'] || "刷卡进行读取卡号删除卡";
					this.input_card_add = this.manage['input-card-add'] || "输入卡号添卡";
					this.input_card_add_tips = this.manage['input-card-add-tips'] || "手动输入卡号添加卡";
					this.input_card_delete = this.manage['input-card-delete'] || "输入卡号删卡";
					this.input_card_delete_tips = this.manage['input-card-delete-tips'] || "手动输入卡号删除卡";
				}
			}
		},
		
		methods: {
			//同步服务器卡数据
			syncServerCardData() {
				let that = this;
				that.$showToast()
				//请求要删除和要添加的卡
				Promise.all([that.getDeleteCard(), that.getAddCard()]).then((resultList) => {
					for (let i in resultList) {
						if (("deleteCardData" in resultList[i]) && (resultList[i]["deleteCardData"].length > 0)) {
							that.deleteCardList = resultList[i]["deleteCardData"].map(item => item.cardNo);
						}
						if (("addCardData" in resultList[i]) && (resultList[i]["addCardData"].length > 0)) {
							that.addCardList = resultList[i]["addCardData"].map(item => item.cardNo);
						}
					}
					let needAdd = that.addCardList.length;
					let needDelete = that.deleteCardList.length;
					let deleteCardListStr = that.deleteCardList.join(",");
					if (needDelete == 0 && needAdd == 0) {
						that.$showToast( that.manage["no-update-data"] || "无更新数据");
					} else if (needDelete == 0 && needAdd > 0) {
						//只需要导卡
						that.$sdkUtil.writeCard(that.devObj, that.addCardList, true, (result) => {
							that.postCardList(that.addCardList, that.devObj.devSn);
						});
					} else if (needDelete > 0 && needAdd == 0) {
						//只需要删卡
						that.$sdkUtil.deleteCard(that.devObj, deleteCardListStr, (result) => {
							that.postCardList(that.deleteCardList, that.devObj.devSn);
						});
					} else if (needDelete > 0 && needAdd > 0) { 
						//先删卡后导卡
						that.$sdkUtil.deleteCard(that.devObj, deleteCardListStr, (result) => {
							that.$showToast()
							setTimeout(()=> {
								that.$sdkUtil.writeCard(that.devObj, that.addCardList, true, (res) => {
									let cardList = that.addCardList.concat(that.deleteCardList);
									that.postCardList(cardList, that.devObj.devSn);
								})
							}, 3000)
						});
					}
				});
			},
			//操作完成后将卡号传给服务器
			postCardList(cardList, devSn) {
				this.$req.request ({
					url: "/persOfflineCard/app/operationComplete",
					data:{
						cardNos: cardList,
						devSn: devSn,
						isShowLoad: false
					},
					success: res => {
						if(res.code == 0) {
							this.$showToast(this.manage["sync-card-success"] || "同步服务器卡数据成功");
						}else {
							this.$showToast( res.mag );
						}
					}
				})
			},
			//获取要删除的卡
			getDeleteCard() {
				return new Promise((resolve, reject) => {
					this.$req.request({
						url: "/persOfflineCard/app/getNeedDelOfflineCardByDevSn",
						data: {
							devSn: this.devObj.devSn
						},
						success: res => {
							resolve({"deleteCardData": res.data});
						}
					});
				});
			},
			
			//获取要新增的卡
			getAddCard() {
				return new Promise((resolve, reject) => {
					this.$req.request({
						url: "/persOfflineCard/app/getNeedAddOfflineCardByDevSn",
						data: {
							devSn: this.devObj.devSn
						},
						success: res => {
							resolve({"addCardData": res.data});
						}
					});
				});
			},
			
			
			//刷卡添加卡号
			swipeCardAdd() {
				if(this.devObj.btCardAddType == 1) {
					//调用旧方法
					this.$sdkUtil.swipeAddCardModel(this.devObj, (result) => {
						if (result.errorCode == 0) {
							this.$showToast( this.sdk["swipe-add-card-model"] || "已进入刷卡添卡模式，请刷卡");
							this.exitBthShow1 = true;
						}
					});
				} else if (this.devObj.btCardAddType == 2) {
					//调用新方法
					this.$sdkUtil.getSwipeAddCardno(this.devObj, (result) => {
						let cardNo = result.data.cardNo;
						let cardArray = cardNo.split(",");
						this.$sdkUtil.writeCard(this.devObj, cardArray, true);
					})
				}
			},
			
			//刷卡删除卡号
			swipeCardDelete() {
				if(this.devObj.btCardAddType == 1) {
					//调用旧方法
					this.$sdkUtil.swipeCardDeleteModel(this.devObj, (result) => {
						this.$showToast(this.sdk["swipe-delete-card-model"] || "已进入刷卡删卡模式，请刷卡");
						this.exitBthShow2 = true;
					})
				} else if (this.devObj.btCardAddType == 2) {
					this.$showLog("新方法");
					//调用新方法
					this.$sdkUtil.getSwipeAddCardno(this.devObj, (result) => {
						let cardNo = result.data.cardNo;
						this.$sdkUtil.deleteCard(this.devObj, cardNo);
					})
				}
				
			},
			
			//退出刷卡添加卡号模式
			exitCardAdd() {
				this.$sdkUtil.existSwipeCardAddModel(this.devObj, (result) => {
					if(result.errorCode == 0) {
						this.$showToast(this.sdk["exit-swipe-add-card-model"] || "已退出刷卡添卡模式");
						this.exitBthShow1 = false;
					}
				})
			},
			
			//退出刷卡删除卡号模式
			exitCardDelete() {
				this.$sdkUtil.existSwipeCardDeleteModel(this.devObj, (result) => {
					if(result.errorCode == 0) {
						this.$showToast(this.sdk["exit-swipe-delete-card-model"] || "已退出刷卡删卡模式");
						this.exitBthShow2 = false;
					}
				})
			},
			
			//跳转到输入卡号页面,type为0为添加卡，type为1为删卡
			goToInputCard(type) {
				uni.navigateTo({
					url: "input-card?devObj=" + JSON.stringify(this.devObj) + "&type=" + type
				})
			},
			
			//读取设备卡号
			getReadCardList() {
				this.$sdkUtil.getCardNumbersFromDevice(this.devObj, (result) => {
					let cardNo = result.data.cardNo;
					let cardNum = result.data.cardNum;
					if(cardNum == 0) {
						this.$showToast( this.sdk["no-card"] || "暂无卡数据");
					}else {
						uni.navigateTo({
							url: "../../sub-package/pages/dev-manage/card-list?cardNum=" + cardNum + "&cardNo=" + JSON.stringify(cardNo)
						})
					}
					
				})
			},
			//清空所有指纹数据
			cleanFingerprint() {
				this.$sdkUtil.cleanFingerprints(this.devObj, (res) => {
					this.$showToast("清空所有指纹数据成功");
				});
			},
			//清除所有卡数据
			cleanCard() {
				this.$sdkUtil.cleanCard(this.devObj);
			}
			
		}
		
		
	}
</script>

<style>
	.pages-container {
		background-color: #FFFFFF;
		margin: 0 40upx;
		width: auto;
		height: 100%;
	}
	
	.card-box-view {
		margin: 40upx 0;
	}
	
	.card-view {
		text-align: center;
		background-color: #1E90FF;
		color: #FFFFFF;
		padding: 0 40upx;
		border-radius: 25upx;
	}
	
	.exit-btn {
		text-align: center;
		background-color: #ff4040;
		color: #FFFFFF;
		margin: 10upx auto;
		border-radius: 25upx;
	}
	
	.card-view-border-bottom {
		border-bottom: 1upx solid #1E90FF;
	}
	
	.operation-title {
		font-size: 32upx;
		color: #FFFFFF;
	}
	
	.operation-instruction {
		font-size: 24upx;
		color: #AAAAAA;
		padding: 8upx;
	}
</style>
