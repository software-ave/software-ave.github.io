<!-- src/pages/AboutPage.vue -->
<template>
  <div class="about-page">
    <div class="about-header">
      <h1>关于本站</h1>
      <p class="subtitle">一个纯前端构建的博客应用，支持匿名评论</p>
    </div>

    <div class="about-content">
      <div class="about-card">
        <h2>📖 技术栈</h2>
        <div class="tech-stack">
          <div class="tech-item" v-for="tech in techStack" :key="tech.name">
            <div class="tech-icon" :style="{ backgroundColor: tech.color }">
              {{ tech.icon }}
            </div>
            <div class="tech-info">
              <h3>{{ tech.name }}</h3>
              <p>{{ tech.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="about-card">
        <h2>🚀 功能特性</h2>
        <ul class="features-list">
          <li v-for="feature in features" :key="feature">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            {{ feature }}
          </li>
        </ul>
      </div>

      <div class="about-card">
        <h2>🔧 使用说明</h2>
        <div class="instructions">
          <div class="instruction">
            <h3>阅读文章</h3>
            <p>浏览首页的最新文章，点击进入详情页面查看完整内容。</p>
          </div>
          <div class="instruction">
            <h3>发表评论</h3>
            <p>支持匿名评论，无需注册登录，但评论需管理员审核后显示。</p>
          </div>
          <div class="instruction">
            <h3>互动功能</h3>
            <p>可以给评论点赞，举报不良评论，支持实时更新评论列表。</p>
          </div>
        </div>
      </div>

      <div class="about-card">
        <h2>📄 开源协议</h2>
        <p>本项目基于 MIT 协议开源，您可以自由地：</p>
        <ul>
          <li>使用、复制、修改、合并、出版发行、再授权及销售本软件</li>
          <li>在软件副本中包含原作者的版权声明和本许可声明</li>
        </ul>
        <p>项目源码：<a href="https://github.com/yourusername/blog-frontend" target="_blank">GitHub 仓库</a></p>
      </div>

      <div class="about-card">
        <h2>📊 网站统计</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ stats.articles }}</div>
            <div class="stat-label">文章总数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.comments }}</div>
            <div class="stat-label">评论总数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.views }}</div>
            <div class="stat-label">累计阅读</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.tags }}</div>
            <div class="stat-label">标签数量</div>
          </div>
        </div>
      </div>
    </div>

    <div class="about-footer">
      <p>如有任何问题或建议，欢迎通过评论功能反馈。</p>
      <p>© 2024 前端博客 - 基于 Vue 3 + Supabase 构建</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useArticleStore } from '@/stores/useArticleStore'
import { useCommentStore } from '@/stores/useCommentStore'

const articleStore = useArticleStore()
const commentStore = useCommentStore()

const techStack = [
  { 
    name: 'Vue 3', 
    icon: 'V', 
    color: '#42b883',
    description: '渐进式JavaScript框架'
  },
  { 
    name: 'Supabase', 
    icon: 'S', 
    color: '#3ecf8e',
    description: '开源Firebase替代'
  },
  { 
    name: 'Vite', 
    icon: 'V', 
    color: '#646cff',
    description: '下一代前端构建工具'
  },
  { 
    name: 'Pinia', 
    icon: 'P', 
    color: '#ffd859',
    description: 'Vue状态管理库'
  }
]

const features = [
  '纯前端实现，无需后端服务器',
  '支持匿名评论，无需注册登录',
  '实时评论更新',
  '反垃圾机制',
  '响应式设计，支持移动端',
  '评论审核功能',
  '点赞和举报功能',
  '免费部署到Vercel/Netlify'
]

const stats = ref({
  articles: 0,
  comments: 0,
  views: 0,
  tags: 0
})

onMounted(async () => {
  await articleStore.fetchArticles()
  await commentStore.fetchComments()
  
  stats.value.articles = articleStore.totalArticles
  stats.value.comments = commentStore.totalComments
  stats.value.views = articleStore.totalViews
  
  // 计算标签数量
  const tagSet = new Set()
  articleStore.articles.forEach(article => {
    if (article.tags) {
      const tags = Array.isArray(article.tags) 
        ? article.tags 
        : JSON.parse(article.tags || '[]')
      tags.forEach(tag => tagSet.add(tag))
    }
  })
  stats.value.tags = tagSet.size
})
</script>

<style scoped>
.about-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.about-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f1f3f5;
}

.about-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #4dabf7, #339af0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.25rem;
  color: #868e96;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.about-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  transition: transform 0.2s;
}

.about-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.about-card h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tech-stack {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.tech-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
}

.tech-item:hover {
  background: #f1f3f5;
  border-color: #dee2e6;
  transform: translateY(-2px);
}

.tech-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tech-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.tech-info p {
  color: #868e96;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.features-list {
  list-style: none;
  padding-left: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.features-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
}

.features-list li:hover {
  background: #f1f3f5;
  border-color: #dee2e6;
  transform: translateX(4px);
}

.features-list svg {
  color: #40c057;
  flex-shrink: 0;
}

.instructions {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
}

.instruction {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
}

.instruction:hover {
  background: #f1f3f5;
  border-color: #dee2e6;
  transform: translateY(-2px);
}

.instruction h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.instruction p {
  color: #5c6166;
  line-height: 1.6;
  margin: 0;
  font-size: 0.95rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.stat-card {
  background: linear-gradient(135deg, #4dabf7, #339af0);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(51, 154, 240, 0.2);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(51, 154, 240, 0.3);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 500;
}

.about-footer {
  text-align: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #f1f3f5;
  color: #868e96;
  font-size: 0.9rem;
}

.about-footer p {
  margin-bottom: 0.5rem;
}

.about-footer p:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .about-page {
    padding: 1.5rem 1rem;
  }
  
  .about-header h1 {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1.125rem;
  }
  
  .about-card {
    padding: 1.5rem;
  }
  
  .tech-stack,
  .features-list,
  .instructions {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card {
    padding: 1.25rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
}
</style>