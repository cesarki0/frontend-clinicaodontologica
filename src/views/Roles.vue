<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong><CIcon :icon="cilUser" class="me-2" />Roles</strong>
          <div class="d-flex gap-2">
            <CInputGroup size="sm">
              <CInputGroupText><CIcon :icon="cilSearch" /></CInputGroupText>
              <CFormInput v-model="busqueda" placeholder="Buscar..." />
            </CInputGroup>
            <CButton color="primary" size="sm" @click.prevent="newRol">
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
              
                <CTableHeaderCell class="text-center">Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="rol in rolesFiltrados" :key="rol.id">
                 <CTableDataCell>{{ rol.id }}</CTableDataCell>
                <CTableDataCell>{{ rol.nombre }}</CTableDataCell>
        
                <CTableDataCell class="text-center">
                  <CButtonGroup>
                    <CButton color="info" size="sm" @click="verRol(rol)" title="Ver Detalle">
                      <CIcon :icon="cilFile" />
                    </CButton>
                    <CButton color="warning" size="sm" @click="editarRol(rol)" title="Editar">
                      <CIcon :icon="cilPencil" />
                    </CButton>
                    <CButton color="danger" size="sm" @click="eliminarRol(rol.id)" title="Eliminar">
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
    <CModal :visible="modalNuevo" @close="modalNuevo=false" size="lg">
      <CModalHeader>
        <CModalTitle>{{ nuevo.id ? 'Actualizar' : 'Registrar' }} Rol</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm class="row g-3" @submit.prevent="guardarRol">
        
            <CFormInput v-model="nuevo.nombre" label="Nombre" placeholder="Ingrese nombre..." required />
          
    
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
        <CModalTitle>Detalle de la Rol</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CRow v-if="rolSeleccionado">
          
            <p class="mb-1 text-muted small uppercase">Nombre</p>
            <p class="h5 mb-3">{{ rolSeleccionado.nombre }}</p>
    
        
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
      roles: [],
      busqueda: '',
      modalNuevo: false,
      modalVer: false,
      rolSeleccionado: {},
      nuevo: {
        id: null,
        nombre: '',
      }
    }
  },
  computed: {
    rolesFiltrados() {
      return this.roles.filter(p =>
        p.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
       //(p.nombre || '').toLowerCase().includes((this.busqueda || '').toLowerCase())
      )
    }
  },
  mounted() {
    this.cargarRoles()
  },
  methods: {
    resetNuevo() {
      this.nuevo = {
        id: null,
        nombre: '',
      }
    },
    newRol() {
      this.resetNuevo()
      this.modalNuevo = true
    },

    verRol(rol) {
      this.rolSeleccionado = { ...rol } //clonamos los datos de esa rol
      this.modalVer = true
    },
    editarRol(rol) {
      this.nuevo = {...rol}
      this.modalNuevo = true
    },
    cargarRoles() {
      axios.get('/roles')
        .then(res => { this.roles = res.data })
        .catch(err => console.error("Error cargando roles:", err))
    },
    guardarRol() {
      const url = this.nuevo.id ? `/roles/${this.nuevo.id}` : `/roles`
      const method = this.nuevo.id ? 'put' : 'post'

      axios[method](url, this.nuevo)
        .then(() => {
          this.cargarRoles()
          this.modalNuevo = false
          Swal.fire({
            title: '¡Éxito!',
            text: `El rol fue ${this.nuevo.id ? 'actualizado' : 'registrado'} correctamente.`,
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
            text: 'No se pudo guardar el rol.',
            icon: 'error'
          })
        })
    },
    eliminarRol(id) {
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
          axios.delete(`/roles/${id}`)
            .then(() => {
              this.cargarRols()
              Swal.fire('Eliminado', 'La Rol fue eliminada.', 'success')
            })
            .catch(() => {
              Swal.fire('Error', 'No se pudo eliminar la Rol.', 'error')
            })
        }
      })
    },

  }
}
</script>

