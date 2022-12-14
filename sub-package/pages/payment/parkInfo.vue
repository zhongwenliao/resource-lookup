<template>
    <!--缴费详情 整体盒子-->
    <view class="pyDetails_main">
        <h3 style="margin: 0px; margin-top: 10%; color: #2d2d2d;text-align: center;"><span>坂田停车场</span></h3>
        <p style="color: #4e7066">停车费用：</p>
        <h1 style="margin: 0px;text-align: center;">
            <span style="margin: 0px; color: #03392b; font-size: 53px">￥10.00</span>
            <span style="font-size: 15px">元</span>
        </h1>
        <p style="color: #898989; margin: 0px; font-size: 15px">在规定时间内，无需缴费！</p>

        <view class="pyDetailsCenter">
            <!--车辆信息-->
            <table :style="{ background: clor }">
                <tr>
                    <td>停车费用:</td>
                    <td>￥1.00</td>
                </tr>
                <tr>
                    <td>入场时间:</td>
                    <td>2021-09-10 10:29:10</td>
                </tr>
                <tr>
                    <td>车牌号码:</td>
                    <td>粤BQ9999</td>
                </tr>
                <tr>
                    <td>停车时长：</td>
                    <td>2小时</td>
                </tr>
                <tr>
                    <td>车辆类型：</td>
                    <td>临时车</td>
                </tr>
            </table>

            <!-- 优惠券选择 -->
            <!-- <van-cell is-link style="margin-top: 10px;" v-if="couponList.length != 0" @click="() => show = true">
                停车券
                <span style="float: right;">{{radio == -1 ? "请选择" : ("-" + disFee) }}</span>
            </van-cell> -->
            <!-- <van-popup v-model="show" position="bottom" :style="{ height: 'auto', width: '90%', left: '0', padding: '5%' }">
                <van-radio-group v-model="radio" @change="radiochange">
                    <van-radio v-for="(item, index) in couponList" :key="index" :name="index" checked-color="rgb(89, 166, 148)"
                               :disabled="item.coupon.isInvaild == 1" @click="clickCoupon(index)">
                        <view class="dislist clear">
                            <view class="dis-left">
                                <view class="money" v-if="item.coupon.disType == 1">￥{{ item.coupon.disAmont }}</view>
                                <view class="money" v-else-if="item.coupon.disType == 2">{{ item.coupon.disRate }}折</view>
                                <view class="money" v-else-if="item.coupon.disType == 3">{{item.coupon.disTimeSec/60/60}}小时</view>
                                <view class="template-id">模板ID：{{ item.coupon.templateId }}</view>

                            </view>
                            <view class="dis-right">
                                <view class="park" v-if="item.coupon.disType == 1">金额代金券</view>
                                <view class="park" v-else-if="item.coupon.disType == 2">折扣代金券</view>
                                <view class="park" v-else-if="item.coupon.disType == 3">时间代金券</view>
                                <view class="park" v-else>全额代金券</view>
                                <view class="plate-number">车牌号：{{ item.coupon.owner }}</view>
                                <view class="time" v-if="item.coupon.invaildTime">有效期：{{ item.coupon.invaildTime }}</view>
                                <view class="time" v-else>有效期：永久</view>
                            </view>
                            <view class="use-type" v-if="item.coupon.couponUseType == 1">仅限一次使用</view>
                            <view class="use-type" v-else-if="item.coupon.couponUseType == 2">可多次使用</view>
                        </view>
                    </van-radio>
                </van-radio-group>
            </van-popup> -->
            <!-- 合计 -->
            <p style="text-align: right;font-size: 17px;border-bottom: 1px solid #eee;padding-bottom: 10px;margin: 20px;margin-top: 10px;">合计：10元</p>
            <!--车辆信息 end-->
            <p class="pyInfo">
                <!-- <van-icon name="info" color="#03392C" @click="dialog"/> -->
                请于付款后
                <span style="display: contents">3</span>
                分钟内离场，超时将加收停车费
            </p>
        </view>
        <button class="payBtn" color="#59A694" @click="payUp">支付</button>
        <!--支付方式-->
        <!-- <van-popup v-model="payboxShow" round position="bottom" :style="{ height: '24%' }" @close="close">
            <ul>
                <view v-for="(supportPay,index) in this.getSupportPay">
                    <li v-if="supportPay.supportPay== 1&&ua.indexOf('micromessenger') != -1" @click="selectPay(supportPay)">
                    </li>
                    <li v-if="supportPay.supportPay== 2&&ua.indexOf('alipayclient') != -1" @click="selectPay(supportPay)">
                    </li>
                </view>
                <li v-if="!this.getSupportPay" style="text-align: center;width: 100%;">不支持任何支付</li>
            </ul>
            <p style="margin: 3% 0px" @click="payboxShow = false">取消</p>
        </van-popup> -->
        <!--支付方式 弹框end-->
    </view>
    <!--缴费详情 整体盒子 end-->
