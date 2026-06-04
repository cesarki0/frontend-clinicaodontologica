import { createRouter, createWebHistory } from 'vue-router'

import Pacientes from '../views/Pacientes.vue'
import Citas from '../views/Citas.vue'
import Tratamientos from '../views/Tratamientos.vue'
import Pagos from '../views/Pagos.vue'
import Odontograma from '../views/Odontograma.vue'
import Login from '../views/Login.vue'
import PacientesCitas from '../views/PacientesCitas.vue'
import Dashboard from '@/views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/pacientes', name: 'pacientes', component: Pacientes },
    { path: '/citas', name: 'citas', component: Citas },
    { path: '/tratamientos', name: 'tratamientos', component: Tratamientos },
    { path: '/pagos', name: 'pagos', component: Pagos },
    { path: '/odontogramas', name: 'odontogramas', component: Odontograma },
      { path: '/login', name: 'Login', component: Login },

   // para citas de cada paciente
   { path: '/pacientes/:id/citas', name: 'PacienteCitas', component: PacientesCitas},   

     { path: '/dashboard', name: 'Dashboard', component: Dashboard }, 
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.name !== 'Login' && !token) {
    return { name: 'Login' }
  }
})




export default router
