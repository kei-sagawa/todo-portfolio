<template>
  <article
    class="todo-item"
    :class="{
      'is-pending': isPending,
      'is-editing': isEditing,
      'is-dragging': isDragging,
      'is-drop-before': isDropBefore,
      'is-drop-after': isDropAfter,
    }"
    :draggable="!isEditing && !isPending"
    @dragstart="$emit('dragstart', todo.id, $event)"
    @dragend="$emit('dragend')"
    @dragover="$emit('item-dragover', todo, $event)"
    @drop="$emit('item-drop', todo, $event)"
  >
    <template v-if="isEditing">
      <div class="todo-edit-wrap">
        <div class="todo-edit-field">
          <input
            :value="editingTitle"
            class="ts-input"
            type="text"
            placeholder="タイトルを入力"
            :disabled="isPending"
            @input="onEditInput"
            @keydown.enter="$emit('save-edit', todo.id)"
            @keydown.esc="$emit('cancel-edit')"
          />
          <p v-if="editingError" class="todo-error">{{ editingError }}</p>
        </div>

        <div class="todo-edit-actions">
          <select
            class="ts-select todo-select"
            :value="todo.status"
            :disabled="isPending"
            @change="onStatusChange"
          >
            <option value="todo">Todo</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>

          <button
            class="ts-button todo-small-button"
            type="button"
            :disabled="isPending || !editingTitle.trim()"
            @click="$emit('save-edit', todo.id)"
          >
            {{ isPending ? '保存中...' : '保存' }}
          </button>

          <button
            class="todo-ghost"
            type="button"
            :disabled="isPending"
            @click="$emit('cancel-edit')"
          >
            キャンセル
          </button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="todo-item-title">{{ todo.title }}</div>

      <div class="todo-item-actions">
        <select
          class="ts-select todo-select"
          :value="todo.status"
          :disabled="isPending"
          @change="onStatusChange"
        >
          <option value="todo">Todo</option>
          <option value="doing">Doing</option>
          <option value="done">Done</option>
        </select>

        <button
          class="todo-ghost"
          type="button"
          :disabled="isPending"
          @click="$emit('start-edit', todo)"
        >
          編集
        </button>

        <button
          class="todo-delete"
          type="button"
          :disabled="isPending"
          @click="$emit('delete', todo.id)"
        >
          {{ isPending ? '削除中...' : '削除' }}
        </button>
      </div>
    </template>
  </article>
</template>

<script setup lang="ts">
import type { Todo } from '@/stores/todos'

const props = defineProps<{
  todo: Todo
  isPending: boolean
  isEditing: boolean
  isDragging: boolean
  isDropBefore: boolean
  isDropAfter: boolean
  editingTitle: string
  editingError: string
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
}>()

const onEditInput = (event: Event) => {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  emit('update:editingTitle', target.value)
}

const onStatusChange = (event: Event) => {
  emit('status-change', props.todo.id, event)
}
</script>

<style scoped>
.todo-item {
  position: relative;
  padding: 16px;
  border: 1px solid rgba(216, 207, 192, 0.7);
  background: rgba(255, 255, 255, 0.58);
  box-sizing: border-box;
  transition:
    opacity 0.2s ease,
    transform 0.15s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.todo-item.is-editing {
  box-shadow: 0 8px 24px rgba(80, 60, 40, 0.08);
}

.todo-item.is-pending {
  opacity: 0.7;
}

.todo-item.is-dragging {
  opacity: 0.45;
  transform: scale(0.98);
  border-color: rgba(180, 145, 110, 0.6);
}

.todo-item.is-drop-before::before,
.todo-item.is-drop-after::after {
  content: '';
  position: absolute;
  left: 8px;
  right: 8px;
  height: 2px;
  background: rgba(161, 120, 82, 0.95);
  border-radius: 999px;
}

.todo-item.is-drop-before::before {
  top: -6px;
}

.todo-item.is-drop-after::after {
  bottom: -6px;
}

.todo-item-title {
  font-size: 14px;
  line-height: 1.8;
  color: var(--ts-text);
  letter-spacing: 0.04em;
  word-break: break-word;
}

.todo-edit-wrap {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.todo-edit-field {
  min-width: 0;
}

.todo-edit-field .ts-input {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.todo-edit-actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 10px;
  align-items: center;
}

.todo-item-actions {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.todo-select {
  width: 100%;
  min-width: 0;
}

.todo-small-button,
.todo-ghost {
  white-space: nowrap;
}

.todo-delete,
.todo-ghost {
  border: 1px solid rgba(216, 207, 192, 0.85);
  background: rgba(255, 255, 255, 0.55);
  padding: 10px 12px;
  border-radius: 8px;
  font-family: var(--ts-font-serif);
  font-size: 12px;
  letter-spacing: 0.08em;
  color: rgba(58, 42, 31, 0.82);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.2s ease,
    opacity 0.2s ease;
}

.todo-delete:hover,
.todo-ghost:hover {
  background: rgba(255, 248, 240, 0.8);
  transform: translateY(-1px);
}

.todo-delete:disabled,
.todo-ghost:disabled,
.todo-small-button:disabled,
.ts-input:disabled,
.ts-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.todo-error {
  margin: 6px 0 0;
  font-size: 12px;
  color: #9f3a2f;
}

@media (max-width: 768px) {
  .todo-edit-actions {
    grid-template-columns: 1fr;
  }

  .todo-small-button,
  .todo-ghost {
    width: 100%;
  }

  .todo-item-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
