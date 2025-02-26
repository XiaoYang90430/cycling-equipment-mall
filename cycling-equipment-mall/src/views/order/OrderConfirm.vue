<template>
    <div class="order-confirm">
        <div class="container">
            <h2>确认订单</h2>

            <!-- 收货信息 -->
            <el-card class="address-card">
                <template #header>
                    <div class="card-header">
                        <span>收货信息</span>
                    </div>
                </template>
                <el-form :model="addressForm" :rules="addressRules" ref="addressFormRef" label-width="100px">
                    <el-form-item label="收货人" prop="name">
                        <el-input v-model="addressForm.name" placeholder="请输入收货人姓名" />
                    </el-form-item>
                    <el-form-item label="手机号码" prop="phone">
                        <el-input v-model="addressForm.phone" placeholder="请输入手机号码" />
                    </el-form-item>
                    <el-form-item label="收货地址" prop="address">
                        <el-input v-model="addressForm.address" type="textarea" placeholder="请输入详细地址" />
                    </el-form-item>
                </el-form>
            </el-card>

            <!-- 订单商品 -->
            <el-card class="order-items">
                <template #header>
                    <div class="card-header">
                        <span>订单商品</span>
                    </div>
                </template>
                <el-table :data="orderItems" style="width: 100%">
                    <el-table-column label="商品信息">
                        <template #default="{ row }">
                            <div class="product-info">
                                <img :src="baseUrl + row.Product.image" :alt="row.Product.name" />
                                <div class="product-detail">
                                    <h3>{{ row.Product.name }}</h3>
                                    <p>{{ row.Product.description }}</p>
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="单价" width="120">
                        <template #default="{ row }">
                            <span class="price">{{ row.Product.price }}元</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="数量" width="120">
                        <template #default="{ row }">
                            <span>{{ row.quantity }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="小计" width="120">
                        <template #default="{ row }">
                            <span class="subtotal">{{ row.Product.price * row.quantity }}元</span>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>

            <!-- 订单总计 -->
            <div class="order-total">
                <div class="total-info">
                    <span>共 {{ totalQuantity }} 件商品，</span>
                    <span class="total-amount">总计：<em>{{ totalAmount }}元</em></span>
                </div>
                <el-button type="primary" size="large" :loading="submitting" @click="handleSubmitOrder">
                    提交订单
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { cartAPI } from '@/api/cart'
import { orderAPI } from '@/api/order'
import { ElMessage } from 'element-plus'

const router = useRouter()
const baseUrl = 'http://localhost:3000'
const addressFormRef = ref(null)
const submitting = ref(false)
const orderItems = ref([])

// 收货信息表单
const addressForm = ref({
    name: '',
    phone: '',
    address: ''
})

// 表单验证规则
const addressRules = {
    name: [
        { required: true, message: '请输入收货人姓名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入手机号码', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ],
    address: [
        { required: true, message: '请输入收货地址', trigger: 'blur' },
        { min: 5, max: 100, message: '长度在 5 到 100 个字符', trigger: 'blur' }
    ]
}

// 计算总数量
const totalQuantity = computed(() => {
    return orderItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

// 计算总金额
const totalAmount = computed(() => {
    return orderItems.value.reduce(
        (sum, item) => sum + item.Product.price * item.quantity,
        0
    )
})

// 获取购物车数据
const fetchCartData = async () => {
    try {
        const data = await cartAPI.getCartList()
        orderItems.value = data
    } catch (error) {
        console.error('获取购物车数据失败:', error)
        ElMessage.error('获取购物车数据失败')
    }
}

// 处理直接购买的商品
const handleDirectBuy = () => {
    const buyNowItem = router.currentRoute.value.query.buyNowItem
    if (buyNowItem) {
        try {
            const item = JSON.parse(buyNowItem)
            orderItems.value = [{
                Product: {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    description: item.description
                },
                quantity: item.quantity || 1
            }]
        } catch (error) {
            console.error('解析商品数据失败:', error)
            ElMessage.error('商品数据无效')
            router.push('/cart')
        }
    } else {
        fetchCartData()
    }
}

// 提交订单
const handleSubmitOrder = async () => {
    if (!addressFormRef.value) return

    try {
        await addressFormRef.value.validate()
        submitting.value = true

        // 创建订单
        const orderData = {
            shipping_name: addressForm.value.name,
            shipping_phone: addressForm.value.phone,
            shipping_address: addressForm.value.address,
            items: orderItems.value.map(item => ({
                product_id: item.Product.id,
                quantity: item.quantity,
                price: item.Product.price
            }))
        }

        const order = await orderAPI.createOrder(orderData)
        ElMessage.success('订单创建成功')

        // 跳转到订单详情页
        router.push(`/orders/${order.id}`)
    } catch (error) {
        if (error.name !== 'ValidationError') {
            console.error('创建订单失败:', error)
            ElMessage.error(error.response?.data?.message || '创建订单失败')
        }
    } finally {
        submitting.value = false
    }
}

onMounted(() => {
    handleDirectBuy()
})
</script>

<style scoped>
.order-confirm {
    padding: 20px 0;
    min-height: 100vh;
    background: #f5f7fa;
}

.container {
    width: 1200px;
    margin: 0 auto;
}

h2 {
    margin: 0 0 20px;
    color: #333;
}

.address-card,
.order-items {
    margin-bottom: 20px;
    border-radius: 8px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.product-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.product-info img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
}

.product-detail h3 {
    margin: 0 0 5px 0;
    font-size: 16px;
}

.product-detail p {
    margin: 0;
    color: #666;
    font-size: 14px;
}

.price,
.subtotal {
    color: #ff6700;
    font-weight: 500;
}

.order-total {
    background: white;
    padding: 20px;
    border-radius: 8px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 20px;
}

.total-info {
    font-size: 16px;
}

.total-amount {
    margin-left: 10px;
}

.total-amount em {
    color: #ff6700;
    font-size: 24px;
    font-weight: bold;
    font-style: normal;
}
</style>