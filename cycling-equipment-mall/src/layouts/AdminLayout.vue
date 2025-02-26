<template>
    <div class="admin-layout" :class="{ 'dark-theme': isDarkTheme }">
        <!-- 侧边栏 -->
        <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
            <div class="logo">
                <h1 v-if="!isCollapse">骑行装备交易后台</h1>
                <h1 v-else>骑</h1>
            </div>
            <el-menu :default-active="activeMenu" router :collapse="isCollapse">
                <el-menu-item index="/admin">
                    <el-icon>
                        <DataLine />
                    </el-icon>
                    <span>数据概览</span>
                </el-menu-item>
                <el-menu-item index="/admin/users">
                    <el-icon>
                        <User />
                    </el-icon>
                    <span>用户管理</span>
                </el-menu-item>
                <el-menu-item index="/admin/products">
                    <el-icon>
                        <Goods />
                    </el-icon>
                    <span>商品管理</span>
                </el-menu-item>
                <el-menu-item index="/admin/orders">
                    <el-icon>
                        <List />
                    </el-icon>
                    <span>订单管理</span>
                </el-menu-item>
                <el-menu-item index="/admin/articles">
                    <el-icon>
                        <Document />
                    </el-icon>
                    <span>文章管理</span>
                </el-menu-item>
            </el-menu>
        </el-aside>

        <!-- 主要内容区 -->
        <el-container class="main-container">
            <el-header class="header">
                <div class="header-left">
                    <el-icon class="collapse-btn" @click="toggleSidebar">
                        <Fold v-if="!isCollapse" />
                        <Expand v-else />
                    </el-icon>
                    <el-breadcrumb separator="/">
                        <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
                        <el-breadcrumb-item v-if="currentBreadcrumb">{{ currentBreadcrumb }}</el-breadcrumb-item>
                    </el-breadcrumb>
                </div>
                <div class="header-right">
                    <el-switch v-model="isDarkTheme" inline-prompt :active-icon="Moon" :inactive-icon="Sunny"
                        @change="handleThemeChange" />
                    <el-dropdown @command="handleCommand">
                        <div class="admin-info">
                            <el-avatar :size="32" :src="avatarUrl" />
                            <span class="admin-name">{{ adminUserInfo.username }}</span>
                            <el-icon class="el-icon--right">
                                <CaretBottom />
                            </el-icon>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </el-header>

            <el-main class="main-content">
                <router-view></router-view>
            </el-main>
        </el-container>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
    DataLine,
    User,
    Goods,
    List,
    Document,
    Fold,
    Expand,
    CaretBottom,
    Moon,
    Sunny
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const isDarkTheme = ref(localStorage.getItem('theme') === 'dark')

// 获取当前管理员信息
const adminUserInfo = computed(() => {
    return JSON.parse(localStorage.getItem('adminUserInfo') || '{}')
})

// 获取当前激活的菜单项
const activeMenu = computed(() => route.path)

// 获取当前面包屑导航
const currentBreadcrumb = computed(() => {
    const path = route.path
    const breadcrumbMap = {
        '/admin': '首页',
        '/admin/users': '用户管理',
        '/admin/products': '商品管理',
        '/admin/orders': '订单管理',
        '/admin/articles': '文章管理'
    }
    return breadcrumbMap[path]
})

// 切换侧边栏
const toggleSidebar = () => {
    isCollapse.value = !isCollapse.value
}

// 处理下拉菜单命令
const handleCommand = (command) => {
    if (command === 'logout') {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUserInfo')
        router.push('/admin/login')
        ElMessage.success('已退出登录')
    }
}

// 主题切换处理
const handleThemeChange = (value) => {
    const theme = value ? 'dark' : 'light'
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
}

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const baseUrl = 'http://localhost:3000'

// 处理头像URL
const avatarUrl = computed(() => {
    const avatar = adminUserInfo.value.avatar
    console.log('当前用户信息:', adminUserInfo.value)
    console.log('头像路径:', avatar)
    if (!avatar) return defaultAvatar
    return avatar.startsWith('http') ? avatar : `${baseUrl}${avatar}`
})

onMounted(() => {
    const theme = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', theme)
})
</script>

<style>
:root {
    /* 亮色主题变量 */
    --bg-color: #f5f7fa;
    --header-bg: #ffffff;
    --text-color: #2c3e50;
    --text-color-secondary: #606266;
    --border-color: #e4e7ed;
    --menu-bg: #304156;
    --menu-text: #bfcbd9;
    --menu-active-bg: #263445;
    --menu-hover-text: #ffffff;
    --menu-active-text: #409eff;
    --shadow-color: rgba(0, 21, 41, 0.08);
    --card-bg: #ffffff;
    --hover-bg: #f5f7fa;
    --table-header-bg: #f5f7fa;
    --table-border: #ebeef5;
    --tag-bg: #ecf5ff;
}

