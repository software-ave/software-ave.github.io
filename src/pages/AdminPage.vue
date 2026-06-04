<!-- src/pages/AdminPage.vue -->
<template>
  <div class="admin-page">
    <!-- 未验证密码 -->
    <div v-if="!authenticated" class="auth-section">
      <div class="auth-card">
        <h2 class="auth-title">评论审核</h2>
        <p class="auth-desc">请输入管理员密码</p>
        <div class="auth-form">
          <input
            v-model="passwordInput"
            type="password"
            placeholder="请输入密码"
            class="auth-input"
            @keyup.enter="verifyPassword"
          />
          <button @click="verifyPassword" class="auth-btn">验证</button>
        </div>
        <p v-if="authError" class="auth-error">密码错误，请重试</p>
      </div>
    </div>

    <!-- 审核内容 -->
    <div v-else class="admin-content">
      <div class="admin-header">
        <h1 class="admin-title">评论审核</h1>
        <div class="admin-actions">
          <button @click="refreshAll" class="refresh-btn" :disabled="allLoading">
            {{ allLoading ? '刷新中...' : '刷新' }}
          </button>
          <button @click="$router.push('/')" class="back-btn">返回首页</button>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="errorMsg" class="error-banner">
        {{ errorMsg }}
        <button @click="errorMsg = ''" class="error-close">&times;</button>
      </div>

      <!-- 统计 -->
      <div class="stats-bar">
        <div class="stat-item pending-stat">
          <span class="stat-number">{{ pendingList.length }}</span>
          <span class="stat-label">待审核</span>
        </div>
        <div class="stat-item approved-stat">
          <span class="stat-number">{{ approvedList.length }}</span>
          <span class="stat-label">已通过</span>
        </div>
        <div class="stat-item rejected-stat">
          <span class="stat-number">{{ rejectedList.length }}</span>
          <span class="stat-label">已拒绝</span>
        </div>
        <div class="stat-item total-stat">
          <span class="stat-number">{{ allComments.length }}</span>
          <span class="stat-label">总计</span>
        </div>
      </div>

      <!-- Tab 切换 -->
      <div class="tab-bar">
        <button
          :class="['tab-btn', { active: activeTab === 'pending' }]"
          @click="activeTab = 'pending'"
        >
          待审核 ({{ pendingList.length }})
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'approved' }]"
          @click="activeTab = 'approved'"
        >
          已通过 ({{ approvedList.length }})
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'rejected' }]"
          @click="activeTab = 'rejected'"
        >
          已拒绝 ({{ rejectedList.length }})
        </button>
      </div>

      <!-- 加载中 -->
      <div v-if="allLoading && allComments.length === 0" class="loading-state">
        加载中...
      </div>

      <!-- 无评论 -->
      <div v-else-if="currentList.length === 0" class="empty-state">
        <svg v-if="activeTab === 'pending'" viewBox="0 0 24 24" width="48" height="48">
          <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <h3>{{ emptyText }}</h3>
      </div>

      <!-- 评论列表 -->
      <div v-else class="comment-list">
        <div
          v-for="comment in currentList"
          :key="comment.id"
          :class="['comment-card', comment.cardClass]"
        >
          <div class="comment-header">
            <div class="comment-author-info">
              <div :class="['author-avatar', comment.avatarClass]">{{ getInitials(comment.author_name) }}</div>
              <div>
                <div class="author-name">{{ comment.author_name || '匿名用户' }}</div>
                <div class="author-email" v-if="comment.author_email">{{ comment.author_email }}</div>
              </div>
            </div>
            <div class="comment-right">
              <span :class="['status-badge', comment.statusClass]">{{ comment.statusText }}</span>
              <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
            </div>
          </div>

          <div class="comment-article" v-if="comment.article_title">
            <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            {{ comment.article_title }}
          </div>
          <div class="comment-article" v-else-if="comment.article_id">
            <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            文章ID: {{ comment.article_id }}
          </div>

          <p class="comment-text">{{ comment.content }}</p>

          <div class="comment-actions" v-if="activeTab === 'pending'">
            <button @click="handleApprove(comment.id)" class="btn btn-approve">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              通过
            </button>
            <button @click="handleReject(comment.id)" class="btn btn-reject">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              拒绝
            </button>
          </div>

          <div class="comment-actions" v-else-if="activeTab === 'rejected'">
            <button @click="handleApprove(comment.id)" class="btn btn-approve">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              恢复通过
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { supabase } from '@/api/supabase'

const ADMIN_PASSWORD = 'admin123'

const authenticated = ref(false)
const passwordInput = ref('')
const authError = ref(false)
const errorMsg = ref('')
const activeTab = ref('pending')

