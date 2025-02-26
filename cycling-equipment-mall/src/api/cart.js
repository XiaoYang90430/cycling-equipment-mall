import request from "@/utils/request";

// 创建一个对象来集中管理购物车相关的 API
export const cartAPI = {
  // 添加商品到购物车
  addToCart(data) {
    return request({
      url: "/cart",
      method: "post",
      data,
    });
  },

  // 获取购物车列表
  getCartList() {
    return request({
      url: "/cart",
      method: "get",
    });
  },

  // 获取购物车商品数量
  getCartCount() {
    return request({
      url: "/cart/count",
      method: "get",
    });
  },
  //删除商品
  removeFromCart(id) {
    return request({
      url: `/cart/${id}`,
      method: "delete",
    });
  },
};