</template>

<script>
    // import {Dialog} from 'vant';
    // import alipayjsapi from '@/common/alipayjsapi.min.js';

    export default {
        name: 'logout',
        data() {
            return {
                onLine: navigator.onLine, //当前网络是否在线
                payboxShow: false, //支付方式弹出框
                payableMoney: '', //应缴费用
                accessToken: null, //应缴费用
                clor: 'none', //信息盒子背景颜色
                communityId: '', //小区id
                supportPayList: [],
                urlData: '', //网址带的参数
                selectSupportPay: null, //选择的支付对象
                payScene: '', //1 为设备码 2 场内码
                //获取微信授权
                radio: -1,
                disFee: 0.00,
                show: false,
                ua: "",
                payable: "",
                parkingDuration: "",
                disObj: {
                    1: ["disAmont", "金额代金券", "￥"],
                    2: ["disRate", "折扣代金券", ""],
                    3: ["disTimeSec", "时间代金券", ""],
                    4: ["disAmontLimit", "全额代金券", ""]
                },
                getCarOut :null,
                radioChange: false, // 判断单选的状态有没有变化
                couponIds: undefined
            };
        },

        created() {
            // 如果是微信浏览器扫码的话
            // this.ua = navigator.userAgent.toLowerCase();
            // this.parkset = sessionStorage.getItem('parkset') && JSON.parse(sessionStorage.getItem('parkset')); //停车场设置
            // this.parkInfo = sessionStorage.getItem('parkInfo') && JSON.parse(sessionStorage.getItem('parkInfo')); //停车场信息
            // this.getCarOut = sessionStorage.getItem('getCarOut') && JSON.parse(sessionStorage.getItem('getCarOut')); //场内码停车信息
            // this.getSupportPay = sessionStorage.getItem('getSupportPay') && JSON.parse(sessionStorage.getItem('getSupportPay')); //支持的支付
            // this.urlData = sessionStorage.getItem('urlData') && JSON.parse(sessionStorage.getItem('urlData')); //扫码进来后所带的数据
            // this.accessToken = sessionStorage.getItem('accessToken') && JSON.parse(sessionStorage.getItem('accessToken')); //扫码进来后所带的数据
            // this.communityId = this.urlData.communityId;
            // this.payScene = this.urlData.scene;
            // this.couponList = !this.getCarOut.coupons?[]:this.getCarOut.coupons; //优惠券列表

            //微信会回跳，看不到请求，所以打印下
            // console.log("停车信息", this.getCarOut);

            // if (parseInt(this.getCarOut.parkFee) == 0) {
            //     this.clor = '#07c16014';
            // } else {
            //     this.clor = 'none';
            // }

            // var supportPayList = [];
            // //将支持的类型遍历出来
            // this.getSupportPay.map(item => {
            //     supportPayList.push(item.supportPay);
            // });
            // this.supportPayList = supportPayList;

        },
        mounted() {

            // this.getCarOutParkInfoByCarNo();
            // window.addEventListener('popstate', function (event) {
            //     return
            // },false);
        },
        // beforeDestroy() {
        //     window.removeEventListener('offline', this.updateOnlineStatus); //销毁当前网络事件
        //     window.removeEventListener('popstate', this.updateOnlineStatus); //销毁当前网络事件
        // },
        methods: {
            // radiochange(e) {
            //     this.show = false;
            //     this.radio = e;
            //     if (e !== -1) {
            //         this.couponIds = this.couponList[e]["coupon"].id;
            //     } else {
            //         this.couponIds = undefined;
            //     }
            //     // this.getCarOutParkInfoByCarNo();
            //     this.radioChange = true;
            // },
            // clickCoupon(index) {
            //     if (!this.radioChange) {
            //         this.radio = -1;
            //     }
            //     this.radioChange = false;
            // },
            // 获取优惠券列表
            // getCarOutParkInfoByCarNo() {
            //     this.$http
            //         .post('/parkInfo/h5/getCarOutParkInfoByCarNo', {
            //             carNo: this.getCarOut.carNo, //车牌号
            //             communityId: this.communityId,
            //             couponIds:  this.couponIds,
            //         })
            //         .then(res => {
            //             if (res.data.code == 0) {
            //                 this.disFee = 0;
            //                 for (let coupon of res.data.data.coupons) {
            //                     if(!!coupon.disFee){
            //                         this.disFee = this.disFee + parseFloat(coupon.disFee);
            //                     }

            //                 }

            //                 this.couponList = res.data.data.coupons;
            //                 this.couponList.forEach(item => {
            //                     if (item.coupon.disRate > 0) {
            //                         item.coupon.disRate = item.coupon.disRate * 10
            //                     } else if (item.coupon.disRate == 1) {
            //                         item.coupon.disRate = 10
            //                     }
            //                 })

            //                 this.getCarOut = res.data.data;
            //                 sessionStorage.setItem('getCarOut',JSON.stringify(res.data.data));

            //             }
            //         });
            // },

            //判断网络是否在线
            // updateOnlineStatus(e) {
            //     const {type} = e;
            //     this.onLine = type === 'online';
            //     this.$router.push('/park/networkError');
            // },
            //关闭支付方式后
            // close() {
            //     this.payboxShow = false;
            //     this.clor = 'none';
            // },
            //点击支付按钮
            // payUp() {
            //     if (this.getCarOut.payFee == 0) {
            //         this.payByCarNo();
            //     } else {
            //         this.payboxShow = true;
            //         this.clor = '#07c16014';
            //     }
            // },
            //选择支付方式
            // selectPay(supportPay) {
            //     this.selectSupportPay = supportPay;
            //     this.payByCarNo();
            // },

            //停车场-根据车牌号获取支付信息  获取微信支付所需要的信息
            // payByCarNo() {
            //     var _this = this; //定义this指向
            //     //将指定支付类型遍历出来
            //     console.log("AccessToken", this.accessToken);
            //     let requstData = {
            //         accessToken: '', //访问令牌
            //         accessCommunityId: '',
            //         communityId: _this.communityId, //	小区Id
            //         carNo: _this.getCarOut.parkInParkRecord.carNo, //车牌号
            //         payScene: _this.payScene, //	支付场景 场内码支付 ：1 设备码支付 ： 2 APP预交费 : 3
            //         payType: !_this.selectSupportPay ? undefined : _this.selectSupportPay.supportPay, //	指定支付类型
            //         payPlat: !_this.selectSupportPay ? undefined : _this.selectSupportPay.payPlat, //	 指定 支付平台
            //         openId: this.accessToken.openid,
            //         aliUserId: this.accessToken.userId,
            //         couponIds: this.couponIds,
            //     };
            //     console.log("请求参数", requstData);
            //     _this.$http
            //         .post('/parkInfo/h5/payByCarNo', requstData)
            //         .then(res => {
            //             if (res.data.code == 0) {
            //                 this.invoke = res.data.data;
            //                 if (this.invoke.businessCode == 2000) {
            //                     //这种情况是 优惠券直接减到了 0元 直接支付成功了
            //                     this.$router.push("/park/paySuccess"); //去往支付成功页面
            //                     return;
            //                 } else {
            //                     console.log("当前选择的支付", this.selectSupportPay)
            //                     if (this.selectSupportPay.supportPay == 1) {
            //                         console.log("进入微信支付")
            //                         this.onBridgeReady();
            //                     } else if (this.selectSupportPay.supportPay == 2) {
            //                         console.log("进入支付宝支付")
            //                         this.aliPay();
            //                     } else {
            //                         console.log("未匹配到支付")
            //                     }
            //                 }
            //             } else {
            //                 console.log("获取支付参数失败")
            //             }
            //         });
            // },
            // aliPay() {
            //     var _this = this;
            //     console.log("发起支付参数", this.invoke);
            //     alipayjsapi.tradePay({
            //         tradeNO: this.invoke.payParam.tradeNo
            //     }, function (res) {
            //         console.log("支付宝支付结果", res);
            //         if (res.resultCode == 9000) {
            //             _this.paySuccess();
            //         } else if (res.resultCode == 6001 || res.resultCode == 99) {
            //             _this.$toast({
            //                 message: '取消支付',
            //                 duration: 2000
            //             });
            //         } else {
            //             //支付失败的操作
            //             _this.$toast({
            //                 message: '支付失败',
            //                 duration: 2000
            //             });
            //         }
            //     });
            // },
            //微信支付api
            //解决微信内置对象报错
            //微信内置浏览器类，weChatParameter对象中的参数是
            // onBridgeReady() {
            //     var _this = this;
            //     WeixinJSBridge.invoke(
            //         'getBrandWCPayRequest',
            //         {
            //             timeStamp: this.invoke.payParam.timeStamp,
            //             signType: this.invoke.payParam.signType,
            //             package: this.invoke.payParam.package,
            //             paySign: this.invoke.payParam.paySign,
            //             nonceStr: this.invoke.payParam.nonceStr,
            //             appId: this.invoke.payParam.appId
            //         },
            //         function (res) {
            //             console.log("微信支付结果", res);
            //             var temp = res.err_msg;
            //             if (temp.indexOf('ok') > -1) {
            //                 _this.paySuccess();
            //             } else if (res.err_msg == 'get_brand_wcpay_request:cancel') {
            //                 //取消支付的操作
            //                 _this.$toast({
            //                     message: '取消支付',
            //                     duration: 2000
            //                 });
            //             } else {
            //                 //支付失败的操作
            //                 _this.$toast({
            //                     message: '支付失败',
            //                     duration: 2000
            //                 });
            //             }
            //         }
            //     );
            //     if (typeof WeixinJSBridge == 'undefined') {
            //         if (document.addEventListener) {
            //             document.addEventListener('WeixinJSBridgeReady', _this.onBridgeReady(params), false);
            //         } else if (document.attachEvent) {
            //             document.attachEvent('WeixinJSBridgeReady', _this.onBridgeReady(params));
            //             document.attachEvent('onWeixinJSBridgeReady', _this.onBridgeReady(params));
            //         }
            //     } else {
            //         // _this.onBridgeReady();
            //     }
            // },
            // paySuccess() {
            //     this.$router.push("/park/paySuccess"); //去往支付成功页面
            //     return;
            // },
            // dialog() {
            //     Dialog.alert({
            //         title: '超时收费规则',
            //         message: '支付订单后' + this.parkset.payFreeMin + '分钟末出场,出场费用将重新计算,需要补缴,请及时出场。',
            //         confirmButtonColor: '#376156',
            //         confirmButtonText: '确定'
            //     }).then(() => {
            //         // on close
            //     });
            // }
        }
    };
