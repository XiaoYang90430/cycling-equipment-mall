<template>
    <div class="orders-view">
        <div class="container">
            <h2>我的订单</h2>
            <div v-if="loading" class="loading">
                <el-skeleton :rows="5" animated />
            </div>
            <div v-else-if="orders.length === 0" class="empty-orders">
                <el-empty description="暂无订单" />
                <el-button type="primary" @click="$router.push('/')">去购物</el-button>
            </div>
            <template v-else>
                <div class="orders-list">
                    <el-card v-for="order in orders" :key="order.id" class="order-card">
                        <div class="order-header">
                            <span class="order-number">订单号：{{ order.order_number }}</span>
                            <span class="order-status">{{ getStatusText(order.status) }}</span>
                        </div>
                        <div class="order-items">
                            <div v-for="item in order.OrderItems" :key="item.id" class="order-item">
                                <img :src="baseUrl + item.Product.image" :alt="item.Product.name">
                                <div class="item-info">
                                    <h4>{{ item.Product.name }}</h4>
                                    <p class="quantity">数量：{{ item.quantity }}</p>
                                    <p class="price">¥{{ item.price }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="order-footer">
                            <div class="total">
                                总计：<span class="amount">¥{{ order.total_amount }}</span>
                            </div>
                            <div class="actions">
                                <el-button type="primary" size="small" v-if="order.status === 'pending'"
                                    @click="handlePay(order.id)">
                                    去支付
                                </el-button>
                                <el-button type="warning" size="small" v-if="order.status === 'pending'"
                                    @click="handleCancel(order.id)">
                                    取消订单
                                </el-button>
                                <el-button type="danger" size="small"
                                    v-if="['cancelled', 'completed'].includes(order.status)"
                                    @click="handleDelete(order.id)">
                                    删除订单
                                </el-button>
                                <el-button size="small" @click="$router.push(`/orders/${order.id}`)">
                                    查看详情
                                </el-button>
                            </div>
                        </div>
                    </el-card>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { orderAPI } from '@/api/order'
import { ElMessage, ElMessageBox } from 'element-plus'

const baseUrl = 'http://localhost:3000'
const loading = ref(false)
const orders = ref([])

// 获取订单状态文本
const getStatusText = (status) => {
    const statusMap = {
        pending: '待支付',
        paid: '已支付',
        shipped: '已发货',
        completed: '已完成',
        cancelled: '已取消'
    }
    return statusMap[status] || status
}

// 获取订单列表
const fetchOrders = async () => {
    loading.value = true
    try {
        const data = await orderAPI.getUserOrders()
        orders.value = data
    } catch (error) {
        console.error('获取订单列表失败:', error)
        ElMessage.error('获取订单列表失败')
    } finally {
        loading.value = false
    }
}

// 处理支付
const handlePay = async (orderId) => {
    try {
        await orderAPI.payOrder(orderId)
        ElMessage.success('支付成功')
        fetchOrders()
    } catch (error) {
        console.error('支付失败:', error)
        ElMessage.error(error.response?.data?.message || '支付失败')
    }
}

// 取消订单
const handleCancel = async (orderId) => {
    try {
        await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
            type: 'warning'
        })
        await orderAPI.cancelOrder(orderId)
        ElMessage.success('订单已取消')
        fetchOrders()
    } catch (error) {
        if (error !== 'cancel') {
            console.error('取消订单失败:', error)
            ElMessage.error(error.response?.data?.message || '取消订单失败')
        }
    }
}

// 删除订单
const handleDelete = async (orderId) => {
    try {
        await ElMessageBox.confirm('确定要删除该订单吗？删除后不可恢复', '警告', {
            type: 'warning',
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            confirmButtonClass: 'el-button--danger'
        })

        await orderAPI.deleteOrder(orderId)
        ElMessage.success('订单已删除')
        await fetchOrders() // 重新获取订单列表
    } catch (error) {
        if (error !== 'cancel') {
            console.error('删除订单失败:', error)
            ElMessage.error(error.response?.data?.message || '删除订单失败')
        }
    }
}

onMounted(() => {
    fetchOrders()
})
</script>

<style scoped>
.orders-view {
    padding: 20px 0;
    min-height: 100vh;
    background: #f5f7fa;
}

.container {
    width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.order-card {
    margin-bottom: 20px;
}

.order-header {
    display: flex;
    justify-content: space-between;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
}

.order-number {
    color: #666;
}

.order-status {
    color: #ff6700;
}

.order-items {
    padding: 15px 0;
}

.order-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px 0;
}

.order-item img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
}

.item-info h4 {
    margin: 0 0 5px;
    font-size: 14px;
}

.item-info p {
    margin: 0;
    color: #666;
    font-size: 12px;
}

.order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #eee;
}

.amount {
    color: #ff6700;
    font-size: 18px;
    font-weight: bold;
}

.actions {
    display: flex;
    gap: 10px;
}

.empty-orders {
    text-align: center;
    padding: 40px 0;
}
</style>