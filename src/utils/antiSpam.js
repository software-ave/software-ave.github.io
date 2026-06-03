// src/utils/antiSpam.js
/**
 * 前端反垃圾评论工具
 * 包含频率限制、行为分析、基本过滤
 */

// ==================== 核心工具 ====================
class AntiSpam {
  constructor() {
    // 频率限制配置
    this.config = {
      SUBMIT_INTERVAL: 30000,          // 30秒内只能提交一次
      MAX_HOURLY: 10,                  // 每小时最多10条
      MAX_DAILY: 30,                   // 每天最多30条
      HISTORY_KEY: 'comment_history',  // 本地存储key
      IP_KEY: 'ip_history',            // IP存储key
      SESSION_KEY: 'session_active'    // 会话标记
    }
    
    // 初始化会话
    this.initSession()
  }
  
  /**
   * 初始化会话
   */
  initSession() {
    if (!sessionStorage.getItem(this.config.SESSION_KEY)) {
      sessionStorage.setItem(this.config.SESSION_KEY, Date.now())
    }
  }
  
  /**
   * 检查是否可以提交
   */
  async canSubmit(content) {
    const now = Date.now()
    const history = this.getHistory()
    
    // 1. 基本内容检查
    const contentCheck = this.checkContent(content)
    if (!contentCheck.valid) {
      return contentCheck
    }
    
    // 2. 频率检查
    const rateCheck = this.checkRate(history, now)
    if (!rateCheck.valid) {
      return rateCheck
    }
    
    // 3. 行为检查
    const behaviorCheck = this.checkBehavior(content, history)
    if (!behaviorCheck.valid) {
      return behaviorCheck
    }
    
    return { valid: true }
  }
  
  /**
   * 内容基本检查
   */
  checkContent(content) {
    // 长度检查
    if (!content || content.trim().length === 0) {
      return { valid: false, reason: '评论内容不能为空', type: 'empty' }
    }
    
    if (content.length < 5) {
      return { valid: false, reason: '评论内容至少5个字', type: 'too_short' }
    }
    
    if (content.length > 1000) {
      return { valid: false, reason: '评论内容不能超过1000字', type: 'too_long' }
    }
    
    // 重复字符检查（防止aaaaaaaa）
    if (/(.)\1{10,}/.test(content)) {
      return { valid: false, reason: '评论内容包含过多重复字符', type: 'repeat' }
    }
    
    // 链接数量检查
    const urlCount = (content.match(/https?:\/\/[^\s]+/g) || []).length
    if (urlCount > 2) {
      return { valid: false, reason: '评论包含过多链接', type: 'too_many_urls' }
    }
    
    return { valid: true }
  }
  
  /**
   * 频率检查
   */
  checkRate(history, now) {
    // 清理过期记录
    const cleanHistory = this.cleanHistory(history, now)
    
    // 检查30秒间隔
    if (cleanHistory.length > 0) {
      const lastSubmit = cleanHistory[cleanHistory.length - 1]
      const timeDiff = now - lastSubmit.time
      
      if (timeDiff < this.config.SUBMIT_INTERVAL) {
        const waitSec = Math.ceil((this.config.SUBMIT_INTERVAL - timeDiff) / 1000)
        return { 
          valid: false, 
          reason: `请等待 ${waitSec} 秒后再提交`, 
          type: 'rate_limit',
          waitTime: waitSec
        }
      }
    }
    
    // 检查小时限制
    const hourAgo = now - 3600000
    const hourCount = cleanHistory.filter(h => h.time > hourAgo).length
    if (hourCount >= this.config.MAX_HOURLY) {
      return { 
        valid: false, 
        reason: `每小时最多提交 ${this.config.MAX_HOURLY} 条评论`, 
        type: 'hour_limit'
      }
    }
    
    // 检查天限制
    const dayAgo = now - 86400000
    const dayCount = cleanHistory.filter(h => h.time > dayAgo).length
    if (dayCount >= this.config.MAX_DAILY) {
      return { 
        valid: false, 
        reason: `每天最多提交 ${this.config.MAX_DAILY} 条评论`, 
        type: 'day_limit'
      }
    }
    
    return { valid: true }
  }
  
  /**
   * 行为检查
   */
  checkBehavior(content, history) {
    const recentHistory = history.slice(-5) // 最近5条
    
    // 检查内容相似度
    for (const record of recentHistory) {
      const similarity = this.calculateSimilarity(content, record.content)
      if (similarity > 0.8) { // 80%相似度
        return { 
          valid: false, 
          reason: '请勿重复提交相似内容', 
          type: 'duplicate'
        }
      }
    }
    
    // 检查是否为垃圾模式（如连续数字、字母等）
    if (/^\d+$/.test(content) || /^[a-zA-Z]+$/.test(content)) {
      return { 
        valid: false, 
        reason: '评论内容格式不符合要求', 
        type: 'pattern'
      }
    }
    
    return { valid: true }
  }
  
