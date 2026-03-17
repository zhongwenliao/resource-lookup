import axios from "axios";
// 前端实现无感刷新token
// 双token机制，accessToken过期时，使用refreshToken刷新accessToken
class TokenService {
  constructor() {
    this.refreshing = false;
    // 请求队列
    this.queue = [];
    this.service = this.createService();
  }
  createService() {
    const service = axios.create({
      baseURL: "http://localhost:3000",
      timeout: 10000,
      headers: { "X-Custom-Header": "foobar" },
    });

    // 请求拦截器
    service.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // 响应拦截器
    service.interceptors.response.use(
      (response) => response,
      async (error) => {
        const { config, response } = error;
        if (response.status === 401 && response.data?.code === "token expired") {
          // 排除刷新token接口
          if (config.url.includes("/refreshToken")) {
            this.clearToken();
            return Promise.reject(error);
          }
          // 将当前请求加入队列中
          return new Promise((resolve, reject) => {
            this.queue.push({ config, resolve, reject });
            this.processQueue();
          });
        }
        return Promise.reject(error);
      },
    );
    return service;
  }

  // 请求队列
  async processQueue() {
    if (this.refreshing || this.queue.length === 0) return;

    this.refreshing = true;

    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("refreshToken not found");
      }
      // 获取刷新token请求
      const res = await axios.post("/refreshToken", { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = res.data;
      // 更新本地token
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      // 重新发起队列中的请求
      this.queue.forEach(({ config, resolve }) => {
        config.headers["Authorization"] = `Bearer ${token}`;
        this.service(config).then(resolve).catch(resolve);
      });
      this.queue = [];
    } catch (error) {
      console.log(error);
    }
  }

  clearToken() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  }
}
