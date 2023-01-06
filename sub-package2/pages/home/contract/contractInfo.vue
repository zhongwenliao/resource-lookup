<template>
	<page style="width: 100%;" class="page">
		<u-navbar :is-fixed="false" class="navbar" title="我的合同" title-color="#fff" back-icon-color="#fff"
			:background="{backgroundImage: ''}" :border-bottom="false">
		</u-navbar>
		<view class="u-m-20 u-m-t-70 u-p-b-50">
			<view class="card card-img">
				<view class="image">
					<u-image width="110upx" height="110upx" :fade="false" src="http://yuanzhoulvwego.com/wp-content/uploads/static/home/contract/hetong1.png">
						<u-loading slot="loading"></u-loading>
					</u-image>
				</view>
				<view class="connector1"></view>
				<view class="connector2"></view>
				<view class="head">
					<view class="head-left">
						合同信息
					</view>
					<view class="head-right">
						
					</view>
				</view>
				<view class="body">
					<view class="body-text body-but-box">
						<view class="u-m-b-10 u-flex u-row-between">
							<view class="">
								合同状态
							</view>
							<view class="" :style="{color: contractInfo.contractStatus!= undefined?contractStatus[contractInfo.contractStatus].color:''}">
								{{contractInfo.contractStatus!= undefined?contractStatus[contractInfo.contractStatus].label:''}}
							</view>
						</view>
						<view class="u-m-b-10 u-flex u-row-between">
							<view class="">
								合同编号
							</view>
							<view class="">
								{{contractInfo.contractCode}}
							</view>
						</view>
						<!-- <view class="u-m-b-10 u-flex u-row-between">
							<view class="">
								租用面积
							</view>
							<view class="">
								{{ contractInfo.area }}/m2
							</view>
						</view> -->
						<view class="u-m-b-10 u-flex u-row-between">
							<view class="">
								合同年限
							</view>
							<view class="">
								{{ contractInfo.contractExpiry }}年
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="card card-bg">
				<view class="connector1"></view>
				<view class="connector2"></view>
				<view class="head">
					<view class="head-left">
						我的信息
					</view>
					<view class="head-right">
						<u-icon @click="goCustomerInfo" name="arrow-right" label-pos="left" label-size="28" label-color="#333333"
							label="更多" color="#666666" size="26"></u-icon>
					</view>
				</view>
				<view class="body">
					<view class="body-text body-but-box">
						<view class="u-m-b-10 u-flex u-row-between">
							<view class="">
								公司名称
							</view>
							<view class="">
								{{ contractInfo.enterpriseInfo.companyName }}
							</view>
						</view>
						<view class="u-m-b-10 u-flex u-row-between">
							<view class="">
								所属行业
							</view>
							<view class="">
								{{industryList[contractInfo.enterpriseInfo.industryId-1] ? industryList[contractInfo.enterpriseInfo.industryId-1].name:''}}
							</view>
						</view>
						<view class="u-m-b-10 u-flex u-row-between">
							<view class="">
								企业法人
							</view>
							<view class="">
								{{ contractInfo.enterpriseInfo.legalPerson || '--'}}
							</view>
						</view>
						<view class="u-m-b-10 u-flex u-row-between">
							<view class="">
								联系方式
							</view>
							<view class="">
								{{ contractInfo.enterpriseInfo.contactPhone || '--'}}
							</view>
						</view>
						<view class="u-m-b-10 u-flex u-row-between">
							<view class="">
								{{contractInfo.enterpriseInfo.leaseType==0?'企业信用代码':'身份证号码'}} 
							</view>
							<view class="">
								{{ contractInfo.enterpriseInfo.enterpriseCreditCode || '--'}}
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="card card-bg">
				<view class="head">
					<view class="head-left">
						租金信息
					</view>
					<view class="head-right">
						<u-icon @click="goCustomerInfo2" name="arrow-right" label-pos="left" label-size="28" label-color="#333333"
							label="更多" color="#666666" size="26"></u-icon>
					</view>
				</view>
				<view class="body">
					<view class="body-text body-but-box">
						<view class="u-m-b-10 u-flex u-row-between">
							<view class="">
								月租金
							</view>
							<view class="">
								{{ contractInfo.incrementalRent.length?contractInfo.incrementalRent[0].rentMonth:0 }}元
							</view>
						</view>
						<view class="u-m-b-10 u-flex u-row-between">
							<view class="">
								月管理费
							</view>
							<view class="">
								{{ contractInfo.propertyCosts }}元
							</view>
						</view>
						<view class="u-m-b-10 u-flex u-row-between">
							<view class="">
								押金
							</view>
							<view class="">
								{{ contractInfo.deposit }}元
							</view>
						</view>
						<view class="u-m-b-10 u-flex u-row-between">
							<view class="">
								签约时间
							</view>
							<view class="">
								{{contractInfo.contractDate}}
							</view>
						</view>
						<view class="u-m-b-10 u-flex u-row-between">
							<view class="">
								到期时间
							</view>
							<view class="">
								{{contractInfo.expiryDate}}
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</page>
</template>

