import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const authStore = useAuthStore()

const { data } = await supabase.auth.getSession()
authStore.user = data.session?.user ?? null
authStore.loading = false

supabase.auth.onAuthStateChange((_event, session) => {
  authStore.user = session?.user ?? null
})
authStore.fetchUser()
app.use(router)

app.use(ElementPlus)
app.mount('#app')
