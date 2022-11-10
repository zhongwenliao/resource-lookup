<template>
	<view class="content b-t">
		<view class="list b-b" v-for="(item, index) in addressList" :key="index" >
			<view class="wrapper" @click="checkAddress(item.aid)">
				<view class="address-box">
					<text v-if="item.isDefault" class="tag">默认</text>
					<view class="address">{{item.sheng+item.shi+item.qu+item.xxdz}}</view>
				</view>
				<view class="u-box">
					<text class="name">{{item.sjr}}</text>
					<text class="mobile">{{item.sjrdh}}</text>
				</view>
			</view>
			<text class="yticon icon-bianji" @click.stop="editAddress('edit', item.aid)"></text>
			<text class="yticon icon-iconfontshanchu1"style="margin-left: 20rpx;" @click="deleteAddress('del', item.aid)"></text>
		</view>
		
		<button class="add-btn ymcode_ml" @click="addAddress('add')">新增地址</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				source: 0,
				addressList: []
			}
		},
		onLoad(option){
			this.source = option.source;
		},
		onShow(){
			console.log('op1111tion', this.source);
			this.addressshow();
		},
		methods: {
			//选择地址
			checkAddress(item){
				if(this.source==1){
					let pages = getCurrentPages();  //获取所有页面栈实例列表
					let prevPage = pages[ pages.length - 2 ];  //上一页页面实例
					console.log(prevPage);
					prevPage.$vm.aid = item;   //修改上一页data里面的searchVal参数值为1211
					console.log(prevPage.$vm);
					uni.navigateBack({  //uni.navigateTo跳转的返回，默认1为返回上一级
						delta: 1
					})
				} else if(this.source==2){
					let pages = getCurrentPages();  //获取所有页面栈实例列表
					let prevPage = pages[ pages.length - 2 ];  //上一页页面实例
					prevPage.$vm.aid = item;   //修改上一页data里面的searchVal参数值为1211
					uni.navigateBack({  //uni.navigateTo跳转的返回，默认1为返回上一级
						delta: 1
					})
				} else{
					this.$http("addressSetDefault",JSON.stringify({
						aid:item,
						token:uni.getStorageSync("token")
					})).then(res=>{
						if(res.data.code==0){
						 this.addressshow();
						}
						else if(res.data.code == 99){
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
						}
						else{
							this.$api.msg(res.data.msg);
						}
					}).catch(err=>{
						console.log(err);
					})
				}
			},
			//刷新数据事件
			refreshRequest() {
				this.addressshow()
			},
			addAddress(type, item){
				uni.navigateTo({
					url: '/pages/address/addressManage?source='+this.source
				})
			},
			editAddress(type, item){				
				uni.navigateTo({
					url: `/pages/address/addressedit?aid=${item}`+'&source='+this.source
				})
			},
			deleteAddress(type,item){
				var that=this;
				uni.showModal({
				    title: '提示',
				    content: '确定删除吗?',
				    success: function (res) {
				        if (res.confirm) {
				            that.deladdresssubmit(item);
				        } else if (res.cancel) {
				            console.log('用户点击取消');
				        }
				    }
				});
			},
			deladdresssubmit(item){
				this.$http("addressDel",JSON.stringify({
						aid:item,
						token:uni.getStorageSync("token")	
					})).then(res=>{
						if(res.data.code==0){
						 this.$api.msg(res.data.msg);
						 this.addressshow();
						}
						else if(res.data.code == 99){
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
						}
						else{
							this.$api.msg(res.data.msg);
						}
					}).catch(err=>{
						console.log(err);
					})
			},
			//添加或修改成功之后回调
			refreshList(data, type){
				//添加或修改后事件，这里直接在最前面添加了一条数据，实际应用中直接刷新地址列表即可
				this.addressList.unshift(data);
				
				console.log(data, type);
			},
			addressshow(){	
				this.$http("addressList",JSON.stringify({
					token:uni.getStorageSync("token")
				})).then(res=>{
					console.log('addressshow='+res);
					if(res.data.code==0){
						this.addressList=res.data.addressList;
						for (let i = 0; i < this.addressList.length; i++) {
							 if(this.addressList[i].isDefault==1){
								 this.addressList[i].isDefault=true;
							 }else{
								 this.addressList[i].isDefault=false;
							 }
						}
						
					}
					else if(res.data.code == 99){
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
					}
					else{
						this.$api.msg(res.data.msg);
					}
				}).catch(err=>{
					console.log(err);
				})
			}
		}
	}
</script>

<style lang='scss'>
	page{
		padding-bottom: 120upx;
	}
	.content{
		position: relative;
	}
	.list{
		display: flex;
		align-items: center;
		padding: 20upx 30upx;;
		background: #fff;
		position: relative;
	}
	.wrapper{
		display: flex;
		flex-direction: column;
		flex: 1;
		width: 80%;
	}
	.address-box{
		display: flex;
		align-items: center;
		.tag{
			font-size: 24upx;
			color: $base-color;
			margin-right: 10upx;
			background: #fffafb;
			border: 1px solid #ffb4c7;
			border-radius: 4upx;
			padding: 4upx 10upx;
			line-height: 1;
			width: 75rpx;
		}
		.address{
			font-size: 30upx;
			color: $font-color-dark;
			
		}
	}
	.u-box{
		font-size: 28upx;
		color: $font-color-light;
		margin-top: 16upx;
		.name{
			margin-right: 30upx;
		}
	}
	.icon-bianji{
		display: flex;
		align-items: center;
		height: 80upx;
		font-size: 40upx;
		color: $font-color-light;
		padding-left: 30upx;
	}
	
	.add-btn{
		position: fixed;
		left: 30upx;
		right: 30upx;
		bottom: 16upx;
		z-index: 95;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 690upx;
		height: 80upx;
		font-size: 32upx;
		color: #fff;
		border-radius: 10upx;
	}
</style>
