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
  const articleId = ref('')

  // 计算属性
  const totalComments = computed(() => comments.value.length)
  const approvedComments = computed(() => 
    comments.value.filter(c => c.is_approved && !c.is_spam)
  )

  // 获取文章评论
  async function fetchComments(articleId, reset = true) {
    if (reset) {
      this.articleId = articleId
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
      const { data, error: supabaseError } = await supabase
        .from('comments')
        .insert([commentData])
        .select()
      
      if (supabaseError) throw supabaseError
      
      // 实时添加到列表
      comments.value.unshift(data[0])
      
      return { success: true, data: data[0] }
    } catch (err) {
      console.error('添加评论失败:', err)
      return { success: false, error: err.message }
    }
  }

  // 加载更多
  async function loadMore() {
    if (!hasMore.value || loading.value) return
    
    page.value++
    await fetchComments(articleId.value, false)
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
          filter: `article_id=eq.${articleId.value}`
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
          filter: `article_id=eq.${articleId.value}`
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

  return {
    comments,
    approvedComments,
    loading,
    error,
    totalComments,
    hasMore,
    
    fetchComments,
    addComment,
    loadMore,
    subscribeToNewComments
  }
})