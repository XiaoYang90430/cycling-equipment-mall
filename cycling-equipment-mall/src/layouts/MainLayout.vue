<template>
    <div class="main-layout">
        <!-- 顶部导航栏 -->
        <div class="site-topbar">
            <div class="container">
                <div class="topbar-nav">
                    <router-link to="/">首页</router-link>
                    <!-- <router-link to="/shop">商城</router-link>
                    <router-link to="/about">关于我们</router-link> -->
                </div>
                <div class="topbar-info">
                    <template v-if="!isLogin">
                        <a href="#" @click="login">登录</a>
                        <span class="sep">|</span>
                        <a href="#" @click="register">注册</a>
                        <span class="sep">|</span>
                        <a href="#" @click="handleCartClick" class="cart">
                            <el-badge :value="cartItemCount" class="cart-badge">
                                购物车
                            </el-badge>
                        </a>
                    </template>
                    <template v-else>
                        <el-dropdown @command="handleCommand">
                            <span class="el-dropdown-link">
                                {{ username }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                                    <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                                    <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                        <span class="sep">|</span>
                        <router-link to="/cart" class="cart">
                            <el-badge :value="cartItemCount" class="cart-badge">
                                购物车
                            </el-badge>
                        </router-link>
                    </template>
                </div>
            </div>
        </div>

        <!-- 主导航栏 -->
        <div class="site-header">
            <div class="container">
                <div class="header-logo">
                    <!-- <img src="@/assets/logo.png" alt="Logo"> -->
                </div>
                <div class="header-nav">
                    <el-menu mode="horizontal" :router="true" class="main-menu">
                        <el-menu-item index="/bikes">自行车</el-menu-item>
                        <el-menu-item index="/helmets">头盔</el-menu-item>
                        <el-menu-item index="/clothing">骑行服</el-menu-item>
                        <el-menu-item index="/accessories">配件</el-menu-item>
                        <el-menu-item index="/shoes">骑行鞋</el-menu-item>
                        <el-menu-item index="/articles">骑行资讯</el-menu-item>
                    </el-menu>
                </div>
                <div class="header-search">
                    <el-input v-model="searchKeyword" placeholder="搜索商品" class="search-input"
                        @keyup.enter="handleSearch">
                        <template #append>
                            <el-button @click="handleSearch">搜索</el-button>
                        </template>
                    </el-input>
                </div>
                <!-- <div class="header-right">
                    <el-button type="text" class="cart-btn" @click="$router.push('/cart')">
                        <el-badge :value="cartItemCount" :max="99">
                            <el-icon>
                                <ShoppingCart />
                            </el-icon>
                            购物车
                        </el-badge>
                    </el-button>
                </div> -->
            </div>
        </div>

        <!-- 主要内容区 -->
        <main class="main-content">
            <router-view></router-view>
        </main>

        <!-- 页脚 -->
        <footer class="site-footer">
            <div class="container">
                <div class="footer-service">
                    <ul class="list-service">
                        <li><i class="el-icon-success"></i>品质保证</li>
                        <li><i class="el-icon-time"></i>快速发货</li>
                        <li><i class="el-icon-service"></i>售后无忧</li>
                        <li><i class="el-icon-location"></i>全国联保</li>
                    </ul>
                </div>
                <div class="footer-links">
                    <dl>
                        <dt>帮助中心</dt>
                        <dd>购物指南</dd>
                        <dd>支付方式</dd>
                        <dd>配送方式</dd>
                    </dl>
                    <dl>
                        <dt>服务支持</dt>
                        <dd>售后政策</dd>
                        <dd>自助服务</dd>
                        <dd>相关下载</dd>
                    </dl>
                    <dl>
                        <dt>关于我们</dt>
                        <dd>关于商城</dd>
                        <dd>加入我们</dd>
                        <dd>联系我们</dd>
                    </dl>
                </div>
            </div>
        </footer>

        <!-- 登录对话框 -->
        <el-dialog v-model="loginDialogVisible" title="登录" width="400px">
            <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef">
                <el-form-item prop="username" label="用户名">
                    <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item prop="password" label="密码">
                    <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="loginDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleLogin">登录</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 注册对话框 -->
        <el-dialog v-model="registerDialogVisible" title="注册" width="400px">
            <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef">
                <el-form-item prop="username" label="用户名">
                    <el-input v-model="registerForm.username" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item prop="email" label="邮箱">
                    <el-input v-model="registerForm.email" placeholder="请输入邮箱"></el-input>
                </el-form-item>
                <el-form-item prop="password" label="密码">
                    <el-input v-model="registerForm.password" type="password" placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item prop="confirmPassword" label="确认密码">
                    <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="registerDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleRegister">注册</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ArrowDown, ShoppingCart } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { cartAPI } from '@/api/cart'
