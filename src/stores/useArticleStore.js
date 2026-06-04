// src/stores/useArticleStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/api/supabase'

export const useArticleStore = defineStore('articles', () => {
  const articles = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentArticle = ref(null)
  const filterTag = ref('')

  // 计算属性
  const filteredArticles = computed(() => {
    if (!filterTag.value) return articles.value
    
    return articles.value.filter(article => {
      if (!article.tags) return false
      const tags = Array.isArray(article.tags) 
        ? article.tags 
        : JSON.parse(article.tags || '[]')
      return tags.includes(filterTag.value)
    })
  })

  const popularArticles = computed(() => 
    [...articles.value]
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 5)
  )

  const totalArticles = computed(() => articles.value.length)
  const totalViews = computed(() => 
    articles.value.reduce((sum, article) => sum + (article.view_count || 0), 0)
  )

  // 获取文章列表
  async function fetchArticles() {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: supabaseError } = await supabase
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      
      if (supabaseError) throw supabaseError
      
      articles.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('获取文章失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 获取单篇文章
  async function fetchArticle(id) {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: supabaseError } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single()
      
      if (supabaseError) throw supabaseError
      
      currentArticle.value = data
      
      // 增加阅读计数
      if (data) {
        await incrementViewCount(id)
      }
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('获取文章失败:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // 增加阅读计数
  async function incrementViewCount(articleId) {
    try {
      const article = articles.value.find(a => a.id === articleId) || currentArticle.value
      if (!article) return
      
      const newCount = (article.view_count || 0) + 1
      
      const { error: supabaseError } = await supabase
        .from('articles')
        .update({ view_count: newCount })
        .eq('id', articleId)
      
      if (supabaseError) throw supabaseError
      
      // 更新本地数据
      if (article === currentArticle.value) {
        currentArticle.value.view_count = newCount
      } else {
        const index = articles.value.findIndex(a => a.id === articleId)
        if (index !== -1) {
          articles.value[index].view_count = newCount
        }
      }
    } catch (err) {
      console.error('更新阅读计数失败:', err)
    }
  }

  // 设置筛选标签
  function setFilterTag(tag) {
    filterTag.value = tag
  }

  // 清除筛选
  function clearFilter() {
    filterTag.value = ''
  }

  // 创建文章（需要密码验证）
  async function createArticle(articleData) {
    try {
      loading.value = true
      error.value = null

      const { error: supabaseError } = await supabase
        .from('articles')
        .insert([articleData])

      if (supabaseError) throw supabaseError

      // 刷新文章列表
      await fetchArticles()

      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error('创建文章失败:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // 更新文章
  async function updateArticle(id, articleData) {
    try {
      loading.value = true
      error.value = null

      const { error: supabaseError } = await supabase
        .from('articles')
        .update(articleData)
        .eq('id', id)

      if (supabaseError) throw supabaseError

      // 刷新文章列表
      await fetchArticles()

      // 如果当前文章就是被更新的，刷新 currentArticle
      if (currentArticle.value?.id === id) {
        currentArticle.value = { ...currentArticle.value, ...articleData }
      }

      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error('更新文章失败:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // 删除文章（同时删除该文章下的所有评论）
  async function deleteArticle(id) {
    try {
      loading.value = true
      error.value = null

      // 先删除该文章下的所有评论
      const { error: commentError } = await supabase
        .from('comments')
        .delete()
        .eq('article_id', id)

      if (commentError) {
        console.error('删除评论失败:', commentError)
        // 继续尝试删除文章
      }

      // 再删除文章
      const { error: supabaseError } = await supabase
        .from('articles')
        .delete()
        .eq('id', id)

      if (supabaseError) throw supabaseError

      // 刷新文章列表
      await fetchArticles()

      // 清除 currentArticle
      if (currentArticle.value?.id === id) {
        currentArticle.value = null
      }

      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error('删除文章失败:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // 获取文章详情用于编辑（不增加阅读计数）
  async function fetchArticleForEdit(id) {
    try {
      loading.value = true
      error.value = null

      const { data, error: supabaseError } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single()

      if (supabaseError) throw supabaseError

      return data
    } catch (err) {
      error.value = err.message
      console.error('获取文章失败:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    articles,
    loading,
    error,
    currentArticle,
    filterTag,
    
    // 计算属性
    filteredArticles,
    popularArticles,
    totalArticles,
    totalViews,
    
    // 方法
    fetchArticles,
    fetchArticle,
    fetchArticleForEdit,
    incrementViewCount,
    setFilterTag,
    clearFilter,
    createArticle,
    updateArticle,
    deleteArticle
  }
})