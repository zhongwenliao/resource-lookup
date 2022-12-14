// .env.js 文件
// 不同环境访问不同的路径
// import store from '@/common/store/index'

//登录接口
const ENV_LOGIN_URL = {
	development: 'http://www.api.dev.nccnt.com/', //开发环境
	production: 'http://www.api.nccnt.com/', //生产环境
	
}

//项目接口
const ENV_API_URL = {
	development: 'http://lterzs5pko.xuduan.vip', //开发环境
	production: 'http://119.91.205.37:7070', //测试环境
	production2: 'http://api.yuanzhoulvwego.com', //正式环境
}

//图片上传
const IMG_UPLOAD_URL = {
	development: 'http://lterzs5pko.xuduan.vip', //开发环境
	// development: 'http://119.91.205.37:7070', 
	// production: 'http://119.91.205.37:7070', //测试环境
	production2: 'http://api.yuanzhoulvwego.com', //正式环境
}
//高德地图
const GAODE_URL ='https://restapi.amap.com/';

// process.env.NODE_ENV
export const LOGIN_URL = ENV_LOGIN_URL['production2']; //后台根域名
export const API_URL = ENV_API_URL['production2']; //后台接口域名
export const MAP_URL = GAODE_URL; //地图接口
export const IMG_URL = IMG_UPLOAD_URL['production2']; //图片上传接口