import { userAPI } from "@/api/user"

const router = useRouter()
const loginFormRef = ref(null)
const registerFormRef = ref(null)

// 登录相关
const isLogin = ref(false)
const username = ref('用户名')
const loginDialogVisible = ref(false)
const loginForm = reactive({
    username: '',
    password: ''
})

// 检查登录状态
const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

    if (token && userInfo) {
        isLogin.value = true;
        username.value = userInfo.username;
        updateCartCount();
    } else {
        isLogin.value = false;
        username.value = "用户名";
        cartItemCount.value = 0;
    }
};

onMounted(() => {
    checkLoginStatus();
});

const loginRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ]
}

// 注册相关
const registerDialogVisible = ref(false)
const registerForm = reactive({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
})

const registerRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value !== registerForm.password) {
                    callback(new Error('两次输入的密码不一致'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ]
}

// 其他状态
const searchKeyword = ref('')
const cartItemCount = ref(0)

// 处理登录
const login = () => {
    loginDialogVisible.value = true
}

const handleLogin = async () => {
    try {
        await loginFormRef.value.validate();
        const res = await userAPI.login(loginForm);
        console.log("Login response:", res);

        // 保存 token 和用户信息，确保 token 格式正确
        const token = res.token.startsWith('Bearer ')
            ? res.token
            : `Bearer ${res.token}`;
        localStorage.setItem("token", token);
        localStorage.setItem("userInfo", JSON.stringify(res.user));

        isLogin.value = true;
        username.value = res.user.username;
        loginDialogVisible.value = false;

        ElMessage.success("登录成功");

        // 重置表单
        loginForm.username = "";
        loginForm.password = "";

        // 更新购物车数量
        updateCartCount();
    } catch (error) {
        console.error("登录失败:", error);
        ElMessage.error(error.message || "登录失败");
    }
};

// 处理注册
const register = () => {
    registerDialogVisible.value = true
}

const handleRegister = async () => {
    try {
        await registerFormRef.value.validate();
        await userAPI.register(registerForm);

        ElMessage.success("注册成功，请登录");
        registerDialogVisible.value = false;
        loginDialogVisible.value = true;

        // 重置表单
        registerForm.username = "";
        registerForm.email = "";
        registerForm.password = "";
        registerForm.confirmPassword = "";
    } catch (error) {
        console.error("注册失败:", error);
        ElMessage.error(error.message || "注册失败");
    }
};

// 处理购物车点击
const handleCartClick = () => {
    if (!isLogin.value) {
        ElMessage.warning('请先登录')
        loginDialogVisible.value = true
        return
    }
    // 跳转到购物车页面
    router.push('/cart')
}

// 处理下拉菜单命令
const handleCommand = (command) => {
    switch (command) {
        case 'profile':
            handleProfile()
            break
        case 'orders':
            handleOrders()
            break
        case 'logout':
            handleLogout()
            break
    }
}

// 处理个人中心
const handleProfile = () => {
    router.push('/profile')
}

// 处理我的订单
const handleOrders = () => {
    router.push('/orders')
}

// 处理退出登录
const handleLogout = async () => {
    try {
        // 先清除本地存储的token和用户信息
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");

        // 重置状态
        isLogin.value = false;
        username.value = "用户名";
        cartItemCount.value = 0;

        // 通知后端（如果失败也不影响前端退出）
        try {
            await userAPI.logout();
        } catch (error) {
            console.error("通知后端退出失败:", error);
        }

        ElMessage.success("退出成功");

        // 如果当前在需要登录的页面，跳转到首页
        const requiresAuthRoutes = ["/cart", "/profile", "/orders"];
        if (requiresAuthRoutes.includes(router.currentRoute.value.path)) {
            router.push("/");
        }
    } catch (error) {
        console.error("退出失败:", error);
        ElMessage.error("退出失败");
    }
};

// 监听打开登录对话框的事件
onMounted(() => {
    window.addEventListener('openLogin', () => {
        loginDialogVisible.value = true
    })
})

// 在组件卸载时移除事件监听
onUnmounted(() => {
    window.removeEventListener('openLogin', () => {
        loginDialogVisible.value = true
    })
})

const updateCartCount = async () => {
    if (localStorage.getItem('token')) {
        try {
            const count = await cartAPI.getCartCount();
            cartItemCount.value = count;
        } catch (error) {
            console.error('获取购物车数量失败:', error);
        }
    }
};

// 监听加入购物车事件
window.addEventListener('cartUpdated', updateCartCount);

onMounted(() => {
    updateCartCount();
});

onUnmounted(() => {
    window.removeEventListener('cartUpdated', updateCartCount);
});

const handleSearch = () => {
    const keyword = searchKeyword.value.trim();
    if (keyword) {
        router.push({
            path: '/search',
            query: { keyword }
        });
        searchKeyword.value = '';
    } else {
        ElMessage.warning('请输入搜索关键词');
    }
};
</script>

<style scoped>
.main-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.container {
    width: 1226px;
    margin: 0 auto;
}

/* 顶部导航栏样式 */
.site-topbar {
    height: 40px;
    background-color: #1a1b1c;
    color: #b0b0b0;
    font-size: 12px;
}

.site-topbar .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
}

