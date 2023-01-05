import Vue from "vue"
import VueI18n from "vue-i18n"
import zhCN from "./zh-CN"
// 国际化定制(应对不同的APP项目的中文语言翻译, 达管家默认中文定制语言翻译为空，在其他需要定制的项目中如Hallokey需要填写各自项目定制的内容) start
import custom_zhCN from "./custom/zh-CN"
// 国际化定制(应对不同的APP项目的中文语言翻译, 达管家默认中文定制语言翻译为空，在其他需要定制的项目中如Hallokey需要填写各自项目定制的内容) end
// let zhCN = require("http://oss.thinmoo.com/prod/zh-CN.js");
// #ifndef MP-WEIXIN || MP-ALIPAY
import enUS from "./en-US"
import zhTW from "./zh-TW"
// import zhHK from './zh-TW'
import esES from "./es-ES"
import ptPT from "./pt-PT"
import deDE from "./de-DE"
import frFR from "./fr-FR"
import ruRU from "./ru-RU"
import thTH from "./th-TH"
import elGR from "./el-GR"
import jaJP from "./ja-JP"
import itIT from "./it-IT"
import he from "./he"
import iw from "./he"
import hecn from "./he"
import heIL from "./he"

// 国际化定制(应对不同的APP项目的其他语言翻译, 达管家默认其他定制语言翻译为空，在其他需要定制的项目中如Hallokey需要填写各自项目定制的内容) start
import custom_enUS from "./custom/en-US"
import custom_zhTW from "./custom/zh-TW"
// import custom_zhHK from './custom/zh-TW'
import custom_esES from "./custom/es-ES"
import custom_ptPT from "./custom/pt-PT"
import custom_deDE from "./custom/de-DE"
import custom_frFR from "./custom/fr-FR"
import custom_ruRU from "./custom/ru-RU"
import custom_thTH from "./custom/th-TH"
import custom_elGR from "./custom/el-GR"
import custom_jaJP from "./custom/ja-JP"
import custom_itIT from "./custom/it-IT"
import custom_he from "./custom/he"
import custom_iw from "./custom/he"
import custom_hecn from "./custom/he"
import custom_heIL from "./custom/he"
// 国际化定制(应对不同的APP项目的其他语言翻译, 达管家默认其他定制语言翻译为空，在其他需要定制的项目中如Hallokey需要填写各自项目定制的内容) end
// #endif
import appConfig from "./app-config"
// import arEG from './ar_EG.js'
Vue.use(VueI18n)
let _this = Vue.prototype
// 合并达管家默认的中文语言翻译以及其他定制中文语言翻译 start
let total_zhCN = _this.$objectAssign(zhCN, custom_zhCN)
// 合并达管家默认的中文语言翻译以及其他定制中文语言翻译 end

// 合并达管家默认的其他语言翻译以及其他定制语言翻译 start
// #ifndef MP-WEIXIN || MP-ALIPAY
let total_deDE = _this.$objectAssign(deDE, custom_deDE)
let total_elGR = _this.$objectAssign(elGR, custom_elGR)
let total_enUS = _this.$objectAssign(enUS, custom_enUS)
let total_esES = _this.$objectAssign(esES, custom_esES)
let total_frFR = _this.$objectAssign(frFR, custom_frFR)
let total_itIT = _this.$objectAssign(itIT, custom_itIT)
let total_jaJP = _this.$objectAssign(jaJP, custom_jaJP)
let total_ptPT = _this.$objectAssign(ptPT, custom_ptPT)
let total_ruRU = _this.$objectAssign(ruRU, custom_ruRU)
let total_thTH = _this.$objectAssign(thTH, custom_thTH)
let total_zhTW = _this.$objectAssign(zhTW, custom_zhTW)
let total_he = _this.$objectAssign(he, custom_he)
let total_iw = _this.$objectAssign(iw, custom_iw)
let total_hecn = _this.$objectAssign(hecn, custom_hecn)
let total_heIL = _this.$objectAssign(heIL, custom_heIL)
// #endif
// 合并达管家默认的其他语言翻译以及其他定制语言翻译 end

const i18n = new VueI18n({
  locale: "zh-CN",
  messages: {
    "zh-CN": Object.assign(total_zhCN, appConfig), // 中文简体
    // #ifndef MP-WEIXIN || MP-ALIPAY
    "de-DE": Object.assign(total_deDE, appConfig), // 德语
    "el-GR": Object.assign(total_elGR, appConfig), // 希腊语
    "en-US": Object.assign(total_enUS, appConfig), // 英语
    "es-ES": Object.assign(total_esES, appConfig), // 西班牙语
    "fr-FR": Object.assign(total_frFR, appConfig), // 法语
    "it-IT": Object.assign(total_itIT, appConfig), // 意大利语
    "ja-JP": Object.assign(total_jaJP, appConfig), // 日语
    "pt-PT": Object.assign(total_ptPT, appConfig), // 葡萄牙语
    "ru-RU": Object.assign(total_ruRU, appConfig), // 俄罗斯语
    "th-TH": Object.assign(total_thTH, appConfig), // 泰语
    "zh-TW": Object.assign(total_zhTW, appConfig), // 中文繁体
    "zh-HK": Object.assign(total_zhTW, appConfig), // 中文繁体
    he: Object.assign(total_he, appConfig), // 希伯来语 -以色列
    iw: Object.assign(total_iw, appConfig), // 希伯来语 -以色列
    he_cn: Object.assign(total_hecn, appConfig), // 希伯来语 -以色列
    "he-IL": Object.assign(total_heIL, appConfig), // 希伯来语 -以色列
    // #endif
  },
})

export default i18n
