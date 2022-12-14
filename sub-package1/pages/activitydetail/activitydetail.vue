<template>
	<uni-base-page class="acticomment">
		<!-- 活动内容 -->
		<view class="acticon clear">
			<view class="title">
				{{detail.name}}
			</view>
			<view class="time">
				<text>{{ main["time"] || "时间" }}：</text>{{detail.releaseTime}}
			</view>
			<view class="address">
				<text>{{ main["address"] || "地点" }}：</text>{{detail.address}}
			</view>
			<view class="wen" v-html="content"></view>
			<view class="fr">
				<i class="pinglun">
					<image src="../../static/img/talkpinglun.png"></image>
				</i>
				<i class="num" style="margin-right: 20upx;">{{detail.comments ? detail.comments : '0'}}</i>
				<i class="look">
					<image src="../../static/img/talklook.png"></image>
				</i>
				<i class="num">{{detail.views ? detail.views : '0'}}</i>
			</view>
		</view>
		<!-- 从首页或者邻里页面跳转过来的 -->
		<view class="share-btn clear" v-if="showbtn && this.type === 'main'">
			<button class="form fl" @click="clickComment">
				<u-icon size="36" name="chat"></u-icon><text>{{detail.comments ? detail.comments : '0'}}</text>
			</button>
			<button class="apply fl" @click="signIn">
				{{ manypage['sign-up'] || '我要报名' }}
			</button>
			<!-- <button v-if="isAndroid" @click="shareNews"><image src="../../static/img/share-line.png"></image>{{ " 分享" }}</button> -->
		</view>
		<!-- 从我的活动跳转过来的 -->
		<view class="myacivity-btn" v-if="this.type === 'release' || this.type === 'apply'">
			<button class="comt-btn" v-if="showbtn" @click="clickComment">{{ manypage['comment'] || '评论' }}</button>
			<!-- <button v-if="isAndroid" @click="shareNews"><image src="../../static/img/share-line.png"></image>{{ " 分享" }}</button> -->
		</view>
		
		<view class="list-tab" v-if="this.type === 'release' || this.type === 'apply'">
			<view style="display: inline-block;margin-left: 4%;" @click="tabSwitch(0)">
				<text :class="0 == currentIndex? 'tabactive' : 'taberr'">{{ manypage['comment'] || '评论' }}</text>
			</view>
			<view style="display: inline-block;margin-left: 4%;" @click="tabSwitch(1)">
				<text :class="1 == currentIndex? 'tabactive' : 'taberr'">{{ manypage['join'] || '参与的人' }}（{{applyPerson}}）</text>
			</view>
		</view>
		<!-- 评论列表 -->
		<view v-show="isShowComment">
			<five-mul-commentlist
				:title="title1"
				:commentList="commentList"
				@commentDetails="commentDetails"
				@clickPraise="clickPraiseComment"
				@clickDelete="clickDeleteComment"
				@clickDeleteChild="clickDeleteCommentChild"
				@clickRecomment="clickRecomment"
				@clickRecommentChild="clickRecommentChild"
			></five-mul-commentlist>
		</view>
		<!-- 活动报名参加人数列表 -->
		<view class="apply-list" v-show="isShowApply">
			<ul>
				<li v-for="(item,index) in applylist" :key="index">
					<view class="clear">
						<view class="photo fl">
							<image v-if="item.appUserAvatar" :src="item.appUserAvatar"></image>
							<image v-else src="../../static/img/user-avatar.png"></image>
						</view>
						<p class="name fl" v-if="item.appUserNickname">
						{{ item.appUserNickname }}
						</p>
						<p class="name fl" v-if="!item.appUserNickname && item.phone">
						{{ item.phone.substr(0,3) + '****' + item.phone.substr(7,4) }}
						</p>
					</view>
					<view class="mess">{{ manypage['name'] || '姓名' }}：{{item.name}}</view>
					<view class="mess">{{ manypage['phone'] || '电话号码' }}：{{item.phone}}</view>
				</li>
				<view v-if="applylist.length == 0" style="text-align: center;padding-top: 4%;" >
					<image style="width: 100upx;height: 100upx;" src="../../static/img/no-data.png" />
					<view style="color: #808080;">{{ main["no-data"] || "暂无数据" }}</view>
				</view>	
			</ul>
		</view>
		<five-comment ref="detailComment" @showbtnF="showbtnF" @sendComment="sendComment" :placeholder="placeholder"></five-comment>
		
		<!-- 报名弹窗 -->
		<view class="apply-mask" v-if="isShowMask" @click="closeMask"></view>
		<view class="cont" v-if="isShowMask">
			<view class="maskTitle">
				<text>{{ manypage['write'] || '填写资料' }}</text>
				<image @click="closeMask" src="../../static/img/close.png" />
			</view>
			<view>
				<ul>
					<li>
						<text>{{ manypage['name'] || '姓名' }}</text>
						<input type="text" v-model="name" :placeholder="`${manypage['name-placeholder']}` || '请填写你的姓名'" />
					</li>
					<li>
						<text>{{ manypage['phone'] || '电话号码' }}</text>
						<input type="number" maxlength="11" v-model="phone" :placeholder="`${manypage['phone-placeholder']}` || '请填写电话号码'" />
					</li>
				</ul>
			</view>
			<button class="mask-apply" @click="goToApply()">{{ manypage['sign'] || '报名' }}</button>
		</view>
	</uni-base-page>