.topbar-nav a,
.topbar-info a {
    color: #b0b0b0;
    text-decoration: none;
    padding: 0 10px;
}

.topbar-nav a:hover,
.topbar-info a:hover {
    color: #fff;
}

.sep {
    color: #424242;
    margin: 0 5px;
}

/* 主导航栏样式 */
.site-header {
    height: 100px;
    background: linear-gradient(to right, #fff, #f8f9fa);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.site-header .container {
    display: flex;
    align-items: center;
    height: 100%;
}

.header-logo {
    width: 200px;
}

.header-logo img {
    height: 60px;
}

.header-nav {
    flex: 1;
}

.main-menu {
    border-bottom: none;
    background: transparent;
}

.main-menu .el-menu-item {
    font-size: 16px;
    color: #2c3e50;
}

.main-menu .el-menu-item:hover {
    color: #42b983;
}

.main-menu .el-menu-item.is-active {
    color: #42b983;
    border-bottom: 2px solid #42b983;
}

.header-search {
    width: 300px;
}

/* 主要内容区样式 */
.main-content {
    flex: 1;
    background-color: #f5f5f5;
    padding: 20px 0;
}

/* 页脚样式 */
.site-footer {
    background: linear-gradient(to right, #2c3e50, #3498db);
    color: white;
    padding: 40px 0;
}

.footer-service {
    padding: 20px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.list-service {
    display: flex;
    justify-content: space-around;
    list-style: none;
}

.list-service li {
    display: flex;
    align-items: center;
    font-size: 16px;
    color: #fff;
}

.list-service i {
    margin-right: 5px;
    font-size: 24px;
    color: #42b983;
}

.footer-links {
    display: flex;
    justify-content: space-between;
    padding-top: 40px;
}

.footer-links dl {
    text-align: left;
}

.footer-links dt {
    font-size: 16px;
    color: #fff;
    margin-bottom: 10px;
}

.footer-links dd {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    margin: 5px 0;
    cursor: pointer;
}

.footer-links dd:hover {
    color: #42b983;
}

/* 购物车样式 */
.cart {
    position: relative;
}

.cart-badge {
    margin-left: 5px;
}

/* 修改搜索框样式 */
.header-search .el-input__inner {
    border-radius: 20px 0 0 20px;
    border-right: none;
}

.header-search .el-input-group__append button {
    background-color: #42b983;
    border-color: #42b983;
    color: white;
    border-radius: 0 20px 20px 0;
}

.header-search .el-input-group__append button:hover {
    background-color: #3aa876;
    border-color: #3aa876;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>