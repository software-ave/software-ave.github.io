<!-- src/components/CommentList.vue -->
<template>
  <div class="comment-list">
    <div class="comment-header">
      <h3>评论（{{ comments.length }}）</h3>
      <div class="sort-controls">
        <select v-model="sortBy" @change="fetchComments">
          <option value="created_at">最新</option>
          <option value="like_count">热门</option>
        </select>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载评论中...</p>
    </div>
    
    <div v-else-if="comments.length === 0" class="empty-state">
      <p>还没有评论，快来抢沙发吧！</p>
    </div>
    
    <div v-else class="comments-container">
      <div
        v-for="comment in sortedComments"
        :key="comment.id"
        class="comment-item"
      >
        <div class="comment-avatar">
          <img
            :src="getAvatarUrl(comment.author_email)"
            :alt="comment.author_name"
            class="avatar"
            @error="handleAvatarError"
          />
        </div>
        
        <div class="comment-content">
          <div class="comment-header">
            <span class="author-name">{{ comment.author_name }}</span>
            <span class="comment-time">
              {{ formatTime(comment.created_at) }}
            </span>
          </div>
          
          <div class="comment-text">
            {{ comment.content }}
          </div>
          
          <div class="comment-actions">
            <button
              @click="toggleLike(comment.id)"
              :class="{ liked: comment.liked_by_user }"
              class="like-btn"
            >
              <span>👍 {{ comment.like_count || 0 }}</span>
            </button>
            <button
              @click="reportComment(comment.id)"
              class="report-btn"
            >
              举报
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 加载更多 -->
    <div v-if="hasMore && !loading" class="load-more">
      <button @click="loadMore" class="load-more-btn">
        加载更多评论
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '@/api/supabase'
import md5 from 'crypto-js/md5'

const props = defineProps({
  articleId: {
    type: String,
    required: true
  }
})

// 状态
const comments = ref([])
const loading = ref(true)
const sortBy = ref('created_at')
const page = ref(1)
const pageSize = 10
const hasMore = ref(false)

// 计算属性
const sortedComments = computed(() => {
  return [...comments.value].sort((a, b) => {
    if (sortBy.value === 'like_count') {
      return (b.like_count || 0) - (a.like_count || 0)
    }
    return new Date(b.created_at) - new Date(a.created_at)
  })
})

// 获取 Gravatar 头像
function getAvatarUrl(email) {
  if (!email) {
    return `https://ui-avatars.com/api/?name=匿名&background=random`
  }
  const hash = md5(email.trim().toLowerCase()).toString()
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=60`
}

// 处理头像加载失败
function handleAvatarError(event) {
  event.target.src = `https://ui-avatars.com/api/?name=${event.target.alt}&background=random`
}

// 格式化时间
function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  const minute = 60 * 1000
  const hour = minute * 60
  const day = hour * 24
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < day * 7) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }
}

// 获取评论
async function fetchComments() {
  try {
    loading.value = true
    
    const from = (page.value - 1) * pageSize
    const to = from + pageSize - 1
    
    let query = supabase
      .from('comments')
      .select('*', { count: 'exact' })
      .eq('article_id', props.articleId)
      .eq('is_approved', true)
      .order(sortBy.value, { ascending: false })
      .range(from, to)
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    if (page.value === 1) {
      comments.value = data || []
    } else {
      comments.value = [...comments.value, ...(data || [])]
    }
    
    hasMore.value = count > page.value * pageSize
    
  } catch (error) {
    console.error('获取评论失败:', error)
  } finally {
    loading.value = false
  }
}

// 点赞/取消点赞
async function toggleLike(commentId) {
  try {
    const comment = comments.value.find(c => c.id === commentId)
    if (!comment) return
    
    // 检查是否已点赞
    const likedKey = `liked_${commentId}`
    const hasLiked = localStorage.getItem(likedKey)
    
    if (hasLiked) {
      // 取消点赞
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
      
      if (!error) {
        comment.like_count = Math.max(0, (comment.like_count || 1) - 1)
        comment.liked_by_user = false
        localStorage.removeItem(likedKey)
      }
    } else {
      // 点赞
      const { error } = await supabase
        .from('comment_likes')
        .insert([{
          comment_id: commentId,
          user_ip: await getClientIP()
        }])
      
      if (!error) {
        comment.like_count = (comment.like_count || 0) + 1
        comment.liked_by_user = true
        localStorage.setItem(likedKey, 'true')
      }
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
  }
}

// 举报评论
async function reportComment(commentId) {
  if (!confirm('确定要举报这条评论吗？')) return
  
  try {
    const { error } = await supabase
      .from('comment_reports')
      .insert([{
        comment_id: commentId,
        reporter_ip: await getClientIP(),
        reported_at: new Date().toISOString()
      }])
    
    if (error) throw error
    
    alert('举报已提交，我们会尽快处理')
  } catch (error) {
    console.error('举报失败:', error)
    alert('举报失败，请稍后再试')
  }
}

// 获取客户端IP
async function getClientIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch {
    return null
  }
}

// 加载更多
function loadMore() {
  page.value++
  fetchComments()
}

// 实时订阅新评论
function subscribeToNewComments() {
  const channel = supabase
    .channel('comments')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `article_id=eq.${props.articleId}`
      },
      (payload) => {
        if (payload.new.is_approved) {
          comments.value.unshift(payload.new)
        }
      }
    )
    .subscribe()
  
  return () => supabase.removeChannel(channel)
}

// 初始化
onMounted(() => {
  fetchComments()
  const unsubscribe = subscribeToNewComments()
  
  return () => unsubscribe()
})

// 监听文章ID变化
watch(() => props.articleId, () => {
  page.value = 1
  fetchComments()
})
</script>

<style scoped>
.comment-list {
  margin: 3rem 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f3f5;
}

.comment-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.sort-controls select {
  padding: 0.5rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  background: white;
  color: #495057;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
}

.sort-controls select:focus {
  border-color: #4dabf7;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #868e96;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid #f1f3f5;
  border-top-color: #339af0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #adb5bd;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
}

.comments-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: transform 0.2s, box-shadow 0.2s;
}

.comment-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.comment-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  background: #f1f3f5;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-content .comment-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  padding: 0;
  border: none;
}

.author-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.comment-time {
  color: #868e96;
  font-size: 0.85rem;
}

.comment-text {
  line-height: 1.6;
  color: #495057;
  margin-bottom: 1rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.like-btn,
.report-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.like-btn {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #e9ecef;
}

.like-btn:hover {
  background: #f1f3f5;
  border-color: #dee2e6;
}

.like-btn.liked {
  background: #fff5f5;
  color: #fa5252;
  border-color: #ffa8a8;
}

.report-btn {
  background: transparent;
  color: #868e96;
}

.report-btn:hover {
  color: #fa5252;
  background: #fff5f5;
}

.load-more {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.load-more-btn {
  padding: 0.75rem 2rem;
  background: white;
  color: #339af0;
  border: 2px solid #339af0;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background: #339af0;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(51, 154, 240, 0.2);
}

@media (max-width: 768px) {
  .comment-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .comment-avatar {
    margin-bottom: 0.5rem;
  }
  
  .comment-content .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>