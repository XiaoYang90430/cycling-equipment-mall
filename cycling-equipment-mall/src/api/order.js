import request from "@/utils/request";

export const orderAPI = {
  // 获取订单列表（管理端）
  getOrders(params) {
    return request({
      url: "/orders",
      method: "get",
      params,
    });
  },

  // 更新订单状态
  updateOrderStatus(id, status) {
    return request({
      url: `/orders/${id}/status`,
      method: "put",
      data: { status },
    });
  },

  // 获取用户订单列表
  getUserOrders() {
    return request({
      url: "/orders/my",
      method: "get",
    });
  },

  // 创建订单
  createOrder(data) {
    return request({
      url: "/orders",
      method: "post",
      data,
    });
  },

  // 获取订单详情
  getOrderDetail(id) {
    return request({
      url: `/orders/${id}`,
      method: "get",
    });
  },

  // 支付订单
  payOrder(id) {
    return request({
      url: `/orders/${id}/pay`,
      method: "post",
    });
  },

  // 取消订单
  cancelOrder(id) {
    return request({
      url: `/orders/${id}/cancel`,
      method: "post",
    });
  },

  // 删除订单
  deleteOrder(id) {
    return request({
      url: `/orders/${id}`,
      method: "delete",
    });
  },
};
