const Router = require("@koa/router");
const CartController = require("../controllers/cart");
const { auth } = require("../middleware/auth");

const router = new Router({ prefix: "/api/cart" });

// 所有购物车操作都需要登录
router.use(auth);

router.get("/", CartController.getCartList);
router.get("/count", CartController.getCartCount);
router.post("/", CartController.addToCart);
router.put("/:id", CartController.updateCartItem);
router.delete("/:id", CartController.removeFromCart);
router.delete("/clear", CartController.clearCart);

module.exports = router;
