// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import ArticlePage from '@/pages/ArticlePage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/article/:id',
    name: 'article',
    component: ArticlePage,
    props: true
  },
  {
    path: '/create',
    name: 'create',
    component: () => import('@/pages/ArticleCreatePage.vue')
  },
  {
    path: '/edit/:id',
    name: 'edit',
    component: () => import('@/pages/ArticleCreatePage.vue'),
    props: true
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/pages/AdminPage.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/pages/AboutPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router