  /**
   * 记录提交
   */
  recordSubmit(content) {
    const history = this.getHistory()
    const now = Date.now()
    
    // 获取客户端信息
    const clientInfo = this.getClientInfo()
    
    history.push({
      time: now,
      content: content.substring(0, 200), // 只保存前200字符
      length: content.length,
      ...clientInfo
    })
    
    // 只保留最近50条记录
    if (history.length > 50) {
      history.splice(0, history.length - 50)
    }
    
    localStorage.setItem(this.config.HISTORY_KEY, JSON.stringify(history))
    
    // 记录IP
    this.recordIP(now)
  }
  
  /**
   * 获取客户端信息
   */
  getClientInfo() {
    return {
      userAgent: navigator.userAgent.substring(0, 100),
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      sessionStart: sessionStorage.getItem(this.config.SESSION_KEY)
    }
  }
  
  /**
   * 记录IP提交
   */
  async recordIP(timestamp) {
    try {
      const ip = await this.getClientIP()
      if (!ip) return
      
      const ipHistory = JSON.parse(localStorage.getItem(this.config.IP_KEY) || '{}')
      
      if (!ipHistory[ip]) {
        ipHistory[ip] = []
      }
      
      ipHistory[ip].push(timestamp)
      
      // 只保留最近24小时的记录
      const dayAgo = Date.now() - 86400000
      ipHistory[ip] = ipHistory[ip].filter(t => t > dayAgo)
      
      localStorage.setItem(this.config.IP_KEY, JSON.stringify(ipHistory))
    } catch (error) {
      console.warn('记录IP失败:', error)
    }
  }
  
  /**
   * 获取客户端IP
   */
  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch (error) {
      return null
    }
  }
  
  /**
   * 获取提交历史
   */
  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(this.config.HISTORY_KEY) || '[]')
    } catch (error) {
      return []
    }
  }
  
  /**
   * 清理过期历史
   */
  cleanHistory(history, now = Date.now()) {
    const dayAgo = now - 86400000
    const filtered = history.filter(record => record.time > dayAgo)
    
    if (filtered.length !== history.length) {
      localStorage.setItem(this.config.HISTORY_KEY, JSON.stringify(filtered))
    }
    
    return filtered
  }
  
  /**
   * 计算文本相似度（简易版）
   */
  calculateSimilarity(text1, text2) {
    if (!text1 || !text2) return 0
    
    const set1 = new Set(text1.toLowerCase().split(''))
    const set2 = new Set(text2.toLowerCase().split(''))
    
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return intersection.size / union.size
  }
  
  /**
   * 重置历史记录
   */
  resetHistory() {
    localStorage.removeItem(this.config.HISTORY_KEY)
    localStorage.removeItem(this.config.IP_KEY)
    sessionStorage.removeItem(this.config.SESSION_KEY)
    this.initSession()
  }
  
  /**
   * 获取统计数据
   */
  getStats() {
    const history = this.getHistory()
    const now = Date.now()
    const hourAgo = now - 3600000
    const dayAgo = now - 86400000
    
    return {
      total: history.length,
      lastHour: history.filter(h => h.time > hourAgo).length,
      lastDay: history.filter(h => h.time > dayAgo).length,
      lastSubmit: history.length > 0 ? history[history.length - 1].time : null
    }
  }
}

// ==================== 验证码工具 ====================
class CaptchaGenerator {
  /**
   * 生成数学验证码
   */
  static generateMath() {
    const operators = ['+', '-', '*']
    const operator = operators[Math.floor(Math.random() * operators.length)]
    
    let num1, num2, answer
    
    switch(operator) {
      case '+':
        num1 = Math.floor(Math.random() * 10) + 1
        num2 = Math.floor(Math.random() * 10) + 1
        answer = num1 + num2
        break
        
      case '-':
        num1 = Math.floor(Math.random() * 20) + 10
        num2 = Math.floor(Math.random() * 10) + 1
        answer = num1 - num2
        break
        
      case '*':
        num1 = Math.floor(Math.random() * 5) + 1
        num2 = Math.floor(Math.random() * 5) + 1
        answer = num1 * num2
        break
    }
    
    return {
      question: `${num1} ${operator} ${num2} = ?`,
      answer: answer,
      type: 'math'
    }
  }
  
  /**
   * 生成文本验证码
   */
  static generateText(length = 4) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 去掉了容易混淆的字符
    let code = ''
    
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    return {
      question: code,
      answer: code,
      type: 'text'
    }
  }
  
  /**
   * 生成选择题
   */
  static generateChoice() {
    const questions = [
      {
        question: "中国的首都是？",
        options: ["北京", "上海", "广州", "深圳"],
        answer: 0
      },
      {
        question: "2 + 2 = ?",
        options: ["3", "4", "5", "6"],
        answer: 1
      },
      {
        question: "太阳从哪个方向升起？",
        options: ["东", "西", "南", "北"],
        answer: 0
      },
      {
        question: "一年有多少个月？",
        options: ["10", "11", "12", "13"],
        answer: 2
      }
    ]
    
    return questions[Math.floor(Math.random() * questions.length)]
  }
}

// ==================== 导出工具 ====================
export const antiSpam = new AntiSpam()
export { CaptchaGenerator }

// 默认导出
export default {
  antiSpam,
  CaptchaGenerator
}