</script>

<style lang="scss">
    // 清除浮动
    .clear::before,
    .clear::after {
        content: '';
        display: block;
        clear: both;
    }

    .dislist {
        background: rgb(228, 228, 228);
        border-radius: 10px;
        padding: 10px 0;
        position: relative;
    }

    .dislist .dis-left {
        float: left;
        width: 35%;
        text-align: center;
    }

    .dis-left .money {
        font-size: 23px;
        // color: rgb(255, 102, 51);
        color: #59a694;
        font-weight: bolder;
        line-height: 35px;
    }

    .dis-left .money img {
        width: 45px;
        height: 45px;
        margin-bottom: -10px;
        opacity: 0.6;
    }

    .dis-left .template-id,
    .dis-left .num {
        font-size: 15px;
        color: #aaa;
        line-height: 10px;
    }

    .dis-right {
        width: 60%;
        float: left;
        text-align: left;
    }

    .dis-right .park {
        font-size: 18px;
        color: #088b68;
    }

    .dis-right .plate-number,
    .dis-right .time {
        font-size: 15px;
        color: #aaa;
        line-height: 20px;
    }

    .dislist .use-type {
        font-size: 16px;
        color: #aaa;
        position: absolute;
        right: 10px;
        top: 30px;
    }

    .dislist .used-img {
        width: 45px;
        height: 45px;
        position: absolute;
        right: 20px;
        top: 17px;
    }

    .dislist .lose-img {
        width: 45px;
        height: 45px;
        position: absolute;
        right: 20px;
        top: 20px;
    }

    .van-radio__label {
        display: block;
        width: 90%;
        margin-left: 0;
    }

    .van-radio-group {
        position: relative;
    }

    .van-radio__icon {
        position: absolute;
        right: 0;
    }

    .van-radio {
        margin-bottom: 15px;
    }

    .pyDetails_main {
		width: 100%;
        padding: 0px 15px;
    }

    .pyDetailsCenter {
        margin: 6% 0px;
    }

    .pyDetailsCenter table {
        padding: 0px;
        margin: 0px;
        width: 100%;
        border-radius: 5px;
        color: #656767;
        padding: 7% 5%;
        font-size: 17px;
        box-shadow: 0 0px 2px 2px #e9eae9;
    }

    .pyDetailsCenter table tr {
        line-height: 25px;
    }

    .pyDetailsCenter table tr > td:nth-child(1) {
        text-align: left;
    }

    .pyDetailsCenter table tr > td:nth-child(2) {
        text-align: right;
    }

    .pyInfo {
        font-size: 15.5px;
        text-align: left;
        color: #898989;
        display: flex;
    }

    .pyInfo i {
        margin: auto 0;
        margin-right: 5px;
    }

    /*支付按钮*/
    .pyDetails_main button {
        width: 80%;
        font-size: 18px;
        border-radius: 5px;
        margin-top: 5%;
		height: 88upx;
		line-height: 88upx;
		background: linear-gradient(118deg, #01dca3 0%, #088b68 100%);
		box-shadow: 0px 6px 16px rgba(27, 162, 51, 0.3);
		border-radius: 50upx 50upx 50upx 50upx;
		color: #ffffff;
    }

    /*支付方式弹框*/
    .van-overlay {
        background-color: #48474778;
        opacity: 0.7;
    }

    .van-popup {
        width: 96%;
        left: 2%;
    }

    .van-popup ul {
        margin: 0 10px;
        display: flex;
        border: 1px solid #acacac;
        padding: 7% 0px;
        border-left: 0px;
        border-top: 0px;
        border-right: 0px;
    }

    .van-popup li {
        margin: 0px 4%;
    }

    .van-popup li img {
        width: 3.5rem;
        height: 3.5rem;
    }

    @media screen and (max-width: 380px) and (min-width: 326px) {
        .van-popup ul {
            padding: 5% 0px;
        }
    }

    @media screen and (max-width: 325px) {
        .van-popup ul {
            padding: 5% 0px;
        }
        .van-popup li img {
            width: 2.5rem;
            height: 2.5rem;
        }
    }
</style>
