import request from "@/utils/request";

// 获取统计数据
export function getStatistics() {
  return request({
    url: "/admin/statistics",
    method: "get",
  });
}

// 获取最新订单
export function getLatestOrders() {
  return request({
    url: "/admin/latest-orders",
    method: "get",
  });
}

// 获取最新文章
export function getLatestArticles() {
  return request({
    url: "/admin/latest-articles",
    method: "get",
  });
}

// 获取订单统计数据
export function getOrderStatistics(type = "week") {
  return request({
    url: "/admin/order-statistics",
    method: "get",
    params: { type },
  });
}

// 获取商品分类统计
export function getProductCategoryStatistics() {
  return request({
    url: "/admin/product-category-statistics",
    method: "get",
  });
}
