<template>
	<view class="body">
		<u-navbar :title="'物品放行'">
			<view class="recordobj" style="margin-left: 570upx;">
				<view @click="record">记录</view>
			</view>
		</u-navbar>
		
		<view class="content">
			<u-form :border-bottom="false" label-width="150upx" :model="form" ref="uForm">
				<!-- 报修信息 start -->
				<view class="form-item_box">
					<view class="form-item_box_head">
						<span class="form-item_box_head_text">地址及时间</span>
						
					</view>
					<view class="form-item_box_body">
						<u-form-item class="form-item" prop="roomName" :border-bottom="false"
							label="房间号">
							<u-input type="select" @click="roomIdSelect = true" placeholder="请选择房间号"
								v-model="form.roomName" />
						</u-form-item>
						<!-- <u-form-item class="form-item" prop="repairer" :border-bottom="false"
							label="联系人">
							<u-input placeholder="请输入姓名" v-model="form.repairer" />
						</u-form-item> -->
						<u-form-item class="form-item" prop="phone" :border-bottom="false"
							label="联系电话">
							<u-input placeholder="请输入联系电话" v-model="form.phone" />
						</u-form-item>
						<u-form-item class="form-item" prop="movingDate" :border-bottom="false"
							label="搬运日期">
							<u-input type="select" @click="show = true" placeholder="请选择日期"
								v-model="form.movingDate" />
						</u-form-item>
					</view>
				</view>
				<!-- 投诉信息 end -->
				<view class="form-item_box">
					<view class="form-item_box_head">
						<span class="form-item_box_head_text">物品明细</span>
					</view>
					<view>
						<view  class="item-box" v-for="(item, index) in form.fwItemReleaseDetails" :key='index' >
							<u-form-item label-width="2upx" prop="name" :target="item">
								<u-input style="width:300upx ;" v-model="item.name" placeholder="请输入物品名称" placeholder-style='color:#999999' ></u-input>
							</u-form-item>
							<u-form-item style="width: 2upx;margin: 25upx 25upx 0upx 25upx; height: 70upx;background: #999999;"></u-form-item>
							<u-form-item label-width="20upx" prop="count" :target="item">
								<u-input style="width: 300upx;" v-model="item.count" placeholder="请输入物品数量"  type="number" placeholder-style='margin-left:20upx;color:#999999'></u-input>
							</u-form-item>
							<u-icon v-if="index === 0" @click="addItem" name="plus"></u-icon>
							<u-icon v-else @click="delItem(item)" name="minus"></u-icon>
						</view>
					</view>
				</view>
				<!-- 现场照片 start -->
				<view class="form-item_box">
					<view class="form-item_box_head">
						<span class="form-item_box_head_text">上传照片</span>
					</view>
					<view class="form-item_box_body">
						<u-form-item label-position="top" :label-style="labelStyle" :border-bottom="false"
							label=" ">
							<u-upload width="181" height="181" :max-size="1 * 1024 * 1024" class="upload" max-count="3"
								:custom-btn="true" :file-list="form.livePhoto" upload-text="" ref="uUpload" :action="action"
								@on-list-change="listChange" @on-success="uploadSuccess" :auto-upload="true">
								<view slot="addBtn">
									<u-image src="https://file.yuanzhoulvwego.com/prod/uploadFiles/home/repairs/shangchuangtupian.png" width="181" height="181"></u-image>
								</view>
							</u-upload>
						</u-form-item>
					</view>
				</view>
				<!-- 现场照片 end -->
			</u-form>
		</view>
		
		<view class="btn_box">
			<u-button class="btn_box_button" @click="onSubmit" type="primary" shape="circle">
				提交
			</u-button>
		</view>
		<u-picker v-model="show" mode="time" :params="params" @confirm="change"></u-picker>
		<!-- 房间号选择 -->
		<u-select @confirm="confirm" value-name="id" label-name="name" mode="mutil-column-auto"
			v-model="roomIdSelect" :list="roomIdSelectList">
		</u-select>
		<!-- 成功框 -->
		<u-modal v-model="showModel" title='' confirm-text="我知道了" :content-style="{ textAlign: 'center' }"
			@confirm="knowConfirm">
			<view class="slot-content">
				<u-image
					class="model-image"
					width="125upx"
					height="125upx"
					shape="circle"
					:src="'https://file.yuanzhoulvwego.com/prod/uploadFiles/home/employeeManagement/tijiao.png'"
				>
					<!-- <u-loading slot="loading"></u-loading>
					<view slot="error" style="font-size: 24upx;">加载失败</view> -->
				</u-image>
				<view style="font-size: 34upx; margin: 22upx 0 42upx;">信息提交成功</view>
			</view>
		</u-modal>
		<!-- <u-toast ref="uToast" /> -->
		<view>
			<u-toast ref="uToast" />
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id: 1,
				// list: [{ name: '', count: '' }],
				// 选择日期
				params: {
					year: true,
					month: true,
					day: true,
					hour: false,
					minute: false,
					second: false
				},
				show: false,
				// 当前园区id
				zoneId: uni.getStorageSync("zoneInfo").zoneId,
				// 当前租户id
				enterpriseId: uni.getStorageSync("userInfo").enterpriseId,
				// 当前用户id
				id: uni.getStorageSync("userInfo").id,
				// 选择房间
				roomIdSelect: false,
				// 选择投诉类型
				repairTypeSelect: false,
				// 显示成功提示
				showModel: false,
				// 表单
				form: {
					livePhoto: [],
					fwItemReleaseDetails: [{ name: '', count: '' }]
				},
				// 房间列表
				roomIdSelectList: [],
				// 投诉类型列表
				repairTypeSelectList: [],
				// 图片上传的标题样式
				labelStyle: {
					fontSize: '34upx',
					fontWeight: 'bold',
					color: '#333333'
				},
				// 图片上传接口
				action: '/image/web/add',
				// 规则
				rules: {
					// repairer: [{ required: true, message: '请选择姓名', trigger: ['change','blur'] }],
					phone: [{ required: true, message: '请输入号码', trigger: ['change','blur'] }],
					roomName: [{ required: true, message: '请选择房间号', trigger: ['change','blur'] }],
					movingDate: [{ required: true, message: '请选择搬运日期', trigger: ['change','blur'] }],
					name: [{
						required: true,
						message: '请输入物品名称',
						trigger: ['blur']
					}],
					count: [{
						required: true,
						message: '请输入物品数量',
						trigger: ['blur']
					}]
				},
			}
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		onLoad() {
			this.getRoomListByEnterpriseId()
			// this.getAllMaintainClassifyList()
		},
		methods: {
			record(){
				this.$Router.push({
					path: '/pages/user/releaseRecord',
					
				});
			},
			addItem() {
				// let add = {
				// 	id: parseInt(this.id)+1
				// }
				this.form.fwItemReleaseDetails.push({ name: '', count: '' })
				// this.id = parseInt(this.id)+1
				// console.log(this.id)
			},
			delItem(item) {
				this.form.fwItemReleaseDetails = this.form.fwItemReleaseDetails.filter((i) => {
					return i != item
				})
			},
			change(e) {
				console.log(e);
				this.form.movingDate = e.year + "-" + e.month + "-" + e.day
			},
			// 获取企业下的房间， 用于选择房间号
			getRoomListByEnterpriseId() {
				let params = {
					enterpriseId: this.enterpriseId,
					zoneId: this.zoneId
				}
				this.$api('employeeManagement.getRoomListByEnterpriseId', params, false).then(res => {
					if (res.code == 200) {
						let arr = res.data
						arr.forEach(item => {
							item.name = item.buildIngName
						})
						this.roomIdSelectList = arr
						this.form.roomName = arr[0].buildIngName + '/' + arr[0].children[0].name
						this.form.roomId = arr[0].children[0].id
					}
				})
			},
			confirm(e) {
				// 选择的是房间
				if (this.roomIdSelect) {
					this.form.roomName = e[0].label + '/' + e[1].label
					this.form.roomId = e[1].value
				}
				// 选择的是报修类型
				if (this.repairTypeSelect) {
					this.form.classificationName = e[0].label
					this.form.classificationId = e[0].value
				}
			},
			// 图片列表改变
			listChange(lists, name) {
				this.form.livePhoto = lists
			},
			// 图片上传成功
			uploadSuccess(data, index, lists, name) {
				if (data.code == 200) {
					this.form.livePhoto = lists
				}
			},
			// 提交按钮
			onSubmit() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						console.log('lplp')
						let params = {
							userId: this.id,
							phone: this.form.phone,
							roomId: this.form.roomId,
							movingDate: this.form.movingDate,
							fwItemReleaseDetails: []
						}
						this.form.fwItemReleaseDetails.forEach(item => {
							params.fwItemReleaseDetails.push({ count: +item.count, name: item.name })
						})
						console.log("123321")
						if (this.form.livePhoto && this.form.livePhoto.length > 0) {
							let images = this.form.livePhoto.map((item) => {
								if (!this.$u.test.isEmpty(item.response)) {
									return { imagePath: item.response.data }
								} else {
									return { imagePath: item.url }
								}
							})
							params.fwItemReleaseImages = images
						} else {
							this.$refs.uToast.show({
								title: '请上传照片！',
								type: 'error',
							})
							return false
						}
						this.$api('user.reLease', params, false).then(res => {
							console.log("123123123");
							if (res.code === 200) {
								this.showModel = true
							} else {
								this.$refs.uToast.show({
									title: res.msg,
									type: 'error'
								})
							}
						})
						
					}
				})
			},
			// 提交后的弹窗 确认按钮 新增，表单重置
			knowConfirm() {
				this.form = {}
				this.showModel = false
				uni.navigateBack()
			}
		}
	}
