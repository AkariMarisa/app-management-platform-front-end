import { createApp } from 'vue'
import router from '@/router/index'
import store from '@/store/index'

import '@/assets/css/index.css'

import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice';

import 'primevue/resources/themes/saga-purple/theme.css'       //theme
import 'primevue/resources/primevue.min.css'                   //core css
import 'primeicons/primeicons.css'                             //icons

import 'primeflex/primeflex.css'

import App from './App.vue'

const app = createApp(App)
app.use(router)
app.use(store)
app.use(PrimeVue)
app.use(ToastService)

app.mount('#app')