const allComments = ref([])
const allLoading = ref(false)

function verifyPassword() {
  if (passwordInput.value === ADMIN_PASSWORD) {
    authenticated.value = true
    authError.value = false
    fetchAllComments()
  } else {
    authError.value = true
    passwordInput.value = ''
  }
}

// 直接查询所有评论（不走 store，避免 RLS 策略和 store 状态冲突）
async function fetchAllComments() {
  allLoading.value = true
  errorMsg.value = ''
  try {
    // 查询评论，关联文章标题
    const { data, error: supabaseError } = await supabase
      .from('comments')
      .select('*, articles(title)')
      .order('created_at', { ascending: false })

    if (supabaseError) throw supabaseError

    // 提取文章标题
    allComments.value = (data || []).map(c => ({
      ...c,
      article_title: c.articles?.title || null
    }))
  } catch (err) {
    errorMsg.value = '查询失败：' + err.message
    console.error('获取评论失败:', err)
  } finally {
    allLoading.value = false
  }
}

function refreshAll() {
  fetchAllComments()
}

// 分类
const pendingList = computed(() =>
  allComments.value
    .filter(c => !c.is_approved && !c.is_spam)
    .map(c => ({
      ...c,
      cardClass: 'card-pending',
      avatarClass: 'avatar-pending',
      statusClass: 'badge-pending',
      statusText: '待审核'
    }))
)

const approvedList = computed(() =>
  allComments.value
    .filter(c => c.is_approved && !c.is_spam)
    .map(c => ({
      ...c,
      cardClass: 'card-approved',
      avatarClass: 'avatar-approved',
      statusClass: 'badge-approved',
      statusText: '已通过'
    }))
)

const rejectedList = computed(() =>
  allComments.value
    .filter(c => c.is_spam)
    .map(c => ({
      ...c,
      cardClass: 'card-rejected',
      avatarClass: 'avatar-rejected',
      statusClass: 'badge-rejected',
      statusText: '已拒绝'
    }))
)

const currentList = computed(() => {
  if (activeTab.value === 'pending') return pendingList.value
  if (activeTab.value === 'approved') return approvedList.value
  if (activeTab.value === 'rejected') return rejectedList.value
  return []
})

const emptyText = computed(() => {
  if (activeTab.value === 'pending') return '暂无待审核评论'
  if (activeTab.value === 'approved') return '暂无已通过评论'
  return '暂无已拒绝评论'
})

function getInitials(name) {
  if (!name) return '匿'
  return name.charAt(0).toUpperCase()
}

