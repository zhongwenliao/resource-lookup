// 封装请求
import axios from 'axios'

// 请求
const http = axios.create({
  baseURL: '/jeecg-boot',
  timeout: 6000
})
// 请求拦截
http.interceptors.request.use(
  config => {
    localStorage.setItem('token','eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NjA3MzMzOTcsInVzZXJuYW1lIjoiYWRtaW4ifQ.MNIM0tJ2JyXpsX-vURLIttTaVUpHTJ37q686BQXXGwc')
    //请求头设置
    config.headers['X-Access-Token'] = localStorage.getItem('token')
    return config
  },
  err => {
    console.log(err)
  }
)
// 响应拦截
http.interceptors.response.use(
  arr => {
    // 对响应码的处理
    switch (arr.status) {
      case 200:
        console.log(arr.data.message)
        break
      case 500:
        console.log(arr.data.message)
        break
    }
    return arr.data.result
  },
  err => {
    switch (err.response.status) {
      case 500:
        console.log('500服务器错误啊')
        break
    }
  }
)

export default function request({ method = 'get', url, data = {}, params = {} }) {
  return http({
    method,
    url,
    data,
    params
  })
}
