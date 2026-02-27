<template>
  <div>
    <div class="title">
      <h2>ようこそ、{{ authStore.user?.email }} さん</h2>
      <el-button type="danger" @click="logout">Logout</el-button>
    </div>

    <div style="margin-bottom: 16px">
      <el-input
        v-model="newTitle"
        placeholder="新しいTodoを入力"
        style="width: 300px; margin-right: 8px"
      />
      <el-button type="primary" @click="addTodoHandler">追加</el-button>
    </div>

    <el-table :data="store.todos" style="width: 100%">
      <el-table-column prop="title" label="タイトル" />
      <el-table-column label="ステータス">
        <template #default="{ row }">
          <el-select v-model="row.status" placeholder="ステータス" @change="changeStatus(row)">
            <el-option label="Todo" value="todo" />
            <el-option label="Doing" value="doing" />
            <el-option label="Done" value="done" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button type="danger" size="small" @click="deleteTodoHandler(row.id)">
            削除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTodoStore, type Todo } from '@/stores/todos'

const store = useTodoStore()
const authStore = useAuthStore()
const router = useRouter()

const newTitle = ref('') // 入力フォーム用

onMounted(async () => {
  if (authStore.user) {
    await store.fetchTodos(authStore.user.id)
  }
})

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}

// -----------------------------
// Todo 追加ハンドラー
// -----------------------------
const addTodoHandler = async () => {
  if (!newTitle.value.trim()) return // 空入力は無視

  if (authStore.user) {
    try {
      await store.addTodo(newTitle.value, authStore.user.id)
      newTitle.value = '' // 入力欄をクリア
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Todo の追加に失敗しました'
      alert(message)
    }
  }
}

// -----------------------------
// ステータス更新ハンドラー
// -----------------------------
const changeStatus = async (todo: Todo) => {
  try {
    await store.updateTodo(todo.id, { status: todo.status })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'ステータス更新に失敗しました'
    alert(message)
  }
}

// -----------------------------
// Todo 削除ハンドラー
// -----------------------------
const deleteTodoHandler = async (id: string) => {
  try {
    await store.deleteTodo(id)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '削除に失敗しました'
    alert(message)
  }
}
</script>

<style scoped>
.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
</style>
