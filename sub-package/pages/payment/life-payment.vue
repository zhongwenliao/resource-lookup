<template>
	<view class="life-payment">
		<view class="pay-address">
			<image class="payBg" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/paybg.jpg" mode=""></image>
			<!-- <view class="arrdBox">
				<image class="addrImg" src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/address.png" mode=""></image>
				<text>{{addressName}}</text>
			</view> -->
		</view>
		<view class="payment-tab">
			<view style="display: inline-block;margin-left: 16%;" @click="tabSwitch(0)">
				<text :class="0 == currentIndex? 'tabactive' : 'taberr'" style="border-radius: 8upx 0 0 8upx">应缴费用</text>
			</view>
			<view style="display: inline-block;" @click="tabSwitch(1)">
				<text :class="1 == currentIndex? 'tabactive' : 'taberr'" style="border-radius: 0 8upx 8upx 0">缴费记录</text>
			</view>
		</view>
		<!-- 应缴费用列表 -->
		<view class="payment-list" v-show="payment">
			<view class="uni-list">
				<checkbox-group @change="checkboxChange">
					<label class="uni-list-cell uni-list-cell-pd" v-for="(item,index) in payableList" :key="index">
						<view>
							<checkbox color="#088B68" :value="item.orderId" :checked="item.checked"/>
						</view>
						<view class="payment-mess clear" @click.stop="paymentDetail(item.id)">
							<view class="month fl">
								<text class="num">{{item.billDate}}</text>
								<text>月</text>
							</view>
							<view class="time fl" v-if="item.billDate !== '2'">
								{{item.billDate}}/01-{{item.billDate}}/30
							</view>
							<view class="time fl" v-else>
								{{item.billDate}}/01-{{item.billDate}}/28
							</view>
							<view class="money fr">
								<text class="add">合计：</text>
								<text class="total">{{item.fee}}元</text>
							</view>
						</view>
					</label>
				</checkbox-group>
			</view>
			<view class="" v-if="payableList.length == 0" style="text-align: center;padding-top: 50%;">
				暂无数据
			</view>
		</view>
		<!-- 缴费记录列表 -->
		<view class="record-list" v-show="record">
			<view class="item clear" @click="billDetails(item.id)" v-for="(item,index) in recordList" :key="index">
				<view class="month fl" style="margin-top: 35upx;margin-left: 40upx;">
					<text class="num" style="margin-left: 0;">{{item.billDate}}</text>
					<text>月</text>
				</view>
				<view class="type fl">
					<view class="mon">
						-{{item.fee}}
					</view>
					<view class="name">
						{{item.itemName}}
					</view>
				</view>
				<view class="record-status fr" v-if="item.status==0">未缴</view>
				<view class="record-status fr" v-if="item.status==1">已缴</view>
				<view class="record-status fr" v-if="item.status==2">作废</view>
			</view>
			<view class="" v-if="recordList.length == 0" style="text-align: center;padding-top: 50%;">
				暂无数据
			</view>
		</view>
		<view class="pay-bottom" v-show="bottom">
			<checkbox color="#088B68" @click="allCheckboxChange" value="cb" :checked="allChecked" style="margin-left: 20upx;" />全选
			<view class="all">
				合计：<text>￥{{allCount}}元</text> 
			</view>
			<button @click="account">立即结算</button>
		</view>
		<view class="pay-mark" v-show="payShow">
			<view class="pay-con">
				<view class="title">
					支付方式
				</view>
				<view class="pay-item clear">
					<view class="fl" v-for="(item,index) in supportPayList" :key="index">
						<view class="" v-if="item == 1" @click="selectPay(item)">
							<view class="img-box">
								<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/wxzf.png" mode=""></image>
							</view>
							<text>微信支付</text>
						</view>
						<!-- <view class="" v-if="item == 2" @click="selectPay(item)">
							<view class="img-box">
								<image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/img/zfbzf.png" mode=""></image>
							</view>
							<text>支付宝支付</text>
						</view> -->
					</view>
				</view>
				<view style="text-align: center;padding-top: 40upx;" v-if="supportPayList.length == 0">
					暂不支持任何支付！
				</view>
				<view class="cancel" @click="cancel">
					取消
				</view>
			</view>
		</view>
	</view>
