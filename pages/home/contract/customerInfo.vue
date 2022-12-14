<template>
	<!-- 更多 -->
	<view>
		<u-navbar title="更多" :border-bottom="true">
		</u-navbar>
		<view class="content">
			<view class="content-head">
				<view class="title">
					我的信息
				</view>
				<view class="u-p-10">
					<view class="unit">
						<view class="left">
							客户名称
						</view>
						<view class="right">
							{{enterpriseInfo.companyName}}
						</view>
					</view>
					<view class="unit">
						<view class="left">
							所属行业
						</view>
						<view class="right">
							{{industryList[enterpriseInfo.industryId-1] ? industryList[enterpriseInfo.industryId-1].name:''}}
						</view>
					</view>
					<view class="unit">
						<view class="left">
							企业法人
						</view>
						<view class="right">
							{{enterpriseInfo.legalPerson}}
						</view>
					</view>
					<view class="unit">
						<view class="left">
							联系方式
						</view>
						<view class="right">
							{{enterpriseInfo.contactPhone || '--'}}
						</view>
					</view>
					<view class="unit">
						<view class="left">
							{{enterpriseInfo.leaseType==0?'企业信用代码':'身份证号码'}}
						</view>
						<view class="right">
							 {{enterpriseInfo.enterpriseCreditCode || '--'}}
						</view>
					</view>
					<view class="unit">
						<view class="left">
							个人邮箱
						</view>
						<view class="right">
							{{enterpriseInfo.email || '--'}}
						</view>
					</view>
					<view class="unit">
						<view class="left">
							通讯地址
						</view>
						<view class="right">
							{{enterpriseInfo.mailingAddress || '--'}}
						</view>
					</view>
				</view>
			</view>
			<view class="content-body">
				<view class="title">
					相关证件
				</view>
				<view class="u-p-10">
					<view v-if="enterpriseInfo.businessLicense.length>0" class="">
						<view class="content-body-subtitle" style="padding: 20upx 0upx 15upx 0upx;">
							营业执照
						</view>
						<view class="u-p-l-10">
							<u-image @click="preAvatar(enterpriseInfo.businessLicense)" class="image" :fade="false" width="200" height="200"
								:src="enterpriseInfo.businessLicense"></u-image>
						</view>
					</view>
					<view v-if="enterpriseInfo.idCardFrontPhoto || enterpriseInfo.idCardReversePhoto" class="">
						<view class="content-body-subtitle" style="padding: 20upx 0upx 15upx 0upx;">
							身份证正反照
						</view>
						<view class="u-p-l-10">
							<view class="photo_list">
								<u-image @click="preAvatar(enterpriseInfo.idCardFrontPhoto)" class="image" v-if="enterpriseInfo.idCardFrontPhoto" :fade="false" width="200"
									height="200" :src="enterpriseInfo.idCardFrontPhoto"></u-image>
								<u-image @click="preAvatar(enterpriseInfo.idCardReversePhoto)" class="image" v-if="enterpriseInfo.idCardReversePhoto" :fade="false" width="200"
									height="200" :src="enterpriseInfo.idCardReversePhoto"></u-image>
							</view>
						</view>
					</view>
					<view v-if="enterpriseInfo.corporateLogo" class="">
						<view class="content-body-subtitle" style="padding: 20upx 0upx 15upx 0upx;">
							企业logo
						</view>
						<view class="u-p-l-10">
							<view class="photo_list">
								<u-image @click="preAvatar(enterpriseInfo.corporateLogo)" class="image" :fade="false" width="200" height="200"
									:src="enterpriseInfo.corporateLogo"></u-image>
							</view>
						</view>
					</view>
				</view>
				
				<view v-if="contractScanDocs.length>0||yzQyEnterpriseInfoLicenses.length>0" class="title">
					相关附件
				</view>
				<view class="u-p-10">
					<view v-if="yzQyEnterpriseInfoLicenses.length>0" class="">
						<view class="content-body-subtitle" style="padding: 20upx 0upx 15upx 0upx;">
							营业执照
						</view>
						<view class="u-p-l-10">
							<view @click="showPdf(item)" v-for="(item,index) in yzQyEnterpriseInfoLicenses" class="pdf_list">
								{{item.fileName}}
							</view>
						</view>
					</view>
					<view v-if="contractScanDocs.length>0" class="">
						<view class="content-body-subtitle" style="padding: 20upx 0upx 15upx 0upx;">
							合同扫描件
						</view>
						<view class="u-p-l-10">
							<view @click="showPdf(item)" v-for="(item,index) in contractScanDocs" class="pdf_list">
								{{item.fileName}}
							</view>
						</view>
					</view>
					<view v-if="enterpriseInfoFiles.length>0" class="">
						<view class="content-body-subtitle" style="padding: 20upx 0upx 15upx 0upx;">
							身份证文件
						</view>
						<view class="u-p-l-10">
							<view @click="showPdf(item)" v-for="(item,index) in enterpriseInfoFiles" class="pdf_list">
								{{item.fileName}}
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				labelStyle: {
					fontSize: '34upx',
					fontWeight: 'bold',
					color: '#333333'
				},
				enterpriseInfo: {
					idCardFrontPhoto: '',
					idCardReversePhoto: '',
					businessLicense: [],
				},
				yzQyEnterpriseInfoLicenses:[],
				contractScanDocs: [],
				enterpriseInfoFiles: [],
				industryList: [],
			}
		},
		onReady() {

		},
		methods: {
			preAvatar(img) {
				wx.previewImage({
					current: '', // 当前显示图片的 http 链接
					urls: [img] // 需要预览的图片 http 链接列表
				})
			},
			showPdf(item) {
				uni.showLoading()
				uni.downloadFile({
					url: item.filePath,
					success: function(res) {
						var filePath = res.tempFilePath;
						uni.openDocument({
							filePath: filePath,
							showMenu: true,
							success: function(res) {
								uni.hideLoading()
								console.log('打开文档成功');
							}
						});
					}
				});
			}
		},
		onLoad() {
			
			this.enterpriseInfo = this.$Route.query.enterpriseInfo
			this.contractScanDocs = this.$Route.query.contractScanDocs
			this.yzQyEnterpriseInfoLicenses = this.$Route.query.yzQyEnterpriseInfoLicenses
			this.enterpriseInfoFiles = this.$Route.query.enterpriseInfoFiles? this.$Route.query.enterpriseInfoFiles:[]
			this.$enum.industryEnum((value) => {
				this.industryList = value
			})
		},
		onShow() {

		},
	}
</script>
<style>
	page {
		background: #F9F9F9;
	}
</style>
<style scoped lang="scss">
	.pdf_list {
		color: #529CF0;
	}
	.photo_list {
		width: 100%;
		display: flex;
	
		.image {
			margin-right: 20upx;
			margin-bottom: 20upx;
		}
	
	}
	.content-body{
		margin-top: 20upx;
		background: #FFFFFF;
		border-radius: 15px;
		padding: 30upx;
		.content-body-subtitle{
			font-size: 28upx;
			color: #666666;
		}
	}
	.content-head {
		margin-top: 20upx;
		background: #FFFFFF;
		border-radius: 15px;
		padding: 30upx;
	}

	.title {
		font-size: 34upx;
		color: #333333;
		font-weight: bold;
	}

	.unit {
		display: flex;
		justify-content: space-between;
		padding: 30upx 0upx 15upx 0upx;

		.left {
			font-size: 30upx;
			color: #333333;
		}

		.right {
			font-size: 30upx;
			color: #333333;
		}
	}
</style>
