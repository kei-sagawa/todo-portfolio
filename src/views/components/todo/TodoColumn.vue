<template>
  <section
    class="todo-column ts-card"
    :class="{ 'is-drop-active': isDropActive }"
    @dragover="emitColumnDragOver(column.key, $event)"
    @dragenter="emitColumnDragEnter(column.key, $event)"
    @dragleave="emitColumnDragLeave(column.key, $event)"
    @drop="emitColumnDrop(column.key, $event)"
  >
    <div class="todo-column-head">
      <h2 class="todo-column-title">{{ column.title }}</h2>
      <span class="ts-tag">{{ column.items.length }}</span>
    </div>

    <div v-if="column.items.length" class="todo-list">
      <TodoItemCard
        v-for="todo in column.items"
        :key="todo.id"
        :todo="todo"
        :is-pending="pendingId === todo.id"
        :is-editing="editingId === todo.id"
        :is-dragging="draggingId === todo.id"
        :is-drop-before="dropPreview?.targetId === todo.id && dropPreview?.placement === 'before'"
        :is-drop-after="dropPreview?.targetId === todo.id && dropPreview?.placement === 'after'"
        :editing-title="editingTitle"
        :editing-error="editingError"
        @update:editingTitle="emitUpdateEditingTitle"
        @status-change="emitStatusChange"
        @start-edit="emitStartEdit"
        @cancel-edit="emitCancelEdit"
        @save-edit="emitSaveEdit"
        @delete="emitDelete"
        @dragstart="emitDragStart"
        @dragend="emitDragEnd"
        @item-dragover="emitItemDragOver"
        @item-drop="emitItemDrop"
      />
    </div>

    <p v-else class="todo-empty">{{ column.emptyMessage }}</p>
  </section>
</template>

<script setup lang="ts">
import TodoItemCard from './TodoItemCard.vue'
import type { Todo } from '@/stores/todos'

type TodoStatus = Todo['status']
type DropPlacement = 'before' | 'after'

type TodoColumnData = {
  key: TodoStatus
  title: string
  emptyMessage: string
  items: Todo[]
}

type DropPreview = {
  targetId: string
  placement: DropPlacement
} | null

defineProps<{
  column: TodoColumnData
  isDropActive: boolean
  pendingId: string | null
  editingId: string | null
  editingTitle: string
  editingError: string
  draggingId: string | null
  dropPreview: DropPreview
}>()

const emit = defineEmits<{
  (e: 'update:editingTitle', value: string): void
  (e: 'status-change', id: string, event: Event): void
  (e: 'start-edit', todo: Todo): void
  (e: 'cancel-edit'): void
  (e: 'save-edit', id: string): void
  (e: 'delete', id: string): void
  (e: 'dragstart', id: string, event: DragEvent): void
  (e: 'dragend'): void
  (e: 'item-dragover', todo: Todo, event: DragEvent): void
  (e: 'item-drop', todo: Todo, event: DragEvent): void
  (e: 'column-dragover', status: TodoStatus, event: DragEvent): void
  (e: 'column-dragenter', status: TodoStatus, event: DragEvent): void
  (e: 'column-dragleave', status: TodoStatus, event: DragEvent): void
  (e: 'column-drop', status: TodoStatus, event: DragEvent): void
}>()

const emitUpdateEditingTitle = (value: string) => {
  emit('update:editingTitle', value)
}

const emitStatusChange = (id: string, event: Event) => {
  emit('status-change', id, event)
}

const emitStartEdit = (todo: Todo) => {
  emit('start-edit', todo)
}

const emitCancelEdit = () => {
  emit('cancel-edit')
}

const emitSaveEdit = (id: string) => {
  emit('save-edit', id)
}

const emitDelete = (id: string) => {
  emit('delete', id)
}

const emitDragStart = (id: string, event: DragEvent) => {
  emit('dragstart', id, event)
}

const emitDragEnd = () => {
  emit('dragend')
}

const emitItemDragOver = (todo: Todo, event: DragEvent) => {
  emit('item-dragover', todo, event)
}

const emitItemDrop = (todo: Todo, event: DragEvent) => {
  emit('item-drop', todo, event)
}

const emitColumnDragOver = (status: TodoStatus, event: DragEvent) => {
  emit('column-dragover', status, event)
}

const emitColumnDragEnter = (status: TodoStatus, event: DragEvent) => {
  emit('column-dragenter', status, event)
}

const emitColumnDragLeave = (status: TodoStatus, event: DragEvent) => {
  emit('column-dragleave', status, event)
}

const emitColumnDrop = (status: TodoStatus, event: DragEvent) => {
  emit('column-drop', status, event)
}
</script>

<style scoped>
.todo-column {
  min-height: 420px;
  padding: 22px 20px;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.todo-column.is-drop-active {
  background: rgba(255, 248, 240, 0.88);
  box-shadow: inset 0 0 0 1px rgba(180, 145, 110, 0.35);
}

.todo-column-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.todo-column-title {
  margin: 0;
  font-size: 16px;
  letter-spacing: 0.08em;
  color: var(--ts-heading);
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.todo-empty {
  margin: 0;
  font-size: 13px;
  line-height: 2;
  color: rgba(58, 42, 31, 0.62);
}

@media (max-width: 980px) {
  .todo-column {
    min-height: auto;
  }
}
</style>
