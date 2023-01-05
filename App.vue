<script>
	// 不要升级uview,里面的代码有一些改动，主要在下拉菜单，上传组件，多选框还有公有样式，还有里面的几个js扩展方法
	export default {
		onLaunch: function() {
			// 浏览器只能获取经纬度，需要插件转地址
			if(!uni.getStorageSync('location')){
				uni.setStorageSync('location', {
					city: "深圳市",
					province: "广东省"
				});
			}
			
			// 定位功能，由于需求变更取消
			// let platform=uni.getSystemInfoSync().platform
			//     if(platform=='ios'){
			//          uni.getLocation({
			//          	type: 'wgs84',//gcj02 wgs84
			//          	geocode: true,
			//             success(res) {
			//               uni.setStorageSync('location', res.address);
			//             },
			//             fail(error) {
			//          	   console.log(error);
			//             }
			//             })
			//     }else if(platform=='android'){
			//          uni.getLocation({
			//          	type: 'gcj02',//gcj02 wgs84
			//          	geocode: true,
			//             success(res) {
			// 				console.log(res);
			//               uni.setStorageSync('location', res.address);
			//             },
			//             fail(error) {
			//          	   console.log(error);
			//             }
			//             })
			//     }
			
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	@import './style/uni.css';
    @import "http://yuanzhoulvwego.com/wp-content/uploads/static/iconfont.css";
    /* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
    @import "uview-ui/index.scss";
    
    * {
    	font-family: 'PingFang SC';
    	// color: $uni-text-color;
    }
</style>