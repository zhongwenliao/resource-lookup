<template>
	<view class="content">
		<view class='password-area'>
			<view class="" style="width: 100%; display: flex; justify-content: center;">
				<uqrcode  ref="uQRCode" :mode="mode" :text="text" :size="size" :margin="margin"
					:background-color="backgroundColor" :foreground-color="foregroundColor"
					:error-correct-level="errorCorrectLevel" :type-number="typeNumber" :file-type="fileType"></uqrcode>
				<!-- <canvas style="width: 180px; height: 200px;" canvas-id="qrcode" id="firstCanvas"></canvas> -->
			</view>
			<view class="" style="padding: 0 20upx; word-break: break-all;font-size: 40upx;">
				<text style="font-size: 60upx;">*{{ password }}#</text><br />
				<text class="time_color">有效时间</text><br />
				<text  class="time_color" >{{data.startDate}} - {{data.endDate}}</text><br /><br />
			</view>
			<canvas style="width: 180px; height: 200px; visibility: hidden;" canvas-id="shareImageCanvas" id="secondCanvas"></canvas>
		</view>
		<view class="visitInfo u-p-l-30 u-p-t-28 u-p-b-28 u-font-26">
			<view class="">
				{{ vis["visit-place"] || "到访地点"}}：{{data.authorizedName}}
			</view>
			<view class="">
				{{ vis["usage-count"] || "使用次数"}}：{{data.visitTime}}{{ vis["second-rate"] || "次"}}
			</view>
			<view class="">
				{{ vis["visit-time"] || "到访时间"}}：{{data.startDate}} - {{data.endDate}}
			</view>
		</view>
		<view class='share-text'><text>{{ vis["share"] || "分享访客密码"}}</text></view>
		<!-- #ifdef APP-PLUS || H5 -->
		<view class='share-btn'>
			<!-- <view class='btn' hover-class="btn-hover" @click="shareSystem"> -->
			<view class='btn' hover-class="btn-hover" @click="shareSystem">
				<button>
					<image mode="aspectFill" src='http://yuanzhoulvwego.com/wp-content/uploads/static/img/fenxiang.png'></image>
				</button>
				<!-- <text>{{ common["share"] || "分享" }}</text> -->
			</view>
			<u-line color="#DDDDDD" :direction="'col'" margin="0 140upx 0 140upx" />
			<view class='btn' hover-class="btn-hover" @click="copy()">
				<button>
					<image mode="aspectFill" src='http://yuanzhoulvwego.com/wp-content/uploads/static/img/fuzhi.png'></image>
				</button>
				<!-- <text>{{ vis["copy"] || "复制" }}</text> -->
			</view>
		</view>
		<!-- #endif -->

		<!-- 微信小程序 -->
		<!-- #ifdef MP-WEIXIN || MP-ALIPAY-->
		<view class='share-btn'>
			<view class='btn'>
				<button open-type='share'>
					<image src='http://yuanzhoulvwego.com/wp-content/uploads/static/img/weixin.png'></image>
				</button>
				<text>{{ vis["wechat"] || "微信" }}</text>
			</view>
			<view class='btn'>
				<button @click='copy'>
					<image src='http://yuanzhoulvwego.com/wp-content/uploads/static/img/copy.png'></image>
				</button>
				<text>{{ vis["copy"] || "复制" }}</text>
			</view>
		</view>
		<!-- #endif -->
	</view>
</template>