:root[data-theme='dark'] {
    /* 暗色主题变量 */
    --bg-color: #141414;
    --header-bg: #1f1f1f;
    --text-color: #e5eaf3;
    --text-color-secondary: #a3a6ad;
    --border-color: #363636;
    --menu-bg: #1f1f1f;
    --menu-text: #a3a6ad;
    --menu-active-bg: #000000;
    --menu-hover-text: #ffffff;
    --menu-active-text: #409eff;
    --shadow-color: rgba(0, 0, 0, 0.2);
    --card-bg: #1f1f1f;
    --hover-bg: #2b2b2b;
    --table-header-bg: #1f1f1f;
    --table-border: #363636;
    --tag-bg: #2b2b2b;
}

/* 添加全局过渡效果 */
* {
    transition: background-color 0.3s ease,
        color 0.3s ease,
        border-color 0.3s ease,
        box-shadow 0.3s ease;
}
</style>

<style scoped>
.admin-layout {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow-x: hidden;
    background-color: var(--bg-color);
    color: var(--text-color);
}

.sidebar {
    background-color: var(--menu-bg);
    color: var(--menu-text);
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    box-shadow: 2px 0 8px var(--shadow-color);
    z-index: 1000;
    transition: all 0.3s cubic-bezier(0.2, 0, 0, 1) 0s;
}

.logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--menu-active-bg);
    overflow: hidden;
    padding: 0 10px;
    transition: all 0.3s cubic-bezier(0.2, 0, 0, 1) 0s;
}

.logo h1 {
    color: #fff;
    font-size: 18px;
    margin: 0;
    font-weight: 600;
    white-space: nowrap;
    transition: all 0.3s cubic-bezier(0.2, 0, 0, 1) 0s;
}

.main-container {
    margin-left: v-bind('isCollapse ? "64px" : "200px"');
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-color);
    transition: all 0.3s cubic-bezier(0.2, 0, 0, 1) 0s;
    min-height: 100vh;
    width: calc(100% - v-bind('isCollapse ? "64px" : "200px"'));
}

.header {
    background: var(--header-bg);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 60px;
    box-shadow: 0 1px 4px var(--shadow-color);
    position: relative;
    z-index: 999;
    color: var(--text-color);
}

.header-left {
    display: flex;
    align-items: center;
    gap: 20px;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 20px;
}

.collapse-btn {
    font-size: 20px;
    cursor: pointer;
    color: var(--text-color-secondary);
    transition: color 0.3s;
}

.collapse-btn:hover {
    color: var(--menu-active-text);
}

.admin-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 2px 8px;
    border-radius: 4px;
    transition: all 0.3s;
}

.admin-info:hover {
    background: var(--hover-bg);
}

.admin-name {
    font-size: 14px;
    color: var(--text-color);
}

.main-content {
    background: var(--bg-color);
    height: calc(100vh - 60px);
    overflow-y: auto;
    padding: 20px;
}

:deep(.el-menu) {
    background-color: var(--menu-bg);
    border-right: none;
    transition: width 0.3s cubic-bezier(0.2, 0, 0, 1) 0s;
}

:deep(.el-menu--collapse) {
    width: 64px;
}

:deep(.el-menu-item) {
    color: var(--menu-text);
    height: 56px;
    line-height: 56px;
    padding: 0 20px;
    font-size: 14px;
    transition: all 0.3s cubic-bezier(0.2, 0, 0, 1) 0s;
}

:deep(.el-menu-item .el-icon) {
    color: var(--menu-text);
    font-size: 18px;
    margin-right: 16px;
    transition: all 0.3s cubic-bezier(0.2, 0, 0, 1) 0s;
}

:deep(.el-menu-item span) {
    opacity: 1;
    transition: opacity 0.3s cubic-bezier(0.2, 0, 0, 1) 0s;
}

:deep(.el-menu--collapse .el-menu-item span) {
    opacity: 0;
}

:deep(.el-menu-item.is-active) {
    color: var(--menu-active-text);
    background-color: var(--menu-active-bg) !important;
}

:deep(.el-menu-item.is-active .el-icon) {
    color: var(--menu-active-text);
}

:deep(.el-menu-item:hover) {
    color: var(--menu-hover-text);
    background-color: var(--menu-active-bg) !important;
}

:deep(.el-menu-item:hover .el-icon) {
    color: var(--menu-hover-text);
}

:deep(.el-breadcrumb) {
    line-height: 1;
}

:deep(.el-breadcrumb__item) {
    display: flex;
    align-items: center;
}

:deep(.el-breadcrumb__inner) {
    color: var(--text-color-secondary);
    font-weight: normal;
    font-size: 14px;
}

