<template>
    <div class="order-detail">
        <div class="container">
            <h2>订单详情</h2>

            <el-card v-loading="loading">
                <!-- 订单状态 -->
                <div class="status-section">
                    <div class="status-info">
                        <el-tag :type="statusType">{{ statusText }}</el-tag>
                        <span class="order-number">订单号：{{ order.order_number }}</span>
                    </div>
                    <div class="status-actions">
                        <el-button v-if="order.status === 'pending'" type="primary" @click="handlePay">
                            立即支付
                        </el-button>
                        <el-button v-if="order.status === 'pending'" @click="handleCancel">
                            取消订单
                        </el-button>
                    </div>
                </div>

                <!-- 收货信息 -->
                <div class="info-section">
                    <h3>收货信息</h3>
                    <div class="info-content">
                        <p><span class="label">收货人：</span>{{ order.shipping_name }}</p>
                        <p><span class="label">联系电话：</span>{{ order.shipping_phone }}</p>
                        <p><span class="label">收货地址：</span>{{ order.shipping_address }}</p>
                    </div>
                </div>

                <!-- 商品信息 -->
                <div class="info-section">
                    <h3>商品信息</h3>
                    <el-table :data="order.OrderItems" style="width: 100%">
                        <el-table-column label="商品信息">
                            <template #default="{ row }">
                                <div class="product-info">
                                    <img :src="baseUrl + row.Product.image" :alt="row.Product.name" />
                                    <div class="product-detail">
                                        <h4>{{ row.Product.name }}</h4>
                                        <p>{{ row.Product.description }}</p>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="单价" width="120">
                            <template #default="{ row }">
                                <span class="price">{{ row.price }}元</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="数量" prop="quantity" width="120" />
                        <el-table-column label="小计" width="120">
                            <template #default="{ row }">
                                <span class="subtotal">{{ (row.price * row.quantity).toFixed(2) }}元</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>

                <!-- 订单金额 -->
                <div class="amount-section">
                    <div class="amount-info">
                        <p>商品总额：<span class="price">{{ order.total_amount }}元</span></p>
                        <p>运费：<span class="price">0元</span></p>
                        <p class="total">实付金额：<span class="price">{{ order.total_amount }}元</span></p>
                    </div>
                </div>

                <!-- 订单时间信息 -->
                <div class="time-section">
                    <p>下单时间：{{ formatDate(order.created_at) }}</p>
                    <p v-if="order.paid_at">支付时间：{{ formatDate(order.paid_at) }}</p>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderAPI } from '@/api/order'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const baseUrl = 'http://localhost:3000'
const loading = ref(false)
const order = ref({})

// 订单状态映射
const statusMap = {
    pending: { type: 'warning', text: '待支付' },
    paid: { type: 'success', text: '已支付' },
    shipped: { type: 'primary', text: '已发货' },
    completed: { type: 'success', text: '已完成' },
    cancelled: { type: 'info', text: '已取消' }
}

// 状态标签类型
const statusType = computed(() => {
    return statusMap[order.value.status]?.type || 'info'
})

// 状态文本
const statusText = computed(() => {
    return statusMap[order.value.status]?.text || '未知状态'
})

// 格式化日期
const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}

// 获取订单详情
const fetchOrderDetail = async () => {
    loading.value = true
    try {
        const data = await orderAPI.getOrderDetail(route.params.id)
        order.value = data
    } catch (error) {
        console.error('获取订单详情失败:', error)
        ElMessage.error('获取订单详情失败')
    } finally {
        loading.value = false
    }
}

// 支付订单
const handlePay = async () => {
    try {
        await orderAPI.payOrder(order.value.id)
        ElMessage.success('支付成功')
        fetchOrderDetail()
    } catch (error) {
        console.error('支付失败:', error)
        ElMessage.error('支付失败')
    }
}

// 取消订单
const handleCancel = async () => {
    try {
        await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
            type: 'warning'
        })
        await orderAPI.cancelOrder(order.value.id)
        ElMessage.success('订单已取消')
        fetchOrderDetail()
    } catch (error) {
        if (error !== 'cancel') {
            console.error('取消订单失败:', error)
            ElMessage.error('取消订单失败')
        }
    }
}

onMounted(() => {
    fetchOrderDetail()
})
</script>

<style scoped>
.order-detail {
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

.status-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
}

.status-info {
    display: flex;
    align-items: center;
    gap: 20px;
}

.order-number {
    color: #666;
}

.info-section {
    margin-top: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
}

.info-section h3 {
    margin: 0 0 15px;
    font-size: 16px;
    color: #333;
}

.info-content {
    color: #666;
}

.info-content p {
    margin: 8px 0;
}

.label {
    display: inline-block;
    width: 80px;
    color: #999;
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

.product-detail h4 {
    margin: 0 0 5px;
    font-size: 14px;
}

.product-detail p {
    margin: 0;
    color: #666;
    font-size: 12px;
}

.price,
.subtotal {
    color: #ff6700;
    font-weight: 500;
}

.amount-section {
    margin-top: 20px;
    text-align: right;
}

.amount-info p {
    margin: 8px 0;
}

.amount-info .total {
    font-size: 16px;
    font-weight: 500;
}

.time-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    color: #999;
}

.time-section p {
    margin: 5px 0;
}
</style>