<script>
	import uQRCode from '@/uni_modules/Sansnn-uQRCode/components/uqrcode/common/uqrcode'
	var shares = null;
	var sweixin = null;
	export default {
		data() {
			return {
				mode: 'canvas',
				text:null,
				size: 200,
				margin: 10,
				backgroundColor: '#FFFFFF',
				foregroundColor: '#000000',
				errorCorrectLevel: uQRCode.errorCorrectLevel.H,
				typeNumber: -1,
				fileType: 'png',
				
				password: "",
				qrcode: "",
				qrcodeImage: "",
				link: "",
				content: "",
				isAndroid: uni.getSystemInfoSync().platform === "android",
				isSupportShare: this.$getConfigParam().wxAppId !== "",
				address: "",
				data: {},
				currentBrightness: 0.5
			}
		},

		computed: {
			vis() {
				return this.$t("vis")
			},
			common() {
				return this.$t("common")
			}
		},

		onLoad(options) {
			let data = JSON.parse(options.index); // 字符串转对象
			// let data={
			// 	authorizedName: "101设备",
			// 	content: "",
			// 	endDate: "2022-02-23 12:59",
			// 	memo: "",
			// 	phone: "",
			// 	pwd: "473806",
			// 	qrcode: "QR473806",
			// 	room: "101设备",
			// 	shareUrl: "473806",
			// 	startDate: "2022-02-23 10:59",
			// 	usableCount: 1,
			// 	visitTime: "1"
			// }
			this.data = data;
			this.$setTitle(this.vis["title"]);
			this.password = data.pwd;
			this.qrcode = data.qrcode;
			this.content = data.content;
			this.address = data.room;
			//小区名称
			let currentCommunityName = uni.getStorageInfoSync('zoneInfo').name;
			let omponent = "&qrcode=" + data.qrcode + '&startDate=' + data.startDate + '&endDate=' + data.endDate +
				'&authorizedName=' + data.authorizedName + '&usableCount=' + data.usableCount + '&memo=' + data.memo +
				'&phone=' + data.phone + '&address=' + currentCommunityName;
			// console.log('密码：', this.password, '二维码：', qrcode, "omponent：", omponent);
			//转译成 url格式
			this.text=data.shareUrl
			omponent = encodeURI(omponent);
			this.link = data.shareUrl;
			// if (this.qrcode !== "") {
				
			// 	this.$getQrCodeImage({"qrcodeText": this.qrcode});
			// }
			//当前屏幕亮度
			uni.getScreenBrightness({
				success: function(res) {
					this.currentBrightness = res.value
				}
			});
			//设置屏幕亮度
			uni.setScreenBrightness({
				value: 1,
				success: function() {
					console.log('设置亮度成功');
				}
			});
		},

		onShow() {
			// this.updateSerivces();
		},
		onUnload() {
			uni.setScreenBrightness({
				value: this.currentBrightness,
				success: function() {
					console.log('设置亮度成功');
				}
			});
		},
		onReady: function(e) {
			// var context = uni.createCanvasContext('firstCanvas')

			// context.setStrokeStyle("#00ff00")
			// context.setLineWidth(5)
			// context.rect(0, 0, 200, 200)
			// context.stroke()
			// context.setStrokeStyle("#ff0000")
			// context.setLineWidth(2)
			// context.moveTo(160, 100)
			// context.arc(100, 100, 60, 0, 2 * Math.PI, true)
			// context.moveTo(140, 100)
			// context.arc(100, 100, 40, 0, Math.PI, false)
			// context.moveTo(85, 80)
			// context.arc(80, 80, 5, 0, 2 * Math.PI, true)
			// context.moveTo(125, 80)
			// context.arc(120, 80, 5, 0, 2 * Math.PI, true)
			// context.stroke()
			// context.draw()
		},
		canvasIdErrorCallback: function(e) {
			console.error(e.detail.errMsg)
		},
		methods: {
			// 更新分享服务
			updateSerivces() {
				// this.$showToast('微信1');
				var _this = this;
				plus.share.getServices(function(s) {
					shares = {};
					this.$showToast('微信111');
					for (var i in s) {
						var t = s[i];
						shares[t.id] = t;
					}
					sweixin = shares['weixin'];
					_this.$showToast('微信' + JSON.stringify(sweixin), undefined, 10000);
				}, function(e) {
					_this.$showToast('获取分享服务列表失败：' + e.message);
				});
			},

			copy() {
				var _this = this;
				var content = decodeURIComponent(this.content) + this.link;
				console.log(this.link)
				console.log("share content", content);
				uni.setClipboardData({
					data: content,
					success: res => {
						uni.hideToast();
						this.$showToast(this.vis["copy-success"] || "复制成功");
					}
				});
			},

			shareSystem() {
				if (!plus.share.sendWithSystem) {
					this.$showToast(this.vis["not-support-share-system"] || "该平台不支持系统分享!");
				} else {
					// 分享内容及链接
					var msg = {
						"content": decodeURIComponent(this.content),
						"href": this.link
					};
					
					if (!this.isAndroid) { //iOS平台添加链接地址
						msg.href = this.link;
					}
					plus.share.sendWithSystem(msg, () => {
						// this.$showToast("分享成功");
					}, (e) => {
						this.$showToast((this.vis["share-fail"] || "分享失败:") + JSON.stringify(e.code));
					});
					
					// 分享二维码
					// this.$getQrCodeImage({"canvasId": "shareImageCanvas", "qrcodeText": this.qrcode, "text": this.password}).then((qrcodeImagePath) => {
					// 	let msg = {
					// 		"pictures": [qrcodeImagePath]
					// 	};
					// 	plus.share.sendWithSystem(msg, () => {
					// 		// this.$showToast("分享成功");
					// 	}, (e) => {
					// 		this.$showToast((this.vis["share-fail"] || "分享失败:") + JSON.stringify(e.code));
					// 	});
					// });
				}
			},
			
			toWechat() {
				var content = decodeURIComponent(this.content);
				var msg = {
					"type": "text",
					"content": content,
					"extra": {
						"scene": "WXSceneSession"
					}
				}
				this.$showToast("正在分享微信!");
				var _this = this;
				if (!sweixin) {
					this.$showToast("无效的分享服务!");
				} else if (sweixin.authenticated) {
					sweixin.send(msg, function() {
						_this.$showToast('分享到"' + sweixin.description + '"成功！');
					}, function(e) {
						_this.$showToast('分享到"' + sweixin.description + '"失败: ' + JSON.stringify(e));
					});
				} else {
					sweixin.authorize(function() {
						sweixin.send(msg, function() {
							_this.$showToast('分享到"' + sweixin.description + '"成功！');
						}, function(e) {
							_this.$showToast('分享到"' + sweixin.description + '"失败: ' + JSON.stringify(e));
						});
					}, function(e) {
						_this.$showToast('认证授权失败：' + JSON.stringify(e));
					});
				}
			},


			toQQ() {
				var content = decodeURIComponent(this.content);
				uni.share({
					provider: "qq",
					scene: "qq",
					title: "访客密码",
					type: 1,
					summary: content,
					success: function(res) {
						console.log("success:" + JSON.stringify(res));
					},
					fail: function(err) {
						console.log("fail:" + JSON.stringify(err));
					}
				});
			},

			//发送短信
			toMessage() {
				var msg = plus.messaging.createMessage(plus.messaging.TYPE_SMS);
				msg.body = decodeURIComponent(this.content);
				plus.messaging.sendMessage(msg);
			}
		}
	}
