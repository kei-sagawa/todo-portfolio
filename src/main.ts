import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { supabase } from '@/lib/supabase'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import './styles/tsuzuri-ui.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const { data } = await supabase.auth.getSession()

app.use(router)

app.use(ElementPlus)
app.mount('#app')
