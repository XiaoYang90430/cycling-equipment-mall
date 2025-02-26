const Router = require("@koa/router");
const UserController = require("../controllers/user");
const { auth, checkLogin, checkAdmin } = require("../middleware/auth");
const { uploadAvatar } = require("../utils/upload");
const Response = require("../utils/response");

const router = new Router({ prefix: "/api/users" });

// 公共路由
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);

// 需要登录的路由
router.get("/profile", auth, UserController.getProfile);
router.put("/profile", auth, UserController.updateProfile);
router.put("/password", auth, UserController.updatePassword);
router.get("/info", auth, UserController.getUserInfo);

// 头像上传
router.post(
  "/avatar",
  auth,
  uploadAvatar.single("avatar"),
  UserController.uploadAvatar
);

// 管理员路由
router.get("/", auth, checkAdmin, UserController.getUsers);
router.post("/", auth, checkAdmin, UserController.createUser);
router.put("/:id", auth, checkAdmin, UserController.updateUser);
router.delete("/:id", auth, checkAdmin, UserController.deleteUser);

module.exports = router;
