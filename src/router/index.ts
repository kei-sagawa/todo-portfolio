import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import TodoView from '@/views/TodoView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/todo',
      name: 'todo',
      component: TodoView,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (authStore.loading) {
    await authStore.fetchUser()
  }

  if (!authStore.user && to.path !== '/login') {
    next('/login')
  } else {
    next()
  }
})

export default router
