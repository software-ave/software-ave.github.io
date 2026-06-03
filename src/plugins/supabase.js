// src/plugins/supabase.js
import { createClient } from '@supabase/supabase-js'

export function createSupabase() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 请配置 Supabase 环境变量')
    console.log('VITE_SUPABASE_URL:', supabaseUrl)
    console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey)
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-vue-js/1.0.0'
      }
    }
  })
}