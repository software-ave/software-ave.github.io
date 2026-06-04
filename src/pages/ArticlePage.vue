<!-- src/pages/ArticlePage.vue -->
<template>
  <div class="article-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loader">
        <div class="loader-spinner"></div>
        <p>加载文章中...</p>
      </div>
    </div>

    <!-- 文章不存在 -->
    <div v-else-if="!article" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" width="64" height="64">
        <path fill="currentColor" d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
      </svg>
      <h3>文章不存在或已删除</h3>
      <button @click="$router.push('/')" class="back-btn">返回首页</button>
    </div>

    <!-- 文章内容 -->
    <article v-else class="article-detail">
      <!-- 返回按钮 -->
      <button @click="$router.push('/')" class="back-link">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        返回文章列表
      </button>

      <!-- 文章头部 -->
      <header class="article-header">
        <div class="article-tags" v-if="articleTags.length">
          <span
            v-for="tag in articleTags"
            :key="tag"
            class="tag"
            :style="getTagStyle(tag)"
          >{{ tag }}</span>
        </div>
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <div class="author-info">
            <div class="author-avatar">
              <img v-if="article.author_avatar" :src="article.author_avatar" :alt="article.author" class="avatar" />
              <div v-else class="avatar-default">{{ getInitials(article.author) }}</div>
            </div>
            <span class="author-name">{{ article.author || '管理员' }}</span>
          </div>
          <div class="meta-stats">
            <span class="meta-item">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
              {{ formatDate(article.created_at) }}
            </span>
            <span class="meta-item">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
              {{ approvedComments.length }} 评论
            </span>
          </div>
        </div>
      </header>

      <!-- 封面图 -->
      <div v-if="article.cover_url" class="article-cover">
        <img :src="article.cover_url" :alt="article.title" />
      </div>

      <!-- 文章内容 -->
      <div class="article-body" v-html="renderedContent"></div>

      <!-- 文章底部 -->
      <div class="article-footer-bar">
        <div class="footer-left">
          <div class="read-time">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
            预计阅读 {{ readTime }} 分钟
          </div>
          <div class="publish-date-full">
            发布于 {{ formatFullDate(article.created_at) }}
          </div>
        </div>
        <div class="footer-actions">
          <template v-if="!showDeleteConfirm">
            <button @click="goEdit" class="icon-btn" title="编辑">
              <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
            <button @click="confirmDelete" class="icon-btn icon-btn-danger" title="删除">
              <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </template>
          <div v-else class="delete-confirm-inline">
            <span>确认删除？</span>
            <input
              v-model="deletePassword"
              type="password"
              placeholder="密码"
              class="delete-pwd-input"
              @keyup.enter="doDelete"
            />
            <button @click="doDelete" class="confirm-btn confirm-yes" :disabled="deleting">
              {{ deleting ? '...' : '确认' }}
            </button>
            <button @click="cancelDelete" class="confirm-btn confirm-no">取消</button>
          </div>
        </div>
      </div>

      <!-- 评论区 -->
      <section class="comments-section">
        <h2 class="comments-title">
          <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
          评论 ({{ approvedComments.length }})
        </h2>

        <!-- 评论列表 -->
        <div v-if="commentLoading" class="comments-loading">
          加载评论中...
        </div>
        <div v-else-if="commentError" class="comments-error">
          {{ commentError }}
        </div>
        <div v-else-if="approvedComments.length === 0" class="no-comments">
          暂无评论，来说两句吧~
        </div>
        <div v-else class="comments-list">
          <div
            v-for="comment in approvedComments"
            :key="comment.id"
            class="comment-card"
          >
            <div class="comment-avatar">
              {{ getInitials(comment.author_name) }}
            </div>
            <div class="comment-body">
              <div class="comment-header">
                <span class="comment-author">{{ comment.author_name || '匿名用户' }}</span>
                <span class="comment-time">{{ formatRelativeTime(comment.created_at) }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
            </div>
          </div>
        </div>

        <!-- 发表评论 -->
        <div class="comment-form">
          <h3 class="form-title">发表评论</h3>
          <div class="form-row">
            <div class="form-group">
              <input
                v-model="newComment.author_name"
                type="text"
                placeholder="你的昵称"
                class="form-input"
                maxlength="20"
              />
            </div>
            <div class="form-group">
              <input
                v-model="newComment.author_email"
                type="email"
                placeholder="邮箱（不会公开）"
                class="form-input"
              />
            </div>
          </div>
          <div class="form-group">
            <textarea
              v-model="newComment.content"
              placeholder="写下你的评论..."
              class="form-textarea"
              rows="4"
              maxlength="500"
            ></textarea>
            <div class="textarea-footer">
              <span class="char-count">{{ newComment.content.length }}/500</span>
              <button
                @click="submitComment"
                class="submit-btn"
                :disabled="!canSubmitComment || submitting"
              >
                {{ submitting ? '提交中...' : '发表评论' }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleStore } from '@/stores/useArticleStore'
import { supabase } from '@/api/supabase'
import { marked } from 'marked'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()

const ADMIN_PASSWORD = 'admin123'

const loading = ref(false)
const article = ref(null)
const commentLoading = ref(false)
const submitting = ref(false)
const commentError = ref('')

// 删除相关
const showDeleteConfirm = ref(false)
const deletePassword = ref('')
const deleting = ref(false)

const comments = ref([])

const newComment = ref({
  author_name: '',
  author_email: '',
  content: ''
})

// 计算属性
const articleTags = computed(() => {
  if (!article.value?.tags) return []
  if (Array.isArray(article.value.tags)) return article.value.tags
  try {
    const parsed = JSON.parse(article.value.tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
})

const readTime = computed(() => {
  if (!article.value?.content) return 0
  // 中文按字数，英文按词数
  const content = article.value.content.replace(/<[^>]*>/g, '')
  const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length
  const englishWords = content.replace(/[\u4e00-\u9fff]/g, '').trim().split(/\s+/).filter(w => w).length
  const totalWords = chineseChars + englishWords
  return Math.max(1, Math.round(totalWords / 300))
})

const approvedComments = computed(() =>
  comments.value.filter(c => c.is_approved === true && c.is_spam !== true)
)

const canSubmitComment = computed(() =>
  newComment.value.author_name.trim() && newComment.value.content.trim()
)

// Markdown 渲染
marked.setOptions({
  breaks: true,
  gfm: true
})

const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  return marked.parse(article.value.content)
})

// 标签颜色
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

// 格式化函数
const getInitials = (name) => {
  if (!name) return '匿'
  return name.charAt(0).toUpperCase()
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const day = 24 * 60 * 60 * 1000
  if (diff < day) return '今天'
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const formatFullDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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
  return formatFullDate(dateString)
}

// 编辑/删除文章
function goEdit() {
  router.push(`/edit/${article.value.id}`)
}

function confirmDelete() {
  showDeleteConfirm.value = true
  deletePassword.value = ''
}

function cancelDelete() {
  showDeleteConfirm.value = false
  deletePassword.value = ''
}

async function doDelete() {
  if (deletePassword.value !== ADMIN_PASSWORD) {
    alert('密码错误')
    return
  }
  deleting.value = true
  try {
    const result = await articleStore.deleteArticle(article.value.id)
    if (result.success) {
      alert('文章已删除')
      router.push('/')
    } else {
      alert('删除失败：' + (result.error || '未知错误'))
    }
  } finally {
    deleting.value = false
    showDeleteConfirm.value = false
  }
}

// 提交评论
const submitComment = async () => {
  if (!canSubmitComment.value || submitting.value) return

  submitting.value = true
  try {
    const { error: supabaseError } = await supabase
      .from('comments')
      .insert([{
        article_id: article.value.id,
        author_name: newComment.value.author_name.trim(),
        author_email: newComment.value.author_email.trim() || null,
        content: newComment.value.content.trim(),
        is_approved: false,
        is_spam: false
      }])

    if (supabaseError) throw supabaseError

    newComment.value.content = ''
    alert('评论已提交，等待审核后显示！')
  } catch (err) {
    alert('评论提交失败：' + (err.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

// 获取文章评论
async function fetchArticleComments(articleId) {
  commentLoading.value = true
  commentError.value = ''
  try {
    const { data, error: supabaseError } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', articleId)
      .eq('is_approved', true)
      .eq('is_spam', false)
      .order('created_at', { ascending: true })

    if (supabaseError) throw supabaseError
    comments.value = data || []
  } catch (err) {
    commentError.value = '加载评论失败：' + err.message
    console.error('获取评论失败:', err)
  } finally {
    commentLoading.value = false
  }
}

// 初始化
let realtimeChannel = null

onMounted(async () => {
  loading.value = true
  const articleId = route.params.id

  // 获取文章详情（不需要密码）
  const data = await articleStore.fetchArticle(articleId)
  article.value = data || articleStore.currentArticle

  // 获取文章评论
  if (articleId) {
    await fetchArticleComments(articleId)

    // 订阅评论实时更新
    realtimeChannel = supabase
      .channel('article-comments')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'comments',
        filter: `article_id=eq.${articleId}`
      }, (payload) => {
        // 评论被审核通过后自动显示
        if (payload.new.is_approved === true && payload.new.is_spam !== true) {
          const exists = comments.value.find(c => c.id === payload.new.id)
          if (!exists) {
            comments.value.push(payload.new)
          }
        }
      })
      .subscribe()
  }

  loading.value = false
})

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})
</script>

<style scoped>
.article-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* 加载状态 */
.loading-container {
  min-height: 400px;
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
  margin-bottom: 1rem;
}

.back-btn {
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

.back-btn:hover {
  background: #228be6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(51, 154, 240, 0.3);
}

/* 返回链接 */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #339af0;
  font-size: 0.95rem;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1.5rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #228be6;
}

/* 文章头部 */
.article-header {
  margin-bottom: 2rem;
}

.article-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.tag {
  padding: 0.3rem 0.9rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.article-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #1a1a2e;
  line-height: 1.3;
  margin: 0 0 1.25rem;
}

.article-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #f1f3f5;
  border-bottom: 1px solid #f1f3f5;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 40px;
  height: 40px;
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
  font-size: 1.1rem;
}