:deep(.el-breadcrumb__inner.is-link:hover) {
    color: var(--menu-active-text);
}

:deep(.el-breadcrumb__separator) {
    margin: 0 8px;
    color: var(--text-color-secondary);
}

:deep(.el-switch) {
    --el-switch-on-color: #409eff;
    --el-switch-off-color: #dcdfe6;

    &.is-checked {
        .el-switch__core {
            border-color: var(--menu-active-text);
            background-color: var(--menu-active-text);
        }
    }
}

:deep(.el-dropdown-menu) {
    background-color: var(--card-bg);
    border-color: var(--border-color);
    box-shadow: 0 2px 12px var(--shadow-color);
}

:deep(.el-dropdown-menu__item) {
    color: var(--text-color);

    &:hover {
        background-color: var(--hover-bg);
        color: var(--menu-active-text);
    }
}

/* 优化卡片和表格样式 */
:deep(.el-card) {
    background-color: var(--card-bg);
    border-color: var(--border-color);
    color: var(--text-color);
}

/* 优化表格组件样式 */
:deep(.el-table) {
    --el-table-border-color: var(--border-color);
    --el-table-header-bg-color: var(--table-header-bg);
    --el-table-row-hover-bg-color: var(--hover-bg);
    background-color: var(--card-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);

    &::before {
        display: none;
    }

    .el-table__header {
        th {
            background-color: var(--table-header-bg);
            color: var(--text-color);
            border-bottom: 1px solid var(--border-color);
            font-weight: 600;

            &.is-leaf {
                border-bottom: 1px solid var(--border-color);
            }
        }
    }

    .el-table__body {
        tr {
            background-color: var(--card-bg);

            td {
                border-bottom: 1px solid var(--border-color);
                color: var(--text-color);
                transition: background-color 0.3s ease;
            }

            &:hover>td {
                background-color: var(--hover-bg) !important;
            }

            &.el-table__row--striped {
                td {
                    background-color: var(--hover-bg);
                }
            }
        }
    }

    .el-table__empty-block {
        background-color: var(--card-bg);

        .el-table__empty-text {
            color: var(--text-color-secondary);
        }
    }

    .el-table__append-wrapper {
        background-color: var(--card-bg);
    }

    .el-table__expanded-cell {
        background-color: var(--card-bg);

        &:hover {
            background-color: var(--hover-bg) !important;
        }
    }

    .el-table-fixed-column--right {
        background-color: var(--card-bg);
    }

    .el-table__fixed-right::before,
    .el-table__fixed::before {
        background-color: var(--border-color);
    }

    .el-table__fixed-right-patch {
        background-color: var(--table-header-bg);
    }
}

/* 优化表格内的操作按钮 */
:deep(.el-table) {
    .el-button {
        &.el-button--primary {
            &:not(:disabled):hover {
                background-color: var(--el-color-primary-light-3);
                border-color: var(--el-color-primary-light-3);
            }
        }

        &.el-button--danger {
            &:not(:disabled):hover {
                background-color: var(--el-color-danger-light-3);
                border-color: var(--el-color-danger-light-3);
            }
        }

        &.el-button--warning {
            &:not(:disabled):hover {
                background-color: var(--el-color-warning-light-3);
                border-color: var(--el-color-warning-light-3);
            }
        }

        &.el-button--success {
            &:not(:disabled):hover {
                background-color: var(--el-color-success-light-3);
                border-color: var(--el-color-success-light-3);
            }
        }
    }
}

/* 优化表格内的状态标签 */
:deep(.el-table) {
    .el-tag {
        background-color: transparent;
        border-color: currentColor;

        &.el-tag--success {
            color: var(--el-color-success);
            border-color: var(--el-color-success-light-5);
            background-color: var(--el-color-success-light-9);
        }

        &.el-tag--warning {
            color: var(--el-color-warning);
            border-color: var(--el-color-warning-light-5);
            background-color: var(--el-color-warning-light-9);
        }

        &.el-tag--danger {
            color: var(--el-color-danger);
            border-color: var(--el-color-danger-light-5);
            background-color: var(--el-color-danger-light-9);
        }

        &.el-tag--info {
            color: var(--el-color-info);
            border-color: var(--el-color-info-light-5);
            background-color: var(--el-color-info-light-9);
        }
    }
}

