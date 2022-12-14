<template>
	<view>
		<u-navbar title="个人资料"></u-navbar>
		<u-cell-group class="cell-group" :border="false">
			<u-cell-item @click="chooseAvatar" :title-style="cellTitle" title="头像">
				<view  class="right-value" slot="right-value">
					<view @tap.stop="preAvatar" class="">
						<u-image   width="88" shape="circle" height="88"
							:src="userInfo.avatar ? userInfo.avatar : '/static/morentouxiang.png'"></u-image>
					</view>	
				</view>
			</u-cell-item>
			<u-cell-item :title-style="cellTitle" :value-style="cellTitle" :arrow="false" title="账号" :value="userInfo.loginAccount"></u-cell-item>
			<u-cell-item :title-style="cellTitle" :value-style="cellTitle" :arrow="false" title="用户名" :value="userInfo.userName"></u-cell-item>
			<u-cell-item :title-style="cellTitle" :value-style="cellTitle" :arrow="false" title="所属公司" :value="userInfo.enterpriseName"></u-cell-item>
			<u-cell-item :title-style="cellTitle" :value-style="cellTitle" :arrow="false" title="角色" :value="userInfo.roleNames"></u-cell-item>
			<u-cell-item :title-style="cellTitle" :value-style="cellTitle" :arrow="false" title="部门" :value="userInfo.deptName"></u-cell-item>
			<u-cell-item :title-style="cellTitle" :value-style="cellTitle" :arrow="false" title="手机号" :value="userInfo.phone"></u-cell-item>
			<!-- <u-cell-item :title-style="cellTitle" :value-style="cellTitle" :arrow="false" title="家庭电话" :value="userInfo.homePhone"></u-cell-item> -->
		</u-cell-group>
	</view>
</template>

<script>
	import {
		IMG_URL,
		API_URL
	} from '@/env'
	export default {
		data() {
			return {
				cellTitle: {
					fontSize: '30upx',
					letterSpacing: '2upx',
					color:'#333333'
				},
				roleList:[],
				deptList:[],
				userInfo: {
					avatar:''
				}
			};
		},
		created() {
			uni.$off('uAvatarCropper');//注销事件，防止触发多次
			uni.$on('uAvatarCropper', path => {
				console.log("调用一次");
				this.userInfo.avatar = path;
				// 可以在此上传到服务端
				uni.uploadFile({
					url: IMG_URL+'/image/web/add',
					filePath: path,
					name: 'file',
					header: {
						Authorization: `Bearer ${uni.getStorageSync('tokenInfo') ? uni.getStorageSync('tokenInfo') : ''}`
					},
					success: (res) => {
						let data = JSON.parse(res.data)
						this.$api('user.updateAvatar', {
							avatar:data.data,
							id:this.userInfo.id
						}).then(res => {
							this.$store.dispatch('getUserInfo')
							
						})
					}
				});
			})
		},
		onLoad() {
			this.userInfo = uni.getStorageSync('userInfo')
			console.log(this.userInfo);
			this.userInfo.roleNames =''
			 this.userInfo.role.forEach((item,index)=>{
				 if(item.roleName.length<= (index+1)){
					 this.userInfo.roleNames += item.roleName+'、'
				 }else{
					  this.userInfo.roleNames += item.roleName
				 }
				
			})
		},
		methods:{
			chooseAvatar() {
				this.$tools.routerTo(
					'/uview-ui/components/u-avatar-cropper/u-avatar-cropper',
					{
						// 输出图片宽度，高等于宽，单位px
						destWidth: 300,
						// 裁剪框宽度，高等于宽，单位px
						rectWidth: 200,
						// 输出的图片类型，如果'png'类型发现裁剪的图片太大，改成"jpg"即可
						fileType: 'jpg',
					}
				);
			},
			preAvatar() {
				let urls = this.userInfo.avatar ? this.userInfo.avatar : '/static/morentouxiang.png'
				wx.previewImage({
					current: '', // 当前显示图片的 http 链接
					urls: [urls] // 需要预览的图片 http 链接列表
				})
			}
		}
	}
</script>
<style>
	page {
		background: #F1F2F3;
	}
</style>
<style scoped lang="scss">
	.right-value{
		display: flex;
		flex-direction: row-reverse;
		margin-right: 15upx;
	}
	.cell-group {
		margin-top: 20upx;
	}
</style>