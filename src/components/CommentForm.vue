<!-- src/components/CommentForm.vue -->
<template>
  <div class="comment-form">
    <h3>发表评论</h3>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="authorName">昵称（可选）</label>
        <input
          v-model="form.authorName"
          type="text"
          id="authorName"
          placeholder="显示名称，默认显示为'匿名用户'"
          maxlength="50"
        />
      </div>
      
      <div class="form-group">
        <label for="authorEmail">邮箱（可选，仅用于头像显示）</label>
        <input
          v-model="form.authorEmail"
          type="email"
          id="authorEmail"
          placeholder="用于Gravatar头像"
        />
      </div>
      
      <div class="form-group">
        <label for="content">评论内容 *</label>
        <textarea
          v-model="form.content"
          id="content"
          :class="{ error: errors.content }"
          placeholder="请输入您的评论..."
          rows="5"
          maxlength="1000"
          required
        ></textarea>
        <div class="counter">{{ form.content.length }}/1000</div>
        <div v-if="errors.content" class="error-message">{{ errors.content }}</div>
      </div>
      
      <!-- 简单验证码 -->
      <div v-if="showCaptcha" class="captcha-group">
        <label>验证码：{{ captcha.question }}</label>
        <input
          v-model="captcha.answer"
          type="text"
          placeholder="请输入计算结果"
        />
      </div>
      
      <div class="form-footer">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="submit-btn"
        >
          <span v-if="!isSubmitting">发表评论</span>
          <span v-else>提交中...</span>
        </button>
        
        <div class="hint">
          <p>• 所有评论将经过审核后显示</p>
          <p>• 请勿发表不当言论</p>
        </div>
      </div>
    </form>
    
    <!-- 提交成功提示 -->
    <div v-if="submitSuccess" class="success-message">
      <p>✅ 评论提交成功！管理员审核后即可显示。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { supabase } from '@/api/supabase'
import { validateComment, generateCaptcha } from '@/utils/validation'

const props = defineProps({
  articleId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['comment-added'])

// 表单数据
const form = reactive({
  authorName: '',
  authorEmail: '',
  content: ''
})

// 状态
const isSubmitting = ref(false)
const submitSuccess = ref(false)
const errors = reactive({})
const showCaptcha = ref(false)
const captcha = reactive({
  question: '',
  answer: '',
  solution: 0
})

// 获取客户端信息
const clientInfo = reactive({
  ip: '',
  userAgent: navigator.userAgent
})

// 获取IP地址
async function getClientIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    clientInfo.ip = data.ip
  } catch (error) {
    console.warn('无法获取IP地址:', error)
  }
}

// 表单验证
function validateForm() {
  Object.keys(errors).forEach(key => delete errors[key])
  
  const validation = validateComment({
    content: form.content,
    captcha: showCaptcha.value ? captcha.answer : null,
    captchaSolution: captcha.solution
  })
  
  if (!validation.valid) {
    Object.assign(errors, validation.errors)
    return false
  }
  
  return true
}

// 生成验证码（防止机器人）
function initCaptcha() {
  const { question, solution } = generateCaptcha()
  captcha.question = question
  captcha.solution = solution
  showCaptcha.value = true
}

// 提交评论
async function handleSubmit() {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  try {
    const commentData = {
      article_id: props.articleId,
      author_name: form.authorName.trim() || '匿名用户',
      author_email: form.authorEmail.trim() || null,
      content: form.content.trim(),
      user_ip: clientInfo.ip,
      user_agent: clientInfo.userAgent,
      created_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('comments')
      .insert([commentData])
      .select()
    
    if (error) throw error
    
    // 提交成功
    submitSuccess.value = true
    Object.keys(form).forEach(key => form[key] = '')
    
    // 通知父组件
    emit('comment-added', data[0])
    
    // 5秒后重置表单状态
    setTimeout(() => {
      submitSuccess.value = false
      if (showCaptcha.value) initCaptcha()
    }, 5000)
    
  } catch (error) {
    console.error('提交评论失败:', error)
    alert(`提交失败: ${error.message}`)
  } finally {
    isSubmitting.value = false
  }
}

// 初始化
onMounted(() => {
  getClientIP()
  // 如果有频繁提交的历史，显示验证码
  const lastSubmit = localStorage.getItem('lastCommentSubmit')
  if (lastSubmit && Date.now() - parseInt(lastSubmit) < 30000) {
    initCaptcha()
  }
})
</script>

<style scoped>
.comment-form {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
  border: 1px solid #e9ecef;
}

.comment-form h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4dabf7;
  box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.1);
}

.form-group textarea.error {
  border-color: #fa5252;
}

.error-message {
  color: #fa5252;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.counter {
  text-align: right;
  font-size: 0.85rem;
  color: #868e96;
  margin-top: 0.25rem;
}

.captcha-group {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  margin-bottom: 1.5rem;
}

.captcha-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #495057;
}

.captcha-group input {
  width: 200px;
  padding: 0.5rem 0.75rem;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-size: 1rem;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.submit-btn {
  background: #339af0;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 150px;
}

.submit-btn:hover:not(:disabled) {
  background: #228be6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(51, 154, 240, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hint {
  flex: 1;
  min-width: 250px;
}

.hint p {
  margin: 0.25rem 0;
  font-size: 0.85rem;
  color: #868e96;
}

.success-message {
  background: #40c057;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1.5rem;
  text-align: center;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .comment-form {
    padding: 1.5rem;
  }
  
  .form-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .submit-btn {
    width: 100%;
  }
}
</style>