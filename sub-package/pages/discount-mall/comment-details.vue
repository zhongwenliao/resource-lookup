<template>
	<view class="" style="width: 750upx;">
		<five-mul-commentlist
			title="所有评论"
			:commentList="commentList"
			@commentDetails="commentDetails"
			@clickPraise="clickPraiseComment"
			@clickDelete="clickDeleteComment"
			@clickDeleteChild="clickDeleteCommentChild"
			@clickRecomment="clickRecomment"
			@clickRecommentChild="clickRecommentChild"
		></five-mul-commentlist>
		<five-comment ref="detailComment" @sendComment="sendComment" :placeholder="placeholder"></five-comment>
	</view>
</template>

<script>
	let currPage = 1;
	import fiveMulCommentlist from '@/components/five-mul-commentlist/five-mul-commentlist.vue'
	import fiveComment from '@/components/five-comment/five-comment.vue'
	import data from '@/data';
	import utils from '@/common/js/index'
	export default {
		components: {
			fiveMulCommentlist,
			fiveComment
		},
		data() {
			return {
				placeholder: '请输入评论内容…',
				commentTargetId: null,
				commentTargetType: null,
				productObjId : null,
				commentList: [],
				id: null,
				url: ''
			}
		},
		onLoad(option) {
			this.url = 'https://oss.thinmoo.com';
			currPage = 1;
			this.id = option.index*1
			this.getComment()
		},
		methods: {
			/**
			 * 回复 评论
			 * @param {Object} item
			 */
			clickRecomment(item) {
				// console.log(11,item)
				this.$refs.detailComment.open();
				this.commentTargetType = 4;
				this.commentTargetId = item.id;
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
			/**
			 * 发送评论
			 * @param {Object} result
			 */
			sendComment(result) {
				let params = {
					commentTargetId: this.commentTargetId,
					commentTargetType: this.commentTargetType, //评论目标类型（1.推广 2.新闻 3.评论，4.回复）
					content: result
				}
				this.$req.request({
					url: "/omComment/app/comment",
					data: params,
					success: res => {
						// console.log(res)
						this.$showToast(res.msg)
						if( res.code === 0 ) {
							currPage = 1;
							this.commentList = []
							this.getComment()
						}
					}
				});
			},
			/**
			 * 回复问题
			 */
			clickComment() {
				this.commentTargetId = this.productObjId;
				this.commentTargetType = 1;
				this.$refs.detailComment.open();
			},
			/*评论管理-获取评论列表*/
			getComment() {
				let pageSize = 50;
				let params = {
					pid: this.id, //评论对象ID(推广链接ID,新闻Id)
					commentTargetType: 3, //评论目标类型（1.推广 2.新闻 3.评论，4.回复）
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
							}
						}
					}
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
					likeTargetType: 4 //点赞目标类型（3.评论，4.回复）
				}
				// console.log(params)
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
		}
		
	}
</script>

<style >
</style>
