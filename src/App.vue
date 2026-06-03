<!-- src/App.vue -->
<template>
  <div id="app">
    <header class="header">
      <div class="container">
        <nav class="nav">
          <router-link to="/" class="logo">
            📝 前端博客
          </router-link>
          <div class="nav-links">
            <router-link to="/">首页</router-link>
            <router-link to="/about">关于</router-link>
          </div>
        </nav>
      </div>
    </header>

    <main class="main">
      <router-view />
    </main>

    <footer class="footer">
      <div class="container">
        <p>© 2024 前端博客 - 基于 Vue 3 + Supabase 构建</p>
        <p>支持匿名评论，所有评论经审核后显示</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { RouterView, RouterLink } from 'vue-router'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #339af0;
  --secondary-color: #51cf66;
  --text-color: #2c3e50;
  --text-light: #868e96;
  --bg-color: #ffffff;
  --bg-secondary: #f8f9fa;
  --border-color: #e9ecef;
  --shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  --radius: 12px;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background: var(--bg-secondary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.header {
  background: var(--bg-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  padding: 0.5rem 0;
  position: relative;
}

.nav-links a:hover {
  color: var(--primary-color);
}

.nav-links a.router-link-active {
  color: var(--primary-color);
}

.nav-links a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary-color);
  border-radius: 1px;
}

.main {
  min-height: calc(100vh - 140px);
  padding: 2rem 0;
}

.footer {
  background: var(--bg-color);
  padding: 2rem 0;
  text-align: center;
  border-top: 1px solid var(--border-color);
  color: var(--text-light);
  font-size: 0.9rem;
}

.footer p {
  margin: 0.5rem 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .nav {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    width: 100%;
    justify-content: center;
  }
  
  .main {
    padding: 1.5rem 0;
  }
}
</style>