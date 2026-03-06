import { createRouter, createWebHistory } from 'vue-router'
import TodoView from '../views/components/TodoView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/todo',
    },
    {
      path: '/todo',
      name: 'todo',
      component: TodoView,
    },
  ],
})

export default router
