<!-- src/pages/HomePage.vue -->
<template>
  <div class="home-page">
    <!-- 主内容区 -->
    <div class="main-area">
      <!-- 英雄区域 -->
      <section class="hero-section" v-if="showHero">
        <h1 class="hero-title">前端技术博客</h1>
        <p class="hero-subtitle">分享前端开发经验、技术思考与实战案例</p>
      </section>

      <!-- 文章列表 -->
      <main class="main-content">
        <div class="content-header">
          <h2 class="content-title">
            {{ activeTag ? `"${activeTag}" 相关文章` : '最新文章' }}
            <span class="article-count">({{ paginatedArticles.length }}篇)</span>
          </h2>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <div class="loader">
            <div class="loader-spinner"></div>
            <p>加载文章中...</p>
          </div>
        </div>

        <!-- 无内容提示 -->
        <div v-else-if="filteredArticles.length === 0" class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" width="64" height="64">
            <path fill="currentColor" d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
          </svg>
          <h3>{{ searchQuery ? '未找到相关文章' : '暂无文章' }}</h3>
          <p v-if="searchQuery">请尝试其他搜索词</p>
          <button v-else @click="refresh" class="refresh-btn">刷新页面</button>
        </div>

        <!-- 文章网格 -->
        <div v-else class="articles-grid">
          <div
            v-for="article in paginatedArticles"
            :key="article.id"
            class="article-item"
          >
            <ArticleCard :article="article" />
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="pagination-btn prev-btn"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
            上一页
          </button>
          
          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="{
                'page-btn': true,
                active: page === currentPage
              }"
            >
              {{ page === '...' ? '...' : page }}
            </button>
          </div>
          
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="pagination-btn next-btn"
          >
            下一页
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        </div>
      </main>
    </div>

    <!-- 侧边栏 -->
    <aside class="sidebar" v-if="showSidebar">
      <!-- 搜索 -->
      <div class="sidebar-widget">
        <h3 class="widget-title">🔍 搜索</h3>
        <div class="sidebar-search">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索文章..."
              class="search-input"
              @input="debouncedSearch"
            />
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="clear-btn"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- 统计 -->
      <div class="sidebar-widget" v-if="showStats">
        <h3 class="widget-title">📊 博客统计</h3>
        <div class="sidebar-stats">
          <div class="sidebar-stat">
            <span class="sidebar-stat-number">{{ totalArticles }}</span>
            <span class="sidebar-stat-label">文章</span>
          </div>
          <div class="sidebar-stat">
            <span class="sidebar-stat-number">{{ totalComments }}</span>
            <span class="sidebar-stat-label">评论</span>
          </div>
          <div class="sidebar-stat">
            <span class="sidebar-stat-number">{{ totalViews }}</span>
            <span class="sidebar-stat-label">阅读</span>
          </div>
        </div>
      </div>

      <!-- 热门标签 -->
      <div class="sidebar-widget" v-if="showTags">
        <h3 class="widget-title">🏷️ 热门标签</h3>
        <div class="sidebar-tags">
          <button
            v-for="tag in popularTags"
            :key="tag.name"
            class="tag-pill"
            :style="getTagStyle(tag.name)"
            :class="{ active: activeTag === tag.name }"
            @click="toggleTag(tag.name)"
          >
            <span class="tag-name">{{ tag.name }}</span>
            <span class="tag-count">{{ tag.count }}</span>
          </button>
          <button
            v-if="activeTag"
            @click="clearTag"
            class="clear-tag-btn"
          >
            清除筛选
          </button>
        </div>
      </div>

      <!-- 热门文章 -->
      <div class="sidebar-widget">
        <h3 class="widget-title">🔥 热门文章</h3>
        <div class="popular-list">
          <div
            v-for="article in popularArticles"
            :key="article.id"
            class="popular-item"
            @click="navigateToArticle(article.id)"
          >
            <div class="popular-rank">
              {{ popularArticles.indexOf(article) + 1 }}
            </div>
            <div class="popular-content">
              <h4 class="popular-title">{{ article.title }}</h4>
              <div class="popular-meta">
                <span class="popular-views">👁 {{ article.view_count || 0 }}</span>
                <span class="popular-date">{{ formatDate(article.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最新评论 -->
      <div class="sidebar-widget">
        <h3 class="widget-title">💬 最新评论</h3>
        <div class="recent-comments">
          <div v-if="recentComments.length === 0" class="no-comments-tip">暂无评论</div>
          <div
            v-for="comment in recentComments"
            :key="comment.id"
            class="comment-item"
            @click="navigateToArticle(comment.article_id)"
          >
            <div class="comment-avatar">
              {{ getInitials(comment.author_name) }}
            </div>
            <div class="comment-content">
              <div class="comment-author">{{ comment.author_name }}</div>
              <div class="comment-text">{{ truncateContent(comment.content, 40) }}</div>
              <div class="comment-meta">{{ formatRelativeTime(comment.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 归档 -->
      <div class="sidebar-widget">
        <h3 class="widget-title">📅 月度归档</h3>
        <div class="archives-list">
          <div
            v-for="archive in archives"
            :key="archive.month"
            class="archive-item"
            @click="filterByMonth(archive.month)"
          >
            <span class="archive-month">{{ archive.month }}</span>
            <span class="archive-count">{{ archive.count }}</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- 回到顶部按钮 -->
    <button
      v-if="showScrollToTop"
      @click="scrollToTop"
      class="scroll-to-top"
    >
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleStore } from '@/stores/useArticleStore'
import { useCommentStore } from '@/stores/useCommentStore'
import { supabase } from '@/api/supabase'
import ArticleCard from '@/components/ArticleCard.vue'
import { debounce } from 'lodash-es'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const commentStore = useCommentStore()

// 响应式数据
const searchQuery = ref('')
const activeTag = ref('')
const currentPage = ref(1)
const pageSize = 12
const showScrollToTop = ref(false)
const loading = ref(false)

// 标签颜色映射
const tagColors = {
  '技术': '#4dabf7',
  '前端': '#339af0',
  '后端': '#228be6',
  'Vue': '#40c057',
  'React': '#20c997',
  'JavaScript': '#12b886',
  'CSS': '#0ca678',
  '教程': '#099268',
  '分享': '#087f5b',
  '生活': '#fa5252',
  '思考': '#e64980',
  '阅读': '#be4bdb',
  '默认': '#868e96'
}

// 控制显示的元素
const showHero = ref(true)
const showStats = ref(true)
const showTags = ref(true)
const showSidebar = ref(true)

// 计算属性
const filteredArticles = computed(() => {
  let articles = [...articleStore.articles]
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    articles = articles.filter(article => 
      article.title.toLowerCase().includes(query) ||
      article.content.toLowerCase().includes(query) ||
      article.excerpt?.toLowerCase().includes(query)
    )
  }
  
  // 标签过滤
  if (activeTag.value) {
    articles = articles.filter(article => {
      if (!article.tags) return false
      const tags = Array.isArray(article.tags) 
        ? article.tags 
        : JSON.parse(article.tags || '[]')
      return tags.includes(activeTag.value)
    })
  }
  
  // 排序
  return articles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

// 分页相关计算
const totalPages = computed(() => 
  Math.ceil(filteredArticles.value.length / pageSize)
)

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredArticles.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (currentPage.value <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (currentPage.value >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      pages.push(currentPage.value - 1)
      pages.push(currentPage.value)
      pages.push(currentPage.value + 1)
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

// 热门标签
const popularTags = computed(() => {
  const tagCounts = {}
  
  articleStore.articles.forEach(article => {
    if (article.tags) {
      const tags = Array.isArray(article.tags) 
        ? article.tags 
        : JSON.parse(article.tags || '[]')
      
      tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    }
  })
  
  return Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
})

// 统计数据
const totalArticles = computed(() => articleStore.articles.length)
const totalComments = computed(() => commentStore.totalComments)
const totalViews = computed(() => 
  articleStore.articles.reduce((sum, article) => sum + (article.view_count || 0), 0)
)

// 侧边栏数据
const popularArticles = computed(() => 
  [...articleStore.articles]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 5)
)

const recentComments = ref([])

async function fetchRecentComments() {
  try {
    const { data, error: supabaseError } = await supabase
      .from('comments')
      .select('*, articles(title)')
      .eq('is_approved', true)
      .eq('is_spam', false)
      .order('created_at', { ascending: false })
      .limit(5)

    if (supabaseError) throw supabaseError
    recentComments.value = data || []
  } catch (err) {
    console.error('获取最新评论失败:', err)
  }
}

const archives = computed(() => {
  const archiveMap = {}
  
  articleStore.articles.forEach(article => {
    const date = new Date(article.created_at)
    const month = `${date.getFullYear()}年${date.getMonth() + 1}月`
    archiveMap[month] = (archiveMap[month] || 0) + 1
  })
  
  return Object.entries(archiveMap)
    .map(([month, count]) => ({ month, count }))
    .sort(([monthA], [monthB]) => monthB.localeCompare(monthA))
    .slice(0, 6)
})

// 工具函数
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const formatRelativeTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  const minute = 60 * 1000
  const hour = minute * 60
  const day = hour * 24
  
  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < day * 7) return `${Math.floor(diff / day)}天前`
  return formatDate(dateString)
}

const truncateContent = (content, maxLength) => {
  if (!content) return ''
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}

const getInitials = (name) => {
  if (!name) return 'A'
  return name.charAt(0).toUpperCase()
}

const getTagStyle = (tag) => {
  const color = tagColors[tag] || tagColors['默认']
  return {
    backgroundColor: `${color}15`,
    color: color,
    borderColor: `${color}30`
  }
}

// 事件处理
const debouncedSearch = debounce(() => {
  currentPage.value = 1
  updateURL()
}, 300)

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  updateURL()
}

const toggleTag = (tag) => {
  activeTag.value = activeTag.value === tag ? '' : tag
  currentPage.value = 1
  updateURL()
}

const clearTag = () => {
  activeTag.value = ''
  currentPage.value = 1
  updateURL()
}

const filterByMonth = (month) => {
  // 这里可以实现按月份筛选功能
  console.log('Filter by month:', month)
}

const navigateToArticle = (articleId) => {
  router.push(`/article/${articleId}`)
}

// 分页控制
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const goToPage = (page) => {
  if (page === '...' || page === currentPage.value) return
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// URL同步
const updateURL = () => {
  const query = {}
  if (searchQuery.value) query.search = searchQuery.value
  if (activeTag.value) query.tag = activeTag.value
  
  router.replace({ 
    query,
    hash: `#page-${currentPage.value}`
  })
}

// 从URL读取状态
const readFromURL = () => {
  searchQuery.value = route.query.search || ''
  activeTag.value = route.query.tag || ''
  
  const pageMatch = route.hash?.match(/page-(\d+)/)
  if (pageMatch) {
    const page = parseInt(pageMatch[1])
    if (page > 0 && page <= totalPages.value) {
      currentPage.value = page
    }
  }
}

// 滚动处理
const handleScroll = () => {
  showScrollToTop.value = window.scrollY > 500
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 刷新数据
const refresh = async () => {
  loading.value = true
  await Promise.all([
    articleStore.fetchArticles(),
    fetchRecentComments()
  ])
  loading.value = false
}

// 初始化
onMounted(async () => {
  // 加载数据
  loading.value = true
  await Promise.all([
    articleStore.fetchArticles(),
    fetchRecentComments()
  ])
  loading.value = false
  
  // 从URL读取状态
  readFromURL()
  
  // 监听滚动
  window.addEventListener('scroll', handleScroll)
  
  // 监听路由变化
  const unwatch = watch(() => route.query, () => {
    readFromURL()
  })
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    unwatch()
  })
})
</script>

<style scoped>
.home-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  position: relative;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
  align-items: start;
}

/* 主内容区 */
.main-area {
  min-width: 0;
}

/* 英雄区域 */
.hero-section {
  text-align: center;
  padding: 3rem 0 2rem;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #4dabf7 0%, #339af0 100%);
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem;
  line-height: 1.2;
  color: white;
}

.hero-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 400;
  color: white;
}

/* 侧边栏搜索 */
.sidebar-search {
  margin-top: 0.5rem;
}

.search-box {
  position: relative;
  background: white;
  border-radius: 10px;
  padding: 0.4rem 0.75rem;
  display: flex;
  align-items: center;
  border: 2px solid #e9ecef;
  transition: all 0.3s;
}

.search-box:focus-within {
  border-color: #4dabf7;
  box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.1);
}

.search-icon {
  color: #868e96;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.9rem;
  padding: 0.5rem 0;
  background: transparent;
  color: #2c3e50;
  width: 100%;
}

.search-input::placeholder {
  color: #adb5bd;
}

.clear-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #adb5bd;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  line-height: 1;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #fa5252;
}

