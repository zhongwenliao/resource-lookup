<template>
	<view class="manage_main">
		<!--输入手机号获取用户信息-->
		<view class="uni-form-item uni-column">
			<!-- <view class="title">键盘右下角按钮显示为搜索</view> -->
			<input type="number" @confirm="usernameInof" class="uni-input" confirm-type="search"
				:placeholder="realnameManage['phone']||'请输入手机号'" v-model="phone">
		</view>
		<!--输入手机号获取用户信息 end-->

		<!--用户信息列表---->
		<ul v-if="this.userList!=''">
			<li>
				{{realnameManage['fullName']||'姓名'}}:<span>{{this.userList.realName}}</span>
			</li>
			<li>
				{{realnameManage['sex']||'性别'}}:<span>{{userList.sex==1?'男':'女'}}</span>
			</li>
			<li>
				{{realnameManage['IDcard']||'身份证'}}:<span>{{this.userList.idCard}}</span>
			</li>
		</ul>
		<!--用户信息列表 end-->

		<!--提交按钮-->
		<button v-if="this.userList!=''"  @click="changes" >{{realnameManage['realName']||'更改为已实名'}}</button>
		<!--提交按钮 end-->
		
		<!--图片-->
		<p class="img" v-if="this.userList==''"><image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/wsj.png" mode=""></image></p>
	</view>
</template>

<script>
	import AuiPoster from '@/components/aui-poster/aui-poster.vue';
	var isShowLoad = true;
	var view = null;
	export default {
		components: {
			AuiPoster
		},
		data() {
			return {
				phone: '',
				userList: ''
			}
		},
		computed: {
			realnameManage() {
				return this.$t("realname-manage")
			},
		},
		onLoad(options) {
			console.log(this.$t("realname-manage"))
			console.log(this.realnameManage, 666)
			isShowLoad = false;
		},
		methods: {
			usernameInof() {
				this.$req.request({
					url: "/appUser/app/getVerifyStatusErrorByPhone",
					method: "POST",
					header: {
						"content-type": "application/x-www-form-urlencoded"
					},
					data: {
						phone: this.phone,
						accessToken: ''

					},
					success: res => {
						this.userList = res.data
						console.log(this.userList)
					}
				});
			},
			changes() {
				var ids = this.userList.id.toString()
				console.log(ids)
				this.$req.request({
					url: "/appUser/app/updateVerifyStatus",
					method: "POST",
					header: {
						"content-type": "application/x-www-form-urlencoded"
					},
					data: {
						ids: ids,
						accessToken: ''
					},
					success: res => {
						this.$showToast(this.realnameManage["change"] || "更改成功");
					}
				});
			}
		},
	}
</script>

<style scoped>
	.manage_main {
		width: 100%;
		/* padding: 0px 35upx; */
		background-color: #F5F5F5;
	}

	.uni-form-item {
		padding: 10px 0px;
	}

	.uni-input {
		height: 65upx;
	}

	ul {
		padding: 0;
		margin: 0;
		background: #ffff;

	}

	li {
		list-style: none;
		padding: 0 30upx;
		margin: 0;
		color: #9EA2AB;
		height: 90upx;
		line-height: 90upx;
		border-bottom: 1px solid #ecececd4;
	}

	li span {
		color: #000000;
		margin-left: 5upx;
	}

	li:nth-child(3) {
		border: 0px;
	}

	button {
		margin: 0px 10%;
		margin-top: 80%;
		height: 88upx;
		background: linear-gradient(118deg, #01DCA3 0%, #088B68 100%);
		box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
		border-radius: 50upx 50upx 50upx 50upx;
		color: #FFFFFF;
	}
	.img{width: 100%;display: flex;margin: 20% 0px;}
	.img>uni-image{width:350upx;height: 250upx;margin: auto;}
</style>
