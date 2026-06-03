<!-- src/pages/NotFound.vue -->
<template>
  <div class="not-found">
    <div class="error-container">
      <div class="error-code">404</div>
      <h1 class="error-title">页面未找到</h1>
      <p class="error-message">抱歉，您访问的页面不存在或已被移除。</p>
      <div class="error-actions">
        <router-link to="/" class="btn">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          返回首页
        </router-link>
        <button @click="goBack" class="btn btn-outline">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          返回上一页
        </button>
      </div>
      <div class="error-suggestions">
        <h3>您可能还想浏览：</h3>
        <ul>
          <li><router-link to="/">查看最新文章</router-link></li>
          <li><router-link to="/about">关于本站</router-link></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.not-found {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.error-container {
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  line-height: 1;
  color: #f1f3f5;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #4dabf7, #339af0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.05em;
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.error-message {
  color: #868e96;
  font-size: 1.125rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.error-suggestions {
  text-align: left;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.error-suggestions h3 {
  font-size: 1.125rem;
  margin-bottom: 1rem;
  color: #495057;
}

.error-suggestions ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.error-suggestions li {
  margin-bottom: 0.5rem;
}

.error-suggestions li:last-child {
  margin-bottom: 0;
}

.error-suggestions a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #339af0;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.error-suggestions a:hover {
  background: #e7f5ff;
  color: #228be6;
  text-decoration: none;
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }
  
  .error-title {
    font-size: 1.75rem;
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .error-actions .btn {
    width: 100%;
  }
}
</style>