</script>

<style>
	page {
		background: #F9F9F9;
	}
</style>
<style lang="scss" scoped>
	.body {
		.inp {
			padding-left: 10upx;
		}
		.item-box {
			width: 100%;
			display: flex;
			margin-top: 20upx;
		}
		.content {
			padding-bottom: 118upx;
			.form-item_box {
				margin-top: 20upx;
				padding: 40upx 36upx 20upx 30upx;
				background-color: #FFFFFF;
				border-radius: 15upx;
				.form-item_box_head {
					height: 34upx;
					font-weight: bold;
					display: flex;
					justify-content: space-between;
					align-items: center;
					.form-item_box_head_text {
						font-size: 34upx;
						margin-left: 6upx;
						white-space: pre-wrap;
						word-wrap: break-word;
						height: auto;
					}
				}
				.form-item_box_body {
					margin-left: 16upx;
					.form-item {
						position: relative;
								
						&:before {
							content: '';
							position: absolute;
							bottom: 0;
							right: 40upx;
							height: 2upx;
							width: calc(100% - 180upx);
							background-color: #dddddd;
						}
					}
				}
			}
			.upload {
				padding: 15upx 0upx 15upx 15upx;
			}
		}
		.btn_box {
			height: 98upx;
			position: fixed;
			width: 100%;
			bottom: 0px;
			background-color: white;
			padding: 0 64upx;
			z-index: 99;
			.btn_box_button {
				position: relative;
				top: 50%;
				transform: translateY(-50%);
			}
		}
		.model-image {
			position: relative;
			left: 50%;
			transform: translate(-50%, 0px);
		}
	}
</style>
