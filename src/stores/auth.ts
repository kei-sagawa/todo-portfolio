import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: true,
  }),

  actions: {
    // 初期ユーザー取得
    async fetchUser() {
      const { data } = await supabase.auth.getUser()
      this.user = data.user
      this.loading = false
    },

    // ログインを追加
    async login(email: string, password: string) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      this.user = data.user ?? null
    },

    // ログアウト
    async logout() {
      await supabase.auth.signOut()
      this.user = null
    },
  },
})
