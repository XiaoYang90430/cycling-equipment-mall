const Router = require("@koa/router");
const ArticleController = require("../controllers/article");
const { checkAdmin } = require("../middleware/auth");

const router = new Router({ prefix: "/api/articles" });

// 公开接口
router.get("/", ArticleController.getArticles);
router.get("/featured", ArticleController.getFeaturedArticles);
router.get("/hot", ArticleController.getHotArticles);
router.get("/:id", ArticleController.getArticleDetail);

// 管理接口
router.post("/", checkAdmin, ArticleController.createArticle);
router.put("/:id", checkAdmin, ArticleController.updateArticle);
router.delete("/:id", checkAdmin, ArticleController.deleteArticle);
router.put("/:id/status", checkAdmin, ArticleController.updateArticleStatus);

module.exports = router;
