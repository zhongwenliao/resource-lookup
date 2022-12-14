<template>
	<view class="appoint">
		<view class="vis-info">
			<ul>
				<li class="clear">
					<view class="vis-left fl">
						{{ appointment["name"] || "姓名" }}
					</view>
					<view class="vis-right fr">
						{{auditObj.name}}
					</view>
				</li>
				<li class="clear">
					<view class="vis-left fl">
						{{ appointment["phone"] || "手机号" }}
					</view>
					<view class="vis-right fr">
						{{auditObj.phone}}
					</view>
				</li>
				<li class="clear">
					<view class="vis-left fl">
						{{ appointment["gender"] || "性别" }}
					</view>
					<view class="vis-right fr" v-if="auditObj.gender && auditObj.gender == 0">男</view>
					<view class="vis-right fr" v-if="auditObj.gender && auditObj.gender == 1">女</view>
				</li>
				<li class="clear">
					<view class="vis-left fl">
						{{ appointment["id-card"] || "身份证号" }}
					</view>
					<view class="vis-right fr">
						{{auditObj.certNo}}
					</view>
				</li>
				<li class="clear">
					<view class="vis-left fl">
						{{ appointment["community"] || "小区" }}
					</view>
					<view class="vis-right fr">
						{{auditObj.visitedPlace}}
					</view>
				</li>
				<li class="clear">
					<view class="vis-left fl">
						{{ appointment["interviewee"] || "被访人" }}
					</view>
					<view class="vis-right fr">
						{{auditObj.visitedEmp}}
					</view>
				</li>
				<li class="clear">
					<view class="vis-left fl">
						{{ appointment["room"] || "房间" }}
					</view>
					<view class="vis-right fr">
						{{auditObj.visitedPlace}}
					</view>
				</li>
			</ul>
		</view>
		<view class="vis-title">
			{{ appointment["information"] || "办事信息" }}
		</view>
		<view class="vis-info" style="margin-top: 0;">
			<ul>
				<li class="clear">
					<view class="vis-left fl">
						{{ appointment["matters"] || "办理事项" }}
					</view>
					<view class="vis-right fr">
						{{auditObj.visitReason}}
					</view>
				</li>
				<li class="clear">
					<view class="vis-left fl">
						{{ appointment["start"] || "开始时间" }}
					</view>
					<view class="vis-right fr">
						{{auditObj.accStartdatetime}}
					</view>
				</li>
				<li class="clear">
					<view class="vis-left fl">
						{{ appointment["end"] || "结束时间" }}
					</view>
					<view class="vis-right fr">
						{{auditObj.accEnddatetime}}
					</view>
				</li>
			</ul>
		</view>
	    <view class="passReason">
	    	<textarea value="" v-model="reviewResult" :placeholder="`${appointment['write-reject-reason']}` || '请输入驳回原因'"  @input="changeDisabled"/>
	    </view>
		<view class="btn-box clear">
			<button class="pass" @click="pass">{{ appointment["pass"] || "通过" }}</button>
			<button type="primary" class="reject" :disabled="disabled" @click="noPass">{{ appointment["reject"] || "驳回" }}</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				auditId: "",
				reviewResult: "",
			    disabled: true,
				auditObj: {}
			}
		},
		computed: {
			appointment() {
				return this.$t("appointment");
			},
			title() {
				return this.$t("title")
			}
		},
		methods:{
			changeDisabled(e){
				if (e.detail.value != "") {
					this.disabled = false;
				} else {
					this.disabled = true;
				}
			},
			// 通过
			pass(){
				this.$req.request({
					url: "/visEmpVisitor/app/reviewById",
					data: {
						id: this.auditId,
						reviewStatus: 1
					},
					isShowLoading: false,
					success: res => {
						if(res.code == 0) {
							this.$showToast(res.msg);
							setTimeout(() =>{
								uni.navigateTo({
									url: "/sub-package1/pages/audit-history/audit-history?type=1"
								})
							},1000)
						} else {
							this.$showToast(res.msg)
						}
					}
				});
			},
			// 驳回
			noPass(){
				this.$req.request({
					url: "/visEmpVisitor/app/reviewById",
					data: {
						id: this.auditId,
						reviewStatus: 2,
						reviewResult: this.reviewResult
					},
					isShowLoading: false,
					success: res => {
						if(res.code == 0) {
							this.$showToast(res.msg);
							setTimeout(() =>{
								uni.navigateTo({
									url: "/sub-package1/pages/audit-history/audit-history?type=1"
								})
							},1000)
						} else {
							this.$showToast(res.msg)
						}
					}
				});
			}
		},
		onLoad(options) {
			this.auditId = options.auditId;
			this.auditObj = JSON.parse(options.auditObj);
		}
	}
</script>

<style>
	.appoint{
		width: 100%;
		background-color: #F2F2F2;
	}
	.vis-info {
		background-color: #FFFFFF;
		padding: 0;
		width: 95%;
		margin: 0 auto;
		margin-top: 40upx;
	}
	.vis-info ul {
		padding: 0;
		list-style: none;
	}
	.vis-info ul li {
		background: #FFFFFF;
		word-break: break-all;
		min-height: 100upx;
		height: auto;
		width: 94%;
		margin-left: 3%;
		margin-right: 3%;
		margin-bottom: 4upx;
		border-bottom: 2upx solid #EEEEEE;
	}
	.vis-left{
		width: 22%;
		text-align: left;
		margin-top: 4%;
	}
	.vis-right{
		width: 75%;
		display: inline-block;
		margin-top: 4%;
	}
	.vis-title{
		color: gray;
		padding: 20upx;
	}
	.passReason{
		background: #fff;
		height: 200upx;
		width: 95%;
		margin: auto;
		margin-top: 20upx;
	}
	.passReason textarea{
		width: 94%;
		height: 90%;
		padding: 3%;
	}
	.btn-box{
		margin: 40upx;
	}
	.btn-box button {
		color: #ffffff;
		border-style: none;
		padding: 10upx 0;
		font-size: 30upx;
		width: 45%;
	}
	.btn-box button.pass{
		background: #007aff;
		float: left;
	}
	.btn-box button.reject{
		/* background: #ddd; */
		float: right;
	}
</style>
