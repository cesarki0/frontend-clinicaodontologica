<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong><CIcon :icon="cilUser" class="me-2" />Clinicas</strong>
          <div class="d-flex gap-2">
            <CInputGroup size="sm">
              <CInputGroupText><CIcon :icon="cilSearch" /></CInputGroupText>
              <CFormInput v-model="busqueda" placeholder="Buscar..." />
            </CInputGroup>
            <CButton color="primary" size="sm" @click.prevent="newClinica">
              <CIcon :icon="cilPlus" class="me-1" /> Nuevo
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody>
          <CTable align="middle" responsive hover borderless>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Numero</CTableHeaderCell>
                <CTableHeaderCell>Clinica</CTableHeaderCell>
                <CTableHeaderCell>Plan</CTableHeaderCell>
                <CTableHeaderCell class="text-center">Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="clinica in clinicasFiltradas" :key="clinica.id">
                 <CTableDataCell>{{ clinica.id }}</CTableDataCell>
                <CTableDataCell>{{ clinica.nombre }}</CTableDataCell>
                <CTableDataCell>{{ clinica.plan }}</CTableDataCell>
                <CTableDataCell class="text-center">
                  <CButtonGroup>
                    <CButton color="info" size="sm" @click="verClinica(clinica)" title="Ver Detalle">
                      <CIcon :icon="cilFile" />
                    </CButton>
                    <CButton color="warning" size="sm" @click="editarClinica(clinica)" title="Editar">
                      <CIcon :icon="cilPencil" />
                    </CButton>
                    <CButton color="danger" size="sm" @click="eliminarClinica(clinica.id)" title="Eliminar">
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
        <CModalTitle>{{ nuevo.id ? 'Actualizar' : 'Registrar' }} Clinica</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm class="row g-3" @submit.prevent="guardarClinica">
        
            <CFormInput v-model="nuevo.nombre" label="Nombre Clinica/Cliente" placeholder="Ingrese nombre..." required />
            <CFormInput v-model="nuevo.plan" label="Plan" class="mt-2" />
    
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
        <CModalTitle>Detalle de la Clinica</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CRow v-if="clinicaSeleccionada">
          
            <p class="mb-1 text-muted small uppercase">Nombre</p>
            <p class="h5 mb-3">{{ clinicaSeleccionada.nombre }}</p>
            <p class="mb-1 text-muted small uppercase">Plan</p>
            <p class="h5 mb-3">{{ clinicaSeleccionada.plan }}</p>
        
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
      clientes: [],
      busqueda: '',
      modalNuevo: false,
      modalVer: false,
      clinicaSeleccionada: {},
      nuevo: {
        id: null,
        nombre: '',
        plan: '',
         correo: '',

      }
    }
  },
  computed: {
    clinicasFiltradas() {
      return this.clientes.filter(p =>
        p.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
      )
    }
  },
  mounted() {
    this.cargarClinicas()
  },
  methods: {
    resetNuevo() {
      this.nuevo = {
        id: null,
        nombre: '',
        plan: '',
        correo: '',
      }
    },
    newClinica() {
      this.resetNuevo()
      this.modalNuevo = true
    },

    verClinica(clinica) {
      this.clinicaSeleccionada = { ...clinica } //clonamos los datos de esa clinica
      this.modalVer = true
    },
    editarClinica(clinica) {
      this.nuevo = {...clinica}
      this.modalNuevo = true
    },
    cargarClinicas() {
      axios.get('/clientes')
        .then(res => { this.clientes = res.data })
        .catch(err => console.error("Error cargando clientes:", err))
    },
    guardarClinica() {
      const url = this.nuevo.id ? `/clientes/${this.nuevo.id}` : `/clientes`
      const method = this.nuevo.id ? 'put' : 'post'

      axios[method](url, this.nuevo)
        .then(() => {
          this.cargarClinicas()
          this.modalNuevo = false
          Swal.fire({
            title: '¡Éxito!',
            text: `El paciente fue ${this.nuevo.id ? 'actualizado' : 'registrado'} correctamente.`,
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
            text: 'No se pudo guardar el paciente.',
            icon: 'error'
          })
        })
    },
    eliminarClinica(id) {
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
              this.cargarClinicas()
              Swal.fire('Eliminado', 'La Clinica fue eliminada.', 'success')
            })
            .catch(() => {
              Swal.fire('Error', 'No se pudo eliminar la Clinica.', 'error')
            })
        }
      })
    },

  }
}
</script>

