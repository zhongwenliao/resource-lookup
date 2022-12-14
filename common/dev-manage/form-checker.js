/**
 * 表单验证插件
 * 
 */
class FormChecker {
	constructor() {
		this.formData = {};
		this.checkList = [];
	}
	formCheck(formData, checkList) {
		// var formData = this.formData;
		// var checkList = this.checkList;
		var result = {
			"code": 0,
			"msg": "ok"
		};
		// for(var checkObj of checkList){
		// 	for(var ruleObj of checkObj["rules"]){
		// 		if("required" in ruleObj && ruleObj["required"] && formData[checkObj["name"]] == ""){

		// 		}
		// 	}
		// }
		for (var i = 0; i < checkList.length; i++) {
			var checkObj = checkList[i];
			for (var j = 0; j < checkList[i]["rules"].length; j++) {
				var ruleObj = checkList[i]["rules"][j];
				var value = formData[checkObj["name"]];
				if ("required" in ruleObj && ruleObj["required"] && value == "") {
					result["msg"] = ruleObj["message"];
					result["code"] = 3000;
					return result;
				} else if ("reg" in ruleObj) {
					if (typeof(ruleObj["reg"]) == "string") {
						ruleObj["reg"] = new RegExp(ruleObj["reg"]);
					}
					if (!ruleObj["reg"].test(value)) {
						result["msg"] = ruleObj["message"];
						result["code"] = 5000;
						return result;
					}
				}else if("betweenD" in ruleObj) {
					var min = ruleObj["betweenD"][0];
					// var max = ruleObj["betweenD"][1];
					if(value < min) {
						result["msg"] = ruleObj["message"];
						result["code"] = 6000;
						return result;
					} 
				}
			}
		}
		return result;
	}
}

var formChecker = new FormChecker();
module.exports = formChecker;
