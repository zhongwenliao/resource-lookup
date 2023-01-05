<template>
	<uni-base-page class="talkcomment">
		<!-- 说说内容 -->
		<view class="talkcon clear">
			<view class="clear">
				<view class="photo fl">
					<image v-if="detail.appUserAvatar" :src="detail.appUserAvatar"></image>
					<image v-else src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/user-avatar.png"></image>
				</view>
				<p class="name fl" v-if="detail.appUserName">{{ detail.appUserName }}</p>
				<p class="name fl" v-if="!detail.appUserName && detail.appUserPhone">{{ detail.appUserPhone.substr(0, 3) + '****' + detail.appUserPhone.substr(7, 4) }}</p>
			</view>
			<view class="wen" v-html="detail.content"></view>
			<view class="clear">
				<view class="talkimg fl" v-for="(item, index) in imageList" :key="index">
					<view class="tu" v-if="item.image"><image mode="aspectFill" :src="item.image" @click.stop="previewImage(item.image, imageList)"></image></view>
				</view>
			</view>
			<view class="num-mess">
				<dl class="clear">
					<dd>
						<i class="look">
							<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/talklook.png"></image>
						</i>
						<i class="num">{{detail.views ? detail.views : '0'}}</i>
					</dd>
					<dd>
						<i class="pinglun">
							<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/talkpinglun.png"></image>
						</i>
						<i class="num" style="margin-right: 20upx;">{{detail.comments ? detail.comments : '0'}}</i>
					</dd>
					<dd>
						<i class="like" v-if="detail.IS_PRAISE == 1" @click.stop="talkLike(detail.id,detail)">
							<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/like.png"></image>
						</i>
						<i class="like" v-else @click.stop="talkLike(detail.id,detail)">
							<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/nolike.png"></image>
						</i>
						<i class="num">{{detail.likes ? detail.likes : '0'}}</i>
					</dd>
				</dl>
			</view>
		</view>
		<!-- 从我的说说跳转过来的 -->
		<view class="myacivity-btn" v-show="isShowBtn">
			<button class="comt-btn" v-if="showbtn" @click="clickComment">{{ manypage['comment'] || '评论' }}</button>
			<!-- <button v-if="isAndroid" @click="shareNews"><image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/share-line.png"></image>{{ " 分享" }}</button> -->
		</view>
		
		<view class="list-tab" v-if="this.type === 'my'">
			<view style="display: inline-block;margin-left: 4%;" @click="tabSwitch(0)">
				<text :class="0 == currentIndex? 'tabactive' : 'taberr'">{{ manypage['comment'] || '评论' }}</text>
			</view>
			<view style="display: inline-block;margin-left: 4%;" @click="tabSwitch(1)">
				<text :class="1 == currentIndex? 'tabactive' : 'taberr'">{{ manypage['like'] || '点赞的人' }}（{{likePerson}}）</text>
			</view>
		</view>
		<!-- 评论列表 -->
		<view v-show="isShowComment">
			<five-mul-commentlist
				:title="title1"
				:commentList="commentList"
				@commentDetails="commentDetails"
				@clickPraise="clickPraiseComment"
				@clickRecomment="clickRecomment"
				@clickRecommentChild="clickRecommentChild"
			></five-mul-commentlist>
		</view>
		<!-- 说说点赞人数列表 -->
		<view class="like-list" v-show="isShowLike">
			<ul>
				<li v-for="(item,index) in likelist" :key="index">
					<view class="clear">
						<view class="photo fl">
							<image v-if="item.likeUserAvatar" :src="item.likeUserAvatar"></image>
							<image v-else src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/user-avatar.png"></image>
						</view>
						<view class="fl">
							<p class="name">
								{{ item.likeUserNickname }}
							</p>
							<p class="time">
								{{ item.createTime }}
							</p>
						</view>
						
					</view>
				</li>
				<view v-if="likelist.length == 0" style="text-align: center;padding-top: 10%;" >
					<image style="width: 100upx;height: 100upx;" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/no-data.png" />
					<view style="color: #808080;">{{ main["like"] || "点个赞吧~" }}</view>
				</view>	
			</ul>
		</view>
		<five-comment ref="detailComment" @showbtnF="showbtnF" @sendComment="sendComment" :placeholder="placeholder"></five-comment>
	</uni-base-page>