/* 侧边栏统计 */
.sidebar-stats {
  display: flex;
  justify-content: space-around;
  padding: 0.5rem 0;
}

.sidebar-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.sidebar-stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #339af0;
}

.sidebar-stat-label {
  font-size: 0.8rem;
  color: #868e96;
}

/* 侧边栏标签 */
.sidebar-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-pill {
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: white;
  border: 1px solid transparent;
}

.tag-pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.tag-pill.active {
  border-width: 2px;
  font-weight: 700;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.12);
}

.tag-name { font-weight: inherit; }

.tag-count {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 0.05rem 0.4rem;
  font-size: 0.7rem;
  font-weight: 600;
}

.clear-tag-btn {
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  border: 2px solid #fa5252;
  background: white;
  color: #fa5252;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.8rem;
}

.clear-tag-btn:hover {
  background: #fa5252;
  color: white;
}

/* 主内容区域 */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.content-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.article-count {
  font-size: 1rem;
  font-weight: 400;
  color: #868e96;
}

/* 文章网格 */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  align-items: stretch;
}

.article-item {
  height: 100%;
}

/* 加载状态 */
.loading-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader {
  text-align: center;
  color: #868e96;
}

.loader-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #f1f3f5;
  border-top-color: #339af0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #f8f9fa;
  border-radius: 16px;
  border: 2px dashed #dee2e6;
}

