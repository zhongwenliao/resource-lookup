<template>
	<uni-base-page class="uni-base-page">
		<uni-search @input="onInput"></uni-search>
		<view class="list-view-container" v-if="cardList.length > 0" style="margin-top: 100upx;">
			<ul class= "list-ul-container">
				<li class="li-border-bottom">
					<view class="list-item">
						<view class="left-name">{{ manage["total-card"] || "卡数量" }}</view>
						<view class="right-info">{{ cardNum }}</view>
					</view>
				</li>
				<li class="li-border-bottom" v-for="card in cardList">
					{{ card }}
				</li>
			</ul>
		</view>
		<uni-empty-page v-else></uni-empty-page>
	</uni-base-page>
</template>

<script>
	import uniSearch from '../../components/uni-search/uni-search.vue';
	export default {
		components: {
			uniSearch
		},
		data() {
			return {
				cardNum: null,
				cardList: [],
				allCardList: []
			}
		},
		
		computed: {
			manage() {
				return this.$t("manage")
			},
			title() {
				return this.$t("title")
			}
		},
		
		onLoad(options) {
			this.$setTitle(this.title["card-list"] || "卡数据");
			if(options.cardNo) {
				this.cardList = JSON.parse(options.cardNo);
				this.allCardList = JSON.parse(options.cardNo);
				this.cardNum = options.cardNum;
			}
		},
		
		methods: {
			onInput(value) {
				this.cardList = this.allCardList.filter(card => {
					if(card !== undefined && card.indexOf(value) > -1) {
						return card;
					}
				});
			}
		}
	}
</script>

<style>
	.li-border-bottom {
		padding: 10upx;
		border-bottom: 1upx solid #D3D3D3;
	}
</style>
