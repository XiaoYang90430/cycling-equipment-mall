const { Op } = require("sequelize");
const User = require("../models/user");
const { Order, OrderItem } = require("../models/order");
const Product = require("../models/product");
const Article = require("../models/article");
const Response = require("../utils/response");
const sequelize = require("../config/db");

class AdminController {
  // 获取统计数据
  static async getStatistics(ctx) {
    try {
      const now = new Date();
      const yesterday = new Date(now - 24 * 60 * 60 * 1000);
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0));

      // 获取用户统计
      const userCount = await User.count();
      const todayUsers = await User.count({
        where: {
          created_at: {
            [Op.gte]: todayStart,
          },
        },
      });
      const yesterdayUsers = await User.count({
        where: {
          created_at: {
            [Op.gte]: yesterdayStart,
            [Op.lt]: todayStart,
          },
        },
      });

      // 获取订单统计
      const orderCount = await Order.count();
      const todayOrders = await Order.count({
        where: {
          created_at: {
            [Op.gte]: todayStart,
          },
        },
      });
      const yesterdayOrders = await Order.count({
        where: {
          created_at: {
            [Op.gte]: yesterdayStart,
            [Op.lt]: todayStart,
          },
        },
      });

      // 获取商品统计
      const productCount = await Product.count();
      const todayProducts = await Product.count({
        where: {
          created_at: {
            [Op.gte]: todayStart,
          },
        },
      });
      const yesterdayProducts = await Product.count({
        where: {
          created_at: {
            [Op.gte]: yesterdayStart,
            [Op.lt]: todayStart,
          },
        },
      });

      // 获取文章统计
      const articleCount = await Article.count();
      const todayArticles = await Article.count({
        where: {
          created_at: {
            [Op.gte]: todayStart,
          },
        },
      });
      const yesterdayArticles = await Article.count({
        where: {
          created_at: {
            [Op.gte]: yesterdayStart,
            [Op.lt]: todayStart,
          },
        },
      });

      ctx.body = Response.success({
        userCount,
        userIncrease: todayUsers - yesterdayUsers,
        orderCount,
        orderIncrease: todayOrders - yesterdayOrders,
        productCount,
        productIncrease: todayProducts - yesterdayProducts,
        articleCount,
        articleIncrease: todayArticles - yesterdayArticles,
      });
    } catch (error) {
      console.error("获取统计数据失败:", error);
      ctx.body = Response.error("获取统计数据失败");
    }
  }

  // 获取最新订单
  static async getLatestOrders(ctx) {
    try {
      const orders = await Order.findAll({
        include: [
          {
            model: User,
            attributes: ["username", "email"],
          },
          {
            model: OrderItem,
            include: [
              {
                model: Product,
                attributes: ["name", "price"],
              },
            ],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: 5,
        attributes: [
          "id",
          "order_number",
          "total_amount",
          "status",
          "created_at",
          "shipping_address",
          "shipping_name",
          "shipping_phone",
        ],
      });

      ctx.body = Response.success(orders);
    } catch (error) {
      console.error("获取最新订单失败:", error);
      ctx.body = Response.error("获取最新订单失败");
    }
  }

  // 获取最新文章
  static async getLatestArticles(ctx) {
    try {
      const articles = await Article.findAll({
        where: { status: "published" },
        include: [
          {
            model: User,
            as: "author",
            attributes: ["username", "avatar"],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: 5,
        attributes: ["id", "title", "category", "created_at", "status"],
      });

      ctx.body = Response.success(articles);
    } catch (error) {
      console.error("获取最新文章失败:", error);
      ctx.body = Response.error("获取最新文章失败");
    }
  }

  // 获取订单统计数据
  static async getOrderStatistics(ctx) {
    try {
      const { type = "week" } = ctx.query;
      const now = new Date();
      let startDate;

      if (type === "week") {
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const orders = await Order.findAll({
        where: {
          created_at: {
            [Op.gte]: startDate,
          },
        },
        attributes: [
          [sequelize.fn("DATE", sequelize.col("created_at")), "date"],
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        group: [sequelize.fn("DATE", sequelize.col("created_at"))],
        order: [[sequelize.fn("DATE", sequelize.col("created_at")), "ASC"]],
      });

      ctx.body = Response.success(orders);
    } catch (error) {
      console.error("获取订单统计数据失败:", error);
      ctx.body = Response.error("获取订单统计数据失败");
    }
  }

  // 获取商品分类统计
  static async getProductCategoryStatistics(ctx) {
    try {
      const statistics = await Product.findAll({
        attributes: [
          "category",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        group: ["category"],
      });

      ctx.body = Response.success(statistics);
    } catch (error) {
      console.error("获取商品分类统计失败:", error);
      ctx.body = Response.error("获取商品分类统计失败");
    }
  }
}

module.exports = AdminController;
