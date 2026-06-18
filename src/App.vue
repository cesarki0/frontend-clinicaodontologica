<script setup>
import { ref, onMounted } from 'vue'
import { 
  cilMenu, 
  cilSpeedometer, 
  cilUser, 
  cilCalendar, 
  cilSettings, 
  cilWallet, 
  cilChartLine,
  cilAccountLogout,
  cilMedicalCross,
  cilSun,
  cilMoon,
  cilList,
  cilEnvelopeOpen,
  cilContrast
} from '@coreui/icons'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const sidebarVisible = ref(true)
const theme = ref('dark')
const route = useRoute()
const router = useRouter()

onMounted(() => {
  if (window.innerWidth < 768) {
    sidebarVisible.value = false
  }
  const savedTheme = localStorage.getItem('theme') || 'dark'
  setTheme(savedTheme)
})

const setTheme = (val) => {
  theme.value = val
  localStorage.setItem('theme', val)
  // Eliminamos el atributo global del html para evitar que sobrescriba al sidebar
}

const logout = async () => {
  try {
    await axios.post('/logout')
  } catch (err) {
    console.error('Error cerrando sesión:', err)
  } finally {
    localStorage.removeItem('token')
    router.push('/login')
  }
}
</script>

<template>
  <div class="min-vh-100">
    
    <!-- Sidebar -->
    <CSidebar 
      v-if="route.path !== '/login'"
      position="fixed"
      class="border-end"
      data-coreui-theme="dark"
      :visible="sidebarVisible"
      @visible-change="(val) => { sidebarVisible = val }"
    >
      <CSidebarHeader class="border-bottom">
        <CSidebarBrand>
          <img src="/logo_karen.jpg" alt="Logo" class="sidebar-brand-full" height="45" style="border-radius: 8px;" />
          <img src="/public/logo_diente.png" alt="Logo" class="sidebar-brand-narrow" height="32" />
        </CSidebarBrand>
      </CSidebarHeader>

      <CSidebarNav>
        <CNavTitle>Menú Principal</CNavTitle>
        
        <CNavItem>
          <router-link to="/dashboard" class="nav-link">
            <CIcon :icon="cilSpeedometer" class="nav-icon" /> Dashboard
          </router-link>
        </CNavItem>


            <CNavItem>
          <router-link to="/users" class="nav-link">
            <CIcon :icon="cilUser" class="nav-icon" /> Usuarios
          </router-link>
        </CNavItem>

         <CNavItem>
          <router-link to="/roles" class="nav-link">
            <CIcon :icon="cilUser" class="nav-icon" /> Roles
          </router-link>
        </CNavItem>

        <CNavItem>
          <router-link to="/clientes" class="nav-link">
            <CIcon :icon="cilUser" class="nav-icon" /> Clinicas
          </router-link>
        </CNavItem>

        <CNavItem>
          <router-link to="/pacientes" class="nav-link">
            <CIcon :icon="cilUser" class="nav-icon" /> Pacientes
          </router-link>
        </CNavItem>

        <CNavItem>
          <router-link to="/citas" class="nav-link">
            <CIcon :icon="cilCalendar" class="nav-icon" /> Citas
          </router-link>
        </CNavItem>

        <CNavItem>
          <router-link to="/tratamientos" class="nav-link">
            <CIcon :icon="cilMedicalCross" class="nav-icon" /> Tratamientos
          </router-link>
        </CNavItem>

        <CNavItem>
          <router-link to="/pagos" class="nav-link">
            <CIcon :icon="cilWallet" class="nav-icon" /> Pagos
          </router-link>
        </CNavItem>

        <CNavItem>
          <router-link to="/odontogramas" class="nav-link">
            <CIcon :icon="cilChartLine" class="nav-icon" /> Odontogramas
          </router-link>
        </CNavItem>

      </CSidebarNav>
      <CSidebarFooter class="border-top d-none d-lg-flex">
        <CSidebarToggler />
      </CSidebarFooter>
    </CSidebar>

    <div 
      class="wrapper d-flex flex-column min-vh-100" 
      :data-coreui-theme="theme"
      :class="theme === 'dark' ? 'bg-dark text-white' : 'bg-body-tertiary'"
      :style="route.path !== '/login' ? 'padding-left: var(--cui-sidebar-occupy-start, 0);' : ''"
    >
      
      <!-- Header -->
      <CHeader v-if="route.path !== '/login'" position="sticky" class="mb-4 border-bottom shadow-sm">
        <CContainer fluid>
          <CHeaderToggler class="ms-n2" @click="sidebarVisible = !sidebarVisible">
            <CIcon :icon="cilMenu" size="lg" />
          </CHeaderToggler>
          
          <CHeaderNav class="d-none d-md-flex me-auto">
            <CNavItem>
              <CNavLink href="/dashboard">Dashboard</CNavLink>
            </CNavItem>
        
          </CHeaderNav>

          <CHeaderNav class="ms-auto align-items-center">
            <!-- Theme Switcher Dropdown -->
            <CDropdown variant="nav-item" placement="bottom-end">
              <CDropdownToggle :caret="false">
                <CIcon v-if="theme === 'dark'" :icon="cilMoon" size="lg" />
                <CIcon v-else :icon="cilSun" size="lg" />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem 
                  :active="theme === 'light'" 
                  class="d-flex align-items-center" 
                  component="button" 
                  @click="setTheme('light')"
                >
                  <CIcon :icon="cilSun" class="me-2" /> Claro
                </CDropdownItem>
                <CDropdownItem 
                  :active="theme === 'dark'" 
                  class="d-flex align-items-center" 
                  component="button" 
                  @click="setTheme('dark')"
                >
                  <CIcon :icon="cilMoon" class="me-2" /> Oscuro
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>

            <div class="vr h-100 mx-2 text-body text-opacity-75"></div>

            <!-- User Dropdown -->
            <CDropdown variant="nav-item">
              <CDropdownToggle placement="bottom-end" class="py-0" :caret="false">
                <CAvatar src="/logo_karen.jpg" size="md" />
              </CDropdownToggle>
              <CDropdownMenu class="pt-0 shadow">
                <CDropdownHeader component="h6" class="bg-body-secondary fw-semibold py-2 rounded-top">Cuenta</CDropdownHeader>
                <CDropdownItem component="button">
                  <CIcon :icon="cilEnvelopeOpen" class="me-2" /> Mensajes
                  <CBadge color="success" class="ms-auto">42</CBadge>
                </CDropdownItem>
                <CDropdownItem component="button">
                  <CIcon :icon="cilList" class="me-2" /> Tareas
                  <CBadge color="danger" class="ms-auto">5</CBadge>
                </CDropdownItem>
                <CDropdownHeader component="h6" class="bg-body-secondary fw-semibold py-2">Ajustes</CDropdownHeader>
                <CDropdownItem component="button">
                  <CIcon :icon="cilUser" class="me-2" /> Perfil
                </CDropdownItem>
                <CDropdownItem component="button">
                  <CIcon :icon="cilSettings" class="me-2" /> Configuración
                </CDropdownItem>
                <CDropdownDivider />
                <CDropdownItem component="button" @click="logout" class="text-danger">
                  <CIcon :icon="cilAccountLogout" class="me-2" /> Cerrar Sesión
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </CHeaderNav>
        </CContainer>
        
        <CHeaderDivider />
        
        <CContainer fluid>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb my-0 ms-2">
              <li class="breadcrumb-item">Home</li>
              <li class="breadcrumb-item active"><span>{{ route.name || 'Dashboard' }}</span></li>
            </ol>
          </nav>
        </CContainer>
      </CHeader>

      <!-- Main Content -->
      <div :class="route.path !== '/login' ? 'body flex-grow-1 px-3' : 'flex-grow-1'">
        <CContainer :fluid="route.path !== '/login'">
          <router-view />
        </CContainer>
      </div>

      <CFooter class="px-4">
        <div>
          <a href="" target="_blank" class="text-decoration-none">CoreUI</a>
          <span class="ms-1">&copy; 2026 Dental System.</span>
        </div>
        <div class="ms-auto">
          <span class="me-1">Powered by</span>
          <a href="" target="_blank" class="text-decoration-none">CoreUI for Vue</a>
        </div>
      </CFooter>
    </div>
  </div>
