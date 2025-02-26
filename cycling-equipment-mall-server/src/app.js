const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const cors = require("koa2-cors");
const sequelize = require("./config/db");
const userRouter = require("./routes/user");
const productRouter = require("./routes/product");
const cartRouter = require("./routes/cart");
const orderRouter = require("./routes/order");
const articleRouter = require("./routes/article");
const adminRouter = require("./routes/admin");
const uploadRouter = require("./routes/upload");
const serve = require("koa-static");
const path = require("path");
const fs = require("fs");

const app = new Koa();

// 测试数据库连接
sequelize
  .authenticate()
  .then(() => {
    console.log("数据库连接成功");
    // 修改同步选项，不使用 force
    return sequelize.sync({ force: false });
  })
  .then(() => {
    console.log("数据库模型同步成功");
  })
  .catch((err) => {
    console.error("数据库连接失败:", err);
  });

// 配置跨域
app.use(
  cors({
    origin: "http://localhost:5173", // 前端开发服务器地址
    credentials: true, // 允许携带凭证
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
    exposeHeaders: ["Content-Length", "Authorization", "Accept"],
  })
);

// 解析请求体
app.use(bodyParser());

// 注册路由
app.use(userRouter.routes());
app.use(userRouter.allowedMethods());
app.use(productRouter.routes());
app.use(productRouter.allowedMethods());
app.use(cartRouter.routes());
app.use(cartRouter.allowedMethods());
app.use(orderRouter.routes());
app.use(orderRouter.allowedMethods());
app.use(articleRouter.routes());
app.use(articleRouter.allowedMethods());
app.use(adminRouter.routes());
app.use(adminRouter.allowedMethods());
app.use(uploadRouter.routes());
app.use(uploadRouter.allowedMethods());

// 静态文件服务
app.use(serve(path.join(__dirname, "../public")));

// 确保上传目录存在
const uploadDirs = [
  path.join(__dirname, "../public/uploads/avatars"),
  path.join(__dirname, "../public/uploads/products"),
  path.join(__dirname, "../public/uploads/articles"),
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
