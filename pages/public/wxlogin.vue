<template>        
            <view>
                <view class='header'>
                    <!-- <image src='../../static/wxhead.png'></image> -->
                </view>
                <view class='content'>
                    <view>申请获取以下权限</view>
                    <text>获得你的公开信息(昵称，头像、地区等)</text>
                </view>

                <button class='bottom' type='primary' open-type="getUserInfo" withCredentials="true" lang="zh_CN" @getuserinfo="wxGetUserInfo">
                    授权绑定
                </button>
           
        </view>   
</template>

<script>
    export default {
        data() {
            return {
                SessionKey: '',
                OpenId: '',
                nickName: null,
                avatarUrl: null,
                isCanUse: uni.getStorageSync('isCanUse')||true//默认为true
            };
        },
        methods: {
            //第一授权获取用户信息===》按钮触发
            wxGetUserInfo() {
                let _this = this;
                uni.getUserInfo({
                    provider: 'weixin',
                    success: function(infoRes) {
						console.log(infoRes);
                        let nickName = infoRes.userInfo.nickName; //昵称
                        let avatarUrl = infoRes.userInfo.avatarUrl; //头像
						uni.setStorage({
							key: "wxnickname",
							data:nickName
						});
						uni.setStorage({
							key: "wxhead",
							data: avatarUrl
						})
						uni.login({
						    provider: 'weixin',
						    success: function(loginRes) {
								console.log(loginRes);
						        let code = loginRes.code;	
								console.log(code)
								uni.switchTab({
									url: '/pages/user/user'
								});	
								    																			 
						    //     uni.request({
						    //     	url: 'https://lskx.abillchen.top/mnsc/wxLogin',
						    //     	header: {
						    //     		'content-type': 'application/x-www-form-urlencoded' //自定义请求头信息
						    //     	},
						    //     	data: JSON.stringify({
						    //     		code: code,
						    //     	}),
						    //     	method: 'post',
						    //     	success: (res) => {                     		
										// uni.setStorage({
										// 	key: "openid",
										// 	data: res.data.para.userid
										// })
						    //     		uni.switchTab({
						    //     			url: '/pages/index/index'
						    //     		});
										
						    //     	}
						    //     });
						    },
						});					  
                    },
                    fail(res) {
						console.log("拒绝授权");
					}
                });
            },

　　　　　
               
         //向后台更新信息
            updateUserInfo() {
                let _this = this;
                uni.request({
                    url:'url' ,//服务器端地址
                    data: {
                        appKey: this.$store.state.appKey,
                        customerId: _this.customerId,
                        nickName: _this.nickName,
                        headUrl: _this.avatarUrl
                    },
                    method: 'POST',
                    header: {
                        'content-type': 'application/json'
                    },
                    success: (res) => {
                        if (res.data.state == "success") {
                            uni.reLaunch({//信息更新成功后跳转到小程序首页
                                url: '/pages/index/index'
                            });
                        }
                    }
                   
                });
            }
        },
        onLoad() {//默认加载
           
        }
    }
</script>

<style lang='scss'>
    .header {
        margin: 90rpx 0 90rpx 50rpx;
        border-bottom: 1px solid #ccc;
        text-align: center;
        width: 650rpx;
        height: 300rpx;
        line-height: 450rpx;
    }

    .header image {
        width: 200rpx;
        height: 200rpx;
    }

    .content {
        margin-left: 50rpx;
        margin-bottom: 90rpx;
    }

    .content text {
        display: block;
        color: #9d9d9d;
        margin-top: 40rpx;
    }

    .bottom {
        border-radius: 80rpx;
        margin: 70rpx 50rpx;
        font-size: 35rpx;
    }
</style>