function formatTime(dateString) {
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
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function handleApprove(commentId) {
  try {
    const { error: supabaseError } = await supabase
      .from('comments')
      .update({ is_approved: true, is_spam: false })
      .eq('id', commentId)

    if (supabaseError) throw supabaseError

    // 响应式更新：替换数组项
    const idx = allComments.value.findIndex(c => c.id === commentId)
    if (idx !== -1) {
      const updated = { ...allComments.value[idx], is_approved: true, is_spam: false }
      allComments.value.splice(idx, 1, updated)
    }
  } catch (err) {
    alert('审核失败：' + err.message)
  }
}

async function handleReject(commentId) {
  if (!confirm('确定要拒绝这条评论吗？')) return
  try {
    const { error: supabaseError } = await supabase
      .from('comments')
      .update({ is_spam: true, is_approved: false })
      .eq('id', commentId)

    if (supabaseError) throw supabaseError

    // 响应式更新：替换数组项
    const idx = allComments.value.findIndex(c => c.id === commentId)
    if (idx !== -1) {
      const updated = { ...allComments.value[idx], is_spam: true, is_approved: false }
      allComments.value.splice(idx, 1, updated)
    }
  } catch (err) {
    alert('操作失败：' + err.message)
  }
}
</script>

<style scoped>
.admin-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* 验证区域 */
.auth-section {
  display: flex;
  justify-content: center;
  padding-top: 4rem;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 3rem 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.auth-title { font-size: 1.8rem; font-weight: 700; color: #2c3e50; margin: 0 0 0.5rem; }
.auth-desc { color: #868e96; margin-bottom: 1.5rem; }
.auth-form { display: flex; flex-direction: column; gap: 1rem; }

.auth-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.auth-input:focus { border-color: #4dabf7; box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.1); }

.auth-btn {
  padding: 0.75rem;
  background: #339af0;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}
.auth-btn:hover { background: #228be6; }
.auth-error { color: #fa5252; font-size: 0.9rem; margin-top: 0.5rem; }

/* 头部 */
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.admin-title { font-size: 1.8rem; font-weight: 700; color: #2c3e50; margin: 0; }
.admin-actions { display: flex; gap: 0.75rem; }

.refresh-btn, .back-btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid #e9ecef;
  background: white;
  color: #495057;
}
.refresh-btn:hover:not(:disabled), .back-btn:hover { border-color: #339af0; color: #339af0; }
.refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* 错误提示 */
.error-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #fff5f5;
  border: 1px solid #ffc9c9;
  border-radius: 8px;
  color: #c92a2a;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
.error-close { background: none; border: none; color: #c92a2a; font-size: 1.2rem; cursor: pointer; }

/* 统计 */
.stats-bar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.stat-item { display: flex; align-items: center; gap: 0.5rem; }
.stat-number { font-size: 1.5rem; font-weight: 700; }
.stat-label { font-size: 0.85rem; color: #868e96; }
.pending-stat .stat-number { color: #fab005; }
.approved-stat .stat-number { color: #40c057; }
.rejected-stat .stat-number { color: #fa5252; }
.total-stat .stat-number { color: #495057; }

/* Tab */
.tab-bar { display: flex; gap: 0; margin-bottom: 1.5rem; border-radius: 8px; overflow: hidden; border: 2px solid #e9ecef; }
.tab-btn {
  flex: 1;
  padding: 0.6rem 1rem;
  border: none;
  background: white;
  font-size: 0.9rem;
  font-weight: 600;
  color: #868e96;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn:not(:last-child) { border-right: 1px solid #e9ecef; }
.tab-btn.active { background: #339af0; color: white; }
.tab-btn:hover:not(.active) { background: #f8f9fa; color: #495057; }

/* 加载 & 空状态 */
.loading-state { text-align: center; padding: 3rem; color: #868e96; }
.empty-state { text-align: center; padding: 4rem 2rem; background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06); }
.empty-state svg { color: #40c057; margin-bottom: 1rem; }
.empty-state h3 { font-size: 1.3rem; color: #495057; margin: 0; }

/* 评论卡片 */
.comment-list { display: flex; flex-direction: column; gap: 1rem; }

.comment-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border-left: 4px solid #fab005;
}
.card-pending { border-left-color: #fab005; }
.card-approved { border-left-color: #40c057; }
.card-rejected { border-left-color: #fa5252; }

.comment-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
.comment-author-info { display: flex; align-items: center; gap: 0.75rem; }
.comment-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.35rem; }

.author-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: 700; font-size: 1rem; flex-shrink: 0;
}
.avatar-pending { background: linear-gradient(135deg, #fab005, #fd7e14); }
.avatar-approved { background: linear-gradient(135deg, #40c057, #2f9e44); }
.avatar-rejected { background: linear-gradient(135deg, #fa5252, #e03131); }

.author-name { font-weight: 600; color: #495057; font-size: 0.95rem; }
.author-email { font-size: 0.8rem; color: #adb5bd; }

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.6rem;
  border-radius: 12px;
}
.badge-pending { background: #fff9db; color: #e67700; }
.badge-approved { background: #ebfbee; color: #2f9e44; }
.badge-rejected { background: #fff5f5; color: #c92a2a; }

.comment-time { font-size: 0.8rem; color: #868e96; white-space: nowrap; }

.comment-article {
  display: inline-flex; align-items: center; gap: 0.35rem;
  font-size: 0.8rem; color: #868e96;
  background: #f8f9fa; padding: 0.25rem 0.75rem;
  border-radius: 12px; margin-bottom: 0.75rem;
}

.comment-text {
  font-size: 1rem; line-height: 1.6; color: #2c3e50;
  margin: 0 0 1.25rem; word-break: break-word; white-space: pre-wrap;
}

.comment-actions { display: flex; gap: 0.75rem; }

.btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 1.25rem; border-radius: 8px;
  font-size: 0.9rem; font-weight: 600;
  cursor: pointer; transition: all 0.3s; border: none;
}
.btn-approve { background: #40c057; color: white; }
.btn-approve:hover { background: #2f9e44; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(64, 192, 87, 0.3); }
.btn-reject { background: #f1f3f5; color: #fa5252; }
.btn-reject:hover { background: #fa5252; color: white; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(250, 82, 82, 0.3); }

/* 响应式 */
@media (max-width: 768px) {
  .admin-page { padding: 1.5rem 1rem; }
  .admin-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .stats-bar { gap: 1rem; }
  .comment-header { flex-direction: column; gap: 0.5rem; }
  .comment-right { flex-direction: row; align-items: center; }
}
</style>