</script>
<style>
	page {
		display: flex;
		/* min-height: 100vh; */
		background: #f1f2f3;
	}
</style>
<style>
	view,
	text {
		box-sizing: content-box;
	}
	.content {
		width: 750upx;
	}
	.content {
		display: flex;
		flex: 1;
		flex-direction: column;
		margin: 20upx 0;
		width: 100%;
	}
	.password-area {
		/* position: absolute; */
		background-color: #FFFFFF;
		width: 100%;
		height:580upx;
		text-align: center;
		vertical-align: center;
		margin: 0 auto;
		padding: 50upx 0;
		font-size: 40upx;
	}
	.visitInfo {
		line-height: 40upx;
		border-top: 1px solid #F1F2F3;
		color: #666666;
		background-color: #FFFFFF;
	}
	
	/* 
	.er_code {
		width: 360upx;
		height: 360upx;
		margin: 0 auto;
	} */
	
	.share-btn {
		width: 100%;
		top: 600upx;
		padding: 10upx;
		background-color: #FFFFFF;
		padding-bottom: 52upx;
		display: flex;
		justify-content: center;
	}
	
	.share-text {
		margin-top: 20upx;
		padding: 28upx 0upx 34upx 28upx;
		font-size: 30upx;
		font-weight: bold;
		color: #333333;
		line-height: 40upx;
		background-color: #FFFFFF;
	}
	
	.btn-hover {
		background: #B4AEB5;
	}
	
	/* #ifdef MP-WEIXIN || MP-ALIPAY */
	.btn {
		float: left;
		text-align: center
	}
	
	/* #endif */
	
	/* #ifdef APP-PLUS || H5 */
	.btn {
		float: left;
		width: 25%;
		text-align: center;
	}
	
	/* #endif */
	
	.btn image {
		width: 100upx;
		height: 100upx;
	}
	
	.btn button {
		font-size: 32upx;
		background-color: transparent;
		border: none;
		border-style: none;
		width: 100upx;
		height: 100upx;
		padding: 0;
		border-width: 0upx;
	}
	
	.btn button:after {
		border: none;
	}
	.time_color{
		font-size: 36upx;
		color: red;
	}
</style>
