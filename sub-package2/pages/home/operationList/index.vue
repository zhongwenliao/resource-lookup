<template>
	<page>
		<z-paging ref="paging" >
			<view class="grid u-m-t-30">
				<u-grid class="grid-box" :col="5" :border="false">
					<u-grid-item v-if="$permission([item.permission]) || !item.permission "  @click="goPage(item)"
						v-for="(item,index) of gridList" :key="index">
						<u-badge :count="item.count" :offset="[20, 30]"></u-badge>
						<view style="height:60upx;display: flex;align-items: center;" class="">
							<u-icon :width="item.width" :height="item.height" :name="item.imgUrl"></u-icon>
						</view>
						<view class="grid-text">{{item.title}}</view>
					</u-grid-item>
					</u-grid>
				</view>
		</z-paging>
	</page>
</template>

<script>
	export default {
		data() {
			return {
				// {
				// 	id: 2,
				// 	title: "停车付费",
				// 	imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/tingche fufei.png",
				// 	width: 68,
				// 	height: 60,
				// 	permission: 'aa',
				// 	url: "/sub-package2/pages/home/zoneInfo/index",
				// 	count: 0
				// },
				gridList: [{
					id: 1,
					title: "招商信息",
					imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/zhaoshang.png",
					width: 68,
					height: 64,
					permission: '', //investmentInfo:selectInvestmentInfo
					url: "/sub-package2/pages/home/merchants/index",
					count: 0
				},
				{
					id: 14,
					title: "停车缴费",
					imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/home/payParking/tingchefufei.png",
					url: "/sub-package2/pages/home/payParking/index",
					permission: 'itemManagement:selectItemManagement',
					width: 64,
					height: 66,
					count: 0
				},
				{
					id: 3,
					title: "我的合同",
					imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/hetong.png",
					width: 66,
					height: 65,
					permission: 'contractManagement:selectContractManagement',
					url: "/sub-package2/pages/home/contract/index",
					count: 0
				}, {
					id: 4,
					title: "账单缴费",
					imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/zhandan.png",
					width: 58,
					height: 66,
					permission: 'billPay:selectBillPay',
					url: "/sub-package2/pages/home/billPay/index",
					count: 0
				}, {
					id: 5,
					title: "人员登记",
					imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/yuangongguanli.png",
					width: 58,
					height: 65,
					permission: 'employeeManagement:selectEmployee',
					url: "/sub-package2/pages/home/employeeManagement/index",
					count: 0
				},
				{
					id: 6,
					title: "申请报修",
					imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/baoxiu.png",
					width: 68,
					height: 65,
					permission: 'zoneRepair:selectZoneRepair',
					url: "/sub-package2/pages/home/repairs/index",
					count: 0
				}, {
					id: 7,
					title: "会议室预约",
					imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/huiyishiyuyue.png",
					width: 68,
					height: 60,
					permission: 'meetingRoomReservation',
					url: "/sub-package2/pages/home/meetingRoom/index",
					count: 0
				}, {
					id: 8,
					title: "手机开门",
					imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/menjin.png",
					width: 61,
					height: 65,
					permission: 'accessControl:selectAccessControl',
					url: "/sub-package2/pages/home/entranceGuard/index",
					count: 0
				}, {
					id: 10,
					title: "投诉建议",
					imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/userComplaints/lianxiwuye.png",
					width: 64,
					height: 66,
					permission: 'zoneComplaint:selectZoneComplaint',
					url: "/sub-package2/pages/home/userComplaints/index",
					count: 0
				},
				{
					id: 11,
					title: "联系物业",
					imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/userComplaints/yonghutousu.png",
					width: 64,
					height: 66,
					permission: '',
					url: "/sub-package2/pages/home/contactProperty/index",
					count: 0
				},
				{
					id: 12,
					title: "访客授权",
					imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/home-grid/fangkeshouquan3.png",
					width: 64,
					height: 66,
					url: "/sub-package1/pages/vis/vis",
					permission: 'visitorAuthorization:selectVisitor',
					count: 0
				},
				{
					id: 13,
					title: "物品放行",
					imgUrl: "https://file.yuanzhoulvwego.com/prod/uploadFiles/user-grid/wupingfangxing3.png",
					url: "/pages/user/propertyPass",
					permission: 'itemManagement:selectItemManagement',
					width: 64,
					height: 66,
					count: 0
				}
				]
			};
		},
		methods:{
			// 点击了宫格，然后进行路由跳转
			goPage(data) {
				console.log(data);
				this.$tools.routerTo(data.url, {}, data.isTabbar||null)
			},
		}
	}
</script>

<style lang="scss">
	.grid-box {
		border-radius: 20upx;
		font-size: 26upx;
		color: $u-main-color;
		overflow: hidden;
		background-color: #FFFFFF;
	}

	.grid {
		width: 100%;
		padding: 0 20upx;
	}
</style>
