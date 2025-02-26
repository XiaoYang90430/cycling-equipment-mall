const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");

const Article = sequelize.define(
  "Article",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    summary: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cover_image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    tags: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    comment_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "archived"),
      defaultValue: "draft",
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

// 建立关联关系
Article.belongsTo(User, { foreignKey: "author_id", as: "author" });

module.exports = Article;