</template>

<script>
let currPage = 1;
import data from '@/data';
import utils from '@/common/js/index';
import fiveMulCommentlist from '@/components/five-mul-commentlist/five-mul-commentlist.vue';
import fiveComment from '@/components/five-comment/five-comment.vue';
export default {
	components: {
		fiveMulCommentlist,
		fiveComment
	},
	data() {
		return {
			title1: this.$t("manypage")["comment"] || "评论",
			isShowBtn: true,
			isShowComment: true,
			isShowLike: false,
			inputvulue: '',
			isActive: true,
			activeCls: 'send',
			activeErr: 'nosend',
			id: '',
			detail: {},
			placeholder: '请输入评论内容…',
			commentTargetId: null,
			commentTargetType: null,
			commentList: [],
			totalCount: 0,
			imageList: [],
			likelist: [],
			showbtn: true,
			isValidLink: false,
			currentIndex: 0,
			likePerson: ""
		};
	},
	computed: {
		talkcomment() {
			return this.$t('talkcomment');
		},
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
	onLoad(option) {
		this.url = 'https://oss.thinmoo.com';
		currPage = 1;
		this.id = option.id;
		this.type = option.type;
		if(this.type==="my"){
			this.title1 = "";
		}
		this.talkdetail();
		this.getComment();
		this.likeList();
	},

	methods: {
		// tab切换
		tabSwitch(index) {
			this.currentIndex = index;
			if (this.currentIndex === 0) {
				this.isShowComment = true;
				this.isShowLike = false;
				this.isShowBtn = true;
			} else if (this.currentIndex === 1) {
				this.isShowComment = false;
				this.isShowLike = true;
				this.isShowBtn = false;
			}
		},
		// 预览图片
		previewImage(src, imgList) {
			let imageList = imgList.map((imgObj, index) => {
				return imgObj.image;
			});
			uni.previewImage({
				urls: imageList,
				current: src,
				loop: true
			});
		},
		// 说说点赞
		talkLike(id,detail){
			this.$req.request({
				url: "/omComment/app/like",
				data: {
					likeTargetId: id,
					likeTargetType: 6
				},
				isShowLoading: false,
				success: res => {
					if(res.code == 0){
						detail.likes++;
						detail.IS_PRAISE = '1';
					}
				}
			});
		},
		// 点赞数列表
		likeList(){
			this.$req.request({
				url: "/OmCommentLikeLog/app/list",
				data: {
					likeTargetId: this.id,
					likeTargetType: 6
				},	
				success: res => {
					if (res.code === 0){
						this.likelist = res.data.list;
						this.likePerson = this.likelist.length;
						if(this.likelist.length > 0){
							this.likelist.forEach(item =>{
								item.createTime = utils.fromCurrentTime(item.createTime);
								if(item.likeUserAvatar){
									item.likeUserAvatar = this.url + item.likeUserAvatar
								}
							});
						}
					}
				},
			});
		},
		// 获取说说详情
		talkdetail() {
			this.$req.request({
				url: '/appNote/app/getById',
				data: {
					id: this.id
				},
				success: res => {
					if (res.code === 0) {
						let talkdetailData = res.data;
						this.imageList = talkdetailData.appNoteImageList;
						talkdetailData.content = this.$matchTalkURL(talkdetailData.content);
						talkdetailData.content = this.$matchPhone(talkdetailData.content);
						this.detail = talkdetailData;
					}
				}
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
			console.log('回复 评论');
			this.placeholder = '回复' + item.commentUserNickname + ':';
		},
		/**
		 * 回复评论的评论
		 * @param {Object} item
		 */
		clickRecommentChild(item) {
			console.log('回复评论的评论');
			this.$refs.detailComment.open();
			this.placeholder = '回复' + item.commentUserNickname + ':';
		},
		/*跳转评论详情*/
		commentDetails(item) {
			console.log('跳转评论详情', item);
			uni.navigateTo({
				url: '/sub-package/pages/discount-mall/comment-details?index=' + item.id
			});
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
			};
			console.log('点赞');
			this.like(params, item);
		},
		like(params, item) {
			this.$req.request({
				url: '/omComment/app/like',
				data: params,
				success: res => {
					console.log('zsx1', res);
					if (res.code == 0) {
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
			this.commentTargetType = 6;
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
			let params = {
				commentTargetId: this.commentTargetId,
				commentTargetType: this.commentTargetType, //评论目标类型（1.推广 2.新闻 3.评论，4.回复）
				content: result
			};
			if(result !=""){
				this.$req.request({
					url: '/omComment/app/comment',
					data: params,
					success: res => {
						this.$showToast(res.msg);
						if (res.code === 0) {
							currPage = 1;
							this.commentList = [];
							this.getComment();
							this.talkdetail();
						}else {
							this.$refs.detailComment.open();
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
				commentTargetType: 6, //评论目标类型（1.推广 2.新闻 3.评论，4.回复）
				ascs: 'id', //升序字段【使用列表中返回的字段进行排序】
				descs: 'createTime',
				currPage: currPage, //当前页数
				pageSize: pageSize //每页记录数
			};
			this.$req.request({
				url: '/omComment/app/list',
				data: params,
				success: res => {
					if (res.code == 0) {
						this.totalCount = res.data.totalCount;
						if (res.data.list.length > 0) {
							currPage++;
							this.commentList = this.commentList.concat(res.data.list);
							this.commentList.forEach(item => {
								item.num = 3;
								item.createTime = utils.fromCurrentTime(item.createTime);
								if (item.commentUserAvatar) {
									item.commentUserAvatar = this.url + item.commentUserAvatar;
								}
							});
						}
					}
				}
			});
		},
		send() {
			this.isActive = false;
			console.log('输入框', this.inputvulue);
			if (this.inputvulue == '') {
				this.isActive = true;
			}
		}
	}
};
</script>

<style>
.talkcomment {
	padding: 0 30upx;
	width: 100%;
}
.talkcomment .talkcon {
	border-bottom: 1px solid #ddd;
	padding-bottom: 20upx;
}
.talkcon .num-mess{
	width: 100%;
}
.talkcon .num-mess dd{
	width: 33.3%;
	text-align: center;
	float: left;
}
.talkcon .photo {
	width: 80upx;
	height: 80upx;
	border: 1px solid #eee;
	border-radius: 50%;
}
.talkcon .photo image {
	width: 100%;
	height: 100%;
	border-radius: 50%;
}	
.talkcon .name {
	font-size: 25upx;
	padding: 24upx 15upx;
	color: #088b68;
	font-weight: bolder;
}
.talkcon .wen {
	padding-top: 10upx;
	padding-bottom: 20upx;
	font-size: 30upx;
	line-height: 45upx;
	word-break: break-all;
}
.talkcon .talkimg {
	width: 32%;
	margin-right: 2%;
	margin-bottom: 20upx;
}
.talkimg:nth-child(3n) {
	margin-right: 0;
}
.talkcon .tu {
	width: 100%;
	padding-bottom: 100%;
	position: relative;
}
.talkcon .tu image {
	width: 100%;
	height: 100%;
	display: block;
	margin: auto;
	position: absolute;
	left: 0;
}
.myacivity-btn {
	width: 100%;
	position: fixed;
	bottom: 40upx;
	left: 0;
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
.like-list{
	margin-bottom: 140upx;
}
.like-list ul{
	padding: 0 30upx;
}
.like-list ul li{
	border-bottom: 1px solid #eee;
	padding: 20upx 0;
}
		
.photo{
	width: 80upx;
	height: 80upx;
	border: 1px solid #eee;
	border-radius: 50%;
}
.photo image{
	width: 100%;
	height: 100%;
	border-radius: 50%;
}
.name{
	font-size: 30upx;
	padding: 0 20upx;
	margin-top: -10upx;
}
.time{
	font-size: 26upx;
	color: #888;
	padding: 0 20upx;
}
.mess{
	font-size: 28upx;
	color: #000;
	padding-top: 5upx;
	font-weight: bold;
}
</style>
