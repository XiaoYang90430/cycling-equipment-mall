const Router = require("@koa/router");
const OrderController = require("../controllers/order");
const { auth, checkAdmin } = require("../middleware/auth");

const router = new Router({ prefix: "/api/orders" });

// 用户接口
router.get("/my", auth, OrderController.getUserOrders);
router.post("/", auth, OrderController.createOrder);
router.get("/:id", auth, OrderController.getOrderDetail);
router.post("/:id/pay", auth, OrderController.payOrder);
router.post("/:id/cancel", auth, OrderController.cancelOrder);
router.delete("/:id", auth, OrderController.deleteOrder);

// 管理接口
router.get("/", checkAdmin, OrderController.getOrders);
router.put("/:id/status", checkAdmin, OrderController.updateOrderStatus);

module.exports = router;
