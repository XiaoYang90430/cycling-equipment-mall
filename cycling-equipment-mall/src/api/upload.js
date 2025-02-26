import request from "@/utils/request";

export const uploadAPI = {
  // 上传商品图片
  uploadProductImage(formData) {
    return request.post("/upload/product", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // 上传文章图片
  uploadArticleImage(formData) {
    return request.post("/upload/article", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
