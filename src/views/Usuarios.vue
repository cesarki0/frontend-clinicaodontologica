<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong><CIcon :icon="cilUser" class="me-2" />Usuarios</strong>
          <div class="d-flex gap-2">
            <CInputGroup size="sm">
              <CInputGroupText><CIcon :icon="cilSearch" /></CInputGroupText>
              <CFormInput v-model="busqueda" placeholder="Buscar..." />
            </CInputGroup>
            <CButton color="primary" size="sm" @click.prevent="newUsuario">
              <CIcon :icon="cilPlus" class="me-1" /> Nuevo
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody>
          <CTable align="middle" responsive hover borderless>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Id</CTableHeaderCell>
                <CTableHeaderCell>Nombre</CTableHeaderCell>
                <CTableHeaderCell>Correo</CTableHeaderCell>
                <CTableHeaderCell>Clinica</CTableHeaderCell>
                <CTableHeaderCell class="text-center">Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="usuario in usuariosFiltradas" :key="usuario.id">
                 <CTableDataCell>{{ usuario.id }}</CTableDataCell>
                <CTableDataCell>{{ usuario.name }}</CTableDataCell>
                <CTableDataCell>{{ usuario.email }}</CTableDataCell>
                   <CTableDataCell>{{ usuario.clinic.nombre }}</CTableDataCell>
                <CTableDataCell class="text-center">
                  <CButtonGroup>
                    <CButton color="info" size="sm" @click="verUsuario(usuario)" title="Ver Detalle">
                      <CIcon :icon="cilFile" />
                    </CButton>
                    <CButton color="warning" size="sm" @click="editarUsuario(usuario)" title="Editar">
                      <CIcon :icon="cilPencil" />
                    </CButton>
                    <CButton color="danger" size="sm" @click="eliminarUsuario(usuario.id)" title="Eliminar">
                      <CIcon :icon="cilTrash" />
                    </CButton>
                  </CButtonGroup>
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Modal Nuevo/Editar -->
    <CModal :visible="modalNuevo" @close="modalNuevo=false" size="sm">
      <CModalHeader>
        <CModalTitle>{{ nuevo.id ? 'Actualizar' : 'Registrar' }} Usuario</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm class="row g-3" @submit.prevent="guardarUsuario">
        
            <CFormInput 
            v-model="nuevo.name" 
            label="Nombre" 
            placeholder="Ingrese nombre..." 
            required 
            />
            <CFormInput 
              v-model="nuevo.email" 
              type="email" 
              label="Correo" 
              placeholder="Ingrese correo..." 
              required 
            />
            <CFormInput 
            v-if="!nuevo.id" 
            v-model="nuevo.password" 
            type="password" 
            label="Contraseña" 
            placeholder="Ingrese contraseña..." 
            required 
          />
          <CFormSelect 
            v-model="nuevo.clinic_id" 
            :options="clinicas" 
            label="Clínica" 
            placeholder="Seleccione clínica..." 
            required 
          />

          <CFormSelect 
            v-model="nuevo.roles" 
            :options="roles" 
            label="Roles" 
            required
            :multiple="true"
          />

          
    
          <div class="mt-4 text-end">
            <CButton color="secondary" class="me-2" @click="modalNuevo=false">Cancelar</CButton>
            <CButton color="primary" type="submit">Guardar Cambios</CButton>
          </div>
        </CForm>
      </CModalBody>
    </CModal>

    <!-- Modal Ver -->
    <CModal :visible="modalVer" @close="modalVer=false" size="lg">
      <CModalHeader>
        <CModalTitle>Detalle del Usuario</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CRow v-if="usuarioSeleccionada">
          
            <p class="mb-1 text-muted small uppercase">Nombre</p>
            <p class="h5 mb-3">{{ usuarioSeleccionada.name }}</p>
            <p class="mb-1 text-muted small uppercase">Plan</p>
            <p class="h5 mb-3">{{ usuarioSeleccionada.email }}</p>
             <p class="mb-1 text-muted small uppercase">Clinica</p>
            <p class="h5 mb-3">{{ usuarioSeleccionada.clinic.nombre }}</p>
        
        </CRow>
      </CModalBody>
    </CModal>
  </CRow>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import { cilUser, cilSearch, cilPlus, cilFile, cilPencil, cilCalendar, cilTrash } from '@coreui/icons'

