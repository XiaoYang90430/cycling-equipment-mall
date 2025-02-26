import { createRouter, createWebHistory } from "vue-router";
import { ElMessage } from "element-plus";

const routes = [
  {
    path: "/",
    component: () => import("@/layouts/MainLayout.vue"),
    children: [
      {
        path: "", //首页
        name: "Home",
        component: () => import("@/views/Home.vue"),
      },
      {
        path: "/bikes", //自行车
        name: "Bikes",
        component: () => import("@/views/bikes/index.vue"),
        meta: { category: "自行车" },
      },
      {
        path: "/helmets", //头盔
        name: "Helmets",
        component: () => import("@/views/helmets/index.vue"),
        meta: { category: "头盔" },
      },
      {
        path: "/clothing", //骑行服
        name: "Clothing",
        component: () => import("@/views/clothing/index.vue"),
        meta: { category: "骑行服" },
      },
      {
        path: "/shoes", //鞋子
        name: "Shoes",
        component: () => import("@/views/shoes/index.vue"),
        meta: { category: "骑行鞋" },
      },
      {
        path: "/accessories", //配件
        name: "Accessories",
        component: () => import("@/views/accessories/index.vue"),
        meta: { category: "配件" },
      },
      {
        path: "/product/:id", //商品详情
        name: "ProductDetail",
        component: () => import("@/views/ProductDetail.vue"),
      },
      {
        path: "/articles", //文章列表
        name: "ArticleList",
        component: () => import("@/views/articles/ArticleList.vue"),
      },
      {
        path: "/articles/:id", //文章详情
        name: "ArticleDetail",
        component: () => import("@/views/articles/ArticleDetail.vue"),
      },
    ],
  },
  {
    path: "/profile", //个人中心
    name: "Profile",
    component: () => import("@/views/ProfileView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/orders", //订单
    name: "Orders",
    component: () => import("@/views/OrdersView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/cart", //购物车
    name: "Cart",
    component: () => import("@/views/CartView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/order/confirm",
    name: "OrderConfirm",
    component: () => import("@/views/order/OrderConfirm.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/orders/:id",
    name: "OrderDetail",
    component: () => import("@/views/order/OrderDetail.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin",
    component: () => import("@/layouts/AdminLayout.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: "",
        name: "AdminDashboard",
        component: () => import("@/views/admin/DashboardView.vue"),
      },
      {
        path: "users",
        name: "AdminUsers",
        component: () => import("@/views/admin/UsersView.vue"),
      },
      {
        path: "products",
        name: "AdminProducts",
        component: () => import("@/views/admin/ProductsView.vue"),
      },
      {
        path: "orders",
        name: "AdminOrders",
        component: () => import("@/views/admin/OrdersView.vue"),
      },
      {
        path: "articles",
        name: "AdminArticles",
        component: () => import("@/views/admin/ArticlesView.vue"),
      },
    ],
  },
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: () => import("@/views/admin/LoginView.vue"),
  },
  {
    path: '/search',
    name: 'SearchResults',
    component: () => import('@/views/SearchResults.vue'),
    meta: {
      title:'搜索结果'
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");
  const adminUserInfo = JSON.parse(
    localStorage.getItem("adminUserInfo") || "null"
  );

  // 处理后台路由
  if (to.path.startsWith("/admin")) {
    if (to.path === "/admin/login") {
      next();
      return;
    }

    if (!adminToken || !adminUserInfo || adminUserInfo.role !== "admin") {
      ElMessage.warning("需要管理员权限");
      next("/admin/login");
      return;
    }

    next();
    return;
  }

  // 处理前台需要登录的路由
  if (to.meta.requiresAuth && !token) {
    ElMessage.warning("请先登录");
    next("/");
    window.dispatchEvent(new CustomEvent("openLogin"));
    return;
  }

  next();
});

export default router;
