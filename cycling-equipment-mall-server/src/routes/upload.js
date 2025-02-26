const Router = require("@koa/router");
const { uploadProduct, uploadArticle } = require("../utils/upload");
const { auth, checkAdmin } = require("../middleware/auth");
const Response = require("../utils/response");

const router = new Router({ prefix: "/api/upload" });

// 上传商品图片
router.post(
  "/product",
  auth,
  checkAdmin,
  uploadProduct.single("image"),
  async (ctx) => {
    try {
      if (!ctx.file) {
        ctx.body = Response.error("请选择要上传的文件");
        return;
      }
      const imageUrl = ctx.file.filename;
      ctx.body = Response.success({
        url: `/uploads/products/${imageUrl}`,
        filename: imageUrl,
      });
    } catch (error) {
      console.error("上传商品图片失败:", error);
      ctx.body = Response.error(error.message || "上传商品图片失败");
    }
  }
);

// 上传文章图片
router.post(
  "/article",
  auth,
  checkAdmin,
  uploadArticle.single("image"),
  async (ctx) => {
    try {
      if (!ctx.file) {
        ctx.body = Response.error("请选择要上传的文件");
        return;
      }
      const imageUrl = ctx.file.filename;
      ctx.body = Response.success({
        url: `/uploads/articles/${imageUrl}`,
        filename: imageUrl,
      });
    } catch (error) {
      console.error("上传文章图片失败:", error);
      ctx.body = Response.error(error.message || "上传文章图片失败");
    }
  }
);

module.exports = router;