</template>


<style>
/* Reset and custom styles */
body {
  margin: 0;
  font-family: var(--cui-font-sans-serif);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* CSS para forzar el Sidebar oscuro siempre */
.sidebar, 
.sidebar.border-end {
  background-color: #212631 !important;
  --cui-sidebar-bg: #212631 !important;
  border-right: 1px solid rgba(255, 255, 255, 0.2) !important;
}

/* Alineación milimétrica de la línea del logo con el divisor del header */
.sidebar-header {
  height: 64px !important;
  padding: 0 1.25rem !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Ajuste del Header para que la línea coincida */
.header {
  --cui-header-border-bottom-width: 1px !important;
  padding: 0 !important;
}

.header .container-fluid:first-child {
  height: 64px !important;
  padding: 0 1.5rem !important;
  display: flex;
  align-items: center;
}

/* El divisor que separa el menú de las migas de pan */
.header-divider {
  margin: 0 !important;
  border-color: var(--cui-border-color) !important;
  opacity: 1 !important;
}

/* Área de Home / Dashboard - Más aire */
.header .container-fluid:last-child {
  min-height: 48px !important;
  padding: 0.5rem 1.5rem !important;
  display: flex;
  align-items: center;
}

/* Forzar color de los enlaces y texto de navegación */
.sidebar .nav-link,
.sidebar .nav-link *,
.sidebar .nav-title,
.sidebar .nav-group-items .nav-link {
  color: rgba(255, 255, 255, 0.95) !important;
}

/* Estilo para el link activo */
.sidebar .nav-link.router-link-active,
.sidebar .nav-link.router-link-active * {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.15) !important;
}

/* Estilo para el hover */
.sidebar .nav-link:hover,
.sidebar .nav-link:hover * {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.08) !important;
}

/* Íconos claros */
.sidebar .nav-icon,
.sidebar .nav-icon * {
  color: rgba(255, 255, 255, 0.7) !important;
}

.sidebar .nav-link:hover .nav-icon,
.sidebar .nav-link.router-link-active .nav-icon {
  color: #ffffff !important;
}

/* Títulos de sección */
.sidebar .nav-title {
  color: rgba(255, 255, 255, 0.5) !important;
  font-weight: 700;
  text-transform: uppercase;
}

/* Líneas divisorias */
.sidebar .border-bottom,
.sidebar .border-top {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.nav-link.router-link-active {
  color: var(--cui-nav-link-active-color) !important;
  background-color: var(--cui-nav-link-active-bg) !important;
}

.sidebar-brand-full {
  display: block;
}

.sidebar-brand-narrow {
  display: none;
}

.sidebar-narrow .sidebar-brand-full {
  display: none;
}

.sidebar-narrow .sidebar-brand-narrow {
  display: block;
}

/* Fix for avatar dropdown toggle */
.dropdown-toggle::after {
  display: none !important;
}

/* Fix for header layout */
.header-nav {
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
}
</style>




