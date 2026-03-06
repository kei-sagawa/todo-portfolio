<template>
  <div class="todo-create ts-card">
    <div class="todo-create-field">
      <label class="ts-label" for="new-todo">新しいタスク</label>
      <input
        id="new-todo"
        :value="title"
        class="ts-input"
        type="text"
        placeholder="やることを入力"
        :disabled="isCreating"
        @input="onInput"
        @keydown.enter="$emit('submit')"
      />
      <p v-if="errorMessage" class="todo-error">{{ errorMessage }}</p>
    </div>

    <div class="todo-create-action">
      <button
        class="ts-button todo-create-button"
        type="button"
        :disabled="isCreating || !title.trim()"
        @click="$emit('submit')"
      >
        {{ isCreating ? '追加中...' : '追加' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  isCreating: boolean
  errorMessage: string
}>()

const emit = defineEmits<{
  (e: 'update:title', value: string): void
  (e: 'submit'): void
}>()

const onInput = (event: Event) => {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  emit('update:title', target.value)
}
</script>

<style scoped>
.todo-create {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: end;
  margin-bottom: 32px;
}

.todo-create-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.todo-create-field .ts-input {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.todo-create-action {
  display: flex;
  align-items: end;
}

.todo-create-button {
  min-width: 110px;
  height: 44px;
  white-space: nowrap;
  flex-shrink: 0;
}

.todo-error {
  margin: 6px 0 0;
  font-size: 12px;
  color: #9f3a2f;
}

@media (max-width: 768px) {
  .todo-create {
    grid-template-columns: 1fr;
  }

  .todo-create-action {
    width: 100%;
  }

  .todo-create-button {
    width: 100%;
  }
}
</style>
