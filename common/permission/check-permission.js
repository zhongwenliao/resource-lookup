// 权限
import permision from "./permission.js";

// 检测定位权限
export async function checkLocationPermission() {
	let status = permision.isIOS ? await permision.requestIOS("location") :
		await permision.requestAndroid("android.permission.ACCESS_FINE_LOCATION");
	
	let result = {
		code: 0,
		msg: "ok"
	};
	return new Promise((resolve, reject) => {
		if (status === null || status === 1) {
			resolve(result);
			// status = 1;
		} else if (status === 2) {
			result.code = 2;
			result.msg = "定位已关闭";
		} else if (status.code) {
			result.code = status.code;
			result.msg = status.message;
		} else {
			result.code = 100;
			result.msg = "需要定位权限";
		}
		reject(result);
	});
}