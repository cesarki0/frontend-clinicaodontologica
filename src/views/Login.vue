<template>
  <div class="min-vh-100 d-flex flex-row align-items-center" :class="theme === 'dark' ? 'bg-dark' : 'bg-body-tertiary'">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol :md="10" :lg="8">
          <!-- Logo arriba solo en móviles -->
          <CCard class="bg-primary text-white d-md-none border-0 shadow-sm mb-0 rounded-bottom-0">
             <CCardBody class="text-center py-4">
                <img src="/logo_karen.jpg" alt="Logo" class="img-fluid mb-2" style="max-height: 60px; border-radius: 10px; border: 2px solid white;" />
                <h4 class="mb-0 fw-bold">Sistema Dental</h4>
             </CCardBody>
          </CCard>

          <CCardGroup>
            <CCard class="p-4 shadow-sm border" :class="theme === 'dark' ? 'border-secondary' : 'border-light-subtle'" style="z-index: 1;">
              <CCardBody>
                <CForm @submit.prevent="login">
                  <h1 class="fw-bold">Login</h1>
                  <p class="text-body-secondary">Inicia sesión en tu cuenta</p>
                  <CInputGroup class="mb-3">
                    <CInputGroupText>
                      <CIcon :icon="cilUser" />
                    </CInputGroupText>
                    <CFormInput
                      v-model="email"
                      type="email"
                      placeholder="Email"
                      autocomplete="username"
                      required
                    />
                  </CInputGroup>
                  <CInputGroup class="mb-4">
                    <CInputGroupText>
                      <CIcon :icon="cilLockLocked" />
                    </CInputGroupText>
                    <CFormInput
                      v-model="password"
                      type="password"
                      placeholder="Contraseña"
                      autocomplete="current-password"
                      required
                    />
                  </CInputGroup>
                  <CRow>
                    <CCol :xs="12" class="mb-3">
                      <CButton color="primary" class="w-100 py-2 shadow-sm" type="submit"> 
                        <strong>Entrar</strong>
                      </CButton>
                    </CCol>
                    <CCol :xs="12" class="text-center">
                      <CButton color="link" class="px-0 text-decoration-none small"> 
                        ¿Olvidaste tu contraseña? 
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
            
            <!-- Panel lateral solo en escritorio -->
            <CCard class="text-white bg-primary py-5 d-none d-md-block shadow-sm border-0" style="width: 44%">
              <CCardBody class="text-center d-flex flex-column justify-content-center">
                <div>
                  <img src="/logo_karen.jpg" alt="Logo" class="img-fluid mb-4 shadow" style="max-height: 120px; border-radius: 15px; border: 3px solid white;" />
                  <h2 class="fw-bold">Sistema Dental</h2>
                  <p class="px-3 opacity-75">
                    Bienvenido al portal administrativo. Gestione sus citas, pacientes y pagos de forma eficiente.
                  </p>
                </div>
              </CCardBody>
            </CCard>
          </CCardGroup>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { cilUser, cilLockLocked } from '@coreui/icons'

const email = ref('')
const password = ref('')
const theme = ref('light')

onMounted(() => {
  theme.value = localStorage.getItem('theme') || 'dark'
})

const login = () => {
  axios.post('/login', { email: email.value, password: password.value })
    .then(res => {
      if (res.data.success) {
        localStorage.setItem('token', res.data.token)
        Swal.fire({
          title: '¡Bienvenido!',
          text: 'Login correcto',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          window.location.href = '/dashboard'
        })
      } else {
        Swal.fire('Error', res.data.message, 'error')
      }
    })
    .catch(() => {
      Swal.fire('Error', 'No se pudo iniciar sesión', 'error')
    })
}
</script>


