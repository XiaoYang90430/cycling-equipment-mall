const { Op, Sequelize } = require("sequelize");
const Product = require("../models/product");
const Response = require("../utils/response");

class ProductController {
  // 获取商品列表（管理端）
  static async getProducts(ctx) {
    try {
      const { page = 1, pageSize = 10, search, category, stock } = ctx.query;
      const where = {};

      if (search) {
        where.name = { [Op.like]: `%${search}%` };
      }
      if (category) {
        where.category = category;
      }
      if (stock === "inStock") {
        where.stock = { [Op.gt]: 0 };
      } else if (stock === "outOfStock") {
        where.stock = 0;
      }

      const { count, rows } = await Product.findAndCountAll({
        where,
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
      console.error("获取商品列表失败:", error);
      ctx.body = Response.error("获取商品列表失败");
    }
  }

  // 创建商品
  static async createProduct(ctx) {
    try {
      const productData = ctx.request.body;
      const product = await Product.create(productData);
      ctx.body = Response.success(product);
    } catch (error) {
      console.error("创建商品失败:", error);
      ctx.body = Response.error("创建商品失败");
    }
  }

  // 更新商品
  static async updateProduct(ctx) {
    try {
      const { id } = ctx.params;
      const productData = ctx.request.body;

      const product = await Product.findByPk(id);
      if (!product) {
        ctx.body = Response.error("商品不存在");
        return;
      }

      await product.update(productData);
      ctx.body = Response.success(product);
    } catch (error) {
      console.error("更新商品失败:", error);
      ctx.body = Response.error("更新商品失败");
    }
  }

  // 删除商品
  static async deleteProduct(ctx) {
    try {
      const { id } = ctx.params;

      const product = await Product.findByPk(id);
      if (!product) {
        ctx.body = Response.error("商品不存在");
        return;
      }

      await product.destroy();
      ctx.body = Response.success(null, "删除成功");
    } catch (error) {
      console.error("删除商品失败:", error);
      ctx.body = Response.error("删除商品失败");
    }
  }

  // 获取热门推荐商品
  static async getHotProducts(ctx) {
    try {
      const products = await Product.findAll({
        where: {
          isHot: true,
          stock: {
            [Op.gt]: 0,
          },
        },
        order: [
          ["sales", "DESC"],
          ["id", "DESC"],
        ],
        limit: 8,
      });

      ctx.body = Response.success(products);
    } catch (error) {
      console.error("获取热门商品失败:", error);
      ctx.body = Response.error("获取热门商品失败");
    }
  }

  // 获取新品上架商品
  static async getNewProducts(ctx) {
    try {
      const products = await Product.findAll({
        where: {
          isNew: true,
          stock: {
            [Op.gt]: 0,
          },
        },
        order: [["created_at", "DESC"]],
        limit: 8,
      });

      ctx.body = Response.success(products);
    } catch (error) {
      console.error("获取新品商品失败:", error);
      ctx.body = Response.error("获取新品商品失败");
    }
  }

  // 获取分类商品
  static async getProductsByCategory(ctx) {
    try {
      const { category } = ctx.params;
      const { page = 1, pageSize = 12, sort, type, priceRange } = ctx.query;

      // 构建查询条件
      const where = {
        category,
        stock: {
          [Op.gt]: 0,
        },
      };

      // 添加车型筛选
      if (type) {
        where.type = type;
      }

      // 添加价格区间筛选
      if (priceRange) {
        const [min, max] = priceRange.split("-").map(Number);
        console.log("Price range:", { min, max }); // 添加日志

        // 确保 min 和 max 是有效的数字
        if (!isNaN(min) && !isNaN(max)) {
          where.price = {
            [Op.and]: [
              Sequelize.literal(`CAST(price AS DECIMAL) >= ${min}`),
              Sequelize.literal(`CAST(price AS DECIMAL) <= ${max}`),
            ],
          };
          console.log("Price condition:", where.price); // 添加日志
        }
      }

      // 打印最终的查询条件
      console.log("Final where condition:", where);

      // 构建排序条件
      let order = [["created_at", "DESC"]];
      if (sort === "priceAsc") {
        order = [[Sequelize.literal("CAST(price AS DECIMAL)"), "ASC"]];
      } else if (sort === "priceDesc") {
        order = [[Sequelize.literal("CAST(price AS DECIMAL)"), "DESC"]];
      }

      // 分页查询
      const { count, rows } = await Product.findAndCountAll({
        where,
        order,
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
      console.error("获取分类商品失败:", error);
      ctx.body = Response.error("获取分类商品失败");
    }
  }

  // 获取商品详情
  static async getProductDetail(ctx) {
    try {
      const { id } = ctx.params;
      const product = await Product.findByPk(id);

      if (!product) {
        ctx.body = Response.error("商品不存在");
        return;
      }

      ctx.body = Response.success(product);
    } catch (error) {
      console.error("获取商品详情失败:", error);
      ctx.body = Response.error("获取商品详情失败");
    }
  }

  // 搜索商品
  static async searchProducts(ctx) {
    try {
      const { keyword, page = 1, pageSize = 12 } = ctx.query;
      const where = {
        [Op.or]: [
          { name: { [Op.like]: `%${keyword}%` } },
          { description: { [Op.like]: `%${keyword}%` } },
        ],
        stock: {
          [Op.gt]: 0,
        },
      };

      const { count, rows } = await Product.findAndCountAll({
        where,
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
      console.error("搜索商品失败:", error);
      ctx.body = Response.error("搜索商品失败");
    }
  }
}

module.exports = ProductController;
