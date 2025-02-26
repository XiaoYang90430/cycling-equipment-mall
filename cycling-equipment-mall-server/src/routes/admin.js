const Router = require("@koa/router");
const AdminController = require("../controllers/admin");
const { auth, checkAdmin } = require("../middleware/auth");

const router = new Router({ prefix: "/api/admin" });

// 添加管理员权限验证中间件
router.use(auth);
router.use(checkAdmin);

// 获取统计数据
router.get("/statistics", AdminController.getStatistics);

// 获取最新订单
router.get("/latest-orders", AdminController.getLatestOrders);

// 获取最新文章
router.get("/latest-articles", AdminController.getLatestArticles);

// 获取订单统计数据
router.get("/order-statistics", AdminController.getOrderStatistics);

// 获取商品分类统计
router.get(
  "/product-category-statistics",
  AdminController.getProductCategoryStatistics
);

module.exports = router;
