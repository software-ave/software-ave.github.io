// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createSupabase } from './plugins/supabase'
import App from './App.vue'
import router from './router'

// 引入全局样式
import './assets/style.css'

// 创建应用
const app = createApp(App)

// 创建 Pinia
const pinia = createPinia()
app.use(pinia)

// 创建 Supabase
const supabase = createSupabase()
app.config.globalProperties.$supabase = supabase

// 使用路由
app.use(router)

// 注册全局指令
app.directive('click-outside', {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
})

// 注册全局组件
const globalComponents = import.meta.glob('./components/global/*.vue', { eager: true })
Object.entries(globalComponents).forEach(([path, module]) => {
  const componentName = path
    .split('/')
    .pop()
    .replace(/\.\w+$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
  app.component(componentName, module.default)
})

// 挂载应用
app.mount('#app')

// 在开发环境中添加一些调试工具
if (import.meta.env.DEV) {
  // 暴露全局变量用于调试
  window.__VUE_APP__ = app
  window.__PINIA__ = pinia
  window.__SUPABASE__ = supabase
  window.__ROUTER__ = router

  console.log('🚀 Vue 应用已启动')
  console.log('📱 开发模式:', import.meta.env.MODE)
  console.log('🔗 后端地址:', import.meta.env.VITE_SUPABASE_URL)
  console.log('🔐 匿名密钥:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '已配置' : '未配置')
}

// 错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue 错误:', err)
  console.error('组件:', vm?.$options.name || '未知组件')
  console.error('位置:', info)
  
  // 可以将错误发送到错误监控服务
  if (import.meta.env.PROD) {
    // 生产环境错误处理
    // sendErrorToMonitoring(err)
  }
}

// 全局属性
app.config.globalProperties.$formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

app.config.globalProperties.$truncate = (text, length = 100) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// 性能监控
if (import.meta.env.PROD && 'performance' in window) {
  const perfObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime)
        // 可以发送到分析服务
        // sendToAnalytics('LCP', entry.startTime)
      }
    }
  })
  perfObserver.observe({ entryTypes: ['largest-contentful-paint'] })
}