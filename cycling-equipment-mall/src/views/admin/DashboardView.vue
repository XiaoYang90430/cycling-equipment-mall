<template>
    <div class="dashboard">
        <!-- 数据卡片 -->
        <el-row :gutter="20">
            <el-col :span="6" v-for="(item, index) in statistics" :key="index">
                <el-card class="data-card" shadow="hover">
                    <div class="card-header">
                        <span class="title">{{ item.title }}</span>
                        <el-icon :class="item.icon">
                            <component :is="item.icon" />
                        </el-icon>
                    </div>
                    <div class="card-content">
                        <div class="count">{{ item.count }}</div>
                        <div class="trend" :class="{ up: item.increase > 0, down: item.increase < 0 }">
                            较昨日
                            <span>{{ item.increase > 0 ? '+' : '' }}{{ item.increase }}</span>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="20" class="chart-row">
            <!-- 订单趋势图 -->
            <el-col :span="16">
                <el-card class="chart-card" shadow="hover">
                    <template #header>
                        <div class="chart-header">
                            <span>订单趋势</span>
                            <el-radio-group v-model="orderChartType" size="small">
                                <el-radio-button label="week">最近7天</el-radio-button>
                                <el-radio-button label="month">本月</el-radio-button>
                            </el-radio-group>
                        </div>
                    </template>
                    <div class="chart-content">
                        <div ref="orderChart" class="chart"></div>
                    </div>
                </el-card>
            </el-col>

            <!-- 商品分类统计 -->
            <el-col :span="8">
                <el-card class="chart-card" shadow="hover">
                    <template #header>
                        <div class="chart-header">
                            <span>商品分类统计</span>
                        </div>
                    </template>
                    <div class="chart-content">
                        <div ref="categoryChart" class="chart"></div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="20" class="list-row">
            <!-- 最新订单 -->
            <el-col :span="12">
                <el-card class="list-card" shadow="hover">
                    <template #header>
                        <div class="list-header">
                            <span>最新订单</span>
                            <el-button text>查看更多</el-button>
                        </div>
                    </template>
                    <div class="list-content">
                        <el-table :data="latestOrders" style="width: 100%" size="small">
                            <el-table-column prop="order_no" label="订单号" width="180" />
                            <el-table-column prop="total_amount" label="金额" width="100">
                                <template #default="scope">
                                    ¥{{ scope.row.total_amount }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="status" label="状态">
                                <template #default="scope">
                                    <el-tag :type="getOrderStatusType(scope.row.status)">
                                        {{ getOrderStatusText(scope.row.status) }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="created_at" label="创建时间" />
                        </el-table>
                    </div>
                </el-card>
            </el-col>

            <!-- 最新文章 -->
            <el-col :span="12">
                <el-card class="list-card" shadow="hover">
                    <template #header>
                        <div class="list-header">
                            <span>最新文章</span>
                            <el-button text>查看更多</el-button>
                        </div>
                    </template>
                    <div class="list-content">
                        <el-table :data="latestArticles" style="width: 100%" size="small">
                            <el-table-column prop="title" label="标题" />
                            <el-table-column prop="category" label="分类" width="100" />
                            <el-table-column prop="created_at" label="发布时间" width="180" />
                        </el-table>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import {
    User,
    ShoppingCart,
    Goods,
    Document,
    ArrowUp,
    ArrowDown
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import {
    getStatistics,
    getLatestOrders,
    getLatestArticles,
    getOrderStatistics,
    getProductCategoryStatistics,
} from '@/api/admin'
import { ElMessage } from 'element-plus'

// 统计数据
const statistics = ref([
    { title: '用户总数', count: 0, increase: 0, icon: 'User' },
    { title: '订单总数', count: 0, increase: 0, icon: 'ShoppingCart' },
    { title: '商品总数', count: 0, increase: 0, icon: 'Goods' },
    { title: '文章总数', count: 0, increase: 0, icon: 'Document' },
])

// 图表类型
const orderChartType = ref('week')
const orderChart = ref(null)
const categoryChart = ref(null)
let orderChartInstance = null
let categoryChartInstance = null

// 最新数据
const latestOrders = ref([])
const latestArticles = ref([])

// 获取统计数据
const fetchStatistics = async () => {
    try {
        const data = await getStatistics();
        statistics.value = [
            {
                title: '用户总数',
                count: data.userCount,
                increase: data.userIncrease,
                icon: 'User'
            },
            {
                title: '订单总数',
                count: data.orderCount,
                increase: data.orderIncrease,
                icon: 'ShoppingCart'
            },
            {
                title: '商品总数',
                count: data.productCount,
                increase: data.productIncrease,
                icon: 'Goods'
            },
            {
                title: '文章总数',
                count: data.articleCount,
                increase: data.articleIncrease,
                icon: 'Document'
            },
        ];
    } catch (error) {
        console.error('获取统计数据失败:', error);
        ElMessage.error('获取统计数据失败');
    }
};

// 获取最新订单
const fetchLatestOrders = async () => {
    try {
        const data = await getLatestOrders();
        latestOrders.value = data.map(order => ({
            ...order,
            order_no: order.order_number,
            created_at: new Date(order.created_at).toLocaleString()
        }));
    } catch (error) {
        console.error('获取最新订单失败:', error);
        ElMessage.error('获取最新订单失败');
    }
};

// 获取最新文章
const fetchLatestArticles = async () => {
    try {
        const data = await getLatestArticles();
        latestArticles.value = data.map(article => ({
            ...article,
            created_at: new Date(article.created_at).toLocaleString()
        }));
    } catch (error) {
        console.error('获取最新文章失败:', error);
        ElMessage.error('获取最新文章失败');
    }
};

// 获取订单统计数据
const fetchOrderStatistics = async () => {
    try {
        const data = await getOrderStatistics(orderChartType.value);
        const dates = data.map(item => item.date);
        const counts = data.map(item => item.count);

        if (orderChartInstance) {
            orderChartInstance.dispose();
        }
        orderChartInstance = echarts.init(orderChart.value);
        orderChartInstance.setOption({
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                data: dates,
                axisLabel: {
                    rotate: 45
                }
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: counts,
                    type: 'line',
                    smooth: true,
                    areaStyle: {}
                }
            ]
        });
    } catch (error) {
        console.error('获取订单统计数据失败:', error);
        ElMessage.error('获取订单统计数据失败');
    }
};

// 获取商品分类统计
const fetchProductCategoryStatistics = async () => {
    try {
        const data = await getProductCategoryStatistics();
        const categories = data.map(item => item.category);
        const counts = data.map(item => item.count);

        if (categoryChartInstance) {
            categoryChartInstance.dispose();
        }
        categoryChartInstance = echarts.init(categoryChart.value);
        categoryChartInstance.setOption({
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'left'
            },
            series: [
                {
                    type: 'pie',
                    radius: '50%',
                    data: categories.map((category, index) => ({
                        value: counts[index],
                        name: category
                    })),
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        });
    } catch (error) {
        console.error('获取商品分类统计失败:', error);
        ElMessage.error('获取商品分类统计失败');
    }
};

// 监听日期类型变化
watch(orderChartType, () => {
    fetchOrderStatistics();
});

// 页面加载时获取数据
onMounted(() => {
    fetchStatistics();
    fetchLatestOrders();
    fetchLatestArticles();
    fetchOrderStatistics();
    fetchProductCategoryStatistics();
});

// 组件卸载时清理图表实例
onUnmounted(() => {
    if (orderChartInstance) {
        orderChartInstance.dispose();
    }
    if (categoryChartInstance) {
        categoryChartInstance.dispose();
    }
});

// 获取订单状态类型
const getOrderStatusType = (status) => {
    const statusMap = {
        pending: 'warning',
        paid: 'success',
        shipped: 'primary',
        completed: 'success',
        cancelled: 'danger',
    }
    return statusMap[status] || 'info'
}

// 获取订单状态文本
const getOrderStatusText = (status) => {
    const statusMap = {
        pending: '待付款',
        paid: '已付款',
        shipped: '已发货',
        completed: '已完成',
        cancelled: '已取消',
    }
    return statusMap[status] || status
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
    orderChartInstance?.resize()
    categoryChartInstance?.resize()
})
</script>

<style scoped>
.dashboard {
    padding: 20px;
}

.data-card {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.card-header .title {
    font-size: 16px;
    color: #606266;
}

.card-header .el-icon {
    font-size: 24px;
    color: #409eff;
}

.card-content .count {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 5px;
}

.card-content .trend {
    font-size: 14px;
    color: #909399;
}

.trend.up {
    color: #67c23a;
}

.trend.down {
    color: #f56c6c;
}

.chart-row {
    margin-bottom: 20px;
}

.chart-card {
    height: 400px;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chart-content {
    height: 320px;
}

.chart {
    width: 100%;
    height: 100%;
}

.list-card {
    height: 400px;
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.list-content {
    height: 320px;
    overflow-y: auto;
}
</style>