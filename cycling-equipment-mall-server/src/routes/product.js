const Router = require("@koa/router");
const ProductController = require("../controllers/product");
const { checkAdmin } = require("../middleware/auth");

const router = new Router({ prefix: "/api/products" });

// 公开接口
router.get("/hot", ProductController.getHotProducts);
router.get("/new", ProductController.getNewProducts);
router.get("/search", ProductController.searchProducts);
router.get("/category/:category", ProductController.getProductsByCategory);
router.get("/:id", ProductController.getProductDetail);

// 管理接口
router.get("/", checkAdmin, ProductController.getProducts);
router.post("/", checkAdmin, ProductController.createProduct);
router.put("/:id", checkAdmin, ProductController.updateProduct);
router.delete("/:id", checkAdmin, ProductController.deleteProduct);

module.exports = router;