<script>
	export default {
		data() {
			return {
				contractStatus: [],
				contractInfo: {
					status:true,
					incrementalRent:[{
						rentMonth:''
					}],
					enterpriseInfo:{
						industryId:1
					}
				},
				industryList:[],
			};
		},
		onLoad() {
			this.contractStatus = this.$enum.contractStatus
			console.log(this.contractStatus);
			this.$enum.industryEnum((value) => {
				this.industryList = value
				this.getInfo()
			})
		},
		methods:{
			getInfo() {
				this.$api('contract.contractInfo', {
					id: this.$Route.query.id
				}).then(res => {
					if (res.code == 200) {
						this.contractInfo = res.data
					} else {
						uni.showToast({
							title: res.msg || '请求出错,稍后重试',
							icon: 'none',
							duration: 500,
							mask: true
						});
					}
				})
			},
			goCustomerInfo() {
				this.$Router.push({
					path: '/sub-package2/pages/home/contract/customerInfo',
					query:this.contractInfo
				});
			},
			goCustomerInfo2() {
				this.$Router.push({
					path: '/sub-package2/pages/home/contract/customerInfo2',
					query:this.contractInfo
				});
			}
		}
	}
</script>
<style>
	page {
		/* background: red; */
		background-image: url('http://yuanzhoulvwego.com/wp-content/uploads/static/home/contract/beijn.png');
		overflow:auto !important;
	}
</style>
<style scoped lang="scss">
	.connector1 {
		background: url('http://yuanzhoulvwego.com/wp-content/uploads/static/home/billPay/lianjiexian.png') no-repeat;
		background-size: 100% 100%;
		z-index: 100;
		position: absolute;
		left: 150upx;
		bottom: -50upx;
		width: 20upx;
		height: 80upx;
	}

	.connector2 {
		background: url('http://yuanzhoulvwego.com/wp-content/uploads/static/home/billPay/lianjiexian.png') no-repeat;
		background-size: 100% 100%;
		z-index: 100;
		position: absolute;
		right: 150upx;
		bottom: -50upx;
		width: 20upx;
		height: 80upx;
	}

	.page {
		width: 100%;
		height: 100%;
		overflow:auto !important;
		background-size: 100% 100%;
		background-repeat: no-repeat;
	}

	.card-img {
		// background-image: url('http://yuanzhoulvwego.com/wp-content/uploads/static/home/contract/di.png');
		background-color: #FFFFFF;
		background-size: 100% 100%;
		background-repeat: no-repeat;
	}

	.card-bg {
		background: #FFFFFF;
	}

	.card {
		position: relative;
		border-radius: 15upx;
		box-shadow: 0px 3upx 10upx 0px rgba(221, 221, 221, 0.3);
		margin-bottom: 24upx;

		.image {
			position: absolute;
			top: -58rpx;
			left: 50%;
			transform: translateX(-50%);
			background: #667BF7;
			border-radius: 50%;
			width: 130upx;
			height: 130upx;
			.u-image {
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
			}
		}

		.head {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30upx 10upx;
			// border-bottom: 1px solid #F1F2F3;
			font-size: 34upx;

			.head-left {
				display: flex;
				align-items: center;
				font-weight: bold;
			}
		}

		.body {
			padding: 0upx 20upx 30upx 20upx;
		}
	}
</style>
