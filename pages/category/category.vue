<template>
	<view class="tiaoliaoBox">
		<view class="left">
			<scroll-view  scroll-y="true" class="scroll-Y-left" >
				<view v-for="item in leftTitle" :key='item.selectValue'
				@click="changeleftActive(item.selectValue)"
				class="scroll-view-item-left" 
				:class="leftActive == item.selectValue?'active ymcode_ml':''">{{item.selectTxt}}</view>
			</scroll-view>
		</view>
		<view class="right">
			<scroll-view  scroll-y="true" class="scroll-Y-right" >
				<view class="left_itemBox">
					<view  class="left_item" v-for="(item,index) in rightData" :key='index'>
						<image :src="item.iconUrl"  @click="navaddressTo(item.spID)" class="goods_img"></image>
						
						<view class="goods_view">
							<view class="goods_spname">{{item.spName}}</view>
							
							<view class="goods_price">
								<view class="goods_text">
									<text>￥</text>
									<text>{{item.price}}</text>
								</view>
								<image src="/static/tab-cart-current.png" @click="addcar(item.spID)"></image>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				sizeCalcState: false,
				tabScrollTop: 0,
				currentId: 1,
				slist: [],
				userid: uni.getStorageSync('userid'),
				spflid:2,//分类
				currentid:'1',
				name:'',
				address:'',
				flid:0,
				pg:0,
				catList: [],
				catNum: 0,
				params: {},
				current: 0,
				show: true,
				leftActive:'0',
				leftTitle:[],
				rightData:[],
				value: 0,
			}
		},
		onLoad(options){

		},
		onShow() {
			this.spflid =1;
			if(uni.getStorageSync('gjfFl')){
				this.spflid = uni.getStorageSync('gjfFl');
				uni.removeStorageSync('gjfFl');
			}
			
			console.log('onLoad====='+this.spflid);
			this.leftActive = this.spflid;
			this.getDataFl();
			this.loadData(this.spflid);			
			this.set_tabBar();
		},
		
		methods: {
			navaddressTo(id){
				uni.navigateTo({
					url: '/pages/product/product?spid='+id
				});
			},
			changeleftActive(Id){
				this.spflid = Id;
				this.leftActive = this.spflid;
				this.loadData(this.spflid);	
			},
			loadData(id){
				console.log('loadData='+id);
				this.$http("shangPinListClient",
				JSON.stringify({
					token:uni.getStorageSync("token"),
					spName: '',
					spFlid: id,
					pg: this.pg,					
				}),).then(res=>{	
					if (res.data.code != 0) {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						});
					} else {
						this.slist=res.data.shangPinList.datas;
						this.rightData = res.data.shangPinList.datas;
						this.leftActive = this.spflid;
					}
				}).catch(err=>{
					console.log(err);
				}) 
				
			},
			getDataFl(){
				this.$http("selectItemList",
				JSON.stringify({
					token:uni.getStorageSync("token"),
					userid: '',	
					tag: 'sp_fl',	
				}),).then(res=>{
					this.leftTitle = res.data.itemList;
					this.leftActive = this.spflid
					//this.leftActive = curID?curID:res.data.para[0].spflid
				}).catch(err=>{
					console.log(err)
				})
			},
			
			//设置购物车数字角标
			set_tabBar(){
				if (uni.getStorageSync('cat_num')) {
					let value = uni.getStorageSync('cat_num')
					this.value=value;
					
					if(value>0){
						uni.setTabBarBadge({
							index: 2,
							text: String(value),
							complete(e) {
								console.log(e);
							}
						});
					}else{
						//清除数字角标
						uni.hideTabBarRedDot({
							index: 2
						});
					}	
				}else{
					this.value=0;
					//清除数字角标
					uni.hideTabBarRedDot({
						index: 2
					});
				}
			},
			
			addcar(id){
				this.$http("gwcAdd",
				JSON.stringify({
					spID: id,
					token: uni.getStorageSync('token'),
					num:1,
				}),).then(res=>{
					if(res.data.code == 0){
						this.value = this.value+1
						uni.setStorage({
							key: "cat_num",
							data: this.value
						})
						uni.setTabBarBadge({
						  index: 2,
						  text: String(this.value)
						})
					}else if(res.data.code == 99){
						uni.showModal({
						    content: "请先登录",
						    success: (e)=>{
						    	if(e.confirm){
									uni.clearStorage();				    		
						    		setTimeout(()=>{
						    			uni.redirectTo({
						    				url:"../public/login"
						    			})
						    		}, 200)
						    	}
						    }
						});
					}else{
						uni.showToast({
							title:res.data.msg,
							icon:"none"
						})
					}
				}).catch(err=>{
					console.log(err);
				})	
			}
		}
	}
</script>

<style scoped lang='scss'>
.content {
	padding: 0 30rpx;
}
.tiaoliaoBox{
	display: flex;
	color: #666;
	.left{
		width: 180upx;
		height: 100vh;
		text-align: center;
		background-color: #F8F6FC;
		.scroll-Y-left{
			height: 100vh;
			.scroll-view-item-left{
				height: 88upx;
				line-height: 88upx;
				font-size: 32upx;
			}
			.active{
				color: #ffffff;
			}
		}
		
	}
	
	.right{
		flex: 1;
		background-color: #fff;
		width: 70%;
		.scroll-Y-right{
			padding: 10upx;
			height: 100vh;
			.left_itemBox{
				display: flex;
				flex-wrap: wrap;
				justify-content: space-between;
				
				.left_item{
					width: 48%;
					background-color: #fff;
					border-radius: 10upx;
					margin-bottom: 20upx;
					border: 1upx solid #c4c4c4;
					
					.goods_img {
						width: 100%;
						height: 228upx;
					}
					.goods_view{
						padding: 0 10upx 10upx;
						
						.goods_spname{
							padding-bottom: 10upx;
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
							font-size: 28rpx;
						}
						.goods_price {
							color: #E51515;
							display: flex;
							justify-content: space-between;
							align-items: center;
							
							.goods_text{
								width: 160rpx;
								font-size: 28rpx;
							}
						
							.price {
								font-weight: bold;
								font-size: 20px;
							}
							
							image{
								display: block;
								float: right;
								width: 40rpx;
								height: 40rpx;
								margin-right: 20rpx;
							}
						}
					}
				}
			}
		}
	}
}
</style>
