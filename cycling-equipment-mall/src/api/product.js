import request from "@/utils/request";

export const productAPI = {
  // 获取商品列表（管理端）
  getProducts(params) {
    return request({
      url: "/products",
      method: "get",
      params,
    });
  },

  // 创建商品
  createProduct(data) {
    return request({
      url: "/products",
      method: "post",
      data,
    });
  },

  // 更新商品
  updateProduct(id, data) {
    return request({
      url: `/products/${id}`,
      method: "put",
      data,
    });
  },

  // 删除商品
  deleteProduct(id) {
    return request({
      url: `/products/${id}`,
      method: "delete",
    });
  },

  // 获取商品详情
  getProductById(id) {
    return request({
      url: `/products/${id}`,
      method: "get",
    });
  },

  // 搜索商品
  searchProducts(params) {
    return request.get("/products/search", { params });
  },

  // 获取热门商品
  getHotProducts() {
    return request({
      url: "/products/hot",
      method: "get",
    });
  },

  // 获取新品商品
  getNewProducts() {
    return request({
      url: "/products/new",
      method: "get",
    });
  },

  // 获取特定分类的商品
  getProductsByCategory(category, params) {
    return request({
      url: `/products/category/${category}`,
      method: "get",
      params,
    });
  },
};
