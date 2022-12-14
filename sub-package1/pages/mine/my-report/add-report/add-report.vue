<template>
	<view  class="pad10">
		
		<view class="pad30" style="background-color: #fff;width: 670upx;">
			<u-input v-model="link" type="text" placeholder="请粘贴好物链接"/>
		</view>
		<view class="hold15"></view>
		<view class="content pad30">
			<u-input :maxlength="500" v-model="value" type="textarea" :height="height" :auto-height="autoHeight" placeholder="请填写你推荐的理由或者对好物的描述" />
		</view>
		<!-- <view class="marTop30">
			<text>爆好物奖励，审核通过后即可获得50积分！</text>
		</view>
		<view class="rule">
			<text>积分兑换规则：</text>
			<text>1、1000积分可换取洗衣机</text>
			<text>2、2000积分可换取电视机</text>
			<text>3、3000积分可换取电脑一台 </text>
		</view> -->
		<view class="verticalCenter marTop60">
			<u-button @click="submit" type="primary" size="medium ">提交审核</u-button>
		</view>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				 link:"",
				 value: '',
				border: true,
				height: 300,
				autoHeight: true,
			};
		},
		 watch: {
			txt(txt) {
				if( txt.indexOf('\n') != -1 ){ //敲了回车键了
				   uni.hideKeyboard() //收起软键盘
				}
			}
		},
		methods: {
			submit() {
				if( this.link == '' ) { this.$showToast('好物链接不能为空'); return};
				if( this.value == '' ) { this.$showToast('好物描述不能为空'); return};
				let params = {
					url: this.link,
					reason: this.value
				}
				this.$req.request({
					url: "/omRecommendGoods/app/add",
					data: params,
					success: res => {
						if(res.code == 0) {
							this.$showToast(res.msg)
							this.link = '';
							this.value = ''
						}
					}
				});
				console.log('提交')
			}
		}
	}
</script>

<style lang="scss">
page {
	background-color: #F7F7F7;
	width: 750upx;
}
.content {
	background: #FFFFFF;
	width: 670upx;
}
.rule {
	text {
		display: block;
		color: #FF7100;
	}
}
</style>
