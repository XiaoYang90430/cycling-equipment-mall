<template>
    <div class="articles-view">
        <div class="header">
            <span>文章管理</span>
            <el-button type="primary" @click="handleAdd">添加文章</el-button>
        </div>

        <!-- 搜索栏 -->
        <div class="search-bar">
            <el-input v-model="searchQuery" placeholder="搜索文章标题" clearable @clear="fetchArticles"
                style="width: 300px;" />
            <el-select v-model="categoryFilter" placeholder="文章分类" clearable @change="fetchArticles">
                <el-option label="新闻资讯" value="news" />
                <el-option label="骑行攻略" value="guide" />
                <el-option label="装备评测" value="review" />
                <el-option label="赛事动态" value="race" />
                <el-option label="维修保养" value="maintenance" />
            </el-select>
            <el-select v-model="statusFilter" placeholder="发布状态" clearable @change="fetchArticles">
                <el-option label="草稿" value="draft" />
                <el-option label="已发布" value="published" />
                <el-option label="已归档" value="archived" />
            </el-select>
            <el-button type="primary" @click="fetchArticles">搜索</el-button>
        </div>

        <!-- 文章列表 -->
        <el-table v-loading="loading" :data="articles" style="width: 100%">
            <el-table-column label="封面图片" width="120">
                <template #default="{ row }">
                    <el-image v-if="row.cover_image" :src="baseUrl + row.cover_image"
                        :preview-src-list="[baseUrl + row.cover_image]" fit="cover"
                        style="width: 100px; height: 56px; border-radius: 4px; border: 1px solid #eee; transition: all 0.3s;"
                        :preview-teleported="true" :initial-index="0" class="cover-image" />
                    <div v-else class="no-image">暂无图片</div>
                </template>
            </el-table-column>
            <el-table-column prop="title" label="标题" min-width="200" />
            <el-table-column prop="category" label="分类" width="100">
                <template #default="{ row }">
                    <el-tag>{{ getCategoryText(row.category) }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="view_count" label="浏览量" width="100" />
            <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                    <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="180">
                <template #default="{ row }">
                    {{ formatDate(row.created_at) }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="250" fixed="right">
                <template #default="{ row }">
                    <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
                    <el-button type="success" size="small" v-if="row.status === 'draft'"
                        @click="handleUpdateStatus(row.id, 'published')">
                        发布
                    </el-button>
                    <el-button type="warning" size="small" v-if="row.status === 'published'"
                        @click="handleUpdateStatus(row.id, 'archived')">
                        归档
                    </el-button>
                    <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页器 -->
        <div class="pagination">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next"
                @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>

        <!-- 编辑对话框 -->
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑文章' : '添加文章'" width="80%" :close-on-click-modal="false">
            <el-form ref="articleFormRef" :model="articleForm" :rules="articleRules" label-width="100px">
                <el-form-item label="文章标题" prop="title">
                    <el-input v-model="articleForm.title" placeholder="请输入文章标题" />
                </el-form-item>
                <el-form-item label="文章分类" prop="category">
                    <el-select v-model="articleForm.category" placeholder="请选择分类">
                        <el-option label="新闻资讯" value="news" />
                        <el-option label="骑行攻略" value="guide" />
                        <el-option label="装备评测" value="review" />
                        <el-option label="赛事动态" value="race" />
                        <el-option label="维修保养" value="maintenance" />
                    </el-select>
                </el-form-item>
                <el-form-item label="封面图片" prop="cover_image">
                    <el-upload class="cover-uploader" :show-file-list="false" :before-upload="beforeUpload"
                        :http-request="uploadCover" accept="image/jpeg,image/png,image/gif,image/webp">
                        <img v-if="articleForm.cover_image" :src="baseUrl + articleForm.cover_image"
                            class="uploaded-cover" />
                        <el-icon v-else class="upload-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                    <div class="upload-tip">支持 JPG/PNG/GIF/WEBP 格式，大小不超过 10MB</div>
                </el-form-item>
                <el-form-item label="文章摘要" prop="summary">
                    <el-input v-model="articleForm.summary" type="textarea" :rows="2" placeholder="请输入文章摘要" />
                </el-form-item>
                <el-form-item label="文章内容" prop="content">
                    <div class="editor-container">
                        <el-upload class="content-image-uploader" :show-file-list="false" :before-upload="beforeUpload"
                            :http-request="uploadContentImage" accept="image/jpeg,image/png,image/gif,image/webp">
                            <el-button type="primary" size="small">
                                <el-icon>
                                    <Picture />
                                </el-icon>
                                插入图片
                            </el-button>
                        </el-upload>
                        <el-input v-model="articleForm.content" type="textarea" :rows="15" placeholder="请输入文章内容"
                            @keydown.tab.prevent="handleTab" />
                    </div>
                </el-form-item>
                <el-form-item label="文章标签" prop="tags">
                    <el-input v-model="articleForm.tags" placeholder="多个标签用英文逗号分隔" />
                </el-form-item>
                <el-form-item label="是否推荐" prop="is_featured">
                    <el-switch v-model="articleForm.is_featured" />
                </el-form-item>
                <el-form-item label="发布状态" prop="status">
                    <el-radio-group v-model="articleForm.status">
                        <el-radio label="draft">草稿</el-radio>
                        <el-radio label="published">发布</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Picture } from '@element-plus/icons-vue'
import { articleAPI } from '@/api/article'
import { uploadAPI } from '@/api/upload'

const baseUrl = 'http://localhost:3000'
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const articleFormRef = ref(null)

// 列表数据
const articles = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchQuery = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')

// 表单数据
const articleForm = reactive({
    title: '',
    category: '',
    cover_image: '',
    summary: '',
    content: '',
    tags: '',
    status: 'draft',
    is_featured: false
})

// 表单验证规则
const articleRules = {
    title: [
        { required: true, message: '请输入文章标题', trigger: 'blur' },
        { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
    ],
    category: [
        { required: true, message: '请选择文章分类', trigger: 'change' }
    ],
    cover_image: [
        { required: true, message: '请上传封面图片', trigger: 'change' }
    ],
    summary: [
        { required: true, message: '请输入文章摘要', trigger: 'blur' }
    ],
    content: [
        { required: true, message: '请输入文章内容', trigger: 'blur' }
    ]
}

// 获取文章列表
const fetchArticles = async () => {
    loading.value = true
    try {
        const params = {
            page: currentPage.value,
            pageSize: pageSize.value,
            title: searchQuery.value,
            category: categoryFilter.value,
            status: statusFilter.value
        }
        const response = await articleAPI.getArticles(params)
        articles.value = response.items
        total.value = response.total
    } catch (error) {
        console.error('获取文章列表失败:', error)
        ElMessage.error('获取文章列表失败')
    } finally {
        loading.value = false
    }
}

// 处理分页
const handleSizeChange = (val) => {
    pageSize.value = val
    fetchArticles()
}

const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchArticles()
}

// 添加文章
const handleAdd = () => {
    isEdit.value = false
    Object.assign(articleForm, {
        title: '',
        category: '',
        cover_image: '',
        summary: '',
        content: '',
        tags: '',
        status: 'draft',
        is_featured: false
    })
    dialogVisible.value = true
}

// 编辑文章
const handleEdit = (row) => {
    isEdit.value = true
    Object.assign(articleForm, row)
    dialogVisible.value = true
}

// 删除文章
const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm('确定要删除该文章吗？', '提示', {
            type: 'warning'
        })
        await articleAPI.deleteArticle(row.id)
        ElMessage.success('删除成功')
        fetchArticles()
    } catch (error) {
        if (error !== 'cancel') {
            console.error('删除文章失败:', error)
            ElMessage.error('删除文章失败')
        }
    }
}

