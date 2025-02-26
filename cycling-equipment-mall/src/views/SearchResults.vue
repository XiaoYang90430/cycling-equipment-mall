<template>
    <div class="search-results">
        <div class="container">
            <div class="search-header">
                <h2>搜索结果</h2>
                <p v-if="keyword">关键词：{{ keyword }}</p>
            </div>

            <!-- 商品列表 -->
            <div v-loading="loading" class="product-list">
                <el-empty v-if="!loading && (!products || products.length === 0)" description="未找到相关商品" />

                <el-row v-else :gutter="20">
                    <el-col :span="6" v-for="product in products" :key="product.id">
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
                                    <span class="price">{{ product.price }}元</span>
                                    <el-button type="primary" size="small" @click.stop="addToCart(product)">
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
                        :page-sizes="[12, 24, 36, 48]" :total="total" layout="total, sizes, prev, pager, next, jumper"
                        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productAPI } from '@/api/product'
import { cartAPI } from '@/api/cart'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const baseUrl = 'http://localhost:3000'
const loading = ref(false)
const products = ref([])
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

const keyword = computed(() => route.query.keyword || '')

// 获取搜索结果
const fetchSearchResults = async () => {
    if (!keyword.value) return

    loading.value = true
    try {
        const params = {
            keyword: keyword.value,
            page: currentPage.value,
            pageSize: pageSize.value
        }
        const response = await productAPI.searchProducts(params)
        products.value = response.items
        total.value = response.total
    } catch (error) {
        console.error('搜索商品失败:', error)
        ElMessage.error('搜索商品失败')
    } finally {
        loading.value = false
    }
}

// 跳转到商品详情
const goToProductDetail = (productId) => {
    router.push(`/product/${productId}`)
}

// 添加到购物车
const addToCart = async (product) => {
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
        window.dispatchEvent(new CustomEvent('cartUpdated'))
    } catch (error) {
        console.error('添加到购物车失败:', error)
        ElMessage.error(error.response?.data?.message || '添加到购物车失败')
    }
}

const handleSizeChange = (val) => {
    pageSize.value = val
    currentPage.value = 1
    fetchSearchResults()
}

const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchSearchResults()
}

// 监听路由参数变化
watch(() => route.query.keyword, () => {
    currentPage.value = 1
    fetchSearchResults()
})

onMounted(() => {
    fetchSearchResults()
})
</script>

<style scoped>
.search-results {
    padding: 20px 0;
    min-height: 100vh;
    background: #f5f7fa;
}

.container {
    width: 1200px;
    margin: 0 auto;
}

.search-header {
    margin-bottom: 30px;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.search-header h2 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 24px;
}

.search-header p {
    margin: 0;
    color: #666;
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

.product-name {
    margin: 0 0 5px 0;
    font-size: 16px;
    color: #333;
}

.product-desc {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #666;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.tags {
    margin-bottom: 10px;
}

.tags .el-tag {
    margin-right: 5px;
}

.price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.price {
    color: #ff6700;
    font-size: 18px;
    font-weight: bold;
}

.pagination-container {
    margin-top: 30px;
    text-align: center;
    background: white;
    padding: 20px;
    border-radius: 8px;
}
</style>