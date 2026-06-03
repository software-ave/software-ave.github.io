// src/utils/validation.js
// 表单验证工具
export function validateComment({ content, captcha, captchaSolution }) {
  const errors = {}
  
  // 内容验证
  if (!content || content.trim().length === 0) {
    errors.content = '评论内容不能为空'
  } else if (content.trim().length < 5) {
    errors.content = '评论内容至少5个字符'
  } else if (content.trim().length > 1000) {
    errors.content = '评论内容不能超过1000个字符'
  }
  
  // 验证码验证
  if (captcha !== null) {
    if (!captcha || captcha.trim() === '') {
      errors.captcha = '请输入验证码'
    } else if (parseInt(captcha) !== captchaSolution) {
      errors.captcha = '验证码错误'
    }
  }
  
  // 敏感词过滤
  const sensitiveWords = ['广告', '赌博', '色情', '垃圾']
  const hasSensitiveWord = sensitiveWords.some(word => 
    content.toLowerCase().includes(word.toLowerCase())
  )
  
  if (hasSensitiveWord) {
    errors.content = '评论包含敏感内容'
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

// 生成简单的数学验证码
export function generateCaptcha() {
  const operators = ['+', '-', '*']
  const operator = operators[Math.floor(Math.random() * operators.length)]
  let num1, num2, solution
  
  switch (operator) {
    case '+':
      num1 = Math.floor(Math.random() * 10) + 1
      num2 = Math.floor(Math.random() * 10) + 1
      solution = num1 + num2
      break
    case '-':
      num1 = Math.floor(Math.random() * 20) + 10
      num2 = Math.floor(Math.random() * 10) + 1
      solution = num1 - num2
      break
    case '*':
      num1 = Math.floor(Math.random() * 5) + 1
      num2 = Math.floor(Math.random() * 5) + 1
      solution = num1 * num2
      break
  }
  
  return {
    question: `${num1} ${operator} ${num2} = ?`,
    solution
  }
}

// 防垃圾评论工具
export function createAntiSpam() {
  const SUBMIT_INTERVAL = 30000 // 30秒
  const MAX_COMMENTS_PER_IP = 10 // 每IP最大评论数
  const SUBMIT_HISTORY_KEY = 'comment_submit_history'
  
  function canSubmit() {
    const history = JSON.parse(localStorage.getItem(SUBMIT_HISTORY_KEY) || '[]')
    const now = Date.now()
    
    // 清理过期记录（超过1小时）
    const validHistory = history.filter(time => now - time < 3600000)
    
    if (validHistory.length >= MAX_COMMENTS_PER_IP) {
      return {
        allowed: false,
        reason: `提交过于频繁，请1小时后再试`,
        waitTime: Math.ceil((3600000 - (now - validHistory[0])) / 60000)
      }
    }
    
    const lastSubmit = history[history.length - 1]
    if (lastSubmit && now - lastSubmit < SUBMIT_INTERVAL) {
      return {
        allowed: false,
        reason: '提交过于频繁，请稍后再试',
        waitTime: Math.ceil((SUBMIT_INTERVAL - (now - lastSubmit)) / 1000)
      }
    }
    
    return { allowed: true }
  }
  
  function recordSubmit() {
    const history = JSON.parse(localStorage.getItem(SUBMIT_HISTORY_KEY) || '[]')
    history.push(Date.now())
    localStorage.setItem(SUBMIT_HISTORY_KEY, JSON.stringify(history))
  }
  
  return { canSubmit, recordSubmit }
}