// 更新文章状态
const handleUpdateStatus = async (id, status) => {
    try {
        await articleAPI.updateArticleStatus(id, status)
        ElMessage.success('更新状态成功')
        fetchArticles()
    } catch (error) {
        console.error('更新状态失败:', error)
        ElMessage.error('更新状态失败')
    }
}

// 上传相关
const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/')
    const isLt10M = file.size / 1024 / 1024 < 10

    if (!isImage) {
        ElMessage.error('只能上传图片文件！')
        return false
    }
    if (!isLt10M) {
        ElMessage.error('图片大小不能超过 10MB！')
        return false
    }
    return true
}

// 上传封面图片
const uploadCover = async (options) => {
    try {
        const formData = new FormData()
        formData.append('image', options.file)
        const response = await uploadAPI.uploadArticleImage(formData)
        if (response && response.url) {
            articleForm.cover_image = response.url
            ElMessage.success('封面上传成功')
        } else {
            throw new Error('上传响应格式错误')
        }
    } catch (error) {
        console.error('上传封面失败:', error)
        ElMessage.error(error.message || '上传封面失败')
    }
}

// 上传内容图片
const uploadContentImage = async (options) => {
    try {
        const formData = new FormData()
        formData.append('image', options.file)
        const response = await uploadAPI.uploadArticleImage(formData)
        if (response && response.url) {
            // 在光标位置插入图片，使用完整的URL
            const imageUrl = baseUrl + response.url
            const imageMarkdown = `\n[图片](${imageUrl})\n`
            const textarea = document.querySelector('.editor-container textarea')
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const content = articleForm.content
            articleForm.content = content.substring(0, start) + imageMarkdown + content.substring(end)
            // 更新光标位置
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length
                textarea.focus()
            })
            ElMessage.success('图片上传成功')
        } else {
            throw new Error('上传响应格式错误')
        }
    } catch (error) {
        console.error('上传图片失败:', error)
        ElMessage.error(error.message || '上传图片失败')
    }
}