.author-name {
  font-weight: 600;
  color: #495057;
  font-size: 0.95rem;
}

.meta-stats {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #868e96;
  font-size: 0.9rem;
  font-weight: 500;
}

.meta-item svg {
  opacity: 0.7;
}

/* 封面图 */
.article-cover {
  margin: 2rem 0;
  border-radius: 12px;
  overflow: hidden;
}

.article-cover img {
  width: 100%;
  display: block;
}

/* 文章内容 */
.article-body {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #2c3e50;
  padding: 2rem 0;
  word-break: break-word;
}

.article-body :deep(h1),
.article-body :deep(h2),
.article-body :deep(h3),
.article-body :deep(h4),
.article-body :deep(h5),
.article-body :deep(h6) {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
  color: #1a1a2e;
}

.article-body :deep(h2) { font-size: 1.6rem; }
.article-body :deep(h3) { font-size: 1.35rem; }

.article-body :deep(p) {
  margin-bottom: 1.25rem;
}

.article-body :deep(a) {
  color: #339af0;
  text-decoration: none;
  border-bottom: 1px solid #339af055;
  transition: all 0.2s;
}

.article-body :deep(a:hover) {
  color: #228be6;
  border-bottom-color: #228be6;
}

.article-body :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 1.5rem 0;
}

