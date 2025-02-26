<template>
    <div class="products-view">
        <div class="header">
            <span>商品管理</span>
            <el-button type="primary" @click="handleAdd">添加商品</el-button>
        </div>

        <!-- 搜索栏 -->
        <div class="search-bar">
            <el-input v-model="searchQuery" placeholder="搜索商品名称" clearable @clear="fetchProducts"
                style="width: 300px;" />
            <el-select v-model="categoryFilter" placeholder="商品分类" clearable @change="fetchProducts">
                <el-option label="自行车" value="自行车" />
                <el-option label="头盔" value="头盔" />
                <el-option label="骑行服" value="骑行服" />
                <el-option label="骑行鞋" value="骑行鞋" />
                <el-option label="配件" value="配件" />
            </el-select>
            <el-select v-model="stockFilter" placeholder="库存状态" clearable @change="fetchProducts">
                <el-option label="有库存" value="inStock" />
                <el-option label="无库存" value="outOfStock" />
            </el-select>
            <el-button type="primary" @click="fetchProducts">搜索</el-button>
        </div>

        <!-- 商品列表 -->
        <el-table v-loading="loading" :data="products" style="width: 100%">
            <el-table-column label="商品图片" width="120">
                <template #default="{ row }">
                    <el-image :src="baseUrl + row.image" :preview-src-list="[baseUrl + row.image]" fit="cover"
                        style="width: 80px; height: 80px; border-radius: 4px; border: 1px solid #eee; transition: all 0.3s;"
                        :preview-teleported="true" :initial-index="0" class="product-image" />
                </template>
            </el-table-column>
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="category" label="分类" width="100" />
            <el-table-column prop="price" label="价格" width="100">
                <template #default="{ row }">
                    ¥{{ row.price }}
                </template>
            </el-table-column>
            <el-table-column prop="stock" label="库存" width="100" />
            <el-table-column label="状态" width="120">
                <template #default="{ row }">
                    <el-tag :type="row.stock > 0 ? 'success' : 'danger'">
                        {{ row.stock > 0 ? '有库存' : '无库存' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                    <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
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
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '添加商品'" width="600px">
            <el-form ref="productFormRef" :model="productForm" :rules="productRules" label-width="100px">
                <el-form-item label="商品图片" prop="image">
                    <el-upload class="product-uploader" :show-file-list="false" :before-upload="beforeUpload"
                        :http-request="customUpload" accept="image/jpeg,image/png,image/gif,image/webp">
                        <img v-if="productForm.image" :src="baseUrl + productForm.image" class="uploaded-image" />
                        <el-icon v-else class="upload-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                    <div class="upload-tip">支持 JPG/PNG/GIF/WEBP 格式，大小不超过 10MB</div>
                </el-form-item>
                <el-form-item label="商品名称" prop="name">
                    <el-input v-model="productForm.name" />
                </el-form-item>
                <el-form-item label="商品分类" prop="category">
                    <el-select v-model="productForm.category" placeholder="请选择分类">
                        <el-option label="自行车" value="自行车" />
                        <el-option label="头盔" value="头盔" />
                        <el-option label="骑行服" value="骑行服" />
                        <el-option label="骑行鞋" value="骑行鞋" />
                        <el-option label="配件" value="配件" />
                    </el-select>
                </el-form-item>
                <el-form-item label="商品类型" prop="type">
                    <el-select v-model="productForm.type" placeholder="请选择类型">
                        <template v-if="productForm.category === '自行车'">
                            <el-option label="公路车" value="road" />
                            <el-option label="山地车" value="mountain" />
                            <el-option label="城市休闲车" value="city" />
                        </template>
                        <template v-else-if="productForm.category === '头盔'">
                            <el-option label="公路车头盔" value="road" />
                            <el-option label="山地车头盔" value="mountain" />
                            <el-option label="城市休闲头盔" value="city" />
                        </template>
                        <template v-else-if="productForm.category === '骑行服'">
                            <el-option label="骑行短袖" value="short" />
                            <el-option label="骑行长袖" value="long" />
                            <el-option label="骑行背心" value="vest" />
                            <el-option label="骑行裤" value="pants" />
                            <el-option label="骑行套装" value="suit" />
                        </template>
                        <template v-else-if="productForm.category === '骑行鞋'">
                            <el-option label="公路车鞋" value="road" />
                            <el-option label="山地车鞋" value="mountain" />
                            <el-option label="休闲骑行鞋" value="casual" />
                            <el-option label="专业竞技鞋" value="pro" />
                        </template>
                        <template v-else-if="productForm.category === '配件'">
                            <el-option label="车灯" value="light" />
                            <el-option label="码表" value="computer" />
                            <el-option label="水壶架" value="bottle" />
                            <el-option label="车锁" value="lock" />
                            <el-option label="工具" value="tool" />
                            <el-option label="维修配件" value="repair" />
                        </template>
                    </el-select>
                </el-form-item>
                <el-form-item label="商品价格" prop="price">
                    <el-input-number v-model="productForm.price" :precision="2" :step="0.1" :min="0" />
                </el-form-item>
                <el-form-item label="库存数量" prop="stock">
                    <el-input-number v-model="productForm.stock" :min="0" :precision="0" />
                </el-form-item>
                <el-form-item label="商品描述" prop="description">
                    <el-input v-model="productForm.description" type="textarea" :rows="3" />
                </el-form-item>
                <el-form-item label="是否新品" prop="isNew">
                    <el-switch v-model="productForm.isNew" />
                </el-form-item>
                <el-form-item label="是否热门" prop="isHot">
                    <el-switch v-model="productForm.isHot" />
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
import { Plus, Search } from '@element-plus/icons-vue'
import { productAPI } from '@/api/product'
import { uploadAPI } from '@/api/upload'

const baseUrl = 'http://localhost:3000'
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const productFormRef = ref(null)

// 列表数据
const products = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchQuery = ref('')
const categoryFilter = ref('')
const stockFilter = ref('')

// 表单数据
const productForm = reactive({
    name: '',
    category: '',
    type: '',
    price: 0,
    stock: 0,
    description: '',
    image: '',
    isNew: false,
    isHot: false,
})

// 表单验证规则
const productRules = {
    name: [
        { required: true, message: '请输入商品名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    category: [
        { required: true, message: '请选择商品分类', trigger: 'change' }
    ],
    type: [
        { required: true, message: '请选择商品类型', trigger: 'change' }
    ],
    price: [
        { required: true, message: '请输入商品价格', trigger: 'blur' }
    ],
    stock: [
        { required: true, message: '请输入库存数量', trigger: 'blur' }
    ],
    description: [
        { required: true, message: '请输入商品描述', trigger: 'blur' }
    ],
    image: [
        { required: true, message: '请上传商品图片', trigger: 'change' }
    ]
}

// 获取商品列表
const fetchProducts = async () => {
    loading.value = true
    try {
        const params = {
            page: currentPage.value,
            pageSize: pageSize.value,
            search: searchQuery.value,
            category: categoryFilter.value,
            stock: stockFilter.value
        }
        const response = await productAPI.getProducts(params)
        products.value = response.items
        total.value = response.total
    } catch (error) {
        console.error('获取商品列表失败:', error)
        ElMessage.error('获取商品列表失败')
    } finally {
        loading.value = false
    }
}

// 处理分页
const handleSizeChange = (val) => {
    pageSize.value = val
    fetchProducts()
}

const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchProducts()
}

// 添加商品
const handleAdd = () => {
    isEdit.value = false
    Object.assign(productForm, {
        name: '',
        category: '',
        type: '',
        price: 0,
        stock: 0,
        description: '',
        image: '',
        isNew: false,
        isHot: false,
    })
    dialogVisible.value = true
}

// 编辑商品
const handleEdit = (row) => {
    isEdit.value = true
    Object.assign(productForm, row)
    dialogVisible.value = true
}

// 删除商品
const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
            type: 'warning'
        })
        await productAPI.deleteProduct(row.id)
        ElMessage.success('删除成功')
        fetchProducts()
    } catch (error) {
        if (error !== 'cancel') {
            console.error('删除商品失败:', error)
            ElMessage.error('删除商品失败')
        }
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

const customUpload = async (options) => {
    try {
        const formData = new FormData()
        formData.append('image', options.file)
        const response = await uploadAPI.uploadProductImage(formData)
        if (response && response.url) {
            productForm.image = response.url
            ElMessage.success('图片上传成功')
        } else {
            throw new Error('上传响应格式错误')
        }
    } catch (error) {
        console.error('上传图片失败:', error)
        ElMessage.error(error.message || '上传图片失败')
    }
}

// 提交表单
const handleSubmit = async () => {
    if (!productFormRef.value) return

    try {
        await productFormRef.value.validate()
        submitting.value = true

        if (isEdit.value) {
            await productAPI.updateProduct(productForm.id, productForm)
            ElMessage.success('更新成功')
        } else {
            await productAPI.createProduct(productForm)
            ElMessage.success('添加成功')
        }

        dialogVisible.value = false
        fetchProducts()
    } catch (error) {
        if (error.name !== 'ValidationError') {
            console.error('提交失败:', error)
            ElMessage.error('提交失败')
        }
    } finally {
        submitting.value = false
    }
}

onMounted(() => {
    fetchProducts()
})
</script>

<style scoped>
.products-view {
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.header h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
}

.search-bar {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.product-image {
    cursor: pointer;
}

.product-image:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.product-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 148px;
    height: 148px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: border-color 0.3s;
}

.product-uploader:hover {
    border-color: #409eff;
}

.uploaded-image {
    width: 146px;
    height: 146px;
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
</style>