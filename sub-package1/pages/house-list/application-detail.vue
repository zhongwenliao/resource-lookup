<template>
	<uni-base-page>
		<view style="background: #FFFFFF;">
			<view class="info-list">
				<view class="left-cnt">{{ house["apply-house"] || "申请房屋" }}</view>
				<view class="right-cnt">{{ detailObj.communityName }}/{{ detailObj.buildingName }}/{{ detailObj.roomName }}</view>
			</view>
			<view class="info-list">
				<view class="left-cnt">{{ house["authType"] || "认证方式" }}</view>
				<view class="right-cnt">{{ house["authTypeList"][detailObj.authType] }}</view>
			</view>
			<view class="info-list">
				<view class="left-cnt">{{ house["name"] || "姓名" }}</view>
				<view class="right-cnt">{{ detailObj.realName }}</view>
			</view>
			<view class="info-list">
				<view class="left-cnt">{{ house["gender"] || "性别" }}</view>
				<!-- <view class="right-cnt">{{ common["gender-list"][detailObj.gender] }}</view> -->
				<view class="right-cnt">{{ common["gender-list"][detailObj.gender] }}</view>
			</view>
			<view class="info-list">
				<view class="left-cnt">{{ house["phone"] || "手机号" }}</view>
				<view class="right-cnt">{{ detailObj.phone }}</view>
			</view>
			<view class="info-list" v-if="detailObj.identityType && detailObj.identityType !==''">
				<view class="left-cnt">{{ house["identity"] || "身份类型"  }}</view>
				<view class="right-cnt">{{ common["identity-type-list"][parseInt(detailObj.identityType)-1] }}</view>
			</view>
			<!-- <view class="info-list">
				<view class="left-cnt">{{ house["cert-type"] || "证件类型"  }}</view>
				<view class="right-cnt">{{ common["cert-type-list"][detailObj.certyType] }}</view>
			</view> -->
			<view class="info-list" v-if="detailObj.certNo && detailObj.certNo !== ''">
				<view class="left-cnt">{{ house["cert-num"] || "证件号"  }}</view>
				<view class="right-cnt">{{ detailObj.certNo }}</view>
			</view>
			<view class="info-list" v-if="detailObj.faceImage">
				<view class="left-cnt">{{ house["face-img"] || "人脸照片"  }}</view>
				<view class="right-cnt" @click="checkPhoto(detailObj.faceImage)"><image :src="detailObj.faceImage" style="width: 300upx;height: 300upx;" mode="aspectFill"></image></view>
			</view>
			<view class="info-list">
				<view class="left-cnt">{{ house["review-status"] || "审核状态" }}</view>
				<view class="right-cnt">{{ common["status"][detailObj.reviewStatus] }}</view>
			</view>
			<view class="info-list" v-if="detailObj.reviewTime">
				<view class="left-cnt">{{ house["create-time"] || "申请时间" }}</view>
				<view class="right-cnt">{{ detailObj.createTime }}</view>
			</view>
			<view class="info-list" v-if="detailObj.reviewTime">
				<view class="left-cnt">{{ house["review-time"] || "审核时间" }}</view>
				<view class="right-cnt">{{ detailObj.reviewTime }}</view>
			</view>
			<view class="info-list" v-if="detailObj.reviewStatus == 2">
				<view class="left-cnt">{{ house["reject-reason"] || "驳回原因" }}</view>
				<view class="right-cnt">{{ detailObj.reviewResult }}</view>
			</view>
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				detailObj: null
			}
		},
		computed: {
			house() {
				return this.$t("house")
			},
			common() {
				return this.$t("common")
			}
		},
		onLoad(options) {
			console.log(options.applicationObj)
			this.detailObj = JSON.parse(options.applicationObj);
		},
		methods: {
			checkPhoto(image) {
				let imageList = [];
				imageList.push(image);
				console.log(imageList)
				uni.previewImage({
					urls: imageList
				})
			}
		}
	}
</script>

<style>
	.right-cnt image {
		width: 100%;
	}
	
	.float-btn {
		width: 100%;
		/* height: 5%; */
		height: 70upx;
		display: block;
		align-items: middle;
		background: #FFFFFF;
		position: absolute;
		bottom: 0;
		padding: 10upx 0;
		border-top: 1upx solid #eeeeee;
	}
	
	.float-btn button {
		width: 20%;
		font-size: 26upx;
		border: 1upx solid #1E90FF;
		color: #1E90FF;
		background: transparent;
	}
</style>
