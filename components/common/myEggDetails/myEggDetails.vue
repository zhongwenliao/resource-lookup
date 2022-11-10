<template>
	<view class="content" :class="tableData.length < 9 ? 'myEggContent' : ''">
		<block v-for="(item, index) in tableData" :key="index">
			<view class="hens_list">
				<view class="hens_view">
					<text>时间：{{ item.inputTime }}</text>
					<text>类型：{{ item.typeName }}</text>
				</view>
				<view class="hens_view">
					<view v-if="item.moneyRemain != 0">当前鸡蛋(枚)：<text style="color: red;">{{ item.moneyRemain }}</text></view>
					<view class="hens_money">
						<text>鸡蛋变动(枚)：</text>
						<text class="money" v-if="item.inOut==1">{{ item.inOut==1?"+":"-" }}{{ item.money}}</text>
						<text class="money_text" v-else>{{ item.inOut==1?"+":"-" }}{{ item.money}}</text>
					</view>
				</view>
				<view class="text_x" v-if="item.txt">详情：{{ item.txt }}</view>
			</view>
		</block>
		<uni-load-more :status="statusLoadMore" :content-text="contentText" />
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
				this.systemCfgInfoClient()
			}
		}
	},
	data() {
		return {
			tableData: []
		}
	},
	mounted() {
		this.systemCfgInfoClient()
	},
	methods: {
		systemCfgInfoClient(){
			this.$http("systemCfgInfoClient", JSON.stringify({
				cfgKey: 'eggDetailModue',
				token: uni.getStorageSync("token")
			})).then(res => {
				if (res.data.code == 0) {
					if(res.data.systemCfgInfo.cfgValue == 1){
						this.userEggListUser()
					} else {
						this.userEggListUserNew()
					}
				}
			}).catch(err => {
				console.log(err);
			})
		},
		userEggListUserNew(){
			this.$http("userEggListUserNew",JSON.stringify({
				token: uni.getStorageSync("token"),
				eggType: 0,
				pg: this.pages
			})).then(res=>{
				if(res.data.code == 0){
					this.tableData = [...this.tableData, ...res.data.eggList.datas]
					
					this.$emit("eggDetailInfo", res.data.eggList.pgInfo)
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
				}else{
					uni.showToast({ title: res.data.msg, icon: 'none'});
				}
			}).catch(err=>{
				console.log(err);
			})	
		},
		userEggListUser(){
			this.$http("userEggListUser",JSON.stringify({
				token: uni.getStorageSync("token"),
				eggType: 0,
				pg: this.pages
			})).then(res=>{
				if(res.data.code == 0){
					this.tableData = [...this.tableData, ...res.data.eggList.datas]
					
					this.$emit("eggDetailInfo", res.data.eggList.pgInfo)
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
				}else{
					uni.showToast({ title: res.data.msg, icon: 'none'});
				}
			}).catch(err=>{
				console.log(err);
			})	
		}
	}
}
</script>

<style scoped lang='scss'>
.myEggContent{
	height: calc(100vh - 90rpx);
}
.content{
	padding: 20upx 0;
	background: #f5f5f5;
	margin-bottom: 30upx;
}
.hens_list{
	background: #FFFFFF;
	border: 1rpx solid #e5e5e5;
	border-radius: 8upx;
	padding: 10upx;
	margin-bottom: 10upx;
}
.hens_view{
	display: flex;
	justify-content: space-between;
	padding-bottom: 10upx;
}

.hens_money{
	display: flex;
}
.money:nth-child(2){
	color: #55aa00;
}
.money_text:nth-child(2){
	color: #ff0000;
}
.text_x{
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}
</style>
