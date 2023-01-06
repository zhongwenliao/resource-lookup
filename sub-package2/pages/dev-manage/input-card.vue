<template>
	<uni-base-page class="uni-base-page">
		<view class="pages-container">
			<view class="card-input-view">
				<input type="number" :placeholder="manage['input-card'] || '请输入卡号'" @input="getCardNo">
			</view>
			<button class="btn-view" @click="cardOperate" :disabled="!cardNo">{{ operationName }}</button>
		</view>
	</uni-base-page>
</template>

<script>
	export default {
		data () {
			return {
				operationName: "",
				devObj: {},
				operationType: null,
				cardNo: ""
			}
		},
		
		computed: {
			manage() {
				return this.$t("manage");
			}
		},
		
		onLoad(options) {
			if(options.devObj) {
				this.devObj = JSON.parse(options.devObj);
				let type = options.type;
				this.operationType = type;
				if(type == 0) {
					//添加卡操作
					this.operationName = this.manage["add-card"] || "添加卡号";
					this.$setTitle( this.manage["input-card-add"] || "输入卡号添卡");
				} else if(type == 1) {
					//删除卡号
					this.operationName =  this.manage["delete-card"] || "删除卡号";
					this.$setTitle( this.manage["input-card-delete"] || "输入卡号删卡");
				}
			}
		},
		
		methods: {
			//获取卡号
			getCardNo(e) {
				this.cardNo = e.target.value;
			},
			
			//点击按钮，判断进行添卡还是删卡操作
			cardOperate() {
				if(this.operationType == 0) {
					//添加卡
					let cardNoArray = this.cardNo.split(",");
					this.$sdkUtil.writeCard(this.devObj, cardNoArray, true);
				} else if (this.operationType == 1) {
					//删卡
					this.$sdkUtil.deleteCard(this.devObj, this.cardNo);
				}
			}
		}
	}
</script>

<style>
	.pages-container {
		padding: 40upx 20upx;
	}
	
	.card-input-view {
		margin: 15% 0 0;
	}
	
	.card-input-view input {
		padding: 20upx;
		border: 1upx solid #0FAEFF;
		border-radius: 10upx;
	}
	
	.btn-view {
		width: 60%;
		background-color: #1E90FF;
		color: #FFFFFF;
		border-radius: 20upx;
		margin-top: 60upx;
	}
	
</style>
