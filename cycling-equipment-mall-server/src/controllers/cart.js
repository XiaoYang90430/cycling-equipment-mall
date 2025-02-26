const Cart = require("../models/cart");
const Product = require("../models/product");
const Response = require("../utils/response");

class CartController {
  // 获取购物车列表
  static async getCartList(ctx) {
    try {
      const userId = ctx.state.user.id;
      const cartItems = await Cart.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Product,
            attributes: ["id", "name", "price", "image", "stock"],
          },
        ],
      });
      ctx.body = Response.success(cartItems);
    } catch (error) {
      console.error("获取购物车失败:", error);
      ctx.body = Response.error("获取购物车失败");
    }
  }

  // 添加商品到购物车
  static async addToCart(ctx) {
    try {
      const userId = ctx.state.user.id; // 从 token 中获取用户 ID
      const { productId, quantity } = ctx.request.body;

      let cartItem = await Cart.findOne({
        where: { user_id: userId, product_id: productId },
      });

      if (cartItem) {
        cartItem.quantity += quantity; // 如果已存在，增加数量
        await cartItem.save();
      } else {
        cartItem = await Cart.create({
          user_id: userId,
          product_id: productId,
          quantity,
        });
      }

      ctx.body = Response.success(cartItem);
    } catch (error) {
      console.error("添加到购物车失败:", error);
      ctx.body = Response.error("添加到购物车失败");
    }
  }

  // 更新购物车商品数量
  static async updateCartItem(ctx) {
    try {
      const { id } = ctx.params;
      const { quantity } = ctx.request.body;

      const cartItem = await Cart.findOne({
        where: { id: id, user_id: ctx.state.user.id },
      });

      if (!cartItem) {
        ctx.body = Response.error("购物车商品不存在");
        return;
      }

      cartItem.quantity = quantity;
      await cartItem.save();

      ctx.body = Response.success(null, "更新成功");
    } catch (error) {
      console.error("更新购物车失败:", error);
      ctx.body = Response.error("更新购物车失败");
    }
  }

  // 删除购物车商品
  static async removeFromCart(ctx) {
    try {
      const { id } = ctx.params;

      const result = await Cart.destroy({
        where: { id: id, user_id: ctx.state.user.id },
      });

      if (result) {
        ctx.body = Response.success(null, "删除成功");
      } else {
        ctx.body = Response.error("购物车商品不存在");
      }
    } catch (error) {
      console.error("删除购物车失败:", error);
      ctx.body = Response.error("删除购物车失败");
    }
  }

  // 清空购物车
  static async clearCart(ctx) {
    try {
      const userId = ctx.state.user.id;

      const result = await Cart.destroy({
        where: { user_id: userId },
      });

      if (result) {
        ctx.body = Response.success(null, "清空成功");
      } else {
        ctx.body = Response.error("购物车为空");
      }
    } catch (error) {
      console.error("清空购物车失败:", error);
      ctx.body = Response.error("清空购物车失败");
    }
  }

  // 获取购物车商品数量
  static async getCartCount(ctx) {
    try {
      const userId = ctx.state.user.id;

      const count = await Cart.count({
        where: { user_id: userId },
      });

      ctx.body = Response.success(count);
    } catch (error) {
      console.error("获取购物车数量失败:", error);
      ctx.body = Response.error("获取购物车数量失败");
    }
  }
}

module.exports = CartController;