.empty-icon {
  color: #adb5bd;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #495057;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #868e96;
  margin-bottom: 1.5rem;
}

.refresh-btn {
  padding: 0.75rem 2rem;
  background: #339af0;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.refresh-btn:hover {
  background: #228be6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(51, 154, 240, 0.3);
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 3rem 0 2rem;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e9ecef;
  background: white;
  color: #495057;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #339af0;
  color: #339af0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.page-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e9ecef;
  background: white;
  color: #495057;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(.active) {
  border-color: #339af0;
  color: #339af0;
  transform: translateY(-2px);
}

.page-btn.active {
  background: #339af0;
  border-color: #339af0;
  color: white;
  box-shadow: 0 4px 12px rgba(51, 154, 240, 0.3);
}

/* 统计底部 */
.stats-footer {
  text-align: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin-top: 1rem;
}

.stats-summary p {
  color: #868e96;
  font-size: 0.95rem;
  margin: 0;
}

/* 侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 5rem;
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
}

.sidebar-widget {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.widget-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 热门文章列表 */
.popular-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.popular-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.popular-item:hover {
  background: #f8f9fa;
  border-color: #e9ecef;
  transform: translateX(4px);
}

.popular-rank {
  width: 28px;
  height: 28px;
  background: #f1f3f5;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: #495057;
  flex-shrink: 0;
}

