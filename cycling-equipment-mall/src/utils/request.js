import axios from "axios";
import { ElMessage } from "element-plus";
import router from "@/router"; // 导入路由实例

const request = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 5000,
  withCredentials: true, // 允许携带凭证
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 判断是否是后台管理接口
    const isAdminApi =
      config.url.includes("/admin") ||
      (router.currentRoute.value.path.startsWith("/admin") &&
        !router.currentRoute.value.path.startsWith("/admin/login"));

    // 根据接口类型选择不同的token
    const token = isAdminApi
      ? localStorage.getItem("adminToken")
      : localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data;
    if (code === 0) {
      return data;
    } else {
      ElMessage.error(message);
      return Promise.reject(new Error(message));
    }
  },
  async (error) => {
    if (error.code === "ERR_CONNECTION_REFUSED") {
      // 连接被拒绝，尝试重试
      const config = error.config;
      config.retryCount = config.retryCount || 0;

      if (config.retryCount < 3) {
        config.retryCount += 1;
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 等待1秒后重试
        return request(config);
      }
    }

    if (error.response?.status === 401) {
      // 判断是否是后台接口
      const isAdminApi =
        config.url.includes("/admin") ||
        (router.currentRoute.value.path.startsWith("/admin") &&
          !router.currentRoute.value.path.startsWith("/admin/login"));

      if (isAdminApi) {
        // 后台接口，只清除管理员信息
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUserInfo");
        router.push("/admin/login");
        ElMessage.error("管理员登录已过期，请重新登录");
      } else if (
        error.config.headers.Authorization === localStorage.getItem("token")
      ) {
        // 前台接口，且token匹配时才清除用户信息
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        router.push("/");
        window.dispatchEvent(new CustomEvent("openLogin"));
        ElMessage.error("登录已过期，请重新登录");
      }
    } else {
      ElMessage.error(error.response?.data?.message || "请求失败");
    }
    return Promise.reject(error);
  }
);

export default request;
