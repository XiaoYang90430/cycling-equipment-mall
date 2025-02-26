import request from "@/utils/request";

export const userAPI = {
  // 登录
  login(data) {
    return request({
      url: "/users/login",
      method: "post",
      data,
    });
  },

  // 注册
  register(data) {
    return request({
      url: "/users/register",
      method: "post",
      data,
    });
  },

  // 获取用户信息
  getProfile() {
    return request({
      url: "/users/profile",
      method: "get",
    });
  },

  // 更新用户信息
  updateProfile(data) {
    return request({
      url: "/users/profile",
      method: "put",
      data,
    });
  },

  // 更新密码
  updatePassword(data) {
    return request({
      url: "/users/password",
      method: "put",
      data,
    });
  },

  // 退出登录
  logout() {
    return request.post("/users/logout");
  },

  // 上传头像
  uploadAvatar(formData) {
    return request.post("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // 管理端接口
  getUsers(params) {
    return request({
      url: "/users",
      method: "get",
      params,
    });
  },

  createUser(data) {
    return request({
      url: "/users",
      method: "post",
      data,
    });
  },

  updateUser(id, data) {
    return request({
      url: `/users/${id}`,
      method: "put",
      data,
    });
  },

  deleteUser(id) {
    return request({
      url: `/users/${id}`,
      method: "delete",
    });
  },
};
