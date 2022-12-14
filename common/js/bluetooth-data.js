/**
 * @file APP进行原生蓝牙功能配置时的一些提示语汇总的文件
 * @author chenzhiwei
 * @createDate 2022-01-12
 * 
 */
import Vue from "vue";

const _this = Vue.prototype;

// 蓝牙配置错误码信息
const btErrorCodeInfo = _this.$t("bt-error-code");

// 公共的信息
const commonInfo = _this.$t("common");

module.exports = {
	// 蓝牙连接超时
	connectTimeoutMsg: btErrorCodeInfo["48"],
	// 功能不支持
	featureNotSupportedMsg: btErrorCodeInfo["12"],
	// 操作失败 
	operateFailMsg: btErrorCodeInfo["-10000"],
	// 操作成功
	operateSuccessMsg: btErrorCodeInfo["0"],
	// 请前往APP使用此功能
	appUseMsg: commonInfo["goto-app-use"]
};


