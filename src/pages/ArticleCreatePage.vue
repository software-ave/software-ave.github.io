<!-- src/pages/ArticleCreatePage.vue -->
<template>
  <div class="create-page">
    <!-- 未验证密码 -->
    <div v-if="!authenticated" class="auth-section">
      <div class="auth-card">
        <h2 class="auth-title">{{ isEditMode ? '编辑文章' : '发布文章' }}</h2>
        <p class="auth-desc">请输入管理员密码以继续</p>
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

    <!-- 发布表单 -->
    <div v-else class="create-form">
      <div class="form-header">
        <h1 class="form-title">{{ isEditMode ? '编辑文章' : '发布新文章' }}</h1>
        <div v-if="loadingArticle" class="loading-tip">加载文章中...</div>
        <button @click="$router.push('/')" class="back-btn">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          返回
        </button>
      </div>

      <div class="form-body">
        <!-- 标题 -->
        <div class="form-group">
          <label class="form-label">文章标题 *</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="输入文章标题"
            class="form-input"
            maxlength="100"
          />
        </div>

        <!-- 标签 -->
        <div class="form-group">
          <label class="form-label">标签（逗号分隔）</label>
          <input
            v-model="tagsInput"
            type="text"
            placeholder="例如：前端, Vue, JavaScript"
            class="form-input"
          />
        </div>

        <!-- 摘要 -->
        <div class="form-group">
          <label class="form-label">摘要</label>
          <textarea
            v-model="form.excerpt"
            placeholder="简短描述文章内容（可选，留空将自动截取）"
            class="form-textarea"
            rows="2"
            maxlength="300"
          ></textarea>
        </div>

        <!-- 内容 -->
        <div class="form-group">
          <label class="form-label">文章内容（支持 Markdown）*</label>
          <div class="editor-wrapper">
            <div class="editor-tabs">
              <button
                :class="['editor-tab', { active: editorMode === 'write' }]"
                @click="editorMode = 'write'"
              >编辑</button>
              <button
                :class="['editor-tab', { active: editorMode === 'preview' }]"
                @click="editorMode = 'preview'"
              >预览</button>
            </div>
            <textarea
              v-if="editorMode === 'write'"
              v-model="form.content"
              placeholder="在此输入 Markdown 内容..."
              class="form-textarea editor-area"
              rows="20"
            ></textarea>
            <div v-else class="preview-area" v-html="previewContent"></div>
          </div>
        </div>

        <!-- 封面URL -->
        <div class="form-group">
          <label class="form-label">封面图片 URL（可选）</label>
          <input
            v-model="form.cover_url"
            type="url"
            placeholder="https://example.com/cover.jpg"
            class="form-input"
          />
        </div>

        <!-- 作者 -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">作者</label>
            <input
              v-model="form.author"
              type="text"
              placeholder="作者名称"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label class="form-label">发布状态</label>
            <select v-model="form.is_published" class="form-input">
              <option :value="true">立即发布</option>
              <option :value="false">保存为草稿</option>
            </select>
          </div>
        </div>

        <!-- 提交 -->
        <div class="form-actions">
          <button @click="$router.push('/')" class="btn btn-cancel">取消</button>
          <button
            @click="submitArticle"
            class="btn btn-submit"
            :disabled="!canSubmit || submitting"
          >
            {{ submitting ? (isEditMode ? '更新中...' : '发布中...') : (isEditMode ? '更新文章' : '发布文章') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useArticleStore } from '@/stores/useArticleStore'
import { marked } from 'marked'

const router = useRouter()
const route = useRoute()
const articleStore = useArticleStore()

const ADMIN_PASSWORD = 'admin123'

const isEditMode = computed(() => !!route.params.id)
const editArticleId = computed(() => route.params.id || null)

const authenticated = ref(false)
const passwordInput = ref('')
const authError = ref(false)
const submitting = ref(false)
const editorMode = ref('write')
const loadingArticle = ref(false)

const form = ref({
  title: '',
  content: '',
  excerpt: '',
  cover_url: '',
  author: '管理员',
  is_published: true
})

const tagsInput = ref('')

const previewContent = computed(() => {
  if (!form.value.content) return '<p class="empty-preview">暂无内容，请在编辑区输入 Markdown</p>'
  return marked.parse(form.value.content)
})

const canSubmit = computed(() =>
  form.value.title.trim() && form.value.content.trim()
)

function verifyPassword() {
  if (passwordInput.value === ADMIN_PASSWORD) {
    authenticated.value = true
    authError.value = false
    // 编辑模式下验证后加载文章数据
    if (isEditMode.value) {
      loadArticleForEdit()
    }
  } else {
    authError.value = true
    passwordInput.value = ''
  }
}

async function loadArticleForEdit() {
  loadingArticle.value = true
  try {
    const data = await articleStore.fetchArticleForEdit(editArticleId.value)
    if (data) {
      form.value = {
        title: data.title || '',
        content: data.content || '',
        excerpt: data.excerpt || '',
        cover_url: data.cover_url || '',
        author: data.author || '管理员',
        is_published: data.is_published !== false
      }
      // 解析标签
      if (data.tags) {
        const tags = Array.isArray(data.tags) ? data.tags : JSON.parse(data.tags || '[]')
        tagsInput.value = Array.isArray(tags) ? tags.join(', ') : ''
      }
    } else {
      alert('文章不存在或已删除')
      router.push('/')
    }
  } catch (err) {
    alert('加载文章失败：' + err.message)
    router.push('/')
  } finally {
    loadingArticle.value = false
  }
}

async function submitArticle() {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true
  try {
    const articleData = {
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      excerpt: form.value.excerpt.trim() || null,
      cover_url: form.value.cover_url.trim() || null,
      author: form.value.author.trim() || '管理员',
      is_published: form.value.is_published
    }

    let result
    if (isEditMode.value) {
      result = await articleStore.updateArticle(editArticleId.value, articleData)
    } else {
      result = await articleStore.createArticle(articleData)
    }

    if (result.success) {
      alert(isEditMode.value ? '文章更新成功！' : '文章发布成功！')
      router.push('/')
    } else {
      alert((isEditMode.value ? '更新失败：' : '发布失败：') + (result.error || '未知错误'))
    }
  } finally {
    submitting.value = false
  }
}

// 编辑模式下自动验证密码后的加载由 verifyPassword 触发
// 如果已经验证过（比如从文章详情页跳转过来时已输入密码），不需要额外操作
</script>

<style scoped>
.create-page {
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

.auth-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem;
}

.auth-desc {
  color: #868e96;
  margin-bottom: 1.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.auth-input:focus {
  border-color: #4dabf7;
  box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.1);
}

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

.auth-btn:hover {
  background: #228be6;
}

.auth-error {
  color: #fa5252;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* 表单头部 */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.form-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.loading-tip {
  color: #868e96;
  font-size: 0.9rem;
}

.back-btn {
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
  transition: color 0.2s;
}

.back-btn:hover {
  color: #228be6;
}

/* 表单内容 */
.form-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.form-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.95rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  background: white;
}

