import './assets/main.css'

import { createApp } from 'vue'


import App from './App.vue'
import router from './router'
import CoreuiVue from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import * as iconSet from '@coreui/icons' // todos los íconos

import 'bootstrap/dist/css/bootstrap.min.css'
import '@coreui/coreui/dist/css/coreui.min.css'

import axios from 'axios'

// Configuración global de Axios
//axios.defaults.baseURL = import.meta.env.VITE_API_URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL
axios.defaults.headers.common['Accept'] = 'application/json'

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})


const app = createApp(App)

app.use(router)
app.use(CoreuiVue)
app.provide('icons', iconSet)
app.component('CIcon', CIcon)
app.mount('#app')
