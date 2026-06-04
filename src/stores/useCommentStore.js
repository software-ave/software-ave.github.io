// src/stores/useCommentStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/api/supabase'

export const useCommentStore = defineStore('comments', () => {
  // 状态
  const comments = ref([])
  const loading = ref(false)
  const error = ref(null)
  const page = ref(1)
  const pageSize = 20
  const hasMore = ref(true)
  const currentArticleId = ref('')

  // 计算属性
  const totalComments = computed(() => comments.value.length)
  const approvedComments = computed(() => 
    comments.value.filter(c => c.is_approved && !c.is_spam)
  )

  // 获取文章评论
  async function fetchComments(articleId, reset = true) {
    if (reset) {
      currentArticleId.value = articleId
      page.value = 1
      comments.value = []
    }
    
    loading.value = true
    error.value = null
    
    try {
      const from = (page.value - 1) * pageSize
      const to = from + pageSize - 1
      
      const { data, error: supabaseError, count } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('article_id', articleId)
        .order('created_at', { ascending: false })
        .range(from, to)
      
      if (supabaseError) throw supabaseError
      
      if (reset) {
        comments.value = data || []
      } else {
        comments.value = [...comments.value, ...(data || [])]
      }
      
      hasMore.value = count > page.value * pageSize
      
    } catch (err) {
      error.value = err.message
      console.error('获取评论失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 添加评论
  async function addComment(commentData) {
    try {
      // 不用 .select()，因为新评论 is_approved=false，SELECT 策略不允许回读
      const { error: supabaseError } = await supabase
        .from('comments')
        .insert([commentData])
      
      if (supabaseError) throw supabaseError

      // 不加入本地列表（未审核），等审核通过后通过实时订阅显示
      return { success: true }
    } catch (err) {
      console.error('添加评论失败:', err)
      return { success: false, error: err.message }
    }
  }

  // 加载更多
  async function loadMore() {
    if (!hasMore.value || loading.value) return
    
    page.value++
    await fetchComments(currentArticleId.value, false)
  }

  // 订阅实时更新
  function subscribeToNewComments(callback) {
    const channel = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `article_id=eq.${currentArticleId.value}`
        },
        (payload) => {
          comments.value.unshift(payload.new)
          if (callback) callback(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `article_id=eq.${currentArticleId.value}`
        },
        (payload) => {
          const index = comments.value.findIndex(c => c.id === payload.new.id)
          if (index !== -1) {
            comments.value[index] = payload.new
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  // ========== 管理员审核相关 ==========

  const pendingComments = ref([])
  const pendingLoading = ref(false)

  // 获取待审核评论
  async function fetchPendingComments() {
    pendingLoading.value = true
    try {
      const { data, error: supabaseError } = await supabase
        .from('comments')
        .select('*')
        .eq('is_approved', false)
        .eq('is_spam', false)
        .order('created_at', { ascending: false })

      if (supabaseError) throw supabaseError
      pendingComments.value = data || []
    } catch (err) {
      console.error('获取待审核评论失败:', err)
    } finally {
      pendingLoading.value = false
    }
  }

  // 通过评论
  async function approveComment(commentId) {
    try {
      const { error: supabaseError } = await supabase
        .from('comments')
        .update({ is_approved: true })
        .eq('id', commentId)

      if (supabaseError) throw supabaseError

      pendingComments.value = pendingComments.value.filter(c => c.id !== commentId)
      return { success: true }
    } catch (err) {
      console.error('审核通过失败:', err)
      return { success: false, error: err.message }
    }
  }

  // 拒绝评论（标记为垃圾）
  async function rejectComment(commentId) {
    try {
      const { error: supabaseError } = await supabase
        .from('comments')
        .update({ is_spam: true })
        .eq('id', commentId)

      if (supabaseError) throw supabaseError

      pendingComments.value = pendingComments.value.filter(c => c.id !== commentId)
      return { success: true }
    } catch (err) {
      console.error('拒绝评论失败:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    comments,
    approvedComments,
    loading,
    error,
    totalComments,
    hasMore,
    pendingComments,
    pendingLoading,

    fetchComments,
    addComment,
    loadMore,
    subscribeToNewComments,
    fetchPendingComments,
    approveComment,
    rejectComment
  }
})