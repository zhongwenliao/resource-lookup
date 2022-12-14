<template>
	<view class="content">
		<view style="background: #FFFFFF; margin-bottom: 20upx;">
			<view class="rate">
				<view class="rate-title">{{ repair["service"] || "维修服务" }}</view>
				<view class="rate-cnt">
					<!-- <uni-rate @change="starChange"></uni-rate> -->
				</view>
			</view>
			<view class="rate">
				<view class="rate-title">{{ repair["comment"] || "评价" }}</view>
				<view class="rate-cnt">
					<textarea @input="getEvaluation" :placeholder="`${repair['rate-placeholder']}`||'请您输入对我们服务的评价'" />
				</view>
			</view>
			<view class="submit">
				<button @click="submitRate">{{repair["submit"]||"提交"}}</button>
			</view>
		</view>
	</view>
</template>

<script>
	// import uniRate from "@/components/uni-rate/uni-rate.vue";
	export default {
		components:{
			// uniRate
		},
		data() {
			return {
				itemId: "",
				score: null,
				evaluation:""
			}
		},
		onReady() {
			this.$setTitle(this.title["rate"]);
		},
		onLoad:function(options) {
			this.itemId = options.itemId;
		},
		
		computed: {
			repair() {
				return this.$t("repair")
			},
			title() {
				return this.$t("title")
			}
		},
		
		methods:{
			//提交评分
			submitRate() {
				if(this.scroll === null) {
					this.$showToast(this.repair["rete-null"]||"评分值不能为空");
				}else {
					this.$req.request({
						url:"/wyRepairs/app/grade",
						data: {
							id: this.itemId,
							score: this.score,
							evaluation: this.evaluation
						},
						success: res => {
							if(res.code === 0) {
								this.$showToast(this.repair["rate-success"]||'评价成功');
								uni.navigateTo({
									url:"detail?itemId=" + this.itemId + "&status=" + 4,
								})
							}
						}
					})
				}
			},
			
			//评分值变化
			starChange(e) {
				this.score = e.value;
			},
			
			//获取评价内容
			getEvaluation(e) {
				this.evaluation = e.detail.value;
			}
			
		}
	}
</script>

<style>
	.rate {
		margin-left: 3%;
		margin-right: 3%;
		margin-top: 3%;
	}
	
	.rate-title {
		padding: 10upx 0;
	}
	
	.rate-cnt {
		padding: 20upx 0;
	}
	
	.rate-cnt textarea {
		width: 100%;
		border: 1upx solid #EEEEEE;
	}
	
	.submit {
		padding: 5upx 0 20upx;
		
	}
	
	.submit button {
		width: 25%;
		background-color: #1E90FF;
		color: #FFFFFF;
		font-size: 28upx;
	}
</style>