.article-body :deep(blockquote) {
  margin: 1.5rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid #339af0;
  background: #f8f9fa;
  border-radius: 0 8px 8px 0;
  color: #495057;
}

.article-body :deep(pre) {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 1.5rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5rem 0;
  font-size: 0.9rem;
  line-height: 1.6;
}

.article-body :deep(code) {
  background: #f1f3f5;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9em;
}

.article-body :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

.article-body :deep(ul),
.article-body :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 1.25rem;
}

.article-body :deep(li) {
  margin-bottom: 0.5rem;
}

.article-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

.article-body :deep(th),
.article-body :deep(td) {
  border: 1px solid #dee2e6;
  padding: 0.75rem 1rem;
  text-align: left;
}

.article-body :deep(th) {
  background: #f8f9fa;
  font-weight: 600;
}

/* 文章底部 */
.article-footer-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-top: 1px solid #f1f3f5;
  color: #868e96;
  font-size: 0.9rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: none;
  color: #adb5bd;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  color: #339af0;
  background: #f0f8ff;
}

.icon-btn-danger:hover {
  color: #fa5252;
  background: #fff5f5;
}

/* 删除确认（内联） */
.delete-confirm-inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #e03131;
  font-weight: 500;
}

.delete-pwd-input {
  padding: 0.3rem 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 0.8rem;
  outline: none;
  width: 80px;
}