.popular-content {
  flex: 1;
  min-width: 0;
}

.popular-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.popular-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: #868e96;
}

.popular-views {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* 最新评论 */
.no-comments-tip {
  text-align: center;
  color: #adb5bd;
  font-size: 0.9rem;
  padding: 1rem 0;
}

.recent-comments {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.comment-item:hover {
  background: #f8f9fa;
  border-color: #e9ecef;
  transform: translateX(4px);
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4dabf7, #339af0);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-author {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.25rem;
}

.comment-text {
  font-size: 0.85rem;
  color: #5c6166;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.comment-meta {
  font-size: 0.75rem;
  color: #868e96;
}

/* 归档列表 */
.archives-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.archive-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.archive-item:hover {
  background: #f8f9fa;
  border-color: #e9ecef;
  transform: translateX(4px);
}

.archive-month {
  font-size: 0.95rem;
  color: #495057;
  font-weight: 500;
}

.archive-count {
  background: #f1f3f5;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
}

/* 回到顶部按钮 */
.scroll-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #339af0;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(51, 154, 240, 0.4);
  transition: all 0.3s;
  z-index: 1000;
  opacity: 0;
  transform: translateY(20px);
  pointer-events: none;
}

.scroll-to-top.show {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.scroll-to-top:hover {
  background: #228be6;
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(51, 154, 240, 0.6);
}

/* 响应式设计 */
@media (max-width: 1023px) {
  .home-page {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    max-height: none;
  }

  .hero-title {
    font-size: 2rem;
  }

  .articles-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .home-page {
    padding: 0 1rem;
  }

  .hero-section {
    padding: 2rem 1rem 1.5rem;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .articles-grid {
    grid-template-columns: 1fr;
  }

  .scroll-to-top {
    bottom: 1rem;
    right: 1rem;
  }
}
</style>