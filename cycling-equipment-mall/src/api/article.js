import request from "@/utils/request";

export const articleAPI = {
  // 获取文章列表
  getArticles(params) {
    return request({
      url: "/articles",
      method: "get",
      params,
    });
  },

  // 获取文章详情
  getArticleDetail(id) {
    return request({
      url: `/articles/${id}`,
      method: "get",
    });
  },

  // 获取推荐文章
  getFeaturedArticles() {
    return request({
      url: "/articles/featured",
      method: "get",
    });
  },

  // 获取热门文章
  getHotArticles() {
    return request({
      url: "/articles/hot",
      method: "get",
    });
  },

  // 创建文章
  createArticle(data) {
    return request({
      url: "/articles",
      method: "post",
      data,
    });
  },

  // 更新文章
  updateArticle(id, data) {
    return request({
      url: `/articles/${id}`,
      method: "put",
      data,
    });
  },

  // 删除文章
  deleteArticle(id) {
    return request({
      url: `/articles/${id}`,
      method: "delete",
    });
  },

  // 更新文章状态
  updateArticleStatus(id, status) {
    return request({
      url: `/articles/${id}/status`,
      method: "put",
      data: { status },
    });
  },
};
