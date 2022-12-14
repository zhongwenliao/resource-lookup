<template>
	<view class="details">
		<view class="title">
			{{details.name}}
		</view>
		<view class="personInfo clear">
			<view class="appUserAvatar fl">
				<image v-if="details.appUserAvatar" :src="details.appUserAvatar"></image>
				<image v-else src="../../../static/img/user-avatar.png"></image>
			</view>
			<view class="fl">
				<view class="appUserName">
					{{details.appUserName}}
				</view>
				<view class="time">
					{{details.createTime}}
				</view>
			</view>
		</view>
		<!-- <view class="dis-content" v-html="item.content"></view> -->
		<view class="imgBox">
			<view class="picture" v-for="(imgSrc, srcIndex) in details.imgSrcList" :key="srcIndex" v-if="imgSrc"
				:style="{'background-image':'url(' + imgSrc + ')'}">
			</view>
		</view>
		<view class="button-box">
			<button class="no-pass" @click="turnBtn(details.id)">驳回</button>
			<button class="pass" @click="passBtn(details.id,details.appUserName)">通过</button>
		</view>
		<!-- 驳回弹窗 -->
		<pop ref="pop" direction="center" :is_close="true" :is_mask="true" :width="86">
			<h3 style="text-align: center;">周边优惠审核</h3>
			<textarea class="textarea mar_bottom_20" v-model="rejectReason" placeholder-style="color:#9A9A9A" placeholder="请输入原因"/>
			<view class="" style="text-align: center;">
				<button class="mar_right_40" @click="popCancelBtn" size="mini" plain type="default">{{common['cancel']}}</button>
				<button @click="submitBtn" size="mini" type="primary">{{common['confirm']}}</button>
			</view>
		</pop>
	</view>
</template>

<script>
import pop from '../../../components/ming-pop/ming-pop.vue';
export default {
	components: {
		pop
	},
	data() {
		return {
			details: {},
			rejectReason: "",
			id: "",
		};
	},
	computed: {
		common() {
			return this.$t("common")
		}
	},
    methods: {
        // 驳回
        turnBtn(id) {
        	this.$refs.pop.show();
        	this.id = id
        	// console.log('驳回',this.dataItem.id)
        },
		submitBtn() {
			this.popCancelBtn();
			this.reviewTenement(this.id,2,this.rejectReason);
		},
		popCancelBtn() {
			this.$refs.pop.close();
		},
		// 审核通过
		reviewTenement(id,status,rejectReason) {
			let params = {
				id,
				status, //1通过 2驳回
				rejectReason //驳回内容
			}
			this.$req.request({
				url: "/omCoupon/app/updateById",
				data: params,
				success: res => {
					if(res.code == 0) {
						setTimeout(() =>{
							uni.navigateBack({
								delta: 1
							});
						},2000)
					}
				}
			});
		},
		//通过
		passBtn(id,appUserName) {
			let that = this;
			uni.showModal({
				title: "周边优惠审核",
				// content: this.identityAuthentication['whether-passes'] + item.realName + this.identityAuthentication['of'] + this.identityAuthentication['identity-verification'] +'？',
				content: "是否通过威威的周边优惠审核",
				confirmText: this.common['confirm'],
				cancelText: this.common['cancel'],
				success(res) {
					if (res.confirm) {
						that.reviewTenement(id,1)
					} else if (res.cancel) {
						
					}
				}
			})
		},
    },
	onLoad() {
		this.details = uni.getStorageSync("auditDetails")
	}
};
</script>

<style lang="scss" scoped>
	.details{
		width: 100%;
		border-radius: 20upx;
		margin: 0 10upx;
	}
	.title{
		border-bottom: 1px solid #eee;
		text-align: left;
		padding: 10upx 20upx;
		font-size: 30upx;
	}
	.personInfo{
		padding: 20upx;
		.fl{
			text-align: left;
		}
	}
	.appUserName{
		color: #088b68;
		font-size: 26upx;
		margin-left: 20upx;
		margin-top: -8upx;
	}
	.time{
		color: #C0C0C0;
		font-size: 24upx;
		margin-left: 20upx;
		margin-top: -5upx;
	}
	.appUserAvatar{
		width: 60upx;
		height: 60upx;
	}
	.appUserAvatar image{
		width: 100%;
		height: 100%;
		display: block;
		border-radius: 50%;
	}
	.imgBox {
		display: flex;
		.picture {
			margin: 0upx 16upx;
			width: 200upx;
			height: 200upx;
			border: 1px solid #eee;
			background-position: center center;
			background-size: cover;
			background-repeat: no-repeat;
		}
	}
	.button-box{
		width: 100%;
		position: fixed;
		bottom: 40upx;
		left: 0;
	}
	.no-pass {
		width: 80%;
		height: 88upx;
		line-height: 88upx;
		background: #fff;
		box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
		border-radius: 50upx 50upx 50upx 50upx;
		color: #666;
	}
	.pass {
		width: 80%;
		height: 88upx;
		line-height: 88upx;
		background: linear-gradient(118deg, #01dca3 0%, #088b68 100%);
		box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
		border-radius: 50upx 50upx 50upx 50upx;
		color: #ffffff;
		margin-top: 40upx;
	}
	.textarea{
	    border: solid 1px #9A9A9A;
		border-radius: 10upx;
		padding: 20upx;
		width: calc( 100% - 40upx );
		height: 140upx;
	}
	.mar_bottom_20 {
		margin-bottom: 20upx;
	}
	.mar_right_40 {
		margin-right: 40upx;
	}
</style>