<template>
  <div class="article-list">
    <div class="container">
      <div class="main-content">
        <!-- 分类筛选 -->
        <div class="category-filter">
          <el-radio-group v-model="selectedCategory" @change="handleCategoryChange">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="news">新闻资讯</el-radio-button>
            <el-radio-button label="guide">骑行攻略</el-radio-button>
            <el-radio-button label="review">装备评测</el-radio-button>
            <el-radio-button label="race">赛事动态</el-radio-button>
            <el-radio-button label="maintenance">维修保养</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 文章列表 -->
        <div v-loading="loading" class="articles">
          <el-empty v-if="!loading && (!articles || articles.length === 0)" description="暂无文章" />
          <el-row v-else :gutter="20">
            <el-col :span="8" v-for="article in articles" :key="article.id">
              <el-card class="article-card" @click="goToDetail(article.id)">
                <div class="article-cover">
                  <img :src="baseUrl + article.cover_image" :alt="article.title">
                  <div class="category-tag">{{ getCategoryText(article.category) }}</div>
                </div>
                <div class="article-info">
                  <h3 class="title">{{ article.title }}</h3>
                  <p class="summary">{{ article.summary }}</p>
                  <div class="meta">
                    <span class="author">
                      <img :src="baseUrl + article.author.avatar" :alt="article.author.username" class="avatar">
                      {{ article.author.username }}
                    </span>
                    <span class="date">{{ formatDate(article.created_at) }}</span>
                    <span class="views"><el-icon><View /></el-icon>{{ article.view_count }}</span>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- 分页器 -->
          <div v-if="total > 0" class="pagination">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
              :page-sizes="[6, 12, 18, 24]" :total="total" layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange" @current-change="handleCurrentChange" />
          </div>
        </div>
      </div>

      <!-- 侧边栏 -->
      <div class="sidebar">
        <!-- 热门文章 -->
        <div class="hot-articles">
          <h3>热门文章</h3>
          <ul>
            <li v-for="article in hotArticles" :key="article.id" @click="goToDetail(article.id)">
              <img :src="baseUrl + article.cover_image" :alt="article.title">
              <div class="hot-article-info">
                <h4>{{ article.title }}</h4>
                <span class="views">{{ article.view_count }} 阅读</span>
              </div>
            </li>
          </ul>
        </div>

        <!-- 推荐文章 -->
        <div class="featured-articles">
          <h3>推荐阅读</h3>
          <ul>
            <li v-for="article in featuredArticles" :key="article.id" @click="goToDetail(article.id)">
              <img :src="baseUrl + article.cover_image" :alt="article.title">
              <div class="featured-article-info">
                <h4>{{ article.title }}</h4>
                <p>{{ article.summary }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { articleAPI } from '@/api/article'
import { ElMessage } from 'element-plus'
import { View } from '@element-plus/icons-vue'

const router = useRouter()
const baseUrl = 'http://localhost:3000'
const loading = ref(false)
const articles = ref([])
const hotArticles = ref([])
const featuredArticles = ref([])
const selectedCategory = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(6)
const total = ref(0)

// 获取文章列表
const fetchArticles = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      category: selectedCategory.value
    }
    const response = await articleAPI.getArticles(params)
    articles.value = response.items
    total.value = response.total
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

// 获取热门文章
const fetchHotArticles = async () => {
  try {
    const response = await articleAPI.getHotArticles()
    hotArticles.value = response
  } catch (error) {
    console.error('获取热门文章失败:', error)
  }
}

// 获取推荐文章
const fetchFeaturedArticles = async () => {
  try {
    const response = await articleAPI.getFeaturedArticles()
    featuredArticles.value = response
  } catch (error) {
    console.error('获取推荐文章失败:', error)
  }
}

// 处理分类变化
const handleCategoryChange = () => {
  currentPage.value = 1
  fetchArticles()
}

// 处理分页
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchArticles()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchArticles()
}

// 跳转到文章详情
const goToDetail = (id) => {
  router.push(`/articles/${id}`)
}

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString()
}

// 获取分类文本
const getCategoryText = (category) => {
  const categoryMap = {
    news: '新闻资讯',
    guide: '骑行攻略',
    review: '装备评测',
    race: '赛事动态',
    maintenance: '维修保养'
  }
  return categoryMap[category] || category
}

onMounted(() => {
  fetchArticles()
  fetchHotArticles()
  fetchFeaturedArticles()
})
</script>

<style scoped>
.article-list {
  padding: 20px 0;
  background: #f5f7fa;
  min-height: 100vh;
}

.container {
  width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.category-filter {
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.category-filter :deep(.el-radio-group) {
  white-space: nowrap;
  display: flex;
  gap: 10px;
}

.articles {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.article-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.article-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.article-info {
  padding: 15px;
}

.title {
  margin: 0 0 10px;
  font-size: 18px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.summary {
  color: #666;
  font-size: 14px;
  margin: 0 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.meta {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #999;
  font-size: 13px;
}

.author {
  display: flex;
  align-items: center;
  gap: 5px;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.views {
  display: flex;
  align-items: center;
  gap: 3px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
}

.hot-articles,
.featured-articles {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.hot-articles h3,
.featured-articles h3 {
  margin: 0 0 15px;
  font-size: 18px;
  color: #333;
}

.hot-articles ul,
.featured-articles ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.hot-articles li,
.featured-articles li {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  cursor: pointer;
  transition: all 0.3s;
}

.hot-articles li:hover,
.featured-articles li:hover {
  transform: translateX(5px);
}

.hot-articles img,
.featured-articles img {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.hot-article-info h4,
.featured-article-info h4 {
  margin: 0 0 5px;
  font-size: 14px;
  color: #333;
}

.hot-article-info .views {
  font-size: 12px;
  color: #999;
}

.featured-article-info p {
  margin: 5px 0 0;
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>