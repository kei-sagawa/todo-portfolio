<template>
  <section class="ts-page ts-section todo-page">
    <div class="ts-section-inner">
      <h1 class="ts-title">Todo</h1>

      <TodoCreateForm
        :title="newTitle"
        :is-creating="isCreating"
        :error-message="createError"
        @update:title="newTitle = $event"
        @submit="addTodoHandler"
      />

      <p v-if="fetchError" class="todo-error todo-global-error">
        {{ fetchError }}
      </p>

      <p v-if="isLoading" class="todo-empty">読み込み中です...</p>

      <div v-else class="todo-board">
        <TodoColumn
          v-for="column in columns"
          :key="column.key"
          :column="column"
          :is-drop-active="dropTargetStatus === column.key"
          :pending-id="pendingId"
          :editing-id="editingId"
          :editing-title="editingTitle"
          :editing-error="editingError"
          :dragging-id="draggingId"
          :drop-preview="dropPreview"
          @update:editingTitle="editingTitle = $event"
          @status-change="onStatusChange"
          @start-edit="startEdit"
          @cancel-edit="cancelEdit"
          @save-edit="saveEdit"
          @delete="deleteTodoHandler"
          @dragstart="onDragStart"
          @dragend="onDragEnd"
          @item-dragover="onItemDragOver"
          @item-drop="onItemDrop"
          @column-dragover="onColumnDragOver"
          @column-dragenter="onColumnDragEnter"
          @column-dragleave="onColumnDragLeave"
          @column-drop="onColumnDrop"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import TodoCreateForm from './todo/TodoCreateForm.vue'
import TodoColumn from './todo/TodoColumn.vue'
import { useTodoStore, type Todo } from '@/stores/todos'

type TodoStatus = Todo['status']

type TodoColumnData = {
  key: TodoStatus
  title: string
  emptyMessage: string
  items: Todo[]
}

type DropPlacement = 'before' | 'after'

type DropPreview = {
  targetId: string
  placement: DropPlacement
} | null

const store = useTodoStore()

const newTitle = ref('')
const editingId = ref<string | null>(null)
const editingTitle = ref('')

const isLoading = ref(true)
const fetchError = ref('')
const createError = ref('')
const editingError = ref('')

const isCreating = ref(false)
const pendingId = ref<string | null>(null)

const draggingId = ref<string | null>(null)
const dropTargetStatus = ref<TodoStatus | null>(null)
const dropPreview = ref<DropPreview>(null)

const filteredTodos = computed(() => {
  return [...store.todos].sort((a, b) => a.position - b.position)
})

const columns = computed<TodoColumnData[]>(() => [
  {
    key: 'todo',
    title: 'Todo',
    emptyMessage: 'まだタスクはありません。',
    items: filteredTodos.value.filter((t) => t.status === 'todo'),
  },
  {
    key: 'doing',
    title: 'Doing',
    emptyMessage: '進行中のタスクはありません。',
    items: filteredTodos.value.filter((t) => t.status === 'doing'),
  },
  {
    key: 'done',
    title: 'Done',
    emptyMessage: '完了したタスクはありません。',
    items: filteredTodos.value.filter((t) => t.status === 'done'),
  },
])

onMounted(async () => {
  try {
    fetchError.value = ''
    await store.fetchTodos()
  } catch (error: unknown) {
    fetchError.value = error instanceof Error ? error.message : 'Todo の読み込みに失敗しました'
    console.error(error)
  } finally {
    isLoading.value = false
  }
})

const isTodoStatus = (value: string): value is TodoStatus => {
  return value === 'todo' || value === 'doing' || value === 'done'
}

const addTodoHandler = async () => {
  const title = newTitle.value.trim()
  createError.value = ''

  if (!title) {
    createError.value = 'タスク名を入力してください。'
    return
  }

  const nextPosition =
    store.todos.length > 0 ? Math.max(...store.todos.map((todo) => todo.position)) + 1 : 1

  try {
    isCreating.value = true
    await store.addTodo(title, nextPosition)
    newTitle.value = ''
  } catch (error: unknown) {
    createError.value = error instanceof Error ? error.message : 'Todo の追加に失敗しました'
    alert(createError.value)
  } finally {
    isCreating.value = false
  }
}

