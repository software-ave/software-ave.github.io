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
        </div>
      </div>
      
      <h2 class="article-title">{{ article.title }}</h2>
      
      <p class="article-excerpt">
        {{ article.excerpt || truncateContent(article.content, 150) }}
      </p>
      

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