</template>
<script>
export default {
	data() {
		return {
			currentIndex: 0,
			payShow: false,
			payment: true,
			record: false,
			bottom: true,
			payableList: [],
			recordList: [],
			address: "",
			newAddress: [],
			// addressName: "",
			allChecked: false,
			allCount: 0,
			newAllCount:null,
			supportPayList: [], //支付类型列表
			selectSupportPay: null, //选择的支付对象
			orderIds: "",
			orderIdsArray: []
		};
	},
	methods: {
		// tab切换
		tabSwitch(index) {
			this.currentIndex = index;
			if (this.currentIndex === 0) {
				this.payment = true;
				this.record = false;
				this.bottom = true;
			} else if (this.currentIndex === 1) {
				this.payment = false;
				this.record = true;
				this.bottom = false;
				this.getRecordList()
			}
		},
		// 应缴费用列表
		getPayableList(){
			this.$req.request({
				url: "/wyLivingPaymentBill/app/list",
				method: "POST",
				data: {
					communityId: this.$getUserInfo().currentCommunity.id,
				},
				isShowLoading: false,
				success: res => {
					if(res.code == 0){
						this.payableList = res.data.list;
						// 月份
						this.payableList.forEach(item=> {
							item.billDate = item.billDate.replace(" ", ":").replace(/\:/g, "-").split("-")[1];
							if(item.billDate.includes('0')){
								item.billDate = item.billDate.replace(/\b(0)/gi, "")
							}
						})
						let address = this.payableList.map(item=> {
							return item.communityName+item.buildingName+item.roomName
						})
						// 账单金额
						let fee = this.payableList.map(item=> {
							return item.fee
						})
						// 合计金额
						this.newAllCount = fee.reduce(function(a,b){
							return parseFloat(a) + parseFloat(b);
						},0);
					}
				}
			});
		},
		// 缴费记录列表
		getRecordList(){
			this.$req.request({
				url: "/wyLivingPaymentBill/app/HistoricalList",
				method: "POST",
				data: {
					communityId: this.$getUserInfo().currentCommunity.id,
				},
				isShowLoading: false,
				success: res => {
					if(res.code == 0){
						this.recordList = res.data.list;
						this.recordList.forEach(item=> {
							item.billDate = item.billDate.replace(" ", ":").replace(/\:/g, "-").split("-")[1];
							if(item.billDate.includes('0')){
								item.billDate = item.billDate.replace(/\b(0)/gi, "")
							}
						})
					}
				}
			});
		},
		checkboxChange(e) {
			let payableList = this.payableList,
				values = e.detail.value;   
			//拿到选中的orderId
			this.orderIds = values.join(",");
			
			for (let i = 0, len = payableList.length; i < len; ++i) {
				const item = payableList[i];
				this.$set(item,'checked', values.includes(item.orderId))
			}
			this.allChecked = payableList.every(item => item.checked);
				
			// 过滤拿到选中的列表中的每一项，这样就可以拿到选中的费用
			let filterItem = payableList.filter(item=> {
				if(values.indexOf(item.orderId) != -1){
					return item
				}
			})
			// 选中的费用相加
			let allCount = filterItem.map(item =>{
				return item.fee
			})
			this.allCount = allCount.reduce(function(a,b){
				return parseFloat(a) + parseFloat(b);
			},0);
		},
		billDetails(id){
			uni.navigateTo({
				url: "pay-bill-detail?id=" + id
			})
		},
		paymentDetail(id){
			uni.navigateTo({
				url: "billing-detail?id=" + id
			})
		},
		account(){
			this.payShow = true;
		},
		cancel(){
			this.payShow = false
		},
		// 获取支持的支付
		getSupportPay(){
			this.$req.request({
				url: "/payConfig/app/getSupportPay",
				method: "GET",
				data: {
					communityId: this.$getUserInfo().currentCommunity.id,
				},
				isShowLoading: false,
				success: res => {
					if(res.data.code == 0){
						uni.setStorageSync('getSupportPay', res.data.data);
						//将支持的类型遍历出来
						this.supportPayList = res.data.data.map(item => {
							return item.supportPay;
						});
					}
				}
			});
		},
		allCheckboxChange(){
			this.allChecked = !this.allChecked;
			this.payableList.map(item => {
				this.$set(item, 'checked', this.allChecked);
			})
			if(this.allChecked === true){
				this.allCount = this.newAllCount;
				let orderId = this.payableList.map(item =>{
					return item.orderId
				});
				this.orderIds = orderId.join(",")
			}else{
				this.allCount = 0;
			}
		},
		//选择支付方式
		selectPay(supportPay) {
		    this.selectSupportPay = supportPay;
		    this.payByOrderId(this.selectSupportPay);
		},
		
		// 微信小程序支付
		// #ifdef MP-WEIXIN
		payByOrderId(payType){
			var currentCommunity = this.$getUserInfo().currentCommunity;
			if (currentCommunity !== undefined) {
				var communityId = currentCommunity.id;
				this.$req.request({
					url: "/wyLivingPaymentBill/app/payByOrderIds",
					method: "POST",
					data: {
						communityId: communityId,
						orderIds: this.orderIds,
						payPlat: 1,
						payScene: 6,
						payMode: 4,
						payType: payType,
						openId: uni.getStorageSync("userInfo").wxMiniOpenId,
					},
					isShowLoading: false,
					success: res => {
						if(res.code == 0){
							this.payParam = res.data.payParam;
							wx.requestPayment({
							  timeStamp: this.payParam.timeStamp,
							  nonceStr: this.payParam.nonceStr,
							  package: this.payParam.package,
							  signType: this.payParam.signType,
							  paySign: this.payParam.paySign,
							  success:function(res) { 
								   setTimeout(()=>{
									   wx.reLaunch({
											url: "/sub-package/pages/payment/paySuccess"
										})
								   },100)
							  },
							  fail : res => { 
								  
							  }
							})
						}
					}
				});
			}
		}
		// #endif
	},
	onLoad() {
		this.getPayableList();
		this.getSupportPay();
	},
	// 下拉刷新
	onPullDownRefresh() {
		this.getPayableList();
		setTimeout(() => {
			uni.stopPullDownRefresh();
		}, 1000);
	}
};
</script>

