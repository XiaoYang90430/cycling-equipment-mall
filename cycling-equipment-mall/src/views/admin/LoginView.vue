<template>
    <div class="admin-login">
        <div class="login-left">
            <div class="brand">
                <h1 class="logo-text">骑行装备商城</h1>
                <p class="slogan">Enjoy Life!</p>
                <p class="sub-slogan">生活很短，骑行让它更精彩。</p>
            </div>
            <div class="social-links">
                <a href="#" class="social-link"><i class="el-icon-platform-eleme"></i></a>
                <a href="#" class="social-link"><i class="el-icon-github"></i></a>
                <a href="#" class="social-link"><i class="el-icon-message"></i></a>
                <a href="#" class="social-link"><i class="el-icon-link"></i></a>
            </div>
        </div>
        <div class="login-right">
            <div class="login-container">
                <div class="login-box">
                    <div class="login-header">
                        <h2>后台管理系统</h2>
                    </div>
                    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="0">
                        <el-form-item prop="username">
                            <el-input v-model="loginForm.username" prefix-icon="User" placeholder="请输入管理员账号" />
                        </el-form-item>
                        <el-form-item prop="password">
                            <el-input v-model="loginForm.password" prefix-icon="Lock" type="password" placeholder="请输入密码"
                                show-password />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" :loading="loading" class="login-button" @click="handleLogin">
                                登录系统
                            </el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { userAPI } from '@/api/user'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = ref({
    username: '',
    password: ''
})

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

const handleLogin = async () => {
    if (!loginFormRef.value) return

    try {
        await loginFormRef.value.validate()
        loading.value = true

        const { token, user } = await userAPI.login(loginForm.value)

        if (user.role !== 'admin') {
            ElMessage.error('非管理员账号，无法登录后台')
            return
        }

        localStorage.setItem('adminToken', token)
        localStorage.setItem('adminUserInfo', JSON.stringify(user))

        ElMessage.success('登录成功')
        router.push('/admin')
    } catch (error) {
        if (error.name !== 'ValidationError') {
            console.error('登录失败:', error)
            ElMessage.error(error.response?.data?.message || '登录失败')
        }
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.admin-login {
    height: 100vh;
    display: flex;
    background: url('/images/cycling-bg.jpg') center/cover no-repeat;
}

.login-left {
    flex: 1;
    padding: 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 100%);
    backdrop-filter: blur(10px);
}

.brand {
    color: #fff;
}

.logo-text {
    font-size: 36px;
    font-weight: 600;
    margin-bottom: 20px;
}

.slogan {
    font-size: 24px;
    margin-bottom: 10px;
    font-style: italic;
}

.sub-slogan {
    font-size: 16px;
    opacity: 0.8;
}

.social-links {
    display: flex;
    gap: 20px;
}

.social-link {
    color: #fff;
    font-size: 24px;
    opacity: 0.8;
    transition: all 0.3s;
}

.social-link:hover {
    opacity: 1;
    transform: translateY(-2px);
}

.login-right {
    width: 500px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.login-right::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    z-index: 0;
}

.login-container {
    width: 100%;
    max-width: 360px;
    padding: 40px;
    position: relative;
    z-index: 1;
}

.login-box {
    width: 100%;
}

.login-header {
    text-align: center;
    margin-bottom: 50px;
}

.login-header h2 {
    font-size: 28px;
    color: #fff;
    margin: 0;
    letter-spacing: 2px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    font-weight: 300;
}

.el-input {
    margin-bottom: 25px;
}

:deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: none;
    backdrop-filter: blur(5px);
    transition: all 0.3s;
}

:deep(.el-input__wrapper:hover),
:deep(.el-input__wrapper.is-focus) {
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.15);
}

:deep(.el-input__inner) {
    color: #fff;
    height: 45px;
}

:deep(.el-input__inner::placeholder) {
    color: rgba(255, 255, 255, 0.6);
}

:deep(.el-input__prefix-icon) {
    color: rgba(255, 255, 255, 0.6);
    font-size: 18px;
}

.login-button {
    width: 100%;
    height: 45px;
    font-size: 16px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    letter-spacing: 2px;
    backdrop-filter: blur(5px);
    transition: all 0.3s;
    margin-top: 10px;
}

.login-button:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.login-button:active {
    transform: translateY(0);
}

@media (max-width: 1024px) {
    .login-left {
        display: none;
    }
    
    .login-right {
        width: 100%;
    }

    .login-container {
        max-width: 320px;
    }
}
</style>