.form-input:focus {
  border-color: #4dabf7;
  box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.1);
}

.form-textarea {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  resize: vertical;
  font-family: inherit;
  background: white;
}

.form-textarea:focus {
  border-color: #4dabf7;
  box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.1);
}

.form-row {
  display: flex;
  gap: 1rem;
}

/* 编辑器 */
.editor-wrapper {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.editor-tabs {
  display: flex;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.editor-tab {
  padding: 0.6rem 1.5rem;
  border: none;
  background: none;
  font-size: 0.9rem;
  font-weight: 600;
  color: #868e96;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.editor-tab.active {
  color: #339af0;
  border-bottom-color: #339af0;
  background: white;
}

.editor-area {
  border: none;
  border-radius: 0;
  min-height: 400px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
}

.editor-area:focus {
  border: none;
  box-shadow: none;
}

.preview-area {
  padding: 1.5rem;
  min-height: 400px;
  background: white;
  line-height: 1.8;
  font-size: 1rem;
}

.preview-area :deep(h1),
.preview-area :deep(h2),
.preview-area :deep(h3) {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #2c3e50;
}

.preview-area :deep(p) {
  margin-bottom: 1rem;
}

.preview-area :deep(code) {
  background: #f1f3f5;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
}

.preview-area :deep(pre) {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1rem 0;
}

.preview-area :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

.preview-area :deep(blockquote) {
  margin: 1rem 0;
  padding: 0.75rem 1.25rem;
  border-left: 4px solid #339af0;
  background: #f8f9fa;
  color: #495057;
}

.preview-area :deep(ul),
.preview-area :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.empty-preview {
  color: #adb5bd;
  text-align: center;
  padding: 3rem 0;
}

/* 提交按钮 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f3f5;
}

.btn {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: white;
  color: #868e96;
  border: 2px solid #e9ecef;
}

.btn-cancel:hover {
  border-color: #dee2e6;
  color: #495057;
}

.btn-submit {
  background: #339af0;
  color: white;
  border: none;
}

.btn-submit:hover:not(:disabled) {
  background: #228be6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(51, 154, 240, 0.3);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式 */
@media (max-width: 768px) {
  .create-page {
    padding: 1.5rem 1rem;
  }

  .form-row {
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
