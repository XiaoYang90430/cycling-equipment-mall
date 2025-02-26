<template>
    <div class="cart-view">
        <div class="container">
            <h2>我的购物车</h2>
            <div v-if="loading" class="loading">
                <el-skeleton :rows="5" animated />
            </div>
            <div v-else-if="cartItems.length === 0" class="empty-cart">
                <el-empty description="购物车是空的" />
                <el-button type="primary" @click="$router.push('/')">去购物</el-button>
            </div>
            <template v-else>
                <div class="cart-items">
                    <el-table :data="cartItems" style="width: 100%">
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
                        <el-table-column label="单价" prop="Product.price" width="120">
                            <template #default="{ row }">
                                <span class="price">{{ row.Product.price }}元</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="数量" width="200">
                            <template #default="{ row }">
                                <el-input-number v-model="row.quantity" :min="1" :max="row.Product.stock"
                                    @change="handleQuantityChange(row.id, $event)" />
                            </template>
                        </el-table-column>
                        <el-table-column label="小计" width="120">
                            <template #default="{ row }">
                                <span class="subtotal">{{ row.Product.price * row.quantity }}元</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="120">
                            <template #default="{ row }">
                                <el-button type="danger" size="small" @click="handleRemove(row.id)">
                                    删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div class="cart-footer">
                    <div class="total">
                        总计：<span class="amount">{{ totalAmount }}元</span>
                    </div>
                    <el-button type="primary" size="large" @click="handleCheckout">
                        去结算
                    </el-button>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { cartAPI } from "@/api/cart";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";

const loading = ref(false);
const cartItems = ref([]);
const router = useRouter();

// 添加基础URL
const baseUrl = "http://localhost:3000";


// 计算总金额
const totalAmount = computed(() => {
    return cartItems.value.reduce(
        (sum, item) => sum + item.Product.price * item.quantity,
        0
    );
});

// 获取购物车数据
const fetchCartData = async () => {
    loading.value = true;
    try {
        const data = await cartAPI.getCartList();
        cartItems.value = data;
    } catch (error) {
        console.error("获取购物车数据失败:", error);
    } finally {
        loading.value = false;
    }
};

// 更新商品数量
const handleQuantityChange = async (id, quantity) => {
    try {
        await cartAPI.updateQuantity(id, quantity);
        ElMessage.success("数量更新成功");
    } catch (error) {
        console.error("更新数量失败:", error);
    }
};

// 删除商品
const handleRemove = async (id) => {
    try {
        await ElMessageBox.confirm("确定要删除这个商品吗？", "提示", {
            type: "warning",
        });
        await cartAPI.removeFromCart(id);
        ElMessage.success("删除成功");
        await fetchCartData();
    } catch (error) {
        if (error !== "cancel") {
            console.error("删除失败:", error);
        }
    }
};

// 处理结算
const handleCheckout = () => {
    if (cartItems.value.length === 0) {
        ElMessage.warning('购物车为空，请先添加商品')
        return
    }
    router.push('/order/confirm')
}

onMounted(() => {
    fetchCartData();
});
</script>

<style scoped>
.cart-view {
    padding: 20px 0;
    min-height: 100vh;
    background: #f5f7fa;
}

.container {
    width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background: white;
    border-radius: 8px;
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

.cart-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 20px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
}

.total {
    font-size: 16px;
}

.amount {
    color: #ff6700;
    font-size: 24px;
    font-weight: bold;
}

.empty-cart {
    text-align: center;
    padding: 40px 0;
}
</style>