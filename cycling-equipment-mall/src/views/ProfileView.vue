<template>
    <div class="profile-view">
        <div class="container">
            <el-button @click="goBack" type="primary" class="back-button">返回</el-button>
            <el-card class="profile-card">
                <template #header>
                    <div class="card-header">
                        <h2>个人信息</h2>
                        <el-button type="primary" @click="handleEdit">编辑资料</el-button>
                    </div>
                </template>
                <div class="profile-info" v-loading="loading">
                    <div class="avatar-container">
                        <el-upload class="avatar-uploader" :action="uploadUrl" :show-file-list="false"
                            :before-upload="beforeAvatarUpload" :http-request="customUpload" name="avatar"
                            accept="image/jpeg,image/png,image/gif">
                            <el-avatar v-if="userInfo.avatar" :size="100" :src="baseUrl + userInfo.avatar" />
                            <el-avatar v-else :size="100">
                                {{ userInfo.username?.charAt(0)?.toUpperCase() }}
                            </el-avatar>
                            <div class="avatar-hover">
                                <el-icon>
                                    <Camera />
                                </el-icon>
                                <span>更换头像</span>
                            </div>
                        </el-upload>
                    </div>
                    <div class="info-list">
                        <div class="info-item">
                            <span class="label">用户名：</span>
                            <span class="value">{{ userInfo.username }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">邮箱：</span>
                            <span class="value">{{ userInfo.email || '未设置' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">手机：</span>
                            <span class="value">{{ userInfo.phone || '未设置' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">注册时间：</span>
                            <span class="value">{{ formatDate(userInfo.created_at) }}</span>
                        </div>
                    </div>
                </div>
            </el-card>

            <!-- 编辑个人信息对话框 -->
            <el-dialog v-model="dialogVisible" title="编辑个人信息" width="500px">
                <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" status-icon>
                    <el-form-item label="用户名" prop="username">
                        <el-input v-model="form.username" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="form.email"></el-input>
                    </el-form-item>
                    <el-form-item label="新密码" prop="newPassword">
                        <el-input v-model="form.newPassword" type="password" placeholder="不修改请留空"></el-input>
                    </el-form-item>
                    <el-form-item label="确认新密码" prop="confirmPassword" v-if="form.newPassword">
                        <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入新密码"></el-input>
                    </el-form-item>
                    <el-form-item label="当前密码" prop="currentPassword">
                        <el-input v-model="form.currentPassword" type="password" placeholder="请输入当前密码"></el-input>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <div class="dialog-footer">
                        <el-button @click="dialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="handleSubmit">确认</el-button>
                    </div>
                </template>
            </el-dialog>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { userAPI } from '@/api/user'
import { Camera } from "@element-plus/icons-vue"
import axios from 'axios'

const router = useRouter()

const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const userInfo = ref({})

// 表单数据
const form = reactive({
    username: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
    currentPassword: '',
    phone: '',
})

// 表单验证规则
const rules = {
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
    ],
    newPassword: [
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    ],
    confirmPassword: [
        {
            validator: (rule, value, callback) => {
                if (form.newPassword && value !== form.newPassword) {
                    callback(new Error('两次输入的密码不一致'))
                } else {
                    callback()
                }
            },
            trigger: 'blur',
        },
    ],
    currentPassword: [
        { required: true, message: '请输入当前密码', trigger: 'blur' },
    ],
}

// 获取用户信息
const fetchUserInfo = async () => {
    loading.value = true
    try {
        const data = await userAPI.getProfile()
        userInfo.value = data
    } catch (error) {
        console.error('获取用户信息失败:', error)
        ElMessage.error('获取用户信息失败')
    } finally {
        loading.value = false
    }
}

// 打开编辑对话框
const handleEdit = () => {
    form.username = userInfo.value.username
    form.email = userInfo.value.email
    form.newPassword = ''
    form.confirmPassword = ''
    form.currentPassword = ''
    dialogVisible.value = true
}

// 提交修改
const handleSubmit = async () => {
    if (!formRef.value) return

    try {
        await formRef.value.validate()
        const updateData = {
            email: form.email,
        }

        // 如果有输入新密码，添加密码相关字段
        if (form.newPassword) {
            updateData.newPassword = form.newPassword
            updateData.currentPassword = form.currentPassword
        }

        await userAPI.updateProfile(updateData)
        ElMessage.success('修改成功')
        dialogVisible.value = false
        fetchUserInfo() // 刷新用户信息

        // 重置表单
        form.newPassword = ''
        form.confirmPassword = ''
        form.currentPassword = ''
    } catch (error) {
        console.error('修改失败:', error)
        ElMessage.error(error.response?.data?.message || '修改失败')
    }
}

// 格式化日期
const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString()
}

// 返回按钮处理
const goBack = () => {
    router.go(-1) // 返回到上一个页面
}

// 添加基础URL
const baseUrl = "http://localhost:3000";

// 上传相关
const uploadUrl = `${baseUrl}/api/users/avatar`;

// 自定义上传方法
const customUpload = async (options) => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("未登录或登录已过期");
        }

        const formData = new FormData();
        formData.append('avatar', options.file);

        const response = await axios.post(uploadUrl, formData, {
            headers: {
                'Authorization': token,
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.code === 0) {
            userInfo.value.avatar = response.data.data.avatarUrl;
            ElMessage.success("头像上传成功");
            // 刷新用户信息
            fetchUserInfo();
        } else {
            throw new Error(response.data.message);
        }
    } catch (error) {
        console.error('Upload error:', error);
        if (error.response?.data?.message) {
            ElMessage.error(error.response.data.message);
        } else {
            ElMessage.error(error.message || "头像上传失败");
        }
    }
};

// 上传前校验
const beforeAvatarUpload = (file) => {
    console.log("准备上传文件:", file);
    const isImage = ["image/jpeg", "image/png", "image/gif"].includes(file.type);
    const isLt5M = file.size / 1024 / 1024 < 5;

    if (!isImage) {
        ElMessage.error("头像必须是图片格式！");
        return false;
    }
    if (!isLt5M) {
        ElMessage.error("头像大小不能超过 5MB！");
        return false;
    }

    // 打印文件信息
    console.log('File info:', {
        name: file.name,
        type: file.type,
        size: file.size,
    });

    return true;
};

onMounted(() => {
    fetchUserInfo()
})
</script>

<style scoped>
.profile-view {
    padding: 20px 0;
    min-height: 100vh;
    background: #f5f7fa;
}

.container {
    width: 1200px;
    margin: 0 auto;
}

.back-button {
    margin-bottom: 20px;
}

.profile-card {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-header h2 {
    margin: 0;
    font-size: 18px;
    color: #303133;
}

.profile-info {
    display: flex;
    padding: 20px;
}

.avatar-container {
    position: relative;
    width: 100px;
    height: 100px;
    margin-right: 40px;
}

.avatar-uploader {
    cursor: pointer;
}

.avatar-hover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #fff;
    opacity: 0;
    transition: opacity 0.3s;
    border-radius: 50%;
}

.avatar-container:hover .avatar-hover {
    opacity: 1;
}

.avatar-hover .el-icon {
    font-size: 20px;
    margin-bottom: 5px;
}

.info-list {
    flex: 1;
}

.info-item {
    margin-bottom: 15px;
    font-size: 14px;
}

.info-item .label {
    color: #909399;
    margin-right: 10px;
    display: inline-block;
    width: 100px;
}

.info-item .value {
    color: #303133;
}

.dialog-footer {
    padding-top: 20px;
    text-align: right;
}
</style>