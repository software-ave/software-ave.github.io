<!-- src/components/ArticleCard.vue -->
<template>
  <article class="article-card" @click="navigateToArticle">
    <div class="article-image" v-if="article.cover_url">
      <img 
        :src="article.cover_url" 
        :alt="article.title"
        loading="lazy"
        class="cover-image"
      />
    </div>
    
    <div class="article-content">
      <div class="article-meta">
        <div class="category-tags">
          <span 
            v-for="tag in getArticleTags(article.tags)" 
            :key="tag"
            class="tag"
            :style="getTagStyle(tag)"
            @click.stop="filterByTag(tag)"
          >
            {{ tag }}
          </span>
        </div>
        <div class="date-views">
          <time class="publish-date">
            {{ formatDate(article.created_at) }}
          </time>
          <span class="view-count">👁 {{ article.view_count || 0 }}</span>
        </div>
      </div>
      
      <h2 class="article-title">{{ article.title }}</h2>
      
      <p class="article-excerpt">
        {{ article.excerpt || truncateContent(article.content, 150) }}
      </p>
      
      <div class="article-footer">
        <div class="author-info">
          <div class="author-avatar">
            <img 
              v-if="article.author_avatar"
              :src="article.author_avatar" 
              :alt="article.author"
              class="avatar"
            />
            <div v-else class="avatar-default">
              {{ getInitials(article.author) }}
            </div>
          </div>
          <span class="author-name">{{ article.author || '管理员' }}</span>
        </div>
        
        <div class="article-stats">
          <div class="stat-item">
            <svg class="stat-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm-2 13l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
            <span class="stat-text">{{ article.comment_count || 0 }}</span>
          </div>
          <div class="stat-item">
            <svg class="stat-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"/>
            </svg>
            <span class="stat-text">{{ article.like_count || 0 }}</span>
          </div>
          <div class="stat-item">
            <svg class="stat-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
            </svg>
            <span class="stat-text">{{ getReadTime(article.content) }} 分钟</span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useArticleStore } from '@/stores/useArticleStore'

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const articleStore = useArticleStore()

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const day = 24 * 60 * 60 * 1000
  
  if (diff < day) {
    return '今天'
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }
}

// 截断内容
const truncateContent = (content, maxLength) => {
  if (!content) return ''
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}

// 获取阅读时间
const getReadTime = (content) => {
  if (!content) return 0
  const wordCount = content.trim().split(/\s+/).length
  const readingSpeed = 200 // 每分钟阅读字数
  return Math.max(1, Math.round(wordCount / readingSpeed))
}

// 获取作者首字母
const getInitials = (name) => {
  if (!name) return 'A'
  return name.charAt(0).toUpperCase()
}

// 获取文章标签
const getArticleTags = (tags) => {
  if (Array.isArray(tags)) return tags.slice(0, 3)
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags)
      return Array.isArray(parsed) ? parsed.slice(0, 3) : []
    } catch {
      return []
    }
  }
  return []
}

// 标签颜色样式
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

const getTagStyle = (tag) => {
  const color = tagColors[tag] || tagColors['默认']
  return {
    backgroundColor: `${color}15`,
    color: color,
    borderColor: `${color}30`
  }
}

// 导航到文章详情
const navigateToArticle = () => {
  // 增加阅读计数
  articleStore.incrementViewCount(props.article.id)
  router.push(`/article/${props.article.id}`)
}

// 按标签筛选
const filterByTag = (tag) => {
  articleStore.setFilterTag(tag)
  router.push(`/?tag=${encodeURIComponent(tag)}`)
}
</script>

<style scoped>
.article-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.article-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: rgba(77, 171, 247, 0.3);
}

.article-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ec 100%);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-card:hover .cover-image {
  transform: scale(1.05);
}

.article-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 1rem;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.category-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.date-views {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #868e96;
  font-size: 0.9rem;
  white-space: nowrap;
}

.publish-date {
  color: #868e96;
  font-weight: 500;
}

.view-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
}

.article-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.3;
  color: #2c3e50;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 3.9rem;
}

.article-excerpt {
  flex: 1;
  margin: 0;
  color: #5c6166;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.95rem;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f1f3f5;
  margin-top: auto;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #4dabf7, #339af0);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-default {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1rem;
}

.author-name {
  font-weight: 600;
  color: #495057;
  font-size: 0.95rem;
}

.article-stats {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #868e96;
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-icon {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.article-card:hover .stat-icon {
  opacity: 1;
}

.stat-text {
  min-width: 2.5em;
}

/* 无封面图片的样式 */
.article-card:not(:has(.article-image)) .article-content {
  padding-top: 1.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-image {
    height: 180px;
  }
  
  .article-content {
    padding: 1.25rem;
  }
  
  .article-title {
    font-size: 1.3rem;
    min-height: 3.4rem;
  }
  
  .article-excerpt {
    -webkit-line-clamp: 2;
  }
  
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .date-views {
    order: -1;
  }
  
  .article-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .article-stats {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .article-image {
    height: 160px;
  }
  
  .article-title {
    font-size: 1.2rem;
  }
  
  .tag {
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
  }
}
</style>