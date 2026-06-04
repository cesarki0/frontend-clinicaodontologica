<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong><CIcon :icon="cilMedicalCross" class="me-2" />Tratamientos Realizados</strong>
          <CButton color="primary" size="sm" @click="nuevoTratamiento">
            <CIcon :icon="cilPlus" class="me-1" /> Registrar Tratamiento
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CTable align="middle" responsive hover borderless>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Paciente</CTableHeaderCell>
                <CTableHeaderCell>Descripción</CTableHeaderCell>
                <CTableHeaderCell>Pieza</CTableHeaderCell>
                <CTableHeaderCell>Costo</CTableHeaderCell>
                <CTableHeaderCell>Pagado</CTableHeaderCell>
                <CTableHeaderCell class="text-center">Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="t in tratamientos" :key="t.id">
                <CTableDataCell>{{ t.paciente ? t.paciente.nombre : 'N/A' }}</CTableDataCell>
                <CTableDataCell>{{ t.descripcion }}</CTableDataCell>
                <CTableDataCell>
                  <CBadge color="secondary" shape="pill">{{ t.pieza || '-' }}</CBadge>
                </CTableDataCell>
                <CTableDataCell class="fw-semibold text-primary">Bs.{{ t.costo }}</CTableDataCell>
                <CTableDataCell>
                    <CBadge :color="colorPago(t)" shape="pill">
                        Bs.{{ totalPagado(t) }}
                    </CBadge>
                </CTableDataCell>
                <CTableDataCell class="text-center">
                  <CButtonGroup>
                    <CButton color="info" size="sm" @click="editarTratamiento(t)" title="Editar">
                      <CIcon :icon="cilPencil" />
                    </CButton>
                    <CButton color="danger" size="sm" @click="eliminarTratamiento(t.id)" title="Eliminar">
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

    <!-- Modal Nuevo/Editar Tratamiento -->
    <CModal :visible="modalTratamiento" @close="modalTratamiento = false">
      <CModalHeader>
        <CModalTitle>{{ formTratamiento.id ? 'Editar' : 'Registrar' }} Tratamiento</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm @submit.prevent="guardarTratamiento" class="row g-3">
          <CCol :md="12">
            <CFormLabel>Paciente</CFormLabel>
            <CFormSelect v-model="formTratamiento.paciente_id" required>
              <option value="">Seleccione un paciente...</option>
              <option v-for="p in pacientes" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </CFormSelect>
          </CCol>
          <CCol :md="12">
            <CFormInput v-model="formTratamiento.descripcion" label="Descripción del tratamiento" placeholder="Ej: Curación con resina" required />
          </CCol>
          <CCol :md="6">
            <CFormInput v-model="formTratamiento.pieza" label="Pieza Dental (Nro)" placeholder="Opcional" />
          </CCol>
          <CCol :md="6">
            <CFormInput type="number" step="0.01" v-model="formTratamiento.costo" label="Costo Total (Bs.)" required />
          </CCol>
          <div class="mt-4 text-end">
            <CButton color="secondary" class="me-2" @click="modalTratamiento = false">Cancelar</CButton>
            <CButton color="primary" type="submit">Guardar Cambios</CButton>
          </div>
        </CForm>
      </CModalBody>
    </CModal>
  </CRow>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import { cilMedicalCross, cilPlus, cilPencil, cilTrash } from '@coreui/icons'

export default {
  setup() {
    return {
      cilMedicalCross, cilPlus, cilPencil, cilTrash
    }
  },
  data() {
    return {
      tratamientos: [],
      pacientes: [],
      modalTratamiento: false,
      formTratamiento: {
        id: null,
        paciente_id: '',
        descripcion: '',
        pieza: '',
        costo: 0
      }
    }
  },
  mounted() {
    this.cargarTratamientos()
    this.cargarPacientes()
  },
  methods: {
    cargarTratamientos() {
      axios.get('/tratamientos')
        .then(res => { this.tratamientos = res.data })
    },
    cargarPacientes() {
      axios.get('/pacientes')
        .then(res => { this.pacientes = res.data })
    },
    nuevoTratamiento() {
      this.formTratamiento = { id: null, paciente_id: '', descripcion: '', pieza: '', costo: 0 }
      this.modalTratamiento = true
    },
    editarTratamiento(t) {
      this.formTratamiento = { ...t }
      this.modalTratamiento = true
    },
    guardarTratamiento() {
      const url = this.formTratamiento.id 
        ? `/tratamientos/${this.formTratamiento.id}`
        : '/tratamientos'
      const method = this.formTratamiento.id ? 'put' : 'post'

      axios[method](url, this.formTratamiento)
        .then(() => {
          this.cargarTratamientos()
          this.modalTratamiento = false
          Swal.fire({
            title: '¡Éxito!',
            text: 'Tratamiento guardado correctamente',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          })
        })
    },
    eliminarTratamiento(id) {
        Swal.fire({
            title: '¿Eliminar tratamiento?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(result => {
            if (result.isConfirmed) {
                axios.delete(`/tratamientos/${id}`).then(() => {
                    this.cargarTratamientos()
                    Swal.fire('Eliminado', 'El tratamiento ha sido eliminado', 'success')
                })
            }
        })
    },
    totalPagado(t) {
        if (!t.pagos) return 0
        return t.pagos.reduce((acc, p) => acc + parseFloat(p.adelanto), 0)
    },
    colorPago(t) {
        const pagado = this.totalPagado(t)
        if (pagado >= t.costo) return 'success'
        if (pagado > 0) return 'warning'
        return 'danger'
    }
  }
}
</script>

