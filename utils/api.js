//const baseUrl = 'http://127.0.0.1:8083/'
const baseUrl = "https://shoe.abillchen.top/";
//const baseUrl = 'http://120.77.181.181:8081/'

// get请求方式
// this.$http("路径",{参数},"GET").then(res=>{
// 					console.log(res);
// 				}).catch(err=>{
// 					console.log(err);
// 				})

//默认post请求
const request = (url = "", date = {}, type = "POST", header = {}) => {
  return new Promise((resolve, reject) => {
    uni
      .request({
        method: type,
        url: baseUrl + url,
        data: date,
        header: {
          "content-type": "application/json", // 默认值
        },
        dataType: "json",
      })
      .then((response) => {
        /* setTimeout(function() {
                uni.hideLoading();
            }, 200); */
        let [error, res] = response;
        resolve(res);
      })
      .catch((error) => {
        let [err, res] = error;
        reject(err);
      });
  });
};

export default request;
