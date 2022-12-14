<template>
	<uni-base-page class="epidemic-prevention-list-page">
		<view v-if="!members.length" class="none">暂无数据</view>
		<view class="flex-item flex-item-V uni-bg-blue">
			<uni-list>
				<uni-list-item v-for="(item,index) in members" :key="index" @click="openDetail(item)" :color="item.isDanger ? 'red':''" :title="item.isDanger ? `${item.name}(感染者同程)` : item.name" :note="item.from_address.addressStr || item.from_address.street || '地址未填写'"></uni-list-item>
			</uni-list>
		</view>
	</uni-base-page>
</template>

<script>
	import uniListItem from "../../components/uni-list-item/uni-list-item.vue";
export default {
	components: {
		uniListItem
	},
	data() {
		return {
			members: [],
			currPage: 1
		};
	},
	onLoad() {
		this.reloadMemberList();
	},
	onPullDownRefresh() {
		this.members = [];
		this.currPage = 1;
		this.getMemberList();
	},
	onReachBottom() {
		this.currPage++;
		this.getMemberList();
	},
	methods: {
		reloadMemberList() {
			this.members = [];
			this.currPage = 1;
			this.getMemberList();
		},
		getMemberList() {
			var _this = this;
			var currentCommunity = this.$getUserInfo().currentCommunity;
			var communityId = currentCommunity !== undefined ? currentCommunity.id : 0;
			this.$req.request({
				url: "/persDiseaseRegiste/app/list",
				method: "GET",
				data: {
					"currPage": this.currPage,
					"communityId": communityId
				},
				success(res) {
					uni.stopPullDownRefresh();
					var list = res.data.list;
					_this.page++;
					_this.members = _this.members.concat(list);
					if(list.length < 10) {
						_this.$showToast("没有更多数据了");
					}
				}
			});
		},
		// 明细
		openDetail: function(item) {
			// console.log(item);
			uni.navigateTo({
				url: `./member-detail?item=${encodeURIComponent(JSON.stringify(item))}`
			});
		}
	}
};
</script>

<style lang="scss">
	.epidemic-prevention-list-page {
		width: 100%;
		.none {
		  text-align: center;
		  color: #cccccc;
		  line-height: 100px;
		}
	}
</style>
