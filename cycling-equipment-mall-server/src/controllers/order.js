const { Order, OrderItem } = require("../models/order");
const Product = require("../models/product");
const Response = require("../utils/response");
const sequelize = require("../config/db");
const { Op } = require("sequelize");

class OrderController {
  // 创建订单
  static async createOrder(ctx) {
    const t = await sequelize.transaction();
    try {
      const userId = ctx.state.user.id;
      const { items, shipping_address, shipping_phone, shipping_name } =
        ctx.request.body;

      // 生成订单号
      const orderNumber = `ORDER${Date.now()}${Math.floor(
        Math.random() * 1000
      )}`;

      // 计算总金额并检查库存
      let totalAmount = 0;
      for (const item of items) {
        const product = await Product.findByPk(item.product_id);
        if (!product) {
          throw new Error(`商品 ${item.product_id} 不存在`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`商品 ${product.name} 库存不足`);
        }
        totalAmount += item.price * item.quantity;
      }

      // 创建订单
      const order = await Order.create(
        {
          user_id: userId,
          order_number: orderNumber,
          total_amount: totalAmount,
          shipping_address,
          shipping_phone,
          shipping_name,
        },
        { transaction: t }
      );

      // 创建订单项并更新库存
      for (const item of items) {
        const product = await Product.findByPk(item.product_id);
        await OrderItem.create(
          {
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          },
          { transaction: t }
        );

        // 更新库存
        await Product.update(
          { stock: product.stock - item.quantity },
          { where: { id: item.product_id }, transaction: t }
        );
      }

      await t.commit();
      ctx.body = Response.success(order);
    } catch (error) {
      await t.rollback();
      console.error("创建订单失败:", error);
      ctx.body = Response.error(error.message);
    }
  }

  // 获取订单列表（管理端）
  static async getOrders(ctx) {
    try {
      const {
        page = 1,
        pageSize = 10,
        search,
        status,
        startDate,
        endDate,
      } = ctx.query;
      const where = {};

      if (search) {
        where.order_number = { [Op.like]: `%${search}%` };
      }
      if (status) {
        where.status = status;
      }
      if (startDate && endDate) {
        where.created_at = {
          [Op.between]: [startDate, endDate + " 23:59:59"],
        };
      }

      const { count, rows } = await Order.findAndCountAll({
        where,
        include: [
          {
            model: OrderItem,
            include: [
              {
                model: Product,
                attributes: ["id", "name", "image"],
              },
            ],
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
      console.error("获取订单列表失败:", error);
      ctx.body = Response.error("获取订单列表失败");
    }
  }

  // 获取订单详情
  static async getOrderDetail(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;

      const order = await Order.findOne({
        where: { id, user_id: userId },
        include: [
          {
            model: OrderItem,
            include: [
              {
                model: Product,
                attributes: ["id", "name", "image"],
              },
            ],
          },
        ],
      });

      if (!order) {
        ctx.body = Response.error("订单不存在");
        return;
      }

      ctx.body = Response.success(order);
    } catch (error) {
      console.error("获取订单详情失败:", error);
      ctx.body = Response.error("获取订单详情失败");
    }
  }

  // 取消订单
  static async cancelOrder(ctx) {
    const t = await sequelize.transaction();
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;

      const order = await Order.findOne({
        where: { id, user_id: userId },
        include: [{ model: OrderItem }],
        transaction: t,
      });

      if (!order) {
        ctx.body = Response.error("订单不存在");
        return;
      }

      if (order.status !== "pending") {
        ctx.body = Response.error("只能取消待支付的订单");
        return;
      }

      // 恢复商品库存
      for (const item of order.OrderItems) {
        await Product.increment(
          { stock: item.quantity },
          { where: { id: item.product_id }, transaction: t }
        );
      }

      // 更新订单状态
      await order.update({ status: "cancelled" }, { transaction: t });

      await t.commit();
      ctx.body = Response.success(null, "订单已取消");
    } catch (error) {
      await t.rollback();
      console.error("取消订单失败:", error);
      ctx.body = Response.error("取消订单失败");
    }
  }

  // 删除订单
  static async deleteOrder(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;

      const order = await Order.findOne({
        where: {
          id,
          user_id: userId,
        },
      });

      if (!order) {
        ctx.body = Response.error("订单不存在");
        return;
      }

      // 只能删除已取消或已完成的订单
      if (!["cancelled", "completed"].includes(order.status)) {
        ctx.body = Response.error("只能删除已取消或已完成的订单");
        return;
      }

      // 删除订单项
      await OrderItem.destroy({
        where: { order_id: id },
      });

      // 删除订单
      await order.destroy();

      ctx.body = Response.success(null, "删除成功");
    } catch (error) {
      console.error("删除订单失败:", error);
      ctx.body = Response.error("删除订单失败");
    }
  }

  // 更新订单状态
  static async updateOrderStatus(ctx) {
    const t = await sequelize.transaction();
    try {
      const { id } = ctx.params;
      const { status } = ctx.request.body;

      const order = await Order.findByPk(id, { transaction: t });
      if (!order) {
        ctx.body = Response.error("订单不存在");
        return;
      }

      // 验证状态转换的合法性
      const validTransitions = {
        pending: ["cancelled"],
        paid: ["shipped"],
        shipped: ["completed"],
      };

      if (!validTransitions[order.status]?.includes(status)) {
        ctx.body = Response.error("非法的状态转换");
        return;
      }

      // 如果是取消订单，需要恢复商品库存
      if (status === "cancelled") {
        const orderItems = await OrderItem.findAll({
          where: { order_id: id },
          transaction: t,
        });

        for (const item of orderItems) {
          await Product.increment(
            { stock: item.quantity },
            { where: { id: item.product_id }, transaction: t }
          );
        }
      }

      await order.update({ status }, { transaction: t });
      await t.commit();

      ctx.body = Response.success(order);
    } catch (error) {
      await t.rollback();
      console.error("更新订单状态失败:", error);
      ctx.body = Response.error("更新订单状态失败");
    }
  }

  // 获取用户订单列表
  static async getUserOrders(ctx) {
    try {
      const userId = ctx.state.user.id;
      const orders = await Order.findAll({
        where: { user_id: userId },
        include: [
          {
            model: OrderItem,
            include: [
              {
                model: Product,
                attributes: ["id", "name", "image"],
              },
            ],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      ctx.body = Response.success(orders);
    } catch (error) {
      console.error("获取用户订单列表失败:", error);
      ctx.body = Response.error("获取用户订单列表失败");
    }
  }

  // 支付订单
  static async payOrder(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;

      const order = await Order.findOne({
        where: { id, user_id: userId },
      });

      if (!order) {
        ctx.body = Response.error("订单不存在");
        return;
      }

      if (order.status !== "pending") {
        ctx.body = Response.error("订单状态错误，只能支付待支付的订单");
        return;
      }

      // TODO: 实际项目中这里需要对接支付系统
      // 这里仅作为演示，直接将订单状态改为已支付
      await order.update({ status: "paid" });

      ctx.body = Response.success(null, "支付成功");
    } catch (error) {
      console.error("支付订单失败:", error);
      ctx.body = Response.error("支付订单失败");
    }
  }
}

module.exports = OrderController;
