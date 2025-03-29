# 骑行装备商城
![Image](https://raw.githubusercontent.com/XiaoYang90430/cycling-equipment-mall/main/img/Snipaste_2025-03-25_15-31-27.jpg)

![Image](https://raw.githubusercontent.com/XiaoYang90430/cycling-equipment-mall/main/img/Snipaste_2025-03-25_15-30-27.jpg)

![Image](https://raw.githubusercontent.com/XiaoYang90430/cycling-equipment-mall/main/img/Snipaste_2025-03-25_15-30-45.jpg)

![Image](https://raw.githubusercontent.com/XiaoYang90430/cycling-equipment-mall/main/img/Snipaste_2025-03-25_15-32-10.jpg)

![Image](https://raw.githubusercontent.com/XiaoYang90430/cycling-equipment-mall/main/img/Snipaste_2025-03-25_15-32-24.jpg)

![Image](https://raw.githubusercontent.com/XiaoYang90430/cycling-equipment-mall/main/img/Snipaste_2025-03-25_15-32-29.jpg)

![Image](https://raw.githubusercontent.com/XiaoYang90430/cycling-equipment-mall/main/img/Snipaste_2025-03-25_15-32-36.jpg)
这是一个基于前后端分离架构的骑行装备电商商城项目，包含了完整的电商功能流程。通过该系统，用户可以浏览和购买骑行装备，管理员可以管理商品、订单、用户和文章等内容。

## 项目特点

- **完整的电商功能流程**：包括商品展示、购物车、订单管理以及后台管理。
- **前后端分离架构**：前端采用 Vue 3，后端采用 Node.js 和 Koa2，数据通过 RESTful API 进行交互。
- **响应式 UI 设计**：商城界面适应不同设备（如手机、平板、电脑）的屏幕尺寸。
- **权限管理**：支持普通用户和管理员权限的控制，确保系统安全。
- **安全特性**：包括 JWT 用户认证、密码加密存储、图片上传限制等。
- **模块化代码结构**：项目结构清晰，便于维护和扩展。

## 技术栈

### 前端

- **Vue 3**：用于构建响应式用户界面。
- **Element Plus**：UI 组件框架，提供丰富的组件和样式。
- **Vue Router**：用于管理前端路由。
- **Axios**：发送 HTTP 请求，用于与后端 API 交互。

### 后端

- **Node.js**：用于构建后端服务器。
- **Koa2**：Node.js 的 Web 应用框架，简洁、灵活。
- **MySQL**：关系型数据库，用于存储数据。
- **Sequelize ORM**：用于简化与 MySQL 数据库的交互。

## 项目结构

├── frontend/              # 前端代码
│   ├── public/            # 公共资源文件
│   ├── src/               # 前端源代码
│   │   ├── assets/        # 图片、字体等静态资源
│   │   ├── components/    # 公共组件
│   │   ├── views/         # 页面视图
│   │   ├── router/        # 路由配置
│   │   ├── store/         # Vuex 状态管理
│   │   ├── utils/         # 工具函数
│   │   └── App.vue        # 根组件
│   └── package.json       # 前端依赖和配置
└── backend/               # 后端代码
├── controllers/       # 控制器，处理请求
├── models/            # 数据模型
├── routes/            # 路由配置
├── services/          # 业务逻辑
├── utils/             # 工具函数
├── config/            # 配置文件
├── app.js             # 后端入口文件
└── package.json       # 后端依赖和配置


## 安装与运行

### 1. 克隆仓库

```bash
git clone https://github.com/XiaoYang90430/cycling-equipment-mall.git
2. 安装前端依赖
bash
cd cycling-equipment-mall
npm install
3. 安装后端依赖
bash
cd cycling-equipment-mall-server
npm install
4. 配置环境变量
在 .env 文件，设置数据库连接信息和 JWT 密钥：

bash
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=cycling_mall
JWT_SECRET=cycling_mall_secret_key_2024_03_18_v1

5. 启动 MySQL 数据库
确保您的 MySQL 数据库已启动，并且数据库已创建。

cd cycling-equipment-mall-server
npm run dev(想要更改模型时注意灵活修改app.js中的force,可自行查询用法)


6. 启动后端服务
bash
cd cycling-equipment-mall-server
npm run dev
7. 启动前端服务
bash
cd cycling-equipment-mall
npm run dev
8. 访问商城
在浏览器中打开 localhost:5173，即可访问前台页面。
在浏览器中打开 localhost:5173/admin/login，即可访问后台页面

功能说明
用户模块
登录/注册：用户可以注册账户并登录。
个人信息管理：用户可以查看和修改个人信息。
购物车：用户可以添加、删除商品，修改商品数量，进行结算。
订单管理：用户可以查看历史订单及订单详情。
管理员模块
商品管理：管理员可以添加、编辑、删除商品，管理商品库存。
订单管理：管理员可以查看和管理订单。
用户管理：管理员可以查看和管理用户信息。
文章管理：管理员可以发布、编辑和管理商城的文章。
安全特性
JWT 认证：用户登录后会获得一个 JWT token，用于后续的请求认证。
密码加密存储：用户密码在存储前会进行加密处理，保障用户数据安全。
上传文件限制：对图片文件进行类型和大小限制，避免恶意文件上传。
跨域处理：前后端分离的架构通过 CORS 跨域机制进行数据交互。
代码贡献
欢迎代码贡献！如果您有任何建议或发现了问题，请提交 Issues 或 Pull Request。

开源协议
该项目使用 MIT 许可证进行开源，详情请参见 LICENSE。

联系方式
如有任何问题或建议，欢迎通过以下方式与我们联系：

邮箱：2990640551@qq.com
GitHub：https://github.com/XiaoYang90430/cycling-equipment-mall/issues


