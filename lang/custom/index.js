import Vue from 'vue'
import VueI18n from 'vue-i18n'
import zhCN from './zh-CN'
// let zhCN = require("http://oss.thinmoo.com/prod/zh-CN.js");
// #ifndef MP-WEIXIN || MP-ALIPAY
import enUS from './en-US'
import zhTW from './zh-TW'
import zhHK from './zh-TW'
import esES from './es-ES'
import ptPT from './pt-PT'
import deDE from './de-DE'
import frFR from './fr-FR'
import ruRU from './ru-RU'
import thTH from './th-TH'
import elGR from './el-GR'
import jaJP from './ja-JP'
import itIT from './it-IT'

import he from './he'
import iw from './he'
import hecn from './he'
import heIL from './he'
// #endif
import appConfig from './app-config'
// import arEG from './ar_EG.js'
Vue.use(VueI18n);
const i18n = new VueI18n({
    locale: "zh-CN",
    messages: {
        "zh-CN": Object.assign(zhCN, appConfig), // 中文简体
		// #ifndef MP-WEIXIN || MP-ALIPAY
		"de-DE": Object.assign(deDE, appConfig),  // 德语
		"el-GR": Object.assign(elGR, appConfig),  // 希腊语
        "en-US": Object.assign(enUS, appConfig),  // 英语
		"es-ES": Object.assign(esES, appConfig), // 西班牙语
		"fr-FR": Object.assign(frFR, appConfig), // 法语
		"it-IT": Object.assign(itIT, appConfig), // 意大利语
		"ja-JP": Object.assign(jaJP, appConfig),  // 日语
		"pt-PT": Object.assign(ptPT, appConfig), // 葡萄牙语
		"ru-RU": Object.assign(ruRU, appConfig),  // 俄罗斯语
		"th-TH": Object.assign(thTH, appConfig),   // 泰语
		"zh-TW": Object.assign(zhTW, appConfig), // 中文繁体
		"zh-HK": Object.assign(zhTW, appConfig), // 中文繁体
		"he": Object.assign(he, appConfig), // 希伯来语 -以色列
		"iw": Object.assign(iw, appConfig), // 希伯来语 -以色列
		"he_cn": Object.assign(hecn, appConfig), // 希伯来语 -以色列
		"he-IL": Object.assign(heIL, appConfig), // 希伯来语 -以色列
		// #endif
    }
});

export default i18n