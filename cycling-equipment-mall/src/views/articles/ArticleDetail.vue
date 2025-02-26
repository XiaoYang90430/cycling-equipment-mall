<template>
  <div class="article-detail">
    <div class="container">
      <div v-loading="loading">
        <template v-if="article">
          <!-- 文章头部 -->
          <div class="article-header">
            <h1 class="title">{{ article.title }}</h1>
            <div class="meta">
              <span class="author">
                <img :src="baseUrl + article.author.avatar" :alt="article.author.username" class="avatar">
                {{ article.author.username }}
              </span>
              <span class="date">{{ formatDate(article.created_at) }}</span>
              <span class="views"><el-icon>
                  <View />
                </el-icon> {{ article.view_count }}</span>
              <span class="category">{{ getCategoryText(article.category) }}</span>
            </div>
          </div>

          <!-- 文章封面图 -->
          <div v-if="article.cover_image" class="cover-image">
            <img :src="baseUrl + article.cover_image" :alt="article.title">
          </div>

          <!-- 文章内容 -->
          <div class="content markdown-body" v-html="processContent(article.content)"></div>
        </template>
      </div>

      <!-- 相关推荐 -->
      <div class="related-articles">
        <h3>相关推荐</h3>
        <el-row :gutter="20">
          <el-col :span="8" v-for="article in hotArticles" :key="article.id">
            <div class="related-item" @click="goToDetail(article.id)">
              <img :src="baseUrl + article.cover_image" :alt="article.title">
              <h4>{{ article.title }}</h4>
              <p class="views">{{ article.view_count }} 阅读</p>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { articleAPI } from '@/api/article'
import { ElMessage } from 'element-plus'
import { View } from '@element-plus/icons-vue'
import 'github-markdown-css'

const route = useRoute()
const router = useRouter()
const baseUrl = 'http://localhost:3000'

const loading = ref(false)
const article = ref(null)
const hotArticles = ref([])

// 处理文章内容中的图片路径
const processContent = (content) => {
  if (!content) return ''
  // 处理完整的URL格式
  return content.replace(/\[(.*?)\]\((http:\/\/localhost:3000\/uploads\/.*?)\)/g, (match, alt, url) => {
    return `<img src="${url}" alt="${alt}" style="max-width: 100%; margin: 10px 0; border-radius: 4px;">`
  })
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 获取分类文本
const getCategoryText = (category) => {
  const categoryMap = {
    'news': '新闻资讯',
    'guide': '骑行攻略',
    'review': '装备评测',
    'race': '赛事动态',
    'maintenance': '维护保养'
  }
  return categoryMap[category] || category
}

// 获取文章详情
const fetchArticle = async () => {
  loading.value = true
  try {
    const data = await articleAPI.getArticleDetail(route.params.id)
    article.value = data
  } catch (error) {
    console.error('获取文章详情失败:', error)
    ElMessage.error('获取文章详情失败')
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

// 跳转到文章详情
const goToDetail = (id) => {
  router.push(`/articles/${id}`)
  // 刷新当前页面
  if (route.params.id === id.toString()) {
    fetchArticle()
  }
}

onMounted(() => {
  fetchArticle()
  fetchHotArticles()
})
</script>

<style scoped>
.article-detail {
  padding: 20px 0;
  background: #f5f7fa;
  min-height: 100vh;
}

.container {
  width: 1000px;
  margin: 0 auto;
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.article-header {
  margin-bottom: 30px;
}

.title {
  font-size: 32px;
  color: #2c3e50;
  margin: 0 0 20px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #666;
  font-size: 14px;
}

.author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.views {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cover-image {
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;
}

.cover-image img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
}

.content {
  line-height: 1.8;
  color: #2c3e50;
}

.content :deep(img) {
  max-width: 100%;
  border-radius: 4px;
  margin: 10px 0;
}

.content :deep(h1),
.content :deep(h2),
.content :deep(h3),
.content :deep(h4),
.content :deep(h5),
.content :deep(h6) {
  margin: 1.5em 0 0.5em;
}

.content :deep(p) {
  margin: 1em 0;
}

.content :deep(blockquote) {
  border-left: 4px solid #42b983;
  margin: 1em 0;
  padding: 0.5em 1em;
  background: #f8f8f8;
}

.content :deep(code) {
  background: #f8f8f8;
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

.content :deep(pre) {
  background: #f8f8f8;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
}

.article-tags {
  margin-bottom: 30px;
}

.article-tags .el-tag {
  margin-right: 10px;
}

.related-articles {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #eee;
}

.related-articles h3 {
  margin: 0 0 20px;
  font-size: 20px;
  color: #333;
}

.related-item {
  cursor: pointer;
  transition: all 0.3s;
}

.related-item:hover {
  transform: translateY(-5px);
}

.related-item img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

.related-item h4 {
  margin: 0 0 5px;
  font-size: 16px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-item .views {
  color: #999;
  font-size: 12px;
}
</style>