/* 优化表格分页器 */
:deep(.el-pagination) {
    padding: 16px 0;
    justify-content: flex-end;
    background-color: var(--card-bg);
    border-top: 1px solid var(--border-color);

    .el-pagination__total,
    .el-pagination__jump,
    .el-pagination__sizes {
        margin-right: 16px;
    }

    .el-input__inner {
        background-color: var(--bg-color);
        border-color: var(--border-color);
        color: var(--text-color);

        &:hover {
            border-color: var(--menu-active-text);
        }
    }

    .el-pager {
        li {
            background-color: var(--bg-color);
            color: var(--text-color);
            border: 1px solid var(--border-color);

            &.is-active {
                background-color: var(--menu-active-text);
                color: #ffffff;
                border-color: var(--menu-active-text);
            }

            &:hover:not(.is-active) {
                color: var(--menu-active-text);
                border-color: var(--menu-active-text);
            }
        }
    }

    button {
        background-color: var(--bg-color);
        color: var(--text-color);
        border: 1px solid var(--border-color);

        &:disabled {
            background-color: var(--bg-color);
            color: var(--text-color-secondary);
        }

        &:hover:not(:disabled) {
            color: var(--menu-active-text);
            border-color: var(--menu-active-text);
        }
    }
}

/* 优化弹窗样式 */
:deep(.el-dialog) {
    background-color: var(--card-bg);

    .el-dialog__title {
        color: var(--text-color);
    }

    .el-dialog__body {
        color: var(--text-color);
    }
}

/* 优化筛选区域样式 */
:deep(.el-form-item) {
    margin-bottom: 18px;

    .el-form-item__label {
        color: var(--text-color);
    }
}

:deep(.el-input) {
    --el-input-bg-color: var(--bg-color);
    --el-input-border-color: var(--border-color);
    --el-input-hover-border-color: var(--menu-active-text);
    --el-input-focus-border-color: var(--menu-active-text);

    .el-input__wrapper {
        background-color: var(--bg-color);
        box-shadow: 0 0 0 1px var(--border-color) inset;

        &:hover {
            box-shadow: 0 0 0 1px var(--menu-active-text) inset;
        }

        &.is-focus {
            box-shadow: 0 0 0 1px var(--menu-active-text) inset;
        }
    }

    .el-input__inner {
        color: var(--text-color);

        &::placeholder {
            color: var(--text-color-secondary);
        }
    }
}

:deep(.el-select) {
    .el-input {
        .el-input__wrapper {
            background-color: var(--bg-color);

            &:hover {
                box-shadow: 0 0 0 1px var(--menu-active-text) inset;
            }
        }
    }

    .el-select__tags {
        background-color: var(--bg-color);

        .el-tag {
            background-color: var(--tag-bg);
            border-color: var(--border-color);
            color: var(--text-color);

            .el-tag__close {
                color: var(--text-color-secondary);

                &:hover {
                    color: var(--text-color);
                    background-color: var(--hover-bg);
                }
            }
        }
    }
}

:deep(.el-select-dropdown) {
    background-color: var(--card-bg);
    border-color: var(--border-color);

    .el-select-dropdown__item {
        color: var(--text-color);

        &:hover,
        &.hover {
            background-color: var(--hover-bg);
        }

        &.selected {
            color: var(--menu-active-text);
            font-weight: 600;
            background-color: var(--bg-color);
        }
    }

    .el-scrollbar__thumb {
        background-color: var(--text-color-secondary);
        opacity: 0.3;

        &:hover {
            opacity: 0.5;
        }
    }
}

:deep(.el-date-editor) {
    --el-datepicker-border-color: var(--border-color);
    --el-datepicker-text-color: var(--text-color);
    --el-datepicker-off-text-color: var(--text-color-secondary);
    --el-datepicker-header-text-color: var(--text-color);

    .el-range-input {
        color: var(--text-color);
        background-color: var(--bg-color);

        &::placeholder {
            color: var(--text-color-secondary);
        }
    }

    .el-range-separator {
        color: var(--text-color-secondary);
    }
}

:deep(.el-date-picker) {
    background-color: var(--card-bg);
    border-color: var(--border-color);

    .el-date-picker__header {
        color: var(--text-color);
    }

    .el-date-table {
        th {
            color: var(--text-color);
            font-weight: 600;
            border-bottom: solid 1px var(--border-color);
        }

        td {
            &.available:hover {
                color: var(--menu-active-text);
            }

            &.current:not(.disabled) span {
                background-color: var(--menu-active-text);
                color: #ffffff;
            }

            &.today span {
                color: var(--menu-active-text);
                font-weight: bold;
            }
        }
    }

    .el-picker-panel__content {
        .el-date-table th {
            border-bottom: 1px solid var(--border-color);
        }
    }
}

/* 优化搜索区域布局 */
:deep(.search-area) {
    background-color: var(--card-bg);
    padding: 16px 20px;
    border-radius: 4px;
    margin-bottom: 16px;
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;

    .el-input {
        width: 240px;
    }

    .el-select {
        width: 180px;
    }

    .el-date-editor {
        width: 320px;
    }

    .el-button {
        margin-left: auto;
    }
}

:deep(.el-avatar) {
    background: var(--menu-active-text);
    border: 2px solid var(--border-color);
}
</style>