export default {
  setup() {
    return {
      cilUser, cilSearch, cilPlus, cilFile, cilPencil, cilCalendar, cilTrash
    }
  },
  data() {
    return {
      usuarios: [],
       roles: [], // 👈 lista de roles disponibles
      busqueda: '',
      modalNuevo: false,
      modalVer: false,
      usuarioSeleccionada: {},
      nuevo: {
        id: null,
        name: '',
        email: '',
        password: '',
        clinic_id: null,
         roles: [] // 👈 array de roles seleccionados
      },
      clinicas: [],
    }
  },
  computed: {
    usuariosFiltradas() {
      return this.usuarios.filter(p =>
        p.name.toLowerCase().includes(this.busqueda.toLowerCase())
      )
    }
  },
  mounted() {
    this.cargarUsuarios();
     this.cargarClinicas();
     this.cargarRoles();
  },
  methods: {
    
    cargarRoles() {
      axios.get('/roles')
        .then(res => {
          this.roles = res.data.map(r => ({
            value: String(r.id), // 👈 convertir a string
            label: r.nombre
          }))
        })
    },

    cargarClinicas(){
      axios.get('/clientes')
      .then(res => {
        // CoreUI espera un array de objetos { value, label }
        this.clinicas = res.data.map(c => ({
          value: c.id,
          label: c.nombre
        }))
      })
    },

    resetNuevo() {
      this.nuevo = {
        id: null,
        name: '',
        email: '',
        password: '',
        clinic_id: null,
        roles: [] // 👈 array de roles seleccionados
        
      }
      
    },
    newUsuario() {
      this.resetNuevo()
      this.modalNuevo = true
    },

    verUsuario(usuario) {
      this.usuarioSeleccionada = { ...usuario } //clonamos los datos de esa usuario
      this.modalVer = true
    },
    editarUsuario(usuario) {
      this.nuevo = {
        ...usuario,
        clinic_id: String(usuario.clinic_id), // 👈 forzar a string para editar clinicas
        roles: usuario.roles ? usuario.roles.map(r => String(r.id)) : [] // 👈 convertir a strings
      }
      this.modalNuevo = true
    },
    cargarUsuarios() {
      axios.get('/users')
        .then(res => { this.usuarios = res.data })
        .catch(err => console.error("Error cargando usuarios:", err))
    },
    guardarUsuario() {
      const url = this.nuevo.id ? `/users/${this.nuevo.id}` : `/users`
      const method = this.nuevo.id ? 'put' : 'post'
  
      axios[method](url, {
            ...this.nuevo, // 👈 copia todos los campos de nuevo
            roles: this.nuevo.roles.map(r => parseInt(r)) // 👈 sobrescribe roles
          })
        .then(() => {
         
          this.cargarUsuarios()
          this.modalNuevo = false
          Swal.fire({
            title: '¡Éxito!',
            text: `El usuario fue ${this.nuevo.id ? 'actualizado' : 'registrado'} correctamente.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })
          this.resetNuevo()
        })
        .catch((error) => {
          console.error(error)
          Swal.fire({
            title: 'Error',
            text: 'No se pudo guardar el usuario.',
            icon: 'error'
          })
        })
    },
    eliminarUsuario(id) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          axios.delete(`/clientes/${id}`)
            .then(() => {
              this.cargarUsuarios()
              Swal.fire('Eliminado', 'La Usuario fue eliminada.', 'success')
            })
            .catch(() => {
              Swal.fire('Error', 'No se pudo eliminar la Usuario.', 'error')
            })
        }
      })
    },

  }
}
</script>

