<template>
	<view>
		<view class="tiaoliaoBox">
			<view class="left">
				<scroll-view  scroll-y="true" class="scroll-Y-left" >
					<view 
					v-for="item in leftTitle" :key='item.spflid'
					@click="changeleftActive(item.spflid)"
					class="scroll-view-item-left" 
					:class="leftActive == item.spflid?'active':''">{{item.spflmc}}</view>
				</scroll-view>
			</view>
			<view class="right">
				<scroll-view  scroll-y="true" class="scroll-Y-right" >
					<view class="left_itemBox">
						<view  class="left_item" v-for="(item,index) in rightData" :key='index'>
							<navigator :url="`../goodsDetail/goodsDetail?goodsid=${item.spid}`">
								<view class="">
									{{item.spmc}}
								</view>
								<image :src="item.icon_url" mode="widthFix" style="width: 100%;"></image>
								<view class="price" style="text-align: center;">
									￥{{(item.price_ls/100).toFixed(2)}}
								</view>
							</navigator>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>
			<!-- <mybar :barname='barname' /> -->
	</view>
</template>

<script>
	import mybar from '../../components/myBar/myBar.vue'
	export default {
		components:{
			mybar
		},
		data() {
			return {
				barname:'首页',
				leftActive:'0',
				leftTitle:[],
				rightData:[],
				userid:uni.getStorageSync('userid'),
				groupid:0,
				spflid:0
			}
		},
		
		onReady() {
			// this.getData();
			uni.setNavigationBarTitle({
				title:'做菜(买菜·溯源)'
			})
		},
		
		onLoad(options) {		
			//console.log('options',options.id)
			if(options.groupid&&options.id){
				this.groupid = options.groupid
				this.spflid = options.id
				
				this.getData()
				this.reqRightData()
			}else if(options.id){
				this.spflid = options.id
				this.get_groupid()
								
			}
			
			
		},
		
		methods: {
			changeleftActive(Id){
				this.spflid = Id;
				this.reqRightData()
			},
			getData(){
				this.$myReuqest({
					url:'/spflList',
					method:'post',
					data:{
						groupid:this.groupid,
						userid:this.userid,
						openid:''
					}
				}).then(res=>{
					this.leftTitle = res.data.para;
					this.leftActive = this.spflid
					//this.leftActive = curID?curID:res.data.para[0].spflid
				}).catch(err=>{
					console.log(err)
				})
			},
			reqRightData(){
				this.$myReuqest({
					url:'/spList',
					method:'post',
					data:{
						groupid:this.groupid,
						spflid:this.spflid,
						pg:'0',
						userid:this.userid
					}
				}).then(res=>{
					this.rightData = res.data.para.sps
					this.leftActive = this.spflid
				}).catch(err=>{
					console.log(err)
				})
			},
			
			get_groupid(){
				this.$myReuqest({
					url:'/spflGetByFlid',
					method:'post',
					data:{
						spflid:this.spflid,
						userid:this.userid
					}
				}).then(res=>{
					//console.log(res.data)
					this.groupid = res.data.para.groupid;
					
					this.getData()
					this.reqRightData()
				}).catch(err=>{
					console.log(err)
				})
			},
		},
		
	}
</script>

<style lang="scss" scoped>
	.tiaoliaoBox{
		display: flex;
		height: calc(100vh - 50px);
		// background-color: red;
		color: #666;
		.left{
			width: 90px;
			height: calc(100vh - 50px);
			text-align: center;
			background-color: #F8F6FC;
			.scroll-Y-left{
				height: calc(100vh - 50px);
				.scroll-view-item-left{
					height: 88upx;
					line-height: 88upx;
				}
				.active{
					color: #fff;
					background-color: #fa436a;
					// border-left: 5px solid orange;
				}
			}
			
		}
		.right{
			flex: 1;
			background-color: #fff;
			.scroll-Y-right{
				padding: 20upx;
				// height: 100vh;
				height: calc(100vh - 50px);
				.left_itemBox{
					display: flex;
					flex-wrap: wrap;
					justify-content: space-between;
					.left_item{
						padding: 10upx;
						width: 48%;
						background-color: #fff;
						border-radius: 10upx;
						margin-bottom: 20upx;
						image{
							width: 100%;
							border-radius: 10px;
							margin-top: 8upx;
						}
					}
				}
			}
		}
	}
</style>
