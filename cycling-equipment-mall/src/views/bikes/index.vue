<template>
    <div class="category-page">
        <div class="container">
            <!-- 分类标题区 -->
            <div class="category-header">
                <h1>自行车专区</h1>
                <div class="category-filter">
                    <el-select v-model="sortBy" placeholder="排序方式" @change="handleSortChange">
                        <el-option label="默认排序" value="" />
                        <el-option label="价格从低到高" value="priceAsc" />
                        <el-option label="价格从高到低" value="priceDesc" />
                    </el-select>
                    <el-select v-model="bikeType" placeholder="车型选择" @change="handleFilterChange">
                        <el-option label="全部" value="" />
                        <el-option label="公路车" value="road" />
                        <el-option label="山地车" value="mountain" />
                        <el-option label="城市车" value="city" />
                        <el-option label="折叠车" value="folding" />
                    </el-select>
                    <el-select v-model="priceRange" placeholder="价格区间" @change="handleFilterChange">
                        <el-option label="全部" value="" />
                        <el-option label="2000元以下" value="0-2000" />
                        <el-option label="2000-5000元" value="2000-5000" />
                        <el-option label="5000-10000元" value="5000-10000" />
                        <el-option label="10000元以上" value="10000-999999" />
                    </el-select>
                </div>
            </div>

            <!-- 商品列表 -->
            <div v-loading="loading" class="product-list">
                <!-- 添加调试信息 -->
                <div v-if="false">
                    <pre>Products: {{ products }}</pre>
                    <pre>Filtered Products: {{ filteredProducts }}</pre>
                </div>

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
const bikeType = ref('')
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
            type: bikeType.value,
            priceRange: priceRange.value || undefined // 如果没有选择价格区间，不传此参数
        }
        console.log('Request params:', params) // 添加日志
        const response = await productAPI.getProductsByCategory('自行车', params)
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
    console.log('Products value:', products.value)
    // 确保返回数组
    return Array.isArray(products.value) ? products.value : []
})

// 处理筛选和排序变化
const handleSortChange = () => {
    currentPage.value = 1
    fetchProducts()
}

const handleFilterChange = () => {
    console.log('Filter changed:', {
        type: bikeType.value,
        priceRange: priceRange.value
    }) // 添加日志
    currentPage.value = 1
    fetchProducts()
}

// 处理分页
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

// 添加到购物车方法
const addToCart = async (product, event) => {
    event.stopPropagation(); // 阻止事件冒泡，避免触发商品详情跳转
    try {
        if (!localStorage.getItem('token')) {
            ElMessage.warning('请先登录');
            window.dispatchEvent(new CustomEvent('openLogin'));
            return;
        }

        await cartAPI.addToCart({
            productId: product.id,
            quantity: 1
        });
        ElMessage.success('已添加到购物车');
    } catch (error) {
        console.error('添加到购物车失败:', error);
        ElMessage.error(error.response?.data?.message || '添加到购物车失败');
    }
};
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
    display: flex;
    justify-content: center;
}
</style>