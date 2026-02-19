<template>
  <div class="login-wrapper">
    <el-card class="login-card" shadow="hover">
      <h2>Todo App Login</h2>

      <el-form @submit.prevent="login" :model="form">
        <el-form-item label="Email">
          <el-input v-model="form.email" placeholder="example@example.com" />
        </el-form-item>

        <el-form-item label="Password">
          <el-input v-model="form.password" type="password" placeholder="パスワード" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" native-type="submit" style="width: 100%"> Login </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const form = reactive({
  email: '',
  password: '',
})
const router = useRouter()
const authStore = useAuthStore()

const login = async () => {
  try {
    await authStore.login(form.email, form.password)
    router.replace('/home')
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'ログインに失敗しました'
    ElMessage.error(message)
  }
}

// ログイン情報
// email: sagawatya@gmail.com
// pass: 1234
</script>
<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}
</style>
