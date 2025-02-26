<template>
    <div class="home">
        <!-- 轮播图 -->
        <div class="banner-section">
            <el-carousel height="460px">
                <el-carousel-item v-for="item in banners" :key="item.id">
                    <img :src="item.image" :alt="item.title">
                </el-carousel-item>
            </el-carousel>
        </div>

        <!-- 商品分类 -->
        <div class="container">
            <!-- 推荐商品 -->
            <div class="section">
                <div class="section-header">
                    <h2>热门推荐</h2>
                    <el-button link>查看更多</el-button>
                </div>
                <div class="products-grid">
                    <el-row :gutter="14">
                        <el-col :span="6" v-for="product in hotProducts" :key="product.id">
                            <el-card class="product-card" :body-style="{ padding: '0px' }"
                                @click="goToProductDetail(product.id)">
                                <img :src="baseUrl + product.image" class="product-image">
                                <div class="product-info">
                                    <h3>{{ product.name }}</h3>
                                    <p class="desc">{{ product.description }}</p>
                                    <div class="price-row">
                                        <span class="price">{{ product.price }}元</span>
                                        <el-button type="primary" size="small"
                                            @click.stop="handleAddToCart(product)">加入购物车</el-button>
                                    </div>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </div>
            </div>

            <!-- 新品上架 -->
            <div class="section">
                <div class="section-header">
                    <h2>新品上架</h2>
                    <el-button link>查看更多</el-button>
                </div>
                <div class="products-grid">
                    <el-row :gutter="14">
                        <el-col :span="6" v-for="product in newProducts" :key="product.id">
                            <el-card class="product-card" :body-style="{ padding: '0px' }"
                                @click="goToProductDetail(product.id)">
                                <img :src="baseUrl + product.image" class="product-image">
                                <div class="product-info">
                                    <h3>{{ product.name }}</h3>
                                    <p class="desc">{{ product.description }}</p>
                                    <div class="price-row">
                                        <span class="price">{{ product.price }}元</span>
                                        <el-button type="primary" size="small"
                                            @click.stop="handleAddToCart(product)">加入购物车</el-button>
                                    </div>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </div>
            </div>
        </div>
    </div>
    <!-- 自行车分类 -->
    <div class="section">
        <div class="section-header">
            <h2>精选自行车</h2>
            <el-button link @click="$router.push('/bikes')">查看更多</el-button>
        </div>
        <div class="products-grid">
            <el-row :gutter="14">
                <el-col :span="6" v-for="product in bikes" :key="product.id">
                    <el-card class="product-card" :body-style="{ padding: '0px' }"
                        @click="goToProductDetail(product.id)">
                        <img :src="baseUrl + product.image" class="product-image">
                        <div class="product-info">
                            <h3>{{ product.name }}</h3>
                            <p class="desc">{{ product.description }}</p>
                            <div class="price-row">
                                <span class="price">{{ product.price }}元</span>
                                <el-button type="primary" size="small">加入购物车</el-button>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>
    </div>

    <!-- 头盔分类 -->
    <div class="section">
        <div class="section-header">
            <h2>安全头盔</h2>
            <el-button link @click="$router.push('/helmets')">查看更多</el-button>
        </div>
        <div class="products-grid">
            <el-row :gutter="20">
                <el-col :span="6" v-for="product in helmets" :key="product.id">
                    <el-card class="product-card" :body-style="{ padding: '0px' }"
                        @click="goToProductDetail(product.id)">
                        <img :src="baseUrl + product.image" class="product-image">
                        <div class="product-info">
                            <h3>{{ product.name }}</h3>
                            <p class="desc">{{ product.description }}</p>
                            <div class="price-row">
                                <span class="price">{{ product.price }}元</span>
                                <el-button type="primary" size="small">加入购物车</el-button>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>
    </div>

    <!-- 骑行服分类 -->
    <div class="section">
        <div class="section-header">
            <h2>骑行服饰</h2>
            <el-button link @click="$router.push('/clothing')">查看更多</el-button>
        </div>
        <div class="products-grid">
            <el-row :gutter="20">
                <el-col :span="6" v-for="product in clothing" :key="product.id">
                    <el-card class="product-card" :body-style="{ padding: '0px' }"
                        @click="goToProductDetail(product.id)">
                        <img :src="baseUrl + product.image" class="product-image">
                        <div class="product-info">
                            <h3>{{ product.name }}</h3>
                            <p class="desc">{{ product.description }}</p>
                            <div class="price-row">
                                <span class="price">{{ product.price }}元</span>
                                <el-button type="primary" size="small">加入购物车</el-button>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>
    </div>

    <!-- 骑行鞋分类 -->
    <div class="section">
        <div class="section-header">
            <h2>骑行鞋靴</h2>
            <el-button link @click="$router.push('/shoes')">查看更多</el-button>
        </div>
        <div class="products-grid">
            <el-row :gutter="20">
                <el-col :span="6" v-for="product in shoes" :key="product.id">
                    <el-card class="product-card" :body-style="{ padding: '0px' }"
                        @click="goToProductDetail(product.id)">
                        <img :src="baseUrl + product.image" class="product-image">
                        <div class="product-info">
                            <h3>{{ product.name }}</h3>
                            <p class="desc">{{ product.description }}</p>
                            <div class="price-row">
                                <span class="price">{{ product.price }}元</span>
                                <el-button type="primary" size="small">加入购物车</el-button>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { cartAPI } from '@/api/cart'
