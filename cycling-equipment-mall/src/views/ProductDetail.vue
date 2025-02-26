<template>
  <div class="product-detail">
    <div class="container">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: `/${product.category}` }">{{ getCategoryName(product.category)
          }}</el-breadcrumb-item>
          <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="detail-content" v-loading="loading">
        <div class="product-gallery">
          <div class="main-image">
            <el-image :src="baseUrl + product.image" fit="contain">
              <template #placeholder>
                <div class="image-slot">加载中<span class="dot">...</span></div>
              </template>
            </el-image>
          </div>
        </div>

        <div class="product-info">
          <h1 class="product-name">{{ product.name }}</h1>
          <div class="tags">
            <el-tag size="small" v-if="product.isNew">新品</el-tag>
            <el-tag size="small" type="success" v-if="product.stock > 0">现货</el-tag>
            <el-tag size="small" type="info">{{ getCategoryName(product.category) }}</el-tag>
          </div>
          <div class="price-section">
            <div class="current-price">
              <span class="label">价格</span>
              <span class="price">{{ product.price }}元</span>
            </div>
          </div>

          <div class="quantity-section">
            <span class="label">数量</span>
            <el-input-number v-model="quantity" :min="1" :max="product.stock" />
            <span class="stock">库存：{{ product.stock }}件</span>
          </div>

          <div class="action-buttons">
            <el-button type="primary" size="large" @click="addToCart" :disabled="!product.stock">加入购物车</el-button>
            <el-button type="danger" size="large" @click="buyNow" :disabled="!product.stock">立即购买</el-button>
          </div>

          <div class="service-promises">
            <div class="promise-item">
              <el-icon>
                <Check />
              </el-icon>
              <span>正品保证</span>
            </div>
            <div class="promise-item">
              <el-icon>
                <Van />
              </el-icon>
              <span>极速发货</span>
            </div>
            <div class="promise-item">
              <el-icon>
                <Service />
              </el-icon>
              <span>售后无忧</span>
            </div>
          </div>
        </div>
      </div>

      <div class="product-detail-tabs">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="商品详情" name="detail">
            <div class="detail-content">
              <p>{{ product.description }}</p>
            </div>
          </el-tab-pane>
          <el-tab-pane label="规格参数" name="params">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="商品名称">{{ product.name }}</el-descriptions-item>
              <el-descriptions-item label="商品类型">{{ getCategoryName(product.category) }}</el-descriptions-item>
              <el-descriptions-item label="商品库存">{{ product.stock }}件</el-descriptions-item>
              <el-descriptions-item label="商品销量">{{ product.sales }}件</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productAPI } from '@/api/product'
import { cartAPI } from '@/api/cart'
import { ElMessage } from 'element-plus'
import { Check, Van, Service } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const baseUrl = 'http://localhost:3000'

const loading = ref(true)
const product = ref({})
const quantity = ref(1)
const activeTab = ref('detail')

// 获取商品详情
const fetchProductDetail = async () => {
  try {
    loading.value = true
    const data = await productAPI.getProductById(route.params.id)
    product.value = data
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败')
  } finally {
    loading.value = false
  }
}

// 获取分类名称
const getCategoryName = (category) => {
  const categoryMap = {
    'bikes': '自行车',
    'helmets': '头盔',
    'clothing': '骑行服',
    'shoes': '骑行鞋',
    'accessories': '配件'
  }
  return categoryMap[category] || category
}

// 添加到购物车
const addToCart = async () => {
  try {
    if (!localStorage.getItem('token')) {
      ElMessage.warning('请先登录')
      window.dispatchEvent(new CustomEvent('openLogin'))
      return
    }

    await cartAPI.addToCart({
      productId: product.value.id,
      quantity: quantity.value
    })
    ElMessage.success('已添加到购物车')
    // 触发购物车更新事件
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  } catch (error) {
    console.error('添加到购物车失败:', error)
    ElMessage.error(error.response?.data?.message || '添加到购物车失败')
  }
}

// 立即购买
const buyNow = async () => {
  if (!localStorage.getItem('token')) {
    ElMessage.warning('请先登录')
    window.dispatchEvent(new CustomEvent('openLogin'))
    return
  }

  const buyNowItem = {
    id: product.value.id,
    name: product.value.name,
    price: product.value.price,
    image: product.value.image,
    description: product.value.description,
    quantity: quantity.value
  }

  router.push({
    path: '/order/confirm',
    query: {
      buyNowItem: JSON.stringify(buyNowItem)
    }
  })
}

onMounted(() => {
  fetchProductDetail()
})
</script>

<style scoped>
.product-detail {
  padding: 20px 0;
  background: #f5f7fa;
  min-height: 100vh;
}

.container {
  width: 1226px;
  margin: 0 auto;
}

.breadcrumb {
  margin-bottom: 20px;
  padding: 10px;
  background: white;
  border-radius: 4px;
}

.detail-content {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.product-gallery {
  flex: 0 0 400px;
}

.main-image {
  width: 400px;
  height: 400px;
  border: 1px solid #eee;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 24px;
  margin: 0 0 15px;
  color: #333;
}

.tags {
  margin-bottom: 20px;
}

.tags .el-tag {
  margin-right: 10px;
}

.price-section {
  background: #f9f9f9;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.current-price {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.current-price .label {
  font-size: 14px;
  color: #666;
}

.current-price .price {
  font-size: 28px;
  color: #ff6700;
  font-weight: bold;
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.quantity-section .label {
  font-size: 14px;
  color: #666;
}

.quantity-section .stock {
  font-size: 14px;
  color: #999;
}

.action-buttons {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.service-promises {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  border-top: 1px solid #eee;
}

.promise-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
}

.product-detail-tabs {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
}
</style>