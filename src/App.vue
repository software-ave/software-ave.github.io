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
            <router-link to="/create" class="write-link">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              写文章
            </router-link>
            <router-link to="/admin" class="admin-link">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
              审核
            </router-link>
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

.write-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--primary-color);
  color: white !important;
  padding: 0.4rem 1rem !important;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.write-link:hover {
  background: #228be6 !important;
  color: white !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(51, 154, 240, 0.3);
}

.write-link.router-link-active::after {
  display: none;
}

.admin-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #868e96;
  color: white !important;
  padding: 0.4rem 1rem !important;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.admin-link:hover {
  background: #495057 !important;
  color: white !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.admin-link.router-link-active::after {
  display: none;
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