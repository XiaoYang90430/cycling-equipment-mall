<template>
    <div class="users-view">
        <el-card class="table-card">
            <template #header>
                <div class="card-header">
                    <span>用户管理</span>
                    <el-button type="primary" @click="handleAdd">添加用户</el-button>
                </div>
            </template>

            <!-- 搜索栏 -->
            <div class="search-bar">
                <el-input v-model="searchQuery" placeholder="搜索用户名或邮箱" clearable @clear="handleSearch"
                    @keyup.enter="handleSearch">
                    <template #append>
                        <el-button @click="handleSearch">
                            <el-icon>
                                <Search />
                            </el-icon>
                        </el-button>
                    </template>
                </el-input>
                <el-select v-model="roleFilter" placeholder="用户角色" clearable @change="handleSearch">
                    <el-option label="普通用户" value="user" />
                    <el-option label="管理员" value="admin" />
                </el-select>
            </div>

            <!-- 用户表格 -->
            <el-table v-loading="loading" :data="users" style="width: 100%" border>
                <el-table-column type="index" label="序号" width="80" />
                <el-table-column prop="username" label="用户名" width="150" />
                <el-table-column prop="email" label="邮箱" width="200" />
                <el-table-column prop="role" label="角色" width="120">
                    <template #default="{ row }">
                        <el-tag :type="row.role === 'admin' ? 'danger' : ''">
                            {{ row.role === 'admin' ? '管理员' : '普通用户' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="avatar" label="头像" width="100">
                    <template #default="{ row }">
                        <el-avatar v-if="row.avatar" :src="baseUrl + row.avatar" />
                        <el-avatar v-else :icon="UserFilled" />
                    </template>
                </el-table-column>
                <el-table-column prop="created_at" label="注册时间" width="180">
                    <template #default="{ row }">
                        {{ formatDate(row.created_at) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
                        <el-button type="danger" size="small" @click="handleDelete(row)"
                            :disabled="row.role === 'admin'">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页器 -->
            <div class="pagination-container">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </el-card>

        <!-- 用户表单对话框 -->
        <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '添加用户' : '编辑用户'" width="500px">
            <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" :disabled="dialogType === 'edit'" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="form.email" />
                </el-form-item>
                <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
                    <el-input v-model="form.password" type="password" show-password />
                </el-form-item>
                <el-form-item label="角色" prop="role">
                    <el-select v-model="form.role" placeholder="请选择角色">
                        <el-option label="普通用户" value="user" />
                        <el-option label="管理员" value="admin" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleSubmit" :loading="submitting">
                        确定
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, UserFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userAPI } from '@/api/user'

const baseUrl = 'http://localhost:3000'
const loading = ref(false)
const submitting = ref(false)
const users = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const roleFilter = ref('')
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)

// 表单数据
const form = ref({
    username: '',
    email: '',
    password: '',
    role: 'user'
})

// 表单验证规则
const rules = {
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
    role: [
        { required: true, message: '请选择角色', trigger: 'change' }
    ]
}

// 获取用户列表
const fetchUsers = async () => {
    loading.value = true
    try {
        const params = {
            page: currentPage.value,
            pageSize: pageSize.value,
            search: searchQuery.value,
            role: roleFilter.value
        }
        const data = await userAPI.getUsers(params)
        users.value = data.items
        total.value = data.total
    } catch (error) {
        console.error('获取用户列表失败:', error)
        ElMessage.error('获取用户列表失败')
    } finally {
        loading.value = false
    }
}

// 搜索
const handleSearch = () => {
    currentPage.value = 1
    fetchUsers()
}

// 分页
const handleSizeChange = (val) => {
    pageSize.value = val
    fetchUsers()
}

const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchUsers()
}

// 添加用户
const handleAdd = () => {
    dialogType.value = 'add'
    form.value = {
        username: '',
        email: '',
        password: '',
        role: 'user'
    }
    dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row) => {
    dialogType.value = 'edit'
    form.value = {
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role
    }
    dialogVisible.value = true
}

// 删除用户
const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm('确定要删除该用户吗？删除后不可恢复', '警告', {
            type: 'warning'
        })
        await userAPI.deleteUser(row.id)
        ElMessage.success('删除成功')
        fetchUsers()
    } catch (error) {
        if (error !== 'cancel') {
            console.error('删除用户失败:', error)
            ElMessage.error(error.response?.data?.message || '删除用户失败')
        }
    }
}

// 提交表单
const handleSubmit = async () => {
    if (!formRef.value) return

    try {
        await formRef.value.validate()
        submitting.value = true

        if (dialogType.value === 'add') {
            await userAPI.createUser(form.value)
            ElMessage.success('添加成功')
        } else {
            await userAPI.updateUser(form.value.id, {
                email: form.value.email,
                role: form.value.role
            })
            ElMessage.success('更新成功')
        }

        dialogVisible.value = false
        fetchUsers()
    } catch (error) {
        if (error.name !== 'ValidationError') {
            console.error('操作失败:', error)
            ElMessage.error(error.response?.data?.message || '操作失败')
        }
    } finally {
        submitting.value = false
    }
}

// 格式化日期
const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleString()
}

onMounted(() => {
    fetchUsers()
})
</script>

<style scoped>
.users-view {
    min-height: 100%;
}

.table-card {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.search-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 15px;
}

.search-bar .el-input {
    width: 300px;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.dialog-footer {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>