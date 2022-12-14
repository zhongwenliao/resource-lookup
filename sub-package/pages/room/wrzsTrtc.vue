<template>
<!-- 在模版上放置标签 -->
<view class="page-room">
  <trtc-room ref="trtc-component" :config="rtcConfig"> </trtc-room>
  <view class="tip-toast" v-if="showTipToast">
    <view>当前房间为1v1双人通话房间</view>
    <view>不希望其他人打扰</view>
  </view>
</view>
</template>

<script>
	
import { genTestUserSig,setData } from "../../../sub-package1/common/js/trtc/GenerateTestUserSig";
import trtcRoom from "../../components/trtc-room/trtc-room";

export default {
  data() {
    return {
      rtcConfig: {
        sdkAppID: '',
        // 必要参数 开通实时音视频服务创建应用后分配的 sdkAppID
        userID: '',
        // 必要参数 用户 ID 可以由您的帐号系统指定
        userSig: '',
        // 必要参数 身份签名，相当于登录密码的作用
        template: '' // 必要参数 组件模版，支持的值 1v1 grid custom ，注意：不支持动态修改, iOS 不支持 pusher 动态渲染
      },
      showTipToast: false
    };
  },

  components: {
    trtcRoom
  },
  props: {},

  /**
   * 生命周期函数--监听页面加载
   * @param {*} options 配置项
   */
  onLoad: function (options) {
	  wx.setKeepScreenOn({
	    keepScreenOn: true
	  }); // 获取 rtcroom 实例
	  this.trtcComponent = this.$refs['trtc-component']; // 监听TRTC Room 关键事件
	  
	  this.bindTRTCRoomEvent(); // 将String 类型的 true false 转换成 boolean
	  
	// 扫码拿到的参数
	let scene = decodeURIComponent(options.scene);
	this.$req.request({
		url: "/devDevice/app/enterTrtcRoomByCommunityId",
		data: {
			communityId: scene,
		},
		isShowLoading: false,
		success: res => {
			let data = res.data;
			this.rtcConfig = {
			  sdkAppID: data.trtcAppId,
			  // 您的实时音视频服务创建应用后分配的 sdkAppID
			  userID: data.appUserId,
			  userSig: data.trtcSign,
			  template: "1v1",
			  beautyLevel: 9, // 默认开启美颜
			  // cloudenv: params.cloudenv, // 非必要参数
			  devSn: "",
			  relayIndex: 1
			};
			console.log("rtcConfig--",this.rtcConfig);
			
			this.setData({
			  rtcConfig: this.rtcConfig
			}, () => {
				this.trtcComponent.enterRoom({
				  roomID: data.trtcRoomId,
				  // roomID: 1129882736,
				  devSn: data.devSn || "",
				  relayIndex: data.relayIndex || 1
				}).then(() => {
				  if (this.template === 'custom') {
					// 设置推流端视窗的坐标和尺寸
					this.trtcComponent.setViewRect({
					  userID: data.appUserId,
					  xAxis: '480rpx',
					  yAxis: '160rpx',
					  width: '240rpx',
					  height: '320rpx'
					});
				  }
				}).catch(res => {
				  console.error('* room joinRoom 进房失败:', res);
				});
			});
		}
	});
    

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('room ready');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('room show');
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('room hide');
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('room unload');
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
  
  methods: {
	setData,
    bindTRTCRoomEvent: function () {
      const TRTC_EVENT = this.trtcComponent.EVENT;
      this.timestamp = []; // 初始化事件订阅

      this.trtcComponent.on(TRTC_EVENT.LOCAL_JOIN, event => {
        console.log('* room LOCAL_JOIN', event); // 进房成功，触发该事件后可以对本地视频和音频进行设置

        if (this.rtcConfig.template === '1v1') {
          this.trtcComponent.publishLocalVideo();
        }

        if (this.rtcConfig.template === '1v1') {
          this.trtcComponent.publishLocalAudio();
        }
      });
      this.trtcComponent.on(TRTC_EVENT.LOCAL_LEAVE, event => {
        console.log('* room LOCAL_LEAVE', event);
      });
      this.trtcComponent.on(TRTC_EVENT.ERROR, event => {
        console.log('* room ERROR', event);
      }); // 远端用户进房

      this.trtcComponent.on(TRTC_EVENT.REMOTE_USER_JOIN, event => {
        console.log('* room REMOTE_USER_JOIN ---  room.vue', event, this.trtcComponent.getRemoteUserList(),this.rtcConfig);
        this.timestamp.push(new Date()); // 1v1视频通话时限制人数为两人的简易逻辑，建议通过后端实现房间人数管理
        // 2人以上同时进行通话请选择网格布局

        if (this.rtcConfig.template === '1v1' && this.rtcConfig.timestamp.length > 1) {
          const interval = this.timestamp[1] - this.timestamp[0];

          if (interval < 1000) {
            // 房间里已经有两个人
            this.setData({
              showTipToast: true
            }, () => {
              setTimeout(() => {
                this.setData({
                  showTipToast: false
                });
                wx.navigateBack({
                  delta: 1
                });
              }, 4000);
            });
          }
        }
      }); // 远端用户退出

      this.trtcComponent.on(TRTC_EVENT.REMOTE_USER_LEAVE, event => {
        console.log('* room REMOTE_USER_LEAVE', event, this.trtcComponent.getRemoteUserList());

        if (this.rtcConfig.template === '1v1') {
          this.timestamp = [];
        }

        if (this.rtcConfig.template === '1v1' && this.remoteUser === event.data.userID) {
          this.remoteUser = null;
        }
      }); // 远端用户推送视频

      this.trtcComponent.on(TRTC_EVENT.REMOTE_VIDEO_ADD, event => {
        console.log('* room REMOTE_VIDEO_ADD', event, this.trtcComponent.getRemoteUserList()); // 订阅视频

        const userList = this.trtcComponent.getRemoteUserList();
        const data = event.data;

        if (this.rtcConfig.template === '1v1' && (!this.remoteUser || this.remoteUser === data.userID)) {
          // 1v1 只订阅第一个远端流
          this.remoteUser = data.userID;
          this.trtcComponent.subscribeRemoteVideo({
            userID: data.userID,
            streamType: data.streamType
          });
        } else if (this.rtcConfig.template === 'grid') {
          this.trtcComponent.subscribeRemoteVideo({
            userID: data.userID,
            streamType: data.streamType
          });
        }

        if (this.rtcConfig.template === 'custom' && data.userID && data.streamType) {
          let index = userList.findIndex(item => {
            return item.userID === data.userID;
          });
          index++;
          const y = 320 * index + 160; // 设置远端视图坐标和尺寸

          this.trtcComponent.setViewRect({
            userID: data.userID,
            streamType: data.streamType,
            xAxis: '480rpx',
            yAxis: y + 'rpx',
            width: '240rpx',
            height: '320rpx'
          });
        }
      }); // 远端用户取消推送视频

      this.trtcComponent.on(TRTC_EVENT.REMOTE_VIDEO_REMOVE, event => {
        console.log('* room REMOTE_VIDEO_REMOVE', event, this.trtcComponent.getRemoteUserList());
      }); // 远端用户推送音频

      this.trtcComponent.on(TRTC_EVENT.REMOTE_AUDIO_ADD, event => {
        console.log('* room REMOTE_AUDIO_ADD', event, this.trtcComponent.getRemoteUserList()); // 订阅音频

        const data = event.data;

        if (this.rtcConfig.template === '1v1' && (!this.remoteUser || this.remoteUser === data.userID)) {
          this.remoteUser = data.userID;
          this.trtcComponent.subscribeRemoteAudio({
            userID: data.userID
          });
        } else if (this.rtcConfig.template === 'grid' || this.rtcConfig.template === 'custom') {
          this.trtcComponent.subscribeRemoteAudio({
            userID: data.userID
          });
        } // 如果不订阅就不会自动播放音频
        // this.trtcComponent.subscribeRemoteAudio({ userID: data.userID })

      }); // 远端用户取消推送音频

      this.trtcComponent.on(TRTC_EVENT.REMOTE_AUDIO_REMOVE, event => {
        console.log('* room REMOTE_AUDIO_REMOVE', event, this.trtcComponent.getRemoteUserList());
      });
    }
  }
};
</script>
<style>
@import "./room.css";
</style>