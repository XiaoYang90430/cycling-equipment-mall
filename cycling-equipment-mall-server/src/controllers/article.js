const Article = require("../models/article");
const User = require("../models/user");
const Response = require("../utils/response");
const { Op } = require("sequelize");

class ArticleController {
  // 获取文章列表
  static async getArticles(ctx) {
    try {
      const {
        page = 1,
        pageSize = 10,
        category,
        tag,
        title,
        status,
      } = ctx.query;
      const where = {};

      if (category) {
        where.category = category;
      }
      if (tag) {
        where.tags = { [Op.like]: `%${tag}%` };
      }
      if (title) {
        where.title = { [Op.like]: `%${title}%` };
      }
      if (status) {
        where.status = status;
      } else if (!ctx.state.user?.role === "admin") {
        // 非管理员只能看到已发布的文章
        where.status = "published";
      }

      const { count, rows } = await Article.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "avatar"],
          },
        ],
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
      console.error("获取文章列表失败:", error);
      ctx.body = Response.error("获取文章列表失败");
    }
  }

  // 获取文章详情
  static async getArticleDetail(ctx) {
    try {
      const { id } = ctx.params;
      const article = await Article.findOne({
        where: { id },
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "avatar"],
          },
        ],
      });

      if (!article) {
        ctx.body = Response.error("文章不存在");
        return;
      }

      // 非管理员只能查看已发布的文章
      if (article.status !== "published" && ctx.state.user?.role !== "admin") {
        ctx.body = Response.error("文章不存在");
        return;
      }

      // 增加浏览量
      await article.increment("view_count");

      ctx.body = Response.success(article);
    } catch (error) {
      console.error("获取文章详情失败:", error);
      ctx.body = Response.error("获取文章详情失败");
    }
  }

  // 获取推荐文章
  static async getFeaturedArticles(ctx) {
    try {
      const articles = await Article.findAll({
        where: {
          status: "published",
          is_featured: true,
        },
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "avatar"],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: 5,
      });

      ctx.body = Response.success(articles);
    } catch (error) {
      console.error("获取推荐文章失败:", error);
      ctx.body = Response.error("获取推荐文章失败");
    }
  }

  // 获取热门文章
  static async getHotArticles(ctx) {
    try {
      const articles = await Article.findAll({
        where: { status: "published" },
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "avatar"],
          },
        ],
        order: [["view_count", "DESC"]],
        limit: 5,
      });

      ctx.body = Response.success(articles);
    } catch (error) {
      console.error("获取热门文章失败:", error);
      ctx.body = Response.error("获取热门文章失败");
    }
  }

  // 创建文章
  static async createArticle(ctx) {
    try {
      const articleData = ctx.request.body;
      articleData.author_id = ctx.state.user.id;
      articleData.status = articleData.status || "draft";

      const article = await Article.create(articleData);
      ctx.body = Response.success(article);
    } catch (error) {
      console.error("创建文章失败:", error);
      ctx.body = Response.error("创建文章失败");
    }
  }

  // 更新文章
  static async updateArticle(ctx) {
    try {
      const { id } = ctx.params;
      const articleData = ctx.request.body;

      const article = await Article.findByPk(id);
      if (!article) {
        ctx.body = Response.error("文章不存在");
        return;
      }

      await article.update(articleData);
      ctx.body = Response.success(article);
    } catch (error) {
      console.error("更新文章失败:", error);
      ctx.body = Response.error("更新文章失败");
    }
  }

  // 删除文章
  static async deleteArticle(ctx) {
    try {
      const { id } = ctx.params;

      const article = await Article.findByPk(id);
      if (!article) {
        ctx.body = Response.error("文章不存在");
        return;
      }

      await article.destroy();
      ctx.body = Response.success(null, "删除成功");
    } catch (error) {
      console.error("删除文章失败:", error);
      ctx.body = Response.error("删除文章失败");
    }
  }

  // 更新文章状态
  static async updateArticleStatus(ctx) {
    try {
      const { id } = ctx.params;
      const { status } = ctx.request.body;

      const article = await Article.findByPk(id);
      if (!article) {
        ctx.body = Response.error("文章不存在");
        return;
      }

      await article.update({ status });
      ctx.body = Response.success(article);
    } catch (error) {
      console.error("更新文章状态失败:", error);
      ctx.body = Response.error("更新文章状态失败");
    }
  }
}

module.exports = ArticleController;
