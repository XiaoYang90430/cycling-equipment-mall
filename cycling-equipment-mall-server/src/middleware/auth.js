const jwt = require("jsonwebtoken");
const Response = require("../utils/response");
const User = require("../models/user");

// 普通用户认证中间件
const auth = async (ctx, next) => {
  try {
    const authHeader = ctx.header.authorization;
    if (!authHeader) {
      ctx.body = Response.error("未提供认证信息", 401);
      return;
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      ctx.body = Response.error("无效的认证格式", 401);
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        ctx.body = Response.error("用户不存在", 401);
        return;
      }

      ctx.state.user = user;
      await next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        ctx.body = Response.error("登录已过期，请重新登录", 401);
      } else if (err.name === "JsonWebTokenError") {
        ctx.body = Response.error("无效的 token", 401);
      } else {
        ctx.body = Response.error(`认证失败: ${err.message}`, 401);
      }
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    ctx.body = Response.error("认证失败", 401);
  }
};

// 管理员权限验证中间件
const checkAdmin = async (ctx, next) => {
  try {
    await auth(ctx, async () => {
      if (ctx.state.user.role !== "admin") {
        ctx.body = Response.error("需要管理员权限", 403);
        return;
      }
      await next();
    });
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    ctx.body = Response.error("认证失败", 401);
  }
};

module.exports = { auth, checkAdmin };
