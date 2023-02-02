<template>
	<view class="check">
		<view class="check-list">
			<navigator url="../water-electricity-check/water-electricity-check">
				<image src='https://file.yuanzhoulvwego.com/prod/uploadFiles/img/shequ.png' class='menu-icon'></image>
				<text>水表查抄</text>
			</navigator>
			<navigator url="../water-electricity-check/water-electricity-check">
				<image src='https://file.yuanzhoulvwego.com/prod/uploadFiles/img/shequ.png' class='menu-icon'></image>
				<text>电表查抄</text>
			</navigator>
		</view>
	</view>
</template>

<script>

export default {
	data() {
		return {
		 
		};
	},
    methods: {
                // goToBill(){
                //         this.$router.push("/park/wantBill"); 
                // }
    },
};
</script>


<style lang="scss" scoped>
	.check {
		display: flex;
		flex: 1;
		flex-direction: column;
	}	
	.check-list {
		position: relative;
		-webkit-box-sizing: border-box;
		-moz-box-sizing: border-box;
		box-sizing: border-box;
		padding: 10px 0;
		margin: 0;
	}
	.check-list navigator{
		display: inline-block;
		width: 50%;
		text-align: center;
		padding: 5px 0;
		font-size: 26upx;
	}	
	.menu-icon {
		width: 30px;
		height: 30px;
	}
	.check-list text {
		display: block;
	}
</style>