import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export interface Todo {
  id: string
  title: string
  status: 'todo' | 'doing' | 'done'
  user_id: string
}

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [] as Todo[], // Todo 一覧
    loading: false,
  }),
  actions: {
    // Todo 一覧取得
    async fetchTodos(userId: string) {
      this.loading = true
      const { data, error } = await supabase.from('todos').select('*').eq('user_id', userId)

      if (error) throw error
      this.todos = data || []
      this.loading = false
    },

    // Todo 追加
    async addTodo(title: string, userId: string) {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ title, user_id: userId, status: 'todo' }])
        .select()

      if (error) throw error
      this.todos.push(data![0])
    },

    // Todo 更新
    async updateTodo(id: string, updates: Partial<Todo>) {
      const { data, error } = await supabase.from('todos').update(updates).eq('id', id).select()

      if (error) throw error

      // store の更新
      const index = this.todos.findIndex((t) => t.id === id)
      if (index !== -1) this.todos[index] = data![0]
    },

    // Todo 削除
    async deleteTodo(id: string) {
      const { error } = await supabase.from('todos').delete().eq('id', id)

      if (error) throw error

      this.todos = this.todos.filter((t) => t.id !== id)
    },
  },
})
