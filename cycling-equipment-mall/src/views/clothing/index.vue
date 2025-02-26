<template>
    <div class="category-page">
        <div class="container">
            <!-- 分类标题区 -->
            <div class="category-header">
                <h1>骑行服专区</h1>
                <div class="category-filter">
                    <el-select v-model="sortBy" placeholder="排序方式" @change="handleSortChange">
                        <el-option label="默认排序" value="" />
                        <el-option label="价格从低到高" value="priceAsc" />
                        <el-option label="价格从高到低" value="priceDesc" />
                    </el-select>
                    <el-select v-model="clothingType" placeholder="类型选择" @change="handleFilterChange">
                        <el-option label="全部" value="" />
                        <el-option label="骑行短袖" value="short" />
                        <el-option label="骑行长袖" value="long" />
                        <el-option label="骑行背心" value="vest" />
                        <el-option label="骑行裤" value="pants" />
                        <el-option label="骑行套装" value="suit" />
                    </el-select>
                    <el-select v-model="priceRange" placeholder="价格区间" @change="handleFilterChange">
                        <el-option label="全部" value="" />
                        <el-option label="100元以下" value="0-100" />
                        <el-option label="100-300元" value="100-300" />
                        <el-option label="300-500元" value="300-500" />
                        <el-option label="500元以上" value="500-999999" />
                    </el-select>
                </div>
            </div>

            <!-- 商品列表 -->
            <div v-loading="loading" class="product-list">
                <el-empty v-if="!loading && (!filteredProducts || filteredProducts.length === 0)" description="暂无商品" />

                <el-row v-else :gutter="20">
                    <el-col :span="6" v-for="product in filteredProducts" :key="product.id">
                        <el-card class="product-card" :body-style="{ padding: '0px' }"
                            @click="goToProductDetail(product.id)">
                            <img :src="baseUrl + product.image" class="product-image">
                            <div class="product-info">
                                <h3 class="product-name">{{ product.name }}</h3>
                                <p class="product-desc">{{ product.description }}</p>
                                <div class="tags">
                                    <el-tag size="small" v-if="product.isNew">新品</el-tag>
                                    <el-tag size="small" type="success" v-if="product.stock">现货</el-tag>
                                </div>
                                <div class="price-row">
                                    <span class="price">¥{{ product.price }}</span>
                                    <el-button type="primary" size="small" @click.stop="addToCart(product, $event)">
                                        加入购物车
                                    </el-button>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>

                <!-- 分页器 -->
                <div v-if="total > 0" class="pagination-container">
                    <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                        :page-sizes="[8, 12, 16, 20]" :total="total" layout="total, sizes, prev, pager, next, jumper"
                        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productAPI } from '@/api/product'
import { cartAPI } from '@/api/cart'
import { ElMessage } from 'element-plus'

const router = useRouter()
const baseUrl = 'http://localhost:3000'
const loading = ref(false)
const products = ref([])
const sortBy = ref('')
const clothingType = ref('')
const priceRange = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(8)
const total = ref(0)

// 获取商品列表
const fetchProducts = async () => {
    loading.value = true
    try {
        const params = {
            page: currentPage.value,
            pageSize: pageSize.value,
            sort: sortBy.value,
            type: clothingType.value,
            priceRange: priceRange.value || undefined
        }
        console.log('Request params:', params)
        const response = await productAPI.getProductsByCategory('骑行服', params)
        console.log('API Response:', response)

        products.value = response.items || []
        total.value = response.total || 0
    } catch (error) {
        console.error('获取商品列表失败:', error)
        ElMessage.error('获取商品列表失败')
        products.value = []
        total.value = 0
    } finally {
        loading.value = false
    }
}

// 商品筛选逻辑
const filteredProducts = computed(() => {
    return Array.isArray(products.value) ? products.value : []
})

const handleSortChange = () => {
    currentPage.value = 1
    fetchProducts()
}

const handleFilterChange = () => {
    currentPage.value = 1
    fetchProducts()
}

const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchProducts()
}

const handleSizeChange = (val) => {
    pageSize.value = val
    currentPage.value = 1
    fetchProducts()
}

onMounted(() => {
    fetchProducts()
})

const goToProductDetail = (productId) => {
    router.push(`/product/${productId}`)
}

const addToCart = async (product, event) => {
    event.stopPropagation()
    try {
        if (!localStorage.getItem('token')) {
            ElMessage.warning('请先登录')
            window.dispatchEvent(new CustomEvent('openLogin'))
            return
        }

        await cartAPI.addToCart({
            productId: product.id,
            quantity: 1
        })
        ElMessage.success('已添加到购物车')
    } catch (error) {
        console.error('添加到购物车失败:', error)
        ElMessage.error(error.response?.data?.message || '添加到购物车失败')
    }
}
</script>

<style scoped>
.category-page {
    padding: 20px 0;
    background: linear-gradient(135deg, #f5f7fa 0%, #f7f9fc 100%);
    min-height: 100vh;
}

.container {
    width: 1226px;
    margin: 0 auto;
}

.category-header {
    margin-bottom: 30px;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.category-header h1 {
    margin: 0 0 20px 0;
    color: #2c3e50;
    font-size: 28px;
    font-weight: 500;
}

.category-filter {
    display: flex;
    gap: 20px;
}

.product-card {
    margin-bottom: 20px;
    transition: all 0.3s;
    border: none;
    overflow: hidden;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.product-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.product-info {
    padding: 15px;
}

.product-info h3 {
    margin: 0;
    font-size: 16px;
    color: #2c3e50;
}

.product-info p {
    margin: 8px 0;
}

.tags {
    margin: 8px 0;
}

.tags .el-tag {
    margin-right: 5px;
}

.price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
}

.price {
    color: #e74c3c;
    font-size: 18px;
    font-weight: 600;
}

.pagination-container {
    margin-top: 30px;
    text-align: center;
}
</style>