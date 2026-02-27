<template>
  <el-container>
    <!-- ヘッダー -->
    <el-header height="60px">
      <el-menu :default-active="activePath" mode="horizontal" @select="handleSelect">
        <el-menu-item index="/todo">Todoアプリ</el-menu-item>
      </el-menu>
    </el-header>

    <!-- メインコンテンツ -->
    <el-main>
      <div v-if="authStore.loading" class="loading-container">
        <div class="spinner" />
        <p>Loading...</p>
      </div>
      <router-view v-else />
    </el-main>
  </el-container>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

const router = useRouter()
const route = useRoute()
const activePath = ref(route.path)

watch(
  () => route.path,
  (newPath) => {
    activePath.value = newPath
  },
)

const handleSelect = (index: string) => {
  router.push(index)
}
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f8f9fa;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 6px solid #ccc;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
