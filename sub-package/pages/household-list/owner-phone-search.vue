<template>
	<uni-base-page class="uni-base-search">
		<view class="page-container">
			<!-- <view class="big-title">{{ house["house-search"] || "业主房屋查询" }}</view> -->
			<view class="search-box">
				<uni-icons type="search" size="30" class="search-icon"></uni-icons>
				<input type="text" class="search-input" @input="getSearchPhone" :placeholder="`${house['input-owner-phone']}`||'请输入业主手机号'" />
			</view>
			<view>
				<button class="search-btn" @click="searchBuilding">{{ common["search"] || "搜素"}}</button>
			</view>
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data() {
			return {
				phone: "",
				buildingList: []
			}
		},
		
		computed: {
			house() {				return this.$t("house")			},
			common() {
				return this.$t("common")
			}
		},
		
		methods: {
			//获取要查询的手机号
			getSearchPhone(e) {
				console.log("phone---",e.target.value);
				this.phone = e.target.value;
			},
			
			searchBuilding() {
				uni.navigateTo({
					url: "building-list-search?phone=" + this.phone
				})
			}
		},
		
		onLoad() {
			this.$setTitle(this.house["house-search"]||"快速查询");
		}
	}
</script>

<style>
	.page-container {
		padding: 20upx;
	}
	
	.big-title {
		font-size: 40upx;
		font-weight: bold;
	}
	
	.search-box {
		width: 90%;
		padding: 0 10upx;
		background: #F5F5F5;
		border: 1px solid #E6E6E6;
		border-radius: 35upx;
		align-items: center;
		display: flex;
		height: 70upx;
		margin: 80upx auto;
	}
	
	.search-btn {
		margin: 40upx auto;
		width: 60%;
		background-color: #1E90FF;
		color: #FFFFFF;
		border-radius: 35upx;
	}
</style>