</template>

<script>
	let currPage = 1;
	import data from '@/data';
	import utils from '@/common/js/index'
	import fiveMulCommentlist from '@/components/five-mul-commentlist/five-mul-commentlist.vue'
	import fiveComment from '@/components/five-comment/five-comment.vue'
	export default{
		components: {
			fiveMulCommentlist,
			fiveComment,
		},
		data(){
			return {
				title1: this.$t("manypage")["comment"] || "评论",
				isShowComment : true,
				isShowApply : false,
				inputvulue: "",
				isActive : true,
				activeCls: 'send',
				activeErr: 'nosend',
				id: "",
				type: "",
				detail:{},
				placeholder: '请输入评论内容…',
				commentTargetId: null,
				commentTargetType: null,
				commentList: [],
				totalCount: 0,
				imageList:[],
				showbtn: true,
				content: "",
				isShowMask: false,
				currentIndex: 0,
				communityId: "",
				name: "",
				phone: "",
				applylist: [],
				applyPerson:""
			}
		},
		computed:{
			manypage() {
				return this.$t('manypage');
			},
			title() {
				return this.$t("title")
			},
			main() {
				return this.$t("main");
			}
		},
		onReady() {
			this.$setTitle(this.title["details"])
		},
		onLoad(option){
			if (this.$getUserInfo().currentCommunity) {
				this.communityId = this.$getUserInfo().currentCommunity.id;
			}
			this.url = 'https://oss.thinmoo.com';
			currPage = 1;
			this.id = option.id;
			this.type = option.type;
			if(this.type==="release" || this.type==="apply"){
				this.title1 = "";
			}
			this.actidetail();
			this.getComment();
			this.applyList();
		},
		methods:{
			// tab切换
			tabSwitch(index) {
				this.currentIndex = index;
				if (this.currentIndex === 0) {
					this.isShowComment = true;
					this.isShowApply = false;
				} else if (this.currentIndex === 1) {
					this.isShowComment = false;
					this.isShowApply = true;
				}
			},
			// 关闭报名弹窗
			closeMask(){
				this.isShowMask = false
			},
			signIn(){
				this.isShowMask = true
			},
			// 获取活动详情
			actidetail(){
				this.$req.request({
					url: "/appActivity/app/getById",
					data: {
						id: this.id,
					},	
					success: res => {
						let code = res.code;
						if (code === 0){
							this.detail = res.data;
							this.content = this.detail.content.replace(/\<img/gi, '<img style="width: 100%;" ');
							console.log("活动详情", this.content);
						}else if (code === 10400) {
							// 活动不存在，可能是中心平台管理删除了该活动，此时就要操作该页面的上一个页面的活动列表，在列表把该活动删除
							let pages = getCurrentPages();
							let page = pages[pages.length - 2];
							// 获取上一页活动列表
							page.$vm.activityList = page.$vm.activityList.filter((acivityObj, index) => {
								if (acivityObj.id != this.id) {
									return acivityObj;
								}
							});
							// console.log("上一页活动列表", page.$vm.activityList);
						}
					},
				});
			},
			goToApply(){
				if(!this.name){
					this.$showToast(this.$t("manypage")["name-placeholder"] || "请填写你的姓名");
					return;
				}
				if(!this.phone){
					this.$showToast(this.$t("manypage")["phone-placeholder"] || "请填写手机号码");
					return;
				}
				if(!this.$getPhoneReg().test(this.phone)) {
					this.$showToast(this.$t("manypage")["right-phone"] || "请填写正确的手机号");
					return;
				}
				this.$req.request({
					url: "/appActivityParticipant/app/add",
					data: {
						communityId: this.communityId,
						appActivityId: this.id,
						name: this.name,
						phone: this.phone,
					},	
					success: res => {
						if (res.code === 0){
							this.$showToast(this.$t("manypage")["sign-success"] || "报名成功");
							this.isShowMask = false
						}else{
							this.$showToast(res.msg);
						}
					},
				});
			},
			// 报名人数列表
			applyList(){
				this.$req.request({
					url: "/appActivityParticipant/app/getByActivityId",
					data: {
						appActivityId: this.id,
					},	
					success: res => {
						if (res.code === 0){
							this.applylist = res.data;
							this.applyPerson = this.applylist.length;
						}
					},
				});
			},
			/**
			 * 回复 评论
			 * @param {Object} item
			 */
			clickRecomment(item) {
				this.showbtn = false;
				this.$refs.detailComment.open();
				this.commentTargetType = 3;
				this.commentTargetId = item.id;
				console.log('回复 评论')
				this.placeholder = '回复' + item.commentUserNickname + ':';
			},
			/**
			 * 回复评论的评论
			 * @param {Object} item
			 */
			clickRecommentChild(item) {
				console.log('回复评论的评论')
				this.$refs.detailComment.open();
				this.placeholder = '回复' + item.commentUserNickname + ':';
			},
			/*跳转评论详情*/
			commentDetails(item) {
				console.log('跳转评论详情',item)
				uni.navigateTo({
					url: '/sub-package/pages/discount-mall/comment-details?index=' + item.id
				})
			},
			/**
			 * 点赞多级评论
			 * @param {Object} item
			 */
			clickPraiseComment(item) {
				//只能点赞不能取消
				if (item.IS_PRAISE == '1') {
					return;
				}
				let params = {
					likeTargetId: item.id,
					likeTargetType: 3 //点赞目标类型（3.评论，4.回复）
				}
				console.log('点赞')
				this.like(params,item)
			},
			like(params,item) {
				this.$req.request({
					url: "/omComment/app/like",
					data: params,
					success: res => {
						console.log('zsx1',res)
						if(res.code == 0) {
							item.IS_PRAISE = '1';
							item.likes++;
						}
					}
				});
			},
			/**
			 * 评论
			 */
			clickComment() {
				this.showbtn = false;
				this.commentTargetId = this.id;
				this.commentTargetType = 5;
				console.log('评论')
				this.$refs.detailComment.open();
			},
			showbtnF() {
				this.showbtn = true;
			},
			/**
			 * 发送评论
			 * @param {Object} result
			 */
			sendComment(result) {
				this.showbtn = true;
				console.log("发送评论")
				let params = {
					commentTargetId: this.commentTargetId,
					commentTargetType: this.commentTargetType, //评论目标类型（1.推广 2.新闻 3.评论，4.回复）
					content: result
				}
				if(result !=""){
					this.$req.request({
						url: "/omComment/app/comment",
						data: params,
						isShowLoading: false, // 值为false时，不显示uni.showLoading
						success: res => {
							console.log(res)
							this.$showToast(res.msg)
							if( res.code === 0 ) {
								currPage = 1;
								this.commentList = []
								this.getComment()
								this.actidetail()
							}
						}
					});
				}else{
					this.$showToast(this.$t("manypage")["noCan"] || "评论内容不能为空");
					this.showbtn = true;		
				}
			},
			/*评论管理-获取评论列表*/
			getComment() {
				let pageSize = 5;
				let params = {
					pid: this.id, //评论对象ID(推广链接ID,新闻Id)
					commentTargetType: 5, //评论目标类型（1.推广 2.新闻 3.评论，4.回复）
					ascs: 'id', //升序字段【使用列表中返回的字段进行排序】
					descs: 'createTime',
					currPage: currPage, //当前页数
					pageSize: pageSize //每页记录数
				}
				this.$req.request({
					url: "/omComment/app/list",
					data: params,
					success: res => {
						if(res.code == 0) {
							this.totalCount = res.data.totalCount
							if( res.data.list.length > 0 ) {
								currPage++;
								this.commentList = this.commentList.concat(res.data.list) 
								this.commentList.forEach( item => {
									item.num = 3;
									item.createTime = utils.fromCurrentTime(item.createTime)
									if( item.commentUserAvatar ) {
										item.commentUserAvatar = this.url + item.commentUserAvatar
									}
								})
								console.log(this.commentList)
							}
						}
					}
				});
			},
			send(){
				this.isActive = false;
				console.log("输入框",this.inputvulue)
				if(this.inputvulue == ""){
					this.isActive = true;
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.acticomment{
		// padding: 0 30upx;
		width: 100%;
		.acticon{
			padding: 0 30upx;
			padding-bottom: 20upx;
			border-bottom: 1px solid #eee;
			.title{
				font-size: 35upx;
			}
			.address{
				font-size: 28upx;
				padding-bottom: 20upx;
			}
			.time{
				color: #aaa;
				padding: 20upx 0;
			}
		
		.wen{
			font-size: 30upx;
			line-height: 45upx;
		}
		.actiimg{
			width: 30%;
			margin-right: 3%;
			margin-bottom: 20upx;
		}
		.actiimg:last-child{
			margin-right: 0;
		}
		.tu{
			width:100%;
			padding-bottom:100%;
			position:relative;
			image{
				width:100%;
				height:100%;
				display:block;
				margin:auto;
				position:absolute;
				left:0;
			}
		}
	}
		.comment{
			// padding-top: 20upx;
			padding-bottom: 10upx;
			border-bottom: 1px solid #ddd;
			.photo{
				width: 80upx;
				height: 80upx;
				border: 1px solid #eee;
				border-radius: 50%;
				image{
					width: 100%;
					height: 100%;
					border-radius: 50%;
				}
			}
			.name{
				font-size: 30upx;
				padding: 20upx 20upx;
			}
			.wen{
				font-size: 30upx;
				line-height: 45upx;
				padding-bottom: 10upx;
				padding-top: 20upx;
			}
			.back{
				font-size: 30upx;
			}
			.time{
				font-size: 30upx;
				color: #B2B2B2;
			}
		}
		.comback{
			padding-top: 20upx;
			.photo{
				width: 60upx;
				height: 60upx;
				border: 1px solid #eee;
				border-radius: 50%;
				margin-right: 20upx;
				image{
					width: 100%;
					height: 100%;
					border-radius: 50%;
				}
			}
			.backname{
				display: inline-block;
				margin-right: 10upx;
				padding-top: 10upx;
			}
			.backcom{
				display: inline-block;
				width: 90%;
				margin-left: 88upx;
			}
		}
		.cominput{
			width: 90%;
			height: 70upx;
			position: absolute;
			bottom: 20upx;
			left: 5%;
			textarea{
				display: inline-block;
				width: 75%;
				height: 54upx;
				border: 1px solid #ccc;
				font-size: 30upx;
				padding-left: 20upx;
				padding-top: 16upx;
				white-space: normal;
			}
			.nosend{
				display: inline-block;
				width: 18%;
				height: 100%;
				font-size: 30upx;
				margin-left: 20upx;
				background: #eee;
				border-radius: 10upx;
				color: #000;
			}
			.send{
				display: inline-block;
				width: 18%;
				height: 100%;
				font-size: 30upx;
				margin-left: 20upx;
				background: linear-gradient(118deg, #01DCA3 0%, #088B68 100%);
				box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
				border-radius: 10upx;
				color: #FFFFFF;
			}
		}
		.share-btn {
			width: 100%;
			height: 90upx;
			position: fixed;
			left: 0;
			bottom: 0;
			z-index: 999;
		}
		.form {
			width: 30%;
			height: 90upx;
			line-height: 90upx;
			color: #888;
			background: #fff;
			border-top: 1px solid #eee;
			border-radius: 0;
			
		}
		.form:after{
			border: 0!important;
		}
		.apply{
			width: 70%;
			height: 90upx;
			line-height: 90upx;
			background: linear-gradient(118deg, #01dca3 0%, #088b68 100%);
			color: #fff;
			border-radius: 0;
		}
		.apply:after{
			border: 0!important;
		}
		.apply-mask{
			width: 100%;
			height: 100%;
			position: fixed;
			top: 0;
			left: 0;
			bottom: 0;
			background: rgba(0,0,0,.3);
			// z-index: 100;
		}
		.cont{
			background: #fff;
			width: 94%;
			border-radius: 4px;
			height: 600upx;
			position: fixed;
			top: 50%;
			left: 50%;
			margin-top: -300upx;
			margin-left: -47%;
			// z-index: 10000000000;
			.maskTitle {
				font-size: 40upx;
				color: #088b68;
				padding: 30upx 30upx;
				position: relative;
				text-align: left;
				image {
					width: 45upx;
					height: 45upx;
					position: absolute;
					top: 20upx;
					right: 20upx;
				}
			}
			ul{
				padding-left: 30upx;
				li{
					margin-top: 40upx;
					text{
						display: inline-block;
						width: 160upx;
						height: 60upx;
						line-height: 60upx;
						font-size: 30upx;
						color: #000;
						vertical-align: top;
					}
					input{
						display: inline-block;
						width: 70%;
						height: 60upx;
						line-height: 60upx;
					}
				}
			}
			button{
				width: 350upx;
				height: 60upx;
				line-height: 60upx;
				background: linear-gradient(118deg, #01dca3 0%, #088b68 100%);				color: #fff;
				margin: auto;
				margin-top: 60upx;
			}
		}
		
		.myacivity-btn {
			width: 100%;
			position: fixed;
			bottom: 40upx;
			z-index: 999;
			background: #fff;
		}
		.comt-btn {
			width: 80%;
			margin: auto;
			height: 88upx;
			line-height: 88upx;
			background: linear-gradient(118deg, #01dca3 0%, #088b68 100%);
			box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
			border-radius: 50upx 50upx 50upx 50upx;
			color: #ffffff;
		}
		.list-tab {
			width: 100%;
			height: 88upx;
			line-height: 88upx;
			margin-top: 20upx;
		}
		.taberr {
			display: inline-block;
			color: #000;
			font-weight: bold;
			font-size: 34upx;
			transition: all 0.7s;
		}
		
		.tabactive {
			display: block;
			color: #088B68;
			font-weight: bold;
			font-size: 34upx;
			transition: all 0.7s;
		}
		.apply-list{
			margin-bottom: 140upx;
			ul{
				padding: 0 30upx;
				li{
					border-bottom: 1px solid #eee;
					padding: 20upx 0;
				}
				// li:last-child{
				// 	border-bottom:0
				// }
			}
			.photo{
				width: 80upx;
				height: 80upx;
				border: 1px solid #eee;
				border-radius: 50%;
				image{
					width: 100%;
					height: 100%;
					border-radius: 50%;
				}
			}
			.name{
				font-size: 30upx;
				padding: 20upx 20upx;
			}
			
			.mess{
				font-size: 28upx;
				color: #000;
				padding-top: 5upx;
				font-weight: bold;
			}
		}
		
	}
</style>
