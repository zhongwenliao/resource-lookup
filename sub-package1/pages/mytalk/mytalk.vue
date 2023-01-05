<template>
	<uni-base-page class="mytalk">
		<movable-area>
		<ul>
			<li class="clear" v-for="(item, index) in talkList" :key="index" @click="comment(item.id)">
				<span class="time">{{ item.createTime }}</span>
				<i class="delete" @click.stop="deltalk(item.id)"><image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/talkdelete.png" /></i>
				<view class="wen">{{ item.content }}</view>
				<view class="clear" v-if="item.appNoteImageList.length > 0">
					<view class="talkimg fl" v-for="(imglist, i) in item.appNoteImageList" :key="i">
						<view class="tu" v-if="imglist.image">
							<image mode="aspectFill" :src="imglist.image" @click.stop="previewImage(imglist.image, item.appNoteImageList)"/>
						</view>
					</view>
				</view>
				<view class="num-mess">
					<dl class="clear">
						<dd>
							<i class="look">
								<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/talklook.png"></image>
							</i>
							<i class="num">{{item.views ? item.views : '0'}}</i>
						</dd>
						<dd>
							<i class="pinglun">
								<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/talkpinglun.png"></image>
							</i>
							<i class="num" style="margin-right: 20upx;">{{item.comments ? item.comments : '0'}}</i>
						</dd>
						<dd>
							<i class="like" v-if="item.IS_PRAISE == 1" @click.stop="talkLike(item.id,item)">
								<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/like.png"></image>
							</i>
							<i class="like" v-else @click.stop="talkLike(item.id,item)">
								<image src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/nolike.png"></image>
							</i>
							<i class="num">{{item.likes ? item.likes : '0'}}</i>
						</dd>
					</dl>
				</view>
			</li>
			<view v-if="talkList.length == 0" class="text-view1">
				<image style="width: 100upx;height: 100upx;" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/no-data.png" />
				<view style="color: #808080;">{{ main["no-data"] || "发点什么吧~" }}</view>
			</view>
		</ul>
			<movable-view :x="x" :y="y" direction="all" @change="onChange">
				<image @click="goTotalk" class="send" src="http://yuanzhoulvwego.com/wp-content/uploads/static/img/sendicon.png"></image>
			</movable-view>
		</movable-area>
	</uni-base-page>
</template>

<script>
import utils from '@/common/js/index'
export default {
	data() {
		return {
			dianzan: false,
			communityId: "",
			talkList: [],
			searchCount: "",
			id: "",
			imageList: [],
			x: 300,
			y: 400,
			scale: 2,
			old: {
				x: 0,
				y: 0,
				scale: 2
			}
		};
	},
	computed: {
		main() {
			return this.$t("main");
		},
		title() {
			return this.$t("title")
		}
	},
	onReady() {
		this.$setTitle(this.title["my-talks"])
	},
	onShow() {
		this.mytalk();
	},
	methods: {
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
		onChange(e) {
			this.old.x = e.detail.x
			this.old.y = e.detail.y
		},
		goTotalk() {
			uni.navigateTo({
				url: "http://yuanzhoulvwego.com/wp-content/uploads/static/pages/talking/talking?originatePage=1"
			});
		},
		// 说说点赞
		talkLike(id,item){
			this.$req.request({
				url: "/omComment/app/like",
				data: {
					likeTargetId: id,
					likeTargetType: 6
				},
				isShowLoading: false,
				success: res => {
					if(res.code == 0){
						item.likes++;
						item.IS_PRAISE = '1';
					}
				}
			});
		},
		// 获取我的说说
		mytalk() {
			this.$req.request({
				url: "/appNote/app/getCurrentAppUserNote",
				success: res => {
					if (res.code === 0) {
						this.talkList = res.data;
						this.talkList.forEach( item => {
							item.createTime = utils.fromCurrentTime(item.createTime);
							// console.log("说说id",item.id);
							// uni.setStorageSync({'myTalkId':'item.id'})
						})
					}
				}
			});
		},
		// 删除说说
		deltalk(id) {
			uni.showModal({
				content: "是否删除该条说说？",
				cancelText: "取消", // 取消按钮的文字
				confirmText: "确认", // 确认按钮文字
				success: res => {
					if (res.confirm) {
						this.$req.request({
							url: "/appNote/app/delByIds",
							data: {
								ids: id
							},
							show_loading: true,
							success: res => {
								if (res.code === 0) {
									this.$showToast("删除成功");
									setTimeout(() => {
										this.mytalk();
									}, 1000);
								}
							}
						});
					}
				}
			});
		},
		comment(id) {
			uni.navigateTo({
				url: "/sub-package1/pages/talkdetail/talkdetail?id=" + id + "&type=my"
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.mytalk {
	width: 100%;
	movable-view {
		position: fixed;
		width: 70upx;
		height: 70upx;
	}
	
	movable-area {
		height: 100%;
		width: 100%;
		overflow: hidden;
	}
	.text-view1{
		width: 100%;
		text-align: center;
		margin-top: 40vh;
	}
	.send {
		display: block;
		width: 70upx;
		height: 70upx;
	}
	ul,
	li {
		list-style: none;
	}
	ul {
		padding: 0 30upx;
	}
	li {
		border-bottom: 1px solid #e0e0e0;
		position: relative;
		padding-bottom: 20upx;
		margin-bottom: 20upx;
		.num-mess{
			width: 100%;
			padding-top: 10upx;
			dl{
				dd{
					width: 33.3%;
					text-align: center;
					float: left;
				}
			}
		}
		.time {
			color: #b2b2b2;
		}
		.delete {
			width: 35upx;
			height: 35upx;
			position: absolute;
			top: 10upx;
			right: 10upx;
			image {
				width: 100%;
				height: 100%;
			}
		}
		.wen {
			font-size: 32upx;
			padding-bottom: 10upx;
			overflow: hidden;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
		}
		.talkimg {
			width: 32%;
			margin-right: 2%;
			margin-bottom: 10upx;
		}
		.talkimg:nth-child(3n){
			margin-right: 0;
		}
		.tu {
			width: 100%;
			padding-bottom: 100%;
			position: relative;
			image {
				width: 100%;
				height: 100%;
				display: block;
				margin: auto;
				position: absolute;
				left: 0;
			}
		}
	}
}
</style>
