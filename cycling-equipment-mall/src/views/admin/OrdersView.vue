<template>
    <div class="orders-view">
        <el-card class="table-card">
            <template #header>
                <div class="card-header">
                    <span>订单管理</span>
                </div>
            </template>

            <!-- 搜索和筛选 -->
            <div class="filter-section">
                <el-input v-model="searchQuery" placeholder="搜索订单号" class="search-input" clearable @clear="handleSearch"
                    @keyup.enter="handleSearch">
                    <template #append>
                        <el-button @click="handleSearch">
                            <el-icon>
                                <Search />
                            </el-icon>
                        </el-button>
                    </template>
                </el-input>
                <el-select v-model="statusFilter" placeholder="订单状态" clearable @change="handleSearch">
                    <el-option label="待支付" value="pending" />
                    <el-option label="已支付" value="paid" />
                    <el-option label="已发货" value="shipped" />
                    <el-option label="已完成" value="completed" />
                    <el-option label="已取消" value="cancelled" />
                </el-select>
                <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
                    end-placeholder="结束日期" value-format="YYYY-MM-DD" @change="handleSearch" />
            </div>

            <!-- 订单表格 -->
            <el-table v-loading="loading" :data="orders" style="width: 100%" border>
                <el-table-column prop="order_number" label="订单号" width="180" />
                <el-table-column label="商品信息" min-width="300">
                    <template #default="{ row }">
                        <div class="order-products">
                            <div v-for="item in row.OrderItems" :key="item.id" class="order-product">
                                <el-image :src="baseUrl + item.Product.image"
                                    :preview-src-list="[baseUrl + item.Product.image]" fit="cover"
                                    style="width: 60px; height: 60px; border-radius: 4px; border: 1px solid #eee; transition: all 0.3s;"
                                    :preview-teleported="true" :initial-index="0" class="product-image" />
                                <div class="product-info">
                                    <span class="name">{{ item.Product.name }}</span>
                                    <span class="quantity">x{{ item.quantity }}</span>
                                </div>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="total_amount" label="订单金额" width="120">
                    <template #default="{ row }">
                        ¥{{ row.total_amount }}
                    </template>
                </el-table-column>
                <el-table-column prop="shipping_name" label="收货人" width="100" />
                <el-table-column prop="shipping_phone" label="联系电话" width="120" />
                <el-table-column prop="shipping_address" label="收货地址" min-width="200" show-overflow-tooltip />
                <el-table-column prop="status" label="订单状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)">
                            {{ getStatusText(row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="created_at" label="下单时间" width="180">
                    <template #default="{ row }">
                        {{ formatDate(row.created_at) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                        <el-button v-if="row.status === 'paid'" type="primary" size="small"
                            @click="handleShip(row)">发货</el-button>
                        <el-button v-if="row.status === 'shipped'" type="success" size="small"
                            @click="handleComplete(row)">完成</el-button>
                        <el-button v-if="row.status === 'pending'" type="warning" size="small"
                            @click="handleCancel(row)">取消</el-button>
                        <el-button type="info" size="small" @click="handleDetail(row)">详情</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页器 -->
            <div class="pagination-container">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </el-card>

        <!-- 订单详情对话框 -->
        <el-dialog v-model="dialogVisible" title="订单详情" width="800px">
            <div v-if="currentOrder" class="order-detail">
                <div class="detail-section">
                    <h3>基本信息</h3>
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="订单号">{{ currentOrder.order_number }}</el-descriptions-item>
                        <el-descriptions-item label="下单时间">
                            {{ formatDate(currentOrder.created_at) }}
                        </el-descriptions-item>
                        <el-descriptions-item label="订单状态">
                            <el-tag :type="getStatusType(currentOrder.status)">
                                {{ getStatusText(currentOrder.status) }}
                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="订单金额">¥{{ currentOrder.total_amount }}</el-descriptions-item>
                    </el-descriptions>
                </div>

                <div class="detail-section">
                    <h3>收货信息</h3>
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="收货人">{{ currentOrder.shipping_name }}</el-descriptions-item>
                        <el-descriptions-item label="联系电话">{{ currentOrder.shipping_phone }}</el-descriptions-item>
                        <el-descriptions-item label="收货地址" :span="2">
                            {{ currentOrder.shipping_address }}
                        </el-descriptions-item>
                    </el-descriptions>
                </div>

                <div class="detail-section">
                    <h3>商品信息</h3>
                    <el-table :data="currentOrder.OrderItems" border>
                        <el-table-column label="商品信息">
                            <template #default="{ row }">
                                <div class="order-item">
                                    <img :src="baseUrl + row.Product.image" class="detail-product-image" />
                                    <div class="item-info">
                                        <p class="item-name">{{ row.Product.name }}</p>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="price" label="单价" width="120">
                            <template #default="{ row }">¥{{ row.price }}</template>
                        </el-table-column>
                        <el-table-column prop="quantity" label="数量" width="100" />
                        <el-table-column label="小计" width="120">
                            <template #default="{ row }">¥{{ row.price * row.quantity }}</template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { orderAPI } from '@/api/order'

const baseUrl = 'http://localhost:3000'
const loading = ref(false)
const orders = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const statusFilter = ref('')
const dateRange = ref(null)
const dialogVisible = ref(false)
const currentOrder = ref(null)

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

// 获取订单状态标签类型
const getStatusType = (status) => {
    const typeMap = {
        pending: 'warning',
        paid: 'primary',
        shipped: 'success',
        completed: 'success',
        cancelled: 'info'
    }
    return typeMap[status] || ''
}

// 格式化日期
const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleString()
}

// 获取订单列表
const fetchOrders = async () => {
    loading.value = true
    try {
        const params = {
            page: currentPage.value,
            pageSize: pageSize.value,
            search: searchQuery.value,
            status: statusFilter.value,
            startDate: dateRange.value?.[0],
            endDate: dateRange.value?.[1]
        }
        const data = await orderAPI.getOrders(params)
        orders.value = data.items
        total.value = data.total
    } catch (error) {
        console.error('获取订单列表失败:', error)
        ElMessage.error('获取订单列表失败')
    } finally {
        loading.value = false
    }
}

// 处理搜索
const handleSearch = () => {
    currentPage.value = 1
    fetchOrders()
}

// 处理分页
const handleSizeChange = (val) => {
    pageSize.value = val
    fetchOrders()
}

const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchOrders()
}

// 查看订单详情
const handleDetail = (order) => {
    currentOrder.value = order
    dialogVisible.value = true
}

// 处理发货
const handleShip = async (order) => {
    try {
        await ElMessageBox.confirm('确定要发货吗？', '提示', {
            type: 'warning'
        })
        await orderAPI.updateOrderStatus(order.id, 'shipped')
        ElMessage.success('发货成功')
        fetchOrders()
    } catch (error) {
        if (error !== 'cancel') {
            console.error('发货失败:', error)
            ElMessage.error('发货失败')
        }
    }
}

const handleComplete = async (order) => {
    try {
        await ElMessageBox.confirm('确定要完成订单吗？', '提示', {
            type: 'warning'
        })
        await orderAPI.updateOrderStatus(order.id, 'completed')
        ElMessage.success('订单已完成')
        fetchOrders()
    } catch (error) {
        if (error !== 'cancel') {
            console.error('完成订单失败:', error)
            ElMessage.error('完成订单失败')
        }
    }
}

const handleCancel = async (order) => {
    try {
        await ElMessageBox.confirm('确定要取消订单吗？', '提示', {
            type: 'warning'
        })
        await orderAPI.updateOrderStatus(order.id, 'cancelled')
        ElMessage.success('订单已取消')
        fetchOrders()
    } catch (error) {
        if (error !== 'cancel') {
            console.error('取消订单失败:', error)
            ElMessage.error('取消订单失败')
        }
    }
}

onMounted(() => {
    fetchOrders()
})
</script>

<style scoped>
.orders-view {
    min-height: 100%;
}

.table-card {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.filter-section {
    margin-bottom: 20px;
    display: flex;
    gap: 15px;
}

.search-input {
    width: 300px;
}

.order-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
    border-bottom: none;
}

.product-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    object-fit: cover;
    margin-right: 12px;
    border: 1px solid #eee;
}

.item-info {
    flex: 1;
    min-width: 0;
}

.item-name {
    margin: 0 0 4px;
    font-size: 14px;
    color: #333;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.item-meta {
    margin: 0;
    font-size: 12px;
    color: #666;
}

.price {
    color: #f56c6c;
    margin-right: 12px;
}

.quantity {
    color: #999;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.order-detail {
    padding: 20px;
}

.detail-section {
    margin-bottom: 30px;
}

.detail-section h3 {
    margin: 0 0 15px;
    font-size: 16px;
    color: #333;
}

:deep(.el-descriptions) {
    margin-bottom: 20px;
}

:deep(.el-descriptions__label) {
    width: 100px;
}

.order-products {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.order-product {
    display: flex;
    align-items: center;
    gap: 10px;
}

.product-image {
    cursor: pointer;
}

.product-image:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.product-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.product-info .name {
    font-size: 14px;
    color: #333;
}

.product-info .quantity {
    font-size: 12px;
    color: #999;
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

.detail-product-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    object-fit: cover;
    margin-right: 12px;
    border: 1px solid #eee;
}
</style>