import { ElMessage } from 'element-plus'
import { productAPI } from '@/api/product'

// 添加基础URL
const baseUrl = "http://localhost:3000";


const router = useRouter()
const banners = ref([
    { id: 1, image: '/src/assets/image/banner1.jpg', title: 'banner1' },
    { id: 2, image: '/src/assets/image/banner2.jpg', title: 'banner2' },
    { id: 3, image: '/src/assets/image/banner3.jpg', title: 'banner3' },
])

const hotProducts = ref([]);
const newProducts = ref([]);
const bikes = ref([]);  // 存储自行车商品
const helmets = ref([]);  // 存储头盔商品
const clothing = ref([]);  // 存储骑行服饰商品
const shoes = ref([]);  // 存储骑行鞋靴商品

//获取热门商品
const fetchHotProducts = async () => {
    try {
        const data = await productAPI.getHotProducts()
        hotProducts.value = data
    } catch (error) {
        console.error('获取热门商品失败:', error)
        ElMessage.error('获取热门商品失败')
    }
}

//获取新上架商品
const fetchNewProducts = async () => {
    try {
        const data = await productAPI.getNewProducts()
        newProducts.value = data
    } catch (error) {
        console.error('获取新品商品失败:', error)
        ElMessage.error('获取新品商品失败')
    }
}

//获取分类商品数据
const fetchProductsByCategory = async (category) => {
    try {
        const data = await productAPI.getProductsByCategory(category);
        return data; // 返回特定类别的商品数据
    } catch (error) {
        console.error('获取分类商品失败:', error);
        return [];
    }
};

//跳转到商品详情页
const goToProductDetail = (productId) => {
    router.push(`/product/${productId}`)
}

const handleAddToCart = async (product) => {
    try {
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

// 修改数据获取方法
const fetchBikes = async () => {
    try {
        const data = await productAPI.getProductsByCategory('自行车', { pageSize: 8 });
        bikes.value = data.items;
    } catch (error) {
        console.error('获取自行车数据失败:', error);
    }
};

const fetchHelmets = async () => {
    try {
        const data = await productAPI.getProductsByCategory('头盔', { pageSize: 8 });
        helmets.value = data.items;
    } catch (error) {
        console.error('获取头盔数据失败:', error);
    }
};

const fetchClothing = async () => {
    try {
        const data = await productAPI.getProductsByCategory('骑行服', { pageSize: 8 });
        clothing.value = data.items;
    } catch (error) {
        console.error('获取骑行服数据失败:', error);
    }
};

const fetchShoes = async () => {
    try {
        const data = await productAPI.getProductsByCategory('骑行鞋', { pageSize: 8 });
        shoes.value = data.items;
    } catch (error) {
        console.error('获取骑行鞋数据失败:', error);
    }
};

const fetchAccessories = async () => {
    try {
        const data = await productAPI.getProductsByCategory('accessories', { pageSize: 8 });
        accessories.value = data.items;
    } catch (error) {
        console.error('获取配件数据失败:', error);
    }
};

onMounted(async () => {
    // 获取热门商品和新品商品
    fetchHotProducts()
    fetchNewProducts()
    // 获取每个分类的商品
    fetchBikes()
    fetchHelmets()
    fetchClothing()
    fetchShoes()
})
</script>

<style scoped>
.home {
    background: linear-gradient(135deg, #f5f7fa 0%, #f7f9fc 100%);
    min-height: 100vh;
    padding-bottom: 40px;
}

.container {
    width: 1226px;
    margin: 0 auto;
    padding: 20px 0;
}

.banner-section {
    margin-bottom: 30px;
}

.banner-section img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.section {
    margin-bottom: 40px;
    background: linear-gradient(145deg, #ffffff, #f8f9fa);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.section-header h2 {
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
    position: relative;
    padding-left: 15px;
}

.section-header h2::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    background: linear-gradient(to bottom, #42b983, #3498db);
    border-radius: 2px;
}

.products-grid {
    margin-top: 20px;
}

.product-card {
    transition: all 0.3s;
    margin-bottom: 20px;
    border: none;
    background: white;
    border-radius: 8px;
    overflow: hidden;
}

.product-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.product-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.product-info {
    padding: 16px;
    background: linear-gradient(to bottom, #fff, #f8f9fa);
}

.product-info h3 {
    margin: 0;
    font-size: 16px;
    color: #2c3e50;
    font-weight: 600;
}

.desc {
    font-size: 13px;
    color: #7f8c8d;
    margin: 10px 0;
}

.price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.price {
    color: #e74c3c;
    font-size: 18px;
    font-weight: 600;
}

.price-row .el-button--primary {
    background-color: #42b983;
    border-color: #42b983;
}

.price-row .el-button--primary:hover {
    background-color: #3aa876;
    border-color: #3aa876;
}

/* 轮播图样式优化 */
.banner-section {
    margin-bottom: 30px;
}

.banner-section .el-carousel__item {
    border-radius: 8px;
    overflow: hidden;
}

/* 添加渐变背景 */
.home {
    background: linear-gradient(135deg, #f5f7fa 0%, #f7f9fc 100%);
    min-height: 100vh;
    padding-bottom: 40px;
}

/* 添加卡片悬停动画 */
.product-card {
    position: relative;
}

.product-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, rgba(66, 185, 131, 0.1), rgba(52, 152, 219, 0.1));
    opacity: 0;
    transition: opacity 0.3s;
}

.product-card:hover::after {
    opacity: 1;
}
</style>