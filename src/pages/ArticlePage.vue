<!-- src/pages/AdminPage.vue -->
<template>
  <div class="admin-page">
    <h1>评论审核</h1>
    <div v-if="pendingComments.length === 0" class="empty">
      暂无待审核评论
    </div>
    <div v-else class="comments-list">
      <div v-for="comment in pendingComments" :key="comment.id" class="comment-card">
        <div class="comment-info">
          <strong>{{ comment.author_name }}</strong>
          <small>{{ new Date(comment.created_at).toLocaleString() }}</small>
        </div>
        <p class="comment-content">{{ comment.content }}</p>
        <div class="actions">
          <button @click="approveComment(comment.id)" class="btn-approve">通过</button>
          <button @click="rejectComment(comment.id)" class="btn-reject">拒绝</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/api/supabase'

const pendingComments = ref([])
const password = 'admin123' // 简单密码，实际应使用更安全的方式

async function loadPendingComments() {
  const { data } = await supabase
    .from('comments')
    .select('*')
    .eq('is_approved', false)
    .order('created_at', { ascending: false })
  pendingComments.value = data || []
}

async function approveComment(commentId) {
  await supabase
    .from('comments')
    .update({ is_approved: true })
    .eq('id', commentId)
  loadPendingComments()
}

async function rejectComment(commentId) {
  await supabase
    .from('comments')
    .update({ is_spam: true })
    .eq('id', commentId)
  loadPendingComments()
}

onMounted(() => {
  // 简单密码验证
  const input = prompt('请输入管理员密码:')
  if (input === password) {
    loadPendingComments()
  } else {
    alert('密码错误')
    window.history.back()
  }
})
</script>