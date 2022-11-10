<template>
	<view class="content b-t">
		<view class="list b-b" v-for="(item, index) in addressList" :key="index" @click="checkAddress(item.aid)">
			<view class="wrapper">
				<view class="address-box">
					<text v-if="item.is_default" class="tag">默认</text>
					<text class="address">{{item.sheng+item.shi+item.qu+item.xxdz}}</text>
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
	// import BASE_URL from '../../utils/api.js'
	export default {
		data() {
			return {
				source: 0,
				userid:uni.getStorageSync("userid"),
				addressList: [],
					
				
			}
		},
		onLoad(option){
			console.log(option.source);
			this.source = option.source;
			this.addressshow();
		},
		methods: {
			//选择地址
			checkAddress(item){
				if(this.source==1){
					uni.redirectTo({
						url: `/pages/order/createOrder2?aid=${item}`
					})
				}else{
					
					this.$http("addressSetDefault",JSON.stringify({
							aid:item,
							userid: this.userid,
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
						userid: this.userid
					})).then(res=>{
						if(res.data.status==0){
						 this.$api.msg(res.data.msg);
						 this.addressshow();
						}else{
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
						userid: this.userid,
					})).then(res=>{
						if(res.data.code==0){
							this.addressList=res.data.para;
							for (let i = 0; i < this.addressList.length; i++) {
							     if(this.addressList[i].is_default==1){
									 this.addressList[i].is_default=true;
								 }else{
									 this.addressList[i].is_default=false;
								 }
							}
							console.log(this.addressList);
							
						}else{
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
