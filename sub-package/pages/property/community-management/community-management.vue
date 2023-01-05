<template>
	<view class="management">
		<view class="management-list">
			<navigator url="../household-management/household-management">
				<image src='http://yuanzhoulvwego.com/wp-content/uploads/static/img/shequ.png' class='menu-icon'></image>
				<text>住户管理</text>
			</navigator>
			<navigator>
				<image src='http://yuanzhoulvwego.com/wp-content/uploads/static/img/shequ.png' class='menu-icon'></image>
				<text>员工信息</text>
			</navigator>
			<navigator>
				<image src='http://yuanzhoulvwego.com/wp-content/uploads/static/img/shequ.png' class='menu-icon'></image>
				<text>楼栋</text>
			</navigator>
			<navigator>
				<image src='http://yuanzhoulvwego.com/wp-content/uploads/static/img/shequ.png' class='menu-icon'></image>
				<text>楼层</text>
			</navigator>
			<navigator>
				<image src='http://yuanzhoulvwego.com/wp-content/uploads/static/img/shequ.png' class='menu-icon'></image>
				<text>房间</text>
			</navigator>
			<navigator>
				<image src='http://yuanzhoulvwego.com/wp-content/uploads/static/img/shequ.png' class='menu-icon'></image>
				<text>门管理</text>
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
	.management {
		display: flex;
		flex: 1;
		flex-direction: column;
	}	
	.management-list {
		position: relative;
		-webkit-box-sizing: border-box;
		-moz-box-sizing: border-box;
		box-sizing: border-box;
		padding: 10px 0;
		margin: 0;
	}
	.management-list navigator{
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
	.management-list text {
		display: block;
	}
</style>