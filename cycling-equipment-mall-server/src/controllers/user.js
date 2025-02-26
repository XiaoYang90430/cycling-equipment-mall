const User = require("../models/user");
const Response = require("../utils/response");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

class UserController {
  // 用户注册
  static async register(ctx) {
    try {
      const { username, password, email } = ctx.request.body;

      // 验证必填字段
      if (!username || !password || !email) {
        ctx.body = Response.error("用户名、密码和邮箱都是必填项");
        return;
      }

      // 检查用户名是否已存在
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        ctx.body = Response.error("用户名已存在");
        return;
      }

      // 检查邮箱是否已存在
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        ctx.body = Response.error("邮箱已被使用");
        return;
      }

      // 密码加密
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 创建用户
      const user = await User.create({
        username,
        password: hashedPassword,
        email,
      });

      ctx.body = Response.success({
        id: user.id,
        username: user.username,
        email: user.email,
      });
    } catch (error) {
      console.error("注册失败:", error);
      ctx.body = Response.error(error.message || "注册失败");
    }
  }

  // 用户登录
  static async login(ctx) {
    try {
      const { username, password } = ctx.request.body;

      const user = await User.findOne({ where: { username } });
      if (!user) {
        ctx.body = Response.error("用户不存在");
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        ctx.body = Response.error("密码错误");
        return;
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // 返回时已经包含 Bearer 前缀
      ctx.body = Response.success({
        token: `Bearer ${token}`,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      console.error("登录失败:", error);
      ctx.body = Response.error(error.message || "登录失败");
    }
  }

  // 获取用户信息
  static async getUserInfo(ctx) {
    try {
      const userId = ctx.state.user.id;
      const user = await User.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        ctx.body = Response.error("用户不存在");
        return;
      }

      ctx.body = Response.success(user);
    } catch (error) {
      console.error("获取用户信息失败:", error);
      ctx.body = Response.error("获取用户信息失败");
    }
  }

  // 退出登录
  static async logout(ctx) {
    try {
      // 由于使用的是JWT，后端只需要返回成功即可，具体的token清除在前端处理
      ctx.body = Response.success(null, "退出成功");
    } catch (error) {
      console.error("退出失败:", error);
      ctx.body = Response.error("退出失败");
    }
  }

  // 获取个人信息
  static async getProfile(ctx) {
    try {
      const userId = ctx.state.user.id;
      const user = await User.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        ctx.body = Response.error("用户不存在");
        return;
      }

      ctx.body = Response.success(user);
    } catch (error) {
      console.error("获取个人信息失败:", error);
      ctx.body = Response.error("获取个人信息失败");
    }
  }

  // 更新个人信息
  static async updateProfile(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { email, currentPassword, newPassword } = ctx.request.body;

      const user = await User.findByPk(userId);
      if (!user) {
        ctx.body = Response.error("用户不存在");
        return;
      }

      // 检查邮箱是否被其他用户使用
      if (email && email !== user.email) {
        const existingEmail = await User.findOne({
          where: { email, id: { [Op.ne]: userId } },
        });
        if (existingEmail) {
          ctx.body = Response.error("邮箱已被使用");
          return;
        }
      }

      // 如果要更新密码，先验证当前密码
      if (newPassword) {
        const isValidPassword = await bcrypt.compare(
          currentPassword,
          user.password
        );
        if (!isValidPassword) {
          ctx.body = Response.error("当前密码错误");
          return;
        }
        // 加密新密码
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await user.update({ email, password: hashedPassword });
      } else {
        await user.update({ email });
      }

      ctx.body = Response.success({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error("更新个人信息失败:", error);
      ctx.body = Response.error("更新个人信息失败");
    }
  }

  // 更新密码
  static async updatePassword(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { currentPassword, newPassword } = ctx.request.body;

      const user = await User.findByPk(userId);
      if (!user) {
        ctx.body = Response.error("用户不存在");
        return;
      }

      // 验证当前密码
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        ctx.body = Response.error("当前密码错误");
        return;
      }

      // 加密新密码
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // 更新密码
      await user.update({ password: hashedPassword });
      ctx.body = Response.success(null, "密码更新成功");
    } catch (error) {
      console.error("更新密码失败:", error);
      ctx.body = Response.error("更新密码失败");
    }
  }

  // 上传头像
  static async uploadAvatar(ctx) {
    try {
      const file = ctx.file;
      if (!file) {
        ctx.body = Response.error("请选择要上传的文件");
        return;
      }

      // 构建文件URL（相对于public目录）
      const avatarUrl = `/uploads/avatars/${file.filename}`;

      // 更新用户头像
      const user = await User.findByPk(ctx.state.user.id);
      await user.update({ avatar: avatarUrl });

      ctx.body = Response.success({ avatarUrl }, "头像上传成功");
    } catch (error) {
      console.error("上传头像失败:", error);
      ctx.body = Response.error("上传头像失败");
    }
  }

  // 获取用户列表（管理端）
  static async getUsers(ctx) {
    try {
      const { page = 1, pageSize = 10, search, role } = ctx.query;
      const where = {};

      if (search) {
        where[Op.or] = [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ];
      }

      if (role) {
        where.role = role;
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        attributes: { exclude: ["password"] },
        order: [["created_at", "DESC"]],
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize),
      });

      ctx.body = Response.success({
        items: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(count / parseInt(pageSize)),
      });
    } catch (error) {
      console.error("获取用户列表失败:", error);
      ctx.body = Response.error("获取用户列表失败");
    }
  }

  // 创建用户（管理端）
  static async createUser(ctx) {
    try {
      const { username, password, email, role } = ctx.request.body;

      // 验证必填字段
      if (!username || !password || !email || !role) {
        ctx.body = Response.error("用户名、密码、邮箱和角色都是必填项");
        return;
      }

      // 检查用户名是否已存在
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        ctx.body = Response.error("用户名已存在");
        return;
      }

      // 检查邮箱是否已存在
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        ctx.body = Response.error("邮箱已被使用");
        return;
      }

      // 密码加密
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 创建用户
      const user = await User.create({
        username,
        password: hashedPassword,
        email,
        role,
      });

      ctx.body = Response.success({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error("创建用户失败:", error);
      ctx.body = Response.error("创建用户失败");
    }
  }

  // 更新用户（管理端）
  static async updateUser(ctx) {
    try {
      const { id } = ctx.params;
      const { email, role } = ctx.request.body;

      const user = await User.findByPk(id);
      if (!user) {
        ctx.body = Response.error("用户不存在");
        return;
      }

      // 检查邮箱是否被其他用户使用
      if (email && email !== user.email) {
        const existingEmail = await User.findOne({
          where: { email, id: { [Op.ne]: id } },
        });
        if (existingEmail) {
          ctx.body = Response.error("邮箱已被使用");
          return;
        }
      }

      // 更新用户信息
      await user.update({ email, role });

      ctx.body = Response.success({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error("更新用户失败:", error);
      ctx.body = Response.error("更新用户失败");
    }
  }

  // 删除用户（管理端）
  static async deleteUser(ctx) {
    try {
      const { id } = ctx.params;

      const user = await User.findByPk(id);
      if (!user) {
        ctx.body = Response.error("用户不存在");
        return;
      }

      if (user.role === "admin") {
        ctx.body = Response.error("不能删除管理员账号");
        return;
      }

      await user.destroy();
      ctx.body = Response.success(null, "删除成功");
    } catch (error) {
      console.error("删除用户失败:", error);
      ctx.body = Response.error("删除用户失败");
    }
  }
}

module.exports = UserController;