const onStatusChange = async (id: string, event: Event) => {
  const target = event.target
  if (!(target instanceof HTMLSelectElement)) return
  await changeStatus(id, target.value)
}

const changeStatus = async (id: string, status: string) => {
  if (!isTodoStatus(status)) {
    alert('不正なステータスです')
    return
  }

  const movedTodo = store.todos.find((todo) => todo.id === id)
  if (!movedTodo) return

  const sameColumn = store.todos
    .filter((todo) => todo.status === status && todo.id !== id)
    .sort((a, b) => a.position - b.position)

  const lastTodo = sameColumn[sameColumn.length - 1]
  const nextPosition = lastTodo ? lastTodo.position + 1 : 1

  try {
    pendingId.value = id
    await store.updateTodo(id, {
      status,
      position: movedTodo.status === status ? movedTodo.position : nextPosition,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'ステータス更新に失敗しました'
    alert(message)
  } finally {
    pendingId.value = null
  }
}

const deleteTodoHandler = async (id: string) => {
  try {
    pendingId.value = id
    await store.deleteTodo(id)

    if (editingId.value === id) {
      cancelEdit()
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '削除に失敗しました'
    alert(message)
  } finally {
    pendingId.value = null
  }
}

const startEdit = (todo: Todo) => {
  editingId.value = todo.id
  editingTitle.value = todo.title
  editingError.value = ''
}

const cancelEdit = () => {
  editingId.value = null
  editingTitle.value = ''
  editingError.value = ''
}

const saveEdit = async (id: string) => {
  const title = editingTitle.value.trim()
  editingError.value = ''

  if (!title) {
    editingError.value = 'タイトルを入力してください。'
    return
  }

  try {
    pendingId.value = id
    await store.updateTodo(id, { title })
    cancelEdit()
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '編集の保存に失敗しました'
    editingError.value = message
    alert(message)
  } finally {
    pendingId.value = null
  }
}

const onDragStart = (id: string, event: DragEvent) => {
  if (pendingId.value === id) return
  if (editingId.value === id) return

  draggingId.value = id

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', id)
  }
}

const onDragEnd = () => {
  draggingId.value = null
  dropTargetStatus.value = null
  dropPreview.value = null
}

const onColumnDragOver = (status: TodoStatus, event: DragEvent) => {
  if (!draggingId.value) return
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }

  dropTargetStatus.value = status
}

const onColumnDragEnter = (status: TodoStatus, event: DragEvent) => {
  if (!draggingId.value) return
  event.preventDefault()
  dropTargetStatus.value = status
}

const onColumnDragLeave = (status: TodoStatus, event: DragEvent) => {
  const currentTarget = event.currentTarget
  const relatedTarget = event.relatedTarget

  if (
    currentTarget instanceof HTMLElement &&
    relatedTarget instanceof Node &&
    currentTarget.contains(relatedTarget)
  ) {
    return
  }

  if (dropTargetStatus.value === status) {
    dropTargetStatus.value = null
  }
}

const getDragId = (event: DragEvent) => {
  return draggingId.value || event.dataTransfer?.getData('text/plain') || ''
}

const getColumnItems = (status: TodoStatus) => {
  return [...store.todos]
    .filter((todo) => todo.status === status)
    .sort((a, b) => a.position - b.position)
}

const renumberTodos = (items: Todo[]) => {
  return items.map((todo, index) => ({
    ...todo,
    position: index + 1,
  }))
}

const persistOrder = async (items: Todo[]) => {
  for (const todo of items) {
    await store.updateTodo(todo.id, {
      status: todo.status,
      position: todo.position,
    })
  }
}

const onColumnDrop = async (status: TodoStatus, event: DragEvent) => {
  event.preventDefault()

  const dragId = getDragId(event)
  dropTargetStatus.value = null

  if (!dragId) {
    onDragEnd()
    return
  }

  const draggedTodo = store.todos.find((todo) => todo.id === dragId)
  if (!draggedTodo) {
    onDragEnd()
    return
  }

  const droppedOnItem = dropPreview.value !== null

  if (!droppedOnItem) {
    try {
      pendingId.value = dragId
      const fromStatus = draggedTodo.status
      await moveBetweenColumns(dragId, fromStatus, status, null, 'after')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '並び替えに失敗しました'
      alert(message)
    } finally {
      pendingId.value = null
      onDragEnd()
    }
  }
}

const getPlacementFromEvent = (event: DragEvent, element: HTMLElement): DropPlacement => {
  const rect = element.getBoundingClientRect()
  const offsetY = event.clientY - rect.top
  return offsetY < rect.height / 2 ? 'before' : 'after'
}

const onItemDragOver = (targetTodo: Todo, event: DragEvent) => {
  if (!draggingId.value) return

  const dragId = getDragId(event)
  if (!dragId || dragId === targetTodo.id) return

  event.preventDefault()

  const currentTarget = event.currentTarget
  if (!(currentTarget instanceof HTMLElement)) return

  dropTargetStatus.value = targetTodo.status
  dropPreview.value = {
    targetId: targetTodo.id,
    placement: getPlacementFromEvent(event, currentTarget),
  }
}

const onItemDrop = async (targetTodo: Todo, event: DragEvent) => {
  event.preventDefault()

  const dragId = getDragId(event)
  if (!dragId || dragId === targetTodo.id) {
    onDragEnd()
    return
  }

  const draggedTodo = store.todos.find((todo) => todo.id === dragId)
  if (!draggedTodo) {
    onDragEnd()
    return
  }

  const currentTarget = event.currentTarget
  if (!(currentTarget instanceof HTMLElement)) {
    onDragEnd()
    return
  }

  const placement = getPlacementFromEvent(event, currentTarget)

  try {
    pendingId.value = dragId
    await moveBetweenColumns(
      dragId,
      draggedTodo.status,
      targetTodo.status,
      targetTodo.id,
      placement,
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '並び替えに失敗しました'
    alert(message)
  } finally {
    pendingId.value = null
    onDragEnd()
  }
}

const moveBetweenColumns = async (
  dragId: string,
  fromStatus: TodoStatus,
  toStatus: TodoStatus,
  targetId: string | null,
  placement: DropPlacement,
) => {
  const draggedTodo = store.todos.find((todo) => todo.id === dragId)
  if (!draggedTodo) return

  const sourceItems = getColumnItems(fromStatus).filter((todo) => todo.id !== dragId)
  const targetItemsBase =
    fromStatus === toStatus
      ? sourceItems
      : getColumnItems(toStatus).filter((todo) => todo.id !== dragId)

  const insertIndex =
    targetId === null
      ? targetItemsBase.length
      : (() => {
          const targetIndex = targetItemsBase.findIndex((todo) => todo.id === targetId)
          if (targetIndex === -1) return targetItemsBase.length
          return placement === 'before' ? targetIndex : targetIndex + 1
        })()

  const movedTodo: Todo = {
    ...draggedTodo,
    status: toStatus,
  }

  const nextTargetItems = [...targetItemsBase]
  nextTargetItems.splice(insertIndex, 0, movedTodo)

  const normalizedTarget = renumberTodos(nextTargetItems).map((todo) => ({
    ...todo,
    status: toStatus,
  }))

  await persistOrder(normalizedTarget)

  if (fromStatus !== toStatus) {
    const normalizedSource = renumberTodos(sourceItems).map((todo) => ({
      ...todo,
      status: fromStatus,
    }))
    await persistOrder(normalizedSource)
  }
}
</script>

<style scoped>
.todo-page {
  min-height: 100vh;
}

.todo-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  align-items: start;
}

.todo-empty {
  margin: 0;
  font-size: 13px;
  line-height: 2;
  color: rgba(58, 42, 31, 0.62);
}

.todo-error {
  margin: 6px 0 0;
  font-size: 12px;
  color: #9f3a2f;
}

.todo-global-error {
  margin-bottom: 20px;
}

@media (max-width: 980px) {
  .todo-board {
    grid-template-columns: 1fr;
  }
}
</style>