const dev_Config = {
	"?baseUrl": "服务器接口请求基础路径",
	"baseUrl": "https://app-api.thinmoo.com",
	"?h5Link": "H5链接",
	"h5Link": "https://mobile.doormaster.me/#/",
	"?appId": "服务器接口请求所需的appId",
	"appId": "54a4210c2e2b4116b3b67d9b72d8660e",
	"?appSecret": "服务器接口请求所需的appSecret",
	"appSecret": "1d559bc993d550af5d6b6291ed2ae296",
	"?logo": "APP的logo",
	"logo": "/static/img/logo.png",
	"?email": "制作APP的公司邮箱",
	"email": "admin@intelligoo.com",
	"?company": "制作APP的公司名称",
	"company": "thinmoo",
	"?appName": "APP名称",
	"appName": "daguanjia",
	"envType": 3,
	"?appVersion": "APP版本",
	"appVersion": "4.4.150",
	"?wxAppId": "微信分享appid",
	"wxAppId": "wx0ec28a3821bc1d40",
	"?wxSecret": "微信分享wxSecret",
	"wxSecret": "646bf7fabbf8e2231ec9f7371de9d9f6",
	"?isDebug": "是否调试模式",
	"isDebug": true,
	"?ifNeedID": "房屋认证和添加成员时需要填写身份证",
	"ifNeedID": false,
	"?tabbarNum": "tabbar个数，动态计算覆盖商城tabbar原生控件",
	"tabbarNum": 5,
	"?mallTabbarIndex": "商城tabbar索引，动态计算覆盖商城tabbar原生控件，当值为-1，表明没有商城tabbar",
	"mallTabbarIndex": -1,
	"?wxMiniAppId": "微信小程序appid",
	"wxMiniAppId": "wxa2633054510b77c4",
	"?ifAddWxLogin": "是否需要微信一键登录",
	"ifAddWxLogin": true,
	"wxPushTemplateId": "一次性订阅",
	"wxPushTemplateId":["PL85edNJuox_JPghBTVRlFeQikZKXFVLto04mLPPcyI",
	"fmcjaWqB5PgACDHdivfzRxRslSJsLaHK4TCfb-5Nubg",
	"AfdHKD56ItVuXWPiSVUEq8ewMThhtZ5IA7nLsz4sAUg"
	],
	"?subscriptionTemplateId": "长期订阅和一次性订阅不能混合在tmplIds数组里",
	"subscriptionTemplateId": ["PEzbT-XeLyQkAyWbOZW89qDQMV9J6o6fBiGYlY_W7s0",
	"H6fThzHZ4CY31yKRLTmWCTDOXqJjYhKV63X_mTK0mHE"],
	"?monthCarTemplateId": "一次性订阅",
	"monthCarTemplateId": ["PFa5KoZl8lP170rLIkqltkzbOj8ZrjacF6Hc4vrvM_g"],
	"?visSuccessTemplateId": "访客预约一次性订阅",
	"visSuccessTemplateId": ["wcG9z-3a8_rvMeelPrzDu5T9Of0ngJ9tUYfYkAQHaKo","oLJZ7_pfYF82BGnQwj70yQBUImlmBvQXdcNreYTOjkI"],
	"?isIndependentDeploy": "是否独立部署",
	"isIndependentDeploy": false,
	"?swiperImgList": "轮播图配置，size为710*400，三张",
	"swiperImgList": ["http://www.thinmoo.com/wp-content/uploads/2019/12/swiper_1_160.jpg",
		"http://www.thinmoo.com/wp-content/uploads/2019/12/swiper_2_160.jpg",
		"http://www.thinmoo.com/wp-content/uploads/2019/12/swiper_3_160.jpg"
	],
	"?ifWithAds": "是否有广告,默认为false", 
	"ifWithAds": true,
	"?adpid": "app的广告位id，现用于新闻详情页面",
	"adpid": "1237718945",
	"?bannerAdpid": "app的广告位id，现用于banner广告",
	"bannerAdpid": "1908555822",
	"?pointAdpid": "领取积分页面广告位Id",
	"pointAdpid": "1328389457",
	"?newsListAdpid": "新闻列表页面APP广告位id",
	"newsListAdpid": "1947361698",
	"?openDoorAdpid": "开门成功APP插屏广告位id",
	"openDoorAdpid": "1493639995",
	"?openDoorAdpid": "开门成功APP信息流广告id",
	"openDoorAdpid": "1745465807",
	"?swiperHeight": "顶部轮播图高度",
	"swiperHeight": 160,
	"iotIPAddress": "106.52.94.106",
	"?TIMSDKAPPID": "腾讯即时通讯TIM SDKAPPID",
	"TIMSDKAPPID": 1400432821,
	"?TIMSECRET": "腾讯即时通讯TIM SECRET",
	"TIMSECRET": "5c7e068f9c7f19a64adc81f9bf2dd8119c62a010429f94466ecbf154562140ae",
	"?chatTabbarIndex": "群聊tabbar索引，其值大于-1，如果为-1，表明没有群聊tabbar",
	"chatTabbarIndex": 2,
	"?notIndependentDeployMineTabbarIndex": "非独立部署下APP中我的tabbar索引，即总的tabbar数 - 1",
	"notIndependentDeployMineTabbarIndex": 4,
	"?supportLanguageList": "该APP支持的语言列表：德语、英语、西班牙语、法语、葡萄牙语、俄语、泰语、中文简体、中文繁体",
	"supportLanguageList": ["de-DE", "en-US", "es-ES", "fr-FR", "pt-PT", "ru-RU", "th-TH", "zh-CN", "zh-TW", "el-GR", "ja-JP", "it-IT", "he"],
	"?defaultLanguage": "默认语言",
	"defaultLanguage": "zh-CN",
	"?encryptedKey": "加密的key",
	"encryptedKey": "1f537a5e52f0%@#c08d5051#!3060169",
	"?appEncryptedLowestVersion": "app登录加密最低版本号",
	"appEncryptedLowestVersion": "4.3.124",
	"?vphoneServerIp": "音视频服务器登录IP",
	"vphoneServerIp": "114.55.106.95",
	"?vphoneServerPort": "音视频服务器登录端口",
	"vphoneServerPort": "55060",
	"tabbarList": ["community", "good-discount", "nearby-discount", "neighborhood", "mine"]
}
export const devConfig = dev_Config;