.delete-pwd-input:focus {
  border-color: #fa5252;
}

.confirm-btn {
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-yes {
  background: #fa5252;
  color: white;
}

.confirm-yes:hover:not(:disabled) {
  background: #e03131;
}

.confirm-yes:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirm-no {
  background: white;
  color: #868e96;
  border: 1px solid #e9ecef;
}

.confirm-no:hover {
  background: #f8f9fa;
}

.read-time {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* 评论区 */
.comments-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #f1f3f5;
}

.comments-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1.5rem;
}

/* 评论表单 */
.comment-form {
  background: #f8f9fa;
  margin-top: 2rem;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e9ecef;
}

.form-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  flex: 1;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  background: white;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #4dabf7;
  box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  background: white;
  box-sizing: border-box;
}

.form-textarea:focus {
  border-color: #4dabf7;
  box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.1);
}

.textarea-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
}

.char-count {
  color: #adb5bd;
  font-size: 0.85rem;
}

.submit-btn {
  padding: 0.6rem 1.5rem;
  background: #339af0;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background: #228be6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(51, 154, 240, 0.3);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 评论列表 */
.comments-loading,
.no-comments {
  text-align: center;
  padding: 2rem;
  color: #868e96;
  font-size: 0.95rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.comment-card {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
}

.comment-card:hover {
  border-color: #dee2e6;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.comment-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4dabf7, #339af0);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.comment-author {
  font-weight: 600;
  color: #495057;
  font-size: 0.95rem;
}

.comment-time {
  color: #adb5bd;
  font-size: 0.8rem;
}

.comment-text {
  margin: 0;
  color: #5c6166;
  line-height: 1.6;
  font-size: 0.95rem;
  word-break: break-word;
}

/* 加载更多 */
.load-more {
  text-align: center;
  margin-top: 1.5rem;
}

.load-more-btn {
  padding: 0.6rem 1.5rem;
  background: white;
  color: #339af0;
  border: 2px solid #339af0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.load-more-btn:hover:not(:disabled) {
  background: #339af0;
  color: white;
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式 */
@media (max-width: 768px) {
  .article-page {
    padding: 1.5rem 1rem;
  }

  .article-title {
    font-size: 1.6rem;
  }

  .article-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .meta-stats {
    width: 100%;
    gap: 0.75rem;
  }

  .article-footer-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer-left {
    width: 100%;
  }

  .footer-actions {
    width: 100%;
  }

  .form-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem;
}

.form-row {
    flex-direction: column;
    gap: 0.75rem;
  }

  .article-body {
    font-size: 1rem;
  }

  .comment-form {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .article-title {
    font-size: 1.4rem;
  }

  .article-body {
    font-size: 0.95rem;
    line-height: 1.7;
  }
}
</style>