// 处理 Tab 键
const handleTab = (e) => {
    const textarea = e.target
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    articleForm.content = articleForm.content.substring(0, start) + '\t' + articleForm.content.substring(end)
    // 更新光标位置
    setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1
    })
}

// 格式化日期
const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleString()
}

// 获取分类文本
const getCategoryText = (category) => {
    const categoryMap = {
        news: '新闻资讯',
        guide: '骑行攻略',
        review: '装备评测',
        race: '赛事动态',
        maintenance: '维修保养'
    }
    return categoryMap[category] || category
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        draft: '草稿',
        published: '已发布',
        archived: '已归档'
    }
    return statusMap[status] || status
}

// 获取状态类型
const getStatusType = (status) => {
    const typeMap = {
        draft: 'info',
        published: 'success',
        archived: 'warning'
    }
    return typeMap[status] || ''
}

// 提交表单
const handleSubmit = async () => {
    if (!articleFormRef.value) return

    try {
        await articleFormRef.value.validate()
        submitting.value = true

        if (isEdit.value) {
            await articleAPI.updateArticle(articleForm.id, articleForm)
            ElMessage.success('更新成功')
        } else {
            await articleAPI.createArticle(articleForm)
            ElMessage.success('添加成功')
        }

        dialogVisible.value = false
        fetchArticles()
    } catch (error) {
        if (error.name !== 'ValidationError') {
            console.error('提交失败:', error)
            ElMessage.error('提交失败')
        }
    } finally {
        submitting.value = false
    }
}

// 处理图片上传
const handleImageUpload = async (file) => {
    try {
        const formData = new FormData()
        formData.append('image', file)
        const response = await uploadAPI.uploadArticleImage(formData)
        // 返回Markdown格式的图片链接
        return `![图片](${response.url})`
    } catch (error) {
        console.error('上传图片失败:', error)
        ElMessage.error('上传图片失败')
        return false
    }
}

onMounted(() => {
    fetchArticles()
})
</script>

<style scoped>
.articles-view {
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.search-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.cover-image {
    cursor: pointer;
}

.cover-image:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.no-image {
    width: 100px;
    height: 56px;
    background-color: #f5f7fa;
    border: 1px solid #eee;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #909399;
}

:deep(.el-image-viewer__wrapper) {
    background-color: rgba(0, 0, 0, 0.9);
}

:deep(.el-image-viewer__close) {
    color: #fff;
}

:deep(.el-image-viewer__actions) {
    opacity: 1;
    background: rgba(0, 0, 0, 0.7);
}

:deep(.el-image-viewer__prev, .el-image-viewer__next) {
    color: #fff;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 50%;
}

.article-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 240px;
    height: 135px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: border-color 0.3s;
}

.article-uploader:hover {
    border-color: #409eff;
}

.uploaded-image {
    width: 238px;
    height: 133px;
    object-fit: cover;
    display: block;
}

.upload-icon {
    font-size: 28px;
    color: #8c939d;
}

.upload-tip {
    font-size: 12px;
    color: #666;
    margin-top: 5px;
}

.editor-container {
    position: relative;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
}

.content-image-uploader {
    padding: 8px;
    border-bottom: 1px solid #dcdfe6;
}

.editor-container :deep(.el-textarea__inner) {
    border: none;
    border-radius: 0;
}

.editor-container :deep(.el-textarea__inner:focus) {
    box-shadow: none;
}

.cover-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 200px;
    height: 112px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: border-color 0.3s;
}

.cover-uploader:hover {
    border-color: #409eff;
}

.uploaded-cover {
    width: 198px;
    height: 110px;
    object-fit: cover;
    display: block;
}
</style>