<style lang="scss" scoped>
	.life-payment{
		width: 100%;
		background: rgb(249,249,249);
	}
	.pay-address{
		height: 200upx;
		position: relative;
	}
	.arrdBox{
		position: absolute;
		top: 70upx;
		left: 40upx;
	}
	.pay-address text{
		color: #fff;
		font-size: 35upx;
		display: inline-block;
		width: 90%;
		line-height: 40upx;
	}
	.pay-address .payBg{
		display: block;
		width: 100%;
		height: 100%;
	}
	.pay-address .addrImg{
		display: inline-block;
		width: 40upx;
		height: 50upx;
		margin-right: 20upx;
		vertical-align: super;
	}
	.payment-tab {
		width: 100%;
		background: #fff;
	}
	.taberr {
		display: block;
		width: 260upx;
		line-height: 90upx;
		text-align: center;
		color: #000;
		font-size: 32upx;
		border-radius: 0 !important;
	}
	.tabactive {
		display: block;
		width: 260upx;
		height: 90upx;
		line-height: 90upx;
		text-align: center;
		color: #088B68;
		border-bottom: 5upx solid #088B68;
		font-size: 32upx;
		border-radius: 0 !important;
	}
	uni-checkbox:not([disabled]) .uni-checkbox-input:hover{
		border-color: #088B68;
	}
	.payment-list{
		margin-top: 20upx;
	}
	.month{
		width: 85upx;
		height: 85upx;
		background: #088B68;
		border-radius: 50%;
		opacity: 0.7;
		text-align: center;
		line-height: 85upx;
		margin-left: 20upx;
	}
	.month text{
		color: #fff;
		font-size: 30upx;
	}
	.month .num{
		font-size: 40upx;
		font-weight: bold;
	}
	.payment-mess{
		width: 90%;
	}
	.payment-mess .time{
		margin-left: 30upx;
		line-height: 85upx;
	}
	.payment-mess .money{
		line-height: 85upx;
	}
	.money .total{
		color: #088B68;
	}
	.uni-list-cell {
		justify-content: flex-start;
	}
	.uni-list::before,.uni-list::after{
		height: 0 !important;
	}
	.uni-list-cell::after{
		left: 0 !important;
	}
	.pay-bottom{
		width: 100%;
		height: 100upx;
		position: fixed;
		left: 0;
		bottom: 0;
		background: #fff;
	}
	.pay-bottom .all{
		display: inline-block;
		margin-left: 20upx;
		margin-top: 24upx;
	}
	.all text{
		color: #088B68;
	}
	.pay-bottom button{
		width: 250upx;
		height: 100upx;
		line-height: 100upx;
		background: linear-gradient(118deg, #01dca3 0%, #088b68 100%);
		box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
		color: #ffffff;
		position: absolute;
		right: 0;
		bottom: 0;
		border-radius: 0;
	}
	.pay-mark{
		width: 100%;
		height: 100%;
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
		background: rgba(0,0,0,.3);
		transition: all 2s;
		z-index: 999;
	}
	.pay-con{
		width: 100%;
		background: #fff;
		position: fixed;
		left: 0;
		bottom: 0;
		border-radius: 20upx 20upx 0 0;
	}
	.pay-con .title{
		color: #000;
		padding: 30upx 0;
		font-size: 38upx;
		text-align: center;
		border-bottom: 1px solid #eee;
	}
	.pay-item .fl{
		text-align: center;
		margin-left: 40upx;
	}
	.pay-item .img-box{
		border-radius: 10upx;
		padding: 20upx;
		margin-top: 30upx;
		// margin-bottom: 10upx;
	}
	.pay-item .fl text{
		color: #aaa;
		font-size: 24upx;
	}
	.pay-item image{
		width: 80upx;
		height: 80upx;
		display: block;
	}
	.pay-con .cancel{
		width: 90%;
		color: #fff;
		font-size: 30upx;
		text-align: center;
		padding: 16upx 0;
		border-top: 1px solid #ddd;
		margin-top: 10upx;
		background: #00af81;
		border-radius: 10upx;
		margin: auto;
		margin-bottom: 40upx;
		margin-top: 40upx;
	}
	.record-list .item{
		background: #fff;
		margin-top: 20upx;
	}
	.record-list .item .date{
		width: 25%;
		text-align: center;
		font-size: 35upx;
		margin-top: 50upx;
	}
	.record-list .item .type{
		width: 40%;
		margin-left: 30px;
	}
	.record-list .item .type .mon{
		font-size: 40upx;
		margin-top: 20upx;
	}
	.record-list .item .type .name{
		margin-bottom: 20upx;
	}
	.record-list .item .record-status{
		width: 15%;
		font-size: 30upx;
		color: #088B68;
		margin-top: 64upx;
	}
</style>