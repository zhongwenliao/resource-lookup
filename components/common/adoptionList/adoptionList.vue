<template>
	<view class="adoptionList" :class="adoptionIn < 5 ? 'adoptionListContent' : ''">
		<view class="list">
			<block v-if="adoptionData.length > 0">
				<view class="item" v-for="(hen,index) in adoptionData" :key="index">
					<block v-if="hen.statusID == 1">
						<view class="item-left" @click="adoptionhots(hen.hdid)">
							<image :src="hen.iconUrl"></image>
						</view>
						<view class="item-right" @click="adoptionhots(hen.hdid)">
							<view class="item_title">{{hen.hdmc}}</view>
							<view class="item-font">鸡：{{hen.numHens}}只</view>
							<view class="item-font">每日产蛋：{{hen.numEggs}}枚</view>
							<view class="item-font">产蛋剩余天数：{{hen.numExp}}天</view>
							<view class="item-font1">认养价格：<text style="color: crimson;">{{hen.price}} 枚蛋</text></view>
						</view>
						<view class="adopt_view" @click="signToday(hen.hdid)">
							<view class="adopt_title ymcode_ml">
								<text>认养</text>
							</view>
						</view>
					</block>
				</view>
			</block>
			<uni-load-more :status="statusLoadMore" :content-text="contentText" />
		</view>
		
		<uni-popup ref="popup" :is-mask-click="false" background-color="#ffffff">
			<view class="popup-content">
				<view class="popup-title">交易密码</view>
				<input class="popup_index" type="password" v-model="dealPassword" placeholder="请输入交易密码" maxlength="6" />
				<view class="state_view">
					<view class="cancel" @click="cancelClick">取消</view>
					<view class="confirm ymcode_ml" @click="confirmClick">确定</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	export default {
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
		watch: {
			pages: {
				handler() {
					this.loadData()
				}
			}
		},
		data() {
			return {
				adoptionData:[],
				adoptionIn: 0,
				
				// 交易密码
				dealPassword: ''
			};
		},
		mounted() {
			this.loadData()
		},
		methods:{
			loadData(){
				this.$http("huodongListClient", JSON.stringify({
					token:uni.getStorageSync("token"),
					pg: this.pages,
					hdmc:''
				})).then(res=>{
					if (res.data.code == 0) {
						this.adoptionData = [...this.adoptionData, ...res.data.huodongList.datas]
						this.adoptionIn = res.data.huodongList.pgInfo.total_num
						this.$emit("adoptionInfo", res.data.huodongList.pgInfo)
					} else if (res.data.code == 99) {
						uni.showModal({
							content: "请先登录",
						 success: (e) => {
							if (e.confirm) {
									uni.clearStorage();
									setTimeout(() => {
										uni.redirectTo({
											url: "../public/login"
										})
									}, 200)
								}
							}
						});
					} else {
						uni.showToast({ title: res.data.msg, icon: 'none'});
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			adoptionhots(hdid){
				uni.redirectTo({
					url: '/pages/product/product2?hdid='+hdid
				})
			},
			signToday(hdid){
				this.hdid = hdid
				this.userPwdMoneyExists()
			},
			// 取消交易密码
			cancelClick(){
				this.dealPassword = ''
				this.$refs.popup.close()
			},
			// 确认交易密码
			confirmClick(){
				this.userPwdMoneyCheck()
			},
			// 交易密码验证是否存在
			userPwdMoneyExists(){
				this.$http("userPwdMoneyExists", JSON.stringify({
					token: uni.getStorageSync("token")
				})).then(res => {
					if(res.data.code == 0){
						this.$refs.popup.open('center')
					} else {
						uni.showModal({
							title: '提示',
							content: '交易密码未设定',
							success: function (res) {
								if (res.confirm) {
									uni.redirectTo({
										url: "/pages/finance/transactionPassword"
									})
								}
							}
						});
					}
				}).catch(err=>{
					console.log(err);
				})
			},
			// 交易密码验证接口
			userPwdMoneyCheck(){
				this.$http("userPwdMoneyCheck", JSON.stringify({
					pwdMoney: this.dealPassword,
					token: uni.getStorageSync("token")
				})).then(res => {
					if(res.data.code == 0){
						// 关闭弹出窗口
						this.$refs.popup.close()
						
						this.$http("huodongBuyByEgg", JSON.stringify({
							token: uni.getStorageSync("token"),
							hdid: this.hdid
						})).then(res=>{	
							if(res.data.code==0){
								let current = 1
								this.$emit("adoptionIndex", current)
							}else{
								uni.showToast({title: res.data.msg, icon: "none"})
							}
						}).catch(err=>{
							console.log(err);
						})
					} else {
						uni.showToast({title:res.data.msg,icon:'none'});
					}
				}).catch(err=>{
					console.log(err);
				})
			}
		}
	}
</script>

<style scoped lang='scss'>
.adoptionListContent{
	height: calc(100vh - 90rpx);
}
.adoptionList {
	width: 100%;
/* 	padding: 0 20upx;
	margin-bottom: 30upx;
	height: 100%; */
	background: #f5f5f5;
	
	.list {
		width: 100%;
		
		.item {
			width: 100%;
			/* height: 230rpx; */
			border: 1rpx solid #e5e5e5;
			display: flex;
			border-radius: 8rpx;
			margin-bottom: 10rpx;
			background: #FFFFFF;
			padding: 10rpx;
			
			.item-left{
				margin-right: 8rpx;
				width: 240rpx;
				float: left;
				
				image{
					height: 100%;
					width: 100%;
				}
			}
			
			.item-right{
				height: 100%;
				width: 350rpx;
				
				.item_title{
					font-size: 38rpx; 
					overflow:hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
					-o-text-overflow:ellipsis;
				}
				.item-font{
					font-size: 25upx;
					color:#999999;
					overflow:hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
					-o-text-overflow:ellipsis;
					padding-top: 8rpx;
				}
				.item-font1{
					font-size: 28upx;
					overflow:hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
					-o-text-overflow:ellipsis;
					padding-top: 10rpx;
				}
				.item_remark{
					font-size: 22rpx;
					color:#999999;
					display: flex;
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
				}
				.item_price{
					color: #E51515;
					text:nth-child(2){font-size: 40rpx;}
				}
			}
			.adopt_view{
				width: 140rpx;
				height: 210rpx;
				display: flex;
				align-items: center;
				justify-content: flex-end;
				float: right;
				
				.adopt_title{
					width: 110rpx;
					height: 110rpx;
					border-radius: 50%;
					margin: 0 10rpx;
					
					.adopt{
						background: #e7e7e7;
					}
					
					text {
						width: 100%;
						height: 100%;
						color: #FFFFFF;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 40rpx;
					}
				}
			}
		}
	}
}
</style>
