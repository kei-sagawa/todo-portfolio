import { defineStore } from 'pinia'

export interface Todo {
  id: string
  title: string
  status: 'todo' | 'doing' | 'done'
  position: number
}

const STORAGE_KEY = 'tsuzuri-todos'

type StoredTodo = Partial<Todo> & {
  id?: string
  title?: string
  status?: 'todo' | 'doing' | 'done'
  position?: number
}

function isTodoStatus(value: unknown): value is Todo['status'] {
  return value === 'todo' || value === 'doing' || value === 'done'
}

function normalizeTodos(rawTodos: StoredTodo[]): Todo[] {
  const safeTodos = rawTodos
    .filter((item): item is StoredTodo => typeof item === 'object' && item !== null)
    .filter((item) => typeof item.id === 'string' && typeof item.title === 'string')
    .map((item) => ({
      id: item.id as string,
      title: item.title as string,
      status: isTodoStatus(item.status) ? item.status : 'todo',
      position: typeof item.position === 'number' ? item.position : 0,
    }))

  const statuses: Todo['status'][] = ['todo', 'doing', 'done']

  return statuses.flatMap((status) => {
    const columnItems = safeTodos
      .filter((todo) => todo.status === status)
      .sort((a, b) => a.position - b.position)

    return columnItems.map((todo, index) => ({
      ...todo,
      position: index + 1,
    }))
  })
}

function loadTodos(): Todo[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as StoredTodo[]
    if (!Array.isArray(parsed)) return []
    return normalizeTodos(parsed)
  } catch {
    return []
  }
}

function saveTodos(todos: Todo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [] as Todo[],
    loading: false,
  }),

  actions: {
    async fetchTodos() {
      this.loading = true

      try {
        this.todos = loadTodos()
        saveTodos(this.todos)
      } finally {
        this.loading = false
      }
    },

    async addTodo(title: string, position?: number) {
      const todoColumn = this.todos
        .filter((t) => t.status === 'todo')
        .sort((a, b) => a.position - b.position)

      const nextPosition =
        typeof position === 'number'
          ? position
          : todoColumn.length > 0
            ? todoColumn[todoColumn.length - 1]!.position + 1
            : 1

      const todo: Todo = {
        id: crypto.randomUUID(),
        title,
        status: 'todo',
        position: nextPosition,
      }

      this.todos.push(todo)
      this.reindexAll()
      saveTodos(this.todos)
    },

    async updateTodo(id: string, updates: Partial<Todo>) {
      const index = this.todos.findIndex((t) => t.id === id)
      if (index === -1) return

      const current = this.todos[index]
      if (!current) return

      const updated: Todo = {
        id: current.id,
        title: updates.title ?? current.title,
        status: updates.status ?? current.status,
        position: updates.position ?? current.position,
      }

      this.todos[index] = updated
      this.reindexAll()
      saveTodos(this.todos)
    },

    async deleteTodo(id: string) {
      this.todos = this.todos.filter((t) => t.id !== id)
      this.reindexAll()
      saveTodos(this.todos)
    },

    reindexAll() {
      const statuses: Todo['status'][] = ['todo', 'doing', 'done']

      const normalized = statuses.flatMap((status) => {
        const items = this.todos
          .filter((todo) => todo.status === status)
          .sort((a, b) => a.position - b.position)

        return items.map((todo, index) => ({
          ...todo,
          position: index + 1,
        }))
      })

      this.todos = normalized
    },
  },
})
